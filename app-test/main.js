const { app, BrowserWindow } = require('electron');
console.log('app:', typeof app);
console.log('BrowserWindow:', typeof BrowserWindow);
if (app && app.whenReady) {
  app.whenReady().then(() => {
    console.log('Electron app ready!');
    app.quit();
  });
} else {
  console.log('FAIL: Electron API not available');
}
process.exit(0);
