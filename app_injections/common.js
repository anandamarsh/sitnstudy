(function () {
  const currentDomain = "CURRENT_DOMAIN_PLACEHOLDER";

  // Intercept link clicks
  document.addEventListener(
    "click",
    function (e) {
      const target = e.target.closest("a");
      if (target && target.href) {
        try {
          const url = new URL(target.href);
          if (url.hostname !== currentDomain) {
            // For external navigation, we'll let the main process handle the check
            // This ensures we respect the allowExternalNavigation setting
            // The main process will either allow or block based on the setting
            return true; // Don't prevent default, let main process decide
          } else if (target.href.startsWith("http")) {
            // Log internal navigation immediately when link is clicked - only fully qualified URLs
            console.log(
              "[IC] URL_CHANGE:" +
                JSON.stringify({
                  url: target.href,
                  previousUrl: window.location.href,
                  currentDomain: currentDomain,
                })
            );
          }
        } catch (error) {
          // Invalid URL, allow the click
        }
      }
    },
    true
  );

  // Intercept form submissions
  document.addEventListener(
    "submit",
    function (e) {
      const form = e.target;
      if (form.action) {
        try {
          const url = new URL(form.action);
          if (url.hostname !== currentDomain) {
            // For external navigation, we'll let the main process handle the check
            // This ensures we respect the allowExternalNavigation setting
            // The main process will either allow or block based on the setting
            return true; // Don't prevent default, let main process decide
          } else if (form.action.startsWith("http")) {
            // Log internal navigation immediately when form is submitted - only fully qualified URLs
            console.log(
              "[IC] URL_CHANGE:" +
                JSON.stringify({
                  url: form.action,
                  previousUrl: window.location.href,
                  currentDomain: currentDomain,
                })
            );
          }
        } catch (error) {
          // Invalid URL, allow the submission
        }
      }
    },
    true
  );

  // Monitor client-side navigation changes (SPA routing, pushState, etc.)
  let lastUrl = window.location.href;

  // Monitor pushState and replaceState
  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  history.pushState = function (...args) {
    // Log the new URL immediately when pushState is called - only fully qualified URLs
    const newUrl = args[2]; // The third argument is the URL
    if (newUrl && newUrl.startsWith("http")) {
      console.log(
        "[IC] URL_CHANGE:" +
          JSON.stringify({
            url: newUrl,
            previousUrl: lastUrl,
            currentDomain: currentDomain,
          })
      );
    }

    originalPushState.apply(this, args);
    lastUrl = window.location.href;
  };

  history.replaceState = function (...args) {
    // Log the new URL immediately when replaceState is called - only fully qualified URLs
    const newUrl = args[2]; // The third argument is the URL
    if (newUrl && newUrl.startsWith("http")) {
      console.log(
        "[IC] URL_CHANGE:" +
          JSON.stringify({
            url: newUrl,
            previousUrl: lastUrl,
            currentDomain: currentDomain,
          })
      );
    }

    originalReplaceState.apply(this, args);
    lastUrl = window.location.href;
  };

  // Monitor popstate events
  window.addEventListener("popstate", function () {
    // Log immediately when popstate occurs
    const currentUrl = window.location.href;
    console.log(
      "[IC] URL_CHANGE:" +
        JSON.stringify({
          url: currentUrl,
          previousUrl: lastUrl,
          currentDomain: currentDomain,
        })
    );
    lastUrl = currentUrl;
  });

  // Monitor hash changes
  window.addEventListener("hashchange", function () {
    // Log immediately when hashchange occurs
    const currentUrl = window.location.href;
    console.log(
      "[IC] URL_CHANGE:" +
        JSON.stringify({
          url: currentUrl,
          previousUrl: lastUrl,
          currentDomain: currentDomain,
        })
    );
    lastUrl = currentUrl;
  });



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

  // Webview state management
  window.preserveWebviewState = function () {
    try {
      if (window.webviewState) {
        window.webviewState.scrollX = window.scrollX || 0;
        window.webviewState.scrollY = window.scrollY || 0;
      } else {
        window.webviewState = {
          scrollX: window.scrollX || 0,
          scrollY: window.scrollY || 0,
        };
      }
    } catch (e) {
      // Ignore errors
    }
  };

  window.restoreWebviewState = function () {
    try {
      if (
        window.webviewState &&
        typeof window.webviewState.scrollX === "number" &&
        typeof window.webviewState.scrollY === "number"
      ) {
        setTimeout(() => {
          window.scrollTo(
            window.webviewState.scrollX,
            window.webviewState.scrollY
          );
        }, 100);
      }
    } catch (e) {
      // Ignore errors
    }
  };

  console.log("[IC] 🔗 Common.js script loaded successfully");
})();
