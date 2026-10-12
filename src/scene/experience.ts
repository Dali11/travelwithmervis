import { flatBeats } from '../beats';
import { content } from '../content';
import { createWorld, type World } from './world';
import { rgbCss, skyAt } from './palette';

/** The 3D journey is now contained inside the homepage map section. */
export function startExperience(canvas: HTMLCanvasElement, skyEl: HTMLElement, stages: HTMLElement[]): void {
  const root = document.documentElement;
  const reduce = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false;
  const mapSection = stages[0] ?? document.querySelector<HTMLElement>('#map');
  const cameraSections = flatBeats().length + 3;

  // A separate instance keeps the original scroll-driven map unchanged.
  const explorerCanvas = document.getElementById('experience-scene') as HTMLCanvasElement | null;
  const explorerSection = document.getElementById('experiences');
  let explorerWorld: World | null = null;
  let selectedExperience = 0;
  let explorerTargetU = 1;
  let explorerCurU = 1;
  let explorerFirst = true;

  const experienceButtons = Array.from(
    document.querySelectorAll<HTMLButtonElement>('.explorer-option')
  );

  // Stop 0 is the overview. Stop 1 is Lake Malawi.
  // Stops 2–5 follow the Mulanje mountain, forest and waterfall beats.
  const placeCameraStops = [1, 2, 4];

  const selectExperience = (index: number): void => {
    if (index < 0 || index >= experienceButtons.length) return;
    selectedExperience = index;

    experienceButtons.forEach((button, i) => {
      const active = i === index;
      button.classList.toggle('is-active', active);
      button.setAttribute('aria-pressed', String(active));
    });

    const button = experienceButtons[index];
    const setText = (id: string, value: string | undefined): void => {
      const element = document.getElementById(id);
      if (element && value) element.textContent = value;
    };

    setText('explorer-title', button.dataset.title);
    setText('explorer-category', button.dataset.category);
    setText('explorer-description', button.dataset.description);
    setText('explorer-fact', button.dataset.fact);
    setText('explorer-scene-label', button.dataset.label);
    setText('explorer-stage-number', `0${index + 1} / 03`);

    const photo = document.querySelector<HTMLImageElement>('.explorer-detail-photo img');
    if (photo && button.dataset.photo) {
      photo.src = button.dataset.photo;
      photo.alt = button.dataset.alt || button.dataset.title || 'Malawi destination';
    }

    const cta = document.getElementById('explorer-cta') as HTMLAnchorElement | null;
    if (cta) {
      cta.href = '#plan';
      cta.onclick = () => {
        const trip = button.dataset.trip;
        const option = Array.from(
          document.querySelectorAll<HTMLInputElement>('input[name="trip"]')
        ).find((input) => input.value === trip);
        if (option) option.checked = true;
      };
    }

    // The 3D camera eases to the selected destination's corresponding beat.
    explorerTargetU = placeCameraStops[index] ?? 1;
  };

  experienceButtons.forEach((button, index) => {
    button.addEventListener('click', () => selectExperience(index));
  });

  if (explorerCanvas) {
    void createWorld(explorerCanvas, cameraSections, flatBeats()).then((w) => {
      explorerWorld = w;
      if (!w) explorerCanvas.classList.add('explorer-no-webgl');
      else w.resize();
    });
  }

  selectExperience(0);


  let world: World | null = null;
  void createWorld(canvas, cameraSections, flatBeats()).then((w) => {
    world = w;
    if (!w) root.classList.add('no-webgl');
  });

  const mapProgress = (): number => {
    if (!mapSection) return 0;
    const rect = mapSection.getBoundingClientRect();
    return Math.max(0, Math.min(1, (window.innerHeight - rect.top) / (rect.height + window.innerHeight)));
  };
  const onResize = (): void => { world?.resize(); explorerWorld?.resize(); };
  window.addEventListener('resize', onResize, { passive: true });
  window.addEventListener('load', onResize, { passive: true });

  let px = 0;
  let py = 0;
  let tpx = 0;
  let tpy = 0;
  window.addEventListener('pointermove', (e) => {
    tpx = (e.clientX / window.innerWidth - 0.5) * 2;
    tpy = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  let curU = 0;
  let first = true;
  const started = performance.now();
  let last = started;
  const frame = (now: number): void => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    const target = mapProgress() * (cameraSections - 1);
    curU = reduce ? target : curU + (target - curU) * (1 - Math.exp(-dt * 4));
    px += (tpx - px) * (1 - Math.exp(-dt * 3));
    py += (tpy - py) * (1 - Math.exp(-dt * 3));

    const visible = mapSection ? (() => { const r = mapSection.getBoundingClientRect(); return r.bottom > 0 && r.top < window.innerHeight; })() : false;
    canvas.style.visibility = visible ? 'visible' : 'hidden';
    const sky = skyAt(curU, cameraSections);
    skyEl.style.setProperty('--sky-top', rgbCss(sky.top));
    skyEl.style.setProperty('--sky-bot', rgbCss(sky.bot));

    if (world && visible) {
      const p = Math.min(1, (now - started) / 1800);
      const k = reduce ? 1 : 1 - Math.pow(1 - p, 3);
      world.update(curU, sky, reduce ? 0 : now / 1000, reduce ? 0 : px, reduce ? 0 : py, k);
      if (first) { root.classList.add('ready'); first = false; }
    }

    if (explorerCanvas && explorerWorld && explorerSection) {
      const r = explorerSection.getBoundingClientRect();
      const explorerVisible = r.bottom > 0 && r.top < window.innerHeight;
      explorerCanvas.style.visibility = explorerVisible ? 'visible' : 'hidden';

      if (explorerVisible) {
        const dt = Math.min((now - last) / 1000, 0.05);
        explorerCurU = reduce
          ? explorerTargetU
          : explorerCurU + (explorerTargetU - explorerCurU) * (1 - Math.exp(-dt * 2.4));
        const sky = skyAt(explorerCurU, cameraSections);
        explorerWorld.update(
          explorerCurU,
          sky,
          reduce ? 0 : now / 1000,
          0,
          0,
          1
        );
        if (explorerFirst) {
          explorerCanvas.classList.add('explorer-ready');
          explorerFirst = false;
        }
      }
    }

    requestAnimationFrame(frame);
  };
  requestAnimationFrame(frame);
}
