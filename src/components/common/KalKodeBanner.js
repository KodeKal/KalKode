// src/components/common/KalKodeBanner.js
import React from 'react';
import styled from 'styled-components';

const Banner = styled.div`
  width: 100%;
  padding: 1.5rem;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(10px);
  display: flex;
  justify-content: flex-start;
  align-items: center;
  position: fixed;
  top: 0;
  z-index: 100;
`;

const Logo = styled.h1`
  font-family: 'Impact', sans-serif;
  font-size: 2.5rem;
  background: linear-gradient(45deg, #800000, #4A0404);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  letter-spacing: 2px;
  transform: skew(-5deg);
`;

const KalKodeBanner = () => (
  <Banner>
    <Logo>KALKODE</Logo>
  </Banner>
);

export default KalKodeBanner;