import { AppState } from '../engine/state.js';

export function drawSun(cx, cy, time) {
  const ctx = AppState.mainCtx;
  const glowLayers = [
    { r: 90, alpha: 0.015 },
    { r: 65, alpha: 0.035 },
    { r: 48, alpha: 0.055 },
    { r: 36, alpha: 0.08 },
  ];

  for (const g of glowLayers) {
    const pulse = 1 + 0.05 * Math.sin(time * 0.003);
    const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, g.r * pulse * AppState.cameraZoom);
    grad.addColorStop(0, `rgba(255,200,50,${g.alpha})`);
    grad.addColorStop(0.5, `rgba(255,140,20,${g.alpha * 0.5})`);
    grad.addColorStop(1, 'rgba(255,80,0,0)');
    ctx.beginPath();
    ctx.arc(cx, cy, g.r * pulse * AppState.cameraZoom, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();
  }

  ctx.save();
  ctx.translate(cx, cy);
  const rayCount = 16;
  for (let i = 0; i < rayCount; i++) {
    const angle = (i / rayCount) * Math.PI * 2 + time * 0.0005;
    const rayLen = (55 + 18 * Math.sin(time * 0.002 + i * 1.5)) * AppState.cameraZoom;
    ctx.rotate(angle);
    const rayGrad = ctx.createLinearGradient(22 * AppState.cameraZoom, 0, rayLen, 0);
    rayGrad.addColorStop(0, 'rgba(255,200,80,0.12)');
    rayGrad.addColorStop(1, 'rgba(255,120,0,0)');
    ctx.fillStyle = rayGrad;
    ctx.beginPath();
    ctx.moveTo(22 * AppState.cameraZoom, -1.5 * AppState.cameraZoom);
    ctx.lineTo(rayLen, 0);
    ctx.lineTo(22 * AppState.cameraZoom, 1.5 * AppState.cameraZoom);
    ctx.fill();
    ctx.rotate(-angle);
  }
  ctx.restore();

  const sunPulse = 1 + 0.02 * Math.sin(time * 0.004);
  const sunR = 30 * sunPulse * AppState.cameraZoom;
  const sunGrad = ctx.createRadialGradient(cx - 5, cy - 5, 2, cx, cy, sunR);
  sunGrad.addColorStop(0, '#fff8e0');
  sunGrad.addColorStop(0.3, '#ffe44d');
  sunGrad.addColorStop(0.7, '#ffaa00');
  sunGrad.addColorStop(1, '#ff6600');
  ctx.beginPath();
  ctx.arc(cx, cy, sunR, 0, Math.PI * 2);
  ctx.fillStyle = sunGrad;
  ctx.fill();

  const coreGrad = ctx.createRadialGradient(cx - 3, cy - 3, 0, cx, cy, sunR * 0.6);
  coreGrad.addColorStop(0, 'rgba(255,255,255,0.8)');
  coreGrad.addColorStop(1, 'rgba(255,255,255,0)');
  ctx.beginPath();
  ctx.arc(cx, cy, sunR * 0.6, 0, Math.PI * 2);
  ctx.fillStyle = coreGrad;
  ctx.fill();
}
