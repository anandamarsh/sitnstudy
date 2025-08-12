/**
 * Window Management Module
 * 
 * WORKS: Successfully extracted window management functionality including:
 * - Main window creation and configuration
 * - Window event handlers (ready-to-show, maximize, etc.)
 * - Login window functions (ChatGPT, YouTube)
 * - Window lifecycle management
 * 
 * This file handles the creation and management of the main application
 * window and any additional windows (like login windows).
 */

import { BrowserWindow, Menu, nativeImage } from 'electron'
import path from 'node:path'

export function createWindow(sharedSession: Electron.Session, VITE_DEV_SERVER_URL: string | undefined, RENDERER_DIST: string) {
  let win: BrowserWindow | null

  win = new BrowserWindow({
    show: false,
    icon: path.join(process.env.VITE_PUBLIC, 'sit-and-study.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webviewTag: true,
      session: sharedSession, // Use the shared session for all webviews
    },
  })

  // Test active push message to Renderer-process.
  win.webContents.on('did-finish-load', () => {
    win?.webContents.send('main-process-message', (new Date).toLocaleString())
  })

  // Maximize the window (not fullscreen) and then load content
  win.maximize()

  if (VITE_DEV_SERVER_URL) {
    win.loadURL(VITE_DEV_SERVER_URL)
  } else {
    // win.loadFile('dist/index.html')
    win.loadFile(path.join(RENDERER_DIST, 'index.html'))
  }

  win.once('ready-to-show', () => {
    win?.show()
  })

  // Remove automatic DevTools opening - let user enable it manually
  // win.webContents.openDevTools()

  // Enable right-click context menu with Inspect Element
  win.webContents.on('context-menu', (_e, params) => {
    const contextMenu = Menu.buildFromTemplate([
      {
        label: 'Inspect Element',
        click: () => win?.webContents.inspectElement(params.x, params.y)
      },
      { type: 'separator' },
      { role: 'copy' },
      { role: 'paste' },
      { role: 'selectAll' }
    ])
    contextMenu.popup({ window: win! })
  })

  // Enable keyboard shortcuts for DevTools
  win.webContents.on('before-input-event', (event, input) => {
    // Cmd+Shift+I (macOS) or Ctrl+Shift+I (Windows/Linux) to open DevTools
    if (input.control && input.shift && input.key === 'i') {
      event.preventDefault()
      win?.webContents.toggleDevTools()
    }
    // Cmd+Shift+C (macOS) or Ctrl+Shift+C (Windows/Linux) to open DevTools in element picker mode
    if (input.control && input.shift && input.key === 'c') {
      event.preventDefault()
      win?.webContents.toggleDevTools()
      // Small delay to ensure DevTools is open before entering element picker mode
      setTimeout(() => {
        win?.webContents.sendInputEvent({
          type: 'keyDown',
          keyCode: 'F12'
        })
      }, 100)
    }
  })

  // Set Dock icon on macOS (especially useful in dev where bundle icon isn't used)
  if (process.platform === 'darwin') {
    try {
      const iconPng = path.join(process.env.APP_ROOT!, 'build-icons', 'icon512.png')
      const img = nativeImage.createFromPath(iconPng)
      if (!img.isEmpty()) {
        // Note: app.dock.setIcon(img) will be called from the main file
      }
    } catch {}
  }

  // Create a basic application menu so the first menu item uses the current app name
  const template: Electron.MenuItemConstructorOptions[] = [
    { role: 'appMenu' },
    { role: 'editMenu' },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' },
        { 
          label: 'Toggle Developer Tools',
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+I' : 'Ctrl+Shift+I',
          click: () => win?.webContents.toggleDevTools()
        },
        { type: 'separator' },
        { role: 'resetZoom' },
        { role: 'zoomIn' },
        { role: 'zoomOut' },
        { type: 'separator' },
        { role: 'togglefullscreen' }
      ]
    },
    { role: 'windowMenu' },
    {
      label: 'Account',
      submenu: [
        {
          label: 'Sign in to YouTube (secure window)',
          click: () => openYoutubeLoginWindow(sharedSession),
        },
        {
          label: 'Sign in to ChatGPT (secure window)',
          click: () => openChatgptLoginWindow(sharedSession),
        },
      ],
    },
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  return win
}

export function openChatgptLoginWindow(sharedSession: Electron.Session) {
  const loginWin = new BrowserWindow({
    width: 1100,
    height: 800,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      session: sharedSession,
    },
  })
  loginWin.loadURL('https://chat.openai.com/auth/login')
}

export function openYoutubeLoginWindow(sharedSession: Electron.Session) {
  const loginWin = new BrowserWindow({
    width: 1100,
    height: 800,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      session: sharedSession,
    },
  })
  loginWin.loadURL('https://accounts.google.com/ServiceLogin?service=youtube&continue=https://www.youtube.com/')
  loginWin.webContents.on('did-navigate', (_event, url) => {
    if (url.startsWith('https://www.youtube.com/')) {
      setTimeout(() => loginWin.close(), 500)
    }
  })
}
