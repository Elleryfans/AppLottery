/**
 * Story 4.1: 漏球动画 - 单元测试
 *
 * 验收标准: 随机选中一个小球从底部掉落并放大
 */

// Create a minimal fake for balls
function createFakeBall(id) {
  return {
    id,
    body: {
      position: { x: 0, y: 0, z: 0, set: jest.fn() },
      velocity: { x: 0, y: 0, z: 0, set: jest.fn() },
      applyForce: jest.fn(),
      applyImpulse: jest.fn(),
      wakeUp: jest.fn(),
      sleep: jest.fn(),
      mass: 1
    },
    mesh: {
      position: { x: 0, y: 0, z: 0, set: jest.fn(), copy: jest.fn() },
      scale: { set: jest.fn(), x: 1, y: 1, z: 1 }
    },
    name: 'App' + id
  };
}

describe('Story 4.1: 漏球动画', () => {
  let DropController;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    DropController = require('../../src/renderer/drop').DropController;
  });

  describe('随机选择', () => {
    it('应该从球列表中随机选中一个', () => {
      const balls = [createFakeBall('1'), createFakeBall('2'), createFakeBall('3')];
      const controller = new DropController(balls);

      const winner = controller.selectWinner();
      expect(winner).toBeDefined();
      expect(balls).toContain(winner);
    });

    it('选中后应该标记该球为winner', () => {
      const balls = [createFakeBall('1'), createFakeBall('2')];
      const controller = new DropController(balls);

      const winner = controller.selectWinner();
      expect(controller.winnerBall).toBe(winner);
    });

    it('只有一个球时应该始终选中它', () => {
      const singleBall = createFakeBall('only');
      const controller = new DropController([singleBall]);

      const winner = controller.selectWinner();
      expect(winner).toBe(singleBall);
    });
  });

  describe('漏球状态机', () => {
    it('初始状态应为 idle', () => {
      const balls = [createFakeBall('1')];
      const controller = new DropController(balls);
      expect(controller.getState()).toBe('idle');
    });

    it('start 应该将状态设置为 dropping', () => {
      const balls = [createFakeBall('1')];
      const controller = new DropController(balls);
      controller.selectWinner();
      controller.startDrop();
      expect(controller.getState()).toBe('dropping');
    });

    it('完成后状态应该变为 dropped', () => {
      const balls = [createFakeBall('1')];
      const controller = new DropController(balls);
      controller.selectWinner();
      controller.startDrop();
      controller.update(1.5); // past drop duration (1s)
      expect(controller.getState()).toBe('dropped');
    });
  });

  describe('物理引导', () => {
    it('应该对选中小球施加向下的力', () => {
      const balls = [createFakeBall('1'), createFakeBall('2')];
      const controller = new DropController(balls);

      controller.selectWinner();
      controller.startDrop();
      controller.update(0.1);

      const winner = controller.winnerBall;
      expect(winner.body.applyForce).toHaveBeenCalled();
    });

    it('其他小球不应该被施加向下的力', () => {
      const balls = [createFakeBall('1'), createFakeBall('2'), createFakeBall('3')];
      const controller = new DropController(balls);

      controller.selectWinner();
      controller.startDrop();
      controller.update(0.1);

      // Winner should have forces applied, others not
      expect(controller.winnerBall.body.applyForce).toHaveBeenCalled();
    });

    it('小球掉落过程中应该逐渐放大', () => {
      const balls = [createFakeBall('1')];
      const controller = new DropController(balls);

      controller.selectWinner();
      controller.startDrop();
      controller.update(0.5);

      const winner = controller.winnerBall;
      expect(winner.mesh.scale.set).toHaveBeenCalled();
    });
  });
});
