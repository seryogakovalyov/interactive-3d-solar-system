const stars = [];

export function rebuildStars(vw, vh) {
  stars.length = 0;
  const count = Math.max(170, Math.floor((vw * vh) / 5200));
  for (let i = 0; i < count; i++) {
    const sizeRoll = Math.random();
    const brightnessRoll = Math.random();
    stars.push({
      x: Math.random() * vw,
      y: Math.random() * vh,
      r: 0.35 + Math.pow(sizeRoll, 2.8) * 1.25,
      brightness: 0.18 + Math.pow(brightnessRoll, 2.2) * 0.62,
      twinkleAmount: 0.04 + Math.random() * 0.12,
      twinkleSpeed: 0.00035 + Math.random() * 0.00085,
      twinkleOffset: Math.random() * Math.PI * 2
    });
  }
}

export function drawStarfield(ctx, time, vw, vh) {
  ctx.fillStyle = 'rgba(0,0,0,1)';
  ctx.fillRect(0, 0, vw, vh);

  const grd = ctx.createRadialGradient(vw/2, vh/2, 80, vw/2, vh/2, Math.max(vw, vh)*0.7);
  grd.addColorStop(0, '#0a0e1a');
  grd.addColorStop(0.5, '#050810');
  grd.addColorStop(1, '#010208');
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, vw, vh);

  for (const s of stars) {
    const twinkle = 0.5 + 0.5 * Math.sin(time * s.twinkleSpeed + s.twinkleOffset);
    const alpha = s.brightness * (1 - s.twinkleAmount + twinkle * s.twinkleAmount);
    ctx.beginPath();
    ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(220,230,255,${alpha})`;
    ctx.fill();

    if (s.r > 1.25 && s.brightness > 0.55) {
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r * 2.4, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(200,220,255,${alpha * 0.045})`;
      ctx.fill();
    }
  }
}

export const Starfield = {
  get stars() { return stars; }
};
