import { BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import * as fs from 'fs';
import player from 'play-sound';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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
    
    // Get the main window
    const mainWindow = BrowserWindow.getAllWindows().find(win => !win.isDestroyed());
    if (!mainWindow) {
      console.error('No main window found for success feedback');
      return { success: false, message: 'No main window found' };
    }

    // Play success sound
    await playSuccessSound(feedbackData.soundFile || DEFAULT_FEEDBACK.soundFile);
    
    
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
    

    
    // Use play-sound library to actually play the audio
    player().play(audioPath, (err: any) => {
      if (err) {
        console.error('❌ Error playing audio:', err);
      } 
    });
    
  } catch (error) {
    console.error('❌ Error playing success sound:', error);
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

