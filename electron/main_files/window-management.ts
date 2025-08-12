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

import { app, BrowserWindow, Menu, nativeImage } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { configManager } from './config-manager'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// Map to track which site each webview belongs to
const webviewSiteMap = new Map<string, string>()

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

  // Webview attached handler - enable popups and handle new windows
  win.webContents.on('did-attach-webview', (_event, webContents) => {
    // Enable popups for this webview
    webContents.setWindowOpenHandler(({ url, frameName, features }) => {
      // Open popups in the same webview or create a new window
      console.log('Webview popup requested:', url, frameName, features);
      
      // For now, allow all popups to open in the same webview
      // You can customize this behavior based on your needs
      return { action: 'allow' };
    });

    // Block navigation to external domains
    webContents.on('will-navigate', async (event, navigationUrl) => {
      const currentUrl = webContents.getURL();
      const currentDomain = new URL(currentUrl).hostname;
      const navigationDomain = new URL(navigationUrl).hostname;
      
      if (currentDomain !== navigationDomain) {
        // Check if external navigation is allowed for the ORIGINAL site that created this webview
        // We'll determine this by looking up the site key in our webviewSiteMap
        let originalSiteKey: string | undefined;
        
                  try {
            // Get the site key from our webview mapping
            const webviewId = String(webContents.id);
            originalSiteKey = webviewSiteMap.get(webviewId);
            
            if (originalSiteKey) {
              // Use config manager for real-time configuration access
              const originalSite = configManager.getSite(originalSiteKey)
              
              // If external navigation is allowed for the original site, don't block
              if (originalSite && originalSite.allowExternalNavigation === true) {
                console.log(`Allowing external navigation to: ${navigationDomain} from ${currentDomain} (original site: ${originalSiteKey})`);
                return; // Allow the navigation
              }
            }
          } catch (error) {
            console.error('Error checking external navigation setting:', error)
            // Default to blocking if there's an error
          }
        
        console.log(`Blocked navigation to external domain: ${navigationDomain} from ${currentDomain}`);
        event.preventDefault();
        
        // Send message to renderer to show error snackbar
        if (win) {
          win.webContents.send('navigation-blocked', {
            blockedUrl: navigationUrl,
            currentDomain: currentDomain,
            targetDomain: navigationDomain
          });
        }
      }
    });

    // Inject JavaScript to intercept link clicks and form submissions
    webContents.on('did-finish-load', () => {
      const currentUrl = webContents.getURL();
      const currentDomain = new URL(currentUrl).hostname;
      
      // Try to determine the site key for this webview if we don't have it yet
      const webviewId = String(webContents.id); // Convert to string to ensure it's serializable
      if (!webviewSiteMap.has(webviewId)) {
        try {
          const sites = configManager.getSites()
          
          // Find the site by matching the current URL domain
          const site = sites.find((s: any) => {
            try {
              const siteDomain = new URL(s.url).hostname
              // Check if current domain matches the site domain or is a subdomain
              return currentDomain === siteDomain || currentDomain.endsWith('.' + siteDomain)
            } catch {
              return false
            }
          })
          
          if (site) {
            webviewSiteMap.set(webviewId, site.key)
            console.log(`Mapped webview ${webviewId} to site: ${site.key} (domain: ${currentDomain})`)
          } else {
            console.log(`Could not map webview ${webviewId} to any site. Current domain: ${currentDomain}`)
            // Log available sites for debugging
            console.log('Available sites:', sites.map((s: any) => ({ key: s.key, url: s.url, domain: new URL(s.url).hostname })))
          }
        } catch (error) {
          console.error('Error mapping webview to site:', error)
        }
      }
        
      // Inject external script to intercept link clicks, form submissions, and client-side navigation
      const moleScriptPath = path.join(__dirname, '../public/mole.js');
      try {
        const moleScript = readFileSync(moleScriptPath, 'utf8');
        // Replace the placeholder with the actual current domain
        const scriptWithDomain = moleScript.replace('CURRENT_DOMAIN_PLACEHOLDER', currentDomain);
        webContents.executeJavaScript(scriptWithDomain);
      } catch (error) {
        console.error('Error loading mole.js script:', error);
        // Fallback to basic injection if file can't be loaded
        webContents.executeJavaScript(`
          console.log('URL_CHANGE:' + JSON.stringify({
            url: window.location.href,
            previousUrl: window.location.href,
            currentDomain: '${currentDomain}'
          }));
        `);
      }
    });
    
    // Listen for console messages from injected script
    webContents.on('console-message', (_event, _level, message, _line, _sourceId) => {
      if (message.startsWith('NAVIGATION_BLOCKED:')) {
        try {
          const data = JSON.parse(message.substring(19)); // Remove 'NAVIGATION_BLOCKED:' prefix
          if (win) {
            // Only send serializable data to prevent cloning errors
            win.webContents.send('navigation-blocked', {
              blockedUrl: data.blockedUrl || '',
              currentDomain: data.currentDomain || '',
              targetDomain: data.targetDomain || ''
            });
          }
        } catch (error) {
          console.error('Error parsing navigation blocked message:', error)
        }
      } else if (message.startsWith('URL_CHANGE:')) {
        try {
          const data = JSON.parse(message.substring(11)); // Remove 'URL_CHANGE:' prefix
          // Log URL changes for enabled sites - only fully qualified URLs
          if (data.url && data.currentDomain && data.url.startsWith('http')) {
            logUrlNavigation(data.url);
          }
        } catch (error) {
          console.error('Error parsing URL change message:', error)
        }
      }
    });

    // Log URL navigation when logging is enabled for this site
    const logUrlNavigation = async (url: string) => {
      try {
        // First try to get the site key from our webview mapping
        const webviewId = String(webContents.id);
        let siteKey = webviewSiteMap.get(webviewId);
         
        if (!siteKey) {
          // Fallback: Get the current site key from the webview URL
          const currentUrl = webContents.getURL();
          const currentDomain = new URL(currentUrl).hostname;
          
          // Find the site by matching domain
          const sites = configManager.getSites()
          
          const site = sites.find((s: any) => {
            try {
              const siteDomain = new URL(s.url).hostname
              // Check if current domain matches the site domain or is a subdomain
              return currentDomain === siteDomain || currentDomain.endsWith('.' + siteDomain)
            } catch {
              return false
            }
          })
          
          if (site) {
            siteKey = site.key;
            // Store this mapping for future use
            webviewSiteMap.set(webviewId, site.key);
          }
        }
        
        if (siteKey) {
          // Get the site configuration to check if logging is enabled
          const site = configManager.getSite(siteKey);
          
          if (site && site.urlLogging) {
            // Get page title if available
            let pageTitle = ''
            try {
              pageTitle = await webContents.executeJavaScript('document.title')
            } catch (error) {
              // Title might not be available yet
            }
             
            // Log the URL
            try {
              const configDir = path.join(__dirname, '../src/app_data')
              const logFilePath = path.join(configDir, `${site.key}_urls.json`)
              
              // Create config directory if it doesn't exist
              if (!existsSync(configDir)) {
                mkdirSync(configDir, { recursive: true })
              }
              
              // Read existing log or create new one
              let urlLog: any[] = []
              if (existsSync(logFilePath)) {
                try {
                  const content = readFileSync(logFilePath, 'utf8')
                  urlLog = JSON.parse(content)
                } catch (parseError) {
                  console.error('Error parsing existing URL log:', parseError)
                  urlLog = []
                }
              }
              
              // Check if URL already exists in the log
              const existingEntry = urlLog.find(entry => entry.url === url);
              
              if (!existingEntry) {
                // Add new entry only if it's unique
                const newEntry = {
                  url: url,
                  title: pageTitle || ''
                }
                
                urlLog.push(newEntry)
              }
              
              // Write back to file
              writeFileSync(logFilePath, JSON.stringify(urlLog, null, 2), 'utf8')
              
              console.log(`URL logged for ${site.key}: ${url}`)
            } catch (logError) {
              console.error('Error logging URL:', logError)
            }
          } else {
            console.log(`URL logging not enabled for site: ${siteKey}`)
          }
        } else {
          console.log(`Could not determine site key for webview ${webviewId}. URL: ${url}`)
        }
      } catch (error) {
        console.error('Error logging URL navigation:', error)
      }
    };

    // Listen for full page navigations
    webContents.on('did-navigate', async (_event, navigationUrl) => {
      const webviewId = String(webContents.id);
      console.log(`Navigation detected for webview ${webviewId}: ${navigationUrl}`);
      await logUrlNavigation(navigationUrl);
    });

    // Listen for in-page navigations (SPA routing, hash changes, etc.)
    webContents.on('did-navigate-in-page', async (_event, navigationUrl) => {
      const webviewId = String(webContents.id);
      console.log(`In-page navigation detected for webview ${webviewId}: ${navigationUrl}`);
      await logUrlNavigation(navigationUrl);
    });
  });

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
