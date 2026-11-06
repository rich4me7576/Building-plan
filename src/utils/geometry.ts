import { Point, UnitSystem } from '../types';

export const PIXELS_PER_METER = 50; // 50 pixels = 1.0 meter
export const PIXELS_PER_FOOT = 15.24; // 1 foot = 0.3048 m -> ~15.24 px

export function distance(p1: Point, p2: Point): number {
  return Math.hypot(p2.x - p1.x, p2.y - p1.y);
}

export function angleBetween(p1: Point, p2: Point): number {
  return Math.atan2(p2.y - p1.y, p2.x - p1.x);
}

export function snapToGrid(value: number, gridSize: number): number {
  return Math.round(value / gridSize) * gridSize;
}

export function snapPointToGrid(p: Point, gridSize: number): Point {
  return {
    x: snapToGrid(p.x, gridSize),
    y: snapToGrid(p.y, gridSize),
  };
}

export function snapAngle(angle: number, thresholdRad: number = (5 * Math.PI) / 180): number {
  const commonAngles = [
    0,
    Math.PI / 4,
    Math.PI / 2,
    (3 * Math.PI) / 4,
    Math.PI,
    -Math.PI,
    (-3 * Math.PI) / 4,
    -Math.PI / 2,
    -Math.PI / 4,
  ];

  for (const target of commonAngles) {
    if (Math.abs(angle - target) < thresholdRad) {
      return target;
    }
  }
  return angle;
}

export function snapPointOrthogonal(start: Point, current: Point): Point {
  const dx = current.x - start.x;
  const dy = current.y - start.y;
  const rawAngle = Math.atan2(dy, dx);
  const snapped = snapAngle(rawAngle);
  const dist = Math.hypot(dx, dy);

  return {
    x: start.x + dist * Math.cos(snapped),
    y: start.y + dist * Math.sin(snapped),
  };
}

export function pointToSegmentDistance(
  p: Point,
  a: Point,
  b: Point
): { dist: number; closest: Point; t: number } {
  const l2 = (b.x - a.x) ** 2 + (b.y - a.y) ** 2;
  if (l2 === 0) return { dist: distance(p, a), closest: a, t: 0 };

  let t = ((p.x - a.x) * (b.x - a.x) + (p.y - a.y) * (b.y - a.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  const closest = {
    x: a.x + t * (b.x - a.x),
    y: a.y + t * (b.y - a.y),
  };

  return { dist: distance(p, closest), closest, t };
}

// Shoelace formula for polygon area
export function calculatePolygonArea(points: Point[], unit: UnitSystem = 'metric'): number {
  if (points.length < 3) return 0;
  let area = 0;
  const n = points.length;

  for (let i = 0; i < n; i++) {
    const j = (i + 1) % n;
    area += points[i].x * points[j].y;
    area -= points[j].x * points[i].y;
  }
  const pixelArea = Math.abs(area) / 2;

  // Convert pixel area to physical units
  if (unit === 'metric') {
    // 1 meter = 50px -> 1 sq m = 2500 sq px
    return pixelArea / (PIXELS_PER_METER * PIXELS_PER_METER);
  } else {
    // 1 foot = 15.24px
    return pixelArea / (PIXELS_PER_FOOT * PIXELS_PER_FOOT);
  }
}

export function calculatePolygonCentroid(points: Point[]): Point {
  if (points.length === 0) return { x: 0, y: 0 };
  let x = 0;
  let y = 0;
  for (const p of points) {
    x += p.x;
    y += p.y;
  }
  return { x: x / points.length, y: y / points.length };
}

export function formatLength(pixels: number, unit: UnitSystem = 'metric'): string {
  if (unit === 'metric') {
    const meters = pixels / PIXELS_PER_METER;
    if (meters < 1) {
      return `${Math.round(meters * 100)} cm`;
    }
    return `${meters.toFixed(2)} m`;
  } else {
    const totalInches = (pixels / PIXELS_PER_FOOT) * 12;
    const feet = Math.floor(totalInches / 12);
    const inches = Math.round(totalInches % 12);
    return `${feet}'-${inches}"`;
  }
}

export function formatArea(areaValue: number, unit: UnitSystem = 'metric'): string {
  if (unit === 'metric') {
    return `${areaValue.toFixed(1)} m²`;
  } else {
    return `${Math.round(areaValue)} sq ft`;
  }
}
