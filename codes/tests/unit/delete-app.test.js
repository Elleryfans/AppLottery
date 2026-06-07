/**
 * Story 2.2: 删除应用 - 单元测试
 *
 * 验收标准: 删除功能可用
 */

// Mock electron-store to isolate state
const mockStoreData = { apps: [] };
jest.mock('electron-store', () => {
  return jest.fn(() => ({
    get: jest.fn((key, defaultValue) => mockStoreData[key] || defaultValue),
    set: jest.fn((key, value) => { mockStoreData[key] = value; })
  }));
});

describe('Story 2.2: 删除应用', () => {
  let storeService;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset store state
    mockStoreData.apps = [];

    storeService = require('../../src/main/services/store');

    // Pre-populate with test data
    storeService.addApp({ name: 'App1', path: 'C:\\a1.lnk', icon: 'icon1' });
    storeService.addApp({ name: 'App2', path: 'C:\\a2.lnk', icon: 'icon2' });
    storeService.addApp({ name: 'App3', path: 'C:\\a3.lnk', icon: 'icon3' });
  });

  describe('删除操作', () => {
    it('应该成功删除指定id的应用', () => {
      const apps = storeService.getApps();
      const appToDelete = apps[0];

      storeService.deleteApp(appToDelete.id);

      const remainingApps = storeService.getApps();
      expect(remainingApps.length).toBe(2);
      expect(remainingApps.find((a) => a.id === appToDelete.id)).toBeUndefined();
    });

    it('删除不存在的id不应该报错', () => {
      expect(() => storeService.deleteApp('nonexistent-id')).not.toThrow();
      expect(storeService.getApps().length).toBe(3);
    });

    it('删除最后一个应用后列表应该为空', () => {
      const apps = storeService.getApps();
      apps.forEach((app) => storeService.deleteApp(app.id));

      expect(storeService.getApps().length).toBe(0);
    });

    it('删除后 getAppCount 应该减1', () => {
      const countBefore = storeService.getAppCount();
      const apps = storeService.getApps();

      storeService.deleteApp(apps[0].id);

      expect(storeService.getAppCount()).toBe(countBefore - 1);
    });
  });
});
