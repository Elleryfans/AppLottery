# AppLottery

**赛博朋克风格桌面应用抽奖工具**

一个基于 Electron 的桌面应用抽奖工具，以乐透搅球动画的形式随机抽取应用并自动启动。

## 技术栈

- **框架**: Electron
- **动画库**: anime.js + CSS3 3D transforms
- **构建工具**: electron-builder
- **数据存储**: electron-store
- **图标提取**: icon-extract
- **快捷方式解析**: lnk

## 功能特性

- 🎯 自定义添加桌面应用快捷方式（.lnk）到抽奖池
- 🌈 赛博朋克霓虹风格 UI + Canvas 粒子特效
- ⚡ 乐透搅球动画，3D翻滚效果
- 🏆 随机抽取中奖应用并自动启动
-  NSIS 安装包

## 快速开始

```bash
# 安装依赖
npm install

# 启动应用
npm start

# 构建安装包
npm run build
```

## 项目结构

```
AppLottery/
├── src/
│   ├── main/
│   │   ├── main.js          # 主进程入口
│   │   ├── preload.js       # 预加载脚本
│   │   └── services/
│   │       ├── store.js      # 数据存储
│   │       ├── icon.js      # 图标提取
│   │       └── launcher.js  # 应用启动
│   └── renderer/
│       ├── index.html       # 主页面
│       ├── style.css        # 样式（赛博朋克主题）
│       ├── app.js           # 渲染进程入口
│       └── animation.js     # 动画逻辑
├── assets/
│   └── icons/               # 图标资源
├── prd                      # 产品需求文档
└── package.json
```

## 视觉设计

- **主题**: 赛博朋克风格
- **主色调**: 深色背景 (#0a0a0f)
- **霓虹色**: 青色 (#00ffff)、品红 (#ff00ff)、紫色 (#9d00ff)
- **边框**: CSS box-shadow 多层发光效果
- **粒子**: Canvas 粒子系统

## 许可

MIT
