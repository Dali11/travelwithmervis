// Resizes photos for the web.
// Put originals in photos-raw/, then run: npm run photos
// Output goes to public/photos/<same-name>.jpg (max 1600 px wide, about 80% quality).
import { readdir, mkdir } from 'node:fs/promises';
import { extname, basename, join } from 'node:path';
import sharp from 'sharp';

const IN = 'photos-raw';
const OUT = 'public/photos';
const OK = new Set(['.jpg', '.jpeg', '.png', '.webp', '.heic', '.avif']);

await mkdir(OUT, { recursive: true });
let files = [];
try {
  files = (await readdir(IN)).filter((f) => OK.has(extname(f).toLowerCase()));
} catch {
  console.log(`No ${IN}/ folder yet. Create it and put the original photos inside.`);
  process.exit(0);
}
if (files.length === 0) console.log(`No photos found in ${IN}/`);

for (const f of files) {
  const name = basename(f, extname(f));
  const out = join(OUT, `${name}.jpg`);
  await sharp(join(IN, f))
    .rotate()
    .resize({ width: 1600, withoutEnlargement: true })
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(out);
  console.log('wrote', out);
}
