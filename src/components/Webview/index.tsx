
import React from "react";
import { Box } from "@mui/material";
import WebviewTab from "./WebviewTab";
import { SiteTab } from "./types";
import { useWebviewState } from "./hooks/useWebviewState";
import { useWebviewMedia } from "./hooks/useWebviewMedia";

interface WebviewProps {
  tabs: SiteTab[];
  activeIndex: number;
  onCloseTab?: (tabKey: string) => void;
}

export default function Webview(props: WebviewProps): JSX.Element {
  const { tabs, activeIndex } = props;
  
  const {
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
  } = useWebviewState(tabs);

  // Track navigation state for each webview
  const [navigationStates, setNavigationStates] = React.useState<{
    [key: string]: { canGoBack: boolean; canGoForward: boolean }
  }>({});

  const handleBackClick = (index: number) => {
    const webview = webviewRefs.current[index];
    if (webview && typeof webview.canGoBack === 'function' && webview.canGoBack()) {
      webview.goBack();
    }
  };

  const handleForwardClick = (index: number) => {
    const webview = webviewRefs.current[index];
    if (webview && typeof webview.canGoForward === 'function' && webview.canGoForward()) {
      webview.goForward();
    }
  };

  const handleRefreshClick = (index: number) => {
    const webview = webviewRefs.current[index];
    if (webview && typeof webview.reload === 'function') {
      webview.reload();
    }
  };

  // Update navigation state when webview refs change
  React.useEffect(() => {
    const updateNavigationState = () => {
      const newStates: { [key: string]: { canGoBack: boolean; canGoForward: boolean } } = {};
      
      tabs.forEach((tab, index) => {
        const webview = webviewRefs.current[index];
        if (webview) {
          newStates[tab.key] = {
            canGoBack: typeof webview.canGoBack === 'function' ? webview.canGoBack() : false,
            canGoForward: typeof webview.canGoForward === 'function' ? webview.canGoForward() : false
          };
        } else {
          newStates[tab.key] = { canGoBack: false, canGoForward: false };
        }
      });
      
      setNavigationStates(newStates);
    };

    // Update immediately and set up interval for periodic updates
    updateNavigationState();
    const interval = setInterval(updateNavigationState, 1000); // Check every second

    return () => clearInterval(interval);
  }, [tabs, webviewRefs]);

  // Media control functions available for external use
  useWebviewMedia(webviewRefs, activeIndex, tabs, preserveWebviewState, restoreWebviewState);

  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        position: "relative",
        overflow: "hidden",
      }}
    >
      {tabs.map((t, idx) => (
        <WebviewTab
          key={`panel-${t.key}-${idx}`}
          tab={t}
          index={idx}
          isActive={idx === activeIndex}
          webviewRef={(el) => (webviewRefs.current[idx] = el)}
          loadingState={loadingStates[t.key]}
          loadingProgress={loadingProgress[t.key]}
          isLoaded={loadedTabs[t.key]}
          currentUrl={currentUrls[t.key]}
          linkPreview={linkPreview}
          onUrlChange={handleUrlChange}
          onLinkHover={handleLinkHover}
          onLinkLeave={handleLinkLeave}
          onPreserveState={preserveWebviewState}
          onRestoreState={restoreWebviewState}
          onBackClick={handleBackClick}
          onForwardClick={handleForwardClick}
          onRefreshClick={handleRefreshClick}
          canGoBack={navigationStates[t.key]?.canGoBack || false}
          canGoForward={navigationStates[t.key]?.canGoForward || false}
        />
      ))}
    </Box>
  );
}

// Export types and hooks for external use
export { useWebviewMedia } from "./hooks/useWebviewMedia";
export { useWebviewState } from "./hooks/useWebviewState";
export type { SiteTab, WebviewTabProps, WebviewState, WebviewMedia } from "./types";
