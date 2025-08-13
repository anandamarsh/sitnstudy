
import { Box, LinearProgress } from "@mui/material";
import { WebviewTabProps } from "./types";
import WebviewElement from "./WebviewElement";
import AddressBar from "./AddressBar";
import LinkPreviewBar from "./LinkPreviewBar";

export default function WebviewTab(props: WebviewTabProps): JSX.Element {
  const {
    tab,
    index,
    isActive,
    webviewRef,
    loadingState,
    loadingProgress,
    isLoaded,
    currentUrl,
    linkPreview,
    onUrlChange,
    onBackClick,
    onForwardClick,
    onRefreshClick,
    canGoBack,
    canGoForward
  } = props;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: isActive ? "block" : "none",
        zIndex: isActive ? 1 : 0,
      }}
    >
      {/* Address Bar - shown when enabled for this tab */}
      {tab.showAddressBar && isActive && (
        <AddressBar 
          url={currentUrl || tab.url} 
                  onBackClick={() => onBackClick(index)}
        onForwardClick={() => onForwardClick(index)}
        onRefreshClick={() => onRefreshClick(index)}
        onInspectClick={() => {
          // Open DevTools for this webview
          // We need to find the webview element in the DOM since webviewRef is a function
          const webviewElement = document.querySelector(`webview[data-tab-key="${tab.key}"]`);
          if (webviewElement && (webviewElement as any).openDevTools) {
            try {
              (webviewElement as any).openDevTools({ mode: 'detach' });
            } catch (error) {
              console.error('Error opening DevTools:', error);
            }
          }
        }}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        />
      )}

      {/* Loading Progress Bar */}
      {loadingState && !isLoaded && (
        <Box sx={{ position: "absolute", top: 0, left: 0, right: 0, zIndex: 1000 }}>
          <LinearProgress 
            variant="determinate" 
            value={loadingProgress} 
            sx={{ height: 2 }}
          />
        </Box>
      )}

      {/* Webview Element */}
      <WebviewElement
        tab={tab}
        webviewRef={webviewRef}
        onUrlChange={onUrlChange}
      />

      {/* Link Preview Bar - shown at bottom of this webview when hovering over links */}
      {linkPreview && isActive && (
        <LinkPreviewBar linkPreview={linkPreview} />
      )}
    </Box>
  );
}
