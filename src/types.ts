export type UnitSystem = 'metric' | 'imperial';

export interface Point {
  x: number;
  y: number;
}

export interface Wall {
  id: string;
  start: Point;
  end: Point;
  thickness: number; // in world units (e.g., 0.15m or 0.25m / 6in or 10in)
  isExterior: boolean;
  height?: number; // e.g., 2.8m or 9ft
  color?: string;
}

export type DoorSwing = 'left' | 'right' | 'double' | 'sliding';

export interface Door {
  id: string;
  wallId?: string;
  position: Point; // center position along wall or in space
  width: number; // e.g., 0.9m or 3ft
  angle: number; // orientation angle in radians
  swing: DoorSwing;
  label?: string;
}

export interface Window {
  id: string;
  wallId?: string;
  position: Point;
  width: number; // e.g., 1.2m or 4ft
  depth?: number;
  angle: number;
  type: 'single' | 'double' | 'slider';
  label?: string;
}

export interface Room {
  id: string;
  name: string;
  type: string; // 'Living Room', 'Bedroom', 'Kitchen', 'Bathroom', 'Balcony', 'Office', etc.
  points: Point[]; // polygon vertices
  color: string;
  floorMaterial?: 'hardwood' | 'tile' | 'carpet' | 'concrete' | 'marble';
  opacity?: number;
}

export interface FurnitureItem {
  id: string;
  name: string;
  category: 'living' | 'bedroom' | 'kitchen' | 'bathroom' | 'office' | 'outdoor' | 'doors_windows';
  iconType: string;
  x: number;
  y: number;
  width: number;
  depth: number;
  height?: number;
  rotation: number; // degrees 0-360
  color?: string;
}

export interface DimensionLine {
  id: string;
  start: Point;
  end: Point;
  offset: number;
  customText?: string;
}

export interface TextAnnotation {
  id: string;
  x: number;
  y: number;
  text: string;
  fontSize: number;
  rotation: number;
  color?: string;
}

export interface FloorLevel {
  id: string;
  name: string;
  elevation: number; // in meters or feet
  walls: Wall[];
  doors: Door[];
  windows: Window[];
  rooms: Room[];
  furniture: FurnitureItem[];
  dimensions: DimensionLine[];
  annotations: TextAnnotation[];
}

export interface ProjectMetadata {
  id: string;
  title: string;
  author: string;
  client: string;
  address: string;
  date: string;
  scaleRatio: string;
  northAngle: number; // in degrees
}

export type ActiveTool =
  | 'select'
  | 'pan'
  | 'wall'
  | 'room'
  | 'door'
  | 'window'
  | 'furniture'
  | 'measure'
  | 'text'
  | 'eraser';

export type CanvasTheme = 'blueprint' | 'cad-dark' | 'cad-light';

export interface ViewportTransform {
  x: number;
  y: number;
  zoom: number;
}

export interface SelectedItem {
  type: 'wall' | 'door' | 'window' | 'room' | 'furniture' | 'dimension' | 'annotation';
  id: string;
}
