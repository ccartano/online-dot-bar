// Google Tag Manager initialization
export const initializeGTM = () => {
  // Only initialize in production
  if (import.meta.env.PROD) {
    // Load GTM script
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=G-3V6X27QE6D';
    document.head.appendChild(script);

    // Initialize GTM
    window.dataLayer = window.dataLayer || [];
    function gtag(...args: any[]) {
      window.dataLayer.push(args);
    }
    gtag('js', new Date());
    gtag('config', 'G-3V6X27QE6D');
  }
};

// Declare global types for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
  }
} 