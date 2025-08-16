(function () {
  const currentDomain = "CURRENT_DOMAIN_PLACEHOLDER";

  // Override window.location.href to prevent direct URL changes
  if (window.allowInternalNavigation === false) {
    // Check if we've already overridden the location to prevent redefinition errors
    if (window._locationOverridden) {
      console.log("[IC] Location already overridden, skipping...");
      return;
    }

    try {
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

      // Try to replace the location object, but handle errors gracefully
      try {
        Object.defineProperty(window, "location", {
          value: locationHandler,
          writable: false,
          configurable: false,
        });

        // Mark that we've successfully overridden the location
        window._locationOverridden = true;
        console.log("[IC] Successfully overrode window.location");
      } catch (defineError) {
        console.log(
          "[IC] Could not override window.location (may already be overridden):",
          defineError
        );

        // Fallback: try to override just the href property if possible
        try {
          Object.defineProperty(originalLocation, "href", {
            get: locationHandler.get,
            set: locationHandler.set,
            configurable: false,
          });
          window._locationOverridden = true;
          console.log("[IC] Successfully overrode location.href as fallback");
        } catch (hrefError) {
          console.log(
            "[IC] Could not override location.href either:",
            hrefError
          );
        }
      }
    } catch (error) {
      console.log("[IC] Error setting up location override:", error);
    }
  }

  console.log("[IC] 🔗 Location override module loaded");
})();
