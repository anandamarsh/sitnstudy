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
      console.log("🔗 Webview preload: Received IXL session data, forwarding to main process");
      const result = await ipcRenderer.invoke("save-ixl-session", event.data.sessionData);
      console.log("🔗 Webview preload: IXL session save result:", result);
      
      // Send result back to the webview content
      window.postMessage({
        type: "IXL_SESSION_SAVE_RESULT",
        result: result
      }, "*");
    } catch (error) {
      console.error("🔗 Webview preload: Error saving IXL session:", error);
      // Send error back to the webview content
      window.postMessage({
        type: "IXL_SESSION_SAVE_RESULT",
        result: { success: false, message: error.message }
      }, "*");
    }
  }
  
  // Handle IXL session requests
  if (event.data && event.data.type === "IXL_REQUEST_SESSIONS") {
    try {
      console.log("🔗 Webview preload: Received IXL session request, forwarding to main process");
      const result = await ipcRenderer.invoke("get-ixl-sessions", event.data.filename);
      console.log("🔗 Webview preload: IXL sessions retrieved:", result);
      
      // Send result back to the webview content
      window.postMessage({
        type: "IXL_SESSIONS_RETRIEVED",
        result: result
      }, "*");
    } catch (error) {
      console.error("🔗 Webview preload: Error retrieving IXL sessions:", error);
      // Send error back to the webview content
      window.postMessage({
        type: "IXL_SESSIONS_RETRIEVED",
        result: { success: false, message: error.message, sessions: [] }
      }, "*");
    }
  }
});

console.log("🔗 Webview preload script loaded successfully");
