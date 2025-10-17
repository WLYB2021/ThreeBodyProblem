# Web应用技术选型与项目初始化指南

## 1. 前端框架选择对比

在实现三体问题Web应用时，我们需要选择一个合适的前端框架来构建用户界面。以下是几个主流前端框架的对比：

### 1.1 框架对比

| 框架 | 优势 | 劣势 | 适用场景 |
|------|------|------|----------|
| Vue.js 3 | 渐进式框架，学习曲线平缓<br>组件系统灵活<br>响应式API简洁<br>开发体验优秀<br>社区活跃 | 大型应用状态管理相对复杂<br>企业级支持不如React | 中小型应用<br>需要快速开发的项目<br>团队学习成本敏感 |
| React | 组件复用性强<br>虚拟DOM高效<br>生态系统最丰富<br>企业级应用广泛 | JSX学习曲线<br>状态管理需要额外库<br>更新频繁可能导致迁移成本 | 复杂大型应用<br>需要高性能的界面<br>团队已有React经验 |
| Svelte | 编译时框架，性能极佳<br>代码量少，学习曲线平缓<br>无需虚拟DOM | 生态相对较小<br>企业采用率较低 | 对性能要求极高的应用<br>小型轻量化项目 |
| Angular | 完整的MVC框架<br>TypeScript原生支持<br>企业级功能完善 | 学习曲线陡峭<br>体积较大<br>开发效率相对较低 | 大型企业级应用<br>需要严格架构的项目 |

### 1.2 框架推荐

对于三体问题Web应用，**推荐使用Vue.js 3**作为前端框架，理由如下：

1. **开发效率高**：Vue.js的模板语法和组件系统让UI开发更加直观
2. **学习曲线平缓**：对于可能参与项目的开发者更友好
3. **与Three.js集成简单**：生命周期钩子便于Three.js的初始化和清理
4. **渐进式特性**：可以按需引入功能，避免不必要的性能开销
5. **响应式系统**：便于处理用户交互和参数变化

## 2. 构建工具选择

### 2.1 构建工具对比

| 构建工具 | 优势 | 适用场景 |
|----------|------|----------|
| Vite | 极速的开发服务器<br>即时热模块替换<br>优化的生产构建<br>开箱即用的ES模块支持 | 现代JavaScript/TypeScript项目<br>需要快速开发体验的团队 |
| Webpack | 生态系统成熟<br>插件丰富<br>配置灵活<br>企业级应用广泛使用 | 复杂的构建需求<br>需要特殊插件处理的项目 |
| Rollup | 优化的打包结果<br>Tree-shaking效果好<br>配置相对简单 | 库开发<br>对打包体积敏感的应用 |

### 2.2 推荐

推荐使用**Vite**作为构建工具，原因：

1. **开发体验极佳**：冷启动速度快，热更新几乎无延迟
2. **原生ESM支持**：直接使用浏览器的ES模块功能
3. **与Vue.js完美结合**：Vue团队官方推荐
4. **配置简单**：默认配置已经满足大部分需求
5. **优化的生产构建**：使用Rollup进行生产打包，体积小，性能好

## 3. 项目初始化步骤

### 3.1 使用Vite创建Vue 3项目

```bash
# 创建Vue 3 + TypeScript项目
npm create vite@latest three-body-web -- --template vue-ts

# 进入项目目录
cd three-body-web

# 安装依赖
npm install
```

### 3.2 安装核心依赖

```bash
# 安装Three.js
npm install three

# 安装Three.js类型定义（TypeScript项目）
npm install --save-dev @types/three

# 安装Cannon.js (物理引擎)
npm install cannon-es

# 安装控制库（用于相机控制）
npm install three-orbit-controls

# 安装UI组件库（可选，推荐Element Plus）
npm install element-plus
```

### 3.3 项目配置

#### 3.3.1 vite.config.ts 配置

```typescript
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { resolve } from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src')
    }
  },
  optimizeDeps: {
    include: ['three', 'cannon-es']
  },
  build: {
    // 生产构建优化
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true
      }
    },
    // 启用CSS代码分割
    cssCodeSplit: true,
    // 生成sourcemap便于调试
    sourcemap: true
  }
})
```

#### 3.3.2 tsconfig.json 配置

```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "module": "ESNext",
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "skipLibCheck": true,
    "paths": {
      "@/*": ["./src/*"]
    },

    /* Bundler mode */
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "preserve",

    /* Linting */
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true
  },
  "include": ["src/**/*.ts", "src/**/*.d.ts", "src/**/*.tsx", "src/**/*.vue"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

## 4. 基础项目结构

创建以下目录结构来组织代码：

```
src/
├── assets/           # 静态资源（图片、字体等）
├── components/       # Vue组件
│   ├── ThreeCanvas.vue     # Three.js渲染组件
│   ├── ControlPanel.vue    # 控制面板组件
│   └── PresetSelector.vue  # 预设场景选择器
├── hooks/            # Vue组合式函数
│   ├── useThree.ts         # Three.js初始化钩子
│   └── usePhysics.ts       # 物理计算钩子
├── physics/          # 物理计算模块
│   ├── constants.ts        # 物理常数
│   ├── integrators/        # 数值积分器
│   │   └── RK4.ts
│   └── calculations.ts     # 物理计算函数
├── renderer/         # 渲染相关
│   ├── SceneManager.ts     # 场景管理
│   ├── CameraController.ts # 相机控制
│   └── TrajectoryRenderer.ts # 轨迹渲染
├── utils/            # 工具函数
│   ├── math.ts             # 数学工具
│   └── performance.ts      # 性能监控
├── workers/          # Web Workers
│   └── physics.worker.ts   # 物理计算Worker
├── types/            # TypeScript类型定义
│   └── index.ts
├── App.vue           # 根组件
└── main.ts           # 入口文件
```

## 5. 关键模块实现

### 5.1 Three.js基础设置

创建 `hooks/useThree.ts` 文件，提供Three.js初始化的组合式函数：

```typescript
import { ref, onMounted, onUnmounted } from 'vue'
import * as THREE from 'three'
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js'

interface UseThreeOptions {
  containerId: string
  antialias?: boolean
}

export function useThree(options: UseThreeOptions) {
  const { containerId, antialias = true } = options
  
  const scene = ref<THREE.Scene>()
  const camera = ref<THREE.PerspectiveCamera>()
  const renderer = ref<THREE.WebGLRenderer>()
  const controls = ref<OrbitControls>()
  const container = ref<HTMLElement>()
  
  let animationId: number
  
  const init = () => {
    container.value = document.getElementById(containerId)
    if (!container.value) {
      console.error(`Container with id '${containerId}' not found`)
      return
    }
    
    // 创建场景
    scene.value = new THREE.Scene()
    scene.value.background = new THREE.Color(0x000000)
    
    // 创建相机
    const width = container.value.clientWidth
    const height = container.value.clientHeight
    camera.value = new THREE.PerspectiveCamera(75, width / height, 0.1, 10000)
    camera.value.position.set(0, 0, 1000)
    
    // 创建渲染器
    renderer.value = new THREE.WebGLRenderer({ antialias })
    renderer.value.setSize(width, height)
    container.value.appendChild(renderer.value.domElement)
    
    // 创建控制器
    controls.value = new OrbitControls(camera.value, renderer.value.domElement)
    controls.value.enableDamping = true
    controls.value.dampingFactor = 0.05
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5)
    scene.value.add(ambientLight)
    
    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8)
    directionalLight.position.set(1, 1, 1)
    scene.value.add(directionalLight)
    
    // 处理窗口大小变化
    window.addEventListener('resize', handleResize)
  }
  
  const handleResize = () => {
    if (!container.value || !camera.value || !renderer.value) return
    
    const width = container.value.clientWidth
    const height = container.value.clientHeight
    
    camera.value.aspect = width / height
    camera.value.updateProjectionMatrix()
    renderer.value.setSize(width, height)
  }
  
  const animate = (callback?: () => void) => {
    animationId = requestAnimationFrame(() => animate(callback))
    
    controls.value?.update()
    callback?.()
    renderer.value?.render(scene.value!, camera.value!)
  }
  
  const dispose = () => {
    cancelAnimationFrame(animationId)
    window.removeEventListener('resize', handleResize)
    
    if (renderer.value) {
      renderer.value.dispose()
      container.value?.removeChild(renderer.value.domElement)
    }
  }
  
  onMounted(() => {
    init()
    animate()
  })
  
  onUnmounted(() => {
    dispose()
  })
  
  return {
    scene,
    camera,
    renderer,
    controls,
    container,
    animate,
    dispose
  }
}
```

### 5.2 三体物理计算基础

创建 `physics/calculations.ts` 文件，实现基本的物理计算：

```typescript
import { Vector3 } from 'three'

export interface Body {
  id: number
  mass: number
  position: Vector3
  velocity: Vector3
  acceleration: Vector3
  color: number
  radius: number
}

export const G = 6.67430e-11 // 引力常数

// 计算两个物体间的引力
export function calculateGravitationalForce(
  body1: Body,
  body2: Body
): Vector3 {
  const direction = new Vector3()
    .subVectors(body2.position, body1.position)
  
  const distance = direction.length()
  
  // 避免距离过小导致的数值不稳定
  if (distance < 0.1) {
    return new Vector3(0, 0, 0)
  }
  
  // 归一化方向向量
  direction.normalize()
  
  // 计算引力大小
  const forceMagnitude = G * body1.mass * body2.mass / (distance * distance)
  
  // 返回力向量
  return direction.multiplyScalar(forceMagnitude)
}

// 计算所有物体受到的合力
export function calculateAllForces(bodies: Body[]): Vector3[] {
  const forces: Vector3[] = bodies.map(() => new Vector3(0, 0, 0))
  
  // 对每一对物体计算引力
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const force = calculateGravitationalForce(bodies[i], bodies[j])
      
      // 应用牛顿第三定律：作用力与反作用力
      forces[i].add(force)
      forces[j].sub(force)
    }
  }
  
  return forces
}

// 更新物体的加速度
export function updateAccelerations(bodies: Body[]): void {
  const forces = calculateAllForces(bodies)
  
  for (let i = 0; i < bodies.length; i++) {
    // F = ma => a = F/m
    bodies[i].acceleration.copy(forces[i]).divideScalar(bodies[i].mass)
  }
}
```

## 6. 开发环境配置

### 6.1 ESLint配置

安装ESLint并配置Vue项目的代码规范：

```bash
# 安装ESLint和相关插件
npm install --save-dev eslint eslint-plugin-vue @typescript-eslint/parser @typescript-eslint/eslint-plugin

# 初始化ESLint配置
npx eslint --init
```

创建 `.eslintrc.js` 配置文件：

```javascript
module.exports = {
  root: true,
  env: {
    node: true,
    browser: true,
    es2021: true
  },
  extends: [
    'plugin:vue/vue3-recommended',
    'eslint:recommended',
    '@vue/typescript/recommended'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    parser: '@typescript-eslint/parser'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    'vue/multi-word-component-names': 'off'
  }
}
```

### 6.2 性能监控工具

为了监控应用性能，可以集成以下工具：

1. **Stats.js**：显示FPS、渲染时间等性能指标
2. **Three.js Inspector**：调试Three.js场景

安装Stats.js：

```bash
npm install stats.js
```

在代码中使用：

```typescript
import Stats from 'stats.js'

// 创建性能监视器
const stats = new Stats()
stats.showPanel(0) // 0: FPS, 1: ms, 2: mb
stats.dom.style.left = '0px'
document.body.appendChild(stats.dom)

// 在动画循环中更新
function animate() {
  stats.begin()
  // 渲染和更新代码
  stats.end()
  requestAnimationFrame(animate)
}
```

## 7. 浏览器兼容性

### 7.1 目标浏览器

- Chrome (最新2个版本)
- Firefox (最新2个版本)
- Safari (最新2个版本)
- Edge (最新2个版本)

### 7.2 兼容性处理

1. **WebGL支持检测**：

```javascript
import * as THREE from 'three'

// 检测WebGL支持
if (!THREE.WEBGL.isWebGLAvailable()) {
  const errorMessage = THREE.WEBGL.getWebGLErrorMessage()
  document.body.appendChild(errorMessage)
}
```

2. **添加polyfill**：

对于较旧的浏览器，可以添加必要的polyfill：

```bash
npm install core-js regenerator-runtime
```

在入口文件中导入：

```typescript
import 'core-js/stable'
import 'regenerator-runtime/runtime'
```

## 8. 下一步开发建议

1. **从基础渲染开始**：先创建Three.js场景，确保能正确渲染基本几何体
2. **实现简单的物理计算**：先使用欧拉方法实现简单的物理更新，验证基本原理
3. **逐步优化**：
   - 替换为RK4算法提高精度
   - 添加Web Worker优化性能
   - 实现轨迹渲染
4. **增强交互性**：添加控制面板，允许调整参数
5. **实现预设场景**：添加著名的三体问题特解

## 9. 常见问题与解决方案

### 9.1 WebGL相关问题

- **问题**：某些设备或浏览器不支持WebGL
  **解决方案**：提供优雅的降级方案，如显示静态图片或提示信息

- **问题**：渲染性能不佳
  **解决方案**：优化几何体复杂度、使用实例化渲染、实现LOD等

### 9.2 物理计算相关问题

- **问题**：数值不稳定
  **解决方案**：减小时间步长、实现自适应时间步长、添加碰撞检测和处理

- **问题**：计算性能不足
  **解决方案**：使用Web Worker、优化算法、考虑使用GPU计算

### 9.3 内存管理问题

- **问题**：内存泄漏
  **解决方案**：正确dispose Three.js对象、避免在动画循环中创建新对象

- **问题**：轨迹数据过大
  **解决方案**：实现数据采样、限制存储的点数、定期清理旧数据