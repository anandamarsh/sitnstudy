(function () {
  if (window._navigationBlockingSetUp) {
    return;
  }

  const here = new URL(window.location.href);
  const currentDomain = here.hostname;

  function sameSite(targetUrlObj) {
    return (
      targetUrlObj.origin === here.origin ||
      targetUrlObj.hostname === here.hostname ||
      targetUrlObj.hostname.endsWith("." + here.hostname)
    );
  }

  function isUrlWhitelisted(targetUrl) {
    try {
      const targetUrlObj = new URL(targetUrl, window.location.href);

      // If internal navigation is NOT being blocked, or no whitelist exists → allow
      if (window.allowInternalNavigation !== false || !window.whitelistedUrls) {
        return true;
      }

      return window.whitelistedUrls.some((whitelistUrl) => {
        try {
          const w = new URL(whitelistUrl, window.location.href);
          return (
            w.origin === targetUrlObj.origin &&
            w.pathname === targetUrlObj.pathname
          );
        } catch {
          return false;
        }
      });
    } catch {
      return false;
    }
  }

  function logNavigationBlocked(blockedUrl, type) {
    console.log(
      `internal-navigation-blocked: ${JSON.stringify({
        blockedUrl: blockedUrl,
        currentDomain: currentDomain,
        targetDomain: currentDomain,
      })}`
    );
  }

  // Intercept link clicks (capture phase)
  document.addEventListener(
    "click",
    function (e) {
      const a = e.target && e.target.closest && e.target.closest("a");
      if (!a) return;

      const hrefAttr = a.getAttribute("href");
      if (!hrefAttr) return;

      let targetUrlObj;
      try {
        targetUrlObj = new URL(hrefAttr, window.location.href);
      } catch {
        return;
      }

      if (!sameSite(targetUrlObj)) {
        // Let main process handle external navigation policy
        return true;
      }

      if (window.allowInternalNavigation === false) {
        if (!isUrlWhitelisted(targetUrlObj.href)) {
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation();
          logNavigationBlocked(targetUrlObj.href, "navigation");
          return false;
        }
      }

      console.log(
        "URL_CHANGE:" +
          JSON.stringify({
            url: targetUrlObj.href,
            previousUrl: window.location.href,
            currentDomain: currentDomain,
          })
      );
    },
    true
  );

  // Intercept form submissions (capture phase)
  document.addEventListener(
    "submit",
    function (e) {
      const form = e.target;
      const actionAttr =
        form && form.getAttribute && form.getAttribute("action");
      if (!actionAttr) return;
internal-navigation-blocked:
      let targetUrlObj;
      try {
        targetUrlObj = new URL(actionAttr, window.location.href);
      } catch {
        return;
      }

      if (!sameSite(targetUrlObj)) {
        // Let main process handle external navigation policy
        return true;
      }

      if (window.allowInternalNavigation === false) {
        if (!isUrlWhitelisted(targetUrlObj.href)) {
          e.preventDefault();
          logNavigationBlocked(targetUrlObj.href, "form submission");
          return false;
        }
      }

      console.log(
        "URL_CHANGE:" +
          JSON.stringify({
            url: targetUrlObj.href,
            previousUrl: window.location.href,
            currentDomain: currentDomain,
          })
      );
    },
    true
  );

  // Optional: guard window.open used by some sites
  (function () {
    const _open = window.open;
    window.open = function (url, target, features) {
      try {
        const abs = new URL(url, window.location.href);
        if (sameSite(abs) && window.allowInternalNavigation === false) {
          if (!isUrlWhitelisted(abs.href)) {
            logNavigationBlocked(abs.href, "window.open");
            return null;
          }
        }
      } catch {}
      return _open.apply(window, arguments);
    };
  })();

  window._navigationBlockingSetUp = true;
})();
