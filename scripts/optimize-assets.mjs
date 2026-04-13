import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import { glob } from 'glob'; // We will use manual recursion to avoid glob dependency just in case

const TARGET_DIRS = ['src/shared/assets'];

async function walk(dir) {
  let results = [];
  try {
    const list = await fs.readdir(dir);
    for (let file of list) {
      const filePath = path.resolve(dir, file);
      const stat = await fs.stat(filePath);
      if (stat && stat.isDirectory()) {
        results = results.concat(await walk(filePath));
      } else if (file.endsWith('.png') || file.endsWith('.jpg') || file.endsWith('.jpeg')) {
        results.push(filePath);
      }
    }
  } catch (e) {
    // maybe dir not found, skip
  }
  return results;
}

async function optimizeImages() {
  console.log('Starting image asset optimization...');
  let totalSaved = 0;
  let fileCount = 0;

  for (const dir of TARGET_DIRS) {
    const files = await walk(path.join(process.cwd(), dir));
    for (const file of files) {
      try {
        const stats = await fs.stat(file);
        const originalSize = stats.size;

        const img = sharp(file);
        const metadata = await img.metadata();

        let shouldProcess = false;
        let chain = img;

        // Resize if too large
        if (metadata.width > 256 || metadata.height > 256) {
          chain = chain.resize({ width: 256, height: 256, fit: 'inside' });
          shouldProcess = true;
        }

        // Even if not resized, compress if it's over 100KB
        if (shouldProcess || originalSize > 100000) {
          const buffer = await chain
            .png({ palette: true, quality: 80, compressionLevel: 9 })
            .toBuffer();
          const newSize = buffer.length;

          if (newSize < originalSize) {
            await fs.writeFile(file, buffer);
            const savedKb = ((originalSize - newSize) / 1024).toFixed(1);
            console.log(`[OPTIMIZED] ${path.basename(file)}: saved ${savedKb} KB`);
            totalSaved += originalSize - newSize;
            fileCount++;
          }
        }
      } catch (err) {
        console.error(`Error processing ${file}:`, err);
      }
    }
  }

  console.log('---');
  console.log(`Optimization Complete!`);
  console.log(`Processed ${fileCount} files.`);
  console.log(`Total space saved: ${(totalSaved / 1024 / 1024).toFixed(2)} MB`);
}

optimizeImages();
