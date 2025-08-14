import { useState, useCallback } from 'react';

export const useCelebration = () => {
  const [isCelebrating, setIsCelebrating] = useState(false);

  const triggerCelebration = useCallback(() => {
    console.log('🎉 useCelebration: triggerCelebration called!');
    console.log('🎉 useCelebration: Setting isCelebrating to true...');
    setIsCelebrating(true);
    console.log('🎉 useCelebration: isCelebrating set to true successfully!');
  }, []);

  const stopCelebration = useCallback(() => {
    console.log('🎉 useCelebration: stopCelebration called!');
    console.log('🎉 useCelebration: Setting isCelebrating to false...');
    setIsCelebrating(false);
    console.log('🎉 useCelebration: isCelebrating set to false successfully!');
  }, []);

  return {
    isCelebrating,
    triggerCelebration,
    stopCelebration
  };
};
