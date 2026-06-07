/**
 * Story 3.2: 物理世界+小球 - 单元测试
 *
 * 验收标准: 小球堆积在容器底部缓慢漂浮微动，与应用列表同步增删
 */

// Mock cannon-es
const mockWorld = {
  addBody: jest.fn(),
  removeBody: jest.fn(),
  step: jest.fn(),
  gravity: { set: jest.fn() },
  bodies: []
};

jest.mock('cannon-es', () => ({
  World: jest.fn(() => mockWorld),
  Body: jest.fn(() => ({
    position: { set: jest.fn(), x: 0, y: 0, z: 0 },
    velocity: { set: jest.fn(), x: 0, y: 0, z: 0 },
    quaternion: { x: 0, y: 0, z: 0, w: 1 },
    addShape: jest.fn(),
    mass: 0,
    linearDamping: 0,
    angularDamping: 0
  })),
  Sphere: jest.fn(),
  Vec3: jest.fn(() => ({ x: 0, y: 0, z: 0 })),
  GSSolver: jest.fn(() => ({})),
  NarrowPhase: jest.fn(() => ({})),
  ContactMaterial: jest.fn(() => ({})),
  Material: jest.fn(() => ({}))
}));

// Mock Three.js (for mesh creation)
jest.mock('three', () => ({
  SphereGeometry: jest.fn(() => ({})),
  Mesh: jest.fn(() => ({
    position: { set: jest.fn(), copy: jest.fn() },
    quaternion: { set: jest.fn(), copy: jest.fn() }
  })),
  MeshStandardMaterial: jest.fn(() => ({})),
  MeshBasicMaterial: jest.fn(() => ({})),
  CanvasTexture: jest.fn(() => ({})),
  Canvas: jest.fn(() => ({
    getContext: jest.fn(() => ({
      drawImage: jest.fn(),
      fillStyle: '',
      fillRect: jest.fn(),
      beginPath: jest.fn(),
      arc: jest.fn(),
      fill: jest.fn(),
      clip: jest.fn()
    }))
  }))
}));

describe('Story 3.2: 物理世界+小球', () => {
  let CANNON;
  let PhysicsWorld;
  let mockCreateTexture;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    // Reset world bodies
    mockWorld.bodies = [];

    CANNON = require('cannon-es');
    PhysicsWorld = require('../../src/renderer/physics').PhysicsWorld;

    // Mock texture factory to avoid jsdom canvas limitation
    mockCreateTexture = jest.fn(() => ({}));
  });

  describe('物理世界初始化', () => {
    it('应该创建 CANNON.World', () => {
      new PhysicsWorld(mockCreateTexture);
      expect(CANNON.World).toHaveBeenCalled();
    });

    it('应该设置重力', () => {
      new PhysicsWorld(mockCreateTexture);
      expect(mockWorld.gravity.set).toHaveBeenCalled();
    });
  });

  describe('小球创建', () => {
    it('应该根据应用数据创建小球', () => {
      const world = new PhysicsWorld(mockCreateTexture);
      const apps = [
        { id: '1', name: 'App1', icon: 'data:image/png;base64,icon1' },
        { id: '2', name: 'App2', icon: 'data:image/png;base64,icon2' }
      ];

      world.createBalls(apps);
      expect(world.getBallCount()).toBe(2);
    });

    it('每个球应该有物理体和视觉网格', () => {
      const world = new PhysicsWorld(mockCreateTexture);
      const apps = [{ id: '1', name: 'App1', icon: 'data:image/png;base64,icon1' }];

      world.createBalls(apps);
      const ball = world.getBall(0);

      expect(ball).toHaveProperty('body');
      expect(ball).toHaveProperty('mesh');
    });

    it('球体物理应该添加到世界', () => {
      const world = new PhysicsWorld(mockCreateTexture);
      const apps = [{ id: '1', name: 'App1', icon: 'data:image/png;base64,icon1' }];

      world.createBalls(apps);
      expect(mockWorld.addBody).toHaveBeenCalled();
    });
  });

  describe('小球增删', () => {
    it('应该能删除指定小球', () => {
      const world = new PhysicsWorld(mockCreateTexture);
      const apps = [
        { id: '1', name: 'App1', icon: 'icon1' },
        { id: '2', name: 'App2', icon: 'icon2' }
      ];
      world.createBalls(apps);

      world.removeBall('1');
      expect(world.getBallCount()).toBe(1);
    });

    it('应该能新增单个小球', () => {
      const world = new PhysicsWorld(mockCreateTexture);
      world.createBalls([{ id: '1', name: 'App1', icon: 'icon1' }]);

      world.addBall({ id: '2', name: 'App2', icon: 'icon2' });
      expect(world.getBallCount()).toBe(2);
    });
  });

  describe('物理同步', () => {
    it('step 应该调用 world.step', () => {
      const world = new PhysicsWorld(mockCreateTexture);
      world.step(1 / 60);
      expect(mockWorld.step).toHaveBeenCalled();
    });
  });

  describe('空闲微动', () => {
    it('空闲状态应该对球体施加微弱的随机力', () => {
      const world = new PhysicsWorld(mockCreateTexture);
      world.createBalls([{ id: '1', name: 'App1', icon: 'icon1' }]);

      world.applyIdleMicroMovement();
      const ball = world.getBall(0);
      // Velocity should be non-zero (micro movement)
      expect(ball.body.velocity.set).toHaveBeenCalled();
    });
  });
});
