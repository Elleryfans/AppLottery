/**
 * Icon extraction — using Electron's app.getFileIcon()
 * Equivalent to Qt's QFileIconProvider in quick_launcher
 */
const { app } = require('electron');

async function extractIcon(filePath) {
  const icon = await app.getFileIcon(filePath, { size: 'large' });

  if (icon.isEmpty()) {
    throw new Error('Empty icon');
  }

  // Resize to 128x128 (same as quick_launcher)
  const resized = icon.resize({ width: 128, height: 128 });
  const pngBuffer = resized.toPNG();
  const base64 = pngBuffer.toString('base64');
  return `data:image/png;base64,${base64}`;
}

module.exports = { extractIcon };
