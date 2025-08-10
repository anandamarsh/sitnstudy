import React, { useState, useEffect } from "react";
import {
  Box,
  Container,
  Card,
  CardActionArea,
  Typography,
} from "@mui/material";
import { MoveToInbox as InboxIcon } from "@mui/icons-material";
import { SiOpenai } from "react-icons/si";
import { SiteConfig } from "./AppDetailsSlider/types";
import AppDetailsSlider from "./AppDetailsSlider";
import { getAvailableSites } from "../utils/siteManager";

interface LandingPageProps {
  onAppSelect: (app: SiteConfig) => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onAppSelect }) => {
  const [selectedApp, setSelectedApp] = useState<SiteConfig | null>(null);
  const [sliderOpen, setSliderOpen] = useState(false);
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

  const IconImg = ({ src, alt }: { src: string; alt: string }) => (
    <Box
      component="img"
      src={src}
      alt={alt}
      sx={{
        width: 64,
        height: 64,
        objectFit: "contain",
      }}
    />
  );

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
          }}
        >
          <SiOpenai size={64} color="#10A37F" />
        </Box>
      );
    }
    return <InboxIcon />;
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
    // Refresh available apps when slider closes in case an app was removed
    await loadAvailableApps();
    // Also refresh the left navigation menu
    if ((window as any).refreshLeftMenu) {
      (window as any).refreshLeftMenu();
    }
  };

  return (
    <Box sx={{ flexGrow: 1, height: "100vh", overflow: "auto", p: 3 }}>
      <Container maxWidth="lg" sx={{ mt: 2, mb: 4 }}>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
            gap: 3,
            p: 2,
          }}
        >
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
      </Container>

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
