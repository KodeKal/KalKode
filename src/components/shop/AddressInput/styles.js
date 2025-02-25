// Save at: src/components/shop/AddressInput/styles.js
import styled from 'styled-components';

export const AddressContainer = styled.div`
  margin-bottom: 1rem;
`;

export const AddressField = styled.input`
  width: 100%;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 0.8rem;
  border-radius: 4px;
  color: white;
  margin-bottom: 0.5rem;

  &:focus {
    outline: none;
    border-color: #800000;
  }
`;

export const LocationOptions = styled.div`
  display: flex;
  gap: 1rem;
  align-items: center;
  margin-top: 0.5rem;
`;

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
  cursor: pointer;

  input[type="radio"] {
    accent-color: #800000;
  }
`;

export const UseLocationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  background: transparent;
  border: 1px solid #800000;
  color: #800000;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    background: rgba(128, 0, 0, 0.1);
  }
`;