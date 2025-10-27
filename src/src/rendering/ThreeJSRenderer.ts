/**
 * 三体问题Three.js渲染组件
 * 负责将物理模拟数据渲染为3D可视化效果
 */
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import type { ThreeBodySystemState, CelestialBody } from '../physics/types';

/**
 * 三体问题Three.js渲染器类
 */
export class ThreeBodyRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private controls: OrbitControls;
  private bodies: THREE.Mesh[] = [];
  private trails: THREE.Line[] = [];
  private trailPoints: Array<THREE.Vector3[]> = [];
  private container: HTMLElement;
  private showTrails: boolean = true;
  private trailLength: number = 100;
  private resizeHandler: () => void;
  private gridHelper: THREE.GridHelper; // 保存网格辅助对象引用，用于动态调整大小
  private lastCameraDistance: number = 0; // 保存上一次摄像机距离，用于判断是否需要更新网格
  
  /**
   * 构造函数
   * @param containerId 容器元素ID
   */
  constructor(containerId: string) {
    // 获取容器元素
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`找不到ID为${containerId}的容器元素`);
    }
    this.container = container;
    
    // 创建场景
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x0a0a1a); // 深蓝色背景
    
    // 创建摄像机
    const width = container.clientWidth;
    const height = container.clientHeight;
    this.camera = new THREE.PerspectiveCamera(75, width / height, 0.1, 1000);
    this.camera.position.set(15, 10, 15);
    this.camera.lookAt(0, 0, 0);
    
    // 创建渲染器
    this.renderer = new THREE.WebGLRenderer({ 
      antialias: true,
      alpha: true
    });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);
    
    // 添加轨道控制器
    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.dampingFactor = 0.05;
    this.controls.enableZoom = true;
    this.controls.enablePan = true;
    
    // 添加环境光
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.2);
    this.scene.add(ambientLight);
    
    // 添加方向光
    const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(10, 10, 10);
    this.scene.add(directionalLight);
    
    // 添加网格辅助（不再添加坐标轴辅助）
    this.gridHelper = new THREE.GridHelper(20, 20, 0x333333, 0x222222);
    this.scene.add(this.gridHelper);
    
    // 监听窗口大小变化
    this.resizeHandler = () => this.handleResize();
    window.addEventListener('resize', this.resizeHandler);
  }
  
  /**
   * 处理窗口大小变化
   */
  private handleResize(): void {
    const width = this.container.clientWidth;
    const height = this.container.clientHeight;
    
    this.camera.aspect = width / height;
    this.camera.updateProjectionMatrix();
    
    this.renderer.setSize(width, height);
  }
  
  /**
   * 更新渲染器以显示物理系统状态
   * @param state 三体系统状态
   */
  update(state: ThreeBodySystemState): void {
    // 确保天体数量匹配
    this.ensureBodies(state.bodies);
    
    // 更新天体位置和属性
    state.bodies.forEach((body, index) => {
      const mesh = this.bodies[index];
      if (mesh) {
        // 更新位置
        mesh.position.set(body.position.x, body.position.y, body.position.z);
        
        // 更新大小（基于质量）
        const scale = Math.cbrt(body.mass) * body.radius;
        mesh.scale.set(scale, scale, scale);
        
        // 更新轨迹
        if (this.showTrails) {
          this.updateTrail(body, index);
        }
      }
    });
    
    // 渲染场景
    this.render();
  }
  
  /**
   * 确保天体对象数量匹配
   * @param celestialBodies 天体数组
   */
  private ensureBodies(celestialBodies: CelestialBody[]): void {
    // 移除多余的天体
    while (this.bodies.length > celestialBodies.length) {
      const mesh = this.bodies.pop();
      const trail = this.trails.pop();
      this.trailPoints.pop();
      
      if (mesh) this.scene.remove(mesh);
      if (trail) this.scene.remove(trail);
    }
    
    // 添加缺少的天体
    while (this.bodies.length < celestialBodies.length) {
      const body = celestialBodies[this.bodies.length];
      this.createBodyMesh(body);
    }
  }
  
  /**
   * 创建天体的Three.js网格对象
   * @param body 天体数据
   */
  private createBodyMesh(body: CelestialBody): void {
    // 创建球体几何体
    const geometry = new THREE.SphereGeometry(1, 32, 32);
    
    // 创建材质
    const color = new THREE.Color(body.color);
    const material = new THREE.MeshPhongMaterial({ 
      color,
      emissive: color.clone().multiplyScalar(0.2), // 减少发光强度，从0.5降到0.2
      specular: 0xffffff,
      shininess: 100,
      wireframe: false
    });
    
    // 创建网格
    const mesh = new THREE.Mesh(geometry, material);
    const scale = Math.cbrt(body.mass) * body.radius;
    mesh.scale.set(scale, scale, scale);
    
    // 添加到场景和数组
    this.scene.add(mesh);
    this.bodies.push(mesh);
    
    // 创建轨迹数组
    this.trailPoints.push([]);
    
    // 创建轨迹线
    const trailGeometry = new THREE.BufferGeometry();
    const trailMaterial = new THREE.LineBasicMaterial({ 
      color: color.clone().multiplyScalar(0.8),
      linewidth: 1,
      transparent: true,
      opacity: 0.7
    });
    
    const trail = new THREE.Line(trailGeometry, trailMaterial);
    this.scene.add(trail);
    this.trails.push(trail);
  }
  
  /**
   * 更新天体轨迹
   * @param body 天体数据
   * @param index 索引
   */
  private updateTrail(body: CelestialBody, index: number): void {
    const points = this.trailPoints[index];
    if (!points) return;
    
    // 添加新点
    points.push(new THREE.Vector3(
      body.position.x,
      body.position.y,
      body.position.z
    ));
    
    // 限制轨迹长度
    while (points.length > this.trailLength) {
      points.shift();
    }
    
    // 更新轨迹线
    const trail = this.trails[index];
    if (trail && points.length > 1) {
      const positions = new Float32Array(points.length * 3);
      
      points.forEach((point, i) => {
        positions[i * 3] = point.x;
        positions[i * 3 + 1] = point.y;
        positions[i * 3 + 2] = point.z;
      });
      
      const geometry = new THREE.BufferGeometry();
      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      trail.geometry.dispose();
      trail.geometry = geometry;
    }
  }
  
  /**
   * 切换轨迹显示
   * @param show 是否显示轨迹
   */
  setShowTrails(show: boolean): void {
    this.showTrails = show;
    
    // 显示或隐藏所有轨迹
    this.trails.forEach(trail => {
      trail.visible = show;
    });
  }
  
  /**
   * 设置轨迹长度
   * @param length 轨迹点数量
   */
  setTrailLength(length: number): void {
    this.trailLength = Math.max(10, Math.min(length, 1000));
    
    // 调整所有轨迹长度
    this.trailPoints.forEach(points => {
      while (points.length > this.trailLength) {
        points.shift();
      }
    });
  }
  
  /**
   * 重置渲染器
   */
  reset(): void {
    // 清空轨迹
    this.clearTrails();
    
    // 重置摄像机位置
    this.camera.position.set(15, 10, 15);
    this.camera.lookAt(0, 0, 0);
    this.controls.reset();
  }
  
  /**
   * 仅清空轨迹，不重置摄像机
   */
  clearTrails(): void {
    this.trailPoints.forEach(points => {
      points.length = 0;
    });
    
    this.trails.forEach(trail => {
      const geometry = new THREE.BufferGeometry();
      trail.geometry.dispose();
      trail.geometry = geometry;
    });
  }
  
  /**
   * 更新星球颜色
   * @param bodyIndex 星球索引
   * @param color 新颜色（十六进制字符串）
   */
  updateBodyColor(bodyIndex: number, color: string): void {
    if (bodyIndex < 0 || bodyIndex >= this.bodies.length) return;
    
    const body = this.bodies[bodyIndex];
    const trail = this.trails[bodyIndex];
    
    if (body && body.material instanceof THREE.MeshPhongMaterial) {
      const newColor = new THREE.Color(color);
      
      // 更新主颜色
      body.material.color.copy(newColor);
      
      // 更新发光颜色，保持与主颜色一致的发光效果
      body.material.emissive.copy(newColor.clone().multiplyScalar(0.2));
    }
    
    if (trail && trail.material instanceof THREE.LineBasicMaterial) {
      const trailColor = new THREE.Color(color);
      trailColor.multiplyScalar(0.8); // 轨迹颜色稍微暗一些
      trail.material.color.copy(trailColor);
    }
  }
  
  /**
   * 更新星球形状
   * @param bodyIndex 星球索引
   * @param shape 新形状
   */
  updateBodyShape(bodyIndex: number, shape: string): void {
    if (bodyIndex < 0 || bodyIndex >= this.bodies.length) return;
    
    const body = this.bodies[bodyIndex];
    if (!body) return;
    
    // 保存当前的位置和缩放
    const currentPosition = body.position.clone();
    const currentScale = body.scale.clone();
    
    // 创建新的几何体
    let newGeometry: THREE.BufferGeometry;
    const radius = 0.2; // 基础半径
    
    switch (shape) {
      case 'cube':
        newGeometry = new THREE.BoxGeometry(radius * 2, radius * 2, radius * 2);
        break;
      case 'tetrahedron':
        newGeometry = new THREE.TetrahedronGeometry(radius * 1.5);
        break;
      case 'octahedron':
        newGeometry = new THREE.OctahedronGeometry(radius * 1.2);
        break;
      case 'sphere':
      default:
        newGeometry = new THREE.SphereGeometry(radius, 16, 16);
        break;
    }
    
    // 释放旧几何体
    body.geometry.dispose();
    
    // 应用新几何体
    body.geometry = newGeometry;
    body.position.copy(currentPosition);
    body.scale.copy(currentScale);
  }
  
  /**
   * 更新网格大小以跟随视角缩放
   */
  private updateGridSize(): void {
    // 基于摄像机到原点的距离来动态调整网格大小
    const distance = this.camera.position.length();
    // 根据距离计算合适的网格大小，确保网格总是足够大以覆盖视口
    const gridSize = Math.max(20, distance * 2);
    // 计算合适的分割数，保持网格线的密度适中
    const divisions = Math.floor(gridSize / 2);
    
    // 更新网格
    this.scene.remove(this.gridHelper);
    this.gridHelper.dispose();
    this.gridHelper = new THREE.GridHelper(gridSize, divisions, 0x333333, 0x222222);
    this.scene.add(this.gridHelper);
  }
  
  /**
   * 渲染场景
   */
  private render(): void {
    this.controls.update();
    
    // 监听摄像机移动，动态调整网格大小
    // 只在摄像机位置变化较大时更新，避免频繁重建网格
    const currentDistance = this.camera.position.length();
    if (Math.abs(currentDistance - this.lastCameraDistance) > 1) {
      this.updateGridSize();
      this.lastCameraDistance = currentDistance;
    }
    
    this.renderer.render(this.scene, this.camera);
  }
  
  /**
   * 聚焦摄像机到指定天体
   * @param bodyId 天体ID
   * @param duration 动画持续时间（毫秒）
   */
  async focusCameraToBody(bodyId: number, duration: number = 1000): Promise<void> {
    if (bodyId < 0 || bodyId >= this.bodies.length) return;
    
    const targetBody = this.bodies[bodyId];
    if (!targetBody) return;
    
    // 获取目标位置
    const targetPosition = targetBody.position.clone();
    
    // 检查星球是否在原点（可能还没有更新位置）
    if (targetPosition.length() < 0.1) {
      // 使用一个默认的偏移位置进行聚焦
      targetPosition.set(bodyId * 3, 0, 0);
    }
    
    // 计算合适的摄像机位置（在目标星球前方一定距离）
    const distance = 1.5; // 聚焦距离，进一步减少到1.5，更接近星球
    const offset = new THREE.Vector3(distance, distance * 0.4, distance * 0.6);
    const cameraTargetPosition = targetPosition.clone().add(offset);
    
    // 保存初始位置
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    
    // 执行动画
    return new Promise<void>((resolve) => {
      const startTime = performance.now();
      
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeProgress = this.easeInOutCubic(progress);
        
        // 插值摄像机位置
        this.camera.position.lerpVectors(startPosition, cameraTargetPosition, easeProgress);
        
        // 插值控制器目标
        this.controls.target.lerpVectors(startTarget, targetPosition, easeProgress);
        this.controls.update();
        
        // 强制渲染一帧以显示动画效果
        this.renderer.render(this.scene, this.camera);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * 重置摄像机到全局视角
   * @param duration 动画持续时间（毫秒）
   */
  async resetCameraToGlobalView(duration: number = 1000): Promise<void> {
    // 默认全局视角位置
    const defaultPosition = new THREE.Vector3(15, 10, 15);
    const defaultTarget = new THREE.Vector3(0, 0, 0);
    
    // 保存当前位置
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();
    
    // 执行动画
    return new Promise<void>((resolve) => {
      const startTime = performance.now();
      
      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        
        // 使用缓动函数
        const easeProgress = this.easeInOutCubic(progress);
        
        // 插值摄像机位置
        this.camera.position.lerpVectors(startPosition, defaultPosition, easeProgress);
        
        // 插值控制器目标
        this.controls.target.lerpVectors(startTarget, defaultTarget, easeProgress);
        this.controls.update();
        
        // 强制渲染一帧以显示动画效果
        this.renderer.render(this.scene, this.camera);
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };
      
      animate();
    });
  }
  
  /**
   * 缓动函数：三次方缓入缓出
   * @param t 进度值 (0-1)
   * @returns 缓动后的值 (0-1)
   */
  private easeInOutCubic(t: number): number {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }
  
  /**
   * 清理资源
   */
  dispose(): void {
    // 移除事件监听
    window.removeEventListener('resize', this.resizeHandler);
    
    // 清理几何体和材质
    this.bodies.forEach(mesh => {
      mesh.geometry.dispose();
      if (mesh.material instanceof THREE.Material) {
        mesh.material.dispose();
      }
      this.scene.remove(mesh);
    });
    
    this.trails.forEach(trail => {
      trail.geometry.dispose();
      if (trail.material instanceof THREE.Material) {
        trail.material.dispose();
      }
      this.scene.remove(trail);
    });
    
    // 清理渲染器
    this.renderer.dispose();
    if (this.container.contains(this.renderer.domElement)) {
      this.container.removeChild(this.renderer.domElement);
    }
  }
}