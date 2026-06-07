/**
 * Story 1.3: preload桥接层 - 单元测试
 *
 * 验收标准: 渲染进程可通过 window.electronAPI 调用:
 *   getApps, addApp, deleteApp, launchApp, onFullscreenToggle
 */

const mockIpcRenderer = {
  invoke: jest.fn(),
  on: jest.fn()
};

jest.mock('electron', () => ({
  contextBridge: {
    exposeInMainWorld: jest.fn()
  },
  ipcRenderer: mockIpcRenderer
}));

describe('Story 1.3: preload桥接层', () => {
  let contextBridge;
  let exposedAPI;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    const electron = require('electron');
    contextBridge = electron.contextBridge;

    require('../../src/main/preload');

    // Retrieve the API object passed to exposeInMainWorld
    const calls = contextBridge.exposeInMainWorld.mock.calls;
    if (calls && calls.length > 0) {
      exposedAPI = calls[0][1]; // second arg: the API object
    }
  });

  describe('contextBridge 注册', () => {
    it('应该以 "electronAPI" 为key暴露到主世界', () => {
      expect(contextBridge.exposeInMainWorld).toHaveBeenCalledWith(
        'electronAPI',
        expect.any(Object)
      );
    });
  });

  describe('API 接口完整性', () => {
    it('应该暴露 getApps 方法', () => {
      expect(exposedAPI).toHaveProperty('getApps');
      expect(typeof exposedAPI.getApps).toBe('function');
    });

    it('应该暴露 addApp 方法', () => {
      expect(exposedAPI).toHaveProperty('addApp');
      expect(typeof exposedAPI.addApp).toBe('function');
    });

    it('应该暴露 deleteApp 方法', () => {
      expect(exposedAPI).toHaveProperty('deleteApp');
      expect(typeof exposedAPI.deleteApp).toBe('function');
    });

    it('应该暴露 launchApp 方法', () => {
      expect(exposedAPI).toHaveProperty('launchApp');
      expect(typeof exposedAPI.launchApp).toBe('function');
    });

    it('应该暴露 onFullscreenToggle 方法', () => {
      expect(exposedAPI).toHaveProperty('onFullscreenToggle');
      expect(typeof exposedAPI.onFullscreenToggle).toBe('function');
    });
  });

  describe('API IPC 通信', () => {
    it('getApps 应该通过 ipcRenderer.invoke 调用主进程', () => {
      exposedAPI.getApps();
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('get-apps');
    });

    it('addApp 应该通过 ipcRenderer.invoke 调用主进程', () => {
      exposedAPI.addApp();
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('add-app');
    });

    it('deleteApp 应该通过 ipcRenderer.invoke 调用主进程并传递 id', () => {
      const testId = 'test-uuid-123';
      exposedAPI.deleteApp(testId);
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('delete-app', testId);
    });

    it('launchApp 应该通过 ipcRenderer.invoke 调用主进程并传递路径', () => {
      const testPath = 'C:\\test\\app.exe';
      exposedAPI.launchApp(testPath);
      expect(mockIpcRenderer.invoke).toHaveBeenCalledWith('launch-app', testPath);
    });

    it('onFullscreenToggle 应该通过 ipcRenderer.on 监听主进程事件', () => {
      const callback = jest.fn();
      exposedAPI.onFullscreenToggle(callback);
      expect(mockIpcRenderer.on).toHaveBeenCalledWith(
        'fullscreen-toggle',
        expect.any(Function)
      );
    });
  });
});
