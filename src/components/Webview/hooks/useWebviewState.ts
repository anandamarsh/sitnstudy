import React from "react";
import { SiteTab, WebviewState } from "../types";

export function useWebviewState(
  tabs: SiteTab[]
): WebviewState {
  const webviewRefs = React.useRef<any[]>([]);
  const [loadingStates] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [loadingProgress] = React.useState<{
    [key: string]: number;
  }>({});
  const [loadedTabs] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [currentUrls, setCurrentUrls] = React.useState<{
    [key: string]: string;
  }>({});
  const [linkPreview, setLinkPreview] = React.useState<string>("");

  // Handle URL changes for a specific tab
  const handleUrlChange = React.useCallback((tabKey: string, url: string) => {
    setCurrentUrls(prev => ({ ...prev, [tabKey]: url }));
  }, []);

  // Handle link hover events
  const handleLinkHover = React.useCallback((url: string) => {
    setLinkPreview(url);
  }, []);

  // Handle link leave events
  const handleLinkLeave = React.useCallback(() => {
    setLinkPreview("");
  }, []);

  // Preserve webview state by keeping them mounted but hidden
  const preserveWebviewState = React.useCallback(
    (tabKey: string) => {
      const tabIndex = tabs.findIndex((t) => t.key === tabKey);
      if (tabIndex === -1) return;

      const webview = webviewRefs.current[tabIndex];
      if (webview && typeof webview.executeJavaScript === "function") {
        try {
          // Store only simple, serializable values
          webview.executeJavaScript(
            `window.preserveWebviewState && window.preserveWebviewState();`
          );
        } catch {
          // no-op
        }
      }
    },
    [tabs]
  );

  // Restore webview state when tab becomes active
  const restoreWebviewState = React.useCallback(
    (tabKey: string) => {
      const tabIndex = tabs.findIndex((t) => t.key === tabKey);
      if (tabIndex === -1) return;

      const webview = webviewRefs.current[tabIndex];
      if (webview && typeof webview.executeJavaScript === "function") {
        try {
          // Restore scroll position safely
          webview.executeJavaScript(
            `window.restoreWebviewState && window.restoreWebviewState();`
          );
        } catch {
          // no-op
        }
      }
    },
    [tabs]
  );

  // Initialize current URLs with tab URLs
  React.useEffect(() => {
    const initialUrls: { [key: string]: string } = {};
    tabs.forEach(tab => {
      initialUrls[tab.key] = tab.url;
    });
    setCurrentUrls(initialUrls);
  }, [tabs]);

  // Listen for link hover messages from webviews
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data.type === 'link-hover') {
        handleLinkHover(event.data.url);
      } else if (event.data.type === 'link-leave') {
        handleLinkLeave();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [handleLinkHover, handleLinkLeave]);

  return {
    webviewRefs,
    loadingStates,
    loadingProgress,
    loadedTabs,
    currentUrls,
    linkPreview,
    handleUrlChange,
    handleLinkHover,
    handleLinkLeave,
    preserveWebviewState,
    restoreWebviewState
  };
}
