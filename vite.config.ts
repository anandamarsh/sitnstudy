import { defineConfig } from 'vite'
import path from 'node:path'
import electron from 'vite-plugin-electron/simple'
import react from '@vitejs/plugin-react'
import { copyFileSync, existsSync, mkdirSync } from 'fs'

// https://vitejs.dev/config/
export default defineConfig({
  publicDir: 'public',
  plugins: [
    react(),
    electron({
      main: {
        // Shortcut of `build.lib.entry`.
        entry: 'electron/main.ts',
      },
      preload: {
        // Shortcut of `build.rollupOptions.input`.
        // Preload scripts may contain Web assets, so use the `build.rollupOptions.input` instead `build.lib.entry`.
        input: path.join(__dirname, 'electron/preload.ts'),
      },
      // Ployfill the Electron and Node.js API for Renderer process.
      // If you want use Node.js in Renderer process, the `nodeIntegration` needs to be enabled in the Main process.
      // See 👉 https://github.com/electron-vite/vite-plugin-electron-renderer
      renderer: process.env.NODE_ENV === 'test'
        // https://github.com/electron-vite/vite-plugin-electron-renderer/issues/78#issuecomment-2053600808
        ? undefined
        : {},
    }),
    // Plugin to copy webview-preload.js to dist-electron folder
    {
      name: 'copy-webview-preload',
      closeBundle() {
        const sourceFile = path.join(__dirname, 'electron/webview-preload.js')
        const targetDir = path.join(__dirname, 'dist-electron')
        const targetFile = path.join(targetDir, 'webview-preload.js')
        
        if (existsSync(sourceFile)) {
          if (!existsSync(targetDir)) {
            mkdirSync(targetDir, { recursive: true })
          }
          copyFileSync(sourceFile, targetFile)
          console.log(`✅ Copied webview-preload.js to ${targetFile}`)
        } else {
          console.warn(`⚠️ Source file not found: ${sourceFile}`)
        }
      }
    }
  ],
})
