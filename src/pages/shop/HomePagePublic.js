// src/pages/shop/HomePagePublic.js - Public View with Real Website Design Patterns

import React, { useState, useEffect, useRef } from 'react';
import styled, { keyframes, css } from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  ShoppingCart, 
  Heart, 
  Star, 
  Play, 
  ChevronLeft, 
  ChevronRight,
  Instagram,
  Twitter,
  Youtube,
  Clock,
  Mail,
  ArrowRight,
  Sparkles,
  TrendingUp,
  Award,
  Package,
  Users,
  X,
  Plus,
  Minus
} from 'lucide-react';

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideIn = keyframes`
  from { transform: translateX(-100%); }
  to { transform: translateX(0); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const scrollText = keyframes`
  0% { transform: translateX(0); }
  100% { transform: translateX(-50%); }
`;

// Base Container
const PageContainer = styled.div`
  min-height: 100vh;
  background: ${props => props.theme?.colors?.background || '#000000'};
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  position: relative;
  overflow-x: hidden;
`;

// Widget Style Components

// 1. Hero Banner Styles (Apple/Tesla/Shopify/Airbnb inspired)
const HeroBanner = styled.section`
  position: relative;
  overflow: hidden;
  
  ${props => props.style === 'apple' && css`
    height: ${props.height === 'fullscreen' ? '100vh' : props.height === 'large' ? '80vh' : '60vh'};
    background: linear-gradient(135deg, #000 0%, #111 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    text-align: center;
    
    .hero-content {
      max-width: 1200px;
      padding: 2rem;
      animation: ${fadeIn} 1s ease;
      
      h1 {
        font-size: clamp(2.5rem, 8vw, 5rem);
        font-weight: 700;
        line-height: 1.1;
        margin-bottom: 1.5rem;
        background: linear-gradient(135deg, #fff 0%, #999 100%);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
      }
      
      p {
        font-size: clamp(1.1rem, 3vw, 1.5rem);
        opacity: 0.8;
        max-width: 800px;
        margin: 0 auto 2rem;
      }
      
      .cta-button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        background: ${props => props.theme?.colors?.accent || '#0071e3'};
        color: white;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-size: 1.1rem;
        font-weight: 500;
        border: none;
        cursor: pointer;
        transition: all 0.3s ease;
        
        &:hover {
          transform: scale(1.05);
          box-shadow: 0 10px 30px rgba(0, 113, 227, 0.3);
        }
      }
    }
    
    ${props.parallax && css`
      background-attachment: fixed;
    `}
  `}
  
  ${props => props.style === 'tesla' && css`
    height: 100vh;
    position: relative;
    
    video, img {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      object-fit: cover;
      z-index: -1;
    }
    
    .overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, rgba(0,0,0,0.7) 100%);
    }
    
    .hero-content {
      position: absolute;
      bottom: 20%;
      left: 50%;
      transform: translateX(-50%);
      text-align: center;
      
      h1 {
        font-size: clamp(2rem, 6vw, 4rem);
        margin-bottom: 1rem;
        font-weight: 400;
        letter-spacing: -0.5px;
      }
      
      .buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
        
        button {
          padding: 0.75rem 3rem;
          border-radius: 4px;
          font-size: 0.9rem;
          text-transform: uppercase;
          letter-spacing: 1px;
          border: 3px solid white;
          background: transparent;
          color: white;
          cursor: pointer;
          transition: all 0.3s ease;
          
          &:hover {
            background: white;
            color: black;
          }
          
          &.primary {
            background: white;
            color: black;
            
            &:hover {
              background: transparent;
              color: white;
            }
          }
        }
      }
    }
  `}
  
  ${props => props.style === 'shopify' && css`
    background: ${props.theme?.colors?.accentGradient || 'linear-gradient(120deg, #96fbc4 0%, #f9f586 100%)'};
    padding: 4rem 2rem;
    
    @media (min-width: 768px) {
      padding: 6rem 3rem;
    }
    
    .hero-content {
      max-width: 1400px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: 1fr;
      gap: 3rem;
      align-items: center;
      
      @media (min-width: 768px) {
        grid-template-columns: 1fr 1fr;
      }
      
      .text-content {
        h1 {
          font-size: clamp(2rem, 5vw, 3.5rem);
          margin-bottom: 1rem;
          color: ${props => props.theme?.colors?.background || '#000'};
        }
        
        p {
          font-size: 1.2rem;
          line-height: 1.6;
          margin-bottom: 2rem;
          color: ${props => props.theme?.colors?.background || '#000'};
          opacity: 0.8;
        }
        
        .email-capture {
          display: flex;
          gap: 1rem;
          max-width: 500px;
          
          input {
            flex: 1;
            padding: 1rem;
            border: 2px solid ${props => props.theme?.colors?.background || '#000'};
            border-radius: 8px;
            font-size: 1rem;
            background: white;
          }
          
          button {
            padding: 1rem 2rem;
            background: ${props => props.theme?.colors?.background || '#000'};
            color: white;
            border: none;
            border-radius: 8px;
            font-weight: 600;
            cursor: pointer;
            transition: transform 0.2s ease;
            
            &:hover {
              transform: translateY(-2px);
            }
          }
        }
      }
      
      .image-content {
        position: relative;
        height: 400px;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 16px;
        overflow: hidden;
      }
    }
  `}
`;

// 2. Product Carousel (Amazon/Nike/Supreme inspired)
const ProductCarousel = styled.section`
  padding: 3rem 0;
  
  ${props => props.style === 'amazon' && css`
    .section-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0 2rem;
      margin-bottom: 1.5rem;
      
      h2 {
        font-size: 1.5rem;
        font-weight: 600;
      }
      
      a {
        color: ${props => props.theme?.colors?.accent || '#FF9900'};
        text-decoration: none;
        font-size: 0.95rem;
        
        &:hover {
          text-decoration: underline;
        }
      }
    }
    
    .carousel-container {
      position: relative;
      padding: 0 3rem;
      
      .carousel-track {
        display: flex;
        gap: 1rem;
        overflow-x: auto;
        scroll-behavior: smooth;
        scrollbar-width: none;
        
        &::-webkit-scrollbar {
          display: none;
        }
      }
      
      .carousel-button {
        position: absolute;
        top: 50%;
        transform: translateY(-50%);
        background: white;
        border: 1px solid #ddd;
        width: 45px;
        height: 100px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        z-index: 2;
        
        &.prev { left: 0; }
        &.next { right: 0; }
        
        &:hover {
          background: #f5f5f5;
        }
      }
    }
  `}
  
  ${props => props.style === 'supreme' && css`
    border-top: 3px solid ${props => props.theme?.colors?.accent || '#FF0000'};
    border-bottom: 3px solid ${props => props.theme?.colors?.accent || '#FF0000'};
    padding: 2rem 0;
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 0;
      
      @media (min-width: 768px) {
        grid-template-columns: repeat(4, 1fr);
      }
    }
  `}
`;

const ProductCard = styled.div`
  flex: 0 0 auto;
  width: 250px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  ${props => props.style === 'amazon' && css`
    .product-image {
      height: 200px;
      background: #f7f7f7;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-bottom: 1rem;
      position: relative;
      overflow: hidden;
      
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: contain;
      }
      
      .badge {
        position: absolute;
        top: 10px;
        left: 10px;
        background: ${props => props.theme?.colors?.accent || '#FF0000'};
        color: white;
        padding: 0.25rem 0.5rem;
        font-size: 0.75rem;
        font-weight: 600;
      }
    }
    
    .product-info {
      padding: 0 0.5rem;
      
      .product-name {
        font-size: 0.95rem;
        margin-bottom: 0.5rem;
        display: -webkit-box;
        -webkit-line-clamp: 2;
        -webkit-box-orient: vertical;
        overflow: hidden;
      }
      
      .rating {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        margin-bottom: 0.5rem;
        
        .stars {
          color: #FF9900;
        }
        
        .count {
          color: #007185;
          font-size: 0.85rem;
        }
      }
      
      .price {
        font-size: 1.2rem;
        font-weight: 600;
        
        .original {
          text-decoration: line-through;
          color: #999;
          font-size: 0.9rem;
          margin-left: 0.5rem;
        }
      }
    }
    
    &:hover {
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    }
  `}
  
  ${props => props.style === 'supreme' && css`
    border: 1px solid ${props => props.theme?.colors?.accent || '#FF0000'};
    padding: 1rem;
    text-align: center;
    
    .product-image {
      height: 150px;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .product-name {
      font-weight: 600;
      text-transform: uppercase;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
    }
    
    .price {
      color: ${props => props.theme?.colors?.accent || '#FF0000'};
      font-weight: bold;
    }
    
    .sold-out {
      color: #999;
      text-transform: uppercase;
      font-size: 0.8rem;
      margin-top: 0.5rem;
    }
    
    &:hover {
      background: ${props => props.theme?.colors?.accent || '#FF0000'};
      color: white;
      
      .price { color: white; }
    }
  `}
`;

// 3. Stats Dashboard (Stripe/Shopify inspired)
const StatsSection = styled.section`
  padding: 4rem 2rem;
  
  ${props => props.style === 'stripe' && css`
    background: linear-gradient(135deg, ${props.theme?.colors?.accent}10 0%, transparent 50%);
    
    .stats-grid {
      max-width: 1200px;
      margin: 0 auto;
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 3rem;
      
      .stat-card {
        text-align: center;
        
        .stat-icon {
          width: 60px;
          height: 60px;
          margin: 0 auto 1rem;
          background: ${props => props.theme?.colors?.accent}20;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: ${props => props.theme?.colors?.accent};
        }
        
        .stat-value {
          font-size: 3rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
          background: ${props => props.theme?.colors?.accentGradient || 
            `linear-gradient(135deg, ${props.theme?.colors?.accent} 0%, ${props.theme?.colors?.text} 100%)`};
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }
        
        .stat-label {
          font-size: 1rem;
          opacity: 0.7;
          text-transform: uppercase;
          letter-spacing: 1px;
        }
        
        .stat-change {
          margin-top: 1rem;
          display: inline-flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.75rem;
          background: #00D92420;
          color: #00D924;
          border-radius: 20px;
          font-size: 0.85rem;
          font-weight: 600;
        }
      }
    }
  `}
`;

// 4. Announcement Bar (Supreme/Fashion Nova inspired)
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
  
  ${props => props.scrolling && css`
    .announcement-text {
      display: inline-block;
      padding-left: 100%;
      animation: ${scrollText} 20s linear infinite;
      white-space: nowrap;
    }
  `}
  
  ${props => props.dismissible && css`
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
    
    .close-button {
      position: absolute;
      right: 1rem;
      background: transparent;
      border: none;
      color: white;
      cursor: pointer;
      padding: 0.25rem;
      
      &:hover {
        opacity: 0.8;
      }
    }
  `}
`;

// 5. Countdown Timer (Supreme Drop inspired)
const CountdownSection = styled.section`
  padding: 3rem 2rem;
  text-align: center;
  
  ${props => props.style === 'supreme' && css`
    background: black;
    color: white;
    border: 3px solid ${props => props.theme?.colors?.accent || '#FF0000'};
    
    .countdown-title {
      font-size: 2rem;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-bottom: 2rem;
      color: ${props => props.theme?.colors?.accent || '#FF0000'};
    }
    
    .countdown-timer {
      display: flex;
      justify-content: center;
      gap: 2rem;
      
      .time-unit {
        .value {
          font-size: 4rem;
          font-weight: bold;
          font-family: 'Courier New', monospace;
          color: ${props => props.theme?.colors?.accent || '#FF0000'};
        }
        
        .label {
          text-transform: uppercase;
          font-size: 0.8rem;
          letter-spacing: 1px;
          opacity: 0.7;
        }
      }
    }
  `}
`;

// 6. Gallery (Instagram/Pinterest inspired)
const GallerySection = styled.section`
  padding: 3rem 0;
  
  ${props => props.style === 'instagram' && css`
    .gallery-header {
      text-align: center;
      margin-bottom: 2rem;
      
      h2 {
        font-size: 1.5rem;
        margin-bottom: 0.5rem;
      }
      
      .instagram-handle {
        color: ${props => props.theme?.colors?.accent};
        font-size: 1rem;
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
      }
    }
    
    .gallery-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 2px;
      
      @media (min-width: 768px) {
        grid-template-columns: repeat(3, 1fr);
      }
      
      @media (min-width: 1024px) {
        grid-template-columns: repeat(6, 1fr);
      }
      
      .gallery-item {
        aspect-ratio: 1;
        background: ${props => props.theme?.colors?.surface}50;
        position: relative;
        overflow: hidden;
        cursor: pointer;
        
        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }
        
        .overlay {
          position: absolute;
          inset: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transition: opacity 0.3s ease;
          
          .stats {
            display: flex;
            gap: 1.5rem;
            color: white;
            
            .stat {
              display: flex;
              align-items: center;
              gap: 0.5rem;
              font-size: 1rem;
              font-weight: 600;
            }
          }
        }
        
        &:hover .overlay {
          opacity: 1;
        }
      }
    }
  `}
`;

// Main Component
const HomePagePublic = ({ shopData, theme }) => {
  const navigate = useNavigate();
  const [widgets, setWidgets] = useState(shopData?.homeWidgets || []);
  const [countdown, setCountdown] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });
  const [dismissedAnnouncement, setDismissedAnnouncement] = useState(false);

  // Countdown timer logic
  useEffect(() => {
    const countdownWidget = widgets.find(w => w.type === 'countdown-timer');
    if (countdownWidget?.config?.endDate) {
      const timer = setInterval(() => {
        const now = new Date().getTime();
        const end = new Date(countdownWidget.config.endDate).getTime();
        const distance = end - now;

        if (distance > 0) {
          setCountdown({
            days: Math.floor(distance / (1000 * 60 * 60 * 24)),
            hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
            minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
            seconds: Math.floor((distance % (1000 * 60)) / 1000)
          });
        }
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [widgets]);

  // Render widget based on type and config
  const renderWidget = (widget) => {
    if (!widget.visible) return null;

    switch (widget.type) {
      case 'hero-banner':
        return (
          <HeroBanner 
            key={widget.id}
            style={widget.config.style}
            height={widget.config.height}
            parallax={widget.config.parallax}
            theme={theme}
          >
            {widget.config.style === 'apple' && (
              <div className="hero-content">
                <h1>{widget.config.headline || "Revolutionary Products"}</h1>
                <p>{widget.config.subtitle || "Discover what makes us different"}</p>
                <button className="cta-button">
                  {widget.config.ctaText || "Shop Now"}
                  <ArrowRight size={20} />
                </button>
              </div>
            )}
            
            {widget.config.style === 'tesla' && (
              <>
                {widget.config.backgroundVideo && <video autoPlay muted loop src={widget.config.backgroundVideo} />}
                {widget.config.backgroundImage && <img src={widget.config.backgroundImage} alt="Hero" />}
                <div className="overlay" />
                <div className="hero-content">
                  <h1>{widget.config.headline || "Experience the Future"}</h1>
                  <p>{widget.config.subtitle || "Order Online for Touchless Delivery"}</p>
                  <div className="buttons">
                    <button className="primary">Custom Order</button>
                    <button>Existing Inventory</button>
                  </div>
                </div>
              </>
            )}
            
            {widget.config.style === 'shopify' && (
              <div className="hero-content">
                <div className="text-content">
                  <h1>{widget.config.headline || "Build Your Dream Store"}</h1>
                  <p>{widget.config.subtitle || "Everything you need to sell anywhere"}</p>
                  <div className="email-capture">
                    <input type="email" placeholder="Enter your email" />
                    <button>Start Free</button>
                  </div>
                </div>
                <div className="image-content">
                  {widget.config.heroImage && <img src={widget.config.heroImage} alt="Hero" />}
                </div>
              </div>
            )}
          </HeroBanner>
        );

      case 'announcement-bar':
        return !dismissedAnnouncement && (
          <AnnouncementBar
            key={widget.id}
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
              <button className="close-button" onClick={() => setDismissedAnnouncement(true)}>
                <X size={16} />
              </button>
            )}
          </AnnouncementBar>
        );

      case 'product-carousel':
        return (
          <ProductCarousel key={widget.id} style={widget.config.style} theme={theme}>
            {widget.config.style === 'amazon' && (
              <>
                <div className="section-header">
                  <h2>Featured Products</h2>
                  <a href="#">See all</a>
                </div>
                <div className="carousel-container">
                  <button className="carousel-button prev">
                    <ChevronLeft size={24} />
                  </button>
                  <div className="carousel-track">
                    {shopData?.items?.slice(0, widget.config.itemsToShow || 8).map((item, i) => (
                      <ProductCard key={i} style={widget.config.style} theme={theme}>
                        <div className="product-image">
                          {item.images?.[0] && <img src={item.images[0]} alt={item.name} />}
                          {i === 0 && <div className="badge">Best Seller</div>}
                        </div>
                        <div className="product-info">
                          <div className="product-name">{item.name}</div>
                          <div className="rating">
                            <span className="stars">★★★★☆</span>
                            <span className="count">(128)</span>
                          </div>
                          <div className="price">
                            ${item.price}
                            {i % 3 === 0 && <span className="original">${(item.price * 1.3).toFixed(2)}</span>}
                          </div>
                        </div>
                      </ProductCard>
                    ))}
                  </div>
                  <button className="carousel-button next">
                    <ChevronRight size={24} />
                  </button>
                </div>
              </>
            )}
            
            {widget.config.style === 'supreme' && (
              <div className="products-grid">
                {shopData?.items?.slice(0, 4).map((item, i) => (
                  <ProductCard key={i} style={widget.config.style} theme={theme}>
                    <div className="product-image">
                      {item.images?.[0] && <img src={item.images[0]} alt={item.name} />}
                    </div>
                    <div className="product-name">{item.name}</div>
                    <div className="price">${item.price}</div>
                    {item.quantity === 0 && <div className="sold-out">SOLD OUT</div>}
                  </ProductCard>
                ))}
              </div>
            )}
          </ProductCarousel>
        );

      case 'stats-dashboard':
        return (
          <StatsSection key={widget.id} style={widget.config.style} theme={theme}>
            <div className="stats-grid">
              <div className="stat-card">
                <div className="stat-icon">
                  <Package size={28} />
                </div>
                <div className="stat-value">{shopData?.items?.length || 0}</div>
                <div className="stat-label">Products</div>
                <div className="stat-change">
                  <TrendingUp size={16} />
                  +12% this month
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Users size={28} />
                </div>
                <div className="stat-value">2.4k</div>
                <div className="stat-label">Customers</div>
                <div className="stat-change">
                  <TrendingUp size={16} />
                  +28% this month
                </div>
              </div>
              <div className="stat-card">
                <div className="stat-icon">
                  <Star size={28} />
                </div>
                <div className="stat-value">4.9</div>
                <div className="stat-label">Rating</div>
                <div className="stat-change">
                  <Award size={16} />
                  Top Rated
                </div>
              </div