import * as React from "react";
import { styled, useTheme, Theme, CSSObject } from "@mui/material/styles";
import Box from "@mui/material/Box";
import MuiDrawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import CssBaseline from "@mui/material/CssBaseline";
import Divider from "@mui/material/Divider";
import IconButton from "@mui/material/IconButton";
import MenuIcon from "@mui/icons-material/Menu";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import InboxIcon from "@mui/icons-material/MoveToInbox";
import WebviewTabs, { SiteTab } from "./WebviewTabs";
import { SiOpenai } from "react-icons/si";

const drawerWidth = 240;

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

export default function MiniVariantDrawer(): JSX.Element {
  const theme = useTheme();
  const [open, setOpen] = React.useState(false);

  const IconImg = ({ src, alt }: { src: string; alt: string }) => (
    <img
      src={src}
      alt={alt}
      width={20}
      height={20}
      style={{ display: "block" }}
    />
  );

  const availableSites: SiteTab[] = [
    {
      key: "ixl",
      title: "IXL",
      url: "https://ixl.com/",
      icon: <IconImg src="/icons/ixl.svg" alt="IXL" />,
    },
    {
      key: "youtube",
      title: "YouTube",
      url: "https://www.youtube.com/",
      icon: <IconImg src="/icons/youtube.svg" alt="YouTube" />,
    },
    {
      key: "netflix",
      title: "Netflix",
      url: "https://www.netflix.com/",
      icon: <IconImg src="/icons/netflix.svg" alt="Netflix" />,
    },
    {
      key: "chatgpt",
      title: "ChatGPT",
      url: "https://chatgpt.com/",
      icon: <SiOpenai size={20} color="#10A37F" />,
    },
  ];

  const [tabs, setTabs] = React.useState<SiteTab[]>([]);
  const [activeIndex, setActiveIndex] = React.useState(0);

  const openSite = (site: SiteTab): void => {
    const existingIndex = tabs.findIndex((t) => t.key === site.key);
    if (existingIndex >= 0) {
      setActiveIndex(existingIndex);
    } else {
      setTabs((prev) => {
        const next = [...prev, site];
        setActiveIndex(next.length - 1);
        return next;
      });
    }
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
      }}
    >
      <CssBaseline />
      <Drawer variant="permanent" open={open}>
        <DrawerHeader>
          <IconButton onClick={() => setOpen((o) => !o)}>
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
            <ListItem key={site.key} disablePadding sx={{ display: "block" }}>
              <ListItemButton
                onClick={() => openSite(site)}
                sx={{
                  minHeight: 48,
                  justifyContent: open ? "initial" : "center",
                  px: 2.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 0,
                    mr: open ? 3 : "auto",
                    justifyContent: "center",
                  }}
                >
                  {site.icon ?? <InboxIcon />}
                </ListItemIcon>
                <ListItemText
                  primary={site.title}
                  sx={{ opacity: open ? 1 : 0 }}
                />
              </ListItemButton>
            </ListItem>
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
          minWidth: 0,
          overflow: "hidden",
          width: "100%",
        }}
      >
        <WebviewTabs tabs={tabs} activeIndex={activeIndex} />
      </Box>
    </Box>
  );
}
