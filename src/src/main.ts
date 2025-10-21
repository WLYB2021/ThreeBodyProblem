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
      
      <!-- 物理参数控制面板 -->
      <div class="floating-control-panel">
        <div class="panel-header">
          <h3>物理参数</h3>
          <button id="close-physics-panel-btn" class="close-panel-btn">×</button>
        </div>
        
        <!-- 物理参数控制面板中移除模拟速度控制 -->
        
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
        
        <!-- 位置控制 -->
        <div class="control-section">
          <h4>星体位置调整</h4>
          
          <!-- 星体1位置 -->
          <div class="planet-position">
            <h5>星体1位置</h5>
            
            <div class="control-group">
              <label for="pos1X">X坐标</label>
              <input type="range" id="pos1X" min="-5" max="5" step="0.1" value="0">
              <span id="pos1XValue">0</span>
            </div>
            
            <div class="control-group">
              <label for="pos1Y">Y坐标</label>
              <input type="range" id="pos1Y" min="-5" max="5" step="0.1" value="1">
              <span id="pos1YValue">1</span>
            </div>
            
            <div class="control-group">
              <label for="pos1Z">Z坐标</label>
              <input type="range" id="pos1Z" min="-5" max="5" step="0.1" value="0">
              <span id="pos1ZValue">0</span>
            </div>
          </div>
          
          <!-- 星体2位置 -->
          <div class="planet-position">
            <h5>星体2位置</h5>
            
            <div class="control-group">
              <label for="pos2X">X坐标</label>
              <input type="range" id="pos2X" min="-5" max="5" step="0.1" value="-1">
              <span id="pos2XValue">-1</span>
            </div>
            
            <div class="control-group">
              <label for="pos2Y">Y坐标</label>
              <input type="range" id="pos2Y" min="-5" max="5" step="0.1" value="0">
              <span id="pos2YValue">0</span>
            </div>
            
            <div class="control-group">
              <label for="pos2Z">Z坐标</label>
              <input type="range" id="pos2Z" min="-5" max="5" step="0.1" value="0">
              <span id="pos2ZValue">0</span>
            </div>
          </div>
          
          <!-- 星体3位置 -->
          <div class="planet-position">
            <h5>星体3位置</h5>
            
            <div class="control-group">
              <label for="pos3X">X坐标</label>
              <input type="range" id="pos3X" min="-5" max="5" step="0.1" value="1">
              <span id="pos3XValue">1</span>
            </div>
            
            <div class="control-group">
              <label for="pos3Y">Y坐标</label>
              <input type="range" id="pos3Y" min="-5" max="5" step="0.1" value="0">
              <span id="pos3YValue">0</span>
            </div>
            
            <div class="control-group">
              <label for="pos3Z">Z坐标</label>
              <input type="range" id="pos3Z" min="-5" max="5" step="0.1" value="0">
              <span id="pos3ZValue">0</span>
            </div>
          </div>
        </div>
        
        <!-- 应用按钮 -->
        <button id="applyPhysicsBtn" class="apply-btn">应用物理参数</button>
      </div>
      
      <!-- 设置面板 -->
      <div class="floating-settings-panel">
        <div class="panel-header">
          <h3>模拟设置</h3>
          <button id="close-settings-panel-btn" class="close-panel-btn">×</button>
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
        
        <!-- 加载预设按钮 -->
        <button id="loadPresetBtn" class="apply-btn">加载预设</button>
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
        <div class="info-item">
          <span class="info-label">速度:</span>
          <span id="timeStepValue" class="info-value">1.0x</span>
        </div>
        <div class="info-item">
          <span class="info-label">帧率:</span>
          <span id="fps" class="info-value">0 FPS</span>
        </div>
      </div>
      
      <!-- 预设按钮 - 右上角独立显示 -->
      <button id="preset-btn" class="floating-btn" title="预设场景">☰</button>
      
      <!-- 右下角功能按钮组 -->
      <div class="core-actions">
        <button id="settings-btn" class="floating-btn" title="设置">⚙</button>
        <button id="tutorial-btn" class="floating-btn" title="教程">?</button>
        <button id="about-btn" class="floating-btn" title="关于">ℹ</button>
      </div>
      
      <!-- 左下角控制按钮组 -->
      <div class="simulation-controls">
        <button id="play-btn" class="floating-btn" title="播放/暂停">⏸</button>
        <button id="reset-btn" class="floating-btn" title="重置">↺</button>
      </div>
      
      <!-- 底部居中速度控制 -->
      <div class="bottom-center-controls">
        <div class="speed-control-wrapper">
          <div class="speed-control-container">
            <input type="range" id="timeStep" min="0" max="5" step="0.1" value="1" title="模拟速度">
              <!-- 速度滑块刻度 -->
              <div class="speed-ticks">
                <div class="speed-tick" data-value="0"></div>
                <div class="speed-tick" data-value="1"></div>
                <div class="speed-tick" data-value="2"></div>
                <div class="speed-tick" data-value="3"></div>
                <div class="speed-tick" data-value="4"></div>
                <div class="speed-tick" data-value="5"></div>
              </div>
          </div>
        </div>
      </div>
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
  private showPhysicsPanel = false
  private showSettingsPanel = false
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
    this.togglePhysicsPanel(false)
    this.toggleSettingsPanel(false)
    
    // 显示欢迎提示
    setTimeout(() => {
      this.showTooltip('欢迎使用三体问题模拟器！按ESC显示纯视图，按空格键暂停/播放，按R键重置')
    }, 1000)
    
    console.log('三体模拟器初始化完成 - 悬浮式布局模式')
  }
  
  // 绑定滑块更新事件
  private bindSliderUpdates() {
    // 质量和位置滑块更新
    const sliders = ['mass1', 'mass2', 'mass3', 
                     'pos1X', 'pos1Y', 'pos1Z', 
                     'pos2X', 'pos2Y', 'pos2Z', 
                     'pos3X', 'pos3Y', 'pos3Z']
    
    sliders.forEach(id => {
      const slider = document.getElementById(id) as HTMLInputElement
      const valueDisplay = document.getElementById(`${id}Value`) as HTMLSpanElement
      
      if (slider && valueDisplay) {
        slider.addEventListener('input', () => {
          // 显示1位小数
          valueDisplay.textContent = parseFloat(slider.value).toFixed(1)
        })
      }
    })
    
    // 时间步长滑块更新（移到主界面后）
    const timeStepSlider = document.getElementById('timeStep') as HTMLInputElement
    const timeStepValueDisplay = document.getElementById('timeStepValue') as HTMLSpanElement
    const speedTicks = document.querySelector('.speed-ticks') as HTMLElement
    let hideTicksTimeout: number | null = null
    
    if (timeStepSlider && timeStepValueDisplay) {
      // 初始化模拟速度
      this.simulationSpeed = parseFloat(timeStepSlider.value)
      
      // 显示刻度的函数
      const showTicks = () => {
        if (speedTicks) {
          speedTicks.classList.add('visible')
          
          // 清除之前的定时器
          if (hideTicksTimeout !== null) {
            clearTimeout(hideTicksTimeout)
          }
        }
      }
      
      // 隐藏刻度的函数
      const hideTicks = () => {
        if (speedTicks && hideTicksTimeout === null) {
          hideTicksTimeout = window.setTimeout(() => {
            speedTicks.classList.remove('visible')
            hideTicksTimeout = null
          }, 1000) // 1秒后隐藏刻度
        }
      }
      
      // 添加mousedown和input事件来显示刻度
      timeStepSlider.addEventListener('mousedown', showTicks)
      timeStepSlider.addEventListener('input', () => {
        // 显示刻度
        showTicks()
        
        // 获取速度值（从0到5的比例）
        const speedValue = parseFloat(timeStepSlider.value)
        
        // 显示速度倍率
        timeStepValueDisplay.textContent = speedValue.toFixed(1) + 'x'
        
        // 实时更新模拟速度
        this.simulationSpeed = speedValue
        
        // 基础时间步长为0.01，根据速度倍率调整
        const adjustedTimeStep = 0.01 * speedValue
        
        // 实时更新渲染管理器参数
        if (this.renderManager) {
          this.renderManager.updateParameters({
            timeStep: adjustedTimeStep
          });
        }
        
        console.log('模拟速度已更新:', { speedValue: speedValue, simulationSpeed: this.simulationSpeed, adjustedTimeStep: adjustedTimeStep })
      })
      
      // 添加mouseup和mouseleave事件来隐藏刻度
      timeStepSlider.addEventListener('mouseup', hideTicks)
      timeStepSlider.addEventListener('mouseleave', hideTicks)
      
      // 为触摸设备添加事件支持
      timeStepSlider.addEventListener('touchstart', showTicks)
      timeStepSlider.addEventListener('touchend', hideTicks)
      timeStepSlider.addEventListener('touchcancel', hideTicks)
    }
  }
  
  // 绑定按钮事件
  private bindButtonEvents() {
    // 应用物理参数按钮
    const applyPhysicsBtn = document.getElementById('applyPhysicsBtn')
    if (applyPhysicsBtn) {
      applyPhysicsBtn.addEventListener('click', () => this.updatePhysicsParameters())
    }
    
    // 加载预设按钮
    const loadPresetBtn = document.getElementById('loadPresetBtn')
    if (loadPresetBtn) {
      loadPresetBtn.addEventListener('click', () => this.loadPreset())
    }
    
    // 关闭物理面板按钮
    const closePhysicsPanelBtn = document.getElementById('close-physics-panel-btn')
    if (closePhysicsPanelBtn) {
      closePhysicsPanelBtn.addEventListener('click', () => this.togglePhysicsPanel(false))
    }
    
    // 关闭设置面板按钮
    const closeSettingsPanelBtn = document.getElementById('close-settings-panel-btn')
    if (closeSettingsPanelBtn) {
      closeSettingsPanelBtn.addEventListener('click', () => this.toggleSettingsPanel(false))
    }
    
    // 功能按钮组
    const presetBtn = document.getElementById('preset-btn')
    if (presetBtn) {
      presetBtn.addEventListener('click', () => this.togglePhysicsPanel(true)) // 预设按钮应打开物理参数面板
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
      settingsBtn.addEventListener('click', () => this.toggleSettingsPanel(true)) // 设置按钮应打开设置面板
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
          this.togglePhysicsPanel(false)
          this.toggleSettingsPanel(false)
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
  
  // 切换物理参数面板显示
  private togglePhysicsPanel(show?: boolean) {
    const panel = document.querySelector('.floating-control-panel')
    if (!panel) return
    
    this.showPhysicsPanel = show !== undefined ? show : !this.showPhysicsPanel
    
    if (this.showPhysicsPanel) {
      panel.classList.add('open')
      // 先关闭设置面板
      this.toggleSettingsPanel(false)
      // 当面板打开时，隐藏右下角核心功能按钮组
      document.body.classList.add('control-panel-open')
    } else {
      panel.classList.remove('open')
      // 当两个面板都关闭时，显示右下角核心功能按钮组
      if (!this.showSettingsPanel) {
        document.body.classList.remove('control-panel-open')
      }
    }
  }
  
  // 切换设置面板显示
  private toggleSettingsPanel(show?: boolean) {
    const panel = document.querySelector('.floating-settings-panel')
    if (!panel) return
    
    this.showSettingsPanel = show !== undefined ? show : !this.showSettingsPanel
    
    if (this.showSettingsPanel) {
      panel.classList.add('open')
      // 先关闭物理参数面板
      this.togglePhysicsPanel(false)
      // 当面板打开时，隐藏右下角核心功能按钮组
      document.body.classList.add('control-panel-open')
    } else {
      panel.classList.remove('open')
      // 当两个面板都关闭时，显示右下角核心功能按钮组
      if (!this.showPhysicsPanel) {
        document.body.classList.remove('control-panel-open')
      }
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
    
    // 重置模拟速度
    this.simulationSpeed = 1.0
    const timeStepSlider = document.getElementById('timeStep') as HTMLInputElement
    const timeStepValueDisplay = document.getElementById('timeStepValue') as HTMLSpanElement
    if (timeStepSlider) {
      timeStepSlider.value = '1'
    }
    if (timeStepValueDisplay) {
      timeStepValueDisplay.textContent = '1.0x'
    }
    
    // 更新渲染管理器的时间步长参数
    if (this.renderManager) {
      this.renderManager.updateParameters({
        timeStep: 0.01 * this.simulationSpeed
      });
      this.renderManager.resetSimulation();
    }
    
    this.showTooltip('模拟已重置')
  }
  
  // 更新物理参数
  private updatePhysicsParameters() {
    // 时间步长已经移到主界面，实时更新
    const mass1 = (document.getElementById('mass1') as HTMLInputElement).value
    const mass2 = (document.getElementById('mass2') as HTMLInputElement).value
    const mass3 = (document.getElementById('mass3') as HTMLInputElement).value
    
    // 获取位置参数
    const pos1X = (document.getElementById('pos1X') as HTMLInputElement).value
    const pos1Y = (document.getElementById('pos1Y') as HTMLInputElement).value
    const pos1Z = (document.getElementById('pos1Z') as HTMLInputElement).value
    
    const pos2X = (document.getElementById('pos2X') as HTMLInputElement).value
    const pos2Y = (document.getElementById('pos2Y') as HTMLInputElement).value
    const pos2Z = (document.getElementById('pos2Z') as HTMLInputElement).value
    
    const pos3X = (document.getElementById('pos3X') as HTMLInputElement).value
    const pos3Y = (document.getElementById('pos3Y') as HTMLInputElement).value
    const pos3Z = (document.getElementById('pos3Z') as HTMLInputElement).value
    
    // 更新渲染管理器参数
    if (this.renderManager) {
      // 物理参数面板中不再包含时间步长更新
      
      // 更新天体质量
      this.renderManager.updateBodyMass(0, parseFloat(mass1));
      this.renderManager.updateBodyMass(1, parseFloat(mass2));
      this.renderManager.updateBodyMass(2, parseFloat(mass3));
      
      // 更新天体位置
      this.renderManager.updateBodyPosition(0, [
        parseFloat(pos1X), 
        parseFloat(pos1Y), 
        parseFloat(pos1Z)
      ]);
      
      this.renderManager.updateBodyPosition(1, [
        parseFloat(pos2X), 
        parseFloat(pos2Y), 
        parseFloat(pos2Z)
      ]);
      
      this.renderManager.updateBodyPosition(2, [
        parseFloat(pos3X), 
        parseFloat(pos3Y), 
        parseFloat(pos3Z)
      ]);
      
      // 重置模拟以应用新位置
      this.renderManager.resetSimulation();
    }
    
    console.log('更新物理参数:', { 
      mass1, mass2, mass3,
      pos1: { x: pos1X, y: pos1Y, z: pos1Z },
      pos2: { x: pos2X, y: pos2Y, z: pos2Z },
      pos3: { x: pos3X, y: pos3Y, z: pos3Z },
      simulationSpeed: this.simulationSpeed
    })
    
    // 显示更新成功提示
    this.showTooltip('物理参数已更新')
  }
  
  // 加载预设场景
  private loadPreset() {
    const preset = (document.getElementById('preset') as HTMLSelectElement).value
    const showTrails = (document.getElementById('show-trails') as HTMLInputElement).checked
    
    // 更新渲染管理器参数
    if (this.renderManager) {
      // 加载预设场景
      if (preset) {
        this.renderManager.loadPreset(preset);
      }
      
      // 更新显示参数
      this.renderManager.updateParameters({
        showTrails: showTrails,
        trailLength: showTrails ? 100 : 0
      });
    }
    
    console.log('加载预设:', { 
      preset,
      showTrails
    })
    
    // 显示更新成功提示
    this.showTooltip('预设已加载')
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
    // 添加FPS平滑处理，避免抖动
    let fpsHistory: number[] = []
    const maxFpsHistory = 5
    
    const updateSimulation = () => {
      // 无论是否播放，都保持渲染以支持视角控制
      
      // 只有播放状态才更新模拟时间
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
      
      // 计算FPS并添加过滤，避免小于3fps的抖动
      const currentTime = performance.now()
      const deltaTime = (currentTime - this.lastFrameTime) / 1000
      let currentFps = Math.round(1 / deltaTime)
      
      // 过滤小于3fps的异常值
      if (currentFps >= 3) {
        // 添加到历史记录
        fpsHistory.push(currentFps)
        
        // 保持历史记录长度
        if (fpsHistory.length > maxFpsHistory) {
          fpsHistory.shift()
        }
        
        // 计算平均值作为显示的FPS
        const avgFps = Math.round(fpsHistory.reduce((sum, fps) => sum + fps, 0) / fpsHistory.length)
        this.fps = avgFps
      }
      
      const fpsElem = document.getElementById('fps')
      if (fpsElem) {
        fpsElem.textContent = `${this.fps} FPS`
      }
      this.lastFrameTime = currentTime
      
      // 确保渲染管理器持续更新，支持视角控制
      if (this.renderManager) {
        // 播放状态下步进模拟
        if (this.isPlaying) {
          this.renderManager.stepSimulation(this.simulationSpeed);
        } else {
          // 暂停状态下仍然触发渲染更新以保持轨道控制器工作
          this.renderManager.updateRendering();
        }
      }
      
      // 继续下一帧
      requestAnimationFrame(updateSimulation)
    }
    
    // 开始模拟循环
    updateSimulation()
  }
  
  // 处理点击外部区域收起面板
  private handleOutsideClick() {
    document.addEventListener('click', (event) => {
      const physicsPanel = document.querySelector('.floating-control-panel')
      const settingsPanel = document.querySelector('.floating-settings-panel')
      const settingsBtn = document.getElementById('settings-btn')
      const presetBtn = document.getElementById('preset-btn')
      const closePhysicsBtn = document.getElementById('close-physics-panel-btn')
      const closeSettingsBtn = document.getElementById('close-settings-panel-btn')
      
      // 检查物理参数面板 - 只有当点击的不是面板内、不是presetBtn、不是closePhysicsBtn时才关闭
      if (physicsPanel && presetBtn && closePhysicsBtn &&
          !physicsPanel.contains(event.target as Node) && 
          !presetBtn.contains(event.target as Node) &&
          !closePhysicsBtn.contains(event.target as Node) &&
          physicsPanel.classList.contains('open')) {
        this.togglePhysicsPanel(false)
      }
      
      // 检查设置面板 - 只有当点击的不是面板内、不是settingsBtn、不是closeSettingsBtn时才关闭
      if (settingsPanel && settingsBtn && closeSettingsBtn &&
          !settingsPanel.contains(event.target as Node) && 
          !settingsBtn.contains(event.target as Node) &&
          !closeSettingsBtn.contains(event.target as Node) &&
          settingsPanel.classList.contains('open')) {
        this.toggleSettingsPanel(false)
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
