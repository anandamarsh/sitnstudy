/**
 * IPC Handlers Module
 * 
 * WORKS: Successfully extracted IPC handlers for renderer communication including:
 * - Site management (add, remove, get sites)
 * - URL logging functionality
 * - Configuration file access
 * - External navigation controls
 * - Address bar toggles
 * 
 * This file contains all the IPC (Inter-Process Communication) handlers
 * that allow the renderer process to communicate with the main process.
 */

import { ipcMain, Menu, BrowserWindow } from 'electron'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'

import { configManager } from './config-manager'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// IPC handlers for site management
ipcMain.handle('add-new-site', async (_event, newSite) => {
  try {
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
    
    // Add the site using the config manager
    const success = await configManager.addSite(newSite)
    
    if (!success) {
      return { 
        success: false, 
        message: `Failed to add site: ${newSite.title}. Site with key ${newSite.key} may already exist.`
      }
    }
    
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
    // Remove the site using the config manager
    const success = await configManager.removeSite(siteKey)
    
    if (!success) {
      return { 
        success: false, 
        message: `Site with key "${siteKey}" not found.` 
      }
    }
    
    // Also remove the corresponding URL history file
    try {
      const urlHistoryPath = path.join(__dirname, '../app_data/url_history', `${siteKey}.json`)
      if (existsSync(urlHistoryPath)) {
        const fs = await import('fs/promises')
        await fs.unlink(urlHistoryPath)
        console.log(`Removed URL history file for ${siteKey}: ${urlHistoryPath}`)
      }
    } catch (historyError) {
      console.error(`Error removing URL history file for ${siteKey}:`, historyError)
      // Don't fail the entire operation if history removal fails
    }
    
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
    return configManager.getSites()
  } catch (error) {
    console.error('Error reading app.json:', error)
    return []
  }
})

// IPC handlers for URL logging
ipcMain.handle('toggle-url-logging', async (_event, siteKey: string, enabled: boolean) => {
  try {
    const success = await configManager.updateUrlLogging(siteKey, enabled)
    if (success) {
      return { success: true }
    } else {
      console.error(`Site ${siteKey} not found in app.json`)
      return { success: false, error: 'Site not found' }
    }
  } catch (error) {
    console.error('Error toggling URL logging:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('toggle-external-navigation', async (_event, siteKey: string, enabled: boolean) => {
  try {
    const success = await configManager.updateExternalNavigation(siteKey, enabled)
    if (success) {
      return { success: true }
    } else {
      console.error(`Site ${siteKey} not found in app.json`)
      return { success: false, error: 'Site not found' }
    }
  } catch (error) {
    console.error('Error toggling external navigation:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('toggle-address-bar', async (_event, siteKey: string, enabled: boolean) => {
  try {
    const success = await configManager.updateAddressBar(siteKey, enabled)
    if (success) {
      return { success: true }
    } else {
      console.error(`Site ${siteKey} not found in app.json`)
      return { success: false, error: 'Site not found' }
    }
  } catch (error) {
    console.error('Error toggling address bar:', error)
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' }
  }
})

ipcMain.handle('log-url', async (_event, siteKey: string, url: string, title?: string) => {
  try {
    const configDir = path.join(__dirname, '../app_data/url_history')
    const logFilePath = path.join(__dirname, '../app_data/url_history', `${siteKey}.json`)
    
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
    const logFilePath = path.join(__dirname, '../app_data/url_history', `${siteKey}.json`)
    
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
    const configDir = path.join(__dirname, '../app_data/url_history')
    const files = await import('fs/promises')
    const filesList = await files.readdir(configDir)
    return filesList.filter(file => file.endsWith('.json'))
  } catch (error) {
    console.error('Error reading config directory:', error)
    return []
  }
})

ipcMain.handle('read-config-file', async (_event, fileName: string) => {
  try {
    const configDir = path.join(__dirname, '../app_data/url_history')
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
    const configDir = path.join(__dirname, '../app_data/url_history')
    const fs = await import('fs/promises')
    const files = await fs.readdir(configDir)
    const matchingFile = files.find(file => file.includes(appKey) && file.endsWith('.json'))
    
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

// IPC handler for webview context menu
ipcMain.handle('show-webview-context-menu', async (event, pos) => {
  try {
    const win = BrowserWindow.fromWebContents(event.sender);
    if (!win) {
      console.error('Could not find browser window for webview context menu');
      return { success: false };
    }

    const menu = Menu.buildFromTemplate([
      {
        label: 'Inspect Element',
        click: () => {
          // Open DevTools for the webview guest
          event.sender.openDevTools({ mode: 'right' });
        },
      },
      { type: 'separator' },
      { 
        label: 'Reload', 
        click: () => event.sender.reload() 
      },
      { 
        label: 'Go Back', 
        click: () => event.sender.goBack(), 
        enabled: event.sender.canGoBack() 
      },
      { 
        label: 'Go Forward', 
        click: () => event.sender.goForward(), 
        enabled: event.sender.canGoForward() 
      },
    ]);

    menu.popup({ 
      window: win, 
      x: Math.round(pos?.x ?? 0), 
      y: Math.round(pos?.y ?? 0) 
    });

    return { success: true };
  } catch (error) {
    console.error('Error showing webview context menu:', error);
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
})

// IPC handler for IXL session management
ipcMain.handle('save-ixl-session', async (_event, sessionData) => {
  try {
    const { filename, data } = sessionData;
    const sessionDir = path.join(__dirname, '../app_data/session_history/ixl');
    
    // Ensure the session directory exists
    if (!existsSync(sessionDir)) {
      mkdirSync(sessionDir, { recursive: true });
    }
    
    const filePath = path.join(sessionDir, filename);
    
    // Read existing sessions if file exists
    let sessions = [];
    if (existsSync(filePath)) {
      try {
        const existingContent = readFileSync(filePath, 'utf8');
        sessions = JSON.parse(existingContent);
      } catch (parseError) {
        console.error('Error parsing existing session file:', parseError);
        sessions = [];
      }
    }
    
    // Check if this session already exists (by sessionId)
    const existingSessionIndex = sessions.findIndex((s: any) => s.sessionId === data.sessionId);
    
    if (existingSessionIndex !== -1) {
      // Update existing session
      sessions[existingSessionIndex] = data;
      console.log(`Updated existing IXL session: ${data.sessionId}`);
    } else {
      // Add new session
      sessions.push(data);
      console.log(`Added new IXL session: ${data.sessionId}`);
    }
    
    // Write the updated sessions back to file
    writeFileSync(filePath, JSON.stringify(sessions, null, 2), 'utf8');
    
    console.log(`IXL session saved to: ${filePath}`);
    return { success: true, message: 'Session saved successfully' };
    
  } catch (error) {
    console.error('Error saving IXL session:', error);
    return { success: false, message: 'Failed to save session' };
  }
})
