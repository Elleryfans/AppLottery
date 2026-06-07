/**
 * Story 2.3: 应用列表展示 - 单元测试
 *
 * 验收标准: 列表正确展示（图标+名称），空列表时显示引导提示
 */

/**
 * @jest-environment jsdom
 */

describe('Story 2.3: 应用列表展示', () => {
  let mockElectronAPI;

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = '';

    // Set up mock DOM structure
    document.body.innerHTML = `
      <div id="app-list"></div>
      <span id="app-count">0</span>
      <div id="guide-text" style="display:none;">点击添加应用开始</div>
      <button id="btn-start">开始抽奖</button>
      <button id="btn-cancel" style="display:none;">取消</button>
      <button id="btn-manage">管理应用</button>
    `;

    // Mock window.electronAPI (in jsdom, window === global)
    mockElectronAPI = {
      getApps: jest.fn().mockResolvedValue([]),
      deleteApp: jest.fn().mockResolvedValue(undefined),
      exitApp: jest.fn().mockResolvedValue(undefined)
    };
    window.electronAPI = mockElectronAPI;

    jest.resetModules();
  });

  afterEach(() => {
    delete window.electronAPI;
  });

  describe('空列表状态', () => {
    it('空列表时应该显示引导提示', async () => {
      mockElectronAPI.getApps.mockResolvedValue([]);

      // Load the app module (simulates DOMContentLoaded)
      const { loadAppList } = require('../../src/renderer/app');
      await loadAppList();

      const guideText = document.getElementById('guide-text');
      expect(guideText.style.display).not.toBe('none');
    });

    it('空列表时应用计数应该显示0', async () => {
      mockElectronAPI.getApps.mockResolvedValue([]);

      const { loadAppList } = require('../../src/renderer/app');
      await loadAppList();

      expect(document.getElementById('app-count').textContent).toBe('0');
    });

    it('空列表时开始抽奖按钮应该禁用', async () => {
      mockElectronAPI.getApps.mockResolvedValue([]);

      const appModule = require('../../src/renderer/app');
      // Auto-init calls loadAppList; also call manually and await
      await appModule.loadAppList();

      const btnStart = document.getElementById('btn-start');
      expect(btnStart.disabled).toBe(true);
    });
  });

  describe('有应用时', () => {
    const testApps = [
      { id: '1', name: 'App1', path: 'C:\\a1.lnk', icon: 'data:image/png;base64,icon1' },
      { id: '2', name: 'App2', path: 'C:\\a2.lnk', icon: 'data:image/png;base64,icon2' }
    ];

    it('应该渲染应用列表', async () => {
      mockElectronAPI.getApps.mockResolvedValue(testApps);

      const { loadAppList } = require('../../src/renderer/app');
      await loadAppList();

      const appList = document.getElementById('app-list');
      expect(appList.children.length).toBe(2);
    });

    it('每个应用应该显示名称', async () => {
      mockElectronAPI.getApps.mockResolvedValue(testApps);

      const { loadAppList } = require('../../src/renderer/app');
      await loadAppList();

      const appList = document.getElementById('app-list');
      expect(appList.innerHTML).toContain('App1');
      expect(appList.innerHTML).toContain('App2');
    });

    it('应用计数应该正确', async () => {
      mockElectronAPI.getApps.mockResolvedValue(testApps);

      const { loadAppList } = require('../../src/renderer/app');
      await loadAppList();

      expect(document.getElementById('app-count').textContent).toBe('2');
    });

    it('有应用时引导提示应该隐藏', async () => {
      mockElectronAPI.getApps.mockResolvedValue(testApps);

      const { loadAppList } = require('../../src/renderer/app');
      await loadAppList();

      const guideText = document.getElementById('guide-text');
      expect(guideText.style.display).toBe('none');
    });

    it('有应用时开始抽奖按钮应该启用', async () => {
      mockElectronAPI.getApps.mockResolvedValue(testApps);

      const { loadAppList } = require('../../src/renderer/app');
      await loadAppList();

      const btnStart = document.getElementById('btn-start');
      expect(btnStart.disabled).toBe(false);
    });
  });
});
