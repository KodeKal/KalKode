import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { auth, googleProvider } from '../../firebase/config';
import { 
  signInWithPopup, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  sendEmailVerification 
} from 'firebase/auth';
import { 
  saveShopData, 
  checkExistingShop, 
  uploadShopImages 
} from '../../firebase/firebaseService';
import { useAuth } from '../../contexts/AuthContext';


// Styled Components
const PageContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(to bottom, #0B0B3B, #1A1A4C);
  color: #FFFFFF;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem;
`;

const AuthForm = styled.div`
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(10px);
  padding: 2.5rem;
  border-radius: 20px;
  width: 100%;
  max-width: 400px;
  border: 1px solid rgba(128, 0, 0, 0.3);

  h2 {
    text-align: center;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    background: linear-gradient(45deg, #800000, #4A0404);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
  }
`;

const GoogleButton = styled.button`
  width: 100%;
  padding: 1rem;
  background: white;
  color: #333;
  border: none;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: #f5f5f5;
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }

  img {
    width: 20px;
    height: 20px;
  }
`;

const Divider = styled.div`
  display: flex;
  align-items: center;
  text-align: center;
  margin: 2rem 0;
  color: rgba(255, 255, 255, 0.5);

  &::before,
  &::after {
    content: '';
    flex: 1;
    border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  }

  &::before {
    margin-right: 1rem;
  }

  &::after {
    margin-left: 1rem;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  color: white;
  margin-bottom: 1rem;
  transition: all 0.3s;

  &:focus {
    outline: none;
    border-color: #800000;
    background: rgba(255, 255, 255, 0.1);
  }

  &::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }
`;

const Button = styled.button`
  width: 100%;
  padding: 1rem;
  background: linear-gradient(45deg, #800000, #4A0404);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    transform: translateY(-2px);
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  color: #FF4444;
  background: rgba(255, 68, 68, 0.1);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 0.9rem;
  text-align: center;
`;

const InfoText = styled.p`
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: white;
  animation: spin 1s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

// Added password requirements component
const PasswordRequirements = styled.div`
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.6);
  margin-bottom: 1rem;
  
  ul {
    list-style: none;
    padding-left: 0;
  }

  li {
    margin: 0.25rem 0;
    display: flex;
    align-items: center;
    gap: 0.5rem;

    &.met {
      color: #4CAF50;
    }
  }
`;

const AuthPage = () => {
  const { signInWithGoogle } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const tempData = location.state?.tempData;
  const mode = location.state?.mode || 'login'; // Default to login mode
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const [passwordStrength, setPasswordStrength] = useState({
    length: false,
    number: false,
    special: false,
    uppercase: false
  });

  const handlePasswordChange = (e) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError(null);
      const user = await signInWithGoogle();
      const hasShop = await checkExistingShop(user.uid);
      
      if (hasShop) {
        navigate(`/shop/${user.uid}`);
      } else {
        setError("You don't have a shop yet! Create one to get started.");
        // Stay on page and let user click the button themselves
      }
    } catch (err) {
      console.error('Google login error:', err);
      if (err.code === 'auth/popup-blocked') {
        setError('Popup was blocked. Please allow popups for this site.');
      } else {
        setError('An error occurred while signing in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  // src/pages/auth/AuthPage.js

// Update the handleEmailSignup function (around line 150):
const handleEmailSignup = async (e) => {
  e.preventDefault();
  try {
    setLoading(true);
    setError(null);
    
    const result = await createUserWithEmailAndPassword(auth, email, password);
    await sendEmailVerification(result.user);
    
    if (tempData) {
      // Generate username if not present
      let dataToSave = { ...tempData };
      
      if (!dataToSave.username && dataToSave.name) {
        const { generateUsername } = await import('../../firebase/firebaseService');
        dataToSave.username = await generateUsername(dataToSave.name);
        console.log('Generated username for new user:', dataToSave.username);
      }
      
      await saveShopData(result.user.uid, dataToSave);
      console.log('Shop saved with username:', dataToSave.username);
    }
    
    navigate('/verify-email');
  } catch (err) {
    console.error('Email signup error:', err);
    setError(err.message);
  } finally {
    setLoading(false);
  }
};

// Update the handleGoogleSignup function (around line 250):
const handleGoogleSignup = async () => {
  try {
    setLoading(true);
    setError(null);
    
    if (tempData) {
      sessionStorage.setItem('tempShopData', JSON.stringify(tempData));
    }

    const user = await signInWithGoogle();
    
    if (tempData) {
      try {
        // Generate username if not present
        let dataToSave = { ...tempData };
        
        if (!dataToSave.username && dataToSave.name) {
          const { generateUsername } = await import('../../firebase/firebaseService');
          dataToSave.username = await generateUsername(dataToSave.name);
          console.log('Generated username for Google signup:', dataToSave.username);
        }
        
        await saveShopData(user.uid, dataToSave);
        console.log('Shop saved via Google signup with username:', dataToSave.username);
        
        navigate(`/shop/${user.uid}`, { replace: true });
      } catch (saveError) {
        console.error('Error saving shop data:', saveError);
        setError('Failed to save shop data. Please try again.');
      }
    } else {
      navigate('/shop/dashboard', { replace: true });
    }
  } catch (err) {
    if (err.code === 'auth/popup-blocked') {
      setError('Popup was blocked. Please allow popups for this site and try again.');
    } else {
      console.error('Google signup error:', err);
      setError(err.message || 'Failed to sign up with Google');
    }
  } finally {
    setLoading(false);
    if (tempData && error) {
      sessionStorage.removeItem('tempShopData');
    }
  }
};

  // Handle normal email login
  const handleEmailLogin = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setError(null);
      
      const result = await signInWithEmailAndPassword(auth, email, password);
      
      // After successful login, check if user has a shop
      const hasShop = await checkExistingShop(result.user.uid);
      
      if (hasShop) {
        navigate(`/shop/${user.uid}`);
      } else {
        setError("You don't have a shop yet! Create one to get started.");
        // Don't automatically redirect - let user click the button
      }
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError("No account found with this email. Would you like to create one?");
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password. Please try again.');
      } else {
        setError('An error occurred while signing in. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const validatePassword = (pass) => {
    setPasswordStrength({
      length: pass.length >= 8,
      number: /\d/.test(pass),
      special: /[!@#$%^&*]/.test(pass),
      uppercase: /[A-Z]/.test(pass)
    });
  };
  
  return (
    <PageContainer>
      <AuthForm>
        <h2>{mode === 'login' ? 'Sign In' : 'Create Your Account'}</h2>
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <GoogleButton
          onClick={mode === 'login' ? handleGoogleLogin : handleGoogleSignup}
          disabled={loading}
        >
          <img 
            src="https://cdn.cdnlogo.com/logos/g/35/google-icon.svg" 
            alt="Google"
          />
          {mode === 'login' ? 'Sign in with Google' : 'Continue with Google'}
        </GoogleButton>

        <Divider>or</Divider>

        <form onSubmit={mode === 'login' ? handleEmailLogin : handleEmailSignup}>
          <Input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            type="password"
            placeholder="Password"
            value={password}
            onChange={mode === 'login' ? (e) => setPassword(e.target.value) : handlePasswordChange}
            required
          />

          {mode === 'signup' && (
            <PasswordRequirements>
              <ul>
                <li className={passwordStrength.length ? 'met' : ''}>
                  ✓ At least 8 characters
                </li>
                <li className={passwordStrength.number ? 'met' : ''}>
                  ✓ Contains a number
                </li>
                <li className={passwordStrength.special ? 'met' : ''}>
                  ✓ Contains a special character
                </li>
                <li className={passwordStrength.uppercase ? 'met' : ''}>
                  ✓ Contains an uppercase letter
                </li>
              </ul>
            </PasswordRequirements>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <LoadingSpinner />
                <span style={{ marginLeft: '0.5rem' }}>Loading...</span>
              </div>
            ) : (
              mode === 'login' ? 'Sign In' : 'Create Account'
            )}
          </Button>
        </form>

        <InfoText>
          {mode === 'login' ? (
            error?.includes("don't have a shop") ? (
              <>
                Ready to start selling? <br />
                <Button 
                  onClick={() => navigate('/shop/create/template')} 
                  style={{ marginTop: '1rem' }}
                >
                  Create Your Shop
                </Button>
              </>
            ) : error?.includes("No account found") ? (
              <>
                New to KalKode? <br />
                <Button 
                  onClick={() => navigate('/shop/create/template')} 
                  style={{ marginTop: '1rem' }}
                >
                  Open a Shop
                </Button>
              </>
            ) : (
              <>
                Don't have an account? <br />
                <Button 
                  onClick={() => navigate('/shop/create/template')} 
                  style={{ marginTop: '1rem' }}
                >
                  Open a Shop
                </Button>
              </>
            )
          ) : (
            'Your shop will be saved after creating your account'
          )}
        </InfoText>
      </AuthForm>
    </PageContainer>
  );
};
    
    export default AuthPage;