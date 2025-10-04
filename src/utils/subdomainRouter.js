// src/utils/subdomainRouter.js

/**
 * Subdomain Router Utility - Updated for Vercel
 * Detects if user is on a subdomain and extracts shop identifier
 */

// Support both custom domain and Vercel domain
const MAIN_DOMAINS = ['kalkode.com', 'vercel.app']; 
const ALLOWED_SUBDOMAINS = ['www', 'app', 'admin'];

/**
 * Get the base domain from current hostname
 */
const getBaseDomain = (hostname) => {
  // Check each configured domain
  for (const domain of MAIN_DOMAINS) {
    if (hostname.includes(domain)) {
      return domain;
    }
  }
  return null;
};

/**
 * Parse the current hostname and extract subdomain info
 * @returns {Object} { isSubdomain, shopUsername, originalHost }
 */
export const parseSubdomain = () => {
  const hostname = window.location.hostname;
  
  console.log('🔍 Parsing subdomain from hostname:', hostname);
  
  // Development/localhost handling
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    const params = new URLSearchParams(window.location.search);
    const testSubdomain = params.get('subdomain');
    
    if (testSubdomain) {
      console.log('✅ Development subdomain detected:', testSubdomain);
      return {
        isSubdomain: true,
        shopUsername: testSubdomain,
        originalHost: hostname,
        isDevelopment: true
      };
    }
    
    console.log('❌ No subdomain - localhost main app');
    return {
      isSubdomain: false,
      shopUsername: null,
      originalHost: hostname,
      isDevelopment: true
    };
  }
  
  // Production subdomain detection
  const parts = hostname.split('.');
  console.log('🔎 Hostname parts:', parts);
  
  // Check if we're on a known domain
  const baseDomain = getBaseDomain(hostname);
  if (!baseDomain) {
    console.log('⚠️ Unknown domain:', hostname);
    return {
      isSubdomain: false,
      shopUsername: null,
      originalHost: hostname,
      isDevelopment: false
    };
  }
  
  console.log('✓ Base domain detected:', baseDomain);
  
  // For vercel.app: format is usually [project]-[hash].vercel.app or [subdomain]-[project]-[hash].vercel.app
  if (baseDomain === 'vercel.app') {
    // Need at least 4 parts for subdomain on Vercel: subdomain.project.hash.vercel.app
    if (parts.length >= 4) {
      const potentialSubdomain = parts[0];
      
      // Check if it's not a reserved subdomain
      if (!ALLOWED_SUBDOMAINS.includes(potentialSubdomain.toLowerCase())) {
        console.log('✅ Vercel subdomain detected:', potentialSubdomain);
        return {
          isSubdomain: true,
          shopUsername: potentialSubdomain,
          originalHost: hostname,
          isDevelopment: false
        };
      }
    }
    
    console.log('❌ No valid subdomain on Vercel domain');
    return {
      isSubdomain: false,
      shopUsername: null,
      originalHost: hostname,
      isDevelopment: false
    };
  }
  
  // For custom domain: standard subdomain detection
  if (parts.length < 3) {
    console.log('❌ Not enough parts for subdomain');
    return {
      isSubdomain: false,
      shopUsername: null,
      originalHost: hostname,
      isDevelopment: false
    };
  }
  
  const potentialSubdomain = parts[0];
  
  if (ALLOWED_SUBDOMAINS.includes(potentialSubdomain.toLowerCase())) {
    console.log('❌ Reserved subdomain:', potentialSubdomain);
    return {
      isSubdomain: false,
      shopUsername: null,
      originalHost: hostname,
      isDevelopment: false
    };
  }
  
  console.log('✅ Custom domain subdomain detected:', potentialSubdomain);
  return {
    isSubdomain: true,
    shopUsername: potentialSubdomain,
    originalHost: hostname,
    isDevelopment: false
  };
};

/**
 * Get the main app URL (without subdomain)
 */
export const getMainAppUrl = () => {
  const { protocol, hostname } = window.location;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${window.location.host}`;
  }
  
  const baseDomain = getBaseDomain(hostname);
  
  // For Vercel, redirect to the main Vercel URL
  if (baseDomain === 'vercel.app') {
    // Extract project name from hostname (usually project-hash.vercel.app)
    const parts = hostname.split('.');
    if (parts.length >= 3) {
      // Remove subdomain if present
      const mainParts = parts.slice(-3); // Get last 3 parts (project-hash.vercel.app)
      return `${protocol}//${mainParts.join('.')}`;
    }
  }
  
  // For custom domain
  return `${protocol}//www.kalkode.com`;
};

/**
 * Generate subdomain URL for a username
 */
export const getSubdomainUrl = (username) => {
  const { protocol, hostname } = window.location;
  
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    return `${protocol}//${window.location.host}?subdomain=${username}`;
  }
  
  const baseDomain = getBaseDomain(hostname);
  
  if (baseDomain === 'vercel.app') {
    // For Vercel, we need to use the full project URL
    const parts = hostname.split('.');
    const projectParts = parts.slice(-3).join('.'); // project-hash.vercel.app
    return `${protocol}//${username}-${projectParts}`;
  }
  
  return `${protocol}//${username}.kalkode.com`;
};

/**
 * Redirect to main app
 */
export const redirectToMainApp = (path = '/') => {
  const mainUrl = getMainAppUrl();
  console.log('🔄 Redirecting to main app:', mainUrl + path);
  window.location.href = mainUrl + path;
};

/**
 * Check if current route should be accessible on subdomain
 */
export const isSubdomainAllowedRoute = (pathname) => {
  const allowedRoutes = [
    '/',
    '/shop',
    '/home',
    '/community'
  ];
  
  return allowedRoutes.some(route => pathname.startsWith(route));
};