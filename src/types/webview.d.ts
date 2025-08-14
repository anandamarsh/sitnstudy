import React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        allowpopups?: boolean | string
        webpreferences?: string
        partition?: string
        name?: string
        useragent?: string
        onDidFailLoad?: (event: any) => void
        onDidFinishLoad?: (event: any) => void
        onDidStartLoading?: (event: any) => void
      }
    }
  }

  interface Window {
    electronAPI?: {
      showWebviewContextMenu: (pos: { x: number; y: number }) => Promise<any>;
      getWebviewPreloadPath: () => string;
    };
  }
}

export {}

