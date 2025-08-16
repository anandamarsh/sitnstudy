(function () {
  // Check if we've already set up navigation blocking to prevent conflicts
  if (window._navigationBlockingSetUp) {
    console.log("[IC] Navigation blocking already set up, skipping...");
    return;
  }

  const currentDomain = "CURRENT_DOMAIN_PLACEHOLDER";

  // Helper function to check if URL is whitelisted
  function isUrlWhitelisted(targetUrl) {
    console.log(`[IC] 🔍 Checking if URL is whitelisted: ${targetUrl}`);
    console.log(`[IC] 📋 Current whitelist:`, window.whitelistedUrls);
    console.log(`[IC] 🚫 Internal navigation blocked:`, window.allowInternalNavigation === false);
    
    if (!window.whitelistedUrls || !window.allowInternalNavigation === false) {
      console.log(`[IC] ✅ URL allowed - no whitelist or internal navigation enabled`);
      return true; // Allow if no whitelist or internal navigation is enabled
    }

    try {
      const targetUrlObj = new URL(targetUrl);
      return window.whitelistedUrls.some((whitelistUrl) => {
        try {
          const whitelistUrlObj = new URL(whitelistUrl);
          const hostnameMatch = whitelistUrlObj.hostname === targetUrlObj.hostname;
          const pathnameMatch = whitelistUrlObj.pathname === targetUrlObj.pathname;
          
          console.log(`[IC] 🔍 Whitelist check:`, {
            whitelistUrl: whitelistUrl,
            targetUrl: targetUrl,
            hostnameMatch,
            pathnameMatch,
            result: hostnameMatch && pathnameMatch
          });
          
          return hostnameMatch && pathnameMatch;
        } catch {
          console.log(`[IC] ❌ Error parsing whitelist URL: ${whitelistUrl}`);
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
            console.log(`[IC] 🔗 Link click detected: ${target.href}`);
            console.log(`[IC] 🌐 Current domain: ${currentDomain}, Target domain: ${url.hostname}`);
            
            // Check if internal navigation should be blocked
            if (window.allowInternalNavigation === false) {
              console.log(`[IC] 🚫 Internal navigation is blocked, checking whitelist...`);
              if (!isUrlWhitelisted(target.href)) {
                console.log(`[IC] ❌ Link blocked - not in whitelist`);
                e.preventDefault();
                logNavigationBlocked(target.href, "navigation");
                return false;
              } else {
                console.log(`[IC] ✅ Link allowed - in whitelist`);
              }
            } else {
              console.log(`[IC] ✅ Internal navigation allowed`);
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
            console.log(`[IC] 📝 Form submission detected: ${form.action}`);
            console.log(`[IC] 🌐 Current domain: ${currentDomain}, Target domain: ${url.hostname}`);
            
            // Check if internal navigation should be blocked for form submissions
            if (window.allowInternalNavigation === false) {
              console.log(`[IC] 🚫 Internal navigation is blocked, checking whitelist...`);
              if (!isUrlWhitelisted(form.action)) {
                console.log(`[IC] ❌ Form submission blocked - not in whitelist`);
                e.preventDefault();
                logNavigationBlocked(form.action, "form submission");
                return false;
              } else {
                console.log(`[IC] ✅ Form submission allowed - in whitelist`);
              }
            } else {
              console.log(`[IC] ✅ Internal navigation allowed`);
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

  // Mark that we've successfully set up navigation blocking
  window._navigationBlockingSetUp = true;
  console.log("[IC] 🔗 Navigation blocking module loaded");
})();
