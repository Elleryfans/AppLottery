/**
 * Story 5.6 & 5.7: 霓虹光效增强 + 错误提示UI - 测试
 * Story 6.1: 打包配置 - 验证
 */

describe('Story 5.7: 错误提示UI', () => {
  let showError;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    document.body.innerHTML = '<div id="error-toast"></div>';
    window.electronAPI = { getApps: jest.fn().mockResolvedValue([]), exitApp: jest.fn() };

    showError = require('../../src/renderer/app').showError;
  });

  afterEach(() => {
    delete window.electronAPI;
  });

  it('应该显示错误消息', () => {
    jest.useFakeTimers();
    showError('测试错误');
    const toast = document.getElementById('error-toast');
    expect(toast.textContent).toBe('测试错误');
    expect(toast.classList.contains('show')).toBe(true);
    jest.useRealTimers();
  });
});

describe('Story 6.1: 打包配置', () => {
  it('package.json 应该包含 electron-builder 配置', () => {
    const pkg = require('../../package.json');
    expect(pkg.build).toBeDefined();
  });

  it('应该配置为 NSIS 安装包', () => {
    const pkg = require('../../package.json');
    expect(pkg.build.win).toBeDefined();
    expect(pkg.build.win.target).toContain('nsis');
  });

  it('应该配置应用名称和ID', () => {
    const pkg = require('../../package.json');
    expect(pkg.build.appId).toBeDefined();
    expect(pkg.build.productName).toBeDefined();
  });
});
