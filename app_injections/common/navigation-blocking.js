(function () {
  const currentDomain = "CURRENT_DOMAIN_PLACEHOLDER";

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
              if (!isUrlWhitelisted(target.href)) {
                e.preventDefault();
                logNavigationBlocked(target.href, "navigation");
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
              if (!isUrlWhitelisted(form.action)) {
                e.preventDefault();
                logNavigationBlocked(form.action, "form submission");
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

  console.log("[IC] 🔗 Navigation blocking module loaded");
})();
