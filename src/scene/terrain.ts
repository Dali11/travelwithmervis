import * as THREE from 'three';
import { COUNTRY, LAKE, type LonLat } from './geo';

// ---- World scale -----------------------------------------------------------
// 1 degree = 20 world units. 1 unit = about 5.55 km. Heights are exaggerated 6x so relief reads.
export const BBOX = { west: 32.6, east: 36.2, south: -17.4, north: -9.0 };
export const COLS = 216;
export const ROWS = 504;
const LON0 = 34.4;
const LAT0 = -13.2;
const UNITS_PER_DEG = 20;
const COSL = 0.973;
const KM_PER_UNIT = 5.55;
const M_PER_UNIT = 5550;
export const V_EXAG = 6;
export const LAKE_M = 474; // Lake Malawi surface, metres above sea level
export const EDGE_M = 350; // height of the flat plain around the map
const EDGE_CELLS = 5;

export type XZ = [number, number];

/** lon/lat to world [x, z]. North is -z. */
export const project = (lon: number, lat: number): XZ => [(lon - LON0) * UNITS_PER_DEG * COSL, -(lat - LAT0) * UNITS_PER_DEG];
export const elevToY = (m: number): number => (m / M_PER_UNIT) * V_EXAG;
export const LAKE_Y = elevToY(LAKE_M);
export const toWorld = (poly: LonLat[]): XZ[] => poly.map(([lo, la]) => project(lo, la));

const X0 = project(BBOX.west, 0)[0];
const Z0 = project(0, BBOX.north)[1];
const DX = ((BBOX.east - BBOX.west) / (COLS - 1)) * UNITS_PER_DEG * COSL;
const DZ = ((BBOX.north - BBOX.south) / (ROWS - 1)) * UNITS_PER_DEG;

// ---- Polygon helpers (world units) ------------------------------------------
export function inPoly(x: number, z: number, poly: XZ[]): boolean {
  let inside = false;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [xi, zi] = poly[i];
    const [xj, zj] = poly[j];
    if (zi > z !== zj > z && x < ((xj - xi) * (z - zi)) / (zj - zi) + xi) inside = !inside;
  }
  return inside;
}

/** Distance from a point to the polygon outline, in kilometres. */
export function distToPolyKm(x: number, z: number, poly: XZ[]): number {
  let best = Infinity;
  for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
    const [ax, az] = poly[j];
    const [bx, bz] = poly[i];
    const dx = bx - ax;
    const dz = bz - az;
    const len2 = dx * dx + dz * dz || 1e-12;
    const t = Math.max(0, Math.min(1, ((x - ax) * dx + (z - az) * dz) / len2));
    const px = ax + t * dx - x;
    const pz = az + t * dz - z;
    const d = px * px + pz * pz;
    if (d < best) best = d;
  }
  return Math.sqrt(best) * KM_PER_UNIT;
}

/** 1 for grid cells inside the polygon. Scans row by row, so it is fast. */
function maskGrid(poly: XZ[]): Uint8Array {
  const mask = new Uint8Array(COLS * ROWS);
  for (let j = 0; j < ROWS; j++) {
    const z = Z0 + j * DZ;
    const xs: number[] = [];
    for (let a = 0, b = poly.length - 1; a < poly.length; b = a++) {
      const [x1, z1] = poly[b];
      const [x2, z2] = poly[a];
      if (z1 > z !== z2 > z) xs.push(x1 + ((z - z1) * (x2 - x1)) / (z2 - z1));
    }
    xs.sort((p, q) => p - q);
    for (let k = 0; k + 1 < xs.length; k += 2) {
      const i0 = Math.max(0, Math.ceil((xs[k] - X0) / DX));
      const i1 = Math.min(COLS - 1, Math.floor((xs[k + 1] - X0) / DX));
      for (let i = i0; i <= i1; i++) mask[j * COLS + i] = 1;
    }
  }
  return mask;
}

// ---- Estimated heights (used when no real elevation data is installed) -------
function hash2(x: number, y: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return s - Math.floor(s);
}
function vnoise(x: number, y: number): number {
  const xi = Math.floor(x);
  const yi = Math.floor(y);
  const fx = x - xi;
  const fy = y - yi;
  const u = fx * fx * (3 - 2 * fx);
  const v = fy * fy * (3 - 2 * fy);
  const a = hash2(xi, yi);
  const b = hash2(xi + 1, yi);
  const c = hash2(xi, yi + 1);
  const d = hash2(xi + 1, yi + 1);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
}
const fbm = (x: number, y: number): number => vnoise(x, y) * 0.55 + vnoise(x * 2.1, y * 2.1) * 0.3 + vnoise(x * 4.3, y * 4.3) * 0.15;

// [lon, lat, summit metres, radius km]
const PEAKS: Array<[number, number, number, number]> = [
  [35.57, -16.0, 3002, 14], // Mulanje
  [35.32, -15.35, 2087, 11], // Zomba
  [33.88, -10.6, 2605, 30], // Nyika
  [34.0, -11.7, 1950, 22], // Viphya
  [34.25, -14.3, 2198, 12], // Dedza
  [35.2, -15.7, 1773, 8], // Chiradzulu
  [35.1, -16.1, 1400, 12], // Thyolo
  [33.75, -9.75, 1800, 20], // Misuku
  [34.0, -13.4, 1700, 15], // Ntchisi
];
const SHIRE: LonLat[] = [[35.25, -14.4], [35.22, -15.0], [35.05, -15.5], [34.85, -16.0], [35.0, -16.6], [35.25, -16.95]];
const riverMetres = (lat: number): number => (lat > -15.2 ? 470 : Math.max(60, 470 - (-15.2 - lat) * 500));

function estimateHeight(lon: number, lat: number, lakeKm: number): number {
  let base = 1050 + (fbm(lon * 2.2, lat * 2.2) - 0.5) * 320;
  if (lon > 35.0) base -= Math.min(650, (lon - 35.0) * 520);
  if (lat < -15.3) base -= Math.min(450, (-15.3 - lat) * 260);
  let e = Math.min(base, LAKE_M + 22 * lakeKm); // the rift valley walls
  // Shire valley south of the lake
  const kx = 108.4;
  const ky = 110.6;
  let shireKm = Infinity;
  for (let s = 0; s + 1 < SHIRE.length; s++) {
    const [x1, y1] = SHIRE[s];
    const [x2, y2] = SHIRE[s + 1];
    const dx = (x2 - x1) * kx;
    const dy = (y2 - y1) * ky;
    const len2 = dx * dx + dy * dy;
    const t = Math.max(0, Math.min(1, (((lon - x1) * kx) * dx + ((lat - y1) * ky) * dy) / len2));
    const d = Math.hypot((lon - x1) * kx - t * dx, (lat - y1) * ky - t * dy);
    if (d < shireKm) shireKm = d;
  }
  e = Math.min(e, riverMetres(lat) + 45 * shireKm);
  for (const [plon, plat, top, sigma] of PEAKS) {
    const d = Math.hypot((lon - plon) * kx, (lat - plat) * ky);
    if (top > e) e += (top - e) * Math.exp(-((d / sigma) ** 2)); // blend the local ground up to the summit
  }
  return e;
}

async function loadElevation(): Promise<Float32Array | null> {
  try {
    const base = import.meta.env.BASE_URL;
    const meta = (await (await fetch(base + 'terrain/terrain.json')).json()) as { cols: number; rows: number };
    if (meta.cols !== COLS || meta.rows !== ROWS) return null;
    const res = await fetch(base + 'terrain/terrain.bin');
    if (!res.ok) return null;
    const u16 = new Uint16Array(await res.arrayBuffer());
    return u16.length === COLS * ROWS ? Float32Array.from(u16) : null;
  } catch {
    return null; // dev servers answer missing files with a web page; that lands here too
  }
}

// ---- Terrain ------------------------------------------------------------------
export interface Terrain {
  mesh: THREE.Mesh;
  /** True when real elevation data was loaded, false when estimated. */
  real: boolean;
  /** World y of the ground at x, z. */
  heightY(x: number, z: number): number;
  /** Highest world y within radius r (world units) of x, z. */
  maxWithin(x: number, z: number, r: number): number;
}

const smooth = (a: number, b: number, x: number): number => {
  const t = Math.max(0, Math.min(1, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const mixC = (a: number[], b: number[], t: number): number[] => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t];
const hexC = (h: number): number[] => [((h >> 16) & 255) / 255, ((h >> 8) & 255) / 255, (h & 255) / 255];

export async function createTerrain(): Promise<Terrain> {
  const lakeW = toWorld(LAKE);
  const countryW = toWorld(COUNTRY);
  const lakeMask = maskGrid(lakeW);
  const countryMask = maskGrid(countryW);

  // Distance to the lake shore (km) for cells near the lake
  const lakeKm = new Float32Array(COLS * ROWS).fill(Infinity);
  let lx0 = Infinity, lx1 = -Infinity, lz0 = Infinity, lz1 = -Infinity;
  lakeW.forEach(([x, z]) => {
    lx0 = Math.min(lx0, x); lx1 = Math.max(lx1, x); lz0 = Math.min(lz0, z); lz1 = Math.max(lz1, z);
  });
  const pad = 16; // world units (about 90 km)
  const iA = Math.max(0, Math.floor((lx0 - pad - X0) / DX));
  const iB = Math.min(COLS - 1, Math.ceil((lx1 + pad - X0) / DX));
  const jA = Math.max(0, Math.floor((lz0 - pad - Z0) / DZ));
  const jB = Math.min(ROWS - 1, Math.ceil((lz1 + pad - Z0) / DZ));
  for (let j = jA; j <= jB; j++) {
    for (let i = iA; i <= iB; i++) lakeKm[j * COLS + i] = distToPolyKm(X0 + i * DX, Z0 + j * DZ, lakeW);
  }

  // Heights in metres: real data if present, otherwise an estimate from known landmarks
  const dem = await loadElevation();
  const real = dem !== null;
  const metres = dem ?? new Float32Array(COLS * ROWS);
  if (!dem) {
    for (let j = 0; j < ROWS; j++) {
      const lat = BBOX.north - (j * (BBOX.north - BBOX.south)) / (ROWS - 1);
      for (let i = 0; i < COLS; i++) {
        const lon = BBOX.west + (i * (BBOX.east - BBOX.west)) / (COLS - 1);
        metres[j * COLS + i] = estimateHeight(lon, lat, lakeKm[j * COLS + i]);
      }
    }
  }
  // Fade the outer edge down to a flat plain, so the map has no visible rectangle edge
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const f = smooth(0, EDGE_CELLS, Math.min(i, j, COLS - 1 - i, ROWS - 1 - j));
      if (f < 1) metres[j * COLS + i] = EDGE_M + (metres[j * COLS + i] - EDGE_M) * f;
    }
  }
  // Carve the lake bed so the water has depth
  for (let k = 0; k < metres.length; k++) {
    if (lakeMask[k]) metres[k] = LAKE_M - Math.min(380, 11 * lakeKm[k]);
  }

  // Mesh
  const ys = new Float32Array(COLS * ROWS);
  for (let k = 0; k < ys.length; k++) ys[k] = elevToY(metres[k]);
  const pos = new Float32Array(COLS * ROWS * 3);
  const col = new Float32Array(COLS * ROWS * 3);
  const rock = hexC(0x8a8f86);
  const lowland = hexC(0x9bb067);
  const midland = hexC(0x63a566);
  const highland = hexC(0x3f8658);
  const summit = hexC(0x7f8d7a);
  const neighbour = hexC(0xb4b99d);
  const sand = hexC(0xe6d9a8);
  const bed = hexC(0x1a6f86);
  for (let j = 0; j < ROWS; j++) {
    for (let i = 0; i < COLS; i++) {
      const k = j * COLS + i;
      pos[k * 3] = X0 + i * DX;
      pos[k * 3 + 1] = ys[k];
      pos[k * 3 + 2] = Z0 + j * DZ;
      const e = metres[k];
      const yE = ys[Math.min(COLS - 1, i + 1) + j * COLS];
      const yW = ys[Math.max(0, i - 1) + j * COLS];
      const yS = ys[i + Math.min(ROWS - 1, j + 1) * COLS];
      const yN = ys[i + Math.max(0, j - 1) * COLS];
      const slope = Math.hypot((yE - yW) / (2 * DX), (yS - yN) / (2 * DZ));
      let c: number[];
      if (lakeMask[k]) {
        c = bed;
      } else {
        c = mixC(lowland, midland, smooth(550, 900, e));
        c = mixC(c, highland, smooth(1200, 1700, e));
        c = mixC(c, summit, smooth(2000, 2600, e));
        c = mixC(c, rock, smooth(0.55, 1.1, slope));
        if (!countryMask[k]) c = mixC(c, neighbour, 0.55);
        if (lakeKm[k] < 2.5) c = mixC(c, sand, (1 - lakeKm[k] / 2.5) * 0.65);
      }
      const edge = smooth(0, EDGE_CELLS, Math.min(i, j, COLS - 1 - i, ROWS - 1 - j));
      if (edge < 1) c = mixC(neighbour, c, edge);
      const n = 0.94 + hash2(i * 1.7, j * 2.3) * 0.12;
      col[k * 3] = c[0] * n;
      col[k * 3 + 1] = c[1] * n;
      col[k * 3 + 2] = c[2] * n;
    }
  }
  const idx = new Uint32Array((COLS - 1) * (ROWS - 1) * 6);
  let q = 0;
  for (let j = 0; j < ROWS - 1; j++) {
    for (let i = 0; i < COLS - 1; i++) {
      const a = j * COLS + i;
      const b = a + 1;
      const c2 = a + COLS;
      const d = c2 + 1;
      idx[q++] = a; idx[q++] = c2; idx[q++] = b;
      idx[q++] = b; idx[q++] = c2; idx[q++] = d;
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(new THREE.BufferAttribute(idx, 1));
  geo.computeVertexNormals();
  const mesh = new THREE.Mesh(geo, new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 1, metalness: 0 }));

  function heightY(x: number, z: number): number {
    const gi = (x - X0) / DX;
    const gj = (z - Z0) / DZ;
    if (gi < 0 || gj < 0 || gi > COLS - 1 || gj > ROWS - 1) return 0;
    const i = Math.min(COLS - 2, Math.floor(gi));
    const j = Math.min(ROWS - 2, Math.floor(gj));
    const fx = gi - i;
    const fz = gj - j;
    const a = ys[j * COLS + i];
    const b = ys[j * COLS + i + 1];
    const c = ys[(j + 1) * COLS + i];
    const d = ys[(j + 1) * COLS + i + 1];
    return a + (b - a) * fx + (c - a) * fz + (a - b - c + d) * fx * fz;
  }
  function maxWithin(x: number, z: number, r: number): number {
    let m = -Infinity;
    const steps = Math.max(1, Math.ceil(r / Math.min(DX, DZ)));
    for (let a = -steps; a <= steps; a++) {
      for (let b = -steps; b <= steps; b++) {
        const px = x + (a / steps) * r;
        const pz = z + (b / steps) * r;
        if ((px - x) ** 2 + (pz - z) ** 2 <= r * r) m = Math.max(m, heightY(px, pz));
      }
    }
    return m;
  }

  return { mesh, real, heightY, maxWithin };
}
