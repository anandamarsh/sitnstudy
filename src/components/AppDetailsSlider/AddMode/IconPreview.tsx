import React from "react";
import { Box } from "@mui/material";
import FaviconToSVG from "../FaviconToSVG";

interface IconPreviewProps {
  iconPath: string;
}

export const IconPreview: React.FC<IconPreviewProps> = ({ iconPath }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: 160,
        width: 160,
        flexShrink: 0,
      }}
    >
      <FaviconToSVG faviconUrl={iconPath} size={160} />
    </Box>
  );
};
