
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
    handleUrlChange,
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

  // Listen for messages from main process to open webview DevTools
  React.useEffect(() => {
    const handleOpenWebviewDevTools = () => {
      // Find the currently active webview and open its DevTools
      const activeWebview = webviewRefs.current[activeIndex];
      if (activeWebview && activeWebview.openDevTools) {
        try {
          activeWebview.openDevTools();
        } catch (error) {
          console.error('Error opening webview DevTools:', error);
        }
      }
    };

    window.ipcRenderer.on('open-webview-devtools', handleOpenWebviewDevTools);
    
    return () => {
      window.ipcRenderer.off('open-webview-devtools', handleOpenWebviewDevTools);
    };
  }, [activeIndex]);

  // Listen for IPC messages from webview preload scripts
  React.useEffect(() => {
    const handleWebviewIpcMessage = (event: any) => {
      if (event.channel === 'webview-context-menu') {
        const pos = event.args?.[0] || { x: 0, y: 0 };
        console.log('🔍 Received webview context menu request:', pos);
        
        // Show native context menu using the electronAPI
        if (window.electronAPI?.showWebviewContextMenu) {
          window.electronAPI.showWebviewContextMenu(pos);
        }
      }
    };

    // Add IPC message listeners to all webviews
    const addIpcListeners = () => {
      tabs.forEach((_tab, index) => {
        const webview = webviewRefs.current[index];
        if (webview && webview.addEventListener) {
          webview.addEventListener('ipc-message', handleWebviewIpcMessage);
        }
      });
    };

    // Add listeners when webviews are ready
    const timeoutId = setTimeout(addIpcListeners, 1000);
    
    return () => {
      clearTimeout(timeoutId);
      // Clean up listeners
      tabs.forEach((_tab, index) => {
        const webview = webviewRefs.current[index];
        if (webview && webview.removeEventListener) {
          webview.removeEventListener('ipc-message', handleWebviewIpcMessage);
        }
      });
    };
  }, [tabs, webviewRefs]);

  // Update navigation state when webview refs change
  React.useEffect(() => {
    const updateNavigationState = () => {
      const newStates: { [key: string]: { canGoBack: boolean; canGoForward: boolean } } = {};
      
      tabs.forEach((tab, index) => {
        const webview = webviewRefs.current[index];
        if (webview && webview.getWebContentsId) {
          try {
            newStates[tab.key] = {
              canGoBack: webview.canGoBack ? webview.canGoBack() : false,
              canGoForward: webview.canGoForward ? webview.canGoForward() : false
            };
          } catch (error) {
            // Webview not ready yet
            newStates[tab.key] = { canGoBack: false, canGoForward: false };
          }
        } else {
          newStates[tab.key] = { canGoBack: false, canGoForward: false };
        }
      });
      
      setNavigationStates(newStates);
    };

    // Update when tabs change
    updateNavigationState();
  }, [tabs, webviewRefs]);

  // Update navigation state when a specific webview becomes ready
  const updateWebviewNavigationState = React.useCallback((index: number) => {
    const webview = webviewRefs.current[index];
    if (webview && webview.getWebContentsId) {
      try {
        const tab = tabs[index];
        if (tab) {
          setNavigationStates(prev => ({
            ...prev,
            [tab.key]: {
              canGoBack: webview.canGoBack ? webview.canGoBack() : false,
              canGoForward: webview.canGoForward ? webview.canGoForward() : false
            }
          }));
        }
      } catch (error) {
        // Webview not ready yet
      }
    }
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
          webviewRef={(el) => {
            webviewRefs.current[idx] = el;
            if (el) {
              // Update navigation state when webview is attached
              setTimeout(() => updateWebviewNavigationState(idx), 100);
            }
          }}
          loadingState={loadingStates[t.key]}
          loadingProgress={loadingProgress[t.key]}
          isLoaded={loadedTabs[t.key]}
          currentUrl={currentUrls[t.key]}
          onUrlChange={handleUrlChange}
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
