import "./App.css";
import LeftNavMenu from "./components/LeftNavMenu";
import ErrorSnackbar from "./components/ErrorSnackbar";
import CelebrationGifs from "./components/CelebrationGifs";
import { useState, useEffect } from "react";
import { useCelebration } from "./hooks/useCelebration";

function App() {
  const { isCelebrating, triggerCelebration, stopCelebration } =
    useCelebration();

  const [errorSnackbar, setErrorSnackbar] = useState<{
    open: boolean;
    message: string;
    details?: string;
  }>({
    open: false,
    message: "",
  });

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

    // Listen for celebration triggers from main process via IPC
    const handleCelebrationIPC = (_event: any, celebrationData: any) => {
      console.log(
        "🎉 App received celebration event from main process via IPC:",
        celebrationData
      );
      console.log("🎉 App: About to trigger celebration state via IPC...");
      triggerCelebration();
      console.log("🎉 App: Celebration state triggered successfully via IPC!");
    };

    // Set up the listeners
    const cleanupNavigation = (window as any).ipcRenderer.onNavigationBlocked(
      handleNavigationBlocked
    );
    const cleanupCelebration = (window as any).ipcRenderer.on(
      "celebration-triggered",
      handleCelebrationIPC
    );

    // Cleanup function
    return () => {
      if (cleanupNavigation && typeof cleanupNavigation === "function") {
        cleanupNavigation();
      }
      if (cleanupCelebration && typeof cleanupCelebration === "function") {
        cleanupCelebration();
      }
    };
  }, [triggerCelebration]);

  const handleCloseErrorSnackbar = () => {
    setErrorSnackbar((prev) => ({ ...prev, open: false }));
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
      <CelebrationGifs isVisible={isCelebrating} onComplete={stopCelebration} />
    </>
  );
}

export default App;
