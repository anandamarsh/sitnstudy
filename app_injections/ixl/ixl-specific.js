// IXL-specific injection script
console.log('🔗 IXL-specific script loaded successfully');

// IXL-specific functionality can go here
// For example: auto-pause videos, customize UI, etc.

// Example: Add a custom button to IXL pages
(function() {
  try {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initIXL);
    } else {
      initIXL();
    }
    
    function initIXL() {
      console.log('🔗 IXL DOM ready, initializing custom features');
      
      // Add your IXL-specific code here
      // Example: Custom navigation, UI enhancements, etc.
    }
  } catch (error) {
    console.error('Error in IXL-specific script:', error);
  }
})();
