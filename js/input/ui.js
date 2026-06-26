import { AppState } from '../engine/state.js';
import { Time, setTime, setSpeed, setLiveMode, setPaused } from '../engine/time.js';

export function createInfoPanel() {
  const panel = document.getElementById('planetInfo');

  function showInfo(planet) {
    const p = panel;
    document.getElementById('infoName').innerHTML =
      `<span class="planet-dot" style="background:${planet.color};color:${planet.color}"></span>${planet.name}`;
    document.getElementById('infoDiameter').textContent = planet.diameter;
    document.getElementById('infoDistance').textContent = planet.distance;
    document.getElementById('infoPeriod').textContent = planet.period;
    document.getElementById('infoType').textContent = planet.type;

    const moonDefs = AppState.moonSystems[planet.name];
    if (moonDefs && moonDefs.length > 0) {
      const moonNames = moonDefs.map(m => `${m.name}${m.periodDays < 0 ? ' (retro)' : ''}`).join(', ');
      document.getElementById('infoMoons').textContent = moonNames;
      document.getElementById('infoMoons').closest('.stat').style.display = '';
    } else {
      document.getElementById('infoMoons').textContent = '\u2014';
      document.getElementById('infoMoons').closest('.stat').style.display = 'none';
    }

    let px = planet._screenX;
    let py = planet._screenY - planet._screenR - 20;
    px = Math.max(140, Math.min(AppState.viewportWidth - 140, px));
    py = Math.max(90, Math.min(AppState.viewportHeight - 220, py));

    p.style.left = px + 'px';
    p.style.top = py + 'px';
    p.classList.add('visible');
  }

  function hideInfo() {
    panel.classList.remove('visible');
  }

  return { showInfo, hideInfo };
}

export function initControls(nowBtn, pauseBtn, playBtn, speedSlider, speedValueEl, timeLabelEl) {
  nowBtn.addEventListener('click', () => {
    setLiveMode(true);
    setTime(Date.now());
    speedSlider.value = 100;
    speedValueEl.textContent = 'LIVE';
    timeLabelEl.textContent = new Date().toLocaleString();
    nowBtn.classList.add('active');
    pauseBtn.classList.remove('active');
    playBtn.classList.remove('active');
  });

  pauseBtn.addEventListener('click', () => {
    setLiveMode(false);
    setPaused(true);
    speedValueEl.textContent = 'PAUSED';
    timeLabelEl.textContent = Time.formatSimTime(Time.time);
    pauseBtn.classList.add('active');
    nowBtn.classList.remove('active');
    playBtn.classList.remove('active');
  });

  playBtn.addEventListener('click', () => {
    setLiveMode(false);
    setPaused(false);
    playBtn.classList.add('active');
    nowBtn.classList.remove('active');
    pauseBtn.classList.remove('active');
  });

  speedSlider.addEventListener('input', () => {
    const rawSpeed = parseFloat(speedSlider.value);
    setSpeed(Math.max(0, rawSpeed / 100));
    if (Time.simSpeed > 1.001) {
      setLiveMode(false);
      nowBtn.classList.remove('active');
      if (Time.simSpeed > 0) {
        playBtn.classList.add('active');
        pauseBtn.classList.remove('active');
      }
    }
  });
}
