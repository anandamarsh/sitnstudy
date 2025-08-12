
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

  const handleBackClick = (index: number) => {
    const webview = webviewRefs.current[index];
    if (webview && typeof webview.canGoBack === 'function' && webview.canGoBack()) {
      webview.goBack();
    }
  };

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
        />
      ))}
    </Box>
  );
}

// Export types and hooks for external use
export { useWebviewMedia } from "./hooks/useWebviewMedia";
export { useWebviewState } from "./hooks/useWebviewState";
export type { SiteTab, WebviewTabProps, WebviewState, WebviewMedia } from "./types";
