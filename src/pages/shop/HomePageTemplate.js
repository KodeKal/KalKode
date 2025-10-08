import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Package, 
  Mail, 
  Phone, 
  MapPin, 
  ChevronLeft, 
  ChevronRight,
  Star,
  Truck,
  Shield,
  Clock,
  Award
} from 'lucide-react';

// Styled Components
const TemplateContainer = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
`;

// Hero Banner with Brand Name
const HeroSection = styled.section`
  min-height: 500px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: linear-gradient(
    135deg, 
    rgba(0, 0, 0, 0.7) 0%, 
    rgba(0, 0, 0, 0.5) 100%
  ), url('https://images.unsplash.com/photo-1557683316-973673baf926?w=1200&q=80');
  background-size: cover;
  background-position: center;
  border-radius: 16px;
  margin-bottom: 3rem;
  position: relative;
  overflow: hidden;

  @media (max-width: 768px) {
    min-height: 400px;
    padding: 3rem 1.5rem;
    margin-bottom: 2rem;
  }

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: ${props => `${props.theme?.colors?.accent}15` || 'rgba(128, 0, 0, 0.15)'};
    animation: pulse 8s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 0.3; }
    50% { opacity: 0.6; }
  }
`;

const BrandName = styled.h1`
  font-size: clamp(2.5rem, 6vw, 4.5rem);
  font-weight: 900;
  color: #FFFFFF;
  margin-bottom: 1rem;
  position: relative;
  z-index: 1;
  font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
  text-shadow: 
    0 0 20px rgba(0, 0, 0, 0.8),
    0 0 40px ${props => props.theme?.colors?.accent || '#800000'},
    2px 2px 4px rgba(0, 0, 0, 0.9);
  letter-spacing: 2px;
  text-transform: uppercase;
  
  /* Add glowing effect */
  filter: drop-shadow(0 0 10px ${props => props.theme?.colors?.accent || '#800000'});
`;

const Tagline = styled.p`
  font-size: clamp(1rem, 2vw, 1.4rem);
  color: #FFFFFF;
  max-width: 600px;
  line-height: 1.6;
  position: relative;
  z-index: 1;
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  text-shadow: 
    0 2px 4px rgba(0, 0, 0, 0.8),
    0 4px 8px rgba(0, 0, 0, 0.6);
  font-weight: 500;
`;

// Mission Statement Section
const MissionSection = styled.section`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}80`};
  border-radius: 16px;
  padding: 3rem 2rem;
  margin-bottom: 3rem;
  text-align: center;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
  }
`;

const MissionTitle = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: ${props => props.theme?.colors?.accent || '#800000'};
  margin-bottom: 1.5rem;
  font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
`;

const MissionText = styled.p`
  font-size: clamp(1rem, 2vw, 1.2rem);
  color: ${props => `${props.theme?.colors?.text}E6` || 'rgba(255, 255, 255, 0.9)'};
  line-height: 1.8;
  max-width: 800px;
  margin: 0 auto;
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
`;

// Featured Items Section
const FeaturedSection = styled.section`
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const SectionTitle = styled.h2`
  font-size: clamp(1.8rem, 4vw, 2.5rem);
  color: ${props => props.theme?.colors?.accent || '#800000'};
  margin-bottom: 2rem;
  text-align: center;
  font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};

  @media (max-width: 768px) {
    margin-bottom: 1.5rem;
  }
`;

const ItemsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
    gap: 1.5rem;
  }
`;

const ItemCard = styled.div`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};
  border-radius: 12px;
  overflow: hidden;
  transition: all 0.3s ease;
  border: 1px solid ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};

  &:hover {
    transform: translateY(-5px);
    border-color: ${props => props.theme?.colors?.accent || '#800000'};
    box-shadow: 0 8px 24px ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  }
`;

const ItemImagePlaceholder = styled.div`
  height: 200px;
  background: ${props => props.theme?.colors?.accentGradient || 'linear-gradient(135deg, rgba(128, 0, 0, 0.3) 0%, rgba(128, 0, 0, 0.1) 100%)'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${props => props.theme?.colors?.accent || '#800000'};
`;

const ItemContent = styled.div`
  padding: 1.5rem;

  h3 {
    font-size: 1.2rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    margin-bottom: 0.5rem;
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
  }

  p {
    color: ${props => `${props.theme?.colors?.text}CC` || 'rgba(255, 255, 255, 0.8)'};
    font-size: 0.9rem;
    margin-bottom: 1rem;
    font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  }

  .price {
    font-size: 1.5rem;
    font-weight: bold;
    color: ${props => props.theme?.colors?.accent || '#800000'};
  }
`;

// Services Section
const ServicesSection = styled.section`
  margin-bottom: 3rem;
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border-radius: 16px;
  padding: 3rem 2rem;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin-bottom: 2rem;
  }
`;

const ServicesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 2rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
    gap: 1.5rem;
  }
`;

const ServiceCard = styled.div`
  text-align: center;
  padding: 1.5rem;
  background: ${props => `${props.theme?.colors?.background}60` || 'rgba(0, 0, 0, 0.6)'};
  border-radius: 12px;
  transition: all 0.3s ease;

  &:hover {
    transform: translateY(-3px);
    background: ${props => `${props.theme?.colors?.background}80` || 'rgba(0, 0, 0, 0.8)'};
  }

  .icon {
    width: 48px;
    height: 48px;
    margin: 0 auto 1rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
  }

  h3 {
    font-size: 1.1rem;
    color: ${props => props.theme?.colors?.text || '#FFFFFF'};
    margin-bottom: 0.5rem;
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
  }

  p {
    font-size: 0.85rem;
    color: ${props => `${props.theme?.colors?.text}99` || 'rgba(255, 255, 255, 0.6)'};
    font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};
  }
`;

// Gallery Section
const GallerySection = styled.section`
  margin-bottom: 3rem;

  @media (max-width: 768px) {
    margin-bottom: 2rem;
  }
`;

const GalleryContainer = styled.div`
  position: relative;
  height: 500px;
  border-radius: 16px;
  overflow: hidden;

  @media (max-width: 768px) {
    height: 300px;
  }
`;

const GalleryImage = styled.div`
  position: absolute;
  width: 100%;
  height: 100%;
  background-image: url('${props => props.imageUrl}');
  background-size: cover;
  background-position: center;
  opacity: ${props => props.active ? 1 : 0};
  transition: opacity 0.5s ease;
  
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(
      to bottom,
      transparent 0%,
      rgba(0, 0, 0, 0.3) 100%
    );
  }
`;

const GalleryButton = styled.button`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  ${props => props.direction === 'left' ? 'left: 1rem;' : 'right: 1rem;'}
  background: ${props => `${props.theme?.colors?.background}DD` || 'rgba(0, 0, 0, 0.7)'};
  border: none;
  border-radius: 50%;
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  z-index: 2;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme?.colors?.accent || '#800000'};
    transform: translateY(-50%) scale(1.1);
  }

  @media (max-width: 768px) {
    width: 40px;
    height: 40px;
  }
`;

const GalleryDots = styled.div`
  position: absolute;
  bottom: 1rem;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 0.5rem;
  z-index: 2;
`;

const Dot = styled.button`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: none;
  background: ${props => props.active ? 
    props.theme?.colors?.accent || '#800000' : 
    'rgba(255, 255, 255, 0.5)'};
  cursor: pointer;
  transition: all 0.3s ease;

  &:hover {
    transform: scale(1.2);
  }
`;

// Contact Footer
const ContactFooter = styled.footer`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}90`};
  border-radius: 16px;
  padding: 3rem 2rem;
  margin-top: 3rem;

  @media (max-width: 768px) {
    padding: 2rem 1.5rem;
    margin-top: 2rem;
  }
`;

const FooterContent = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FooterSection = styled.div`
  h3 {
    font-size: 1.3rem;
    color: ${props => props.theme?.colors?.accent || '#800000'};
    margin-bottom: 1rem;
    font-family: ${props => props.theme?.fonts?.heading || "'Space Grotesk', sans-serif"};
  }
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  font-family: ${props => props.theme?.fonts?.body || "'Inter', sans-serif"};

  svg {
    color: ${props => props.theme?.colors?.accent || '#800000'};
    flex-shrink: 0;
  }
`;

// Main Component
const HomePageTemplate = ({ shopData, theme }) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const galleryImages = [
    { 
      imageUrl: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80',
      label: 'Mountain Landscape'
    },
    { 
      imageUrl: 'https://images.unsplash.com/photo-1511884642898-4c92249e20b6?w=1200&q=80',
      label: 'Ocean Sunset'
    },
    { 
      imageUrl: 'https://images.unsplash.com/photo-1472214103451-9374bd1c798e?w=1200&q=80',
      label: 'Forest Path'
    },
    { 
      imageUrl: 'https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80',
      label: 'Lake View'
    },
    { 
      imageUrl: 'https://images.unsplash.com/photo-1501594907352-04cda38ebc29?w=1200&q=80',
      label: 'Desert Dunes'
    }
  ];

  const services = [
    { icon: Truck, title: 'Fast Shipping', description: 'Quick delivery to your door' },
    { icon: Shield, title: 'Secure Payment', description: 'Your payment is safe' },
    { icon: Clock, title: '24/7 Support', description: 'Always here to help' },
    { icon: Award, title: 'Quality Guarantee', description: 'Top-notch products' }
  ];

  const handlePrevSlide = () => {
    setCurrentSlide((prev) => (prev === 0 ? galleryImages.length - 1 : prev - 1));
  };

  const handleNextSlide = () => {
    setCurrentSlide((prev) => (prev === galleryImages.length - 1 ? 0 : prev + 1));
  };

  return (
    <TemplateContainer>
      {/* Preview Notice */}
      <div style={{
        background: `${theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)',
        border: `2px solid ${theme?.colors?.accent}` || '2px solid #800000',
        borderRadius: '12px',
        padding: '1rem 1.5rem',
        marginBottom: '2rem',
        textAlign: 'center'
      }}>
        <p style={{
          margin: 0,
          color: theme?.colors?.text || '#FFFFFF',
          fontSize: '0.95rem',
          fontFamily: theme?.fonts?.body || "'Inter', sans-serif"
        }}>
          📋 <strong>Preview Mode:</strong> Editable After Sign Up.
        </p>
      </div>
      {/* Hero Banner */}
      <HeroSection theme={theme}>
        <BrandName theme={theme}>
          {shopData?.name || 'Your Brand Name'}
        </BrandName>
        <Tagline theme={theme}>
          Discover quality products crafted with care
        </Tagline>
      </HeroSection>

      {/* Mission Statement */}
      <MissionSection theme={theme}>
        <MissionTitle theme={theme}>Our Mission</MissionTitle>
        <MissionText theme={theme}>
          {shopData?.mission || 
            'We are dedicated to providing exceptional products and services that exceed our customers\' expectations. Quality, innovation, and customer satisfaction are at the heart of everything we do.'}
        </MissionText>
      </MissionSection>

      {/* Featured Items */}
      <FeaturedSection>
        <SectionTitle theme={theme}>Featured Products</SectionTitle>
        <ItemsGrid>
          {(shopData?.items?.slice(0, 3) || [1, 2, 3]).map((item, index) => (
            <ItemCard key={item?.id || index} theme={theme}>
              <ItemImagePlaceholder theme={theme}>
                <Package size={64} />
              </ItemImagePlaceholder>
              <ItemContent theme={theme}>
                <h3>{item?.name || `Product ${index + 1}`}</h3>
                <p>{item?.description || 'Premium quality product description'}</p>
                <div className="price">
                  ${item?.price || '99.99'}
                </div>
              </ItemContent>
            </ItemCard>
          ))}
        </ItemsGrid>
      </FeaturedSection>

      {/* Services */}
      <ServicesSection theme={theme}>
        <SectionTitle theme={theme}>Why Choose Us</SectionTitle>
        <ServicesGrid>
          {services.map((service, index) => (
            <ServiceCard key={index} theme={theme}>
              <service.icon className="icon" />
              <h3>{service.title}</h3>
              <p>{service.description}</p>
            </ServiceCard>
          ))}
        </ServicesGrid>
      </ServicesSection>

      {/* Photo Gallery */}
      <GallerySection>
        <SectionTitle theme={theme}>Gallery Showcase</SectionTitle>
        <GalleryContainer>
          {galleryImages.map((image, index) => (
            <GalleryImage
              key={index}
              imageUrl={image.imageUrl}
              active={currentSlide === index}
            />
          ))}
          <GalleryButton 
            direction="left" 
            onClick={handlePrevSlide}
            theme={theme}
          >
            <ChevronLeft size={24} />
          </GalleryButton>
          <GalleryButton 
            direction="right" 
            onClick={handleNextSlide}
            theme={theme}
          >
            <ChevronRight size={24} />
          </GalleryButton>
          <GalleryDots>
            {galleryImages.map((_, index) => (
              <Dot
                key={index}
                active={currentSlide === index}
                onClick={() => setCurrentSlide(index)}
                theme={theme}
              />
            ))}
          </GalleryDots>
        </GalleryContainer>
      </GallerySection>

      {/* Contact Footer */}
      <ContactFooter theme={theme}>
        <FooterContent>
          <FooterSection theme={theme}>
            <h3>Contact Us</h3>
            <ContactInfo>
              <ContactItem theme={theme}>
                <Mail size={20} />
                <span>info@yourshop.com</span>
              </ContactItem>
              <ContactItem theme={theme}>
                <Phone size={20} />
                <span>(555) 123-4567</span>
              </ContactItem>
              <ContactItem theme={theme}>
                <MapPin size={20} />
                <span>123 Shop Street, City, ST 12345</span>
              </ContactItem>
            </ContactInfo>
          </FooterSection>

          <FooterSection theme={theme}>
            <h3>Business Hours</h3>
            <ContactInfo>
              <ContactItem theme={theme}>
                <Clock size={20} />
                <div>
                  <div>Monday - Friday: 9:00 AM - 6:00 PM</div>
                  <div>Saturday: 10:00 AM - 4:00 PM</div>
                  <div>Sunday: Closed</div>
                </div>
              </ContactItem>
            </ContactInfo>
          </FooterSection>

          <FooterSection theme={theme}>
            <h3>Follow Us</h3>
            <p style={{ 
              color: `${theme?.colors?.text}CC` || 'rgba(255, 255, 255, 0.8)',
              fontFamily: theme?.fonts?.body || "'Inter', sans-serif"
            }}>
              Stay connected with us on social media for updates, promotions, and more!
            </p>
          </FooterSection>
        </FooterContent>
      </ContactFooter>
    </TemplateContainer>
  );
};

export default HomePageTemplate;