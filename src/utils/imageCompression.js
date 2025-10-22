/**
 * Compresses and resizes an image file before upload
 * @param {File} file - The image file to compress
 * @param {Object} options - Compression options
 * @returns {Promise<File>} - Compressed image file
 */
export const compressImage = async (file, options = {}) => {
  const {
    maxWidth = 1200,      // Max width for items/services
    maxHeight = 1200,     // Max height
    quality = 0.85,       // JPEG quality (0-1)
    maxSizeMB = 1,        // Target max file size
    format = 'image/jpeg' // Output format
  } = options;

  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      const img = new Image();
      
      img.onload = () => {
        // Calculate new dimensions while maintaining aspect ratio
        let width = img.width;
        let height = img.height;
        
        if (width > maxWidth || height > maxHeight) {
          const aspectRatio = width / height;
          
          if (width > height) {
            width = maxWidth;
            height = width / aspectRatio;
          } else {
            height = maxHeight;
            width = height * aspectRatio;
          }
        }
        
        // Create canvas and draw resized image
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        // Convert canvas to blob with compression
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              reject(new Error('Canvas conversion failed'));
              return;
            }
            
            // Check if we need further compression
            if (blob.size > maxSizeMB * 1024 * 1024 && quality > 0.5) {
              // Recursively compress with lower quality
              const newQuality = Math.max(quality - 0.1, 0.5);
              compressImage(file, { ...options, quality: newQuality })
                .then(resolve)
                .catch(reject);
              return;
            }
            
            // Create new File from blob
            const compressedFile = new File(
              [blob],
              file.name.replace(/\.[^/.]+$/, '.jpg'), // Force .jpg extension
              { type: format }
            );
            
            console.log(`Image compressed: ${(file.size / 1024 / 1024).toFixed(2)}MB → ${(compressedFile.size / 1024 / 1024).toFixed(2)}MB`);
            resolve(compressedFile);
          },
          format,
          quality
        );
      };
      
      img.onerror = () => reject(new Error('Image loading failed'));
      img.src = e.target.result;
    };
    
    reader.onerror = () => reject(new Error('File reading failed'));
    reader.readAsDataURL(file);
  });
};

/**
 * Special compression for profile images (smaller, circular)
 */
export const compressProfileImage = async (file) => {
  return compressImage(file, {
    maxWidth: 400,
    maxHeight: 400,
    quality: 0.9,
    maxSizeMB: 0.5
  });
};