
import { Box, LinearProgress } from "@mui/material";
import { WebviewTabProps } from "./types";
import WebviewElement from "./WebviewElement";
import AddressBar from "./AddressBar";
import LinkPreviewBar from "./LinkPreviewBar";

export default function WebviewTab(props: WebviewTabProps): JSX.Element {
  const {
    tab,
    isActive,
    webviewRef,
    loadingState,
    loadingProgress,
    isLoaded,
    currentUrl,
    linkPreview,
    onUrlChange
  } = props;

  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        display: isActive ? "block" : "none",
        zIndex: isActive ? 1 : 0,
      }}
    >
      {/* Address Bar - shown when enabled for this tab */}
      {tab.showAddressBar && isActive && (
        <AddressBar url={currentUrl || tab.url} />
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
