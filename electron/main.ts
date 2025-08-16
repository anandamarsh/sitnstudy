// Import all the main process code from main_files/index.ts
import './main_files/index.ts'

// Force every webview to use our preload script for security
import { app } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

app.on('web-contents-created', (_e, contents) => {
  contents.on('will-attach-webview', (_event, webPreferences) => {
    // Set a real filesystem path here (not a file:// URL)
    webPreferences.preload = path.join(__dirname, 'webview-preload.js')
    webPreferences.contextIsolation = true
    webPreferences.nodeIntegration = false
    // Keep other hardening as needed
    console.log('[MN] will-attach-webview: Set preload to:', webPreferences.preload)
  })
})



