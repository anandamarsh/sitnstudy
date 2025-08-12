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

import { ipcMain } from 'electron'
import path from 'node:path'
import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs'
import { promises as fs } from 'fs'

// IPC handlers for site management
ipcMain.handle('add-new-site', async (_event, newSite) => {
  try {
    const availableSitesPath = path.join(__dirname, '../src/app_data/app.json')
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
    const availableSitesPath = path.join(__dirname, '../src/app_data/app.json')
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
    const availableSitesPath = path.join(__dirname, '../src/app_data/app.json')
    const content = readFileSync(availableSitesPath, 'utf8')
    return JSON.parse(content)
  } catch (error) {
    console.error('Error reading app.json:', error)
    return []
  }
})

// IPC handlers for URL logging
ipcMain.handle('toggle-url-logging', async (_event, siteKey: string, enabled: boolean) => {
  try {
    const configDir = path.join(__dirname, '..', 'src', 'app_data')
    const availableSitesPath = path.join(configDir, 'app.json')
    
    // Read current app.json
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
    const configDir = path.join(__dirname, '..', 'src', 'app_data')
    const availableSitesPath = path.join(configDir, 'app.json')
    
    // Read current app.json
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
    const configDir = path.join(__dirname, '..', 'src', 'app_data')
    const availableSitesPath = path.join(configDir, 'app.json')
    
    // Read current app.json
    const currentContent = await fs.readFile(availableSitesPath, 'utf-8')
    const availableSites = JSON.parse(currentContent)
    
    // Find and update the site
    const siteIndex = availableSites.findIndex((site: any) => site.key === siteKey)
    if (siteIndex !== -1) {
      availableSites[siteIndex].showAddressBar = enabled
      
      // Write back to file
      await fs.writeFile(availableSitesPath, JSON.stringify(availableSites, null, 2))
      console.log(`Updated address bar for ${siteKey} to ${enabled}`)
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
    const configDir = path.join(__dirname, '../src/app_data')
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
    const logFilePath = path.join(__dirname, '../src/app_data', `${siteKey}_urls.json`)
    
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
    const configDir = path.join(__dirname, '../src/app_data')
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
    const configDir = path.join(__dirname, '../src/app_data')
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
    const configDir = path.join(__dirname, '../src/app_data')
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
