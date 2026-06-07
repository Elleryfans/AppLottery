/**
 * Story 1.4: 数据存储层 - 单元测试
 *
 * 验收标准: 应用数据可读写，重启后数据保留
 * 数据结构: { apps: [{ id, name, path, icon }] }
 */

const mockStore = {
  get: jest.fn(),
  set: jest.fn()
};

jest.mock('electron-store', () => {
  return jest.fn(() => mockStore);
});

describe('Story 1.4: 数据存储层', () => {
  let store;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    // Reset mock defaults
    mockStore.get.mockReturnValue([]);
    mockStore.set.mockReturnValue(undefined);

    store = require('../../src/main/services/store');
  });

  describe('getApps', () => {
    it('应该返回应用列表', () => {
      const apps = store.getApps();
      expect(mockStore.get).toHaveBeenCalledWith('apps', []);
      expect(Array.isArray(apps)).toBe(true);
    });

    it('空数据时应该返回空数组', () => {
      mockStore.get.mockReturnValue([]);
      const apps = store.getApps();
      expect(apps).toEqual([]);
    });

    it('已有数据时应该返回完整列表', () => {
      const existingApps = [
        { id: '1', name: 'App1', path: 'C:\\app1.lnk', icon: 'base64-1' },
        { id: '2', name: 'App2', path: 'C:\\app2.lnk', icon: 'base64-2' }
      ];
      mockStore.get.mockReturnValue(existingApps);
      const apps = store.getApps();
      expect(apps).toEqual(existingApps);
      expect(apps.length).toBe(2);
    });
  });

  describe('addApp', () => {
    it('应该添加应用并返回带UUID的新应用对象', () => {
      const appData = { name: 'TestApp', path: 'C:\\test.lnk', icon: 'base64-test' };
      const newApp = store.addApp(appData);

      expect(newApp).toBeDefined();
      expect(newApp.id).toBeDefined();
      expect(typeof newApp.id).toBe('string');
      expect(newApp.id.length).toBeGreaterThan(0);
      expect(newApp.name).toBe('TestApp');
      expect(newApp.path).toBe('C:\\test.lnk');
      expect(newApp.icon).toBe('base64-test');
    });

    it('应该将新应用保存到存储中', () => {
      const appData = { name: 'TestApp', path: 'C:\\test.lnk', icon: 'base64-test' };
      store.addApp(appData);

      expect(mockStore.set).toHaveBeenCalled();
      const savedData = mockStore.set.mock.calls[0][1];
      expect(Array.isArray(savedData)).toBe(true);
      expect(savedData.length).toBe(1);
      expect(savedData[0].name).toBe('TestApp');
    });

    it('应该追加到已有应用列表末尾', () => {
      const existingApps = [{ id: '1', name: 'Existing', path: 'C:\\e.lnk', icon: 'base64-e' }];
      mockStore.get.mockReturnValue(existingApps);

      store.addApp({ name: 'New', path: 'C:\\n.lnk', icon: 'base64-n' });

      const savedData = mockStore.set.mock.calls[0][1];
      expect(savedData.length).toBe(2);
      expect(savedData[0].name).toBe('Existing');
      expect(savedData[1].name).toBe('New');
    });
  });

  describe('deleteApp', () => {
    it('应该通过id删除应用', () => {
      const existingApps = [
        { id: '1', name: 'App1', path: 'C:\\a1.lnk', icon: 'base64-1' },
        { id: '2', name: 'App2', path: 'C:\\a2.lnk', icon: 'base64-2' }
      ];
      mockStore.get.mockReturnValue(existingApps);

      store.deleteApp('1');

      const savedData = mockStore.set.mock.calls[0][1];
      expect(savedData.length).toBe(1);
      expect(savedData[0].id).toBe('2');
    });

    it('删除不存在的id时应该保持列表不变', () => {
      const existingApps = [{ id: '1', name: 'App1', path: 'C:\\a1.lnk', icon: 'base64-1' }];
      mockStore.get.mockReturnValue(existingApps);

      store.deleteApp('nonexistent');

      const savedData = mockStore.set.mock.calls[0][1];
      expect(savedData.length).toBe(1);
    });
  });

  describe('getAppCount', () => {
    it('应该返回当前应用数量', () => {
      const existingApps = [
        { id: '1', name: 'A1', path: 'p1', icon: 'i1' },
        { id: '2', name: 'A2', path: 'p2', icon: 'i2' }
      ];
      mockStore.get.mockReturnValue(existingApps);

      expect(store.getAppCount()).toBe(2);
    });

    it('空列表时应该返回0', () => {
      mockStore.get.mockReturnValue([]);
      expect(store.getAppCount()).toBe(0);
    });
  });
});
