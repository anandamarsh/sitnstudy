import React, { useState, useEffect } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  IconButton,
  Typography,
  Avatar,
} from "@mui/material";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import { SiOpenai } from "react-icons/si";
import { SiteConfig } from "./AppDetailsSlider/types";
import { getAvailableSites } from "../utils/siteManager";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import MuiDrawer from "@mui/material/Drawer";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import MenuIcon from "@mui/icons-material/Menu";
import { Apps } from "@mui/icons-material";
import { Close as CloseIcon } from "@mui/icons-material";
import WebviewTabs, { SiteTab } from "./WebviewTabs";
import AppStore from "./AppStore";

const drawerWidth = 320;

const openedMixin = (theme: Theme): CSSObject => ({
  width: drawerWidth,
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.enteringScreen,
  }),
  overflowX: "hidden",
});

const closedMixin = (theme: Theme): CSSObject => ({
  transition: theme.transitions.create("width", {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  overflowX: "hidden",
  width: `calc(${theme.spacing(7)} + 1px)`,
  [theme.breakpoints.up("sm")]: {
    width: `calc(${theme.spacing(8)} + 1px)`,
  },
});

const DrawerHeader = styled("div")(({ theme }) => ({
  display: "flex",
  alignItems: "center",
  justifyContent: "flex-end",
  padding: theme.spacing(0, 1),
  height: theme.spacing(7),
}));

// Removed AppBar to make content area full-height and controlled only by drawer

const Drawer = styled(MuiDrawer, {
  shouldForwardProp: (prop) => prop !== "open",
})(({ theme, open }) => ({
  width: drawerWidth,
  flexShrink: 0,
  whiteSpace: "nowrap",
  boxSizing: "border-box",
  ...(open && {
    ...openedMixin(theme),
    "& .MuiDrawer-paper": openedMixin(theme),
  }),
  ...(!open && {
    ...closedMixin(theme),
    "& .MuiDrawer-paper": closedMixin(theme),
  }),
}));

export default function LeftNavMenu(): JSX.Element {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);
  const [availableSites, setAvailableSites] = React.useState<SiteTab[]>([]);
  const [tabs, setTabs] = React.useState<SiteTab[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [showLandingPage, setShowLandingPage] = React.useState(true); // Changed to true to show landing page by default
  const [selectedSiteKey, setSelectedSiteKey] = React.useState("landing"); // Track selected site

  // Load available sites on component mount
  React.useEffect(() => {
    const loadSites = async () => {
      try {
        const sites = await getAvailableSites();
        const siteTabs: SiteTab[] = sites.map((site: SiteConfig) => ({
          key: site.key,
          title: site.title,
          url: site.url,
          icon: getIconComponent(site),
        }));
        setAvailableSites(siteTabs);
      } catch (error) {
        console.error("Error loading available sites:", error);
      }
    };

    loadSites();
  }, []);

  // Function to refresh available sites (can be called from other components)
  const refreshSites = async () => {
    try {
      const sites = await getAvailableSites();
      const siteTabs: SiteTab[] = sites.map((site: SiteConfig) => ({
        key: site.key,
        title: site.title,
        url: site.url,
        icon: getIconComponent(site),
      }));
      setAvailableSites(siteTabs);
    } catch (error) {
      console.error("Error refreshing available sites:", error);
    }
  };

  // Expose refreshSites globally so other components can call it
  React.useEffect(() => {
    (window as any).refreshLeftMenu = refreshSites;
    return () => {
      delete (window as any).refreshLeftMenu;
    };
  }, []);

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
            width: 20,
            height: 20,
            fontSize: "0.8rem",
            backgroundColor: backgroundColor,
            color: "white",
            fontWeight: "bold",
            fontFamily:
              "'Comic Sans MS', 'Chalkboard SE', 'Arial Rounded MT Bold', sans-serif",
            boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
            border: "2px solid white",
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
          width: 20,
          height: 20,
          objectFit: "contain",
          borderRadius: "6px",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      />
    );
  };

  const getIconComponent = (site: SiteConfig) => {
    if (site.key === "landing") {
      return (
        <Apps
          sx={{
            fontSize: site.iconProps?.size || 20,
            color: site.iconProps?.color || "#FF6B6B",
          }}
        />
      );
    } else if (site.iconType === "svg" && site.iconPath) {
      return <IconImg src={site.iconPath} alt={site.title} />;
    } else if (site.iconType === "react-icon" && site.iconName === "SiOpenai") {
      return (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: 20,
            height: 20,
            backgroundColor: "#E5F7F0",
            borderRadius: "8px",
            border: "2px solid #10A37F",
          }}
        >
          <SiOpenai size={20} color="#10A37F" />
        </Box>
      );
    } else if (site.iconType === "react-icon" && site.iconName === "Apps") {
      return (
        <Apps
          sx={{
            fontSize: site.iconProps?.size || 20,
            color: site.iconProps?.color || "#FF6B6B",
          }}
        />
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
          width: 20,
          height: 20,
          fontSize: "0.8rem",
          backgroundColor: backgroundColor,
          color: "white",
          fontWeight: "bold",
          fontFamily:
            "'Comic Sans MS', 'Chalkboard SE', 'Arial Rounded MT Bold', sans-serif",
          boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
          border: "2px solid white",
        }}
      >
        {site.title.charAt(0).toUpperCase()}
      </Avatar>
    );
  };

  const openSite = (site: SiteTab): void => {
    setSelectedSiteKey(site.key);

    if (site.key === "landing") {
      // Pause all webviews when switching to landing page to stop audio/games
      if ((window as any).pauseAllWebviews) {
        (window as any).pauseAllWebviews();
      }
      setShowLandingPage(true);
      return;
    }

    const existingIndex = tabs.findIndex((t) => t.key === site.key);
    if (existingIndex >= 0) {
      setActiveIndex(existingIndex);
      setShowLandingPage(false);
    } else {
      setTabs((prev) => {
        const next = [...prev, site];
        setActiveIndex(next.length - 1);
        setShowLandingPage(false);
        return next;
      });
    }
  };

  const closeTab = (tabKey: string): void => {
    const tabIndex = tabs.findIndex((t) => t.key === tabKey);
    if (tabIndex === -1) return;

    // Remove the tab
    const newTabs = tabs.filter((t) => t.key !== tabKey);
    setTabs(newTabs);

    // If we're closing the currently active tab, switch to another tab or landing page
    if (tabIndex === activeIndex) {
      if (newTabs.length === 0) {
        // No more tabs, show landing page
        setShowLandingPage(true);
        setSelectedSiteKey("landing");
        setActiveIndex(0);
      } else {
        // Switch to the next available tab, or the previous one if we're at the end
        const newActiveIndex =
          tabIndex >= newTabs.length ? tabIndex - 1 : tabIndex;
        setActiveIndex(newActiveIndex);
        setSelectedSiteKey(newTabs[newActiveIndex].key);
      }
    } else if (tabIndex < activeIndex) {
      // If we closed a tab before the active one, adjust the active index
      setActiveIndex(activeIndex - 1);
    }
  };

  const handleAppSelect = (site: SiteConfig): void => {
    const siteTab: SiteTab = {
      key: site.key,
      title: site.title,
      url: site.url,
      icon: getIconComponent(site),
    };
    openSite(siteTab);
  };

  // Drawer toggling is handled inline on the header button

  return (
    <Box
      sx={{
        display: "flex",
        height: "100%",
        width: "100%",
        overflow: "hidden",
        minWidth: 0,
        position: "relative",
      }}
    >
      <Drawer
        variant="permanent"
        open={open}
        sx={{
          // When open, make it overlay the content
          "& .MuiDrawer-paper": {
            position: open ? "fixed" : "relative",
            zIndex: open ? 1200 : "auto",
            // Remove shadow
            boxShadow: "none",
            // Ensure drawer doesn't affect layout when open
            left: open ? 0 : "auto",
            top: open ? 0 : "auto",
            height: "100vh",
          },
        }}
      >
        <DrawerHeader>
          <IconButton
            onClick={() => setOpen((o) => !o)}
            sx={{
              "&:focus": {
                outline: "none",
              },
              "&:focus-visible": {
                outline: "none",
              },
            }}
          >
            {open ? (
              theme.direction === "rtl" ? (
                <ChevronRightIcon />
              ) : (
                <ChevronLeftIcon />
              )
            ) : (
              <MenuIcon />
            )}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {availableSites.map((site) => (
            <React.Fragment key={site.key}>
              <ListItem disablePadding sx={{ display: "block" }}>
                <ListItemButton
                  onClick={() => openSite(site)}
                  selected={selectedSiteKey === site.key}
                  sx={{
                    minHeight: 48,
                    justifyContent: open ? "initial" : "center",
                    px: 2.5,
                    position: "relative",
                    "&:focus": {
                      outline: "none",
                    },
                    "&:focus-visible": {
                      outline: "none",
                    },
                  }}
                >
                  <ListItemIcon
                    sx={{
                      minWidth: 0,
                      mr: open ? 3 : "auto",
                      justifyContent: "center",
                    }}
                  >
                    {site.icon}
                  </ListItemIcon>
                  <ListItemText
                    primary={site.title}
                    sx={{ opacity: open ? 1 : 0 }}
                  />
                  {/* Close button for open webviews */}
                  {open && tabs.some((tab) => tab.key === site.key) && (
                    <IconButton
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        closeTab(site.key);
                        setOpen(false); // Close the drawer after closing the webview
                      }}
                      sx={{
                        position: "absolute",
                        right: 8,
                        color: "error.main",
                        opacity: 0.7,
                        transition: "opacity 0.2s ease",
                        "&:hover": {
                          opacity: 1,
                        },
                        "&:focus": {
                          outline: "none",
                        },
                        "&:focus-visible": {
                          outline: "none",
                        },
                      }}
                    >
                      <CloseIcon sx={{ fontSize: 16 }} />
                    </IconButton>
                  )}
                </ListItemButton>
              </ListItem>
              {/* Add divider after the App Store (landing) item */}
              {site.key === "landing" && <Divider sx={{ my: 1 }} />}
            </React.Fragment>
          ))}
        </List>
        <Divider />
        <List />
      </Drawer>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 0,
          minHeight: 0,
          overflow: "hidden",
          width: "100%", // Full container width
          position: "relative",
          // When drawer is closed, account for its width
          // When drawer is open, it overlays so content takes full width
          marginLeft: open ? 0 : `calc(${theme.spacing(8)} + 1px)`,
          // Force full width regardless of drawer state
          minWidth: "100%",
        }}
      >
        {showLandingPage ? (
          <AppStore onAppSelect={handleAppSelect} />
        ) : (
          <WebviewTabs
            tabs={tabs}
            activeIndex={activeIndex}
            onCloseTab={closeTab}
          />
        )}
      </Box>
    </Box>
  );
}
