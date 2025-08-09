import React from "react";
import { Box } from "@mui/material";

export interface SiteTab {
  key: string;
  title: string;
  url: string;
  icon?: React.ReactElement;
}

interface WebviewTabsProps {
  tabs: SiteTab[];
  activeIndex: number;
}

export default function WebviewTabs(props: WebviewTabsProps): JSX.Element {
  const { tabs, activeIndex } = props;
  const webviewRefs = React.useRef<any[]>([]);

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

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
        minWidth: 0,
      }}
    >
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
