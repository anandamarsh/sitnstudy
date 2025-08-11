import { Box, Avatar } from "@mui/material";
import { Apps } from "@mui/icons-material";
import { SiOpenai } from "react-icons/si";
import { GiGamepad } from "react-icons/gi";
import { SiteConfig } from "./types";
import { useState } from "react";

// Kid-friendly color palette
const KID_COLORS = [
  "#FF6B6B", // Coral Red
  "#4ECDC4", // Turquoise
  "#45B7D1", // Sky Blue
  "#96CEB4", // Mint Green
  "#FFEAA7", // Warm Yellow
  "#DDA0DD", // Plum
  "#98D8C8", // Seafoam
  "#F7DC6F", // Golden Yellow
  "#BB8FCE", // Lavender
  "#85C1E9", // Light Blue
  "#F8C471", // Orange
  "#82E0AA", // Light Green
];

export const IconImg = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);
  
  // Generate a consistent color based on the alt text
  const colorIndex = alt.charCodeAt(0) % KID_COLORS.length;
  const backgroundColor = KID_COLORS[colorIndex];

  if (hasError) {
    return (
      <Avatar
        sx={{
          width: "100%",
          height: "100%",
          fontSize: "60%",
          backgroundColor: backgroundColor,
          color: "white",
          fontWeight: "bold",
          fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Arial Rounded MT Bold', sans-serif",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          border: "3px solid white",
        }}
      >
        {alt.charAt(0).toUpperCase()}
      </Avatar>
    );
  }

  return (
    <Box
      component="img"
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      sx={{
        width: "100%",
        height: "100%",
        objectFit: "contain",
        borderRadius: "12px",
        boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
      }}
    />
  );
};

export const getIconComponent = (site: SiteConfig) => {
  if (site.iconPath) {
    if (site.iconType === "svg") {
      return <IconImg src={site.iconPath} alt={site.title} />;
    }
  }

  // Handle react-icon type
  if (site.iconType === "react-icon") {
    if (site.iconName === "Apps") {
      const color = site.iconProps?.color || "#FF6B6B";
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFE5E5",
            borderRadius: "16px",
            border: "3px solid #FF6B6B",
          }}
        >
          <Apps sx={{ fontSize: "80%", color: color }} />
        </Box>
      );
    } else if (site.iconName === "SiOpenai") {
      const color = site.iconProps?.color || "#10A37F";
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#E5F7F0",
            borderRadius: "16px",
            border: "3px solid #10A37F",
          }}
        >
          <SiOpenai size="80%" color={color} />
        </Box>
      );
    } else if (site.iconName === "GiGamepad") {
      const color = site.iconProps?.color || "#FF6B6B";
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#FFE5E5",
            borderRadius: "16px",
            border: "3px solid #FF6B6B",
          }}
        >
          <GiGamepad size="80%" color={color} />
        </Box>
      );
    }
  }

  // Fallback to MUI Avatar with kid-friendly styling
  const colorIndex = site.title.charCodeAt(0) % KID_COLORS.length;
  const backgroundColor = KID_COLORS[colorIndex];
  
  return (
    <Avatar
      sx={{
        width: "100%",
        height: "100%",
        fontSize: "60%",
        backgroundColor: backgroundColor,
        color: "white",
        fontWeight: "bold",
        fontFamily: "'Comic Sans MS', 'Chalkboard SE', 'Arial Rounded MT Bold', sans-serif",
        boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
        border: "3px solid white",
      }}
    >
      {site.title.charAt(0).toUpperCase()}
    </Avatar>
  );
};
