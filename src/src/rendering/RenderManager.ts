/**
 * 三体问题渲染管理器
 * 负责协调物理模拟引擎和Three.js渲染器之间的交互
 */
import { ThreeBodyRenderer } from './ThreeJSRenderer';
import { ThreeBodySimulationEngine } from '../physics/SimulationEngine';
import type { ThreeBodySystemState } from '../physics/types';

/**
 * 渲染管理器配置选项
 */
export interface RenderManagerOptions {
  containerId: string;
  showTrails?: boolean;
  trailLength?: number;
  initialPreset?: string;
}

/**
 * 三体问题渲染管理器类
 */
export class RenderManager {
  private renderer: ThreeBodyRenderer;
  private simulationEngine: ThreeBodySimulationEngine;
  private animationId: number | null = null;
  private isInitialized: boolean = false;
  
  /**
   * 构造函数
   * @param options 配置选项
   */
  constructor(options: RenderManagerOptions) {
    // 创建Three.js渲染器
    this.renderer = new ThreeBodyRenderer(options.containerId);
    
    // 创建物理模拟引擎
    this.simulationEngine = new ThreeBodySimulationEngine();
    
    // 应用初始配置
    if (options.showTrails !== undefined) {
      this.renderer.setShowTrails(options.showTrails);
    }
    
    if (options.trailLength !== undefined) {
      this.renderer.setTrailLength(options.trailLength);
    }
    
    if (options.initialPreset) {
      this.loadPreset(options.initialPreset);
    }
  }
  
  /**
   * 初始化渲染管理器
   */
  initialize(): void {
    if (this.isInitialized) return;
    
    // 设置状态更新回调
    this.simulationEngine.onUpdate((state: ThreeBodySystemState) => {
      this.renderer.update(state);
    });
    
    // 启动动画循环
    this.startAnimation();
    
    this.isInitialized = true;
    console.log('三体问题渲染管理器初始化完成');
  }
  
  /**
   * 启动动画循环
   */
  private startAnimation(): void {
    if (this.animationId !== null) return;
    
    this.animationId = this.simulationEngine.startAnimationLoop(() => {
      // 渲染器已经在onUpdate回调中更新
      // 这里可以添加额外的帧逻辑
    });
  }
  
  /**
   * 停止动画循环
   */
  private stopAnimation(): void {
    // 动画循环由simulationEngine管理，这里不需要直接调用cancelAnimationFrame
    // animationId只是一个标识符，实际的停止由simulationEngine.pause()处理
    this.animationId = null;
  }
  
  /**
   * 加载预设场景
   * @param presetId 预设ID
   * @returns 是否成功加载
   */
  loadPreset(presetId: string): boolean {
    const success = this.simulationEngine.loadPreset(presetId);
    if (success) {
      // 重置渲染器状态
      this.renderer.reset();
      
      // 获取当前状态并更新渲染
      const currentState = this.simulationEngine.getState();
      if (currentState) {
        this.renderer.update(currentState);
      }
      
      return true;
    }
    return false;
  }
  
  /**
   * 更新渲染（不更新物理模拟）
   * 用于暂停状态下保持视角控制功能
   */
  updateRendering(): void {
    // 获取当前状态并更新渲染，保持轨道控制器工作
    const currentState = this.simulationEngine.getState();
    if (currentState) {
      this.renderer.update(currentState);
    }
  }
  
  /**
   * 更新模拟参数
   * @param params 模拟参数
   */
  updateParameters(params: {
    timeStep?: number;
    gravitationalConstant?: number;
    showTrails?: boolean;
    trailLength?: number;
  }): void {
    // 更新物理引擎参数
    this.simulationEngine.setParameters({
      timeStep: params.timeStep,
      gravitationalConstant: params.gravitationalConstant
    });
    
    // 更新渲染器参数
    if (params.showTrails !== undefined) {
      this.renderer.setShowTrails(params.showTrails);
    }
    
    if (params.trailLength !== undefined) {
      this.renderer.setTrailLength(params.trailLength);
    }
  }
  
  /**
   * 更新天体质量
   * @param bodyId 天体ID
   * @param mass 新质量
   * @returns 是否成功更新
   */
  updateBodyMass(bodyId: number, mass: number): boolean {
    return this.simulationEngine.updateBodyMass(bodyId, mass);
  }
  
  /**
   * 更新天体位置
   * @param bodyId 天体ID
   * @param position 新位置 [x, y, z]
   * @returns 是否成功更新
   */
  updateBodyPosition(bodyId: number, position: number[]): boolean {
    return this.simulationEngine.updateBodyPosition(bodyId, position);
  }
  
  /**
   * 开始模拟
   */
  startSimulation(): void {
    this.simulationEngine.start();
  }
  
  /**
   * 暂停模拟
   */
  pauseSimulation(): void {
    this.simulationEngine.pause();
  }
  
  /**
   * 切换模拟状态
   */
  toggleSimulation(): void {
    this.simulationEngine.toggle();
  }
  
  /**
   * 重置模拟
   */
  resetSimulation(): void {
    this.simulationEngine.reset();
    this.renderer.reset();
    
    // 立即更新渲染
    const state = this.simulationEngine.getState();
    this.renderer.update(state);
  }
  
  /**
   * 仅重置轨迹显示，不重置模拟状态
   */
  resetTrails(): void {
    // 只清空轨迹，不重置摄像机和模拟状态
    this.renderer.clearTrails();
  }
  
  /**
   * 更新星球颜色
   * @param bodyId 星球ID
   * @param color 新颜色（十六进制字符串）
   */
  updateBodyColor(bodyId: number, color: string): void {
    this.renderer.updateBodyColor(bodyId, color);
  }
  
  /**
   * 更新星球形状
   * @param bodyId 星球ID
   * @param shape 新形状
   */
  updateBodyShape(bodyId: number, shape: string): void {
    this.renderer.updateBodyShape(bodyId, shape);
  }
  
  /**
   * 执行单步模拟
   * @param speed 模拟速度倍率
   */
  stepSimulation(speed: number = 1.0): void {
    this.simulationEngine.step(speed);
  }
  
  /**
   * 获取当前模拟状态
   * @returns 三体系统状态
   */
  getState(): ThreeBodySystemState {
    return this.simulationEngine.getState();
  }
  
  /**
   * 设置错误处理回调
   * @param callback 错误回调函数
   */
  onError(callback: (error: Error) => void): void {
    this.simulationEngine.onError(callback);
  }
  
  /**
   * 聚焦摄像机到指定天体
   * @param bodyId 天体ID
   * @param duration 动画持续时间（毫秒）
   */
  async focusCameraToBody(bodyId: number, duration: number = 1000): Promise<void> {
    return this.renderer.focusCameraToBody(bodyId, duration);
  }
  
  /**
   * 重置摄像机到初始手动位置
   * @param duration 动画持续时间（毫秒）
   */
  async resetCameraToInitialPosition(duration: number = 1000): Promise<void> {
    return this.renderer.resetCameraToInitialPosition(duration);
  }

  /**
   * 重置摄像机到全局视角
   * @param duration 动画持续时间（毫秒）
   */
  async resetCameraToGlobalView(duration: number = 1000): Promise<void> {
    return this.renderer.resetCameraToGlobalView(duration);
  }

  /**
   * 开始动态追踪指定天体
   * @param bodyId 天体ID
   * @param offset 追踪偏移量
   */
  startDynamicTracking(bodyId: number, offset: { x: number, y: number, z: number }): void {
    this.renderer.startDynamicTracking(bodyId, offset);
  }

  /**
   * 停止动态追踪
   */
  stopDynamicTracking(): void {
    this.renderer.stopDynamicTracking();
  }

  /**
   * 更新追踪偏移量
   * @param offset 新的偏移量
   */
  updateTrackingOffset(offset: { x: number, y: number, z: number }): void {
    this.renderer.updateTrackingOffset(offset);
  }

  /**
   * 开始动态全局视角
   */
  startDynamicGlobalView(): void {
    this.renderer.startDynamicGlobalView();
  }

  /**
   * 停止动态全局视角
   */
  stopDynamicGlobalView(): void {
    this.renderer.stopDynamicGlobalView();
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    this.stopAnimation();
    this.renderer.dispose();
    this.isInitialized = false;
  }
}