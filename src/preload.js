const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
  // Settings
  getSetting: (key) => ipcRenderer.invoke('get-setting', key),
  setSetting: (key, value) => ipcRenderer.invoke('set-setting', key, value),
  getAllSettings: () => ipcRenderer.invoke('get-all-settings'),
  
  // File dialogs
  showSaveDialog: () => ipcRenderer.invoke('show-save-dialog'),
  showFolderDialog: () => ipcRenderer.invoke('show-folder-dialog'),
  
  // Event listeners
  onOpenSettings: (callback) => ipcRenderer.on('open-settings', callback),
  onTogglePlayback: (callback) => ipcRenderer.on('toggle-playback', callback),
  onNextEpisode: (callback) => ipcRenderer.on('next-episode', callback),
  onPreviousEpisode: (callback) => ipcRenderer.on('previous-episode', callback),
  onToggleFullscreen: (callback) => ipcRenderer.on('toggle-fullscreen', callback),
  
  // Remove listeners
  removeAllListeners: (channel) => ipcRenderer.removeAllListeners(channel)
});
