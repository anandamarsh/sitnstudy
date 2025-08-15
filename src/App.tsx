import "./App.css";
import LeftNavMenu from "./components/LeftNavMenu";
import ErrorSnackbar from "./components/ErrorSnackbar";
import CelebrationGifs from "./components/Webview/CelebrationGifs";
import { useState, useEffect } from "react";

function App() {
  const [errorSnackbar, setErrorSnackbar] = useState<{
    open: boolean;
    message: string;
    details?: string;
  }>({
    open: false,
    message: "",
  });

  const [celebrationVisible, setCelebrationVisible] = useState(false);

  useEffect(() => {
    // Listen for navigation-blocked events from main process
    const handleNavigationBlocked = (data: {
      blockedUrl: string;
      currentDomain: string;
      targetDomain: string;
    }) => {
      setErrorSnackbar({
        open: true,
        message: "Sorry! You can only visit websites within this app.",
        details: data.blockedUrl,
      });
    };

    // Listen for IXL question completion events
    const handleIxlQuestionCompleted = (completionData: any) => {
      console.log('🎉 IXL question completed in App.tsx:', completionData);
      setCelebrationVisible(true);
    };

    // Set up the listeners
    const navigationCleanup = (window as any).ipcRenderer.onNavigationBlocked(
      handleNavigationBlocked
    );
    
    const ixlCompletionCleanup = (window as any).ipcRenderer.onIxlQuestionCompleted(
      handleIxlQuestionCompleted
    );

    // Cleanup function
    return () => {
      if (navigationCleanup && typeof navigationCleanup === "function") {
        navigationCleanup();
      }
      if (ixlCompletionCleanup && typeof ixlCompletionCleanup === "function") {
        ixlCompletionCleanup();
      }
    };
  }, []);

  const handleCloseErrorSnackbar = () => {
    setErrorSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleCelebrationComplete = () => {
    setCelebrationVisible(false);
  };

  return (
    <>
      <LeftNavMenu />
      <ErrorSnackbar
        open={errorSnackbar.open}
        message={errorSnackbar.message}
        details={errorSnackbar.details}
        onClose={handleCloseErrorSnackbar}
      />
      <CelebrationGifs 
        isVisible={celebrationVisible} 
        onComplete={handleCelebrationComplete} 
      />
    </>
  );
}

export default App;
