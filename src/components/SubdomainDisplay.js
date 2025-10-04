// src/components/SubdomainDisplay.js

import React, { useState } from 'react';
import styled from 'styled-components';
import { Copy, ExternalLink, Check } from 'lucide-react';
import { getSubdomainUrl } from '../utils/subdomainRouter';

const Container = styled.div`
  background: ${props => `${props.theme?.colors?.surface || 'rgba(255, 255, 255, 0.05)'}50`};
  border: 1px solid ${props => `${props.theme?.colors?.accent}30` || 'rgba(128, 0, 0, 0.3)'};
  border-radius: 12px;
  padding: 1.5rem;
  margin: 1.5rem 0;
`;

const Title = styled.h3`
  color: ${props => props.theme?.colors?.accent || '#800000'};
  margin: 0 0 1rem 0;
  font-size: 1.1rem;
`;

const SubdomainDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
`;

const SubdomainUrl = styled.div`
  flex: 1;
  background: ${props => `${props.theme?.colors?.background || '#000000'}80`};
  padding: 0.75rem 1rem;
  border-radius: 8px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
  color: ${props => props.theme?.colors?.text || '#FFFFFF'};
  min-width: 200px;
  word-break: break-all;
`;

const IconButton = styled.button`
  background: transparent;
  border: 1px solid ${props => props.theme?.colors?.accent || '#800000'};
  color: ${props => props.theme?.colors?.accent || '#800000'};
  padding: 0.5rem;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => `${props.theme?.colors?.accent}20` || 'rgba(128, 0, 0, 0.2)'};
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const SubdomainInfo = ({ username, theme }) => {
  const [copied, setCopied] = useState(false);
  
  if (!username) return null;
  
  const subdomainUrl = getSubdomainUrl(username);
  
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(subdomainUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };
  
  const handleVisit = () => {
    window.open(subdomainUrl, '_blank');
  };
  
  return (
    <Container theme={theme}>
      <Title theme={theme}>Your Shop URL</Title>
      <SubdomainDisplay>
        <SubdomainUrl theme={theme}>
          {subdomainUrl}
        </SubdomainUrl>
        <IconButton onClick={handleCopy} theme={theme} title="Copy URL">
          {copied ? <Check size={18} /> : <Copy size={18} />}
        </IconButton>
        <IconButton onClick={handleVisit} theme={theme} title="Visit Shop">
          <ExternalLink size={18} />
        </IconButton>
      </SubdomainDisplay>
      <div style={{ 
        marginTop: '0.75rem', 
        fontSize: '0.85rem', 
        opacity: 0.7,
        color: theme?.colors?.text || '#FFFFFF'
      }}>
        Share this link with your customers to showcase your shop!
      </div>
    </Container>
  );
};

export default SubdomainInfo;