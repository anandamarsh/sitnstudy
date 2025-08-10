import { Box } from "@mui/material";
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
