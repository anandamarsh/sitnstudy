import React from "react";
import { Box, Fab, LinearProgress, Typography } from "@mui/material";
import { Close as CloseIcon } from "@mui/icons-material";

export interface SiteTab {
  key: string;
  title: string;
  url: string;
  icon?: React.ReactElement;
}

interface WebviewTabsProps {
  tabs: SiteTab[];
  activeIndex: number;
  onCloseTab?: (tabKey: string) => void;
}

export default function WebviewTabs(props: WebviewTabsProps): JSX.Element {
  const { tabs, activeIndex, onCloseTab } = props;
  const webviewRefs = React.useRef<any[]>([]);
  const [loadingStates, setLoadingStates] = React.useState<{
    [key: string]: boolean;
  }>({});
  const [loadingProgress, setLoadingProgress] = React.useState<{
    [key: string]: number;
  }>({});

  // Function to pause all webviews (can be called from parent)
  const pauseAllWebviews = () => {
    webviewRefs.current.forEach((wv) => {
      if (!wv) return;
      try {
        if (typeof wv.executeJavaScript === "function") {
          wv.executeJavaScript(`
            // Pause all audio and video
            Array.from(document.querySelectorAll('video,audio')).forEach(m => {
              try { m.pause(); m.muted = true; } catch {}
            });
            
            // Stop any running game loops or animations
            if (window.requestAnimationFrame) {
              // Cancel any pending animation frames
              for (let i = 1; i <= 1000; i++) {
                window.cancelAnimationFrame(i);
              }
            }
            
            // Pause any running intervals or timeouts that might be game loops
            const highestId = setTimeout(() => {}, 0);
            for (let i = 1; i <= highestId; i++) {
              clearTimeout(i);
              clearInterval(i);
            }
          `);
        }
      } catch {
        // no-op
      }
    });
  };

  // Expose the function globally so it can be called from anywhere
  React.useEffect(() => {
    (window as any).pauseAllWebviews = pauseAllWebviews;
    return () => {
      delete (window as any).pauseAllWebviews;
    };
  }, []);

  // Simulate loading progress for better UX
  React.useEffect(() => {
    const currentTab = tabs[activeIndex];
    if (!currentTab) return;

    // Start loading when tab changes
    setLoadingStates((prev) => ({ ...prev, [currentTab.key]: true }));
    setLoadingProgress((prev) => ({ ...prev, [currentTab.key]: 0 }));

    // Simulate progress
    const progressInterval = setInterval(() => {
      setLoadingProgress((prev) => {
        const current = prev[currentTab.key] || 0;
        if (current < 90) {
          return { ...prev, [currentTab.key]: current + Math.random() * 20 };
        }
        return prev;
      });
    }, 200);

    // Complete loading after a delay
    const completeTimeout = setTimeout(() => {
      setLoadingStates((prev) => ({ ...prev, [currentTab.key]: false }));
      setLoadingProgress((prev) => ({ ...prev, [currentTab.key]: 100 }));
    }, 1500);

    return () => {
      clearInterval(progressInterval);
      clearTimeout(completeTimeout);
    };
  }, [activeIndex, tabs]);

  // Pause media in any background (inactive) webviews when switching tabs
  React.useEffect(() => {
    webviewRefs.current.forEach((wv, idx) => {
      if (!wv || idx === activeIndex) return;
      try {
        if (typeof wv.executeJavaScript === "function") {
          wv.executeJavaScript(
            "Array.from(document.querySelectorAll('video,audio')).forEach(m=>{try{m.pause();m.muted=true;}catch{}})"
          );
        }
      } catch {
        // no-op
      }
    });
  }, [activeIndex, tabs.length]);

  // Resume media on the newly active webview (best-effort; may be blocked by site policy)
  React.useEffect(() => {
    const activeWv = webviewRefs.current[activeIndex];
    if (!activeWv) return;
    try {
      if (typeof activeWv.executeJavaScript === "function") {
        activeWv.executeJavaScript(
          "Array.from(document.querySelectorAll('video,audio')).forEach(m=>{try{m.muted=false;if(m.paused){m.play().catch(()=>{})}}catch{}})"
        );
      }
    } catch {
      // no-op
    }
  }, [activeIndex]);

  const handleCloseTab = () => {
    if (onCloseTab && tabs[activeIndex]) {
      onCloseTab(tabs[activeIndex].key);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        minWidth: 0,
        position: "relative",
      }}
    >
      {/* Close FAB - positioned absolutely on top right */}
      {onCloseTab && (
        <Fab
          size="small"
          color="error"
          aria-label="close webview"
          onClick={handleCloseTab}
          sx={{
            position: "absolute",
            top: 8,
            right: 8,
            zIndex: 1000,
            boxShadow: 2,
            opacity: 0.7,
            transition: "opacity 0.2s ease",
            width: 28,
            height: 28,
            minHeight: 28,
            "&:hover": {
              opacity: 1,
            },
          }}
        >
          <CloseIcon sx={{ fontSize: 14 }} />
        </Fab>
      )}

      <Box
        sx={{
          position: "relative",
          flex: 1,
          minHeight: 0,
          overflow: "hidden",
          width: "100%",
          minWidth: 0,
        }}
      >
        {tabs.map((t, idx) => (
          <Box
            key={`panel-${t.key}-${idx}`}
            sx={{
              display: idx === activeIndex ? "block" : "none",
              width: "100%",
              height: "100%",
              minWidth: 0,
            }}
          >
            {/* eslint-disable-next-line react/no-unknown-property */}
            <webview
              src={t.url}
              allowpopups
              webpreferences="allowRunningInsecureContent,contextIsolation,nodeIntegration,webSecurity"
              partition={`persist:sitnstudy-${t.key}`}
              style={{
                width: "100%",
                height: "100%",
                border: "none",
              }}
              ref={(el) => {
                webviewRefs.current[idx] = el;
              }}
            />
            {idx === activeIndex && loadingStates[t.key] && (
              <Box
                sx={{
                  position: "absolute",
                  top: "50%",
                  left: "50%",
                  transform: "translate(-50%, -50%)",
                  width: "25%",
                  zIndex: 1000,
                }}
              >
                <LinearProgress
                  variant="determinate"
                  value={loadingProgress[t.key] || 0}
                  sx={{
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: "rgba(255, 255, 255, 0.3)",
                    "& .MuiLinearProgress-bar": {
                      borderRadius: 4,
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        ))}
      </Box>
    </Box>
  );
}
