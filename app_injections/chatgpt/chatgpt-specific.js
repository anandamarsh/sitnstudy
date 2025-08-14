// ChatGPT-specific injection script
console.log('🔗 ChatGPT-specific script loaded successfully');

// ChatGPT-specific functionality can go here
// For example: auto-save conversations, customize UI, etc.

// Example: Add custom features to ChatGPT
(function() {
  try {
    // Wait for DOM to be ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initChatGPT);
    } else {
      initChatGPT();
    }
    
    function initChatGPT() {
      console.log('🔗 ChatGPT DOM ready, initializing custom features');
      
      // Add your ChatGPT-specific code here
      // Example: Conversation management, UI enhancements, etc.
    }
  } catch (error) {
    console.error('Error in ChatGPT-specific script:', error);
  }
})();
