import test from 'node:test';
import assert from 'node:assert/strict';
import {
  BUILDING_CONSTANTS,
  DIMENSION_CHAINS,
  ROOM_SCHEDULES,
  OPENING_SCHEDULES,
  sumDimensionChain,
  formatDim,
  formatLevel,
  calculateSettingOutDiagonals,
  calculateSiteBOQ,
} from './architecturalMath';

test('All horizontal dimension chains sum to exact 12,000 mm building width', () => {
  assert.equal(
    sumDimensionChain(DIMENSION_CHAINS.northMasonryOpenings),
    BUILDING_CONSTANTS.overallWidthMm
  );
  assert.equal(
    sumDimensionChain(DIMENSION_CHAINS.northInternalAndWalls),
    BUILDING_CONSTANTS.overallWidthMm
  );
  assert.equal(
    sumDimensionChain(DIMENSION_CHAINS.northStructuralGrid),
    BUILDING_CONSTANTS.overallWidthMm
  );
  assert.equal(
    sumDimensionChain(DIMENSION_CHAINS.southMasonryOpenings),
    BUILDING_CONSTANTS.overallWidthMm
  );
  assert.equal(
    sumDimensionChain(DIMENSION_CHAINS.southInternalAndWalls),
    BUILDING_CONSTANTS.overallWidthMm
  );
});

test('All vertical dimension chains sum to exact 11,000 mm overall or 9,150 mm main block depth', () => {
  assert.equal(
    sumDimensionChain(DIMENSION_CHAINS.westMasonryOpenings),
    BUILDING_CONSTANTS.overallDepthMm
  );
  assert.equal(
    sumDimensionChain(DIMENSION_CHAINS.westInternalAndWalls),
    BUILDING_CONSTANTS.overallDepthMm
  );
  assert.equal(
    sumDimensionChain(DIMENSION_CHAINS.eastMasonryOpenings),
    BUILDING_CONSTANTS.mainBlockDepthMm
  );
  assert.equal(
    sumDimensionChain(DIMENSION_CHAINS.eastInternalAndWalls),
    BUILDING_CONSTANTS.mainBlockDepthMm
  );
});

test('Unit formatting converts accurately between mm and m', () => {
  assert.equal(formatDim(12000, 'mm'), '12,000');
  assert.equal(formatDim(12000, 'mm', true), '12,000 mm');
  assert.equal(formatDim(12000, 'm'), '12.00');
  assert.equal(formatDim(9150, 'm', true), '9.15 m');
  assert.equal(formatDim(225, 'm'), '0.225');
  assert.equal(formatLevel(4.94), '+4.94');
  assert.equal(formatLevel(0), '±0.000');
  assert.equal(formatLevel(-1.2), '-1.20');
});

test('Setting-out diagonals match Pythagorean theorem for site squaring', () => {
  const diags = calculateSettingOutDiagonals();
  // sqrt(12000^2 + 9150^2) = 15090.477... -> 15090
  assert.equal(diags.mainBlockDiagonalMm, 15090);
  // sqrt(12000^2 + 11000^2) = 16278.82... -> 16279
  assert.equal(diags.overallEnvelopeDiagonalMm, 16279);
  // sqrt(3600^2 + 3600^2) = 5091.168... -> 5091
  assert.equal(diags.bedroomInternalDiagonalMm, 5091);
});

test('Room and opening schedules match PDF specifications and lintel bearing math', () => {
  assert.equal(ROOM_SCHEDULES.length, 11);
  const bed1 = ROOM_SCHEDULES.find((r) => r.id === 'bed-1');
  assert.ok(bed1);
  assert.equal(bed1.areaSqm, 12.96);

  // Check lintel length = opening width + 450mm (225mm bearing each side)
  for (const op of OPENING_SCHEDULES) {
    assert.equal(op.lintelLengthMm, op.widthMm + 450);
  }
});

test('Dynamic BOQ recalculates roof area, pad count, and rebar when site options toggle', () => {
  const boqWithColC4 = calculateSiteBOQ({
    eastOverhangMode: 'add-column-c4',
    foundationConcreteGrade: 'C25/30-reinforced',
    dpcDatumMode: '0.000-FFL',
    includeRingBeam: true,
  });

  const boqWithCutBack = calculateSiteBOQ({
    eastOverhangMode: 'cut-back-eave',
    foundationConcreteGrade: '1:3:6-mass-concrete',
    dpcDatumMode: '+0.150-raised',
    includeRingBeam: false,
  });

  const roofFull = boqWithColC4.find((i) => i.id === 'boq-8')!.quantity;
  const roofCut = boqWithCutBack.find((i) => i.id === 'boq-8')!.quantity;
  assert.ok(roofFull > roofCut);

  const rebarFull = boqWithColC4.find((i) => i.id === 'boq-4')!.quantity;
  const rebarLight = boqWithCutBack.find((i) => i.id === 'boq-4')!.quantity;
  assert.ok(rebarFull > rebarLight);
});

test('WhatsApp summary generator includes site dimensions, squaring diagonals, and share URL', async () => {
  const { generateWhatsAppSummaryText } = await import('./architecturalMath');
  const text = generateWhatsAppSummaryText(
    {
      eastOverhangMode: 'add-column-c4',
      foundationConcreteGrade: 'C25/30-reinforced',
      dpcDatumMode: '0.000-FFL',
      includeRingBeam: true,
    },
    'mm',
    'https://example.com/bq-drawings'
  );
  assert.ok(text.includes('12,000 × 11,000 mm'));
  assert.ok(text.includes('15,090 mm'));
  assert.ok(text.includes('https://example.com/bq-drawings'));
});

test('3D roof elevation math matches 12-degree split-level roof (+3.20m rear eave to +4.54m spine ridge, +4.12m step-ridge to +2.80m front eave)', async () => {
  const {
    getRoofElevationAtZ,
    getNorthRoofElevationAtZ,
    getSouthRoofElevationAtZ,
  } = await import('./building3DGeometry');
  assert.equal(getNorthRoofElevationAtZ(-0.9), 3.2);
  assert.equal(getNorthRoofElevationAtZ(5.4), 4.54);
  assert.equal(getSouthRoofElevationAtZ(5.25), 4.12);
  assert.equal(getSouthRoofElevationAtZ(11.45), 2.8);
  assert.equal(getRoofElevationAtZ(-0.9), 3.2);
  assert.equal(getRoofElevationAtZ(11.45), 2.8);
  // Central spine ridge (z=5.25m) is higher than both rear eave and front eave
  assert.ok(getRoofElevationAtZ(5.25) > getRoofElevationAtZ(-0.9));
  assert.ok(getRoofElevationAtZ(5.25) > getRoofElevationAtZ(11.45));
});

test('3D wall generator splits walls accurately around all 17 doors, windows, and portals', async () => {
  const { generateWallSegments3D, WALL_OPENINGS_3D } = await import('./building3DGeometry');
  const segments = generateWallSegments3D();
  assert.equal(WALL_OPENINGS_3D.length, 17);
  assert.ok(segments.length >= 40);

  // Every window (sillM > 0) must produce a corresponding sill segment
  const windows = WALL_OPENINGS_3D.filter((o) => o.kind === 'window');
  for (const win of windows) {
    const sillSeg = segments.find((s) => s.id === `${win.wallId}-sill-${win.id}`);
    assert.ok(sillSeg, `Missing sill segment for window ${win.id}`);
    assert.equal(sillSeg.maxY, win.sillM);
  }

  // Every door/window/portal must produce a lintel/header segment above headM
  for (const op of WALL_OPENINGS_3D) {
    const headerSeg = segments.find((s) => s.id === `${op.wallId}-header-${op.id}`);
    assert.ok(headerSeg, `Missing lintel header segment for opening ${op.id}`);
    assert.equal(headerSeg.minY, op.headM);
  }
});

test('3D room coordinate lookup and first-person walkthrough collision work accurately', async () => {
  const { findRoomAtPoint3D, isWalkthroughPositionValid } = await import('./building3DGeometry');

  // Bedroom 1 center (x=2.0m, z=2.0m)
  const bed1 = findRoomAtPoint3D(2.0, 2.0);
  assert.ok(bed1);
  assert.equal(bed1.id, 'bed-1');

  // Pantry nested inside NE corner of Kitchen bay (x=10.8m, z=6.0m)
  const pantry = findRoomAtPoint3D(10.8, 6.0);
  assert.ok(pantry);
  assert.equal(pantry.id, 'pantry');

  // Kitchen south of Pantry (x=10.5m, z=7.8m)
  const kitchen = findRoomAtPoint3D(10.5, 7.8);
  assert.ok(kitchen);
  assert.equal(kitchen.id, 'kitchen');

  // Walkthrough collision: center of Main Entrance Door D1 (x=5.025m, z=9.0375m) is open/valid
  assert.equal(isWalkthroughPositionValid(5.025, 9.0375, 0.15), true);
  // Walkthrough collision: solid South masonry pier (x=0.8m, z=9.0375m) is blocked
  assert.equal(isWalkthroughPositionValid(0.8, 9.0375, 0.15), false);
});

test('Complete 14-Stage (A to N) Quantity Surveyor Report & Material Take-Off math is consistent and non-double-counted', async () => {
  const {
    generateCompleteQSReport,
    calculateRebarSchedule,
    calculateRoomFlooringSchedule,
    CONSTRUCTION_STAGES,
  } = await import('./quantitySurveyorMath');

  const configFull = {
    eastOverhangMode: 'add-column-c4' as const,
    foundationConcreteGrade: 'C25/30-reinforced' as const,
    dpcDatumMode: '0.000-FFL' as const,
    includeRingBeam: true,
  };

  const report = generateCompleteQSReport(configFull, 'lagos-sw');

  // All 14 construction stages (A through N) are present and populated
  assert.equal(CONSTRUCTION_STAGES.length, 14);
  for (const st of CONSTRUCTION_STAGES) {
    const stageItems = report.items.filter((i) => i.stage === st.code);
    assert.ok(stageItems.length > 0, `Stage ${st.code} has no take-off items`);
  }

  // Verify room flooring schedule deducts Pantry enclosure (2.70m² + 0.45m² wall) from Kitchen open floor (10.80m² -> 7.65m²)
  const roomFloors = calculateRoomFlooringSchedule();
  const kitchenFloor = roomFloors.find((r) => r.roomCode === 'RM-09');
  const pantryFloor = roomFloors.find((r) => r.roomCode === 'RM-10');
  assert.ok(kitchenFloor && pantryFloor);
  assert.equal(kitchenFloor.netFloorAreaSqm, 7.65);
  assert.equal(pantryFloor.netFloorAreaSqm, 2.7);

  // Verify Rebar Schedule produces Y12, Y10, and R8 bars
  const rebarRows = calculateRebarSchedule(configFull);
  assert.ok(rebarRows.some((r) => r.diameterMm === 12));
  assert.ok(rebarRows.some((r) => r.diameterMm === 10));
  assert.ok(rebarRows.some((r) => r.diameterMm === 8));

  // Verify 7-Phase Procurement Schedule sums to 100% of material budget
  assert.equal(report.procurementSchedule.length, 7);
  const sumPhaseBudgets = report.procurementSchedule.reduce(
    (s, p) => s + p.subtotalMaterialNaira,
    0
  );
  assert.equal(sumPhaseBudgets, report.summary.totalMaterialCostNaira);

  // Verify regional benchmark multiplier increases Abuja & PH totals over Lagos base
  const abujaReport = generateCompleteQSReport(configFull, 'abuja-nc');
  assert.ok(
    abujaReport.summary.grandTotalProjectCostNaira >
      report.summary.grandTotalProjectCostNaira
  );
});


