import { PHASES_2026 } from './planets.js';

export const ASTEROID_COUNT = 360;

const ASTEROID_COLORS = [
  [142, 134, 124],
  [126, 119, 112],
  [111, 113, 116],
  [151, 137, 119],
  [103, 100, 98]
];

export function buildAsteroidBelt() {
  const asteroids = [];

  for (let i = 0; i < ASTEROID_COUNT; i++) {
    const radialMix = (Math.random() + Math.random()) * 0.5;
    const orbitRadius = 198 + radialMix * 34;
    const radiusProgress = (orbitRadius - 198) / 34;
    const clusterAngle = (i % 7) / 7 * Math.PI * 2;
    const useCluster = Math.random() < 0.28;
    const phaseAtEpoch = useCluster
      ? clusterAngle + (Math.random() - 0.5) * 0.5
      : Math.random() * Math.PI * 2;
    const size = 0.6 + Math.pow(Math.random(), 2.1) * 1.2;
    const brightness = 0.42 + Math.random() * 0.34;
    const baseColor = ASTEROID_COLORS[Math.floor(Math.random() * ASTEROID_COLORS.length)];

    asteroids.push({
      orbitRadius,
      phaseAtEpoch,
      periodDays: (1250 + radiusProgress * 1050) * (0.94 + Math.random() * 0.12),
      eccentricity: Math.random() * 0.025,
      eccentricityAngle: Math.random() * Math.PI * 2,
      size,
      color: `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${brightness})`,
      glowColor: `rgba(${baseColor[0]},${baseColor[1]},${baseColor[2]},${brightness * 0.14})`,
      bright: size > 1.45 && Math.random() < 0.55
    });
  }

  return asteroids;
}
