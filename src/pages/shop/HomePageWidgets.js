import React, { useState, useEffect, useRef } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Heart, MessageCircle, Star, Clock, Mail, Instagram, TrendingUp, Upload, Play, Pause, Phone, MapPin, Calendar, FileText, Image as ImageIcon } from 'lucide-react';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from '../../firebase/config';
import { auth } from '../../firebase/config';

export const NewsletterWidget = ({ config, theme }) => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const styles = {
    medium: {
      background: `linear-gradient(135deg, ${theme?.colors?.background}F5 0%, ${theme?.colors?.surface}80 100%)`,
      padding: '3rem 2rem',
      borderRadius: '16px',
      textAlign: 'center'
    },
    substack: {
      background: 'white',
      color: '#000',
      padding: '3rem 2rem',
      borderRadius: '8px',
      border: '1px solid #e1e1e1'
    },
    minimal: {
      padding: '2rem',
      borderTop: `1px solid ${theme?.colors?.accent}30`,
      borderBottom: `1px solid ${theme?.colors?.accent}30`
    },
    bold: {
      background: theme?.colors?.accent,
      color: 'white',
      padding: '4rem 2rem',
      position: 'relative',
      overflow: 'hidden'
    }
  };

  return (
    <div style={styles[config.style || 'medium']}>
      {!subscribed ? (
        <>
          <h3 style={{ 
            fontSize: '1.8rem', 
            marginBottom: '1rem',
            color: config.style === 'substack' ? '#000' : theme?.colors?.text 
          }}>
            {config.title || 'Stay Updated'}
          </h3>
          <p style={{ 
            marginBottom: '2rem', 
            opacity: 0.8,
            fontSize: '1.1rem' 
          }}>
            {config.incentive || 'Get 10% off your first order'}
          </p>
          <div style={{ 
            display: 'flex', 
            gap: '1rem', 
            maxWidth: '400px', 
            margin: '0 auto' 
          }}>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              style={{
                flex: 1,
                padding: '1rem',
                borderRadius: '8px',
                border: config.style === 'bold' ? 'none' : `1px solid ${theme?.colors?.accent}30`,
                background: config.style === 'bold' ? 'rgba(255,255,255,0.9)' : 'transparent',
                color: config.style === 'bold' ? '#000' : theme?.colors?.text
              }}
            />
            <button
              onClick={() => setSubscribed(true)}
              style={{
                padding: '1rem 2rem',
                background: config.style === 'bold' ? 'white' : theme?.colors?.accent,
                color: config.style === 'bold' ? theme?.colors?.accent : 'white',
                border: 'none',
                borderRadius: '8px',
                fontWeight: 'bold',
                cursor: 'pointer'
              }}
            >
              Subscribe
            </button>
          </div>
        </>
      ) : (
        <div style={{ padding: '2rem' }}>
          <h3 style={{ color: theme?.colors?.accent, marginBottom: '1rem' }}>
            ✓ Subscribed!
          </h3>
          <p>Thank you for subscribing. Check your email for confirmation.</p>
        </div>
      )}
    </div>
  );
};

// Add to HomePageWidgets.js
export const CalendarWidget = ({ config, theme, editable, onUpdate }) => {
  const [events, setEvents] = useState(config.events || []);
  const [showAddEvent, setShowAddEvent] = useState(false);

  const addEvent = (event) => {
    const newEvents = [...events, { ...event, id: Date.now() }];
    setEvents(newEvents);
    if (onUpdate) {
      onUpdate({ ...config, events: newEvents });
    }
    setShowAddEvent(false);
  };

  const removeEvent = (eventId) => {
    const newEvents = events.filter(e => e.id !== eventId);
    setEvents(newEvents);
    if (onUpdate) {
      onUpdate({ ...config, events: newEvents });
    }
  };

  return (
    <div style={{
      padding: '2rem',
      background: `${theme?.colors?.surface}50`,
      borderRadius: '16px',
      maxWidth: '800px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem'
      }}>
        <h2 style={{ 
          color: theme?.colors?.accent,
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          <CalendarIcon size={28} />
          Upcoming Events
        </h2>
        
        {editable && (
          <button
            onClick={() => setShowAddEvent(true)}
            style={{
              background: theme?.colors?.accent,
              color: 'white',
              border: 'none',
              padding: '0.75rem 1.5rem',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <Plus size={16} />
            Add Event
          </button>
        )}
      </div>

      {events.length === 0 ? (
        <p style={{ textAlign: 'center', opacity: 0.7 }}>
          No upcoming events scheduled
        </p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {events.map((event) => (
            <div key={event.id} style={{
              background: `${theme?.colors?.background}80`,
              padding: '1.5rem',
              borderRadius: '12px',
              border: `1px solid ${theme?.colors?.accent}30`,
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start'
            }}>
              <div style={{ flex: 1 }}>
                <h3 style={{ 
                  marginBottom: '0.5rem',
                  color: theme?.colors?.accent 
                }}>
                  {event.title}
                </h3>
                <p style={{ 
                  fontSize: '0.9rem',
                  opacity: 0.8,
                  marginBottom: '0.5rem'
                }}>
                  {event.description}
                </p>
                <div style={{
                  display: 'flex',
                  gap: '1rem',
                  fontSize: '0.85rem',
                  opacity: 0.7
                }}>
                  <span>📅 {event.date}</span>
                  <span>🕒 {event.time}</span>
                </div>
              </div>
              
              {editable && (
                <button
                  onClick={() => removeEvent(event.id)}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: theme?.colors?.accent,
                    cursor: 'pointer',
                    padding: '0.5rem'
                  }}
                >
                  <X size={20} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAddEvent && editable && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.8)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <EventForm 
            onSubmit={addEvent}
            onCancel={() => setShowAddEvent(false)}
            theme={theme}
          />
        </div>
      )}
    </div>
  );
};

const EventForm = ({ onSubmit, onCancel, theme }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    date: '',
    time: ''
  });

  return (
    <div style={{
      background: theme?.colors?.background,
      padding: '2rem',
      borderRadius: '16px',
      maxWidth: '500px',
      width: '90%'
    }}>
      <h3 style={{ marginBottom: '1.5rem', color: theme?.colors?.accent }}>
        Add New Event
      </h3>
      
      <input
        placeholder="Event Title"
        value={formData.title}
        onChange={(e) => setFormData({...formData, title: e.target.value})}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: `1px solid ${theme?.colors?.accent}30`,
          background: 'transparent',
          color: theme?.colors?.text
        }}
      />
      
      <textarea
        placeholder="Event Description"
        value={formData.description}
        onChange={(e) => setFormData({...formData, description: e.target.value})}
        rows={3}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: `1px solid ${theme?.colors?.accent}30`,
          background: 'transparent',
          color: theme?.colors?.text,
          resize: 'vertical'
        }}
      />
      
      <input
        type="date"
        value={formData.date}
        onChange={(e) => setFormData({...formData, date: e.target.value})}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginBottom: '1rem',
          borderRadius: '8px',
          border: `1px solid ${theme?.colors?.accent}30`,
          background: 'transparent',
          color: theme?.colors?.text
        }}
      />
      
      <input
        type="time"
        value={formData.time}
        onChange={(e) => setFormData({...formData, time: e.target.value})}
        style={{
          width: '100%',
          padding: '0.75rem',
          marginBottom: '1.5rem',
          borderRadius: '8px',
          border: `1px solid ${theme?.colors?.accent}30`,
          background: 'transparent',
          color: theme?.colors?.text
        }}
      />
      
      <div style={{ display: 'flex', gap: '1rem' }}>
        <button
          onClick={() => onSubmit(formData)}
          disabled={!formData.title || !formData.date}
          style={{
            flex: 1,
            padding: '0.75rem',
            background: theme?.colors?.accent,
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            cursor: formData.title && formData.date ? 'pointer' : 'not-allowed',
            opacity: formData.title && formData.date ? 1 : 0.5
          }}
        >
          Add Event
        </button>
        <button
          onClick={onCancel}
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
  );
};

// Add to HomePageWidgets.js
export const FeaturedProductsWidget = ({ config, theme, items = [] }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const itemsPerView = config.itemsToShow || 4;

  useEffect(() => {
    if (config.autoPlay) {
      const interval = setInterval(() => {
        setCurrentIndex((prev) => 
          prev + itemsPerView >= items.length ? 0 : prev + 1
        );
      }, 3000);
      return () => clearInterval(interval);
    }
  }, [config.autoPlay, itemsPerView, items.length]);

  const visibleItems = items.slice(currentIndex, currentIndex + itemsPerView);

  return (
    <div style={{ padding: '2rem', position: 'relative' }}>
      <h2 style={{ 
        marginBottom: '2rem', 
        color: theme?.colors?.accent,
        textAlign: 'center',
        fontSize: '2rem'
      }}>
        Featured Products
      </h2>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(auto-fit, minmax(200px, 1fr))`,
        gap: '1.5rem',
        transition: 'all 0.5s ease'
      }}>
        {visibleItems.map((item, index) => (
          <div key={index} style={{
            background: `${theme?.colors?.surface}80`,
            borderRadius: '12px',
            padding: '1rem',
            border: `1px solid ${theme?.colors?.accent}30`,
            transition: 'transform 0.3s ease'
          }}>
            <div style={{
              height: '200px',
              background: item.images?.[0] ? 
                `url(${item.images[0]})` : 
                `${theme?.colors?.background}50`,
              backgroundSize: 'cover',
              backgroundPosition: 'center',
              borderRadius: '8px',
              marginBottom: '1rem'
            }} />
            <h3 style={{ 
              fontSize: '1rem', 
              marginBottom: '0.5rem',
              color: theme?.colors?.text
            }}>
              {item.name}
            </h3>
            <p style={{ 
              color: theme?.colors?.accent, 
              fontWeight: 'bold',
              fontSize: '1.2rem'
            }}>
              ${parseFloat(item.price || 0).toFixed(2)}
            </p>
          </div>
        ))}
      </div>

      {items.length > itemsPerView && (
        <>
          <button
            onClick={() => setCurrentIndex((prev) => 
              prev === 0 ? items.length - itemsPerView : prev - 1
            )}
            style={{
              position: 'absolute',
              left: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              background: theme?.colors?.accent,
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <ChevronLeft size={24} />
          </button>
          
          <button
            onClick={() => setCurrentIndex((prev) => 
              prev + itemsPerView >= items.length ? 0 : prev + 1
            )}
            style={{
              position: 'absolute',
              right: '0',
              top: '50%',
              transform: 'translateY(-50%)',
              background: theme?.colors?.accent,
              border: 'none',
              borderRadius: '50%',
              width: '48px',
              height: '48px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white'
            }}
          >
            <ChevronRight size={24} />
          </button>
        </>
      )}
    </div>
  );
};


export const HeroBannerWidget = ({ config, theme, editable, onUpdate }) => {
  const [uploading, setUploading] = useState(false);

  const handleBackgroundUpload = async (file) => {
    if (!file || !auth.currentUser) return;
    
    setUploading(true);
    try {
      const storageRef = ref(
        storage,
        `shops/${auth.currentUser.uid}/hero/background-${Date.now()}`
      );
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      onUpdate({ ...config, backgroundImage: url });
    } catch (error) {
      console.error('Error uploading background:', error);
      alert('Failed to upload background image');
    } finally {
      setUploading(false);
    }
  };

  const heightOptions = {
    small: '40vh',
    medium: '60vh',
    large: '80vh',
    fullscreen: '100vh'
  };

  const heightValue = heightOptions[config.height] || heightOptions.large;

  return (
    <div style={{
      position: 'relative',
      height: heightValue,
      background: config.backgroundImage ? 
        `url(${config.backgroundImage})` : 
        `linear-gradient(135deg, ${theme?.colors?.accent}20 0%, ${theme?.colors?.background} 100%)`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden'
    }}>
      {/* Overlay for better text readability */}
      <div style={{
        position: 'absolute',
        inset: 0,
        background: config.overlay ? 
          'linear-gradient(to bottom, rgba(0,0,0,0.3), rgba(0,0,0,0.6))' : 
          'transparent'
      }} />

      {/* Content */}
      <div style={{
        position: 'relative',
        zIndex: 2,
        textAlign: 'center',
        padding: '2rem',
        maxWidth: '800px',
        width: '100%'
      }}>
        {editable ? (
          <>
            <input
              type="text"
              value={config.headline || ''}
              onChange={(e) => onUpdate({ ...config, headline: e.target.value })}
              placeholder="Enter headline"
              style={{
                fontSize: 'clamp(2rem, 5vw, 4rem)',
                fontWeight: 'bold',
                textAlign: 'center',
                color: 'white',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid rgba(255,255,255,0.5)',
                width: '100%',
                padding: '0.5rem',
                marginBottom: '1rem',
                textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                outline: 'none'
              }}
            />
            <textarea
              value={config.subtitle || ''}
              onChange={(e) => onUpdate({ ...config, subtitle: e.target.value })}
              placeholder="Enter subtitle"
              style={{
                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                textAlign: 'center',
                color: 'white',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid rgba(255,255,255,0.5)',
                width: '100%',
                padding: '0.5rem',
                resize: 'none',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                outline: 'none'
              }}
              rows={2}
            />
            <input
              type="text"
              value={config.ctaText || ''}
              onChange={(e) => onUpdate({ ...config, ctaText: e.target.value })}
              placeholder="Button text (optional)"
              style={{
                fontSize: '1rem',
                textAlign: 'center',
                color: 'white',
                background: 'transparent',
                border: 'none',
                borderBottom: '2px solid rgba(255,255,255,0.5)',
                width: '200px',
                padding: '0.5rem',
                marginTop: '1rem',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                outline: 'none'
              }}
            />
          </>
        ) : (
          <>
            <h1 style={{ 
              fontSize: 'clamp(2rem, 5vw, 4rem)', 
              fontWeight: 'bold',
              color: 'white',
              textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
              marginBottom: '1rem',
              lineHeight: 1.2
            }}>
              {config.headline || "Welcome to Our Shop"}
            </h1>
            {config.subtitle && (
              <p style={{
                fontSize: 'clamp(1rem, 2vw, 1.5rem)',
                color: 'white',
                textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
                marginBottom: '2rem',
                lineHeight: 1.5
              }}>
                {config.subtitle}
              </p>
            )}
            {config.ctaText && (
              <button style={{
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                fontWeight: 'bold',
                background: theme?.colors?.accent,
                color: 'white',
                border: 'none',
                borderRadius: '50px',
                cursor: 'pointer',
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
              }}>
                {config.ctaText}
              </button>
            )}
          </>
        )}
      </div>

      {/* Background Upload Button (Editor Only) */}
      {editable && (
        <div style={{
          position: 'absolute',
          bottom: '1rem',
          right: '1rem',
          zIndex: 10,
          display: 'flex',
          gap: '0.5rem'
        }}>
          <input
            type="file"
            accept="image/*"
            id="hero-background-upload"
            style={{ display: 'none' }}
            onChange={(e) => e.target.files?.[0] && 
              handleBackgroundUpload(e.target.files[0])}
            disabled={uploading}
          />
          <label
            htmlFor="hero-background-upload"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
              padding: '0.75rem 1.5rem',
              background: 'rgba(0,0,0,0.8)',
              backdropFilter: 'blur(10px)',
              color: 'white',
              borderRadius: '25px',
              cursor: uploading ? 'not-allowed' : 'pointer',
              fontSize: '0.9rem',
              fontWeight: '500',
              transition: 'all 0.3s ease',
              opacity: uploading ? 0.6 : 1
            }}
          >
            <Upload size={18} />
            {uploading ? 'Uploading...' : 'Change Background'}
          </label>
          {config.backgroundImage && (
            <button
              onClick={() => onUpdate({ ...config, backgroundImage: null })}
              style={{
                padding: '0.75rem',
                background: 'rgba(255,0,0,0.8)',
                backdropFilter: 'blur(10px)',
                color: 'white',
                borderRadius: '50%',
                border: 'none',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              title="Remove background"
            >
              <X size={18} />
            </button>
          )}
        </div>
      )}
    </div>
  );
};


// Countdown Timer Widget
export const CountdownWidget = ({ config, theme }) => {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0, seconds: 0 });

  useEffect(() => {
    if (!config.endDate) return;

    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(config.endDate).getTime();
      const distance = end - now;

      if (distance > 0) {
        setTimeLeft({
          days: Math.floor(distance / (1000 * 60 * 60 * 24)),
          hours: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutes: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
          seconds: Math.floor((distance % (1000 * 60)) / 1000)
        });
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [config.endDate]);

  const styles = {
    supreme: {
      background: 'black',
      color: 'white',
      border: `3px solid ${theme?.colors?.accent}`,
      padding: '3rem',
      textAlign: 'center'
    },
    minimal: {
      padding: '2rem',
      textAlign: 'center',
      background: `${theme?.colors?.surface}50`
    },
    digital: {
      background: '#000',
      padding: '3rem',
      textAlign: 'center',
      fontFamily: 'monospace'
    },
    flip: {
      padding: '3rem',
      textAlign: 'center',
      background: `linear-gradient(180deg, ${theme?.colors?.background} 0%, ${theme?.colors?.surface} 100%)`
    }
  };

  return (
    <div style={styles[config.style || 'supreme']}>
      <h2 style={{
        fontSize: '2rem',
        marginBottom: '2rem',
        color: theme?.colors?.accent,
        textTransform: 'uppercase',
        letterSpacing: '2px'
      }}>
        {config.message || 'Next Drop In:'}
      </h2>
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        gap: '2rem'
      }}>
        {Object.entries(timeLeft).map(([unit, value]) => (
          <div key={unit}>
            <div style={{
              fontSize: '3rem',
              fontWeight: 'bold',
              color: theme?.colors?.accent,
              fontFamily: config.style === 'digital' ? 'monospace' : 'inherit'
            }}>
              {String(value).padStart(2, '0')}
            </div>
            <div style={{
              fontSize: '0.8rem',
              textTransform: 'uppercase',
              opacity: 0.7
            }}>
              {unit}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Testimonials Widget
export const TestimonialsWidget = ({ config, theme }) => {
  const testimonials = [
    {
      name: "Sarah J.",
      rating: 5,
      text: "Amazing quality and fast shipping! Will definitely order again.",
      date: "2 days ago"
    },
    {
      name: "Mike R.",
      rating: 5,
      text: "Best online shopping experience I've had. Highly recommend!",
      date: "1 week ago"
    },
    {
      name: "Emily L.",
      rating: 4,
      text: "Great products and customer service. Very satisfied.",
      date: "2 weeks ago"
    }
  ];

  const styles = {
    airbnb: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '2rem',
      padding: '2rem'
    },
    trustpilot: {
      background: '#F7F7F7',
      color: '#000',
      padding: '3rem',
      borderRadius: '12px'
    },
    google: {
      padding: '2rem',
      background: 'white',
      color: '#000',
      borderRadius: '8px'
    },
    cards: {
      display: 'flex',
      gap: '1.5rem',
      overflowX: 'auto',
      padding: '2rem 0'
    }
  };

  const renderStars = (rating) => (
    <div style={{ display: 'flex', gap: '2px', marginBottom: '0.5rem' }}>
      {[...Array(5)].map((_, i) => (
        <Star
          key={i}
          size={16}
          fill={i < rating ? '#FFD700' : 'none'}
          color={i < rating ? '#FFD700' : '#ccc'}
        />
      ))}
    </div>
  );

  return (
    <div style={styles[config.style || 'airbnb']}>
      {config.style !== 'cards' ? (
        testimonials.map((testimonial, index) => (
          <div key={index} style={{
            padding: '1.5rem',
            background: config.style === 'airbnb' ? `${theme?.colors?.surface}50` : 'transparent',
            borderRadius: '12px',
            border: config.style === 'airbnb' ? `1px solid ${theme?.colors?.accent}20` : 'none'
          }}>
            {config.showRating && renderStars(testimonial.rating)}
            <p style={{ marginBottom: '1rem', lineHeight: '1.6' }}>
              "{testimonial.text}"
            </p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong>{testimonial.name}</strong>
              <small style={{ opacity: 0.6 }}>{testimonial.date}</small>
            </div>
          </div>
        ))
      ) : (
        <div style={{ display: 'flex', gap: '1rem', overflowX: 'auto' }}>
          {testimonials.map((testimonial, index) => (
            <div key={index} style={{
              minWidth: '300px',
              padding: '1.5rem',
              background: `${theme?.colors?.surface}50`,
              borderRadius: '12px'
            }}>
              {config.showRating && renderStars(testimonial.rating)}
              <p>"{testimonial.text}"</p>
              <strong>{testimonial.name}</strong>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Enhanced Gallery Widget with Carousel Display
export const GalleryWidget = ({ config, theme, editable, onUpdate }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  
  const images = config.images || Array(6).fill(null);
  const validImages = images.filter(img => img?.url);

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || validImages.length <= 1 || editable) return;
    
    const interval = setInterval(() => {
      setCurrentSlide(prev => (prev + 1) % validImages.length);
    }, config.autoPlaySpeed || 5000);

    return () => clearInterval(interval);
  }, [isAutoPlaying, validImages.length, config.autoPlaySpeed, editable]);

  const handleImageUpload = async (index, file) => {
    if (!file || !editable || !auth.currentUser) return;
    
    setUploadingIndex(index);
    
    try {
      const storageRef = ref(
        storage,
        `shops/${auth.currentUser.uid}/gallery/image-${Date.now()}-${index}`
      );
      
      await uploadBytes(storageRef, file);
      const url = await getDownloadURL(storageRef);
      
      const newImages = [...images];
      newImages[index] = { url, likes: 0, comments: 0 };
      
      if (onUpdate) {
        onUpdate({ ...config, images: newImages });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      alert('Failed to upload image');
    } finally {
      setUploadingIndex(null);
    }
  };

  const handleRemoveImage = (index) => {
    const newImages = [...images];
    newImages[index] = null;
    if (onUpdate) {
      onUpdate({ ...config, images: newImages });
    }
  };

  const handlePrevSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide(prev => prev === 0 ? validImages.length - 1 : prev - 1);
  };

  const handleNextSlide = (e) => {
    e.stopPropagation();
    setCurrentSlide(prev => (prev + 1) % validImages.length);
  };

  // PUBLIC VIEW - Carousel Display
  if (!editable && validImages.length > 0) {
    const currentImage = validImages[currentSlide];
    
    return (
      <div style={{ 
        position: 'relative',
        width: '100%',
        height: config.height || '500px',
        overflow: 'hidden',
        borderRadius: '16px',
        background: `${theme?.colors?.surface}50`
      }}>
        {/* Title Overlay */}
        {config.title && (
          <div style={{
            position: 'absolute',
            top: '2rem',
            left: '2rem',
            zIndex: 10,
            background: 'rgba(0,0,0,0.7)',
            backdropFilter: 'blur(10px)',
            padding: '0.75rem 1.5rem',
            borderRadius: '12px'
          }}>
            <h2 style={{ 
              margin: 0, 
              color: 'white',
              fontSize: 'clamp(1.2rem, 3vw, 1.8rem)',
              fontWeight: 'bold'
            }}>
              {config.title}
            </h2>
          </div>
        )}

        {/* Main Image */}
        <img 
          src={currentImage.url} 
          alt={`Slide ${currentSlide + 1}`}
          style={{ 
            width: '100%', 
            height: '100%', 
            objectFit: 'cover',
            transition: 'opacity 0.5s ease'
          }}
        />

        {/* Image Overlay Info */}
        <div style={{
          position: 'absolute',
          bottom: '5rem',
          left: '2rem',
          right: '2rem',
          zIndex: 10,
          background: 'rgba(0,0,0,0.6)',
          backdropFilter: 'blur(10px)',
          padding: '1rem',
          borderRadius: '12px',
          display: 'flex',
          gap: '2rem',
          alignItems: 'center'
        }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <Heart size={20} /> {currentImage.likes || 0}
          </span>
          <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'white' }}>
            <MessageCircle size={20} /> {currentImage.comments || 0}
          </span>
        </div>

        {/* Navigation Arrows */}
        {validImages.length > 1 && (
          <>
            <button
              onClick={handlePrevSlide}
              style={{
                position: 'absolute',
                left: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                zIndex: 10,
                transition: 'all 0.3s ease'
              }}
            >
              <ChevronLeft size={24} />
            </button>
            <button
              onClick={handleNextSlide}
              style={{
                position: 'absolute',
                right: '1rem',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'rgba(0,0,0,0.7)',
                backdropFilter: 'blur(10px)',
                border: 'none',
                borderRadius: '50%',
                width: '48px',
                height: '48px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                color: 'white',
                zIndex: 10,
                transition: 'all 0.3s ease'
              }}
            >
              <ChevronRight size={24} />
            </button>
          </>
        )}

        {/* Slide Indicators */}
        <div style={{
          position: 'absolute',
          bottom: '2rem',
          left: '50%',
          transform: 'translateX(-50%)',
          display: 'flex',
          gap: '0.5rem',
          zIndex: 10
        }}>
          {validImages.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.stopPropagation();
                setCurrentSlide(index);
              }}
              style={{
                width: currentSlide === index ? '32px' : '12px',
                height: '12px',
                borderRadius: '6px',
                background: currentSlide === index ? 
                  theme?.colors?.accent || 'white' : 
                  'rgba(255,255,255,0.5)',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.3s ease'
              }}
            />
          ))}
        </div>

        {/* Play/Pause Control */}
        {validImages.length > 1 && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsAutoPlaying(!isAutoPlaying);
            }}
            style={{
              position: 'absolute',
              bottom: '2rem',
              right: '2rem',
              background: 'rgba(0,0,0,0.7)',
              backdropFilter: 'blur(10px)',
              border: 'none',
              borderRadius: '50%',
              width: '40px',
              height: '40px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: 'white',
              zIndex: 10
            }}
          >
            {isAutoPlaying ? <Pause size={20} /> : <Play size={20} />}
          </button>
        )}

        {/* Image Counter */}
        <div style={{
          position: 'absolute',
          top: '2rem',
          right: '2rem',
          background: 'rgba(0,0,0,0.7)',
          backdropFilter: 'blur(10px)',
          padding: '0.5rem 1rem',
          borderRadius: '20px',
          color: 'white',
          fontSize: '0.9rem',
          fontWeight: '500',
          zIndex: 10
        }}>
          {currentSlide + 1} / {validImages.length}
        </div>
      </div>
    );
  }

  // EDITOR VIEW - Grid Display (existing code continues...)
  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <input
          type="text"
          value={config.title || ''}
          onChange={(e) => onUpdate && onUpdate({ ...config, title: e.target.value })}
          placeholder="Gallery Title"
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'transparent',
            border: 'none',
            borderBottom: `2px solid ${theme?.colors?.accent}30`,
            color: theme?.colors?.text,
            textAlign: 'center',
            padding: '0.5rem',
            width: '300px',
            outline: 'none'
          }}
        />
      </div>
      
      {/* Grid view for editing - your existing grid code */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${config.columns || 3}, 1fr)`,
        gap: '1rem'
      }}>
        {images.map((img, index) => (
          <div key={index} style={{
            position: 'relative',
            aspectRatio: '1',
            background: `${theme?.colors?.surface}50`,
            borderRadius: '8px',
            overflow: 'hidden',
            cursor: 'pointer',
            border: `1px solid ${theme?.colors?.accent}20`
          }}>
            {img?.url ? (
              <>
                <img 
                  src={img.url} 
                  alt={`Gallery ${index}`}
                  style={{ 
                    width: '100%', 
                    height: '100%', 
                    objectFit: 'cover' 
                  }}
                />
                <button
                  onClick={() => handleRemoveImage(index)}
                  style={{
                    position: 'absolute',
                    top: '0.5rem',
                    right: '0.5rem',
                    background: 'rgba(0,0,0,0.8)',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: 'white',
                    zIndex: 2
                  }}
                >
                  <X size={16} />
                </button>
              </>
            ) : (
              <>
                <input
                  type="file"
                  accept="image/*"
                  id={`gallery-upload-${index}`}
                  style={{ display: 'none' }}
                  onChange={(e) => e.target.files?.[0] && 
                    handleImageUpload(index, e.target.files[0])}
                />
                <label
                  htmlFor={`gallery-upload-${index}`}
                  style={{
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    gap: '0.5rem'
                  }}
                >
                  {uploadingIndex === index ? (
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ 
                        width: '32px', 
                        height: '32px', 
                        border: '3px solid rgba(255,255,255,0.3)',
                        borderTopColor: theme?.colors?.accent,
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        margin: '0 auto 0.5rem'
                      }} />
                      <span style={{ fontSize: '0.8rem', opacity: 0.7 }}>Uploading...</span>
                    </div>
                  ) : (
                    <>
                      <Upload size={32} opacity={0.5} />
                      <span style={{ fontSize: '0.9rem', opacity: 0.7 }}>
                        Upload Image
                      </span>
                    </>
                  )}
                </label>
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// Social Feed Widget
export const SocialFeedWidget = ({ config, theme }) => {
  const posts = [
    { 
      text: "Just dropped our new collection! 🔥", 
      likes: 234, 
      time: "2h ago",
      platform: config.platform || 'instagram'
    },
    { 
      text: "Behind the scenes of our latest photoshoot 📸", 
      likes: 512, 
      time: "1d ago",
      platform: config.platform || 'instagram'
    },
    { 
      text: "Thank you for 10k followers! Special discount code: THANKS10", 
      likes: 892, 
      time: "3d ago",
      platform: config.platform || 'instagram'
    }
  ];

  return (
    <div style={{ padding: '2rem' }}>
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <Instagram size={24} color={theme?.colors?.accent} />
        Latest from {config.platform || 'Instagram'}
      </h3>
      
      <div style={{
        display: config.style === 'grid' ? 'grid' : 'flex',
        gridTemplateColumns: config.style === 'grid' ? 'repeat(auto-fit, minmax(250px, 1fr))' : undefined,
        gap: '1rem',
        overflowX: config.style === 'carousel' ? 'auto' : undefined
      }}>
        {posts.slice(0, config.posts || 6).map((post, index) => (
          <div key={index} style={{
            background: `${theme?.colors?.surface}50`,
            padding: '1.5rem',
            borderRadius: '12px',
            minWidth: config.style === 'carousel' ? '300px' : undefined
          }}>
            <p style={{ marginBottom: '1rem' }}>{post.text}</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem', opacity: 0.7 }}>
              <span>❤️ {post.likes}</span>
              <span>{post.time}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Enhanced Video Widget with YouTube support
export const VideoWidget = ({ config, theme, editable, onUpdate }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  
  const getYouTubeEmbedUrl = (url) => {
    if (!url) return null;
    
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    if (match && match[2].length === 11) {
      return `https://www.youtube.com/embed/${match[2]}`;
    }
    
    return url;
  };

  const styles = {
    vimeo: {
      position: 'relative',
      paddingBottom: '56.25%',
      height: 0,
      overflow: 'hidden',
      borderRadius: '12px'
    },
    youtube: {
      position: 'relative',
      paddingBottom: '56.25%',
      height: 0,
      overflow: 'hidden'
    },
    background: {
      position: 'relative',
      height: '70vh',
      overflow: 'hidden'
    },
    modal: {
      padding: '3rem',
      textAlign: 'center',
      background: `${theme?.colors?.surface}50`,
      borderRadius: '12px'
    }
  };

  const embedUrl = getYouTubeEmbedUrl(config.videoUrl);

  return (
    <div style={styles[config.style || 'youtube']}>
      {config.style === 'modal' ? (
        <>
          <h2 style={{ marginBottom: '1rem' }}>{config.title || 'Watch Our Story'}</h2>
          {editable && (
            <input
              type="text"
              placeholder="Enter YouTube URL"
              value={config.videoUrl || ''}
              onChange={(e) => onUpdate && onUpdate({ ...config, videoUrl: e.target.value })}
              style={{
                width: '100%',
                padding: '0.75rem',
                marginBottom: '1rem',
                borderRadius: '8px',
                border: `1px solid ${theme?.colors?.accent}30`,
                background: 'transparent',
                color: theme?.colors?.text
              }}
            />
          )}
          <button
            onClick={() => setIsPlaying(true)}
            style={{
              padding: '1rem 2rem',
              background: theme?.colors?.accent,
              color: 'white',
              border: 'none',
              borderRadius: '50px',
              fontSize: '1.1rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.5rem'
            }}
          >
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Play size={20} />
            </div>
            Play Video
          </button>
        </>
      ) : embedUrl ? (
        <iframe
          src={embedUrl}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            border: 'none'
          }}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      ) : editable ? (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `${theme?.colors?.surface}50`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '2rem'
        }}>
          <Play size={48} style={{ marginBottom: '1rem', opacity: 0.5 }} />
          <input
            type="text"
            placeholder="Enter YouTube URL"
            value={config.videoUrl || ''}
            onChange={(e) => onUpdate && onUpdate({ ...config, videoUrl: e.target.value })}
            style={{
              width: '100%',
              maxWidth: '400px',
              padding: '0.75rem',
              borderRadius: '8px',
              border: `1px solid ${theme?.colors?.accent}30`,
              background: 'transparent',
              color: theme?.colors?.text,
              textAlign: 'center'
            }}
          />
        </div>
      ) : (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          background: `${theme?.colors?.surface}50`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <Play size={48} style={{ opacity: 0.3 }} />
        </div>
      )}
    </div>
  );
};

// FAQ Widget
export const FAQWidget = ({ config, theme }) => {
  const [openIndex, setOpenIndex] = useState(null);
  
  const faqs = [
    { q: "What is your return policy?", a: "We offer 30-day returns on all items." },
    { q: "How long does shipping take?", a: "Standard shipping takes 3-5 business days." },
    { q: "Do you ship internationally?", a: "Yes, we ship to over 50 countries worldwide." }
  ];

  const styles = {
    notion: {
      padding: '2rem',
      maxWidth: '800px',
      margin: '0 auto'
    },
    stripe: {
      padding: '2rem',
      background: 'white',
      color: '#000',
      borderRadius: '8px'
    },
    accordion: {
      padding: '2rem'
    },
    cards: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
      gap: '1.5rem',
      padding: '2rem'
    }
  };

  return (
    <div style={styles[config.style || 'notion']}>
      <h2 style={{ marginBottom: '2rem', textAlign: 'center' }}>
        Frequently Asked Questions
      </h2>
      
      {config.style === 'cards' ? (
        <div style={styles.cards}>
          {faqs.map((faq, index) => (
            <div key={index} style={{
              padding: '1.5rem',
              background: `${theme?.colors?.surface}50`,
              borderRadius: '12px'
            }}>
              <h4 style={{ marginBottom: '1rem', color: theme?.colors?.accent }}>
                {faq.q}
              </h4>
              <p style={{ opacity: 0.8 }}>{faq.a}</p>
            </div>
          ))}
        </div>
      ) : (
        <div>
          {faqs.map((faq, index) => (
            <div key={index} style={{
              borderBottom: `1px solid ${theme?.colors?.accent}20`,
              paddingBottom: '1rem',
              marginBottom: '1rem'
            }}>
              <button
                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                style={{
                  width: '100%',
                  textAlign: 'left',
                  background: 'transparent',
                  border: 'none',
                  padding: '1rem 0',
                  fontSize: '1.1rem',
                  cursor: 'pointer',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  color: config.style === 'stripe' ? '#000' : theme?.colors?.text
                }}
              >
                {faq.q}
                <span style={{ transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.3s' }}>
                  ⌄
                </span>
              </button>
              {openIndex === index && (
                <p style={{ 
                  padding: '1rem 0', 
                  opacity: 0.8,
                  color: config.style === 'stripe' ? '#000' : theme?.colors?.text
                }}>
                  {faq.a}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// Team Section Widget
export const TeamWidget = ({ config, theme }) => {
  const team = [
    { name: "John Doe", role: "Founder & CEO", bio: "Passionate about creating amazing products." },
    { name: "Jane Smith", role: "Head of Design", bio: "Bringing creativity to every project." },
    { name: "Mike Johnson", role: "Operations Manager", bio: "Ensuring everything runs smoothly." }
  ];

  const styles = {
    slack: {
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
      gap: '2rem',
      padding: '2rem'
    },
    linear: {
      padding: '2rem',
      background: `linear-gradient(135deg, ${theme?.colors?.background} 0%, ${theme?.colors?.surface} 100%)`
    },
    cards: {
      display: 'flex',
      gap: '2rem',
      overflowX: 'auto',
      padding: '2rem'
    },
    minimal: {
      padding: '2rem',
      textAlign: 'center'
    }
  };
  return (
    <div style={styles[config.style || 'slack']}>
      <h2 style={{ 
        gridColumn: '1 / -1', 
        textAlign: 'center', 
        marginBottom: '2rem' 
      }}>
        Meet Our Team
      </h2>
      
      {team.map((member, index) => (
        <div key={index} style={{
          textAlign: 'center',
          padding: '1.5rem',
          background: config.style === 'cards' ? `${theme?.colors?.surface}50` : 'transparent',
          borderRadius: '12px',
          minWidth: config.style === 'cards' ? '280px' : undefined
        }}>
          <div style={{
            width: '100px',
            height: '100px',
            borderRadius: '50%',
            background: theme?.colors?.accent,
            margin: '0 auto 1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem'
          }}>
            {member.name.split(' ').map(n => n[0]).join('')}
          </div>
          <h3 style={{ marginBottom: '0.5rem' }}>{member.name}</h3>
          <p style={{ color: theme?.colors?.accent, marginBottom: '1rem' }}>{member.role}</p>
          {config.showBio && <p style={{ opacity: 0.8 }}>{member.bio}</p>}
        </div>
      ))}
    </div>
  );
};

// NEW: Contact Form Widget
export const ContactFormWidget = ({ config, theme }) => {
  const [formData, setFormData] = useState({ name: '', email: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setSubmitted(true);
    setTimeout(() => {
      setFormData({ name: '', email: '', message: '' });
      setSubmitted(false);
    }, 3000);
  };

  return (
    <div style={{
      maxWidth: '600px',
      margin: '0 auto',
      padding: '3rem 2rem',
      background: `${theme?.colors?.surface}50`,
      borderRadius: '16px'
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '1rem',
        color: theme?.colors?.accent 
      }}>
        {config.title || 'Get In Touch'}
      </h2>
      <p style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        opacity: 0.8 
      }}>
        {config.subtitle || 'We\'d love to hear from you'}
      </p>

      {submitted ? (
        <div style={{
          textAlign: 'center',
          padding: '2rem',
          color: theme?.colors?.accent
        }}>
          <h3>✓ Message Sent!</h3>
          <p>We'll get back to you soon.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit}>
          <input
            type="text"
            placeholder="Your Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              border: `1px solid ${theme?.colors?.accent}30`,
              background: 'transparent',
              color: theme?.colors?.text
            }}
          />
          <input
            type="email"
            placeholder="Your Email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
            style={{
              width: '100%',
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              border: `1px solid ${theme?.colors?.accent}30`,
              background: 'transparent',
              color: theme?.colors?.text
            }}
          />
          <textarea
            placeholder="Your Message"
            value={formData.message}
            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
            required
            rows={5}
            style={{
              width: '100%',
              padding: '1rem',
              marginBottom: '1rem',
              borderRadius: '8px',
              border: `1px solid ${theme?.colors?.accent}30`,
              background: 'transparent',
              color: theme?.colors?.text,
              resize: 'vertical'
            }}
          />
          <button
            type="submit"
            style={{
              width: '100%',
              padding: '1rem',
              background: theme?.colors?.accent,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontSize: '1.1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}
          >
            Send Message
          </button>
        </form>
      )}
    </div>
  );
};

// NEW: Hours/Schedule Widget
export const HoursWidget = ({ config, theme }) => {
  const defaultHours = [
    { day: 'Monday', hours: '9:00 AM - 5:00 PM', open: true },
    { day: 'Tuesday', hours: '9:00 AM - 5:00 PM', open: true },
    { day: 'Wednesday', hours: '9:00 AM - 5:00 PM', open: true },
    { day: 'Thursday', hours: '9:00 AM - 5:00 PM', open: true },
    { day: 'Friday', hours: '9:00 AM - 5:00 PM', open: true },
    { day: 'Saturday', hours: '10:00 AM - 3:00 PM', open: true },
    { day: 'Sunday', hours: 'Closed', open: false }
  ];

  const hours = config.hours || defaultHours;

  return (
    <div style={{
      maxWidth: '500px',
      margin: '0 auto',
      padding: '2rem',
      background: `${theme?.colors?.surface}50`,
      borderRadius: '16px'
    }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <Clock size={32} color={theme?.colors?.accent} />
        <h2 style={{ color: theme?.colors?.accent }}>
          {config.title || 'Hours of Operation'}
        </h2>
      </div>

      {hours.map((schedule, index) => (
        <div key={index} style={{
          display: 'flex',
          justifyContent: 'space-between',
          padding: '1rem',
          borderBottom: `1px solid ${theme?.colors?.accent}20`,
          opacity: schedule.open ? 1 : 0.6
        }}>
          <span style={{ fontWeight: '600' }}>{schedule.day}</span>
          <span style={{ 
            color: schedule.open ? theme?.colors?.text : theme?.colors?.accent 
          }}>
            {schedule.hours}
          </span>
        </div>
      ))}
    </div>
  );
};

// NEW: Location/Map Widget
export const LocationWidget = ({ config, theme }) => {
  return (
    <div style={{
      padding: '2rem',
      background: `${theme?.colors?.surface}50`,
      borderRadius: '16px'
    }}>
      <div style={{ 
        textAlign: 'center', 
        marginBottom: '2rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <MapPin size={32} color={theme?.colors?.accent} />
        <h2 style={{ color: theme?.colors?.accent }}>
          {config.title || 'Visit Us'}
        </h2>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem'
      }}>
        <div>
          <h4 style={{ marginBottom: '1rem', color: theme?.colors?.accent }}>Address</h4>
          <p>{config.address || '123 Main Street'}</p>
          <p>{config.city || 'Houston, TX 77001'}</p>
        </div>
        
        <div>
          <h4 style={{ marginBottom: '1rem', color: theme?.colors?.accent }}>Contact</h4>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <Phone size={16} /> {config.phone || '(555) 123-4567'}
          </p>
          <p style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Mail size={16} /> {config.email || 'info@shop.com'}
          </p>
        </div>
      </div>

      {config.mapUrl && (
        <div style={{
          width: '100%',
          height: '400px',
          borderRadius: '12px',
          overflow: 'hidden'
        }}>
          <iframe
            src={config.mapUrl}
            style={{
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allowFullScreen
            loading="lazy"
          />
        </div>
      )}
    </div>
  );
};

// NEW: Services/Features Widget
export const ServicesWidget = ({ config, theme }) => {
  const defaultServices = [
    { icon: '🚚', title: 'Free Shipping', description: 'On orders over $50' },
    { icon: '🔒', title: 'Secure Payment', description: '100% secure transactions' },
    { icon: '↩️', title: 'Easy Returns', description: '30-day return policy' },
    { icon: '💬', title: '24/7 Support', description: 'Dedicated customer service' }
  ];

  const services = config.services || defaultServices;

  return (
    <div style={{
      padding: '3rem 2rem',
      background: `linear-gradient(135deg, ${theme?.colors?.background} 0%, ${theme?.colors?.surface}50 100%)`
    }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        color: theme?.colors?.accent 
      }}>
        {config.title || 'Why Choose Us'}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {services.map((service, index) => (
          <div key={index} style={{
            textAlign: 'center',
            padding: '2rem',
            background: `${theme?.colors?.surface}50`,
            borderRadius: '12px',
            border: `1px solid ${theme?.colors?.accent}20`
          }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>
              {service.icon}
            </div>
            <h3 style={{ 
              marginBottom: '0.5rem',
              color: theme?.colors?.accent 
            }}>
              {service.title}
            </h3>
            <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
              {service.description}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

// NEW: Blog/News Widget
export const BlogWidget = ({ config, theme }) => {
  const posts = [
    {
      title: 'Our New Product Launch',
      excerpt: 'Excited to announce our latest collection...',
      date: 'Jan 15, 2025',
      image: null
    },
    {
      title: 'Behind the Scenes',
      excerpt: 'Take a look at how we create our products...',
      date: 'Jan 10, 2025',
      image: null
    },
    {
      title: 'Customer Success Stories',
      excerpt: 'Hear from our amazing customers...',
      date: 'Jan 5, 2025',
      image: null
    }
  ];

  return (
    <div style={{ padding: '3rem 2rem' }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        color: theme?.colors?.accent 
      }}>
        {config.title || 'Latest News'}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {posts.map((post, index) => (
          <article key={index} style={{
            background: `${theme?.colors?.surface}50`,
            borderRadius: '12px',
            overflow: 'hidden',
            border: `1px solid ${theme?.colors?.accent}20`,
            cursor: 'pointer',
            transition: 'transform 0.3s'
          }}>
            <div style={{
              height: '200px',
              background: `${theme?.colors?.background}80`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <FileText size={48} opacity={0.3} />
            </div>
            <div style={{ padding: '1.5rem' }}>
              <div style={{ 
                fontSize: '0.8rem', 
                color: theme?.colors?.accent,
                marginBottom: '0.5rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.5rem'
              }}>
                <Calendar size={14} />
                {post.date}
              </div>
              <h3 style={{ marginBottom: '0.5rem' }}>{post.title}</h3>
              <p style={{ opacity: 0.8, fontSize: '0.9rem' }}>
                {post.excerpt}
              </p>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};

// NEW: Pricing/Plans Widget
export const PricingWidget = ({ config, theme }) => {
  const plans = [
    {
      name: 'Basic',
      price: '$9',
      period: '/month',
      features: ['Feature 1', 'Feature 2', 'Feature 3'],
      popular: false
    },
    {
      name: 'Pro',
      price: '$29',
      period: '/month',
      features: ['All Basic features', 'Feature 4', 'Feature 5', 'Priority support'],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '$99',
      period: '/month',
      features: ['All Pro features', 'Feature 6', 'Feature 7', 'Dedicated manager'],
      popular: false
    }
  ];

  return (
    <div style={{ padding: '3rem 2rem' }}>
      <h2 style={{ 
        textAlign: 'center', 
        marginBottom: '3rem',
        color: theme?.colors?.accent 
      }}>
        {config.title || 'Choose Your Plan'}
      </h2>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '2rem',
        maxWidth: '1200px',
        margin: '0 auto'
      }}>
        {plans.map((plan, index) => (
          <div key={index} style={{
            background: plan.popular ? 
              `linear-gradient(135deg, ${theme?.colors?.accent}20 0%, ${theme?.colors?.surface}50 100%)` :
              `${theme?.colors?.surface}50`,
            borderRadius: '16px',
            padding: '2rem',
            border: plan.popular ? 
              `2px solid ${theme?.colors?.accent}` : 
              `1px solid ${theme?.colors?.accent}20`,
            position: 'relative',
            textAlign: 'center'
          }}>
            {plan.popular && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: theme?.colors?.accent,
                color: 'white',
                padding: '0.25rem 1rem',
                borderRadius: '12px',
                fontSize: '0.8rem',
                fontWeight: 'bold'
              }}>
                POPULAR
              </div>
            )}

            <h3 style={{ 
              marginBottom: '1rem',
              color: theme?.colors?.accent 
            }}>
              {plan.name}
            </h3>
            
            <div style={{ marginBottom: '2rem' }}>
              <span style={{ 
                fontSize: '3rem', 
                fontWeight: 'bold',
                color: theme?.colors?.accent 
              }}>
                {plan.price}
              </span>
              <span style={{ opacity: 0.7 }}>{plan.period}</span>
            </div>

            <ul style={{ 
              listStyle: 'none', 
              padding: 0,
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              {plan.features.map((feature, i) => (
                <li key={i} style={{
                  padding: '0.75rem 0',
                  borderBottom: `1px solid ${theme?.colors?.accent}10`
                }}>
                  ✓ {feature}
                </li>
              ))}
            </ul>

            <button style={{
              width: '100%',
              padding: '1rem',
              background: plan.popular ? theme?.colors?.accent : 'transparent',
              color: plan.popular ? 'white' : theme?.colors?.accent,
              border: `2px solid ${theme?.colors?.accent}`,
              borderRadius: '8px',
              fontSize: '1rem',
              fontWeight: 'bold',
              cursor: 'pointer'
            }}>
              Get Started
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};