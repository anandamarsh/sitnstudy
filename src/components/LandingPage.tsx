import React, { useState } from "react";
import { Box, Card, CardActionArea, Typography, Avatar } from "@mui/material";
import { SiOpenai } from "react-icons/si";
import { SiteConfig } from "./AppDetailsSlider/types";
import { useSites } from "../hooks/useSites";
import AppDetailsSlider from "./AppDetailsSlider";

interface LandingPageProps {
  onAppSelect: (app: SiteConfig) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAppSelect }) => {
  const [selectedApp, setSelectedApp] = useState<SiteConfig | null>(null);
  const [sliderOpen, setSliderOpen] = useState(false);
  const { sites } = useSites();
  const availableApps = sites.filter((site) => site.key !== "landing");

  const IconImg = ({ src, alt }: { src: string; alt: string }) => {
    const [hasError, setHasError] = useState(false);

    // Kid-friendly color palette
    const KID_COLORS = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
      "#F8C471",
      "#82E0AA",
    ];

    // Generate a consistent color based on the alt text
    const colorIndex = alt.charCodeAt(0) % KID_COLORS.length;
    const backgroundColor = KID_COLORS[colorIndex];

    if (hasError) {
      return (
        <Avatar
          sx={{
            width: 80,
            height: 80,
            fontSize: "2.5rem",
            backgroundColor: backgroundColor,
            color: "white",
            fontWeight: "bold",
            fontFamily:
              "'Comic Sans MS', 'Chalkboard SE', 'Arial Rounded MT Bold', sans-serif",
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
          width: 80,
          height: 80,
          objectFit: "contain",
          borderRadius: "12px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.1)",
        }}
      />
    );
  };

  const getIconComponent = (site: SiteConfig) => {
    if (site.key === "landing") return null; // Skip the landing page itself

    if (site.iconType === "svg" && site.iconPath) {
      return <IconImg src={site.iconPath} alt={site.title} />;
    } else if (site.iconType === "react-icon" && site.iconName === "SiOpenai") {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 80,
            height: 80,
            backgroundColor: "#E5F7F0",
            borderRadius: "16px",
            border: "3px solid #10A37F",
          }}
        >
          <SiOpenai size={80} color="#10A37F" />
        </Box>
      );
    }

    // Fallback to MUI Avatar with kid-friendly styling
    const KID_COLORS = [
      "#FF6B6B",
      "#4ECDC4",
      "#45B7D1",
      "#96CEB4",
      "#FFEAA7",
      "#DDA0DD",
      "#98D8C8",
      "#F7DC6F",
      "#BB8FCE",
      "#85C1E9",
      "#F8C471",
      "#82E0AA",
    ];
    const colorIndex = site.title.charCodeAt(0) % KID_COLORS.length;
    const backgroundColor = KID_COLORS[colorIndex];

    return (
      <Avatar
        sx={{
          width: 80,
          height: 80,
          fontSize: "2.5rem",
          backgroundColor: backgroundColor,
          color: "white",
          fontWeight: "bold",
          fontFamily:
            "'Comic Sans MS', 'Chalkboard SE', 'Arial Rounded MT Bold', sans-serif",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          border: "3px solid white",
        }}
      >
        {site.title.charAt(0).toUpperCase()}
      </Avatar>
    );
  };

  const handleAppClick = (app: SiteConfig) => {
    setSelectedApp(app);
    setSliderOpen(true);
  };

  const handleOpenApp = (app: SiteConfig) => {
    onAppSelect(app);
    setSliderOpen(false);
  };

  const handleCloseSlider = async () => {
    setSliderOpen(false);
    setSelectedApp(null);
    // Also refresh the left navigation menu
    if ((window as any).refreshLeftMenu) {
      (window as any).refreshLeftMenu();
    }
  };

  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto", p: 1 }}>
      <Box sx={{ mt: 1, mb: 2, width: "100%" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, 200px)",
            gap: 2,
            justifyContent: "center",
            p: 2,
          }}
        >
          {availableApps.map((app) => (
            <Card
              key={app.key}
              sx={{
                width: 200,
                height: 200,
                display: "flex",
                flexDirection: "column",
                cursor: "pointer",
                transition: "all 0.2s ease",
                "&:hover": {
                  transform: "translateY(-2px)",
                  boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                },
              }}
              onClick={() => handleAppClick(app)}
            >
              <CardActionArea
                sx={{
                  height: "100%",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Box
                  sx={{
                    p: 2,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "1rem",
                    width: "100%",
                    height: "100%",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      alignItems: "center",
                      width: 80,
                      height: 80,
                      flexShrink: 0,
                    }}
                  >
                    {getIconComponent(app)}
                  </Box>
                  <Typography variant="h6" component="h2" align="center">
                    {app.title}
                  </Typography>
                </Box>
              </CardActionArea>
            </Card>
          ))}
        </Box>
      </Box>

      {/* App Details Slider */}
      <AppDetailsSlider
        open={sliderOpen}
        app={selectedApp}
        isAddMode={false}
        onClose={handleCloseSlider}
        onOpenApp={handleOpenApp}
        onRemoveApp={() => {}} // Dummy function since removal is handled in ViewMode
      />
    </Box>
  );
};

export default LandingPage;
