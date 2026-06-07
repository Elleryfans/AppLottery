/**
 * Story 3.3: 搅拌动画 - 单元测试
 *
 * 验收标准: 小球在容器内翻滚碰撞，动画流畅，减速自然
 */

// Mock physics world
const mockBalls = [];
const mockWorld = {
  step: jest.fn(),
  gravity: { set: jest.fn() },
  addBody: jest.fn(),
  removeBody: jest.fn(),
  bodies: []
};

jest.mock('../../src/renderer/physics', () => ({
  PhysicsWorld: jest.fn(() => ({
    balls: mockBalls,
    world: mockWorld,
    step: jest.fn(),
    getBallCount: jest.fn(() => mockBalls.length),
    getBall: jest.fn((i) => mockBalls[i] || null),
    applyIdleMicroMovement: jest.fn()
  }))
}));

describe('Story 3.3: 搅拌动画', () => {
  let StirringController;

  // Create mock ball helper
  function createMockBall(id) {
    return {
      id,
      body: {
        position: { set: jest.fn(), x: 0, y: 0, z: 0 },
        velocity: { set: jest.fn(), x: 0, y: 0, z: 0 },
        angularVelocity: { set: jest.fn(), x: 0, y: 0, z: 0 },
        applyForce: jest.fn(),
        applyTorque: jest.fn(),
        wakeUp: jest.fn(),
        sleep: jest.fn()
      },
      mesh: {
        position: { copy: jest.fn() },
        quaternion: { copy: jest.fn() }
      }
    };
  }

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    mockBalls.length = 0;

    StirringController = require('../../src/renderer/stirring').StirringController;
  });

  describe('搅拌开始', () => {
    it('应该将状态设置为 stirring', () => {
      const controller = new StirringController(mockBalls, 3);
      controller.start();
      expect(controller.isRunning()).toBe(true);
    });

    it('应该对每个球施加搅拌力', () => {
      mockBalls.push(createMockBall('1'), createMockBall('2'), createMockBall('3'));
      const controller = new StirringController(mockBalls, 3);

      controller.start();
      controller.update(0.016); // Simulate one frame

      // Each ball should have forces applied
      mockBalls.forEach((ball) => {
        expect(ball.body.wakeUp).toHaveBeenCalled();
      });
    });
  });

  describe('减速效果', () => {
    it('搅拌强度应该随时间递减', () => {
      mockBalls.push(createMockBall('1'), createMockBall('2'));
      const controller = new StirringController(mockBalls, 3);

      controller.start();

      // Early in animation
      controller.update(0.5); // 0.5s into animation
      const earlyIntensity = controller.getCurrentIntensity();

      // Late in animation
      controller.update(2.5); // 3s into animation
      const lateIntensity = controller.getCurrentIntensity();

      expect(lateIntensity).toBeLessThan(earlyIntensity);
    });
  });

  describe('搅拌结束', () => {
    it('超过持续时间后应该自动停止', () => {
      mockBalls.push(createMockBall('1'));
      const controller = new StirringController(mockBalls, 3);

      controller.start();
      controller.update(3.1); // Past duration

      expect(controller.isRunning()).toBe(false);
    });
  });

  describe('取消搅拌', () => {
    it('应该能中途取消搅拌', () => {
      mockBalls.push(createMockBall('1'));
      const controller = new StirringController(mockBalls, 3);

      controller.start();
      expect(controller.isRunning()).toBe(true);

      controller.cancel();
      expect(controller.isRunning()).toBe(false);
    });
  });

  describe('持续时间', () => {
    it('应该根据球数量调整持续时间', () => {
      // More balls → shorter per-ball but longer total
      const ctrl1 = new StirringController([createMockBall('1')], 3);
      const ctrl2 = new StirringController(
        Array.from({ length: 10 }, (_, i) => createMockBall(String(i))),
        5
      );

      expect(ctrl2.getDuration()).toBeGreaterThanOrEqual(ctrl1.getDuration());
    });
  });
});
