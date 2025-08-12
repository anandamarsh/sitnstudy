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
            // Inject interceptor.js script into the webview
            try {
              // First inject the interceptor.js script
              (el as any).executeJavaScript(`
              if (!window.interceptorScriptLoaded) {
                // Load interceptor.js script
                const script = document.createElement('script');
                script.src = '/app_injections/interceptor.js';
                script.onload = function() {
                  console.log('🔗 Interceptor.js script loaded successfully');
                  window.interceptorScriptLoaded = true;
                };
                script.onerror = function() {
                  console.error('🔗 Failed to load interceptor.js script');
                };
                document.head.appendChild(script);
              } else {
                console.log('🔗 Interceptor.js script already loaded');
              }
            `);
            } catch (error) {
              console.error("Error injecting interceptor.js script:", error);
            }
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
        webpreferences="allowRunningInsecureContent,contextIsolation,nodeIntegration,webSecurity"
        allowpopups={true}
        partition="persist:sitnstudy-shared"
      />
    </Box>
  );
}
