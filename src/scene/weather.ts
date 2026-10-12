import * as THREE from 'three';

export interface Weather {
  group: THREE.Group;
  update(t: number): void;
}

function cloudMaterial(opacity: number): THREE.MeshStandardMaterial {
  return new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
    roughness: 1,
    emissive: 0x8aa0b5,
    transparent: true,
    opacity,
  });
}

/** Drifting clouds over the whole country. Ranges are world units. */
export function createClouds(count: number, x: [number, number], z: [number, number], y: [number, number], size: number): Weather {
  const group = new THREE.Group();
  const mat = cloudMaterial(0.9);
  const clouds: THREE.Group[] = [];
  for (let c = 0; c < count; c++) {
    const cg = new THREE.Group();
    const puffs = 3 + Math.floor(Math.random() * 3);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry((1.1 + Math.random() * 0.9) * size, 1), mat);
      puff.position.set((p * 1.5 - puffs * 0.7) * size, Math.random() * 0.5 * size, (Math.random() - 0.5) * 1.2 * size);
      puff.scale.y = 0.55;
      cg.add(puff);
    }
    cg.position.set(x[0] + Math.random() * (x[1] - x[0]), y[0] + Math.random() * (y[1] - y[0]), z[0] + Math.random() * (z[1] - z[0]));
    cg.userData.v = 0.3 + Math.random() * 0.4;
    clouds.push(cg);
    group.add(cg);
  }
  return {
    group,
    update(t) {
      if (t <= 0) return;
      clouds.forEach((cl) => {
        cl.position.x += (cl.userData.v as number) * 0.016;
        if (cl.position.x > x[1]) cl.position.x = x[0];
      });
    },
  };
}

/** A ring of low cloud around a mountain, so the summit rises above it. */
export function createMist(cx: number, cz: number, y: number, r0: number, r1: number, count: number, size: number): Weather {
  const group = new THREE.Group();
  group.position.set(cx, y, cz);
  const mat = cloudMaterial(0.88);
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2 + Math.random() * 0.4;
    const r = r0 + Math.random() * (r1 - r0);
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry((0.9 + Math.random() * 0.7) * size, 1), mat);
    puff.position.set(Math.cos(a) * r, Math.random() * 0.4, Math.sin(a) * r);
    puff.scale.y = 0.5;
    group.add(puff);
  }
  return {
    group,
    update(t) {
      group.rotation.y = t * 0.03;
    },
  };
}
