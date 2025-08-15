// In the webview (guest) process
const { ipcRenderer } = require("electron");

// Listen for messages from the webview content (like IXL scripts)
window.addEventListener("message", async (event) => {
  // Handle IXL session data
  if (event.data && event.data.type === "IXL_SESSION_DATA") {
    try {
      console.log(
        "🔗 WPL: received IXL_SESSION_DATA. relaying save-ixl-session"
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
      console.error("🔗 WPL: Error saving IXL session:", error);
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
  if (event.data && event.data.type === "IXL_SUCCESS_FEEDBACK") {
    try {
      console.log(
        "🔗 WPL: received IXL_SUCCESS_FEEDBACK. relaying trigger-success-feedback"
      );
      const result = await ipcRenderer.invoke(
        "trigger-success-feedback",
        event.data.feedbackData
      );

      // Send result back to the webview content
      window.postMessage(
        {
          type: "IXL_SUCCESS_FEEDBACK_RESULT",
          result: result,
        },
        "*"
      );
    } catch (error) {
      console.error("🔗 WPL: Error triggering success feedback:", error);
      // Send error back to the webview content
      window.postMessage(
        {
          type: "IXL_SUCCESS_FEEDBACK_RESULT",
          result: { success: false, message: error.message },
        },
        "*"
      );
    }
  }

  // Handle IXL question completion data
  if (event.data && event.data.type === "IXL_QUESTION_COMPLETED") {
    try {
      console.log(
        "🔗 WPL: received IXL_QUESTION_COMPLETED. relaying handle-ixl-question-completion"
      );
      const result = await ipcRenderer.invoke(
        "handle-ixl-question-completion",
        event.data.data
      );

      // Send result back to the webview content
      window.postMessage(
        {
          type: "IXL_QUESTION_COMPLETION_RESULT",
          result: result,
        },
        "*"
      );
    } catch (error) {
      console.error("🔗 WPL: Error handling IXL question completion:", error);
      // Send error back to the webview content
      window.postMessage(
        {
          type: "IXL_QUESTION_COMPLETION_RESULT",
          result: { success: false, message: error.message },
        },
        "*"
      );
    }
  }

  // Handle IXL question completion data
  if (event.data && event.data.type === "IXL_QUESTION_COMPLETED") {
    try {
      console.log(
        "🔗 WPL: Received IXL question completion data, forwarding to main process"
      );
      const result = await ipcRenderer.invoke(
        "handle-ixl-question-completion",
        event.data.data
      );
      console.log("🔗 WPL: IXL question completion result:", result);

      // Send result back to the webview content
      window.postMessage(
        {
          type: "IXL_QUESTION_COMPLETION_RESULT",
          result: result,
        },
        "*"
      );
    } catch (error) {
      console.error("🔗 WPL: Error handling IXL question completion:", error);
      // Send error back to the webview content
      window.postMessage(
        {
          type: "IXL_QUESTION_COMPLETION_RESULT",
          result: { success: false, message: error.message },
        },
        "*"
      );
    }
  }
});

console.log("🔗 Webview preload script loaded successfully");
