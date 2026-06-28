import { AppState } from './state.js';
import { GALAXY_REVEAL } from '../config/constants.js';

let galaxyCanvas = null;
let galaxyWidth = 0;
let galaxyHeight = 0;
let galaxyViewportWidth = 0;
let galaxyViewportHeight = 0;
let galaxyMarginX = 0;
let galaxyMarginY = 0;

function seededRandom(seed) {
  let value = seed >>> 0;
  return function random() {
    value = (value * 1664525 + 1013904223) >>> 0;
    return value / 4294967296;
  };
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

function smoothstep(value) {
  const t = clamp01(value);
  return t * t * (3 - 2 * t);
}

function gaussian(rng) {
  let u = 0;
  let v = 0;
  while (u === 0) u = rng();
  while (v === 0) v = rng();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(Math.PI * 2 * v);
}

export function getGalaxyRevealFactor() {
  const range = GALAXY_REVEAL.startZoom - GALAXY_REVEAL.fullZoom;
  if (range <= 0) return 0;
  return smoothstep((GALAXY_REVEAL.startZoom - AppState.cameraZoom) / range);
}

export function rebuildGalaxy(vw, vh) {
  galaxyViewportWidth = Math.max(1, Math.ceil(vw));
  galaxyViewportHeight = Math.max(1, Math.ceil(vh));
  galaxyMarginX = Math.ceil(galaxyViewportWidth * 0.55);
  galaxyMarginY = Math.ceil(galaxyViewportHeight * 0.42);
  galaxyWidth = galaxyViewportWidth + galaxyMarginX * 2;
  galaxyHeight = galaxyViewportHeight + galaxyMarginY * 2;
  galaxyCanvas = document.createElement('canvas');
  galaxyCanvas.width = galaxyWidth;
  galaxyCanvas.height = galaxyHeight;

  const ctx = galaxyCanvas.getContext('2d');
  const rng = seededRandom(0x51a7f13d);
  const diagonal = Math.hypot(galaxyWidth, galaxyHeight);
  const galaxyRadius = Math.min(galaxyWidth, galaxyHeight) * 0.52;
  const rotation = -0.26;
  const inclination = 0.72;
  const cosRot = Math.cos(rotation);
  const sinRot = Math.sin(rotation);
  const solarLocalRadius = galaxyRadius * 0.64;
  const solarLocalTheta = 2.94;
  const solarLocalX = Math.cos(solarLocalTheta) * solarLocalRadius;
  const solarLocalY = Math.sin(solarLocalTheta) * solarLocalRadius;
  const targetSolarX = galaxyMarginX + galaxyViewportWidth * 0.5;
  const targetSolarY = galaxyMarginY + galaxyViewportHeight * 0.51;
  const coreX = targetSolarX - (solarLocalX * cosRot - solarLocalY * inclination * sinRot);
  const coreY = targetSolarY - (solarLocalX * sinRot + solarLocalY * inclination * cosRot);
  function project(localX, localY) {
    return {
      x: coreX + localX * cosRot - localY * inclination * sinRot,
      y: coreY + localX * sinRot + localY * inclination * cosRot
    };
  }

  function drawSoftBlob(localX, localY, radius, colorStops) {
    const p = project(localX, localY);
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, radius);
    for (const stop of colorStops) {
      g.addColorStop(stop[0], stop[1]);
    }
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, radius, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.clearRect(0, 0, galaxyWidth, galaxyHeight);

  // Full Milky Way disk, generated once into a cached canvas. The solar system
  // marker is intentionally placed out on an arm, not in the galactic center.
  ctx.save();
  ctx.translate(coreX, coreY);
  ctx.rotate(rotation);
  ctx.scale(1, inclination);

  const disk = ctx.createRadialGradient(0, 0, galaxyRadius * 0.08, 0, 0, galaxyRadius * 1.18);
  disk.addColorStop(0, 'rgba(255,232,184,0.22)');
  disk.addColorStop(0.22, 'rgba(170,190,245,0.16)');
  disk.addColorStop(0.58, 'rgba(88,120,205,0.085)');
  disk.addColorStop(0.86, 'rgba(42,62,130,0.03)');
  disk.addColorStop(1, 'rgba(12,18,40,0)');
  ctx.fillStyle = disk;
  ctx.beginPath();
  ctx.ellipse(0, 0, galaxyRadius * 1.08, galaxyRadius * 1.08, 0, 0, Math.PI * 2);
  ctx.fill();

  const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, galaxyRadius * 0.42);
  halo.addColorStop(0, 'rgba(255,236,196,0.34)');
  halo.addColorStop(0.22, 'rgba(250,210,142,0.22)');
  halo.addColorStop(0.58, 'rgba(130,140,210,0.08)');
  halo.addColorStop(1, 'rgba(40,55,120,0)');
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.ellipse(0, 0, galaxyRadius * 0.58, galaxyRadius * 0.46, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  for (let i = 0; i < 420; i++) {
    const side = rng() < 0.5 ? -1 : 1;
    const distance = Math.pow(rng(), 0.65) * galaxyRadius * 0.4 * side;
    const barAngle = -0.62 + gaussian(rng) * 0.18;
    const offset = gaussian(rng) * galaxyRadius * 0.06;
    const localX = Math.cos(barAngle) * distance - Math.sin(barAngle) * offset;
    const localY = Math.sin(barAngle) * distance + Math.cos(barAngle) * offset;
    const radius = galaxyRadius * (0.014 + rng() * 0.038);
    const alpha = 0.014 + rng() * 0.045;
    drawSoftBlob(localX, localY, radius, [
      [0, `rgba(245,214,170,${alpha})`],
      [0.55, `rgba(180,145,145,${alpha * 0.32})`],
      [1, 'rgba(80,60,90,0)']
    ]);
  }

  const armCount = 4;
  const armTwist = 4.9;
  const armPhase = -0.72;
  const cloudCount = Math.max(1600, Math.min(4200, Math.floor((galaxyWidth * galaxyHeight) / 340)));
  for (let i = 0; i < cloudCount; i++) {
    const arm = Math.floor(rng() * armCount);
    const t = Math.pow(rng(), 0.72);
    const radius = galaxyRadius * (0.16 + t * 0.88);
    const theta = armPhase + arm * Math.PI * 2 / armCount + Math.log(radius / galaxyRadius + 0.18) * armTwist;
    const spread = galaxyRadius * (0.018 + t * 0.055);
    const localTheta = theta + gaussian(rng) * (0.05 + t * 0.08);
    const radialJitter = gaussian(rng) * spread;
    const localRadius = radius + radialJitter;
    const localX = Math.cos(localTheta) * localRadius;
    const localY = Math.sin(localTheta) * localRadius;
    const blobRadius = galaxyRadius * (0.012 + rng() * 0.035) * (1.08 - t * 0.35);
    const brightness = (0.018 + rng() * 0.055) * (1 - t * 0.28);
    const warm = rng() < 0.34 || t < 0.28;

    drawSoftBlob(localX, localY, blobRadius, [
      [0, warm ? `rgba(238,206,158,${brightness})` : `rgba(166,198,255,${brightness})`],
      [0.55, warm ? `rgba(182,145,114,${brightness * 0.34})` : `rgba(96,134,220,${brightness * 0.32})`],
      [1, 'rgba(20,28,65,0)']
    ]);
  }

  const particleCount = Math.max(2200, Math.min(7000, Math.floor((galaxyWidth * galaxyHeight) / 210)));
  for (let i = 0; i < particleCount; i++) {
    const arm = Math.floor(rng() * armCount);
    const t = Math.pow(rng(), 0.62);
    const radius = galaxyRadius * (0.08 + t * 1.02);
    const theta = armPhase + arm * Math.PI * 2 / armCount + Math.log(radius / galaxyRadius + 0.18) * armTwist;
    const localTheta = theta + gaussian(rng) * (0.035 + t * 0.11);
    const localRadius = radius + gaussian(rng) * galaxyRadius * (0.012 + t * 0.06);
    const localX = Math.cos(localTheta) * localRadius;
    const localY = Math.sin(localTheta) * localRadius;
    const p = project(localX, localY);

    if (p.x < -8 || p.y < -8 || p.x > galaxyWidth + 8 || p.y > galaxyHeight + 8) continue;

    const size = 0.14 + Math.pow(rng(), 2.8) * 1.05;
    const alpha = (0.05 + Math.pow(rng(), 1.8) * 0.38) * (1 - t * 0.18);
    const warm = rng() < 0.24 || t < 0.22;
    ctx.beginPath();
    ctx.arc(p.x, p.y, size, 0, Math.PI * 2);
    ctx.fillStyle = warm
      ? `rgba(235,200,155,${alpha})`
      : `rgba(195,215,255,${alpha})`;
    ctx.fill();

    if (rng() < 0.012 && t > 0.34) {
      const nebulaRadius = galaxyRadius * (0.006 + rng() * 0.018);
      drawSoftBlob(localX, localY, nebulaRadius, [
        [0, `rgba(255,95,145,${0.12 + rng() * 0.18})`],
        [0.5, `rgba(150,75,180,${0.04 + rng() * 0.06})`],
        [1, 'rgba(60,30,80,0)']
      ]);
    }
  }

  ctx.save();
  ctx.globalCompositeOperation = 'destination-out';
  for (let i = 0; i < 280; i++) {
    const arm = Math.floor(rng() * armCount);
    const t = Math.pow(rng(), 0.7);
    const radius = galaxyRadius * (0.15 + t * 0.88);
    const theta = armPhase + arm * Math.PI * 2 / armCount + Math.log(radius / galaxyRadius + 0.18) * armTwist + 0.12;
    const localTheta = theta + gaussian(rng) * (0.035 + t * 0.09);
    const localRadius = radius + gaussian(rng) * galaxyRadius * (0.018 + t * 0.045);
    const localX = Math.cos(localTheta) * localRadius;
    const localY = Math.sin(localTheta) * localRadius;
    const p = project(localX, localY);
    const laneRadius = galaxyRadius * (0.008 + rng() * 0.025);
    const alpha = 0.035 + rng() * 0.095;
    const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, laneRadius);
    g.addColorStop(0, `rgba(0,0,0,${alpha})`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(p.x, p.y, laneRadius, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();

  // A few distant galaxies / clusters in the surrounding universe.
  for (let i = 0; i < 26; i++) {
    const px = rng() * galaxyWidth;
    const py = rng() * galaxyHeight;
    const size = 1.8 + rng() * 4.5;
    const alpha = 0.035 + rng() * 0.075;
    ctx.save();
    ctx.translate(px, py);
    ctx.rotate(rng() * Math.PI);
    ctx.scale(1, 0.32 + rng() * 0.25);
    const g = ctx.createRadialGradient(0, 0, 0, 0, 0, size);
    g.addColorStop(0, `rgba(190,205,255,${alpha})`);
    g.addColorStop(1, 'rgba(80,110,190,0)');
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(0, 0, size, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.globalCompositeOperation = 'destination-in';
  const vignette = ctx.createRadialGradient(coreX, coreY, diagonal * 0.12, coreX, coreY, diagonal * 0.72);
  vignette.addColorStop(0, 'rgba(255,255,255,1)');
  vignette.addColorStop(0.6, 'rgba(255,255,255,0.82)');
  vignette.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, galaxyWidth, galaxyHeight);
  ctx.restore();
}

export function drawGalaxy(ctx) {
  const reveal = getGalaxyRevealFactor();
  if (reveal <= 0) return;

  if (!galaxyCanvas ||
      galaxyViewportWidth !== Math.ceil(AppState.viewportWidth) ||
      galaxyViewportHeight !== Math.ceil(AppState.viewportHeight)) {
    rebuildGalaxy(AppState.viewportWidth, AppState.viewportHeight);
  }

  ctx.save();
  ctx.globalAlpha = reveal * GALAXY_REVEAL.maxAlpha;
  ctx.drawImage(
    galaxyCanvas,
    -galaxyMarginX + AppState.cameraPanX,
    -galaxyMarginY + AppState.cameraPanY
  );
  ctx.restore();
}
