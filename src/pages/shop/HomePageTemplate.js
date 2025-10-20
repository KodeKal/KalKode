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

// ==================== TEMPLATE-SPECIFIC FRAMES ====================

// Streetwear Template Frame - Subtle Urban
const StreetwearFrame = ({ children, theme }) => {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${theme?.colors?.background}00 0%, ${theme?.colors?.accent}03 20%, ${theme?.colors?.accent}05 50%, ${theme?.colors?.accent}03 80%, ${theme?.colors?.background}00 100%)`,
      borderRadius: '8px',
      position: 'relative',
      overflow: 'hidden',
      padding: '1px'
    }}>
      {/* Subtle border glow */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '8px',
        padding: '1px',
        background: `linear-gradient(180deg, ${theme?.colors?.accent}30, ${theme?.colors?.accent}10, ${theme?.colors?.accent}30)`,
        WebkitMask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
        WebkitMaskComposite: 'xor',
        maskComposite: 'exclude',
        pointerEvents: 'none'
      }} />
      
      <div style={{ 
        position: 'relative', 
        zIndex: 1,
        background: theme?.colors?.background,
        borderRadius: '7px'
      }}>
        {children}
      </div>
    </div>
  );
};

// Organization Template Frame - Clean Professional
const OrganizationFrame = ({ children, theme }) => {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${theme?.colors?.surface}08 0%, transparent 100%)`,
      borderRadius: '16px',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${theme?.colors?.accent}15`
    }}>
      {/* Subtle top accent */}
      <div style={{
        height: '2px',
        background: `linear-gradient(90deg, transparent, ${theme?.colors?.accent}60, transparent)`,
        position: 'absolute',
        top: 0,
        left: '20%',
        right: '20%',
        zIndex: 2
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

// Tech/Gaming Template Frame - Subtle Futuristic
const TechFrame = ({ children, theme }) => {
  return (
    <div style={{
      background: `radial-gradient(circle at 50% 0%, ${theme?.colors?.accent}08 0%, transparent 50%)`,
      borderRadius: '12px',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${theme?.colors?.accent}20`
    }}>
      {/* Minimal corner accents */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: '30px',
        height: '30px',
        borderTop: `2px solid ${theme?.colors?.accent}40`,
        borderLeft: `2px solid ${theme?.colors?.accent}40`,
        borderTopLeftRadius: '12px',
        pointerEvents: 'none'
      }} />
      <div style={{
        position: 'absolute',
        top: 0,
        right: 0,
        width: '30px',
        height: '30px',
        borderTop: `2px solid ${theme?.colors?.accent}40`,
        borderRight: `2px solid ${theme?.colors?.accent}40`,
        borderTopRightRadius: '12px',
        pointerEvents: 'none'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

// Minimalist Template Frame - Ultra Clean
const MinimalistFrame = ({ children, theme }) => {
  return (
    <div style={{
      background: 'transparent',
      borderRadius: '24px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      {/* Almost invisible border */}
      <div style={{
        position: 'absolute',
        inset: 0,
        borderRadius: '24px',
        border: `1px solid ${theme?.colors?.accent}10`,
        pointerEvents: 'none'
      }} />
      
      <div style={{ position: 'relative', zIndex: 1 }}>
        {children}
      </div>
    </div>
  );
};

// Local Market Template Frame - Warm Welcoming
const LocalMarketFrame = ({ children, theme }) => {
  return (
    <div style={{
      background: `linear-gradient(180deg, ${theme?.colors?.accent}05 0%, transparent 30%, transparent 70%, ${theme?.colors?.accent}05 100%)`,
      borderRadius: '16px',
      position: 'relative',
      overflow: 'hidden',
      border: `1px solid ${theme?.colors?.accent}20`
    }}>
      {/* Subtle top decoration */}
      <div style={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        height: '8px',
        background: `linear-gradient(90deg, transparent, ${theme?.colors?.accent}15, transparent)`,
        zIndex: 1
      }} />
      
      <div style={{ position: 'relative', zIndex: 1, paddingTop: '8px' }}>
        {children}
      </div>
    </div>
  );
};

// ==================== SUBTLE DIVIDERS ====================

const StreetwearDivider = ({ theme }) => (
  <div style={{
    height: '100px',
    background: `linear-gradient(180deg, 
      ${theme?.colors?.background}00 0%, 
      ${theme?.colors?.accent}03 30%,
      ${theme?.colors?.accent}05 50%,
      ${theme?.colors?.accent}03 70%,
      ${theme?.colors?.background}00 100%)`,
    position: 'relative',
    margin: '0'
  }}>
    {/* Subtle horizontal line */}
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '10%',
      right: '10%',
      height: '1px',
      background: `linear-gradient(90deg, transparent, ${theme?.colors?.accent}20, transparent)`,
      transform: 'translateY(-50%)'
    }} />
  </div>
);

const OrganizationDivider = ({ theme }) => (
  <div style={{
    height: '80px',
    background: `linear-gradient(180deg, 
      transparent 0%, 
      ${theme?.colors?.surface}05 50%, 
      transparent 100%)`,
    position: 'relative',
    margin: '0'
  }} />
);

const TechDivider = ({ theme }) => (
  <div style={{
    height: '120px',
    position: 'relative',
    margin: '0',
    background: `radial-gradient(ellipse at center, ${theme?.colors?.accent}05 0%, transparent 70%)`
  }}>
    {/* Subtle checkerboard pattern */}
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `
        linear-gradient(45deg, ${theme?.colors?.accent}02 25%, transparent 25%),
        linear-gradient(-45deg, ${theme?.colors?.accent}02 25%, transparent 25%),
        linear-gradient(45deg, transparent 75%, ${theme?.colors?.accent}02 75%),
        linear-gradient(-45deg, transparent 75%, ${theme?.colors?.accent}02 75%)
      `,
      backgroundSize: '20px 20px',
      backgroundPosition: '0 0, 0 10px, 10px -10px, -10px 0px',
      opacity: 0.3
    }} />
  </div>
);

const MinimalistDivider = ({ theme }) => (
  <div style={{
    height: '120px',
    background: 'transparent',
    position: 'relative',
    margin: '0'
  }}>
    {/* Ultra subtle gradient */}
    <div style={{
      position: 'absolute',
      top: '50%',
      left: '30%',
      right: '30%',
      height: '1px',
      background: `linear-gradient(90deg, transparent, ${theme?.colors?.accent}08, transparent)`,
      transform: 'translateY(-50%)'
    }} />
  </div>
);

const LocalMarketDivider = ({ theme }) => (
  <div style={{
    height: '100px',
    position: 'relative',
    margin: '0',
    background: `linear-gradient(180deg, transparent 0%, ${theme?.colors?.accent}04 50%, transparent 100%)`
  }}>
    {/* Subtle dots pattern */}
    <div style={{
      position: 'absolute',
      inset: 0,
      backgroundImage: `radial-gradient(circle, ${theme?.colors?.accent}08 1px, transparent 1px)`,
      backgroundSize: '30px 30px',
      opacity: 0.4
    }} />
  </div>
);

// ==================== SECTION WRAPPER ====================
const SectionWrapper = ({ children, theme, noPadding = false }) => {
  return (
    <div style={{
      position: 'relative',
      padding: noPadding ? '0' : 'clamp(2rem, 4vw, 4rem) clamp(1rem, 2vw, 2rem)',
      background: 'transparent'
    }}>
      {children}
    </div>
  );
};


// ==================== HERO BANNER SECTION ====================
export const HeroBannerSection = ({ config, theme, editable, onUpdate }) => {
  const [editingField, setEditingField] = useState(null);

  const handleUpdate = (field, value) => {
    if (editable && onUpdate) {
      onUpdate({ ...config, [field]: value });
    }
  };

  return (
    <SectionWrapper theme={theme} noPadding>
      <div style={{
        minHeight: config?.height || 'clamp(35vh, 45vh, 60vh)',
        background: config?.backgroundImage ? 
          `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url(${config.backgroundImage})` :
          `linear-gradient(135deg, ${theme?.colors?.accent}15 0%, ${theme?.colors?.background}50 100%)`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        cursor: editable ? 'pointer' : 'default',
        padding: 'clamp(1.5rem, 3vw, 3rem)'
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
              top: 'clamp(0.5rem, 1vw, 0.75rem)',
              left: 'clamp(0.5rem, 1vw, 0.75rem)',
              background: 'rgba(0,0,0,0.7)',
              color: 'white',
              padding: 'clamp(0.4rem, 0.8vw, 0.5rem) clamp(0.8rem, 1.5vw, 1rem)',
              borderRadius: '8px',
              fontSize: 'clamp(0.75rem, 1.3vw, 0.85rem)',
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
          padding: 'clamp(1rem, 2vw, 2rem)',
          maxWidth: '900px',
          width: '100%',
          background: 'rgba(0,0,0,0.3)',
          borderRadius: '16px',
          backdropFilter: 'blur(10px)'
        }}>
          {editable ? (
            <>
              <input
                type="text"
                value={config?.headline || ''}
                onChange={(e) => handleUpdate('headline', e.target.value)}
                placeholder="Enter headline"
                style={{
                  fontSize: 'clamp(1.5rem, 5vw, 4rem)',
                  fontWeight: '900',
                  margin: '0 0 clamp(0.75rem, 1.5vw, 1rem) 0',
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
                  fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                  opacity: 0.9,
                  background: 'transparent',
                  border: 'none',
                  color: theme?.colors?.text,
                  textAlign: 'center',
                  width: '100%',
                  outline: 'none',
                  resize: 'none',
                  minHeight: 'clamp(50px, 10vw, 80px)'
                }}
              />
            </>
          ) : (
            <>
              <h1 style={{
                fontSize: 'clamp(1.5rem, 5vw, 4rem)',
                fontWeight: '900',
                margin: '0 0 clamp(0.75rem, 1.5vw, 1rem) 0',
                lineHeight: 1.1,
                textShadow: '2px 2px 4px rgba(0,0,0,0.5)',
                color: theme?.colors?.text
              }}>
                {config?.headline || 'Welcome'}
              </h1>
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                opacity: 0.9,
                textShadow: '1px 1px 2px rgba(0,0,0,0.5)',
                color: theme?.colors?.text
              }}>
                {config?.subtitle || 'Discover amazing products'}
              </p>
            </>
          )}
        </div>
      </div>
    </SectionWrapper>
  );
};

// ==================== FEATURED ITEMS SECTION ====================
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
    <SectionWrapper theme={theme}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 'clamp(1.5rem, 3vw, 2.5rem)',
        padding: '0 clamp(0.5rem, 1vw, 1rem)'
      }}>
        {editable ? (
          <input
            type="text"
            value={config?.title || ''}
            onChange={(e) => onUpdate({ ...config, title: e.target.value })}
            placeholder="Section title"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
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
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '900',
            margin: 0,
            color: theme?.colors?.text
          }}>
            {config?.title || 'Featured Items'}
          </h2>
        )}
        
        {editable && (
          <select
            value={config?.itemCount || 4}
            onChange={(e) => onUpdate({ ...config, itemCount: parseInt(e.target.value) })}
            style={{
              padding: 'clamp(0.5rem, 1vw, 0.75rem)',
              borderRadius: 'clamp(6px, 1vw, 8px)',
              background: theme?.colors?.surface,
              color: theme?.colors?.text,
              border: `1px solid ${theme?.colors?.accent}40`,
              fontSize: 'clamp(0.8rem, 1.3vw, 0.95rem)'
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
        gridTemplateColumns: 'repeat(auto-fill, minmax(clamp(160px, 22vw, 300px), 1fr))',
        gap: 'clamp(1rem, 2vw, 2rem)',
        padding: '0 clamp(0.5rem, 1vw, 1rem)'
      }}>
        {items.length > 0 ? (
          items.map((item) => {
            const itemImage = getItemImage(item);
            
            return (
              <div key={item.id} style={{
                background: `${theme?.colors?.surface}90`,
                borderRadius: 'clamp(10px, 1.5vw, 16px)',
                overflow: 'hidden',
                border: `1px solid ${theme?.colors?.accent}30`,
                transition: 'all 0.3s ease',
                boxShadow: `0 4px 12px ${theme?.colors?.accent}10`
              }}>
                <div style={{
                  height: 'clamp(140px, 28vw, 280px)',
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
                      <Package size={48} color={theme?.colors?.accent} style={{ opacity: 0.5 }} />
                    </div>
                  )}
                  
                  {item?.quantity !== undefined && (
                    <div style={{
                      position: 'absolute',
                      top: 'clamp(0.5rem, 1vw, 0.75rem)',
                      right: 'clamp(0.5rem, 1vw, 0.75rem)',
                      background: parseInt(item.quantity) > 0 ? 
                        'rgba(76, 175, 80, 0.9)' : 'rgba(244, 67, 54, 0.9)',
                      color: 'white',
                      padding: 'clamp(0.2rem, 0.5vw, 0.3rem) clamp(0.5rem, 1vw, 0.75rem)',
                      borderRadius: 'clamp(10px, 1.5vw, 16px)',
                      fontSize: 'clamp(0.7rem, 1.1vw, 0.8rem)',
                      fontWeight: '700'
                    }}>
                      {parseInt(item.quantity) > 0 ? `${item.quantity} LEFT` : 'SOLD OUT'}
                    </div>
                  )}
                </div>
                <div style={{ padding: 'clamp(1rem, 2vw, 1.5rem)' }}>
                  <h3 style={{
                    fontSize: 'clamp(0.9rem, 1.6vw, 1.2rem)',
                    fontWeight: '700',
                    marginBottom: 'clamp(0.3rem, 0.6vw, 0.5rem)',
                    color: theme?.colors?.text
                  }}>
                    {item?.name || 'Product Name'}
                  </h3>
                  <div style={{
                    fontSize: 'clamp(1.1rem, 2.2vw, 1.6rem)',
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
            padding: 'clamp(3rem, 5vw, 5rem)',
            color: theme?.colors?.text,
            opacity: 0.6
          }}>
            <Package size={64} color={theme?.colors?.accent} style={{ margin: '0 auto 1rem', opacity: 0.5 }} />
            <h3>No Items Yet</h3>
          </div>
        )}
      </div>
    </SectionWrapper>
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

// ==================== PHOTO GALLERY SECTION WITH CAROUSEL ====================
export const PhotoGallerySection = ({ config, theme, editable, onUpdate }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const images = config?.images || [];

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
    if (currentSlide >= newImages.length) {
      setCurrentSlide(Math.max(0, newImages.length - 1));
    }
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % images.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + images.length) % images.length);
  };

  return (
    <SectionWrapper theme={theme}>
      <div style={{
        marginBottom: 'clamp(1.5rem, 3vw, 2rem)'
      }}>
        {editable ? (
          <input
            type="text"
            value={config?.title || ''}
            onChange={(e) => onUpdate({ ...config, title: e.target.value })}
            placeholder="Gallery title"
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
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
            fontSize: 'clamp(1.5rem, 4vw, 2.5rem)',
            fontWeight: '700',
            marginBottom: 'clamp(1rem, 2vw, 2rem)',
            textAlign: 'center',
            color: theme?.colors?.text
          }}>
            {config?.title || 'Gallery'}
          </h2>
        )}
        
        {/* Carousel View */}
        <div style={{
          position: 'relative',
          height: 'clamp(300px, 50vw, 600px)',
          borderRadius: 'clamp(12px, 2vw, 20px)',
          overflow: 'hidden',
          background: `${theme?.colors?.surface}50`,
          marginBottom: 'clamp(1rem, 2vw, 2rem)'
        }}>
          {images.length > 0 ? (
            <>
              {/* Main carousel image */}
              <div style={{
                position: 'relative',
                width: '100%',
                height: '100%'
              }}>
                <img
                  src={images[currentSlide]}
                  alt={`Gallery ${currentSlide + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'contain',
                    background: `${theme?.colors?.background}90`
                  }}
                />
                
                {/* Navigation arrows */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevSlide}
                      style={{
                        position: 'absolute',
                        left: 'clamp(0.5rem, 1vw, 1rem)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.6)',
                        border: `1px solid ${theme?.colors?.accent}60`,
                        borderRadius: '50%',
                        width: 'clamp(36px, 6vw, 48px)',
                        height: 'clamp(36px, 6vw, 48px)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        zIndex: 2
                      }}
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      onClick={nextSlide}
                      style={{
                        position: 'absolute',
                        right: 'clamp(0.5rem, 1vw, 1rem)',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        background: 'rgba(0,0,0,0.6)',
                        border: `1px solid ${theme?.colors?.accent}60`,
                        borderRadius: '50%',
                        width: 'clamp(36px, 6vw, 48px)',
                        height: 'clamp(36px, 6vw, 48px)',
                        color: 'white',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.3s ease',
                        zIndex: 2
                      }}
                    >
                      <ChevronRight size={24} />
                    </button>
                  </>
                )}
                
                {/* Slide indicators */}
                {images.length > 1 && (
                  <div style={{
                    position: 'absolute',
                    bottom: 'clamp(1rem, 2vw, 1.5rem)',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    display: 'flex',
                    gap: 'clamp(0.4rem, 0.8vw, 0.5rem)',
                    zIndex: 2
                  }}>
                    {images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentSlide(index)}
                        style={{
                          width: 'clamp(8px, 1.5vw, 12px)',
                          height: 'clamp(8px, 1.5vw, 12px)',
                          borderRadius: '50%',
                          border: 'none',
                          background: currentSlide === index ? 
                            theme?.colors?.accent : 
                            `${theme?.colors?.text}40`,
                          cursor: 'pointer',
                          transition: 'all 0.3s ease',
                          boxShadow: currentSlide === index ? 
                            `0 0 10px ${theme?.colors?.accent}` : 
                            'none'
                        }}
                      />
                    ))}
                  </div>
                )}
                
                {/* Edit controls */}
                {editable && (
                  <button
                    onClick={() => handleRemoveImage(currentSlide)}
                    style={{
                      position: 'absolute',
                      top: 'clamp(0.5rem, 1vw, 1rem)',
                      right: 'clamp(0.5rem, 1vw, 1rem)',
                      background: 'rgba(255, 0, 0, 0.7)',
                      color: 'white',
                      border: 'none',
                      borderRadius: '50%',
                      width: 'clamp(32px, 5vw, 40px)',
                      height: 'clamp(32px, 5vw, 40px)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      zIndex: 3,
                      fontSize: 'clamp(1.2rem, 2vw, 1.5rem)'
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            </>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: '100%',
              color: theme?.colors?.text,
              opacity: 0.5,
              fontSize: 'clamp(0.9rem, 1.6vw, 1.1rem)'
            }}>
              No images yet
            </div>
          )}
        </div>
        
        {/* Thumbnail strip */}
        {images.length > 1 && (
          <div style={{
            display: 'flex',
            gap: 'clamp(0.5rem, 1vw, 1rem)',
            overflowX: 'auto',
            padding: 'clamp(0.5rem, 1vw, 1rem)',
            WebkitOverflowScrolling: 'touch'
          }}>
            {images.map((img, index) => (
              <div
                key={index}
                onClick={() => setCurrentSlide(index)}
                style={{
                  minWidth: 'clamp(60px, 12vw, 100px)',
                  height: 'clamp(60px, 12vw, 100px)',
                  borderRadius: 'clamp(6px, 1vw, 8px)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  border: currentSlide === index ? 
                    `3px solid ${theme?.colors?.accent}` : 
                    `2px solid ${theme?.colors?.surface}`,
                  opacity: currentSlide === index ? 1 : 0.6,
                  transition: 'all 0.3s ease'
                }}
              >
                <img
                  src={img}
                  alt={`Thumbnail ${index + 1}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover'
                  }}
                />
              </div>
            ))}
          </div>
        )}
        
        {/* Add image button for editing */}
        {editable && (
          <label style={{
            display: 'block',
            textAlign: 'center',
            padding: 'clamp(1rem, 2vw, 1.5rem)',
            border: `2px dashed ${theme?.colors?.accent}40`,
            borderRadius: 'clamp(8px, 1.5vw, 12px)',
            cursor: 'pointer',
            background: `${theme?.colors?.surface}30`,
            marginTop: 'clamp(1rem, 2vw, 1.5rem)',
            transition: 'all 0.3s ease'
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
            <div style={{ fontSize: 'clamp(1.5rem, 3vw, 2rem)', marginBottom: '0.5rem' }}>+</div>
            <div style={{ fontSize: 'clamp(0.85rem, 1.5vw, 1rem)' }}>Add Images</div>
          </label>
        )}
      </div>
    </SectionWrapper>
  );
};

// ==================== MISSION STATEMENT (keeping existing) ====================
export const MissionStatementSection = ({ config, theme, editable, onUpdate }) => {
  return (
    <SectionWrapper theme={theme}>
      <div style={{
        background: `${theme?.colors?.surface}40`,
        borderRadius: 'clamp(12px, 2vw, 20px)',
        padding: 'clamp(2rem, 4vw, 4rem) clamp(1.5rem, 3vw, 3rem)',
        textAlign: 'center',
        border: `1px solid ${theme?.colors?.accent}20`,
        backdropFilter: 'blur(5px)'
      }}>
        {editable ? (
          <>
            <input
              type="text"
              value={config?.title || ''}
              onChange={(e) => onUpdate({ ...config, title: e.target.value })}
              placeholder="Mission title"
              style={{
                fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
                fontWeight: '700',
                marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
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
                fontSize: 'clamp(1rem, 2vw, 1.3rem)',
                lineHeight: 1.6,
                maxWidth: '800px',
                margin: '0 auto',
                background: 'transparent',
                border: `1px solid ${theme?.colors?.accent}40`,
                borderRadius: 'clamp(8px, 1.5vw, 12px)',
                color: theme?.colors?.text,
                outline: 'none',
                padding: 'clamp(1rem, 2vw, 1.5rem)',
                width: '100%',
                minHeight: 'clamp(120px, 22vw, 180px)',
                resize: 'vertical'
              }}
            />
          </>
        ) : (
          <>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 3.5vw, 2.5rem)',
              color: theme?.colors?.accent,
              marginBottom: 'clamp(1.5rem, 3vw, 2rem)',
              fontWeight: '700'
            }}>
              {config?.title || 'Our Mission'}
            </h2>
            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.3rem)',
              lineHeight: 1.6,
              maxWidth: '800px',
              margin: '0 auto',
              opacity: 0.9,
              color: theme?.colors?.text
            }}>
              {config?.content || 'We are dedicated to providing exceptional products and services.'}
            </p>
          </>
        )}
      </div>
    </SectionWrapper>
  );
};

// ==================== TEMPLATE COMPONENTS ====================
export const StreetwearTemplate = ({ shopData, theme, sections, editable, onUpdateSection }) => {
  const renderSection = (section) => {
    const sectionProps = {
      config: section.config,
      theme,
      shopItems: shopData?.items,
      editable,
      onUpdate: (newConfig) => onUpdateSection?.(section.id, newConfig)
    };

    let SectionComponent;
    switch (section.type) {
      case 'hero-banner': SectionComponent = HeroBannerSection; break;
      case 'featured-items': SectionComponent = FeaturedItemsSection; break;
      case 'photo-gallery': SectionComponent = PhotoGallerySection; break;
      case 'mission-statement': SectionComponent = MissionStatementSection; break;
      default: return null;
    }

    return SectionComponent ? <SectionComponent key={section.id} {...sectionProps} /> : null;
  };

  return (
    <StreetwearFrame theme={theme}>
      {sections?.map((section, index) => (
        <React.Fragment key={section.id}>
          {renderSection(section)}
          {index < sections.length - 1 && <StreetwearDivider theme={theme} />}
        </React.Fragment>
      ))}
    </StreetwearFrame>
  );
};

export const OrganizationTemplate = ({ shopData, theme, sections, editable, onUpdateSection }) => {
  const renderSection = (section) => {
    const sectionProps = {
      config: section.config,
      theme,
      shopItems: shopData?.items,
      editable,
      onUpdate: (newConfig) => onUpdateSection?.(section.id, newConfig)
    };

    let SectionComponent;
    switch (section.type) {
      case 'hero-banner': SectionComponent = HeroBannerSection; break;
      case 'featured-items': SectionComponent = FeaturedItemsSection; break;
      case 'photo-gallery': SectionComponent = PhotoGallerySection; break;
      case 'mission-statement': SectionComponent = MissionStatementSection; break;
      default: return null;
    }

    return SectionComponent ? <SectionComponent key={section.id} {...sectionProps} /> : null;
  };

  return (
    <OrganizationFrame theme={theme}>
      {sections?.map((section, index) => (
        <React.Fragment key={section.id}>
          {renderSection(section)}
          {index < sections.length - 1 && <OrganizationDivider theme={theme} />}
        </React.Fragment>
      ))}
    </OrganizationFrame>
  );
};

export const TechTemplate = ({ shopData, theme, sections, editable, onUpdateSection }) => {
  const renderSection = (section) => {
    const sectionProps = {
      config: section.config,
      theme,
      shopItems: shopData?.items,
      editable,
      onUpdate: (newConfig) => onUpdateSection?.(section.id, newConfig)
    };

    let SectionComponent;
    switch (section.type) {
      case 'hero-banner': SectionComponent = HeroBannerSection; break;
      case 'featured-items': SectionComponent = FeaturedItemsSection; break;
      case 'photo-gallery': SectionComponent = PhotoGallerySection; break;
      case 'mission-statement': SectionComponent = MissionStatementSection; break;
      default: return null;
    }

    return SectionComponent ? <SectionComponent key={section.id} {...sectionProps} /> : null;
  };

  return (
    <TechFrame theme={theme}>
      {sections?.map((section, index) => (
        <React.Fragment key={section.id}>
          {renderSection(section)}
          {index < sections.length - 1 && <TechDivider theme={theme} />}
        </React.Fragment>
      ))}
    </TechFrame>
  );
};

export const MinimalistTemplate = ({ shopData, theme, sections, editable, onUpdateSection }) => {
  const renderSection = (section) => {
    const sectionProps = {
      config: section.config,
      theme,
      shopItems: shopData?.items,
      editable,
      onUpdate: (newConfig) => onUpdateSection?.(section.id, newConfig)
    };

    let SectionComponent;
    switch (section.type) {
      case 'hero-banner': SectionComponent = HeroBannerSection; break;
      case 'featured-items': SectionComponent = FeaturedItemsSection; break;
      case 'photo-gallery': SectionComponent = PhotoGallerySection; break;
      case 'mission-statement': SectionComponent = MissionStatementSection; break;
      default: return null;
    }

    return SectionComponent ? <SectionComponent key={section.id} {...sectionProps} /> : null;
  };

  return (
    <MinimalistFrame theme={theme}>
      {sections?.map((section, index) => (
        <React.Fragment key={section.id}>
          {renderSection(section)}
          {index < sections.length - 1 && <MinimalistDivider theme={theme} />}
        </React.Fragment>
      ))}
    </MinimalistFrame>
  );
};

export const LocalMarketTemplate = ({ shopData, theme, sections, editable, onUpdateSection }) => {
  const renderSection = (section) => {
    const sectionProps = {
      config: section.config,
      theme,
      shopItems: shopData?.items,
      editable,
      onUpdate: (newConfig) => onUpdateSection?.(section.id, newConfig)
    };

    let SectionComponent;
    switch (section.type) {
      case 'hero-banner': SectionComponent = HeroBannerSection; break;
      case 'featured-items': SectionComponent = FeaturedItemsSection; break;
      case 'photo-gallery': SectionComponent = PhotoGallerySection; break;
      case 'mission-statement': SectionComponent = MissionStatementSection; break;
      default: return null;
    }

    return SectionComponent ? <SectionComponent key={section.id} {...sectionProps} /> : null;
  };

  return (
    <LocalMarketFrame theme={theme}>
      {sections?.map((section, index) => (
        <React.Fragment key={section.id}>
          {renderSection(section)}
          {index < sections.length - 1 && <LocalMarketDivider theme={theme} />}
        </React.Fragment>
      ))}
    </LocalMarketFrame>
  );
};


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