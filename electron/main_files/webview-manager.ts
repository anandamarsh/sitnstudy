/**
 * Webview Manager Module
 * 
 * This file provides shared functionality for managing webviews across
 * different parts of the main process, particularly for updating
 * whitelists in real-time.
 */

import { WebContents } from 'electron'
import { readFileSync, existsSync } from 'fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Global maps to track webviews across the application
export const webviewSiteMap = new Map<string, string>()
export const webviewContentsMap = new Map<string, WebContents>()

/**
 * Update whitelist in all existing webviews for a specific site
 */
export function updateWhitelistInWebviews(siteKey: string) {
  try {
    const whitelistPath = path.join(__dirname, '../app_data/url_whitelist', `${siteKey}.json`)
    let whitelistedUrls: string[] = []
    
    if (existsSync(whitelistPath)) {
      const whitelistContent = readFileSync(whitelistPath, 'utf8')
      whitelistedUrls = JSON.parse(whitelistContent)
    }
    
    // Find all webviews for this site and update their whitelist
    for (const [webviewId, mappedSiteKey] of webviewSiteMap.entries()) {
      if (mappedSiteKey === siteKey) {
        // Get the webview from our stored references
        const webview = webviewContentsMap.get(webviewId)
        if (webview) {
          const updateScript = `
            if (window.allowInternalNavigation === false) {
              window.whitelistedUrls = ${JSON.stringify(whitelistedUrls)};
              console.log('[WM] Whitelist updated for webview ${webviewId}:', window.whitelistedUrls);
            }
          `
          webview.executeJavaScript(updateScript).catch((error: any) => {
            console.error(`Error updating whitelist in webview ${webviewId}:`, error)
          })
        }
      }
    }
    
    console.log(`[WM] Updated whitelist in ${webviewSiteMap.size} webviews for site: ${siteKey}`)
  } catch (error) {
    console.error(`Error updating whitelist in webviews for ${siteKey}:`, error)
  }
}

/**
 * Store a webview reference for future updates
 */
export function storeWebviewReference(webviewId: string, siteKey: string, webContents: WebContents) {
  webviewSiteMap.set(webviewId, siteKey)
  webviewContentsMap.set(webviewId, webContents)
}

/**
 * Remove a webview reference when it's destroyed
 */
export function removeWebviewReference(webviewId: string) {
  webviewSiteMap.delete(webviewId)
  webviewContentsMap.delete(webviewId)
}
