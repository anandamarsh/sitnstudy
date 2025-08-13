// In the webview (guest) process
const { ipcRenderer } = require('electron');

window.addEventListener('contextmenu', (e) => {
  e.preventDefault();
  // Send context menu request to the embedder with coordinates
  ipcRenderer.sendToHost('webview-context-menu', { x: e.x, y: e.y });
});

console.log('🔗 Webview preload script loaded successfully');
