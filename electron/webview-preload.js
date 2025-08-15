// In the webview (guest) process
const { ipcRenderer } = require("electron");

window.addEventListener("contextmenu", (e) => {
  e.preventDefault();
  // Send context menu request to the embedder with coordinates
  ipcRenderer.sendToHost("webview-context-menu", { x: e.x, y: e.y });
});

// Listen for messages from the webview content (like IXL scripts)
window.addEventListener("message", async (event) => {
  // Handle IXL session data
  if (event.data && event.data.type === "IXL_SESSION_DATA") {
    try {
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
        "🔗 Webview preload: Received success feedback request, forwarding to main process"
      );
      const result = await ipcRenderer.invoke(
        "trigger-success-feedback",
        event.data.feedbackData
      );
      console.log("🔗 Webview preload: Success feedback result:", result);

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

  // Handle IXL question completion data
  if (event.data && event.data.type === "IXL_QUESTION_COMPLETED") {
    try {
      console.log(
        "🔗 Webview preload: Received IXL question completion data, forwarding to main process"
      );
      const result = await ipcRenderer.invoke(
        "handle-ixl-question-completion",
        event.data.data
      );
      console.log(
        "🔗 Webview preload: IXL question completion result:",
        result
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
      console.error(
        "🔗 Webview preload: Error handling IXL question completion:",
        error
      );
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
