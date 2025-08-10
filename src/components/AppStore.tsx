import React, { useState } from "react";
import {
  Box,
  Card,
  CardActionArea,
  Typography,
  Container,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from "@mui/material";
import { MoveToInbox as InboxIcon, Add } from "@mui/icons-material";
import { SiOpenai } from "react-icons/si";
import availableSitesConfig from "../config/availableSites.json";
import AppDetailsSlider from "./AppDetailsSlider";

interface SiteConfig {
  key: string;
  title: string;
  url: string;
  iconPath?: string;
  iconType: "svg" | "react-icon";
  iconName?: string;
  iconProps?: Record<string, any>;
  description?: string;
}

interface AppStoreProps {
  onAppSelect: (site: SiteConfig) => void;
}

const AppStore: React.FC<AppStoreProps> = ({ onAppSelect }) => {
  const [selectedApp, setSelectedApp] = useState<SiteConfig | null>(null);
  const [sliderOpen, setSliderOpen] = useState(false);
  const [removeDialogOpen, setRemoveDialogOpen] = useState(false);
  const [appToRemove, setAppToRemove] = useState<SiteConfig | null>(null);
  const [isAddMode, setIsAddMode] = useState(false);

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

  const availableApps = (availableSitesConfig as SiteConfig[]).filter(
    (site) => site.key !== "landing"
  );

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

  const handleRemoveClick = (app: SiteConfig) => {
    setAppToRemove(app);
    setRemoveDialogOpen(true);
  };

  const handleRemoveConfirm = () => {
    // TODO: Implement actual removal logic
    console.log("Removing app:", appToRemove);
    setRemoveDialogOpen(false);
    setAppToRemove(null);
    setSliderOpen(false);
    setSelectedApp(null);
  };

  const handleRemoveCancel = () => {
    setRemoveDialogOpen(false);
    setAppToRemove(null);
  };

  const handleCloseSlider = () => {
    setSliderOpen(false);
    setSelectedApp(null);
    setIsAddMode(false);
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
      </Container>

      {/* App Details Slider */}
      <AppDetailsSlider
        open={sliderOpen}
        app={selectedApp}
        isAddMode={isAddMode}
        onClose={handleCloseSlider}
        onOpenApp={handleOpenApp}
        onRemoveApp={handleRemoveClick}
      />

      {/* Remove confirmation dialog */}
      <Dialog open={removeDialogOpen} onClose={handleRemoveCancel}>
        <DialogTitle>Remove Application</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to remove "{appToRemove?.title}"? This action
            cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleRemoveCancel}>Cancel</Button>
          <Button
            onClick={handleRemoveConfirm}
            color="error"
            variant="contained"
          >
            Remove
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AppStore;
