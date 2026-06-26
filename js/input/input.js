import { Camera, clampPan, clampZoom, TargetState } from '../engine/camera.js';
import { AppState } from '../engine/state.js';

export function initInput(inputPanel, hideInfoPanel) {
  const canvas = document.getElementById('main');

  // ===== CLICK =====
  canvas.addEventListener('click', (e) => {
    const inputState = Camera.InputState;
    if (inputState.mouseDragDistance > 4) {
      inputState.mouseDragDistance = 0;
      return;
    }

    const rect = canvas.getBoundingClientRect();
    const scaleX = AppState.viewportWidth / rect.width;
    const scaleY = AppState.viewportHeight / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    let clicked = null;
    let minDist = Infinity;

    for (const p of AppState.planets) {
      const dx = mx - p._screenX;
      const dy = my - p._screenY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      const hitR = Math.max(p._screenR + 10, 18);
      if (dist < hitR && dist < minDist) {
        minDist = dist;
        clicked = p;
      }
    }

    if (clicked) {
      inputState.selectedPlanet = clicked;
      clicked.clickAnim = 1;
      inputPanel.showInfo(clicked);
    } else {
      inputState.selectedPlanet = null;
      hideInfoPanel();
    }
  });

  // ===== MOUSE MOVE =====
  canvas.addEventListener('mousemove', (e) => {
    const inputState = Camera.InputState;
    const rect = canvas.getBoundingClientRect();
    const scaleX = AppState.viewportWidth / rect.width;
    const scaleY = AppState.viewportHeight / rect.height;
    const mx = (e.clientX - rect.left) * scaleX;
    const my = (e.clientY - rect.top) * scaleY;

    let found = false;
    for (const p of AppState.planets) {
      p.hovered = false;
      const dx = mx - p._screenX;
      const dy = my - p._screenY;
      if (Math.sqrt(dx * dx + dy * dy) < Math.max(p._screenR + 8, 15)) {
        p.hovered = true;
        canvas.style.cursor = 'pointer';
        found = true;
      }
    }
    if (!found) canvas.style.cursor = 'default';

    if (inputState.isDragging) {
      const dx = e.clientX - inputState.lastMouse.x;
      const dy = e.clientY - inputState.lastMouse.y;
      inputState.mouseDragDistance += Math.sqrt(dx * dx + dy * dy);

      if (inputState.dragMode === 'pan') {
        const rect = canvas.getBoundingClientRect();
        const scaleX = AppState.viewportWidth / rect.width;
        const scaleY = AppState.viewportHeight / rect.height;
        TargetState.panX += dx * scaleX;
        TargetState.panY += dy * scaleY;
        clampPan(AppState.viewportWidth, AppState.viewportHeight);
      } else {
        TargetState.rotY += dx * 0.005;
        TargetState.tilt = Math.max(0.05, Math.min(1.3, TargetState.tilt + dy * 0.003));
      }

      inputState.lastMouse = { x: e.clientX, y: e.clientY };
    }
  });

  // ===== MOUSE DOWN =====
  canvas.addEventListener('mousedown', (e) => {
    if (e.button === 0 || e.button === 2) {
      Camera.InputState.isDragging = true;
      Camera.InputState.dragMode = e.button === 2 || e.shiftKey ? 'pan' : 'rotate';
      Camera.InputState.lastMouse = { x: e.clientX, y: e.clientY };
      Camera.InputState.mouseDragDistance = 0;
      canvas.style.cursor = 'grabbing';
      e.preventDefault();
    }
  });

  // ===== MOUSE UP =====
  canvas.addEventListener('mouseup', () => {
    Camera.InputState.isDragging = false;
    Camera.InputState.dragMode = null;
    canvas.style.cursor = AppState.planets.some(p => p.hovered) ? 'pointer' : 'default';
  });

  canvas.addEventListener('mouseleave', () => {
    Camera.InputState.isDragging = false;
    Camera.InputState.dragMode = null;
    canvas.style.cursor = 'default';
  });

  canvas.addEventListener('contextmenu', (e) => e.preventDefault());

  // ===== WHEEL ZOOM =====
  canvas.addEventListener('wheel', (e) => {
    e.preventDefault();
    const delta = -e.deltaY * 0.001;
    TargetState.zoom += delta;
    clampZoom();
  }, { passive: false });

  // ===== KEYBOARD =====
  canvas.addEventListener('keydown', (e) => {
    const panStep = 24;
    const rotateStep = 0.12;
    let handled = true;

    switch (e.key) {
      case 'ArrowLeft':
        if (e.shiftKey) TargetState.panX -= panStep;
        else TargetState.rotY -= rotateStep;
        break;
      case 'ArrowRight':
        if (e.shiftKey) TargetState.panX += panStep;
        else TargetState.rotY += rotateStep;
        break;
      case 'ArrowUp':
        if (e.shiftKey) TargetState.panY -= panStep;
        else TargetState.tilt = Math.max(0.05, TargetState.tilt - 0.06);
        break;
      case 'ArrowDown':
        if (e.shiftKey) TargetState.panY += panStep;
        else TargetState.tilt = Math.min(1.3, TargetState.tilt + 0.06);
        break;
      case '+':
      case '=':
        TargetState.zoom += 0.12;
        clampZoom();
        break;
      case '-':
      case '_':
        TargetState.zoom -= 0.12;
        clampZoom();
        break;
      case 'r':
      case 'R':
        Camera.resetCamera();
        break;
      default:
        handled = false;
    }

    if (e.shiftKey) clampPan(AppState.viewportWidth, AppState.viewportHeight);
    if (handled) e.preventDefault();
  });

  // ===== TOUCH =====
  let touchStartPos = null;
  let touchHasMoved = false;
  let touchMode = null;
  let touchMidpoint = null;
  let touchDistance = 0;
  let touchGestureHadMultipleFingers = false;
  let lastEmptyTapTime = 0;
  let lastEmptyTapPos = null;

  function getTouchMidpoint(touches) {
    return {
      x: (touches[0].clientX + touches[1].clientX) / 2,
      y: (touches[0].clientY + touches[1].clientY) / 2
    };
  }

  function getTouchDistance(touches) {
    const dx = touches[1].clientX - touches[0].clientX;
    const dy = touches[1].clientY - touches[0].clientY;
    return Math.sqrt(dx * dx + dy * dy);
  }

  function getPlanetAtTouch(touch) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = AppState.viewportWidth / rect.width;
    const scaleY = AppState.viewportHeight / rect.height;
    const mx = (touch.clientX - rect.left) * scaleX;
    const my = (touch.clientY - rect.top) * scaleY;

    let hitPlanet = null;
    let minDist = Infinity;
    for (const p of AppState.planets) {
      const dx = mx - p._screenX;
      const dy = my - p._screenY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < Math.max(p._screenR + 15, 20) && dist < minDist) {
        hitPlanet = p;
        minDist = dist;
      }
    }
    return hitPlanet;
  }

  canvas.addEventListener('touchstart', (e) => {
    if (e.touches.length >= 2) {
      touchMode = 'panZoom';
      touchMidpoint = getTouchMidpoint(e.touches);
      touchDistance = getTouchDistance(e.touches);
      touchHasMoved = true;
      touchGestureHadMultipleFingers = true;
      Camera.InputState.isDragging = false;
    } else if (e.touches.length === 1) {
      const touch = e.touches[0];
      touchMode = 'rotate';
      touchStartPos = { x: touch.clientX, y: touch.clientY };
      touchHasMoved = false;
      touchGestureHadMultipleFingers = false;
      Camera.InputState.isDragging = true;
      Camera.InputState.lastMouse = { x: touch.clientX, y: touch.clientY };
    }
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchmove', (e) => {
    if (e.touches.length >= 2 && touchMode === 'panZoom') {
      const rect = canvas.getBoundingClientRect();
      const scaleX = AppState.viewportWidth / rect.width;
      const scaleY = AppState.viewportHeight / rect.height;
      const nextMidpoint = getTouchMidpoint(e.touches);
      const nextDistance = getTouchDistance(e.touches);

      TargetState.panX += (nextMidpoint.x - touchMidpoint.x) * scaleX;
      TargetState.panY += (nextMidpoint.y - touchMidpoint.y) * scaleY;
      clampPan(AppState.viewportWidth, AppState.viewportHeight);

      if (touchDistance > 0) {
        TargetState.zoom *= nextDistance / touchDistance;
        clampZoom();
      }

      touchMidpoint = nextMidpoint;
      touchDistance = nextDistance;
      touchHasMoved = true;
    } else if (e.touches.length === 1 && touchMode === 'rotate') {
      const touch = e.touches[0];
      const dx = touch.clientX - Camera.InputState.lastMouse.x;
      const dy = touch.clientY - Camera.InputState.lastMouse.y;

      if (touchStartPos) {
        const totalDx = touch.clientX - touchStartPos.x;
        const totalDy = touch.clientY - touchStartPos.y;
        if (Math.sqrt(totalDx * totalDx + totalDy * totalDy) > 6) {
          touchHasMoved = true;
        }
      }

      TargetState.rotY += dx * 0.005;
      TargetState.tilt = Math.max(0.05, Math.min(1.3, TargetState.tilt + dy * 0.003));
      Camera.InputState.lastMouse = { x: touch.clientX, y: touch.clientY };
    }
    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchend', (e) => {
    if (touchMode === 'panZoom' && e.touches.length < 2) {
      touchMode = null;
      touchHasMoved = true;
      Camera.InputState.isDragging = false;
    }

    if (e.touches.length === 0) {
      const wasTap = touchMode === 'rotate' &&
        !touchHasMoved &&
        !touchGestureHadMultipleFingers;

      if (wasTap) {
        const touch = e.changedTouches[0];
        const hitPlanet = getPlanetAtTouch(touch);

        if (hitPlanet) {
          Camera.InputState.selectedPlanet = hitPlanet;
          hitPlanet.clickAnim = 1;
          inputPanel.showInfo(hitPlanet);
          lastEmptyTapTime = 0;
          lastEmptyTapPos = null;
        } else {
          Camera.InputState.selectedPlanet = null;
          hideInfoPanel();

          const now = performance.now();
          const isCloseToLastTap = lastEmptyTapPos &&
            Math.hypot(
              touch.clientX - lastEmptyTapPos.x,
              touch.clientY - lastEmptyTapPos.y
            ) < 40;

          if (now - lastEmptyTapTime <= 300 && isCloseToLastTap) {
            Camera.resetCamera();
            lastEmptyTapTime = 0;
            lastEmptyTapPos = null;
          } else {
            lastEmptyTapTime = now;
            lastEmptyTapPos = { x: touch.clientX, y: touch.clientY };
          }
        }
      }

      touchMode = null;
      touchStartPos = null;
      touchMidpoint = null;
      touchDistance = 0;
      touchGestureHadMultipleFingers = false;
      Camera.InputState.isDragging = false;
    }

    e.preventDefault();
  }, { passive: false });

  canvas.addEventListener('touchcancel', (e) => {
    touchMode = null;
    touchStartPos = null;
    touchMidpoint = null;
    touchDistance = 0;
    touchHasMoved = true;
    touchGestureHadMultipleFingers = false;
    Camera.InputState.isDragging = false;
    e.preventDefault();
  });
}
