import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';

// Success feedback types that web apps can trigger
export interface SuccessFeedbackData {
  type: 'ixl_completion' | 'quiz_completion' | 'achievement' | 'custom';
  title?: string;
  message?: string;
  imageUrl?: string;
  soundFile?: string;
  duration?: number; // How long to show the feedback
  data?: any; // Additional data specific to the feedback type
}

// Default success feedback configuration
const DEFAULT_FEEDBACK = {
  soundFile: 'success.mp3',
  duration: 3000, // 3 seconds
  volume: 0.6
};

// IPC handler for success feedback
ipcMain.handle('trigger-success-feedback', async (_event, feedbackData: SuccessFeedbackData) => {
  try {
    console.log('🎉 Success feedback triggered:', feedbackData);
    
    // Get the main window
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (!mainWindow) {
      console.error('No main window found for success feedback');
      return { success: false, message: 'No main window found' };
    }

    // Play success sound
    await playSuccessSound(feedbackData.soundFile || DEFAULT_FEEDBACK.soundFile);
    
    // Show success notification (future enhancement)
    await showSuccessNotification(mainWindow, feedbackData);
    
    console.log('🎉 Success feedback completed successfully');
    return { success: true, message: 'Success feedback triggered' };
    
  } catch (error) {
    console.error('Error triggering success feedback:', error);
    return { success: false, message: error instanceof Error ? error.message : 'Unknown error' };
  }
});

// Function to play success sound
async function playSuccessSound(soundFile: string): Promise<void> {
  try {
    const audioPath = path.join(__dirname, '../public/audio', soundFile);
    
    // Check if audio file exists
    if (!fs.existsSync(audioPath)) {
      console.warn(`Audio file not found: ${audioPath}`);
      return;
    }
    
    // For now, we'll use a simple approach
    // In the future, we could use native audio libraries for better control
    console.log(`🔊 Playing success sound: ${soundFile}`);
    
    // Note: In a real implementation, you might want to use a native audio library
    // like 'play-sound' or similar for better cross-platform audio support
    
  } catch (error) {
    console.error('Error playing success sound:', error);
  }
}

// Function to show success notification
async function showSuccessNotification(mainWindow: BrowserWindow, feedbackData: SuccessFeedbackData): Promise<void> {
  try {
    // Send notification data to the renderer process
    mainWindow.webContents.send('show-success-notification', {
      type: feedbackData.type,
      title: feedbackData.title || 'Success!',
      message: feedbackData.message || 'Great job!',
      imageUrl: feedbackData.imageUrl,
      duration: feedbackData.duration || DEFAULT_FEEDBACK.duration,
      data: feedbackData.data
    });
    
    console.log('📱 Success notification sent to renderer');
    
  } catch (error) {
    console.error('Error showing success notification:', error);
  }
}

// Function to get available sound files
export function getAvailableSounds(): string[] {
  try {
    const audioDir = path.join(__dirname, '../public/audio');
    if (!fs.existsSync(audioDir)) {
      return [];
    }
    
    const files = fs.readdirSync(audioDir);
    return files.filter(file => file.endsWith('.mp3') || file.endsWith('.wav'));
  } catch (error) {
    console.error('Error getting available sounds:', error);
    return [];
  }
}

console.log('🎉 Success feedback system initialized');
