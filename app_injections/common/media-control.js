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

  console.log("[IC] 🔗 Media control module loaded");
})();
