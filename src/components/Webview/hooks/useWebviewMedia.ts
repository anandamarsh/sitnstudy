import React from "react";
import { SiteTab, WebviewMedia } from "../types";

export function useWebviewMedia(
  webviewRefs: React.MutableRefObject<any[]>,
  activeIndex: number,
  tabs: SiteTab[],
  preserveWebviewState: (tabKey: string) => void,
  restoreWebviewState: (tabKey: string) => void
): WebviewMedia {
  
  // Function to pause all webviews (can be called from parent)
  const pauseAllWebviews = React.useCallback(() => {
    webviewRefs.current.forEach((wv) => {
      if (!wv) return;
      try {
        if (typeof wv.executeJavaScript === "function") {
          wv.executeJavaScript(
            `window.pauseAllMedia && window.pauseAllMedia();`
          );
        }
      } catch {
        // no-op
      }
    });
  }, [webviewRefs]);

  // Pause media in any background (inactive) webviews when switching tabs
  const pauseBackgroundWebviews = React.useCallback(() => {
    webviewRefs.current.forEach((wv, idx) => {
      if (!wv || idx === activeIndex) return;
      try {
        if (typeof wv.executeJavaScript === "function") {
          wv.executeJavaScript(
            `window.pauseMediaOnly && window.pauseMediaOnly();`
          );
        }
      } catch {
        // no-op
      }
    });
  }, [webviewRefs, activeIndex]);

  // Resume media on the newly active webview
  const resumeActiveWebview = React.useCallback(() => {
    const activeWv = webviewRefs.current[activeIndex];
    if (!activeWv) return;

    // Restore state for the newly active tab
    if (tabs[activeIndex]) {
      restoreWebviewState(tabs[activeIndex].key);
    }

    try {
      if (typeof activeWv.executeJavaScript === "function") {
        activeWv.executeJavaScript(
          `window.resumeMedia && window.resumeMedia();`
        );
      }
    } catch {
      // no-op
    }
  }, [webviewRefs, activeIndex, tabs, restoreWebviewState]);

  // Pause background webviews when switching tabs
  React.useEffect(() => {
    pauseBackgroundWebviews();
  }, [activeIndex, tabs.length, pauseBackgroundWebviews]);

  // Resume active webview when switching tabs
  React.useEffect(() => {
    resumeActiveWebview();
  }, [activeIndex, tabs, resumeActiveWebview]);

  // Preserve state when switching away from a tab
  React.useEffect(() => {
    const previousActiveTab = tabs[activeIndex - 1] || tabs[activeIndex + 1];
    if (previousActiveTab && previousActiveTab.key !== tabs[activeIndex]?.key) {
      preserveWebviewState(previousActiveTab.key);
    }
  }, [activeIndex, tabs, preserveWebviewState]);

  return {
    pauseAllWebviews,
    pauseBackgroundWebviews,
    resumeActiveWebview
  };
}
