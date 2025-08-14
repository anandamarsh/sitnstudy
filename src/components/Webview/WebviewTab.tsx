
import { Box, LinearProgress } from "@mui/material";
import { WebviewTabProps } from "./types";
import WebviewElement from "./WebviewElement";
import AddressBar from "./AddressBar";


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
          console.log('🔍 Found webview element:', webviewElement);
          console.log('🔍 Webview methods:', webviewElement ? Object.getOwnPropertyNames(webviewElement) : 'No element');
          
          if (webviewElement && (webviewElement as any).openDevTools) {
            try {
              console.log('🔍 Attempting to open DevTools...');
              // Try without mode first, then with mode if that fails
              (webviewElement as any).openDevTools();
              console.log('🔍 DevTools opened successfully');
            } catch (error) {
              console.error('🔍 Error opening DevTools:', error);
              // Fallback: try with detached mode
              try {
                console.log('🔍 Trying detached mode as fallback...');
                (webviewElement as any).openDevTools({ mode: 'detach' });
                console.log('🔍 DevTools opened in detached mode');
              } catch (fallbackError) {
                console.error('🔍 Fallback also failed:', fallbackError);
              }
            }
          } else {
            console.error('🔍 Webview element not found or openDevTools method not available');
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


    </Box>
  );
}
