// src/pages/shop/HomePageEditor.js - User Editable Home Page with Widget System

import React, { useState, useEffect, useRef } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import ValidatedEditableText from '../../components/common/ValidatedEditableText';
import EditableImage from './components/EditableComponents/EditableImage';
import { 
  Image, 
  Package, 
  BarChart3, 
  Star, 
  Calendar, 
  FileText, 
  Grid, 
  Play, 
  Mail, 
  MapPin, 
  Share2, 
  HelpCircle,
  Plus,
  Settings,
  Trash2,
  Eye,
  EyeOff,
  Move,
  ChevronUp,
  ChevronDown,
  Layout,
  Type,
  Users,
  Sparkles,
  ShoppingBag,
  Clock,
  Award,
  Instagram,
  X,
  Save,
  Layers
} from 'lucide-react';
import {
  NewsletterWidget,
  CountdownWidget,
  TestimonialsWidget,
  GalleryWidget,
  SocialFeedWidget,
  VideoWidget,
  FAQWidget,
  TeamWidget
} from './HomePageWidgets';
import { auth, db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

// Widget Definitions with real website design patterns
const WIDGET_LIBRARY = {
  'hero-banner': {
    name: 'Hero Banner',
    icon: Image,
    description: 'Full-width banner like Apple or Tesla',
    defaultConfig: {
      style: 'apple', // apple, tesla, shopify, airbnb
      height: 'large', // small, medium, large, fullscreen
      overlay: true,
      parallax: false
    }
  },
  'product-carousel': {
    name: 'Featured Products',
    icon: Package,
    description: 'Product slider like Amazon or Nike',
    defaultConfig: {
      style: 'amazon', // amazon, nike, etsy, supreme
      itemsToShow: 4,
      autoPlay: true,
      showArrows: true,
      showDots: true
    }
  },
  'stats-dashboard': {
    name: 'Stats & Metrics',
    icon: BarChart3,
    description: 'Numbers section like Stripe or Shopify',
    defaultConfig: {
      style: 'stripe', // stripe, shopify, square, minimal
      animate: true,
      layout: 'grid' // grid, row, stacked
    }
  },
  'testimonials': {
    name: 'Customer Reviews',
    icon: Star,
    description: 'Social proof like Airbnb or Trustpilot',
    defaultConfig: {
      style: 'airbnb', // airbnb, trustpilot, google, cards
      layout: 'carousel', // carousel, grid, masonry
      showRating: true
    }
  },
  'gallery': {
    name: 'Photo Gallery',
    icon: Grid,
    description: 'Visual grid like Instagram or Pinterest',
    defaultConfig: {
      style: 'instagram', // instagram, pinterest, flickr, masonry
      columns: 3,
      spacing: 'normal', // tight, normal, wide
      lightbox: true
    }
  },
  'announcement-bar': {
    name: 'Announcement Bar',
    icon: Sparkles,
    description: 'Top bar like Supreme or Fashion Nova',
    defaultConfig: {
      style: 'supreme', // supreme, minimal, gradient, neon
      scrolling: false,
      dismissible: true,
      position: 'top' // top, bottom
    }
  },
  'video-section': {
    name: 'Video Feature',
    icon: Play,
    description: 'Video section like Vimeo or YouTube',
    defaultConfig: {
      style: 'vimeo', // vimeo, youtube, background, modal
      autoplay: false,
      controls: true,
      aspectRatio: '16:9'
    }
  },
  'newsletter': {
    name: 'Newsletter Signup',
    icon: Mail,
    description: 'Email capture like Medium or Substack',
    defaultConfig: {
      style: 'medium', // medium, substack, minimal, bold
      incentive: 'Get 10% off your first order',
      fields: ['email'] // email, name, preferences
    }
  },
  'countdown-timer': {
    name: 'Countdown Timer',
    icon: Clock,
    description: 'Urgency timer like Supreme drops',
    defaultConfig: {
      style: 'supreme', // supreme, minimal, digital, flip
      endDate: null,
      message: 'Next Drop In:'
    }
  },
  'social-feed': {
    name: 'Social Media Feed',
    icon: Instagram,
    description: 'Instagram feed like Fashion brands',
    defaultConfig: {
      style: 'grid', // grid, carousel, masonry
      platform: 'instagram', // instagram, twitter, tiktok
      posts: 6
    }
  },
  'faq-section': {
    name: 'FAQ',
    icon: HelpCircle,
    description: 'Q&A like Notion or Stripe',
    defaultConfig: {
      style: 'notion', // notion, stripe, accordion, cards
      searchable: false,
      categories: false
    }
  },
  'team-section': {
    name: 'Team/About',
    icon: Users,
    description: 'Team display like Slack or Linear',
    defaultConfig: {
      style: 'slack', // slack, linear, cards, minimal
      showBio: true,
      showSocial: true
    }
  }
};

// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  position: relative;
`;

const EditorHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${props => `${props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 0.9)'}F5`};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  padding: 1rem;
  
  @media (min-width: 768px) {
    padding: 1.5rem 2rem;
  }
`;

const EditorControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 1rem;
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const IconButton = styled.button`
  background: ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 
    'transparent'};
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  color: ${props => props.active ? 
    'white' : 
    props.theme?.colors?.accent || '#800000'};
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.active ? 
      props.theme?.colors?.accent || '#800000' : 
      `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
  }
  
  svg {
    width: 18px;
    height: 18px;
  }
`;

const SaveButton = styled.button`
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  border: none;
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => `${props.theme?.colors?.accent}60` || 'rgba(128, 0, 0, 0.4)'};
  }
`;

const EditorContent = styled.div`
  display: grid;
  grid-template-columns: ${props => props.showLibrary ? '300px 1fr' : '1fr'};
  gap: 2rem;
  padding: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 1rem;
  }
`;

const WidgetLibrary = styled.div`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: 12px;
  padding: 1.5rem;
  height: fit-content;
  position: sticky;
  top: 100px;
  
  @media (max-width: 768px) {
    position: relative;
    top: 0;
  }
`;

const LibraryTitle = styled.h3`
  font-size: 1.1rem;
  margin-bottom: 1rem;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const WidgetItem = styled.div`
  background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  border-radius: 8px;
  padding: 1rem;
  margin-bottom: 0.75rem;
  cursor: grab;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    transform: translateX(4px);
  }
  
  &:active {
    cursor: grabbing;
  }
`;

const WidgetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
  
  .icon {
    color: ${props => props.theme?.colors?.accent || '#800000'};
  }
  
  .name {
    font-weight: 600;
    font-size: 0.95rem;
  }
`;

const WidgetDescription = styled.p`
  font-size: 0.8rem;
  color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
  margin: 0;
`;

const PreviewArea = styled.div`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}30`};
  border-radius: 12px;
  overflow: hidden;
  min-height: 600px;
`;

const PreviewHeader = styled.div`
  background: ${props => `${props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 0.9)'}F5`};
  backdrop-filter: blur(10px);
  padding: 1rem 1.5rem;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const WidgetContainer = styled.div`
  padding: ${props => props.noPadding ? '0' : '2rem'};
  position: relative;
  opacity: ${props => props.isHidden ? 0.5 : 1};
  transition: all 0.3s ease;
  
  ${props => props.isDragging && `
    background: ${props.theme?.colors?.accent}10;
    border: 2px dashed ${props.theme?.colors?.accent};
    border-radius: 8px;
  `}
`;

const WidgetControls = styled.div`
  position: absolute;
  top: 1rem;
  right: 1rem;
  display: flex;
  gap: 0.5rem;
  background: ${props => `${props.theme?.colors?.background || '#000000'}E5`};
  backdrop-filter: blur(10px);
  padding: 0.5rem;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
  
  ${WidgetContainer}:hover & {
    opacity: 1;
  }
`;

const WidgetButton = styled.button`
  background: transparent;
  border: none;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  padding: 0.25rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  padding: 3rem;
  text-align: center;
  
  svg {
    width: 48px;
    height: 48px;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin-bottom: 1rem;
    opacity: 0.5;
  }
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
  }
  
  p {
    color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
    font-size: 0.9rem;
  }
`;

const AnnouncementBar = styled.div`
  background: ${props => props.style === 'supreme' ? 
    props.theme?.colors?.accent || '#FF0000' : 
    props.theme?.colors?.accentGradient || 'linear-gradient(90deg, #FF006E 0%, #8338EC 50%, #3A86FF 100%)'};
  color: white;
  padding: 0.75rem;
  text-align: center;
  font-weight: 600;
  position: ${props => props.position === 'fixed' ? 'fixed' : 'relative'};
  top: ${props => props.position === 'fixed' ? '0' : 'auto'};
  width: 100%;
  z-index: 1000;
`;

// Widget Renderer Components
const HeroBannerWidget = ({ config, theme, editable, onUpdate }) => {
  const styles = {
    apple: {
      height: config.height === 'fullscreen' ? '100vh' : config.height === 'large' ? '70vh' : '50vh',
      background: `linear-gradient(135deg, ${theme?.colors?.accent}20 0%, ${theme?.colors?.background} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative'
    },
    tesla: {
      height: config.height === 'fullscreen' ? '100vh' : '60vh',
      background: '#000',
      position: 'relative',
      overflow: 'hidden'
    },
    shopify: {
      height: '500px',
      background: theme?.colors?.accentGradient || 'linear-gradient(45deg, #800000, #4A0404)',
      display: 'flex',
      alignItems: 'center',
      padding: '0 2rem'
    },
    airbnb: {
      height: '600px',
      borderRadius: '24px',
      margin: '2rem',
      overflow: 'hidden',
      position: 'relative'
    }
  };

  return (
    <div style={styles[config.style]}>
      {editable ? (
        <ValidatedEditableText
          value={config.headline || "Welcome to Our Shop"}
          onChange={(value) => onUpdate({ ...config, headline: value })}
          placeholder="Enter headline"
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            textAlign: 'center',
            color: theme?.colors?.text
          }}
        />
      ) : (
        <h1 style={{ fontSize: '3rem', fontWeight: 'bold' }}>
          {config.headline || "Welcome to Our Shop"}
        </h1>
      )}
    </div>
  );
};

const ProductCarouselWidget = ({ config, theme, items = [], editable }) => {
  const styles = {
    amazon: {
      padding: '2rem 0',
      background: 'transparent'
    },
    nike: {
      padding: '3rem 0',
      background: `${theme?.colors?.background}F5`
    },
    etsy: {
      padding: '2rem',
      background: `${theme?.colors?.surface}50`
    },
    supreme: {
      padding: '1rem 0',
      borderTop: `3px solid ${theme?.colors?.accent}`,
      borderBottom: `3px solid ${theme?.colors?.accent}`
    }
  };

  return (
    <div style={styles[config.style]}>
      <h2 style={{ marginBottom: '1.5rem', color: theme?.colors?.accent }}>
        Featured Products
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: `repeat(auto-fill, minmax(200px, 1fr))`,
        gap: '1rem'
      }}>
        {items.slice(0, config.itemsToShow).map((item, index) => (
          <div key={index} style={{
            background: `${theme?.colors?.surface}80`,
            borderRadius: '8px',
            padding: '1rem',
            border: `1px solid ${theme?.colors?.accent}30`
          }}>
            <div style={{ height: '150px', background: `${theme?.colors?.background}50`, borderRadius: '4px', marginBottom: '1rem' }} />
            <h3 style={{ fontSize: '0.95rem', marginBottom: '0.5rem' }}>{item.name || `Product ${index + 1}`}</h3>
            <p style={{ color: theme?.colors?.accent, fontWeight: 'bold' }}>${item.price || '0.00'}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

const StatsWidget = ({ config, theme, stats = {} }) => {
  const defaultStats = {
    totalSales: stats.totalSales || 0,
    customers: stats.customers || 0,
    rating: stats.rating || 4.5,
    products: stats.products || 0
  };

  const styles = {
    stripe: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
      gap: '2rem',
      padding: '3rem',
      background: `linear-gradient(135deg, ${theme?.colors?.accent}10 0%, transparent 100%)`
    },
    shopify: {
      display: 'flex',
      justifyContent: 'space-around',
      padding: '2rem',
      background: `${theme?.colors?.surface}50`,
      borderRadius: '12px'
    },
    minimal: {
      display: 'flex',
      gap: '3rem',
      justifyContent: 'center',
      padding: '2rem'
    }
  };

  return (
    <div style={styles[config.style]}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: theme?.colors?.accent }}>
          {defaultStats.totalSales}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Total Sales</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: theme?.colors?.accent }}>
          {defaultStats.customers}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Happy Customers</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: theme?.colors?.accent }}>
          {defaultStats.rating}★
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Average Rating</div>
      </div>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: theme?.colors?.accent }}>
          {defaultStats.products}
        </div>
        <div style={{ fontSize: '0.9rem', opacity: 0.7 }}>Products</div>
      </div>
    </div>
  );
};

const cleanDataForFirestore = (data) => {
  if (!data) return data;
  
  if (Array.isArray(data)) {
    return data.map(item => cleanDataForFirestore(item));
  }
  
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleanedData = {};
    for (const [key, value] of Object.entries(data)) {
      if (typeof value === 'function' || value instanceof File || value === undefined) {
        continue;
      }
      cleanedData[key] = cleanDataForFirestore(value);
    }
    return cleanedData;
  }
  
  return data;
};

// Main Component
const HomePageEditor = ({ shopData, onSave, theme }) => {
  const [widgets, setWidgets] = useState(shopData?.homeWidgets || []);
  const [showLibrary, setShowLibrary] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState(null);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);

  useEffect(() => {
      const loadSavedWidgets = async () => {
        try {
          if (auth.currentUser && shopData?.homeWidgets) {
            // Load from shop data if available
            setWidgets(shopData.homeWidgets);
          } else {
            // Try loading from local storage
            const savedWidgets = localStorage.getItem('homePageWidgets');
            if (savedWidgets) {
              const parsed = JSON.parse(savedWidgets);
              setWidgets(parsed.widgets || []);
            }
          }
        } catch (error) {
          console.error('Error loading saved widgets:', error);
        }
      };

      loadSavedWidgets();
    }, [shopData]);

    const WidgetSettingsModal = ({ widget, isOpen, onClose, onUpdate, theme }) => {
      const [config, setConfig] = useState(widget?.config || {});   

      if (!isOpen || !widget) return null;  

      const handleSave = () => {
        onUpdate(widget.id, { config });
        onClose();
      };    

      const widgetType = WIDGET_LIBRARY[widget.type];   

      return (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: theme?.colors?.background || '#000',
            border: `1px solid ${theme?.colors?.accent}`,
            borderRadius: '12px',
            padding: '2rem',
            maxWidth: '500px',
            width: '90%',
            maxHeight: '80vh',
            overflow: 'auto'
          }}>
            <h3 style={{ marginBottom: '1.5rem' }}>
              {widgetType?.name} Settings
            </h3>   

            {/* Dynamic settings based on widget type */}
            {widget.type === 'hero-banner' && (
              <>
                <label>
                  Style:
                  <select 
                    value={config.style} 
                    onChange={(e) => setConfig({...config, style: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                  >
                    <option value="apple">Apple Style</option>
                    <option value="tesla">Tesla Style</option>
                    <option value="shopify">Shopify Style</option>
                    <option value="airbnb">Airbnb Style</option>
                  </select>
                </label>    

                <label>
                  Height:
                  <select 
                    value={config.height} 
                    onChange={(e) => setConfig({...config, height: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                    <option value="fullscreen">Fullscreen</option>
                  </select>
                </label>    

                <label>
                  Headline:
                  <input 
                    type="text"
                    value={config.headline || ''}
                    onChange={(e) => setConfig({...config, headline: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                  />
                </label>    

                <label>
                  Subtitle:
                  <textarea 
                    value={config.subtitle || ''}
                    onChange={(e) => setConfig({...config, subtitle: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                  />
                </label>
              </>
            )}  

            {widget.type === 'countdown-timer' && (
              <>
                <label>
                  End Date:
                  <input 
                    type="datetime-local"
                    value={config.endDate || ''}
                    onChange={(e) => setConfig({...config, endDate: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                  />
                </label>    

                <label>
                  Message:
                  <input 
                    type="text"
                    value={config.message || ''}
                    onChange={(e) => setConfig({...config, message: e.target.value})}
                    placeholder="Next Drop In:"
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                  />
                </label>
              </>
            )}  

            {widget.type === 'announcement-bar' && (
              <>
                <label>
                  Message:
                  <input 
                    type="text"
                    value={config.message || ''}
                    onChange={(e) => setConfig({...config, message: e.target.value})}
                    style={{ width: '100%', padding: '0.5rem', marginBottom: '1rem' }}
                  />
                </label>    

                <label style={{ display: 'block', marginBottom: '1rem' }}>
                  <input 
                    type="checkbox"
                    checked={config.scrolling || false}
                    onChange={(e) => setConfig({...config, scrolling: e.target.checked})}
                  />
                  Enable scrolling animation
                </label>    

                <label style={{ display: 'block', marginBottom: '1rem' }}>
                  <input 
                    type="checkbox"
                    checked={config.dismissible || false}
                    onChange={(e) => setConfig({...config, dismissible: e.target.checked})}
                  />
                  Allow users to dismiss
                </label>
              </>
            )}  

            <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
              <button 
                onClick={handleSave}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: theme?.colors?.accent,
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Save Changes
              </button>
              <button 
                onClick={onClose}
                style={{
                  flex: 1,
                  padding: '0.75rem',
                  background: 'transparent',
                  color: theme?.colors?.text,
                  border: `1px solid ${theme?.colors?.accent}`,
                  borderRadius: '8px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    };

  // Handle drag and drop
  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  // Add widget
  const handleAddWidget = (widgetType) => {
    const newWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      config: { ...WIDGET_LIBRARY[widgetType].defaultConfig },
      visible: true
    };
    setWidgets([...widgets, newWidget]);
  };

  // Update widget config
  const handleUpdateWidget = (widgetId, updates) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    ));
  };

  // Delete widget
  const handleDeleteWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  // Toggle widget visibility
  const handleToggleVisibility = (widgetId) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  // Save configuration
  const handleSave = async () => {
      try {
        // Prepare the home page configuration
        const homePageConfig = {
          widgets: widgets.map(widget => ({
            ...widget,
            // Clean config to remove any non-serializable data
            config: cleanDataForFirestore(widget.config)
          })),
          lastUpdated: new Date().toISOString()
        };

        // Save to Firestore
        if (auth.currentUser) {
          const shopRef = doc(db, 'shops', auth.currentUser.uid);
          await updateDoc(shopRef, {
            homeWidgets: homePageConfig.widgets,
            homePageConfig: homePageConfig,
            updatedAt: new Date().toISOString()
          });

          // Show success message
          alert('Home page layout saved successfully!');

          // Call the onSave callback if provided
          if (onSave) {
            onSave({ homeWidgets: widgets });
          }
        } else {
          // Save to local storage if not authenticated
          localStorage.setItem('homePageWidgets', JSON.stringify(homePageConfig));
          alert('Layout saved locally. Sign in to save permanently.');
        }
      } catch (error) {
        console.error('Error saving home page layout:', error);
        alert('Failed to save layout. Please try again.');
      }
    };

  // Render widget based on type
  const renderWidget = (widget) => {
    const props = {
      config: widget.config,
      theme,
      editable: !previewMode,
      onUpdate: (config) => handleUpdateWidget(widget.id, { config })
    };
     switch (widget.type) {
      case 'hero-banner':
        return <HeroBannerWidget {...props} />;
        
      case 'product-carousel':
        return <ProductCarouselWidget {...props} items={shopData?.items || []} />;
        
      case 'stats-dashboard':
        return <StatsWidget {...props} stats={shopData?.stats} />;
        
      case 'newsletter':
        return <NewsletterWidget {...props} />;
        
      case 'countdown-timer':
        return <CountdownWidget {...props} />;
        
      case 'testimonials':
        return <TestimonialsWidget {...props} />;
        
      case 'gallery':
        return <GalleryWidget {...props} />;
        
      case 'social-feed':
        return <SocialFeedWidget {...props} />;
        
      case 'video-section':
        return <VideoWidget {...props} />;
        
      case 'faq-section':
        return <FAQWidget {...props} />;
        
      case 'team-section':
        return <TeamWidget {...props} />;
        
      case 'announcement-bar':
        return (
          <AnnouncementBar
            style={widget.config.style}
            scrolling={widget.config.scrolling}
            dismissible={widget.config.dismissible}
            position={widget.config.position}
            theme={theme}
          >
            <span className={widget.config.scrolling ? "announcement-text" : ""}>
              {widget.config.message || "🔥 FREE SHIPPING ON ALL ORDERS TODAY ONLY! 🔥"}
            </span>
            {widget.config.dismissible && (
              <button className="close-button" onClick={() => handleUpdateWidget(widget.id, { visible: false })}>
                <X size={16} />
              </button>
            )}
          </AnnouncementBar>
        );
        
      default:
        return (
          <div style={{ 
            padding: '3rem', 
            background: `${theme?.colors?.surface}50`,
            borderRadius: '8px',
            textAlign: 'center',
            border: `2px dashed ${theme?.colors?.accent}50`
          }}>
            <p>{WIDGET_LIBRARY[widget.type]?.name} Widget</p>
            <small style={{ opacity: 0.6 }}>Widget type not implemented</small>
          </div>
        );
    }
};
    

  return (
    <PageContainer theme={theme}>
      <EditorHeader theme={theme}>
        <EditorControls>
          <ControlGroup>
            <IconButton
              theme={theme}
              active={showLibrary}
              onClick={() => setShowLibrary(!showLibrary)}
              title="Toggle Widget Library"
            >
              <Layers />
            </IconButton>
            <IconButton
              theme={theme}
              active={previewMode}
              onClick={() => setPreviewMode(!previewMode)}
              title="Toggle Preview Mode"
            >
              {previewMode ? <Eye /> : <EyeOff />}
            </IconButton>
          </ControlGroup>
          
          <SaveButton theme={theme} onClick={handleSave}>
            <Save size={18} />
            Save Layout
          </SaveButton>
        </EditorControls>
      </EditorHeader>

      <EditorContent showLibrary={showLibrary}>
        {showLibrary && (
          <WidgetLibrary theme={theme}>
            <LibraryTitle theme={theme}>
              <Plus size={20} />
              Add Widgets
            </LibraryTitle>
            
            {Object.entries(WIDGET_LIBRARY).map(([key, widget]) => (
              <WidgetItem
                key={key}
                theme={theme}
                onClick={() => handleAddWidget(key)}
              >
                <WidgetInfo>
                  <widget.icon className="icon" size={20} />
                  <span className="name">{widget.name}</span>
                </WidgetInfo>
                <WidgetDescription theme={theme}>
                  {widget.description}
                </WidgetDescription>
              </WidgetItem>
            ))}
          </WidgetLibrary>
        )}

        <PreviewArea theme={theme}>
          <PreviewHeader theme={theme}>
            <h3 style={{ margin: 0 }}>Home Page Preview</h3>
            <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
              {widgets.length} widgets
            </span>
          </PreviewHeader>

          {widgets.length === 0 ? (
            <EmptyState theme={theme}>
              <Layout />
              <h3>Start Building Your Home Page</h3>
              <p>Add widgets from the library to create your perfect layout</p>
            </EmptyState>
          ) : (
            <DragDropContext onDragEnd={handleDragEnd}>
              <Droppable droppableId="widgets">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef}>
                    {widgets.map((widget, index) => (
                      <Draggable
                        key={widget.id}
                        draggableId={widget.id}
                        index={index}
                        isDragDisabled={previewMode}
                      >
                        {(provided, snapshot) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                          >
                            <WidgetContainer
                              theme={theme}
                              isHidden={!widget.visible}
                              isDragging={snapshot.isDragging}
                              noPadding={widget.type === 'hero-banner' || widget.type === 'announcement-bar'}
                            >
                              {!previewMode && (
                                <WidgetControls theme={theme}>
                                  <WidgetButton
                                    theme={theme}
                                    onClick={() => handleToggleVisibility(widget.id)}
                                    title={widget.visible ? 'Hide' : 'Show'}
                                  >
                                    {widget.visible ? <Eye size={14} /> : <EyeOff size={14} />}
                                  </WidgetButton>
                                  <WidgetButton
                                      theme={theme}
                                      onClick={() => {
                                        setEditingWidget(widget);
                                        setSettingsModalOpen(true);
                                      }}
                                      title="Settings"
                                    >
                                      <Settings size={14} />
                                  </WidgetButton>
                                  <WidgetButton
                                    theme={theme}
                                    onClick={() => handleDeleteWidget(widget.id)}
                                    title="Delete"
                                  >
                                    <Trash2 size={14} />
                                  </WidgetButton>
                                  <WidgetButton
                                    theme={theme}
                                    title="Drag to reorder"
                                    style={{ cursor: 'grab' }}
                                  >
                                    <Move size={14} />
                                  </WidgetButton>
                                </WidgetControls>
                              )}
                              
                              {renderWidget(widget)}
                            </WidgetContainer>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </PreviewArea>
      </EditorContent>

      <WidgetSettingsModal
          widget={editingWidget}
          isOpen={settingsModalOpen}
          onClose={() => {
            setSettingsModalOpen(false);
            setEditingWidget(null);
          }}
          onUpdate={handleUpdateWidget}
          theme={theme}
        />
    </PageContainer>
  );
};

export default HomePageEditor;