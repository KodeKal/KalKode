// Add this component: src/components/Transaction/BarcodeScanner.js
import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Camera, Check, X } from 'lucide-react';

// We would need a barcode scanning library. For this demo, we'll use a mock
// since we can't include the actual implementation in this response
const mockBarcodeDetection = (videoElement, onDetect) => {
  // In a real implementation, we'd use a library like quagga.js or zxing
  // This is a mock that simulates detecting a barcode after a delay
  return {
    start: () => {
      console.log('Started barcode detection');
      // Simulate finding a barcode after 3 seconds
      setTimeout(() => {
        onDetect('KODE-ABC123');
      }, 3000);
    },
    stop: () => {
      console.log('Stopped barcode detection');
    }
  };
};

const ScannerContainer = styled.div`
  position: relative;
  width: 100%;
  max-width: 500px;
  margin: 0 auto;
  background: #000;
  border-radius: 12px;
  overflow: hidden;
`;

const VideoPreview = styled.video`
  width: 100%;
  max-height: 400px;
  object-fit: cover;
`;

const ScanOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.3);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  
  .scan-region {
    width: 70%;
    height: 30%;
    border: 2px solid #800000;
    border-radius: 8px;
    position: relative;
    
    &::before, &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 20px;
      border-color: #800000;
      border-style: solid;
    }
    
    &::before {
      top: -2px;
      left: -2px;
      border-width: 2px 0 0 2px;
    }
    
    &::after {
      bottom: -2px;
      right: -2px;
      border-width: 0 2px 2px 0;
    }
  }
  
  .scanning-line {
    position: absolute;
    height: 2px;
    left: 10%;
    right: 10%;
    background: #800000;
    animation: scan 2s infinite;
  }
  
  @keyframes scan {
    0% { top: 20%; }
    50% { top: 80%; }
    100% { top: 20%; }
  }
  
  .instructions {
    margin-top: 2rem;
    text-align: center;
  }
`;

const SuccessOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0,0,0,0.8);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: white;
  
  .success-icon {
    width: 80px;
    height: 80px;
    border-radius: 50%;
    background: rgba(76, 175, 80, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 1rem;
  }
  
  .code {
    font-family: monospace;
    font-size: 1.5rem;
    font-weight: bold;
    margin: 1rem 0;
  }
`;

const ControlButtons = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 1rem;
  background: rgba(0,0,0,0.8);
`;

const ControlButton = styled.button`
  padding: 0.75rem 1.5rem;
  border-radius: 8px;
  border: none;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  
  &.cancel {
    background: rgba(255,255,255,0.1);
    color: white;
  }
  
  &.confirm {
    background: #4CAF50;
    color: white;
  }
`;

const BarcodeScanner = ({ onScan, onCancel }) => {
  const videoRef = useRef(null);
  const [scanning, setScanning] = useState(true);
  const [detectedCode, setDetectedCode] = useState(null);
  const scannerRef = useRef(null);
  
  useEffect(() => {
    if (!videoRef.current) return;
    
    // In a real implementation, we would:
    // 1. Request camera access
    // 2. Set up the video stream
    // 3. Initialize a barcode scanning library
    
    // For this demo, we'll use our mock implementation
    scannerRef.current = mockBarcodeDetection(videoRef.current, (code) => {
      setDetectedCode(code);
      setScanning(false);
    });
    
    scannerRef.current.start();
    
    return () => {
      if (scannerRef.current) {
        scannerRef.current.stop();
      }
    };
  }, [videoRef]);
  
  const handleConfirm = () => {
    if (detectedCode) {
      onScan(detectedCode);
    }
  };
  
  return (
    <ScannerContainer>
      <VideoPreview 
        ref={videoRef}
        autoPlay
        muted
        playsInline
        // For the demo, we'll use a placeholder
        poster="/api/placeholder/400/300"
      />
      
      {scanning ? (
        <ScanOverlay>
          <div className="scan-region">
            <div className="scanning-line"></div>
          </div>
          <div className="instructions">
            Position the QR or Barcode within the frame
          </div>
        </ScanOverlay>
      ) : (
        <SuccessOverlay>
          <div className="success-icon">
            <Check size={40} color="#4CAF50" />
          </div>
          <h3>Code Detected!</h3>
          <div className="code">{detectedCode}</div>
        </SuccessOverlay>
      )}
      
      <ControlButtons>
        <ControlButton className="cancel" onClick={onCancel}>
          <X size={16} />
          Cancel
        </ControlButton>
        
        {!scanning && (
          <ControlButton className="confirm" onClick={handleConfirm}>
            <Check size={16} />
            Confirm Code
          </ControlButton>
        )}
      </ControlButtons>
    </ScannerContainer>
  );
};

export default BarcodeScanner;