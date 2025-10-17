# 三体问题Web模拟器

一个简单、有趣的三体问题Web可视化模拟器，基于Three.js实现。这个开源项目旨在以直观的方式展示三体系统的运动特性，同时保持代码简单易懂，便于社区贡献和学习。

## 项目简介

本项目使用Three.js创建一个基础的三体系统物理模拟和可视化应用。它允许用户：
- 观察三个天体在万有引力作用下的运动
- 调整天体质量参数
- 控制模拟的播放、暂停和重置
- 查看简单的天体信息

## 功能特点

- **基础三体模拟**：实现三体系统的基本物理运动
- **简单参数控制**：可调整天体质量等参数
- **3D可视化**：使用Three.js展示天体运动
- **预设场景**：提供1-2个经典三体场景
- **轻量级实现**：最小化外部依赖，易于部署

## 技术栈

- HTML5 + CSS3 + JavaScript
- [Three.js](https://threejs.org/) - 用于3D渲染
- 本地存储 (LocalStorage) - 简单的数据持久化

## 快速开始

### 安装与运行

1. 克隆或下载本仓库
2. 将项目文件放入Web服务器目录
3. 在浏览器中访问对应的URL

### 本地开发

1. 克隆仓库
   ```
   git clone https://your-github-username/three-body-simulator.git
   cd three-body-simulator
   ```

2. 运行本地服务器（使用任何静态文件服务器）
   - 使用Python:
     ```
     python -m http.server 8000
     ```
   - 使用Node.js (需要安装http-server):
     ```
     npm install -g http-server
     http-server
     ```

3. 在浏览器中访问 http://localhost:8000

## 使用方法

1. 使用顶部导航栏的按钮选择预设场景
2. 使用底部控制面板调整模拟参数
3. 点击播放/暂停按钮控制模拟
4. 在3D视图中使用鼠标旋转、缩放场景
5. 点击重置按钮重新开始模拟

## 开发指南

### 项目结构

- `/index.html` - 主HTML文件
- `/css/` - 样式文件
- `/js/` - JavaScript代码
  - `/js/three.js` - Three.js库
  - `/js/simulator.js` - 三体模拟核心代码
  - `/js/app.js` - 应用主逻辑
- `/models/` - 3D模型（如果需要）
- `/assets/` - 静态资源文件

### 核心实现

1. 三体运动计算使用简单的欧拉积分方法
2. 3D渲染使用Three.js的基础功能
3. 用户界面使用原生JavaScript和CSS实现

## 贡献指南

欢迎社区贡献！如果你想参与本项目，可以：

1. 提交Bug报告或功能建议（Issue）
2. 提交代码改进（Pull Request）
3. 帮助改进文档

### Pull Request流程

1. Fork项目仓库
2. 创建你的功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交你的更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 开启一个Pull Request

### 代码规范

- 保持代码简洁清晰
- 添加关键部分的注释
- 遵循基本的JavaScript编码规范

## 许可证

本项目采用MIT许可证 - 详情请查看LICENSE文件

## 致谢

- Three.js团队提供优秀的3D渲染库
- 所有为本项目做出贡献的开发者
- 三体问题研究领域的科学家们

---

*如果您喜欢这个项目，请考虑给它一个Star⭐，这将帮助更多人发现它！*