/**
 * Story 3.2: cannon-es 物理世界管理
 *
 * 管理物理世界、小球（物理体+视觉网格）、空闲微动
 *
 * @param {Function} createTexture - (iconData) => THREE.Texture
 */

const CANNON = require('cannon-es');
const THREE = require('three');

const BALL_RADIUS = 0.35;
const CONTAINER_RADIUS = 3;

class PhysicsWorld {
  constructor(createTexture, scene) {
    this.world = new CANNON.World();
    this.world.gravity.set(0, -9.82, 0);

    this.world.solver = new CANNON.GSSolver();
    this.world.solver.iterations = 10;

    this.balls = []; // { id, body, mesh }
    this.scene = scene || null;
    this._createTexture = createTexture || this._defaultCreateTexture;
  }

  createBalls(apps) {
    apps.forEach((app) => this._createBall(app.id, app.name, app.icon));
  }

  addBall(app) {
    this._createBall(app.id, app.name, app.icon);
  }

  removeBall(appId) {
    const index = this.balls.findIndex((b) => b.id === appId);
    if (index === -1) return;

    const ball = this.balls[index];
    this.world.removeBody(ball.body);
    if (this.scene && ball.mesh) {
      this.scene.remove(ball.mesh);
    }
    this.balls.splice(index, 1);
  }

  getBallCount() {
    return this.balls.length;
  }

  getBall(index) {
    return this.balls[index] || null;
  }

  step(dt) {
    this.world.step(1 / 60, dt, 3);

    var maxDist = CONTAINER_RADIUS - BALL_RADIUS;
    this.balls.forEach(function(ball) {
      var pos = ball.body.position;
      var dist = Math.sqrt(pos.x * pos.x + pos.y * pos.y + pos.z * pos.z);
      if (dist > maxDist) {
        var scale = maxDist / dist;
        ball.body.position.set(pos.x * scale, pos.y * scale, pos.z * scale);
        ball.body.velocity.x *= 0.5;
        ball.body.velocity.y *= 0.5;
        ball.body.velocity.z *= 0.5;
      }
      ball.mesh.position.copy(ball.body.position);
      ball.mesh.quaternion.copy(ball.body.quaternion);
    });
  }

  applyIdleMicroMovement() {
    this.balls.forEach((ball) => {
      const fx = (Math.random() - 0.5) * 0.5;
      const fy = (Math.random() - 0.5) * 0.3 + 0.2;
      const fz = (Math.random() - 0.5) * 0.5;
      ball.body.velocity.set(
        ball.body.velocity.x + fx * 0.1,
        ball.body.velocity.y + fy * 0.1,
        ball.body.velocity.z + fz * 0.1
      );
    });
  }

  _createBall(id, name, iconData) {
    const shape = new CANNON.Sphere(BALL_RADIUS);
    const body = new CANNON.Body({
      mass: 1,
      linearDamping: 0.3,
      angularDamping: 0.3
    });
    body.addShape(shape);

    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * (CONTAINER_RADIUS - BALL_RADIUS) * 0.5;
    body.position.set(
      Math.cos(angle) * radius,
      -CONTAINER_RADIUS + BALL_RADIUS + Math.random() * 0.5,
      Math.sin(angle) * radius
    );

    this.world.addBody(body);

    const geometry = new THREE.SphereGeometry(BALL_RADIUS, 32, 32);
    const texture = this._createTexture(iconData);
    const material = new THREE.MeshBasicMaterial({
      map: texture,
      color: 0xffffff
    });
    const mesh = new THREE.Mesh(geometry, material);

    // Add mesh to scene so it's visible
    if (this.scene) {
      this.scene.add(mesh);
    }

    this.balls.push({ id, body, mesh, name });
  }

  _defaultCreateTexture() {
    return new THREE.CanvasTexture(document.createElement('canvas'));
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { PhysicsWorld, BALL_RADIUS, CONTAINER_RADIUS };
}
