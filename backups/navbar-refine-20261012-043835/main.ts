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
}
