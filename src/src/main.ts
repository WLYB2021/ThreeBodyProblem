import './style.css'

// 基础页面布局 - 黑白极简风格
const app = document.getElementById('app')
if (app) {
  app.innerHTML = `
    <div class="three-body-app">
      <!-- 标题栏 -->
      <header class="app-header">
        <h1>三体模拟器</h1>
        <div class="header-controls">
          <button id="startBtn" class="control-btn">开始</button>
          <button id="pauseBtn" class="control-btn">暂停</button>
          <button id="resetBtn" class="control-btn">重置</button>
        </div>
      </header>
      
      <!-- 主内容区 -->
      <main class="app-main">
        <!-- Three.js渲染容器 -->
        <div class="canvas-container">
          <canvas id="three-canvas"></canvas>
        </div>
        
        <!-- 控制面板 -->
        <aside class="control-panel">
          <h3>控制参数</h3>
          
          <!-- 时间步长控制 -->
          <div class="control-group">
            <label for="timeStep">时间步长</label>
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
          
          <!-- 应用按钮 -->
          <button id="applyBtn" class="apply-btn">应用</button>
        </aside>
      </main>
      
      <!-- 底部信息栏 -->
      <footer class="app-footer">
        <div class="info-panel">
          <div class="info-item">
            <span class="info-label">模拟时间</span>
            <span id="simulationTime">0.00</span>
          </div>
          <div class="info-item">
            <span class="info-label">帧率</span>
            <span id="fps">0</span>
          </div>
          <div class="info-item">
            <span class="info-label">能量</span>
            <span id="energy">0.00</span>
          </div>
        </div>
      </footer>
    </div>
  `
}

// 绑定滑块值显示更新 - 保持简洁
const bindSliderUpdates = () => {
  const sliders = ['timeStep', 'mass1', 'mass2', 'mass3']
  
  sliders.forEach(id => {
    const slider = document.getElementById(id) as HTMLInputElement
    const valueDisplay = document.getElementById(`${id}Value`) as HTMLSpanElement
    
    if (slider && valueDisplay) {
      // 无动画的简单值更新
      slider.addEventListener('input', () => {
        valueDisplay.textContent = parseFloat(slider.value).toFixed(id === 'timeStep' ? 3 : 1)
      })
    }
  })
}

// 绑定按钮事件 - 保持极简交互
const bindButtonEvents = () => {
  const startBtn = document.getElementById('startBtn')
  const pauseBtn = document.getElementById('pauseBtn')
  const resetBtn = document.getElementById('resetBtn')
  const applyBtn = document.getElementById('applyBtn')
  
  if (startBtn) {
    startBtn.addEventListener('click', () => {
      console.log('模拟开始')
    })
  }
  
  if (pauseBtn) {
    pauseBtn.addEventListener('click', () => {
      console.log('模拟暂停')
    })
  }
  
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      console.log('模拟重置')
    })
  }
  
  if (applyBtn) {
    applyBtn.addEventListener('click', () => {
      const preset = (document.getElementById('preset') as HTMLSelectElement).value
      console.log('应用设置:', preset)
    })
  }
}

// 初始化应用
const init = () => {
  bindSliderUpdates()
  bindButtonEvents()
  console.log('三体模拟器初始化完成')
}

// 启动应用
init()
