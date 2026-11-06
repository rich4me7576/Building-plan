export type UnitMode = 'mm' | 'm';

export interface SiteResolutionConfig {
  /** East front roof overhang resolution (Page 9 item 8) */
  eastOverhangMode: 'add-column-c4' | 'cut-back-eave';
  /** Foundation concrete specification (Page 9 item 7) */
  foundationConcreteGrade: 'C25/30-reinforced' | '1:3:6-mass-concrete';
  /** DPC level resolution (Page 9 item 5) */
  dpcDatumMode: '0.000-FFL' | '+0.150-raised';
  /** Include proposed 225x225 RC continuous ring beam at lintel level (+2.10m) */
  includeRingBeam: boolean;
}

export interface DimensionSegment {
  label: string;
  lengthMm: number;
  code?: string;
  kind: 'wall' | 'clear' | 'pier' | 'opening' | 'grid' | 'overhang' | 'overall';
}

export interface RoomSpec {
  id: string;
  name: string;
  code: string;
  widthMm: number;
  depthMm: number;
  areaSqm: number;
  floorFinish: string;
  wallFinish: string;
  ceilingFinish: string;
  ceilingHeightMm: number;
  xMm: number; // internal clear top-left X from NW building corner
  yMm: number; // internal clear top-left Y from NW building corner
  doors: string[];
  windows: string[];
  electricalNotes: string;
  plumbingNotes: string;
  masonryCourseNote: string;
}

export interface OpeningSpec {
  tag: string;
  category: 'door' | 'window';
  type: string;
  location: string;
  widthMm: number;
  heightMm: number;
  sillHeightMm: number;
  headHeightMm: number;
  lintelLengthMm: number; // width + 2 * 225mm bearing
  lintelSection: string;
  qty: number;
  swingOrOperation: string;
}

export interface BOQItem {
  id: string;
  category: 'Substructure' | 'Superstructure Masonry' | 'Roofing & Carpentry' | 'Doors & Windows' | 'Plumbing & Mechanical' | 'Electrical Installation' | 'Finishes';
  description: string;
  unit: string;
  quantity: number;
  basisNote: string;
}

export const BUILDING_CONSTANTS = {
  overallWidthMm: 12000,
  mainBlockDepthMm: 9150,
  verandahDepthMm: 1850,
  verandahWidthMm: 6000,
  overallDepthMm: 11000,
  extWallMm: 225,
  intWallMm: 150,
  roofWidthMm: 13800, // 12,000 + 900 eaves each side
  roofDepthMm: 12350, // 11,000 + 900 rear eave + 450 front eave
  roofEaveSideMm: 900,
  roofPitchDeg: 12,
  highEaveM: 4.54, // Upper Clerestory Ridge at Spine (z = 5.40m)
  southRidgeM: 4.12, // Lower South Wing Ridge at Spine (z = 5.25m)
  lowEaveM: 3.20, // Rear (North) Low Eave (z = -0.90m)
  frontEaveM: 2.80, // Front (South) Verandah Eave (z = 11.45m)
  ceilingHeightM: 3.00,
  fflM: 0.00,
  groundLevelM: -0.15,
  foundationBaseM: -1.20,
  stripFootingWidthMm: 750,
  stripFootingThicknessMm: 225,
  padFootingSizeMm: 900,
  padFootingThicknessMm: 300,
  columnSizeMm: 225,
} as const;

/**
 * Formats a millimetre dimension into either 'mm' (e.g., '3,600') or 'm' (e.g., '3.60m')
 */
export function formatDim(mm: number, unit: UnitMode, includeUnitSuffix = false): string {
  if (unit === 'm') {
    const metres = mm / 1000;
    const formatted = Number.isInteger(metres * 100)
      ? metres.toFixed(2)
      : metres.toFixed(3).replace(/0+$/, '').replace(/\.$/, '');
    return includeUnitSuffix ? `${formatted} m` : formatted;
  }
  const rounded = Math.round(mm);
  const formatted = rounded.toLocaleString('en-US');
  return includeUnitSuffix ? `${formatted} mm` : formatted;
}

/**
 * Formats an elevation level in metres with explicit +/- sign (e.g., '+4.940', '±0.000', '-1.200')
 */
export function formatLevel(metres: number): string {
  if (Math.abs(metres) < 0.0005) return '±0.000';
  const sign = metres > 0 ? '+' : '';
  return `${sign}${metres.toFixed(2)}`;
}

/**
 * Calculates setting-out diagonals in mm for site engineers & masons squaring the building corners
 */
export function calculateSettingOutDiagonals(): {
  mainBlockDiagonalMm: number;
  overallEnvelopeDiagonalMm: number;
  bedroomInternalDiagonalMm: number;
  verandahDiagonalMm: number;
} {
  const mainBlockDiagonalMm = Math.round(
    Math.hypot(BUILDING_CONSTANTS.overallWidthMm, BUILDING_CONSTANTS.mainBlockDepthMm)
  );
  const overallEnvelopeDiagonalMm = Math.round(
    Math.hypot(BUILDING_CONSTANTS.overallWidthMm, BUILDING_CONSTANTS.overallDepthMm)
  );
  const bedroomInternalDiagonalMm = Math.round(Math.hypot(3600, 3600));
  const verandahDiagonalMm = Math.round(
    Math.hypot(BUILDING_CONSTANTS.verandahWidthMm, BUILDING_CONSTANTS.verandahDepthMm)
  );
  return {
    mainBlockDiagonalMm,
    overallEnvelopeDiagonalMm,
    bedroomInternalDiagonalMm,
    verandahDiagonalMm,
  };
}

/**
 * Complete horizontal and vertical multi-tier dimension chains for site setting-out
 */
export const DIMENSION_CHAINS: Record<string, DimensionSegment[]> = {
  // Top Horizontal Chain 1: Rear Masonry Piers & Window Openings (Total = 12,000 mm)
  northMasonryOpenings: [
    { label: 'NW Pier', lengthMm: 1425, kind: 'pier' },
    { label: 'W2 (Bed 1)', lengthMm: 1200, code: 'W2', kind: 'opening' },
    { label: 'Pier', lengthMm: 2075, kind: 'pier' },
    { label: 'W4 (Bath 1)', lengthMm: 600, code: 'W4', kind: 'opening' },
    { label: 'Center Pier', lengthMm: 1400, kind: 'pier' },
    { label: 'W4 (Bath 2)', lengthMm: 600, code: 'W4', kind: 'opening' },
    { label: 'Pier', lengthMm: 2075, kind: 'pier' },
    { label: 'W2 (Bed 2)', lengthMm: 1200, code: 'W2', kind: 'opening' },
    { label: 'NE Pier', lengthMm: 1425, kind: 'pier' },
  ],

  // Top Horizontal Chain 2: North Internal Clear Widths + Wall Thicknesses (Total = 12,000 mm)
  northInternalAndWalls: [
    { label: 'Ext Wall', lengthMm: 225, kind: 'wall' },
    { label: 'Bedroom 1 Clear', lengthMm: 3600, kind: 'clear' },
    { label: 'Int Wall', lengthMm: 150, kind: 'wall' },
    { label: 'Bath 1 Clear', lengthMm: 1950, kind: 'clear' },
    { label: 'Int Wall', lengthMm: 150, kind: 'wall' },
    { label: 'Bath 2 Clear', lengthMm: 1950, kind: 'clear' },
    { label: 'Int Wall', lengthMm: 150, kind: 'wall' },
    { label: 'Bedroom 2 Clear', lengthMm: 3600, kind: 'clear' },
    { label: 'Ext Wall', lengthMm: 225, kind: 'wall' },
  ],

  // Top Horizontal Chain 3: Structural Grid Centerlines (Grid 1 to Grid 5, Total = 12,000 mm)
  northStructuralGrid: [
    { label: 'Edge to G1', lengthMm: 112.5, kind: 'wall' },
    { label: 'Grid 1–2', lengthMm: 3787.5, code: 'G1-G2', kind: 'grid' },
    { label: 'Grid 2–3', lengthMm: 2100, code: 'G2-G3', kind: 'grid' },
    { label: 'Grid 3–4', lengthMm: 2100, code: 'G3-G4', kind: 'grid' },
    { label: 'Grid 4–5', lengthMm: 3787.5, code: 'G4-G5', kind: 'grid' },
    { label: 'G5 to Edge', lengthMm: 112.5, kind: 'wall' },
  ],

  // Bottom Horizontal Chain 1: Front Masonry Piers & Openings (Total = 12,000 mm)
  southMasonryOpenings: [
    { label: 'SW Pier', lengthMm: 1500, kind: 'pier' },
    { label: 'W1 (Living)', lengthMm: 1800, code: 'W1', kind: 'opening' },
    { label: 'Pier', lengthMm: 1125, kind: 'pier' },
    { label: 'D1 (Main Door)', lengthMm: 1200, code: 'D1', kind: 'opening' },
    { label: 'South Masonry Wall', lengthMm: 6375, kind: 'pier' },
  ],

  // Bottom Horizontal Chain 2: South Zone Internal Clear + Wall Thicknesses (Total = 12,000 mm)
  southInternalAndWalls: [
    { label: 'Ext Wall', lengthMm: 225, kind: 'wall' },
    { label: 'Living Room Clear', lengthMm: 5400, kind: 'clear' },
    { label: 'Dining Clear', lengthMm: 3000, kind: 'clear' },
    { label: 'Int Wall', lengthMm: 150, kind: 'wall' },
    { label: 'Kitchen Clear', lengthMm: 3000, kind: 'clear' },
    { label: 'Ext Wall', lengthMm: 225, kind: 'wall' },
  ],

  // Left Vertical Chain 1: West Masonry Piers & Window Opening (Total = 11,000 mm)
  westMasonryOpenings: [
    { label: 'NW Pier', lengthMm: 1425, kind: 'pier' },
    { label: 'W2 (Bed 1 W)', lengthMm: 1200, code: 'W2', kind: 'opening' },
    { label: 'West Masonry Pier', lengthMm: 6525, kind: 'pier' },
    { label: 'Verandah Span', lengthMm: 1850, kind: 'overhang' },
  ],

  // Left Vertical Chain 2: West Internal Clear + Walls + Verandah (Total = 11,000 mm)
  westInternalAndWalls: [
    { label: 'Rear Wall', lengthMm: 225, kind: 'wall' },
    { label: 'Bedroom 1 Depth', lengthMm: 3600, kind: 'clear' },
    { label: 'Passage N Wall', lengthMm: 150, kind: 'wall' },
    { label: 'Passage Width', lengthMm: 1200, kind: 'clear' },
    { label: 'Passage S Wall', lengthMm: 150, kind: 'wall' },
    { label: 'Living Depth', lengthMm: 3600, kind: 'clear' },
    { label: 'Front Wall', lengthMm: 225, kind: 'wall' },
    { label: 'Verandah Depth', lengthMm: 1850, kind: 'overhang' },
  ],

  // Right Vertical Chain 1: East Masonry Piers & Window Openings (Main block = 9,150 mm)
  eastMasonryOpenings: [
    { label: 'NE Pier', lengthMm: 1425, kind: 'pier' },
    { label: 'W2 (Bed 2 E)', lengthMm: 1200, code: 'W2', kind: 'opening' },
    { label: 'Pier (Bed 2 / Passage)', lengthMm: 3150, kind: 'pier' },
    { label: 'W5 (Pantry)', lengthMm: 600, code: 'W5', kind: 'opening' },
    { label: 'Pier', lengthMm: 950, kind: 'pier' },
    { label: 'W3 (Kitchen)', lengthMm: 1200, code: 'W3', kind: 'opening' },
    { label: 'SE Pier', lengthMm: 625, kind: 'pier' },
  ],

  // Right Vertical Chain 2: East Internal Clear + Wall Thicknesses (Main block = 9,150 mm)
  eastInternalAndWalls: [
    { label: 'Rear Wall', lengthMm: 225, kind: 'wall' },
    { label: 'Bedroom 2 Depth', lengthMm: 3600, kind: 'clear' },
    { label: 'Passage N Wall', lengthMm: 150, kind: 'wall' },
    { label: 'Passage Width', lengthMm: 1200, kind: 'clear' },
    { label: 'Passage S Wall', lengthMm: 150, kind: 'wall' },
    { label: 'Pantry Depth', lengthMm: 1500, kind: 'clear' },
    { label: 'Pantry S Wall', lengthMm: 150, kind: 'wall' },
    { label: 'Kitchen S Depth', lengthMm: 1950, kind: 'clear' },
    { label: 'Front Wall', lengthMm: 225, kind: 'wall' },
  ],
};

export function sumDimensionChain(segments: DimensionSegment[]): number {
  return segments.reduce((acc, item) => acc + item.lengthMm, 0);
}

export const ROOM_SCHEDULES: RoomSpec[] = [
  {
    id: 'bed-1',
    name: 'Bedroom 1 (Master West)',
    code: 'RM-01',
    widthMm: 3600,
    depthMm: 3600,
    areaSqm: 12.96,
    floorFinish: '600×600mm vitrified porcelain floor tiles on 40mm cement-sand screed',
    wallFinish: '15mm smooth sand-cement render with 3 coats acrylic emulsion paint',
    ceilingFinish: 'Suspended gypsum / POP ceiling board at +3.00m FFL',
    ceilingHeightMm: 3000,
    xMm: 225,
    yMm: 225,
    doors: ['D2 (900×2100)'],
    windows: ['W2 (1200×1500 Rear)', 'W2 (1200×1500 West)'],
    electricalNotes: '2× Ceiling lights (Circuit L2), 4× Double 13A sockets (Circuit S2), 1× 20A AC split unit point (Circuit AC1)',
    plumbingNotes: 'Adjacent to Bath 1 across service wall (East partition)',
    masonryCourseNote: '16 courses of 225mm ext / 150mm int hollow sandcrete blocks to +3.00m ceiling; 12° split-level roof rises from +3.20m rear eave to +4.54m spine ridge',
  },
  {
    id: 'bed-2',
    name: 'Bedroom 2 (East)',
    code: 'RM-02',
    widthMm: 3600,
    depthMm: 3600,
    areaSqm: 12.96,
    floorFinish: '600×600mm vitrified porcelain floor tiles on 40mm cement-sand screed',
    wallFinish: '15mm smooth sand-cement render with 3 coats acrylic emulsion paint',
    ceilingFinish: 'Suspended gypsum / POP ceiling board at +3.00m FFL',
    ceilingHeightMm: 3000,
    xMm: 8175,
    yMm: 225,
    doors: ['D2 (900×2100)'],
    windows: ['W2 (1200×1500 Rear)', 'W2 (1200×1500 East)'],
    electricalNotes: '2× Ceiling lights (Circuit L2), 4× Double 13A sockets (Circuit S3), 1× 20A AC split unit point (Circuit AC2)',
    plumbingNotes: 'Adjacent to Bath 2 across West partition wall',
    masonryCourseNote: '16 courses of 225mm ext / 150mm int hollow sandcrete blocks to +3.00m ceiling; 12° split-level roof rises from +3.20m rear eave to +4.54m spine ridge',
  },
  {
    id: 'bath-1',
    name: 'Bathroom 1 (West Shared)',
    code: 'RM-03',
    widthMm: 1950,
    depthMm: 2400,
    areaSqm: 4.68,
    floorFinish: '300×300mm non-slip matte ceramic floor tiles laid to 1:60 fall to 75mm floor drain',
    wallFinish: 'Full-height glazed ceramic wall tiles to +2.10m lintel level; anti-fungal emulsion above',
    ceilingFinish: 'Moisture-resistant gypsum ceiling at +3.00m FFL',
    ceilingHeightMm: 3000,
    xMm: 3975,
    yMm: 225,
    doors: ['D4 (750×2100)'],
    windows: ['W4 (600×600 High-level Louvre, sill +1.50m)'],
    electricalNotes: '1× IP44 enclosed ceiling light + 1× Extractor fan on Circuit L2',
    plumbingNotes: 'WC (100mm soil to IC1), Wash Basin WB (50mm waste), Shower SH (75mm floor trap); 20mm cold water branches',
    masonryCourseNote: '150mm sandcrete block internal partitions; 225mm rear external wall with high-level louvre W4',
  },
  {
    id: 'bath-2',
    name: 'Bathroom 2 (East Shared)',
    code: 'RM-04',
    widthMm: 1950,
    depthMm: 2400,
    areaSqm: 4.68,
    floorFinish: '300×300mm non-slip matte ceramic floor tiles laid to 1:60 fall to 75mm floor drain',
    wallFinish: 'Full-height glazed ceramic wall tiles to +2.10m lintel level; anti-fungal emulsion above',
    ceilingFinish: 'Moisture-resistant gypsum ceiling at +3.00m FFL',
    ceilingHeightMm: 3000,
    xMm: 6075,
    yMm: 225,
    doors: ['D4 (750×2100)'],
    windows: ['W4 (600×600 High-level Louvre, sill +1.50m)'],
    electricalNotes: '1× IP44 enclosed ceiling light + 1× Extractor fan on Circuit L2',
    plumbingNotes: 'WC (100mm soil to IC1), Wash Basin WB (50mm waste), Shower SH (75mm floor trap); 20mm cold water branches',
    masonryCourseNote: '150mm sandcrete block internal partitions; 225mm rear external wall with high-level louvre W4',
  },
  {
    id: 'utility-store',
    name: 'Utility / Store Bay',
    code: 'RM-05',
    widthMm: 4050,
    depthMm: 1050,
    areaSqm: 4.25,
    floorFinish: '600×600mm vitrified porcelain tiles continuous with Passage',
    wallFinish: '15mm smooth sand-cement render with washable acrylic emulsion',
    ceilingFinish: 'Suspended gypsum ceiling at +3.00m FFL (25mm cold water kitchen branch in ceiling void above)',
    ceilingHeightMm: 3000,
    xMm: 3975,
    yMm: 2775,
    doors: ['Open recessed bay off central passage'],
    windows: [],
    electricalNotes: 'Served by central passage ceiling light on Circuit L2',
    plumbingNotes: '25mm uPVC cold water riser drops into ceiling void here to feed Kitchen sink',
    masonryCourseNote: 'Recessed alcove (4050×1050mm clear) fronting Bath 1 and Bath 2 entrance doors D4',
  },
  {
    id: 'passage',
    name: 'Central Spine Passage',
    code: 'RM-06',
    widthMm: 11550,
    depthMm: 1200,
    areaSqm: 13.86,
    floorFinish: '600×600mm vitrified porcelain floor tiles on 40mm screed',
    wallFinish: '15mm smooth sand-cement render with emulsion paint',
    ceilingFinish: 'Suspended ceiling at +3.00m FFL with 600×600mm hinged ceiling access hatch',
    ceilingHeightMm: 3000,
    xMm: 225,
    yMm: 3975,
    doors: ['D2×2 (Bedrooms)', 'D3 (Kitchen)', 'Open spine portal to Living/Dining'],
    windows: [],
    electricalNotes: '3× Ceiling light points (Circuit L2, 2-way switching at spine entry and bedroom doors)',
    plumbingNotes: '25mm uPVC cold water branch runs in ceiling void above passage to Kitchen',
    masonryCourseNote: '1200mm clear corridor width between two 150mm load-bearing spine walls',
  },
  {
    id: 'living',
    name: 'Living Room',
    code: 'RM-07',
    widthMm: 5400,
    depthMm: 3600,
    areaSqm: 19.44,
    floorFinish: '600×600mm polished porcelain tiles with 100mm matching tile skirting',
    wallFinish: '15mm smooth sand-cement render with luxury silk emulsion paint',
    ceilingFinish: 'Suspended POP ceiling at +3.00m FFL',
    ceilingHeightMm: 3000,
    xMm: 225,
    yMm: 5325,
    doors: ['D1 (1200×2100 Main Entrance, swings out to Verandah)'],
    windows: ['W1 (1800×1500 Front Sliding Window)'],
    electricalNotes: '4× Ceiling lights (Circuit L1), Double 13A sockets + TV coaxial/data point (Circuit S1), AC3 split unit (4mm²), Main DB by entrance',
    plumbingNotes: 'Dry zone; DPC at ±0.000m FFL',
    masonryCourseNote: 'Open plan connection to Dining (east); 225mm front and west external walls',
  },
  {
    id: 'dining',
    name: 'Dining Area',
    code: 'RM-08',
    widthMm: 3000,
    depthMm: 3600,
    areaSqm: 10.80,
    floorFinish: '600×600mm polished porcelain tiles continuous with Living Room',
    wallFinish: '15mm smooth sand-cement render with silk emulsion paint',
    ceilingFinish: 'Suspended POP ceiling at +3.00m FFL with central pendant drop',
    ceilingHeightMm: 3000,
    xMm: 5625,
    yMm: 5325,
    doors: ['D3 (900×2100 to Kitchen)', 'Open to Living Room & Passage'],
    windows: [],
    electricalNotes: '1× Central dining pendant light (Circuit L1), shared 6× double 13A sockets with Living (Circuit S1)',
    plumbingNotes: 'Dry zone',
    masonryCourseNote: '3000×3600mm clear bay between Living Room and 150mm Kitchen partition wall',
  },
  {
    id: 'kitchen',
    name: 'Kitchen (incl. Pantry Enclosure)',
    code: 'RM-09',
    widthMm: 3000,
    depthMm: 3600,
    areaSqm: 10.80,
    floorFinish: '600×600mm heavy-duty matte non-slip porcelain tiles',
    wallFinish: '600mm ceramic tile splashback above worktop (+0.90m to +1.50m); washable emulsion elsewhere',
    ceilingFinish: 'Moisture-resistant gypsum board at +3.00m FFL',
    ceilingHeightMm: 3000,
    xMm: 8775,
    yMm: 5325,
    doors: ['D3 (900×2100 from Dining)', 'D5 (750×2100 to Pantry)'],
    windows: ['W3 (1200×1200 East Wall Casement, sill +0.90m)'],
    electricalNotes: '2× Ceiling lights (Circuit L2), 5× Worktop 13A sockets (Circuit K1), Dedicated Refrigerator (R) & Microwave (MW) points (Circuit D1)',
    plumbingNotes: 'Single-bowl stainless sink with drainboard; 20mm cold feed from ceiling void; 50mm waste pipe through East wall to IC3 & Soakaway',
    masonryCourseNote: 'L-shaped 600mm deep concrete/granite worktop at +0.90m height along South and East walls',
  },
  {
    id: 'pantry',
    name: 'Walk-in Pantry Store',
    code: 'RM-10',
    widthMm: 1800,
    depthMm: 1500,
    areaSqm: 2.70,
    floorFinish: '600×600mm matte porcelain tiles continuous with Kitchen',
    wallFinish: 'Smooth render + emulsion; 4 tiers of 400mm deep timber/steel storage shelving',
    ceilingFinish: 'Gypsum board at +3.00m FFL',
    ceilingHeightMm: 3000,
    xMm: 9975,
    yMm: 5325,
    doors: ['D5 (750×2100, swings into Pantry)'],
    windows: ['W5 (600×600 High-level East Louvre, sill +1.50m)'],
    electricalNotes: 'Served by Kitchen lighting circuit L2',
    plumbingNotes: 'Dry food storage zone',
    masonryCourseNote: '1800×1500mm clear corner enclosure inside NE corner of Kitchen bay with 150mm block walls',
  },
  {
    id: 'verandah',
    name: 'Covered Front Verandah',
    code: 'RM-11',
    widthMm: 6000,
    depthMm: 1850,
    areaSqm: 11.10,
    floorFinish: '400×400mm textured non-slip external stoneware tiles with 15mm step drop at threshold',
    wallFinish: 'Smooth render with weather-shield paint; natural stone cladding on 225×225mm RC columns C1, C2, C3',
    ceilingFinish: 'Painted exterior fibre-cement soffit board with insect-proof vent mesh at +3.00m',
    ceilingHeightMm: 3000,
    xMm: 0,
    yMm: 9150,
    doors: ['D1 (1200×2100 Main Entrance)'],
    windows: ['W1 (1800×1500 overlooks Verandah)'],
    electricalNotes: 'Bulkhead / soffit verandah lights & weatherproof 13A socket (WP) on Circuit L1',
    plumbingNotes: 'Concealed front gutter overhead with rainwater downpipes DP1 (West) and DP2 (East)',
    masonryCourseNote: 'Supported by 3× 225×225mm RC columns (C1 at x=112.5, C2 at x=3000, C3 at x=5887.5) on 900×900×300mm pads',
  },
];

export const OPENING_SCHEDULES: OpeningSpec[] = [
  {
    tag: 'D1',
    category: 'door',
    type: 'Insulated Security Steel Entrance Door (1.5 Leaf)',
    location: 'Main entrance (Living Room to Verandah)',
    widthMm: 1200,
    heightMm: 2100,
    sillHeightMm: 0,
    headHeightMm: 2100,
    lintelLengthMm: 1650,
    lintelSection: '225×225mm RC Lintel (4Y12 + R8@200c/c)',
    qty: 1,
    swingOrOperation: 'Swings Out (South)',
  },
  {
    tag: 'D2',
    category: 'door',
    type: 'Solid Core Flush Timber Door in 150mm Hardwood Frame',
    location: 'Bedroom 1 & Bedroom 2 from Passage',
    widthMm: 900,
    heightMm: 2100,
    sillHeightMm: 0,
    headHeightMm: 2100,
    lintelLengthMm: 1350,
    lintelSection: '150×225mm RC Lintel (4Y12 + R8@200c/c)',
    qty: 2,
    swingOrOperation: 'Swings In (into Bedrooms)',
  },
  {
    tag: 'D3',
    category: 'door',
    type: 'Solid Core Half-Glazed Timber Door in 150mm Frame',
    location: 'Kitchen entrance from Dining / Passage',
    widthMm: 900,
    heightMm: 2100,
    sillHeightMm: 0,
    headHeightMm: 2100,
    lintelLengthMm: 1350,
    lintelSection: '150×225mm RC Lintel (4Y12 + R8@200c/c)',
    qty: 1,
    swingOrOperation: 'Swings In (into Kitchen)',
  },
  {
    tag: 'D4',
    category: 'door',
    type: 'Moisture-Resistant PVC / Treated Flush Door',
    location: 'Bathroom 1 & Bathroom 2 from Utility Bay',
    widthMm: 750,
    heightMm: 2100,
    sillHeightMm: 0,
    headHeightMm: 2100,
    lintelLengthMm: 1200,
    lintelSection: '150×225mm RC Lintel (4Y12 + R8@200c/c)',
    qty: 2,
    swingOrOperation: 'Swings In (into Bathrooms)',
  },
  {
    tag: 'D5',
    category: 'door',
    type: 'Timber Louvred / Ventilated Flush Door',
    location: 'Pantry entrance from Kitchen',
    widthMm: 750,
    heightMm: 2100,
    sillHeightMm: 0,
    headHeightMm: 2100,
    lintelLengthMm: 1200,
    lintelSection: '150×225mm RC Lintel (4Y12 + R8@200c/c)',
    qty: 1,
    swingOrOperation: 'Swings In (into Pantry)',
  },
  {
    tag: 'W1',
    category: 'window',
    type: 'Powder-Coated Aluminium 2-Track Sliding Window + Flyscreen',
    location: 'Living Room front (South) wall',
    widthMm: 1800,
    heightMm: 1500,
    sillHeightMm: 900,
    headHeightMm: 2400,
    lintelLengthMm: 2250,
    lintelSection: '225×225mm RC Lintel / Ring Beam (+2.40m)',
    qty: 1,
    swingOrOperation: '2-Pane Horizontal Sliding',
  },
  {
    tag: 'W2',
    category: 'window',
    type: 'Powder-Coated Aluminium Side-Hung Casement Window + Flyscreen',
    location: 'Bedroom 1 & 2 Side (West/East) and Rear (North) walls',
    widthMm: 1200,
    heightMm: 1500,
    sillHeightMm: 900,
    headHeightMm: 2400,
    lintelLengthMm: 1650,
    lintelSection: '225×225mm RC Lintel / Ring Beam (+2.40m)',
    qty: 4,
    swingOrOperation: '2-Leaf Outward Casement',
  },
  {
    tag: 'W3',
    category: 'window',
    type: 'Powder-Coated Aluminium Casement Window over Worktop',
    location: 'Kitchen East external wall',
    widthMm: 1200,
    heightMm: 1200,
    sillHeightMm: 900,
    headHeightMm: 2100,
    lintelLengthMm: 1650,
    lintelSection: '225×225mm RC Lintel (+2.10m)',
    qty: 1,
    swingOrOperation: '2-Leaf Outward Casement',
  },
  {
    tag: 'W4',
    category: 'window',
    type: 'Anodised Aluminium Adjustable Blade Louvre + Obscure Glass',
    location: 'Bathroom 1 & Bathroom 2 Rear (North) external wall',
    widthMm: 600,
    heightMm: 600,
    sillHeightMm: 1500,
    headHeightMm: 2100,
    lintelLengthMm: 1050,
    lintelSection: '225×225mm RC Lintel (+2.10m)',
    qty: 2,
    swingOrOperation: 'High-Level Privacy Louvre (Sill +1.50m)',
  },
  {
    tag: 'W5',
    category: 'window',
    type: 'Anodised Aluminium Adjustable Blade Louvre + Insect Mesh',
    location: 'Pantry East external wall',
    widthMm: 600,
    heightMm: 600,
    sillHeightMm: 1500,
    headHeightMm: 2100,
    lintelLengthMm: 1050,
    lintelSection: '225×225mm RC Lintel (+2.10m)',
    qty: 1,
    swingOrOperation: 'High-Level Ventilation Louvre (Sill +1.50m)',
  },
];

/**
 * Calculates site Bill of Quantities (BOQ) based on the active site resolution configuration
 */
export function calculateSiteBOQ(config: SiteResolutionConfig): BOQItem[] {
  // Total strip footing centerline length:
  // Perimeter walls: 2 * (12.0 + 9.15) = 42.30 m
  // Internal walls:
  // - 2 horizontal spine walls (11.55m each) = 23.10 m
  // - 3 north vertical walls (3.60m, 2.40m, 3.60m) = 9.60 m
  // - Bath south wall (4.05m) = 4.05 m
  // - Kitchen west wall (3.60m) = 3.60 m
  // - Pantry walls (1.50m + 1.80m) = 3.30 m
  // Total wall trench length = 85.95 m
  const totalTrenchLengthM = 85.95;
  const trenchWidthM = 0.75;
  const trenchDepthM = 1.05; // from -0.15 GL to -1.20 Base
  const padCount = config.eastOverhangMode === 'add-column-c4' ? 4 : 3;

  const stripExcavationM3 = Number((totalTrenchLengthM * trenchWidthM * trenchDepthM).toFixed(1));
  const padExcavationM3 = Number((padCount * 0.9 * 0.9 * 1.05).toFixed(1));
  const totalExcavationM3 = Number((stripExcavationM3 + padExcavationM3).toFixed(1));

  const stripConcreteM3 = Number((totalTrenchLengthM * 0.75 * 0.225).toFixed(1));
  const padConcreteM3 = Number((padCount * 0.9 * 0.9 * 0.3).toFixed(1));
  const footingConcreteM3 = Number((stripConcreteM3 + padConcreteM3).toFixed(1));

  // Floor slab: main block (12.0 * 9.15 = 109.8 m²) + verandah (6.0 * 1.85 = 11.1 m²) = 120.9 m²
  const totalFootprintSqm = 120.9;
  const slabConcreteM3 = Number((totalFootprintSqm * 0.15).toFixed(1));

  // Ring beam & columns concrete
  const ringBeamConcreteM3 = config.includeRingBeam
    ? Number((totalTrenchLengthM * 0.225 * 0.225).toFixed(1))
    : 1.4; // lintels only

  // Sandcrete blocks (standard Nigerian block size: 450mm length × 225mm height -> 10 blocks per m²)
  // External 225mm walls: 42.30m perimeter * avg height 3.85m - openings (14.58 m²) + substructure foundation wall (42.30m * 1.05m)
  const extBlockCount = Math.round((42.3 * 3.85 - 14.58 + 42.3 * 1.05) * 10);
  // Internal 150mm walls: 43.65m length * 3.00m height - internal doors (10.71 m²) + substructure (43.65m * 1.05m)
  const intBlockCount = Math.round((43.65 * 3.0 - 10.71 + 43.65 * 1.05) * 10);

  // Roof area:
  // Full rectangle: 13.80m width * 12.35m slope run = 170.43 m²
  // Roof area at 12° split-level slope (1 / cos(12°) = 1.02234 slope factor plus 150mm ridge overlap):
  const roofSheetAreaSqm =
    config.eastOverhangMode === 'cut-back-eave' ? 162.8 : 174.2;

  const rebarKg =
    (config.foundationConcreteGrade === 'C25/30-reinforced' ? 1480 : 620) +
    1650 + // RC Slab Y12 mesh
    (config.includeRingBeam ? 890 : 240);

  return [
    {
      id: 'boq-1',
      category: 'Substructure',
      description: 'Trench & Pad Foundation Excavation (to -1.20m datum)',
      unit: 'm³',
      quantity: totalExcavationM3,
      basisNote: `${totalTrenchLengthM}m strip trench (750mm wide) + ${padCount}× column pads (900×900mm)`,
    },
    {
      id: 'boq-2',
      category: 'Substructure',
      description: `Foundation Footing Concrete (${
        config.foundationConcreteGrade === 'C25/30-reinforced'
          ? 'Grade C25/30 Reinforced'
          : '1:3:6 Mass Concrete'
      }) + 50mm Blinding`,
      unit: 'm³',
      quantity: footingConcreteM3,
      basisNote: `750×225mm continuous strip footing + ${padCount}× 900×900×300mm column bases`,
    },
    {
      id: 'boq-3',
      category: 'Substructure',
      description: '150mm Reinforced Concrete Oversite Slab (Grade C25/30) on 150mm Compacted Hardcore/Sand & 1000-Gauge DPM',
      unit: 'm³',
      quantity: slabConcreteM3,
      basisNote: `120.9 m² gross slab area (${config.dpcDatumMode === '0.000-FFL' ? 'DPC at ±0.000 FFL' : 'Raised DPC at +0.150m'})`,
    },
    {
      id: 'boq-4',
      category: 'Substructure',
      description: 'High-Yield Reinforcement Steel Bars (Y12 Main Bars & R8 Stirrups @ 200mm c/c)',
      unit: 'kg',
      quantity: rebarKg,
      basisNote: `Includes ${config.foundationConcreteGrade === 'C25/30-reinforced' ? 'footing mat, ' : ''}150mm RC slab mesh, ${padCount} columns & ${config.includeRingBeam ? 'continuous 225×225 ring beam' : 'opening lintels'}`,
    },
    {
      id: 'boq-5',
      category: 'Superstructure Masonry',
      description: '225mm (9-Inch) Hollow Sandcrete Blocks (Substructure + External Walls to 12° Split-Roof Gable)',
      unit: 'blocks',
      quantity: extBlockCount,
      basisNote: '450×225×225mm vibrated blocks laid in 1:6 cement-sand mortar (net of W1–W5, D1)',
    },
    {
      id: 'boq-6',
      category: 'Superstructure Masonry',
      description: '150mm (6-Inch) Hollow Sandcrete Blocks (Substructure + Internal Partition Walls)',
      unit: 'blocks',
      quantity: intBlockCount,
      basisNote: '450×225×150mm vibrated blocks laid in 1:6 cement-sand mortar (net of D2–D5)',
    },
    {
      id: 'boq-7',
      category: 'Superstructure Masonry',
      description: config.includeRingBeam
        ? '225×225mm Continuous RC Head Course Ring Beam & Verandah Columns'
        : '225×225mm Precast / In-Situ RC Door & Window Lintels + Columns',
      unit: 'm³',
      quantity: ringBeamConcreteM3,
      basisNote: config.includeRingBeam
        ? `Full 85.95m wall tie beam at +2.10m lintel level + ${padCount}× 225×225mm columns`
        : `Individual lintels (450mm total end bearing) + ${padCount}× 225×225mm columns`,
    },
    {
      id: 'boq-8',
      category: 'Roofing & Carpentry',
      description: '0.55mm Gauge Long-Span Standing-Seam Aluminium Roofing Sheets (12° Split-Level Dual Slope)',
      unit: 'm²',
      quantity: roofSheetAreaSqm,
      basisNote:
        config.eastOverhangMode === 'cut-back-eave'
          ? '12° North Wing (+3.20m to +4.54m) & 12° South Wing (+4.12m to +2.80m) with SE cut-back'
          : '12° Split-Level Dual-Slope Roof (13.80m width) with Clerestory Step & SE Column C4',
    },
    {
      id: 'boq-9',
      category: 'Roofing & Carpentry',
      description: 'Treated Hardwood / Steel Split-Level Roof Trusses (150×50mm Rafters @ 1200c/c, 75×50mm Purlins, Clerestory Flashing)',
      unit: 'm²',
      quantity: roofSheetAreaSqm,
      basisNote: 'Includes Rear & Front eave gutters, Ø100mm uPVC downpipes (DP1–DP4) & clerestory step flashing',
    },
  ];
}

/**
 * Generates a formatted, site-ready WhatsApp summary text with dimensions, squaring diagonals, BOQ, and live link
 */
export function generateWhatsAppSummaryText(
  config: SiteResolutionConfig,
  unit: UnitMode,
  shareUrl: string
): string {
  const diags = calculateSettingOutDiagonals();
  const boq = calculateSiteBOQ(config);
  const extBlocks = boq.find((b) => b.id === 'boq-5')?.quantity ?? 0;
  const intBlocks = boq.find((b) => b.id === 'boq-6')?.quantity ?? 0;
  const footingConcrete = boq.find((b) => b.id === 'boq-2')?.quantity ?? 0;
  const slabConcrete = boq.find((b) => b.id === 'boq-3')?.quantity ?? 0;
  const rebarKg = boq.find((b) => b.id === 'boq-4')?.quantity ?? 0;

  return [
    `*2-BEDROOM BOYS' QUARTERS — SITE WORKING DRAWINGS (NIGERIA)*`,
    `--------------------------------------------`,
    `*1. KEY SETTING-OUT DIMENSIONS:*`,
    `• Overall Footprint: ${formatDim(12000, unit)} × ${formatDim(11000, unit, true)}`,
    `• Main Block: ${formatDim(12000, unit)} × ${formatDim(9150, unit, true)} (Verandah: ${formatDim(6000, unit)} × ${formatDim(1850, unit, true)})`,
    `• Main Block Squaring Diagonal: ${formatDim(diags.mainBlockDiagonalMm, unit, true)}`,
    `• Full Envelope Diagonal: ${formatDim(diags.overallEnvelopeDiagonalMm, unit, true)}`,
    `• Walls: 225mm (9") External / 150mm (6") Internal Sandcrete`,
    ``,
    `*2. ROOM CLEAR SIZES:*`,
    `• Bedroom 1 & 2: ${formatDim(3600, unit)} × ${formatDim(3600, unit, true)} each`,
    `• Living Room: ${formatDim(5400, unit)} × ${formatDim(3600, unit, true)} | Dining: ${formatDim(3000, unit)} × ${formatDim(3600, unit, true)}`,
    `• Kitchen: ${formatDim(3000, unit)} × ${formatDim(3600, unit, true)} (Pantry: ${formatDim(1800, unit)} × ${formatDim(1500, unit, true)})`,
    `• Bath 1 & 2: ${formatDim(1950, unit)} × ${formatDim(2400, unit, true)} each | Passage: ${formatDim(1200, unit)} wide`,
    ``,
    `*3. KEY SITE MATERIAL ESTIMATES (BOQ):*`,
    `• 9-Inch (225mm) Blocks: ${extBlocks.toLocaleString('en-US')} blocks`,
    `• 6-Inch (150mm) Blocks: ${intBlocks.toLocaleString('en-US')} blocks`,
    `• Foundation Concrete: ${footingConcrete} m³ | 150mm Oversite Slab: ${slabConcrete} m³`,
    `• High-Yield Rebar (Y12/R8): ${rebarKg.toLocaleString('en-US')} kg`,
    ``,
    `*4. INTERACTIVE SITE DRAWINGS (A-000 to E-001):*`,
    `${shareUrl}`,
  ].join('\n');
}

