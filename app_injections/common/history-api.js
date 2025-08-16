(function () {
  const currentDomain = "CURRENT_DOMAIN_PLACEHOLDER";
  let lastUrl = window.location.href;

  // Helper function to check if URL is whitelisted
  function isUrlWhitelisted(targetUrl) {
    if (!window.whitelistedUrls || !window.allowInternalNavigation === false) {
      return true; // Allow if no whitelist or internal navigation is enabled
    }

    try {
      const targetUrlObj = new URL(targetUrl);
      return window.whitelistedUrls.some((whitelistUrl) => {
        try {
          const whitelistUrlObj = new URL(whitelistUrl);
          return (
            whitelistUrlObj.hostname === targetUrlObj.hostname &&
            whitelistUrlObj.pathname === targetUrlObj.pathname
          );
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }

  // Helper function to log navigation blocking
  function logNavigationBlocked(blockedUrl, type) {
    console.log(`[IC] Blocked internal ${type} to:`, blockedUrl);
    console.log(
      `internal-navigation-blocked: ${JSON.stringify({
        blockedUrl: blockedUrl,
        currentDomain: currentDomain,
        targetDomain: currentDomain,
      })}`
    );
  }

  // Helper function to log URL changes
  function logUrlChange(newUrl) {
    console.log(
      "[IC] URL_CHANGE:" +
        JSON.stringify({
          url: newUrl,
          previousUrl: lastUrl,
          currentDomain: currentDomain,
        })
    );
  }

  // Monitor pushState and replaceState
  // Check if we've already overridden these to prevent conflicts
  if (window._historyOverridden) {
    console.log("[IC] History API already overridden, skipping...");
    return;
  }

  const originalPushState = history.pushState;
  const originalReplaceState = history.replaceState;

  // Override pushState
  history.pushState = function (...args) {
    // Check if internal navigation should be blocked for pushState
    const newUrl = args[2]; // The third argument is the URL
    if (newUrl && newUrl.startsWith("http")) {
      if (window.allowInternalNavigation === false) {
        if (!isUrlWhitelisted(newUrl)) {
          logNavigationBlocked(newUrl, "pushState");

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
      logUrlChange(newUrl);
    }

    originalPushState.apply(this, args);
    lastUrl = window.location.href;
  };

  // Override replaceState
  history.replaceState = function (...args) {
    // Check if internal navigation should be blocked for replaceState
    const newUrl = args[2]; // The third argument is the URL
    if (newUrl && newUrl.startsWith("http")) {
      if (window.allowInternalNavigation === false) {
        if (!isUrlWhitelisted(newUrl)) {
          logNavigationBlocked(newUrl, "replaceState");
          return; // Don't execute the navigation
        }
      }

      // Log the new URL immediately when replaceState is called - only fully qualified URLs
      logUrlChange(newUrl);
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
          if (!isUrlWhitelisted(currentUrl)) {
            logNavigationBlocked(currentUrl, "popstate navigation");

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
    logUrlChange(currentUrl);
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
          if (!isUrlWhitelisted(currentUrl)) {
            logNavigationBlocked(currentUrl, "hash navigation");

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
    logUrlChange(currentUrl);
    lastUrl = currentUrl;
  });

  // Mark that we've successfully overridden the history API
  window._historyOverridden = true;
  console.log("[IC] 🔗 History API module loaded");
})();
