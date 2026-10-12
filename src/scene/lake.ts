import * as THREE from 'three';
import { LAKE } from './geo';
import { LAKE_Y, distToPolyKm, inPoly, project, toWorld } from './terrain';
import { std } from './helpers';

export interface Lake {
  group: THREE.Group;
  update(t: number): void;
}

const STEP = 0.02; // degrees between water vertices

function makeBoat(): THREE.Group {
  const boat = new THREE.Group();
  const hull = new THREE.Mesh(new THREE.BoxGeometry(1.3, 0.28, 0.5), std(0xffffff));
  hull.position.y = 0.14;
  const mast = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.3, 4), std(0x8a5a3a));
  mast.position.y = 0.9;
  const sailGeo = new THREE.BufferGeometry();
  sailGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array([0.05, 1.5, 0, 0.05, 0.35, 0, 0.7, 0.35, 0]), 3));
  sailGeo.computeVertexNormals();
  boat.add(hull, mast, new THREE.Mesh(sailGeo, std(0xffb547, { side: THREE.DoubleSide })));
  boat.scale.setScalar(0.9);
  return boat;
}

/** Lake Malawi: a low-poly water surface that shades from turquoise at the shore to deep blue, with a few sailboats. */
export function createLake(): Lake {
  const poly = toWorld(LAKE);
  const lons = LAKE.map((p) => p[0]);
  const lats = LAKE.map((p) => p[1]);
  const west = Math.min(...lons) - 0.05;
  const east = Math.max(...lons) + 0.05;
  const south = Math.min(...lats) - 0.05;
  const north = Math.max(...lats) + 0.05;
  const cols = Math.ceil((east - west) / STEP) + 1;
  const rows = Math.ceil((north - south) / STEP) + 1;

  const pos = new Float32Array(cols * rows * 3);
  const col = new Float32Array(cols * rows * 3);
  const inside = new Uint8Array(cols * rows);
  const shallow = new THREE.Color(0x35d6c8);
  const deep = new THREE.Color(0x0b5fa5);
  const tmp = new THREE.Color();
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const k = j * cols + i;
      const [x, z] = project(west + i * STEP, north - j * STEP);
      pos[k * 3] = x;
      pos[k * 3 + 1] = LAKE_Y + 0.012;
      pos[k * 3 + 2] = z;
      const isIn = inPoly(x, z, poly);
      inside[k] = isIn ? 1 : 0;
      const d = isIn ? distToPolyKm(x, z, poly) : 0;
      tmp.copy(shallow).lerp(deep, Math.min(1, d / 25));
      col[k * 3] = tmp.r;
      col[k * 3 + 1] = tmp.g;
      col[k * 3 + 2] = tmp.b;
    }
  }
  const idx: number[] = [];
  for (let j = 0; j < rows - 1; j++) {
    for (let i = 0; i < cols - 1; i++) {
      const a = j * cols + i;
      const b = a + 1;
      const c = a + cols;
      const d = c + 1;
      if (inside[a] || inside[b] || inside[c] || inside[d]) idx.push(a, c, b, b, c, d);
    }
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  geo.setAttribute('color', new THREE.BufferAttribute(col, 3));
  geo.setIndex(idx);
  geo.computeVertexNormals();
  const water = new THREE.Mesh(
    geo,
    new THREE.MeshStandardMaterial({
      vertexColors: true,
      flatShading: true,
      roughness: 0.22,
      metalness: 0.15,
      emissive: 0x062a3a,
      transparent: true,
      opacity: 0.94,
    }),
  );
  water.frustumCulled = false;

  const group = new THREE.Group();
  group.add(water);

  // Sailboats, placed only where the point really is on the lake
  const boats: Array<{ boat: THREE.Group; ph: number }> = [];
  const spots: Array<[number, number]> = [[34.55, -12.4], [34.5, -11.5], [34.7, -13.5], [34.45, -12.9], [34.3, -10.9]];
  spots.forEach(([lon, lat], n) => {
    const [x, z] = project(lon, lat);
    if (!inPoly(x, z, poly) || boats.length >= 3) return;
    const boat = makeBoat();
    boat.position.set(x, LAKE_Y + 0.03, z);
    boat.rotation.y = n * 1.7;
    group.add(boat);
    boats.push({ boat, ph: n * 1.7 });
  });

  const arr = pos;
  function update(t: number): void {
    for (let k = 0; k < cols * rows; k++) {
      const x = arr[k * 3];
      const z = arr[k * 3 + 2];
      arr[k * 3 + 1] = LAKE_Y + 0.012 + 0.016 * (Math.sin(x * 1.1 + t * 1.2) + Math.cos(z * 0.9 + t * 0.9) + Math.sin((x + z) * 0.5 + t * 0.7));
    }
    geo.attributes.position.needsUpdate = true;
    boats.forEach(({ boat, ph }) => {
      boat.position.y = LAKE_Y + 0.03 + Math.sin(t * 1.4 + ph) * 0.02;
      boat.rotation.z = Math.sin(t * 1.1 + ph) * 0.06;
    });
  }

  return { group, update };
}
