import { Box } from "@mui/material";
import { Apps } from "@mui/icons-material";
import { SiOpenai } from "react-icons/si";
import { GiGamepad } from "react-icons/gi";
import { SiteConfig } from "./types";

export const IconImg = ({ src, alt }: { src: string; alt: string }) => (
  <Box
    component="img"
    src={src}
    alt={alt}
    sx={{
      width: "100%",
      height: "100%",
      objectFit: "contain",
    }}
  />
);

export const getIconComponent = (site: SiteConfig) => {
  if (site.iconPath) {
    if (site.iconType === "svg") {
      return (
        <Box
          component="img"
          src={site.iconPath}
          alt={site.title}
          sx={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
          }}
        />
      );
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

  // Fallback to a default icon
  return (
    <Box
      sx={{
        width: "100%",
        height: "100%",
        backgroundColor: "#f0f0f0",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: 1,
      }}
    >
      {site.title.charAt(0).toUpperCase()}
    </Box>
  );
};
