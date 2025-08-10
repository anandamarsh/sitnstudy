import { app, BrowserWindow, nativeImage, Menu, session } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

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

let win: BrowserWindow | null

function createWindow() {
  win = new BrowserWindow({
    show: false,
    icon: path.join(process.env.VITE_PUBLIC, 'sit-and-study.svg'),
    webPreferences: {
      preload: path.join(__dirname, 'preload.mjs'),
      webviewTag: true,
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

  // Enable DevTools for debugging
  win.webContents.openDevTools()

  // Enable right-click context menu with Inspect Element
  win.webContents.on('context-menu', (e, params) => {
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

  // Webview attached handler (DevTools disabled by request)
  win.webContents.on('did-attach-webview', () => {})

  // Set Dock icon on macOS (especially useful in dev where bundle icon isn't used)
  if (process.platform === 'darwin') {
    try {
      const iconPng = path.join(process.env.APP_ROOT!, 'build-icons', 'icon512.png')
      const img = nativeImage.createFromPath(iconPng)
      if (!img.isEmpty()) {
        app.dock.setIcon(img)
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
        { role: 'toggleDevTools' },
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
          click: () => openYoutubeLoginWindow(),
        },
        {
          label: 'Sign in to ChatGPT (secure window)',
          click: () => openChatgptLoginWindow(),
        },
      ],
    },
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function openChatgptLoginWindow() {
  const cgptSession = session.fromPartition('persist:sitnstudy-chatgpt')
  const loginWin = new BrowserWindow({
    width: 1100,
    height: 800,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      session: cgptSession,
    },
  })
  loginWin.loadURL('https://chat.openai.com/auth/login')
}

function openYoutubeLoginWindow() {
  const ytSession = session.fromPartition('persist:sitnstudy-youtube')
  const loginWin = new BrowserWindow({
    width: 1100,
    height: 800,
    show: true,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: true,
      session: ytSession,
    },
  })
  loginWin.loadURL('https://accounts.google.com/ServiceLogin?service=youtube&continue=https://www.youtube.com/')
  loginWin.webContents.on('did-navigate', (_event, url) => {
    if (url.startsWith('https://www.youtube.com/')) {
      setTimeout(() => loginWin.close(), 500)
    }
  })
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
    win = null
  }
})

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow()
  }
})

app.whenReady().then(createWindow)
