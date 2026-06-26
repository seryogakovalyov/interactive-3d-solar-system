import { EPOCH_MS } from '../config/constants.js';

let simTime = Date.now();
let liveMode = true;
let simSpeed = 1;
let isPaused = false;

export function getPlanetAngle(planet) {
  const daysSinceEpoch = (simTime - EPOCH_MS) / 86400000;
  const phase = planet.phaseAtEpoch ?? 0;
  return phase + (daysSinceEpoch / planet.periodDays) * Math.PI * 2;
}

export function formatSimTime(ms) {
  const d = new Date(ms);
  return d.toLocaleString();
}

export function advanceTime(dt) {
  if (liveMode) {
    simTime = Date.now();
    return 'LIVE';
  }

  if (isPaused) {
    return 'PAUSED';
  }

  const rawSpeed = parseFloat(simSpeed);
  simSpeed = Math.max(0, rawSpeed);
  simTime += (dt / 1000) * simSpeed * 86400000;

  const display = simSpeed >= 100 ? Math.round(simSpeed) : simSpeed.toFixed(1);
  return display + ' days/sec';
}

export function setTime(ms) { simTime = ms; }
export function setSpeed(s) { simSpeed = s; }
export function setLiveMode(l) { liveMode = l; }
export function setPaused(p) { isPaused = p; }

export const Time = {
  get time() { return simTime; },
  get liveMode() { return liveMode; },
  get simSpeed() { return simSpeed; },
  get isPaused() { return isPaused; },
  get daysSinceEpoch() { return (simTime - EPOCH_MS) / 86400000; },
  formatSimTime: (ms) => { const d = new Date(ms); return d.toLocaleString(); }
};
