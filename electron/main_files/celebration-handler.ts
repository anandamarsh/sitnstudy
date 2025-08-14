import { ipcMain, BrowserWindow } from 'electron';

// Handle celebration triggers from webviews
ipcMain.handle('trigger-celebration', async () => {
  try {
    console.log('🎉 Main process: Celebration triggered!');
    
    // Get the main window to send celebration event
    const windows = BrowserWindow.getAllWindows();
    const mainWindow = windows.find(win => win.webContents.getURL().includes('index.html'));
    
    if (mainWindow) {
      console.log('🎉 Main process: Sending celebration event to renderer');
      mainWindow.webContents.send('celebration-triggered');
      return { success: true, message: 'Celebration triggered successfully' };
    } else {
      console.warn('🎉 Main process: Main window not found');
      return { success: false, message: 'Main window not found' };
    }
  } catch (error) {
    console.error('🎉 Main process: Error triggering celebration:', error);
    return { success: false, message: 'Failed to trigger celebration' };
  }
});
