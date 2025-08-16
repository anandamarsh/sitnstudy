(function () {
  if (window._navigationBlockingSetUp) return;

  const here = new URL(window.location.href);
  const currentDomain = here.hostname;

  function sameSite(targetUrlObj) {
    return (
      targetUrlObj.origin === here.origin ||
      targetUrlObj.hostname === here.hostname ||
      targetUrlObj.hostname.endsWith("." + here.hostname)
    );
  }

  function normPath(p) {
    if (!p) return "/";
    if (p === "/") return "/";
    return p.replace(/\/+$/, "");
  }

  function strictUrlMatch(w, t) {
    if (w.origin !== t.origin) return false;
    if (normPath(w.pathname) !== normPath(t.pathname)) return false;

    const wSearch = w.search || "";
    const tSearch = t.search || "";
    if (wSearch) {
      if (wSearch !== tSearch) return false;
    } else {
      if (tSearch) return false;
    }

    const wHash = w.hash || "";
    const tHash = t.hash || "";
    if (wHash) {
      if (wHash !== tHash) return false;
    }
    return true;
  }

  function isUrlWhitelisted(targetUrl) {
    try {
      const targetUrlObj = new URL(targetUrl, window.location.href);

      if (window.allowInternalNavigation !== false) return true;

      const wl = window.whitelistedUrls;
      if (!Array.isArray(wl)) return false;
      if (wl.length === 0) return false;

      for (let i = 0; i < wl.length; i++) {
        try {
          const w = new URL(wl[i], window.location.href);
          if (strictUrlMatch(w, targetUrlObj)) return true;
        } catch {}
      }
      return false;
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

      if (!sameSite(targetUrlObj)) return true;

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

  document.addEventListener(
    "submit",
    function (e) {
      const form = e.target;
      const actionAttr =
        form && form.getAttribute && form.getAttribute("action");
      if (!actionAttr) return;

      let targetUrlObj;
      try {
        targetUrlObj = new URL(actionAttr, window.location.href);
      } catch {
        return;
      }

      if (!sameSite(targetUrlObj)) return true;

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
