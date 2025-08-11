import { app, BrowserWindow, nativeImage, Menu, session, ipcMain } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { promises as fs } from 'fs'

// DevTools are now enabled on-demand:
// - Right-click → "Inspect Element" to inspect specific elements
// - Cmd+Shift+I (macOS) or Ctrl+Shift+I (Windows/Linux) to toggle DevTools
// - Cmd+Shift+C (macOS) or Ctrl+Shift+C (Windows/Linux) to open DevTools in element picker mode
// - View menu → "Toggle Developer Tools"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// IPC handlers for site management
ipcMain.handle('add-new-site', async (_event, newSite) => {
  try {
    const availableSitesPath = path.join(__dirname, '../src/config/availableSites.json')
    const currentContent = readFileSync(availableSitesPath, 'utf8')
    const sites = JSON.parse(currentContent)
    
    // Generate a unique filename for the SVG icon
    const iconFilename = `${newSite.key}.svg`
    const iconPath = path.join(__dirname, '../public/icons', iconFilename)
    
    // If the newSite has SVG content, save it to the local file
    if (newSite.svgContent) {
      try {
        // Ensure the icons directory exists
        const iconsDir = path.dirname(iconPath)
        if (!existsSync(iconsDir)) {
          mkdirSync(iconsDir, { recursive: true })
        }
        
        // Save the SVG content to the local file
        writeFileSync(iconPath, newSite.svgContent, 'utf8')
        
        // Update the iconPath to point to the local file
        newSite.iconPath = `/icons/${iconFilename}`
        
        console.log(`Saved SVG icon to: ${iconPath}`)
      } catch (iconError) {
        console.error('Error saving SVG icon:', iconError)
        // Continue with the original iconPath if SVG saving fails
      }
    }
    
    // Remove the temporary svgContent property
    delete newSite.svgContent
    
    sites.push(newSite)
    
    writeFileSync(availableSitesPath, JSON.stringify(sites, null, 2), 'utf8')
    
    return { 
      success: true, 
      message: `Successfully added new site: ${newSite.title}`,
      iconPath: newSite.iconPath
    }
  } catch (error) {
    console.error('Error adding new site:', error)
    return { success: false, message: 'Failed to add new site' }
  }
})

ipcMain.handle('remove-site', async (_event, siteKey) => {
  try {
    const availableSitesPath = path.join(__dirname, '../src/config/availableSites.json')
    const currentContent = readFileSync(availableSitesPath, 'utf8')
    const sites = JSON.parse(currentContent)
    
    // Find the site to remove
    const siteIndex = sites.findIndex((site: any) => site.key === siteKey)
    
    if (siteIndex === -1) {
      return { 
        success: false, 
        message: `Site with key "${siteKey}" not found.` 
      }
    }
    
    // Remove the site
    sites.splice(siteIndex, 1)
    
    // Write back to the file
    writeFileSync(availableSitesPath, JSON.stringify(sites, null, 2), 'utf8')
    
    return { 
      success: true, 
      message: `Successfully removed site: ${siteKey}` 
    }
  } catch (error) {
    console.error('Error removing site:', error)
    return { success: false, message: 'Failed to remove site' }
  }
})

ipcMain.handle('get-available-sites', async () => {
  try {
    const availableSitesPath = path.join(__dirname, '../src/config/availableSites.json')
    const content = readFileSync(availableSitesPath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading availableSites.json:', error)
    return []
  }
})

// IPC handlers for URL logging
ipcMain.handle('toggle-url-logging', async (_event, siteKey: string, enabled: boolean) => {
  try {
    const configDir = path.join(__dirname, '..', 'src', 'config')
    const availableSitesPath = path.join(configDir, 'availableSites.json')
    
    // Read current availableSites.json
    const currentContent = await fs.readFile(availableSitesPath, 'utf-8')
    const availableSites = JSON.parse(currentContent)
    
    // Find and update the site
    const siteIndex = availableSites.findIndex((site: any) => site.key === siteKey)
    if (siteIndex !== -1) {
      availableSites[siteIndex].urlLogging = enabled
      
      // Write back to file
      await fs.writeFile(availableSitesPath, JSON.stringify(availableSites, null, 2))
      console.log(`Updated URL logging for ${siteKey} to ${enabled}`)
      return { success: true }
    } else {
      console.error(`Site ${siteKey} not found in availableSites.json`)
      return { success: false, error: 'Site not found' }
    }
  } catch (error) {
    console.error('Error toggling URL logging:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('toggle-external-navigation', async (_event, siteKey: string, enabled: boolean) => {
  try {
    const configDir = path.join(__dirname, '..', 'src', 'config')
    const availableSitesPath = path.join(configDir, 'availableSites.json')
    
    // Read current availableSites.json
    const currentContent = await fs.readFile(availableSitesPath, 'utf-8')
    const availableSites = JSON.parse(currentContent)
    
    // Find and update the site
    const siteIndex = availableSites.findIndex((site: any) => site.key === siteKey)
    if (siteIndex !== -1) {
      availableSites[siteIndex].allowExternalNavigation = enabled
      
      // Write back to file
      await fs.writeFile(availableSitesPath, JSON.stringify(availableSites, null, 2))
      console.log(`Updated external navigation for ${siteKey} to ${enabled}`)
      return { success: true }
    } else {
      console.error(`Site ${siteKey} not found in availableSites.json`)
      return { success: false, error: 'Site not found' }
    }
  } catch (error) {
    console.error('Error toggling external navigation:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('log-url', async (_event, siteKey: string, url: string, title?: string) => {
  try {
    const configDir = path.join(__dirname, '../src/config')
    const logFilePath = path.join(configDir, `${siteKey}_urls.json`)
    
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
    
    // Add new entry
    const newEntry = {
      timestamp: new Date().toISOString(),
      url: url,
      title: title || ''
    }
    
    urlLog.push(newEntry)
    
    // Write back to file
    writeFileSync(logFilePath, JSON.stringify(urlLog, null, 2), 'utf8')
    
    return { success: true, message: 'URL logged successfully' }
  } catch (error) {
    console.error('Error logging URL:', error)
    return { success: false, message: 'Failed to log URL' }
  }
})

ipcMain.handle('get-url-log', async (_event, siteKey: string) => {
  try {
    const logFilePath = path.join(__dirname, '../src/config', `${siteKey}_urls.json`)
    
    if (!existsSync(logFilePath)) {
      return { success: true, data: [] }
    }
    
    const content = readFileSync(logFilePath, 'utf8')
    const urlLog = JSON.parse(content)
    
    return { success: true, data: urlLog }
  } catch (error) {
    console.error('Error reading URL log:', error)
    return { success: false, message: 'Failed to read URL log', data: [] }
  }
})

// IPC handlers for config file access
ipcMain.handle('get-config-files', async () => {
  try {
    const configDir = path.join(__dirname, '../src/config')
    const files = await import('fs/promises')
    const filesList = await files.readdir(configDir)
    return filesList.filter(file => file.endsWith('_urls.json'))
  } catch (error) {
    console.error('Error reading config directory:', error)
    return []
  }
})

ipcMain.handle('read-config-file', async (_event, fileName: string) => {
  try {
    const configDir = path.join(__dirname, '../src/config')
    const filePath = path.join(configDir, fileName)
    
    if (!existsSync(filePath)) {
      return null
    }
    
    const content = readFileSync(filePath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading config file:', error)
    return null
  }
})

ipcMain.handle('remove-url-log-file', async (_event, appKey: string) => {
  try {
    const configDir = path.join(__dirname, '../src/config')
    const fs = await import('fs/promises')
    const files = await fs.readdir(configDir)
    const matchingFile = files.find(file => file.includes(appKey) && file.endsWith('_urls.json'))
    
    if (matchingFile) {
      const filePath = path.join(configDir, matchingFile)
      await fs.unlink(filePath)
      return { success: true, message: 'URL log file removed successfully' }
    }
    
    return { success: false, message: 'No URL log file found for this app' }
  } catch (error) {
    console.error('Error removing URL log file:', error)
    return { success: false, message: 'Failed to remove URL log file' }
  }
})

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

app.whenReady().then(() => {
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
  sharedSession.clearStorageData({
    storages: ['cookies', 'filesystem', 'indexdb', 'localstorage', 'shadercache', 'websql', 'serviceworkers', 'cachestorage']
  }).then(() => {
    console.log('Shared session storage cleared and ready for use')
  }).catch((error) => {
    console.log('Shared session storage already clean:', error)
  })

  let win: BrowserWindow | null

  function createWindow() {
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
          // Check if external navigation is allowed for this site
          try {
            const availableSitesPath = path.join(__dirname, '../src/config/availableSites.json')
            const sitesContent = readFileSync(availableSitesPath, 'utf8')
            const sites = JSON.parse(sitesContent)
            
            const site = sites.find((s: any) => {
              try {
                const siteDomain = new URL(s.url).hostname
                return siteDomain === currentDomain
              } catch {
                return false
              }
            })
            
            // If external navigation is allowed, don't block
            if (site && site.allowExternalNavigation !== false) {
              console.log(`Allowing external navigation to: ${navigationDomain} from ${currentDomain}`);
              return; // Allow the navigation
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
        
        // Inject script to intercept link clicks, form submissions, and client-side navigation
        webContents.executeJavaScript(`
          (function() {
            const currentDomain = '${currentDomain}';
            
            // Intercept link clicks
            document.addEventListener('click', function(e) {
              const target = e.target.closest('a');
              if (target && target.href) {
                try {
                  const url = new URL(target.href);
                  if (url.hostname !== currentDomain) {
                    // For external navigation, we'll let the main process handle the check
                    // This ensures we respect the allowExternalNavigation setting
                    // The main process will either allow or block based on the setting
                    return true; // Don't prevent default, let main process decide
                  } else if (target.href.startsWith('http')) {
                    // Log internal navigation immediately when link is clicked - only fully qualified URLs
                    console.log('URL_CHANGE:' + JSON.stringify({
                      url: target.href,
                      previousUrl: window.location.href,
                      currentDomain: currentDomain
                    }));
                  }
                } catch (error) {
                  // Invalid URL, allow the click
                }
              }
            }, true);
            
            // Intercept form submissions
            document.addEventListener('submit', function(e) {
              const form = e.target;
              if (form.action) {
                try {
                  const url = new URL(form.action);
                  if (url.hostname !== currentDomain) {
                    // For external navigation, we'll let the main process handle the check
                    // This ensures we respect the allowExternalNavigation setting
                    // The main process will either allow or block based on the setting
                    return true; // Don't prevent default, let main process decide
                  } else if (form.action.startsWith('http')) {
                    // Log internal navigation immediately when form is submitted - only fully qualified URLs
                    console.log('URL_CHANGE:' + JSON.stringify({
                      url: form.action,
                      previousUrl: window.location.href,
                      currentDomain: currentDomain
                    }));
                  }
                } catch (error) {
                  // Invalid URL, allow the submission
                }
              }
            }, true);
            
            // Monitor client-side navigation changes (SPA routing, pushState, etc.)
            let lastUrl = window.location.href;
            
            // Monitor pushState and replaceState
            const originalPushState = history.pushState;
            const originalReplaceState = history.replaceState;
            
                       history.pushState = function(...args) {
               // Log the new URL immediately when pushState is called - only fully qualified URLs
               const newUrl = args[2]; // The third argument is the URL
               if (newUrl && newUrl.startsWith('http')) {
                 console.log('URL_CHANGE:' + JSON.stringify({
                   url: newUrl,
                   previousUrl: lastUrl,
                   currentDomain: currentDomain
                 }));
               }
               
               originalPushState.apply(this, args);
               lastUrl = window.location.href;
             };
            
                       history.replaceState = function(...args) {
               // Log the new URL immediately when replaceState is called - only fully qualified URLs
               const newUrl = args[2]; // The third argument is the URL
               if (newUrl && newUrl.startsWith('http')) {
                 console.log('URL_CHANGE:' + JSON.stringify({
                   url: newUrl,
                   previousUrl: lastUrl,
                   currentDomain: currentDomain
                 }));
               }
               
               originalReplaceState.apply(this, args);
               lastUrl = window.location.href;
             };
            
            // Monitor popstate events
            window.addEventListener('popstate', function() {
              // Log immediately when popstate occurs
              const currentUrl = window.location.href;
              console.log('URL_CHANGE:' + JSON.stringify({
                url: currentUrl,
                previousUrl: lastUrl,
                currentDomain: currentDomain
              }));
              lastUrl = currentUrl;
            });
            
            // Monitor hash changes
            window.addEventListener('hashchange', function() {
              // Log immediately when hashchange occurs
              const currentUrl = window.location.href;
              console.log('URL_CHANGE:' + JSON.stringify({
                url: currentUrl,
                previousUrl: lastUrl,
                currentDomain: currentDomain
              }));
              lastUrl = currentUrl;
            });
            

          })();
        `);
      });
      
      // Listen for console messages from injected script
      webContents.on('console-message', (_event, _level, message, _line, _sourceId) => {
        if (message.startsWith('NAVIGATION_BLOCKED:')) {
          try {
            const data = JSON.parse(message.substring(19)); // Remove 'NAVIGATION_BLOCKED:' prefix
            if (win) {
              win.webContents.send('navigation-blocked', data);
            }
          } catch (error) {
            console.error('Error parsing navigation blocked message:', error);
          }
                 } else if (message.startsWith('URL_CHANGE:')) {
             try {
               const data = JSON.parse(message.substring(11)); // Remove 'URL_CHANGE:' prefix
               // Log URL changes for enabled sites - only fully qualified URLs
               if (data.url && data.currentDomain && data.url.startsWith('http')) {
                 logUrlNavigation(data.url);
               }
             } catch (error) {
               console.error('Error parsing URL change message:', error);
             }
           }
      });

      // Log URL navigation when logging is enabled for this site
      const logUrlNavigation = async (url: string) => {
        try {
          // Get the current site key from the webview partition or URL
          const currentUrl = webContents.getURL();
          const currentDomain = new URL(currentUrl).hostname;
          
          // Find the site by matching domain (this is a simple approach)
          // In a more robust implementation, you might want to store the site key in the webview
          const availableSitesPath = path.join(__dirname, '../src/config/availableSites.json')
          const sitesContent = readFileSync(availableSitesPath, 'utf8')
          const sites = JSON.parse(sitesContent)
          
          const site = sites.find((s: any) => {
            try {
              const siteDomain = new URL(s.url).hostname
              return siteDomain === currentDomain
            } catch {
              return false
            }
          })
          
          if (site && site.urlLogging) {
            // Get page title if available
            let pageTitle = ''
            try {
              pageTitle = await webContents.executeJavaScript('document.title')
            } catch (error) {
              // Title might not be available yet
            }
            
            // Log the URL - we need to call the handler function directly
            // Since we can't call ipcMain handlers directly, we'll implement the logging logic here
            try {
              const configDir = path.join(__dirname, '../src/config')
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
          }
        } catch (error) {
          console.error('Error logging URL navigation:', error)
        }
      };

      // Listen for full page navigations
      webContents.on('did-navigate', async (_event, navigationUrl) => {
        await logUrlNavigation(navigationUrl);
      });

      // Listen for in-page navigations (SPA routing, hash changes, etc.)
      webContents.on('did-navigate-in-page', async (_event, navigationUrl) => {
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

  function openYoutubeLoginWindow() {
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

  createWindow()
})
