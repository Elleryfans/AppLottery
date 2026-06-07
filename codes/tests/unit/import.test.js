/**
 * Story 2.1: 添加应用导入逻辑 - 单元测试
 *
 * 测试完整的导入流程：解析 → 校验 → 去重 → 上限检查 → 保存
 */

const fs = require('fs');

// Mock dependencies
jest.mock('../../src/main/services/shortcut', () => ({
  parseShortcut: jest.fn()
}));

jest.mock('../../src/main/services/icon', () => ({
  extractIcon: jest.fn()
}));

// Mock electron-store to isolate state
const mockStoreData = { apps: [] };
jest.mock('electron-store', () => {
  return jest.fn(() => ({
    get: jest.fn((key, defaultValue) => mockStoreData[key] || defaultValue),
    set: jest.fn((key, value) => { mockStoreData[key] = value; })
  }));
});

describe('Story 2.1: 导入逻辑', () => {
  let shortcutService;
  let iconService;
  let storeService;
  let importApp;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset store state
    mockStoreData.apps = [];

    shortcutService = require('../../src/main/services/shortcut');
    iconService = require('../../src/main/services/icon');
    storeService = require('../../src/main/services/store');
    importApp = require('../../src/main/services/import').importApp;

    // Default successful mocks
    shortcutService.parseShortcut.mockResolvedValue({
      targetPath: 'C:\\Program Files\\TestApp\\app.exe',
      appName: 'TestApp'
    });
    iconService.extractIcon.mockResolvedValue('data:image/png;base64,fakeicon');
  });

  describe('正常流程', () => {
    it('应该完整执行：解析→校验→提取图标→保存', async () => {
      // Mock fs.existsSync to return true
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      const result = await importApp('C:\\test.lnk', storeService);

      expect(shortcutService.parseShortcut).toHaveBeenCalledWith('C:\\test.lnk');
      expect(iconService.extractIcon).toHaveBeenCalledWith('C:\\Program Files\\TestApp\\app.exe');
      expect(result).toBeDefined();
      expect(result.name).toBe('TestApp');
      expect(result.path).toBe('C:\\test.lnk');
      expect(result.icon).toBe('data:image/png;base64,fakeicon');
      expect(result.id).toBeDefined();

      fs.existsSync.mockRestore();
    });
  });

  describe('目标校验', () => {
    it('目标 .exe 不存在时应该抛出错误', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(false);

      await expect(importApp('C:\\bad.lnk', storeService))
        .rejects
        .toThrow('目标应用不存在，请检查快捷方式是否有效');

      fs.existsSync.mockRestore();
    });
  });

  describe('去重检查', () => {
    it('路径重复时应该抛出错误', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Pre-populate store with the same path
      storeService.addApp({
        name: 'Existing',
        path: 'C:\\test.lnk',
        icon: 'existing-icon'
      });

      await expect(importApp('C:\\test.lnk', storeService))
        .rejects
        .toThrow('该应用已在抽奖列表中');

      fs.existsSync.mockRestore();
    });
  });

  describe('上限检查', () => {
    it('达到30个上限时应该抛出错误', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);

      // Fill store to max
      for (let i = 0; i < 30; i++) {
        storeService.addApp({
          name: `App${i}`,
          path: `C:\\app${i}.lnk`,
          icon: `icon-${i}`
        });
      }

      await expect(importApp('C:\\newapp.lnk', storeService))
        .rejects
        .toThrow('已达应用数量上限（30个）');

      fs.existsSync.mockRestore();
    });
  });

  describe('解析失败', () => {
    it('快捷方式解析失败时应该抛出错误', async () => {
      shortcutService.parseShortcut.mockRejectedValue(new Error('无法解析该快捷方式'));

      await expect(importApp('C:\\invalid.lnk', storeService))
        .rejects
        .toThrow('无法解析该快捷方式');
    });
  });

  describe('图标提取失败', () => {
    it('图标提取失败时应该抛出错误', async () => {
      jest.spyOn(fs, 'existsSync').mockReturnValue(true);
      iconService.extractIcon.mockRejectedValue(new Error('无法提取应用图标'));

      await expect(importApp('C:\\noicon.lnk', storeService))
        .rejects
        .toThrow('无法提取应用图标');

      fs.existsSync.mockRestore();
    });
  });
});
