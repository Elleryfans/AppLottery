# AppLottery 🎰

**赛博朋克风格桌面应用抽奖工具**

一个基于 Electron + Three.js 的桌面应用抽奖工具，以环轨动画的形式随机抽取应用。

## 技术栈

- **框架**: Electron
- **3D引擎**: Three.js
- **物理引擎**: cannon-es
- **构建工具**: electron-builder
- **数据存储**: electron-store

## 功能特性

- 🎯 自定义添加桌面应用（.lnk / .exe / .url）到抽奖池
- 🌈 赛博朋克霓虹风格 UI + 粒子特效
- 🏆 随机抽取中奖应用并自动启动
- 🔍 系统应用搜索，快速添加
- 📦 NSIS 安装包，支持自定义安装路径

## 快速开始

```bash
# 安装依赖
npm install

# 启动应用
npm start

# 构建安装包
npm run build

# 运行测试
npm test
```

## 项目结构

```
AppLottery/
├── codes/                   # 主项目
│   ├── src/
│   │   ├── main/            # Electron 主进程
│   │   │   ├── main.js      # 主进程入口
│   │   │   ├── preload.js   # 预加载脚本
│   │   │   └── services/    # 服务模块
│   │   └── renderer/        # 渲染进程
│   │       ├── index.html   # 主页面
│   │       ├── style.css    # 样式（赛博朋克主题）
│   │       ├── app.js       # 主逻辑
│   │       ├── three-scene.js  # Three.js 场景
│   │       ├── physics.js   # 物理模拟
│   │       ├── particles.js # 粒子特效
│   │       ├── eggs.js      # 球体管理
│   │       ├── stirring.js  # 搅拌动画
│   │       ├── drop.js      # 掉落动画
│   │       └── result.js    # 结果展示
│   ├── assets/icons/        # 图标资源
│   ├── tests/               # 单元测试
│   └── package.json
├── docs/                    # 文档
│   └── prd                  # 产品需求文档
└── app-test/                # Electron 环境测试
```

## 构建安装包

```bash
cd codes
npm run build
```

构建产物在 `codes/dist/` 目录：
- `AppLottery Setup 1.0.0.exe` — NSIS 安装包
- `win-unpacked/` — 解压版（可直接运行）

## 许可

MIT
