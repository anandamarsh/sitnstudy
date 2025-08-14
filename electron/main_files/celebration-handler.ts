import { ipcMain, BrowserWindow } from 'electron';

// Handle celebration triggers from webviews
ipcMain.handle('trigger-celebration', async (_event, celebrationData) => {
  try {
    console.log('🎉 Main process: Celebration triggered via IPC!');
    console.log('🎉 Main process: Celebration data:', celebrationData);
    
    // Find the main window and send celebration event
    const windows = BrowserWindow.getAllWindows();
    console.log('🎉 Main process: Found', windows.length, 'total windows');
    
    for (const window of windows) {
      const url = window.webContents.getURL();
      console.log('🎉 Main process: Checking window URL:', url);
      
      // Check if this is the main app window (not a webview)
      if (url.includes('index.html') || url.includes('localhost:5173') || url.includes('127.0.0.1:5173')) {
        console.log('🎉 Main process: Found main window, sending celebration event');
        
        // Send celebration event to the renderer process
        window.webContents.send('celebration-triggered', celebrationData);
        
        console.log('🎉 Main process: Celebration event sent to main window successfully!');
        return { success: true, message: 'Celebration triggered successfully' };
      }
    }
    
    console.log('🎉 Main process: Main window not found');
    return { success: false, message: 'Main window not found' };
    
  } catch (error) {
    console.error('🎉 Main process: Error handling celebration:', error);
    return { success: false, message: (error as Error).message };
  }
});

console.log('🎉 Main process: Celebration handler loaded successfully');
