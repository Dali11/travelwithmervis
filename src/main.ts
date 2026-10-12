import { startMalawiMap } from './scene/mapbox-map';
import './style.css';
import { renderSections } from './ui/sections';
import { setupForm } from './ui/form';
import { startExperience } from './scene/experience';

const app = document.getElementById('app');
const canvas = document.getElementById('scene') as HTMLCanvasElement | null;
const sky = document.getElementById('sky');

if (app && canvas && sky) {
  const stages = renderSections(app);
  setupForm();
  startExperience(canvas, sky, stages);
  startMalawiMap();
}

// MERVIS_NAV_SCROLL_STATE
(() => {
  const updateNavbar = () => {
    const navbar = document.querySelector<HTMLElement>('.site-nav');
    if (!navbar) return;
    navbar.classList.toggle('is-scrolled', window.scrollY > 24);
  };

  window.addEventListener('scroll', updateNavbar, { passive: true });
  window.addEventListener('load', updateNavbar);
  updateNavbar();
})();
