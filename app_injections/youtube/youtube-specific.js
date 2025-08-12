// YouTube-specific injection script
console.log('🔗 YouTube-specific script loaded successfully');

// YouTube-specific functionality can go here
// For example: auto-pause videos, customize player, etc.

// Example: Add custom features to YouTube
(function() {
  try {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initYouTube);
    } else {
      initYouTube();
    }
    
    function initYouTube() {
      console.log('🔗 YouTube DOM ready, initializing custom features');
      
      // Add your YouTube-specific code here
      // Example: Video controls, UI enhancements, etc.
    }
  } catch (error) {
    console.error('Error in YouTube-specific script:', error);
  }
})();
