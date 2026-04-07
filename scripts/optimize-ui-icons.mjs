import sharp from 'sharp';
import fs from 'fs/promises';
import path from 'path';

const ICON_DIR = 'src/shared/assets/ui/icons';

async function optimizeIcons() {
  const files = await fs.readdir(ICON_DIR);
  const pngs = files.filter(f => f.endsWith('.png'));

  for (const png of pngs) {
    const inputPath = path.join(ICON_DIR, png);
    const outputPath = inputPath.replace('.png', '.webp');
    
    console.log(`Optimizing ${png}...`);
    await sharp(inputPath)
      .webp({ quality: 90, effort: 6 })
      .toFile(outputPath);
    
    const oldSize = (await fs.stat(inputPath)).size;
    const newSize = (await fs.stat(outputPath)).size;
    console.log(`✅ ${png} optimized: ${(oldSize / 1024).toFixed(1)}KB -> ${(newSize / 1024).toFixed(1)}KB`);
  }
}

optimizeIcons().catch(console.error);
