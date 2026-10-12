// Downloads real elevation data for Malawi and writes public/terrain/terrain.json + terrain.bin.
// Source: AWS Terrain Tiles (Mapzen, Terrarium format), built from SRTM and other open data.
// Run once with internet access:  npm run terrain
// Optional: ZOOM=9 (default; 8 is smaller and coarser, 10 is sharper), TILE_URL=... (custom tile server).
import sharp from 'sharp';
import { mkdir, writeFile } from 'node:fs/promises';

// These four numbers and COLS/ROWS must match src/scene/terrain.ts
const BBOX = { west: 32.6, east: 36.2, south: -17.4, north: -9.0 };
const COLS = 216;
const ROWS = 504;
const Z = Number(process.env.ZOOM || 9);
const TILE_URL = process.env.TILE_URL || 'https://s3.amazonaws.com/elevation-tiles-prod/terrarium/{z}/{x}/{y}.png';

const lon2x = (lon) => ((lon + 180) / 360) * 2 ** Z;
const lat2y = (lat) => {
  const r = (lat * Math.PI) / 180;
  return ((1 - Math.log(Math.tan(r) + 1 / Math.cos(r)) / Math.PI) / 2) * 2 ** Z;
};

const x0 = Math.floor(lon2x(BBOX.west));
const x1 = Math.floor(lon2x(BBOX.east));
const y0 = Math.floor(lat2y(BBOX.north));
const y1 = Math.floor(lat2y(BBOX.south));
const nx = x1 - x0 + 1;
const ny = y1 - y0 + 1;
const W = nx * 256;
const H = ny * 256;
console.log(`Zoom ${Z}: ${nx} x ${ny} = ${nx * ny} tiles`);

const big = new Float32Array(W * H);

async function getTile(x, y) {
  const url = TILE_URL.replace('{z}', Z).replace('{x}', x).replace('{y}', y);
  for (let attempt = 1; attempt <= 4; attempt++) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const buf = Buffer.from(await res.arrayBuffer());
      const { data, info } = await sharp(buf).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
      if (info.width !== 256 || info.height !== 256) throw new Error(`unexpected tile size ${info.width}x${info.height}`);
      const ox = (x - x0) * 256;
      const oy = (y - y0) * 256;
      for (let py = 0; py < 256; py++) {
        for (let px = 0; px < 256; px++) {
          const k = (py * 256 + px) * 4;
          // Terrarium: metres = R*256 + G + B/256 - 32768
          big[(oy + py) * W + ox + px] = data[k] * 256 + data[k + 1] + data[k + 2] / 256 - 32768;
        }
      }
      return;
    } catch (err) {
      if (attempt === 4) throw new Error(`Tile ${Z}/${x}/${y} failed: ${err.message}\n${url}`);
      await new Promise((r) => setTimeout(r, 500 * attempt));
    }
  }
}

const jobs = [];
for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) jobs.push([x, y]);
let done = 0;
async function worker() {
  while (jobs.length) {
    const [x, y] = jobs.shift();
    await getTile(x, y);
    done++;
    if (done % 10 === 0 || jobs.length === 0) console.log(`  ${done} tiles`);
  }
}
await Promise.all(Array.from({ length: 6 }, worker));

// Resample to the grid the 3D scene uses. Each cell blends the average and the highest of 9 samples,
// so mountain tops are not smoothed away.
const sample = (lon, lat) => {
  const fx = Math.min(W - 1.001, Math.max(0, (lon2x(lon) - x0) * 256));
  const fy = Math.min(H - 1.001, Math.max(0, (lat2y(lat) - y0) * 256));
  const ix = Math.floor(fx);
  const iy = Math.floor(fy);
  const tx = fx - ix;
  const ty = fy - iy;
  const a = big[iy * W + ix];
  const b = big[iy * W + ix + 1];
  const c = big[(iy + 1) * W + ix];
  const d = big[(iy + 1) * W + ix + 1];
  return a + (b - a) * tx + (c - a) * ty + (a - b - c + d) * tx * ty;
};
const dLon = (BBOX.east - BBOX.west) / (COLS - 1);
const dLat = (BBOX.north - BBOX.south) / (ROWS - 1);
const out = new Uint16Array(COLS * ROWS);
let min = Infinity;
let max = -Infinity;
for (let j = 0; j < ROWS; j++) {
  const lat = BBOX.north - j * dLat;
  for (let i = 0; i < COLS; i++) {
    const lon = BBOX.west + i * dLon;
    let sum = 0;
    let top = -Infinity;
    for (let a = -1; a <= 1; a++) {
      for (let b = -1; b <= 1; b++) {
        const v = sample(lon + (a * dLon) / 3, lat + (b * dLat) / 3);
        sum += v;
        if (v > top) top = v;
      }
    }
    const h = Math.max(0, Math.min(65535, Math.round(0.6 * (sum / 9) + 0.4 * top)));
    out[j * COLS + i] = h;
    if (h < min) min = h;
    if (h > max) max = h;
  }
}

await mkdir('public/terrain', { recursive: true });
await writeFile('public/terrain/terrain.bin', Buffer.from(out.buffer));
await writeFile(
  'public/terrain/terrain.json',
  JSON.stringify({ ...BBOX, cols: COLS, rows: ROWS, zoom: Z, min, max, source: 'AWS Terrain Tiles (Mapzen), SRTM and others' }, null, 2) + '\n',
);
console.log(`Wrote public/terrain/terrain.bin (${(out.byteLength / 1024).toFixed(0)} KB). Heights ${min} to ${max} m.`);
console.log('Sanity check: the highest point should be near 3,000 m (Mulanje) and the lowest near 0 to 100 m.');
