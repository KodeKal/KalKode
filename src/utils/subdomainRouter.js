// src/utils/subdomainRouter.js

/**
 * Subdomain Router Utility
 * Detects if user is on a subdomain and extracts shop identifier
 */

const MAIN_DOMAIN = 'kalkode.com'; // Change to your actual domain
const ALLOWED_SUBDOMAINS = ['www', 'app', 'admin']; // Reserved subdomains

/**
 * Parse the current hostname and extract subdomain info
 * @returns {Object} { isSubdomain, shopUsername, originalHost }
 */
export const parseSubdomain = () => {
  const hostname = window.location.hostname;
  
  // Development/localhost handling
  if (hostname === 'localhost' || hostname === '127.0.0.1') {
    // Check for manual subdomain testing via query param: ?subdomain=username
    const params = new URLSearchParams(window.location.search);
    const testSubdomain = params.get('subdomain');
    
    if (testSubdomain) {
      return {
        isSubdomain: true,
        shopUsername: testSubdomain,
        originalHost: hostname,
        isDevelopment: true
      };
    }
    
    return {
      isSubdomain: false,
      shopUsername: null,
      originalHost: hostname,
      isDevelopment: true
    };
  }
  
  // Production subdomain detection
  const parts = hostname.split('.');
  
  // Not enough parts to be a subdomain (e.g., just "kalkode.com")
  if (parts.length < 3) {
    return {
      isSubdomain: false,
      shopUsername: null,
      originalHost: hostname,
      isDevelopment: false
    };
  }
  
  // Extract potential subdomain (first part)
  const potentialSubdomain = parts[0];
  
  // Check if it's a reserved/system subdomain
  if (ALLOWED_SUBDOMAINS.includes(potentialSubdomain.toLowerCase())) {
    return {
      isSubdomain: false,
      shopUsername: null,
      originalHost: hostname,
      isDevelopment: false
    };
  }
  
  // Valid shop subdomain
  return {
    isSubdomain: true,
    shopUsername: potentialSubdomain,
    originalHost: hostname,
    isDevelopment: false
  };
};

/**
 * Get the main app URL (without subdomain)
 * @returns {string} Main app URL
 */
export const getMainAppUrl = () => {
  const { protocol } = window.location;
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${protocol}//${window.location.host}`;
  }
  
  return `${protocol}//www.${MAIN_DOMAIN}`;
};

/**
 * Generate subdomain URL for a username
 * @param {string} username 
 * @returns {string} Full subdomain URL
 */
export const getSubdomainUrl = (username) => {
  const { protocol } = window.location;
  
  if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    return `${protocol}//${window.location.host}?subdomain=${username}`;
  }
  
  return `${protocol}//${username}.${MAIN_DOMAIN}`;
};

/**
 * Redirect to main app (useful for errors on subdomain)
 * @param {string} path - Optional path to redirect to
 */
export const redirectToMainApp = (path = '/') => {
  window.location.href = getMainAppUrl() + path;
};

/**
 * Check if current route should be accessible on subdomain
 * @param {string} pathname 
 * @returns {boolean}
 */
export const isSubdomainAllowedRoute = (pathname) => {
  // Only allow public shop view on subdomains
  const allowedRoutes = [
    '/',
    '/shop',
    '/home',
    '/community'
  ];
  
  return allowedRoutes.some(route => pathname.startsWith(route));
};