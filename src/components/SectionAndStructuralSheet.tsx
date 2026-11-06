import React from 'react';
import { UnitMode, SiteResolutionConfig, formatDim } from '../utils/architecturalMath';
import {
  DimLineH,
  DimLineV,
  LevelDatum,
  DrawingTitleBlock,
} from './CadPrimitives';

interface SectionSheetProps {
  unit: UnitMode;
  config: SiteResolutionConfig;
}

export const SectionBSheet: React.FC<SectionSheetProps> = ({ unit, config }) => {
  // Scale: 1m = 62px => 11.00m footprint = 682px
  // Let Rear Wall external face (y=0 in plan) start at X = 155
  // Let FFL (±0.000) sit at Y = 415
  // Then for the 12° Split-Level Clerestory Roof:
  // +4.54m Upper Spine Ridge -> Y = 415 - 4.54*62 = 133.5
  // +4.12m Lower Step-Ridge  -> Y = 415 - 4.12*62 = 159.6
  // +3.20m Rear Low Eave     -> Y = 415 - 3.20*62 = 216.6
  // +3.00m Suspended Ceiling -> Y = 415 - 3.00*62 = 229.0
  // +2.80m Front Low Eave    -> Y = 415 - 2.80*62 = 241.4
  // +2.10m Lintel            -> Y = 415 - 2.10*62 = 284.8
  // ±0.00m FFL               -> Y = 415.0
  // -0.15m GL                -> Y = 415 + 0.15*62 = 424.3
  // -1.20m Found Base        -> Y = 415 + 1.20*62 = 489.4
  const S = 0.062;
  const sx = (mmFromRear: number) => 155 + mmFromRear * S;
  const sLen = (mm: number) => mm * S;

  const yUpperRidge = 133.5;
  const yLowerRidge = 159.6;
  const yRearEave = 216.6;
  const yCeiling = 229.0;
  const yFrontEave = 241.4;
  const yLintel = 284.8;
  const yFFL = 415.0;
  const ySlabBottom = 415.0 + 150 * S; // 424.3 (coincides with -0.15m GL)
  const yFoundTop = 489.4 - 225 * S; // 475.45
  const yFoundBase = 489.4;

  // Wall positions in mm from Rear External Face (0):
  // W1: Rear Ext Wall (0..225) -> rises to underside of North Wing 12° rafter (+3.39m -> y=205)
  // W2: Passage North Wall (3825..3975) -> rises to +3.00m ceiling (y=229)
  // W3: Passage South Spine Wall (5175..5325) -> rises to support 12° Split-Level Spine Ridge (+4.45m -> y=139)
  // W4: Front Ext Wall (8925..9150) -> rises to underside of South Wing 12° rafter (+3.32m -> y=209)
  const walls = [
    { label: 'REAR EXT WALL (225)', startMm: 0, thickMm: 225, topY: 205 },
    { label: 'PASSAGE N. WALL (150)', startMm: 3825, thickMm: 150, topY: yCeiling },
    { label: 'PASSAGE S. SPINE WALL (150)', startMm: 5175, thickMm: 150, topY: 139 },
    { label: 'FRONT EXT WALL (225)', startMm: 8925, thickMm: 225, topY: 209 },
  ];

  return (
    <div className="print-sheet border-2 border-slate-900 dark:border-slate-300 bg-[#FAF8F2] dark:bg-slate-950 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1060 630"
          className="w-full h-auto min-w-[800px] select-none"
          role="img"
          aria-label="A-008 Architectural and Structural Cross Section B-B at X = 1.00m Scale 1:50 with 12-degree Split-Level Roof"
        >
          <rect
            x={10}
            y={10}
            width={1040}
            height={610}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            className="text-slate-400 dark:text-slate-700"
          />

          <text
            x={25}
            y={34}
            fontSize={12}
            fontFamily="Outfit, sans-serif"
            fontWeight={700}
            className="fill-slate-900 dark:fill-slate-100"
          >
            A-008 // CROSS-SECTION B–B (AT X = 1.00 m · 12° SPLIT-LEVEL CLERESTORY ROOF) · SCALE 1:50
          </text>
          <text
            x={25}
            y={48}
            fontSize={9.5}
            fontFamily="JetBrains Mono, monospace"
            className="fill-slate-600 dark:fill-slate-400"
          >
            12° NORTH WING (+3.20m TO +4.54m) &amp; 12° SOUTH WING (+4.12m TO +2.80m) · CLEAR CEILING: 3,000mm · FOUNDATION: -1,200mm
          </text>

          {/* COMPACTED HARDCORE / SAND FILL (150mm) & 150mm RC SLAB (x=0 to 11,000mm) */}
          <rect
            x={sx(0)}
            y={ySlabBottom}
            width={sLen(11000)}
            height={sLen(150)}
            fill="#fde68a"
            fillOpacity={0.35}
            stroke="#92400e"
            strokeWidth={0.8}
          />
          <rect
            x={sx(0)}
            y={yFFL}
            width={sLen(11000)}
            height={sLen(150)}
            fill="#cbd5e1"
            stroke="#0f172a"
            strokeWidth={1.3}
          />
          {/* Rebar dashed line inside 150mm RC slab */}
          <line
            x1={sx(50)}
            y1={yFFL + 5}
            x2={sx(10950)}
            y2={yFFL + 5}
            stroke="#b45309"
            strokeWidth={1}
            strokeDasharray="6 3"
          />

          {/* WALLS & STRIP FOOTINGS (750 x 225mm at -1.20m base) */}
          {walls.map((w) => {
            const centerMm = w.startMm + w.thickMm / 2;
            const footingStartMm = centerMm - 375;
            return (
              <g key={w.label}>
                {/* 50mm Blinding */}
                <rect
                  x={sx(footingStartMm - 50)}
                  y={yFoundBase}
                  width={sLen(850)}
                  height={3.5}
                  fill="#94a3b8"
                  stroke="#334155"
                  strokeWidth={0.6}
                />
                {/* 750 x 225mm RC Strip Footing */}
                <rect
                  x={sx(footingStartMm)}
                  y={yFoundTop}
                  width={sLen(750)}
                  height={sLen(225)}
                  fill="#94a3b8"
                  stroke="#0f172a"
                  strokeWidth={1.3}
                />
                {/* Masonry Wall from Footing top up to Roof/Ceiling */}
                <rect
                  x={sx(w.startMm)}
                  y={w.topY}
                  width={sLen(w.thickMm)}
                  height={yFoundTop - w.topY}
                  fill="#334155"
                  stroke="#0f172a"
                  strokeWidth={1.2}
                />
                {/* 225x225 RC Ring Beam / Lintel at +2.10m */}
                {config.includeRingBeam && (
                  <rect
                    x={sx(w.startMm)}
                    y={yLintel - sLen(225)}
                    width={sLen(w.thickMm)}
                    height={sLen(225)}
                    fill="#d97706"
                    stroke="#0f172a"
                    strokeWidth={1}
                  />
                )}
              </g>
            );
          })}

          {/* VERANDAH COLUMN C1 (x=10775..11000) & 900x900x300 PAD BASE */}
          <g>
            <rect
              x={sx(10887.5 - 450)}
              y={yFoundBase - sLen(300)}
              width={sLen(900)}
              height={sLen(300)}
              fill="#94a3b8"
              stroke="#0f172a"
              strokeWidth={1.3}
            />
            <rect
              x={sx(10775)}
              y={236}
              width={sLen(225)}
              height={yFoundBase - sLen(300) - 236}
              fill="#b45309"
              fillOpacity={0.35}
              stroke="#78350f"
              strokeWidth={1.2}
            />
          </g>

          {/* SUSPENDED CEILING AT +3.00m FFL (y = 229.0) FOR MAIN BLOCK & +2.82m FOR VERANDAH */}
          <line
            x1={sx(225)}
            y1={yCeiling}
            x2={sx(8925)}
            y2={yCeiling}
            stroke="#0f172a"
            strokeWidth={1.6}
          />
          <line
            x1={sx(9150)}
            y1={240}
            x2={sx(10775)}
            y2={240}
            stroke="#0f172a"
            strokeWidth={1.4}
          />
          {/* Ceiling joists above +3.00m */}
          <line
            x1={sx(225)}
            y1={yCeiling - 4}
            x2={sx(8925)}
            y2={yCeiling - 4}
            stroke="#64748b"
            strokeWidth={0.9}
            strokeDasharray="8 4"
          />

          {/* 12° SPLIT-LEVEL CLERESTORY ROOF STRUCTURE */}
          <g>
            {/* NORTH WING 12° Rafter & Purlin Zone (from x=-900mm Rear Eave at y=216.6 rising 12° to x=5,400mm Upper Ridge at y=133.5) */}
            <polygon
              points={`
                ${sx(-900)},${yRearEave}
                ${sx(5400)},${yUpperRidge}
                ${sx(5400)},${yUpperRidge + 10}
                ${sx(-900)},${yRearEave + 10}
              `}
              fill="#cbd5e1"
              stroke="#0f172a"
              strokeWidth={1.4}
            />
            {/* North Wing 0.55mm Standing-Seam Aluminium Sheet Line */}
            <line
              x1={sx(-900)}
              y1={yRearEave - 2}
              x2={sx(5400)}
              y2={yUpperRidge - 2}
              stroke="#57534e"
              strokeWidth={2.5}
            />

            {/* CLERESTORY VERTICAL STEP FLASHING AT SPINE (x=5250..5400mm, between +4.54m y=133.5 and +4.12m y=159.6) */}
            <rect
              x={sx(5240)}
              y={yUpperRidge}
              width={sLen(160)}
              height={yLowerRidge - yUpperRidge + 8}
              fill="#78716c"
              stroke="#0f172a"
              strokeWidth={1.2}
            />

            {/* SOUTH WING 12° Rafter & Purlin Zone (from x=5,250mm Lower Step-Ridge at y=159.6 falling 12° to x=11,450mm Front Eave at y=241.4) */}
            <polygon
              points={`
                ${sx(5250)},${yLowerRidge}
                ${sx(11450)},${yFrontEave}
                ${sx(11450)},${yFrontEave + 10}
                ${sx(5250)},${yLowerRidge + 10}
              `}
              fill="#cbd5e1"
              stroke="#0f172a"
              strokeWidth={1.4}
            />
            {/* South Wing 0.55mm Standing-Seam Aluminium Sheet Line */}
            <line
              x1={sx(5250)}
              y1={yLowerRidge - 2}
              x2={sx(11450)}
              y2={yFrontEave - 2}
              stroke="#57534e"
              strokeWidth={2.5}
            />

            {/* Rear, Ridge & Front Taupe-Grey Fascia Boards */}
            <rect x={sx(-900)} y={yRearEave - 2} width={7} height={14} fill="#44403c" />
            <rect x={sx(5400) - 5} y={yUpperRidge - 2} width={6} height={14} fill="#44403c" />
            <rect x={sx(11450) - 6} y={yFrontEave - 2} width={7} height={14} fill="#44403c" />

            {/* Rear Downpipe DP1 (Ø100mm) with Swan-Neck from Rear Eave Gutter */}
            <polyline
              points={`${sx(-850)},${yRearEave + 12} ${sx(-80)},${yRearEave + 28} ${sx(-80)},${ySlabBottom}`}
              fill="none"
              stroke="#292524"
              strokeWidth={2.5}
            />
            <text x={sx(-480)} y={yRearEave + 38} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0284c7">
              DP1 (Ø100)
            </text>

            {/* Slope Callout Labels */}
            <text
              x={sx(2200)}
              y={162}
              textAnchor="middle"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
              fill="#0f172a"
              transform={`rotate(-12, ${sx(2200)}, 162)`}
            >
              12° NORTH WING (+3.20m → +4.54m)
            </text>
            <text
              x={sx(8300)}
              y={186}
              textAnchor="middle"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
              fill="#0f172a"
              transform={`rotate(12, ${sx(8300)}, 186)`}
            >
              12° SOUTH WING (+4.12m → +2.80m)
            </text>
          </g>

          {/* CEILING VOID CALLOUT */}
          <text
            x={sx(2600)}
            y={214}
            textAnchor="middle"
            fontSize={8.5}
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight={600}
            className="fill-slate-700 dark:fill-slate-300"
          >
            50×150mm Rafters @ 1,200c/c + 50×75mm Purlins
          </text>
          <text
            x={sx(7100)}
            y={218}
            textAnchor="middle"
            fontSize={8.5}
            fontFamily="Plus Jakarta Sans, sans-serif"
            fontWeight={600}
            className="fill-slate-700 dark:fill-slate-300"
          >
            420mm Split-Level Step at Central Spine
          </text>

          {/* ROOM LABELS & CLEAR WIDTH CALLOUTS INSIDE SECTION */}
          {[
            { name: 'BEDROOM 1', xMid: 2025, clearMm: 3600 },
            { name: 'PASSAGE', xMid: 4575, clearMm: 1200 },
            { name: 'LIVING ROOM', xMid: 7125, clearMm: 3600 },
            { name: 'VERANDAH', xMid: 9960, clearMm: 1850 },
          ].map((sp) => (
            <g key={sp.name}>
              <text
                x={sx(sp.xMid)}
                y={315}
                textAnchor="middle"
                fontSize={10.5}
                fontFamily="Outfit, sans-serif"
                fontWeight={700}
                className="fill-slate-900 dark:fill-white"
              >
                {sp.name}
              </text>
              <text
                x={sx(sp.xMid)}
                y={332}
                textAnchor="middle"
                fontSize={9}
                fontFamily="JetBrains Mono, monospace"
                className="fill-slate-600 dark:fill-slate-400"
              >
                Clear W: {formatDim(sp.clearMm, unit, true)}
              </text>
              <text
                x={sx(sp.xMid)}
                y={346}
                textAnchor="middle"
                fontSize={8.5}
                fontFamily="JetBrains Mono, monospace"
                className="fill-slate-500 dark:fill-slate-400"
              >
                Clear H: {formatDim(sp.name === 'VERANDAH' ? 2800 : 3000, unit, true)}
              </text>
            </g>
          ))}

          {/* EXTERNAL GROUND LINE (-0.15m) */}
          <line x1={65} y1={ySlabBottom} x2={sx(0)} y2={ySlabBottom} stroke="#0f172a" strokeWidth={2} />
          <line x1={sx(11000)} y1={ySlabBottom} x2={890} y2={ySlabBottom} stroke="#0f172a" strokeWidth={2} />

          {/* LEVEL DATUMS ON RIGHT */}
          <LevelDatum x={900} y={yUpperRidge} levelText="+4.54 m" label="UPPER SPINE RIDGE" lineStartX={sx(5400)} />
          <LevelDatum x={900} y={yLowerRidge} levelText="+4.12 m" label="LOWER STEP-RIDGE" lineStartX={sx(5250)} />
          <LevelDatum x={900} y={yRearEave - 12} levelText="+3.20 m" label="REAR LOW EAVE" lineStartX={sx(-900)} />
          <LevelDatum x={900} y={yCeiling + 2} levelText="+3.00 m" label="SUSPENDED CEILING" lineStartX={sx(8925)} />
          <LevelDatum x={900} y={yFrontEave + 14} levelText="+2.80 m" label="FRONT LOW EAVE" lineStartX={sx(11450)} />
          <LevelDatum x={900} y={yLintel} levelText="+2.10 m" label="RING BEAM / LINTEL" lineStartX={sx(8925)} />
          <LevelDatum x={900} y={yFFL - 6} levelText="±0.000" label="FINISHED FLOOR (FFL)" lineStartX={sx(11000)} />
          <LevelDatum x={900} y={ySlabBottom + 14} levelText="-0.15 m" label="NATURAL GROUND (GL)" lineStartX={sx(11000)} />
          <LevelDatum x={900} y={yFoundBase} levelText="-1.20 m" label="FOUNDATION BASE" lineStartX={sx(11000)} />

          {/* LEFT VERTICAL DIMENSION CHAIN (Ceiling height & Foundation depth) */}
          <DimLineV
            y1={yCeiling}
            y2={yFFL}
            x={82}
            valueMm={3000}
            unit={unit}
            extStartX={sx(225)}
            extEndX={sx(0)}
            side="left"
            labelSuffix=" CLEAR H"
            highlight
          />
          <DimLineV
            y1={yFFL}
            y2={yFoundBase}
            x={82}
            valueMm={1200}
            unit={unit}
            extStartX={sx(0)}
            extEndX={sx(-262.5)}
            side="left"
            labelSuffix=" SUBSTR."
          />

          {/* BOTTOM HORIZONTAL DIMENSION CHAINS FOR SECTION B-B */}
          {/* Tier 1: Wall & Clear Room Widths */}
          <DimLineH x1={sx(0)} x2={sx(225)} y={525} valueMm={225} unit={unit} extStartY={yFoundBase} extEndY={yFFL} />
          <DimLineH x1={sx(225)} x2={sx(3825)} y={525} valueMm={3600} unit={unit} extEndY={yFFL} labelSuffix=" BEDROOM 1" highlight />
          <DimLineH x1={sx(3825)} x2={sx(3975)} y={525} valueMm={150} unit={unit} extEndY={yFFL} />
          <DimLineH x1={sx(3975)} x2={sx(5175)} y={525} valueMm={1200} unit={unit} extEndY={yFFL} labelSuffix=" PASSAGE" highlight />
          <DimLineH x1={sx(5175)} x2={sx(5325)} y={525} valueMm={150} unit={unit} extEndY={yFFL} />
          <DimLineH x1={sx(5325)} x2={sx(8925)} y={525} valueMm={3600} unit={unit} extEndY={yFFL} labelSuffix=" LIVING ROOM" highlight />
          <DimLineH x1={sx(8925)} x2={sx(9150)} y={525} valueMm={225} unit={unit} extEndY={yFFL} />
          <DimLineH x1={sx(9150)} x2={sx(11000)} y={525} valueMm={1850} unit={unit} extEndY={yFFL} labelSuffix=" VERANDAH" highlight />

          {/* Tier 2: Main Block & Overall Section Width */}
          <DimLineH x1={sx(0)} x2={sx(9150)} y={555} valueMm={9150} unit={unit} extStartY={yFoundBase} extEndY={yFoundBase} labelSuffix=" MAIN BLOCK DEPTH" />
          <DimLineH x1={sx(0)} x2={sx(11000)} y={585} valueMm={11000} unit={unit} extStartY={yFoundBase} extEndY={yFoundBase} labelSuffix=" OVERALL FOOTPRINT DEPTH" highlight fontSize={10} />
        </svg>
      </div>

      <DrawingTitleBlock
        sheetCode="A-008"
        sheetTitle="ARCHITECTURAL & STRUCTURAL SECTION B–B (12° SPLIT-LEVEL ROOF AT X = 1.00m)"
        scale="1:50"
        unit={unit}
        notes={[
          'Roof structure: 12° Split-Level Clerestory — North Wing rises 12° from +3.20m Rear Eave to +4.54m Spine Ridge; South Wing falls 12° from +4.12m Step-Ridge to +2.80m Front Eave.',
          'Substructure: 750×225mm strip footing at -1.20m on 50mm blinding; 150mm RC slab on 150mm compacted sand fill & 1000-gauge DPM.',
          `DPC specification: Bituminous felt + anti-termite soil treatment (${config.dpcDatumMode === '0.000-FFL' ? 'DPC at ±0.000m FFL' : 'Raised DPC at +0.150m'}).`,
        ]}
      />
    </div>
  );
};

export const StructuralSheet: React.FC<SectionSheetProps> = ({ unit, config }) => {
  // Left side: S-001 Foundation & Trench Plan (1:100)
  // Right side: S-001 Enlarged 1:20 Typical Strip Footing, Wall & RC Floor Slab Detail
  const S = 0.038;
  const fx = (mm: number) => 65 + mm * S;
  const fy = (mm: number) => 115 + mm * S;
  const fLen = (mm: number) => mm * S;

  const isCutBack = config.eastOverhangMode === 'cut-back-eave';

  return (
    <div className="print-sheet border-2 border-slate-900 dark:border-slate-300 bg-[#FAF8F2] dark:bg-slate-950 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1070 720"
          className="w-full h-auto min-w-[820px] select-none"
          role="img"
          aria-label="S-001 Structural Foundation Trench Layout 1:100 and 1:20 Typical Strip Footing Detail"
        >
          <rect
            x={10}
            y={10}
            width={1050}
            height={700}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            className="text-slate-400 dark:text-slate-700"
          />

          <text
            x={25}
            y={34}
            fontSize={12}
            fontFamily="Outfit, sans-serif"
            fontWeight={700}
            className="fill-slate-900 dark:fill-slate-100"
          >
            S-001 // FOUNDATION TRENCH LAYOUT (1:100) &amp; 1:20 STRIP FOOTING / SLAB REINFORCEMENT DETAIL
          </text>
          <text
            x={25}
            y={48}
            fontSize={9.5}
            fontFamily="JetBrains Mono, monospace"
            className="fill-slate-600 dark:fill-slate-400"
          >
            750×225mm STRIP FOOTINGS AT -1.20m BASE · {config.foundationConcreteGrade === 'C25/30-reinforced' ? 'GRADE C25/30 REINFORCED CONCRETE (Y12 + R8@200c/c)' : '1:3:6 MASS CONCRETE FOUNDATION OPTION'} · 900×900×300mm COLUMN PADS
          </text>

          {/* ==================== LEFT PANEL: 1:100 FOUNDATION TRENCH PLAN ==================== */}
          <text x={65} y={76} fontSize={10.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
            1. FOUNDATION TRENCH &amp; COLUMN PAD SETTING-OUT PLAN · 1:100
          </text>

          {/* Grey 750mm wide continuous strip footings centered on all walls */}
          <g fill="#cbd5e1" stroke="#475569" strokeWidth={0.8}>
            {/* Perimeter 750mm trench (centered on x=112.5, x=11887.5, y=112.5, y=9037.5) */}
            <rect x={fx(-262.5)} y={fy(-262.5)} width={fLen(12525)} height={fLen(750)} />
            <rect x={fx(-262.5)} y={fy(8662.5)} width={fLen(12525)} height={fLen(750)} />
            <rect x={fx(-262.5)} y={fy(-262.5)} width={fLen(750)} height={fLen(9675)} />
            <rect x={fx(11512.5)} y={fy(-262.5)} width={fLen(750)} height={fLen(9675)} />

            {/* Internal wall 750mm trenches */}
            {/* Passage North Wall (y=3900 center) */}
            <rect x={fx(112.5)} y={fy(3525)} width={fLen(11775)} height={fLen(750)} />
            {/* Passage South Wall (y=5250 center) */}
            <rect x={fx(112.5)} y={fy(4875)} width={fLen(11775)} height={fLen(750)} />
            {/* Bed 1 / Bath 1 (x=3900 center) */}
            <rect x={fx(3525)} y={fy(112.5)} width={fLen(750)} height={fLen(3787.5)} />
            {/* Bath 1 / Bath 2 (x=6000 center) */}
            <rect x={fx(5625)} y={fy(112.5)} width={fLen(750)} height={fLen(2587.5)} />
            {/* Bath 2 / Bed 2 (x=8100 center) */}
            <rect x={fx(7725)} y={fy(112.5)} width={fLen(750)} height={fLen(3787.5)} />
            {/* Bath South Wall (y=2700 center) */}
            <rect x={fx(3900)} y={fy(2325)} width={fLen(4200)} height={fLen(750)} />
            {/* Kitchen West Wall (x=8700 center) */}
            <rect x={fx(8325)} y={fy(5250)} width={fLen(750)} height={fLen(3787.5)} />
            {/* Pantry Walls (x=9900, y=6900) */}
            <rect x={fx(9525)} y={fy(5250)} width={fLen(750)} height={fLen(1650)} />
            <rect x={fx(9900)} y={fy(6525)} width={fLen(1987.5)} height={fLen(750)} />
          </g>

          {/* Black 225mm / 150mm Load-Bearing Sandcrete Walls Centered in Trenches */}
          <g fill="#0f172a" className="dark:fill-slate-100">
            <rect x={fx(0)} y={fy(0)} width={fLen(12000)} height={fLen(225)} />
            <rect x={fx(0)} y={fy(8925)} width={fLen(12000)} height={fLen(225)} />
            <rect x={fx(0)} y={fy(0)} width={fLen(225)} height={fLen(9150)} />
            <rect x={fx(11775)} y={fy(0)} width={fLen(225)} height={fLen(9150)} />

            <rect x={fx(225)} y={fy(3825)} width={fLen(11550)} height={fLen(150)} />
            <rect x={fx(225)} y={fy(5175)} width={fLen(11550)} height={fLen(150)} />
            <rect x={fx(3825)} y={fy(225)} width={fLen(150)} height={fLen(3600)} />
            <rect x={fx(5925)} y={fy(225)} width={fLen(150)} height={fLen(2400)} />
            <rect x={fx(8025)} y={fy(225)} width={fLen(150)} height={fLen(3600)} />
            <rect x={fx(3975)} y={fy(2625)} width={fLen(4050)} height={fLen(150)} />
            <rect x={fx(8625)} y={fy(5325)} width={fLen(150)} height={fLen(3600)} />
            <rect x={fx(9825)} y={fy(5325)} width={fLen(150)} height={fLen(1650)} />
            <rect x={fx(9825)} y={fy(6825)} width={fLen(1950)} height={fLen(150)} />
          </g>

          {/* Column Pads C1, C2, C3 (+ C4) 900x900x300mm */}
          {[
            { tag: 'C1 PAD (900×900)', cx: 112.5, cy: 10887.5 },
            { tag: 'C2 PAD (900×900)', cx: 3000, cy: 10887.5 },
            { tag: 'C3 PAD (900×900)', cx: 5887.5, cy: 10887.5 },
            ...(!isCutBack ? [{ tag: 'C4 PAD (900×900)', cx: 11887.5, cy: 10887.5 }] : []),
          ].map((p) => (
            <g key={p.tag}>
              <rect
                x={fx(p.cx - 450)}
                y={fy(p.cy - 450)}
                width={fLen(900)}
                height={fLen(900)}
                fill="#fde68a"
                fillOpacity={0.5}
                stroke="#b45309"
                strokeWidth={1.1}
              />
              <rect
                x={fx(p.cx - 112.5)}
                y={fy(p.cy - 112.5)}
                width={fLen(225)}
                height={fLen(225)}
                fill="#0f172a"
              />
              <text
                x={fx(p.cx)}
                y={fy(p.cy + 780)}
                textAnchor="middle"
                fontSize={8}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="#b45309"
              >
                {p.tag}
              </text>
            </g>
          ))}

          {/* Foundation Trench Centerline Dimensions */}
          <DimLineH x1={fx(112.5)} x2={fx(3900)} y={96} valueMm={3788} unit={unit} extStartY={fy(0)} extEndY={fy(0)} labelSuffix=" C/C" />
          <DimLineH x1={fx(3900)} x2={fx(6000)} y={96} valueMm={2100} unit={unit} extEndY={fy(0)} labelSuffix=" C/C" />
          <DimLineH x1={fx(6000)} x2={fx(8100)} y={96} valueMm={2100} unit={unit} extEndY={fy(0)} labelSuffix=" C/C" />
          <DimLineH x1={fx(8100)} x2={fx(11887.5)} y={96} valueMm={3788} unit={unit} extEndY={fy(0)} labelSuffix=" C/C" />

          <DimLineH x1={fx(112.5)} x2={fx(3000)} y={fy(11950)} valueMm={2888} unit={unit} extStartY={fy(10887.5)} extEndY={fy(10887.5)} labelSuffix=" C1–C2" highlight />
          <DimLineH x1={fx(3000)} x2={fx(5887.5)} y={fy(11950)} valueMm={2888} unit={unit} extEndY={fy(10887.5)} labelSuffix=" C2–C3" highlight />

          <text x={fx(6000)} y={fy(12750)} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono, monospace" fontWeight={600} className="fill-slate-700 dark:fill-slate-300">
            GREY: 750×225mm STRIP FOOTING (-1.20m BASE) · BLACK: 225 EXT / 150 INT SANDCRETE BLOCKWORK
          </text>

          {/* ==================== RIGHT PANEL: 1:20 ENLARGED FOOTING & SLAB DETAIL ==================== */}
          <line x1={575} y1={65} x2={575} y2={690} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />

          <text x={595} y={76} fontSize={10.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
            2. TYPICAL FOOTING, WALL &amp; FLOOR DETAIL · SCALE 1:20
          </text>

          {/* Enlarged 1:20 Section Drawing (x=600..1040, y=100..660) */}
          {/* Let Wall Centerline sit at X = 735 (225mm wall = 56px wide => x=707..763) */}
          {/* 750mm Strip Footing = 186px wide => x=642..828, thickness 225mm = 56px => y=520..576 */}
          {/* 50mm Blinding = 13px => y=576..589 */}
          {/* FFL (±0.000) at Y = 230, GL (-0.15m) at Y = 267 */}

          {/* 50mm Concrete Blinding */}
          <rect x={632} y={576} width={206} height={13} fill="#e2e8f0" stroke="#475569" strokeWidth={1} />
          {/* 750 x 225mm RC Strip Footing */}
          <rect x={642} y={520} width={186} height={56} fill="#cbd5e1" stroke="#0f172a" strokeWidth={1.6} />

          {/* Rebar inside 750x225 Strip Footing: Y12 top & bottom + R8 stirrup */}
          <rect x={654} y={530} width={162} height={36} rx={3} fill="none" stroke="#b45309" strokeWidth={1.5} />
          {[662, 686, 710, 735, 760, 784, 808].map((bx) => (
            <React.Fragment key={bx}>
              <circle cx={bx} cy={534} r={3} fill="#b45309" />
              <circle cx={bx} cy={562} r={3} fill="#b45309" />
            </React.Fragment>
          ))}

          {/* 225mm Sandcrete Wall from Footing top (y=520) up to y=130 */}
          <rect x={707} y={130} width={56} height={390} fill="#94a3b8" stroke="#0f172a" strokeWidth={1.5} />
          {/* Mortar joint lines in 225mm wall */}
          {[180, 230, 280, 330, 380, 430, 480].map((my) => (
            <line key={my} x1={707} y1={my} x2={763} y2={my} stroke="#334155" strokeWidth={0.8} />
          ))}

          {/* Bituminous DPC at ±0.000 (y=230) */}
          <line x1={702} y1={230} x2={768} y2={230} stroke="#dc2626" strokeWidth={3} />

          {/* Floor Build-up on Right of Wall (x=763 to 940): */}
          {/* 15mm Tile + 40mm Screed (y=216..230) */}
          <rect x={763} y={216} width={175} height={14} fill="#fef3c7" stroke="#0f172a" strokeWidth={1} />
          {/* 150mm RC Floor Slab (y=230..268) */}
          <rect x={763} y={230} width={175} height={38} fill="#cbd5e1" stroke="#0f172a" strokeWidth={1.4} />
          {/* Y12 Rebar in RC Slab */}
          <line x1={770} y1={255} x2={935} y2={255} stroke="#b45309" strokeWidth={1.5} />
          {[780, 810, 840, 870, 900, 925].map((sxPos) => (
            <circle key={sxPos} cx={sxPos} cy={251} r={2.5} fill="#b45309" />
          ))}
          {/* 1000-Gauge Polythene DPM (blue line at y=268) */}
          <line x1={763} y1={268} x2={938} y2={268} stroke="#0284c7" strokeWidth={2.2} />
          {/* 150mm Compacted Laterite / Sharp Sand Fill (y=268..306) */}
          <rect x={763} y={268} width={175} height={38} fill="#fde68a" fillOpacity={0.45} stroke="#92400e" strokeWidth={1} />
          {/* 50mm Sub-slab Blinding (y=306..319) */}
          <rect x={763} y={306} width={175} height={13} fill="#e2e8f0" stroke="#475569" strokeWidth={0.9} />

          {/* External Ground Level GL -0.15m on Left of Wall (x=600..707, y=267) */}
          <line x1={600} y1={267} x2={707} y2={267} stroke="#0f172a" strokeWidth={2} />
          <text x={610} y={261} fontSize={9.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0f172a">
            GL -0.150
          </text>
          <text x={605} y={225} fontSize={9.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#dc2626">
            DPC ±0.000
          </text>

          {/* Callout Leader Labels on Right */}
          <g fontSize={8.5} fontFamily="JetBrains Mono, monospace" className="fill-slate-800 dark:fill-slate-200">
            <text x={945} y={222} fontWeight={600}>15mm Tile + 40mm Screed</text>
            <text x={945} y={248} fontWeight={700}>150mm RC Slab (Y12@200)</text>
            <text x={945} y={271} fill="#0284c7" fontWeight={700}>1000-Gauge Polythene DPM</text>
            <text x={945} y={292}>150mm Compacted Sand Fill</text>
            <text x={945} y={316}>50mm Concrete Blinding</text>

            <text x={735} y={120} textAnchor="middle" fontWeight={700}>
              225mm Sandcrete Wall
            </text>

            <text x={840} y={542} fontWeight={700} fill="#b45309">
              Footing: Y12 T&amp;B, R8@200 c/c
            </text>
            <text x={840} y={556}>
              50mm Cover · {config.foundationConcreteGrade === 'C25/30-reinforced' ? 'Grade C25/30' : '1:3:6 Mix'}
            </text>
            <text x={840} y={586}>
              50mm Weak Concrete Blinding
            </text>
          </g>

          {/* Enlarged Detail Dimensions */}
          <DimLineH x1={642} x2={828} y={615} valueMm={750} unit={unit} extStartY={576} extEndY={576} labelSuffix=" FOOTING WIDTH" highlight />
          <DimLineV y1={520} y2={576} x={618} valueMm={225} unit={unit} extStartX={642} extEndX={642} side="left" />
          <DimLineV y1={230} y2={576} x={592} valueMm={1200} unit={unit} extStartX={707} extEndX={642} side="left" labelSuffix=" MIN DEPTH" highlight />
        </svg>
      </div>

      <DrawingTitleBlock
        sheetCode="S-001"
        sheetTitle="FOUNDATION TRENCH PLAN & 1:20 TYPICAL FOOTING DETAIL"
        scale="1:100 / 1:20"
        unit={unit}
        notes={[
          `Concrete grade: ${config.foundationConcreteGrade === 'C25/30-reinforced' ? 'Grade C25/30 (25 N/mm² at 28 days) with Y12 high-yield reinforcement' : '1:3:6 mass concrete option selected — confirm bearing capacity on site'}.`,
          'Anti-termite treatment (Dursban or approved equivalent) to be sprayed over trenches and hardcore fill prior to laying 1000-gauge DPM.',
          'Substructure hollow sandcrete blocks from footing top (-0.975m) to DPC (±0.000m) must be filled solid with 1:3:6 concrete.',
        ]}
      />
    </div>
  );
};
