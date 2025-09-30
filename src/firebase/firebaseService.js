// src/firebase/firebaseService.js - Updated with Batch Operations

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  getDocs,
  limit,
  writeBatch // Add batch import
} from 'firebase/firestore';
import { 
  ref, 
  uploadBytes, 
  getDownloadURL 
} from 'firebase/storage';
import { db, storage } from './config';

// Shop Operations
export const getFeaturedItems = async (limitCount = 6) => {
  try {
    const shopsRef = collection(db, 'shops');
    const querySnapshot = await getDocs(shopsRef);
    
    let allItems = [];
    querySnapshot.docs.forEach(doc => {
      const shopData = doc.data();
      if (shopData?.items && Array.isArray(shopData.items)) {
        const shopItems = shopData.items
          .filter(item => !item.deleted)
          .map(item => ({
            ...item,
            shopId: doc.id,
            shopName: shopData.name || 'Unknown Shop',
            shopTheme: shopData.theme || {},
            quantity: item.quantity || 1
          }));
        allItems = [...allItems, ...shopItems];
      }
    });

    // Sort by most recent first
    allItems.sort((a, b) => {
      const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
      const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
      return dateB - dateA;
    });

    // Return only the requested number of items
    return allItems.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching featured items:', error);
    throw error;
  }
};

export const checkExistingShop = async (userId) => {
  try {
    const shopRef = doc(db, 'shops', userId);
    const shopDoc = await getDoc(shopRef);
    return shopDoc.exists();
  } catch (error) {
    console.error('Error checking existing shop:', error);
    throw error;
  }
};

// Add this utility function to clean data before saving to Firestore
const cleanDataForFirestore = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => cleanDataForFirestore(item));
  }
  
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleanedData = {};
    for (const [key, value] of Object.entries(data)) {
      // Skip file objects and null/undefined values
      if (value instanceof File || value === null || value === undefined) {
        continue;
      }
      cleanedData[key] = cleanDataForFirestore(value);
    }
    return cleanedData;
  }
  
  return data;
};

// Add to firebaseService.js
export const saveInitialShop = async (userId, data) => {
  try {
    const batch = writeBatch(db);
    
    // 1. Create main shop document
    const shopRef = doc(db, 'shops', userId);
    const shopDoc = {
      ownerId: userId,
      name: data.name || '',
      description: data.description || '',
      mission: data.mission || '',
      theme: cleanDataForFirestore(data.theme) || {},
      layout: cleanDataForFirestore(data.layout) || {},
      status: 'active',
      profile: null, // Will update after upload
      searchTerms: generateSearchTerms({ shopName: data.name }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      stats: {
        items: 0,
        views: 0,
        likes: 0
      }
    };

    batch.set(shopRef, shopDoc);

    // 2. Process items
    const items = [];
    const locations = [];

    if (Array.isArray(data.items)) {
      for (const item of data.items) {
        const itemId = `${userId}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const itemRef = doc(db, 'items', itemId);

        // Process images
        const imageUrls = await Promise.all(item.images.map(async (image, index) => {
          if (!image?.file) return null;
          return await uploadImageWithCORS(
            image.file,
            `shops/${userId}/items/${itemId}/image-${index}-${Date.now()}`
          );
        }));

        const itemDoc = {
          id: itemId,
          shopId: userId,
          name: item.name || '',
          price: item.price || '',
          description: item.description || '',
          images: imageUrls.filter(Boolean),
          status: 'active',
          address: item.address || '',
          coordinates: item.coordinates || null,
          quantity: item.quantity || 1,
          views: 0,
          likes: 0,
          deleted: false,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        batch.set(itemRef, itemDoc);
        items.push(itemDoc);

        // If item has location, create location document
        if (item.coordinates) {
          const locationRef = doc(db, 'locations', itemId);
          const locationDoc = {
            itemId,
            shopId: userId,
            address: item.address,
            coordinates: item.coordinates,
            createdAt: new Date().toISOString()
          };
          batch.set(locationRef, locationDoc);
          locations.push(locationDoc);
        }
      }
    }

    // 3. Upload and set profile image if exists
    if (data.profile?.file) {
      const profileUrl = await uploadImageWithCORS(
        data.profile.file,
        `shops/${userId}/profile/profile-${Date.now()}`
      );
      if (profileUrl) {
        shopDoc.profile = profileUrl;
      }
    }

    // 4. Update stats
    const statsRef = doc(db, 'stats', userId);
    batch.set(statsRef, {
      shopId: userId,
      views: 0,
      likes: 0,
      items: items.length,
      lastUpdated: new Date().toISOString()
    });

    // 5. Commit everything
    await batch.commit();

    return {
      ...shopDoc,
      items,
      locations
    };

  } catch (error) {
    console.error('Error saving initial shop:', error);
    throw error;
  }
};

// Add this helper function at the top
const uploadImageWithCORS = async (file, path) => {
  if (!file) return null;
  
  const metadata = {
    contentType: file.type || 'image/jpeg',
    cacheControl: 'public,max-age=3600',
    customMetadata: {
      'Access-Control-Allow-Origin': '*'
    }
  };

  try {
    // Create a blob with CORS headers
    const blob = new Blob([file], { type: file.type });
    const imageRef = ref(storage, path);
    const snapshot = await uploadBytes(imageRef, blob, metadata);
    return await getDownloadURL(snapshot.ref);
  } catch (error) {
    console.error('Error uploading image:', error);
    return null;
  }
};

// Updated saveShopData function with coordinates fix
export const saveShopData = async (userId, data) => {
  try {
    const hasShop = await checkExistingShop(userId);
    if (hasShop) {
      throw new Error('User already has a shop');
    }  
    
    console.log('Starting shop data save:', { userId, data });

    // Clean data before saving to Firestore
    let shopData = {
      name: data.name || '',
      description: data.description || '',
      mission: data.mission || '',
      theme: cleanDataForFirestore(data.theme) || {},
      layout: cleanDataForFirestore(data.layout) || {},
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: userId,
      items: data.items?.map(item => ({
        id: item.id || Date.now().toString(),
        name: item.name || '',
        price: item.price || '',
        description: item.description || '',
        category: item.category || 'Other',
        quantity: item.quantity || 1,
        currentImageIndex: item.currentImageIndex || 0,
        address: item.address || '', // FIXED: Added address
        coordinates: item.coordinates || null, // FIXED: Added coordinates
        tags: item.tags || [],
        images: [] // Initialize empty, will be updated after upload
      })) || [],
      profile: null // Initialize as null, will be updated after upload
    };

    console.log('Items with coordinates before save:', 
      shopData.items.filter(i => i.coordinates).map(i => ({
        id: i.id,
        name: i.name,
        address: i.address,
        coordinates: i.coordinates
      }))
    );

    // Save initial clean data
    const shopRef = doc(db, 'shops', userId);
    await setDoc(shopRef, shopData);

    // Now try image uploads with new CORS configuration
    if (data.profile?.file) {
      try {
        const profileUrl = await uploadImageWithCORS(
          data.profile.file,
          `shops/${userId}/profile/profile-${Date.now()}`
        );

        if (profileUrl) {
          shopData.profile = profileUrl;
          await updateDoc(shopRef, {
            profile: profileUrl,
            updatedAt: new Date().toISOString()
          });
        }
      } catch (profileError) {
        console.error('Profile upload failed:', profileError);
      }
    }

    // Try uploading item images
    if (Array.isArray(data.items)) {
      const processedItems = await Promise.all(data.items.map(async (item) => {
        const processedItem = {
          id: item.id || Date.now().toString(),
          name: item.name || '',
          price: item.price || '',
          description: item.description || '',
          category: item.category || 'Other',
          currentImageIndex: item.currentImageIndex || 0,
          quantity: item.quantity || 1,
          address: item.address || '', // FIXED: Preserve address
          coordinates: item.coordinates || null, // FIXED: Preserve coordinates
          tags: item.tags || [],
          images: []
        };
      
        if (Array.isArray(item.images)) {
          const imageUrls = await Promise.all(item.images.map(async (image, index) => {
            if (!image?.file) return null;

            return await uploadImageWithCORS(
              image.file,
              `shops/${userId}/items/${processedItem.id}/image-${index}-${Date.now()}`
            );
          }));

          processedItem.images = imageUrls.filter(Boolean);
        }
      
        return processedItem;
      }));
      
      shopData.items = processedItems;
    
      console.log('Final items with coordinates:', 
        processedItems.filter(i => i.coordinates).map(i => ({
          id: i.id,
          name: i.name,
          address: i.address,
          coordinates: i.coordinates
        }))
      );

      // Update items in Firestore
      await updateDoc(shopRef, {
        items: processedItems,
        updatedAt: new Date().toISOString()
      });
    }

    console.log('Shop data saved successfully with coordinates');
    return shopData;

  } catch (error) {
    console.error('Error in saveShopData:', error);
    throw error;
  }
};

// New batch update function for existing shops
export const batchUpdateShopData = async (userId, updateData) => {
  try {
    console.log('Starting batch update for shop:', userId);
    
    const batch = writeBatch(db);
    const shopRef = doc(db, 'shops', userId);
    
    // Clean the update data
    const cleanedData = cleanDataForFirestore({
      ...updateData,
      updatedAt: new Date().toISOString()
    });
    
    // Update the main shop document
    batch.update(shopRef, cleanedData);
    
    // If updating items, we might need to update individual item documents
    // This depends on your data structure - if items are stored as subcollections
    if (updateData.items && Array.isArray(updateData.items)) {
      // Update stats
      const statsRef = doc(db, 'stats', userId);
      batch.update(statsRef, {
        items: updateData.items.filter(item => !item.deleted).length,
        lastUpdated: new Date().toISOString()
      });
    }
    
    // Commit all updates in a single batch
    await batch.commit();
    
    console.log('Batch update completed successfully');
    return true;
    
  } catch (error) {
    console.error('Error in batch update:', error);
    throw error;
  }
};

// Add new function for image uploads
export const uploadShopImages = async (userId, data) => {
  try {
    const shopRef = doc(db, 'shops', userId);
    let updates = {};

    // Handle profile image
    if (data.profile?.file instanceof File) {
      try {
        const metadata = {
          contentType: data.profile.type || 'image/jpeg'
        };
        const profileRef = ref(storage, `shops/${userId}/profile/profile-${Date.now()}`);
        const profileSnapshot = await uploadBytes(profileRef, data.profile.file, metadata);
        updates.profile = await getDownloadURL(profileSnapshot.ref);
      } catch (error) {
        console.error('Profile upload failed:', error);
      }
    }

    // Handle item images
    if (Array.isArray(data.items)) {
      updates.items = await Promise.all(data.items.map(async (item) => {
        const processedItem = {
          id: item.id,
          name: item.name || '',
          price: item.price || '',
          description: item.description || '',
          currentImageIndex: item.currentImageIndex || 0,
          images: []
        };

        if (Array.isArray(item.images)) {
          const imageUrls = await Promise.all(item.images.map(async (image, index) => {
            if (!(image?.file instanceof File)) return null;
            
            try {
              const metadata = {
                contentType: image.type || 'image/jpeg'
              };
              const imageRef = ref(storage, `shops/${userId}/items/${item.id}/image-${index}-${Date.now()}`);
              const snapshot = await uploadBytes(imageRef, image.file, metadata);
              return await getDownloadURL(snapshot.ref);
            } catch (error) {
              console.error(`Failed to upload image ${index}:`, error);
              return null;
            }
          }));
          
          processedItem.images = imageUrls.filter(Boolean);
        }

        return processedItem;
      }));
    }

    // Clean updates before saving to Firestore
    const cleanUpdates = cleanDataForFirestore({
      ...updates,
      updatedAt: new Date().toISOString()
    });

    // Update Firestore with clean data
    if (Object.keys(cleanUpdates).length > 0) {
      await updateDoc(shopRef, cleanUpdates);
    }

    return true;
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
};

export const getShopData = async (userId) => {
  try {
    const shopRef = doc(db, 'shops', userId);
    const shopSnap = await getDoc(shopRef);
    
    if (shopSnap.exists()) {
      return shopSnap.data();
    }
    
    return null;
  } catch (error) {
    console.error('Error getting shop data:', error);
    throw error;
  }
};

// Updated updateShopData to use batch operations
export const updateShopData = async (userId, updateData) => {
  try {
    // Use the new batch update function
    return await batchUpdateShopData(userId, updateData);
  } catch (error) {
    console.error('Error updating shop data:', error);
    throw error;
  }
};

// Optimized single field update (for real-time updates like view counts)
export const updateSingleField = async (userId, field, value) => {
  try {
    const shopRef = doc(db, 'shops', userId);
    await updateDoc(shopRef, {
      [field]: value,
      updatedAt: new Date().toISOString()
    });
    return true;
  } catch (error) {
    console.error(`Error updating field ${field}:`, error);
    throw error;
  }
};

// Bulk operations for multiple shops (admin use)
export const bulkUpdateShops = async (updates) => {
  try {
    const batch = writeBatch(db);
    
    updates.forEach(({ userId, data }) => {
      const shopRef = doc(db, 'shops', userId);
      const cleanedData = cleanDataForFirestore({
        ...data,
        updatedAt: new Date().toISOString()
      });
      batch.update(shopRef, cleanedData);
    });
    
    await batch.commit();
    console.log(`Bulk update completed for ${updates.length} shops`);
    return true;
  } catch (error) {
    console.error('Error in bulk update:', error);
    throw error;
  }
};

// Search Operations
export const searchShops = async (searchTerm) => {
  try {
    const shopsRef = collection(db, 'shops');
    const q = query(
      shopsRef,
      where('status', '==', 'active'),
      where('searchTerms', 'array-contains', searchTerm.toLowerCase())
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Error searching shops:', error);
    throw error;
  }
};

// Helper function to create search terms for better search functionality
export const generateSearchTerms = (shopData) => {
  const terms = new Set();
  
  // Add shop name terms
  if (shopData.shopName) {
    const words = shopData.shopName.toLowerCase().split(' ');
    words.forEach(word => terms.add(word));
  }

  // Add item names and tags
  if (shopData.items) {
    shopData.items.forEach(item => {
      if (item.name) {
        const words = item.name.toLowerCase().split(' ');
        words.forEach(word => terms.add(word));
      }
      if (item.tags) {
        item.tags.forEach(tag => terms.add(tag.toLowerCase()));
      }
    });
  }

  return Array.from(terms);
};

// Analytics and performance tracking
export const trackShopAnalytics = async (userId, action, metadata = {}) => {
  try {
    const analyticsRef = doc(db, 'analytics', `${userId}_${Date.now()}`);
    await setDoc(analyticsRef, {
      shopId: userId,
      action,
      metadata,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error tracking analytics:', error);
    // Don't throw - analytics shouldn't break the main flow
  }
};

// Cleanup functions for removing old data
export const cleanupOldImages = async (userId) => {
  try {
    // This would implement logic to remove unused images from storage
    // Implementation depends on your storage organization
    console.log(`Cleanup initiated for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error during cleanup:', error);
    throw error;
  }
};

// Export all functions
export default {
  getFeaturedItems,
  checkExistingShop,
  saveInitialShop,
  saveShopData,
  batchUpdateShopData,
  uploadShopImages,
  getShopData,
  updateShopData,
  updateSingleField,
  bulkUpdateShops,
  searchShops,
  generateSearchTerms,
  trackShopAnalytics,
  cleanupOldImages
};