/**
 * Story 5.5: 粒子特效
 *
 * Three.js Points + BufferGeometry 背景粒子系统
 * 霓虹色（青/品红/紫）漂浮粒子，与3D场景共用渲染循环
 */

const THREE = require('three');

const NEON_COLORS = [
  new THREE.Color(0x00ffff), // Cyan
  new THREE.Color(0xff00ff), // Magenta
  new THREE.Color(0x9d00ff)  // Purple
];

function createParticles(count) {
  const particleCount = count || 200;
  const positions = new Float32Array(particleCount * 3);
  const colors = new Float32Array(particleCount * 3);

  // Distribute particles in a sphere-like cloud around the container
  const radius = 5;
  for (let i = 0; i < particleCount; i++) {
    // Random position within a spherical shell
    const r = radius * (0.3 + Math.random() * 0.7);
    const theta = Math.random() * Math.PI * 2;
    const phi = Math.acos(2 * Math.random() - 1);

    positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
    positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
    positions[i * 3 + 2] = r * Math.cos(phi);

    // Random neon color
    const color = NEON_COLORS[Math.floor(Math.random() * NEON_COLORS.length)];
    colors[i * 3] = color.r;
    colors[i * 3 + 1] = color.g;
    colors[i * 3 + 2] = color.b;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  const material = new THREE.PointsMaterial({
    size: 0.04,
    vertexColors: true,
    blending: THREE.AdditiveBlending,
    depthWrite: false,
    transparent: true,
    opacity: 0.6
  });

  const points = new THREE.Points(geometry, material);

  // Store original positions for animation
  const velocities = new Float32Array(particleCount * 3);
  for (let i = 0; i < particleCount; i++) {
    velocities[i * 3] = (Math.random() - 0.5) * 0.01;
    velocities[i * 3 + 1] = (Math.random() - 0.5) * 0.01;
    velocities[i * 3 + 2] = (Math.random() - 0.5) * 0.01;
  }

  function update(dt) {
    const posAttr = geometry.attributes.position;
    const arr = posAttr.array;

    for (let i = 0; i < particleCount; i++) {
      const idx = i * 3;
      // Move particles
      arr[idx] += velocities[idx] * dt * 10;
      arr[idx + 1] += velocities[idx + 1] * dt * 10;
      arr[idx + 2] += velocities[idx + 2] * dt * 10;

      // Wrap around if too far
      const dist = Math.sqrt(arr[idx] ** 2 + arr[idx + 1] ** 2 + arr[idx + 2] ** 2);
      if (dist > radius) {
        arr[idx] *= 0.5;
        arr[idx + 1] *= 0.5;
        arr[idx + 2] *= 0.5;
        velocities[idx] = (Math.random() - 0.5) * 0.01;
        velocities[idx + 1] = (Math.random() - 0.5) * 0.01;
        velocities[idx + 2] = (Math.random() - 0.5) * 0.01;
      }
    }

    posAttr.needsUpdate = true;
    // Slow rotation for visual interest
    points.rotation.y += dt * 0.05;
  }

  return { points, update, geometry, material };
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { createParticles };
}
