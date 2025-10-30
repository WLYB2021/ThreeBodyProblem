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
      
      <!-- 星球参数控制面板 - 新的可伸缩卡片布局 -->
      <div class="floating-control-panel">
        <div class="panel-header">
          <h3>星球参数</h3>
          <button id="close-physics-panel-btn" class="close-panel-btn">×</button>
        </div>
        
        <!-- 星球卡片容器 -->
        <div class="planet-cards-container">
          <!-- 星球1卡片 -->
          <div class="planet-card" data-planet="0" data-color="#FF5252">
            <div class="card-header" data-planet-index="0">
              <div class="planet-indicator" style="background-color: #FF5252;"></div>
              <h4 class="planet-name">星球1</h4>
              <div class="expand-toggle">▼</div>
            </div>
            
            <div class="card-content">
              <!-- 收缩状态：只显示关键信息 -->
              <div class="summary-view">
                <div class="summary-row">
                  <span class="param-label">质量</span>
                  <span class="param-value" id="mass1Summary">1.0</span>
                </div>
                <div class="summary-row">
                  <span class="param-label">位置</span>
                  <span class="param-value position-coords" id="pos1Summary">0, 1, 0</span>
                </div>
              </div>
              
              <!-- 展开状态：显示完整参数控制 -->
              <div class="detailed-view">
                <!-- 物理属性组 -->
                <div class="parameter-group physics-params">
                  <h5>物理参数</h5>
                  
                  <div class="param-control">
                    <label>质量</label>
                    <div class="param-input-group">
                      <input type="range" id="mass1" class="param-slider" min="0.1" max="5.0" step="0.1" value="1.0">
                      <input type="number" id="mass1Input" class="param-number" min="0.1" max="5.0" step="0.1" value="1.0">
                    </div>
                  </div>
                  
                  <div class="param-control">
                    <label>X坐标</label>
                    <div class="param-input-group">
                      <input type="range" id="pos1X" class="param-slider" min="-10" max="10" step="0.1" value="0">
                      <input type="number" id="pos1XInput" class="param-number" min="-10" max="10" step="0.1" value="0">
                    </div>
                  </div>
                  
                  <div class="param-control">
                    <label>Y坐标</label>
                    <div class="param-input-group">
                      <input type="range" id="pos1Y" class="param-slider" min="-10" max="10" step="0.1" value="1">
                      <input type="number" id="pos1YInput" class="param-number" min="-10" max="10" step="0.1" value="1">
                    </div>
                  </div>
                  
                  <div class="param-control">
                    <label>Z坐标</label>
                    <div class="param-input-group">
                      <input type="range" id="pos1Z" class="param-slider" min="-10" max="10" step="0.1" value="0">
                      <input type="number" id="pos1ZInput" class="param-number" min="-10" max="10" step="0.1" value="0">
                    </div>
                  </div>
                </div>
                
                <!-- 外观属性组 -->
                <div class="parameter-group visual-params">
                  <h5>外观设置</h5>
                  
                  <div class="param-control">
                    <label>名称</label>
                    <input type="text" id="name1" class="param-text" value="星球1" maxlength="20">
                  </div>
                  
                  <div class="param-control">
                    <label>颜色</label>
                    <input type="color" id="color1" class="param-color" value="#FF5252">
                  </div>
                  
                  <div class="param-control">
                    <label>形状</label>
                    <select id="shape1" class="param-select">
                      <option value="sphere">球体</option>
                      <option value="cube">立方体</option>
                      <option value="tetrahedron">四面体</option>
                      <option value="octahedron">八面体</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 星球2卡片 -->
          <div class="planet-card" data-planet="1" data-color="#448AFF">
            <div class="card-header" data-planet-index="1">
              <div class="planet-indicator" style="background-color: #448AFF;"></div>
              <h4 class="planet-name">星球2</h4>
              <div class="expand-toggle">▼</div>
            </div>
            
            <div class="card-content">
              <div class="summary-view">
                <div class="summary-row">
                  <span class="param-label">质量</span>
                  <span class="param-value" id="mass2Summary">1.0</span>
                </div>
                <div class="summary-row">
                  <span class="param-label">位置</span>
                  <span class="param-value position-coords" id="pos2Summary">-1, 0, 0</span>
                </div>
              </div>
              
              <div class="detailed-view">
                <div class="parameter-group physics-params">
                  <h5>物理参数</h5>
                  
                  <div class="param-control">
                    <label>质量</label>
                    <div class="param-input-group">
                      <input type="range" id="mass2" class="param-slider" min="0.1" max="5.0" step="0.1" value="1.0">
                      <input type="number" id="mass2Input" class="param-number" min="0.1" max="5.0" step="0.1" value="1.0">
                    </div>
                  </div>
                  
                  <div class="param-control">
                    <label>X坐标</label>
                    <div class="param-input-group">
                      <input type="range" id="pos2X" class="param-slider" min="-10" max="10" step="0.1" value="-1">
                      <input type="number" id="pos2XInput" class="param-number" min="-10" max="10" step="0.1" value="-1">
                    </div>
                  </div>
                  
                  <div class="param-control">
                    <label>Y坐标</label>
                    <div class="param-input-group">
                      <input type="range" id="pos2Y" class="param-slider" min="-10" max="10" step="0.1" value="0">
                      <input type="number" id="pos2YInput" class="param-number" min="-10" max="10" step="0.1" value="0">
                    </div>
                  </div>
                  
                  <div class="param-control">
                    <label>Z坐标</label>
                    <div class="param-input-group">
                      <input type="range" id="pos2Z" class="param-slider" min="-10" max="10" step="0.1" value="0">
                      <input type="number" id="pos2ZInput" class="param-number" min="-10" max="10" step="0.1" value="0">
                    </div>
                  </div>
                </div>
                
                <div class="parameter-group visual-params">
                  <h5>外观设置</h5>
                  
                  <div class="param-control">
                    <label>名称</label>
                    <input type="text" id="name2" class="param-text" value="星球2" maxlength="20">
                  </div>
                  
                  <div class="param-control">
                    <label>颜色</label>
                    <input type="color" id="color2" class="param-color" value="#448AFF">
                  </div>
                  
                  <div class="param-control">
                    <label>形状</label>
                    <select id="shape2" class="param-select">
                      <option value="sphere">球体</option>
                      <option value="cube">立方体</option>
                      <option value="tetrahedron">四面体</option>
                      <option value="octahedron">八面体</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <!-- 星球3卡片 -->
          <div class="planet-card" data-planet="2" data-color="#FFC107">
            <div class="card-header" data-planet-index="2">
              <div class="planet-indicator" style="background-color: #FFC107;"></div>
              <h4 class="planet-name">星球3</h4>
              <div class="expand-toggle">▼</div>
            </div>
            
            <div class="card-content">
              <div class="summary-view">
                <div class="summary-row">
                  <span class="param-label">质量</span>
                  <span class="param-value" id="mass3Summary">1.0</span>
                </div>
                <div class="summary-row">
                  <span class="param-label">位置</span>
                  <span class="param-value position-coords" id="pos3Summary">1, 0, 0</span>
                </div>
              </div>
              
              <div class="detailed-view">
                <div class="parameter-group physics-params">
                  <h5>物理参数</h5>
                  
                  <div class="param-control">
                    <label>质量</label>
                    <div class="param-input-group">
                      <input type="range" id="mass3" class="param-slider" min="0.1" max="5.0" step="0.1" value="1.0">
                      <input type="number" id="mass3Input" class="param-number" min="0.1" max="5.0" step="0.1" value="1.0">
                    </div>
                  </div>
                  
                  <div class="param-control">
                    <label>X坐标</label>
                    <div class="param-input-group">
                      <input type="range" id="pos3X" class="param-slider" min="-10" max="10" step="0.1" value="1">
                      <input type="number" id="pos3XInput" class="param-number" min="-10" max="10" step="0.1" value="1">
                    </div>
                  </div>
                  
                  <div class="param-control">
                    <label>Y坐标</label>
                    <div class="param-input-group">
                      <input type="range" id="pos3Y" class="param-slider" min="-10" max="10" step="0.1" value="0">
                      <input type="number" id="pos3YInput" class="param-number" min="-10" max="10" step="0.1" value="0">
                    </div>
                  </div>
                  
                  <div class="param-control">
                    <label>Z坐标</label>
                    <div class="param-input-group">
                      <input type="range" id="pos3Z" class="param-slider" min="-10" max="10" step="0.1" value="0">
                      <input type="number" id="pos3ZInput" class="param-number" min="-10" max="10" step="0.1" value="0">
                    </div>
                  </div>
                </div>
                
                <div class="parameter-group visual-params">
                  <h5>外观设置</h5>
                  
                  <div class="param-control">
                    <label>名称</label>
                    <input type="text" id="name3" class="param-text" value="星球3" maxlength="20">
                  </div>
                  
                  <div class="param-control">
                    <label>颜色</label>
                    <input type="color" id="color3" class="param-color" value="#FFC107">
                  </div>
                  
                  <div class="param-control">
                    <label>形状</label>
                    <select id="shape3" class="param-select">
                      <option value="sphere">球体</option>
                      <option value="cube">立方体</option>
                      <option value="tetrahedron">四面体</option>
                      <option value="octahedron">八面体</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
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
      
      <!-- 左下角控制按钮组 - 保持不动 -->
      <div class="simulation-controls">
        <button id="play-btn" class="floating-btn" title="播放/暂停">⏸</button>
        <button id="reset-btn" class="floating-btn" title="重置">↺</button>
      </div>
      
      <!-- 右上角合并按钮组 -->
      <div class="top-right-actions">
        <button id="preset-btn" class="floating-btn" title="预设场景">☰</button>
        <button id="settings-btn" class="floating-btn" title="设置">⚙</button>
        <button id="tutorial-btn" class="floating-btn" title="教程">?</button>
        <button id="about-btn" class="floating-btn" title="关于">ℹ</button>
      </div>
      
      <!-- 右下角速度控制 -->
      <div class="bottom-right-controls">
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
      
      <!-- 底部居中视角选择 -->
      <div class="bottom-center-controls">
        <div class="camera-tracking-panel">
          <div class="tracking-buttons">
            <button id="track-planet-1" class="track-btn planet-1" title="追踪星球1（再次点击取消）" data-planet-color="#FF5252">
              <span>1</span>
            </button>
            <button id="track-planet-2" class="track-btn planet-2" title="追踪星球2（再次点击取消）" data-planet-color="#448AFF">
              <span>2</span>
            </button>
            <button id="track-planet-3" class="track-btn planet-3" title="追踪星球3（再次点击取消）" data-planet-color="#FFC107">
              <span>3</span>
            </button>
            <button id="track-global" class="track-btn global" title="全局视角（再次点击取消）">
              <span>⊙</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  `
}

// 镜头聚焦控制器
class CameraFocusController {
  private focusTarget: number | null = null
  private isAnimating: boolean = false
  private renderManager: RenderManager
  private isDynamicTracking: boolean = false
  private trackingOffset: { x: number, y: number, z: number } = { x: 1.5, y: 0.6, z: 0.9 }

  constructor(renderManager: RenderManager) {
    this.renderManager = renderManager
  }

  // 开始动态追踪指定星球
  public async startDynamicTracking(planetIndex: number, duration: number = 1000): Promise<void> {
    if (this.isAnimating) {
      // 等待当前动画完成
      while (this.isAnimating) {
        await new Promise(resolve => setTimeout(resolve, 50))
      }
    }

    this.isAnimating = true
    this.focusTarget = planetIndex
    this.isDynamicTracking = true

    try {
      // 首先进行初始聚焦动画
      await this.renderManager.focusCameraToBody(planetIndex, duration)

      // 动画完成后开始动态追踪
      this.renderManager.startDynamicTracking(planetIndex, this.trackingOffset)

      console.log(`开始动态追踪星球 ${planetIndex + 1}`)
    } finally {
      this.isAnimating = false
    }
  }

  // 停止动态追踪，启动动态全局视角
  public async stopDynamicTracking(duration: number = 1000): Promise<void> {
    if (this.isAnimating) return

    this.isAnimating = true
    this.isDynamicTracking = false
    this.focusTarget = null

    try {
      // 停止渲染管理器的单体动态追踪
      this.renderManager.stopDynamicTracking()

      // 执行切换到动态全局视角的动画
      await this.renderManager.resetCameraToGlobalView(duration)

      console.log('停止单体追踪，启动动态全局视角')
    } finally {
      this.isAnimating = false
    }
  }

  // 完全停止所有追踪，回到手动视角
  public async stopAllTracking(duration: number = 1000): Promise<void> {
    if (this.isAnimating) return

    this.isAnimating = true
    this.isDynamicTracking = false
    this.focusTarget = null

    try {
      // 停止所有追踪并回到初始位置
      await this.renderManager.resetCameraToInitialPosition(duration)

      console.log('停止所有追踪，回到初始手动视角')
    } finally {
      this.isAnimating = false
    }
  }

  // 兼容性方法：聚焦到指定星球（现在使用动态追踪）
  public async focusToPlanet(planetIndex: number, duration: number = 1000): Promise<void> {
    return this.startDynamicTracking(planetIndex, duration)
  }

  // 兼容性方法：恢复全局视角
  public async resetToGlobalView(duration: number = 1000): Promise<void> {
    return this.stopDynamicTracking(duration)
  }

  // 设置追踪偏移量
  public setTrackingOffset(x: number, y: number, z: number): void {
    this.trackingOffset = { x, y, z }

    // 如果正在追踪，更新偏移量
    if (this.isDynamicTracking && this.focusTarget !== null) {
      this.renderManager.updateTrackingOffset(this.trackingOffset)
    }
  }

  // 获取最佳聚焦距离
  public getOptimalFocusDistance(planetRadius: number): number {
    // 根据星球半径计算合适的聚焦距离
    return planetRadius * 5 // 距离为半径的5倍
  }

  // 获取当前聚焦目标
  public getFocusTarget(): number | null {
    return this.focusTarget
  }

  // 检查是否正在动画中
  public isAnimatingCamera(): boolean {
    return this.isAnimating
  }

  // 检查是否正在动态追踪
  public isDynamicallyTracking(): boolean {
    return this.isDynamicTracking
  }

  // 获取当前追踪偏移量
  public getTrackingOffset(): { x: number, y: number, z: number } {
    return { ...this.trackingOffset }
  }
}

// 星球卡片管理器
class PlanetCardManager {
  private cards: NodeListOf<Element>
  private activeCardIndex: number | null = null

  constructor() {
    this.cards = document.querySelectorAll('.planet-card')
    this.initializeCards()
  }

  private initializeCards(): void {
    // 初始化所有卡片为收缩状态
    this.cards.forEach((card, index) => {
      card.classList.add('collapsed')

      // 绑定卡片头部点击事件
      const header = card.querySelector('.card-header')
      if (header) {
        header.addEventListener('click', () => this.handleCardClick(index))
      }
    })
  }

  public handleCardClick(planetIndex: number): void {
    if (this.activeCardIndex === planetIndex) {
      // 如果点击的是当前展开的卡片，则收缩所有卡片
      this.collapseAllCards()
    } else {
      // 否则展开指定卡片
      this.expandCard(planetIndex)
    }
  }

  public expandCard(planetIndex: number): void {
    // 先收缩所有卡片（但不触发全局视角重置）
    this.collapseAllCardsWithoutCallback()

    // 展开指定卡片
    const card = this.cards[planetIndex]
    if (card) {
      card.classList.remove('collapsed')
      card.classList.add('expanded')
      this.activeCardIndex = planetIndex

      // 触发镜头聚焦事件
      this.onCardExpanded?.(planetIndex)
    }
  }

  // 展开卡片但不触发回调（用于同步状态）
  public expandCardSilently(planetIndex: number): void {
    // 先收缩所有卡片（但不触发全局视角重置）
    this.collapseAllCardsWithoutCallback()

    // 展开指定卡片
    const card = this.cards[planetIndex]
    if (card) {
      card.classList.remove('collapsed')
      card.classList.add('expanded')
      this.activeCardIndex = planetIndex
      // 注意：这里不触发 onCardExpanded 回调
    }
  }

  public collapseAllCards(): void {
    this.cards.forEach(card => {
      card.classList.remove('expanded')
      card.classList.add('collapsed')
    })
    this.activeCardIndex = null

    // 触发镜头重置事件
    this.onAllCardsCollapsed?.()
  }

  // 收缩所有卡片但不触发回调（用于展开其他卡片时）
  public collapseAllCardsWithoutCallback(): void {
    this.cards.forEach(card => {
      card.classList.remove('expanded')
      card.classList.add('collapsed')
    })
    this.activeCardIndex = null
    // 注意：这里不触发 onAllCardsCollapsed 回调
  }

  public getActiveCard(): Element | null {
    return this.activeCardIndex !== null ? this.cards[this.activeCardIndex] : null
  }

  public getActiveCardIndex(): number | null {
    return this.activeCardIndex
  }

  // 事件回调
  public onCardExpanded?: (planetIndex: number) => void
  public onAllCardsCollapsed?: () => void
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
  // 跟踪是否因为打开面板而自动暂停了模拟
  private wasPlayingBeforePanel = false
  // 星球卡片管理器
  private planetCardManager: PlanetCardManager | null = null
  // 镜头聚焦控制器
  private cameraFocusController: CameraFocusController | null = null
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
    
    // 设置初始光效状态
    const playBtn = document.getElementById('play-btn')
    if (playBtn) {
      playBtn.classList.add('paused') // 初始状态为暂停，显示红光
    }

    // 初始化镜头聚焦控制器
    this.cameraFocusController = new CameraFocusController(this.renderManager)

    // 初始化星球卡片管理器
    this.planetCardManager = new PlanetCardManager()
    this.setupCardManagerCallbacks()

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

    // 确保初始状态为手动视角（无激活按钮）
    this.updateTrackingButtonStates(-2)

    // 初始化星球按钮的内环颜色
    this.initializePlanetButtonColors()

    // 显示欢迎提示
    setTimeout(() => {
      this.showTooltip('欢迎使用三体问题模拟器！点击按钮开始追踪，再次点击取消追踪，空格键暂停/播放')
    }, 1000)

    console.log('三体模拟器初始化完成 - 悬浮式布局模式')
  }

  // 绑定滑块更新事件
  private bindSliderUpdates() {
    // 绑定新的参数控件
    this.bindParameterControls()

    // 绑定概览信息更新
    this.bindSummaryUpdates()

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
    // 应用物理参数按钮（保留用于兼容性，但现在参数是实时更新的）
    const applyPhysicsBtn = document.getElementById('applyPhysicsBtn')
    if (applyPhysicsBtn) {
      // 隐藏应用按钮，因为现在是实时更新
      applyPhysicsBtn.style.display = 'none'
    }

    // 加载预设按钮
    const loadPresetBtn = document.getElementById('loadPresetBtn')
    if (loadPresetBtn) {
      loadPresetBtn.addEventListener('click', () => this.loadPreset())
    }

    // 镜头追踪按钮
    this.bindCameraTrackingButtons()

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
        case '1':
          // 数字键1：追踪星球1
          event.preventDefault()
          this.handleTrackingButtonClick(0)
          break
        case '2':
          // 数字键2：追踪星球2
          event.preventDefault()
          this.handleTrackingButtonClick(1)
          break
        case '3':
          // 数字键3：追踪星球3
          event.preventDefault()
          this.handleTrackingButtonClick(2)
          break
        case '0':
        case 'g':
        case 'G':
          // 数字键0或G键：切换全局/手动视角
          event.preventDefault()
          this.handleTrackingButtonClick(-1)
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
  private togglePhysicsPanel(show?: boolean, skipAutoRestore: boolean = false) {
    const panel = document.querySelector('.floating-control-panel')
    if (!panel) return

    this.showPhysicsPanel = show !== undefined ? show : !this.showPhysicsPanel

    if (this.showPhysicsPanel) {
      panel.classList.add('open')
      // 先关闭设置面板，但跳过自动恢复
      this.toggleSettingsPanel(false, true)
      // 当面板打开时，隐藏右下角核心功能按钮组
      document.body.classList.add('control-panel-open')
      // 当打开物理参数面板时，自动暂停模拟
      if (this.isPlaying) {
        this.wasPlayingBeforePanel = true
        this.toggleSimulation(true) // 标记为自动调用
        this.showTooltip('已自动暂停模拟以便调整参数')
      }
    } else {
      panel.classList.remove('open')
      // 当两个面板都关闭时，显示右上角按钮组
      if (!this.showSettingsPanel) {
        document.body.classList.remove('control-panel-open')
      }
      // 当关闭物理参数面板时，如果之前是因为打开面板而暂停的，则自动恢复模拟
      if (!skipAutoRestore && this.wasPlayingBeforePanel && !this.isPlaying) {
        this.wasPlayingBeforePanel = false
        this.toggleSimulation(true) // 标记为自动调用
        this.showTooltip('已自动恢复模拟')
      }
    }
  }

  // 切换设置面板显示
  private toggleSettingsPanel(show?: boolean, skipAutoRestore: boolean = false) {
    const panel = document.querySelector('.floating-settings-panel')
    if (!panel) return

    this.showSettingsPanel = show !== undefined ? show : !this.showSettingsPanel

    if (this.showSettingsPanel) {
      panel.classList.add('open')
      // 先关闭物理参数面板，但跳过自动恢复
      this.togglePhysicsPanel(false, true)
      // 当面板打开时，隐藏右下角核心功能按钮组
      document.body.classList.add('control-panel-open')
      // 当打开设置面板时，自动暂停模拟
      if (this.isPlaying) {
        this.wasPlayingBeforePanel = true
        this.toggleSimulation(true) // 标记为自动调用
        this.showTooltip('已自动暂停模拟以便调整设置')
      }
    } else {
      panel.classList.remove('open')
      // 当两个面板都关闭时，显示右上角按钮组
      if (!this.showPhysicsPanel) {
        document.body.classList.remove('control-panel-open')
      }
      // 当关闭设置面板时，如果之前是因为打开面板而暂停的，则自动恢复模拟
      if (!skipAutoRestore && this.wasPlayingBeforePanel && !this.isPlaying) {
        this.wasPlayingBeforePanel = false
        this.toggleSimulation(true) // 标记为自动调用
        this.showTooltip('已自动恢复模拟')
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
      
      // 添加激活光效类
      if (this.isPlaying) {
        playBtn.classList.remove('paused')
        playBtn.classList.add('playing')
      } else {
        playBtn.classList.remove('playing')
        playBtn.classList.add('paused')
      }
    }

    if (statusElem) {
      statusElem.textContent = this.isPlaying ? '运行中' : '已暂停'
    }
  }

  // 切换模拟播放/暂停
  private toggleSimulation(isAutomatic: boolean = false) {
    this.isPlaying = !this.isPlaying

    // 只有在用户手动切换播放状态时，才重置自动暂停标记
    // 自动调用（如面板打开时的自动暂停）不应该重置这个标记
    if (!isAutomatic && (this.showPhysicsPanel || this.showSettingsPanel)) {
      this.wasPlayingBeforePanel = false
    }

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

  // 绑定参数控件
  private bindParameterControls() {
    // 为每个星球绑定物理参数控件
    for (let i = 1; i <= 3; i++) {
      this.bindPhysicsParameters(i)
      this.bindVisualParameters(i)
    }
  }

  // 绑定物理参数（质量和位置）
  private bindPhysicsParameters(planetIndex: number) {
    const params = ['mass', 'posX', 'posY', 'posZ']
    const paramMap = {
      'mass': `mass${planetIndex}`,
      'posX': `pos${planetIndex}X`,
      'posY': `pos${planetIndex}Y`,
      'posZ': `pos${planetIndex}Z`
    }

    params.forEach(param => {
      const paramId = paramMap[param as keyof typeof paramMap]
      const slider = document.getElementById(paramId) as HTMLInputElement
      const numberInput = document.getElementById(`${paramId}Input`) as HTMLInputElement

      if (slider && numberInput) {
        // 滑块变化时更新数字输入框和实时预览
        slider.addEventListener('input', () => {
          const value = parseFloat(slider.value)
          numberInput.value = value.toFixed(1)
          this.updateParameterRealtime(planetIndex - 1, param, value)
          this.updateSummaryDisplay(planetIndex - 1)
        })

        // 数字输入框变化时更新滑块和实时预览
        numberInput.addEventListener('input', () => {
          const value = parseFloat(numberInput.value)
          if (!isNaN(value)) {
            slider.value = value.toString()
            this.updateParameterRealtime(planetIndex - 1, param, value)
            this.updateSummaryDisplay(planetIndex - 1)
          }
        })
      }
    })
  }

  // 绑定视觉参数（名称、颜色、形状）
  private bindVisualParameters(planetIndex: number) {
    const nameInput = document.getElementById(`name${planetIndex}`) as HTMLInputElement
    const colorInput = document.getElementById(`color${planetIndex}`) as HTMLInputElement
    const shapeSelect = document.getElementById(`shape${planetIndex}`) as HTMLSelectElement

    if (nameInput) {
      nameInput.addEventListener('input', () => {
        this.updateVisualParameter(planetIndex - 1, 'name', nameInput.value)
        this.updatePlanetName(planetIndex - 1, nameInput.value)
      })
    }

    if (colorInput) {
      colorInput.addEventListener('input', () => {
        this.updateVisualParameter(planetIndex - 1, 'color', colorInput.value)
        this.updatePlanetColor(planetIndex - 1, colorInput.value)
      })
    }

    if (shapeSelect) {
      shapeSelect.addEventListener('change', () => {
        this.updateVisualParameter(planetIndex - 1, 'shape', shapeSelect.value)
        this.updatePlanetShape(planetIndex - 1, shapeSelect.value)
      })
    }
  }

  // 绑定概览信息更新
  private bindSummaryUpdates() {
    // 初始化概览显示
    for (let i = 0; i < 3; i++) {
      this.updateSummaryDisplay(i)
    }
  }

  // 实时更新物理参数
  private updateParameterRealtime(planetIndex: number, param: string, value: number) {
    if (!this.renderManager) return

    switch (param) {
      case 'mass':
        this.renderManager.updateBodyMass(planetIndex, value)
        break
      case 'posX':
      case 'posY':
      case 'posZ':
        this.updatePlanetPosition(planetIndex)
        break
    }
  }

  // 更新星球位置
  private updatePlanetPosition(planetIndex: number) {
    if (!this.renderManager) return

    const xInput = document.getElementById(`pos${planetIndex + 1}X`) as HTMLInputElement
    const yInput = document.getElementById(`pos${planetIndex + 1}Y`) as HTMLInputElement
    const zInput = document.getElementById(`pos${planetIndex + 1}Z`) as HTMLInputElement

    if (xInput && yInput && zInput) {
      const position = [
        parseFloat(xInput.value),
        parseFloat(yInput.value),
        parseFloat(zInput.value)
      ]

      this.renderManager.updateBodyPosition(planetIndex, position)
      // 只重置轨迹显示，不重置整个模拟状态，这样其他星球的位置不会被重置
      this.renderManager.resetTrails()
    }
  }

  // 更新视觉参数
  private updateVisualParameter(planetIndex: number, param: string, value: string) {
    console.log(`更新星球 ${planetIndex + 1} 的 ${param}: ${value}`)
    // TODO: 实现视觉参数的实时更新
  }

  // 更新星球名称显示
  private updatePlanetName(planetIndex: number, name: string) {
    const planetNameElement = document.querySelector(`.planet-card[data-planet="${planetIndex}"] .planet-name`)
    if (planetNameElement) {
      planetNameElement.textContent = name
    }
  }

  // 更新星球颜色
  private updatePlanetColor(planetIndex: number, color: string) {
    // 更新卡片指示器颜色
    const indicator = document.querySelector(`.planet-card[data-planet="${planetIndex}"] .planet-indicator`) as HTMLElement
    if (indicator) {
      indicator.style.backgroundColor = color
    }

    // 更新追踪按钮的内环颜色
    const trackBtn = document.getElementById(`track-planet-${planetIndex + 1}`) as HTMLElement
    if (trackBtn) {
      // 更新data属性
      trackBtn.setAttribute('data-planet-color', color)
      
      // 动态更新内环颜色
      const isActive = trackBtn.classList.contains('active')
      const ringWidth = isActive ? '3px' : '2px'
      trackBtn.style.boxShadow = `inset 0 0 0 ${ringWidth} ${color}${isActive ? `, 0 0 10px ${color}66` : ''}`
    }

    // 更新3D视图中的星球颜色
    if (this.renderManager) {
      this.renderManager.updateBodyColor(planetIndex, color)
    }
  }

  // 更新星球形状
  private updatePlanetShape(planetIndex: number, shape: string) {
    // 更新3D视图中的星球形状
    if (this.renderManager) {
      this.renderManager.updateBodyShape(planetIndex, shape)
    }
  }

  // 更新概览显示
  private updateSummaryDisplay(planetIndex: number) {
    const massElement = document.getElementById(`mass${planetIndex + 1}Summary`)
    const posElement = document.getElementById(`pos${planetIndex + 1}Summary`)

    if (massElement) {
      const massInput = document.getElementById(`mass${planetIndex + 1}`) as HTMLInputElement
      if (massInput) {
        massElement.textContent = parseFloat(massInput.value).toFixed(1)
      }
    }

    if (posElement) {
      const xInput = document.getElementById(`pos${planetIndex + 1}X`) as HTMLInputElement
      const yInput = document.getElementById(`pos${planetIndex + 1}Y`) as HTMLInputElement
      const zInput = document.getElementById(`pos${planetIndex + 1}Z`) as HTMLInputElement

      if (xInput && yInput && zInput) {
        const x = parseFloat(xInput.value).toFixed(1)
        const y = parseFloat(yInput.value).toFixed(1)
        const z = parseFloat(zInput.value).toFixed(1)
        posElement.textContent = `${x}, ${y}, ${z}`
      }
    }
  }

  // 设置卡片管理器回调
  private setupCardManagerCallbacks() {
    if (!this.planetCardManager || !this.cameraFocusController) return

    // 当卡片展开时的回调
    this.planetCardManager.onCardExpanded = async (planetIndex: number) => {
      console.log(`星球 ${planetIndex + 1} 卡片展开，开始聚焦镜头`)
      this.showTooltip(`聚焦到星球 ${planetIndex + 1}`)

      // 同步更新追踪按钮状态
      this.updateTrackingButtonStates(planetIndex)

      if (this.cameraFocusController) {
        await this.cameraFocusController.focusToPlanet(planetIndex)
      }
    }

    // 当所有卡片收缩时的回调
    this.planetCardManager.onAllCardsCollapsed = async () => {
      console.log('所有卡片收缩，切换到手动视角')
      this.showTooltip('切换到手动视角')

      // 同步更新追踪按钮状态（无激活状态）
      this.updateTrackingButtonStates(-2)

      if (this.cameraFocusController) {
        await this.cameraFocusController.stopAllTracking()
      }
    }
  }

  // 绑定镜头追踪按钮事件
  private bindCameraTrackingButtons() {
    // 星球追踪按钮
    const trackPlanet1Btn = document.getElementById('track-planet-1')
    const trackPlanet2Btn = document.getElementById('track-planet-2')
    const trackPlanet3Btn = document.getElementById('track-planet-3')
    const trackGlobalBtn = document.getElementById('track-global')

    if (trackPlanet1Btn) {
      trackPlanet1Btn.addEventListener('click', () => this.handleTrackingButtonClick(0))
    }

    if (trackPlanet2Btn) {
      trackPlanet2Btn.addEventListener('click', () => this.handleTrackingButtonClick(1))
    }

    if (trackPlanet3Btn) {
      trackPlanet3Btn.addEventListener('click', () => this.handleTrackingButtonClick(2))
    }

    if (trackGlobalBtn) {
      trackGlobalBtn.addEventListener('click', () => this.handleTrackingButtonClick(-1))
    }
  }

  // 处理追踪按钮点击
  private async handleTrackingButtonClick(planetIndex: number) {
    if (!this.cameraFocusController) return

    const currentActiveIndex = this.getCurrentActiveTrackingIndex()

    // 检查是否点击了已激活的按钮（全局按钮或星球按钮）
    if (planetIndex === currentActiveIndex) {
      // 如果点击的是已激活的按钮，则取消激活，回到手动视角
      this.updateTrackingButtonStates(-2) // -2 表示无激活状态

      // 收缩所有卡片
      if (this.planetCardManager) {
        this.planetCardManager.collapseAllCardsWithoutCallback()
      }

      this.showTooltip('切换到手动视角')
      await this.cameraFocusController.stopAllTracking()
      return
    }

    // 更新按钮状态
    this.updateTrackingButtonStates(planetIndex)

    // 同步星球卡片状态（使用静默方法避免循环调用）
    if (this.planetCardManager) {
      if (planetIndex === -1) {
        // 全局视角时收缩所有卡片（不触发回调）
        this.planetCardManager.collapseAllCardsWithoutCallback()
      } else {
        // 追踪星球时展开对应卡片（不触发回调）
        this.planetCardManager.expandCardSilently(planetIndex)
      }
    }

    if (planetIndex === -1) {
      // 动态全局视角
      this.showTooltip('切换到动态全局视角')
      await this.cameraFocusController.resetToGlobalView()
    } else {
      // 动态追踪指定星球
      this.showTooltip(`开始动态追踪星球 ${planetIndex + 1}`)
      await this.cameraFocusController.focusToPlanet(planetIndex)
    }
  }

  // 获取当前激活的追踪按钮索引
  private getCurrentActiveTrackingIndex(): number {
    const buttons = [
      document.getElementById('track-planet-1'),
      document.getElementById('track-planet-2'),
      document.getElementById('track-planet-3'),
      document.getElementById('track-global')
    ]

    for (let i = 0; i < buttons.length; i++) {
      if (buttons[i]?.classList.contains('active')) {
        return i === 3 ? -1 : i // 全局按钮返回-1，星球按钮返回对应索引
      }
    }
    return -2 // 无激活状态
  }

  // 更新追踪按钮状态
  private updateTrackingButtonStates(activePlanetIndex: number) {
    const buttons = [
      document.getElementById('track-planet-1'),
      document.getElementById('track-planet-2'),
      document.getElementById('track-planet-3'),
      document.getElementById('track-global')
    ]

    buttons.forEach((btn, index) => {
      if (btn) {
        btn.classList.remove('active')

        // 设置活跃状态（-2表示无激活状态）
        if (activePlanetIndex !== -2) {
          if (index === activePlanetIndex || (index === 3 && activePlanetIndex === -1)) {
            btn.classList.add('active')
          }
        }
      }
    })
  }

  // 处理摄像机控制增强
  private enhanceCameraControl() {
    const canvas = document.getElementById('three-canvas')
    if (!canvas) return

    canvas.addEventListener('dblclick', () => {
      // 双击重置摄像机视角
      this.handleTrackingButtonClick(-1)
    })
  }

  // 初始化星球按钮的内环颜色
  private initializePlanetButtonColors() {
    const planetColors = ['#FF5252', '#448AFF', '#FFC107']
    
    planetColors.forEach((color, index) => {
      const trackBtn = document.getElementById(`track-planet-${index + 1}`) as HTMLElement
      if (trackBtn) {
        // 设置data属性
        trackBtn.setAttribute('data-planet-color', color)
        
        // 设置初始内环颜色（调整为较小的内环）
        trackBtn.style.boxShadow = `inset 0 0 0 2px ${color}`
      }
    })
  }


}

// 启动应用
const simulationManager = new SimulationManager()
simulationManager.init()
