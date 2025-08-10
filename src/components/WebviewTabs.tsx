import React from "react";
import { Box, Fab } from "@mui/material";
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
          </Box>
        ))}
      </Box>
    </Box>
  );
}
