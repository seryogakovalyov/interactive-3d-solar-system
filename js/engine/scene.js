import { AppState } from './state.js';
import { Camera, updateCamera as updateCameraState, getPlanetScreenPos, getCameraCenter } from './camera.js';
import { Time, advanceTime, getPlanetAngle } from './time.js';
import { drawStarfield } from './starfield.js';
import { drawSun } from '../render/sun.js';
import { drawOrbitPath, drawPlanet } from '../render/planets.js';
import { buildMoonBodies } from '../render/moons.js';
import { buildAsteroidBodies } from '../render/asteroids.js';
import { MOON_SYSTEMS } from '../config/planets.js';
import { MAX_DELTA_MS, MIN_DELTA_MS } from '../config/constants.js';

let _time = 0;
let _speedLabel = 'LIVE';
let _lastTimestamp = null;

export function resetAnimationTimer() {
  _lastTimestamp = null;
}

function update(dt) {
  _speedLabel = advanceTime(dt);

  for (const p of AppState.planets) {
    p.angle = getPlanetAngle(p);
  }

  updateCameraState();
}

function render() {
  const ctx = AppState.mainCtx;
  ctx.clearRect(0, 0, AppState.viewportWidth, AppState.viewportHeight);

  const center = getCameraCenter();
  const cx = center.cx;
  const cy = center.cy;

  for (const p of AppState.planets) {
    const pos = getPlanetScreenPos(cx, cy, p.orbitRadius * AppState.cameraZoom, p.angle);
    p._screenX = pos.x;
    p._screenY = pos.y;
    p._depth = pos.depth;
    p._screenScale = pos.scale;
    p._screenR = p.radius * pos.scale * AppState.cameraZoom;
  }

  for (const p of AppState.planets) {
    drawOrbitPath(cx, cy, p.orbitRadius * AppState.cameraZoom, 'rgba(50,70,110,0.16)');
  }

  const sceneBodies = [
    { type: 'sun', depth: 0, draw: () => drawSun(cx, cy, _time) },
    ...AppState.planets.map(p => ({
      type: 'planet',
      depth: p._depth,
      draw: () => drawPlanet(p, cx, cy, _time)
    })),
    ...buildMoonBodies(),
    ...buildAsteroidBodies(cx, cy)
  ];

  sceneBodies.sort((a, b) => a.depth - b.depth);

  for (const body of sceneBodies) {
    body.draw();
  }

  const inputState = Camera.InputState;
  const selected = inputState.selectedPlanet;
  if (selected) {
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(selected._screenX, selected._screenY);
    ctx.strokeStyle = 'rgba(100,150,255,0.08)';
    ctx.lineWidth = 1;
    ctx.stroke();

    const moonDefs = MOON_SYSTEMS[selected.name];
    if (moonDefs) {
      for (const moonDef of moonDefs) {
        const moonOrbitR = selected._screenR * moonDef.orbitRadiusFactor + 6 * AppState.cameraZoom;
        ctx.beginPath();
        ctx.ellipse(selected._screenX, selected._screenY,
          moonOrbitR, moonOrbitR * Math.cos(Camera.tilt), 0, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(100,160,255,0.12)';
        ctx.lineWidth = 0.5 * AppState.cameraZoom;
        ctx.stroke();
      }
    }
  }

  return _speedLabel;
}

export function startAnimation(timeLabelEl, speedValueEl) {
  function animate(timestamp) {
    if (_lastTimestamp == null) _lastTimestamp = timestamp;
    let dt = timestamp - _lastTimestamp;
    if (dt > MAX_DELTA_MS) dt = MIN_DELTA_MS;
    dt = Math.max(0, Math.min(dt, MAX_DELTA_MS));

    _time = timestamp;
    _lastTimestamp = timestamp;

    const label = update(dt);
    if (label) _speedLabel = label;

    drawStarfield(AppState.starCtx, timestamp, AppState.viewportWidth, AppState.viewportHeight);
    render();

    if (Time.liveMode) {
      timeLabelEl.textContent = new Date().toLocaleString();
    } else if (Time.simSpeed === 0) {
      timeLabelEl.textContent = Time.formatSimTime(Time.time);
    } else {
      timeLabelEl.textContent = Time.formatSimTime(Time.time);
    }

    speedValueEl.textContent = _speedLabel;

    requestAnimationFrame(animate);
  }

  requestAnimationFrame(animate);
}
