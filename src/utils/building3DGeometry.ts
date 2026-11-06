import { ROOM_SCHEDULES, RoomSpec } from './architecturalMath';

export type ViewMode3D =
  | 'complete'
  | 'roof-removed'
  | 'floor-plan'
  | 'cutaway'
  | 'exploded'
  | 'walkthrough';

export type CameraPresetId =
  | 'exterior-iso'
  | 'top-plan'
  | 'front-south'
  | 'rear-north'
  | 'left-west'
  | 'right-east'
  | 'walkthrough-entry';

export interface LayerVisibility3D {
  roof: boolean;
  ceiling: boolean;
  externalWalls: boolean;
  internalWalls: boolean;
  doors: boolean;
  windows: boolean;
  furniture: boolean;
  labels: boolean;
  lighting: boolean;
  landscaping: boolean;
}

export interface MaterialCustomization3D {
  wallColorHex: string;
  wallName: string;
  floorColorHex: string;
  floorName: string;
  roofColorHex: string;
  roofName: string;
}

export interface WallOpening3D {
  id: string;
  tag: 'D1' | 'D2' | 'D3' | 'D4' | 'D5' | 'W1' | 'W2' | 'W3' | 'W4' | 'W5' | 'PORTAL';
  kind: 'door' | 'window' | 'portal';
  wallId: string;
  axis: 'x' | 'z';
  /** Start distance along wall axis (X or Z in metres) */
  startM: number;
  /** End distance along wall axis (X or Z in metres) */
  endM: number;
  /** Fixed coordinate on perpendicular axis (centreline of wall in metres) */
  perpCenterM: number;
  wallThicknessM: number;
  sillM: number;
  headM: number;
  label: string;
  swingDirection?: 'in-north' | 'in-south' | 'in-east' | 'in-west' | 'out-south';
}

export interface WallBoxSegment3D {
  id: string;
  wallId: string;
  isExternal: boolean;
  role: 'full-pier' | 'sill' | 'header-lintel';
  /** Min/Max bounds in metres (World X, Y, Z) */
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
  minZ: number;
  maxZ: number;
}

export interface Room3DMetadata {
  room: RoomSpec;
  id: string;
  shortLabel: string;
  /** Floor bounds in metres */
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
  centerX: number;
  centerZ: number;
  widthM: number;
  depthM: number;
  areaSqm: number;
  furnitureItems: string[];
  cameraEye: [number, number, number];
  cameraTarget: [number, number, number];
}

export const WALL_COLOR_SWATCHES = [
  { name: 'Warm Sandcrete Cream', hex: '#F3EFE6' },
  { name: 'Tropical Ivory White', hex: '#FAF8F5' },
  { name: 'Lagos Terracotta Tint', hex: '#EAD7C3' },
  { name: 'Savannah Sage Mist', hex: '#DCE3DC' },
  { name: 'Modern Cool Alabaster', hex: '#E5E9F0' },
] as const;

export const FLOOR_COLOR_SWATCHES = [
  { name: 'Polished Ivory Porcelain', hex: '#EAE5DC' },
  { name: 'Warm Travertine Stone', hex: '#D8C8B0' },
  { name: 'Charcoal Slate Vitrified', hex: '#6E737B' },
  { name: 'Terracotta Quarry Tile', hex: '#C67D5A' },
  { name: 'Nordic Oak Timber', hex: '#C8A982' },
] as const;

export const ROOF_COLOR_SWATCHES = [
  { name: 'Taupe-Grey Standing Seam (12°)', hex: '#6E6A66' },
  { name: 'Charcoal Slate (0.55mm Alu)', hex: '#374151' },
  { name: 'Terracotta Red (0.55mm Alu)', hex: '#9E3B2B' },
  { name: 'Abuja Forest Green', hex: '#234F36' },
  { name: 'Royal Atlantic Blue', hex: '#1E3A5F' },
] as const;

/**
 * Calculates the North Wing 12° roof elevation (in metres above ±0.00m FFL)
 * rising at 12° from the Rear (North) Low Eave (z = -0.90m -> +3.20m)
 * up to the Central Spine Clerestory Upper Ridge (z = 5.40m -> +4.54m).
 */
export function getNorthRoofElevationAtZ(zM: number): number {
  const zRear = -0.9;
  const zSpine = 5.4;
  const yLow = 3.2;
  const yHigh = 4.54;
  const t = (zM - zRear) / (zSpine - zRear);
  return Number((yLow + t * (yHigh - yLow)).toFixed(4));
}

/**
 * Calculates the South Wing 12° roof elevation (in metres above ±0.00m FFL)
 * sloping down at 12° from the Central Spine Lower Step-Ridge (z = 5.25m -> +4.12m)
 * to the Front (South) Verandah Low Eave (z = 11.45m -> +2.80m).
 */
export function getSouthRoofElevationAtZ(zM: number): number {
  const zSpine = 5.25;
  const zFront = 11.45;
  const yHigh = 4.12;
  const yLow = 2.8;
  const t = (zM - zSpine) / (zFront - zSpine);
  return Number((yHigh - t * (yHigh - yLow)).toFixed(4));
}

/**
 * Calculates the active 12° split-level roof elevation at any Z coordinate across the building.
 */
export function getRoofElevationAtZ(zM: number): number {
  if (zM <= 5.325) {
    return getNorthRoofElevationAtZ(zM);
  }
  return getSouthRoofElevationAtZ(zM);
}

/**
 * All 15 architectural openings (D1–D5, W1–W5, and the Central Spine Portal) in exact 3D world coordinates (metres).
 */
export const WALL_OPENINGS_3D: WallOpening3D[] = [
  // NORTH EXTERNAL WALL (z = 0.00..0.225, centerZ = 0.1125)
  {
    id: 'op-w2-n1',
    tag: 'W2',
    kind: 'window',
    wallId: 'ext-north',
    axis: 'x',
    startM: 1.425,
    endM: 2.625,
    perpCenterM: 0.1125,
    wallThicknessM: 0.225,
    sillM: 0.9,
    headM: 2.4,
    label: 'W2 (1200×1500mm Casement)',
  },
  {
    id: 'op-w4-n1',
    tag: 'W4',
    kind: 'window',
    wallId: 'ext-north',
    axis: 'x',
    startM: 4.7,
    endM: 5.3,
    perpCenterM: 0.1125,
    wallThicknessM: 0.225,
    sillM: 1.5,
    headM: 2.1,
    label: 'W4 (600×600mm Bath 1 Louvre)',
  },
  {
    id: 'op-w4-n2',
    tag: 'W4',
    kind: 'window',
    wallId: 'ext-north',
    axis: 'x',
    startM: 6.7,
    endM: 7.3,
    perpCenterM: 0.1125,
    wallThicknessM: 0.225,
    sillM: 1.5,
    headM: 2.1,
    label: 'W4 (600×600mm Bath 2 Louvre)',
  },
  {
    id: 'op-w2-n2',
    tag: 'W2',
    kind: 'window',
    wallId: 'ext-north',
    axis: 'x',
    startM: 9.375,
    endM: 10.575,
    perpCenterM: 0.1125,
    wallThicknessM: 0.225,
    sillM: 0.9,
    headM: 2.4,
    label: 'W2 (1200×1500mm Casement)',
  },

  // SOUTH EXTERNAL WALL (z = 8.925..9.150, centerZ = 9.0375)
  {
    id: 'op-w1-s1',
    tag: 'W1',
    kind: 'window',
    wallId: 'ext-south',
    axis: 'x',
    startM: 1.5,
    endM: 3.3,
    perpCenterM: 9.0375,
    wallThicknessM: 0.225,
    sillM: 0.9,
    headM: 2.4,
    label: 'W1 (1800×1500mm Sliding Window)',
  },
  {
    id: 'op-d1-s1',
    tag: 'D1',
    kind: 'door',
    wallId: 'ext-south',
    axis: 'x',
    startM: 4.425,
    endM: 5.625,
    perpCenterM: 9.0375,
    wallThicknessM: 0.225,
    sillM: 0.0,
    headM: 2.1,
    label: 'D1 (1200×2100mm Security Entrance Door)',
    swingDirection: 'out-south',
  },

  // WEST EXTERNAL WALL (x = 0.00..0.225, centerX = 0.1125)
  {
    id: 'op-w2-w1',
    tag: 'W2',
    kind: 'window',
    wallId: 'ext-west',
    axis: 'z',
    startM: 1.425,
    endM: 2.625,
    perpCenterM: 0.1125,
    wallThicknessM: 0.225,
    sillM: 0.9,
    headM: 2.4,
    label: 'W2 (1200×1500mm West Casement)',
  },

  // EAST EXTERNAL WALL (x = 11.775..12.000, centerX = 11.8875)
  {
    id: 'op-w2-e1',
    tag: 'W2',
    kind: 'window',
    wallId: 'ext-east',
    axis: 'z',
    startM: 1.425,
    endM: 2.625,
    perpCenterM: 11.8875,
    wallThicknessM: 0.225,
    sillM: 0.9,
    headM: 2.4,
    label: 'W2 (1200×1500mm East Casement)',
  },
  {
    id: 'op-w5-e1',
    tag: 'W5',
    kind: 'window',
    wallId: 'ext-east',
    axis: 'z',
    startM: 5.775,
    endM: 6.375,
    perpCenterM: 11.8875,
    wallThicknessM: 0.225,
    sillM: 1.5,
    headM: 2.1,
    label: 'W5 (600×600mm Pantry Louvre)',
  },
  {
    id: 'op-w3-e1',
    tag: 'W3',
    kind: 'window',
    wallId: 'ext-east',
    axis: 'z',
    startM: 7.325,
    endM: 8.525,
    perpCenterM: 11.8875,
    wallThicknessM: 0.225,
    sillM: 0.9,
    headM: 2.1,
    label: 'W3 (1200×1200mm Kitchen Casement)',
  },

  // INTERNAL DOORS & PORTALS
  {
    id: 'op-d2-b1',
    tag: 'D2',
    kind: 'door',
    wallId: 'int-bed1-south',
    axis: 'x',
    startM: 1.225,
    endM: 2.125,
    perpCenterM: 3.9,
    wallThicknessM: 0.15,
    sillM: 0.0,
    headM: 2.1,
    label: 'D2 (900×2100mm Bedroom 1 Door)',
    swingDirection: 'in-north',
  },
  {
    id: 'op-d2-b2',
    tag: 'D2',
    kind: 'door',
    wallId: 'int-bed2-south',
    axis: 'x',
    startM: 9.875,
    endM: 10.775,
    perpCenterM: 3.9,
    wallThicknessM: 0.15,
    sillM: 0.0,
    headM: 2.1,
    label: 'D2 (900×2100mm Bedroom 2 Door)',
    swingDirection: 'in-north',
  },
  {
    id: 'op-d4-ba1',
    tag: 'D4',
    kind: 'door',
    wallId: 'int-baths-south',
    axis: 'x',
    startM: 4.075,
    endM: 4.825,
    perpCenterM: 2.7,
    wallThicknessM: 0.15,
    sillM: 0.0,
    headM: 2.1,
    label: 'D4 (750×2100mm Bath 1 Door)',
    swingDirection: 'in-north',
  },
  {
    id: 'op-d4-ba2',
    tag: 'D4',
    kind: 'door',
    wallId: 'int-baths-south',
    axis: 'x',
    startM: 7.175,
    endM: 7.925,
    perpCenterM: 2.7,
    wallThicknessM: 0.15,
    sillM: 0.0,
    headM: 2.1,
    label: 'D4 (750×2100mm Bath 2 Door)',
    swingDirection: 'in-north',
  },
  {
    id: 'op-portal-spine',
    tag: 'PORTAL',
    kind: 'portal',
    wallId: 'int-passage-south',
    axis: 'x',
    startM: 4.9,
    endM: 6.3,
    perpCenterM: 5.25,
    wallThicknessM: 0.15,
    sillM: 0.0,
    headM: 2.4,
    label: 'Central Spine Archway (1400×2400mm)',
  },
  {
    id: 'op-d3-k1',
    tag: 'D3',
    kind: 'door',
    wallId: 'int-kitchen-west',
    axis: 'z',
    startM: 7.225,
    endM: 8.125,
    perpCenterM: 8.7,
    wallThicknessM: 0.15,
    sillM: 0.0,
    headM: 2.1,
    label: 'D3 (900×2100mm Kitchen Door)',
    swingDirection: 'in-east',
  },
  {
    id: 'op-d5-p1',
    tag: 'D5',
    kind: 'door',
    wallId: 'int-pantry-west',
    axis: 'z',
    startM: 5.85,
    endM: 6.6,
    perpCenterM: 9.9,
    wallThicknessM: 0.15,
    sillM: 0.0,
    headM: 2.1,
    label: 'D5 (750×2100mm Pantry Door)',
    swingDirection: 'in-east',
  },
];

interface RawWallDefinition {
  wallId: string;
  isExternal: boolean;
  axis: 'x' | 'z';
  startM: number;
  endM: number;
  perpMinM: number;
  perpMaxM: number;
}

const RAW_WALL_DEFINITIONS: RawWallDefinition[] = [
  // 4 External 225mm walls
  { wallId: 'ext-north', isExternal: true, axis: 'x', startM: 0.0, endM: 12.0, perpMinM: 0.0, perpMaxM: 0.225 },
  { wallId: 'ext-south', isExternal: true, axis: 'x', startM: 0.0, endM: 12.0, perpMinM: 8.925, perpMaxM: 9.15 },
  { wallId: 'ext-west', isExternal: true, axis: 'z', startM: 0.225, endM: 8.925, perpMinM: 0.0, perpMaxM: 0.225 },
  { wallId: 'ext-east', isExternal: true, axis: 'z', startM: 0.225, endM: 8.925, perpMinM: 11.775, perpMaxM: 12.0 },

  // 10 Internal 150mm partition walls
  { wallId: 'int-bed1-east', isExternal: false, axis: 'z', startM: 0.225, endM: 3.825, perpMinM: 3.825, perpMaxM: 3.975 },
  { wallId: 'int-bath1-bath2', isExternal: false, axis: 'z', startM: 0.225, endM: 2.625, perpMinM: 5.925, perpMaxM: 6.075 },
  { wallId: 'int-bed2-west', isExternal: false, axis: 'z', startM: 0.225, endM: 3.825, perpMinM: 8.025, perpMaxM: 8.175 },
  { wallId: 'int-baths-south', isExternal: false, axis: 'x', startM: 3.975, endM: 8.025, perpMinM: 2.625, perpMaxM: 2.775 },
  { wallId: 'int-bed1-south', isExternal: false, axis: 'x', startM: 0.225, endM: 3.975, perpMinM: 3.825, perpMaxM: 3.975 },
  { wallId: 'int-bed2-south', isExternal: false, axis: 'x', startM: 8.025, endM: 11.775, perpMinM: 3.825, perpMaxM: 3.975 },
  { wallId: 'int-passage-south', isExternal: false, axis: 'x', startM: 0.225, endM: 11.775, perpMinM: 5.175, perpMaxM: 5.325 },
  { wallId: 'int-kitchen-west', isExternal: false, axis: 'z', startM: 5.325, endM: 8.925, perpMinM: 8.625, perpMaxM: 8.775 },
  { wallId: 'int-pantry-west', isExternal: false, axis: 'z', startM: 5.325, endM: 6.825, perpMinM: 9.825, perpMaxM: 9.975 },
  { wallId: 'int-pantry-south', isExternal: false, axis: 'x', startM: 9.825, endM: 11.775, perpMinM: 6.825, perpMaxM: 6.975 },
];

/**
 * Generates all 3D wall box segments, automatically cutting out doorways and windows,
 * adding window sill walls below windows, and adding lintel/header walls above openings.
 */
export function generateWallSegments3D(): WallBoxSegment3D[] {
  const segments: WallBoxSegment3D[] = [];

  for (const wall of RAW_WALL_DEFINITIONS) {
    const openings = WALL_OPENINGS_3D.filter((o) => o.wallId === wall.wallId).sort(
      (a, b) => a.startM - b.startM
    );

    const getWallTopY = (_posAlongAxis: number): number => {
      // Main wall segments rise to +3.00m suspended ceiling / ring-beam datum;
      // the 8° sloped upper gable walls above +3.00m are built as exact tapered prisms under the roof.
      return 3.0;
    };

    const pushBox = (
      idSuffix: string,
      role: WallBoxSegment3D['role'],
      sAlong: number,
      eAlong: number,
      minY: number,
      maxY: number
    ) => {
      if (eAlong - sAlong <= 0.005 || maxY - minY <= 0.005) return;
      if (wall.axis === 'x') {
        segments.push({
          id: `${wall.wallId}-${idSuffix}`,
          wallId: wall.wallId,
          isExternal: wall.isExternal,
          role,
          minX: Number(sAlong.toFixed(4)),
          maxX: Number(eAlong.toFixed(4)),
          minY: Number(minY.toFixed(4)),
          maxY: Number(maxY.toFixed(4)),
          minZ: wall.perpMinM,
          maxZ: wall.perpMaxM,
        });
      } else {
        segments.push({
          id: `${wall.wallId}-${idSuffix}`,
          wallId: wall.wallId,
          isExternal: wall.isExternal,
          role,
          minX: wall.perpMinM,
          maxX: wall.perpMaxM,
          minY: Number(minY.toFixed(4)),
          maxY: Number(maxY.toFixed(4)),
          minZ: Number(sAlong.toFixed(4)),
          maxZ: Number(eAlong.toFixed(4)),
        });
      }
    };

    let cursor = wall.startM;
    let idx = 0;

    for (const op of openings) {
      if (op.startM > cursor + 0.005) {
        const mid = (cursor + op.startM) / 2;
        pushBox(`pier-${idx}`, 'full-pier', cursor, op.startM, 0, getWallTopY(mid));
        idx++;
      }

      const opMid = (op.startM + op.endM) / 2;
      const topY = getWallTopY(opMid);

      // Sill wall below window
      if (op.sillM > 0.005) {
        pushBox(`sill-${op.id}`, 'sill', op.startM, op.endM, 0, op.sillM);
      }

      // Header / lintel wall above door or window
      if (topY > op.headM + 0.005) {
        pushBox(`header-${op.id}`, 'header-lintel', op.startM, op.endM, op.headM, topY);
      }

      cursor = op.endM;
    }

    if (wall.endM > cursor + 0.005) {
      const mid = (cursor + wall.endM) / 2;
      pushBox(`pier-${idx}`, 'full-pier', cursor, wall.endM, 0, getWallTopY(mid));
    }
  }

  return segments;
}

const ROOM_FURNITURE_INVENTORY: Record<string, string[]> = {
  'bed-1': [
    'Queen Bed (1600×2000mm) + Upholstered Headboard',
    '2× Bedside Tables + Warm Reading Lamps',
    'Built-in 2-Door Wardrobe (1800×600mm)',
    'Split AC Indoor Unit (AC1) at +2.55m',
    'Woven Area Rug & Framed Wall Art',
  ],
  'bed-2': [
    'Double Bed (1500×2000mm) + Timber Headboard',
    '2× Bedside Tables + Reading Lamps',
    'Built-in 2-Door Wardrobe (1800×600mm)',
    'Split AC Indoor Unit (AC2) at +2.55m',
    'Woven Area Rug',
  ],
  'bath-1': [
    'Tempered Glass Corner Shower Enclosure (900×900mm)',
    'Close-Coupled Ceramic Water Closet (WC)',
    'Pedestal Wash Hand Basin + Chrome Mixer & Mirror',
    'High-Level Privacy Louvre Window (W4)',
  ],
  'bath-2': [
    'Tempered Glass Corner Shower Enclosure (900×900mm)',
    'Close-Coupled Ceramic Water Closet (WC)',
    'Pedestal Wash Hand Basin + Chrome Mixer & Mirror',
    'High-Level Privacy Louvre Window (W4)',
  ],
  'utility-store': [
    'Linen & Household Utility Storage Cabinet',
    'Recessed Circulation Alcove Serving Bath 1 & Bath 2',
    'Overhead 25mm Cold Water Branch in Ceiling Void',
  ],
  passage: [
    '1200mm Clear Central Spine Corridor',
    '600×600mm Hinged Ceiling Access Hatch at +3.00m',
    '3× Recessed LED Downlights (2-Way Switched)',
  ],
  living: [
    'L-Shaped Contemporary 5-Seater Fabric Sofa + Throw Pillows',
    'Hardwood & Glass Coffee Table on Textured Area Rug',
    'Low-Profile Media Console + 65" Wall-Mounted Smart TV',
    'Split AC Indoor Unit (AC3) & 12-Way Main Distribution Board (DB)',
    'Indoor Planter & Accent Floor Lamp',
  ],
  dining: [
    '6-Seater Solid Hardwood Dining Table (1800×900mm)',
    '6× Upholstered Dining Chairs',
    'Suspended Warm Brass Dining Pendant Light',
    'Sideboard Buffet Console',
  ],
  kitchen: [
    'L-Shaped Base Cabinets + Black Granite Worktop (+0.90m)',
    'Single-Bowl Stainless Steel Sink & Swan-Neck Mixer Tap',
    '4-Burner Gas/Electric Hob + Overhead Extractor Hood',
    'Double-Door Refrigerator (R) & Microwave Unit (MW)',
    'Upper Wall Hung Cupboards',
  ],
  pantry: [
    '4-Tier Heavy-Duty Timber & Steel Dry Goods Shelving',
    'Bulk Food Storage Containers',
    'High-Level Ventilation Louvre (W5)',
  ],
  verandah: [
    '3× 225×225mm Stone-Clad Reinforced Concrete Columns (C1–C3)',
    '2× Outdoor Timber Lounge Chairs + Side Table',
    'Terracotta Planter Boxes & Non-Slip Stoneware Step',
  ],
};

const SHORT_ROOM_LABELS: Record<string, string> = {
  'bed-1': 'BEDROOM 1',
  'bed-2': 'BEDROOM 2',
  'bath-1': 'BATHROOM 1',
  'bath-2': 'BATHROOM 2',
  'utility-store': 'UTILITY / STORE',
  passage: 'CORRIDOR / PASSAGE',
  living: 'LIVING ROOM',
  dining: 'DINING ROOM',
  kitchen: 'KITCHEN',
  pantry: 'PANTRY / STORE',
  verandah: 'FRONT VERANDAH',
};

/**
 * Returns 3D bounding metadata, camera inspect targets, and furniture inventory for all 11 spaces.
 */
export function getRooms3DMetadata(): Room3DMetadata[] {
  return ROOM_SCHEDULES.map((room) => {
    const minX = room.xMm / 1000;
    const minZ = room.yMm / 1000;
    const widthM = room.widthMm / 1000;
    const depthM = room.depthMm / 1000;
    const maxX = Number((minX + widthM).toFixed(4));
    const maxZ = Number((minZ + depthM).toFixed(4));
    const centerX = Number((minX + widthM / 2).toFixed(4));
    const centerZ = Number((minZ + depthM / 2).toFixed(4));

    return {
      room,
      id: room.id,
      shortLabel: SHORT_ROOM_LABELS[room.id] ?? room.name.toUpperCase(),
      minX,
      maxX,
      minZ,
      maxZ,
      centerX,
      centerZ,
      widthM,
      depthM,
      areaSqm: room.areaSqm,
      furnitureItems: ROOM_FURNITURE_INVENTORY[room.id] ?? [],
      cameraEye: [centerX + widthM * 0.35, 3.8, centerZ + depthM * 0.55],
      cameraTarget: [centerX, 0.9, centerZ],
    };
  });
}

/**
 * Finds which room contains the given (xM, zM) floor coordinates.
 * Note: Pantry is inside the NE corner of the Kitchen bay, so we check smaller rooms first.
 */
export function findRoomAtPoint3D(xM: number, zM: number): Room3DMetadata | null {
  const rooms = getRooms3DMetadata().sort((a, b) => a.areaSqm - b.areaSqm);
  for (const r of rooms) {
    if (xM >= r.minX && xM <= r.maxX && zM >= r.minZ && zM <= r.maxZ) {
      return r;
    }
  }
  return null;
}

/**
 * Checks whether a first-person walkthrough player at (xM, zM) with radius `radiusM`
 * can stand at that coordinate without colliding with any floor-level wall pier or sill.
 */
export function isWalkthroughPositionValid(
  xM: number,
  zM: number,
  radiusM = 0.22
): boolean {
  // Allow walking anywhere inside the compound plot (-3m..15m, -3m..14m)
  if (xM < -2.5 || xM > 14.5 || zM < -2.5 || zM > 13.5) {
    return false;
  }

  const segments = generateWallSegments3D();
  for (const seg of segments) {
    // Only collide with wall segments that exist below eye/body height (minY < 1.8m)
    if (seg.minY >= 1.8) continue;
    // Doors/portals are open in walkthrough mode, so only full piers & window sills block movement
    if (
      xM + radiusM > seg.minX &&
      xM - radiusM < seg.maxX &&
      zM + radiusM > seg.minZ &&
      zM - radiusM < seg.maxZ
    ) {
      return false;
    }
  }
  return true;
}

export interface CameraPresetSpec {
  id: CameraPresetId;
  label: string;
  position: [number, number, number];
  target: [number, number, number];
  orthographic?: boolean;
}

export const CAMERA_PRESETS_3D: CameraPresetSpec[] = [
  {
    id: 'exterior-iso',
    label: '3D Isometric',
    position: [17.5, 11.8, 19.5],
    target: [6.0, 1.4, 5.2],
  },
  {
    id: 'top-plan',
    label: 'Top Plan',
    position: [6.0, 21.0, 5.51],
    target: [6.0, 0.0, 5.5],
    orthographic: true,
  },
  {
    id: 'front-south',
    label: 'Front (South)',
    position: [6.0, 2.8, 21.5],
    target: [6.0, 1.8, 5.5],
  },
  {
    id: 'rear-north',
    label: 'Rear (North)',
    position: [-3.2, 3.15, -11.6],
    target: [4.8, 1.85, 3.2],
  },
  {
    id: 'left-west',
    label: 'Left (West)',
    position: [-10.5, 3.0, 5.2],
    target: [6.0, 1.8, 5.2],
  },
  {
    id: 'right-east',
    label: 'Right (East)',
    position: [22.5, 3.0, 5.2],
    target: [6.0, 1.8, 5.2],
  },
  {
    id: 'walkthrough-entry',
    label: 'Walkthrough',
    position: [5.0, 1.65, 10.2],
    target: [5.0, 1.65, 5.0],
  },
];
