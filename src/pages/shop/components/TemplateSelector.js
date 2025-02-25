```javascript
// src/pages/shop/components/TemplateSelector.js

import React, { useState } from 'react';
import styled from 'styled-components';
import { ChevronRight, Check, Palette, Layout, Eye } from 'lucide-react';

const SITE_TEMPLATES = {
  MINIMAL: {
    id: 'minimal',
    name: 'Clean & Modern',
    description: 'Apple-inspired minimalist design',
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
    features: [
      'Full-width layouts',
      'Clean typography',
      'Spacious design',
      'Minimal animations'
    ]
  },
  DYNAMIC: {
    id: 'dynamic',
    name: 'Social & Bold',
    description: 'Meta-inspired interactive design',
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
    features: [
      'Grid layouts',
      'Social features',
      'Interactive elements',
      'Dynamic content'
    ]
  },
  CREATIVE: {
    id: 'creative',
    name: 'Portfolio & Gallery',
    description: 'Showcase-focused creative design',
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
    features: [
      'Gallery layouts',
      'Portfolio focus',
      'Artist features',
      'Visual hierarchy'
    ]
  }
};

const Container = styled.div`
  min-height: 100vh;
  background: #000000;
  color: #FFFFFF;
  padding: 2rem;
`;

const Title = styled.h1`
  text-align: center;
  font-size: 2.5rem;
  margin-bottom: 2rem;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
`;

const TemplateGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
`;

const TemplateCard = styled.div`
  background: ${props => props.selected ? 'rgba(255, 255, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)'};
  border-radius: 15px;
  padding: 2rem;
  cursor: pointer;
  transition: all 0.3s;
  border: 2px solid ${props => props.selected ? props.accent : 'transparent'};
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-5px);
    background: rgba(255, 255, 255, 0.08);
  }

  .preview {
    height: 200px;
    background: ${props => props.background};
    border-radius: 8px;
    margin-bottom: 1.5rem;
    position: relative;
    overflow: hidden;
  }

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: ${props => props.selected ? props.accent : '#FFFFFF'};
  }

  p {
    color: rgba(255, 255, 255, 0.7);
    margin-bottom: 1.5rem;
  }

  .features {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;

    span {
      background: rgba(255, 255, 255, 0.1);
      padding: 0.5rem 1rem;
      border-radius: 15px;
      font-size: 0.9rem;
    }
  }
`;

const ColorPicker = styled.div`
  display: flex;
  gap: 1rem;
  margin: 1rem 0;
`;

const ColorOption = styled.button`
  width: 30px;
  height: 30px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? '#FFFFFF' : 'transparent'};
  background: ${props => props.color};
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: scale(1.1);
  }
`;

const PreviewButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: rgba(0, 0, 0, 0.5);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    transform: scale(1.1);
  }
`;

const ContinueButton = styled.button`
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  background: linear-gradient(45deg, #FFD700, #FFA500);
  border: none;
  padding: 1rem 2rem;
  border-radius: 30px;
  color: #000000;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }
`;

const TemplateSelector = ({ onSelect }) => {
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [selectedColorScheme, setSelectedColorScheme] = useState('dark');

  const handleTemplateSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleContinue = () => {
    if (selectedTemplate) {
      onSelect({
        template: SITE_TEMPLATES[selectedTemplate],
        colorScheme: selectedColorScheme
      });
    }
  };

  return (
    <Container>
      <Title>Choose Your Template</Title>
      
      <TemplateGrid>
        {Object.entries(SITE_TEMPLATES).map(([id, template]) => (
          <TemplateCard
            key={id}
            selected={selectedTemplate === id}
            accent={template.baseColors[selectedColorScheme].accent}
            background={template.baseColors[selectedColorScheme].background}
            onClick={() => handleTemplateSelect(id)}
          >
            <div className="preview" />
            <h3>{template.name}</h3>
            <p>{template.description}</p>
            <div className="features">
              {template.features.map((feature, index) => (
                <span key={index}>{feature}</span>
              ))}
            </div>
            <PreviewButton>
              <Eye size={18} />
            </PreviewButton>
          </TemplateCard>
        ))}
      </TemplateGrid>

      {selectedTemplate && (
        <>
          <ColorPicker>
            <ColorOption
              color="#000000"
              selected={selectedColorScheme === 'dark'}
              onClick={() => setSelectedColorScheme('dark')}
            />
            <ColorOption
              color="#FFFFFF"
              selected={selectedColorScheme === 'light'}
              onClick={() => setSelectedColorScheme('light')}
            />
          </ColorPicker>

          <ContinueButton onClick={handleContinue}>
            Continue <ChevronRight size={20} />
          </ContinueButton>
        </>
      )}
    </Container>
  );
};

export default TemplateSelector;
```

Should be placed at:
```
src/pages/shop/components/TemplateSelector.js
```

Would you like me to:
1. Create the EditableComponents next?
2. Add more preview features to the templates?
3. Something else?