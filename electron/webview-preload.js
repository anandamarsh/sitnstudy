// In the webview (guest) process
const { ipcRenderer } = require("electron");

// Listen for messages from the webview content (like IXL scripts)
window.addEventListener("message", async (event) => {
  // Handle IXL session data
  if (event.data && event.data.type === "IXL_SESSION_DATA") {
    try {
      console.log(
        "🔗 Webview preload: received IXL_SESSION_DATA. relaying save-ixl-session"
      );
      const result = await ipcRenderer.invoke(
        "save-ixl-session",
        event.data.sessionData
      );

      // Send result back to the webview content
      window.postMessage(
        {
          type: "IXL_SESSION_SAVE_RESULT",
          result: result,
        },
        "*"
      );
    } catch (error) {
      console.error("🔗 Webview preload: Error saving IXL session:", error);
      // Send error back to the webview content
      window.postMessage(
        {
          type: "IXL_SESSION_SAVE_RESULT",
          result: { success: false, message: error.message },
        },
        "*"
      );
    }
  }

  // Handle success feedback requests
  if (event.data && event.data.type === "SUCCESS_FEEDBACK") {
    try {
      console.log(
        "🔗 Webview preload: received SUCCESS_FEEDBACK. relaying trigger-success-feedback"
      );
      const result = await ipcRenderer.invoke(
        "trigger-success-feedback",
        event.data.feedbackData
      );

      // Send result back to the webview content
      window.postMessage(
        {
          type: "SUCCESS_FEEDBACK_RESULT",
          result: result,
        },
        "*"
      );
    } catch (error) {
      console.error(
        "🔗 Webview preload: Error triggering success feedback:",
        error
      );
      // Send error back to the webview content
      window.postMessage(
        {
          type: "SUCCESS_FEEDBACK_RESULT",
          result: { success: false, message: error.message },
        },
        "*"
      );
    }
  }
});

console.log("🔗 Webview preload script loaded successfully");
