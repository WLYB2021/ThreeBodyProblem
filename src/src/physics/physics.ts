/**
 * 三体问题物理计算模块 - 核心物理计算
 */
import { CelestialBody, ThreeBodySystemState, PresetConfig, Vector3 } from './types';
import { 
  createVector, 
  copyVector, 
  addVectors, 
  subtractVectors, 
  multiplyVector, 
  vectorLength, 
  normalizeVector,
  distance
} from './vectorUtils';

// 引力常数 (归一化值，简化计算)
export const G = 1.0;

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
  const dist = vectorLength(r);
  
  // 避免距离过小导致的数值不稳定
  if (dist < MIN_DISTANCE) {
    return createVector(0, 0, 0);
  }
  
  // 计算引力大小：F = G * m1 * m2 / r^2
  const forceMagnitude = G * body1.mass * body2.mass / (dist * dist);
  
  // 计算单位方向向量并乘以力的大小
  const unitVector = normalizeVector(r);
  return multiplyVector(unitVector, forceMagnitude);
}

/**
 * 计算所有天体的加速度
 * @param bodies 天体数组
 * @returns 更新后的天体数组
 */
export function updateAccelerations(bodies: CelestialBody[]): CelestialBody[] {
  const updatedBodies = bodies.map(body => {
    // 复制天体对象
    const newBody = {
      ...body,
      acceleration: createVector(0, 0, 0)
    };
    
    // 计算每个天体受到的合力
    for (const otherBody of bodies) {
      if (newBody.id !== otherBody.id) {
        const force = calculateGravitationalForce(newBody, otherBody);
        // F = ma，所以 a = F/m
        const accelerationContribution = multiplyVector(force, 1 / newBody.mass);
        newBody.acceleration = addVectors(newBody.acceleration, accelerationContribution);
      }
    }
    
    return newBody;
  });
  
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
  'figure8': {
    name: '8字轨道',
    description: '三体系统的8字形周期轨道',
    bodies: [
      { mass: 1.0, position: { x: 0.97000436, y: -0.24308753, z: 0.0 }, velocity: { x: 0.466203685, y: 0.43236573, z: 0.0 }, color: '#FF4444', radius: 0.1 },
      { mass: 1.0, position: { x: -0.97000436, y: 0.24308753, z: 0.0 }, velocity: { x: 0.466203685, y: 0.43236573, z: 0.0 }, color: '#4444FF', radius: 0.1 },
      { mass: 1.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: -0.93240737, y: -0.86473146, z: 0.0 }, color: '#44FF44', radius: 0.1 }
    ]
  },
  'sunearthmoon': {
    name: '日地月系统',
    description: '简化的日地月三体系统',
    bodies: [
      { mass: 100.0, position: { x: 0.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 0.0, z: 0.0 }, color: '#FFD700', radius: 0.2 },
      { mass: 1.0, position: { x: 5.0, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 3.16, z: 0.0 }, color: '#4444FF', radius: 0.1 },
      { mass: 0.01, position: { x: 5.1, y: 0.0, z: 0.0 }, velocity: { x: 0.0, y: 3.36, z: 0.0 }, color: '#808080', radius: 0.05 }
    ]
  }
};