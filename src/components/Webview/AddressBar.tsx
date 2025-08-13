import { Box, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward, Refresh, Code } from "@mui/icons-material";

interface AddressBarProps {
  url: string;
  onBackClick?: () => void;
  onForwardClick?: () => void;
  onRefreshClick?: () => void;
  onInspectClick?: () => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export default function AddressBar({ url, onBackClick, onForwardClick, onRefreshClick, onInspectClick, canGoBack, canGoForward }: AddressBarProps): JSX.Element {
  return (
    <Box
      sx={{
        position: "absolute",
        top: 0,
        left: 0,
        right: 0,
        height: 40,
        display: "flex",
        alignItems: "center",
        padding: "0 8px",
        zIndex: 1001,
        borderBottom: "1px solid #e0e0e0",
        backgroundColor: "#f5f5f5",
      }}
    >
      {/* Navigation Buttons */}
      <IconButton
        onClick={onBackClick}
        disabled={!canGoBack}
        sx={{
          width: 32,
          height: 32,
          marginRight: 1,
          color: canGoBack ? "#666" : "#ccc",
          "&:hover": {
            backgroundColor: canGoBack ? "#e0e0e0" : "transparent",
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
          },
        }}
        title="Go back"
      >
        <ArrowBack fontSize="small" />
      </IconButton>

      <IconButton
        onClick={onForwardClick}
        disabled={!canGoForward}
        sx={{
          width: 32,
          height: 32,
          marginRight: 1,
          color: canGoForward ? "#666" : "#ccc",
          "&:hover": {
            backgroundColor: canGoForward ? "#e0e0e0" : "transparent",
          },
          "&.Mui-disabled": {
            backgroundColor: "transparent",
          },
        }}
        title="Go forward"
      >
        <ArrowForward fontSize="small" />
      </IconButton>

      <IconButton
        onClick={onRefreshClick}
        sx={{
          width: 32,
          height: 32,
          marginRight: 1,
          color: "#666",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
        title="Refresh page"
      >
        <Refresh fontSize="small" />
      </IconButton>

      {/* Inspect Button */}
      <IconButton
        onClick={onInspectClick}
        sx={{
          width: 32,
          height: 32,
          marginRight: 2,
          color: "#666",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
        title="Inspect Element (DevTools)"
      >
        <Code fontSize="small" />
      </IconButton>

      {/* Address Bar */}
      <Box
        component="input"
        value={url}
        readOnly
        disabled
        sx={{
          flex: 1,
          height: 32,
          padding: "0 12px",
          border: "none",
          outline: "none",
          backgroundColor: "#fff",
          color: "text.primary",
          fontSize: "14px",
          fontFamily: "monospace",
          cursor: "default",
          borderRadius: "4px",
          "&:disabled": {
            opacity: 0.7,
          },
        }}
      />
    </Box>
  );
}
