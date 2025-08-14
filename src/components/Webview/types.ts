import React from "react";

// Extend HTMLWebViewElement to include our custom properties
declare global {
  interface HTMLWebViewElement {
    _listeners?: {
      didNavigate: (e: any) => void;
      didNavigateInPage: (e: any) => void;
      domReady: () => void;
    };
  }
}

export interface SiteTab {
  key: string;
  title: string;
  url: string;
  icon?: React.ReactElement;
  showAddressBar?: boolean;
}

export interface WebviewTabProps {
  tab: SiteTab;
  index: number;
  isActive: boolean;
  webviewRef: (el: HTMLWebViewElement | null) => void;
  loadingState: boolean;
  loadingProgress: number;
  isLoaded: boolean;
  currentUrl: string;
  onUrlChange: (tabKey: string, url: string) => void;
  onPreserveState: (tabKey: string) => void;
  onRestoreState: (tabKey: string) => void;
  onBackClick: (index: number) => void;
  onForwardClick: (index: number) => void;
  onRefreshClick: (index: number) => void;
  canGoBack: boolean;
  canGoForward: boolean;
}

export interface WebviewState {
  webviewRefs: React.MutableRefObject<any[]>;
  loadingStates: { [key: string]: boolean };
  loadingProgress: { [key: string]: number };
  loadedTabs: { [key: string]: boolean };
  currentUrls: { [key: string]: string };
  handleUrlChange: (tabKey: string, url: string) => void;
  preserveWebviewState: (tabKey: string) => void;
  restoreWebviewState: (tabKey: string) => void;
}

export interface WebviewMedia {
  pauseAllWebviews: () => void;
  pauseBackgroundWebviews: () => void;
  resumeActiveWebview: () => void;
}
