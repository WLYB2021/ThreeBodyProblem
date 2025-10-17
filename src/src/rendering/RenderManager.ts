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
      
      // 立即更新渲染
      const state = this.simulationEngine.getState();
      this.renderer.update(state);
    }
    return success;
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
   * 执行单步模拟
   */
  stepSimulation(): void {
    this.simulationEngine.step();
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
   * 清理资源
   */
  dispose(): void {
    this.stopAnimation();
    this.renderer.dispose();
    this.isInitialized = false;
  }
}