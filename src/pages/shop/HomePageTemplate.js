// src/pages/shop/HomePageTemplates.js - Mobile Optimized for All Sections
import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Star, 
  MapPin, 
  Clock, 
  ShoppingBag, 
  Zap, 
  Heart, 
  TrendingUp, 
  Package, 
  Truck, 
  Shield, 
  Award, 
  Users,
  Instagram,
  Twitter,
  Facebook,
  Navigation,
  Calendar,
  Play,
  Mail,
  Phone,
  CheckCircle
} from 'lucide-react';

// ==================== SECTION COMPONENTS ====================

// Hero Banner Section - Mobile Optimized
export const HeroBannerSection = ({ config, theme, editable, onUpdate }) => {
  const [editingField, setEditingField] = useState(null);

  const handleUpdate = (field, value) => {
    if (editable && onUpdate) {
      onUpdate({ ...config, [field]: value });
    }
  };

  return (
    <div style={{
      minHeight: config?.height || 'clamp(40vh, 50vh, 70vh)',
      background: config?.backgroundImage ? 
        `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${config.backgroundImage})` :
        `linear-gradient(135deg, ${theme?.colors?.accent}15 0%, ${theme?.colors?.background} 100%)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      overflow: 'hidden',
      marginBottom: 'clamp(1rem, 2vw, 2rem)',
      borderRadius: 'clamp(8px, 1.5vw, 12px)',
      cursor: editable ? 'pointer' : 'default',
      padding: 'clamp(0.75rem, 1.5vw, 1rem)'
    }}
    onClick={() => editable && document.getElementById(`hero-bg-upload-${config?.id}`)?.click()}
    >
      {editable && (
        <>
          <input
            type="file"
            id={`hero-bg-upload-${config?.id}`}
            accept="image/*"
            style={{ display: 'none' }}
            onChange={(e) => {
              if (e.target.files?.[0]) {
                const reader = new FileReader();
                reader.onloadend = () => handleUpdate('backgroundImage', reader.result);
                reader.readAsDataURL(e.target.files[0]);
              }
            }}
          />
          <div style={{
            position: 'absolute',
            top: 'clamp(0.4rem, 1vw, 0.5rem)',
            left: 'clamp(0.4rem, 1vw, 0.5rem)',
            background: 'rgba(0,0,0,0.7)',
            color: 'white',
            padding: 'clamp(0.3rem, 0.8vw, 0.4rem) clamp(0.6rem, 1.2vw, 0.8rem)',
            borderRadius: '6px',
            fontSize: 'clamp(0.7rem, 1.2vw, 0.75rem)',
            zIndex: 10
          }}>
            Click to change background
          </div>
        </>
      )}
      
      <div style={{ 
        textAlign: 'center', 
        position: 'relative', 
        zIndex: 1, 
        padding: 'clamp(0.5rem, 1.5vw, 1rem)',
        maxWidth: '800px',
        width: '100%'
      }}>
        {editable ? (
          <>
            <input
              type="text"
              value={config?.headline || ''}
              onChange={(e) => handleUpdate('headline', e.target.value)}
              placeholder="Enter headline"
              style={{
                fontSize: 'clamp(1.2rem, 5vw, 5rem)',
                fontWeight: '900',
                margin: '0 0 clamp(0.5rem, 1vw, 1rem) 0',
                background: 'transparent',
                border: 'none',
                color: theme?.colors?.text,
                textAlign: 'center',
                width: '100%',
                outline: 'none'
              }}
            />
            <textarea
              value={config?.subtitle || ''}
              onChange={(e) => handleUpdate('subtitle', e.target.value)}
              placeholder="Enter subtitle"
              style={{
                fontSize: 'clamp(0.8rem, 1.8vw, 1.5rem)',
                opacity: 0.9,
                background: 'transparent',
                border: 'none',
                color: theme?.colors?.text,
                textAlign: 'center',
                width: '100%',
                outline: 'none',
                resize: 'none',
                minHeight: 'clamp(40px, 8vw, 60px)'
              }}
            />
          </>
        ) : (
          <>
            <h1 style={{
              fontSize: 'clamp(1.2rem, 5vw, 5rem)',
              fontWeight: '900',
              margin: '0 0 clamp(0.5rem, 1vw, 1rem) 0',
              lineHeight: 1.1,
              textShadow: '2px 2px 4px rgba(0,0,0,0.5)'
            }}>
              {config?.headline || 'Welcome'}
            </h1>
            <p style={{
              fontSize: 'clamp(0.8rem, 1.8vw, 1.5rem)',
              opacity: 0.9,
              textShadow: '1px 1px 2px rgba(0,0,0,0.5)'
            }}>
              {config?.subtitle || 'Discover amazing products'}
            </p>
          </>
        )}
      </div>
    </div>
  );
};

// Featured Items Section - Mobile Optimized
export const FeaturedItemsSection = ({ config, theme, shopItems, editable, onUpdate }) => {
  const items = shopItems?.filter(item => !item.deleted).slice(0, config?.itemCount || 4) || [];

  const getItemImage = (item) => {
    if (!item?.images || item.images.length === 0) return null;
    
    const validImage = item.images.find(img => {
      if (typeof img === 'string') return img;
      if (img?.preview) return img.preview;
      return null;
    });
    
    if (typeof validImage === 'string') return validImage;
    if (validImage?.preview) return validImage.preview;
    return null;
  };

  return (
    <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 3rem)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(1rem, 2vw, 2rem)',
        padding: '0 clamp(0.5rem, 1vw, 1rem)'
      }}>
        {editable ? (
          <input
            type="text"
            value={config?.title || ''}
            onChange={(e) => onUpdate({ ...config, title: e.target.value })}
            placeholder="Section title"
            style={{
              fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
              fontWeight: '900',
              background: 'transparent',
              border: 'none',
              color: theme?.colors?.text,
              outline: 'none',
              width: '100%'
            }}
          />
        ) : (
          <h2 style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
            fontWeight: '900',
            margin: 0
          }}>
            {config?.title || 'Featured Items'}
          </h2>
        )}
        
        {editable && (
          <select
            value={config?.itemCount || 4}
            onChange={(e) => onUpdate({ ...config, itemCount: parseInt(e.target.value) })}
            style={{
              padding: 'clamp(0.4rem, 0.8vw, 0.5rem)',
              borderRadius: 'clamp(6px, 1vw, 8px)',
              background: theme?.colors?.surface,
              color: theme?.colors?.text,
              border: `1px solid ${theme?.colors?.accent}40`,
              fontSize: 'clamp(0.75rem, 1.2vw, 0.85rem)'
            }}
          >
            <option value={2}>2 items</option>
            <option value={4}>4 items</option>
            <option value={6}>6 items</option>
            <option value={8}>8 items</option>
          </select>
        )}
      </div>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(140px, 20vw, 280px), 1fr))',
        gap: 'clamp(0.75rem, 1.5vw, 1.5rem)',
        padding: '0 clamp(0.5rem, 1vw, 1rem)'
      }}>
        {items.length > 0 ? (
          items.map((item) => {
            const itemImage = getItemImage(item);
            
            return (
              <div key={item.id} style={{
                background: `${theme?.colors?.surface}90`,
                borderRadius: 'clamp(8px, 1.5vw, 12px)',
                overflow: 'hidden',
                border: `1px solid ${theme?.colors?.accent}30`,
                transition: 'transform 0.3s ease'
              }}>
                <div style={{
                  height: 'clamp(120px, 25vw, 250px)',
                  background: `${theme?.colors?.background}50`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  overflow: 'hidden'
                }}>
                  {itemImage ? (
                    <img 
                      src={itemImage} 
                      alt={item?.name || 'Product'} 
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }} 
                      onError={(e) => {
                        console.error('Image failed to load:', itemImage);
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = `
                          <div style="
                            width: 100%;
                            height: 100%;
                            display: flex;
                            flex-direction: column;
                            align-items: center;
                            justify-content: center;
                            gap: 1rem;
                          ">
                            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="${theme?.colors?.accent}" stroke-width="2">
                              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                              <circle cx="8.5" cy="8.5" r="1.5"></circle>
                              <polyline points="21 15 16 10 5 21"></polyline>
                            </svg>
                            <span style="color: ${theme?.colors?.accent}; opacity: 0.7; font-size: 0.9rem;">No Image</span>
                          </div>
                        `;
                      }}
                    />
                  ) : (
                    <div style={{
                      width: '100%',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 'clamp(0.5rem, 1vw, 1rem)'
                    }}>
                      <Package size={window.innerWidth < 768 ? 24 : 48} color={theme?.colors?.accent} style={{ opacity: 0.5 }} />
                      <span style={{
                        color: theme?.colors?.accent,
                        opacity: 0.7,
                        fontSize: 'clamp(0.7rem, 1.2vw, 0.9rem)'
                      }}>
                        Add Image in Shop Tab
                      </span>
                    </div>
                  )}
                  
                  {/* Quantity Badge */}
                  {item?.quantity !== undefined && (
                    <div style={{
                      position: 'absolute',
                      top: 'clamp(0.4rem, 1vw, 0.75rem)',
                      right: 'clamp(0.4rem, 1vw, 0.75rem)',
                      background: parseInt(item.quantity) > 0 ? 
                        'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
                      color: 'white',
                      padding: 'clamp(0.15rem, 0.4vw, 0.25rem) clamp(0.4rem, 0.8vw, 0.75rem)',
                      borderRadius: 'clamp(8px, 1.5vw, 12px)',
                      fontSize: 'clamp(0.65rem, 1vw, 0.75rem)',
                      fontWeight: '700'
                    }}>
                      {parseInt(item.quantity) > 0 ? `${item.quantity} LEFT` : 'SOLD OUT'}
                    </div>
                  )}
                </div>
                <div style={{ padding: 'clamp(0.75rem, 1.5vw, 1.5rem)' }}>
                  <h3 style={{
                    fontSize: 'clamp(0.85rem, 1.5vw, 1.1rem)',
                    fontWeight: '700',
                    marginBottom: 'clamp(0.25rem, 0.5vw, 0.5rem)',
                    color: theme?.colors?.text,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap'
                  }}>
                    {item?.name || 'Product Name'}
                  </h3>
                  <p style={{
                    fontSize: 'clamp(0.75rem, 1.2vw, 0.9rem)',
                    opacity: 0.7,
                    marginBottom: 'clamp(0.5rem, 1vw, 1rem)',
                    color: theme?.colors?.text,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    lineHeight: 1.3
                  }}>
                    {item?.description || 'Product description'}
                  </p>
                  <div style={{
                    fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                    fontWeight: '900',
                    color: theme?.colors?.accent
                  }}>
                    ${parseFloat(item?.price || 0).toFixed(2)}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: 'clamp(2rem, 4vw, 4rem) clamp(1rem, 2vw, 2rem)',
            color: theme?.colors?.text,
            opacity: 0.6
          }}>
            <Package size={window.innerWidth < 768 ? 48 : 64} color={theme?.colors?.accent} style={{ 
              margin: '0 auto clamp(0.75rem, 1.5vw, 1rem)',
              opacity: 0.5
            }} />
            <h3 style={{ marginBottom: '0.5rem', fontSize: 'clamp(1rem, 2vw, 1.2rem)' }}>
              No Items Yet
            </h3>
            <p style={{ fontSize: 'clamp(0.85rem, 1.5vw, 0.95rem)' }}>
              Add items in the Shop tab to see them here
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// Photo Gallery Section - Mobile Optimized
export const PhotoGallerySection = ({ config, theme, editable, onUpdate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = config?.images || [];
  const displayStyle = config?.displayStyle || 'grid';

  const handleAddImage = (file) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const newImages = [...images, reader.result];
      onUpdate({ ...config, images: newImages });
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveImage = (index) => {
    const newImages = images.filter((_, i) => i !== index);
    onUpdate({ ...config, images: newImages });
  };

  if (displayStyle === 'carousel') {
    return (
      <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 3rem)' }}>
        {editable ? (
          <input
            type="text"
            value={config?.title || ''}
            onChange={(e) => onUpdate({ ...config, title: e.target.value })}
            placeholder="Gallery title"
            style={{
              fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
              fontWeight: '700',
              marginBottom: 'clamp(1rem, 2vw, 2rem)',
              textAlign: 'center',
              background: 'transparent',
              border: 'none',
              color: theme?.colors?.text,
              outline: 'none',
              width: '100%'
            }}
          />
        ) : (
          <h2 style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: 'clamp(1rem, 2vw, 2rem)',
            textAlign: 'center'
          }}>
            {config?.title || 'Gallery'}
          </h2>
        )}
        
        <div style={{
          position: 'relative',
          height: 'clamp(250px, 40vw, 500px)',
          borderRadius: 'clamp(12px, 2vw, 16px)',
          overflow: 'hidden',
          background: `${theme?.colors?.surface}50`
        }}>
          {images.length > 0 ? (
            <>
              {images.map((img, index) => (
                <div
                  key={index}
                  style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backgroundImage: `url(${img})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    opacity: currentSlide === index ? 1 : 0,
                    transition: 'opacity 0.5s ease'
                  }}
                />
              ))}
              
              {images.length > 1 && (
                <>
                  <button
                    onClick={() => setCurrentSlide((currentSlide - 1 + images.length) % images.length)}
                    style={{
                      position: 'absolute',
                      left: 'clamp(0.5rem, 1vw, 1rem)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 'clamp(36px, 6vw, 48px)',
                      height: 'clamp(36px, 6vw, 48px)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}
                  >
                    <ChevronLeft size={window.innerWidth < 768 ? 20 : 24} />
                  </button>
                  <button
                    onClick={() => setCurrentSlide((currentSlide + 1) % images.length)}
                    style={{
                      position: 'absolute',
                      right: 'clamp(0.5rem, 1vw, 1rem)',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      background: 'rgba(0,0,0,0.5)',
                      border: 'none',
                      borderRadius: '50%',
                      width: 'clamp(36px, 6vw, 48px)',
                      height: 'clamp(36px, 6vw, 48px)',
                      color: 'white',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 2
                    }}
                  >
                    <ChevronRight size={window.innerWidth < 768 ? 20 : 24} />
                  </button>
                </>
              )}
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme?.colors?.text,
              opacity: 0.5,
              fontSize: 'clamp(0.85rem, 1.5vw, 1rem)'
            }}>
              No images yet
            </div>
          )}
          
          {editable && (
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => {
                Array.from(e.target.files).forEach(file => handleAddImage(file));
              }}
              style={{
                position: 'absolute',
                top: 'clamp(0.5rem, 1vw, 1rem)',
                right: 'clamp(0.5rem, 1vw, 1rem)',
                zIndex: 3
              }}
            />
          )}
        </div>
      </div>
    );
  }

  // Grid display
  return (
    <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 3rem)', padding: '0 clamp(0.5rem, 1vw, 1rem)' }}>
      {editable ? (
        <input
          type="text"
          value={config?.title || ''}
          onChange={(e) => onUpdate({ ...config, title: e.target.value })}
          placeholder="Gallery title"
          style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: 'clamp(1rem, 2vw, 2rem)',
            textAlign: 'center',
            background: 'transparent',
            border: 'none',
            color: theme?.colors?.text,
            outline: 'none',
            width: '100%'
          }}
        />
      ) : (
        <h2 style={{
          fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
          fontWeight: '700',
          marginBottom: 'clamp(1rem, 2vw, 2rem)',
          textAlign: 'center'
        }}>
          {config?.title || 'Gallery'}
        </h2>
      )}
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(120px, 20vw, 250px), 1fr))',
        gap: 'clamp(0.75rem, 1.5vw, 1rem)'
      }}>
        {images.map((img, index) => (
          <div key={index} style={{
            position: 'relative',
            height: 'clamp(120px, 20vw, 250px)',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            overflow: 'hidden'
          }}>
            <img src={img} alt={`Gallery ${index}`} style={{
              width: '100%',
              height: '100%',
              objectFit: 'cover'
            }} />
            {editable && (
              <button
                onClick={() => handleRemoveImage(index)}
                style={{
                  position: 'absolute',
                  top: 'clamp(0.25rem, 0.5vw, 0.5rem)',
                  right: 'clamp(0.25rem, 0.5vw, 0.5rem)',
                  background: 'rgba(0,0,0,0.7)',
                  color: 'white',
                  border: 'none',
                  borderRadius: '50%',
                  width: 'clamp(24px, 4vw, 32px)',
                  height: 'clamp(24px, 4vw, 32px)',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 'clamp(1rem, 2vw, 1.5rem)'
                }}
              >
                ×
              </button>
            )}
          </div>
        ))}
        
        {editable && (
          <label style={{
            height: 'clamp(120px, 20vw, 250px)',
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            border: `2px dashed ${theme?.colors?.accent}40`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            background: `${theme?.colors?.surface}30`
          }}>
            <input
              type="file"
              accept="image/*"
              multiple
              style={{ display: 'none' }}
              onChange={(e) => {
                Array.from(e.target.files).forEach(file => handleAddImage(file));
              }}
            />
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', marginBottom: 'clamp(0.25rem, 0.5vw, 0.5rem)' }}>+</div>
              <div style={{ fontSize: 'clamp(0.75rem, 1.2vw, 1rem)' }}>Add Images</div>
            </div>
          </label>
        )}
      </div>
    </div>
  );
};

// Featured Video Section - Mobile Optimized
export const FeaturedVideoSection = ({ config, theme, editable, onUpdate }) => {
  const getYouTubeId = (url) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url?.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
  };

  const videoId = config?.youtubeUrl ? getYouTubeId(config.youtubeUrl) : config?.videoId;

  return (
    <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 3rem)', padding: '0 clamp(0.5rem, 1vw, 1rem)' }}>
      {editable ? (
        <input
          type="text"
          value={config?.title || ''}
          onChange={(e) => onUpdate({ ...config, title: e.target.value })}
          placeholder="Video section title"
          style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
            textAlign: 'center',
            background: 'transparent',
            border: 'none',
            color: theme?.colors?.text,
            outline: 'none',
            width: '100%'
          }}
        />
      ) : (
        <h2 style={{
          fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
          fontWeight: '700',
          marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
          textAlign: 'center'
        }}>
          {config?.title || 'Featured Video'}
        </h2>
      )}

      {editable && (
        <input
          type="text"
          value={config?.youtubeUrl || ''}
          onChange={(e) => onUpdate({ ...config, youtubeUrl: e.target.value, videoId: getYouTubeId(e.target.value) })}
          placeholder="Paste YouTube URL here"
          style={{
            width: '100%',
            padding: 'clamp(0.75rem, 1.5vw, 1rem)',
            marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
            borderRadius: 'clamp(6px, 1vw, 8px)',
            background: theme?.colors?.surface,
            border: `1px solid ${theme?.colors?.accent}40`,
            color: theme?.colors?.text,
            textAlign: 'center',
            fontSize: 'clamp(0.85rem, 1.2vw, 1rem)'
          }}
        />
      )}
      
      <div style={{
        maxWidth: '900px',
        margin: '0 auto',
        borderRadius: 'clamp(12px, 2vw, 16px)',
        overflow: 'hidden',
        background: `${theme?.colors?.surface}50`
      }}>
        {videoId ? (
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0 }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="YouTube video"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%'
              }}
            />
          </div>
        ) : (
          <div style={{
            height: 'clamp(200px, 35vw, 400px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'column',
            gap: 'clamp(0.75rem, 1.5vw, 1rem)',
            color: theme?.colors?.text,
            opacity: 0.5
          }}>
            <Play size={window.innerWidth < 768 ? 48 : 64} />
            <div style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}>Add YouTube URL to display video</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Mission Statement Section - Mobile Optimized
export const MissionStatementSection = ({ config, theme, editable, onUpdate }) => {
  return (
    <div style={{
      background: `${theme?.colors?.surface}50`,
      borderRadius: 'clamp(12px, 2vw, 16px)',
      padding: 'clamp(1.5rem, 3vw, 3rem) clamp(1rem, 2vw, 2rem)',
      marginBottom: 'clamp(1.5rem, 3vw, 3rem)',
      textAlign: 'center'
    }}>
      {editable ? (
        <>
          <input
            type="text"
            value={config?.title || ''}
            onChange={(e) => onUpdate({ ...config, title: e.target.value })}
            placeholder="Mission title"
            style={{
              fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
              fontWeight: '700',
              marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
              background: 'transparent',
              border: 'none',
              color: theme?.colors?.accent,
              outline: 'none',
              textAlign: 'center',
              width: '100%'
            }}
          />
          <textarea
            value={config?.content || ''}
            onChange={(e) => onUpdate({ ...config, content: e.target.value })}
            placeholder="Mission statement content"
            style={{
              fontSize: 'clamp(0.85rem, 1.8vw, 1.2rem)',
              lineHeight: 1.6,
              maxWidth: '800px',
              margin: '0 auto',
              background: 'transparent',
              border: `1px solid ${theme?.colors?.accent}40`,
              borderRadius: 'clamp(6px, 1vw, 8px)',
              color: theme?.colors?.text,
              outline: 'none',
              padding: 'clamp(0.75rem, 1.5vw, 1rem)',
              width: '100%',
              minHeight: 'clamp(100px, 20vw, 150px)',
              resize: 'vertical'
            }}
          />
        </>
      ) : (
        <>
          <h2 style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
            color: theme?.colors?.accent,
            marginBottom: 'clamp(1rem, 2vw, 1.5rem)',
            fontWeight: '700'
          }}>
            {config?.title || 'Our Mission'}
          </h2>
          <p style={{
            fontSize: 'clamp(0.85rem, 1.8vw, 1.2rem)',
            lineHeight: 1.6,
            maxWidth: '800px',
            margin: '0 auto',
            opacity: 0.9
          }}>
            {config?.content || 'We are dedicated to providing exceptional products and services.'}
          </p>
        </>
      )}
    </div>
  );
};

// Calendar/Events Section - Mobile Optimized
export const CalendarEventsSection = ({ config, theme, editable, onUpdate }) => {
  const events = config?.events || [];

  const handleAddEvent = () => {
    const newEvent = {
      id: Date.now().toString(),
      title: 'New Event',
      date: new Date().toISOString().split('T')[0],
      time: '10:00 AM',
      description: 'Event description'
    };
    onUpdate({ ...config, events: [...events, newEvent] });
  };

  const handleUpdateEvent = (eventId, field, value) => {
    const newEvents = events.map(e => 
      e.id === eventId ? { ...e, [field]: value } : e
    );
    onUpdate({ ...config, events: newEvents });
  };

  const handleRemoveEvent = (eventId) => {
    onUpdate({ ...config, events: events.filter(e => e.id !== eventId) });
  };

  return (
    <div style={{ marginBottom: 'clamp(1.5rem, 3vw, 3rem)', padding: '0 clamp(0.5rem, 1vw, 1rem)' }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(1rem, 2vw, 2rem)',
        flexWrap: 'wrap',
        gap: 'clamp(0.5rem, 1vw, 1rem)'
      }}>
        {editable ? (
          <input
            type="text"
            value={config?.title || ''}
            onChange={(e) => onUpdate({ ...config, title: e.target.value })}
            placeholder="Events section title"
            style={{
              fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
              fontWeight: '700',
              background: 'transparent',
              border: 'none',
              color: theme?.colors?.text,
              outline: 'none',
              flex: 1,
              minWidth: '150px'
            }}
          />
        ) : (
          <h2 style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
            fontWeight: '700',
            margin: 0
          }}>
            {config?.title || 'Upcoming Events'}
          </h2>
        )}
        
        {editable && (
          <button
            onClick={handleAddEvent}
            style={{
              background: theme?.colors?.accent,
              color: 'white',
              border: 'none',
              padding: 'clamp(0.6rem, 1.2vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)',
              borderRadius: 'clamp(6px, 1vw, 8px)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: 'clamp(0.85rem, 1.2vw, 1rem)'
            }}
          >
            + Add Event
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(200px, 30vw, 300px), 1fr))',
        gap: 'clamp(1rem, 2vw, 1.5rem)'
      }}>
        {events.map((event) => (
          <div key={event.id} style={{
            background: `${theme?.colors?.surface}90`,
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            padding: 'clamp(1rem, 2vw, 1.5rem)',
            border: `1px solid ${theme?.colors?.accent}30`,
            position: 'relative'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 'clamp(0.5rem, 1vw, 0.75rem)',
              marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
              color: theme?.colors?.accent
            }}>
              <Calendar size={window.innerWidth < 768 ? 20 : 24} />
              {editable ? (
                <input
                  type="date"
                  value={event.date}
                  onChange={(e) => handleUpdateEvent(event.id, 'date', e.target.value)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme?.colors?.accent,
                    fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                    fontWeight: '600'
                  }}
                />
              ) : (
                <span style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1rem)', fontWeight: '600' }}>
                  {new Date(event.date).toLocaleDateString()}
                </span>
              )}
            </div>

            {editable ? (
              <>
                <input
                  type="text"
                  value={event.title}
                  onChange={(e) => handleUpdateEvent(event.id, 'title', e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                    fontWeight: '700',
                    marginBottom: 'clamp(0.25rem, 0.5vw, 0.5rem)',
                    background: 'transparent',
                    border: 'none',
                    color: theme?.colors?.text,
                    outline: 'none'
                  }}
                />
                <input
                  type="text"
                  value={event.time}
                  onChange={(e) => handleUpdateEvent(event.id, 'time', e.target.value)}
                  placeholder="Time"
                  style={{
                    width: '100%',
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                    marginBottom: 'clamp(0.25rem, 0.5vw, 0.5rem)',
                    background: 'transparent',
                    border: 'none',
                    color: theme?.colors?.text,
                    opacity: 0.7,
                    outline: 'none'
                  }}
                />
                <textarea
                  value={event.description}
                  onChange={(e) => handleUpdateEvent(event.id, 'description', e.target.value)}
                  style={{
                    width: '100%',
                    fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                    background: 'transparent',
                    border: `1px solid ${theme?.colors?.accent}20`,
                    borderRadius: '4px',
                    color: theme?.colors?.text,
                    opacity: 0.7,
                    padding: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                    minHeight: '60px',
                    resize: 'vertical'
                  }}
                />
                <button
                  onClick={() => handleRemoveEvent(event.id)}
                  style={{
                    position: 'absolute',
                    top: 'clamp(0.5rem, 1vw, 0.5rem)',
                    right: 'clamp(0.5rem, 1vw, 0.5rem)',
                    background: 'transparent',
                    border: 'none',
                    color: '#ff4444',
                    cursor: 'pointer',
                    fontSize: 'clamp(1.2rem, 2vw, 1.5rem)'
                  }}
                >
                  ×
                </button>
              </>
            ) : (
              <>
                <h3 style={{
                  fontSize: 'clamp(1rem, 2vw, 1.2rem)',
                  fontWeight: '700',
                  marginBottom: 'clamp(0.25rem, 0.5vw, 0.5rem)'
                }}>
                  {event.title}
                </h3>
                <div style={{
                  fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                  opacity: 0.7,
                  marginBottom: 'clamp(0.25rem, 0.5vw, 0.5rem)'
                }}>
                  {event.time}
                </div>
                <p style={{
                  fontSize: 'clamp(0.8rem, 1.5vw, 0.9rem)',
                  opacity: 0.7,
                  lineHeight: 1.5
                }}>
                  {event.description}
                </p>
              </>
            )}
          </div>
        ))}
        
        {events.length === 0 && !editable && (
          <div style={{
            gridColumn: '1 / -1',
            textAlign: 'center',
            padding: 'clamp(2rem, 4vw, 3rem)',
            opacity: 0.5,
            fontSize: 'clamp(0.9rem, 1.5vw, 1rem)'
          }}>
            No upcoming events
          </div>
        )}
      </div>
    </div>
  );
};

// Services Grid Section - Mobile Optimized
export const ServicesGridSection = ({ config, theme, editable, onUpdate }) => {
  const services = config?.services || [];
  const iconMap = {
    'Truck': Truck,
    'Shield': Shield,
    'Clock': Clock,
    'Award': Award,
    'Heart': Heart,
    'Zap': Zap,
    'Users': Users,
    'Star': Star
  };

  const handleAddService = () => {
    const newService = {
      id: Date.now().toString(),
      icon: 'Star',
      title: 'New Service',
      description: 'Service description'
    };
    onUpdate({ ...config, services: [...services, newService] });
  };

  const handleUpdateService = (serviceId, field, value) => {
    const newServices = services.map(s => 
      s.id === serviceId ? { ...s, [field]: value } : s
    );
    onUpdate({ ...config, services: newServices });
  };

  const handleRemoveService = (serviceId) => {
    onUpdate({ ...config, services: services.filter(s => s.id !== serviceId) });
  };

  return (
    <div style={{
      background: `${theme?.colors?.surface}50`,
      padding: 'clamp(1.5rem, 3vw, 3rem) clamp(1rem, 2vw, 2rem)',
      marginBottom: 'clamp(1.5rem, 3vw, 3rem)',
      borderRadius: 'clamp(12px, 2vw, 16px)'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(1rem, 2vw, 2rem)',
        flexWrap: 'wrap',
        gap: 'clamp(0.5rem, 1vw, 1rem)'
      }}>
        {editable ? (
          <input
            type="text"
            value={config?.title || ''}
            onChange={(e) => onUpdate({ ...config, title: e.target.value })}
            placeholder="Services title"
            style={{
              fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
              fontWeight: '700',
              background: 'transparent',
              border: 'none',
              color: theme?.colors?.text,
              outline: 'none',
              textAlign: 'center',
              flex: 1
            }}
          />
        ) : (
          <h2 style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
            fontWeight: '700',
            margin: '0 auto',
            textAlign: 'center',
            width: '100%'
          }}>
            {config?.title || 'Our Services'}
          </h2>
        )}
        
        {editable && (
          <button
            onClick={handleAddService}
            style={{
              background: theme?.colors?.accent,
              color: 'white',
              border: 'none',
              padding: 'clamp(0.6rem, 1.2vw, 0.75rem) clamp(1rem, 2vw, 1.5rem)',
              borderRadius: 'clamp(6px, 1vw, 8px)',
              cursor: 'pointer',
              fontWeight: '600',
              fontSize: 'clamp(0.85rem, 1.2vw, 1rem)'
            }}
          >
            + Add
          </button>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(150px, 25vw, 200px), 1fr))',
        gap: 'clamp(1rem, 2vw, 2rem)',
        marginTop: 'clamp(1rem, 2vw, 2rem)'
      }}>
        {services.map((service) => {
          const IconComponent = iconMap[service.icon] || Star;
          
          return (
            <div key={service.id} style={{
              textAlign: 'center',
              padding: 'clamp(1rem, 2vw, 1.5rem)',
              background: `${theme?.colors?.background}60`,
              borderRadius: 'clamp(8px, 1.5vw, 12px)',
              position: 'relative'
            }}>
              {editable && (
                <>
                  <select
                    value={service.icon}
                    onChange={(e) => handleUpdateService(service.id, 'icon', e.target.value)}
                    style={{
                      position: 'absolute',
                      top: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                      left: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                      padding: 'clamp(0.2rem, 0.4vw, 0.25rem)',
                      borderRadius: '4px',
                      background: theme?.colors?.surface,
                      color: theme?.colors?.text,
                      border: `1px solid ${theme?.colors?.accent}40`,
                      fontSize: 'clamp(0.7rem, 1vw, 0.75rem)'
                    }}
                  >
                    {Object.keys(iconMap).map(iconName => (
                      <option key={iconName} value={iconName}>{iconName}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => handleRemoveService(service.id)}
                    style={{
                      position: 'absolute',
                      top: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                      right: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                      background: 'transparent',
                      border: 'none',
                      color: '#ff4444',
                      cursor: 'pointer',
                      fontSize: 'clamp(1.2rem, 2vw, 1.5rem)'
                    }}
                  >
                    ×
                  </button>
                </>
              )}

              <IconComponent 
                size={window.innerWidth < 768 ? 36 : 48}
                color={theme?.colors?.accent}
                style={{ margin: '0 auto clamp(0.75rem, 1.5vw, 1rem)' }}
              />

              {editable ? (
                <>
                  <input
                    type="text"
                    value={service.title}
                    onChange={(e) => handleUpdateService(service.id, 'title', e.target.value)}
                    style={{
                      width: '100%',
                      fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                      fontWeight: '600',
                      marginBottom: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                      background: 'transparent',
                      border: 'none',
                      color: theme?.colors?.text,
                      textAlign: 'center',
                      outline: 'none'
                    }}
                  />
                  <textarea
                    value={service.description}
                    onChange={(e) => handleUpdateService(service.id, 'description', e.target.value)}
                    style={{
                      width: '100%',
                      fontSize: 'clamp(0.75rem, 1.3vw, 0.85rem)',
                      background: 'transparent',
                      border: `1px solid ${theme?.colors?.accent}20`,
                      borderRadius: '4px',
                      color: theme?.colors?.text,
                      opacity: 0.7,
                      padding: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                      textAlign: 'center',
                      minHeight: '50px',
                      resize: 'vertical'
                    }}
                  />
                </>
              ) : (
                <>
                  <h3 style={{
                    fontSize: 'clamp(0.95rem, 1.8vw, 1.1rem)',
                    fontWeight: '600',
                    marginBottom: 'clamp(0.4rem, 0.8vw, 0.5rem)'
                  }}>
                    {service.title}
                  </h3>
                  <p style={{
                    fontSize: 'clamp(0.75rem, 1.3vw, 0.85rem)',
                    opacity: 0.7,
                    lineHeight: 1.5
                  }}>
                    {service.description}
                  </p>
                </>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

// Contact Section - Mobile Optimized
export const ContactSection = ({ config, theme, editable, onUpdate }) => {
  return (
    <div style={{
      background: `${theme?.colors?.surface}50`,
      padding: 'clamp(1.5rem, 3vw, 3rem) clamp(1rem, 2vw, 2rem)',
      marginBottom: 'clamp(1.5rem, 3vw, 3rem)',
      borderRadius: 'clamp(12px, 2vw, 16px)'
    }}>
      {editable ? (
        <input
          type="text"
          value={config?.title || ''}
          onChange={(e) => onUpdate({ ...config, title: e.target.value })}
          placeholder="Contact section title"
          style={{
            fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: 'clamp(1rem, 2vw, 2rem)',
            textAlign: 'center',
            background: 'transparent',
            border: 'none',
            color: theme?.colors?.text,
            outline: 'none',
            width: '100%'
          }}
        />
      ) : (
        <h2 style={{
          fontSize: 'clamp(1.3rem, 3.5vw, 2.5rem)',
          fontWeight: '700',
          marginBottom: 'clamp(1rem, 2vw, 2rem)',
          textAlign: 'center'
        }}>
          {config?.title || 'Get In Touch'}
        </h2>
      )}

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(200px, 30vw, 250px), 1fr))',
        gap: 'clamp(1rem, 2vw, 2rem)',
        maxWidth: '900px',
        margin: '0 auto'
      }}>
        <div style={{ textAlign: 'center' }}>
          <Mail size={window.innerWidth < 768 ? 28 : 32} color={theme?.colors?.accent} style={{ margin: '0 auto clamp(0.75rem, 1.5vw, 1rem)' }} />
          {editable ? (
            <input
              type="email"
              value={config?.email || ''}
              onChange={(e) => onUpdate({ ...config, email: e.target.value })}
              placeholder="email@example.com"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: theme?.colors?.text,
                textAlign: 'center',
                fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                outline: 'none'
              }}
            />
          ) : (
            <div style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}>{config?.email || 'info@example.com'}</div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <Phone size={window.innerWidth < 768 ? 28 : 32} color={theme?.colors?.accent} style={{ margin: '0 auto clamp(0.75rem, 1.5vw, 1rem)' }} />
          {editable ? (
            <input
              type="tel"
              value={config?.phone || ''}
              onChange={(e) => onUpdate({ ...config, phone: e.target.value })}
              placeholder="(555) 123-4567"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                color: theme?.colors?.text,
                textAlign: 'center',
                fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                outline: 'none'
              }}
            />
          ) : (
            <div style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}>{config?.phone || '(555) 123-4567'}</div>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <MapPin size={window.innerWidth < 768 ? 28 : 32} color={theme?.colors?.accent} style={{ margin: '0 auto clamp(0.75rem, 1.5vw, 1rem)' }} />
          {editable ? (
            <textarea
              value={config?.address || ''}
              onChange={(e) => onUpdate({ ...config, address: e.target.value })}
              placeholder="123 Main St, City, State"
              style={{
                width: '100%',
                background: 'transparent',
                border: `1px solid ${theme?.colors?.accent}20`,
                borderRadius: '4px',
                color: theme?.colors?.text,
                textAlign: 'center',
                fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
                padding: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                minHeight: '60px',
                resize: 'vertical'
              }}
            />
          ) : (
            <div style={{ whiteSpace: 'pre-line', fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}>{config?.address || '123 Main St\nCity, State'}</div>
          )}
        </div>
      </div>
    </div>
  );
};

// Text Block Section - Mobile Optimized
export const TextBlockSection = ({ config, theme, editable, onUpdate }) => {
  return (
    <div style={{
      padding: 'clamp(1rem, 2vw, 2rem) clamp(0.5rem, 1vw, 1rem)',
      marginBottom: 'clamp(1.5rem, 3vw, 3rem)'
    }}>
      {editable ? (
        <>
          <input
            type="text"
            value={config?.title || ''}
            onChange={(e) => onUpdate({ ...config, title: e.target.value })}
            placeholder="Section title (optional)"
            style={{
              width: '100%',
              fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
              fontWeight: '700',
              marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
              background: 'transparent',
              border: 'none',
              color: theme?.colors?.text,
              outline: 'none',
              textAlign: config?.alignment || 'left'
            }}
          />
          <div style={{ marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)' }}>
            <label style={{ marginRight: 'clamp(0.75rem, 1.5vw, 1rem)', fontSize: 'clamp(0.8rem, 1.3vw, 0.9rem)' }}>Alignment:</label>
            {['left', 'center', 'right'].map(align => (
              <button
                key={align}
                onClick={() => onUpdate({ ...config, alignment: align })}
                style={{
                  background: config?.alignment === align ? theme?.colors?.accent : 'transparent',
                  color: config?.alignment === align ? 'white' : theme?.colors?.text,
                  border: `1px solid ${theme?.colors?.accent}`,
                  padding: 'clamp(0.4rem, 0.8vw, 0.5rem) clamp(0.75rem, 1.5vw, 1rem)',
                  marginRight: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  textTransform: 'capitalize',
                  fontSize: 'clamp(0.75rem, 1.2vw, 0.85rem)'
                }}
              >
                {align}
              </button>
            ))}
          </div>
          <textarea
            value={config?.content || ''}
            onChange={(e) => onUpdate({ ...config, content: e.target.value })}
            placeholder="Enter your content here..."
            style={{
              width: '100%',
              fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
              lineHeight: 1.6,
              background: 'transparent',
              border: `1px solid ${theme?.colors?.accent}40`,
              borderRadius: 'clamp(6px, 1vw, 8px)',
              color: theme?.colors?.text,
              padding: 'clamp(0.75rem, 1.5vw, 1rem)',
              minHeight: 'clamp(150px, 30vw, 200px)',
              resize: 'vertical',
              textAlign: config?.alignment || 'left'
            }}
          />
        </>
      ) : (
        <>
          {config?.title && (
            <h2 style={{
              fontSize: 'clamp(1.2rem, 2.5vw, 2rem)',
              fontWeight: '700',
              marginBottom: 'clamp(0.75rem, 1.5vw, 1rem)',
              textAlign: config?.alignment || 'left'
            }}>
              {config.title}
            </h2>
          )}
          <p style={{
            fontSize: 'clamp(0.85rem, 1.5vw, 1rem)',
            lineHeight: 1.6,
            opacity: 0.9,
            textAlign: config?.alignment || 'left',
            whiteSpace: 'pre-line'
          }}>
            {config?.content || 'Add your custom content here.'}
          </p>
        </>
      )}
    </div>
  );
};

// ==================== TEMPLATE LAYOUTS ====================

// Template 1: Streetwear Drop
export const StreetwearTemplate = ({ shopData, theme, sections, editable, onUpdateSection }) => {
  const renderSection = (section) => {
    const sectionProps = {
      config: section.config,
      theme,
      shopItems: shopData?.items,
      editable,
      onUpdate: (newConfig) => onUpdateSection?.(section.id, newConfig)
    };

    switch (section.type) {
      case 'hero-banner':
        return <HeroBannerSection key={section.id} {...sectionProps} />;
      case 'featured-items':
        return <FeaturedItemsSection key={section.id} {...sectionProps} />;
      case 'photo-gallery':
        return <PhotoGallerySection key={section.id} {...sectionProps} />;
      case 'featured-video':
        return <FeaturedVideoSection key={section.id} {...sectionProps} />;
      case 'mission-statement':
        return <MissionStatementSection key={section.id} {...sectionProps} />;
      case 'services-grid':
        return <ServicesGridSection key={section.id} {...sectionProps} />;
      case 'contact':
        return <ContactSection key={section.id} {...sectionProps} />;
      case 'text-block':
        return <TextBlockSection key={section.id} {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {sections?.map(section => renderSection(section))}
      
      {/* Default Social Proof if no sections */}
      {!sections?.length && (
        <div style={{
          background: `${theme?.colors?.surface}50`,
          padding: 'clamp(1.5rem, 3vw, 3rem) clamp(1rem, 2vw, 2rem)',
          marginBottom: 'clamp(1.5rem, 3vw, 3rem)',
          borderRadius: 'clamp(12px, 2vw, 16px)',
          textAlign: 'center'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(clamp(100px, 20vw, 150px), 1fr))',
            gap: 'clamp(1rem, 2vw, 2rem)',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <div>
              <TrendingUp size={window.innerWidth < 768 ? 28 : 32} color={theme?.colors?.accent} style={{ margin: '0 auto clamp(0.4rem, 0.8vw, 0.5rem)' }} />
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '900', color: theme?.colors?.accent }}>500+</div>
              <div style={{ opacity: 0.7, fontSize: 'clamp(0.75rem, 1.3vw, 0.9rem)' }}>Items Sold</div>
            </div>
            <div>
              <Users size={window.innerWidth < 768 ? 28 : 32} color={theme?.colors?.accent} style={{ margin: '0 auto clamp(0.4rem, 0.8vw, 0.5rem)' }} />
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '900', color: theme?.colors?.accent }}>1K+</div>
              <div style={{ opacity: 0.7, fontSize: 'clamp(0.75rem, 1.3vw, 0.9rem)' }}>Community</div>
            </div>
            <div>
              <Heart size={window.innerWidth < 768 ? 28 : 32} color={theme?.colors?.accent} style={{ margin: '0 auto clamp(0.4rem, 0.8vw, 0.5rem)' }} />
              <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', fontWeight: '900', color: theme?.colors?.accent }}>100%</div>
              <div style={{ opacity: 0.7, fontSize: 'clamp(0.75rem, 1.3vw, 0.9rem)' }}>Authentic</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Template 2: Organization
export const OrganizationTemplate = ({ shopData, theme, sections, editable, onUpdateSection }) => {
  const renderSection = (section) => {
    const sectionProps = {
      config: section.config,
      theme,
      shopItems: shopData?.items,
      editable,
      onUpdate: (newConfig) => onUpdateSection?.(section.id, newConfig)
    };

    switch (section.type) {
      case 'hero-banner':
        return <HeroBannerSection key={section.id} {...sectionProps} />;
      case 'mission-statement':
        return <MissionStatementSection key={section.id} {...sectionProps} />;
      case 'calendar-events':
        return <CalendarEventsSection key={section.id} {...sectionProps} />;
      case 'services-grid':
        return <ServicesGridSection key={section.id} {...sectionProps} />;
      case 'photo-gallery':
        return <PhotoGallerySection key={section.id} {...sectionProps} />;
      case 'featured-video':
        return <FeaturedVideoSection key={section.id} {...sectionProps} />;
      case 'contact':
        return <ContactSection key={section.id} {...sectionProps} />;
      case 'text-block':
        return <TextBlockSection key={section.id} {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {sections?.map(section => renderSection(section))}
    </div>
  );
};

// Template 3: Tech/Gaming
export const TechTemplate = ({ shopData, theme, sections, editable, onUpdateSection }) => {
  const renderSection = (section) => {
    const sectionProps = {
      config: section.config,
      theme,
      shopItems: shopData?.items,
      editable,
      onUpdate: (newConfig) => onUpdateSection?.(section.id, newConfig)
    };

    switch (section.type) {
      case 'hero-banner':
        return <HeroBannerSection key={section.id} {...sectionProps} />;
      case 'featured-items':
        return <FeaturedItemsSection key={section.id} {...sectionProps} />;
      case 'services-grid':
        return <ServicesGridSection key={section.id} {...sectionProps} />;
      case 'featured-video':
        return <FeaturedVideoSection key={section.id} {...sectionProps} />;
      case 'photo-gallery':
        return <PhotoGallerySection key={section.id} {...sectionProps} />;
      case 'contact':
        return <ContactSection key={section.id} {...sectionProps} />;
      case 'text-block':
        return <TextBlockSection key={section.id} {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {sections?.map(section => renderSection(section))}
    </div>
  );
};

// Template 4: Minimalist Modern
export const MinimalistTemplate = ({ shopData, theme, sections, editable, onUpdateSection }) => {
  const renderSection = (section) => {
    const sectionProps = {
      config: section.config,
      theme,
      shopItems: shopData?.items,
      editable,
      onUpdate: (newConfig) => onUpdateSection?.(section.id, newConfig)
    };

    switch (section.type) {
      case 'hero-banner':
        return <HeroBannerSection key={section.id} {...sectionProps} />;
      case 'featured-items':
        return <FeaturedItemsSection key={section.id} {...sectionProps} />;
      case 'mission-statement':
        return <MissionStatementSection key={section.id} {...sectionProps} />;
      case 'photo-gallery':
        return <PhotoGallerySection key={section.id} {...sectionProps} />;
      case 'contact':
        return <ContactSection key={section.id} {...sectionProps} />;
      case 'text-block':
        return <TextBlockSection key={section.id} {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {sections?.map(section => renderSection(section))}
    </div>
  );
};

// Template 5: Local Market
export const LocalMarketTemplate = ({ shopData, theme, sections, editable, onUpdateSection }) => {
  const renderSection = (section) => {
    const sectionProps = {
      config: section.config,
      theme,
      shopItems: shopData?.items,
      editable,
      onUpdate: (newConfig) => onUpdateSection?.(section.id, newConfig)
    };

    switch (section.type) {
      case 'hero-banner':
        return <HeroBannerSection key={section.id} {...sectionProps} />;
      case 'featured-items':
        return <FeaturedItemsSection key={section.id} {...sectionProps} />;
      case 'calendar-events':
        return <CalendarEventsSection key={section.id} {...sectionProps} />;
      case 'services-grid':
        return <ServicesGridSection key={section.id} {...sectionProps} />;
      case 'contact':
        return <ContactSection key={section.id} {...sectionProps} />;
      case 'text-block':
        return <TextBlockSection key={section.id} {...sectionProps} />;
      default:
        return null;
    }
  };

  return (
    <div style={{ width: '100%' }}>
      {sections?.map(section => renderSection(section))}
    </div>
  );
};

// Export section types for dropdown
export const SECTION_TYPES = [
  { value: 'hero-banner', label: 'Hero Banner', icon: '🎯' },
  { value: 'featured-items', label: 'Featured Items', icon: '⭐' },
  { value: 'photo-gallery', label: 'Photo Gallery', icon: '📸' },
  { value: 'featured-video', label: 'Featured Video', icon: '🎥' },
  { value: 'mission-statement', label: 'Mission Statement', icon: '💡' },
  { value: 'calendar-events', label: 'Calendar/Events', icon: '📅' },
  { value: 'services-grid', label: 'Services Grid', icon: '🎁' },
  { value: 'contact', label: 'Contact Info', icon: '📧' },
  { value: 'text-block', label: 'Text Block', icon: '📝' }
];