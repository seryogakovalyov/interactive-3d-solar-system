export const PHASES_2026 = {
  Mercury: 4.037,
  Venus:   3.438,
  Earth:   4.761,
  Mars:    0.412,
  Jupiter: 2.059,
  Saturn:  0.238,
  Uranus:  1.164,
  Neptune: 0.048
};

export const MOON_SYSTEMS = {
  Earth: [
    { name:'Moon', periodDays:27.321661, orbitRadiusFactor:2.0, radius:2.6, color:'#d8d8cf', phaseOffset:1.2 }
  ],
  Jupiter: [
    { name:'Io', periodDays:1.769, orbitRadiusFactor:1.55, radius:1.8, color:'#f1d27a', phaseOffset:0.4 },
    { name:'Europa', periodDays:3.551, orbitRadiusFactor:1.95, radius:1.7, color:'#d8d0b0', phaseOffset:2.1 },
    { name:'Ganymede', periodDays:7.155, orbitRadiusFactor:2.45, radius:2.1, color:'#9f9a90', phaseOffset:4.0 },
    { name:'Callisto', periodDays:16.689, orbitRadiusFactor:3.05, radius:2.0, color:'#7f7468', phaseOffset:5.4 }
  ],
  Saturn: [
    { name:'Enceladus', periodDays:1.370, orbitRadiusFactor:1.65, radius:1.4, color:'#f4f6ff', phaseOffset:0.7 },
    { name:'Rhea', periodDays:4.518, orbitRadiusFactor:2.15, radius:1.8, color:'#c9c3b8', phaseOffset:2.3 },
    { name:'Titan', periodDays:15.945, orbitRadiusFactor:2.85, radius:2.5, color:'#d2a86f', phaseOffset:4.8 },
    { name:'Iapetus', periodDays:79.321, orbitRadiusFactor:4.0, radius:1.7, color:'#b6ab96', phaseOffset:1.5 }
  ],
  Uranus: [
    { name:'Miranda', periodDays:1.413, orbitRadiusFactor:1.55, radius:1.2, color:'#c9c3bd', phaseOffset:0.8 },
    { name:'Ariel', periodDays:2.520, orbitRadiusFactor:1.9, radius:1.4, color:'#d9d7d2', phaseOffset:2.2 },
    { name:'Umbriel', periodDays:4.144, orbitRadiusFactor:2.3, radius:1.5, color:'#8f8d91', phaseOffset:4.0 },
    { name:'Titania', periodDays:8.706, orbitRadiusFactor:2.85, radius:1.9, color:'#c7bfb5', phaseOffset:5.2 },
    { name:'Oberon', periodDays:13.463, orbitRadiusFactor:3.3, radius:1.8, color:'#9a948c', phaseOffset:1.9 }
  ],
  Neptune: [
    { name:'Triton', periodDays:-5.877, orbitRadiusFactor:2.0, radius:2.2, color:'#d8cfc9', phaseOffset:1.7 },
    { name:'Proteus', periodDays:1.122, orbitRadiusFactor:1.45, radius:1.2, color:'#8f847c', phaseOffset:4.6 }
  ]
};

export const PLANET_DATA = [
  { name:'Mercury', color:'#a89d8f', radius:3.5, orbitRadius:70, diameter:'4,879 km', distance:'57.9M km', period:'88 days', type:'Rocky', tilt:0.03, glowColor:'rgba(176,168,144,0.20)', periodDays:87.969, phaseAtEpoch:PHASES_2026.Mercury, rotationPeriodDays:58.646, axialTiltDeg:0.034 },
  { name:'Venus',   color:'#d8b76f', radius:6.2, orbitRadius:100, diameter:'12,104 km', distance:'108.2M km', period:'225 days', type:'Rocky', tilt:0.05, glowColor:'rgba(232,200,122,0.22)', periodDays:224.701, phaseAtEpoch:PHASES_2026.Venus, rotationPeriodDays:-243.025, axialTiltDeg:177.36 },
  { name:'Earth',   color:'#4a90d9', radius:6.6, orbitRadius:135, diameter:'12,742 km', distance:'149.6M km', period:'365.25 days', type:'Rocky', tilt:0.25, glowColor:'rgba(74,144,217,0.28)', hasMoon:true, periodDays:365.256, phaseAtEpoch:PHASES_2026.Earth, rotationPeriodDays:1, axialTiltDeg:23.44 },
  { name:'Mars',    color:'#c95a3b', radius:5.0, orbitRadius:175, diameter:'6,779 km', distance:'227.9M km', period:'687 days', type:'Rocky', tilt:0.15, glowColor:'rgba(212,90,58,0.22)', periodDays:686.98, phaseAtEpoch:PHASES_2026.Mars, rotationPeriodDays:1.026, axialTiltDeg:25.19 },
  { name:'Jupiter', color:'#c89463', radius:15.5, orbitRadius:245, diameter:'139,820 km', distance:'778.5M km', period:'11.86 years', type:'Gas Giant', tilt:0.12, glowColor:'rgba(212,160,106,0.22)', bands:true, moons:4, periodDays:4332.59, phaseAtEpoch:PHASES_2026.Jupiter, rotationPeriodDays:0.414, axialTiltDeg:3.13 },
  { name:'Saturn',  color:'#dbc37f', radius:13.5, orbitRadius:315, diameter:'116,460 km', distance:'1.43B km', period:'29.46 years', type:'Gas Giant', tilt:0.18, glowColor:'rgba(232,208,136,0.20)', rings:true, moons:3, periodDays:10759.22, phaseAtEpoch:PHASES_2026.Saturn, rotationPeriodDays:0.444, axialTiltDeg:26.73 },
  { name:'Uranus',  color:'#7ec8d8', radius:10.2, orbitRadius:385, diameter:'50,724 km', distance:'2.87B km', period:'84.01 years', type:'Ice Giant', tilt:0.45, glowColor:'rgba(126,200,216,0.18)', periodDays:30688.5, phaseAtEpoch:PHASES_2026.Uranus, rotationPeriodDays:-0.718, axialTiltDeg:97.77 },
  { name:'Neptune', color:'#4a6ae0', radius:10.0, orbitRadius:450, diameter:'49,244 km', distance:'4.50B km', period:'164.8 years', type:'Ice Giant', tilt:0.1, glowColor:'rgba(74,106,224,0.20)', periodDays:60182, phaseAtEpoch:PHASES_2026.Neptune, rotationPeriodDays:0.671, axialTiltDeg:28.32 }
];

export function initPlanetState(planets, getAngle) {
  for (const p of planets) {
    p.angle = getAngle(p);
    p.clickAnim = 0;
    p.hovered = false;
    p._screenX = 0;
    p._screenY = 0;
    p._depth = 0;
    p._screenR = p.radius;
  }
}
