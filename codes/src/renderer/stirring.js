/**
 * Story 3.3: 搅拌动画控制器
 *
 * 管理乐透机搅拌动画：多轴旋转力 + 减速效果
 */

var CANNON = require('cannon-es');

class StirringController {
  /**
   * @param {Array} balls - Array of ball objects { body, mesh }
   * @param {number} duration - Duration in seconds (3-5)
   */
  constructor(balls, duration) {
    this.balls = balls;
    this.duration = duration; // seconds
    this._running = false;
    this._elapsed = 0; // seconds
    this._baseIntensity = 15;
  }

  start() {
    this._running = true;
    this._elapsed = 0;
    // Wake all balls
    this.balls.forEach((ball) => {
      ball.body.wakeUp();
    });
  }

  /**
   * @param {number} dt - Time delta in seconds
   */
  update(dt) {
    if (!this._running) return;

    this._elapsed += dt;

    // Check if complete
    if (this._elapsed >= this.duration) {
      this._running = false;
      return;
    }

    // Decay factor: starts at 1.0, decreases to near 0
    const progress = this._elapsed / this.duration;
    const intensity = this._getIntensity(progress);

    this._applyStirringForces(intensity);
  }

  cancel() {
    this._running = false;
    this._elapsed = 0;
  }

  isRunning() {
    return this._running;
  }

  getCurrentIntensity() {
    const progress = this._elapsed / this.duration;
    return this._getIntensity(progress);
  }

  getDuration() {
    return this.duration;
  }

  // --- Private ---

  /**
   * Intensity curve: fast start, slow end (ease-out)
   */
  _getIntensity(progress) {
    // Quadratic ease-out: 1 - (1-t)^2
    const eased = 1 - Math.pow(1 - Math.min(progress, 1), 2);
    return this._baseIntensity * (1 - eased);
  }

  _applyStirringForces(intensity) {
    const time = this._elapsed;

    this.balls.forEach((ball) => {
      const body = ball.body;

      // Multi-axis rotational force around container center
      // X-Y plane stirring (main rotation)
      const fx = Math.sin(time * 3 + body.position.y) * intensity;
      const fy = Math.cos(time * 2.5 + body.position.x) * intensity * 0.8;
      const fz = Math.sin(time * 2 + body.position.z) * intensity * 0.7;

      // Apply forces as torque-like pushes
      body.applyForce(
        new CANNON.Vec3(fx, fy * 0.5, fz),
        new CANNON.Vec3(0, 0, 0)
      );

      // Random perturbation to create chaotic motion
      body.velocity.x += (Math.random() - 0.5) * intensity * 0.3;
      body.velocity.y += (Math.random() - 0.5) * intensity * 0.2;
      body.velocity.z += (Math.random() - 0.5) * intensity * 0.3;
    });
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { StirringController };
}
