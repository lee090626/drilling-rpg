import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const ICON_PATH = 'app/icon.png';
const TMP_PATH = 'app/icon_temp.png';

async function compressAppIcon() {
  const oldSize = (await fs.stat(ICON_PATH)).size;
  console.log(`Compressing app icon... Original: ${(oldSize / 1024).toFixed(1)}KB`);

  await sharp(ICON_PATH)
    .resize(512, 512) // Keep resolution
    .png({ quality: 80, palette: true }) // Fast and efficient PNG compression
    .toFile(TMP_PATH);

  const newSize = (await fs.stat(TMP_PATH)).size;
  console.log(`✅ App icon compressed: ${(newSize / 1024).toFixed(1)}KB`);

  // Replace original
  await fs.rename(TMP_PATH, ICON_PATH);
}

compressAppIcon().catch(console.error);
