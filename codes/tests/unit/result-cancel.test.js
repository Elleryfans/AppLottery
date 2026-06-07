/**
 * Story 4.2 & 4.3: 结果展示+启动 + 取消抽奖 - 测试
 */

describe('Story 4.2: 结果展示+启动', () => {
  let ResultController;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    ResultController = require('../../src/renderer/result').ResultController;
  });

  it('应该存储中奖应用信息', () => {
    const winner = { id: '1', name: 'TestApp', icon: 'icon-data' };
    const controller = new ResultController(winner);

    expect(controller.winner).toBe(winner);
  });

  it('初始状态应为 idle', () => {
    const controller = new ResultController({ name: 'App' });
    expect(controller.getState()).toBe('idle');
  });

  it('start 应该将状态设置为 showing', () => {
    const controller = new ResultController({ name: 'App' });
    controller.start();
    expect(controller.getState()).toBe('showing');
  });

  it('2秒后应该完成', () => {
    const controller = new ResultController({ name: 'App' });
    controller.start();
    controller.update(2.1);
    expect(controller.getState()).toBe('done');
  });

  it('完成时 shouldAutoLaunch 应该返回 true', () => {
    const controller = new ResultController({ name: 'App' });
    controller.start();
    controller.update(2.0);
    expect(controller.shouldAutoLaunch()).toBe(true);
  });

  it('未完成时 shouldAutoLaunch 应该返回 false', () => {
    const controller = new ResultController({ name: 'App' });
    controller.start();
    controller.update(1.0);
    expect(controller.shouldAutoLaunch()).toBe(false);
  });
});

describe('Story 4.3: 取消抽奖', () => {
  let StirringController;
  let DropController;

  function createMockBall(id) {
    return {
      id,
      body: {
        position: { x: 0, y: 0, z: 0, set: jest.fn() },
        velocity: { x: 0, y: 0, z: 0, set: jest.fn() },
        applyForce: jest.fn(),
        wakeUp: jest.fn(),
        sleep: jest.fn()
      },
      mesh: { position: { set: jest.fn(), copy: jest.fn() }, scale: { set: jest.fn() } }
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    StirringController = require('../../src/renderer/stirring').StirringController;
    DropController = require('../../src/renderer/drop').DropController;
  });

  it('搅拌过程中取消应该停止搅拌', () => {
    const balls = [createMockBall('1'), createMockBall('2')];
    const controller = new StirringController(balls, 3);

    controller.start();
    expect(controller.isRunning()).toBe(true);

    controller.cancel();
    expect(controller.isRunning()).toBe(false);
  });

  it('漏球过程中取消应该停止漏球', () => {
    const balls = [createMockBall('1'), createMockBall('2')];
    const controller = new DropController(balls);
    controller.selectWinner();
    controller.startDrop();

    controller.cancel();
    expect(controller.getState()).toBe('cancelled');
  });

  it('取消后应该可以重新开始', () => {
    const balls = [createMockBall('1')];
    const controller = new StirringController(balls, 3);

    controller.start();
    controller.cancel();
    expect(controller.isRunning()).toBe(false);

    controller.start();
    expect(controller.isRunning()).toBe(true);
  });
});
