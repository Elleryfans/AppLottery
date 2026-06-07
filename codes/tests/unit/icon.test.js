/**
 * Story 2.1: 图标提取 - 单元测试
 *
 * 测试 icon.js: 从 .exe 提取图标 → base64
 */

jest.mock('file-icon', () => ({
  extractIconBuffer: jest.fn()
}));

describe('Story 2.1: 图标提取 (icon.js)', () => {
  let fileIcon;
  let extractIcon;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();

    fileIcon = require('file-icon');
    extractIcon = require('../../src/main/services/icon').extractIcon;
  });

  it('应该从 .exe 提取图标并返回 base64 字符串', async () => {
    // Create a minimal PNG buffer
    const fakePngBuffer = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);
    fileIcon.extractIconBuffer.mockResolvedValue(fakePngBuffer);

    const result = await extractIcon('C:\\test\\app.exe');

    expect(result).toBeDefined();
    expect(typeof result).toBe('string');
    expect(result).toContain('data:image/png;base64,');
  });

  it('图标提取失败时应该抛出错误', async () => {
    fileIcon.extractIconBuffer.mockRejectedValue(new Error('Cannot extract'));

    await expect(extractIcon('C:\\invalid.exe'))
      .rejects
      .toThrow('无法提取应用图标');
  });
});
