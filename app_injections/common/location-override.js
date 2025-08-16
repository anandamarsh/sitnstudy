(function () {
  const currentDomain = "CURRENT_DOMAIN_PLACEHOLDER";

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

  console.log("[IC] 🔗 Location override module loaded");
})();
