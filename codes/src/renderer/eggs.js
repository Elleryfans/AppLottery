/**
 * 赛博朋克线框彩蛋 — 与蓝色网格球风格统一
 */
var THREE = require('three');

function createEggs(scene, count) {
  count = count || 8;
  var eggs = [];
  var ringRadius = 3;

  for (var i = 0; i < count; i++) {
    // Wireframe icosahedron as "egg"
    var geom = new THREE.IcosahedronGeometry(0.5, 1);
    var mat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      wireframe: true,
      transparent: true,
      opacity: 0.7
    });
    var mesh = new THREE.Mesh(geom, mat);

    // Inner glowing sphere
    var innerGeom = new THREE.SphereGeometry(0.35, 16, 16);
    var innerMat = new THREE.MeshBasicMaterial({
      color: 0x00ffff,
      transparent: true,
      opacity: 0.1
    });
    var innerSphere = new THREE.Mesh(innerGeom, innerMat);
    mesh.add(innerSphere);

    // Position in ring
    var angle = (i / count) * Math.PI * 2;
    mesh.position.set(
      Math.cos(angle) * ringRadius,
      Math.sin(angle * 2) * 0.4,
      Math.sin(angle) * ringRadius
    );
    mesh.userData = {
      angle: angle,
      ringRadius: ringRadius,
      innerSphere: innerSphere,
      baseOpacity: 0.7
    };

    scene.add(mesh);
    eggs.push(mesh);
  }

  return eggs;
}

function updateEggRing(eggs, dt, speed) {
  speed = speed || 0.5;
  for (var i = 0; i < eggs.length; i++) {
    var egg = eggs[i];
    egg.userData.angle += dt * speed;
    var a = egg.userData.angle;
    var r = egg.userData.ringRadius;
    egg.position.x = Math.cos(a) * r;
    egg.position.z = Math.sin(a) * r;
    egg.position.y = Math.sin(a * 3) * 0.4;
    egg.rotation.x += dt * speed * 0.3;
    egg.rotation.y += dt * speed * 0.5;
    egg.rotation.z += dt * speed * 0.2;

    // Pulse glow
    var pulse = 0.6 + Math.sin(Date.now() * 0.004 + i) * 0.3;
    egg.material.opacity = egg.userData.baseOpacity * pulse;
  }
}

function animateEggCrack(egg, callback, dt) {
  if (!egg.userData.crackPhase) {
    egg.userData.crackPhase = 0;
    egg.userData.crackOrigin = egg.position.clone();
  }
  egg.userData.crackPhase += dt * 3;
  var phase = egg.userData.crackPhase;

  if (phase < 0.6) {
    // Shake — stay cyan, increase glow
    var shake = Math.sin(phase * 30) * (1 - phase) * 0.15;
    egg.position.x = egg.userData.crackOrigin.x + shake;
    egg.position.y = egg.userData.crackOrigin.y + shake;
    egg.material.opacity = 1;
    egg.userData.innerSphere.material.opacity = 0.4;
  } else if (phase < 1.2) {
    // Expand and fade lines
    var s = 1 + (phase - 0.6) * 3;
    egg.scale.setScalar(s);
    egg.material.opacity = Math.max(0, 1 - (phase - 0.6) * 2);
  } else {
    egg.visible = false;
    if (callback) callback();
    return true;
  }
  return false;
}

module.exports = { createEggs, updateEggRing, animateEggCrack };
