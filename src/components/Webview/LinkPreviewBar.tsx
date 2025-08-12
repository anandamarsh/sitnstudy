
import { Box } from "@mui/material";

interface LinkPreviewBarProps {
  linkPreview: string;
}

export default function LinkPreviewBar({ linkPreview }: LinkPreviewBarProps): JSX.Element {
  return (
    <Box
      sx={{
        position: "absolute",
        bottom: 0,
        left: 0,
        right: 0,
        height: 32,
        backgroundColor: "background.paper",
        borderTop: "1px solid",
        borderColor: "divider",
        display: "flex",
        alignItems: "center",
        padding: "0 12px",
        zIndex: 1002,
        fontSize: "12px",
        color: "text.secondary",
        fontFamily: "monospace",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap",
      }}
    >
      {linkPreview}
    </Box>
  );
}
