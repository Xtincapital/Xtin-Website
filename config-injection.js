/* 
  This file injects environment variables into the frontend
  at runtime when deployed on Vercel.
  
  Place this in your index.html <head> section
*/

// Inject Render backend URL from Vercel environment variables
(function() {
  // Try multiple ways to get the backend URL
  const backendUrl = 
    // Method 1: Check URL parameters (for testing)
    new URLSearchParams(window.location.search).get('backendUrl') ||
    // Method 2: From meta tag (if set in HTML)
    document.querySelector('meta[name="backend-url"]')?.content ||
    // Method 3: From environment variable (if available in browser)
    window.__ENV__?.BACKEND_URL ||
    // Method 4: Check if there's a config in global scope
    window.__RENDER_CONFIG__?.backendUrl ||
    // Method 5: Default - try relative paths
    '';
  
  // Set it globally for JavaScript to use
  if (backendUrl) {
    window.BACKEND_URL = backendUrl;
    console.log('✓ Backend URL configured:', backendUrl);
  } else {
    // If no explicit backend URL, use relative paths
    // (assumes backend and frontend are reverse-proxied on same domain)
    window.BACKEND_URL = '';
    console.log('✓ Using relative API paths (same-domain deployment)');
  }
})();
