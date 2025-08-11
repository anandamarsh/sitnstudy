import React, { useRef } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";

interface WebviewPreviewProps {
  url: string;
  webviewLoading: boolean;
  webviewFailed: boolean;
  isValidUrl: (url: string) => boolean;
  onTitleExtracted?: (title: string) => void;
}

export const WebviewPreview: React.FC<WebviewPreviewProps> = ({
  url,
  webviewLoading,
  webviewFailed,
  isValidUrl,
  onTitleExtracted,
}) => {
  const webviewRef = useRef<any>(null);

  // Add event listener when webview loads
  React.useEffect(() => {
    const webview = webviewRef.current;
    if (webview && onTitleExtracted) {
      const handleLoad = () => {
        try {
          const title = webview.getTitle();
          if (title && title.length > 0) {
            onTitleExtracted(title);
          }
        } catch (error) {
          console.log("Could not extract title from webview:", error);
        }
      };

      webview.addEventListener("did-finish-load", handleLoad);
      return () => webview.removeEventListener("did-finish-load", handleLoad);
    }
  }, [onTitleExtracted]);

  if (!url) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "#fafafa",
          gap: 2,
        }}
      >
        <Typography
          variant="h6"
          sx={{
            color: "#666",
            fontWeight: 500,
          }}
        >
          Enter a URL to Preview
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#999",
            textAlign: "center",
            maxWidth: 300,
          }}
        ></Typography>
      </Box>
    );
  }

  if (!isValidUrl(url)) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "#fff3e0",
          gap: 2,
          padding: 3,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#ffcc02",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            !
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: "#e65100",
            fontWeight: 500,
          }}
        >
          Invalid URL Format
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#f57c00",
            textAlign: "center",
            maxWidth: 300,
          }}
        >
          Please enter a valid website URL (e.g., https://example.com)
        </Typography>
      </Box>
    );
  }

  if (webviewLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "#fafafa",
          gap: 2,
        }}
      >
        <CircularProgress size={48} />
        <Typography variant="h6" sx={{ color: "#666" }}>
          Loading Preview...
        </Typography>
      </Box>
    );
  }

  if (webviewFailed) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          height: "100%",
          backgroundColor: "#ffebee",
          gap: 2,
          padding: 3,
        }}
      >
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            backgroundColor: "#f44336",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography
            variant="h4"
            sx={{
              color: "#fff",
              fontWeight: "bold",
            }}
          >
            !
          </Typography>
        </Box>
        <Typography
          variant="h6"
          sx={{
            color: "#c62828",
            fontWeight: 500,
          }}
        >
          Failed to Load Preview
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#d32f2f",
            textAlign: "center",
            maxWidth: 300,
          }}
        >
          Unable to load the website preview. Please check the URL and try
          again.
        </Typography>
      </Box>
    );
  }

  return (
    <webview
      ref={webviewRef}
      src={url}
      allowpopups
      partition="persist:sitnstudy-shared"
      style={{
        width: "100%",
        height: "100%",
        border: "none",
      }}
      title="Website Preview"
    />
  );
};
