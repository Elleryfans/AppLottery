/**
 * Story 5.5: 粒子特效 - 单元测试
 */

jest.mock('three', () => {
  const mockMaterial = { color: { set: jest.fn() }, size: 0 };
  const mockGeometry = {
    setAttribute: jest.fn(),
    attributes: { position: { array: new Float32Array(300), needsUpdate: false } }
  };
  const mockPoints = {
    rotation: { set: jest.fn(), y: 0 },
    position: { set: jest.fn() }
  };

  return {
    BufferGeometry: jest.fn(() => mockGeometry),
    Points: jest.fn(() => mockPoints),
    PointsMaterial: jest.fn(() => mockMaterial),
    BufferAttribute: jest.fn(() => ({ array: new Float32Array(300), needsUpdate: false })),
    Float32BufferAttribute: jest.fn(() => ({ array: new Float32Array(300), needsUpdate: false })),
    Color: jest.fn(() => ({})),
    AdditiveBlending: 2,
    REVISION: '184'
  };
});

describe('Story 5.5: 粒子特效', () => {
  let THREE;
  let createParticles;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    THREE = require('three');
    createParticles = require('../../src/renderer/particles').createParticles;
  });

  it('应该创建 BufferGeometry', () => {
    createParticles(200);
    expect(THREE.BufferGeometry).toHaveBeenCalled();
  });

  it('应该使用 THREE.Points 创建粒子系统', () => {
    createParticles(200);
    expect(THREE.Points).toHaveBeenCalled();
  });

  it('应该创建 PointsMaterial', () => {
    createParticles(200);
    expect(THREE.PointsMaterial).toHaveBeenCalled();
  });

  it('应该接受自定义粒子数量', () => {
    createParticles(500);
    expect(THREE.BufferGeometry).toHaveBeenCalled();
    expect(THREE.BufferAttribute).toHaveBeenCalled();
  });

  it('返回的粒子对象应该有 update 方法', () => {
    const particles = createParticles(100);
    expect(typeof particles.update).toBe('function');
  });

  it('update 应该不抛出异常', () => {
    const particles = createParticles(100);
    expect(() => particles.update(0.016)).not.toThrow();
  });
});
