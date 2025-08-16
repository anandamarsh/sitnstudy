(function () {
  const currentDomain = "CURRENT_DOMAIN_PLACEHOLDER";

  // Monitor location changes to prevent unauthorized navigation
  if (window.allowInternalNavigation === false) {
    // Check if we've already set up location monitoring to prevent duplicate setup
    if (window._locationOverridden) {
      console.log("[IC] Location monitoring already set up, skipping...");
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

            console.log(`[IC] 📍 Location change detected: ${newUrl}`);
            console.log(
              `[IC] 🌐 Current domain: ${currentUrlObj.hostname}, Target domain: ${targetUrlObj.hostname}`
            );

            // Only check if this is internal navigation (same domain)
            if (targetUrlObj.hostname === currentUrlObj.hostname) {
              console.log(
                `[IC] 🚫 Internal navigation detected, checking whitelist...`
              );

              // Check if the target URL is in the whitelist
              const isWhitelisted =
                window.whitelistedUrls &&
                window.whitelistedUrls.some((url) => {
                  try {
                    const whitelistUrl = new URL(url);
                    const hostnameMatch =
                      whitelistUrl.hostname === targetUrlObj.hostname;
                    const pathnameMatch =
                      whitelistUrl.pathname === targetUrlObj.pathname;

                    console.log(`[IC] 🔍 Location: Whitelist check:`, {
                      whitelistUrl: url,
                      targetUrl: newUrl,
                      hostnameMatch,
                      pathnameMatch,
                      result: hostnameMatch && pathnameMatch,
                    });

                    return hostnameMatch && pathnameMatch;
                  } catch {
                    console.log(
                      `[IC] ❌ Location: Error parsing whitelist URL: ${url}`
                    );
                    return false;
                  }
                });

              if (!isWhitelisted) {
                console.log(
                  "[IC] ❌ Location change blocked - not in whitelist:",
                  newUrl
                );

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
                  console.log(
                    `[IC] ✅ Location change reverted to: ${lastKnownUrl}`
                  );
                } catch (revertError) {
                  console.log(
                    "[IC] ❌ Could not revert location change:",
                    revertError
                  );
                }

                return false; // Indicate the change was blocked
              } else {
                console.log(`[IC] ✅ Location change allowed - in whitelist`);
              }
            } else {
              console.log(
                `[IC] ✅ External navigation - not checking whitelist`
              );
            }
          } catch (error) {
            console.log("[IC] ❌ Error checking location change:", error);
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
      console.log("[IC] Successfully set up location change monitoring");
    } catch (error) {
      console.log("[IC] Error setting up location monitoring:", error);
    }
  }

  console.log("[IC] 🔗 Location override module loaded");
})();
