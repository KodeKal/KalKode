import React, { useState, useEffect } from 'react';
import { Plus, X, ChevronLeft, ChevronRight, Heart, MessageCircle, Star, Clock, Mail, Instagram, TrendingUp } from 'lucide-react';

// Newsletter Widget Component
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

// Gallery Widget
export const GalleryWidget = ({ config, theme }) => {
  const images = Array(6).fill(null).map((_, i) => ({
    id: i,
    likes: Math.floor(Math.random() * 1000),
    comments: Math.floor(Math.random() * 100)
  }));

  const styles = {
    instagram: {
      display: 'grid',
      gridTemplateColumns: `repeat(${config.columns || 3}, 1fr)`,
      gap: '2px'
    },
    pinterest: {
      columnCount: config.columns || 3,
      columnGap: '1rem'
    },
    masonry: {
      display: 'grid',
      gridTemplateColumns: `repeat(auto-fill, minmax(250px, 1fr))`,
      gap: '1rem',
      gridAutoFlow: 'dense'
    }
  };

  return (
    <div>
      <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
        <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>
          Follow Us on Instagram
        </h2>
        <a href="#" style={{ 
          color: theme?.colors?.accent, 
          display: 'inline-flex', 
          alignItems: 'center', 
          gap: '0.5rem',
          textDecoration: 'none'
        }}>
          <Instagram size={20} />
          @yourshop
        </a>
      </div>
      
      <div style={styles[config.style || 'instagram']}>
        {images.map((img) => (
          <div key={img.id} style={{
            position: 'relative',
            aspectRatio: '1',
            background: `${theme?.colors?.surface}50`,
            borderRadius: config.style === 'masonry' ? '8px' : '0',
            overflow: 'hidden',
            cursor: 'pointer',
            marginBottom: config.style === 'pinterest' ? '1rem' : '0'
          }}>
            <div style={{
              position: 'absolute',
              inset: 0,
              background: 'rgba(0,0,0,0.7)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '1.5rem',
              opacity: 0,
              transition: 'opacity 0.3s',
              color: 'white'
            }}
            onMouseEnter={(e) => e.currentTarget.style.opacity = 1}
            onMouseLeave={(e) => e.currentTarget.style.opacity = 0}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Heart size={20} /> {img.likes}
              </span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageCircle size={20} /> {img.comments}
              </span>
            </div>
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

// Video Section Widget
export const VideoWidget = ({ config, theme }) => {
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

  return (
    <div style={styles[config.style || 'vimeo']}>
      {config.style === 'modal' ? (
        <>
          <h2 style={{ marginBottom: '1rem' }}>Watch Our Story</h2>
          <button style={{
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
          }}>
            <div style={{
              width: '40px',
              height: '40px',
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              ▶
            </div>
            Play Video
          </button>
        </>
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
          <div style={{
            width: '80px',
            height: '80px',
            borderRadius: '50%',
            background: theme?.colors?.accent,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'white',
            fontSize: '2rem',
            cursor: 'pointer'
          }}>
            ▶
          </div>
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