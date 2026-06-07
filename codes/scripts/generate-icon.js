/**
 * Generate a valid ICO file for AppLottery
 * Creates a cyberpunk-themed icon (dark background with neon "A" glyph)
 */
const { createCanvas } = require('canvas');
const fs = require('fs');
const path = require('path');

const SIZE = 256;
const canvas = createCanvas(SIZE, SIZE);
const ctx = canvas.getContext('2d');

// Dark background
ctx.fillStyle = '#0a0a0f';
ctx.beginPath();
ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2, 0, Math.PI * 2);
ctx.fill();

// Neon ring (cyan)
ctx.strokeStyle = '#00ffff';
ctx.lineWidth = 8;
ctx.shadowColor = '#00ffff';
ctx.shadowBlur = 20;
ctx.beginPath();
ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 12, 0, Math.PI * 2);
ctx.stroke();

// Inner ring (magenta)
ctx.strokeStyle = '#ff00ff';
ctx.shadowColor = '#ff00ff';
ctx.shadowBlur = 15;
ctx.lineWidth = 4;
ctx.beginPath();
ctx.arc(SIZE / 2, SIZE / 2, SIZE / 2 - 30, 0, Math.PI * 2);
ctx.stroke();

// "A" text
ctx.shadowColor = '#00ffff';
ctx.shadowBlur = 25;
ctx.fillStyle = '#00ffff';
ctx.font = 'bold 120px "Segoe UI", "Microsoft YaHei", sans-serif';
ctx.textAlign = 'center';
ctx.textBaseline = 'middle';
ctx.fillText('A', SIZE / 2, SIZE / 2 + 5);

// Dice icon — three dots
ctx.shadowColor = '#ff00ff';
ctx.shadowBlur = 10;
ctx.fillStyle = '#ff00ff';
const dotR = 12;
[{ x: -40, y: -50 }, { x: 40, y: -50 }, { x: 0, y: 55 }].forEach(pos => {
  ctx.beginPath();
  ctx.arc(SIZE / 2 + pos.x, SIZE / 2 + pos.y, dotR, 0, Math.PI * 2);
  ctx.fill();
});

// Save as PNG
const pngBuffer = canvas.toBuffer('image/png');

// Build ICO file (header + entry + PNG data)
const pngSize = pngBuffer.length;
const icoHeader = Buffer.alloc(6);
icoHeader.writeUInt16LE(0, 0);   // Reserved
icoHeader.writeUInt16LE(1, 2);   // Type: ICO
icoHeader.writeUInt16LE(1, 4);   // Count: 1 image

const icoEntry = Buffer.alloc(16);
icoEntry.writeUInt8(0, 0);          // Width: 0 = 256px
icoEntry.writeUInt8(0, 1);          // Height: 0 = 256px
icoEntry.writeUInt8(0, 2);          // Color palette count
icoEntry.writeUInt8(0, 3);          // Reserved
icoEntry.writeUInt16LE(1, 4);       // Color planes
icoEntry.writeUInt16LE(32, 6);      // Bits per pixel
icoEntry.writeUInt32LE(pngSize, 8); // Image size
icoEntry.writeUInt32LE(22, 12);     // Image offset (6 + 16)

const icoBuffer = Buffer.concat([icoHeader, icoEntry, pngBuffer]);

const outPath = path.join(__dirname, '..', 'assets', 'icons', 'icon.ico');
fs.writeFileSync(outPath, icoBuffer);
console.log(`ICO file generated: ${outPath} (${icoBuffer.length} bytes)`);
