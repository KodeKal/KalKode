// src/components/auth/LoginModal.js
import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom'; // New import
import { auth } from '../../firebase/config';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { checkExistingShop } from '../../firebase/firebaseService';

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.85);
  backdrop-filter: blur(5px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background: rgba(0, 0, 0, 0.9);
  border: 1px solid rgba(128, 0, 0, 0.3);
  border-radius: 12px;
  padding: 2rem;
  width: 90%;
  max-width: 400px;
  position: relative;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem;
  margin-bottom: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 6px;
  color: white;

  &:focus {
    outline: none;
    border-color: #800000;
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #800000, #4A0404);
  color: white;
  border: none;
  border-radius: 6px;
  margin-bottom: 1rem;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #ff4444;
  margin-bottom: 1rem;
  text-align: center;
`;

const CreateShopButton = styled(Button)`
  background: transparent;
  border: 2px solid #800000;
  color: #800000;

  &:hover {
    background: rgba(128, 0, 0, 0.1);
  }
`;

const LoginModal = ({ onClose, onCreateShop }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Attempt to sign in
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      
      // Check if user has a shop
      const hasShop = await checkExistingShop(userCredential.user.uid);
      
      if (hasShop) {
        // If they have a shop, redirect to shop dashboard
        navigate(`/shop/${userCredential.user.uid}`);
      } else {
        // If they don't have a shop, show the create shop button
        setError('No shop found. Would you like to create one?');
        return; // Don't close modal yet
      }
      
      onClose(); // Close modal on successful login + shop found
    } catch (error) {
      console.error('Login error:', error);
      if (error.code === 'auth/user-not-found' || error.code === 'auth/wrong-password') {
        setError('Invalid email or password');
      } else {
        setError('An error occurred. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={e => e.stopPropagation()}>
        <form onSubmit={handleLogin}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
          />
          
          {error && <ErrorMessage>{error}</ErrorMessage>}
          
          <Button type="submit" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </Button>

          {error?.includes('No shop found') && (
            <CreateShopButton type="button" onClick={onCreateShop}>
              Create Your Shop
            </CreateShopButton>
          )}
        </form>
      </ModalContent>
    </ModalOverlay>
  );
};

export default LoginModal;