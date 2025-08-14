import { ipcMain, BrowserWindow } from 'electron';

// Handle celebration triggers from webviews
ipcMain.handle('trigger-celebration', async () => {
  try {
    console.log('🎉 Main process: Celebration triggered!');
    console.log('🎉 Main process: Looking for main window to send celebration event...');
    
    // Get the main window to send celebration event
    const windows = BrowserWindow.getAllWindows();
    console.log(`🎉 Main process: Found ${windows.length} total windows`);
    
    const mainWindow = windows.find(win => {
      const url = win.webContents.getURL();
      console.log(`🎉 Main process: Checking window URL: ${url}`);
      // Check for both production (index.html) and development (localhost:5173) URLs
      return url.includes('index.html') || url.includes('localhost:5173') || url.includes('127.0.0.1:5173');
    });
    
    if (mainWindow) {
      console.log('🎉 Main process: Main window found! Sending celebration event to renderer...');
      mainWindow.webContents.send('celebration-triggered');
      console.log('🎉 Main process: Celebration event sent to renderer successfully!');
      return { success: true, message: 'Celebration triggered successfully' };
    } else {
      console.warn('🎉 Main process: Main window not found - no windows contain index.html');
      console.warn('🎉 Main process: Available window URLs:', windows.map(win => win.webContents.getURL()));
      return { success: false, message: 'Main window not found' };
    }
  } catch (error) {
    console.error('🎉 Main process: Error triggering celebration:', error);
    return { success: false, message: 'Failed to trigger celebration' };
  }
});
