// src/App.js - Complete with Subdomain Support

import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation, Navigate  } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { TempStoreProvider } from './contexts/TempStoreContext';
import { LocationProvider } from './contexts/LocationContext';
import ProtectedRoute from './components/auth/ProtectedRoute';
import NavMenu from './pages/shop/components/NavMenu';
import BottomNavigation from './components/BottomNavigation/BottomNavigation';
import { DEFAULT_THEME } from './theme/config/themes';
import { GlobalStyles } from './styles/GlobalStyles';
import { parseSubdomain, redirectToMainApp, isSubdomainAllowedRoute } from './utils/subdomainRouter';

// Pages
import WelcomePage from './pages/WelcomePage';
import ShopPage from './pages/shop/ShopPage';
import LiveShopCreation from './pages/shop/LiveShopCreation';
import AuthPage from './pages/auth/AuthPage';
import VerifyEmail from './pages/auth/VerifyEmail';
import ShopDashboard from './pages/shop/ShopDashboard';
import ProfilePage from './pages/shop/ProfilePage.js';
import NotificationsPage from './pages/shop/NotificationsPage.js';
import ShopPublicView from './pages/shop/shopPublicView.js';
import MessagesPage from './pages/shop/MessagesPage';


// Updated SubdomainHandler Component for App.js

const SubdomainHandler = ({ shopUsername }) => {
  const [shopId, setShopId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchShopByUsername = async () => {
      try {
        setLoading(true);
        
        console.log('🔍 Searching for shop with username:', shopUsername);
        
        const { collection, query, where, getDocs } = await import('firebase/firestore');
        const { db } = await import('./firebase/config');
        
        // Query shops collection for matching username
        const shopsRef = collection(db, 'shops');
        const q = query(shopsRef, where('username', '==', shopUsername));
        
        console.log('📡 Executing Firestore query...');
        const querySnapshot = await getDocs(q);
        
        console.log('📊 Query results:', {
          empty: querySnapshot.empty,
          size: querySnapshot.size,
          docs: querySnapshot.docs.map(doc => ({ id: doc.id, username: doc.data().username }))
        });
        
        if (querySnapshot.empty) {
          console.error('❌ No shop found with username:', shopUsername);
          
          // Additional debugging: List all shops to verify data
          const allShopsQuery = query(shopsRef);
          const allShops = await getDocs(allShopsQuery);
          console.log('📋 All shops in database:', 
            allShops.docs.map(doc => ({ 
              id: doc.id, 
              name: doc.data().name,
              username: doc.data().username 
            }))
          );
          
          setError(`Shop "${shopUsername}" not found`);
          setLoading(false);
          return;
        }
        
        // Get first matching shop
        const shopDoc = querySnapshot.docs[0];
        console.log('✅ Shop found:', {
          id: shopDoc.id,
          data: shopDoc.data()
        });
        
        setShopId(shopDoc.id);
        setLoading(false);
        
      } catch (err) {
        console.error('💥 Error fetching shop by username:', err);
        console.error('Error details:', {
          code: err.code,
          message: err.message,
          stack: err.stack
        });
        setError('Failed to load shop: ' + err.message);
        setLoading(false);
      }
    };

    if (shopUsername) {
      fetchShopByUsername();
    } else {
      console.error('❌ No shopUsername provided to SubdomainHandler');
      setError('Invalid shop URL');
      setLoading(false);
    }
  }, [shopUsername]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000',
        color: '#fff',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div className="spinner" style={{
          width: '40px',
          height: '40px',
          border: '3px solid rgba(128, 0, 0, 0.1)',
          borderRadius: '50%',
          borderTopColor: '#800000',
          animation: 'spin 1s linear infinite'
        }}></div>
        <div>Loading shop "{shopUsername}"...</div>
        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        background: '#000',
        color: '#fff',
        gap: '1rem',
        padding: '2rem',
        textAlign: 'center'
      }}>
        <div style={{ fontSize: '3rem' }}>🔍</div>
        <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{error}</div>
        <div style={{ opacity: 0.7, maxWidth: '500px' }}>
          Looking for username: "{shopUsername}"
        </div>
        <button
          onClick={() => redirectToMainApp()}
          style={{
            background: '#800000',
            color: 'white',
            border: 'none',
            padding: '0.75rem 1.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '1rem',
            fontWeight: '600',
            marginTop: '1rem'
          }}
        >
          Go to Main Site
        </button>
        <button
          onClick={() => window.location.reload()}
          style={{
            background: 'transparent',
            color: '#800000',
            border: '1px solid #800000',
            padding: '0.5rem 1rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem'
          }}
        >
          Retry
        </button>
      </div>
    );
  }

  return <Navigate to={`/shop/${shopId}/view`} replace />;
};

// Route Guard for Subdomain
const SubdomainRouteGuard = ({ children }) => {
  const location = useLocation();
  const subdomainInfo = parseSubdomain();

  // If on subdomain and trying to access non-allowed route, redirect to main app
  if (subdomainInfo.isSubdomain && !isSubdomainAllowedRoute(location.pathname)) {
    redirectToMainApp(location.pathname);
    return null;
  }

  return children;
};

// Main App Routes Component
const AppRoutes = () => {
  const location = useLocation();
  const { isAuthenticated } = useAuth();
  const subdomainInfo = parseSubdomain();
  
  // Don't show navigation on subdomains or certain routes
  const hideNavRoutes = ['/auth', '/verify-email', '/shop/create/template'];
  const isHideNavRoute = hideNavRoutes.some(
    path => location.pathname === path || location.pathname.includes(path)
  );
  
  // Show desktop nav menu only on desktop, authenticated, and not on subdomain
  const showDesktopNavMenu = !subdomainInfo.isSubdomain && isAuthenticated && !isHideNavRoute;

  // Show bottom navigation on mobile when authenticated and not on subdomain
  const showBottomNav = !subdomainInfo.isSubdomain && isAuthenticated && !isHideNavRoute;

  // Determine if we should add bottom padding for mobile nav
  const needsBottomPadding = showBottomNav && window.innerWidth <= 768;

  return (
    <SubdomainRouteGuard>
      <div style={{ 
        paddingBottom: needsBottomPadding ? '80px' : '0',
        minHeight: '100vh'
      }}>
        {/* Desktop Navigation - Hidden on mobile and subdomains */}
        {showDesktopNavMenu && <NavMenu theme={DEFAULT_THEME} />}
        
        {subdomainInfo.isSubdomain ? (
          // Subdomain Mode: Only show public shop view
          <Routes>
            <Route 
              path="/*" 
              element={<SubdomainHandler shopUsername={subdomainInfo.shopUsername} />} 
            />
            <Route 
              path="/shop/:shopId/view" 
              element={<ShopPublicView />} 
            />
          </Routes>
        ) : (
          // Main App Mode: Normal routing
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<WelcomePage />} />
            <Route path="/auth" element={<AuthPage />} />
            <Route path="/shop/create/template" element={<LiveShopCreation />} />
            <Route path="/shop/:userId" element={<ShopPage />} />
            <Route path="/shop/:shopId/view" element={<ShopPublicView />} />
            
            {/* Messages Page */}
            <Route path="/messages" element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            } />

            {/* Notifications Page */}
            <Route path="/notifications" element={
              <ProtectedRoute>
                <NotificationsPage />
              </ProtectedRoute>
            } />

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

            {/* Discover route - can point to welcome page for now */}
            <Route path="/discover" element={<WelcomePage />} />
          </Routes>
        )}

        {/* Bottom Navigation - Only shown on mobile when authenticated and not on subdomain */}
        {showBottomNav && <BottomNavigation theme={DEFAULT_THEME} />}
      </div>
    </SubdomainRouteGuard>
  );
};

function App() {
  return (
    <LocationProvider>
      <Router>
        <AuthProvider>
          <TempStoreProvider>
            <GlobalStyles />
            <AppRoutes />
          </TempStoreProvider>
        </AuthProvider>
      </Router>
    </LocationProvider>
  );
}

export default App;