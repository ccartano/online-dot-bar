// Google Tag Manager initialization
export const initializeGTM = () => {
  // Initialize dataLayer
  window.dataLayer = window.dataLayer || [];
  
  // Load GA4 script
  const script = document.createElement('script');
  script.async = true;
  script.src = 'https://www.googletagmanager.com/gtag/js?id=G-3V6X27QE6D';
  document.head.appendChild(script);

  // Initialize gtag function
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };
  
  // Configure GA4
  window.gtag('js', new Date());
  window.gtag('config', 'G-3V6X27QE6D', {
    send_page_view: true,
    debug_mode: true,
    cookie_flags: 'max-age=7200;secure;samesite=none'
  });

  // Track initial page view
  window.gtag('event', 'page_view', {
    page_title: document.title,
    page_location: window.location.href,
    page_path: window.location.pathname
  });
};

// Track page views on route changes
export const trackPageView = (path: string) => {
  if (window.gtag) {
    window.gtag('event', 'page_view', {
      page_title: document.title,
      page_location: window.location.href,
      page_path: path
    });
  }
};

// Declare global types for TypeScript
declare global {
  interface Window {
    dataLayer: any[];
    gtag: (...args: any[]) => void;
  }
} 