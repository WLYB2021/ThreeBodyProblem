/**
 * 三体问题物理计算模块 - 核心物理计算
 */
import type { CelestialBody, ThreeBodySystemState, PresetConfig, Vector3 } from './types';
import { 
  copyVector, 
  addVectors, 
  subtractVectors, 
  multiplyVector, 
  distance
} from './vectorUtils';

// 引力常数 (归一化值，简化计算)
export let G = 1.0;

/**
 * 设置引力常数
 * @param value 新的引力常数值
 */
export function setGravitationalConstant(value: number): void {
  if (value > 0) {
    G = value;
  }
}

// 最小距离阈值，避免数值不稳定
const MIN_DISTANCE = 0.1;

/**
 * 计算两个天体之间的引力
 * @param body1 第一个天体
 * @param body2 第二个天体
 * @returns 第一个天体受到的引力向量
 */
export function calculateGravitationalForce(body1: CelestialBody, body2: CelestialBody): Vector3 {
  // 计算位置差向量
  const r = subtractVectors(body2.position, body1.position);
  
  // 计算距离的平方（避免开方操作）
  const distSquared = r.x * r.x + r.y * r.y + r.z * r.z;
  
  // 避免距离过小导致的数值不稳定
  if (distSquared < MIN_DISTANCE * MIN_DISTANCE) {
    // 使用软接触力替代无穷大的引力
    // 当两个物体距离过近时，施加一个与距离成正比的斥力
    const softDist = Math.sqrt(distSquared);
    const scaleFactor = (MIN_DISTANCE - softDist) / MIN_DISTANCE;
    
    // 创建一个斥力，方向从body2指向body1
    const repulsiveForce = multiplyVector(r, -scaleFactor * 0.1);
    return repulsiveForce;
  }
  
  // 计算距离
  const dist = Math.sqrt(distSquared);
  
  // 计算引力大小：F = G * m1 * m2 / r^2
  // 优化：避免重复计算，直接使用distSquared
  const forceMagnitude = G * body1.mass * body2.mass / distSquared;
  
  // 计算单位方向向量并乘以力的大小
  // 优化：手动归一化以避免额外的函数调用和对象创建
  const unitVector = {
    x: r.x / dist,
    y: r.y / dist,
    z: r.z / dist
  };
  
  return {
    x: unitVector.x * forceMagnitude,
    y: unitVector.y * forceMagnitude,
    z: unitVector.z * forceMagnitude
  };
}

/**
 * 计算所有天体的加速度
 * @param bodies 天体数组
 * @returns 更新后的天体数组
 */
export function updateAccelerations(bodies: CelestialBody[]): CelestialBody[] {
  // 创建新的天体数组，确保不会修改原数组
  const updatedBodies: CelestialBody[] = bodies.map(body => ({
    ...body,
    // 重置加速度
    acceleration: { x: 0, y: 0, z: 0 }
  }));
  
  // 优化：只计算每对天体一次
  const numBodies = updatedBodies.length;
  for (let i = 0; i < numBodies; i++) {
    const body1 = updatedBodies[i];
    
    for (let j = i + 1; j < numBodies; j++) {
      const body2 = updatedBodies[j];
      
      // 计算引力 (body1受到的来自body2的力)
      const forceOnBody1 = calculateGravitationalForce(body1, body2);
      
      // body2受到的力是body1受到的力的反方向
      const forceOnBody2 = multiplyVector(forceOnBody1, -1);
      
      // 计算并更新加速度 F = ma => a = F/m
      const acc1 = multiplyVector(forceOnBody1, 1 / body1.mass);
      const acc2 = multiplyVector(forceOnBody2, 1 / body2.mass);
      
      // 更新加速度
      body1.acceleration = addVectors(body1.acceleration, acc1);
      body2.acceleration = addVectors(body2.acceleration, acc2);
    }
  }
  
  return updatedBodies;
}

/**
 * 计算系统总能量
 * @param bodies 天体数组
 * @returns 能量对象 {kinetic, potential, total}
 */
export function calculateSystemEnergy(bodies: CelestialBody[]) {
  let kineticEnergy = 0;
  let potentialEnergy = 0;
  
  // 计算动能：KE = 0.5 * m * v^2
  bodies.forEach(body => {
    const vSquared = body.velocity.x * body.velocity.x + 
                     body.velocity.y * body.velocity.y + 
                     body.velocity.z * body.velocity.z;
    kineticEnergy += 0.5 * body.mass * vSquared;
  });
  
  // 计算势能：PE = -G * m1 * m2 / r (注意：避免重复计算)
  for (let i = 0; i < bodies.length; i++) {
    for (let j = i + 1; j < bodies.length; j++) {
      const dist = distance(bodies[i].position, bodies[j].position);
      if (dist > MIN_DISTANCE) {
        potentialEnergy -= G * bodies[i].mass * bodies[j].mass / dist;
      }
    }
  }
  
  const totalEnergy = kineticEnergy + potentialEnergy;
  
  return { kinetic: kineticEnergy, potential: potentialEnergy, total: totalEnergy };
}

/**
 * 四阶龙格-库塔(RK4)积分器
 * @param bodies 当前天体状态
 * @param dt 时间步长
 * @returns 下一时刻的天体状态
 */
export function rungeKutta4(bodies: CelestialBody[], dt: number): CelestialBody[] {
  // 创建临时状态副本
  const createStateCopy = (originalBodies: CelestialBody[]): CelestialBody[] => {
    return originalBodies.map(body => ({
      ...body,
      position: copyVector(body.position),
      velocity: copyVector(body.velocity)
    }));
  };
  
  // 计算导数 (速度和加速度)
  const calculateDerivatives = (currentBodies: CelestialBody[]): {position: Vector3[], velocity: Vector3[]} => {
    const positions: Vector3[] = [];
    const velocities: Vector3[] = [];
    
    // 更新加速度
    const bodiesWithAcceleration = updateAccelerations(currentBodies);
    
    bodiesWithAcceleration.forEach(body => {
      positions.push(copyVector(body.velocity)); // 位置的导数是速度
      velocities.push(copyVector(body.acceleration)); // 速度的导数是加速度
    });
    
    return { position: positions, velocity: velocities };
  };
  
  // 计算k1
  const k1 = calculateDerivatives(bodies);
  
  // 计算k2
  const bodiesForK2 = createStateCopy(bodies);
  for (let i = 0; i < bodiesForK2.length; i++) {
    bodiesForK2[i].position = addVectors(
      bodiesForK2[i].position,
      multiplyVector(k1.position[i], dt / 2)
    );
    bodiesForK2[i].velocity = addVectors(
      bodiesForK2[i].velocity,
      multiplyVector(k1.velocity[i], dt / 2)
    );
  }
  const k2 = calculateDerivatives(bodiesForK2);
  
  // 计算k3
  const bodiesForK3 = createStateCopy(bodies);
  for (let i = 0; i < bodiesForK3.length; i++) {
    bodiesForK3[i].position = addVectors(
      bodiesForK3[i].position,
      multiplyVector(k2.position[i], dt / 2)
    );
    bodiesForK3[i].velocity = addVectors(
      bodiesForK3[i].velocity,
      multiplyVector(k2.velocity[i], dt / 2)
    );
  }
  const k3 = calculateDerivatives(bodiesForK3);
  
  // 计算k4
  const bodiesForK4 = createStateCopy(bodies);
  for (let i = 0; i < bodiesForK4.length; i++) {
    bodiesForK4[i].position = addVectors(
      bodiesForK4[i].position,
      multiplyVector(k3.position[i], dt)
    );
    bodiesForK4[i].velocity = addVectors(
      bodiesForK4[i].velocity,
      multiplyVector(k3.velocity[i], dt)
    );
  }
  const k4 = calculateDerivatives(bodiesForK4);
  
  // 组合得到下一步状态
  const nextBodies = createStateCopy(bodies);
  for (let i = 0; i < nextBodies.length; i++) {
    // 位置更新: pos += dt * (k1_pos + 2*k2_pos + 2*k3_pos + k4_pos) / 6
    nextBodies[i].position = addVectors(
      nextBodies[i].position,
      multiplyVector(
        addVectors(
          addVectors(
            k1.position[i],
            multiplyVector(k2.position[i], 2)
          ),
          addVectors(
            multiplyVector(k3.position[i], 2),
            k4.position[i]
          )
        ),
        dt / 6
      )
    );
    
    // 速度更新: vel += dt * (k1_vel + 2*k2_vel + 2*k3_vel + k4_vel) / 6
    nextBodies[i].velocity = addVectors(
      nextBodies[i].velocity,
      multiplyVector(
        addVectors(
          addVectors(
            k1.velocity[i],
            multiplyVector(k2.velocity[i], 2)
          ),
          addVectors(
            multiplyVector(k3.velocity[i], 2),
            k4.velocity[i]
          )
        ),
        dt / 6
      )
    );
  }
  
  return nextBodies;
}

/**
 * 创建默认的三体系统
 * @returns 初始化的三体系统状态
 */
export function createDefaultSystem(): ThreeBodySystemState {
  const bodies: CelestialBody[] = [
    {
      id: 0,
      name: '天体1',
      mass: 1.0,
      position: { x: 1.0, y: 0.0, z: 0.0 },
      velocity: { x: 0.0, y: 0.5, z: 0.0 },
      acceleration: { x: 0.0, y: 0.0, z: 0.0 },
      color: '#FF4444',
      radius: 0.1
    },
    {
      id: 1,
      name: '天体2',
      mass: 1.0,
      position: { x: -1.0, y: 0.0, z: 0.0 },
      velocity: { x: 0.0, y: -0.5, z: 0.0 },
      acceleration: { x: 0.0, y: 0.0, z: 0.0 },
      color: '#4444FF',
      radius: 0.1
    },
    {
      id: 2,
      name: '天体3',
      mass: 1.0,
      position: { x: 0.0, y: 1.0, z: 0.0 },
      velocity: { x: -0.5, y: 0.0, z: 0.0 },
      acceleration: { x: 0.0, y: 0.0, z: 0.0 },
      color: '#44FF44',
      radius: 0.1
    }
  ];
  
  // 计算初始能量
  const energy = calculateSystemEnergy(bodies);
  
  return {
    bodies,
    time: 0,
    energy
  };
}

/**
 * 预设场景配置
 * 包含多种经典三体问题场景，用于教学和研究
 */
export const PRESET_SCENES: Record<string, PresetConfig> = {
  'default': {
    name: '默认配置',
    description: '三个等质量天体的初始配置',
    bodies: [
      { mass: 1.0, position: { x: 1.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.5, z: 0.0 }, color: '#FF4444', radius: 0.1 },
      { mass: 1.0, position: { x: -1.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: -0.5, z: 0.0 }, color: '#4444FF', radius: 0.1 },
      { mass: 1.0, position: { x: 0.0, y: 1.0, z: 0.0 }, velocity: { x: -0.5, y: 0.0, z: 0.0 }, color: '#44FF44', radius: 0.1 }
    ]
  },
  
  // === 周期轨道系列 ===
  'figure8': {
    name: '8字轨道',
    description: '三体系统的8字形周期轨道 (Chenciner-Montgomery)',
    bodies: [
      { mass: 1.0, position: { x: 0.97000436, y: -0.24308753, z: 0.0 }, velocity: { x: 0.466203685, y: 0.43236573, z: 0.0 }, color: '#FF4444', radius: 0.1 },
      { mass: 1.0, position: { x: -0.97000436, y: 0.24308753, z: 0.0 }, velocity: { x: 0.466203685, y: 0.43236573, z: 0.0 }, color: '#4444FF', radius: 0.1 },
      { mass: 1.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: -0.93240737, y: -0.86473146, z: 0.0 }, color: '#44FF44', radius: 0.1 }
    ]
  },
  
  'butterfly': {
    name: '蝴蝶轨道',
    description: '蝴蝶形状的周期轨道',
    bodies: [
      { mass: 1.0, position: { x: 0.30616, y: 0.12592, z: 0.0 }, velocity: { x: 0.12592, y: 0.30616, z: 0.0 }, color: '#FF6B6B', radius: 0.1 },
      { mass: 1.0, position: { x: -0.30616, y: -0.12592, z: 0.0 }, velocity: { x: 0.12592, y: 0.30616, z: 0.0 }, color: '#4ECDC4', radius: 0.1 },
      { mass: 1.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: -0.25184, y: -0.61232, z: 0.0 }, color: '#45B7D1', radius: 0.1 }
    ]
  },
  
  'broucke_a1': {
    name: 'Broucke A1轨道',
    description: 'Broucke A1族周期轨道',
    bodies: [
      { mass: 1.0, position: { x: 0.5, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 1.0, z: 0.0 }, color: '#FF4444', radius: 0.1 },
      { mass: 1.0, position: { x: -0.5, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: -1.0, z: 0.0 }, color: '#4444FF', radius: 0.1 },
      { mass: 1.0, position: { x: 0.0, y: 0.866, z: 0.0 }, velocity: { x: -0.866, y: 0.0, z: 0.0 }, color: '#44FF44', radius: 0.1 }
    ]
  },
  
  'yin_yang': {
    name: '阴阳轨道',
    description: '阴阳太极图案的周期轨道',
    bodies: [
      { mass: 1.0, position: { x: 0.464445, y: 0.396060, z: 0.0 }, velocity: { x: -0.93240737, y: -0.86473146, z: 0.0 }, color: '#2C3E50', radius: 0.1 },
      { mass: 1.0, position: { x: -0.464445, y: -0.396060, z: 0.0 }, velocity: { x: -0.93240737, y: -0.86473146, z: 0.0 }, color: '#ECF0F1', radius: 0.1 },
      { mass: 1.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: 1.86481474, y: 1.72946292, z: 0.0 }, color: '#E74C3C', radius: 0.1 }
    ]
  },
  
  // === 天体系统模拟 ===
  'sunearthmoon': {
    name: '日地月系统',
    description: '简化的日地月三体系统',
    bodies: [
      { mass: 100.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.0, z: 0.0 }, color: '#FFD700', radius: 0.2 },
      { mass: 1.0, position: { x: 5.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 3.16, z: 0.0 }, color: '#4444FF', radius: 0.1 },
      { mass: 0.01, position: { x: 5.1, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 3.36, z: 0.0 }, color: '#808080', radius: 0.05 }
    ]
  },
  
  'alpha_centauri': {
    name: '半人马座α',
    description: '半人马座α三星系统模拟',
    bodies: [
      { mass: 1.1, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.5, z: 0.0 }, color: '#FFF8DC', radius: 0.12 },
      { mass: 0.907, position: { x: 23.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: -0.6, z: 0.0 }, color: '#FFE4B5', radius: 0.11 },
      { mass: 0.123, position: { x: 4300.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.02, z: 0.0 }, color: '#FF6347', radius: 0.06 }
    ]
  },
  
  'binary_planet': {
    name: '双星行星',
    description: '围绕双星系统运行的行星',
    bodies: [
      { mass: 2.0, position: { x: -1.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: -1.0, z: 0.0 }, color: '#FFD700', radius: 0.15 },
      { mass: 1.5, position: { x: 1.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 1.33, z: 0.0 }, color: '#FFA500', radius: 0.13 },
      { mass: 0.01, position: { x: 0.0, y: 4.0, z: 0.0 }, velocity: { x: 1.2, y: 0.0, z: 0.0 }, color: '#4169E1', radius: 0.08 }
    ]
  },
  
  // === 拉格朗日点系列 ===
  'lagrange_l4': {
    name: '拉格朗日L4点',
    description: 'L4拉格朗日点稳定配置',
    bodies: [
      { mass: 10.0, position: { x: -0.5, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: -0.5, z: 0.0 }, color: '#FFD700', radius: 0.2 },
      { mass: 1.0, position: { x: 0.5, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 5.0, z: 0.0 }, color: '#FFA500', radius: 0.1 },
      { mass: 0.001, position: { x: 0.0, y: 0.866, z: 0.0 }, velocity: { x: -4.33, y: 2.25, z: 0.0 }, color: '#808080', radius: 0.05 }
    ]
  },
  
  'lagrange_l5': {
    name: '拉格朗日L5点',
    description: 'L5拉格朗日点稳定配置',
    bodies: [
      { mass: 10.0, position: { x: -0.5, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: -0.5, z: 0.0 }, color: '#FFD700', radius: 0.2 },
      { mass: 1.0, position: { x: 0.5, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 5.0, z: 0.0 }, color: '#FFA500', radius: 0.1 },
      { mass: 0.001, position: { x: 0.0, y: -0.866, z: 0.0 }, velocity: { x: 4.33, y: 2.25, z: 0.0 }, color: '#808080', radius: 0.05 }
    ]
  },
  
  'trojan_asteroids': {
    name: '特洛伊小行星',
    description: '木星特洛伊小行星群模拟',
    bodies: [
      { mass: 1000.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.0, z: 0.0 }, color: '#FFD700', radius: 0.25 },
      { mass: 1.0, position: { x: 5.2, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 2.76, z: 0.0 }, color: '#D2691E', radius: 0.12 },
      { mass: 0.0001, position: { x: 2.6, y: 4.5, z: 0.0 }, velocity: { x: -2.39, y: 1.38, z: 0.0 }, color: '#696969', radius: 0.03 }
    ]
  },
  
  // === 混沌系统 ===
  'chaotic_scattering': {
    name: '混沌散射',
    description: '展示混沌散射现象的配置',
    bodies: [
      { mass: 1.0, position: { x: 1.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.8, z: 0.0 }, color: '#E74C3C', radius: 0.1 },
      { mass: 1.2, position: { x: -0.8, y: 0.6, z: 0.0 }, velocity: { x: -0.3, y: -0.4, z: 0.0 }, color: '#3498DB', radius: 0.1 },
      { mass: 0.8, position: { x: 0.2, y: -1.1, z: 0.0 }, velocity: { x: 0.5, y: 0.2, z: 0.0 }, color: '#2ECC71', radius: 0.1 }
    ]
  },
  
  'hyperbolic_encounter': {
    name: '双曲线遭遇',
    description: '高速双曲线轨道遭遇',
    bodies: [
      { mass: 2.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.0, z: 0.0 }, color: '#FFD700', radius: 0.15 },
      { mass: 1.0, position: { x: 3.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 1.5, z: 0.0 }, color: '#FF6347', radius: 0.1 },
      { mass: 0.5, position: { x: -5.0, y: 2.0, z: 0.0 }, velocity: { x: 2.0, y: -0.5, z: 0.0 }, color: '#4169E1', radius: 0.08 }
    ]
  },
  
  'gravitational_slingshot': {
    name: '引力弹弓',
    description: '引力助推效应演示',
    bodies: [
      { mass: 100.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.0, z: 0.0 }, color: '#FFD700', radius: 0.2 },
      { mass: 10.0, position: { x: 3.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 3.65, z: 0.0 }, color: '#FF4500', radius: 0.15 },
      { mass: 0.001, position: { x: -8.0, y: 1.0, z: 0.0 }, velocity: { x: 1.8, y: 0.0, z: 0.0 }, color: '#C0C0C0', radius: 0.05 }
    ]
  },
  
  // === 3D空间轨道 ===
  'spatial_dance': {
    name: '3D空间舞蹈',
    description: '完全三维的复杂轨道运动',
    bodies: [
      { mass: 1.0, position: { x: 1.0, y: 0.0, z: 0.5 }, velocity: { x: 0.0, y: 0.7, z: 0.3 }, color: '#FF4444', radius: 0.1 },
      { mass: 1.0, position: { x: -0.5, y: 0.866, z: -0.5 }, velocity: { x: -0.6, y: -0.35, z: 0.4 }, color: '#4444FF', radius: 0.1 },
      { mass: 1.0, position: { x: -0.5, y: -0.866, z: 0.0 }, velocity: { x: 0.6, y: -0.35, z: -0.7 }, color: '#44FF44', radius: 0.1 }
    ]
  },
  
  'helical_motion': {
    name: '螺旋运动',
    description: '螺旋形三维轨道',
    bodies: [
      { mass: 2.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.0, z: 0.1 }, color: '#FFD700', radius: 0.15 },
      { mass: 1.0, position: { x: 1.5, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 1.2, z: 0.2 }, color: '#FF6347', radius: 0.1 },
      { mass: 1.0, position: { x: -1.5, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: -1.2, z: -0.2 }, color: '#4169E1', radius: 0.1 }
    ]
  },
  
  // === 特殊质量配置 ===
  'mass_hierarchy': {
    name: '质量层次',
    description: '不同质量等级的层次化系统',
    bodies: [
      { mass: 100.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.0, z: 0.0 }, color: '#FFD700', radius: 0.25 },
      { mass: 1.0, position: { x: 5.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 3.16, z: 0.0 }, color: '#FF4500', radius: 0.1 },
      { mass: 0.01, position: { x: 5.2, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 3.5, z: 0.0 }, color: '#4169E1', radius: 0.05 }
    ]
  },
  
  'equal_mass_triangle': {
    name: '等质量三角',
    description: '等边三角形配置的等质量系统',
    bodies: [
      { mass: 1.0, position: { x: 1.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.577, z: 0.0 }, color: '#E74C3C', radius: 0.1 },
      { mass: 1.0, position: { x: -0.5, y: 0.866, z: 0.0 }, velocity: { x: -0.5, y: -0.289, z: 0.0 }, color: '#3498DB', radius: 0.1 },
      { mass: 1.0, position: { x: -0.5, y: -0.866, z: 0.0 }, velocity: { x: 0.5, y: -0.289, z: 0.0 }, color: '#2ECC71', radius: 0.1 }
    ]
  },
  
  // === 教学演示场景 ===
  'energy_conservation': {
    name: '能量守恒演示',
    description: '用于演示能量守恒定律的稳定配置',
    bodies: [
      { mass: 1.0, position: { x: 0.0, y: 1.0, z: 0.0 }, velocity: { x: 1.0, y: 0.0, z: 0.0 }, color: '#FF4444', radius: 0.1 },
      { mass: 1.0, position: { x: -0.866, y: -0.5, z: 0.0 }, velocity: { x: -0.5, y: 0.866, z: 0.0 }, color: '#4444FF', radius: 0.1 },
      { mass: 1.0, position: { x: 0.866, y: -0.5, z: 0.0 }, velocity: { x: -0.5, y: -0.866, z: 0.0 }, color: '#44FF44', radius: 0.1 }
    ]
  },
  
  'momentum_conservation': {
    name: '动量守恒演示',
    description: '用于演示动量守恒定律的配置',
    bodies: [
      { mass: 2.0, position: { x: -1.0, y: 0.0, z: 0.0 }, velocity: { x: 0.5, y: 0.0, z: 0.0 }, color: '#FF6B6B', radius: 0.15 },
      { mass: 1.0, position: { x: 1.0, y: 0.0, z: 0.0 }, velocity: { x: -1.0, y: 0.5, z: 0.0 }, color: '#4ECDC4', radius: 0.1 },
      { mass: 1.0, position: { x: 0.0, y: 1.5, z: 0.0 }, velocity: { x: 0.0, y: -0.5, z: 0.0 }, color: '#45B7D1', radius: 0.1 }
    ]
  }
};