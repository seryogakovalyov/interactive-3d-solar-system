const SIZE = 256;

function seededRandom(seed) {
  let s = seed;
  return function() {
    s = (s * 16807 + 0) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function getTextureContext() {
  const tc = document.createElement('canvas');
  tc.width = SIZE; tc.height = SIZE;
  return tc;
}

function hexToRgb(hex) {
  return [parseInt(hex.slice(1,3),16), parseInt(hex.slice(3,5),16), parseInt(hex.slice(5,7),16)];
}

function drawJupiter(t, rng) {
  const bandColors = ['#c4956a','#a67549','#d4a87a','#b8855a','#c89463','#8c633d','#dcc09a','#a07040','#d8b88a','#b08060','#c49468','#9e7050'];
  const bandCount = 16;
  for (let y = 0; y < SIZE; y++) {
    const bandIdx = (y / SIZE) * bandCount;
    const bandFrac = bandIdx - Math.floor(bandIdx);
    const ci = Math.floor(bandIdx) % bandColors.length;
    const ci2 = (Math.floor(bandIdx) + 1) % bandColors.length;
    const turbulence = (rng() - 0.5) * 4;
    const alpha = 0.55 + rng() * 0.35;
    const [r1,g1,b1] = hexToRgb(bandColors[ci]);
    const [r2,g2,b2] = hexToRgb(bandColors[ci2]);
    const r = Math.round(r1 + (r2 - r1) * bandFrac + turbulence);
    const g = Math.round(g1 + (g2 - g1) * bandFrac + turbulence * 0.7);
    const b = Math.round(b1 + (b2 - b1) * bandFrac + turbulence * 0.5);
    t.fillStyle = `rgba(${r},${g},${b},${alpha})`;
    t.fillRect(0, y, SIZE, 1);
  }

  for (let i = 0; i < 9; i++) {
    const bandY = 144 + i * 2.7;
    const bend = 4.5 * Math.sin((i / 8) * Math.PI);
    t.beginPath();
    t.moveTo(96, bandY);
    t.bezierCurveTo(116, bandY, 120, bandY - bend, 130, bandY - bend);
    t.bezierCurveTo(141, bandY - bend, 149, bandY + bend, 158, bandY + bend);
    t.bezierCurveTo(169, bandY + bend, 174, bandY, 188, bandY);
    t.strokeStyle = `rgba(${125+rng()*45},${76+rng()*34},${43+rng()*24},${0.08+rng()*0.09})`;
    t.lineWidth = 0.8 + rng() * 1.5;
    t.stroke();
  }

  t.save();
  t.translate(140, 0);
  t.scale(0.7, 1);
  t.translate(-140, 0);

  for (let i = 0; i < 4; i++) {
    const spread = i * 1.4;
    t.beginPath();
    t.moveTo(124 - spread, 154);
    t.bezierCurveTo(126, 146 - spread * 0.2, 135, 143 - spread, 143, 145);
    t.bezierCurveTo(153 + spread, 146, 158 + spread, 151, 156 + spread, 158);
    t.bezierCurveTo(154, 165 + spread * 0.4, 145, 167 + spread, 136, 165);
    t.bezierCurveTo(128 - spread, 164, 122 - spread, 160, 124 - spread, 154);
    t.closePath();
    t.fillStyle = `rgba(132,61,43,${0.055 + i * 0.022})`;
    t.fill();
  }

  t.beginPath();
  t.moveTo(126, 153);
  t.bezierCurveTo(128, 147, 134, 145, 140, 146);
  t.bezierCurveTo(146, 144, 154, 148, 155, 153);
  t.bezierCurveTo(158, 158, 151, 163, 145, 163);
  t.bezierCurveTo(139, 166, 130, 163, 127, 159);
  t.bezierCurveTo(124, 157, 125, 155, 126, 153);
  t.closePath();
  t.fillStyle = 'rgba(158,72,48,0.44)';
  t.fill();

  t.beginPath();
  t.moveTo(132, 153);
  t.bezierCurveTo(134, 149, 139, 148, 143, 149);
  t.bezierCurveTo(149, 149, 152, 152, 150, 156);
  t.bezierCurveTo(149, 160, 143, 161, 138, 159);
  t.bezierCurveTo(133, 160, 129, 156, 132, 153);
  t.closePath();
  t.fillStyle = 'rgba(119,54,43,0.34)';
  t.fill();

  for (let i = 0; i < 8; i++) {
    const strokeY = 149 + i * 1.7 + (rng() - 0.5);
    t.beginPath();
    t.moveTo(121 + rng() * 3, strokeY);
    t.bezierCurveTo(130, strokeY - 2 + rng() * 4, 143, strokeY + 2 - rng() * 4, 158 - rng() * 3, strokeY + (rng() - 0.5) * 2);
    t.strokeStyle = i % 3 === 0
      ? `rgba(212,132,86,${0.1+rng()*0.08})`
      : `rgba(104,51,39,${0.07+rng()*0.08})`;
    t.lineWidth = 0.6 + rng() * 1.1;
    t.stroke();
  }
  t.restore();

  for (let i = 0; i < 30; i++) {
    t.beginPath();
    const sx = rng() * SIZE, sy = 40 + rng() * 176, sw = 15 + rng() * 40, sh = 1 + rng() * 3;
    t.ellipse(sx, sy, sw, sh, 0, 0, Math.PI * 2);
    t.fillStyle = `rgba(${140+rng()*80},${100+rng()*80},${50+rng()*60},${0.08+rng()*0.1})`;
    t.fill();
  }
}

function drawSaturn(t, rng) {
  const bandColors = ['#dfca94','#d7c18a','#cdb77e','#e2ce9c','#d5bf86','#cbb47b','#dcc793'];
  const bandCount = 12;
  for (let y = 0; y < SIZE; y++) {
    const bandIdx = (y / SIZE) * bandCount;
    const bandFrac = bandIdx - Math.floor(bandIdx);
    const ci = Math.floor(bandIdx) % bandColors.length;
    const ci2 = (Math.floor(bandIdx) + 1) % bandColors.length;
    const turbulence = (rng() - 0.5) * 2;
    const [r1,g1,b1] = hexToRgb(bandColors[ci]);
    const [r2,g2,b2] = hexToRgb(bandColors[ci2]);
    const r = Math.round(r1 + (r2 - r1) * bandFrac + turbulence);
    const g = Math.round(g1 + (g2 - g1) * bandFrac + turbulence);
    const b = Math.round(b1 + (b2 - b1) * bandFrac + turbulence);
    t.fillStyle = `rgba(${r},${g},${b},0.7)`;
    t.fillRect(0, y, SIZE, 1);
  }

  for (let i = 0; i < 7; i++) {
    t.beginPath();
    t.ellipse(rng()*SIZE, 30+rng()*200, 3+rng()*7, 1+rng()*2.5, rng()*0.2, 0, Math.PI*2);
    t.fillStyle = `rgba(225,208,165,${0.08+rng()*0.1})`;
    t.fill();
  }
}

function drawEarth(t, rng) {
  t.fillStyle = '#2a5a9a';
  t.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < 200; i++) {
    t.beginPath();
    t.ellipse(rng()*SIZE, rng()*SIZE, 5+rng()*30, 3+rng()*15, rng()*Math.PI, 0, Math.PI*2);
    t.fillStyle = `rgba(${20+rng()*30},${70+rng()*50},${120+rng()*60},${0.1+rng()*0.15})`;
    t.fill();
  }

  const continentDefs = [
    { x: 80, y: 60, w: 50, h: 70, rot: 0.2 },
    { x: 140, y: 50, w: 40, h: 40, rot: -0.1 },
    { x: 160, y: 100, w: 25, h: 50, rot: 0 },
    { x: 190, y: 65, w: 60, h: 45, rot: 0.15 },
    { x: 220, y: 150, w: 30, h: 25, rot: -0.2 },
  ];
  for (const c of continentDefs) {
    t.save();
    t.translate(c.x, c.y);
    t.rotate(c.rot);
    for (let j = 0; j < 12; j++) {
      t.beginPath();
      t.ellipse((rng()-0.5)*c.w*0.6, (rng()-0.5)*c.h*0.6,
        5+rng()*c.w*0.35, 5+rng()*c.h*0.35, rng()*Math.PI, 0, Math.PI*2);
      const g = 80 + rng()*80;
      t.fillStyle = `rgba(${40+rng()*40},${g},${30+rng()*30},${0.35+rng()*0.3})`;
      t.fill();
    }
    t.restore();
  }

  for (let i = 0; i < 80; i++) {
    t.beginPath();
    t.ellipse(rng()*SIZE, rng()*SIZE, 8+rng()*25, 2+rng()*6, rng()*Math.PI, 0, Math.PI*2);
    t.fillStyle = `rgba(240,245,255,${0.06+rng()*0.12})`;
    t.fill();
  }

  t.fillStyle = 'rgba(240,245,255,0.5)';
  t.fillRect(0, 0, SIZE, 18);
  t.fillRect(0, SIZE-18, SIZE, 18);
}

function drawMars(t, rng) {
  t.fillStyle = '#c46838';
  t.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < 300; i++) {
    t.beginPath();
    t.ellipse(rng()*SIZE, rng()*SIZE, 2+rng()*15, 2+rng()*10, rng()*Math.PI, 0, Math.PI*2);
    const r = 140+rng()*60, g = 50+rng()*50, b = 20+rng()*30;
    t.fillStyle = `rgba(${r},${g},${b},${0.1+rng()*0.2})`;
    t.fill();
  }

  for (let i = 0; i < 6; i++) {
    t.beginPath();
    t.ellipse(rng()*SIZE, 30+rng()*190, 15+rng()*35, 10+rng()*25, rng()*Math.PI, 0, Math.PI*2);
    t.fillStyle = `rgba(100,40,20,${0.12+rng()*0.15})`;
    t.fill();
  }

  t.fillStyle = 'rgba(240,235,230,0.48)';
  t.fillRect(0, 0, SIZE, 9);
  t.fillStyle = 'rgba(238,232,225,0.34)';
  t.fillRect(0, SIZE - 6, SIZE, 6);

  t.beginPath();
  t.arc(100, 100, 4.5, 0, Math.PI*2);
  t.fillStyle = 'rgba(180,100,50,0.3)';
  t.fill();
  t.beginPath();
  t.arc(100, 100, 2, 0, Math.PI*2);
  t.fillStyle = 'rgba(210,145,85,0.24)';
  t.fill();
}

function drawMercury(t, rng) {
  t.fillStyle = '#8a8078';
  t.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < 400; i++) {
    t.beginPath();
    t.ellipse(rng()*SIZE, rng()*SIZE, 1+rng()*8, 1+rng()*5, rng()*Math.PI, 0, Math.PI*2);
    t.fillStyle = `rgba(${70+rng()*80},${65+rng()*75},${60+rng()*70},${0.1+rng()*0.2})`;
    t.fill();
  }

  for (let i = 0; i < 25; i++) {
    const cx = rng()*SIZE, cy = rng()*SIZE, cr = 2+rng()*7;
    t.beginPath();
    t.arc(cx, cy, cr, 0, Math.PI*2);
    t.strokeStyle = `rgba(50,45,40,${0.2+rng()*0.3})`;
    t.lineWidth = 1+rng();
    t.stroke();
    t.beginPath();
    t.arc(cx-1, cy-1, cr*0.7, 0, Math.PI*2);
    t.fillStyle = `rgba(60,55,50,${0.15+rng()*0.15})`;
    t.fill();
  }
}

function drawVenus(t, rng) {
  t.fillStyle = '#d8c888';
  t.fillRect(0, 0, SIZE, SIZE);

  for (let i = 0; i < 150; i++) {
    t.beginPath();
    t.ellipse(rng()*SIZE, rng()*SIZE, 10+rng()*40, 2+rng()*8, -0.3+rng()*0.6, 0, Math.PI*2);
    t.fillStyle = `rgba(${200+rng()*55},${180+rng()*55},${120+rng()*60},${0.08+rng()*0.15})`;
    t.fill();
  }

  for (let i = 0; i < 20; i++) {
    t.beginPath();
    t.arc(rng()*SIZE, rng()*SIZE, 6+rng()*14, 0, Math.PI*2);
    t.strokeStyle = `rgba(225,205,150,${0.05+rng()*0.07})`;
    t.lineWidth = 1;
    t.stroke();
  }
}

function drawUranus(t, rng) {
  const uColors = ['#83ccda','#7fc7d6','#79c1d1','#8bd3df','#80c8d7','#86cbd9','#91d5df'];
  for (let y = 0; y < SIZE; y++) {
    const frac = (y / SIZE) * uColors.length;
    const ci = Math.floor(frac) % uColors.length;
    const ci2 = (ci + 1) % uColors.length;
    const f = frac - Math.floor(frac);
    const [r1,g1,b1] = hexToRgb(uColors[ci]);
    const [r2,g2,b2] = hexToRgb(uColors[ci2]);
    t.fillStyle = `rgba(${Math.round(r1+(r2-r1)*f)},${Math.round(g1+(g2-g1)*f)},${Math.round(b1+(b2-b1)*f)},0.7)`;
    t.fillRect(0, y, SIZE, 1);
  }

  for (let i = 0; i < 40; i++) {
    t.beginPath();
    t.ellipse(rng()*SIZE, rng()*SIZE, 15+rng()*35, 1+rng()*4, rng()*0.2, 0, Math.PI*2);
    t.fillStyle = `rgba(200,240,250,${0.05+rng()*0.08})`;
    t.fill();
  }
}

function drawNeptune(t, rng) {
  const nColors = ['#3a5ac8','#4a6ae0','#2a4ab0','#5a7af0','#3a58c0','#4a68d8','#2848a8'];
  for (let y = 0; y < SIZE; y++) {
    const frac = (y / SIZE) * nColors.length;
    const ci = Math.floor(frac) % nColors.length;
    const ci2 = (ci + 1) % nColors.length;
    const f = frac - Math.floor(frac);
    const [r1,g1,b1] = hexToRgb(nColors[ci]);
    const [r2,g2,b2] = hexToRgb(nColors[ci2]);
    t.fillStyle = `rgba(${Math.round(r1+(r2-r1)*f)},${Math.round(g1+(g2-g1)*f)},${Math.round(b1+(b2-b1)*f)},0.7)`;
    t.fillRect(0, y, SIZE, 1);
  }

  t.beginPath();
  t.ellipse(130, 120, 11, 6.5, 0.1, 0, Math.PI*2);
  t.fillStyle = 'rgba(20,30,100,0.28)';
  t.fill();

  for (let i = 0; i < 15; i++) {
    t.beginPath();
    t.ellipse(rng()*SIZE, rng()*SIZE, 10+rng()*25, 1+rng()*3, rng()*0.2, 0, Math.PI*2);
    t.fillStyle = `rgba(180,200,255,${0.08+rng()*0.12})`;
    t.fill();
  }
}

const PLANET_DRIVERS = {
  Jupiter: drawJupiter,
  Saturn: drawSaturn,
  Earth: drawEarth,
  Mars: drawMars,
  Mercury: drawMercury,
  Venus: drawVenus,
  Uranus: drawUranus,
  Neptune: drawNeptune
};

export function getPlanetTexture(planet) {
  if (planet._tex) return planet._tex;

  const tc = getTextureContext();
  const t = tc.getContext('2d');

  const seed = planet.name.split('').reduce((a, c) => a + c.charCodeAt(0), 0);
  const rng = seededRandom(seed);

  const drawFn = PLANET_DRIVERS[planet.name];
  if (drawFn) {
    drawFn(t, rng);
  }

  planet._tex = tc;
  return tc;
}

export function getPlanetTexturePixels(planet) {
  if (planet._texPixels) return planet._texPixels;
  const tex = getPlanetTexture(planet);
  return tex.getContext('2d').getImageData(0, 0, tex.width, tex.height).data;
}
