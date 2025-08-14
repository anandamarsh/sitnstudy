import { useState, useCallback } from 'react';

export const useCelebration = () => {
  const [isCelebrating, setIsCelebrating] = useState(false);

  const triggerCelebration = useCallback(() => {
    console.log('🎉 Triggering celebration!');
    setIsCelebrating(true);
  }, []);

  const stopCelebration = useCallback(() => {
    console.log('🎉 Celebration completed');
    setIsCelebrating(false);
  }, []);

  return {
    isCelebrating,
    triggerCelebration,
    stopCelebration
  };
};
