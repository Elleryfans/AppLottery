/**
 * Story 1.2: 窗口配置 - 单元测试
 */

const mockBrowserWindow = {
  setFullScreen: jest.fn(),
  isFullScreen: jest.fn(),
  on: jest.fn(),
  loadFile: jest.fn(),
  close: jest.fn()
};

// Mock electron-store to avoid ESM issues in tests
jest.mock('electron-store', () => {
  return jest.fn(() => ({
    get: jest.fn(() => []),
    set: jest.fn()
  }));
});

jest.mock('electron', () => ({
  app: {
    whenReady: jest.fn().mockResolvedValue(),
    on: jest.fn(),
    quit: jest.fn()
  },
  BrowserWindow: jest.fn(() => mockBrowserWindow),
  dialog: {
    showOpenDialog: jest.fn()
  },
  ipcMain: {
    handle: jest.fn(),
    on: jest.fn()
  }
}));

describe('Story 1.2: 窗口配置', () => {
  let createWindow;
  let BrowserWindow;
  let ipcMain;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    const electron = require('electron');
    BrowserWindow = electron.BrowserWindow;
    ipcMain = electron.ipcMain;

    const main = require('../../src/main/main');
    createWindow = main.createWindow;

    // Call createWindow synchronously for testing
    createWindow();
  });

  describe('全屏无边框窗口', () => {
    it('应该以 frameless: true 创建窗口', () => {
      const callArgs = BrowserWindow.mock.calls[0]?.[0];
      expect(callArgs).toBeDefined();
      expect(callArgs.frame).toBe(false);
    });

    it('应该以 fullscreen: true 创建窗口', () => {
      const callArgs = BrowserWindow.mock.calls[0]?.[0];
      expect(callArgs).toBeDefined();
      expect(callArgs.fullscreen).toBe(true);
    });

    it('应该设置 webPreferences 包含 contextIsolation', () => {
      const callArgs = BrowserWindow.mock.calls[0]?.[0];
      expect(callArgs.webPreferences).toBeDefined();
      expect(callArgs.webPreferences.contextIsolation).toBe(true);
      expect(callArgs.webPreferences.nodeIntegration).toBe(false);
    });
  });

  describe('ESC 键全屏切换', () => {
    it('窗口应该注册 keydown 事件监听', () => {
      expect(mockBrowserWindow.on).toHaveBeenCalledWith(
        'keydown',
        expect.any(Function)
      );
    });

    it('ESC 键应该切换全屏状态', () => {
      mockBrowserWindow.isFullScreen.mockReturnValue(true);

      // Get the keydown handler that was registered
      const keydownCall = mockBrowserWindow.on.mock.calls.find(
        ([eventName]) => eventName === 'keydown'
      );
      const keydownHandler = keydownCall[1];

      // Trigger ESC
      keydownHandler({ key: 'Escape' });

      expect(mockBrowserWindow.setFullScreen).toHaveBeenCalledWith(false);
    });
  });

  describe('退出按钮', () => {
    it('ipcMain 应该注册 exit-app handler', () => {
      expect(ipcMain.handle).toHaveBeenCalledWith(
        'exit-app',
        expect.any(Function)
      );
    });
  });
});
