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

    // Listen for celebration triggers from webviews via postMessage
    const handleCelebrationMessage = (event: MessageEvent) => {
      if (event.data && event.data.type === "TRIGGER_CELEBRATION") {
        console.log(
          "🎉 App received celebration message from webview:",
          event.data
        );
        console.log("🎉 App: About to trigger celebration state...");
        triggerCelebration();
        console.log("🎉 App: Celebration state triggered successfully!");
      }
    };

    // Set up the listeners
    const cleanupNavigation = (window as any).ipcRenderer.onNavigationBlocked(
      handleNavigationBlocked
    );
    window.addEventListener("message", handleCelebrationMessage);

    // Cleanup function
    return () => {
      if (cleanupNavigation && typeof cleanupNavigation === "function") {
        cleanupNavigation();
      }
      window.removeEventListener("message", handleCelebrationMessage);
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
