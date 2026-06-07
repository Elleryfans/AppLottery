/**
 * Scan system for installed applications
 * Reads Start Menu and App Paths registry entries
 */
const fs = require('fs');
const path = require('path');
const { app } = require('electron');

// Cache for installed apps
let cachedApps = null;

/**
 * Find .lnk files recursively in a directory
 */
function findShortcuts(dir, maxDepth) {
  if (maxDepth <= 0) return [];
  const results = [];
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory() && !entry.name.startsWith('.')) {
        results.push(...findShortcuts(fullPath, maxDepth - 1));
      } else if (entry.isFile() && entry.name.toLowerCase().endsWith('.lnk')) {
        const appName = path.basename(entry.name, '.lnk');
        // Skip uninstall and help links
        if (!appName.toLowerCase().includes('uninstall') &&
            !appName.toLowerCase().includes('help') &&
            !appName.toLowerCase().includes('readme')) {
          results.push({ name: appName, path: fullPath });
        }
      }
    }
  } catch(e) {
    // Skip inaccessible directories
  }
  return results;
}

/**
 * Get all installed apps from Start Menu directories
 */
function scanInstalledApps() {
  if (cachedApps) return cachedApps;

  const results = [];
  const startMenuDirs = [
    path.join(process.env.APPDATA || '', 'Microsoft', 'Windows', 'Start Menu', 'Programs'),
    path.join(process.env.ALLUSERSPROFILE || 'C:\\ProgramData', 'Microsoft', 'Windows', 'Start Menu', 'Programs')
  ];

  for (const dir of startMenuDirs) {
    if (fs.existsSync(dir)) {
      const shortcuts = findShortcuts(dir, 3);
      results.push(...shortcuts);
    }
  }

  // Deduplicate by name
  const seen = new Set();
  cachedApps = results.filter((a) => {
    const key = a.name.toLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });

  // Sort alphabetically
  cachedApps.sort((a, b) => a.name.localeCompare(b.name, 'zh-CN'));

  console.log('[apps-list] Found', cachedApps.length, 'installed apps');
  return cachedApps;
}

/**
 * Search installed apps by name
 */
function searchApps(query) {
  const apps = scanInstalledApps();
  if (!query || query.trim() === '') {
    return apps.slice(0, 50); // Return top 50
  }
  const q = query.toLowerCase();
  return apps
    .filter((a) => a.name.toLowerCase().includes(q))
    .slice(0, 20); // Max 20 results
}

/**
 * Extract icon for an app entry (lazy)
 */
async function getAppIcon(filePath) {
  try {
    const icon = await app.getFileIcon(filePath, { size: 'large' });
    if (!icon.isEmpty()) {
      const resized = icon.resize({ width: 128, height: 128 });
      const pngData = resized.toPNG();
      const base64 = pngData.toString('base64');
      return `data:image/png;base64,${base64}`;
    }
  } catch(e) {
    // Fall through
  }
  return null;
}

/**
 * Invalidate cache (e.g., after app install/uninstall)
 */
function invalidateCache() {
  cachedApps = null;
}

module.exports = { scanInstalledApps, searchApps, getAppIcon, invalidateCache };
