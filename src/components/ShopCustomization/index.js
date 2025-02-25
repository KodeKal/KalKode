// Save at: src/components/ShopCustomization/index.js

import React, { useState } from 'react';
import styled from 'styled-components';
import { 
  Type, 
  Palette, 
  Move, 
  Check, 
  X,
  ChevronDown 
} from 'lucide-react';
import { FONT_PRESETS, COLOR_ADJUSTMENT_PRESETS } from '../../constants/themes';

const CustomizationPanel = styled.div`
  position: fixed;
  right: ${props => props.isOpen ? '0' : '-320px'};
  top: 80px;
  width: 320px;
  height: calc(100vh - 80px);
  background: ${props => props.theme.colors.background};
  border-left: 1px solid ${props => `${props.theme.colors.accent}30`};
  transition: right 0.3s ease;
  z-index: 100;
  display: flex;
  flex-direction: column;
`;

const PanelToggle = styled.button`
  position: absolute;
  left: -40px;
  top: 20px;
  width: 40px;
  height: 40px;
  background: ${props => props.theme.colors.accent};
  border: none;
  border-radius: 4px 0 0 4px;
  color: ${props => props.theme.colors.text};
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;

  &:hover {
    background: ${props => props.theme.colors.primary};
  }
`;

const PanelContent = styled.div`
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
`;

const Section = styled.div`
  margin-bottom: 2rem;

  h3 {
    font-family: ${props => props.theme.fonts.heading};
    color: ${props => props.theme.colors.accent};
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
`;

const PresetsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
`;

const PresetButton = styled.button`
  background: ${props => props.active ? props.theme.colors.surface : 'transparent'};
  border: 1px solid ${props => props.active ? props.theme.colors.accent : props.theme.colors.surface};
  color: ${props => props.theme.colors.text};
  padding: 0.8rem;
  border-radius: ${props => props.theme.styles.borderRadius};
  cursor: pointer;
  transition: all 0.3s ease;
  text-align: left;
  font-family: ${props => props.theme.fonts.body};

  &:hover {
    border-color: ${props => props.theme.colors.accent};
  }

  .font-name {
    font-family: ${props => props.fontFamily};
    font-size: 1.1rem;
    margin-bottom: 0.3rem;
  }

  .description {
    font-size: 0.8rem;
    opacity: 0.7;
  }
`;

const ColorControl = styled.div`
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1rem;

  label {
    flex: 1;
    color: ${props => props.theme.colors.text};
  }

  input[type="color"] {
    width: 40px;
    height: 40px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    background: transparent;

    &::-webkit-color-swatch-wrapper {
      padding: 0;
    }

    &::-webkit-color-swatch {
      border: 1px solid ${props => props.theme.colors.surface};
      border-radius: 4px;
    }
  }
`;

const SaveButton = styled.button`
  background: ${props => props.theme.colors.accent};
  color: ${props => props.theme.colors.text};
  border: none;
  border-radius: ${props => props.theme.styles.borderRadius};
  padding: 1rem;
  width: 100%;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1rem;

  &:hover {
    background: ${props => props.theme.colors.primary};
  }
`;

const ShopCustomization = ({ 
  currentTheme, 
  onFontChange, 
  onColorChange,
  onSave 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedFont, setSelectedFont] = useState(null);
  const [customColors, setCustomColors] = useState(currentTheme.colors);

  const handleFontSelect = (fontPreset) => {
    setSelectedFont(fontPreset);
    onFontChange(FONT_PRESETS[fontPreset]);
  };

  const handleColorChange = (colorKey, value) => {
    const newColors = { ...customColors, [colorKey]: value };
    setCustomColors(newColors);
    onColorChange(newColors);
  };

  const handleSave = () => {
    onSave({ fonts: FONT_PRESETS[selectedFont], colors: customColors });
    setIsOpen(false);
  };

  return (
    <CustomizationPanel isOpen={isOpen}>
      <PanelToggle onClick={() => setIsOpen(!isOpen)}>
        {isOpen ? <X size={20} /> : <Palette size={20} />}
      </PanelToggle>

      <PanelContent>
        <Section>
          <h3><Type size={18} /> Typography</h3>
          <PresetsGrid>
            {Object.entries(FONT_PRESETS).map(([key, preset]) => (
              <PresetButton
                key={key}
                active={selectedFont === key}
                onClick={() => handleFontSelect(key)}
                fontFamily={preset.heading}
              >
                <div className="font-name">Aa</div>
                <div className="description">{key.toLowerCase()}</div>
              </PresetButton>
            ))}
          </PresetsGrid>
        </Section>

        <Section>
          <h3><Palette size={18} /> Colors</h3>
          <ColorControl>
            <label>Accent</label>
            <input
              type="color"
              value={customColors.accent}
              onChange={(e) => handleColorChange('accent', e.target.value)}
            />
          </ColorControl>
          <ColorControl>
            <label>Text</label>
            <input
              type="color"
              value={customColors.text}
              onChange={(e) => handleColorChange('text', e.target.value)}
            />
          </ColorControl>
        </Section>

        <SaveButton onClick={handleSave}>
          <Check size={18} /> Save Changes
        </SaveButton>
      </PanelContent>
    </CustomizationPanel>
  );
};

export default ShopCustomization;
