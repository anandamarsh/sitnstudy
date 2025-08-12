import { useState, useEffect } from 'react'
import { SiteConfig } from '../components/AppDetailsSlider/types'

// Use Electron IPC to communicate with main process
declare global {
  interface Window {
    ipcRenderer: import('electron').IpcRenderer
  }
}

export const useSites = () => {
  const [sites, setSites] = useState<SiteConfig[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSites = async () => {
    try {
      setLoading(true)
      setError(null)
      const sitesData = await window.ipcRenderer.invoke('get-available-sites')
      setSites(sitesData)
    } catch (err) {
      console.error('Error fetching sites:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch sites')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Initial fetch
    fetchSites()

    // Listen for updates from main process
    const handleSitesUpdated = (_event: any, updatedSites: SiteConfig[]) => {
      console.log('Received sites update from main process:', updatedSites)
      setSites(updatedSites)
    }

    // Set up the listener
    window.ipcRenderer.on('sites-updated', handleSitesUpdated)

    // Cleanup listener on unmount
    return () => {
      window.ipcRenderer.removeListener('sites-updated', handleSitesUpdated)
    }
  }, [])

  return {
    sites,
    loading,
    error,
    refetch: fetchSites
  }
}
