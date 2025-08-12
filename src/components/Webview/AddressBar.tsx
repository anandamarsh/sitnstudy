
import { Box } from "@mui/material";

interface AddressBarProps {
  url: string;
}

export default function AddressBar({ url }: AddressBarProps): JSX.Element {
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
        padding: "0 12px",
        zIndex: 1001,
      }}
    >
      <Box
        component="input"
        value={url}
        readOnly
        disabled
        sx={{
          width: "100%",
          height: 32,
          padding: "0",
          border: "none",
          outline: "none",
          backgroundColor: "transparent",
          color: "text.primary",
          fontSize: "14px",
          fontFamily: "monospace",
          cursor: "default",
          "&:disabled": {
            opacity: 0.7,
          },
        }}
      />
    </Box>
  );
}
