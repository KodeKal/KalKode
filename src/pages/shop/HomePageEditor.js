// src/pages/shop/HomePageEditor.js - Responsive Fixed

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
  Layers,
  Phone,
  TrendingUp
} from 'lucide-react';
import {
  CountdownWidget,
  TestimonialsWidget,
  GalleryWidget,
  SocialFeedWidget,
  VideoWidget,
  FAQWidget,
  TeamWidget,
  ContactFormWidget,
  HoursWidget,
  LocationWidget,
  ServicesWidget,
  BlogWidget,
  PricingWidget
} from './HomePageWidgets';
import { auth, db } from '../../firebase/config';
import { doc, updateDoc } from 'firebase/firestore';

// Widget Definitions
const WIDGET_LIBRARY = {
  'hero-banner': {
    name: 'Hero Banner',
    icon: Image,
    description: 'Full-width banner like Apple or Tesla',
    defaultConfig: {
      style: 'apple',
      height: 'large',
      overlay: true,
      parallax: false
    }
  },
  'product-carousel': {
    name: 'Featured Products',
    icon: Package,
    description: 'Product slider like Amazon or Nike',
    defaultConfig: {
      style: 'amazon',
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
      style: 'stripe',
      animate: true,
      layout: 'grid'
    }
  },
  'testimonials': {
    name: 'Customer Reviews',
    icon: Star,
    description: 'Social proof like Airbnb or Trustpilot',
    defaultConfig: {
      style: 'airbnb',
      layout: 'carousel',
      showRating: true
    }
  },
  'gallery': {
    name: 'Photo Gallery',
    icon: Grid,
    description: 'Visual grid like Instagram or Pinterest',
    defaultConfig: {
      style: 'instagram',
      columns: 3,
      spacing: 'normal',
      lightbox: true,
      images: Array(6).fill(null)
    }
  },
  'announcement-bar': {
    name: 'Announcement Bar',
    icon: Sparkles,
    description: 'Top bar like Supreme or Fashion Nova',
    defaultConfig: {
      style: 'supreme',
      scrolling: false,
      dismissible: true,
      position: 'top',
      message: '🔥 FREE SHIPPING ON ALL ORDERS TODAY ONLY! 🔥'
    }
  },
  'video-section': {
    name: 'Video Feature',
    icon: Play,
    description: 'Video section like Vimeo or YouTube',
    defaultConfig: {
      style: 'youtube',
      autoplay: false,
      controls: true,
      aspectRatio: '16:9',
      videoUrl: ''
    }
  },
  'newsletter': {
    name: 'Newsletter Signup',
    icon: Mail,
    description: 'Email capture like Medium or Substack',
    defaultConfig: {
      style: 'medium',
      incentive: 'Get 10% off your first order',
      fields: ['email']
    }
  },
  'countdown-timer': {
    name: 'Countdown Timer',
    icon: Clock,
    description: 'Urgency timer like Supreme drops',
    defaultConfig: {
      style: 'supreme',
      endDate: null,
      message: 'Next Drop In:'
    }
  },
  'social-feed': {
    name: 'Social Media Feed',
    icon: Instagram,
    description: 'Instagram feed like Fashion brands',
    defaultConfig: {
      style: 'grid',
      platform: 'instagram',
      posts: 6
    }
  },
  'faq-section': {
    name: 'FAQ',
    icon: HelpCircle,
    description: 'Q&A like Notion or Stripe',
    defaultConfig: {
      style: 'notion',
      searchable: false,
      categories: false
    }
  },
  'team-section': {
    name: 'Team/About',
    icon: Users,
    description: 'Team display like Slack or Linear',
    defaultConfig: {
      style: 'slack',
      showBio: true,
      showSocial: true
    }
  },
  'contact-form': {
    name: 'Contact Form',
    icon: Mail,
    description: 'Contact form like Typeform',
    defaultConfig: {
      style: 'modern',
      title: 'Get In Touch',
      subtitle: 'We\'d love to hear from you'
    }
  },
  'hours': {
    name: 'Business Hours',
    icon: Clock,
    description: 'Operating hours display',
    defaultConfig: {
      style: 'clean',
      title: 'Hours of Operation'
    }
  },
  'location': {
    name: 'Location & Map',
    icon: MapPin,
    description: 'Address and embedded map',
    defaultConfig: {
      address: '123 Main Street',
      city: 'Houston, TX 77001',
      phone: '(555) 123-4567',
      email: 'info@shop.com'
    }
  },
  'services': {
    name: 'Services/Features',
    icon: Award,
    description: 'Highlight key features',
    defaultConfig: {
      style: 'grid',
      title: 'Why Choose Us'
    }
  },
  'blog': {
    name: 'Blog/News',
    icon: FileText,
    description: 'Latest blog posts',
    defaultConfig: {
      style: 'grid',
      posts: 3,
      title: 'Latest News'
    }
  },
  'pricing': {
    name: 'Pricing Plans',
    icon: TrendingUp,
    description: 'Pricing tables',
    defaultConfig: {
      style: 'cards',
      title: 'Choose Your Plan'
    }
  }
};

// Responsive Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  position: relative;
  overflow-x: hidden;
`;

const EditorHeader = styled.div`
  position: sticky;
  top: 0;
  z-index: 100;
  background: ${props => `${props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 0.9)'}F5`};
  backdrop-filter: blur(10px);
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  padding: 0.75rem 1rem;
  
  @media (min-width: 768px) {
    padding: 1rem 1.5rem;
  }
`;

const EditorControls = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: stretch;
  }
`;

const ControlGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (max-width: 640px) {
    justify-content: center;
  }
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
    width: 16px;
    height: 16px;
  }

  @media (min-width: 768px) {
    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

const SaveButton = styled.button`
  background: ${props => props.theme?.colors?.accent || '#800000'};
  color: white;
  border: none;
  padding: 0.6rem 1.2rem;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  white-space: nowrap;
  
  @media (min-width: 768px) {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px ${props => `${props.theme?.colors?.accent}60` || 'rgba(128, 0, 0, 0.4)'};
  }

  svg {
    width: 16px;
    height: 16px;
  }
`;

const EditorContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem;
  min-height: calc(100vh - 80px);
  
  @media (min-width: 1024px) {
    display: grid;
    grid-template-columns: ${props => props.showLibrary ? '280px 1fr' : '1fr'};
    gap: 1.5rem;
    padding: 1.5rem;
    max-width: 100%;
    margin: 0 auto;
  }

  @media (min-width: 1440px) {
    grid-template-columns: ${props => props.showLibrary ? '320px 1fr' : '1fr'};
    gap: 2rem;
    padding: 2rem;
    max-width: 1800px;
  }
`;

const WidgetLibrary = styled.div`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: 12px;
  padding: 1rem;
  height: fit-content;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  
  @media (min-width: 1024px) {
    position: sticky;
    top: 100px;
    padding: 1.5rem;
  }

  /* Custom scrollbar */
  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-track {
    background: transparent;
  }

  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme?.colors?.accent || '#800000'};
    border-radius: 3px;
  }
`;

const LibraryTitle = styled.h3`
  font-size: 1rem;
  margin-bottom: 1rem;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  display: flex;
  align-items: center;
  gap: 0.5rem;

  @media (min-width: 768px) {
    font-size: 1.1rem;
  }
`;

const WidgetItem = styled.div`
  background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  border-radius: 8px;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  cursor: grab;
  transition: all 0.3s ease;
  
  &:hover {
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    transform: translateX(4px);
  }
  
  &:active {
    cursor: grabbing;
  }

  @media (min-width: 768px) {
    padding: 1rem;
    margin-bottom: 0.75rem;
  }
`;

const WidgetInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
  
  .icon {
    color: ${props => props.theme?.colors?.accent || '#800000'};
    flex-shrink: 0;
  }
  
  .name {
    font-weight: 600;
    font-size: 0.85rem;
    line-height: 1.2;
  }

  @media (min-width: 768px) {
    gap: 0.75rem;
    
    .name {
      font-size: 0.95rem;
    }
  }
`;

const WidgetDescription = styled.p`
  font-size: 0.75rem;
  color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
  margin: 0;
  line-height: 1.3;

  @media (min-width: 768px) {
    font-size: 0.8rem;
  }
`;

const PreviewArea = styled.div`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}30`};
  border-radius: 12px;
  overflow: hidden;
  min-height: 400px;
  width: 100%;
`;

const PreviewHeader = styled.div`
  background: ${props => `${props.theme?.colors?.headerBg || 'rgba(0, 0, 0, 0.9)'}F5`};
  backdrop-filter: blur(10px);
  padding: 0.75rem 1rem;
  border-bottom: 1px solid ${props => `${props.theme?.colors?.accent}4D` || 'rgba(128, 0, 0, 0.3)'};
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 0.5rem;

  h3 {
    margin: 0;
    font-size: 0.9rem;
  }

  span {
    font-size: 0.8rem;
    opacity: 0.7;
  }

  @media (min-width: 768px) {
    padding: 1rem 1.5rem;

    h3 {
      font-size: 1rem;
    }

    span {
      font-size: 0.9rem;
    }
  }
`;

const WidgetContainer = styled.div`
  padding: ${props => props.noPadding ? '0' : '1rem'};
  position: relative;
  opacity: ${props => props.isHidden ? 0.5 : 1};
  transition: all 0.3s ease;
  
  @media (min-width: 768px) {
    padding: ${props => props.noPadding ? '0' : '2rem'};
  }
  
  ${props => props.isDragging && `
    background: ${props.theme?.colors?.accent}10;
    border: 2px dashed ${props.theme?.colors?.accent};
    border-radius: 8px;
  `}
`;

const WidgetControls = styled.div`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  display: flex;
  gap: 0.25rem;
  background: ${props => `${props.theme?.colors?.background || '#000000'}E5`};
  backdrop-filter: blur(10px);
  padding: 0.25rem;
  border-radius: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
  
  ${WidgetContainer}:hover & {
    opacity: 1;
  }

  @media (min-width: 768px) {
    top: 1rem;
    right: 1rem;
    gap: 0.5rem;
    padding: 0.5rem;
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
    width: 14px;
    height: 14px;
  }

  @media (min-width: 768px) {
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 300px;
  padding: 2rem 1rem;
  text-align: center;
  
  @media (min-width: 768px) {
    min-height: 400px;
    padding: 3rem;
  }
  
  svg {
    width: 40px;
    height: 40px;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin-bottom: 1rem;
    opacity: 0.5;
  }

  @media (min-width: 768px) {
    svg {
      width: 48px;
      height: 48px;
    }
  }
  
  h3 {
    font-size: 1.1rem;
    margin-bottom: 0.5rem;
  }

  @media (min-width: 768px) {
    h3 {
      font-size: 1.2rem;
    }
  }
  
  p {
    color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
    font-size: 0.85rem;
  }

  @media (min-width: 768px) {
    p {
      font-size: 0.9rem;
    }
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
  font-size: 0.85rem;

  @media (min-width: 768px) {
    font-size: 1rem;
  }
`;

// Widget Renderer Components (keeping existing implementations but adding responsive styles)
const HeroBannerWidget = ({ config, theme, editable, onUpdate }) => {
  const styles = {
    apple: {
      height: config.height === 'fullscreen' ? '100vh' : config.height === 'large' ? '60vh' : '40vh',
      background: `linear-gradient(135deg, ${theme?.colors?.accent}20 0%, ${theme?.colors?.background} 100%)`,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      position: 'relative',
      padding: '1rem'
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
            fontSize: 'clamp(1.5rem, 5vw, 3rem)',
            fontWeight: 'bold',
            textAlign: 'center',
            color: theme?.colors?.text
          }}
        />
      ) : (
        <h1 style={{ fontSize: 'clamp(1.5rem, 5vw, 3rem)', fontWeight: 'bold', textAlign: 'center' }}>
          {config.headline || "Welcome to Our Shop"}
        </h1>
      )}
    </div>
  );
};

const ProductCarouselWidget = ({ config, theme, items = [], editable }) => {
  return (
    <div style={{ padding: '1rem 0' }}>
      <h2 style={{ marginBottom: '1rem', color: theme?.colors?.accent, fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}>
        Featured Products
      </h2>
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fill, minmax(min(200px, 100%), 1fr))',
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

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(min(150px, 100%), 1fr))',
      gap: 'clamp(1rem, 3vw, 2rem)',
      padding: 'clamp(1.5rem, 4vw, 3rem)'
    }}>
      {Object.entries(defaultStats).map(([key, value]) => (
        <div key={key} style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 'clamp(1.5rem, 4vw, 2.5rem)', fontWeight: 'bold', color: theme?.colors?.accent }}>
            {key === 'rating' ? `${value}★` : value}
          </div>
          <div style={{ fontSize: 'clamp(0.75rem, 2vw, 0.9rem)', opacity: 0.7, textTransform: 'capitalize' }}>
            {key.replace(/([A-Z])/g, ' $1').trim()}
          </div>
        </div>
      ))}
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
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [editingWidget, setEditingWidget] = useState(null);

  // Auto-hide library on mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setShowLibrary(false);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const loadSavedWidgets = async () => {
      try {
        if (auth.currentUser && shopData?.homeWidgets) {
          setWidgets(shopData.homeWidgets);
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
        zIndex: 1000,
        padding: '1rem'
      }}>
        <div style={{
          background: theme?.colors?.background || '#000',
          border: `1px solid ${theme?.colors?.accent}`,
          borderRadius: '12px',
          padding: '1.5rem',
          maxWidth: '500px',
          width: '100%',
          maxHeight: '80vh',
          overflow: 'auto'
        }}>
          <h3 style={{ marginBottom: '1.5rem', fontSize: 'clamp(1.1rem, 3vw, 1.3rem)' }}>
            {widgetType?.name} Settings
          </h3>

          {widget.type === 'hero-banner' && (
            <>
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Style:</span>
                <select 
                  value={config.style} 
                  onChange={(e) => setConfig({...config, style: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                >
                  <option value="apple">Apple Style</option>
                  <option value="tesla">Tesla Style</option>
                  <option value="shopify">Shopify Style</option>
                  <option value="airbnb">Airbnb Style</option>
                </select>
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Height:</span>
                <select 
                  value={config.height} 
                  onChange={(e) => setConfig({...config, height: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                  <option value="fullscreen">Fullscreen</option>
                </select>
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Headline:</span>
                <input 
                  type="text"
                  value={config.headline || ''}
                  onChange={(e) => setConfig({...config, headline: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>
            </>
          )}

          {widget.type === 'video-section' && (
            <>
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>YouTube URL:</span>
                <input 
                  type="text"
                  value={config.videoUrl || ''}
                  onChange={(e) => setConfig({...config, videoUrl: e.target.value})}
                  placeholder="https://www.youtube.com/watch?v=..."
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Style:</span>
                <select 
                  value={config.style} 
                  onChange={(e) => setConfig({...config, style: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                >
                  <option value="youtube">YouTube Embed</option>
                  <option value="vimeo">Vimeo Style</option>
                  <option value="modal">Modal Popup</option>
                </select>
              </label>
            </>
          )}

          {widget.type === 'countdown-timer' && (
            <>
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>End Date:</span>
                <input 
                  type="datetime-local"
                  value={config.endDate || ''}
                  onChange={(e) => setConfig({...config, endDate: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Message:</span>
                <input 
                  type="text"
                  value={config.message || ''}
                  onChange={(e) => setConfig({...config, message: e.target.value})}
                  placeholder="Next Drop In:"
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>
            </>
          )}

          {widget.type === 'announcement-bar' && (
            <>
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Message:</span>
                <input 
                  type="text"
                  value={config.message || ''}
                  onChange={(e) => setConfig({...config, message: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <input 
                  type="checkbox"
                  checked={config.scrolling || false}
                  onChange={(e) => setConfig({...config, scrolling: e.target.checked})}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontSize: '0.9rem' }}>Enable scrolling animation</span>
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <input 
                  type="checkbox"
                  checked={config.dismissible || false}
                  onChange={(e) => setConfig({...config, dismissible: e.target.checked})}
                  style={{ marginRight: '0.5rem' }}
                />
                <span style={{ fontSize: '0.9rem' }}>Allow users to dismiss</span>
              </label>
            </>
          )}

          {widget.type === 'location' && (
            <>
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Address:</span>
                <input 
                  type="text"
                  value={config.address || ''}
                  onChange={(e) => setConfig({...config, address: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>City, State ZIP:</span>
                <input 
                  type="text"
                  value={config.city || ''}
                  onChange={(e) => setConfig({...config, city: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Phone:</span>
                <input 
                  type="tel"
                  value={config.phone || ''}
                  onChange={(e) => setConfig({...config, phone: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Email:</span>
                <input 
                  type="email"
                  value={config.email || ''}
                  onChange={(e) => setConfig({...config, email: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Google Maps Embed URL (optional):</span>
                <input 
                  type="text"
                  value={config.mapUrl || ''}
                  onChange={(e) => setConfig({...config, mapUrl: e.target.value})}
                  placeholder="https://www.google.com/maps/embed?..."
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>
            </>
          )}

          {widget.type === 'gallery' && (
            <>
              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Title:</span>
                <input 
                  type="text"
                  value={config.title || ''}
                  onChange={(e) => setConfig({...config, title: e.target.value})}
                  placeholder="Photo Gallery"
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                />
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Style:</span>
                <select 
                  value={config.style} 
                  onChange={(e) => setConfig({...config, style: e.target.value})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                >
                  <option value="instagram">Instagram Grid</option>
                  <option value="pinterest">Pinterest Masonry</option>
                  <option value="masonry">Modern Masonry</option>
                </select>
              </label>

              <label style={{ display: 'block', marginBottom: '1rem' }}>
                <span style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.9rem' }}>Columns:</span>
                <select 
                  value={config.columns} 
                  onChange={(e) => setConfig({...config, columns: parseInt(e.target.value)})}
                  style={{ width: '100%', padding: '0.5rem', background: theme?.colors?.surface, color: theme?.colors?.text, border: `1px solid ${theme?.colors?.accent}30`, borderRadius: '4px' }}
                >
                  <option value="2">2 Columns</option>
                  <option value="3">3 Columns</option>
                  <option value="4">4 Columns</option>
                  <option value="6">6 Columns</option>
                </select>
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
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: '600'
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
                cursor: 'pointer',
                fontSize: '0.9rem'
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(widgets);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setWidgets(items);
  };

  const handleAddWidget = (widgetType) => {
    const newWidget = {
      id: `${widgetType}-${Date.now()}`,
      type: widgetType,
      config: { ...WIDGET_LIBRARY[widgetType].defaultConfig },
      visible: true
    };
    setWidgets([...widgets, newWidget]);
  };

  const handleUpdateWidget = (widgetId, updates) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, ...updates } : w
    ));
  };

  const handleDeleteWidget = (widgetId) => {
    setWidgets(widgets.filter(w => w.id !== widgetId));
  };

  const handleToggleVisibility = (widgetId) => {
    setWidgets(widgets.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  const handleSave = async () => {
    try {
      const homePageConfig = {
        widgets: widgets.map(widget => ({
          ...widget,
          config: cleanDataForFirestore(widget.config)
        })),
        lastUpdated: new Date().toISOString()
      };

      if (auth.currentUser) {
        const shopRef = doc(db, 'shops', auth.currentUser.uid);
        await updateDoc(shopRef, {
          homeWidgets: homePageConfig.widgets,
          homePageConfig: homePageConfig,
          updatedAt: new Date().toISOString()
        });

        alert('Home page layout saved successfully!');

        if (onSave) {
          onSave({ homeWidgets: widgets });
        }
      }
    } catch (error) {
      console.error('Error saving home page layout:', error);
      alert('Failed to save layout. Please try again.');
    }
  };

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
      case 'contact-form':
        return <ContactFormWidget {...props} />;
      case 'hours':
        return <HoursWidget {...props} />;
      case 'location':
        return <LocationWidget {...props} />;
      case 'services':
        return <ServicesWidget {...props} />;
      case 'blog':
        return <BlogWidget {...props} />;
      case 'pricing':
        return <PricingWidget {...props} />;
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
              <button 
                className="close-button" 
                onClick={() => handleUpdateWidget(widget.id, { visible: false })}
                style={{
                  position: 'absolute',
                  right: '1rem',
                  background: 'transparent',
                  border: 'none',
                  color: 'white',
                  cursor: 'pointer',
                  padding: '0.25rem'
                }}
              >
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
            <Save size={16} />
            Save Layout
          </SaveButton>
        </EditorControls>
      </EditorHeader>

      <EditorContent showLibrary={showLibrary}>
        {showLibrary && (
          <WidgetLibrary theme={theme}>
            <LibraryTitle theme={theme}>
              <Plus size={18} />
              Add Widgets
            </LibraryTitle>
            
            {Object.entries(WIDGET_LIBRARY).map(([key, widget]) => (
              <WidgetItem
                key={key}
                theme={theme}
                onClick={() => handleAddWidget(key)}
              >
                <WidgetInfo>
                  <widget.icon className="icon" size={18} />
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
            <h3>Home Page Preview</h3>
            <span>{widgets.length} widgets</span>
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