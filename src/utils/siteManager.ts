import { SiteConfig } from '../components/AppDetailsSlider/types';

// Use Electron IPC to communicate with main process
declare global {
  interface Window {
    ipcRenderer: import('electron').IpcRenderer;
  }
}

export interface AddSiteResult {
  success: boolean;
  message: string;
  iconPath?: string;
}

export interface RemoveSiteResult {
  success: boolean;
  message: string;
}

export const addNewSite = async (newSite: SiteConfig): Promise<AddSiteResult> => {
  try {
    const result = await window.ipcRenderer.invoke('add-new-site', newSite);
    return result;
  } catch (error) {
    console.error('Error adding new site:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const removeSite = async (siteKey: string): Promise<RemoveSiteResult> => {
  try {
    const result = await window.ipcRenderer.invoke('remove-site', siteKey);
    return result;
  } catch (error) {
    console.error('Error removing site:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
};

export const getAvailableSites = async (): Promise<SiteConfig[]> => {
  try {
    const sites = await window.ipcRenderer.invoke('get-available-sites');
    return sites;
  } catch (error) {
    console.error('Error reading app.json:', error);
    return [];
  }
};
