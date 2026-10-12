import * as THREE from 'three';

export function std(color: number, opts: THREE.MeshStandardMaterialParameters = {}): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({ color, flatShading: true, roughness: 0.9, metalness: 0, ...opts });
}

function hash(x: number, y: number, z: number): number {
  const s = Math.sin(x * 127.1 + y * 311.7 + z * 74.7) * 43758.5453;
  return s - Math.floor(s);
}

/** Roughens a geometry deterministically. Duplicate vertices get the same offset, so no cracks. */
export function jitter<T extends THREE.BufferGeometry>(geo: T, amt: number): T {
  const p = geo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < p.count; i++) {
    const ox = p.getX(i);
    const oy = p.getY(i);
    const oz = p.getZ(i);
    const x = Math.round(ox * 500) / 500;
    const y = Math.round(oy * 500) / 500;
    const z = Math.round(oz * 500) / 500;
    p.setXYZ(
      i,
      ox + (hash(x, y, z) - 0.5) * amt,
      oy + (hash(x + 7.1, y, z) - 0.5) * amt * 0.6,
      oz + (hash(x, y, z + 3.7) - 0.5) * amt,
    );
  }
  geo.computeVertexNormals();
  return geo;
}

export function mesh(geo: THREE.BufferGeometry, mat: THREE.Material, x = 0, y = 0, z = 0): THREE.Mesh {
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, z);
  return m;
}
