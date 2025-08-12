import React from "react";
import { Box, LinearProgress } from "@mui/material";

// Extend HTMLWebViewElement to include our custom properties
declare global {
  interface HTMLWebViewElement {
    _listeners?: {
      didNavigate: (e: any) => void;
      didNavigateInPage: (e: any) => void;
      domReady: () => void;
    };
  }
}

export interface SiteTab {
  key: string;
  title: string;
  url: string;
  icon?: React.ReactElement;
  showAddressBar?: boolean;
}

interface WebviewTabsProps {
  tabs: SiteTab[];
  activeIndex: number;
  onCloseTab?: (tabKey: string) => void;
}

export default function WebviewTabs(props: WebviewTabsProps): JSX.Element {
  const { tabs, activeIndex } = props;
  const webviewRefs = React.useRef<any[]>([]);
  const [loadingStates, setLoadingStates] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [loadingProgress, setLoadingProgress] = React.useState<{
    [key: string]: number;
  }>({});
  const [loadedTabs, setLoadedTabs] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [currentUrls, setCurrentUrls] = React.useState<{
    [key: string]: string;
  }>({});
  const [linkPreview, setLinkPreview] = React.useState<string>("");

  // Function to pause all webviews (can be called from parent)
  const pauseAllWebviews = () => {
    webviewRefs.current.forEach((wv) => {
      if (!wv) return;
      try {
        if (typeof wv.executeJavaScript === "function") {
          wv.executeJavaScript(`window.pauseAllMedia && window.pauseAllMedia();`);
        }
      } catch {
        // no-op
      }
    });
  };

  // Expose the function globally so it can be called from anywhere
  React.useEffect(() => {
    (window as any).pauseAllWebviews = pauseAllWebviews;
    return () => {
      delete (window as any).pauseAllWebviews;
    };
  }, []);

  // Handle URL changes for address bar display
  const handleUrlChange = (tabKey: string, newUrl: string) => {
    setCurrentUrls((prev) => ({ ...prev, [tabKey]: newUrl }));
  };

  // Handle link preview on hover
  const handleLinkHover = (url: string) => {
    console.log("🔗 Link hover detected:", url);
    setLinkPreview(url);
  };

  const handleLinkLeave = () => {
    console.log("🔗 Link hover ended");
    setLinkPreview("");
  };

  // Listen for messages from webview for link hovers
  React.useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      console.log("📨 Message received from webview:", event.data);
      if (event.data && event.data.type === "link-hover") {
        handleLinkHover(event.data.url);
      } else if (event.data && event.data.type === "link-leave") {
        handleLinkLeave();
      }
    };

    window.addEventListener("message", handleMessage);
    return () => window.removeEventListener("message", handleMessage);
  }, [handleLinkHover, handleLinkLeave]);

  // Simulate loading progress for better UX
  React.useEffect(() => {
    const currentTab = tabs[activeIndex];
    if (!currentTab) return;

    // Only show loading if this tab hasn't been loaded before
    if (!loadedTabs[currentTab.key]) {
      // Start loading when tab changes
      setLoadingStates((prev) => ({ ...prev, [currentTab.key]: true }));
      setLoadingProgress((prev) => ({ ...prev, [currentTab.key]: 0 }));

      // Simulate progress
      const progressInterval = setInterval(() => {
        setLoadingProgress((prev) => {
          const current = prev[currentTab.key] || 0;
          if (current < 90) {
            return { ...prev, [currentTab.key]: current + Math.random() * 20 };
          }
          return prev;
        });
      }, 200);

      // Complete loading after a delay
      const completeTimeout = setTimeout(() => {
        setLoadingStates((prev) => ({ ...prev, [currentTab.key]: false }));
        setLoadingProgress((prev) => ({ ...prev, [currentTab.key]: 100 }));
        setLoadedTabs((prev) => ({ ...prev, [currentTab.key]: true }));
      }, 1500);

      return () => {
        clearInterval(progressInterval);
        clearTimeout(completeTimeout);
      };
    }
  }, [activeIndex, tabs, loadedTabs]);

  // Pause media in any background (inactive) webviews when switching tabs
  React.useEffect(() => {
    webviewRefs.current.forEach((wv, idx) => {
      if (!wv || idx === activeIndex) return;
      try {
        if (typeof wv.executeJavaScript === "function") {
          wv.executeJavaScript(`window.pauseMediaOnly && window.pauseMediaOnly();`);
        }
      } catch {
        // no-op
      }
    });
  }, [activeIndex, tabs.length]);

  // Preserve webview state by keeping them mounted but hidden
  const preserveWebviewState = React.useCallback(
    (tabKey: string) => {
      const tabIndex = tabs.findIndex((t) => t.key === tabKey);
      if (tabIndex === -1) return;

      const webview = webviewRefs.current[tabIndex];
      if (webview && typeof webview.executeJavaScript === "function") {
        try {
          // Store only simple, serializable values
          webview.executeJavaScript(`window.preserveWebviewState && window.preserveWebviewState();`);
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
          webview.executeJavaScript(`window.restoreWebviewState && window.restoreWebviewState();`);
        } catch {
          // no-op
        }
      }
    },
    [tabs]
  );

  // Resume media on the newly active webview (best-effort; may be blocked by site policy)
  React.useEffect(() => {
    const activeWv = webviewRefs.current[activeIndex];
    if (!activeWv) return;

    // Restore state for the newly active tab
    if (tabs[activeIndex]) {
      restoreWebviewState(tabs[activeIndex].key);
    }

    try {
      if (typeof activeWv.executeJavaScript === "function") {
        activeWv.executeJavaScript(`window.resumeMedia && window.resumeMedia();`);
      }
    } catch {
      // no-op
    }
  }, [activeIndex, tabs, restoreWebviewState]);

  // Preserve state when switching away from a tab
  React.useEffect(() => {
    const previousActiveTab = tabs[activeIndex - 1] || tabs[activeIndex + 1];
    if (previousActiveTab && previousActiveTab.key !== tabs[activeIndex]?.key) {
      preserveWebviewState(previousActiveTab.key);
    }
  }, [activeIndex, tabs, preserveWebviewState]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        minWidth: 0,
        position: "relative",
      }}
    >
      <Box
        sx={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          width: "100%",
          minWidth: 0,
        }}
      >
        {tabs.map((t, idx) => (
          <Box
            key={`panel-${t.key}-${idx}`}
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              width: "100%",
              height: "100%",
              display: idx === activeIndex ? "block" : "none",
              zIndex: idx === activeIndex ? 1 : 0,
            }}
          >
            {/* Address Bar - shown when enabled for this tab */}
            {t.showAddressBar && idx === activeIndex && (
              <Box
                sx={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 40,
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  zIndex: 1001,
                }}
              >
                <Box
                  component="input"
                  value={currentUrls[t.key] || t.url}
                  readOnly
                  disabled
                  sx={{
                    width: "100%",
                    height: 32,
                    padding: "0",
                    border: "none",
                    outline: "none",
                    backgroundColor: "transparent",
                    color: "text.primary",
                    fontSize: "14px",
                    fontFamily: "monospace",
                    cursor: "default",
                    "&:disabled": {
                      opacity: 0.7,
                    },
                  }}
                />
              </Box>
            )}

            {/* eslint-disable-next-line react/no-unknown-property */}
            <webview
              key={`webview-${t.key}`}
              src={t.url}
              allowpopups
              webpreferences="allowRunningInsecureContent,contextIsolation,nodeIntegration,webSecurity"
              partition="persist:sitnstudy-shared"
              {...({ name: t.key } as any)}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
                marginTop: t.showAddressBar ? "40px" : "0",
              }}
              ref={(el) => {
                webviewRefs.current[idx] = el;
                if (el) {
                  // Remove any existing listeners first to prevent duplicates
                  const existingListeners = el._listeners;
                  if (existingListeners?.didNavigate) {
                    el.removeEventListener(
                      "did-navigate",
                      existingListeners.didNavigate
                    );
                  }
                  if (existingListeners?.didNavigateInPage) {
                    el.removeEventListener(
                      "did-navigate-in-page",
                      existingListeners.didNavigateInPage
                    );
                  }
                  if (existingListeners?.domReady) {
                    el.removeEventListener(
                      "dom-ready",
                      existingListeners.domReady
                    );
                  }

                  // Create new listener functions
                  const didNavigateListener = (e: any) => {
                    handleUrlChange(t.key, e.url);
                  };
                  const didNavigateInPageListener = (e: any) => {
                    handleUrlChange(t.key, e.url);
                  };
                  const domReadyListener = () => {
                    if (
                      el &&
                      typeof (el as any).executeJavaScript === "function"
                    ) {
                      // Inject mole.js script into the webview
                      try {
                        // First inject the mole.js script
                        (el as any).executeJavaScript(`
                          if (!window.moleScriptLoaded) {
                            // Load mole.js script
                            const script = document.createElement('script');
                            script.src = '/mole.js';
                            script.onload = function() {
                              console.log('🔗 Mole.js script loaded successfully');
                              window.moleScriptLoaded = true;
                            };
                            script.onerror = function() {
                              console.error('🔗 Failed to load mole.js script');
                            };
                            document.head.appendChild(script);
                          } else {
                            console.log('🔗 Mole.js script already loaded');
                          }
                        `);
                      } catch (error) {
                        console.error('Error injecting mole.js script:', error);
                      }
                    }
                  };

                  // Add new listeners
                  el.addEventListener("did-navigate", didNavigateListener);
                  el.addEventListener(
                    "did-navigate-in-page",
                    didNavigateInPageListener
                  );
                  el.addEventListener("dom-ready", domReadyListener);

                  // Store references for cleanup
                  el._listeners = {
                    didNavigate: didNavigateListener,
                    didNavigateInPage: didNavigateInPageListener,
                    domReady: domReadyListener,
                  };
                }
              }}
            />
            {/* Link Preview Bar - shown at bottom of this webview when hovering over links */}
            {linkPreview && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  height: 32,
                  backgroundColor: "background.paper",
                  borderTop: "1px solid",
                  borderColor: "divider",
                  display: "flex",
                  alignItems: "center",
                  padding: "0 12px",
                  zIndex: 1002,
                  fontSize: "12px",
                  color: "text.secondary",
                  fontFamily: "monospace",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {linkPreview}
              </Box>
            )}

            {idx === activeIndex && loadingStates[t.key] && (
              <Box
                sx={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  width: "100%",
                  zIndex: 1000,
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={loadingProgress[t.key] || 0}
                  sx={{
                    height: 4,
                    borderRadius: 0,
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 0,
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
