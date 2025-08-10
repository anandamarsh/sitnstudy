import { SiteConfig } from '../components/AppDetailsSlider/types';

// Use Electron IPC to communicate with main process
declare global {
  interface Window {
    ipcRenderer: import('electron').IpcRenderer;
  }
}

export const addNewSite = async (newSite: SiteConfig): Promise<{ success: boolean; message: string; iconPath?: string }> => {
  try {
    const result = await window.ipcRenderer.invoke('add-new-site', newSite);
    return result;
  } catch (error) {
    console.error('Error adding new site:', error);
    throw new Error('Failed to add new site to availableSites.json');
  }
};

export const getAvailableSites = async (): Promise<SiteConfig[]> => {
  try {
    const sites = await window.ipcRenderer.invoke('get-available-sites');
    return sites;
  } catch (error) {
    console.error('Error reading availableSites.json:', error);
    return [];
  }
};
