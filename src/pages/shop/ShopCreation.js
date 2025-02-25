import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  Camera, 
  Upload, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Layout,
  Grid,
  Image,
  Type,
  Palette,
  MapPin,
  Plus
} from 'lucide-react';
import { useTempStore } from '../../contexts/TempStoreContext';

// Site Templates Configuration
const SITE_TEMPLATES = {
  MINIMAL: {
    id: 'minimal',
    name: 'Minimal & Clean',
    description: 'Clean, simple design focusing on content. Perfect for modern businesses.',
    baseColors: {
      light: {
        background: '#FFFFFF',
        text: '#000000',
        accent: '#777777'
      },
      dark: {
        background: '#000000',
        text: '#FFFFFF',
        accent: '#777777'
      }
    },
    layouts: {
      header: 'centered',
      content: 'full-width',
      navigation: 'minimal'
    },
    features: [
      'Full-width media',
      'Clean typography',
      'Spacious layout',
      'Focus on content'
    ]
  },
  DYNAMIC: {
    id: 'dynamic',
    name: 'Bold & Dynamic',
    description: 'Modern, interactive design with bold elements. Great for social engagement.',
    baseColors: {
      light: {
        background: '#FFFFFF',
        text: '#1C1E21',
        accent: '#2D88FF'
      },
      dark: {
        background: '#1C1E21',
        text: '#FFFFFF',
        accent: '#2D88FF'
      }
    },
    layouts: {
      header: 'dynamic',
      content: 'grid',
      navigation: 'floating'
    },
    features: [
      'Interactive elements',
      'Dynamic grid',
      'Social integration',
      'Modern navigation'
    ]
  },
  CREATIVE: {
    id: 'creative',
    name: 'Creative Portfolio',
    description: 'Showcase-focused design perfect for artists and creators.',
    baseColors: {
      light: {
        background: '#F5F5F5',
        text: '#0F0F0F',
        accent: '#FF3366'
      },
      dark: {
        background: '#0F0F0F',
        text: '#FFFFFF',
        accent: '#FF3366'
      }
    },
    layouts: {
      header: 'creative',
      content: 'masonry',
      navigation: 'artistic'
    },
    features: [
      'Gallery layouts',
      'Media showcase',
      'Artist features',
      'Portfolio sections'
    ]
  }
};

// Add these styled components after the SITE_TEMPLATES config

const PageContainer = styled.div.attrs({ className: 'page-container' })`
  min-height: 100vh;
  background: #000000;
  color: #FFFFFF;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background: 
      radial-gradient(circle at 20% 30%, rgba(128, 0, 0, 0.2) 0%, transparent 50%),
      radial-gradient(circle at 80% 70%, rgba(128, 0, 0, 0.15) 0%, transparent 50%);
    opacity: 0.8;
    animation: galaxySwirl 30s linear infinite;
  }

  &::after {
    content: '';
    position: absolute;
    width: 100%;
    height: 100%;
    background-image: 
      radial-gradient(circle 1px, #FFF 1px, transparent 1px),
      radial-gradient(circle 2px, #800000 1px, transparent 2px);
    background-size: 200px 200px, 300px 300px;
    background-position: 0 0;
    opacity: 0.1;
    animation: twinkle 4s infinite alternate;
  }

  @keyframes galaxySwirl {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes twinkle {
    0%, 100% { opacity: 0.05; }
    50% { opacity: 0.1; }
  }
`;

const FormContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  position: relative;
  z-index: 1;
`;

const FormSection = styled.div`
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(10px);
  border-radius: 20px;
  padding: 2.5rem;
  margin-bottom: 2rem;
  border: 1px solid rgba(255, 255, 255, 0.1);

  h2 {
    font-size: 1.8rem;
    margin-bottom: 2rem;
    background: linear-gradient(45deg, #FFFFFF, #CCCCCC);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const StepIndicator = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
  gap: 2rem;
`;

const Step = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: ${props => props.active ? '#FFFFFF' : 'rgba(255, 255, 255, 0.5)'};
  position: relative;

  .number {
    width: 32px;
    height: 32px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: ${props => props.active ? 'linear-gradient(45deg, #800000, #4A0404)' : 'transparent'};
    border: 1px solid ${props => props.active ? '#800000' : 'rgba(255, 255, 255, 0.2)'};
  }

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    right: -2rem;
    width: 2rem;
    height: 1px;
    background: rgba(255, 255, 255, 0.2);
  }
`;

// Add these after the previous styled components

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
`;

const TemplateCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 15px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid ${props => props.selected ? '#800000' : 'transparent'};

  &:hover {
    transform: translateY(-5px);
  }

  .preview {
    height: 200px;
    background: ${props => props.background};
    position: relative;
    overflow: hidden;
    
    &::before {
      content: '';
      position: absolute;
      inset: 0;
      background: ${props => props.overlay};
      opacity: 0.1;
    }
  }

  .info {
    padding: 1.5rem;

    h3 {
      color: #FFFFFF;
      margin-bottom: 0.5rem;
    }

    p {
      color: rgba(255, 255, 255, 0.7);
      font-size: 0.9rem;
      margin-bottom: 1rem;
    }

    .features {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;

      span {
        font-size: 0.8rem;
        padding: 0.25rem 0.75rem;
        background: rgba(255, 255, 255, 0.1);
        border-radius: 15px;
      }
    }
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid ${props => props.error ? '#FF3366' : 'rgba(255, 255, 255, 0.1)'};
  border-radius: 8px;
  color: white;
  margin-bottom: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme?.accent || '#800000'};
    background: rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.3);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  min-height: 120px;
  margin-bottom: 1rem;
  resize: vertical;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: ${props => props.theme?.accent || '#800000'};
    background: rgba(255, 255, 255, 0.1);
  }
`;

const Button = styled.button`
  background: ${props => props.secondary ? 'transparent' : 'linear-gradient(45deg, #800000, #4A0404)'};
  border: ${props => props.secondary ? '1px solid #800000' : 'none'};
  color: ${props => props.secondary ? '#800000' : 'white'};
  padding: 1rem 2rem;
  border-radius: 30px;
  font-weight: bold;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// Add these after the previous styled components

const ImageUploadArea = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const ImageUploadBox = styled.label`
  aspect-ratio: 1;
  background: rgba(255, 255, 255, 0.05);
  border: 2px dashed rgba(128, 0, 0, 0.3);
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.6);

  &:hover {
    border-color: #800000;
    background: rgba(128, 0, 0, 0.1);
  }

  input {
    display: none;
  }
`;

const PreviewContainer = styled.div`
  background: ${props => props.colors?.primary || '#000000'};
  color: ${props => props.colors?.secondary || '#FFFFFF'};
  min-height: 80vh;
  border-radius: 15px;
  overflow: hidden;
  position: relative;
`;

const PreviewHeader = styled.header`
  background: ${props => props.colors?.primary || 'transparent'};
  padding: 2rem;
  display: flex;
  align-items: center;
  gap: 2rem;
  position: relative;

  ${props => props.template === 'MINIMAL' && `
    justify-content: center;
    text-align: center;
    flex-direction: column;
  `}

  ${props => props.template === 'DYNAMIC' && `
    background: linear-gradient(to right, ${props.colors?.primary}, ${props.colors?.accent}20);
  `}

  ${props => props.template === 'CREATIVE' && `
    min-height: 50vh;
    align-items: flex-end;
    background: linear-gradient(to bottom, transparent, ${props.colors?.primary}),
                url(${props.profile}) center/cover;
  `}
`;

const SuccessModal = styled.div`
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: rgba(0, 0, 0, 0.95);
  padding: 2rem;
  border-radius: 20px;
  width: 90%;
  max-width: 500px;
  text-align: center;
  border: 1px solid rgba(128, 0, 0, 0.3);
  z-index: 1000;
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(5px);
  z-index: 999;
`;

const ErrorMessage = styled.span`
  color: #FF3366;
  font-size: 0.8rem;
  margin-top: -0.5rem;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.25rem;
`;

const ColorCustomization = styled.div`
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  h3 {
    margin-bottom: 1rem;
  }
`;

const ColorPicker = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 1rem;
`;

const ColorOption = styled.button`
  width: 100%;
  aspect-ratio: 1;
  border-radius: 12px;
  border: 2px solid ${props => props.selected ? '#FFFFFF' : 'transparent'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.3s;
  position: relative;
  overflow: hidden;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: linear-gradient(45deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    opacity: 0;
    transition: opacity 0.3s;
  }

  &:hover::before {
    opacity: 1;
  }
`;

// Add this after all styled components

const ShopCreation = () => {
  const navigate = useNavigate();
  const { saveTempStore } = useTempStore();

  // States
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [formData, setFormData] = useState({
    template: null,
    colors: {
      primary: null,
      secondary: null,
      accent: null
    },
    shopName: '',
    description: '',
    profile: null,
    item: {
      name: '',
      price: '',
      description: '',
      images: [],
      zipcode: ''
    }
  });

  // Steps configuration
  const steps = [
    { number: 1, title: 'Choose Template' },
    { number: 2, title: 'Shop Details' },
    { number: 3, title: 'Add Item' },
    { number: 4, title: 'Preview' }
  ];

  // Handler Functions
  const handleTemplateSelect = (templateId) => {
    const template = SITE_TEMPLATES[templateId];
    setFormData(prev => ({
      ...prev,
      template: templateId,
      colors: {
        primary: template.baseColors.light.background,
        secondary: template.baseColors.light.text,
        accent: template.baseColors.light.accent
      }
    }));
  };

  const handleColorSelect = (colorType, color) => {
    setFormData(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: color
      }
    }));
  };

  const handleProfileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          profile: {
            file,
            preview: reader.result
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };
  // Continue adding these handler functions

  const handleItemImageUpload = (e) => {
    const file = e.target.files[0];
    if (file && formData.item.images.length < 3) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          item: {
            ...prev.item,
            images: [...prev.item.images, {
              file,
              preview: reader.result
            }]
          }
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeItemImage = (index) => {
    setFormData(prev => ({
      ...prev,
      item: {
        ...prev.item,
        images: prev.item.images.filter((_, i) => i !== index)
      }
    }));
  };

  const handleSave = async () => {
    try {
      await saveTempStore({
        ...formData,
        createdAt: new Date().toISOString(),
        status: 'pending'
      });
      setShowSuccessModal(true);
    } catch (error) {
      console.error('Error saving shop:', error);
    }
  };

  const handleContinueToSignup = () => {
    navigate('/auth', { 
      state: { 
        mode: 'signup',
        tempData: {
          shopId: Date.now().toString(), // Temporary ID
          shopName: formData.shopName,
          template: formData.template,
          colors: formData.colors,
          profile: formData.profile,
          item: formData.item
        }
      } 
    });
  };

  // Render Functions
  const renderStep = () => {
    switch(currentStep) {
      case 1:
        return (
          <FormSection>
            <h2>Choose Your Template</h2>
            <TemplateGrid>
              {Object.entries(SITE_TEMPLATES).map(([id, template]) => (
                <TemplateCard
                  key={id}
                  selected={formData.template === id}
                  onClick={() => handleTemplateSelect(id)}
                  background={template.baseColors.light.background}
                  overlay={template.baseColors.light.accent}
                >
                  <div className="preview" />
                  <div className="info">
                    <h3>{template.name}</h3>
                    <p>{template.description}</p>
                    <div className="features">
                      {template.features.map((feature, index) => (
                        <span key={index}>{feature}</span>
                      ))}
                    </div>
                  </div>
                </TemplateCard>
              ))}
            </TemplateGrid>
            {formData.template && (
              <ColorCustomization>
                <h3>Customize Colors</h3>
                <div style={{ marginBottom: '2rem' }}>
                  <label>Primary Color</label>
                  <ColorPicker>
                    {['#FFFFFF', '#000000', '#1C1E21', '#F5F5F5'].map(color => (
                      <ColorOption
                        key={color}
                        color={color}
                        selected={formData.colors.primary === color}
                        onClick={() => handleColorSelect('primary', color)}
                      />
                    ))}
                  </ColorPicker>
                </div>

                <div>
                  <label>Accent Color</label>
                  <ColorPicker>
                    {['#800000', '#2D88FF', '#FF3366', '#777777'].map(color => (
                      <ColorOption
                        key={color}
                        color={color}
                        selected={formData.colors.accent === color}
                        onClick={() => handleColorSelect('accent', color)}
                      />
                    ))}
                  </ColorPicker>
                </div>
              </ColorCustomization>
            )}
          </FormSection>
        );

      case 2:
        return (
          <FormSection>
            <h2>Shop Details</h2>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <label>Shop Name</label>
              <Input
                type="text"
                value={formData.shopName}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  shopName: e.target.value
                }))}
                placeholder="Enter your shop name"
              />

              <label>Description</label>
              <TextArea
                value={formData.description}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  description: e.target.value
                }))}
                placeholder="Tell people about your shop..."
              />

              <label>Profile Picture</label>
              <ImageUploadArea>
                {formData.profile ? (
                  <div style={{ position: 'relative' }}>
                    <img 
                      src={formData.profile.preview} 
                      alt="Profile"
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                    <button
                      onClick={() => setFormData(prev => ({ ...prev, profile: null }))}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} color="white" />
                    </button>
                  </div>
                ) : (
                  <ImageUploadBox>
                    <Camera size={24} />
                    <span>Add Profile Picture</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleProfileUpload}
                    />
                  </ImageUploadBox>
                )}
              </ImageUploadArea>
            </div>
          </FormSection>
        );
        case 3:
        return (
          <FormSection>
            <h2>Add Your First Item</h2>
            <div style={{ maxWidth: '600px', margin: '0 auto' }}>
              <label>Item Name</label>
              <Input
                type="text"
                value={formData.item.name}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  item: { ...prev.item, name: e.target.value }
                }))}
                placeholder="What are you selling?"
              />

              <label>Price</label>
              <Input
                type="number"
                value={formData.item.price}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  item: { ...prev.item, price: e.target.value }
                }))}
                placeholder="Enter price"
              />

              <label>Location</label>
              <Input
                type="text"
                value={formData.item.zipcode}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  item: { ...prev.item, zipcode: e.target.value }
                }))}
                placeholder="Enter zipcode"
              />

              <label>Description</label>
              <TextArea
                value={formData.item.description}
                onChange={e => setFormData(prev => ({
                  ...prev,
                  item: { ...prev.item, description: e.target.value }
                }))}
                placeholder="Describe your item..."
              />

              <label>Item Images</label>
              <ImageUploadArea>
                {formData.item.images.map((image, index) => (
                  <div key={index} style={{ position: 'relative' }}>
                    <img 
                      src={image.preview} 
                      alt={`Item ${index + 1}`}
                      style={{ 
                        width: '100%', 
                        height: '100%', 
                        objectFit: 'cover',
                        borderRadius: '12px'
                      }}
                    />
                    <button
                      onClick={() => removeItemImage(index)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        background: 'rgba(0,0,0,0.5)',
                        border: 'none',
                        borderRadius: '50%',
                        padding: '4px',
                        cursor: 'pointer'
                      }}
                    >
                      <X size={16} color="white" />
                    </button>
                  </div>
                ))}
                {formData.item.images.length < 3 && (
                  <ImageUploadBox>
                    <Image size={24} />
                    <span>Add Image</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleItemImageUpload}
                    />
                  </ImageUploadBox>
                )}
              </ImageUploadArea>
            </div>
          </FormSection>
        );

      case 4:
        return (
          <FormSection>
            <h2>Preview Your Shop</h2>
            <PreviewContainer colors={formData.colors}>
              <PreviewHeader 
                template={formData.template} 
                colors={formData.colors}
                profile={formData.profile?.preview}
              >
                <div style={{
                  width: '100px',
                  height: '100px',
                  borderRadius: '50%',
                  overflow: 'hidden'
                }}>
                  {formData.profile && (
                    <img 
                      src={formData.profile.preview} 
                      alt="Profile"
                      style={{
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover'
                      }}
                    />
                  )}
                </div>
                <div>
                  <h1 style={{ 
                    color: formData.colors.accent,
                    fontSize: '2.5rem',
                    marginBottom: '1rem'
                  }}>
                    {formData.shopName}
                  </h1>
                  <p style={{ color: formData.colors.secondary }}>
                    {formData.description}
                  </p>
                </div>
              </PreviewHeader>

              <div style={{ padding: '2rem' }}>
                {formData.item.images[0] && (
                  <img 
                    src={formData.item.images[0].preview} 
                    alt={formData.item.name}
                    style={{
                      width: '100%',
                      maxHeight: '400px',
                      objectFit: 'cover',
                      borderRadius: '12px',
                      marginBottom: '1rem'
                    }}
                  />
                )}
                <h2 style={{ color: formData.colors.accent }}>
                  {formData.item.name}
                </h2>
                <p style={{ fontSize: '1.2rem', margin: '0.5rem 0' }}>
                  ${formData.item.price}
                </p>
                <p>{formData.item.description}</p>
                <div style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.5rem',
                  marginTop: '1rem',
                  color: formData.colors.accent
                }}>
                  <MapPin size={16} />
                  {formData.item.zipcode}
                </div>
              </div>
            </PreviewContainer>
          </FormSection>
        );

      default:
        return null;
    }
  };

  // Component Return
  return (
    <PageContainer>
      <FormContainer>
        <StepIndicator>
          {steps.map((step, index) => (
            <Step 
              key={step.number}
              active={currentStep >= step.number}
            >
              <div className="number">{step.number}</div>
              {step.title}
            </Step>
          ))}
        </StepIndicator>

        {renderStep()}

        {!showSuccessModal && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginTop: '2rem'
          }}>
            {currentStep > 1 && (
              <Button 
                secondary 
                onClick={() => setCurrentStep(prev => prev - 1)}
              >
                <ChevronLeft size={20} /> Back
              </Button>
            )}
            
            {currentStep < steps.length ? (
              <Button 
                onClick={() => setCurrentStep(prev => prev + 1)}
                style={{ marginLeft: 'auto' }}
              >
                Next <ChevronRight size={20} />
              </Button>
            ) : (
              <Button onClick={handleSave}>
                Save & Continue <Upload size={20} />
              </Button>
            )}
          </div>
        )}

        {showSuccessModal && (
          <>
            <Overlay />
            <SuccessModal>
              <h2 style={{ 
                color: '#800000', 
                marginBottom: '1rem',
                fontSize: '1.8rem'
              }}>
                Shop Created!
              </h2>
              <p style={{ marginBottom: '2rem', lineHeight: '1.6' }}>
                Your shop has been temporarily saved. Sign up now to:
                <br /><br />
                • Make your shop live
                <br />
                • Add more items
                <br />
                • Customize your pages
                <br />
                • Connect with customers
              </p>
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                justifyContent: 'center' 
              }}>
                <Button 
                  secondary
                  onClick={() => setShowSuccessModal(false)}
                >
                  Continue Editing
                </Button>
                <Button onClick={handleContinueToSignup}>
                  Continue to Sign Up <ChevronRight size={20} />
                </Button>
              </div>
            </SuccessModal>
          </>
        )}
      </FormContainer>
    </PageContainer>
  );
};

export default ShopCreation;