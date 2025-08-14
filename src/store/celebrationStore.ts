import { create } from 'zustand';

interface CelebrationState {
  isCelebrating: boolean;
  celebrationData: any | null;
  triggerCelebration: (data?: any) => void;
  stopCelebration: () => void;
}

export const useCelebrationStore = create<CelebrationState>((set) => ({
  isCelebrating: false,
  celebrationData: null,
  
  triggerCelebration: (data = null) => {
    console.log('🎉 Global celebration store: triggerCelebration called with data:', data);
    set({ 
      isCelebrating: true, 
      celebrationData: data 
    });
    console.log('🎉 Global celebration store: State updated, isCelebrating set to true');
  },
  
  stopCelebration: () => {
    console.log('🎉 Global celebration store: stopCelebration called');
    set({ 
      isCelebrating: false, 
      celebrationData: null 
    });
    console.log('🎉 Global celebration store: State updated, isCelebrating set to false');
  },
}));
