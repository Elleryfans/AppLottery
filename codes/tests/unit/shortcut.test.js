/**
 * Story 2.1: 快捷方式解析 - 单元测试
 *
 * 测试 shortcut.js: 解析 .lnk → 目标 .exe 路径 + 应用名称
 */

// Mock the lnk module
jest.mock('lnk', () => ({
  __esModule: true,
  default: jest.fn()
}));

describe('Story 2.1: 快捷方式解析 (shortcut.js)', () => {
  let lnk;
  let parseShortcut;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    lnk = require('lnk').default;
    parseShortcut = require('../../src/main/services/shortcut').parseShortcut;
  });

  it('应该正确解析有效的 .lnk 文件', async () => {
    lnk.mockResolvedValue({
      target: 'C:\\Program Files\\TestApp\\app.exe',
      relative: '',
      workingDirectory: ''
    });

    const result = await parseShortcut('C:\\test.lnk');

    expect(result).toBeDefined();
    expect(result.targetPath).toBe('C:\\Program Files\\TestApp\\app.exe');
    expect(result.appName).toBeTruthy();
  });

  it('应该从目标路径提取应用名称', async () => {
    lnk.mockResolvedValue({
      target: 'C:\\Program Files\\MyApp\\myapp.exe',
      relative: '',
      workingDirectory: ''
    });

    const result = await parseShortcut('C:\\test.lnk');

    expect(result.appName).toBe('myapp');
  });

  it('lnk 解析失败时应该抛出错误', async () => {
    lnk.mockRejectedValue(new Error('Invalid shortcut'));

    await expect(parseShortcut('C:\\invalid.lnk'))
      .rejects
      .toThrow('无法解析该快捷方式');
  });

  it('目标路径为空时应该抛出错误', async () => {
    lnk.mockResolvedValue({
      target: '',
      relative: '',
      workingDirectory: ''
    });

    await expect(parseShortcut('C:\\empty.lnk'))
      .rejects
      .toThrow('无法解析该快捷方式');
  });
});
