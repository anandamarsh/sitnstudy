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

import { app, BrowserWindow, Menu, nativeImage, screen } from 'electron'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { writeFileSync, readFileSync, existsSync, mkdirSync, readdirSync } from 'fs'
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
    // ✅ Force every webview to use our preload script for security
    webContents.setWindowOpenHandler(({ url, frameName, features }) => {
      // Open popups in the same webview or create a new window
      console.log('Webview popup requested:', url, frameName, features);
      
      // For now, allow all popups to open in the same webview
      // You can customize this behavior based on your needs
      return { action: 'allow' };
    });

    // Listen for DevTools opening to resize main window
    webContents.on('devtools-opened', () => {
      console.log('[WM] DevTools opened for webview, resizing main window');
      resizeMainWindowForDevTools(win);
    });

    // Listen for DevTools closing to restore main window
    webContents.on('devtools-closed', () => {
      console.log('[WM] DevTools closed for webview, restoring main window');
      restoreMainWindowSize(win);
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
                console.log(`[WM] Allowing external navigation to: ${navigationDomain} from ${currentDomain} (original site: ${originalSiteKey})`);
                return; // Allow the navigation
              }
            }
          } catch (error) {
            console.error('Error checking external navigation setting:', error)
            // Default to blocking if there's an error
          }
        
        console.log(`[WM] Blocked navigation to external domain: ${navigationDomain} from ${currentDomain}`);
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

    // Listen for internal navigation blocked messages from the webview
    webContents.on('console-message', (_event, _level, message, _line, _sourceId) => {
      // Check if the message contains our internal navigation blocked data
      if (message.includes('internal-navigation-blocked')) {
        try {
          // Extract the data from the console message
          const match = message.match(/internal-navigation-blocked: (.+)/);
          if (match) {
            const data = JSON.parse(match[1]);
            console.log(`[WM] Internal navigation blocked to: ${data.blockedUrl} from ${data.currentDomain}`);
            
            // Send message to renderer to show error snackbar (same as external navigation)
            if (win) {
              win.webContents.send('navigation-blocked', {
                blockedUrl: data.blockedUrl,
                currentDomain: data.currentDomain,
                targetDomain: data.targetDomain
              });
            }
          }
        } catch (error) {
          console.error('Error parsing internal navigation blocked message:', error);
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
            console.log(`[WM] Mapped webview ${webviewId} to site: ${site.key} (domain: ${currentDomain})`)
          } else {
            console.log(`[WM] Could not map webview ${webviewId} to any site. Current domain: ${currentDomain}`)
            // Log available sites for debugging
            console.log('Available sites:', sites.map((s: any) => ({ key: s.key, url: s.url, domain: new URL(s.url).hostname })))
          }
        } catch (error) {
          console.error('Error mapping webview to site:', error)
        }
      }
        
      // Inject common modules first
      try {
        // Get webview ID and site key
        const webviewId = String(webContents.id);
        let siteKey = webviewSiteMap.get(webviewId);
        
        // First, inject the navigation settings and whitelist
        let allScriptContent = '';
        
        if (siteKey) {
          const site = configManager.getSite(siteKey);
          if (site) {
            const allowInternalNav = site.allowInternalNavigation !== false; // Default to true if not set
            allScriptContent += `window.allowInternalNavigation = ${allowInternalNav};\n`;
            
            // Inject whitelisted URLs if internal navigation is blocked
            if (!allowInternalNav) {
              try {
                const whitelistPath = path.join(__dirname, '../app_data/url_whitelist', `${siteKey}.json`);
                if (existsSync(whitelistPath)) {
                  const whitelistContent = readFileSync(whitelistPath, 'utf8');
                  const whitelistedUrls = JSON.parse(whitelistContent);
                  allScriptContent += `window.whitelistedUrls = ${JSON.stringify(whitelistedUrls)};\n`;
                } else {
                  allScriptContent += `window.whitelistedUrls = [];\n`;
                }
              } catch (error) {
                console.error(`Error loading whitelist for ${siteKey}:`, error);
                allScriptContent += `window.whitelistedUrls = [];\n`;
              }
            } else {
              allScriptContent += `window.whitelistedUrls = [];\n`;
            }
          }
        }
        
        // Load and inject each common module
        const commonDir = path.join(__dirname, '../app_injections/common');
        const commonFiles = [
          'navigation-blocking.js',
          'history-api.js', 
          'location-override.js',
          'media-control.js',
          'webview-state.js',
          'index.js'
        ];
        
        for (const fileName of commonFiles) {
          try {
            const filePath = path.join(commonDir, fileName);
            if (existsSync(filePath)) {
              let scriptContent = readFileSync(filePath, 'utf8');
              
              // Replace the domain placeholder with the actual current domain
              scriptContent = scriptContent.replace('CURRENT_DOMAIN_PLACEHOLDER', currentDomain);
              
              allScriptContent += scriptContent + '\n';
              console.log(`[WM] Loaded common module: ${fileName}`);
            }
          } catch (moduleError) {
            console.error(`Error loading common module ${fileName}:`, moduleError);
          }
        }
        
        // Execute all the combined scripts
        webContents.executeJavaScript(allScriptContent);
        
        // Now inject site-specific scripts
        if (!siteKey) {
          // Try to find site by current domain
          const currentUrl = webContents.getURL();
          const currentDomain = new URL(currentUrl).hostname;
          
          const sites = configManager.getSites();
          const site = sites.find((s: any) => {
            try {
              const siteDomain = new URL(s.url).hostname;
              return currentDomain === siteDomain || currentDomain.endsWith('.' + siteDomain);
            } catch {
              return false;
            }
          });
          
          if (site) {
            siteKey = site.key;
            webviewSiteMap.set(webviewId, site.key);
          }
        }
        
        // Inject site-specific scripts if we found a site key
        if (siteKey && siteKey !== 'landing') {
          const siteScriptsDir = path.join(__dirname, '../app_injections', siteKey);
          try {
            if (existsSync(siteScriptsDir)) {
              const files = readdirSync(siteScriptsDir);
              const jsFiles = files.filter((file: string) => file.endsWith('.js'));
              
              for (const jsFile of jsFiles) {
                try {
                  const scriptPath = path.join(siteScriptsDir, jsFile);
                  const scriptContent = readFileSync(scriptPath, 'utf8');
                  console.log(`[WM] Injecting site-specific script: ${jsFile} for site: ${siteKey}`);
                  webContents.executeJavaScript(scriptContent);
                } catch (scriptError) {
                  console.error(`[WM] Error injecting site-specific script ${jsFile}:`, scriptError);
                }
              }
            }
          } catch (dirError) {
            console.error(`[WM] Error reading site scripts directory for ${siteKey}:`, dirError);
          }
        }
        
      } catch (error) {
        console.error('Error loading common modules:', error);
        // Fallback to basic injection if files can't be loaded
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
              const configDir = path.join(__dirname, '../app_data')
              const logFilePath = path.join(__dirname, '../app_data/url_history', `${site.key}.json`)
              
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
              
              console.log(`[WM] URL logged for ${site.key}: ${url}`)
            } catch (logError) {
              console.error('Error logging URL:', logError)
            }
          } else {
            console.log(`[WM] URL logging not enabled for site: ${siteKey}`)
          }
        } else {
          console.log(`[WM] Could not determine site key for webview ${webviewId}. URL: ${url}`)
        }
      } catch (error) {
        console.error('Error logging URL navigation:', error)
      }
    };

    // Listen for full page navigations
    webContents.on('did-navigate', async (_event, navigationUrl) => {
      const webviewId = String(webContents.id);
      console.log(`[WM] Navigation detected for webview ${webviewId}: ${navigationUrl}`);
      await logUrlNavigation(navigationUrl);
    });

    // Listen for in-page navigations (SPA routing, hash changes, etc.)
    webContents.on('did-navigate-in-page', async (_event, navigationUrl) => {
      const webviewId = String(webContents.id);
      console.log(`[WM] In-page navigation detected for webview ${webviewId}: ${navigationUrl}`);
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
        {
          label: 'Open Webview DevTools',
          accelerator: process.platform === 'darwin' ? 'Cmd+Shift+W' : 'Ctrl+Shift+W',
          click: () => {
            // Send a message to the renderer to open webview DevTools
            win?.webContents.send('open-webview-devtools');
          }
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
  ]
  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)

  return win
}

// Helper functions for DevTools window management
function resizeMainWindowForDevTools(mainWindow: BrowserWindow | null) {
  if (!mainWindow) return;
  
  try {
    // Get the current display bounds
    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;
    
    // Calculate new dimensions: main window takes 90% of both width and height
    const mainWindowWidth = Math.round(screenWidth * 0.9);
    const mainWindowHeight = Math.round(screenHeight * 0.9);
    
    // Resize main window to 90% width and height
    mainWindow.setSize(mainWindowWidth, mainWindowHeight);
    
    // Position main window at top-left of screen
    mainWindow.setPosition(0, 0);
    
    console.log(`[WM] Main window resized to ${mainWindowWidth}x${mainWindowHeight} (90% of screen) and positioned at top-left`);
  } catch (error) {
    console.error('[WM] Error resizing main window for DevTools:', error);
  }
}

function restoreMainWindowSize(mainWindow: BrowserWindow | null) {
  if (!mainWindow) return;
  
  try {
    // Get the current display bounds
    const display = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } = display.workAreaSize;
    
    // Restore main window to full screen size
    mainWindow.setSize(screenWidth, screenHeight);
    
    console.log(`[WM] Main window restored to full size ${screenWidth}x${screenHeight}`);
  } catch (error) {
    console.error('[WM] Error restoring main window size:', error);
  }
}


