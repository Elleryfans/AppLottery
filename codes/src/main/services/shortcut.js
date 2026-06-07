const lnk = require('lnk');
const path = require('path');

/**
 * Parse a Windows .lnk shortcut file
 * @param {string} lnkPath - Path to the .lnk file
 * @returns {Promise<{targetPath: string, appName: string}>}
 */
async function parseShortcut(lnkPath) {
  try {
    const result = await lnk(lnkPath);

    if (!result || !result.target) {
      throw new Error('无法解析该快捷方式');
    }

    const targetPath = result.target;
    const appName = path.basename(targetPath, path.extname(targetPath));

    return { targetPath, appName };
  } catch (originalErr) {
    throw new Error('无法解析该快捷方式', { cause: originalErr });
  }
}

module.exports = { parseShortcut };
