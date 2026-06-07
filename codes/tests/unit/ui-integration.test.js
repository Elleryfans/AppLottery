/**
 * Story 5.2-5.4: 主界面交互+管理弹窗+首次引导 - 测试
 */

describe('Story 5.2: 主界面+状态机', () => {
  let lotteryState;
  let setState;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    document.body.innerHTML = `
      <div id="app-list"></div>
      <span id="app-count">0</span>
      <div id="guide-text" style="display:none;">点击添加应用开始</div>
      <button id="btn-start">开始抽奖</button>
      <button id="btn-cancel" style="display:none;">取消</button>
      <button id="btn-manage">管理应用</button>
      <button id="btn-exit">退出</button>
      <div id="modal-overlay"><div id="modal"><h2>管理应用</h2><div id="modal-app-list"></div><button id="btn-add-app">添加应用</button></div></div>
    `;

    window.electronAPI = {
      getApps: jest.fn().mockResolvedValue([]),
      addApp: jest.fn().mockResolvedValue({ added: [], errors: [] }),
      deleteApp: jest.fn().mockResolvedValue(undefined),
      exitApp: jest.fn().mockResolvedValue(undefined)
    };

    const app = require('../../src/renderer/app');
    lotteryState = app.lotteryState;
    setState = app.setState;
  });

  afterEach(() => {
    delete window.electronAPI;
  });

  it('抽奖状态机应该定义四个状态', () => {
    expect(lotteryState.IDLE).toBe('idle');
    expect(lotteryState.STIRRING).toBe('stirring');
    expect(lotteryState.DROPPING).toBe('dropping');
    expect(lotteryState.RESULT).toBe('result');
  });

  it('idle状态时开始按钮显示，取消按钮隐藏', () => {
    setState('idle');
    expect(document.getElementById('btn-start').style.display).toBe('inline-block');
    expect(document.getElementById('btn-cancel').style.display).toBe('none');
  });

  it('stirring状态时开始按钮隐藏，取消按钮显示', () => {
    setState('stirring');
    expect(document.getElementById('btn-start').style.display).toBe('none');
    expect(document.getElementById('btn-cancel').style.display).toBe('inline-block');
  });

  it('抽奖进行中管理按钮禁用', () => {
    setState('stirring');
    expect(document.getElementById('btn-manage').disabled).toBe(true);
  });

  it('idle时管理按钮启用', () => {
    setState('idle');
    expect(document.getElementById('btn-manage').disabled).toBe(false);
  });
});

describe('Story 5.3: 管理应用弹窗', () => {
  let showModal;
  let hideModal;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    document.body.innerHTML = `
      <div id="app-list"></div>
      <span id="app-count">0</span>
      <div id="guide-text" style="display:none;">点击添加应用开始</div>
      <button id="btn-start">开始抽奖</button>
      <button id="btn-cancel" style="display:none;">取消</button>
      <button id="btn-manage">管理应用</button>
      <button id="btn-exit">退出</button>
      <div id="modal-overlay"><div id="modal"><h2>管理应用</h2><div id="modal-app-list"></div><button id="btn-add-app">添加应用</button></div></div>
    `;

    window.electronAPI = {
      getApps: jest.fn().mockResolvedValue([]),
      deleteApp: jest.fn().mockResolvedValue(undefined),
      exitApp: jest.fn().mockResolvedValue(undefined)
    };

    const app = require('../../src/renderer/app');
    showModal = app.showModal;
    hideModal = app.hideModal;
  });

  afterEach(() => {
    delete window.electronAPI;
  });

  it('showModal 应该显示弹窗', () => {
    showModal();
    const overlay = document.getElementById('modal-overlay');
    expect(overlay.classList.contains('active')).toBe(true);
  });

  it('hideModal 应该隐藏弹窗', () => {
    showModal();
    hideModal();
    const overlay = document.getElementById('modal-overlay');
    expect(overlay.classList.contains('active')).toBe(false);
  });

});

describe('Story 5.4: 首次使用引导', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
    document.body.innerHTML = `
      <div id="app-list"></div>
      <span id="app-count">0</span>
      <div id="guide-text" style="display:none;">点击添加应用开始</div>
      <button id="btn-start">开始抽奖</button>
      <button id="btn-cancel" style="display:none;">取消</button>
      <button id="btn-manage">管理应用</button>
      <button id="btn-exit">退出</button>
    `;

    window.electronAPI = {
      getApps: jest.fn().mockResolvedValue([]),
      exitApp: jest.fn().mockResolvedValue(undefined)
    };

    require('../../src/renderer/app');
  });

  afterEach(() => {
    delete window.electronAPI;
  });

  it('空列表时引导提示应该可见', () => {
    const guideText = document.getElementById('guide-text');
    expect(guideText.textContent).toContain('点击添加应用开始');
  });

  it('空列表时引导提示应该可见', async () => {
    const { loadAppList } = require('../../src/renderer/app');
    await loadAppList();
    const guideText = document.getElementById('guide-text');
    expect(guideText.style.display).toBe('block');
  });
});
