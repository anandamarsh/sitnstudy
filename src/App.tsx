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

    // Set up the listener
    const cleanup = (window as any).ipcRenderer.onNavigationBlocked(
      handleNavigationBlocked
    );

    // Cleanup function
    return () => {
      if (cleanup && typeof cleanup === "function") {
        cleanup();
      }
    };
  }, []);

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
      <CelebrationGifs isVisible={true} onComplete={() => {}} />
    </>
  );
}

export default App;
