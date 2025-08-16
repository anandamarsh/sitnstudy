(function () {
  const currentDomain = "CURRENT_DOMAIN_PLACEHOLDER";

  // Monitor location changes to prevent unauthorized navigation
  if (window.allowInternalNavigation === false) {
    // Check if we've already set up location monitoring to prevent duplicate setup
    if (window._locationOverridden) {
      return;
    }

    try {
      // Instead of trying to override the non-configurable location property,
      // we'll intercept location changes by monitoring the URL and preventing
      // unauthorized changes through other means

      const originalLocation = window.location;
      let lastKnownUrl = originalLocation.href;

      // Create a function to check and block unauthorized location changes
      const checkAndBlockLocationChange = (newUrl) => {
        if (typeof newUrl === "string" && newUrl.startsWith("http")) {
          try {
            const targetUrlObj = new URL(newUrl);
            const currentUrlObj = new URL(lastKnownUrl);

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
                // Send message to main process to show error snackbar
                console.log(
                  `internal-navigation-blocked: ${JSON.stringify({
                    blockedUrl: newUrl,
                    currentDomain: currentDomain,
                    targetDomain: currentDomain,
                  })}`
                );

                // Try to prevent the change by immediately reverting
                try {
                  // Use history.replaceState to revert the change
                  history.replaceState(null, "", lastKnownUrl);
                } catch (revertError) {
                  console.log(
                    "[IC] Could not revert location change:",
                    revertError
                  );
                }

                return false; // Indicate the change was blocked
              }
            }
          } catch (error) {
            console.log("[IC] Error checking location change:", error);
          }
        }
        return true; // Allow the change
      };

      // Monitor location changes by periodically checking the URL
      const locationMonitor = setInterval(() => {
        const currentUrl = originalLocation.href;
        if (currentUrl !== lastKnownUrl) {
          if (!checkAndBlockLocationChange(currentUrl)) {
            // The change was blocked, don't update lastKnownUrl
            return;
          }
          lastKnownUrl = currentUrl;
        }
      }, 100); // Check every 100ms

      // Store the interval ID so we can clean it up if needed
      window._locationMonitorInterval = locationMonitor;

              // Mark that we've successfully set up location monitoring
        window._locationOverridden = true;
    } catch (error) {
      console.log("[IC] Error setting up location monitoring:", error);
    }
  }


})();
