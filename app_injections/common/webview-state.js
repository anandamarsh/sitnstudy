(function () {
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


})();
