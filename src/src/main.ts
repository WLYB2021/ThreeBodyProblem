import './style.css'
import { RenderManager } from './rendering/RenderManager';

// 悬浮式布局实现 - 突出中心3D视图
const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <div class="three-body-app">
      <!-- 主内容区 - 3D视图占据100%视口 -->
      <main class="app-main">
        <!-- Three.js渲染容器 -->
        <div class="canvas-container" id="three-canvas-container">
          <!-- Three.js渲染器将在这里添加 -->
        </div>
      </main>
      
      <!-- 标题悬浮组件 -->
      <div class="floating-title-panel">
        <h1>三体问题模拟器</h1>
      </div>
      
      <!-- 悬浮控制面板 -->
      <div class="floating-control-panel">
        <div class="panel-header">
          <h3>参数设置</h3>
          <button id="close-panel-btn" class="close-panel-btn">×</button>
        </div>
        
        <!-- 时间步长控制 -->
        <div class="control-group">
          <label for="timeStep">模拟速度</label>
          <input type="range" id="timeStep" min="0.001" max="0.1" step="0.001" value="0.01">
          <span id="timeStepValue">0.01</span>
        </div>
        
        <!-- 质量控制 -->
        <div class="control-group">
          <label for="mass1">星体1质量</label>
          <input type="range" id="mass1" min="1" max="10" step="0.1" value="1">
          <span id="mass1Value">1</span>
        </div>
        
        <div class="control-group">
          <label for="mass2">星体2质量</label>
          <input type="range" id="mass2" min="1" max="10" step="0.1" value="1">
          <span id="mass2Value">1</span>
        </div>
        
        <div class="control-group">
          <label for="mass3">星体3质量</label>
          <input type="range" id="mass3" min="1" max="10" step="0.1" value="1">
          <span id="mass3Value">1</span>
        </div>
        
        <!-- 预设场景 -->
        <div class="control-group">
          <label for="preset">预设场景</label>
          <select id="preset">
            <option value="default">默认配置</option>
            <option value="figure8">8字轨道</option>
            <option value="sunearthmoon">日地月</option>
          </select>
        </div>
        
        <!-- 显示选项 -->
        <div class="control-group">
          <label for="show-trails">显示轨迹:</label>
          <input type="checkbox" id="show-trails" checked>
        </div>
        
        <!-- 应用按钮 -->
        <button id="applyBtn" class="apply-btn">应用设置</button>
      </div>
      
      <!-- 悬浮信息面板 -->
      <div class="floating-info-panel">
        <div class="info-item">
          <span class="info-label">状态:</span>
          <span id="simulation-status" class="info-value">运行中</span>
        </div>
        <div class="info-item">
          <span class="info-label">时间:</span>
          <span id="simulationTime" class="info-value">00:00:00</span>
        </div>
      </div>
      
      <!-- 设置按钮 - 右上角独立显示 -->
      <button id="settings-btn" class="floating-btn" title="设置">⚙</button>
      
      <!-- 右下角功能按钮组 -->
      <div class="core-actions">
        <button id="preset-btn" class="floating-btn" title="预设场景">☰</button>
        <button id="tutorial-btn" class="floating-btn" title="教程">?</button>
        <button id="about-btn" class="floating-btn" title="关于">ℹ</button>
      </div>
      
      <!-- 左下角控制按钮组 -->
      <div class="simulation-controls">
        <button id="play-btn" class="floating-btn" title="播放/暂停">⏸</button>
        <button id="reset-btn" class="floating-btn" title="重置">↺</button>
      </div>
      
      <!-- FPS计数器 -->
      <div class="fps-counter" id="fps">0 FPS</div>
    </div>
  `
}

// 应用状态管理
class SimulationManager {
  private isPlaying = false
  private simulationTime = 0
  private fps = 0
  private lastFrameTime = performance.now()
  private simulationSpeed = 1.0
  private showControlPanel = false
  private renderManager: RenderManager | null = null
  // 移除了拖动相关的状态变量
  
  // 初始化应用
  public init() {
    // 初始化渲染管理器
    this.renderManager = new RenderManager({
      containerId: 'three-canvas-container',
      showTrails: true,
      trailLength: 100,
      initialPreset: 'default'
    });
    this.renderManager.initialize();
    
    // 确保UI初始状态显示为暂停
    this.updateUIState();
    
    this.bindSliderUpdates()
    this.bindButtonEvents()
    this.bindKeyboardShortcuts()
    this.bindPanelDragging()
    this.initializePanelPositions()
    this.handleOutsideClick()
    this.enhanceCameraControl()
    this.startSimulationLoop()
    
    // 默认进入纯视图模式
    this.toggleControlPanel(false)
    
    // 显示欢迎提示
    setTimeout(() => {
      this.showTooltip('欢迎使用三体问题模拟器！按ESC显示纯视图，按空格键暂停/播放，按R键重置')
    }, 1000)
    
    console.log('三体模拟器初始化完成 - 悬浮式布局模式')
  }
  
  // 绑定滑块更新事件
  private bindSliderUpdates() {
    const sliders = ['timeStep', 'mass1', 'mass2', 'mass3']
    
    sliders.forEach(id => {
      const slider = document.getElementById(id) as HTMLInputElement
      const valueDisplay = document.getElementById(`${id}Value`) as HTMLSpanElement
      
      if (slider && valueDisplay) {
        slider.addEventListener('input', () => {
          valueDisplay.textContent = parseFloat(slider.value).toFixed(id === 'timeStep' ? 3 : 1)
        })
      }
    })
  }
  
  // 绑定按钮事件
  private bindButtonEvents() {
    // 应用设置按钮
    const applyBtn = document.getElementById('applyBtn')
    if (applyBtn) {
      applyBtn.addEventListener('click', () => this.updateSimulationParameters())
    }
    
    // 关闭面板按钮
    const closePanelBtn = document.getElementById('close-panel-btn')
    if (closePanelBtn) {
      closePanelBtn.addEventListener('click', () => this.toggleControlPanel(false))
    }
    
    // 功能按钮组
    const presetBtn = document.getElementById('preset-btn')
    if (presetBtn) {
      presetBtn.addEventListener('click', () => this.showTooltip('预设场景功能开发中'))
    }
    
    const tutorialBtn = document.getElementById('tutorial-btn')
    if (tutorialBtn) {
      tutorialBtn.addEventListener('click', () => this.showTooltip('教程功能开发中'))
    }
    
    const aboutBtn = document.getElementById('about-btn')
    if (aboutBtn) {
      aboutBtn.addEventListener('click', () => this.showTooltip('三体问题模拟器 v1.0'))
    }
    
    const settingsBtn = document.getElementById('settings-btn')
    if (settingsBtn) {
      settingsBtn.addEventListener('click', () => this.toggleControlPanel(true))
    }
    
    // 模拟控制按钮
    const playBtn = document.getElementById('play-btn')
    if (playBtn) {
      playBtn.addEventListener('click', () => this.toggleSimulation())
    }
    
    const resetBtn = document.getElementById('reset-btn')
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetSimulation())
    }
  }
  
  // 绑定键盘快捷键
  private bindKeyboardShortcuts() {
    document.addEventListener('keydown', (event) => {
      switch (event.key) {
        case 'Escape':
          // ESC键：隐藏所有面板，显示纯视图
          this.toggleControlPanel(false)
          this.showTooltip('纯视图模式')
          break
        case ' ':
          // 空格键：快速切换播放/暂停状态
          event.preventDefault() // 防止页面滚动
          this.toggleSimulation()
          break
        case 'r':
        case 'R':
          // R键：重置模拟
          this.resetSimulation()
          break
      }
    })
  }
  
  // 绑定面板拖动功能已移除
  private bindPanelDragging() {
    // 移除了所有拖动相关的功能
  }
  
  // 拖动功能已移除，保留注释以表明此功能不再需要
  /*
  private setupDragging(panel: HTMLElement) {
    // 拖动功能已移除，面板现在仅视觉上悬浮，不可拖动
  }
  */
  
  // 切换控制面板显示
  private toggleControlPanel(show?: boolean) {
    const panel = document.querySelector('.floating-control-panel')
    if (!panel) return
    
    this.showControlPanel = show !== undefined ? show : !this.showControlPanel
    
    if (this.showControlPanel) {
      panel.classList.add('open')
      // 当面板打开时，隐藏右下角核心功能按钮组
      document.body.classList.add('control-panel-open')
    } else {
      panel.classList.remove('open')
      // 当面板关闭时，显示右下角核心功能按钮组
      document.body.classList.remove('control-panel-open')
    }
  }
  
  // 初始化面板位置，确保在视口内
  private initializePanelPositions() {
    // 确保所有面板初始位置正确
    const panels = document.querySelectorAll('.floating-info-panel, .floating-title-panel')
    panels.forEach((panel: Element) => {
      const htmlPanel = panel as HTMLElement
      const rect = htmlPanel.getBoundingClientRect()
      
      // 确保面板在视口内
      const maxX = window.innerWidth - rect.width
      const maxY = window.innerHeight - rect.height
      
      const currentLeft = parseFloat(htmlPanel.style.left || '0')
      const currentTop = parseFloat(htmlPanel.style.top || '0')
      
      htmlPanel.style.left = `${Math.max(0, Math.min(currentLeft, maxX))}px`
      htmlPanel.style.top = `${Math.max(0, Math.min(currentTop, maxY))}px`
    })
  }
  
  // 更新UI显示状态
  private updateUIState() {
    const playBtn = document.getElementById('play-btn')
    const statusElem = document.getElementById('simulation-status')
    
    if (playBtn) {
      playBtn.textContent = this.isPlaying ? '⏸' : '▶'
    }
    
    if (statusElem) {
      statusElem.textContent = this.isPlaying ? '运行中' : '已暂停'
    }
  }
  
  // 切换模拟播放/暂停
  private toggleSimulation() {
    this.isPlaying = !this.isPlaying
    
    // 更新UI状态
    this.updateUIState()
    
    // 控制渲染管理器
    if (this.renderManager) {
      this.renderManager.toggleSimulation();
    }
  }
  
  // 重置模拟
  private resetSimulation() {
    this.simulationTime = 0
    const timeElem = document.getElementById('simulationTime')
    if (timeElem) {
      timeElem.textContent = '00:00:00'
    }
    this.showTooltip('模拟已重置')
    
    // 重置渲染管理器
    if (this.renderManager) {
      this.renderManager.resetSimulation();
    }
  }
  
  // 更新模拟参数
  private updateSimulationParameters() {
    const timeStep = (document.getElementById('timeStep') as HTMLInputElement).value
    const mass1 = (document.getElementById('mass1') as HTMLInputElement).value
    const mass2 = (document.getElementById('mass2') as HTMLInputElement).value
    const mass3 = (document.getElementById('mass3') as HTMLInputElement).value
    const preset = (document.getElementById('preset') as HTMLSelectElement).value
    const showTrails = (document.getElementById('show-trails') as HTMLInputElement).checked
    
    this.simulationSpeed = parseFloat(timeStep) * 100 // 调整速度比例
    
    // 更新渲染管理器参数
    if (this.renderManager) {
      // 加载预设场景
      if (preset) {
        this.renderManager.loadPreset(preset);
      }
      
      // 更新模拟参数
      this.renderManager.updateParameters({
        timeStep: parseFloat(timeStep),
        showTrails: showTrails,
        trailLength: showTrails ? 100 : 0
      });
      
      // 更新天体质量
      this.renderManager.updateBodyMass(0, parseFloat(mass1));
      this.renderManager.updateBodyMass(1, parseFloat(mass2));
      this.renderManager.updateBodyMass(2, parseFloat(mass3));
    }
    
    console.log('更新模拟参数:', { 
      timeStep, 
      mass1, 
      mass2, 
      mass3, 
      preset, 
      showTrails,
      simulationSpeed: this.simulationSpeed
    })
    
    // 显示更新成功提示
    this.showTooltip('参数已更新')
  }
  
  // 显示提示信息
  private showTooltip(message: string) {
    // 检查是否已有提示元素
    let tooltip = document.querySelector('.tooltip')
    if (tooltip) {
      tooltip.remove()
    }
    
    tooltip = document.createElement('div')
    tooltip.className = 'tooltip'
    tooltip.textContent = message
    document.body.appendChild(tooltip)
    
    // 3秒后移除提示
    setTimeout(() => {
      tooltip?.remove()
    }, 3000)
  }
  
  // 模拟更新循环
  private startSimulationLoop() {
    const updateSimulation = () => {
      if (this.isPlaying) {
        this.simulationTime += 0.016 * this.simulationSpeed
        const hours = Math.floor(this.simulationTime / 3600)
        const minutes = Math.floor((this.simulationTime % 3600) / 60)
        const seconds = Math.floor(this.simulationTime % 60)
        const timeElem = document.getElementById('simulationTime')
        if (timeElem) {
          timeElem.textContent = 
            `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
        }
      }
      
      // 计算FPS
      const currentTime = performance.now()
      const deltaTime = (currentTime - this.lastFrameTime) / 1000
      this.fps = Math.round(1 / deltaTime)
      const fpsElem = document.getElementById('fps')
      if (fpsElem) {
        fpsElem.textContent = `${this.fps} FPS`
      }
      this.lastFrameTime = currentTime
      
      // 继续下一帧
      requestAnimationFrame(updateSimulation)
    }
    
    updateSimulation()
  }
  
  // 处理点击外部区域收起面板
  private handleOutsideClick() {
    document.addEventListener('click', (event) => {
      const panel = document.querySelector('.floating-control-panel')
      const settingsBtn = document.getElementById('settings-btn')
      const closeBtn = document.getElementById('close-panel-btn')
      
      // 如果点击在面板外部且不是设置按钮，且面板是打开的，则关闭面板
      if (panel && settingsBtn && closeBtn &&
          !panel.contains(event.target as Node) && 
          !settingsBtn.contains(event.target as Node) && 
          panel.classList.contains('open')) {
        this.toggleControlPanel(false)
      }
    })
  }
  
  // 处理摄像机控制增强
  private enhanceCameraControl() {
    const canvas = document.getElementById('three-canvas')
    if (!canvas) return
    
    canvas.addEventListener('dblclick', () => {
      // 重置摄像机视角
      console.log('重置摄像机视角')
      this.showTooltip('视角已重置')
    })
  }
}

// 启动应用
const simulationManager = new SimulationManager()
simulationManager.init()
