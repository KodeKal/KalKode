// src/pages/shop/components/VerificationSection.js
import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { QrCode, Camera, Check, X } from 'lucide-react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebase/config';
import { TransactionService } from '../../../services/TransactionService';
import QrScanner from 'qr-scanner';

const VerificationContainer = styled.div`
  margin: 1rem 1.5rem;
  padding: 1rem;
  background: rgba(76, 175, 80, 0.1);
  border-radius: 12px;
  border: 1px solid rgba(76, 175, 80, 0.3);
  transition: all 0.3s ease;
  
  h4 {
    color: #4CAF50;
    margin-bottom: 1rem;
    display: flex;
    align-items: center;
    gap: 0.5rem;
  }
  
  .content {
    transition: all 0.3s ease;
    overflow: hidden;
    ${props => props.minimized ? `
      max-height: 0;
      opacity: 0;
      margin: 0;
      padding: 0;
    ` : `
      max-height: 500px;
      opacity: 1;
    `}
  }

  @media (max-width: 768px) {
    margin: 1rem;
    padding: 0.75rem;
  }
`;

const CodeInput = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  position: relative;
  
  input {
    flex: 1;
    padding: 0.75rem 3rem 0.75rem 0.75rem;
    background: rgba(0, 0, 0, 0.2);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    color: white;
    font-family: monospace;
    font-size: 1.2rem;
    text-align: center;
    letter-spacing: 2px;
    text-transform: uppercase;
    
    &:focus {
      outline: none;
      border-color: #4CAF50;
    }

    &::placeholder {
      color: rgba(255, 255, 255, 0.4);
    }
  }
  
  .camera-icon {
    position: absolute;
    right: 0.75rem;
    top: 50%;
    transform: translateY(-50%);
    background: transparent;
    border: none;
    color: #2196F3;
    cursor: pointer;
    padding: 0.25rem;
    border-radius: 4px;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    justify-content: center;
    
    &:hover {
      background: rgba(33, 150, 243, 0.1);
      transform: translateY(-50%) scale(1.1);
    }
  }

  @media (max-width: 768px) {
    input {
      padding: 0.65rem 2.5rem 0.65rem 0.65rem;
      font-size: 1.1rem;
    }
    
    .camera-icon {
      right: 0.65rem;
      
      svg {
        width: 18px;
        height: 18px;
      }
    }
  }
`;

const MessageBox = styled.div`
  margin-bottom: 1rem;
  font-size: 0.9rem;
  padding: 0.75rem;
  border-radius: 8px;
  
  &.error {
    color: #F44336;
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
  }
  
  &.success {
    color: #4CAF50;
    background: rgba(76, 175, 80, 0.1);
    border: 1px solid rgba(76, 175, 80, 0.3);
    font-weight: bold;
    line-height: 1.4;
  }

  @media (max-width: 768px) {
    font-size: 0.85rem;
    padding: 0.65rem;
  }
`;

const ActionButton = styled.button`
  width: 100%;
  padding: 0.75rem;
  background: #4CAF50;
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  transition: all 0.3s;
  
  &:hover:not(:disabled) {
    transform: translateY(-2px);
    filter: brightness(1.1);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
  }

  @media (max-width: 768px) {
    padding: 0.65rem;
    font-size: 0.9rem;
    
    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

const ToggleButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: transparent;
  border: 1px solid rgba(76, 175, 80, 0.5);
  color: #4CAF50;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: rgba(76, 175, 80, 0.1);
    transform: scale(1.05);
  }

  @media (max-width: 768px) {
    width: 28px;
    height: 28px;
    
    svg {
      width: 14px;
      height: 14px;
    }
  }
`;

const CameraModal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.9);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  
  .camera-header {
    color: white;
    text-align: center;
    margin-bottom: 2rem;
    
    h3 {
      margin-bottom: 0.5rem;
      color: #4CAF50;
    }
    
    p {
      opacity: 0.8;
      font-size: 0.9rem;
      margin-bottom: 0.25rem;
    }
    
    .auto-verify-note {
      font-size: 0.8rem;
      opacity: 0.6;
      color: #00BCD4;
    }
  }
  
  .camera-view {
    position: relative;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.5);
    
    video {
      width: 300px;
      height: 300px;
      object-fit: cover;
      background: #000;
      border: 2px solid #4CAF50;
      transform: scaleX(-1);
    }
    
    .scan-overlay {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 200px;
      height: 200px;
      border: 2px solid #4CAF50;
      border-radius: 12px;
      background: transparent;
      box-shadow: 0 0 0 9999px rgba(0, 0, 0, 0.5);
      
      &::before, &::after {
        content: '';
        position: absolute;
        width: 20px;
        height: 20px;
        border: 3px solid #4CAF50;
        border-radius: 3px;
      }
      
      &::before {
        top: -3px;
        left: -3px;
        border-right: transparent;
        border-bottom: transparent;
      }
      
      &::after {
        bottom: -3px;
        right: -3px;
        border-left: transparent;
        border-top: transparent;
      }
    }
  }
  
  .camera-controls {
    display: flex;
    gap: 1rem;
    margin-top: 2rem;
    
    button {
      padding: 0.75rem 1.5rem;
      border: none;
      border-radius: 8px;
      font-weight: bold;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.3s;
      
      &.primary {
        background: #4CAF50;
        color: white;
        
        &:hover {
          background: #45a049;
        }
      }
      
      &.secondary {
        background: #f44336;
        color: white;
        
        &:hover {
          background: #da190b;
        }
      }
    }
  }
  
  .error-message {
    color: #f44336;
    background: rgba(244, 67, 54, 0.1);
    border: 1px solid rgba(244, 67, 54, 0.3);
    padding: 1rem;
    border-radius: 8px;
    margin-top: 1rem;
    text-align: center;
  }

  @media (max-width: 768px) {
    padding: 0.5rem;
    
    .camera-view {
      video {
        width: 250px;
        height: 250px;
      }
      
      .scan-overlay {
        width: 150px;
        height: 150px;
      }
    }
    
    .camera-controls {
      gap: 0.75rem;
      
      button {
        padding: 0.65rem 1.25rem;
        font-size: 0.9rem;
        
        svg {
          width: 16px;
          height: 16px;
        }
      }
    }
  }
`;

const VerificationSection = ({ transactionId, transactionCode }) => {
  const [minimized, setMinimized] = useState(true);
  const [code, setCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showCamera, setShowCamera] = useState(false);
  const [cameraError, setCameraError] = useState(null);

  const videoRef = useRef(null);
  const qrScannerRef = useRef(null);

  // Cleanup camera resources
  const cleanupCamera = useCallback(() => {
    console.log('🧹 Cleaning up camera...');
    
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    
    if (videoRef.current?.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
  }, []);

  // Start QR scanning
  const startQRScanning = useCallback(async () => {
    if (!videoRef.current?.srcObject) return;

    try {
      if (qrScannerRef.current) {
        qrScannerRef.current.destroy();
      }

      qrScannerRef.current = new QrScanner(
        videoRef.current,
        async (result) => {
          const scannedCode = result.data.toUpperCase().trim();
          console.log('🎯 QR Code detected:', scannedCode);
          
          // Stop scanning immediately
          if (qrScannerRef.current) {
            qrScannerRef.current.stop();
          }
          
          // Fill the input field and show detection message
          setCode(scannedCode);
          setCameraError(`✅ Code detected: ${scannedCode}. Verifying...`);
          
          // Wait 2 seconds before closing camera and verifying
          setTimeout(async () => {
            setShowCamera(false);
            cleanupCamera();
            setCameraError(null);
            
            // Now verify the code
            await handleVerifyCode(scannedCode);
          }, 2000);
        },
        {
          returnDetailedScanResult: true,
          highlightScanRegion: true,
          highlightCodeOutline: true,
          maxScansPerSecond: 5,
          preferredCamera: 'environment'
        }
      );

      await qrScannerRef.current.start();
    } catch (error) {
      setCameraError('QR scanning failed: ' + error.message);
    }
  }, []);

  // Toggle camera
  const toggleCamera = useCallback(async () => {
    if (showCamera) {
      cleanupCamera();
      setShowCamera(false);
      setCameraError(null);
      return;
    }

    try {
      setShowCamera(true);
      setCameraError(null);
      
      // Wait for DOM update
      await new Promise(resolve => setTimeout(resolve, 300));
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          facingMode: 'environment',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await new Promise(resolve => {
          videoRef.current.onloadedmetadata = resolve;
        });
        await videoRef.current.play();
        
        // Start QR scanning after video is ready
        setTimeout(startQRScanning, 1500);
      }
    } catch (error) {
      console.error('Camera error:', error);
      setCameraError('Camera error: ' + error.message);
      setShowCamera(false);
    }
  }, [showCamera, cleanupCamera, startQRScanning]);

  // Manual verification
  const handleVerifyCode = useCallback(async (codeToVerify = code) => {
    if (!codeToVerify.trim()) {
      setError('Please enter verification code');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      
      await TransactionService.completeTransaction(transactionId, codeToVerify);
      
      await addDoc(collection(db, 'chats', transactionId, 'messages'), {
        text: '✅ Transaction completed! Funds have been released.',
        sender: 'system',
        senderName: 'System',
        timestamp: serverTimestamp(),
        type: 'system'
      });
      
      setCode('');
      setSuccess(`🎉 CODE VERIFIED! Transaction completed! 💰 Funds released. 📦 Please deliver item. Code: ${codeToVerify}`);
      
      // Auto-minimize after success
      setTimeout(() => setMinimized(true), 3000);
      
    } catch (error) {
      setError(`Invalid code "${codeToVerify}". Please ask buyer for correct pickup code.`);
    } finally {
      setLoading(false);
    }
  }, [code, transactionId]);

  // Cleanup on unmount
  React.useEffect(() => {
    return cleanupCamera;
  }, [cleanupCamera]);

  return (
    <>
      <VerificationContainer minimized={minimized}>
        <h4>
          <ToggleButton 
            onClick={() => setMinimized(!minimized)}
            title={minimized ? "Show Code Entry" : "Hide Code Entry"}
          >
            <QrCode size={14} />
          </ToggleButton>
          Redeem Buyer Code
        </h4>
        
        <div className="content">
          <p>Enter the buyer's pickup code to complete the transaction:</p>
          
          <CodeInput>
            <input
              type="text"
              placeholder="KODE-XXXXXX"
              value={code}
              onChange={(e) => setCode(e.target.value.toUpperCase())}
              maxLength={11}
            />
            <button 
              className="camera-icon"
              onClick={toggleCamera}
              title="Scan QR Code"
            >
              <Camera size={20} />
            </button>
          </CodeInput>
          
          {error && (
            <MessageBox className="error">{error}</MessageBox>
          )}
          
          {success && (
            <MessageBox className="success">{success}</MessageBox>
          )}
          
          <ActionButton 
            onClick={() => handleVerifyCode()}
            disabled={!code || loading}
          >
            <Check size={18} />
            {loading ? 'Verifying...' : 'Complete Transaction'}
          </ActionButton>
        </div>
      </VerificationContainer>

      {/* Camera Modal */}
      {showCamera && (
        <CameraModal onClick={(e) => e.stopPropagation()}>
          <div className="camera-header">
            <h3>Scan QR Code</h3>
            <p>Point camera at buyer's QR code</p>
            <div className="auto-verify-note">
              ✨ Code will be automatically verified when detected
            </div>
          </div>

          <div className="camera-view">
            <video ref={videoRef} autoPlay playsInline muted />
            <div className="scan-overlay"></div>
          </div>

          <div className="camera-controls">
            <button 
              className="secondary" 
              onClick={toggleCamera}
            >
              <X size={16} />
              Stop Camera
            </button>
          </div>
            
          {cameraError && (
            <div className="error-message">
              {cameraError}
            </div>
          )}
        </CameraModal>
      )}
    </>
  );
};

export default VerificationSection;