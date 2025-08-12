import { app, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

// TODO: Import from extracted modules
// import { setupIpcHandlers } from './ipc-handlers'
// import { setupSessionManagement } from './session-management'
// import { setupWindowManagement } from './window-management'
// import { setupWebviewHandlers } from './webview-handlers'
// import { setupDevToolsConfig } from './devtools-config'
// import { setupMenuConfig } from './menu-config'
// import { setupAppLifecycle } from './app-lifecycle'
// import { APP_CONSTANTS } from './constants'

// DevTools are now enabled on-demand:
// - Right-click → "Inspect Element" to inspect specific elements
// - Cmd+Shift+I (macOS) or Ctrl+Shift+I (Windows/Linux) to toggle DevTools
// - Cmd+Shift+C (macOS) or Ctrl+Shift+C (Windows/Linux) to open DevTools in element picker mode
// - View menu → "Toggle Developer Tools"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Note: webviewSiteMap moved to webview-handlers module

// Import IPC handlers from ipc-handlers module
import './ipc-handlers'

// Ensure app name is set as early as possible (affects Dock/menu in dev on macOS)
if (process.platform === 'darwin') {
  app.setName('Sit-N-Study')
}
// Revert to Electron default UA; per-site webviews use their own persisted partitions

// The built directory structure
//
// ├─┬─┬ dist
// │ │ └── index.html
// │ │
// │ ├─┬ dist-electron
// │ │ ├── main.js
// │ │ └── preload.mjs
// │
process.env.APP_ROOT = path.join(__dirname, '..')

// 🚧 Use ['ENV_NAME'] avoid vite:define plugin - Vite@2.x
export const VITE_DEV_SERVER_URL = process.env['VITE_DEV_SERVER_URL']
export const MAIN_DIST = path.join(process.env.APP_ROOT, 'dist-electron')
export const RENDERER_DIST = path.join(process.env.APP_ROOT, 'dist')

process.env.VITE_PUBLIC = VITE_DEV_SERVER_URL ? path.join(process.env.APP_ROOT, 'public') : RENDERER_DIST

import { createSharedSession } from './session-management'
import { createWindow } from './window-management'

app.whenReady().then(() => {
  // Create a shared session for all webviews to enable cookie sharing
  const sharedSession = createSharedSession()

  createWindow(sharedSession, VITE_DEV_SERVER_URL, RENDERER_DIST)

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow(sharedSession, VITE_DEV_SERVER_URL, RENDERER_DIST)
    }
  })
})
