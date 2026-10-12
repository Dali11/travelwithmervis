import * as THREE from 'three';

export interface CardSpec {
  title: string;
  photo?: string;
  position: THREE.Vector3;
  /** Card width in world units. Default 3.6. */
  size?: number;
}

export interface Cards {
  group: THREE.Group;
  /** u is scroll progress in sections; card i belongs to section i + 1 (section 0 is the hero). */
  update(u: number, t: number): void;
}

function polaroid(name: string, photoUrl: string): THREE.CanvasTexture {
  const cv = document.createElement('canvas');
  cv.width = 256;
  cv.height = 300;
  const g = cv.getContext('2d');
  const tex = new THREE.CanvasTexture(cv);
  if (!g) return tex;

  const frame = (): void => {
    g.fillStyle = '#ffffff';
    g.fillRect(0, 0, 256, 300);
  };
  const label = (): void => {
    g.fillStyle = '#1d2a44';
    g.font = '600 22px Figtree, sans-serif';
    g.textAlign = 'center';
    g.fillText(name, 128, 278, 230);
  };

  frame();
  g.fillStyle = '#7fc4e8';
  g.fillRect(14, 14, 228, 228);
  label();
  tex.needsUpdate = true;

  const img = new Image();
  img.onload = () => {
    frame();
    const r = Math.max(228 / img.width, 228 / img.height);
    const w = img.width * r;
    const h = img.height * r;
    g.save();
    g.beginPath();
    g.rect(14, 14, 228, 228);
    g.clip();
    g.drawImage(img, 14 + (228 - w) / 2, 14 + (228 - h) / 2, w, h);
    g.restore();
    label();
    tex.needsUpdate = true;
  };
  img.src = photoUrl; // if the file is missing the plain frame stays
  return tex;
}

/** Floating photo cards. Entries without a photo (null) get no card. */
export function createCards(specs: Array<CardSpec | null>): Cards {
  const group = new THREE.Group();
  const cards = specs.map((s) => {
    if (!s || !s.photo) return null;
    const sprite = new THREE.Sprite(
      new THREE.SpriteMaterial({ map: polaroid(s.title, s.photo), transparent: true, opacity: 0, depthWrite: false }),
    );
    sprite.visible = false;
    sprite.position.copy(s.position);
    group.add(sprite);
    return { sprite, base: s.position.clone(), size: s.size ?? 3.6 };
  });

  function update(u: number, t: number): void {
    cards.forEach((c, i) => {
      if (!c) return;
      const w = Math.max(0, 1 - Math.abs(u - (i + 1)));
      c.sprite.visible = w > 0.02;
      c.sprite.material.opacity = Math.min(1, w * 1.6);
      const s = 0.7 + 0.3 * w;
      c.sprite.scale.set(c.size * s, c.size * 1.167 * s, 1);
      c.sprite.position.set(c.base.x, c.base.y + w * 0.5 + Math.sin(t * 1.4 + i) * 0.1, c.base.z);
    });
  }

  return { group, update };
}
