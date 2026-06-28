import { AppState } from '../engine/state.js';
import { Time } from '../engine/time.js';
import { Camera } from '../engine/camera.js';
import { getGalaxyRevealFactor } from '../engine/galaxy.js';
import { getPlanetTexture, getPlanetTexturePixels } from './textures.js';
import { drawSaturnRingHalf } from './rings.js';

function lightenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.min(255, (num >> 16) + amount);
  const g = Math.min(255, ((num >> 8) & 0xff) + amount);
  const b = Math.min(255, (num & 0xff) + amount);
  return `rgb(${r},${g},${b})`;
}

function darkenColor(hex, amount) {
  const num = parseInt(hex.replace('#', ''), 16);
  const r = Math.max(0, (num >> 16) - amount);
  const g = Math.max(0, ((num >> 8) & 0xff) - amount);
  const b = Math.max(0, (num & 0xff) - amount);
  return `rgb(${r},${g},${b})`;
}

function clamp01(value) {
  return Math.max(0, Math.min(1, value));
}

export function drawOrbitPath(cx, cy, orbitR, color) {
  const ctx = AppState.mainCtx;
  ctx.beginPath();
  ctx.ellipse(cx, cy, orbitR, orbitR * Math.cos(Camera.tilt), 0, 0, Math.PI * 2);
  ctx.strokeStyle = color || 'rgba(60,80,120,0.18)';
  ctx.lineWidth = 1 * AppState.cameraZoom;
  ctx.stroke();
}

export function drawPlanetSurface(planet, x, y, r) {
  const ctx = AppState.mainCtx;
  const tex = getPlanetTexture(planet);
  if (!tex) return;

  const texW = tex.width;
  const texH = tex.height;
  const spin = (Time.daysSinceEpoch / planet.rotationPeriodDays) * Math.PI * 2 - Camera.rotY;
  const cosSpin = Math.cos(spin);
  const sinSpin = Math.sin(spin);
  const axisTilt = (planet.axialTiltDeg || 0) * Math.PI / 180;
  const cosTilt = Math.cos(axisTilt);
  const sinTilt = Math.sin(axisTilt);
  const diameter = Math.max(2, Math.ceil(r * 2));

  if (!planet._texPixels) {
    planet._texPixels = getPlanetTexturePixels(planet);
  }

  if (!planet._surfaceCache || planet._surfaceCache.size !== diameter) {
    const surfaceCanvas = document.createElement('canvas');
    surfaceCanvas.width = diameter;
    surfaceCanvas.height = diameter;
    const surfaceCtx = surfaceCanvas.getContext('2d');
    planet._surfaceCache = {
      size: diameter,
      canvas: surfaceCanvas,
      ctx: surfaceCtx,
      image: surfaceCtx.createImageData(diameter, diameter)
    };
  }

  const surface = planet._surfaceCache;
  const output = surface.image.data;
  const source = planet._texPixels;
  const radiusPx = diameter / 2;

  output.fill(0);

  for (let py = 0; py < diameter; py++) {
    const sy = (py + 0.5 - radiusPx) / radiusPx;
    for (let px = 0; px < diameter; px++) {
      const sx = (px + 0.5 - radiusPx) / radiusPx;
      const radiusSquared = sx * sx + sy * sy;
      if (radiusSquared > 1) continue;

      const sz = Math.sqrt(1 - radiusSquared);

      const axisX = sx * cosTilt + sy * sinTilt;
      const axisY = -sx * sinTilt + sy * cosTilt;
      const localX = axisX * cosSpin - sz * sinSpin;
      const localZ = axisX * sinSpin + sz * cosSpin;

      const u = ((0.5 + Math.atan2(localX, localZ) / (Math.PI * 2)) % 1 + 1) % 1;
      const v = Math.max(0, Math.min(1,
        0.5 + Math.asin(Math.max(-1, Math.min(1, axisY))) / Math.PI
      ));
      const tx = Math.min(texW - 1, Math.floor(u * texW));
      const ty = Math.min(texH - 1, Math.floor(v * texH));
      const sourceIndex = (ty * texW + tx) * 4;
      const outputIndex = (py * diameter + px) * 4;

      output[outputIndex] = source[sourceIndex];
      output[outputIndex + 1] = source[sourceIndex + 1];
      output[outputIndex + 2] = source[sourceIndex + 2];
      output[outputIndex + 3] = source[sourceIndex + 3];
    }
  }

  surface.ctx.putImageData(surface.image, 0, 0);

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(surface.canvas, x - r, y - r, r * 2, r * 2);

  const limbShade = ctx.createRadialGradient(
    x - r * 0.22, y - r * 0.2, r * 0.12,
    x, y, r * 1.05
  );
  limbShade.addColorStop(0, 'rgba(0,0,0,0)');
  limbShade.addColorStop(0.58, 'rgba(0,0,0,0.02)');
  limbShade.addColorStop(1, 'rgba(0,0,0,0.48)');
  ctx.fillStyle = limbShade;
  ctx.fillRect(x - r, y - r, r * 2, r * 2);

  ctx.restore();
}

export function drawPlanetOverlays(planet, x, y, r) {
  const ctx = AppState.mainCtx;
  if (planet.name === 'Earth') {
    const atmosphere = ctx.createRadialGradient(x, y, r * 0.78, x, y, r * 1.12);
    atmosphere.addColorStop(0, 'rgba(90,170,255,0)');
    atmosphere.addColorStop(0.78, 'rgba(90,170,255,0.05)');
    atmosphere.addColorStop(1, 'rgba(100,185,255,0.28)');
    ctx.beginPath();
    ctx.arc(x, y, r * 1.12, 0, Math.PI * 2);
    ctx.fillStyle = atmosphere;
    ctx.fill();
  }
}

export function drawPlanet(planet, cx, cy, time) {
  const ctx = AppState.mainCtx;
  const pos = { x: planet._screenX, y: planet._screenY, depth: planet._depth, scale: planet._screenScale || 1 };
  const r = planet._screenR || (planet.radius * pos.scale * AppState.cameraZoom);

  if (planet.clickAnim > 0) {
    planet.clickAnim -= 0.02;
  }

  const glowGrad = ctx.createRadialGradient(pos.x, pos.y, r * 0.5, pos.x, pos.y, r * 3);
  glowGrad.addColorStop(0, planet.glowColor);
  glowGrad.addColorStop(1, 'transparent');
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r * 3, 0, Math.PI * 2);
  ctx.fillStyle = glowGrad;
  ctx.fill();

  if (planet.rings) {
    drawSaturnRingHalf(pos.x, pos.y, r, false);
  }

  const bodyGrad = ctx.createRadialGradient(
    pos.x - r * 0.3, pos.y - r * 0.3, r * 0.1,
    pos.x, pos.y, r
  );
  const baseColor = planet.color;
  bodyGrad.addColorStop(0, lightenColor(baseColor, 40));
  bodyGrad.addColorStop(0.6, baseColor);
  bodyGrad.addColorStop(1, darkenColor(baseColor, 50));

  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = bodyGrad;
  ctx.fill();

  if (planet.rotationPeriodDays) {
    drawPlanetSurface(planet, pos.x, pos.y, r);
  }

  drawPlanetOverlays(planet, pos.x, pos.y, r);

  const specGrad = ctx.createRadialGradient(
    pos.x - r * 0.35, pos.y - r * 0.35, 0,
    pos.x - r * 0.35, pos.y - r * 0.35, r * 0.6
  );
  specGrad.addColorStop(0, 'rgba(255,255,255,0.35)');
  specGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(pos.x, pos.y, r, 0, Math.PI * 2);
  ctx.fillStyle = specGrad;
  ctx.fill();

  if (planet.rings) {
    drawSaturnRingHalf(pos.x, pos.y, r, true);
  }

  if (planet.clickAnim > 0) {
    const rippleR = r + (1 - planet.clickAnim) * 30 * AppState.cameraZoom;
    const rippleAlpha = planet.clickAnim * 0.5;
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, rippleR, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(255,255,255,${rippleAlpha})`;
    ctx.lineWidth = 2;
    ctx.stroke();
  }

  if (planet.hovered) {
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, r + 5, 0, Math.PI * 2);
    ctx.strokeStyle = 'rgba(255,255,255,0.45)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
  }

  const labelAlpha = clamp01((AppState.cameraZoom - 0.12) / 0.16) * (1 - getGalaxyRevealFactor());
  if (labelAlpha > 0.02) {
    ctx.font = `${Math.max(8, Math.round(10 * AppState.cameraZoom))}px 'Segoe UI', sans-serif`;
    ctx.fillStyle = `rgba(180,200,230,${labelAlpha * (0.4 + (AppState.cameraZoom - 0.5) * 0.3)})`;
    ctx.textAlign = 'center';
    ctx.fillText(planet.name, pos.x, pos.y + r + 14 * AppState.cameraZoom);
  }
}
