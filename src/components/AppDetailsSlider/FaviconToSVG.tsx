import React, { useState, useEffect } from "react";
import { Box, Typography, CircularProgress } from "@mui/material";
import {
  convertFaviconToSVG,
  FaviconConversionResult,
} from "../../utils/faviconConverter";

interface FaviconToSVGProps {
  faviconUrl: string;
  size: number;
  customSvgContent?: string;
  onSvgContentChange?: (content: string) => void;
}

const FaviconToSVG: React.FC<FaviconToSVGProps> = ({
  faviconUrl,
  size,
  customSvgContent,
}) => {
  const [svgContent, setSvgContent] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!faviconUrl) {
      setIsLoading(false);
      return;
    }

    // Don't run favicon conversion if we have custom SVG content
    if (customSvgContent) {
      setIsLoading(false);
      return;
    }

    const updateResult = (result: FaviconConversionResult) => {
      setSvgContent(result.svgContent);
      setIsLoading(result.isLoading);
      setError(result.error);
    };

    const cleanup = convertFaviconToSVG(faviconUrl, size, updateResult);

    return cleanup;
  }, [faviconUrl, size, customSvgContent]);

  if (isLoading) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height={size}
        width={size}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          backgroundColor: "white",
        }}
      >
        <CircularProgress size={24} />
        <Typography variant="caption" sx={{ mt: 1 }}>
          Converting...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        height={size}
        width={size}
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 1,
          backgroundColor: "white",
        }}
      >
        <Typography variant="caption" color="error">
          {error}
        </Typography>
      </Box>
    );
  }

  // Use custom SVG content if provided, otherwise use fetched content
  const displaySvgContent = customSvgContent || svgContent;

  if (!displaySvgContent) {
    return null;
  }

  // If we have custom SVG content, show it immediately without loading states
  if (customSvgContent) {
    console.log(
      "Rendering custom SVG content, length:",
      customSvgContent.length,
      "content preview:",
      customSvgContent.substring(0, 100)
    );
    return (
      <Box
        sx={{
          overflow: "hidden",
        }}
        dangerouslySetInnerHTML={{ __html: customSvgContent }}
      />
    );
  }

  return (
    <Box
      sx={{
        overflow: "hidden",
      }}
      dangerouslySetInnerHTML={{ __html: displaySvgContent }}
    />
  );
};

export default FaviconToSVG;
