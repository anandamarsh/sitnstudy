import { Box, Avatar } from "@mui/material";
import { Apps } from "@mui/icons-material";
import { SiOpenai } from "react-icons/si";
import { GiGamepad } from "react-icons/gi";
import { SiteConfig } from "./types";
import { useState } from "react";

export const IconImg = ({ src, alt }: { src: string; alt: string }) => {
  const [hasError, setHasError] = useState(false);

  if (hasError) {
    return (
      <Avatar
        sx={{
          width: "100%",
          height: "100%",
          fontSize: "60%",
          backgroundColor: "#f0f0f0",
          color: "#666",
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
      const color = site.iconProps?.color || "inherit";
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
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
          }}
        >
          <SiOpenai size="80%" color={color} />
        </Box>
      );
    } else if (site.iconName === "GiGamepad") {
      const color = site.iconProps?.color || "#10A37F";
      return (
        <Box
          sx={{
            width: "100%",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <GiGamepad size="80%" color={color} />
        </Box>
      );
    }
  }

  // Fallback to MUI Avatar
  return (
    <Avatar
      sx={{
        width: "100%",
        height: "100%",
        fontSize: "60%",
        backgroundColor: "#f0f0f0",
        color: "#666",
      }}
    >
      {site.title.charAt(0).toUpperCase()}
    </Avatar>
  );
};
