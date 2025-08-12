
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

  // Media control functions available for external use
  useWebviewMedia(webviewRefs, activeIndex, tabs, preserveWebviewState, restoreWebviewState);

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
          />
        ))}
      </Box>
    </Box>
  );
}

// Export types and hooks for external use
export { useWebviewMedia } from "./hooks/useWebviewMedia";
export { useWebviewState } from "./hooks/useWebviewState";
export type { SiteTab, WebviewTabProps, WebviewState, WebviewMedia } from "./types";
