const fs = require('fs');
const path = require('path');
const { extractIcon } = require('./icon');

const MAX_APPS = 30;

/**
 * Parse a .url (Internet Shortcut) file
 */
function parseUrlFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf-8');
  const lines = content.split('\n');
  let url = '';
  let name = path.basename(filePath, '.url');

  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed.toLowerCase().startsWith('url=')) {
      url = trimmed.substring(4);
    }
    // Try to get a display name from the URL
    if (trimmed.toLowerCase().startsWith('iconfile=')) {
      const iconFile = trimmed.substring(9);
      if (iconFile) name = path.basename(iconFile, path.extname(iconFile));
    }
  }

  if (!url) {
    throw new Error('无法解析该 URL 快捷方式');
  }

  // Use URL hostname as fallback name
  if (name === path.basename(filePath, '.url')) {
    try {
      const urlObj = new URL(url);
      name = urlObj.hostname || name;
    } catch(e) {
      // Keep default name
    }
  }

  return { url, name: name || '网页链接' };
}

/**
 * Import an app to the lottery pool
 * Supports .lnk, .exe, .url
 */
async function importApp(filePath, storeService) {
  const ext = path.extname(filePath).toLowerCase();

  // Step 1: Determine name and launch target
  let launchTarget, appName;

  if (ext === '.lnk') {
    // Windows shortcut - shell.openPath resolves it automatically
    launchTarget = filePath;
    appName = path.basename(filePath, '.lnk');
  } else if (ext === '.exe') {
    launchTarget = filePath;
    appName = path.basename(filePath, '.exe');
  } else if (ext === '.url') {
    const parsed = parseUrlFile(filePath);
    launchTarget = parsed.url;
    appName = parsed.name;
  } else {
    throw new Error('不支持的文件格式，请选择 .lnk、.exe 或 .url 文件');
  }

  // Step 2: Dedup check
  const existingApps = storeService.getApps();
  const isDuplicate = existingApps.some((app) => app.path === filePath);
  if (isDuplicate) {
    throw new Error('该应用已在抽奖列表中');
  }

  // Step 3: Limit check
  if (existingApps.length >= MAX_APPS) {
    throw new Error(`已达应用数量上限（${MAX_APPS}个）`);
  }

  // Step 4: Extract icon from the FILE (not the target)
  // app.getFileIcon works on .lnk and .exe files directly
  let icon;
  try {
    icon = await extractIcon(filePath);
  } catch {
    icon = getDefaultIcon(ext);
  }

  // Step 5: Save
  const newApp = storeService.addApp({
    name: appName,
    path: launchTarget,
    icon: icon
  });

  return newApp;
}

function getDefaultIcon(ext) {
  // 1x1 cyan pixel PNG as fallback
  return 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
}

module.exports = { importApp, MAX_APPS };
