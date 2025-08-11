import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardActionArea,
  Typography,
  Avatar,
} from "@mui/material";
import { Add } from "@mui/icons-material";
import { SiOpenai } from "react-icons/si";
import { SiteConfig } from "./AppDetailsSlider/types";
import { getAvailableSites } from "../utils/siteManager";
import AppDetailsSlider from "./AppDetailsSlider";

interface AppStoreProps {
  onAppSelect: (app: SiteConfig) => void;
}

const AppStore: React.FC<AppStoreProps> = ({ onAppSelect }) => {
  const [selectedApp, setSelectedApp] = useState<SiteConfig | null>(null);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [isAddMode, setIsAddMode] = useState(false);
  const [availableApps, setAvailableApps] = useState<SiteConfig[]>([]);

  // Load available apps on component mount and after changes
  useEffect(() => {
    loadAvailableApps();
  }, []);

  const loadAvailableApps = async () => {
    try {
      const sites = await getAvailableSites();
      const filteredSites = sites.filter((site) => site.key !== "landing");
      setAvailableApps(filteredSites);
    } catch (error) {
      console.error("Error loading available sites:", error);
    }
  };

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
            width: 64,
            height: 64,
            fontSize: "2rem",
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
          width: 64,
          height: 64,
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
            width: 64,
            height: 64,
            backgroundColor: "#E5F7F0",
            borderRadius: "16px",
            border: "3px solid #10A37F",
          }}
        >
          <SiOpenai size={64} color="#10A37F" />
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
          width: 64,
          height: 64,
          fontSize: "2rem",
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
    setIsAddMode(false);
    setSliderOpen(true);
  };

  const handleAddAppClick = () => {
    setSelectedApp(null);
    setIsAddMode(true);
    setSliderOpen(true);
  };

  const handleOpenApp = (app: SiteConfig) => {
    onAppSelect(app);
    setSliderOpen(false);
  };

  const handleCloseSlider = async () => {
    setSliderOpen(false);
    setSelectedApp(null);
    setIsAddMode(false);
    // Refresh available apps when slider closes in case an app was removed
    await loadAvailableApps();
    // Also refresh the left navigation menu
    if ((window as any).refreshLeftMenu) {
      (window as any).refreshLeftMenu();
    }
  };

  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto", p: 3 }}>
      <Box sx={{ mt: 2, mb: 4, width: "100%" }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 3,
            p: 2,
          }}
        >
          {/* Add App Card */}
          <Card
            sx={{
              height: "100%",
              display: "flex",
              flexDirection: "column",
              cursor: "pointer",
              transition: "all 0.2s ease",
              border: "2px dashed",
              borderColor: "primary.main",
              backgroundColor: "transparent",
              "&:hover": {
                transform: "translateY(-2px)",
                boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
                backgroundColor: "primary.50",
                borderColor: "primary.dark",
              },
            }}
            onClick={handleAddAppClick}
          >
            <CardActionArea
              sx={{
                height: "100%",
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
              }}
            >
              <Box
                sx={{
                  p: 3,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: "1rem",
                  minHeight: 120,
                }}
              >
                <Box
                  sx={{
                    width: 64,
                    height: 64,
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    borderRadius: "50%",
                    backgroundColor: "primary.main",
                    color: "white",
                  }}
                >
                  <Add sx={{ fontSize: 40 }} />
                </Box>
                <Typography
                  variant="h6"
                  component="h2"
                  align="center"
                  color="primary"
                >
                  Add New App
                </Typography>
              </Box>
            </CardActionArea>
          </Card>

          {/* Existing App Cards */}
          {availableApps.map((app) => (
            <Card
              key={app.key}
              sx={{
                height: "100%",
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
                  alignItems: "stretch",
                }}
              >
                <Box
                  sx={{
                    p: 3,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "1rem",
                    minHeight: 120,
                  }}
                >
                  {getIconComponent(app)}
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
        isAddMode={isAddMode}
        onClose={handleCloseSlider}
        onOpenApp={handleOpenApp}
        onRemoveApp={() => {}} // Dummy function since removal is handled in ViewMode
      />
    </Box>
  );
};

export default AppStore;
