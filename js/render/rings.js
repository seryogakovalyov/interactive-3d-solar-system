import { AppState } from '../engine/state.js';

export const SATURN_RING_CONFIGS = [
  { inner: 1.35, outer: 1.95, color: 'rgba(210,190,140,0.5)' },
  { inner: 2.05, outer: 2.45, color: 'rgba(190,170,120,0.3)' },
  { inner: 2.5, outer: 2.75, color: 'rgba(180,160,110,0.18)' }
];

function getSaturnRingProjection() {
  const obliquity = 26.73 * Math.PI / 180;
  const nodeAngle = 32 * Math.PI / 180;
  const cosNode = Math.cos(nodeAngle);
  const sinNode = Math.sin(nodeAngle);
  const cosObliquity = Math.cos(obliquity);
  const sinObliquity = Math.sin(obliquity);
  const cosRot = Math.cos(AppState.cameraRotY);
  const sinRot = Math.sin(AppState.cameraRotY);
  const cosViewTilt = Math.cos(AppState.cameraTilt);
  const sinViewTilt = Math.sin(AppState.cameraTilt);

  function projectVector(wx, wy, wz) {
    const rx = wx * cosRot - wz * sinRot;
    const rz = wx * sinRot + wz * cosRot;
    return {
      x: rx,
      y: rz * cosViewTilt + wy * sinViewTilt,
      depth: rz * sinViewTilt - wy * cosViewTilt
    };
  }

  const axisA = projectVector(cosNode, 0, sinNode);
  const axisB = projectVector(
    -sinNode * cosObliquity,
    sinObliquity,
    cosNode * cosObliquity
  );

  return {
    axisA,
    axisB,
    nearAngle: Math.atan2(axisB.depth, axisA.depth)
  };
}

export function drawSaturnRingHalf(x, y, r, front) {
  const ctx = AppState.mainCtx;
  const projection = getSaturnRingProjection();
  const startAngle = projection.nearAngle + (front ? -Math.PI / 2 : Math.PI / 2);
  const segments = 36;

  ctx.save();

  for (const ring of SATURN_RING_CONFIGS) {
    const outerRadius = r * ring.outer;
    const innerRadius = r * ring.inner;
    ctx.beginPath();

    for (let i = 0; i <= segments; i++) {
      const angle = startAngle + (i / segments) * Math.PI;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      const px = x + outerRadius * (
        projection.axisA.x * cosAngle + projection.axisB.x * sinAngle
      );
      const py = y + outerRadius * (
        projection.axisA.y * cosAngle + projection.axisB.y * sinAngle
      );

      if (i === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }

    for (let i = segments; i >= 0; i--) {
      const angle = startAngle + (i / segments) * Math.PI;
      const cosAngle = Math.cos(angle);
      const sinAngle = Math.sin(angle);
      ctx.lineTo(
        x + innerRadius * (
          projection.axisA.x * cosAngle + projection.axisB.x * sinAngle
        ),
        y + innerRadius * (
          projection.axisA.y * cosAngle + projection.axisB.y * sinAngle
        )
      );
    }

    ctx.closePath();
    ctx.fillStyle = ring.color;
    ctx.fill();
  }

  ctx.restore();
}
