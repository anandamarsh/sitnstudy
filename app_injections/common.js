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
            // Check if internal navigation should be blocked
            if (window.allowInternalNavigation === false) {
              // Check if the target URL is in the whitelist
              const isWhitelisted =
                window.whitelistedUrls &&
                window.whitelistedUrls.some((url) => {
                  try {
                    const whitelistUrl = new URL(url);
                    const targetUrlObj = new URL(target.href);
                    return (
                      whitelistUrl.hostname === targetUrlObj.hostname &&
                      whitelistUrl.pathname === targetUrlObj.pathname
                    );
                  } catch {
                    return false;
                  }
                });

              if (!isWhitelisted) {
                console.log(
                  "[IC] Blocked internal navigation to:",
                  target.href
                );
                e.preventDefault();

                // Send message to main process to show error snackbar (same as external navigation)
                // Log a special message that the main process can capture
                console.log(
                  `internal-navigation-blocked: ${JSON.stringify({
                    blockedUrl: target.href,
                    currentDomain: currentDomain,
                    targetDomain: currentDomain,
                  })}`
                );

                return false;
              }
            }

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
            // Check if internal navigation should be blocked for form submissions
            if (window.allowInternalNavigation === false) {
              // Check if the target URL is in the whitelist
              const isWhitelisted =
                window.whitelistedUrls &&
                window.whitelistedUrls.some((url) => {
                  try {
                    const whitelistUrl = new URL(url);
                    const targetUrlObj = new URL(form.action);
                    return (
                      whitelistUrl.hostname === targetUrlObj.hostname &&
                      whitelistUrl.pathname === targetUrlObj.pathname
                    );
                  } catch {
                    return false;
                  }
                });

              if (!isWhitelisted) {
                console.log(
                  "[IC] Blocked internal form submission to:",
                  form.action
                );
                e.preventDefault();

                // Send message to main process to show error snackbar
                console.log(
                  `internal-navigation-blocked: ${JSON.stringify({
                    blockedUrl: form.action,
                    currentDomain: currentDomain,
                    targetDomain: currentDomain,
                  })}`
                );

                return false;
              }
            }

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
    // Check if internal navigation should be blocked for pushState
    const newUrl = args[2]; // The third argument is the URL
    if (newUrl && newUrl.startsWith("http")) {
      if (window.allowInternalNavigation === false) {
        // Check if the target URL is in the whitelist
        const isWhitelisted =
          window.whitelistedUrls &&
          window.whitelistedUrls.some((url) => {
            try {
              const whitelistUrl = new URL(url);
              const targetUrlObj = new URL(newUrl);
              return (
                whitelistUrl.hostname === targetUrlObj.hostname &&
                whitelistUrl.pathname === targetUrlObj.pathname
              );
            } catch {
              return false;
            }
          });

        if (!isWhitelisted) {
          console.log("[IC] Blocked internal pushState to:", newUrl);

          // Send message to main process to show error snackbar
          console.log(
            `internal-navigation-blocked: ${JSON.stringify({
              blockedUrl: newUrl,
              currentDomain: currentDomain,
              targetDomain: currentDomain,
            })}`
          );

          // Force revert the URL change by immediately calling replaceState with the original URL
          setTimeout(() => {
            try {
              originalReplaceState.call(history, ...args.slice(0, 2), lastUrl);
            } catch (e) {
              console.log("[IC] Could not revert URL change");
            }
          }, 0);

          return; // Don't execute the navigation
        }
      }

      // Log the new URL immediately when pushState is called - only fully qualified URLs
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
    // Check if internal navigation should be blocked for replaceState
    const newUrl = args[2]; // The third argument is the URL
    if (newUrl && newUrl.startsWith("http")) {
      if (window.allowInternalNavigation === false) {
        // Check if the target URL is in the whitelist
        const isWhitelisted =
          window.whitelistedUrls &&
          window.whitelistedUrls.some((url) => {
            try {
              const whitelistUrl = new URL(url);
              const targetUrlObj = new URL(newUrl);
              return (
                whitelistUrl.hostname === targetUrlObj.hostname &&
                whitelistUrl.pathname === targetUrlObj.pathname
              );
            } catch {
              return false;
            }
          });

        if (!isWhitelisted) {
          console.log("[IC] Blocked internal replaceState to:", newUrl);

          // Send message to main process to show error snackbar
          console.log(
            `internal-navigation-blocked: ${JSON.stringify({
              blockedUrl: newUrl,
              currentDomain: currentDomain,
              targetDomain: currentDomain,
            })}`
          );

          return; // Don't execute the navigation
        }
      }

      // Log the new URL immediately when replaceState is called - only fully qualified URLs
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
  window.addEventListener("popstate", function (event) {
    // Check if internal navigation should be blocked for popstate
    const currentUrl = window.location.href;

    if (window.allowInternalNavigation === false) {
      try {
        const currentUrlObj = new URL(currentUrl);
        const lastUrlObj = new URL(lastUrl);

        // Only check if this is internal navigation (same domain)
        if (currentUrlObj.hostname === lastUrlObj.hostname) {
          // Check if the current URL is in the whitelist
          const isWhitelisted =
            window.whitelistedUrls &&
            window.whitelistedUrls.some((url) => {
              try {
                const whitelistUrl = new URL(url);
                return (
                  whitelistUrl.hostname === currentUrlObj.hostname &&
                  whitelistUrl.pathname === currentUrlObj.pathname
                );
              } catch {
                return false;
              }
            });

          if (!isWhitelisted) {
            console.log(
              "[IC] Blocked internal popstate navigation to:",
              currentUrl
            );

            // Send message to main process to show error snackbar
            console.log(
              `internal-navigation-blocked: ${JSON.stringify({
                blockedUrl: currentUrl,
                currentDomain: currentDomain,
                targetDomain: currentDomain,
              })}`
            );

            // Force revert to the last allowed URL
            event.preventDefault();
            history.pushState(null, "", lastUrl);
            return;
          }
        }
      } catch (error) {
        console.log("[IC] Error checking popstate navigation:", error);
      }
    }

    // Log immediately when popstate occurs
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
  window.addEventListener("hashchange", function (event) {
    // Check if internal navigation should be blocked for hash changes
    const currentUrl = window.location.href;

    if (window.allowInternalNavigation === false) {
      try {
        const currentUrlObj = new URL(currentUrl);
        const lastUrlObj = new URL(lastUrl);

        // Only check if this is internal navigation (same domain)
        if (currentUrlObj.hostname === lastUrlObj.hostname) {
          // Check if the current URL is in the whitelist
          const isWhitelisted =
            window.whitelistedUrls &&
            window.whitelistedUrls.some((url) => {
              try {
                const whitelistUrl = new URL(url);
                return (
                  whitelistUrl.hostname === currentUrlObj.hostname &&
                  whitelistUrl.pathname === currentUrlObj.pathname
                );
              } catch {
                return false;
              }
            });

          if (!isWhitelisted) {
            console.log(
              "[IC] Blocked internal hash navigation to:",
              currentUrl
            );

            // Send message to main process to show error snackbar
            console.log(
              `internal-navigation-blocked: ${JSON.stringify({
                blockedUrl: currentUrl,
                currentDomain: currentDomain,
                targetDomain: currentDomain,
              })}`
            );

            // Force revert to the last allowed URL
            event.preventDefault();
            history.replaceState(null, "", lastUrl);
            return;
          }
        }
      } catch (error) {
        console.log("[IC] Error checking hash navigation:", error);
      }
    }

    // Log immediately when hashchange occurs
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

  // Override window.location.href to prevent direct URL changes
  if (window.allowInternalNavigation === false) {
    const originalLocation = window.location;
    const locationHandler = {
      get href() {
        return originalLocation.href;
      },
      set href(value) {
        if (typeof value === "string" && value.startsWith("http")) {
          try {
            const targetUrlObj = new URL(value);
            const currentUrlObj = new URL(originalLocation.href);

            // Only check if this is internal navigation (same domain)
            if (targetUrlObj.hostname === currentUrlObj.hostname) {
              // Check if the target URL is in the whitelist
              const isWhitelisted =
                window.whitelistedUrls &&
                window.whitelistedUrls.some((url) => {
                  try {
                    const whitelistUrl = new URL(url);
                    return (
                      whitelistUrl.hostname === targetUrlObj.hostname &&
                      whitelistUrl.pathname === targetUrlObj.pathname
                    );
                  } catch {
                    return false;
                  }
                });

              if (!isWhitelisted) {
                console.log("[IC] Blocked direct location change to:", value);

                // Send message to main process to show error snackbar
                console.log(
                  `internal-navigation-blocked: ${JSON.stringify({
                    blockedUrl: value,
                    currentDomain: currentDomain,
                    targetDomain: currentDomain,
                  })}`
                );

                return; // Don't change the location
              }
            }
          } catch (error) {
            console.log("[IC] Error checking location change:", error);
          }
        }

        // Allow the change if it passes all checks
        originalLocation.href = value;
      },
    };

    // Replace the location object
    Object.defineProperty(window, "location", {
      value: locationHandler,
      writable: false,
      configurable: false,
    });
  }

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
