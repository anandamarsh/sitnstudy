import { Box, IconButton } from "@mui/material";
import { ArrowBack, ArrowForward, Refresh } from "@mui/icons-material";

interface AddressBarProps {
  url: string;
  onBackClick?: () => void;
  onForwardClick?: () => void;
  onRefreshClick?: () => void;
}

export default function AddressBar({ url, onBackClick, onForwardClick, onRefreshClick }: AddressBarProps): JSX.Element {
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
        sx={{
          width: 32,
          height: 32,
          marginRight: 4,
          color: "#666",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
        title="Go back"
      >
        <ArrowBack fontSize="small" />
      </IconButton>

      <IconButton
        onClick={onForwardClick}
        sx={{
          width: 32,
          height: 32,
          marginRight: 4,
          color: "#666",
          "&:hover": {
            backgroundColor: "#e0e0e0",
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
          marginRight: 8,
          color: "#666",
          "&:hover": {
            backgroundColor: "#e0e0e0",
          },
        }}
        title="Refresh page"
      >
        <Refresh fontSize="small" />
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
