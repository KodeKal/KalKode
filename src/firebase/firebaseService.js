// src/firebase/firebaseService.js - Updated with Batch Operations

import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  query,
  where,
  items,
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

// src/firebase/firebaseService.js

// ============= NEW USERNAME FUNCTIONS =============

/**
 * Generate a unique username from shop name
 * @param {string} shopName 
 * @returns {Promise<string>}
 */
export const generateUsername = async (shopName) => {
  // Create base username from shop name
  let baseUsername = shopName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '') // Remove special characters
    .substring(0, 20); // Limit length
  
  if (!baseUsername) {
    baseUsername = 'shop';
  }
  
  // Check if username exists
  let username = baseUsername;
  let counter = 1;
  
  while (await usernameExists(username)) {
    username = `${baseUsername}${counter}`;
    counter++;
  }
  
  return username;
};

/**
 * Check if username already exists
 * @param {string} username 
 * @returns {Promise<boolean>}
 */
export const usernameExists = async (username) => {
  try {
    const shopsRef = collection(db, 'shops');
    const q = query(shopsRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    return !querySnapshot.empty;
  } catch (error) {
    console.error('Error checking username:', error);
    return false;
  }
};

/**
 * Get shop data by username
 * @param {string} username 
 * @returns {Promise<Object>}
 */
export const getShopByUsername = async (username) => {
  try {
    const shopsRef = collection(db, 'shops');
    const q = query(shopsRef, where('username', '==', username));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const shopDoc = querySnapshot.docs[0];
    return {
      id: shopDoc.id,
      ...shopDoc.data()
    };
  } catch (error) {
    console.error('Error getting shop by username:', error);
    throw error;
  }
};

// ============= UPDATE EXISTING FUNCTIONS =============

// UPDATE: saveShopData function to include username
export const saveShopData = async (userId, data) => {
  try {
    const hasShop = await checkExistingShop(userId);
    if (hasShop) {
      throw new Error('User already has a shop');
    }  
    
    console.log('Starting shop data save:', { userId, data });

    // Generate username if not provided
    let username = data.username;
    if (!username && data.name) {
      username = await generateUsername(data.name);
    }

    // Clean data before saving to Firestore
    let shopData = {
      name: data.name || '',
      description: data.description || '',
      mission: data.mission || '',
      username: username, // ADD USERNAME
      theme: cleanDataForFirestore(data.theme) || {},
      layout: cleanDataForFirestore(data.layout) || {},
homeWidgets: cleanDataForFirestore(data.homeWidgets) || [],
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
        address: item.address || '',
        coordinates: item.coordinates || null,
        tags: item.tags || [],
        images: []
      })) || [],
      profile: null
    };

    console.log('Shop data with username:', {
      userId,
      username: shopData.username,
      name: shopData.name
    });

    // Save initial clean data
    const shopRef = doc(db, 'shops', userId);
    await setDoc(shopRef, shopData);

    // Profile image upload
    if (data.profile) {
      try {
        let profileUrl;

        // Handle different profile formats
        if (typeof data.profile === 'string') {
          // Already a URL
          profileUrl = data.profile;
        } else if (data.profile.file instanceof File || data.profile.file instanceof Blob) {
          // Upload file
          profileUrl = await uploadImageWithCORS(
            data.profile.file,
            `shops/${userId}/profile/profile-${Date.now()}`
          );
        }
      
        if (profileUrl) {
          shopData.profile = profileUrl;
          await updateDoc(shopRef, {
            profile: profileUrl,
            updatedAt: new Date().toISOString()
          });
          console.log('Profile image uploaded:', profileUrl); // Debug log
        }
      } catch (profileError) {
        console.error('Profile upload failed:', profileError);
      }
    }

    // Item images upload
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
          address: item.address || '',
          coordinates: item.coordinates || null,
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

      // Update items in Firestore
      await updateDoc(shopRef, {
        items: processedItems,
        updatedAt: new Date().toISOString()
      });
    }

    console.log('Shop data saved successfully with username:', shopData.username);
    return { ...shopData, username }; // Return username in response
    
  } catch (error) {
    console.error('Error in saveShopData:', error);
    throw error;
  }
};

// UPDATE: saveInitialShop to include username
// UPDATE: saveInitialShop to include username and fix locations
export const saveInitialShop = async (userId, data) => {
  try {
    const batch = writeBatch(db);
    
    // Generate username if not provided
    let username = data.username;
    if (!username && data.name) {
      username = await generateUsername(data.name);
    }
    
    // 1. Create main shop document
    const shopRef = doc(db, 'shops', userId);
    const shopDoc = {
      ownerId: userId,
      name: data.name || '',
      description: data.description || '',
      mission: data.mission || '',
      username: username, // ADD USERNAME
      theme: cleanDataForFirestore(data.theme) || {},
      layout: cleanDataForFirestore(data.layout) || {},
homeWidgets: cleanDataForFirestore(data.homeWidgets) || [],
      status: 'active',
      profile: null,
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

    // 2. Process items - DECLARE items and locations here
    const items = [];
    const locations = []; // FIX: Declare locations array

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
          category: item.category || 'Other',
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

    console.log('Initial shop saved with username:', username);

    return {
      ...shopDoc,
      items,
      locations // Now this is properly defined
    };

  } catch (error) {
    console.error('Error saving initial shop:', error);
    throw error;
  }
};

// UPDATE: batchUpdateShopData to preserve username
export const batchUpdateShopData = async (userId, updateData) => {
  try {
    console.log('Starting batch update for shop:', userId);
    
    const batch = writeBatch(db);
    const shopRef = doc(db, 'shops', userId);
    
    // Get current shop data to preserve username
    const currentShop = await getDoc(shopRef);
    const currentData = currentShop.data();
    
    // Clean the update data
    const cleanedData = cleanDataForFirestore({
      ...updateData,
      username: currentData?.username, // Preserve existing username
      updatedAt: new Date().toISOString()
    });
    
    // Update the main shop document
    batch.update(shopRef, cleanedData);
    
    // If updating items, we might need to update individual item documents
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

// src/firebase/firebaseService.js - Update getFeaturedItems

// In src/firebase/firebaseService.js
// Update the getFeaturedItems function

export const getFeaturedItems = async (limitCount = 6) => {
  try {
    const shopsRef = collection(db, 'shops');
    const querySnapshot = await getDocs(shopsRef);
    
    let allItems = [];
    querySnapshot.docs.forEach(doc => {
      const shopData = doc.data();
      if (shopData?.items && Array.isArray(shopData.items)) {
        const shopItems = shopData.items
          .filter(item => {
            // Filter out invalid items
            const hasImages = item.images && item.images.length > 0 && item.images.some(img => img);
            const hasValidPrice = item.price && !isNaN(parseFloat(item.price)) && parseFloat(item.price) > 0;
            const hasStock = !item.deleted && (!item.quantity || parseInt(item.quantity) > 0);
            
            return hasImages && hasValidPrice && hasStock;
          })
          .map(item => ({
            ...item,
            shopId: doc.id,
            shopName: shopData.name || 'Unknown Shop',
            shopUsername: shopData.username,
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

    return allItems.slice(0, limitCount);
  } catch (error) {
    console.error('Error fetching featured items:', error);
    throw error;
  }
};

export const saveHomePageConfig = async (userId, widgets) => {
  try {
    const shopRef = doc(db, 'shops', userId);
    const cleanWidgets = widgets.map(widget => ({
      ...widget,
      config: cleanDataForFirestore(widget.config)
    }));
    
    await updateDoc(shopRef, {
      homeWidgets: cleanWidgets,
      homePageUpdated: new Date().toISOString()
    });
    
    return true;
  } catch (error) {
    console.error('Error saving home page config:', error);
    throw error;
  }
};

export const loadHomePageConfig = async (userId) => {
  try {
    const shopRef = doc(db, 'shops', userId);
    const shopDoc = await getDoc(shopRef);
    
    if (shopDoc.exists()) {
      const data = shopDoc.data();
      return data.homeWidgets || [];
    }
    
    return [];
  } catch (error) {
    console.error('Error loading home page config:', error);
    return [];
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