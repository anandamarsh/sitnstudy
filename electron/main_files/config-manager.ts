/**
 * Configuration Manager Module
 * 
 * WORKS: Provides real-time access to site configurations and manages
 * preference changes without requiring webview reloads.
 * 
 * This file handles site configuration management including:
 * - Real-time configuration access
 * - Preference change notifications
 * - Configuration caching for performance
 */

import path from 'node:path'
import { readFileSync, existsSync } from 'fs'
import { promises as fs } from 'fs'

const __dirname = path.dirname(new URL(import.meta.url).pathname)

interface Site {
  key: string
  title: string
  url: string
  iconPath?: string
  iconType?: string
  iconName?: string
  iconProps?: any
  description: string
  urlLogging?: boolean
  allowExternalNavigation?: boolean
  showAddressBar?: boolean
}

class ConfigManager {
  private configPath: string
  private sites: Site[] = []
  private listeners: Array<(sites: Site[]) => void> = []

  constructor() {
    this.configPath = path.join(__dirname, '../app_data/app.json')
    this.loadConfig()
  }

  private loadConfig() {
    try {
      if (existsSync(this.configPath)) {
        const content = readFileSync(this.configPath, 'utf8')
        this.sites = JSON.parse(content)
      } else {
        this.sites = []
      }
    } catch (error) {
      console.error('Error loading site configuration:', error)
      this.sites = []
    }
  }

  private async saveConfig() {
    try {
      await fs.writeFile(this.configPath, JSON.stringify(this.sites, null, 2))
    } catch (error) {
      console.error('Error saving site configuration:', error)
      throw error
    }
  }

  private async notifyListeners() {
    this.listeners.forEach(listener => listener([...this.sites]))
    
    // Also broadcast to all renderer processes
    try {
      const { BrowserWindow } = await import('electron')
      const windows = BrowserWindow.getAllWindows()
      windows.forEach((window: any) => {
        if (!window.isDestroyed()) {
          console.log(`Broadcasting sites-updated to window: ${window.id}`)
          window.webContents.send('sites-updated', [...this.sites])
        }
      })
    } catch (error) {
      console.error('Error broadcasting to renderer processes:', error)
    }
  }

  // Get all sites
  getSites(): Site[] {
    return [...this.sites]
  }

  // Get a specific site by key
  getSite(siteKey: string): Site | undefined {
    return this.sites.find(site => site.key === siteKey)
  }

  // Add a new site
  async addSite(newSite: Site): Promise<boolean> {
    try {
      // Check if site with same key already exists
      if (this.sites.find(site => site.key === newSite.key)) {
        console.error(`Site with key ${newSite.key} already exists`)
        return false
      }
      
      this.sites.push(newSite)
      await this.saveConfig()
      await this.notifyListeners()
      
      console.log(`Added new site: ${newSite.title} (${newSite.key})`)
      return true
    } catch (error) {
      console.error('Error adding new site:', error)
      return false
    }
  }

  // Remove a site
  async removeSite(siteKey: string): Promise<boolean> {
    try {
      const siteIndex = this.sites.findIndex(site => site.key === siteKey)
      if (siteIndex === -1) {
        console.error(`Site with key ${siteKey} not found`)
        return false
      }
      
      this.sites.splice(siteIndex, 1)
      await this.saveConfig()
      await this.notifyListeners()
      
      console.log(`Removed site: ${siteKey}`)
      return true
    } catch (error) {
      console.error('Error removing site:', error)
      return false
    }
  }

  // Update external navigation preference
  async updateExternalNavigation(siteKey: string, enabled: boolean): Promise<boolean> {
    const siteIndex = this.sites.findIndex(site => site.key === siteKey)
    if (siteIndex === -1) {
      return false
    }

    this.sites[siteIndex].allowExternalNavigation = enabled
    await this.saveConfig()
    await this.notifyListeners()
    
    console.log(`Updated external navigation for ${siteKey} to ${enabled}`)
    return true
  }

  // Update address bar preference
  async updateAddressBar(siteKey: string, enabled: boolean): Promise<boolean> {
    const siteIndex = this.sites.findIndex(site => site.key === siteKey)
    if (siteIndex === -1)
    {
      return false
    }

    this.sites[siteIndex].showAddressBar = enabled
    await this.saveConfig()
    await this.notifyListeners()
    
    console.log(`Updated address bar for ${siteKey} to ${enabled}`)
    return true
  }

  // Update URL logging preference
  async updateUrlLogging(siteKey: string, enabled: boolean): Promise<boolean> {
    const siteIndex = this.sites.findIndex(site => site.key === siteKey)
    if (siteIndex === -1) {
      return false
    }

    this.sites[siteIndex].urlLogging = enabled
    await this.saveConfig()
    await this.notifyListeners()
    
    console.log(`Updated URL logging for ${siteKey} to ${enabled}`)
    return true
  }

  // Add a listener for configuration changes
  addListener(listener: (sites: Site[]) => void) {
    this.listeners.push(listener)
  }

  // Remove a listener
  removeListener(listener: (sites: Site[]) => void) {
    const index = this.listeners.indexOf(listener)
    if (index > -1) {
      this.listeners.splice(index, 1)
    }
  }

  // Refresh configuration from file
  refreshConfig() {
    this.loadConfig()
    this.notifyListeners()
  }
}

// Export a singleton instance
export const configManager = new ConfigManager()
