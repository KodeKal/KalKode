// Save at: src/App.js

import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { TempStoreProvider } from './contexts/TempStoreContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NavMenu from './pages/shop/components/NavMenu';
import { DEFAULT_THEME } from './theme/config/themes';
import { GlobalStyles } from './styles/GlobalStyles';

// Pages
import WelcomePage from './pages/WelcomePage';
import ShopPage from './pages/shop/ShopPage';
import LiveShopCreation from './pages/shop/LiveShopCreation';
import AuthPage from './pages/auth/AuthPage';
import VerifyEmail from './pages/auth/VerifyEmail';
import ShopDashboard from './pages/shop/ShopDashboard';
import ProfilePage from './pages/shop/ProfilePage.js';
import NotificationsPage from './pages/shop/NotificationsPage.js';

// Create a new component for the routes
const AppRoutes = () => {
  const location = useLocation();
  
  const showNavMenu = ['/shop', '/notifications', '/profile'].some(
    path => location.pathname.includes(path) && !location.pathname.includes('/create/template')
  );

  return (
    <>
      {showNavMenu && <NavMenu theme={DEFAULT_THEME} />}
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<WelcomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/shop/create/template" element={<LiveShopCreation />} />
        <Route path="/shop/:userId" element={<ShopPage />} />

        {/* Protected Routes */}
        <Route path="/shop/dashboard" element={
          <ProtectedRoute>
            <ShopDashboard />
          </ProtectedRoute>
        } />
        
        <Route path="/verify-email" element={
          <ProtectedRoute requireVerification={false}>
            <VerifyEmail />
          </ProtectedRoute>
        } />

        <Route path="/profile" element={
          <ProtectedRoute>
            <ProfilePage />
          </ProtectedRoute>
        } />

        <Route path="/notifications" element={
          <ProtectedRoute>
            <NotificationsPage />
          </ProtectedRoute>
        } />
      </Routes>
    </>
  );
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <TempStoreProvider>
          <GlobalStyles />
          <AppRoutes />
        </TempStoreProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;