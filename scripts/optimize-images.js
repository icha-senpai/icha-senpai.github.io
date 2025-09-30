const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

// Config: source images are in ./images, outputs go to ./images/optimized
const SRC_DIR = path.join(__dirname, '..', 'images');
const OUT_DIR = path.join(SRC_DIR, 'optimized');

const sizes = [320, 480, 768, 1024, 1600];

if (!fs.existsSync(OUT_DIR)) fs.mkdirSync(OUT_DIR, { recursive: true });

async function processFile(file) {
  const ext = path.extname(file).toLowerCase();
  const name = path.basename(file, ext);
  const input = path.join(SRC_DIR, file);
  if (!['.jpg', '.jpeg', '.png', '.webp', '.avif'].includes(ext)) return;

  for (const w of sizes) {
    const outBase = path.join(OUT_DIR, `${name}-${w}`);
    try {
      await sharp(input).resize({ width: w }).toFile(`${outBase}.jpg`);
      await sharp(input).resize({ width: w }).toFile(`${outBase}.webp`);
      await sharp(input).resize({ width: w }).toFile(`${outBase}.avif`);
      console.log(`wrote ${name} @ ${w}`);
    } catch (err) {
      console.error('error processing', input, err);
    }
  }
}

(async () => {
  const files = fs.readdirSync(SRC_DIR).filter(f => f !== 'optimized' && f !== 'about.txt' && !f.startsWith('.'));
  for (const f of files) await processFile(f);
  console.log('done');
})();
