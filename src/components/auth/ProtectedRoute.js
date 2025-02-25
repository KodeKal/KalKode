// src/components/auth/ProtectedRoute.js

import React, { useState, useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import styled from 'styled-components';
import { saveShopData } from '../../firebase/firebaseService';
import { useNavigate } from 'react-router-dom';


const LoadingContainer = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
`;

const LoadingSpinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-radius: 50%;
  border-top-color: #800000;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const ProtectedRoute = ({ children, requireVerification = true }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    // Check for stored temp data
    const storedData = sessionStorage.getItem('tempShopData');
    if (storedData && user) {
      const tempData = JSON.parse(storedData);
      saveShopData(user.uid, tempData)
        .then(() => {
          sessionStorage.removeItem('tempShopData');
          navigate('/shop/dashboard', { replace: true });
        })
        .catch((err) => console.error('Error saving stored shop data:', err));
    }
  }, [user, navigate]);

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  if (requireVerification && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  return children;
};

export default ProtectedRoute;