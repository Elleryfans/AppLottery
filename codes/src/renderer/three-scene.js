/**
 * Story 3.1: Three.js 3D场景 + 球形容器
 *
 * 创建 WebGLRenderer、透视相机、场景、光照，
 * 以及赛博朋克风格线框球形容器 + 霓虹发光边缘
 */

const THREE = require('three');

const NEON_CYAN = 0x00ffff;
const BG_COLOR = 0x0a0a0f;
const CONTAINER_RADIUS = 3;

function initScene(container) {
  // --- Renderer ---
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setSize(container.clientWidth || window.innerWidth, container.clientHeight || window.innerHeight);
  renderer.setPixelRatio(window.devicePixelRatio || 1);
  renderer.setClearColor(BG_COLOR, 1);
  container.appendChild(renderer.domElement);

  // --- Camera ---
  const camera = new THREE.PerspectiveCamera(
    60,
    (container.clientWidth || window.innerWidth) / (container.clientHeight || window.innerHeight),
    0.1,
    100
  );
  camera.position.set(0, 0, 8);
  camera.lookAt(0, 0, 0);

  // --- Scene ---
  const scene = new THREE.Scene();

  // --- Lights ---
  const ambientLight = new THREE.AmbientLight(0x444466, 1.5);
  scene.add(ambientLight);

  const pointLight = new THREE.PointLight(NEON_CYAN, 2, 30);
  pointLight.position.set(0, 3, 5);
  scene.add(pointLight);

  const pointLight2 = new THREE.PointLight(0xff00ff, 1, 20);
  pointLight2.position.set(0, -2, 3);
  scene.add(pointLight2);

  // --- Wireframe container sphere ---
  const sphereGeom = new THREE.SphereGeometry(CONTAINER_RADIUS, 32, 32);
  const wireframeGeom = new THREE.WireframeGeometry(sphereGeom);
  const wireframeMat = new THREE.LineBasicMaterial({
    color: NEON_CYAN,
    linewidth: 1,
    transparent: true,
    opacity: 0.6
  });
  const wireframeSphere = new THREE.LineSegments(wireframeGeom, wireframeMat);
  scene.add(wireframeSphere);

  // --- Neon glow ring (equator torus) ---
  const torusGeom = new THREE.TorusGeometry(CONTAINER_RADIUS, 0.03, 16, 100);
  const torusMat = new THREE.MeshBasicMaterial({
    color: NEON_CYAN,
    transparent: true,
    opacity: 0.6
  });
  const torusRing = new THREE.Mesh(torusGeom, torusMat);
  scene.add(torusRing);

  // --- Second glow ring (vertical) ---
  const torusVertical = new THREE.Mesh(torusGeom, torusMat);
  torusVertical.rotation.x = Math.PI / 2;
  scene.add(torusVertical);

  return { renderer, scene, camera, wireframeSphere, wireframeMat };
}

// Export for tests — guarded to work in browser context
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { initScene, CONTAINER_RADIUS };
}
