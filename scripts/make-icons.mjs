// Renders app/icon.svg into the raster icons browsers and phones still ask for:
//   app/favicon.ico    16, 32 and 48px (older browsers, Safari's tab bar)
//   app/apple-icon.png 180px (iOS home screen)
// Run after changing app/icon.svg:  node scripts/make-icons.mjs
import { readFile, writeFile } from 'node:fs/promises';
import sharp from 'sharp';

const svg = await readFile('app/icon.svg');
const png = (size) => sharp(svg, { density: 72 * (size / 32) * 2 }).resize(size, size).png().toBuffer();

// An ICO is a small directory header followed by PNG images.
const sizes = [16, 32, 48];
const images = await Promise.all(sizes.map(png));
const header = Buffer.alloc(6 + 16 * sizes.length);
header.writeUInt16LE(0, 0);
header.writeUInt16LE(1, 2);
header.writeUInt16LE(sizes.length, 4);
let offset = header.length;
sizes.forEach((size, i) => {
  const entry = 6 + 16 * i;
  header.writeUInt8(size, entry);
  header.writeUInt8(size, entry + 1);
  header.writeUInt16LE(1, entry + 4);
  header.writeUInt16LE(32, entry + 6);
  header.writeUInt32LE(images[i].length, entry + 8);
  header.writeUInt32LE(offset, entry + 12);
  offset += images[i].length;
});
await writeFile('app/favicon.ico', Buffer.concat([header, ...images]));

// iOS ignores transparency and rounds the corners itself, so fill the square.
const apple = await sharp(svg, { density: 72 * (180 / 32) * 2 })
  .resize(180, 180)
  .flatten({ background: '#070b16' })
  .png()
  .toBuffer();
await writeFile('app/apple-icon.png', apple);
await writeFile('scripts/icon-preview.png', await png(128));

console.log('Wrote app/favicon.ico and app/apple-icon.png');
