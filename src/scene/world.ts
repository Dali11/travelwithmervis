import * as THREE from 'three';
import { COUNTRY } from './geo';
import { createTerrain, EDGE_M, elevToY, LAKE_Y, project, toWorld, type Terrain } from './terrain';
import { createLake } from './lake';
import { createClouds, createMist } from './weather';
import { createSun } from './atmosphere';
import { createCards, type CardSpec } from './cards';
import { mix, type SkyState } from './palette';
import { content, type Place } from '../content';
import type { BeatInfo } from '../beats';

// Keep colours and lighting looking the way they were designed (no sRGB conversion).
THREE.ColorManagement.enabled = false;

export interface World {
  update(u: number, sky: SkyState, t: number, px: number, py: number, k: number): void;
  resize(): void;
}

const V = (x: number, y: number, z: number): THREE.Vector3 => new THREE.Vector3(x, y, z);
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

/** Camera position and look-at point for one step of a place. */
export function placeView(terrain: Terrain, p: Place, b: number, n: number): { cam: THREE.Vector3; look: THREE.Vector3 } {
  const [cx, cz] = project(p.lon, p.lat);
  const t = n > 1 ? b / (n - 1) : 0;
  if (p.kind === 'lake') {
    // Low over the water, sweeping slowly sideways
    const a = lerp(0.35, -0.5, t);
    const r = 9;
    return { cam: V(cx + Math.sin(a) * r, LAKE_Y + 1.9, cz + Math.cos(a) * r), look: V(cx, LAKE_Y + 0.6, cz) };
  }
  // Mountain or plateau: circle it while climbing from the lower slopes to the summit
  const R = (p.radiusKm ?? 14) / 5.55;
  const top = terrain.maxWithin(cx, cz, R * 1.3);
  const a = lerp(-0.7, 0.7, t);
  const r = lerp(R * 3.6, R * 1.9, t);
  const lookY = lerp(top * 0.4, top * 0.92, t);
  return { cam: V(cx + Math.sin(a) * r, lookY + lerp(1.6, 1.3, t), cz + Math.cos(a) * r), look: V(cx, lookY, cz) };
}

/**
 * Builds the 3D world. Page sections are: hero, one per step of each place, "how it works", then the plan form.
 */
export async function createWorld(canvas: HTMLCanvasElement, sections: number, beats: BeatInfo[]): Promise<World | null> {
  let renderer: THREE.WebGLRenderer;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  } catch {
    return null;
  }
  if (!renderer.getContext()) return null;
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

  const scene = new THREE.Scene();
  const fog = new THREE.Fog(0xa9d8f0, 90, 300);
  scene.fog = fog;
  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 2400);

  // Light intensities are multiplied by PI to match the original look (three r155+ lighting model).
  const hemi = new THREE.HemisphereLight(0xdff3ff, 0x4d6a4f, 0.85 * Math.PI);
  scene.add(hemi);
  const sunLight = new THREE.DirectionalLight(0xffffff, 0.95 * Math.PI);
  scene.add(sunLight);

  const terrain = await createTerrain();
  scene.add(terrain.mesh);
  const plain = new THREE.Mesh(
    new THREE.PlaneGeometry(1600, 1600).rotateX(-Math.PI / 2),
    new THREE.MeshStandardMaterial({ color: 0xb4b99d, roughness: 1 }),
  );
  plain.position.set(0, elevToY(EDGE_M) - 0.02, 0);
  scene.add(plain);
  const lake = createLake();
  scene.add(lake.group);

  // Malawi's border, draped on the ground
  const border = toWorld(COUNTRY);
  const bArr = new Float32Array(border.length * 3);
  border.forEach(([x, z], i) => {
    bArr[i * 3] = x;
    bArr[i * 3 + 1] = Math.max(terrain.heightY(x, z), LAKE_Y) + 0.05;
    bArr[i * 3 + 2] = z;
  });
  const bGeo = new THREE.BufferGeometry();
  bGeo.setAttribute('position', new THREE.BufferAttribute(bArr, 3));
  scene.add(new THREE.LineLoop(bGeo, new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.95 })));

  const sun = createSun();
  sun.glow.scale.set(300, 300, 1);
  sun.core.scale.setScalar(2.6);
  scene.add(sun.glow, sun.core);
  const clouds = createClouds(14, [-80, 80], [-100, 100], [9, 14], 2.2);
  scene.add(clouds.group);

  // Pins and mist for each place
  const pins: Array<{ g: THREE.Group; baseY: number; ph: number }> = [];
  const mists: ReturnType<typeof createMist>[] = [];
  content.places.forEach((p, i) => {
    const [cx, cz] = project(p.lon, p.lat);
    const R = (p.radiusKm ?? 14) / 5.55;
    const surface = p.kind === 'lake' ? LAKE_Y : terrain.maxWithin(cx, cz, R * 0.6);
    const mat = new THREE.MeshStandardMaterial({ color: 0xffb547, emissive: 0x7a4a00, roughness: 0.5 });
    const g = new THREE.Group();
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.3, 16, 12), mat);
    head.position.y = 0.55;
    const tip = new THREE.Mesh(new THREE.ConeGeometry(0.22, 0.6, 12), mat);
    tip.rotation.x = Math.PI;
    tip.position.y = 0.1;
    g.add(head, tip);
    g.scale.setScalar(1.4);
    g.position.set(cx, surface + 0.2, cz);
    scene.add(g);
    pins.push({ g, baseY: surface + 0.2, ph: i * 1.7 });
    if (p.kind !== 'lake') {
      const m = createMist(cx, cz, elevToY(1900), R * 1.35, R * 1.9, 9, 1.1);
      scene.add(m.group);
      mists.push(m);
    }
  });

  // Camera path: overview, each step of each place, then "how it works" and the plan form.
  const camPts: THREE.Vector3[] = [V(28, 95, 150)];
  const lookPts: THREE.Vector3[] = [V(0, 0, 0)];
  const specs: Array<CardSpec | null> = [];
  beats.forEach((beat) => {
    const view = placeView(terrain, beat.place, beat.b, beat.n);
    camPts.push(view.cam);
    lookPts.push(view.look);
    const toCam = view.cam.clone().sub(view.look);
    const size = Math.max(1.0, Math.min(3.2, toCam.length() * 0.26));
    specs.push({
      title: beat.title,
      photo: beat.photo,
      size,
      position: view.look.clone().add(toCam.multiplyScalar(0.3)).add(V(0, size * 0.85, 0)),
    });
  });
  camPts.push(V(20, 45, 95), V(-30, 90, 130));
  lookPts.push(V(8, 0, 20), V(0, 0, 0));
  const camCurve = new THREE.CatmullRomCurve3(camPts, false, 'centripetal');
  const lookCurve = new THREE.CatmullRomCurve3(lookPts, false, 'centripetal');

  const cards = createCards(specs);
  scene.add(cards.group);

  const tmpP = new THREE.Vector3();
  const tmpL = new THREE.Vector3();
  let zoom = 1;

  function resize(): void {
    const rect = canvas.getBoundingClientRect();
    const w = Math.max(1, Math.round(rect.width || window.innerWidth));
    const h = Math.max(1, Math.round(rect.height || window.innerHeight));
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.6));
    renderer.setSize(w, h, false);
    const aspect = w / h;
    const portrait = aspect < 0.95;
    zoom = 1 + (1 - Math.min(aspect, 1)) * 0.9;
    camera.aspect = aspect;
    camera.clearViewOffset();
    // Keep the terrain centred inside its own responsive map component.
    camera.setViewOffset(w, h, portrait ? 0 : -w * 0.04, portrait ? h * 0.04 : 0, w, h);
    camera.updateProjectionMatrix();
  }
  resize();

  function update(u: number, sky: SkyState, t: number, px: number, py: number, k: number): void {
    const f = sections > 1 ? u / (sections - 1) : 0;
    camCurve.getPoint(f, tmpP);
    lookCurve.getPoint(f, tmpL);
    tmpP.sub(tmpL).multiplyScalar(zoom).add(tmpL);
    tmpP.x += px * 0.6;
    tmpP.y += -py * 0.4 + (1 - k) * 40;
    tmpP.z += (1 - k) * 60;
    // Never fly through the ground
    const ground = Math.max(terrain.maxWithin(tmpP.x, tmpP.z, 0.9), LAKE_Y);
    tmpP.y = Math.max(tmpP.y, ground + 0.9);
    // Thin the haze when the camera is high, so the whole country stays visible in the overview
    const high = Math.min(1, Math.max(0, (tmpP.y - 12) / 50));
    fog.near = 90 + high * 400;
    fog.far = 300 + high * 900;
    camera.position.copy(tmpP);
    camera.lookAt(tmpL);

    const sx = f * 44 - 22;
    sun.place(tmpP.x + sx * 8, tmpP.y + 10 + sky.sunY * 4, tmpP.z - 450);
    sunLight.position.set(sx * 5, 55 + sky.sunY * 1.4, 40);
    sunLight.color.setRGB(sky.light[0] / 255, sky.light[1] / 255, sky.light[2] / 255);
    fog.color.setRGB(sky.bot[0] / 255, sky.bot[1] / 255, sky.bot[2] / 255);
    const hm = mix(sky.bot, [255, 255, 255], 0.5);
    hemi.color.setRGB(hm[0] / 255, hm[1] / 255, hm[2] / 255);

    lake.update(t);
    clouds.update(t);
    mists.forEach((m) => m.update(t));
    pins.forEach((p) => {
      p.g.position.y = p.baseY + Math.sin(t * 1.6 + p.ph) * 0.12;
      p.g.rotation.y = t * 0.8 + p.ph;
    });
    cards.update(u, t);

    renderer.render(scene, camera);
  }

  return { update, resize };
}
