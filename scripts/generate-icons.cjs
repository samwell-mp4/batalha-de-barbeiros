const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const SOURCE = path.join(__dirname, '..', 'battlebarber_logo_concept2.png');
const PUBLIC = path.join(__dirname, '..', 'public');

const sizes = [
  { name: 'icon.png', size: 1248 },
  { name: 'apple-touch-icon.png', size: 180 },
  { name: 'pwa-192.png', size: 192 },
  { name: 'pwa-512.png', size: 512 },
  { name: 'favicon-16.png', size: 16 },
  { name: 'favicon-32.png', size: 32 },
];

async function generate() {
  if (!fs.existsSync(SOURCE)) {
    console.error(`[ERROR] Source not found: ${SOURCE}`);
    process.exit(1);
  }

  for (const { name, size } of sizes) {
    const outPath = path.join(PUBLIC, name);
    await sharp(SOURCE)
      .resize(size, size, { fit: 'contain', background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .png()
      .toFile(outPath);
    console.log(`  ✅ ${name} (${size}x${size})`);
  }

  // Build favicon.ico from 32x32 PNG (simple copy works for modern browsers)
  // Browsers accept PNG as favicon nowadays, but we generate a properico using the 32px png
  const favicon32 = path.join(PUBLIC, 'favicon-32.png');
  const faviconIco = path.join(PUBLIC, 'favicon.ico');
  fs.copyFileSync(favicon32, faviconIco);
  console.log(`  ✅ favicon.ico (32x32)`);

  // Cleanup intermediate PNGs
  for (const name of ['favicon-16.png', 'favicon-32.png']) {
    fs.unlinkSync(path.join(PUBLIC, name));
  }

  console.log('\n✨ All icons generated successfully!');
}

generate().catch((err) => {
  console.error('[ERROR]', err);
  process.exit(1);
});
