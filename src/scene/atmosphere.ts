import * as THREE from 'three';

export interface Sun {
  glow: THREE.Sprite;
  core: THREE.Mesh;
  place(x: number, y: number, z: number): void;
}

function glowTexture(): THREE.CanvasTexture {
  const c = document.createElement('canvas');
  c.width = c.height = 128;
  const x = c.getContext('2d');
  if (x) {
    const g = x.createRadialGradient(64, 64, 0, 64, 64, 64);
    g.addColorStop(0, 'rgba(255,255,255,1)');
    g.addColorStop(0.25, 'rgba(255,240,200,0.55)');
    g.addColorStop(1, 'rgba(255,220,160,0)');
    x.fillStyle = g;
    x.fillRect(0, 0, 128, 128);
  }
  return new THREE.CanvasTexture(c);
}

export function createSun(): Sun {
  const glow = new THREE.Sprite(
    new THREE.SpriteMaterial({
      map: glowTexture(),
      color: 0xffd9a0,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
      fog: false,
      transparent: true,
    }),
  );
  glow.scale.set(70, 70, 1);
  const core = new THREE.Mesh(new THREE.SphereGeometry(5, 24, 16), new THREE.MeshBasicMaterial({ color: 0xfff2c8, fog: false }));
  return {
    glow,
    core,
    place(x, y, z) {
      glow.position.set(x, y, z);
      core.position.set(x, y, z);
    },
  };
}

export interface Clouds {
  group: THREE.Group;
  update(t: number): void;
}

export function createClouds(): Clouds {
  const group = new THREE.Group();
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
    roughness: 1,
    emissive: 0x7f93a8,
    transparent: true,
    opacity: 0.93,
  });
  const clouds: THREE.Group[] = [];
  for (let c = 0; c < 9; c++) {
    const cg = new THREE.Group();
    const puffs = 3 + Math.floor(Math.random() * 3);
    for (let p = 0; p < puffs; p++) {
      const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(1.1 + Math.random() * 0.9, 1), mat);
      puff.position.set(p * 1.5 - puffs * 0.7, Math.random() * 0.5, (Math.random() - 0.5) * 1.2);
      puff.scale.y = 0.6;
      cg.add(puff);
    }
    cg.position.set(-55 + Math.random() * 110, 11 + Math.random() * 6, -55 + Math.random() * 60);
    cg.userData.v = 0.25 + Math.random() * 0.35;
    clouds.push(cg);
    group.add(cg);
  }
  return {
    group,
    update(t) {
      if (t <= 0) return;
      for (const cl of clouds) {
        cl.position.x += (cl.userData.v as number) * 0.016;
        if (cl.position.x > 60) cl.position.x = -60;
      }
    },
  };
}

export interface Mist {
  group: THREE.Group;
  update(t: number): void;
}

/** A ring of low clouds around a mountain, so the summit rises above them. */
export function createMist(x: number, z: number): Mist {
  const group = new THREE.Group();
  group.position.set(x, 0, z);
  const mat = new THREE.MeshStandardMaterial({
    color: 0xffffff,
    flatShading: true,
    roughness: 1,
    emissive: 0x9fb3c8,
    transparent: true,
    opacity: 0.88,
  });
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.random() * 0.4;
    const r = 3.6 + Math.random() * 1.2;
    const puff = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2 + Math.random() * 0.9, 1), mat);
    puff.position.set(Math.cos(a) * r, 3.4 + Math.random() * 1.0, Math.sin(a) * r);
    puff.scale.y = 0.55;
    group.add(puff);
  }
  return {
    group,
    update(t) {
      group.rotation.y = t * 0.04;
    },
  };
}
