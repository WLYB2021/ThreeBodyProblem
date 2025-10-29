# 三体问题Web模拟器

一个高级、交互式的三体问题Web可视化模拟器，基于Vue 3和Three.js实现。本项目旨在以沉浸式方式展示三体系统的动态行为和混沌特性，为物理学教育和科普提供直观的可视化工具。

## 项目简介

本项目实现了一个高精度的三体系统物理模拟和可视化应用。它允许用户：
- 观察三个天体在万有引力作用下的复杂运动轨迹
- 实时调整物理参数（天体质量、时间步长等）
- 控制模拟的播放、暂停和重置
- 选择预设的经典三体场景
- 查看实时性能数据和模拟统计信息
- 通过直观的交互方式探索三体系统的混沌行为

## 功能特点

- **高精度物理模拟**：使用四阶龙格-库塔(RK4)数值积分算法保证计算精度
- **沉浸式3D可视化**：基于Three.js的高质量渲染，支持轨迹绘制
- **响应式悬浮UI**：采用现代化的悬浮式界面设计，支持拖拽操作
- **丰富的交互体验**：支持键盘快捷键、视角控制、双击重置等操作
- **预设场景系统**：提供多个经典三体场景供用户选择
- **实时性能监控**：显示FPS和模拟状态信息
- **深色主题设计**：黑色背景配合白色UI元素，提供沉浸式视觉体验

## 技术栈

- **前端框架**：Vue 3 + TypeScript
- **构建工具**：Vite
- **3D渲染**：Three.js + WebGL
- **样式**：原生CSS
- **数据存储**：LocalStorage
- **部署**：GitHub Pages

## 快速开始

### 安装与运行

1. 克隆本仓库
   ```bash
   git clone https://github.com/WLYB2021/ThreeBodyProblem.git
   cd ThreeBodyProblem/src
   ```

2. 安装依赖
   ```bash
   npm install
   ```

3. 启动开发服务器
   ```bash
   npm run dev
   ```

4. 在浏览器中访问 http://localhost:3000

### 构建与部署

1. 构建生产版本
   ```bash
   npm run build
   ```

2. 部署到GitHub Pages
   ```bash
   npm run deploy
   ```

## 使用方法

### 基本操作
- **播放/暂停**：按空格键或点击右下角播放按钮
- **重置模拟**：按R键或点击右下角重置按钮
- **隐藏/显示控制面板**：按ESC键或点击右上角设置按钮
- **视角控制**：使用鼠标拖动旋转视角，滚轮缩放
- **重置视角**：双击3D视图区域

### 控制面板
- **物理参数面板**：调整天体质量、引力常数等参数
- **设置面板**：控制轨迹显示、网格等视觉效果
- **预设场景**：选择不同的三体初始状态

## 开发指南

### 项目结构

```
ThreeBodyProblem/
├── src/
│   ├── src/
│   │   ├── assets/           # 静态资源
│   │   ├── components/       # Vue组件
│   │   ├── hooks/            # Vue组合式函数
│   │   ├── physics/          # 物理计算模块
│   │   ├── rendering/        # Three.js渲染模块
│   │   ├── utils/            # 工具函数
│   │   ├── App.vue           # 根组件
│   │   └── main.ts           # 入口文件
│   ├── index.html            # 主HTML文件
│   ├── package.json          # 项目配置
│   ├── tsconfig.json         # TypeScript配置
│   └── vite.config.ts        # Vite配置
├── docs/                     # 项目文档
└── README.md                 # 项目说明
```

### 核心实现

1. **物理计算**：使用四阶龙格-库塔(RK4)数值积分方法求解三体运动方程
2. **渲染系统**：基于Three.js实现高性能的3D渲染，包括天体绘制和轨迹显示
3. **交互框架**：使用Vue 3 Composition API构建响应式的用户界面
4. **性能优化**：实现了渲染优化和物理计算优化策略

## 贡献指南

欢迎社区贡献！如果你想参与本项目，可以：

1. 提交Bug报告或功能建议（Issue）
2. 提交代码改进（Pull Request）
3. 帮助改进文档
4. 提供翻译或无障碍功能增强

### Pull Request流程

1. Fork项目仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 确保安装依赖并通过类型检查 (`npm install && npm run type-check`)
4. 提交你的更改，使用清晰的提交信息
5. 推送到分支 (`git push origin feature/amazing-feature`)
6. 开启一个Pull Request，描述你的更改内容

### 代码规范

- 遵循Vue 3 Composition API风格
- 使用TypeScript并为所有函数和接口添加类型定义
- 组件使用PascalCase命名，变量使用camelCase命名
- 为关键算法和复杂逻辑添加详细注释
- 遵循ESLint和Prettier规范
- 确保所有UI组件具有良好的可访问性

## 部署地址

项目已部署到GitHub Pages，可通过以下地址访问：
- https://wlyb2021.github.io/ThreeBodyProblem/

## 许可证

本项目采用MIT许可证 - 详情请查看LICENSE文件

## 致谢

- Three.js团队提供优秀的3D渲染库
- 所有为本项目做出贡献的开发者
- 三体问题研究领域的科学家们

---

*如果您喜欢这个项目，请考虑给它一个Star⭐，这将帮助更多人发现它！*