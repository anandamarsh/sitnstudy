import React from "react";
import { Box } from "@mui/material";
import { SiteTab } from "./types";

interface WebviewElementProps {
  tab: SiteTab;
  webviewRef: (el: HTMLWebViewElement | null) => void;
  onUrlChange: (tabKey: string, url: string) => void;
}

export default function WebviewElement(
  props: WebviewElementProps
): JSX.Element {
  const { tab, webviewRef, onUrlChange } = props;

  const handleWebviewRef = React.useCallback(
    (el: HTMLWebViewElement | null) => {
      webviewRef(el);

      if (el) {
        // Remove existing listeners to prevent duplicates
        if (el._listeners) {
          el.removeEventListener("did-navigate", el._listeners.didNavigate);
          el.removeEventListener(
            "did-navigate-in-page",
            el._listeners.didNavigateInPage
          );
          el.removeEventListener("dom-ready", el._listeners.domReady);
        }

        // Create new listener functions
        const didNavigateListener = (e: any) => {
          onUrlChange(tab.key, e.url);
        };
        const didNavigateInPageListener = (e: any) => {
          onUrlChange(tab.key, e.url);
        };
        const domReadyListener = () => {
          if (el && typeof (el as any).executeJavaScript === "function") {
            // Note: Script injection is handled by the main process in window-management.ts
            // This ensures the script is properly loaded with the correct domain context
          }
        };

        // Add new listeners
        el.addEventListener("did-navigate", didNavigateListener);
        el.addEventListener("did-navigate-in-page", didNavigateInPageListener);
        el.addEventListener("dom-ready", domReadyListener);

        // Store references for cleanup
        el._listeners = {
          didNavigate: didNavigateListener,
          didNavigateInPage: didNavigateInPageListener,
          domReady: domReadyListener,
        };
      }
    },
    [webviewRef, tab.key, onUrlChange]
  );

  return (
    <Box
      sx={{
        width: "100%",
        marginTop: tab.showAddressBar ? "40px" : 0,
        height: tab.showAddressBar ? "calc(100% - 40px)" : "100%",
        position: "relative",
        display: "flex",
        flexDirection: "column",
      }}
      onContextMenu={(e) => {
        console.log("🔍 RIGHT-CLICK ON CONTAINER!", e);
        e.preventDefault();
        e.stopPropagation();

        // Find the webview and try to open DevTools
        const webview = e.currentTarget.querySelector("webview");
        if (webview && (webview as any).openDevTools) {
          try {
            console.log("🔍 Opening DevTools from container...");
            (webview as any).openDevTools({ mode: "detach" });
          } catch (error) {
            console.error("🔍 Error opening DevTools from container:", error);
          }
        }
      }}
      onKeyDown={(e) => {
        // Cmd+Shift+I (macOS) or Ctrl+Shift+I (Windows/Linux) to open DevTools
        if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key === 'i') {
          e.preventDefault();
          const webview = e.currentTarget.querySelector("webview");
          if (webview && (webview as any).openDevTools) {
            try {
              console.log("🔍 Opening DevTools via keyboard shortcut...");
              (webview as any).openDevTools({ mode: "detach" });
            } catch (error) {
              console.error("🔍 Error opening DevTools via keyboard:", error);
            }
          }
        }
      }}
    >
      {/* eslint-disable-next-line react/no-unknown-property */}
      <webview
        key={`webview-${tab.key}`}
        ref={handleWebviewRef}
        src={tab.url}
        style={{
          width: "100%",
          height: "100%",
          flex: 1,
        }}
        webpreferences="allowRunningInsecureContent,contextIsolation=false,nodeIntegration=false,webSecurity=true"
        allowpopups={true}
        partition="persist:sitnstudy-shared"
        preload="/webview-preload.js"
        onContextMenu={(e) => {
          console.log("🔍 DIRECT RIGHT-CLICK ON WEBVIEW!", e);
          e.preventDefault();
          e.stopPropagation();

          // Try to open DevTools directly
          try {
            if (e.currentTarget && (e.currentTarget as any).openDevTools) {
              console.log("🔍 Opening DevTools directly...");
              (e.currentTarget as any).openDevTools({ mode: "detach" });
            }
          } catch (error) {
            console.error("🔍 Error opening DevTools:", error);
          }
        }}
      />
    </Box>
  );
}
