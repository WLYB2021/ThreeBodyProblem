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
  private dynamicTrackingTarget: number | null = null; // 当前动态追踪的目标
  private trackingOffset: THREE.Vector3 = new THREE.Vector3(1.5, 0.6, 0.9); // 追踪偏移量
  private isDynamicTracking: boolean = false; // 是否正在动态追踪
  private isDynamicGlobalView: boolean = false; // 是否正在动态全局视角
  private systemCenter: THREE.Vector3 = new THREE.Vector3(); // 系统质心
  private systemBounds: THREE.Box3 = new THREE.Box3(); // 系统边界
  private baseBodyScales: number[] = []; // 存储每个星球的基础缩放值

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
    this.camera.position.set(6, 4, 6); // 稍微拉近一些，提供更好的观测角度
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

    // 添加无限网格系统（跟随观察目标移动）
    const gridUnitSize = 2;
    const initialTarget = new THREE.Vector3(0, 0, 0); // 初始观察目标
    const initialDistance = this.camera.position.distanceTo(initialTarget);
    const initialGridSize = Math.max(20, initialDistance * 1.5);
    const initialDivisions = Math.floor(initialGridSize / gridUnitSize);

    // 初始网格位置对齐到网格坐标（基于观察目标）
    const initialGridX = Math.floor(initialTarget.x / gridUnitSize) * gridUnitSize;
    const initialGridZ = Math.floor(initialTarget.z / gridUnitSize) * gridUnitSize;

    this.gridHelper = new THREE.GridHelper(initialGridSize, initialDivisions, 0x333333, 0x222222);
    this.gridHelper.position.set(initialGridX, 0, initialGridZ);
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

        // 更新基础大小（基于质量）- 减小星球大小提高观测体验
        const baseScale = Math.cbrt(body.mass) * body.radius * 0.5; // 缩小到原来的50%
        this.baseBodyScales[index] = baseScale;

        // 应用动态缩放（基于摄像机距离）
        const dynamicScale = this.calculateDynamicScale();
        const finalScale = baseScale * dynamicScale;
        mesh.scale.set(finalScale, finalScale, finalScale);

        // 更新轨迹
        if (this.showTrails) {
          this.updateTrail(body, index);
        }
      }
    });

    // 计算系统质心（用于动态缩放计算）
    this.calculateSystemCenter(state.bodies);

    // 网格更新现在在render方法中基于摄像机距离处理

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
    // 减小星球大小，提高观测体验
    const baseScale = Math.cbrt(body.mass) * body.radius * 0.5; // 缩小到原来的50%
    mesh.scale.set(baseScale, baseScale, baseScale);

    // 添加到场景和数组
    this.scene.add(mesh);
    this.bodies.push(mesh);

    // 保存基础缩放值用于动态缩放
    this.baseBodyScales.push(baseScale);

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
    this.camera.position.set(6, 4, 6);
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

    // 保存当前的位置和缩放（保持与初始星球相同的大小）
    const currentPosition = body.position.clone();
    const currentScale = body.scale.x; // 假设xyz缩放相同

    // 创建新的几何体，使用与初始创建相同的基础大小（半径1）
    let newGeometry: THREE.BufferGeometry;

    switch (shape) {
      case 'cube':
        // 立方体：边长为2，相当于半径1的球体
        newGeometry = new THREE.BoxGeometry(2, 2, 2);
        break;
      case 'tetrahedron':
        // 四面体：调整大小使其视觉上与半径1的球体相似
        newGeometry = new THREE.TetrahedronGeometry(1.8);
        break;
      case 'octahedron':
        // 八面体：调整大小使其视觉上与半径1的球体相似
        newGeometry = new THREE.OctahedronGeometry(1.4);
        break;
      case 'sphere':
      default:
        // 球体：保持原始的半径1
        newGeometry = new THREE.SphereGeometry(1, 32, 32);
        break;
    }

    // 释放旧几何体
    body.geometry.dispose();

    // 应用新几何体
    body.geometry = newGeometry;
    body.position.copy(currentPosition);

    // 应用动态缩放（基于摄像机距离）
    const dynamicScale = this.calculateDynamicScale();
    const finalScale = currentScale * dynamicScale;
    body.scale.set(finalScale, finalScale, finalScale);
  }

  /**
   * 计算基于摄像机距离的动态缩放因子
   */
  private calculateDynamicScale(): number {
    // 计算摄像机到系统中心的距离
    const cameraDistance = this.camera.position.distanceTo(this.systemCenter);

    // 基准距离（初始摄像机位置的距离）
    const baseDistance = Math.sqrt(6 * 6 + 4 * 4 + 6 * 6); // 约10.77

    // 计算缩放因子，距离越远星球相对越大
    // 使用更明显和敏感的缩放效果
    const minScale = 0.2;  // 最小缩放（拉近时）
    const maxScale = 10.0; // 最大缩放（拉远时）

    // 使用指数函数提供更敏感的缩放效果
    const distanceRatio = cameraDistance / baseDistance;

    if (distanceRatio < 1) {
      // 距离小于基准距离时，使用指数衰减
      const scaleFactor = Math.pow(distanceRatio, 0.5) * 1.0;
      return Math.max(minScale, scaleFactor);
    } else {
      // 距离大于基准距离时，使用指数增长
      const scaleFactor = Math.pow(distanceRatio, 0.8) * 1.2;
      return Math.min(maxScale, scaleFactor);
    }
  }

  /**
   * 更新所有星球的动态缩放
   */
  private updateBodyScales(): void {
    const dynamicScale = this.calculateDynamicScale();

    // 添加调试信息（每60帧输出一次，避免控制台刷屏）
    if (Math.random() < 0.016) { // 约60fps时每秒输出一次
      const cameraDistance = this.camera.position.distanceTo(this.systemCenter);
      console.log(`动态缩放 - 距离: ${cameraDistance.toFixed(2)}, 缩放因子: ${dynamicScale.toFixed(2)}`);
    }

    this.bodies.forEach((mesh, index) => {
      if (mesh && index < this.baseBodyScales.length) {
        const finalScale = this.baseBodyScales[index] * dynamicScale;
        mesh.scale.set(finalScale, finalScale, finalScale);
      }
    });
  }

  /**
   * 计算系统质心
   */
  private calculateSystemCenter(bodies: CelestialBody[]): void {
    if (bodies.length === 0) return;

    let totalMass = 0;
    let centerX = 0, centerY = 0, centerZ = 0;

    bodies.forEach(body => {
      totalMass += body.mass;
      centerX += body.position.x * body.mass;
      centerY += body.position.y * body.mass;
      centerZ += body.position.z * body.mass;
    });

    if (totalMass > 0) {
      this.systemCenter.set(
        centerX / totalMass,
        centerY / totalMass,
        centerZ / totalMass
      );
    }
  }

  /**
   * 更新无限网格系统（跟随观察目标，只渲染视角内部分）
   */
  private updateInfiniteGrid(): void {
    // 使用控制器的目标位置作为网格中心，这样更准确
    const targetPosition = this.controls.target;

    // 固定的网格单元大小
    const gridUnitSize = 2; // 每个网格单元2个单位

    // 计算目标位置对应的网格坐标（对齐到网格）
    const gridX = Math.floor(targetPosition.x / gridUnitSize) * gridUnitSize;
    const gridZ = Math.floor(targetPosition.z / gridUnitSize) * gridUnitSize;

    // 计算视角范围内需要的网格大小
    const viewDistance = this.camera.position.distanceTo(targetPosition);
    const gridSize = Math.max(20, viewDistance * 1.5); // 确保覆盖视角范围
    const divisions = Math.floor(gridSize / gridUnitSize);

    // 检查网格是否需要更新（目标位置移动超过半个网格单元时更新）
    const lastGridX = this.gridHelper.position.x;
    const lastGridZ = this.gridHelper.position.z;
    const moveThreshold = gridUnitSize * 0.5;

    if (Math.abs(gridX - lastGridX) > moveThreshold ||
      Math.abs(gridZ - lastGridZ) > moveThreshold ||
      Math.abs(viewDistance - this.lastCameraDistance) > 3) {

      // 移除旧网格
      this.scene.remove(this.gridHelper);
      this.gridHelper.dispose();

      // 创建新网格，位置跟随观察目标
      this.gridHelper = new THREE.GridHelper(gridSize, divisions, 0x333333, 0x222222);
      this.gridHelper.position.set(gridX, 0, gridZ); // 网格跟随观察目标在XZ平面的位置
      this.scene.add(this.gridHelper);

      this.lastCameraDistance = viewDistance;
    }
  }

  /**
   * 渲染场景
   */
  private render(): void {
    // 执行动态追踪更新（在控制器更新之前）
    this.updateDynamicTracking();

    this.controls.update();

    // 更新星球动态缩放（基于摄像机距离）
    this.updateBodyScales();

    // 更新无限网格系统
    this.updateInfiniteGrid();

    this.renderer.render(this.scene, this.camera);
  }

  /**
   * 聚焦摄像机到指定天体
   * @param bodyId 天体ID
   * @param duration 动画持续时间（毫秒）
   */
  async focusCameraToBody(bodyId: number, duration: number = 1000): Promise<void> {
    if (bodyId < 0 || bodyId >= this.bodies.length) return;

    // 停止任何现有的动态追踪
    this.stopDynamicTracking();

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
   * 重置摄像机到初始手动位置
   * @param duration 动画持续时间（毫秒）
   */
  async resetCameraToInitialPosition(duration: number = 1000): Promise<void> {
    // 停止所有追踪
    this.stopDynamicTracking();
    this.stopDynamicGlobalView();

    // 初始摄像机位置（与构造函数中设置的一致）
    const initialPosition = new THREE.Vector3(6, 4, 6);
    const initialTarget = new THREE.Vector3(0, 0, 0);

    // 保存当前位置
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();

    // 执行动画到初始位置
    return new Promise<void>((resolve) => {
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用缓动函数
        const easeProgress = this.easeInOutCubic(progress);

        // 插值摄像机位置
        this.camera.position.lerpVectors(startPosition, initialPosition, easeProgress);

        // 插值控制器目标
        this.controls.target.lerpVectors(startTarget, initialTarget, easeProgress);
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
   * 重置摄像机到动态全局视角
   * @param duration 动画持续时间（毫秒）
   */
  async resetCameraToGlobalView(duration: number = 1000): Promise<void> {
    // 停止单体追踪
    this.stopDynamicTracking();

    // 计算当前系统状态
    this.updateSystemBounds();

    // 计算初始全局视角位置
    const size = this.systemBounds.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);
    const optimalDistance = Math.max(15, maxDimension * 2.5);

    const targetPosition = new THREE.Vector3(
      this.systemCenter.x + optimalDistance * 0.6,
      this.systemCenter.y + optimalDistance * 0.4,
      this.systemCenter.z + optimalDistance * 0.6
    );

    // 保存当前位置
    const startPosition = this.camera.position.clone();
    const startTarget = this.controls.target.clone();

    // 执行动画到初始全局位置
    return new Promise<void>((resolve) => {
      const startTime = performance.now();

      const animate = () => {
        const elapsed = performance.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // 使用缓动函数
        const easeProgress = this.easeInOutCubic(progress);

        // 插值摄像机位置
        this.camera.position.lerpVectors(startPosition, targetPosition, easeProgress);

        // 插值控制器目标到系统质心
        this.controls.target.lerpVectors(startTarget, this.systemCenter, easeProgress);
        this.controls.update();

        // 强制渲染一帧以显示动画效果
        this.renderer.render(this.scene, this.camera);

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          // 动画完成后启动动态全局视角
          this.startDynamicGlobalView();
          resolve();
        }
      };

      animate();
    });
  }

  /**
   * 开始动态追踪指定天体
   * @param bodyId 天体ID
   * @param offset 追踪偏移量
   */
  startDynamicTracking(bodyId: number, offset: { x: number, y: number, z: number }): void {
    if (bodyId < 0 || bodyId >= this.bodies.length) return;

    this.dynamicTrackingTarget = bodyId;
    this.trackingOffset.set(offset.x, offset.y, offset.z);
    this.isDynamicTracking = true;

    console.log(`开始动态追踪天体 ${bodyId}，偏移量:`, offset);
  }

  /**
   * 停止动态追踪
   */
  stopDynamicTracking(): void {
    this.isDynamicTracking = false;
    this.dynamicTrackingTarget = null;
    console.log('停止动态追踪');
  }

  /**
   * 开始动态全局视角
   */
  startDynamicGlobalView(): void {
    this.isDynamicGlobalView = true;
    this.isDynamicTracking = false;
    this.dynamicTrackingTarget = null;
    console.log('开始动态全局视角');
  }

  /**
   * 停止动态全局视角
   */
  stopDynamicGlobalView(): void {
    this.isDynamicGlobalView = false;
    console.log('停止动态全局视角');
  }

  /**
   * 更新追踪偏移量
   * @param offset 新的偏移量
   */
  updateTrackingOffset(offset: { x: number, y: number, z: number }): void {
    this.trackingOffset.set(offset.x, offset.y, offset.z);
  }

  /**
   * 计算系统质心和边界
   */
  private updateSystemBounds(): void {
    if (this.bodies.length === 0) return;

    // 重置边界
    this.systemBounds.makeEmpty();
    this.systemCenter.set(0, 0, 0);

    // 计算质心（假设所有星球质量相等，简化计算）
    let totalMass = 0;
    this.bodies.forEach(body => {
      const position = body.position;
      this.systemCenter.add(position);
      this.systemBounds.expandByPoint(position);
      totalMass += 1; // 简化：假设每个星球质量为1
    });

    // 计算平均位置作为质心
    this.systemCenter.divideScalar(this.bodies.length);
  }

  /**
   * 执行动态追踪更新
   */
  private updateDynamicTracking(): void {
    if (this.isDynamicTracking && this.dynamicTrackingTarget !== null) {
      this.updateSingleBodyTracking();
    } else if (this.isDynamicGlobalView) {
      this.updateDynamicGlobalTracking();
    }
  }

  /**
   * 更新单个星球追踪
   */
  private updateSingleBodyTracking(): void {
    const targetBody = this.bodies[this.dynamicTrackingTarget!];
    if (!targetBody) return;

    // 获取目标星球的当前位置
    const targetPosition = targetBody.position.clone();

    // 计算摄像机应该在的位置（目标位置 + 偏移量）
    const desiredCameraPosition = targetPosition.clone().add(this.trackingOffset);

    // 平滑移动摄像机到目标位置
    const lerpFactor = 0.05; // 追踪平滑度，值越小越平滑但响应越慢
    this.camera.position.lerp(desiredCameraPosition, lerpFactor);

    // 让摄像机始终看向目标星球
    this.controls.target.lerp(targetPosition, lerpFactor);

    // 更新控制器
    this.controls.update();
  }

  /**
   * 更新动态全局追踪
   */
  private updateDynamicGlobalTracking(): void {
    // 更新系统边界和质心
    this.updateSystemBounds();

    // 计算系统的大小
    const size = this.systemBounds.getSize(new THREE.Vector3());
    const maxDimension = Math.max(size.x, size.y, size.z);

    // 计算最佳观察距离（基于系统大小）
    const optimalDistance = Math.max(15, maxDimension * 2.5);

    // 计算最佳摄像机位置（在质心周围的最佳角度）
    const angle = performance.now() * 0.0001; // 缓慢旋转以获得更好的观察角度
    const height = optimalDistance * 0.6;
    const radius = optimalDistance * 0.8;

    const desiredCameraPosition = new THREE.Vector3(
      this.systemCenter.x + Math.cos(angle) * radius,
      this.systemCenter.y + height,
      this.systemCenter.z + Math.sin(angle) * radius
    );

    // 平滑移动摄像机
    const lerpFactor = 0.02; // 全局视角移动更平滑
    this.camera.position.lerp(desiredCameraPosition, lerpFactor);

    // 让摄像机看向系统质心
    this.controls.target.lerp(this.systemCenter, lerpFactor);

    // 更新控制器
    this.controls.update();
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