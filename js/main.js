import { AppState } from './engine/state.js';
import { clampPan } from './engine/camera.js';
import { getPlanetAngle } from './engine/time.js';
import { rebuildStars } from './engine/starfield.js';
import { MAX_PIXEL_RATIO } from './config/constants.js';
import { PLANET_DATA, initPlanetState, MOON_SYSTEMS } from './config/planets.js';
import { buildAsteroidBelt } from './config/asteroids.js';
import { startAnimation, resetAnimationTimer } from './engine/scene.js';
import { initInput } from './input/input.js';
import { createInfoPanel, initControls } from './input/ui.js';

function init() {
  // DOM elements
  const starCanvas = document.getElementById('starfield');
  const mainCanvas = document.getElementById('main');
  const speedSlider = document.getElementById('speedSlider');
  const speedValueEl = document.getElementById('speedValue');
  const timeLabelEl = document.getElementById('timeLabel');
  const nowBtn = document.getElementById('nowBtn');
  const pauseBtn = document.getElementById('pauseBtn');
  const playBtn = document.getElementById('playBtn');

  let viewportWidth = window.innerWidth;
  let viewportHeight = window.innerHeight;
  let pixelRatio = 1;

  // State
  AppState.mainCtx = mainCanvas.getContext('2d');
  AppState.starCtx = starCanvas.getContext('2d');

  // UI modules
  const inputPanel = createInfoPanel();
  initControls(nowBtn, pauseBtn, playBtn, speedSlider, speedValueEl, timeLabelEl);
  initInput(inputPanel, inputPanel.hideInfo);

  // Resize
  function resizeCanvases() {
    viewportWidth = window.innerWidth;
    viewportHeight = window.innerHeight;
    pixelRatio = Math.min(window.devicePixelRatio || 1, MAX_PIXEL_RATIO);

    for (const c of [starCanvas, mainCanvas]) {
      c.width = Math.round(viewportWidth * pixelRatio);
      c.height = Math.round(viewportHeight * pixelRatio);
      c.style.width = viewportWidth + 'px';
      c.style.height = viewportHeight + 'px';
      c.getContext('2d').setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
    }

    AppState.viewportWidth = viewportWidth;
    AppState.viewportHeight = viewportHeight;
    AppState.pixelRatio = pixelRatio;

    clampPan(viewportWidth, viewportHeight);
  }

  resizeCanvases();

  window.addEventListener('resize', () => {
    resizeCanvases();
    rebuildStars(viewportWidth, viewportHeight);
  });

  // Starfield
  rebuildStars(viewportWidth, viewportHeight);

  // Data
  AppState.moonSystems = MOON_SYSTEMS;
  const planets = PLANET_DATA.map(p => ({ ...p }));
  initPlanetState(planets, getPlanetAngle);
  AppState.planets = planets;

  const asteroids = buildAsteroidBelt();
  AppState.asteroidBelt = asteroids;

  // Visibility
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
      resetAnimationTimer();
    }
  });

  // Start
  startAnimation(timeLabelEl, speedValueEl);
}

document.addEventListener('DOMContentLoaded', init);
