const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const iconsDir = path.join(__dirname, '..', 'public', 'icons');
if (!fs.existsSync(iconsDir)) {
  fs.mkdirSync(iconsDir, { recursive: true });
}

function getSvg(size) {
  const radius = Math.round(size * 0.22);
  const strokeWidth = Math.max(2, Math.round(size * 0.015));
  const innerRadius = Math.round(size * 0.35);
  const fontSize = Math.round(size * 0.12);
  const textY = Math.round(size * 0.82);
  const iconScale = size / 100;

  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#378b75"/>
      <stop offset="50%" stop-color="#2c7865"/>
      <stop offset="100%" stop-color="#1c5245"/>
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#ffffff"/>
      <stop offset="100%" stop-color="#fefded"/>
    </linearGradient>
    <filter id="shadow" x="-10%" y="-10%" width="120%" height="120%">
      <feDropShadow dx="0" dy="${Math.round(size * 0.03)}" stdDeviation="${Math.round(size * 0.04)}" flood-color="#0b241c" flood-opacity="0.45"/>
    </filter>
  </defs>

  <!-- Background container -->
  <rect x="${Math.round(size * 0.04)}" y="${Math.round(size * 0.04)}" width="${Math.round(size * 0.92)}" height="${Math.round(size * 0.92)}" rx="${radius}" fill="url(#bgGrad)" stroke="#fefded" stroke-opacity="0.3" stroke-width="${strokeWidth}" filter="url(#shadow)"/>

  <!-- Subtle inner dashed orbit -->
  <circle cx="${size / 2}" cy="${size * 0.44}" r="${innerRadius}" fill="none" stroke="#fefded" stroke-opacity="0.2" stroke-width="${Math.max(1, strokeWidth / 2)}" stroke-dasharray="6 6"/>

  <!-- Center Tool / Logo Group -->
  <g transform="translate(${size / 2}, ${size * 0.44}) scale(${iconScale}) translate(-50, -50)">
    <!-- Shield / Badge background -->
    <path d="M50 15 L78 28 L78 52 C78 70 50 85 50 85 C50 85 22 70 22 52 L22 28 Z" fill="#14382f" fill-opacity="0.4" stroke="#fefded" stroke-width="2"/>
    
    <!-- Stylized Wrench and Hammer in Cream/Gold -->
    <path d="M42 35 C45 32 49 32 52 35 L62 45 C64 47 64 51 61 53 L57 57 C55 59 51 59 49 57 L39 47 C37 45 37 41 39 39 Z" fill="url(#goldGrad)"/>
    <path d="M36 30 L40 26 L48 34 L44 38 Z" fill="url(#goldGrad)"/>
    <!-- Bengali 'মি' or Handyman Symbol Accent -->
    <circle cx="50" cy="50" r="6" fill="#fefded"/>
    <path d="M47 43 L53 43 L55 57 L45 57 Z" fill="#2c7865"/>
  </g>

  <!-- Brand Typography -->
  <text x="${size / 2}" y="${textY}" font-family="'Segoe UI', Roboto, 'Noto Sans', sans-serif" font-size="${fontSize}" font-weight="900" fill="#fefded" text-anchor="middle" letter-spacing="2">MISTRI</text>
  <text x="${size / 2}" y="${textY + Math.round(fontSize * 0.6)}" font-family="'Segoe UI', Roboto, 'Noto Sans', sans-serif" font-size="${Math.round(fontSize * 0.45)}" font-weight="bold" fill="#fefded" fill-opacity="0.75" text-anchor="middle">মিস্ত্রী</text>
</svg>`;
}

async function generate() {
  console.log('Generating PWA icons...');
  const svg192 = getSvg(192);
  const svg512 = getSvg(512);

  await sharp(Buffer.from(svg192)).png().toFile(path.join(iconsDir, 'icon-192x192.png'));
  await sharp(Buffer.from(svg512)).png().toFile(path.join(iconsDir, 'icon-512x512.png'));
  await sharp(Buffer.from(svg512)).png().toFile(path.join(iconsDir, 'icon-maskable-512x512.png'));
  await sharp(Buffer.from(svg192)).resize(180, 180).png().toFile(path.join(iconsDir, 'apple-touch-icon.png'));
  await sharp(Buffer.from(svg192)).resize(32, 32).png().toFile(path.join(__dirname, '..', 'public', 'favicon.png'));

  console.log('All icons generated successfully in public/icons!');

  // Also update Android App mipmap icons
  const resDir = path.join(__dirname, '..', 'mobile', 'android', 'app', 'src', 'main', 'res');
  if (fs.existsSync(resDir)) {
    const mipmaps = [
      { folder: 'mipmap-mdpi', size: 48 },
      { folder: 'mipmap-hdpi', size: 72 },
      { folder: 'mipmap-xhdpi', size: 96 },
      { folder: 'mipmap-xxhdpi', size: 144 },
      { folder: 'mipmap-xxxhdpi', size: 192 },
    ];
    for (const m of mipmaps) {
      const targetPath = path.join(resDir, m.folder, 'ic_launcher.png');
      await sharp(Buffer.from(svg512)).resize(m.size, m.size).png().toFile(targetPath);
    }
    console.log('Android mipmap icons updated successfully!');
  }
}

generate().catch(err => {
  console.error('Failed to generate icons:', err);
  process.exit(1);
});
