import React from 'react'

declare global {
  namespace JSX {
    interface IntrinsicElements {
      webview: React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        src?: string
        allowpopups?: string
        partition?: string
        useragent?: string
        onDidFailLoad?: (event: any) => void
        onDidFinishLoad?: (event: any) => void
        onDidStartLoading?: (event: any) => void
      }
    }
  }
}

export {}

