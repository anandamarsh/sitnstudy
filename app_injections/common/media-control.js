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

  // Handle when webview loses focus (blur)
  window.addEventListener('blur', function() {
    // Check if any media is currently playing
    const mediaElements = Array.from(document.querySelectorAll("video,audio"));
    wasPlayingBeforeBlur = mediaElements.some(m => !m.paused);
    
    if (wasPlayingBeforeBlur) {
      pauseAllMedia();
    }
  });

  // Handle when webview gains focus (focus)
  window.addEventListener('focus', function() {
    if (wasPlayingBeforeBlur) {
      resumeMedia();
      wasPlayingBeforeBlur = false;
    }
  });

  // Handle when tab becomes hidden/visible (visibilitychange)
  document.addEventListener('visibilitychange', function() {
    if (document.hidden) {
      // Tab is hidden, pause media
      const mediaElements = Array.from(document.querySelectorAll("video,audio"));
      wasPlayingBeforeBlur = mediaElements.some(m => !m.paused);
      
      if (wasPlayingBeforeBlur) {
        pauseAllMedia();
      }
    } else {
      // Tab is visible again, resume media if it was playing before
      if (wasPlayingBeforeBlur) {
        resumeMedia();
        wasPlayingBeforeBlur = false;
      }
    }
  });

  // Also handle page focus/blur for better coverage
  document.addEventListener('blur', function() {
    const mediaElements = Array.from(document.querySelectorAll("video,audio"));
    wasPlayingBeforeBlur = mediaElements.some(m => !m.paused);
    
    if (wasPlayingBeforeBlur) {
      pauseAllMedia();
    }
  });

  document.addEventListener('focus', function() {
    if (wasPlayingBeforeBlur) {
      resumeMedia();
      wasPlayingBeforeBlur = false;
    }
  });

})();
