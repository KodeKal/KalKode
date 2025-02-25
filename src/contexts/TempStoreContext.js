// src/contexts/TempStoreContext.js

import React, { createContext, useContext, useState, useEffect } from 'react';

const TempStoreContext = createContext(null);

export const TempStoreProvider = ({ children }) => {
  const [tempStore, setTempStore] = useState(null);
  const [tempProduct, setTempProduct] = useState(null);

  // Load any existing temp data from localStorage on mount
  useEffect(() => {
    const storedData = localStorage.getItem('tempStore');
    if (storedData) {
      setTempStore(JSON.parse(storedData));
    }
    const storedProduct = localStorage.getItem('tempProduct');
    if (storedProduct) {
      setTempProduct(JSON.parse(storedProduct));
    }
  }, []);

  const saveTempStore = (storeData) => {
    localStorage.setItem('tempStore', JSON.stringify(storeData));
    setTempStore(storeData);
  };

  const saveTempProduct = (productData) => {
    localStorage.setItem('tempProduct', JSON.stringify(productData));
    setTempProduct(productData);
  };

  const clearTempData = () => {
    localStorage.removeItem('tempStore');
    localStorage.removeItem('tempProduct');
    setTempStore(null);
    setTempProduct(null);
  };

  const hasTempData = () => {
    return !!(tempStore || tempProduct);
  };

  return (
    <TempStoreContext.Provider value={{
      tempStore,
      tempProduct,
      saveTempStore,
      saveTempProduct,
      clearTempData,
      hasTempData
    }}>
      {children}
    </TempStoreContext.Provider>
  );
};

export const useTempStore = () => {
  const context = useContext(TempStoreContext);
  if (!context) {
    throw new Error('useTempStore must be used within a TempStoreProvider');
  }
  return context;
};
