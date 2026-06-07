/**
 * Story 4.1: 漏球动画控制器
 *
 * 随机选择中奖小球 → 引导小球向底部出口运动 → 掉落并放大
 */

const DROP_DURATION = 1; // seconds

class DropController {
  constructor(balls) {
    this.balls = balls;
    this.winnerBall = null;
    this._state = 'idle'; // idle | dropping | dropped
    this._elapsed = 0;
  }

  /**
   * Randomly select a winner from the ball list
   */
  selectWinner() {
    const index = Math.floor(Math.random() * this.balls.length);
    this.winnerBall = this.balls[index];
    return this.winnerBall;
  }

  /**
   * Start the drop animation
   */
  startDrop() {
    if (!this.winnerBall) return;
    this._state = 'dropping';
    this._elapsed = 0;
    this.winnerBall.body.wakeUp();
  }

  /**
   * Update drop animation
   * @param {number} dt - Time delta in seconds
   */
  update(dt) {
    if (this._state !== 'dropping') return;

    this._elapsed += dt;

    if (this._elapsed >= DROP_DURATION) {
      this._state = 'dropped';
      return;
    }

    const progress = this._elapsed / DROP_DURATION;

    // Guide winner toward bottom exit
    const guideForce = 20 * (1 + progress * 2);

    var CANNON = require('cannon-es');
    // Pull toward exit center at bottom
    this.winnerBall.body.applyForce(
      new CANNON.Vec3(-this.winnerBall.body.position.x * guideForce * 0.5, -guideForce, -this.winnerBall.body.position.z * guideForce * 0.5),
      new CANNON.Vec3(0, 0, 0)
    );

    // Gradually enlarge winner ball
    const scale = 1 + progress * 2; // Grow from 1x to 3x
    this.winnerBall.mesh.scale.set(scale, scale, scale);
  }

  cancel() {
    this._state = 'cancelled';
    this._elapsed = 0;
  }

  getState() {
    return this._state;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { DropController, DROP_DURATION };
}
