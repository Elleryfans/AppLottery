// preload.js — Electron preload script
// Since contextIsolation: false, we set API directly on window
const { ipcRenderer } = require('electron');

window.electronAPI = {
  getApps: () => ipcRenderer.invoke('get-apps'),
  addApp: () => ipcRenderer.invoke('add-app'),
  importApps: (paths) => ipcRenderer.invoke('import-apps', paths),
  deleteApp: (id) => ipcRenderer.invoke('delete-app', id),
  updateApp: (id, updates) => ipcRenderer.invoke('update-app', id, updates),
  launchApp: (path) => ipcRenderer.invoke('launch-app', path),
  toggleFullscreen: () => ipcRenderer.invoke('toggle-fullscreen'),
  exitApp: () => ipcRenderer.invoke('exit-app'),
  searchSystemApps: (query) => ipcRenderer.invoke('search-system-apps', query),
  getAppIcon: (filePath) => ipcRenderer.invoke('get-app-icon', filePath)
};
