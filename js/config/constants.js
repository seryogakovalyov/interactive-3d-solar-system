export const EPOCH_MS = Date.UTC(2026, 5, 25, 0, 0, 0);

export const MAX_PIXEL_RATIO = 2;

export const DEFAULT_CAMERA = {
  tilt: 0.68,
  rotY: 0,
  zoom: 1.15,
  panX: 0,
  panY: 0
};

export const CAMERA_LIMITS = {
  minTilt: 0.05,
  maxTilt: 1.3,
  minZoom: 0.032,
  maxZoom: 2.5,
  maxPanXRatio: 0.45,
  maxPanYRatio: 0.35
};

export const CAMERA_LERP = {
  tilt: 0.08,
  rotY: 0.08,
  zoom: 0.1,
  panX: 0.12,
  panY: 0.12
};

export const MAX_DELTA_MS = 33;
export const MIN_DELTA_MS = 16.67;

export const DEPTH_SCALE_FACTOR = 0.12;

export const GALAXY_REVEAL = {
  startZoom: 0.26,
  fullZoom: 0.055,
  maxAlpha: 0.95
};
