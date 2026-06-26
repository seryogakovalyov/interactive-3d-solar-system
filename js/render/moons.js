import { AppState } from '../engine/state.js';
import { Camera } from '../engine/camera.js';
import { Time } from '../engine/time.js';

export function drawMoonObject(moon) {
  const ctx = AppState.mainCtx;
  ctx.beginPath();
  ctx.arc(moon.x, moon.y, moon.r, 0, Math.PI * 2);

  if (moon.gradStops) {
    const mg = ctx.createRadialGradient(
      moon.x - moon.r * 0.35,
      moon.y - moon.r * 0.35,
      0,
      moon.x,
      moon.y,
      moon.r
    );
    mg.addColorStop(0, moon.gradStops[0]);
    mg.addColorStop(1, moon.gradStops[1]);
    ctx.fillStyle = mg;
  } else {
    ctx.fillStyle = moon.color;
  }

  ctx.fill();
}

export function buildMoonBodies() {
  const bodies = [];
  const moonSystems = AppState.moonSystems;

  for (const planet of AppState.planets) {
    const moonDefs = moonSystems[planet.name];
    if (!moonDefs) continue;

    const px = planet._screenX;
    const py = planet._screenY;
    const pr = planet._screenR;
    const pDepth = planet._depth;

    for (const moonDef of moonDefs) {
      const moonOrbit = pr * moonDef.orbitRadiusFactor + 6 * AppState.cameraZoom;
      const moonAngle = (Time.daysSinceEpoch / moonDef.periodDays) * Math.PI * 2 + moonDef.phaseOffset;

      const orbitX = Math.cos(moonAngle) * moonOrbit;
      const orbitZ = Math.sin(moonAngle) * moonOrbit;
      const sinRot = Math.sin(Camera.rotY);
      const cosRot = Math.cos(Camera.rotY);
      const localX = orbitX * cosRot - orbitZ * sinRot;
      const localZ = orbitX * sinRot + orbitZ * cosRot;
      const localY = localZ * Math.cos(Camera.tilt);

      const moon = {
        x: px + localX,
        y: py + localY,
        depth: pDepth + localZ,
        r: Math.max(moonDef.radius * AppState.cameraZoom, 1),
        color: moonDef.color
      };

      bodies.push({
        type: 'moon',
        depth: moon.depth,
        draw: () => drawMoonObject(moon)
      });
    }
  }

  return bodies;
}
