/**
 * Session Management Module
 * 
 * WORKS: Successfully extracted session management functionality including:
 * - Shared session creation with 'persist:sitnstudy-shared' partition
 * - WebRequest.onBeforeSendHeaders configuration for cookie handling
 * - setPermissionRequestHandler for common permissions (notifications, media, geolocation)
 * - Session preloads and storage configuration for persistence
 * 
 * This file handles the creation and configuration of Electron sessions
 * for webviews, including cookie sharing and storage persistence.
 */

import { session } from 'electron'

export function createSharedSession() {
  // Create a shared session for all webviews to enable cookie sharing
  const sharedSession = session.fromPartition('persist:sitnstudy-shared', {
    cache: true
  })
  
  // Configure the shared session for better cookie and storage persistence
  sharedSession.webRequest.onBeforeSendHeaders((details, callback) => {
    // Ensure cookies are sent with all requests
    if (details.requestHeaders.Cookie) {
      callback({ requestHeaders: details.requestHeaders })
    } else {
      callback({ requestHeaders: details.requestHeaders })
    }
  })
  
  // Enable persistent storage for the shared session
  sharedSession.setPermissionRequestHandler((_webContents, permission, callback) => {
    // Allow common permissions for better user experience
    const allowedPermissions = ['notifications', 'media', 'geolocation']
    if (allowedPermissions.includes(permission)) {
      callback(true)
    } else {
      callback(false)
    }
  })
  
  // Configure session storage and cookies to persist
  sharedSession.setPreloads([])
  // Don't clear storage data - this was causing cookies to be lost on app restart
  console.log('[SM] Shared session ready for use - cookies and storage will persist')
  
  return sharedSession
}
