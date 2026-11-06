import { SiteResolutionConfig, ROOM_SCHEDULES, OPENING_SCHEDULES } from './architecturalMath';

export type NigerianRegionBenchmark = 'lagos-sw' | 'abuja-nc' | 'ph-ss';

export type ConstructionStageCode =
  | 'STAGE-A'
  | 'STAGE-B'
  | 'STAGE-C'
  | 'STAGE-D'
  | 'STAGE-E'
  | 'STAGE-F'
  | 'STAGE-G'
  | 'STAGE-H'
  | 'STAGE-I'
  | 'STAGE-J'
  | 'STAGE-K'
  | 'STAGE-L'
  | 'STAGE-M'
  | 'STAGE-N';

export interface StageDefinition {
  code: ConstructionStageCode;
  letter: string;
  title: string;
  shortTitle: string;
  description: string;
  procurementPhase: number;
}

export const CONSTRUCTION_STAGES: StageDefinition[] = [
  {
    code: 'STAGE-A',
    letter: 'A',
    title: 'Stage A: Site Preparation, Earthworks & Setting-Out',
    shortTitle: 'A · Site Prep',
    description: 'Site clearing, topsoil stripping, profile setting-out, trench/pad excavation, laterite filling & anti-termite treatment.',
    procurementPhase: 1,
  },
  {
    code: 'STAGE-B',
    letter: 'B',
    title: 'Stage B: Foundation & Substructure (Up to DPC)',
    shortTitle: 'B · Foundation',
    description: '50mm blinding, 750×225mm strip footings, 900×900×300mm column pads, 4-course 225mm substructure blockwork & cavity fill.',
    procurementPhase: 2,
  },
  {
    code: 'STAGE-C',
    letter: 'C',
    title: 'Stage C: Ground Floor Oversite Slab Construction',
    shortTitle: 'C · Ground Slab',
    description: '150mm compacted granite hardcore, 50mm sand blinding, 1000-gauge polythene DPM, BRC mesh & 150mm Grade C20/25 RC slab.',
    procurementPhase: 2,
  },
  {
    code: 'STAGE-D',
    letter: 'D',
    title: 'Stage D: Superstructure Sandcrete Blockwork (Walls)',
    shortTitle: 'D · Blockwork',
    description: '225mm (9-inch) external walls to +3.00m & 12° split-level gables, 150mm (6-inch) internal partitions & 1:6 cement-sand mortar.',
    procurementPhase: 3,
  },
  {
    code: 'STAGE-E',
    letter: 'E',
    title: 'Stage E: Structural Concrete Works (Columns, Lintels & Ring Beam)',
    shortTitle: 'E · Structural RC',
    description: '225×225mm RC columns (C1–C4 & corners), door/window lintels, continuous +2.10m head-course ring beam, rebar & formwork.',
    procurementPhase: 3,
  },
  {
    code: 'STAGE-F',
    letter: 'F',
    title: 'Stage F: 12° Split-Level Clerestory Roofing & Rainwater Goods',
    shortTitle: 'F · Roofing (12°)',
    description: 'Treated hardwood rafters/purlins, 0.55mm taupe-grey standing-seam aluminium sheets, clerestory flashing, fascia gutters & DP1–DP4.',
    procurementPhase: 4,
  },
  {
    code: 'STAGE-G',
    letter: 'G',
    title: 'Stage G: Plastering, Wall Screeding, Wall Tiling & Painting',
    shortTitle: 'G · Plaster & Paint',
    description: '15mm internal/external 1:4 rendering, POP wall screeding, bathroom/kitchen ceramic wall tiles, primer, silk & weather-shield paints.',
    procurementPhase: 6,
  },
  {
    code: 'STAGE-H',
    letter: 'H',
    title: 'Stage H: Floor Screeding & Room-by-Room Floor Tiling',
    shortTitle: 'H · Flooring',
    description: '40mm 1:4 cement-sand floor screed bed, 600×600mm vitrified porcelain tiles, 300×300mm bath non-slip tiles, verandah stoneware & adhesive.',
    procurementPhase: 6,
  },
  {
    code: 'STAGE-I',
    letter: 'I',
    title: 'Stage I: Suspended POP / Gypsum Ceiling & Exterior Soffit',
    shortTitle: 'I · Ceiling (+3.0m)',
    description: 'Suspended gypsum/POP ceiling boards at +3.00m, galvanized channels, POP compound, cornices, 600×600 hatch & exterior fibre-cement soffit.',
    procurementPhase: 6,
  },
  {
    code: 'STAGE-J',
    letter: 'J',
    title: 'Stage J: Doors, Aluminium Windows & Ironmongery',
    shortTitle: 'J · Doors & Windows',
    description: 'D1 security entrance door, D2–D5 internal flush/PVC doors, W1–W5 powder-coated aluminium windows with flyscreens & burglar bars.',
    procurementPhase: 6,
  },
  {
    code: 'STAGE-K',
    letter: 'K',
    title: 'Stage K: Electrical Installation (First & Second Fix)',
    shortTitle: 'K · Electrical',
    description: '1.5mm², 2.5mm², 4.0mm² & 16mm² pure copper cables, uPVC conduits, 8-way MCB/RCD DB, switches, 13A sockets, LED fixtures & earth rod.',
    procurementPhase: 5,
  },
  {
    code: 'STAGE-L',
    letter: 'L',
    title: 'Stage L: Plumbing, Water Supply & Sanitary Fittings',
    shortTitle: 'L · Plumbing',
    description: 'PPR/uPVC supply & drainage pipes, 1,000L overhead tank on 3.0m steel tower, 0.75HP booster pump, WCs, basins, showers & kitchen sink.',
    procurementPhase: 5,
  },
  {
    code: 'STAGE-M',
    letter: 'M',
    title: 'Stage M: External Works, Septic Tank, Soakaway & Paving',
    shortTitle: 'M · External Works',
    description: '6,000L 2-chamber septic tank, Ø1.5m×3.0m soakaway pit, 3× inspection chambers (IC1–IC3), perimeter concrete apron & walkways.',
    procurementPhase: 7,
  },
  {
    code: 'STAGE-N',
    letter: 'N',
    title: 'Stage N: Final Joinery, Fittings, Sealants & Handover',
    shortTitle: 'N · Final Handover',
    description: 'Kitchen base/wall cabinets with granite worktop, bedroom wardrobes, bathroom accessories, silicone sealants & post-construction cleaning.',
    procurementPhase: 7,
  },
];

export interface MaterialTakeOffItem {
  sn: number;
  code: string;
  stage: ConstructionStageCode;
  stageTitle: string;
  material: string;
  specification: string;
  unit: string;
  /** Secondary practical unit note (e.g., truckloads, cartons, rolls, 12m lengths) */
  practicalUnitNote: string;
  dimensionsUsed: string;
  calculationMethod: string;
  formula: string;
  netQuantity: number;
  wastagePercent: number;
  wastageQuantity: number;
  finalQuantity: number;
  unitPriceNaira: number;
  totalMaterialCostNaira: number;
  procurementPhase: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  verificationNote?: string;
}

export interface RebarScheduleRow {
  memberId: string;
  structuralElement: string;
  barMark: string;
  diameterMm: 8 | 10 | 12 | 16;
  barType: string;
  shapeDescription: string;
  numMembers: number;
  barsPerMember: number;
  totalBars: number;
  cutLengthM: number;
  totalLengthM: number;
  unitWeightKgPerM: number;
  netWeightKg: number;
  wastagePercent: number;
  finalWeightKg: number;
  standard12mLengths: number;
}

export interface RoomFlooringTakeOffRow {
  roomCode: string;
  roomName: string;
  clearDimensionsM: string;
  netFloorAreaSqm: number;
  tileSpec: string;
  wastagePercent: number;
  grossTileAreaSqm: number;
  sqmPerCarton: number;
  cartonsToPurchase: number;
  screedVolumeM3: number;
  cementBagsForScreed: number;
  adhesiveBags20kg: number;
  skirtingLinearM: number;
}

export interface ProcurementStageBundle {
  phaseNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
  phaseTitle: string;
  timelineWeeks: string;
  whenToPurchase: string;
  storageAndHandlingRule: string;
  items: MaterialTakeOffItem[];
  subtotalMaterialNaira: number;
  shareOfMaterialBudgetPercent: number;
}

export interface MasterProjectSummary {
  totalCementBags50kg: number;
  cementBreakdown: {
    blindingAndFoundationBags: number;
    oversiteSlabBags: number;
    blockworkAndMortarBags: number;
    structuralColumnsAndBeamsBags: number;
    plasteringBags: number;
    floorScreedBags: number;
    externalAndSepticBags: number;
  };
  totalBlocks9Inch: number;
  totalBlocks6Inch: number;
  totalBlocksCombined: number;
  totalSharpSandM3: number;
  totalSharpSandTrucks20T: number;
  totalPlasterSandM3: number;
  totalPlasterSandTrucks20T: number;
  totalGraniteM3: number;
  totalGraniteTrucks30T: number;
  totalLateriteM3: number;
  totalLateriteTrucks20T: number;
  rebarY12Kg: number;
  rebarY12Lengths12m: number;
  rebarY10Kg: number;
  rebarY10Lengths12m: number;
  rebarR8Kg: number;
  rebarR8Lengths12m: number;
  totalRebarKg: number;
  totalBindingWireKg: number;
  totalRoofingSheetsSqm: number;
  totalRoofingPanelsCount: number;
  totalFloorTilesSqm: number;
  totalFloorTilesCartons: number;
  totalWallTilesSqm: number;
  totalWallTilesCartons: number;
  totalPaintLitres: number;
  totalPaintBuckets20L: number;
  totalDoorsCount: number;
  totalWindowsCount: number;
  // Financial Totals (Naira ₦)
  totalMaterialCostNaira: number;
  estimatedLabourCostNaira: number;
  equipmentAndPlantCostNaira: number;
  transportationCostNaira: number;
  contractorOverheadsNaira: number;
  contingencyAllowanceNaira: number;
  grandTotalProjectCostNaira: number;
}

export interface CompleteQSReport {
  region: NigerianRegionBenchmark;
  regionLabel: string;
  priceBenchmarkNote: string;
  items: MaterialTakeOffItem[];
  rebarSchedule: RebarScheduleRow[];
  roomFlooringSchedule: RoomFlooringTakeOffRow[];
  procurementSchedule: ProcurementStageBundle[];
  summary: MasterProjectSummary;
}

const REGION_MULTIPLIERS: Record<
  NigerianRegionBenchmark,
  { label: string; factor: number; note: string }
> = {
  'lagos-sw': {
    label: 'Lagos / Southwest Nigeria (Lekki–Ikorodu–Ibadan Corridor)',
    factor: 1.0,
    note: 'Indicative Q4 Nigerian retail building material market rates (Dangote/Lafarge 50kg cement, Ogun granite, Badagry/Ikorodu sharp sand). Verify supplier quotes prior to purchase.',
  },
  'abuja-nc': {
    label: 'Abuja FCT / North-Central Nigeria',
    factor: 1.06,
    note: 'Indicative Abuja/North-Central retail market rates (+6% regional haulage adjustment on coastal aluminium/imported sanitary items; local Mpape granite).',
  },
  'ph-ss': {
    label: 'Port Harcourt / South-South Nigeria',
    factor: 1.09,
    note: 'Indicative Rivers/South-South retail market rates (+9% aggregate haulage & high-humidity marine-grade treatment allowance).',
  },
};

/**
 * Formats Nigerian Naira currency cleanly (e.g. "₦14,850,000")
 */
export function formatNaira(amount: number): string {
  return `₦${Math.round(amount).toLocaleString('en-US')}`;
}

/**
 * Generates the Structural Bar Bending & Reinforcement Schedule (Stage 2E & Stage 3)
 * Derived directly from S-001 Structural Foundation, Slab, Column & Lintel drawings.
 */
export function calculateRebarSchedule(config: SiteResolutionConfig): RebarScheduleRow[] {
  const padCount = config.eastOverhangMode === 'add-column-c4' ? 4 : 3;
  const totalColumns = 4 + padCount; // 4 main block corners + 3 or 4 verandah/overhang columns
  const rows: RebarScheduleRow[] = [];

  // 1. Strip Footing Bottom Longitudinal & Transverse Bars (Y12 @ 200mm c/c) if C25/30 RC Mat selected
  if (config.foundationConcreteGrade === 'C25/30-reinforced') {
    // 4 longitudinal Y12 bars along 85.95m trench + 10% lap
    const longTotalM = Number((85.95 * 4 * 1.08).toFixed(1));
    const longNetKg = Number((longTotalM * 0.888).toFixed(1));
    const longFinalKg = Number((longNetKg * 1.05).toFixed(1));
    rows.push({
      memberId: 'FDN-01',
      structuralElement: '750×225mm RC Strip Footing Longitudinal Bars (85.95m run)',
      barMark: 'BM-01',
      diameterMm: 12,
      barType: 'High-Yield Deformed (Y12)',
      shapeDescription: 'Straight continuous with 600mm staggered laps & L-bends at corners',
      numMembers: 1,
      barsPerMember: 4,
      totalBars: 32,
      cutLengthM: 11.6,
      totalLengthM: longTotalM,
      unitWeightKgPerM: 0.888,
      netWeightKg: longNetKg,
      wastagePercent: 5,
      finalWeightKg: longFinalKg,
      standard12mLengths: Math.ceil((longTotalM * 1.05) / 12),
    });

    // Transverse distribution bars @ 200mm c/c across 750mm footing width (cut length 0.85m incl hooks)
    const transCount = Math.ceil(85.95 / 0.2) + 8; // 438 bars
    const transTotalM = Number((transCount * 0.85).toFixed(1));
    const transNetKg = Number((transTotalM * 0.888).toFixed(1));
    const transFinalKg = Number((transNetKg * 1.05).toFixed(1));
    rows.push({
      memberId: 'FDN-02',
      structuralElement: '750×225mm RC Strip Footing Transverse Bars @ 200mm c/c',
      barMark: 'BM-02',
      diameterMm: 12,
      barType: 'High-Yield Deformed (Y12)',
      shapeDescription: 'U-bar 650mm base + 2×100mm end bob hooks (0.85m cut)',
      numMembers: 1,
      barsPerMember: transCount,
      totalBars: transCount,
      cutLengthM: 0.85,
      totalLengthM: transTotalM,
      unitWeightKgPerM: 0.888,
      netWeightKg: transNetKg,
      wastagePercent: 5,
      finalWeightKg: transFinalKg,
      standard12mLengths: Math.ceil((transTotalM * 1.05) / 12),
    });
  }

  // 2. Isolated Column Pad Bases (900×900×300mm — 5Y12 Both Ways Bottom Mat)
  const padBarsPerBase = 10; // 5 each way
  const padTotalBars = padCount * padBarsPerBase;
  const padTotalM = Number((padTotalBars * 1.05).toFixed(1));
  const padNetKg = Number((padTotalM * 0.888).toFixed(1));
  rows.push({
    memberId: 'PAD-01',
    structuralElement: `900×900×300mm Column Pad Footing Mat (${padCount} No. Bases)`,
    barMark: 'BM-03',
    diameterMm: 12,
    barType: 'High-Yield Deformed (Y12)',
    shapeDescription: '5Y12 both ways @ 175mm c/c (750mm straight + 2×150mm L-returns)',
    numMembers: padCount,
    barsPerMember: padBarsPerBase,
    totalBars: padTotalBars,
    cutLengthM: 1.05,
    totalLengthM: padTotalM,
    unitWeightKgPerM: 0.888,
    netWeightKg: padNetKg,
    wastagePercent: 5,
    finalWeightKg: Number((padNetKg * 1.05).toFixed(1)),
    standard12mLengths: Math.ceil((padTotalM * 1.05) / 12),
  });

  // 3. RC Columns (225×225mm from -1.20m Footing to +3.10m Ring Beam = 4.55m cut length incl starter foot)
  const colBarsTotal = totalColumns * 4;
  const colTotalM = Number((colBarsTotal * 4.55).toFixed(1));
  const colNetKg = Number((colTotalM * 0.888).toFixed(1));
  rows.push({
    memberId: 'COL-01',
    structuralElement: `225×225mm RC Columns Main Bars (${totalColumns} No. Columns × 4Y12)`,
    barMark: 'BM-04',
    diameterMm: 12,
    barType: 'High-Yield Deformed (Y12)',
    shapeDescription: '350mm starter L-foot in pad/strip + 4.20m vertical shaft to head beam',
    numMembers: totalColumns,
    barsPerMember: 4,
    totalBars: colBarsTotal,
    cutLengthM: 4.55,
    totalLengthM: colTotalM,
    unitWeightKgPerM: 0.888,
    netWeightKg: colNetKg,
    wastagePercent: 6,
    finalWeightKg: Number((colNetKg * 1.06).toFixed(1)),
    standard12mLengths: Math.ceil((colTotalM * 1.06) / 12),
  });

  // 4. Column Stirrups / Links (R8 @ 200mm c/c — 22 links per column, 0.82m cut length)
  const colLinksTotal = totalColumns * 22;
  const colLinksM = Number((colLinksTotal * 0.82).toFixed(1));
  const colLinksNetKg = Number((colLinksM * 0.395).toFixed(1));
  rows.push({
    memberId: 'COL-02',
    structuralElement: `225×225mm RC Column Links (R8 @ 200mm c/c)`,
    barMark: 'BM-05',
    diameterMm: 8,
    barType: 'Mild Steel / Ribbed Stirrup (R8)',
    shapeDescription: '175×175mm rectangular closed link + 2×60mm seismic hooks (0.82m cut)',
    numMembers: totalColumns,
    barsPerMember: 22,
    totalBars: colLinksTotal,
    cutLengthM: 0.82,
    totalLengthM: colLinksM,
    unitWeightKgPerM: 0.395,
    netWeightKg: colLinksNetKg,
    wastagePercent: 6,
    finalWeightKg: Number((colLinksNetKg * 1.06).toFixed(1)),
    standard12mLengths: Math.ceil((colLinksM * 1.06) / 12),
  });

  // 5. 150mm Ground Floor Oversite Slab Shrinkage/Crack Control Mesh (Y10 @ 250mm c/c Both Ways over 120.9 m²)
  // 120.9 m² with @250mm spacing both ways = 8.0m of bar per m² = 967.2m total length
  const slabMeshTotalM = 968.0;
  const slabMeshNetKg = Number((slabMeshTotalM * 0.617).toFixed(1));
  rows.push({
    memberId: 'SLB-01',
    structuralElement: '150mm Oversite RC Slab Reinforcement Mesh (Y10 @ 250mm c/c B/W)',
    barMark: 'BM-06',
    diameterMm: 10,
    barType: 'High-Yield Deformed (Y10)',
    shapeDescription: 'Orthogonal top/mid-depth crack-control grid across 120.9 m² slab',
    numMembers: 1,
    barsPerMember: 88,
    totalBars: 88,
    cutLengthM: 11.0,
    totalLengthM: slabMeshTotalM,
    unitWeightKgPerM: 0.617,
    netWeightKg: slabMeshNetKg,
    wastagePercent: 6,
    finalWeightKg: Number((slabMeshNetKg * 1.06).toFixed(1)),
    standard12mLengths: Math.ceil((slabMeshTotalM * 1.06) / 12),
  });

  // 6. Head-Course Ring Beam (85.95m) OR Individual Door/Window Lintels (24.75m total length)
  const beamRunM = config.includeRingBeam ? 85.95 : 24.75;
  const beamLabel = config.includeRingBeam
    ? '225×225mm Continuous Head-Course Ring Beam & Verandah Fascia Beam (85.95m)'
    : '225×225mm / 150×225mm Door & Window Lintels (17 Openings, 24.75m run)';

  const beamMainM = Number((beamRunM * 4 * 1.08).toFixed(1));
  const beamMainNetKg = Number((beamMainM * 0.888).toFixed(1));
  rows.push({
    memberId: 'LNT-01',
    structuralElement: `${beamLabel} — Main Bars (4Y12)`,
    barMark: 'BM-07',
    diameterMm: 12,
    barType: 'High-Yield Deformed (Y12)',
    shapeDescription: '2Y12 Top + 2Y12 Bottom continuous with 600mm laps at corners',
    numMembers: 1,
    barsPerMember: 4,
    totalBars: Math.ceil(beamMainM / 11.4),
    cutLengthM: 11.4,
    totalLengthM: beamMainM,
    unitWeightKgPerM: 0.888,
    netWeightKg: beamMainNetKg,
    wastagePercent: 6,
    finalWeightKg: Number((beamMainNetKg * 1.06).toFixed(1)),
    standard12mLengths: Math.ceil((beamMainM * 1.06) / 12),
  });

  const beamLinksCount = Math.ceil(beamRunM / 0.2) + 12;
  const beamLinksM = Number((beamLinksCount * 0.82).toFixed(1));
  const beamLinksNetKg = Number((beamLinksM * 0.395).toFixed(1));
  rows.push({
    memberId: 'LNT-02',
    structuralElement: `${beamLabel} — Stirrup Links (R8 @ 200mm c/c)`,
    barMark: 'BM-08',
    diameterMm: 8,
    barType: 'Mild Steel / Ribbed Stirrup (R8)',
    shapeDescription: '175×175mm closed stirrup links @ 200mm c/c (0.82m cut)',
    numMembers: 1,
    barsPerMember: beamLinksCount,
    totalBars: beamLinksCount,
    cutLengthM: 0.82,
    totalLengthM: beamLinksM,
    unitWeightKgPerM: 0.395,
    netWeightKg: beamLinksNetKg,
    wastagePercent: 6,
    finalWeightKg: Number((beamLinksNetKg * 1.06).toFixed(1)),
    standard12mLengths: Math.ceil((beamLinksM * 1.06) / 12),
  });

  return rows;
}

/**
 * Generates Room-by-Room Flooring, Screeding, Tile Cartons & Skirting Schedule (Stage 2H & Stage 3)
 * Note: Explicitly resolves the Kitchen (10.80 m² gross) vs Walk-in Pantry (2.70 m² nested in NE corner + 0.45 m² partition wall)
 * so there is ZERO double-counting of floor tiles.
 */
export function calculateRoomFlooringSchedule(): RoomFlooringTakeOffRow[] {
  return ROOM_SCHEDULES.map((rm) => {
    // Deduct Pantry footprint (1.80 x 1.50 = 2.70 m² + 0.45 m² wall) from Kitchen open floor so total never double-counts
    const netFloorAreaSqm =
      rm.id === 'kitchen' ? Number((10.8 - 2.7 - 0.45).toFixed(2)) : rm.areaSqm;

    const isBath = rm.id === 'bath-1' || rm.id === 'bath-2';
    const isVerandah = rm.id === 'verandah';

    const tileSpec = isBath
      ? '300×300mm Matte Non-Slip Ceramic Floor Tiles'
      : isVerandah
        ? '400×400mm Exterior Textured Stoneware Tiles'
        : '600×600mm Vitrified Porcelain Floor Tiles';

    const sqmPerCarton = isBath ? 1.53 : isVerandah ? 1.6 : 1.44; // Standard Nigerian 4-pcs 600x600 carton = 1.44 m²
    const wastagePercent = 10;
    const grossTileAreaSqm = Number((netFloorAreaSqm * (1 + wastagePercent / 100)).toFixed(2));
    const cartonsToPurchase = Math.ceil(grossTileAreaSqm / sqmPerCarton);

    // 40mm cement-sand screed bed (0.04m thickness)
    const screedVolumeM3 = Number((netFloorAreaSqm * 0.04).toFixed(2));
    // 1:4 cement-sand screed requires ~7.5 bags of cement per m³ of screed
    const cementBagsForScreed = Number((screedVolumeM3 * 7.5).toFixed(1));
    // 1 bag of 20kg tile adhesive covers ~3.5 m²
    const adhesiveBags20kg = Math.ceil(grossTileAreaSqm / 3.5);

    // Skirting perimeter (bathrooms have full wall tiles, so 0m skirting)
    const perimeterM = (2 * (rm.widthMm + rm.depthMm)) / 1000;
    const skirtingLinearM = isBath ? 0 : Number((perimeterM - 1.2).toFixed(1));

    return {
      roomCode: rm.code,
      roomName:
        rm.id === 'kitchen'
          ? 'Kitchen (Net Open Floor excl. Pantry Enclosure)'
          : rm.name,
      clearDimensionsM: `${(rm.widthMm / 1000).toFixed(2)} × ${(rm.depthMm / 1000).toFixed(2)} m`,
      netFloorAreaSqm,
      tileSpec,
      wastagePercent,
      grossTileAreaSqm,
      sqmPerCarton,
      cartonsToPurchase,
      screedVolumeM3,
      cementBagsForScreed,
      adhesiveBags20kg,
      skirtingLinearM,
    };
  });
}

/**
 * Generates the Complete 14-Stage (A to N) Bill of Quantities, Material Take-Off,
 * Calculations, Cost Estimate & 7-Phase Procurement Schedule.
 */
export function generateCompleteQSReport(
  config: SiteResolutionConfig,
  region: NigerianRegionBenchmark = 'lagos-sw'
): CompleteQSReport {
  const regSpec = REGION_MULTIPLIERS[region];
  const rFactor = regSpec.factor;
  const price = (baseNaira: number) => Math.round((baseNaira * rFactor) / 50) * 50;

  const rebarSchedule = calculateRebarSchedule(config);
  const roomFlooringSchedule = calculateRoomFlooringSchedule();

  const padCount = config.eastOverhangMode === 'add-column-c4' ? 4 : 3;
  const isC25Footing = config.foundationConcreteGrade === 'C25/30-reinforced';
  const isCutBackRoof = config.eastOverhangMode === 'cut-back-eave';

  // Aggregate Rebar Totals from Bar Bending Schedule
  const y12Rows = rebarSchedule.filter((r) => r.diameterMm === 12);
  const y10Rows = rebarSchedule.filter((r) => r.diameterMm === 10);
  const r8Rows = rebarSchedule.filter((r) => r.diameterMm === 8);

  const y12SubstructureLengths = y12Rows
    .filter((r) => r.memberId.startsWith('FDN') || r.memberId.startsWith('PAD'))
    .reduce((acc, r) => acc + r.standard12mLengths, 0);
  const y12SuperstructureLengths = y12Rows
    .filter((r) => r.memberId.startsWith('COL') || r.memberId.startsWith('LNT'))
    .reduce((acc, r) => acc + r.standard12mLengths, 0);
  const y10SlabLengths = y10Rows.reduce((acc, r) => acc + r.standard12mLengths, 0);
  const r8StirrupLengths = r8Rows.reduce((acc, r) => acc + r.standard12mLengths, 0);

  // Aggregate Flooring Totals from Room Flooring Schedule
  const porcelainRooms = roomFlooringSchedule.filter((r) =>
    r.tileSpec.includes('600×600mm')
  );
  const bathFloorRooms = roomFlooringSchedule.filter((r) =>
    r.tileSpec.includes('300×300mm')
  );
  const verandahFloorRoom = roomFlooringSchedule.find((r) =>
    r.tileSpec.includes('400×400mm')
  )!;

  const porcelainNetSqm = Number(
    porcelainRooms.reduce((s, r) => s + r.netFloorAreaSqm, 0).toFixed(2)
  );
  const porcelainCartons = porcelainRooms.reduce((s, r) => s + r.cartonsToPurchase, 0);
  const bathFloorNetSqm = Number(
    bathFloorRooms.reduce((s, r) => s + r.netFloorAreaSqm, 0).toFixed(2)
  );
  const bathFloorCartons = bathFloorRooms.reduce((s, r) => s + r.cartonsToPurchase, 0);

  const rawItems: Omit<
    MaterialTakeOffItem,
    'sn' | 'wastageQuantity' | 'finalQuantity' | 'totalMaterialCostNaira'
  >[] = [
    // =========================================================================
    // STAGE A: SITE PREPARATION, EARTHWORKS & SETTING-OUT
    // =========================================================================
    {
      code: 'A-01',
      stage: 'STAGE-A',
      stageTitle: 'Stage A: Site Preparation',
      material: 'Site Clearing, Topsoil Stripping (150mm) & Cart-Away',
      specification: 'Clear bush/grass over 18.0m × 17.0m work zone & strip 150mm vegetable soil',
      unit: 'm²',
      practicalUnitNote: '306 m² work envelope (45.9 m³ topsoil stripped)',
      dimensionsUsed: '18.00m × 17.00m (building footprint + 3.0m working setback all round)',
      calculationMethod: 'Area = Length × Width',
      formula: '18.00 m × 17.00 m = 306.0 m²',
      netQuantity: 306,
      wastagePercent: 0,
      unitPriceNaira: price(650),
      procurementPhase: 1,
    },
    {
      code: 'A-02',
      stage: 'STAGE-A',
      stageTitle: 'Stage A: Site Preparation',
      material: 'Setting-Out Profile Timber (1"×6"×12ft Hardwood Planks)',
      specification: 'Sawn hardwood planks for perimeter profile boards around building',
      unit: 'planks',
      practicalUnitNote: '32 lengths of 3.6m (12ft) board',
      dimensionsUsed: '56.0m profile perimeter ÷ 3.6m plank length × 2 tiers/rails',
      calculationMethod: 'Perimeter run divided by 3.6m standard plank length',
      formula: '56.0 m ÷ 3.6 m × 1.8 = 28 planks',
      netQuantity: 28,
      wastagePercent: 15,
      unitPriceNaira: price(4200),
      procurementPhase: 1,
    },
    {
      code: 'A-03',
      stage: 'STAGE-A',
      stageTitle: 'Stage A: Site Preparation',
      material: 'Setting-Out Pegs (2"×2"×12ft Hardwood Cut into 900mm Pegs)',
      specification: '50×50mm pointed hardwood pegs driven @ 1.50m c/c around profile',
      unit: 'bundles',
      practicalUnitNote: '6 bundles (72 pegs total) + 4 rolls builders nylon line',
      dimensionsUsed: '56.0m perimeter @ 1.5m spacing + grid intersections',
      calculationMethod: '1 peg every 1.5m + corner double pegs',
      formula: '56.0 m ÷ 1.5 m + 26 grid pegs = 64 pegs (5.3 bundles)',
      netQuantity: 5.3,
      wastagePercent: 13,
      unitPriceNaira: price(9500),
      procurementPhase: 1,
    },
    {
      code: 'A-04',
      stage: 'STAGE-A',
      stageTitle: 'Stage A: Site Preparation',
      material: 'Foundation Trench & Column Pad Excavation (to -1.20m Datum)',
      specification: 'Excavate 750mm wide strip trenches & 900×900mm column pad pits (1.05m depth from GL -0.15m)',
      unit: 'm³',
      practicalUnitNote: '71.1 m³ insitu (~89 m³ loose excavated soil for backfilling & grading)',
      dimensionsUsed: `85.95m trench × 0.75m W × 1.05m D + ${padCount} pads × (0.90m × 0.90m × 1.05m)`,
      calculationMethod: 'Centerline trench volume + isolated pad volume',
      formula: `(85.95 × 0.75 × 1.05) + (${padCount} × 0.8505) = ${(67.69 + padCount * 0.85).toFixed(1)} m³`,
      netQuantity: Number((67.69 + padCount * 0.85).toFixed(1)),
      wastagePercent: 0,
      unitPriceNaira: price(3800),
      procurementPhase: 1,
    },
    {
      code: 'A-05',
      stage: 'STAGE-A',
      stageTitle: 'Stage A: Site Preparation',
      material: 'Imported Red Laterite Filling Soil (Under Oversite Floor Slab)',
      specification: 'Selected red cohesive laterite compacted in 150mm layers inside foundation walls',
      unit: 'm³',
      practicalUnitNote: '30 m³ loose (~2 Tipper Truckloads of 20-Tonne / 15 m³ capacity)',
      dimensionsUsed: '105.0 m² net internal bays × 0.225m compacted depth',
      calculationMethod: 'Compacted volume × 1.25 bulking/compaction factor',
      formula: '105.0 m² × 0.225 m = 23.63 m³ compacted (+27% bulking = 30.0 m³)',
      netQuantity: 23.6,
      wastagePercent: 27,
      unitPriceNaira: price(7200),
      procurementPhase: 2,
    },
    {
      code: 'A-06',
      stage: 'STAGE-A',
      stageTitle: 'Stage A: Site Preparation',
      material: 'Anti-Termite Soil Treatment Chemical (Chlorpyrifos 48% EC / Dursban)',
      specification: 'Pre-construction termiticide sprayed on trench bases, sides & compacted laterite surface',
      unit: 'litres',
      practicalUnitNote: '8 Litres concentrate (diluted 1:40 to yield 320L spray solution)',
      dimensionsUsed: '85.95m trenches (165 m²) + 120.9 m² oversite area = 285.9 m²',
      calculationMethod: '1 litre concentrate covers ~40 m² of treated soil',
      formula: '285.9 m² ÷ 40 m²/L = 7.15 Litres',
      netQuantity: 7.2,
      wastagePercent: 11,
      unitPriceNaira: price(14500),
      procurementPhase: 1,
    },

    // =========================================================================
    // STAGE B: FOUNDATION & SUBSTRUCTURE (UP TO DPC ±0.000m)
    // =========================================================================
    {
      code: 'B-01',
      stage: 'STAGE-B',
      stageTitle: 'Stage B: Foundation & Substructure',
      material: '50kg Portland Limestone Cement (Grade 42.5N) — 50mm Trench Blinding (1:3:6)',
      specification: 'Dangote 3X / Lafarge Elephant 50kg bags for 50mm weak concrete blinding bed',
      unit: 'bags (50kg)',
      practicalUnitNote: '18 bags (for 3.38 m³ wet 1:3:6 blinding concrete)',
      dimensionsUsed: `(85.95m × 0.75m + ${padCount} × 0.81 m²) × 0.05m = 3.38 m³ wet`,
      calculationMethod: '1:3:6 mix requires 4.8 bags of 50kg cement per m³ wet concrete',
      formula: '3.38 m³ × 4.8 bags/m³ = 16.2 bags',
      netQuantity: 16.2,
      wastagePercent: 11,
      unitPriceNaira: price(9800),
      procurementPhase: 2,
    },
    {
      code: 'B-02',
      stage: 'STAGE-B',
      stageTitle: 'Stage B: Foundation & Substructure',
      material: `50kg Portland Limestone Cement (Grade 42.5N) — Strip Footing & Column Pads (${
        isC25Footing ? 'C25/30 1:1.5:3' : '1:3:6 Mass Mix'
      })`,
      specification: `750×225mm strip footing (14.50 m³) + ${padCount}× 900×900×300mm pads (${(
        padCount * 0.243
      ).toFixed(2)} m³)`,
      unit: 'bags (50kg)',
      practicalUnitNote: `${
        isC25Footing ? '127 bags (Grade C25/30 structural mix)' : '78 bags (1:3:6 mass concrete)'
      }`,
      dimensionsUsed: `Total Footing Concrete = ${(14.5 + padCount * 0.243).toFixed(2)} m³ wet`,
      calculationMethod: isC25Footing
        ? '1:1.5:3 RC mix = 7.8 bags/m³ wet'
        : '1:3:6 mass mix = 4.8 bags/m³ wet',
      formula: `${(14.5 + padCount * 0.243).toFixed(2)} m³ × ${
        isC25Footing ? '7.8' : '4.8'
      } bags/m³`,
      netQuantity: Number(
        ((14.5 + padCount * 0.243) * (isC25Footing ? 7.8 : 4.8)).toFixed(1)
      ),
      wastagePercent: 5,
      unitPriceNaira: price(9800),
      procurementPhase: 2,
    },
    {
      code: 'B-03',
      stage: 'STAGE-B',
      stageTitle: 'Stage B: Foundation & Substructure',
      material: '50kg Portland Limestone Cement — Substructure Blockwork Mortar & Cavity Fill (1:4)',
      specification: 'Mortar & hollow-core concrete infill for 4 courses of 225mm foundation walls',
      unit: 'bags (50kg)',
      practicalUnitNote: '36 bags (for laying & filling 774 foundation blocks)',
      dimensionsUsed: '85.95m trench × 0.90m height (4 courses = 77.36 m²)',
      calculationMethod: '1 bag lays ~35 blocks + 1 bag fills ~45 hollow block cores',
      formula: '(774 ÷ 35) + (774 ÷ 65) = 34.0 bags',
      netQuantity: 34,
      wastagePercent: 6,
      unitPriceNaira: price(9800),
      procurementPhase: 2,
    },
    {
      code: 'B-04',
      stage: 'STAGE-B',
      stageTitle: 'Stage B: Foundation & Substructure',
      material: 'Washed River Sharp Sand — Substructure Concrete & Foundation Mortar',
      specification: 'Coarse, silt-free washed river sand for blinding, footings & substructure mortar',
      unit: 'm³',
      practicalUnitNote: '15.0 m³ (~1 Tipper Truckload of 20-Tonne / 15 m³ capacity)',
      dimensionsUsed: '3.38 m³ blinding + 15.48 m³ footing + 4.8 m³ foundation mortar',
      calculationMethod: '0.45 m³ sand per m³ concrete + mortar sand volume',
      formula: '(18.86 m³ × 0.45) + 4.8 m³ = 13.3 m³',
      netQuantity: 13.3,
      wastagePercent: 12,
      unitPriceNaira: price(14500),
      procurementPhase: 2,
    },
    {
      code: 'B-05',
      stage: 'STAGE-B',
      stageTitle: 'Stage B: Foundation & Substructure',
      material: '19mm (3/4-Inch) Crushed Granite Chippings — Substructure Blinding & Footings',
      specification: 'Quarry-crushed angular granite aggregate for blinding & foundation concrete',
      unit: 'm³',
      practicalUnitNote: '18.5 m³ (~1 full 30-Tonne Tipper Truckload)',
      dimensionsUsed: '3.38 m³ blinding + 15.48 m³ strip & pad footings = 18.86 m³ concrete',
      calculationMethod: '0.90 m³ granite per m³ concrete',
      formula: '18.86 m³ × 0.90 = 16.97 m³',
      netQuantity: 17.0,
      wastagePercent: 9,
      unitPriceNaira: price(26500),
      procurementPhase: 2,
    },
    {
      code: 'B-06',
      stage: 'STAGE-B',
      stageTitle: 'Stage B: Foundation & Substructure',
      material: '225mm (9-Inch) Vibrated Sandcrete Blocks — Foundation Wall (4 Courses to DPC)',
      specification: '450×225×225mm high-strength vibrated blocks laid from -0.975m footing top to DPC',
      unit: 'blocks',
      practicalUnitNote: '836 blocks (includes 8% handling/cutting allowance)',
      dimensionsUsed: '85.95m total trench centerline × 0.90m height (4 courses)',
      calculationMethod: 'Area = 85.95m × 0.90m = 77.36 m² × 10 blocks/m²',
      formula: '77.36 m² × 10 = 774 blocks net',
      netQuantity: 774,
      wastagePercent: 8,
      unitPriceNaira: price(950),
      procurementPhase: 2,
    },
    {
      code: 'B-07',
      stage: 'STAGE-B',
      stageTitle: 'Stage B: Foundation & Substructure',
      material: 'Y12mm High-Yield Reinforcement Steel Bars — Footing Mat & Pad Bases',
      specification: 'BS 4449 Grade 460/500 deformed 12mm steel bars (12m standard lengths)',
      unit: 'lengths (12m)',
      practicalUnitNote: `${y12SubstructureLengths} lengths (${Math.round(
        y12SubstructureLengths * 10.65
      )} kg / ${(y12SubstructureLengths * 0.01065).toFixed(2)} tonnes)`,
      dimensionsUsed: isC25Footing
        ? '85.95m strip footing mat (BM-01 & BM-02) + column pad mats (BM-03)'
        : `${padCount}× 900×900mm column pad bases (BM-03)`,
      calculationMethod: 'Sum of BM-01, BM-02, BM-03 from Bar Bending Schedule',
      formula: `${y12SubstructureLengths} standard 12m bars (incl. 5% cutting/lap wastage)`,
      netQuantity: Number((y12SubstructureLengths / 1.05).toFixed(1)),
      wastagePercent: 5,
      unitPriceNaira: price(12800),
      procurementPhase: 2,
    },
    {
      code: 'B-08',
      stage: 'STAGE-B',
      stageTitle: 'Stage B: Foundation & Substructure',
      material: 'Bituminous Felt Damp-Proof Course (DPC) Sheet (225mm Wide Roll)',
      specification: 'Heavy-duty bitumen-impregnated hessian DPC laid along all walls at ±0.000m FFL',
      unit: 'rolls (10m)',
      practicalUnitNote: '10 rolls of 10m length (95m total run incl. 150mm laps)',
      dimensionsUsed: '85.95m total wall length at DPC level',
      calculationMethod: 'Wall length ÷ 10m roll + 10% lap',
      formula: '85.95 m ÷ 10 m = 8.6 rolls',
      netQuantity: 8.6,
      wastagePercent: 16,
      unitPriceNaira: price(8500),
      procurementPhase: 2,
    },

    // =========================================================================
    // STAGE C: GROUND FLOOR OVERSITE SLAB CONSTRUCTION
    // =========================================================================
    {
      code: 'C-01',
      stage: 'STAGE-C',
      stageTitle: 'Stage C: Ground Floor Construction',
      material: '150mm Hardcore Filling (Quarry Granite Boulders / Hand-Packed Broken Rock)',
      specification: '150–225mm clean broken granite boulders rammed & blinded over laterite bed',
      unit: 'm³',
      practicalUnitNote: '21.0 m³ (~1 full 30-Tonne Tipper Load of Granite Boulders)',
      dimensionsUsed: '120.90 m² gross building + verandah area × 0.15m thickness',
      calculationMethod: 'Area × 0.15m + 15% void compaction allowance',
      formula: '120.90 m² × 0.15 m = 18.14 m³',
      netQuantity: 18.1,
      wastagePercent: 16,
      unitPriceNaira: price(19500),
      procurementPhase: 2,
    },
    {
      code: 'C-02',
      stage: 'STAGE-C',
      stageTitle: 'Stage C: Ground Floor Construction',
      material: '1000-Gauge Heavy-Duty Polythene Damp-Proof Membrane (DPM)',
      specification: '250-micron virgin black polythene sheet laid continuously below 150mm oversite slab',
      unit: 'm²',
      practicalUnitNote: '140 m² (3 Rolls of 50 m² each, allowing 300mm edge & joint overlaps)',
      dimensionsUsed: '120.90 m² slab area + perimeter turn-up into DPC',
      calculationMethod: 'Gross slab area + 15% overlap allowance',
      formula: '120.90 m² × 1.15 = 139.0 m²',
      netQuantity: 120.9,
      wastagePercent: 16,
      unitPriceNaira: price(650),
      procurementPhase: 2,
    },
    {
      code: 'C-03',
      stage: 'STAGE-C',
      stageTitle: 'Stage C: Ground Floor Construction',
      material: 'Y10mm High-Yield Steel Bars / BRC Mesh — 150mm Oversite Slab Reinforcement',
      specification: 'Y10mm deformed bars @ 250mm c/c both ways (BM-06) across 120.9 m² oversite slab',
      unit: 'lengths (12m)',
      practicalUnitNote: `${y10SlabLengths} lengths of Y10 (633 kg total steel mesh)`,
      dimensionsUsed: '120.90 m² slab × 8.0m bar/m² = 968m total bar length',
      calculationMethod: 'Total bar run ÷ 12m standard length + 6% lap',
      formula: '968.0 m ÷ 12 m = 80.7 lengths net',
      netQuantity: 80.7,
      wastagePercent: 6,
      unitPriceNaira: price(9200),
      procurementPhase: 2,
    },
    {
      code: 'C-04',
      stage: 'STAGE-C',
      stageTitle: 'Stage C: Ground Floor Construction',
      material: '50kg Portland Limestone Cement — 150mm Oversite Concrete Slab (Grade C20/25 1:2:4)',
      specification: '120.90 m² × 150mm thick cast-in-situ oversite concrete floor slab (18.14 m³ wet)',
      unit: 'bags (50kg)',
      practicalUnitNote: '124 bags (at 6.5 bags per m³ of 1:2:4 concrete)',
      dimensionsUsed: '120.90 m² × 0.15m = 18.14 m³ wet concrete',
      calculationMethod: '18.14 m³ × 6.5 bags/m³ + 5% wastage',
      formula: '18.14 m³ × 6.5 = 117.9 bags net',
      netQuantity: 117.9,
      wastagePercent: 5,
      unitPriceNaira: price(9800),
      procurementPhase: 2,
    },
    {
      code: 'C-05',
      stage: 'STAGE-C',
      stageTitle: 'Stage C: Ground Floor Construction',
      material: 'Washed Sharp Sand — 50mm Hardcore Blinding & 150mm Oversite Slab Concrete',
      specification: '6.05 m³ hardcore sand blinding + 8.16 m³ slab concrete fine aggregate',
      unit: 'm³',
      practicalUnitNote: '16.0 m³ (~1 Tipper Truckload of 20-Tonne / 15 m³ capacity)',
      dimensionsUsed: '120.90 m² × 0.05m blinding + (18.14 m³ × 0.45)',
      calculationMethod: 'Blinding sand + 0.45 m³ per m³ slab concrete',
      formula: '6.05 m³ + 8.16 m³ = 14.21 m³ net',
      netQuantity: 14.2,
      wastagePercent: 12,
      unitPriceNaira: price(14500),
      procurementPhase: 2,
    },
    {
      code: 'C-06',
      stage: 'STAGE-C',
      stageTitle: 'Stage C: Ground Floor Construction',
      material: '19mm (3/4-Inch) Crushed Granite — 150mm Oversite Floor Slab Concrete',
      specification: 'Clean 19mm graded granite aggregate for 18.14 m³ oversite concrete slab',
      unit: 'm³',
      practicalUnitNote: '18.0 m³ (~1 full 30-Tonne Tipper Truckload)',
      dimensionsUsed: '18.14 m³ wet slab concrete × 0.90 m³ granite/m³',
      calculationMethod: '0.90 m³ coarse aggregate per m³ of 1:2:4 concrete',
      formula: '18.14 m³ × 0.90 = 16.33 m³ net',
      netQuantity: 16.3,
      wastagePercent: 10,
      unitPriceNaira: price(26500),
      procurementPhase: 2,
    },
    {
      code: 'C-07',
      stage: 'STAGE-C',
      stageTitle: 'Stage C: Ground Floor Construction',
      material: 'Slab Edge Timber Formwork (1"×8"×12ft Planks + Bracing Pegs)',
      specification: 'Sawn timber edge shuttering around 46.0m slab & verandah perimeter',
      unit: 'planks',
      practicalUnitNote: '16 planks + 5kg of 3-inch & 4-inch wire nails',
      dimensionsUsed: '46.0m slab perimeter ÷ 3.6m plank length',
      calculationMethod: 'Perimeter ÷ 3.6m length + 15% overlap/cutting',
      formula: '46.0 m ÷ 3.6 m = 12.8 planks net',
      netQuantity: 13,
      wastagePercent: 23,
      unitPriceNaira: price(4800),
      procurementPhase: 2,
    },

    // =========================================================================
    // STAGE D: SUPERSTRUCTURE WALL CONSTRUCTION (DPC TO ROOF)
    // =========================================================================
    {
      code: 'D-01',
      stage: 'STAGE-D',
      stageTitle: 'Stage D: Wall Construction',
      material: '225mm (9-Inch) Hollow Sandcrete Blocks — External Walls & 12° Split-Roof Gables',
      specification: '450×225×225mm machine-vibrated blocks from DPC to +3.00m ceiling & +4.54m/+4.12m gables (Net of D1, W1–W5 & RC Ring Beam)',
      unit: 'blocks',
      practicalUnitNote: '1,492 blocks (Combined with 836 foundation blocks = 2,328 total 9" blocks)',
      dimensionsUsed: '42.30m perimeter × 3.00m (126.90 m²) + Gables/Spine (35.64 m²) - Openings (14.94 m²) - Ring Beam (9.52 m²) = 138.08 m²',
      calculationMethod: 'Net wall area (138.08 m²) × 10 blocks/m² + 8% breakage/cutting wastage',
      formula: '138.08 m² × 10 = 1,381 blocks net',
      netQuantity: 1381,
      wastagePercent: 8,
      unitPriceNaira: price(950),
      procurementPhase: 3,
    },
    {
      code: 'D-02',
      stage: 'STAGE-D',
      stageTitle: 'Stage D: Wall Construction',
      material: '150mm (6-Inch) Hollow Sandcrete Blocks — Internal Partition Walls',
      specification: '450×225×150mm machine-vibrated blocks for internal partitions to +3.00m ceiling (Net of D2–D5 & RC Lintels)',
      unit: 'blocks',
      practicalUnitNote: '1,158 blocks (includes 8% cutting & handling wastage)',
      dimensionsUsed: '41.25m net partition length × 3.00m (123.75 m²) - Doors D2–D5 (10.40 m²) - Lintels (6.19 m²) = 107.16 m²',
      calculationMethod: 'Net partition area (107.16 m²) × 10 blocks/m² + 8% wastage',
      formula: '107.16 m² × 10 = 1,072 blocks net',
      netQuantity: 1072,
      wastagePercent: 8,
      unitPriceNaira: price(800),
      procurementPhase: 3,
    },
    {
      code: 'D-03',
      stage: 'STAGE-D',
      stageTitle: 'Stage D: Wall Construction',
      material: '50kg Portland Limestone Cement — Superstructure Block-Laying Mortar (1:6 Mix)',
      specification: '20mm bed & perpends mortar for laying 1,381× 9" blocks and 1,072× 6" blocks',
      unit: 'bags (50kg)',
      practicalUnitNote: '49 bags (1 bag lays ~50 blocks in 1:6 mix)',
      dimensionsUsed: '2,453 net superstructure blocks across 245.24 m² net wall area',
      calculationMethod: '1 bag per 55 blocks (9") and 65 blocks (6") + gable bedding',
      formula: '(1,381 ÷ 50) + (1,072 ÷ 60) = 45.5 bags net',
      netQuantity: 45.5,
      wastagePercent: 8,
      unitPriceNaira: price(9800),
      procurementPhase: 3,
    },
    {
      code: 'D-04',
      stage: 'STAGE-D',
      stageTitle: 'Stage D: Wall Construction',
      material: 'Washed Sharp Sand — Superstructure Block-Laying Mortar',
      specification: 'Clean medium-coarse sand for 1:6 block-laying mortar',
      unit: 'm³',
      practicalUnitNote: '7.5 m³ (~0.5 Tipper Truckload)',
      dimensionsUsed: '245.24 m² net superstructure blockwork × 0.027 m³ mortar/m²',
      calculationMethod: 'Mortar volume × 1.05 sand factor',
      formula: '245.24 m² × 0.027 = 6.62 m³ net',
      netQuantity: 6.6,
      wastagePercent: 14,
      unitPriceNaira: price(14500),
      procurementPhase: 3,
    },

    // =========================================================================
    // STAGE E: STRUCTURAL WORKS (COLUMNS, LINTELS & RING BEAM)
    // =========================================================================
    {
      code: 'E-01',
      stage: 'STAGE-E',
      stageTitle: 'Stage E: Structural Works',
      material: `50kg Portland Limestone Cement — RC Columns & ${
        config.includeRingBeam ? 'Continuous +2.10m Ring Beam' : 'Door/Window Lintels'
      } (Grade C25/30 1:1.5:3)`,
      specification: `${4 + padCount}× 225×225mm RC columns (1.22 m³) + ${
        config.includeRingBeam
          ? '85.95m continuous 225×225mm head-course ring beam (4.35 m³)'
          : '17× door/window lintels (1.42 m³)'
      }`,
      unit: 'bags (50kg)',
      practicalUnitNote: `${config.includeRingBeam ? '46 bags' : '22 bags'} (at 7.8 bags/m³ C25/30 concrete)`,
      dimensionsUsed: `Total Structural Superstructure Concrete = ${
        config.includeRingBeam ? '5.57 m³' : '2.64 m³'
      }`,
      calculationMethod: 'Concrete volume × 7.8 bags/m³ + 5% wastage',
      formula: `${config.includeRingBeam ? '5.57' : '2.64'} m³ × 7.8 bags/m³`,
      netQuantity: Number(((config.includeRingBeam ? 5.57 : 2.64) * 7.8).toFixed(1)),
      wastagePercent: 6,
      unitPriceNaira: price(9800),
      procurementPhase: 3,
    },
    {
      code: 'E-02',
      stage: 'STAGE-E',
      stageTitle: 'Stage E: Structural Works',
      material: 'Washed Sharp Sand & 19mm Granite — Columns, Lintels & Ring Beam Concrete',
      specification: 'Fine & coarse aggregate for Grade C25/30 superstructure columns and beams',
      unit: 'm³ (combined)',
      practicalUnitNote: `${config.includeRingBeam ? '2.8 m³ sand + 5.5 m³ granite' : '1.4 m³ sand + 2.6 m³ granite'}`,
      dimensionsUsed: `${config.includeRingBeam ? '5.57 m³' : '2.64 m³'} wet concrete × 1.35 aggregate factor`,
      calculationMethod: '0.45 m³ sand + 0.90 m³ granite per m³ concrete',
      formula: `${config.includeRingBeam ? '5.57' : '2.64'} m³ × 1.35`,
      netQuantity: Number(((config.includeRingBeam ? 5.57 : 2.64) * 1.35).toFixed(1)),
      wastagePercent: 10,
      unitPriceNaira: price(22500),
      procurementPhase: 3,
    },
    {
      code: 'E-03',
      stage: 'STAGE-E',
      stageTitle: 'Stage E: Structural Works',
      material: 'Y12mm High-Yield Reinforcement Steel Bars — Columns, Lintels & Ring Beam (BM-04 & BM-07)',
      specification: '4Y12 main bars in all columns, lintels, verandah fascia beams & continuous ring beam',
      unit: 'lengths (12m)',
      practicalUnitNote: `${y12SuperstructureLengths} lengths (${Math.round(
        y12SuperstructureLengths * 10.65
      )} kg)`,
      dimensionsUsed: 'Columns (BM-04: 32 bars × 4.55m) + Ring Beam/Lintels (BM-07: 4Y12)',
      calculationMethod: 'Sum of BM-04 and BM-07 from Bar Bending Schedule',
      formula: `${y12SuperstructureLengths} standard 12m bars (incl. 6% cutting/lap wastage)`,
      netQuantity: Number((y12SuperstructureLengths / 1.06).toFixed(1)),
      wastagePercent: 6,
      unitPriceNaira: price(12800),
      procurementPhase: 3,
    },
    {
      code: 'E-04',
      stage: 'STAGE-E',
      stageTitle: 'Stage E: Structural Works',
      material: 'R8mm Stirrup / Link Bars — Columns, Lintels & Ring Beam (BM-05 & BM-08)',
      specification: '8mm mild/ribbed steel links @ 200mm c/c (175×175mm closed stirrups)',
      unit: 'lengths (12m)',
      practicalUnitNote: `${r8StirrupLengths} lengths (${Math.round(r8StirrupLengths * 4.74)} kg)`,
      dimensionsUsed: 'Column links (BM-05) + Beam/Lintel links (BM-08) @ 200mm c/c',
      calculationMethod: 'Sum of BM-05 and BM-08 from Bar Bending Schedule',
      formula: `${r8StirrupLengths} standard 12m lengths (0.82m cut per link)`,
      netQuantity: Number((r8StirrupLengths / 1.06).toFixed(1)),
      wastagePercent: 6,
      unitPriceNaira: price(6800),
      procurementPhase: 3,
    },
    {
      code: 'E-05',
      stage: 'STAGE-E',
      stageTitle: 'Stage E: Structural Works',
      material: '16-Gauge Annealed Black Binding Wire (for Tying All Rebar Mats, Columns & Beams)',
      specification: 'Soft annealed steel tying wire (20kg roll standard)',
      unit: 'kg',
      practicalUnitNote: '35 kg (1.75 Rolls of 20kg roll)',
      dimensionsUsed: '10 kg per tonne of reinforcement steel tied across foundation, slab & beams',
      calculationMethod: 'Total rebar weight (tonnes) × 10 kg/tonne',
      formula: '3.15 tonnes × 10 kg/t = 31.5 kg net',
      netQuantity: 31.5,
      wastagePercent: 11,
      unitPriceNaira: price(2400),
      procurementPhase: 2,
    },
    {
      code: 'E-06',
      stage: 'STAGE-E',
      stageTitle: 'Stage E: Structural Works',
      material: 'Sawn Timber Formwork Boards (1"×12"×12ft Afara/Obeche Planks) + Bamboo/2"×3" Props',
      specification: '300mm wide shuttering boards for columns, lintel soffits & ring beam sides (reused 2×)',
      unit: 'planks',
      practicalUnitNote: `${config.includeRingBeam ? '72 planks + 60 bamboo props' : '34 planks + 28 bamboo props'}`,
      dimensionsUsed: config.includeRingBeam
        ? '85.95m ring beam sides + 8 columns (54.5 m² contact area with 2× reuse)'
        : '24.75m lintels + 8 columns (24.2 m² contact area)',
      calculationMethod: 'Formwork contact area ÷ 1.08 m²/plank ÷ 2 reuses',
      formula: config.includeRingBeam
        ? '66 planks net + 9% cutting wastage'
        : '30 planks net + 13% cutting wastage',
      netQuantity: config.includeRingBeam ? 66 : 30,
      wastagePercent: 10,
      unitPriceNaira: price(6200),
      procurementPhase: 3,
    },
    {
      code: 'E-07',
      stage: 'STAGE-E',
      stageTitle: 'Stage E: Structural Works',
      material: 'Wire Nails (2", 3" & 4" Assorted Sizes) for Formwork & Profile Carpentry',
      specification: 'High-tensile steel carpentry nails in 25kg bags',
      unit: 'kg',
      practicalUnitNote: '38 kg (1.5 bags of 25kg)',
      dimensionsUsed: 'Formwork boarding, bracing struts & lintel supports',
      calculationMethod: '0.5 kg nails per plank of formwork',
      formula: '34 kg net + 12% wastage = 38 kg',
      netQuantity: 34,
      wastagePercent: 12,
      unitPriceNaira: price(2100),
      procurementPhase: 3,
    },

    // =========================================================================
    // STAGE F: 12° SPLIT-LEVEL CLERESTORY ROOFING & RAINWATER GOODS
    // =========================================================================
    {
      code: 'F-01',
      stage: 'STAGE-F',
      stageTitle: 'Stage F: 12° Split-Level Roofing',
      material: '0.55mm Gauge Long-Span Standing-Seam Aluminium Roofing Sheets (Taupe-Grey)',
      specification: 'Oven-baked colour-coated 0.55mm aluminium standing-seam panels for 12° North & South wings',
      unit: 'm²',
      practicalUnitNote: `${
        isCutBackRoof ? '176.0 m²' : '188.1 m²'
      } (Continuous 6.50m North & 6.40m South panels @ 1.0m effective cover width)`,
      dimensionsUsed: isCutBackRoof
        ? 'North Wing (13.80m × 6.49m = 89.56 m²) + Cut-Back South Wing (73.24 m²) = 162.8 m²'
        : 'North Wing (13.80m × 6.49m = 89.56 m²) + South Wing (13.80m × 6.39m = 84.64 m²) = 174.2 m²',
      calculationMethod: 'Plan area ÷ cos(12°) [1.02234 slope factor] + 8% side-lap & cutting allowance',
      formula: `${isCutBackRoof ? '162.8' : '174.2'} m² × 1.08`,
      netQuantity: isCutBackRoof ? 162.8 : 174.2,
      wastagePercent: 8,
      unitPriceNaira: price(11800),
      procurementPhase: 4,
    },
    {
      code: 'F-02',
      stage: 'STAGE-F',
      stageTitle: 'Stage F: 12° Split-Level Roofing',
      material: '0.55mm Aluminium Upper Ridge Cap & 420mm Clerestory Step Apron Flashing',
      specification: 'Matching taupe-grey flashing along 13.80m upper spine ridge (+4.54m) & clerestory step (+4.12m)',
      unit: 'm (linear)',
      practicalUnitNote: '30.5 m (13.80m upper ridge cap + 13.80m clerestory step flashing + laps)',
      dimensionsUsed: '2 × 13.80m central spine width = 27.60m',
      calculationMethod: 'Linear run + 10% overlap at sheet joints',
      formula: '27.60 m × 1.10 = 30.4 m',
      netQuantity: 27.6,
      wastagePercent: 10,
      unitPriceNaira: price(6500),
      procurementPhase: 4,
    },
    {
      code: 'F-03',
      stage: 'STAGE-F',
      stageTitle: 'Stage F: 12° Split-Level Roofing',
      material: 'Treated Hardwood Rafters & Tie Beams (2"×6"×12ft / 50×150mm)',
      specification: 'Seasoned & Solignum-treated hardwood rafters @ 1,200mm c/c across North & South wings',
      unit: 'lengths (3.6m)',
      practicalUnitNote: '75 lengths (12 trusses × 12.9m total rafter/tie run)',
      dimensionsUsed: '12 rafter lines @ 1.2m c/c × (6.5m North + 6.4m South + tie struts)',
      calculationMethod: 'Total rafter/tie linear metres (244.8m) ÷ 3.6m length',
      formula: '244.8 m ÷ 3.6 m = 68 lengths net',
      netQuantity: 68,
      wastagePercent: 10,
      unitPriceNaira: price(7200),
      procurementPhase: 4,
    },
    {
      code: 'F-04',
      stage: 'STAGE-F',
      stageTitle: 'Stage F: 12° Split-Level Roofing',
      material: 'Treated Hardwood Wall Plates & King/Queen Struts (2"×4"×12ft / 50×100mm)',
      specification: '100×50mm wall plates bedded on ring beam + vertical/diagonal truss web struts',
      unit: 'lengths (3.6m)',
      practicalUnitNote: '49 lengths (85.95m wall plates + truss struts)',
      dimensionsUsed: '85.95m wall plate run + 72.0m internal web members = 158.0m',
      calculationMethod: '158.0m ÷ 3.6m length + 11% splice/cutting allowance',
      formula: '158.0 m ÷ 3.6 m = 43.9 lengths net',
      netQuantity: 44,
      wastagePercent: 11,
      unitPriceNaira: price(5400),
      procurementPhase: 4,
    },
    {
      code: 'F-05',
      stage: 'STAGE-F',
      stageTitle: 'Stage F: 12° Split-Level Roofing',
      material: 'Treated Hardwood Purlins (2"×3"×12ft / 50×75mm @ 900mm c/c)',
      specification: '16 rows of 50×75mm purlins spanning 13.80m roof width (8 North Wing + 8 South Wing)',
      unit: 'lengths (3.6m)',
      practicalUnitNote: '86 lengths (280.8m total purlin run)',
      dimensionsUsed: '16 purlin lines × 13.80m width = 220.8m + ridge/eave double purlins',
      calculationMethod: '280.8m ÷ 3.6m length + 10% splice lap',
      formula: '280.8 m ÷ 3.6 m = 78 lengths net',
      netQuantity: 78,
      wastagePercent: 10,
      unitPriceNaira: price(4100),
      procurementPhase: 4,
    },
    {
      code: 'F-06',
      stage: 'STAGE-F',
      stageTitle: 'Stage F: 12° Split-Level Roofing',
      material: 'Treated Hardwood Ceiling Joists & Noggins (2"×2"×12ft / 50×50mm @ 600×600mm Grid)',
      specification: 'Timber ceiling framing grid at +3.00m FFL & verandah/eave soffit framing',
      unit: 'lengths (3.6m)',
      practicalUnitNote: '160 lengths (522m total grid framing)',
      dimensionsUsed: '120.90 m² ceiling & soffit area × 4.3m timber per m²',
      calculationMethod: '520m ÷ 3.6m length + 10% cutting wastage',
      formula: '520.0 m ÷ 3.6 m = 144.4 lengths net',
      netQuantity: 145,
      wastagePercent: 10,
      unitPriceNaira: price(2900),
      procurementPhase: 4,
    },
    {
      code: 'F-07',
      stage: 'STAGE-F',
      stageTitle: 'Stage F: 12° Split-Level Roofing',
      material: 'Taupe-Grey Fascia & Sloped Bargeboards (1"×10" Hardwood + 0.55mm Aluminium Trim)',
      specification: 'Perimeter fascia boards at Rear (+3.20m), Front (+2.80m) & 12° West/East split-level gables',
      unit: 'm (linear)',
      practicalUnitNote: '58.0 m (16 lengths of 3.6m fascia board + pre-painted aluminium cover)',
      dimensionsUsed: '2 × 13.80m (North/South eaves) + 2 × 12.63m (West/East sloped gables) = 52.86m',
      calculationMethod: 'Perimeter run + 10% corner mitre & lap allowance',
      formula: '52.86 m × 1.10 = 58.1 m',
      netQuantity: 52.9,
      wastagePercent: 10,
      unitPriceNaira: price(7800),
      procurementPhase: 4,
    },
    {
      code: 'F-08',
      stage: 'STAGE-F',
      stageTitle: 'Stage F: 12° Split-Level Roofing',
      material: 'Rainwater Eave Box Gutters & Ø100mm Downpipes (DP1, DP2, DP3, DP4)',
      specification: 'Rear (+3.20m) & Front (+2.80m) gutters + 4× Ø100mm dark-bronze uPVC downpipes with swan-necks & clips',
      unit: 'm (combined)',
      practicalUnitNote: '27.6m eave gutter + 16.0m Ø100mm downpipes (4 drops × 4.0m incl. swan-neck)',
      dimensionsUsed: '27.6m gutter run + 4 × 3.8m vertical/swan-neck drops = 42.8m',
      calculationMethod: 'Gutter length + 4 corner downpipe drops',
      formula: '27.6 m + 15.2 m = 42.8 m net',
      netQuantity: 42.8,
      wastagePercent: 8,
      unitPriceNaira: price(6800),
      procurementPhase: 4,
    },
    {
      code: 'F-09',
      stage: 'STAGE-F',
      stageTitle: 'Stage F: 12° Split-Level Roofing',
      material: 'Self-Drilling EPDM Washer Roofing Screws, Felt, Hoop Iron Straps & Solignum',
      specification: '65mm EPDM-washer screws (12 pkts), galvanized hurricane tie straps & 20L Solignum wood preservative',
      unit: 'lot / set',
      practicalUnitNote: '12 packets screws + 2 rolls hoop iron + 20L Solignum + 25kg wire nails',
      dimensionsUsed: '8 screws/m² roof sheet + 24 rafter tie-down straps',
      calculationMethod: 'Complete roof fastening & timber preservation accessory pack',
      formula: '1.0 Complete Roof Fastening & Preservative Lot',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(245000),
      procurementPhase: 4,
    },

    // =========================================================================
    // STAGE G: PLASTERING, WALL SCREEDING, WALL TILING & PAINTING
    // =========================================================================
    {
      code: 'G-01',
      stage: 'STAGE-G',
      stageTitle: 'Stage G: Plastering & Wall Finishing',
      material: '50kg Portland Limestone Cement — 15mm Internal & External Wall Plastering (1:4 Mix)',
      specification: '15mm smooth sand-cement rendering on 161.80 m² external walls & 271.02 m² internal walls',
      unit: 'bags (50kg)',
      practicalUnitNote: '68 bags (covering 432.82 m² net plaster area at 15mm thickness)',
      dimensionsUsed: 'External (161.80 m² incl reveals) + Internal (271.02 m² excl bath/kitchen wall tiles) = 432.82 m²',
      calculationMethod: '432.82 m² × 0.015m = 6.49 m³ wet mortar × 9.6 bags/m³',
      formula: '6.49 m³ × 9.6 bags/m³ = 62.3 bags net',
      netQuantity: 62.3,
      wastagePercent: 9,
      unitPriceNaira: price(9800),
      procurementPhase: 6,
    },
    {
      code: 'G-02',
      stage: 'STAGE-G',
      stageTitle: 'Stage G: Plastering & Wall Finishing',
      material: 'Soft Plastering Sand — Internal & External Wall Rendering',
      specification: 'Fine, clay-free screened plastering sand for 432.82 m² smooth wall render',
      unit: 'm³',
      practicalUnitNote: '11.5 m³ (~1 Tipper Truckload of 15 m³ capacity)',
      dimensionsUsed: '432.82 m² × 0.015m × 1.50 dry bulking factor',
      calculationMethod: '6.49 m³ wet mortar × 1.50 = 9.74 m³ net',
      formula: '6.49 m³ × 1.50 = 9.74 m³ net',
      netQuantity: 9.7,
      wastagePercent: 18,
      unitPriceNaira: price(13500),
      procurementPhase: 6,
    },
    {
      code: 'G-03',
      stage: 'STAGE-G',
      stageTitle: 'Stage G: Plastering & Wall Finishing',
      material: 'Glazed Ceramic Wall Tiles (250×400mm / 300×600mm) — Bath 1, Bath 2 & Kitchen Splashback',
      specification: 'Full-height bathroom wall tiles to +2.10m (36.50 m²) + Kitchen 600mm splashback (3.60 m²)',
      unit: 'm²',
      practicalUnitNote: '44.2 m² (30 Cartons at 1.50 m² per carton)',
      dimensionsUsed: 'Bath 1 (18.25 m²) + Bath 2 (18.25 m²) + Kitchen worktop splashback (6.0m × 0.60m = 3.60 m²) = 40.10 m²',
      calculationMethod: 'Net wall tile area (40.10 m²) + 10% cutting wastage',
      formula: '40.10 m² × 1.10 = 44.11 m² (30 cartons)',
      netQuantity: 40.1,
      wastagePercent: 10,
      unitPriceNaira: price(6800),
      procurementPhase: 6,
    },
    {
      code: 'G-04',
      stage: 'STAGE-G',
      stageTitle: 'Stage G: Plastering & Wall Finishing',
      material: 'Wall Screeding Putty (POP Cement + Acrylic Screed Paste) & Sandpaper',
      specification: '2-coat smooth interior wall screeding over 271.02 m² internal plastered walls',
      unit: 'bags (20kg)',
      practicalUnitNote: '28 bags POP/Acrylic putty + 2× 20L TopBond/PVA binder + abrasive paper rolls',
      dimensionsUsed: '271.02 m² internal painted wall area ÷ 10.5 m²/bag',
      calculationMethod: '1 bag (20kg) covers ~10.5 m² in 2 skim coats',
      formula: '271.02 m² ÷ 10.5 = 25.8 bags net',
      netQuantity: 25.8,
      wastagePercent: 9,
      unitPriceNaira: price(8200),
      procurementPhase: 6,
    },
    {
      code: 'G-05',
      stage: 'STAGE-G',
      stageTitle: 'Stage G: Plastering & Wall Finishing',
      material: 'Alkali-Resistant Wall Primer / Undercoat (20-Litre Drums)',
      specification: '1 sealing coat on all 432.82 m² internal & external plastered walls before topcoats',
      unit: 'litres',
      practicalUnitNote: '80 Litres (4 Drums of 20-Litre Primer)',
      dimensionsUsed: '432.82 m² total painted wall area ÷ 6.0 m²/L coverage',
      calculationMethod: 'Total area ÷ 6 m²/L + 10% roller/brush loss',
      formula: '432.82 m² ÷ 6.0 = 72.1 Litres net',
      netQuantity: 72.1,
      wastagePercent: 11,
      unitPriceNaira: price(1850),
      procurementPhase: 6,
    },
    {
      code: 'G-06',
      stage: 'STAGE-G',
      stageTitle: 'Stage G: Plastering & Wall Finishing',
      material: 'Interior Silk / Washable Acrylic Emulsion Paint (20-Litre Drums)',
      specification: '2 finishing coats over 271.02 m² internal walls (Living, Dining, Bedrooms, Passage)',
      unit: 'litres',
      practicalUnitNote: '100 Litres (5 Drums of 20-Litre Premium Interior Emulsion)',
      dimensionsUsed: '271.02 m² × 2 coats = 542.04 m² ÷ 6.0 m²/L',
      calculationMethod: '2 coats at 120 m² per 20L drum',
      formula: '542.04 m² ÷ 6.0 m²/L = 90.3 Litres net',
      netQuantity: 90.3,
      wastagePercent: 11,
      unitPriceNaira: price(2650),
      procurementPhase: 7,
    },
    {
      code: 'G-07',
      stage: 'STAGE-G',
      stageTitle: 'Stage G: Plastering & Wall Finishing',
      material: 'Exterior Weather-Shield Textured / Acrylic Paint (20-Litre Drums)',
      specification: '2 weather-resistant UV coats on 161.80 m² external facades & gables (Warm Sand Cream)',
      unit: 'litres',
      practicalUnitNote: '60 Litres (3 Drums of 20-Litre Exterior Weather-Shield)',
      dimensionsUsed: '161.80 m² × 2 coats = 323.60 m² ÷ 6.0 m²/L',
      calculationMethod: '2 coats at 120 m² per 20L drum',
      formula: '323.60 m² ÷ 6.0 m²/L = 53.9 Litres net',
      netQuantity: 53.9,
      wastagePercent: 11,
      unitPriceNaira: price(3100),
      procurementPhase: 7,
    },

    // =========================================================================
    // STAGE H: FLOORING (SCREED BED & ROOM-BY-ROOM TILING)
    // =========================================================================
    {
      code: 'H-01',
      stage: 'STAGE-H',
      stageTitle: 'Stage H: Flooring',
      material: '600×600mm Vitrified Porcelain Floor Tiles (Living, Dining, Bed 1, Bed 2, Passage, Kitchen, Pantry)',
      specification: 'Grade-A polished/matte 600×600mm porcelain tiles (1.44 m² per 4-piece carton)',
      unit: 'm²',
      practicalUnitNote: `${(porcelainNetSqm * 1.1).toFixed(1)} m² (${porcelainCartons} Cartons + 78.5m tile skirting)`,
      dimensionsUsed: `Living (19.44) + Dining (10.80) + Bed 1 (12.96) + Bed 2 (12.96) + Passage (13.86) + Utility (4.25) + Kitchen Net (7.65) + Pantry (2.70) = ${porcelainNetSqm} m²`,
      calculationMethod: 'Sum of net room floor areas (excluding Pantry wall overlap) + 10% cutting/skirting wastage',
      formula: `${porcelainNetSqm} m² × 1.10 = ${(porcelainNetSqm * 1.1).toFixed(2)} m²`,
      netQuantity: porcelainNetSqm,
      wastagePercent: 10,
      unitPriceNaira: price(9400),
      procurementPhase: 6,
    },
    {
      code: 'H-02',
      stage: 'STAGE-H',
      stageTitle: 'Stage H: Flooring',
      material: '300×300mm Matte Non-Slip Ceramic Floor Tiles — Bathroom 1 & Bathroom 2',
      specification: 'Textured anti-slip bathroom floor tiles laid to 1:60 fall toward floor drains',
      unit: 'm²',
      practicalUnitNote: `10.3 m² (${bathFloorCartons} Cartons at 1.53 m²/carton)`,
      dimensionsUsed: `Bath 1 (1.95m × 2.40m = 4.68 m²) + Bath 2 (1.95m × 2.40m = 4.68 m²) = ${bathFloorNetSqm} m²`,
      calculationMethod: '9.36 m² net area + 10% diagonal fall cutting wastage',
      formula: '9.36 m² × 1.10 = 10.30 m²',
      netQuantity: bathFloorNetSqm,
      wastagePercent: 10,
      unitPriceNaira: price(7200),
      procurementPhase: 6,
    },
    {
      code: 'H-03',
      stage: 'STAGE-H',
      stageTitle: 'Stage H: Flooring',
      material: '400×400mm Exterior Non-Slip Stoneware Floor Tiles — Covered Front Verandah',
      specification: 'Heavy-duty frost/weather-resistant exterior floor tiles + step nosing',
      unit: 'm²',
      practicalUnitNote: `12.2 m² (${verandahFloorRoom.cartonsToPurchase} Cartons at 1.60 m²/carton)`,
      dimensionsUsed: 'Verandah 6.00m × 1.85m = 11.10 m²',
      calculationMethod: '11.10 m² net area + 10% step/edge cutting wastage',
      formula: '11.10 m² × 1.10 = 12.21 m²',
      netQuantity: 11.1,
      wastagePercent: 10,
      unitPriceNaira: price(8500),
      procurementPhase: 6,
    },
    {
      code: 'H-04',
      stage: 'STAGE-H',
      stageTitle: 'Stage H: Flooring',
      material: '50kg Portland Limestone Cement — 40mm Floor Screed Bed (1:4 Mix)',
      specification: 'Leveling cement-sand screed bed across all 105.08 m² tiled floor spaces',
      unit: 'bags (50kg)',
      practicalUnitNote: '34 bags (for 4.20 m³ of 40mm floor screed bed)',
      dimensionsUsed: '105.08 m² total tiled floor area × 0.04m screed thickness = 4.20 m³',
      calculationMethod: '4.20 m³ × 7.5 bags/m³ + 8% wastage',
      formula: '4.20 m³ × 7.5 = 31.5 bags net',
      netQuantity: 31.5,
      wastagePercent: 8,
      unitPriceNaira: price(9800),
      procurementPhase: 6,
    },
    {
      code: 'H-05',
      stage: 'STAGE-H',
      stageTitle: 'Stage H: Flooring',
      material: 'Washed Sharp Sand — 40mm Floor Screed Bed',
      specification: 'Clean sharp sand for 105.08 m² floor screed bed',
      unit: 'm³',
      practicalUnitNote: '6.0 m³ (~0.4 Tipper Truckload)',
      dimensionsUsed: '4.20 m³ wet screed × 1.25 dry sand factor',
      calculationMethod: 'Screed volume × 1.25',
      formula: '4.20 m³ × 1.25 = 5.25 m³ net',
      netQuantity: 5.3,
      wastagePercent: 13,
      unitPriceNaira: price(14500),
      procurementPhase: 6,
    },
    {
      code: 'H-06',
      stage: 'STAGE-H',
      stageTitle: 'Stage H: Flooring',
      material: 'Polymer-Modified Tile Adhesive (20kg Bags) & Waterproof Tile Grout',
      specification: 'High-bond cementitious tile gum for 105.08 m² floor tiles & 40.10 m² wall tiles + 15kg grout',
      unit: 'bags (20kg)',
      practicalUnitNote: '46 bags Tile Gum (20kg) + 15 bags Waterproof Grout (2kg) + PVC edge trims',
      dimensionsUsed: '145.18 m² combined floor & wall tiling area ÷ 3.5 m²/bag',
      calculationMethod: '1 bag (20kg) covers ~3.5 m² of tiles',
      formula: '145.18 m² ÷ 3.5 = 41.5 bags net',
      netQuantity: 41.5,
      wastagePercent: 11,
      unitPriceNaira: price(5200),
      procurementPhase: 6,
    },

    // =========================================================================
    // STAGE I: CEILING INSTALLATION (+3.00m SUSPENDED POP / GYPSUM & SOFFIT)
    // =========================================================================
    {
      code: 'I-01',
      stage: 'STAGE-I',
      stageTitle: 'Stage I: Ceiling Installation',
      material: '9mm Plasterboard / Gypsum Ceiling Boards (1,200×2,400mm — Standard & Moisture-Resistant)',
      specification: '28 Standard Gypsum Boards (Living/Beds/Passage) + 8 Green Moisture-Resistant Boards (Baths/Kitchen)',
      unit: 'boards (2.88m²)',
      practicalUnitNote: '36 boards (covering 94.05 m² internal ceiling area at +3.00m FFL)',
      dimensionsUsed: '94.05 m² net internal ceiling area ÷ 2.88 m² per board',
      calculationMethod: 'Net ceiling area ÷ 2.88 m² + 10% cutting wastage',
      formula: '94.05 m² ÷ 2.88 = 32.7 boards net',
      netQuantity: 32.7,
      wastagePercent: 10,
      unitPriceNaira: price(11500),
      procurementPhase: 6,
    },
    {
      code: 'I-02',
      stage: 'STAGE-I',
      stageTitle: 'Stage I: Ceiling Installation',
      material: 'POP Casting Cement (40kg Imported Bags), Sisal Fibre, Cornices & Galvanized Channels',
      specification: 'POP cement for moulded perimeter cornices (98m run), joint taping, galvanized studs & 600×600mm access hatch',
      unit: 'bags (40kg)',
      practicalUnitNote: '32 bags POP cement + 8kg fibre + 65 galvanized channels + 1 access hatch',
      dimensionsUsed: '94.05 m² internal ceiling + 98.4m perimeter cornice run',
      calculationMethod: '1 bag POP per 3.2 m² of cornice/skim & jointing',
      formula: '94.05 m² ÷ 3.2 = 29.4 bags net',
      netQuantity: 29.4,
      wastagePercent: 9,
      unitPriceNaira: price(12800),
      procurementPhase: 6,
    },
    {
      code: 'I-03',
      stage: 'STAGE-I',
      stageTitle: 'Stage I: Ceiling Installation',
      material: '3.5mm Exterior Fibre-Cement Ceiling Soffit Boards (1,200×2,400mm Nigerite / Kalsi)',
      specification: 'Weatherproof fibre-cement boards for Verandah soffit (11.10 m²) & perimeter eave overhangs (24.2 m²)',
      unit: 'boards (2.88m²)',
      practicalUnitNote: '14 boards + aluminium insect-proof eave vent strips',
      dimensionsUsed: 'Verandah (11.10 m²) + Perimeter 900mm Eaves (24.20 m²) = 35.30 m²',
      calculationMethod: '35.30 m² ÷ 2.88 m²/board + 14% cutting wastage',
      formula: '35.30 m² ÷ 2.88 = 12.3 boards net',
      netQuantity: 12.3,
      wastagePercent: 14,
      unitPriceNaira: price(10800),
      procurementPhase: 6,
    },
    {
      code: 'I-04',
      stage: 'STAGE-I',
      stageTitle: 'Stage I: Ceiling Installation',
      material: 'Brilliant White Matte Ceiling Acrylic Paint (20-Litre Drums)',
      specification: '2 coats brilliant white emulsion on 94.05 m² internal POP ceiling & 35.30 m² exterior soffit',
      unit: 'litres',
      practicalUnitNote: '50 Litres (2.5 Drums of 20-Litre Ceiling White)',
      dimensionsUsed: '129.35 m² total ceiling/soffit × 2 coats = 258.70 m² ÷ 5.8 m²/L',
      calculationMethod: '2 coats at 5.8 m²/L coverage',
      formula: '258.70 m² ÷ 5.8 = 44.6 Litres net',
      netQuantity: 44.6,
      wastagePercent: 12,
      unitPriceNaira: price(2100),
      procurementPhase: 7,
    },

    // =========================================================================
    // STAGE J: DOORS, ALUMINIUM WINDOWS & IRONMONGERY
    // =========================================================================
    {
      code: 'J-01',
      stage: 'STAGE-J',
      stageTitle: 'Stage J: Doors & Windows',
      material: 'D1: Insulated Security Steel Entrance Door (1,200×2,100mm — 1.5 Leaf)',
      specification: 'Heavy-duty armoured Turkey/Israeli style steel security door with multi-point lock, frame & threshold',
      unit: 'No.',
      practicalUnitNote: '1 Complete Door Set (Living Room Main Entrance from Verandah)',
      dimensionsUsed: '1,200mm W × 2,100mm H structural opening (Tag D1)',
      calculationMethod: 'Direct count from Door Schedule (Sheet Q-001)',
      formula: '1 No. (Tag D1)',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(385000),
      procurementPhase: 6,
    },
    {
      code: 'J-02',
      stage: 'STAGE-J',
      stageTitle: 'Stage J: Doors & Windows',
      material: 'D2 & D3: 900×2,100mm Solid Core Hardwood Panel/Flush Doors + 150mm Frames & Locksets',
      specification: '2× Bedroom Doors (D2) + 1× Half-Glazed Kitchen Door (D3) with hardwood frames, architraves, 3×100mm hinges & cylinder mortice locks',
      unit: 'No.',
      practicalUnitNote: '3 Complete Door Sets (Bed 1, Bed 2 & Kitchen)',
      dimensionsUsed: '900mm W × 2,100mm H structural openings (2× D2 + 1× D3)',
      calculationMethod: 'Direct count from Door Schedule (Sheet Q-001)',
      formula: '2 No. (D2) + 1 No. (D3) = 3 No.',
      netQuantity: 3,
      wastagePercent: 0,
      unitPriceNaira: price(145000),
      procurementPhase: 6,
    },
    {
      code: 'J-03',
      stage: 'STAGE-J',
      stageTitle: 'Stage J: Doors & Windows',
      material: 'D4 & D5: 750×2,100mm Moisture-Resistant Bathroom Doors (2× D4) & Louvred Pantry Door (1× D5)',
      specification: '2× Waterproof WPC/PVC Bathroom Doors with thumb-turn locks + 1× Ventilated Pantry Door with frame & ironmongery',
      unit: 'No.',
      practicalUnitNote: '3 Complete Door Sets (Bath 1, Bath 2 & Pantry)',
      dimensionsUsed: '750mm W × 2,100mm H structural openings (2× D4 + 1× D5)',
      calculationMethod: 'Direct count from Door Schedule (Sheet Q-001)',
      formula: '2 No. (D4) + 1 No. (D5) = 3 No.',
      netQuantity: 3,
      wastagePercent: 0,
      unitPriceNaira: price(118000),
      procurementPhase: 6,
    },
    {
      code: 'J-04',
      stage: 'STAGE-J',
      stageTitle: 'Stage J: Doors & Windows',
      material: 'W1: 1,800×1,500mm Powder-Coated Aluminium Sliding Window + Flyscreen & Security Burglar Bars',
      specification: 'Dark-bronze heavy-gauge Tower aluminium 2-track sliding window with 5mm reflective/tinted glass, net & wrought-iron protector',
      unit: 'No.',
      practicalUnitNote: '1 Complete Window Unit (Living Room Front South Wall — 2.70 m²)',
      dimensionsUsed: '1,800mm W × 1,500mm H (Sill +0.90m, Head +2.40m — Tag W1)',
      calculationMethod: 'Direct count from Window Schedule (Sheet Q-001)',
      formula: '1 No. (Tag W1)',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(245000),
      procurementPhase: 6,
    },
    {
      code: 'J-05',
      stage: 'STAGE-J',
      stageTitle: 'Stage J: Doors & Windows',
      material: 'W2: 1,200×1,500mm Powder-Coated Aluminium Windows + Flyscreens & Security Burglar Bars',
      specification: 'Dark-bronze aluminium casement/sliding windows with 5mm glass, insect mesh & burglar bars for Bedroom 1 & Bedroom 2',
      unit: 'No.',
      practicalUnitNote: '4 Complete Window Units (2 in Bedroom 1, 2 in Bedroom 2 — 7.20 m² total)',
      dimensionsUsed: '4 × (1,200mm W × 1,500mm H, Sill +0.90m, Head +2.40m — Tag W2)',
      calculationMethod: 'Direct count from Window Schedule (Sheet Q-001)',
      formula: '4 No. (Tag W2)',
      netQuantity: 4,
      wastagePercent: 0,
      unitPriceNaira: price(175000),
      procurementPhase: 6,
    },
    {
      code: 'J-06',
      stage: 'STAGE-J',
      stageTitle: 'Stage J: Doors & Windows',
      material: 'W3, W4 & W5: Kitchen Casement Window (1,200×1,200mm) & 3× High-Level Louvres (600×600mm)',
      specification: '1× W3 Kitchen casement window (1.44 m²) + 2× W4 Bathroom privacy louvres + 1× W5 Pantry louvre with burglar bars',
      unit: 'No. (combined)',
      practicalUnitNote: '4 Window Units (1× W3 Kitchen + 2× W4 Baths + 1× W5 Pantry)',
      dimensionsUsed: '1× (1200×1200mm) + 3× (600×600mm) = 2.52 m² total',
      calculationMethod: 'Direct count from Window Schedule (Tags W3, W4, W5)',
      formula: '1 No. (W3) + 2 No. (W4) + 1 No. (W5) = 4 No.',
      netQuantity: 4,
      wastagePercent: 0,
      unitPriceNaira: price(92000),
      procurementPhase: 6,
    },

    // =========================================================================
    // STAGE K: ELECTRICAL INSTALLATION (230V 50Hz SINGLE PHASE)
    // =========================================================================
    {
      code: 'K-01',
      stage: 'STAGE-K',
      stageTitle: 'Stage K: Electrical Installation',
      material: '1.5mm² Pure Copper PVC Lighting Cables (Red, Black & Green/Yellow Earth — 100m Coils)',
      specification: 'SON-certified Coleman/Cutix/Nigerchin 1.5mm² single-core copper cables for Circuits L1 & L2',
      unit: 'coils (100m)',
      practicalUnitNote: '3 Coils (300m total across 22 internal/external lighting points & switches)',
      dimensionsUsed: '22 lighting points × ~12.5m average conduit drop/loop run = 275m',
      calculationMethod: 'Total lighting circuit wire run ÷ 100m coil',
      formula: '275 m ÷ 100 m = 2.75 coils net',
      netQuantity: 2.75,
      wastagePercent: 9,
      unitPriceNaira: price(48000),
      procurementPhase: 5,
    },
    {
      code: 'K-02',
      stage: 'STAGE-K',
      stageTitle: 'Stage K: Electrical Installation',
      material: '2.5mm² Pure Copper PVC Socket Power Cables (Red, Black & Earth — 100m Coils)',
      specification: 'SON-certified 2.5mm² copper cables for 13A Socket Circuits S1, S2, S3, K1 & D1',
      unit: 'coils (100m)',
      practicalUnitNote: '4 Coils (400m total serving 22 double/dedicated 13A socket outlets)',
      dimensionsUsed: '22 power outlets across 5 circuits × ~16.5m run = 363m',
      calculationMethod: 'Total power ring/radial wire run ÷ 100m coil',
      formula: '363 m ÷ 100 m = 3.63 coils net',
      netQuantity: 3.63,
      wastagePercent: 10,
      unitPriceNaira: price(76000),
      procurementPhase: 5,
    },
    {
      code: 'K-03',
      stage: 'STAGE-K',
      stageTitle: 'Stage K: Electrical Installation',
      material: '4.0mm² AC Radial Copper Cables (2 Coils) + 16.0mm² Main Tails & Earth Cable (35m)',
      specification: 'Dedicated 4.0mm² cables for 3× 1.5HP Split ACs (AC1–AC3) + 16mm² meter/DB supply & earthing',
      unit: 'lot / coils',
      practicalUnitNote: '2 Coils of 4.0mm² (200m) + 35m of 16.0mm² main/earth copper cable',
      dimensionsUsed: 'AC1, AC2, AC3 radial runs from DB + 16mm² sub-main & earth pit run',
      calculationMethod: 'Dedicated radial lengths from Sheet E-001',
      formula: '1.0 Complete Heavy-Cable Package (AC1–AC3 + Mains)',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(315000),
      procurementPhase: 5,
    },
    {
      code: 'K-04',
      stage: 'STAGE-K',
      stageTitle: 'Stage K: Electrical Installation',
      material: '20mm & 25mm Heavy-Gauge uPVC Electrical Conduits, Knockout Boxes & Accessories',
      specification: '3 bundles (75 lengths) 20mm conduit, 1 bundle (25 lengths) 25mm conduit, 45 knockout boxes, circular boxes, couplers & bends',
      unit: 'lot (first-fix)',
      practicalUnitNote: '100 lengths uPVC conduit + 45 galvanized knockout boxes + circular boxes & gum',
      dimensionsUsed: 'All concealed wall/slab/ceiling conduit routes on Sheet E-001',
      calculationMethod: 'Complete first-fix conduit & containment take-off',
      formula: '1.0 Complete Electrical First-Fix Conduit Lot',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(185000),
      procurementPhase: 5,
    },
    {
      code: 'K-05',
      stage: 'STAGE-K',
      stageTitle: 'Stage K: Electrical Installation',
      material: '8-Way Single-Phase MCB Distribution Board (DB) with 63A 30mA RCD & Copper Earth Rod Pit',
      specification: 'Flush metal consumer unit with 63A RCD incomer, 10× MCBs + Ø16×2,400mm copper earth rod, clamp & inspection box',
      unit: 'set',
      practicalUnitNote: '1 Complete 8-Way DB Assembly + Full Copper Earthing Kit',
      dimensionsUsed: 'Main DB at Living Room entrance + Earth Pit at Front South Wall (Sheet E-001)',
      calculationMethod: 'Direct specification from Sheet E-001 & Circuit Schedule',
      formula: '1 No. DB + 1 No. Earth Pit Assembly',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(165000),
      procurementPhase: 5,
    },
    {
      code: 'K-06',
      stage: 'STAGE-K',
      stageTitle: 'Stage K: Electrical Installation',
      material: 'Electrical Switches, 13A Double Sockets, 20A AC Isolators, LED Luminaires & Extractor Fans',
      specification: '18× LED ceiling lights, 1× dining pendant, 4× security lights, 2× bath extractor fans, 19× double 13A sockets, 1× IP66 socket, 3× 20A AC switches, 12× wall switches, 1× TV outlet',
      unit: 'set (second-fix)',
      practicalUnitNote: '61 Second-Fix Electrical Fittings & Luminaires (as itemized on Sheet E-001)',
      dimensionsUsed: 'Exact fixture count from Sheet E-001 Electrical Layout',
      calculationMethod: 'Direct fixture enumeration (23 lights + 2 fans + 20 sockets + 3 AC + 13 switches/TV)',
      formula: '18 + 1 + 4 + 2 + 19 + 1 + 3 + 12 + 1 = 61 Fittings',
      netQuantity: 61,
      wastagePercent: 3,
      unitPriceNaira: price(6800),
      procurementPhase: 7,
    },

    // =========================================================================
    // STAGE L: PLUMBING, WATER SUPPLY & SANITARY INSTALLATION
    // =========================================================================
    {
      code: 'L-01',
      stage: 'STAGE-L',
      stageTitle: 'Stage L: Plumbing & Sanitary',
      material: 'PPR PN20 / High-Pressure uPVC Cold & Hot Water Supply Pipes, Valves & Fittings',
      specification: '32mm main (18m), 25mm ceiling branch (24m), 20mm fixture drops (32m), stopcocks, gate valves, elbows, tees & unions',
      unit: 'lot (first-fix)',
      practicalUnitNote: '20 lengths (4m) PPR/uPVC pressure pipe + brass gate valves + fittings',
      dimensionsUsed: 'Cold water main from Tank T to Bath 1, Bath 2 & 25mm ceiling branch to Kitchen Sink (Sheet P-001)',
      calculationMethod: 'Measured pipe runs from Sheet P-001 + 12% fitting allowance',
      formula: '18 m (32mm) + 24 m (25mm) + 32 m (20mm) = 74 m total',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(210000),
      procurementPhase: 5,
    },
    {
      code: 'L-02',
      stage: 'STAGE-L',
      stageTitle: 'Stage L: Plumbing & Sanitary',
      material: '100mm Soil, 75mm Floor Drain & 50mm Waste uPVC Drainage Pipes & Fittings',
      specification: '8 lengths Ø100mm heavy-duty soil pipe, 5 lengths Ø75mm pipe, 8 lengths Ø50mm waste pipe, bends, Y-tees, vent cowls & 4× stainless floor traps',
      unit: 'lengths (3.6m)',
      practicalUnitNote: '21 lengths (3.6m) uPVC drainage pipes + bends, traps, vent cowls & Tangit gum',
      dimensionsUsed: 'WC soil lines to IC1/Septic Tank + Bath/Kitchen waste lines to IC2/IC3/Soakaway (Sheet P-001)',
      calculationMethod: '76m total drainage pipe run ÷ 3.6m standard length',
      formula: '8 (100mm) + 5 (75mm) + 8 (50mm) = 21 lengths',
      netQuantity: 21,
      wastagePercent: 10,
      unitPriceNaira: price(11500),
      procurementPhase: 5,
    },
    {
      code: 'L-03',
      stage: 'STAGE-L',
      stageTitle: 'Stage L: Plumbing & Sanitary',
      material: 'Sanitary Ware: 2× Close-Coupled WCs, 2× Pedestal Wash Basins, 2× Showers & 1× Kitchen Sink',
      specification: '2× Dual-flush vitreous china WCs, 2× pedestal basins + chrome mixers + mirrors, 2× shower columns + trays/screens, 1× stainless kitchen sink + mixer tap + angle valves',
      unit: 'fixtures',
      practicalUnitNote: '7 Complete Sanitary Fixture Sets (Bath 1, Bath 2 & Kitchen)',
      dimensionsUsed: 'WC1, WC2, WB1, WB2, SH1, SH2 & Kitchen SINK on Sheet P-001',
      calculationMethod: 'Direct count from Plumbing Layout (Sheet P-001)',
      formula: '2 WCs + 2 Basins + 2 Showers + 1 Kitchen Sink = 7 Sets',
      netQuantity: 7,
      wastagePercent: 0,
      unitPriceNaira: price(135000),
      procurementPhase: 7,
    },
    {
      code: 'L-04',
      stage: 'STAGE-L',
      stageTitle: 'Stage L: Plumbing & Sanitary',
      material: '1,000-Litre Overhead PVC Water Tank on 3.0m Galvanized Steel Tower + 0.75HP Booster Pump',
      specification: 'Double-layer UV-stabilized 1,000L polyethylene tank + fabricated 3.0m angle-iron tower on concrete pads + 0.75HP pump & float switch',
      unit: 'complete set',
      practicalUnitNote: '1× 1,000L Tank + 3.0m Steel Stanchion Tower + 0.75HP Pump & Automatic Float Switch',
      dimensionsUsed: 'Overhead Water Storage Station (T) on Sheet P-001',
      calculationMethod: 'Complete domestic water storage & pressurization package',
      formula: '1 No. Tank + 1 No. 3.0m Tower + 1 No. 0.75HP Pump',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(580000),
      procurementPhase: 7,
    },

    // =========================================================================
    // STAGE M: EXTERNAL WORKS, SEPTIC TANK, SOAKAWAY & PAVING
    // =========================================================================
    {
      code: 'M-01',
      stage: 'STAGE-M',
      stageTitle: 'Stage M: External Works',
      material: '6,000L 2-Chamber Septic Tank (3.0×1.5×1.8m) & Ø1.5m×3.0m Soakaway Pit + 3× Manholes (IC1–IC3)',
      specification: 'Includes 17.3 m³ excavation, 490× 9-inch solid blocks, 22 bags cement, 3.5 m³ sand/granite, Y10 cover slab rebar & precast inspection covers',
      unit: 'complete lot',
      practicalUnitNote: '490× 9" blocks + 22 bags cement + 12 lengths Y10 rebar + 5 precast covers',
      dimensionsUsed: 'Septic Tank (3000×1500×1800mm) + Soakaway (Ø1500×3000mm) + IC1, IC2, IC3 (600×600mm)',
      calculationMethod: 'Complete sanitary sewage treatment & soakaway substructure package',
      formula: '1.0 Complete Septic Tank, Soakaway & 3 Manholes Package',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(890000),
      procurementPhase: 7,
    },
    {
      code: 'M-02',
      stage: 'STAGE-M',
      stageTitle: 'Stage M: External Works',
      material: 'Perimeter Concrete Apron & Paved Walkways (600mm Wide Around Building + Front Path)',
      specification: '36.5 m² of 100mm mass concrete / interlocking paving apron around building plinth (incl. 18 bags cement, sand & granite)',
      unit: 'm²',
      practicalUnitNote: '36.5 m² paved apron (requires 18 bags cement + 2.5 m³ sand + 3.2 m³ granite)',
      dimensionsUsed: '46.0m perimeter × 0.60m apron width + 9.0 m² front entrance path = 36.6 m²',
      calculationMethod: 'Perimeter apron area + entrance walkway',
      formula: '(46.0 m × 0.60 m) + 9.0 m² = 36.6 m²',
      netQuantity: 36.6,
      wastagePercent: 5,
      unitPriceNaira: price(11500),
      procurementPhase: 7,
    },

    // =========================================================================
    // STAGE N: FINAL FINISHING, CABINETRY & HANDOVER
    // =========================================================================
    {
      code: 'N-01',
      stage: 'STAGE-N',
      stageTitle: 'Stage N: Final Finishing & Handover',
      material: 'Kitchen L-Shaped Base & Wall Cabinets + Polished Granite Worktop (3.60m Run)',
      specification: 'Moisture-resistant MDF/HDF kitchen cabinetry with soft-close hinges, handles & 20mm black galaxy granite worktop slab',
      unit: 'm (linear)',
      practicalUnitNote: '3.60m L-shaped Kitchen Worktop & Overhead Cupboard Unit',
      dimensionsUsed: 'South & East Kitchen worktop walls (2.10m + 1.50m = 3.60m)',
      calculationMethod: 'Linear run of fitted kitchen cabinetry from Sheet A-001',
      formula: '2.10 m + 1.50 m = 3.60 m',
      netQuantity: 3.6,
      wastagePercent: 0,
      unitPriceNaira: price(185000),
      procurementPhase: 7,
    },
    {
      code: 'N-02',
      stage: 'STAGE-N',
      stageTitle: 'Stage N: Final Finishing & Handover',
      material: 'Bedroom 1 & Bedroom 2 Built-In Wardrobes (2× 1,800×600×2,400mm) & Pantry Shelving',
      specification: '2× 2-door laminated MDF wardrobes + 4-tier heavy-duty Pantry storage shelving (1.80m wide)',
      unit: 'set',
      practicalUnitNote: '2× Built-in Bedroom Wardrobes + 4-Tier Walk-in Pantry Shelving Rack',
      dimensionsUsed: 'Bedroom 1, Bedroom 2 & Walk-in Pantry RM-10',
      calculationMethod: 'Direct joinery count from architectural layout',
      formula: '2 Wardrobes + 1 Pantry Shelving System = 1 Complete Set',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(620000),
      procurementPhase: 7,
    },
    {
      code: 'N-03',
      stage: 'STAGE-N',
      stageTitle: 'Stage N: Final Finishing & Handover',
      material: 'Bathroom Accessories, Silicone Sealants, Door Stops & Post-Construction Cleaning',
      specification: '2× towel rails, 2× soap dishes, 2× toilet roll holders, 2× robe hooks, 8 tubes acetoxy silicone sealant, 7 door stops & site handover cleaning',
      unit: 'lot',
      practicalUnitNote: 'Complete Final Fittings, Sealants & Handover Detailing Pack',
      dimensionsUsed: 'All 11 spaces across 2-Bedroom Boys’ Quarters',
      calculationMethod: 'Final snagging, accessories & handover allowance',
      formula: '1.0 Complete Final Accessories & Handover Lot',
      netQuantity: 1,
      wastagePercent: 0,
      unitPriceNaira: price(165000),
      procurementPhase: 7,
    },
  ];

  // Finalize line-item calculations
  const items: MaterialTakeOffItem[] = rawItems.map((raw, idx) => {
    const wastageQuantity = Number(((raw.netQuantity * raw.wastagePercent) / 100).toFixed(2));
    const finalQuantity =
      raw.wastagePercent === 0
        ? raw.netQuantity
        : Math.ceil(raw.netQuantity + wastageQuantity);
    const totalMaterialCostNaira = Math.round(finalQuantity * raw.unitPriceNaira);

    return {
      ...raw,
      sn: idx + 1,
      wastageQuantity,
      finalQuantity,
      totalMaterialCostNaira,
    };
  });

  // Compute Stage 6: 7-Phase Staged Procurement Schedule
  const totalMaterialCostNaira = items.reduce((s, i) => s + i.totalMaterialCostNaira, 0);

  const phaseMeta: {
    phaseNumber: 1 | 2 | 3 | 4 | 5 | 6 | 7;
    phaseTitle: string;
    timelineWeeks: string;
    whenToPurchase: string;
    storageAndHandlingRule: string;
  }[] = [
    {
      phaseNumber: 1,
      phaseTitle: 'Phase 1: Pre-Construction, Site Clearing & Setting-Out',
      timelineWeeks: 'Week 1',
      whenToPurchase: '3–5 days before site mobilization and trench excavation.',
      storageAndHandlingRule:
        'Keep anti-termite chemical locked in shaded store; stack hardwood profile planks flat on bearers.',
    },
    {
      phaseNumber: 2,
      phaseTitle: 'Phase 2: Foundation, Substructure & Ground Floor Oversite Slab',
      timelineWeeks: 'Weeks 2–4',
      whenToPurchase: 'Order aggregates & foundation blocks upon completion of trench excavation; buy cement in 2 tranches (footing pour, then oversite slab pour).',
      storageAndHandlingRule:
        'NEVER store cement for more than 3 weeks in humid Nigerian weather; stack 50kg bags on raised timber pallets under waterproof tarpaulin, max 10 bags high.',
    },
    {
      phaseNumber: 3,
      phaseTitle: 'Phase 3: Superstructure Blockwork, Columns, Lintels & Ring Beam',
      timelineWeeks: 'Weeks 5–7',
      whenToPurchase: 'After oversite slab cures for minimum 7 days. Deliver 9-inch and 6-inch blocks in 2 batches to avoid site congestion and breakage.',
      storageAndHandlingRule:
        'Cure vibrated sandcrete blocks with water for 7 days before laying; keep Y12/R8 rebar off wet ground on timber dunnage to prevent scaling rust.',
    },
    {
      phaseNumber: 4,
      phaseTitle: 'Phase 4: 12° Split-Level Roofing Carcass, Standing-Seam Sheets & Gutters',
      timelineWeeks: 'Weeks 8–9',
      whenToPurchase: 'Measure exact roof span on site after ring beam & split-level gables are cast before cutting long-span 0.55mm aluminium sheets at factory.',
      storageAndHandlingRule:
        'Treat all hardwood rafters/purlins with Solignum 48 hours before erection; store colour-coated aluminium sheets indoors on dry battens.',
    },
    {
      phaseNumber: 5,
      phaseTitle: 'Phase 5: Electrical & Plumbing First-Fix Rough-In (Piping & Conduits)',
      timelineWeeks: 'Weeks 9–10',
      whenToPurchase: 'Immediately after roof covering is watertight and before wall plastering commences.',
      storageAndHandlingRule:
        'Verify SON/NIS certification holograms on Coleman/Cutix copper cable coils; pressure-test all concealed PPR/uPVC water pipes before plastering.',
    },
    {
      phaseNumber: 6,
      phaseTitle: 'Phase 6: Plastering, Ceiling, Screeding, Tiling, Doors & Windows',
      timelineWeeks: 'Weeks 11–14',
      whenToPurchase: 'Purchase plastering cement/sand first; order all porcelain/ceramic tile cartons from the SAME production batch/shade code to prevent colour mismatch.',
      storageAndHandlingRule:
        'Store POP bags, gypsum boards, and timber doors inside the roofed, lockable building shell away from rain splash.',
    },
    {
      phaseNumber: 7,
      phaseTitle: 'Phase 7: Second-Fix MEP, Sanitary Ware, Cabinetry, Painting & Handover',
      timelineWeeks: 'Weeks 15–16',
      whenToPurchase: 'Purchase sanitary ware, electrical switches/sockets, kitchen cabinets, overhead tank/pump, and final paint drums ONLY when tiling and ceiling works are 95% complete.',
      storageAndHandlingRule:
        'Prevents theft, breakage, and cement-stain damage to fragile vitreous china WCs, glass shower screens, and chrome mixers.',
    },
  ];

  const procurementSchedule: ProcurementStageBundle[] = phaseMeta.map((pm) => {
    const phaseItems = items.filter((i) => i.procurementPhase === pm.phaseNumber);
    const subtotalMaterialNaira = phaseItems.reduce((s, i) => s + i.totalMaterialCostNaira, 0);
    const shareOfMaterialBudgetPercent = Number(
      ((subtotalMaterialNaira / totalMaterialCostNaira) * 100).toFixed(1)
    );
    return {
      ...pm,
      items: phaseItems,
      subtotalMaterialNaira,
      shareOfMaterialBudgetPercent,
    };
  });

  // Compute Stage 7: Master Project Summary
  const getFinalQty = (code: string) =>
    items.find((i) => i.code === code)?.finalQuantity ?? 0;

  const blindingAndFoundationBags = getFinalQty('B-01') + getFinalQty('B-02');
  const oversiteSlabBags = getFinalQty('C-04');
  const blockworkAndMortarBags = getFinalQty('B-03') + getFinalQty('D-03');
  const structuralColumnsAndBeamsBags = getFinalQty('E-01');
  const plasteringBags = getFinalQty('G-01');
  const floorScreedBags = getFinalQty('H-04');
  const externalAndSepticBags = 22 + 18; // Included inside M-01 (22 bags) & M-02 (18 bags)

  const totalCementBags50kg =
    blindingAndFoundationBags +
    oversiteSlabBags +
    blockworkAndMortarBags +
    structuralColumnsAndBeamsBags +
    plasteringBags +
    floorScreedBags +
    externalAndSepticBags;

  const totalBlocks9Inch = getFinalQty('B-06') + getFinalQty('D-01') + 490; // +490 in M-01 Septic/Soakaway
  const totalBlocks6Inch = getFinalQty('D-02');
  const totalBlocksCombined = totalBlocks9Inch + totalBlocks6Inch;

  const totalSharpSandM3 = Number(
    (
      getFinalQty('B-04') +
      getFinalQty('C-05') +
      getFinalQty('D-04') +
      getFinalQty('H-05') +
      4.5
    ).toFixed(1)
  );
  const totalSharpSandTrucks20T = Number((totalSharpSandM3 / 15).toFixed(1));

  const totalPlasterSandM3 = Number(getFinalQty('G-02').toFixed(1));
  const totalPlasterSandTrucks20T = Number((totalPlasterSandM3 / 15).toFixed(1));

  const totalGraniteM3 = Number(
    (getFinalQty('B-05') + getFinalQty('C-06') + 5.5 + 3.2).toFixed(1)
  );
  const totalGraniteTrucks30T = Number((totalGraniteM3 / 18).toFixed(1));

  const totalLateriteM3 = getFinalQty('A-05');
  const totalLateriteTrucks20T = Number((totalLateriteM3 / 15).toFixed(1));

  const rebarY12Lengths12m = y12SubstructureLengths + y12SuperstructureLengths;
  const rebarY12Kg = Math.round(
    y12Rows.reduce((s, r) => s + r.finalWeightKg, 0)
  );
  const rebarY10Lengths12m = y10SlabLengths + 12; // +12 lengths for Septic tank slab
  const rebarY10Kg = Math.round(
    y10Rows.reduce((s, r) => s + r.finalWeightKg, 0) + 12 * 7.4
  );
  const rebarR8Lengths12m = r8StirrupLengths;
  const rebarR8Kg = Math.round(
    r8Rows.reduce((s, r) => s + r.finalWeightKg, 0)
  );
  const totalRebarKg = rebarY12Kg + rebarY10Kg + rebarR8Kg;

  const totalRoofingSheetsSqm = getFinalQty('F-01');
  const totalRoofingPanelsCount = 28; // 14 North panels (6.5m) + 14 South panels (6.4m) @ 1.0m effective width

  const totalFloorTilesSqm =
    getFinalQty('H-01') + getFinalQty('H-02') + getFinalQty('H-03');
  const totalFloorTilesCartons =
    porcelainCartons + bathFloorCartons + verandahFloorRoom.cartonsToPurchase;

  const totalWallTilesSqm = getFinalQty('G-03');
  const totalWallTilesCartons = Math.ceil(totalWallTilesSqm / 1.5);

  const totalPaintLitres =
    getFinalQty('G-05') +
    getFinalQty('G-06') +
    getFinalQty('G-07') +
    getFinalQty('I-04');
  const totalPaintBuckets20L = Math.ceil(totalPaintLitres / 20);

  const totalDoorsCount = OPENING_SCHEDULES.filter((o) => o.category === 'door').reduce(
    (s, o) => s + o.qty,
    0
  );
  const totalWindowsCount = OPENING_SCHEDULES.filter((o) => o.category === 'window').reduce(
    (s, o) => s + o.qty,
    0
  );

  // Stage 5: Comprehensive Nigerian Project Cost Breakdown
  // Direct Trades Labour (Masons, Carpenters, Ironbenders, Roofers, Tilers, POP, Plumbers, Electricians, Painters): ~28% of Material Cost
  const estimatedLabourCostNaira = Math.round(totalMaterialCostNaira * 0.28);
  // Equipment & Plant Hire (Concrete mixer hire, poker vibrator, plate compactor, scaffolding, water bowser): ~4.5%
  const equipmentAndPlantCostNaira = Math.round(totalMaterialCostNaira * 0.045);
  // Material Haulage, Tipper Transport & Offloading to Site: ~5.5%
  const transportationCostNaira = Math.round(totalMaterialCostNaira * 0.055);

  const directConstructionSubtotal =
    totalMaterialCostNaira +
    estimatedLabourCostNaira +
    equipmentAndPlantCostNaira +
    transportationCostNaira;

  // Contractor Overheads, Site Supervision & Preliminaries (8%)
  const contractorOverheadsNaira = Math.round(directConstructionSubtotal * 0.08);
  // Price Fluctuation & Physical Contingency Allowance (5%)
  const contingencyAllowanceNaira = Math.round(directConstructionSubtotal * 0.05);

  const grandTotalProjectCostNaira =
    directConstructionSubtotal +
    contractorOverheadsNaira +
    contingencyAllowanceNaira;

  return {
    region,
    regionLabel: regSpec.label,
    priceBenchmarkNote: regSpec.note,
    items,
    rebarSchedule,
    roomFlooringSchedule,
    procurementSchedule,
    summary: {
      totalCementBags50kg,
      cementBreakdown: {
        blindingAndFoundationBags,
        oversiteSlabBags,
        blockworkAndMortarBags,
        structuralColumnsAndBeamsBags,
        plasteringBags,
        floorScreedBags,
        externalAndSepticBags,
      },
      totalBlocks9Inch,
      totalBlocks6Inch,
      totalBlocksCombined,
      totalSharpSandM3,
      totalSharpSandTrucks20T,
      totalPlasterSandM3,
      totalPlasterSandTrucks20T,
      totalGraniteM3,
      totalGraniteTrucks30T,
      totalLateriteM3,
      totalLateriteTrucks20T,
      rebarY12Kg,
      rebarY12Lengths12m,
      rebarY10Kg,
      rebarY10Lengths12m,
      rebarR8Kg,
      rebarR8Lengths12m,
      totalRebarKg,
      totalBindingWireKg: getFinalQty('E-05'),
      totalRoofingSheetsSqm,
      totalRoofingPanelsCount,
      totalFloorTilesSqm,
      totalFloorTilesCartons,
      totalWallTilesSqm,
      totalWallTilesCartons,
      totalPaintLitres,
      totalPaintBuckets20L,
      totalDoorsCount,
      totalWindowsCount,
      totalMaterialCostNaira,
      estimatedLabourCostNaira,
      equipmentAndPlantCostNaira,
      transportationCostNaira,
      contractorOverheadsNaira,
      contingencyAllowanceNaira,
      grandTotalProjectCostNaira,
    },
  };
}
