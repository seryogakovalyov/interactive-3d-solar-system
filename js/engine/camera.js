import { AppState } from './state.js';
import {
  DEFAULT_CAMERA,
  CAMERA_LIMITS,
  CAMERA_LERP,
  DEPTH_SCALE_FACTOR
} from '../config/constants.js';

let cameraTilt = DEFAULT_CAMERA.tilt;
let cameraRotY = DEFAULT_CAMERA.rotY;
let cameraZoom = DEFAULT_CAMERA.zoom;
let cameraPanX = DEFAULT_CAMERA.panX;
let cameraPanY = DEFAULT_CAMERA.panY;

let targetTilt = DEFAULT_CAMERA.tilt;
let targetRotY = DEFAULT_CAMERA.rotY;
let targetZoom = DEFAULT_CAMERA.zoom;
let targetPanX = DEFAULT_CAMERA.panX;
let targetPanY = DEFAULT_CAMERA.panY;

let isDragging = false;
let dragMode = null;
let lastMouse = { x: 0, y: 0 };
let mouseDragDistance = 0;
let hoveredPlanet = null;
let selectedPlanet = null;

export function resetCamera() {
  targetTilt = DEFAULT_CAMERA.tilt;
  targetRotY = DEFAULT_CAMERA.rotY;
  targetZoom = DEFAULT_CAMERA.zoom;
  targetPanX = DEFAULT_CAMERA.panX;
  targetPanY = DEFAULT_CAMERA.panY;
}

export function clampPan(vw, vh) {
  const maxPanX = vw * CAMERA_LIMITS.maxPanXRatio;
  const maxPanY = vh * CAMERA_LIMITS.maxPanYRatio;
  targetPanX = Math.max(-maxPanX, Math.min(maxPanX, targetPanX));
  targetPanY = Math.max(-maxPanY, Math.min(maxPanY, targetPanY));
}

export function clampZoom() {
  targetZoom = Math.max(CAMERA_LIMITS.minZoom, Math.min(CAMERA_LIMITS.maxZoom, targetZoom));
}

export function updateCamera() {
  cameraTilt += (targetTilt - cameraTilt) * CAMERA_LERP.tilt;
  cameraRotY += (targetRotY - cameraRotY) * CAMERA_LERP.rotY;
  cameraZoom += (targetZoom - cameraZoom) * CAMERA_LERP.zoom;
  cameraPanX += (targetPanX - cameraPanX) * CAMERA_LERP.panX;
  cameraPanY += (targetPanY - cameraPanY) * CAMERA_LERP.panY;

  AppState.cameraTilt = cameraTilt;
  AppState.cameraRotY = cameraRotY;
  AppState.cameraZoom = cameraZoom;
  AppState.cameraPanX = cameraPanX;
  AppState.cameraPanY = cameraPanY;
}

export function getPlanetScreenPos(cx, cy, orbitR, angle) {
  const cosTilt = Math.cos(cameraTilt);
  const sinRot = Math.sin(cameraRotY);
  const cosRot = Math.cos(cameraRotY);

  const ox = Math.cos(angle);
  const oz = Math.sin(angle);

  const rx = ox * cosRot - oz * sinRot;
  const rz = ox * sinRot + oz * cosRot;

  const sx = cx + rx * orbitR;
  const sy = cy + rz * orbitR * cosTilt;

  const depth = rz * orbitR;
  const depthScale = 1 + rz * DEPTH_SCALE_FACTOR;

  return { x: sx, y: sy, depth, scale: depthScale };
}

export function getCameraCenter() {
  const vw = AppState.viewportWidth;
  const vh = AppState.viewportHeight;
  return {
    cx: vw / 2 + cameraPanX,
    cy: vh / 2 + cameraPanY
  };
}

export const TargetState = {
  get tilt() { return targetTilt; },
  get rotY() { return targetRotY; },
  get zoom() { return targetZoom; },
  get panX() { return targetPanX; },
  get panY() { return targetPanY; },
  set tilt(v) { targetTilt = v; },
  set rotY(v) { targetRotY = v; },
  set zoom(v) { targetZoom = v; },
  set panX(v) { targetPanX = v; },
  set panY(v) { targetPanY = v; }
};

export const Camera = {
  get tilt() { return cameraTilt; },
  get rotY() { return cameraRotY; },
  get zoom() { return cameraZoom; },
  get panX() { return cameraPanX; },
  get panY() { return cameraPanY; },
  get InputState() { return InputState; },
  get TargetState() { return TargetState; }
};

export const InputState = {
  get isDragging() { return isDragging; },
  get dragMode() { return dragMode; },
  get lastMouse() { return lastMouse; },
  get mouseDragDistance() { return mouseDragDistance; },
  get hoveredPlanet() { return hoveredPlanet; },
  get selectedPlanet() { return selectedPlanet; },
  set isDragging(v) { isDragging = v; },
  set dragMode(v) { dragMode = v; },
  set lastMouse(v) { lastMouse = v; },
  set mouseDragDistance(v) { mouseDragDistance = v; },
  set hoveredPlanet(v) { hoveredPlanet = v; },
  set selectedPlanet(v) { selectedPlanet = v; }
};
