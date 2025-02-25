// src/pages/auth/VerifyEmail.js

import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth } from '../../firebase/config';
import { sendEmailVerification } from 'firebase/auth';

const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const VerificationCard = styled.div`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 20px;
  width: 100%;
  max-width: 500px;
  border: 1px solid rgba(128, 0, 0, 0.3);
  text-align: center;

  h2 {
    font-size: 1.8rem;
    margin-bottom: 1.5rem;
    background: linear-gradient(45deg, #800000, #4A0404);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }

  p {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
`;

const EmailHighlight = styled.div`
  background: rgba(255, 255, 255, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin: 1.5rem 0;
  word-break: break-all;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  background: linear-gradient(45deg, #800000, #4A0404);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  margin: 0.5rem;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const StatusMessage = styled.div`
  color: ${props => props.error ? '#FF4444' : '#4CAF50'};
  margin: 1rem 0;
  padding: 1rem;
  border-radius: 8px;
  background: ${props => props.error ? 'rgba(255, 68, 68, 0.1)' : 'rgba(76, 175, 80, 0.1)'};
`;

const Timer = styled.div`
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.6);
  margin-top: 0.5rem;
`;

const VerifyEmail = () => {
  const navigate = useNavigate();
  const [error, setError] = useState(null);
  const [message, setMessage] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (!user) {
        navigate('/auth');
      } else if (user.emailVerified) {
        navigate('/shop/dashboard');
      }
    });

    return () => unsubscribe();
  }, [navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setInterval(() => setCountdown(c => c - 1), 1000);
    }
    return () => clearInterval(timer);
  }, [countdown]);

  const handleResendVerification = async () => {
    try {
      setLoading(true);
      setError(null);
      await sendEmailVerification(auth.currentUser);
      setMessage('Verification email sent successfully!');
      setCountdown(60); // 60 second cooldown
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = () => {
    auth.currentUser.reload().then(() => {
      if (auth.currentUser.emailVerified) {
        navigate('/shop/dashboard');
      } else {
        setMessage('Email not verified yet. Please check your inbox.');
      }
    });
  };

  return (
    <PageContainer>
      <VerificationCard>
        <h2>Verify Your Email</h2>
        <p>We've sent a verification link to:</p>
        <EmailHighlight>
          {auth.currentUser?.email}
        </EmailHighlight>
        <p>Please check your inbox and click the link to verify your email address.</p>

        {error && <StatusMessage error>{error}</StatusMessage>}
        {message && <StatusMessage>{message}</StatusMessage>}

        <Button onClick={handleRefreshStatus}>
          I've Verified My Email
        </Button>

        <Button 
          onClick={handleResendVerification}
          disabled={countdown > 0 || loading}
        >
          Resend Verification Email
        </Button>

        {countdown > 0 && (
          <Timer>
            Can resend in: {countdown}s
          </Timer>
        )}
      </VerificationCard>
    </PageContainer>
  );
};

export default VerifyEmail;
