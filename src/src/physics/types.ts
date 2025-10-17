/**
 * 三体问题物理计算模块 - 数据类型定义
 */

/**
 * 3D向量接口，用于表示位置、速度、加速度和力
 */
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

/**
 * 天体对象接口
 */
export interface CelestialBody {
  id: number;           // 天体ID
  name: string;         // 天体名称
  mass: number;         // 质量
  position: Vector3;    // 位置
  velocity: Vector3;    // 速度
  acceleration: Vector3; // 加速度
  color: string;        // 颜色表示
  radius: number;       // 渲染半径
}

/**
 * 三体系统状态
 */
export interface ThreeBodySystemState {
  bodies: CelestialBody[]; // 三个天体
  time: number;           // 当前时间
  energy: {
    kinetic: number;     // 动能
    potential: number;   // 势能
    total: number;       // 总能量
  };
}

/**
 * 预设场景配置
 */
export interface PresetConfig {
  name: string;          // 预设名称
  description: string;   // 描述
  bodies: Array<{
    mass: number;
    position: Vector3;
    velocity: Vector3;
    color: string;
    radius: number;
  }>;
}