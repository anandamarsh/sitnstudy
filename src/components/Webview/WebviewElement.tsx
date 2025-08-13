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
        console.log('🔍 Right-click detected on container!', e);
        e.preventDefault();
        e.stopPropagation();
        
        // Create context menu
        const contextMenu = document.createElement('div');
        contextMenu.style.cssText = `
          position: fixed;
          top: ${e.clientY}px;
          left: ${e.clientX}px;
          background: white;
          border: 1px solid #ccc;
          border-radius: 4px;
          box-shadow: 0 2px 10px rgba(0,0,0,0.1);
          z-index: 10000;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px;
          min-width: 150px;
        `;
        
        const menuItems = [
          { label: 'Inspect Element', action: () => {
            console.log('🔍 Inspect Element clicked');
            // Find the webview element and open its DevTools
            const webview = e.currentTarget.querySelector('webview');
            console.log('🔍 Found webview:', webview);
            if (webview && (webview as any).openDevTools) {
              console.log('🔍 Opening DevTools...');
              (webview as any).openDevTools();
            }
          }},
          { label: 'Reload', action: () => {
            console.log('🔍 Reload clicked');
            const webview = e.currentTarget.querySelector('webview');
            if (webview && (webview as any).reload) {
              (webview as any).reload();
            }
          }},
          { label: 'Go Back', action: () => {
            console.log('🔍 Go Back clicked');
            const webview = e.currentTarget.querySelector('webview');
            if (webview && (webview as any).goBack) {
              (webview as any).goBack();
            }
          }},
          { label: 'Go Forward', action: () => {
            console.log('🔍 Go Forward clicked');
            const webview = e.currentTarget.querySelector('webview');
            if (webview && (webview as any).goForward) {
              (webview as any).goForward();
            }
          }}
        ];
        
        menuItems.forEach(item => {
          const menuItem = document.createElement('div');
          menuItem.style.cssText = `
            padding: 8px 12px;
            cursor: pointer;
            border-bottom: 1px solid #eee;
            transition: background-color 0.1s;
          `;
          menuItem.textContent = item.label;
          menuItem.onmouseenter = () => menuItem.style.backgroundColor = '#f5f5f5';
          menuItem.onmouseleave = () => menuItem.style.backgroundColor = 'white';
          menuItem.onclick = () => {
            item.action();
            document.body.removeChild(contextMenu);
          };
          contextMenu.appendChild(menuItem);
        });
        
        // Remove border from last item
        const lastItem = contextMenu.lastChild as HTMLElement;
        if (lastItem) lastItem.style.borderBottom = 'none';
        
        document.body.appendChild(contextMenu);
        console.log('🔍 Context menu created and added to DOM');
        
        // Close menu when clicking outside
        const closeMenu = () => {
          if (document.body.contains(contextMenu)) {
            document.body.removeChild(contextMenu);
          }
          document.removeEventListener('click', closeMenu);
        };
        
        setTimeout(() => document.addEventListener('click', closeMenu), 100);
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
        onContextMenu={(e) => {
          console.log('🔍 Right-click detected on webview!', e);
          e.preventDefault();
          e.stopPropagation();
          
          // Create context menu
          const contextMenu = document.createElement('div');
          contextMenu.style.cssText = `
            position: fixed;
            top: ${e.clientY}px;
            left: ${e.clientX}px;
            background: white;
            border: 1px solid #ccc;
            border-radius: 4px;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
            z-index: 10000;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            font-size: 14px;
            min-width: 150px;
          `;
          
          const menuItems = [
            { label: 'Inspect Element', action: () => {
              console.log('🔍 Inspect Element clicked on webview');
              if (e.currentTarget && (e.currentTarget as any).openDevTools) {
                console.log('🔍 Opening DevTools from webview...');
                (e.currentTarget as any).openDevTools();
              }
            }},
            { label: 'Reload', action: () => {
              console.log('🔍 Reload clicked on webview');
              if (e.currentTarget && (e.currentTarget as any).reload) {
                (e.currentTarget as any).reload();
              }
            }},
            { label: 'Go Back', action: () => {
              console.log('🔍 Go Back clicked on webview');
              if (e.currentTarget && (e.currentTarget as any).goBack) {
                (e.currentTarget as any).goBack();
              }
            }},
            { label: 'Go Forward', action: () => {
              console.log('🔍 Go Forward clicked on webview');
              if (e.currentTarget && (e.currentTarget as any).goForward) {
                (e.currentTarget as any).goForward();
              }
            }}
          ];
          
          menuItems.forEach(item => {
            const menuItem = document.createElement('div');
            menuItem.style.cssText = `
              padding: 8px 12px;
              cursor: pointer;
              border-bottom: 1px solid #eee;
              transition: background-color 0.1s;
            `;
            menuItem.textContent = item.label;
            menuItem.onmouseenter = () => menuItem.style.backgroundColor = '#f5f5f5';
            menuItem.onmouseleave = () => menuItem.style.backgroundColor = 'white';
            menuItem.onclick = () => {
              item.action();
              document.body.removeChild(contextMenu);
            };
            contextMenu.appendChild(menuItem);
          });
          
          // Remove border from last item
          const lastItem = contextMenu.lastChild as HTMLElement;
          if (lastItem) lastItem.style.borderBottom = 'none';
          
          document.body.appendChild(contextMenu);
          console.log('🔍 Context menu created from webview and added to DOM');
          
          // Close menu when clicking outside
          const closeMenu = () => {
            if (document.body.contains(contextMenu)) {
              document.body.removeChild(contextMenu);
            }
            document.removeEventListener('click', closeMenu);
          };
          
          setTimeout(() => document.addEventListener('click', closeMenu), 100);
        }}
      />
    </Box>
  );
}
