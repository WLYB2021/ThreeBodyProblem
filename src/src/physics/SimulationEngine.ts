
/**
 * 三体问题物理计算模块 - 模拟引擎
 * 整合物理计算、状态管理和模拟控制功能
 */
import type { CelestialBody, ThreeBodySystemState, PresetConfig } from './types';
import { rungeKutta4, calculateSystemEnergy, PRESET_SCENES, createDefaultSystem, G, setGravitationalConstant } from './physics';
import { copyVector } from './vectorUtils';

/**
 * 三体模拟引擎类
 */
export class ThreeBodySimulationEngine {
  private state: ThreeBodySystemState;
  private isRunning: boolean = false;
  private timeStep: number = 0.01;
  private maxStepsWithoutRender: number = 10;
  private onUpdateCallback?: (state: ThreeBodySystemState) => void;
  private onErrorCallback?: (error: Error) => void;
  
  /**
   * 构造函数
   * @param initialState 可选的初始状态，如果不提供则使用默认状态
   */
  constructor(initialState?: ThreeBodySystemState) {
    this.state = initialState || createDefaultSystem();
  }
  
  /**
   * 获取当前模拟状态
   */
  getState(): ThreeBodySystemState {
    // 返回状态的深拷贝，避免外部直接修改
    return {
      bodies: this.state.bodies.map(body => ({
        ...body,
        position: copyVector(body.position),
        velocity: copyVector(body.velocity),
        acceleration: copyVector(body.acceleration)
      })),
      time: this.state.time,
      energy: { ...this.state.energy }
    };
  }
  
  /**
   * 设置模拟参数
   * @param params 模拟参数
   */
  setParameters(params: {
    timeStep?: number;
    gravitationalConstant?: number;
    maxStepsWithoutRender?: number;
  }): void {
    if (params.timeStep !== undefined) {
      this.timeStep = Math.max(0.0001, Math.min(params.timeStep, 0.1)); // 限制时间步长范围
    }
    
    if (params.gravitationalConstant !== undefined) {
      setGravitationalConstant(params.gravitationalConstant);
    }
    
    if (params.maxStepsWithoutRender !== undefined) {
      this.maxStepsWithoutRender = Math.max(1, params.maxStepsWithoutRender);
    }
  }
  
  /**
   * 加载预设场景
   * @param presetId 预设ID
   * @returns 是否成功加载预设
   */
  loadPreset(presetId: string): boolean {
    const preset = PRESET_SCENES[presetId];
    if (!preset) {
      if (this.onErrorCallback) {
        this.onErrorCallback(new Error(`预设场景 "${presetId}" 不存在`));
      }
      return false;
    }
    
    // 创建新的天体数组
    const bodies: CelestialBody[] = preset.bodies.map((bodyData, index) => ({
      id: index,
      name: `天体${index + 1}`,
      mass: bodyData.mass,
      position: copyVector(bodyData.position),
      velocity: copyVector(bodyData.velocity),
      acceleration: { x: 0, y: 0, z: 0 },
      color: bodyData.color,
      radius: bodyData.radius
    }));
    
    // 更新状态
    this.state = {
      bodies,
      time: 0,
      energy: calculateSystemEnergy(bodies)
    };
    
    return true;
  }
  
  /**
   * 更新单个天体的质量
   * @param bodyId 天体ID
   * @param mass 新的质量
   * @returns 是否成功更新
   */
  updateBodyMass(bodyId: number, mass: number): boolean {
    const body = this.state.bodies.find(b => b.id === bodyId);
    if (!body || mass <= 0) {
      return false;
    }
    
    body.mass = mass;
    // 更新能量
    this.state.energy = calculateSystemEnergy(this.state.bodies);
    
    return true;
  }
  
  /**
   * 重置模拟
   */
  reset(): void {
    this.state = createDefaultSystem();
    this.isRunning = false;
  }
  
  /**
   * 开始模拟
   */
  start(): void {
    this.isRunning = true;
  }
  
  /**
   * 暂停模拟
   */
  pause(): void {
    this.isRunning = false;
  }
  
  /**
   * 切换模拟运行状态
   */
  toggle(): void {
    this.isRunning = !this.isRunning;
  }
  
  /**
   * 单步模拟
   */
  step(): void {
    this.simulateStep();
  }
  
  /**
   * 执行模拟步骤
   * @private
   */
  private simulateStep(): void {
    try {
      // 使用RK4积分器更新天体状态
      const newBodies = rungeKutta4(this.state.bodies, this.timeStep);
      
      // 更新状态
      this.state.bodies = newBodies;
      this.state.time += this.timeStep;
      
      // 计算新的能量
      this.state.energy = calculateSystemEnergy(newBodies);
      
      // 触发更新回调
      if (this.onUpdateCallback) {
        this.onUpdateCallback(this.getState());
      }
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback(error instanceof Error ? error : new Error(String(error)));
      } else {
        console.error('模拟出错:', error);
      }
      this.pause(); // 出错时暂停模拟
    }
  }
  
  /**
   * 启动动画循环
   * @param frameCallback 每帧调用的回调函数
   * @param fps 目标帧率，默认60fps
   * @returns 动画ID，可用于取消动画
   */
  startAnimationLoop(
    frameCallback?: (state: ThreeBodySystemState, deltaTime: number) => void,
    fps: number = 60
  ): number {    let lastFrameTime = performance.now();
    let accumulatedTime = 0; // 累积的未模拟时间
    
    // 计算帧间隔（毫秒）
    const frameInterval = 1000 / fps;
    
    const animationFrame = (currentTime: number): number => {
      // 计算距离上一帧的时间差（毫秒）
      const deltaTimeMs = currentTime - lastFrameTime;
      
      // 防抖动：限制最大时间差，避免长时间失去焦点后恢复导致的抖动
      const clampedDeltaTimeMs = Math.min(deltaTimeMs, 100);
      const deltaTime = clampedDeltaTimeMs / 1000; // 转换为秒
      
      // 如果模拟正在运行，执行物理计算
      if (this.isRunning) {
        // 累加时间
        accumulatedTime += deltaTime;
        
        // 执行必要的物理步数以赶上当前时间
        const maxSteps = Math.ceil(accumulatedTime / this.timeStep);
        const stepsToTake = Math.min(maxSteps, this.maxStepsWithoutRender);
        
        for (let i = 0; i < stepsToTake; i++) {
          this.simulateStep();
          accumulatedTime -= this.timeStep;
          
          // 如果累积时间已经小于时间步长，就不再继续模拟
          if (accumulatedTime < this.timeStep) break;
        }
      }
      
      // 更新最后一帧时间
      lastFrameTime = currentTime;
      
      // 调用帧回调
      if (frameCallback) {
        frameCallback(this.getState(), deltaTime);
      }
      
      // 继续动画循环
      return requestAnimationFrame(animationFrame);
    };
    
    return requestAnimationFrame(animationFrame);
  }
  
  /**
   * 设置状态更新回调
   * @param callback 回调函数
   */
  onUpdate(callback: (state: ThreeBodySystemState) => void): void {
    this.onUpdateCallback = callback;
  }
  
  /**
   * 设置错误回调
   * @param callback 错误回调函数
   */
  onError(callback: (error: Error) => void): void {
    this.onErrorCallback = callback;
  }
  
  /**
   * 获取当前模拟是否正在运行
   */
  getIsRunning(): boolean {
    return this.isRunning;
  }
  
  /**
   * 获取当前时间步长
   */
  getTimeStep(): number {
    return this.timeStep;
  }
  
  /**
   * 导出模拟状态
   * @returns 可序列化的状态对象
   */
  exportState(): any {
    return {
      time: this.state.time,
      bodies: this.state.bodies.map(body => ({
        id: body.id,
        name: body.name,
        mass: body.mass,
        position: { ...body.position },
        velocity: { ...body.velocity },
        color: body.color,
        radius: body.radius
      })),
      energy: { ...this.state.energy },
      parameters: {
        timeStep: this.timeStep,
        gravitationalConstant: G
      }
    };
  }
  
  /**
   * 导入模拟状态
   * @param savedState 保存的状态对象
   * @returns 是否成功导入
   */
  importState(savedState: any): boolean {
    try {
      if (!savedState || !savedState.bodies || !Array.isArray(savedState.bodies)) {
        return false;
      }
      
      // 重建天体数组
      const bodies: CelestialBody[] = savedState.bodies.map((bodyData: any) => ({
        id: bodyData.id || 0,
        name: bodyData.name || '天体',
        mass: bodyData.mass || 1.0,
        position: bodyData.position || { x: 0, y: 0, z: 0 },
        velocity: bodyData.velocity || { x: 0, y: 0, z: 0 },
        acceleration: { x: 0, y: 0, z: 0 },
        color: bodyData.color || '#FFFFFF',
        radius: bodyData.radius || 0.1
      }));
      
      // 更新状态
      this.state = {
        bodies,
        time: savedState.time || 0,
        energy: calculateSystemEnergy(bodies)
      };
      
      // 更新参数
      if (savedState.parameters) {
        if (savedState.parameters.timeStep) {
          this.timeStep = savedState.parameters.timeStep;
        }
      }
      
      return true;
    } catch (error) {
      if (this.onErrorCallback) {
        this.onErrorCallback(error instanceof Error ? error : new Error(String(error)));
      }
      return false;
    }
  }
}