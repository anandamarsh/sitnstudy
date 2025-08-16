(function () {
  // Media control functions
  window.pauseAllMedia = function () {
    try {
      // Pause all audio and video
      Array.from(document.querySelectorAll("video,audio")).forEach((m) => {
        try {
          m.pause();
          m.muted = true;
        } catch (e) {
          // Ignore errors
        }
      });

      // Stop any running game loops or animations
      if (window.requestAnimationFrame) {
        // Cancel any pending animation frames
        for (let i = 1; i <= 1000; i++) {
          try {
            window.cancelAnimationFrame(i);
          } catch (e) {
            // Ignore errors
          }
        }
      }

      // Pause any running intervals or timeouts that might be game loops
      try {
        const highestId = setTimeout(() => {}, 0);
        for (let i = 1; i <= highestId; i++) {
          try {
            clearTimeout(i);
            clearInterval(i);
          } catch (e) {
            // Ignore errors
          }
        }
      } catch (e) {
        // Ignore errors
      }
    } catch (e) {
      // Ignore errors
    }
  };

  window.pauseMediaOnly = function () {
    try {
      Array.from(document.querySelectorAll("video,audio")).forEach((m) => {
        try {
          m.pause();
          m.muted = true;
        } catch (e) {
          // Ignore errors
        }
      });
    } catch (e) {
      // Ignore errors
    }
  };

  window.resumeMedia = function () {
    try {
      Array.from(document.querySelectorAll("video,audio")).forEach((m) => {
        try {
          m.muted = false;
          if (m.paused) {
            m.play().catch(() => {});
          }
        } catch (e) {
          // Ignore errors
        }
      });
    } catch (e) {
      // Ignore errors
    }
  };

  // Event listeners for automatic media control
  let wasPlayingBeforeBlur = false;

  // Function to check if webview is active/focused
  function isWebviewActive() {
    // Check if the webview has focus within the Electron app
    return document.hasFocus() && !document.hidden;
  }

  // Function to pause media when webview loses focus
  function pauseMediaIfNeeded() {
    const mediaElements = Array.from(document.querySelectorAll("video,audio"));
    wasPlayingBeforeBlur = mediaElements.some(m => !m.paused);
    
    if (wasPlayingBeforeBlur) {
      pauseAllMedia();
    }
  }

  // Function to resume media when webview gains focus
  function resumeMediaIfNeeded() {
    if (wasPlayingBeforeBlur) {
      resumeMedia();
      wasPlayingBeforeBlur = false;
    }
  }

  // Monitor webview focus state continuously
  let focusCheckInterval;
  
  function startFocusMonitoring() {
    let wasActive = isWebviewActive();
    
    focusCheckInterval = setInterval(() => {
      const isActive = isWebviewActive();
      
      if (wasActive && !isActive) {
        // Webview just lost focus
        pauseMediaIfNeeded();
      } else if (!wasActive && isActive) {
        // Webview just gained focus
        resumeMediaIfNeeded();
      }
      
      wasActive = isActive;
    }, 100); // Check every 100ms
  }

  // Start monitoring when the page loads
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startFocusMonitoring);
  } else {
    startFocusMonitoring();
  }

  // Also handle traditional focus events as fallbacks
  window.addEventListener('blur', pauseMediaIfNeeded);
  window.addEventListener('focus', resumeMediaIfNeeded);
  
  document.addEventListener('blur', pauseMediaIfNeeded);
  document.addEventListener('focus', resumeMediaIfNeeded);

  // Handle when tab becomes hidden/visible
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      pauseMediaIfNeeded();
    } else {
      resumeMediaIfNeeded();
    }
  });

  // Clean up interval when page unloads
  window.addEventListener('beforeunload', function() {
    if (focusCheckInterval) {
      clearInterval(focusCheckInterval);
    }
  });

})();
