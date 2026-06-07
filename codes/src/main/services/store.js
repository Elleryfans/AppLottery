const Store = require('electron-store');
const crypto = require('crypto');

const store = new Store({
  defaults: {
    apps: []
  }
});

function generateId() {
  return crypto.randomUUID();
}

function getApps() {
  return store.get('apps', []);
}

function addApp(appData) {
  const apps = getApps();
  const newApp = {
    id: generateId(),
    name: appData.name,
    path: appData.path,
    icon: appData.icon
  };
  apps.push(newApp);
  store.set('apps', apps);
  return newApp;
}

function deleteApp(id) {
  const apps = getApps();
  const filtered = apps.filter((app) => app.id !== id);
  store.set('apps', filtered);
}

function updateApp(id, updates) {
  const apps = getApps();
  const app = apps.find((a) => a.id === id);
  if (!app) return null;
  if (updates.name !== undefined) app.name = updates.name;
  if (updates.icon !== undefined) app.icon = updates.icon;
  store.set('apps', apps);
  return app;
}

function getAppCount() {
  return getApps().length;
}

module.exports = {
  getApps,
  addApp,
  deleteApp,
  updateApp,
  getAppCount
};
