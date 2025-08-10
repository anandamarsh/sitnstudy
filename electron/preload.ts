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
  toggleUrlLogging(siteKey: string, enabled: boolean) {
    return ipcRenderer.invoke('toggle-url-logging', siteKey, enabled)
  },

  getUrlLog(siteKey: string) {
    return ipcRenderer.invoke('get-url-log', siteKey)
  },

  // You can expose other APTs you need here.
  // ...
})
