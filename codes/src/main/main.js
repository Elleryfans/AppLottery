const { app, BrowserWindow, dialog, ipcMain } = require('electron');
const path = require('path');

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    frame: false,
    fullscreen: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: false,
      nodeIntegration: true,
      sandbox: false
    }
  });

  mainWindow.loadFile(path.join(__dirname, '..', 'renderer', 'index.html'));
}

// Store service
const storeService = require('./services/store');
const appsListService = require('./services/apps-list');

// IPC handlers
ipcMain.handle('get-apps', () => {
  return storeService.getApps();
});

// Search installed applications
ipcMain.handle('search-system-apps', (_event, query) => {
  return appsListService.searchApps(query);
});

// Get icon for a specific app
ipcMain.handle('get-app-icon', async (_event, filePath) => {
  return await appsListService.getAppIcon(filePath);
});

ipcMain.handle('add-app', async () => {
  const { importApp } = require('./services/import');

  console.log('[add-app] Opening file dialog...');
  const result = await dialog.showOpenDialog(mainWindow, {
    title: '选择应用程序快捷方式',
    filters: [{ name: '应用程序/快捷方式', extensions: ['lnk', 'exe', 'url'] }],
    properties: ['openFile', 'multiSelections']
  });

  console.log('[add-app] Dialog result:', JSON.stringify({ canceled: result.canceled, count: result.filePaths?.length }));

  if (result.canceled || result.filePaths.length === 0) {
    return { added: [] };
  }

  const added = [];
  const errors = [];

  for (const filePath of result.filePaths) {
    console.log('[add-app] Processing:', filePath);
    try {
      const newApp = await importApp(filePath, storeService);
      console.log('[add-app] Success:', newApp.name);
      added.push(newApp);
    } catch (err) {
      console.error('[add-app] Error:', err.message);
      errors.push({ path: filePath, message: err.message });
    }
  }

  return { added, errors };
});

ipcMain.handle('delete-app', (_event, id) => {
  storeService.deleteApp(id);
});

ipcMain.handle('update-app', (_event, id, updates) => {
  return storeService.updateApp(id, updates);
});

ipcMain.handle('launch-app', async (_event, targetPath) => {
  const { shell } = require('electron');
  if (!targetPath) return;

  if (targetPath.startsWith('http://') || targetPath.startsWith('https://')) {
    await shell.openExternal(targetPath);
  } else {
    await shell.openPath(targetPath);
  }

  if (mainWindow) mainWindow.minimize();
});

// Direct file import (for drag-and-drop)
ipcMain.handle('import-apps', async (_event, filePaths) => {
  const { importApp } = require('./services/import');
  const added = [];
  const errors = [];

  for (const filePath of filePaths) {
    console.log('[import-apps] Processing:', filePath);
    try {
      const newApp = await importApp(filePath, storeService);
      console.log('[import-apps] Success:', newApp.name);
      added.push(newApp);
    } catch (err) {
      console.error('[import-apps] Error:', err.message);
      errors.push({ path: filePath, message: err.message });
    }
  }

  return { added, errors };
});

ipcMain.handle('toggle-fullscreen', () => {
  if (mainWindow) {
    const isFullScreen = mainWindow.isFullScreen();
    mainWindow.setFullScreen(!isFullScreen);
  }
});

ipcMain.handle('exit-app', () => {
  app.quit();
});

// Only auto-start when running as main process (not during testing)
if (require.main === module) {
  app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
  });
}

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

module.exports = { createWindow };
