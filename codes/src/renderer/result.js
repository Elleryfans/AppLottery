/**
 * Story 4.2: 结果展示控制器
 *
 * 显示中奖应用 → 霓虹聚焦 → 计时 → 通知启动
 */

const RESULT_DURATION = 2; // seconds

class ResultController {
  constructor(winner) {
    this.winner = winner; // { id, name, icon }
    this._state = 'idle'; // idle | showing | done
    this._elapsed = 0;
  }

  start() {
    this._state = 'showing';
    this._elapsed = 0;
  }

  update(dt) {
    if (this._state !== 'showing') return;

    this._elapsed += dt;
    if (this._elapsed >= RESULT_DURATION) {
      this._state = 'done';
    }
  }

  shouldAutoLaunch() {
    return this._state === 'done';
  }

  getState() {
    return this._state;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = { ResultController, RESULT_DURATION };
}
