import { AppState } from '../engine/state.js';
import { Camera, getPlanetScreenPos } from '../engine/camera.js';
import { Time } from '../engine/time.js';

export function drawAsteroidObject(asteroid) {
  const ctx = AppState.mainCtx;
  if (asteroid.bright) {
    ctx.beginPath();
    ctx.arc(asteroid.x, asteroid.y, asteroid.r * 2.4, 0, Math.PI * 2);
    ctx.fillStyle = asteroid.glowColor;
    ctx.fill();
  }

  ctx.beginPath();
  ctx.arc(asteroid.x, asteroid.y, asteroid.r, 0, Math.PI * 2);
  ctx.fillStyle = asteroid.color;
  ctx.fill();
}

export function buildAsteroidBodies(cx, cy) {
  const bodies = [];
  const asteroids = AppState.asteroidBelt;

  for (const asteroid of asteroids) {
    const angle = asteroid.phaseAtEpoch +
      (Time.daysSinceEpoch / asteroid.periodDays) * Math.PI * 2;
    const orbitalVariation = 1 +
      asteroid.eccentricity * Math.cos(angle - asteroid.eccentricityAngle);
    const orbitRadius = asteroid.orbitRadius * orbitalVariation * AppState.cameraZoom;
    const pos = getPlanetScreenPos(cx, cy, orbitRadius, angle);
    const projectedAsteroid = {
      x: pos.x,
      y: pos.y,
      r: Math.max(0.35, asteroid.size * pos.scale * AppState.cameraZoom),
      color: asteroid.color,
      glowColor: asteroid.glowColor,
      bright: asteroid.bright
    };

    bodies.push({
      type: 'asteroid',
      depth: pos.depth,
      draw: () => drawAsteroidObject(projectedAsteroid)
    });
  }

  return bodies;
}
