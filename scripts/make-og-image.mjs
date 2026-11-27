// Renders public/og-image.png (1200×630), the picture shown when a link to the
// site is shared on LINE, Facebook, Slack, X and the like.
// Run after changing the lab name or style:  node scripts/make-og-image.mjs
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const W = 1200;
const H = 630;

const icon = (await readFile('app/icon.svg', 'utf8'))
  .replace(/<!--[\s\S]*?-->/g, '')
  .replace('<svg ', '<svg x="96" y="96" width="112" height="112" ');

const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <linearGradient id="spectrum" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#7c4dff"/>
      <stop offset="0.25" stop-color="#4a63f5"/>
      <stop offset="0.5" stop-color="#2e9bff"/>
      <stop offset="0.75" stop-color="#22d3ee"/>
      <stop offset="1" stop-color="#17c7a4"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.85" cy="0.1" r="0.8">
      <stop offset="0" stop-color="#4a63f5" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#070b16" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#070b16"/>
  <rect width="${W}" height="${H}" fill="url(#glow)"/>
  ${icon}
  <text x="96" y="318" font-family="Georgia, 'Times New Roman', serif" font-size="68" fill="#f8f5ef">Novel Inorganic Materials Lab</text>
  <text x="96" y="392" font-family="'Microsoft JhengHei', 'PingFang TC', 'Noto Sans CJK TC', sans-serif" font-size="44" fill="#c3ccdb">新穎無機材料實驗室</text>
  <rect x="96" y="440" width="260" height="4" rx="2" fill="url(#spectrum)"/>
  <text x="96" y="500" font-family="'Segoe UI', Arial, sans-serif" font-size="28" fill="#8e9ab0">Graduate Institute of Photonics and Optoelectronics</text>
  <text x="96" y="540" font-family="'Segoe UI', Arial, sans-serif" font-size="28" fill="#8e9ab0">National Taiwan University</text>
</svg>`;

await writeFile('public/og-image.png', await sharp(Buffer.from(svg)).png().toBuffer());
console.log('Wrote public/og-image.png');
