/**
 * Story 3.1: 3D场景+容器 - 单元测试
 *
 * 验收标准: 球形容器在场景中央可见，线框+发光边缘
 */

jest.mock('three', () => {
  // jest.mock factory cannot reference outside variables
  // We create mocks here and store them via a lazy pattern
  const makeMock = () => {
    const mocks = {
      mesh: {
        add: jest.fn(),
        position: { set: jest.fn() },
        rotation: { set: jest.fn() }
      },
      renderer: {
        setSize: jest.fn(),
        setPixelRatio: jest.fn(),
        setClearColor: jest.fn(),
        render: jest.fn(),
        domElement: null // Will be set later
      },
      scene: {
        add: jest.fn()
      }
    };

    return {
      WebGLRenderer: jest.fn(() => mocks.renderer),
      PerspectiveCamera: jest.fn(() => ({
        position: { set: jest.fn(), z: 0 },
        lookAt: jest.fn()
      })),
      Scene: jest.fn(() => mocks.scene),
      AmbientLight: jest.fn(() => ({})),
      PointLight: jest.fn(() => ({ position: { set: jest.fn() } })),
      SphereGeometry: jest.fn(() => ({})),
      WireframeGeometry: jest.fn(() => ({})),
      LineSegments: jest.fn(() => Object.assign({}, mocks.mesh)),
      LineBasicMaterial: jest.fn(() => ({})),
      Color: jest.fn(() => ({})),
      TorusGeometry: jest.fn(() => ({})),
      MeshBasicMaterial: jest.fn(() => ({ opacity: 0, transparent: false })),
      Mesh: jest.fn(() => Object.assign({}, mocks.mesh)),
      REVISION: '184',
      _mocks: mocks
    };
  };

  return makeMock();
});

describe('Story 3.1: 3D场景+容器', () => {
  let THREE;
  let initScene;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    THREE = require('three');
    // Set up a real DOM canvas
    THREE._mocks.renderer.domElement = document.createElement('canvas');

    initScene = require('../../src/renderer/three-scene').initScene;
  });

  describe('渲染器初始化', () => {
    it('应该创建 WebGLRenderer', () => {
      initScene(document.body);
      expect(THREE.WebGLRenderer).toHaveBeenCalled();
      expect(THREE.WebGLRenderer).toHaveBeenCalledWith({ alpha: true, antialias: true });
    });

    it('应该设置渲染器尺寸和像素比', () => {
      initScene(document.body);
      const renderer = THREE._mocks.renderer;
      expect(renderer.setSize).toHaveBeenCalled();
      expect(renderer.setPixelRatio).toHaveBeenCalled();
    });

    it('应该将 Canvas 添加到容器元素中', () => {
      const container = document.createElement('div');
      initScene(container);
      expect(container.children.length).toBeGreaterThan(0);
    });
  });

  describe('相机', () => {
    it('应该创建 PerspectiveCamera', () => {
      initScene(document.body);
      expect(THREE.PerspectiveCamera).toHaveBeenCalled();
    });
  });

  describe('光照', () => {
    it('应该创建环境光', () => {
      initScene(document.body);
      expect(THREE.AmbientLight).toHaveBeenCalled();
    });

    it('应该创建点光源', () => {
      initScene(document.body);
      expect(THREE.PointLight).toHaveBeenCalled();
    });
  });

  describe('球形容器', () => {
    it('应该创建球体几何体', () => {
      initScene(document.body);
      expect(THREE.SphereGeometry).toHaveBeenCalled();
    });

    it('应该创建线框几何体', () => {
      initScene(document.body);
      expect(THREE.WireframeGeometry).toHaveBeenCalled();
    });

    it('应该创建线框线段', () => {
      initScene(document.body);
      expect(THREE.LineSegments).toHaveBeenCalled();
      expect(THREE.LineBasicMaterial).toHaveBeenCalled();
    });

    it('应该将线框球体添加到场景中', () => {
      initScene(document.body);
      expect(THREE._mocks.scene.add).toHaveBeenCalled();
    });
  });

  describe('霓虹发光边缘', () => {
    it('应该创建环形几何体作为发光边缘', () => {
      initScene(document.body);
      expect(THREE.TorusGeometry).toHaveBeenCalled();
    });

    it('发光边缘应该使用霓虹色材质', () => {
      initScene(document.body);
      expect(THREE.MeshBasicMaterial).toHaveBeenCalled();
    });
  });

  describe('场景对象', () => {
    it('应该返回包含 renderer/scene/camera 的对象', () => {
      const result = initScene(document.body);
      expect(result).toHaveProperty('renderer');
      expect(result).toHaveProperty('scene');
      expect(result).toHaveProperty('camera');
    });
  });
});
