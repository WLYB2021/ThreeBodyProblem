/**
 * 三体问题物理计算模块 - 向量运算工具
 */
import { Vector3 } from './types';

/**
 * 创建新的向量
 * @param x X坐标
 * @param y Y坐标
 * @param z Z坐标
 * @returns 新的向量对象
 */
export function createVector(x: number = 0, y: number = 0, z: number = 0): Vector3 {
  return { x, y, z };
}

/**
 * 复制向量
 * @param v 源向量
 * @returns 新的向量副本
 */
export function copyVector(v: Vector3): Vector3 {
  return { x: v.x, y: v.y, z: v.z };
}

/**
 * 向量加法
 * @param a 向量a
 * @param b 向量b
 * @returns 向量a + 向量b
 */
export function addVectors(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x + b.x, y: a.y + b.y, z: a.z + b.z };
}

/**
 * 向量减法
 * @param a 向量a
 * @param b 向量b
 * @returns 向量a - 向量b
 */
export function subtractVectors(a: Vector3, b: Vector3): Vector3 {
  return { x: a.x - b.x, y: a.y - b.y, z: a.z - b.z };
}

/**
 * 向量数乘
 * @param v 向量
 * @param scalar 标量值
 * @returns 标量乘以向量的结果
 */
export function multiplyVector(v: Vector3, scalar: number): Vector3 {
  return { x: v.x * scalar, y: v.y * scalar, z: v.z * scalar };
}

/**
 * 计算向量长度
 * @param v 向量
 * @returns 向量长度（模）
 */
export function vectorLength(v: Vector3): number {
  return Math.sqrt(v.x * v.x + v.y * v.y + v.z * v.z);
}

/**
 * 计算向量长度的平方（避免开方操作，用于性能优化）
 * @param v 向量
 * @returns 向量长度的平方
 */
export function vectorLengthSquared(v: Vector3): number {
  return v.x * v.x + v.y * v.y + v.z * v.z;
}

/**
 * 向量归一化
 * @param v 向量
 * @returns 归一化后的单位向量
 */
export function normalizeVector(v: Vector3): Vector3 {
  const length = vectorLength(v);
  if (length === 0) return { x: 0, y: 0, z: 0 };
  return {
    x: v.x / length,
    y: v.y / length,
    z: v.z / length
  };
}

/**
 * 向量点积
 * @param a 向量a
 * @param b 向量b
 * @returns 向量点积结果
 */
export function dotProduct(a: Vector3, b: Vector3): number {
  return a.x * b.x + a.y * b.y + a.z * b.z;
}

/**
 * 向量叉积
 * @param a 向量a
 * @param b 向量b
 * @returns 向量a × 向量b
 */
export function crossProduct(a: Vector3, b: Vector3): Vector3 {
  return {
    x: a.y * b.z - a.z * b.y,
    y: a.z * b.x - a.x * b.z,
    z: a.x * b.y - a.y * b.x
  };
}

/**
 * 计算两个向量之间的距离
 * @param a 向量a
 * @param b 向量b
 * @returns 两个向量之间的距离
 */
export function distance(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

/**
 * 计算两个向量之间的距离平方（避免开方操作，用于性能优化）
 * @param a 向量a
 * @param b 向量b
 * @returns 两个向量之间距离的平方
 */
export function distanceSquared(a: Vector3, b: Vector3): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  const dz = a.z - b.z;
  return dx * dx + dy * dy + dz * dz;
}