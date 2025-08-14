import { ipcRenderer, contextBridge } from 'electron'

// --------- Expose some API to the Renderer process ---------
contextBridge.exposeInMainWorld('ipcRenderer', {
  on(...args: Parameters<typeof ipcRenderer.on>) {
    const [channel, listener] = args
    return ipcRenderer.on(channel, (event, ...args) => listener(event, ...args))
  },
  off(...args: Parameters<typeof ipcRenderer.off>) {
    const [channel, ...omit] = args
    return ipcRenderer.off(channel, ...omit)
  },
  send(...args: Parameters<typeof ipcRenderer.send>) {
    const [channel, ...omit] = args
    return ipcRenderer.send(channel, ...omit)
  },
  invoke(...args: Parameters<typeof ipcRenderer.invoke>) {
    const [channel, ...omit] = args
    return ipcRenderer.invoke(channel, ...omit)
  },

  // Expose navigation-blocked event listener
  onNavigationBlocked(callback: (data: { blockedUrl: string; currentDomain: string; targetDomain: string }) => void) {
    return ipcRenderer.on('navigation-blocked', (_event, data) => callback(data))
  },

  // URL logging methods
  toggleUrlLogging: (siteKey: string, enabled: boolean) => ipcRenderer.invoke('toggle-url-logging', siteKey, enabled),
  getUrlLog: (siteKey: string) => ipcRenderer.invoke('get-url-log', siteKey),
  toggleExternalNavigation: (siteKey: string, enabled: boolean) => ipcRenderer.invoke('toggle-external-navigation', siteKey, enabled),
  toggleAddressBar: (siteKey: string, enabled: boolean) => ipcRenderer.invoke('toggle-address-bar', siteKey, enabled),

  // Config file access methods
  getConfigFiles() {
    return ipcRenderer.invoke('get-config-files')
  },

        readConfigFile(fileName: string) {
        return ipcRenderer.invoke('read-config-file', fileName)
      },

      removeUrlLogFile(appKey: string) {
        return ipcRenderer.invoke('remove-url-log-file', appKey)
      },

  // You can expose other APTs you need here.
  // ...
})

// Expose webview context menu API
contextBridge.exposeInMainWorld('electronAPI', {
  showWebviewContextMenu: (pos: { x: number; y: number }) => 
    ipcRenderer.invoke('show-webview-context-menu', pos),
  getWebviewPreloadPath: () => {
    // Always return the public path since webview-preload.js is served from there
    console.log('🔧 Returning webview preload path: /webview-preload.js')
    return '/webview-preload.js'
  },
})
