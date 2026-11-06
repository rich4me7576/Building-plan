import React, { useState } from 'react';
import { UnitMode, SiteResolutionConfig, formatDim } from '../utils/architecturalMath';
import {
  DimLineH,
  DimLineV,
  LevelDatum,
  NorthArrow,
  GraphicScaleBar,
  DrawingTitleBlock,
} from './CadPrimitives';

interface RoofSheetProps {
  unit: UnitMode;
  config: SiteResolutionConfig;
}

export const RoofPlanSheet: React.FC<RoofSheetProps> = ({ unit, config }) => {
  const S = 0.048; // 13,800mm = 662.4px
  // Let roof NW corner (-900, -900 from building NW) sit at (190, 120)
  const rx = (mmFromRoofNW: number) => 190 + mmFromRoofNW * S;
  const ry = (mmFromRoofNW: number) => 120 + mmFromRoofNW * S;
  const rLen = (mm: number) => mm * S;

  const isCutBack = config.eastOverhangMode === 'cut-back-eave';

  // Purlin Y positions (every 1200mm along roof slope of 12,350mm)
  const purlinOffsetsMm = [300, 1500, 2700, 3900, 5100, 6300, 7500, 8700, 9900, 11100, 12050];
  // Rafter X positions (every 1200mm across 13,800mm width)
  const rafterOffsetsMm = [300, 1500, 2700, 3900, 5100, 6300, 7500, 8700, 9900, 11100, 12300, 13500];

  return (
    <div className="print-sheet border-2 border-slate-900 dark:border-slate-300 bg-[#FAF8F2] dark:bg-slate-950 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1060 820"
          className="w-full h-auto min-w-[800px] select-none"
          role="img"
          aria-label="A-002 Roof Framing, Purlin and Drainage Plan 1:100"
        >
          <defs>
            <pattern id="aluSheetProfile" width="12" height="20" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="20" stroke="#64748b" strokeWidth="0.6" strokeOpacity="0.4" />
              <line x1="6" y1="0" x2="6" y2="20" stroke="#64748b" strokeWidth="0.3" strokeOpacity="0.25" />
            </pattern>
          </defs>

          <rect
            x={10}
            y={10}
            width={1040}
            height={800}
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
            A-002 // 12° SPLIT-LEVEL ROOF FRAMING, PURLIN &amp; RAINWATER DRAINAGE PLAN · SCALE 1:100
          </text>
          <text
            x={25}
            y={48}
            fontSize={9.5}
            fontFamily="JetBrains Mono, monospace"
            className="fill-slate-600 dark:fill-slate-400"
          >
            0.55mm STANDING-SEAM ALUMINIUM · 12° DUAL-SLOPE SPLIT-LEVEL (SPINE RIDGE +4.54m / +4.12m TO EAVES +3.20m &amp; +2.80m)
          </text>

          <NorthArrow x={1000} y={70} />
          <GraphicScaleBar x={25} y={775} pxPerMetre={1000 * S} />

          {/* ROOF ENVELOPE POLYGON (Full Rectangle vs East Overhang Cut-Back) */}
          {isCutBack ? (
            <polygon
              points={`
                ${rx(0)},${ry(0)}
                ${rx(13800)},${ry(0)}
                ${rx(13800)},${ry(10950)}
                ${rx(7350)},${ry(10950)}
                ${rx(7350)},${ry(12350)}
                ${rx(0)},${ry(12350)}
              `}
              fill="url(#aluSheetProfile)"
              stroke="#0f172a"
              strokeWidth={1.8}
              className="dark:stroke-slate-200"
            />
          ) : (
            <rect
              x={rx(0)}
              y={ry(0)}
              width={rLen(13800)}
              height={rLen(12350)}
              fill="url(#aluSheetProfile)"
              stroke="#0f172a"
              strokeWidth={1.8}
              className="dark:stroke-slate-200"
            />
          )}

          {/* PURLINS 50x75mm @ 900c/c (Horizontal dashed lines) */}
          <g stroke="#0369a1" strokeWidth={0.75} strokeDasharray="6 3" opacity={0.7}>
            {purlinOffsetsMm.map((pyMm) => {
              const maxX = isCutBack && pyMm > 10950 ? 7350 : 13800;
              return (
                <line
                  key={pyMm}
                  x1={rx(0)}
                  y1={ry(pyMm)}
                  x2={rx(maxX)}
                  y2={ry(pyMm)}
                />
              );
            })}
          </g>

          {/* RAFTERS 50x150mm @ 1200c/c (Vertical faint lines) */}
          <g stroke="#475569" strokeWidth={0.55} strokeDasharray="3 3" opacity={0.5}>
            {rafterOffsetsMm.map((rxMm) => {
              const maxY = isCutBack && rxMm > 7350 ? 10950 : 12350;
              return (
                <line
                  key={rxMm}
                  x1={rx(rxMm)}
                  y1={ry(0)}
                  x2={rx(rxMm)}
                  y2={ry(maxY)}
                />
              );
            })}
          </g>

          {/* DASHED BUILDING FOOTPRINT BELOW ROOF (Main block 12,000 x 9,150 + Verandah 6,000 x 1,850) */}
          <g stroke="#b45309" strokeWidth={1.3} strokeDasharray="8 4" fill="none">
            <rect x={rx(900)} y={ry(900)} width={rLen(12000)} height={rLen(9150)} />
            <rect x={rx(900)} y={ry(10050)} width={rLen(6000)} height={rLen(1850)} />
          </g>

          {/* CENTRAL SPINE CLERESTORY STEP-RIDGE AT Y = 5,250mm FROM BUILDING NW (6,150mm FROM ROOF NW) */}
          <rect
            x={rx(0)}
            y={ry(6075)}
            width={rLen(13800)}
            height={rLen(225)}
            fill="#78716c"
            fillOpacity={0.35}
            stroke="#0f172a"
            strokeWidth={1.6}
          />
          <line
            x1={rx(0)}
            y1={ry(6300)}
            x2={rx(13800)}
            y2={ry(6300)}
            stroke="#dc2626"
            strokeWidth={1.5}
            strokeDasharray="8 3"
          />
          <text
            x={rx(6900)}
            y={ry(5920)}
            textAnchor="middle"
            fontSize={9.5}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={700}
            className="fill-slate-900 dark:fill-white"
          >
            CENTRAL SPINE CLERESTORY STEP-RIDGE · NORTH UPPER RIDGE (+4.54m) STEPPING 420mm DOWN TO SOUTH RIDGE (+4.12m)
          </text>

          {/* COLUMN SUPPORT POSITIONS C1, C2, C3 (+ C4 when enabled) */}
          {[
            { tag: 'C1', x: 900 + 112.5, y: 900 + 10887.5 },
            { tag: 'C2', x: 900 + 3000, y: 900 + 10887.5 },
            { tag: 'C3', x: 900 + 5887.5, y: 900 + 10887.5 },
            ...(!isCutBack ? [{ tag: 'C4 (SE SUPPORT)', x: 900 + 11887.5, y: 900 + 10887.5 }] : []),
          ].map((c) => (
            <g key={c.tag}>
              <rect
                x={rx(c.x - 112.5)}
                y={ry(c.y - 112.5)}
                width={rLen(225)}
                height={rLen(225)}
                fill="#d97706"
                stroke="#0f172a"
                strokeWidth={1}
              />
              <text
                x={rx(c.x)}
                y={ry(c.y - 220)}
                textAnchor="middle"
                fontSize={8.5}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="#b45309"
              >
                {c.tag}
              </text>
            </g>
          ))}

          {/* NORTH WING 12-DEGREE SLOPE ARROWS (FALLING NORTH FROM +4.54m RIDGE TO +3.20m REAR GUTTER) */}
          {[3200, 6900, 10600].map((ax) => (
            <g key={`north-${ax}`} className="text-slate-900 dark:text-slate-100">
              <line x1={rx(ax)} y1={ry(4700)} x2={rx(ax)} y2={ry(1700)} stroke="currentColor" strokeWidth={1.4} />
              <polygon
                points={`${rx(ax)},${ry(1550)} ${rx(ax) - 5},${ry(1850)} ${rx(ax) + 5},${ry(1850)}`}
                fill="currentColor"
              />
              <text
                x={rx(ax) + 8}
                y={ry(3200)}
                fontSize={9.5}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="currentColor"
              >
                12° FALL (NORTH WING)
              </text>
            </g>
          ))}

          {/* SOUTH WING 12-DEGREE SLOPE ARROWS (FALLING SOUTH FROM +4.12m STEP-RIDGE TO +2.80m FRONT GUTTER) */}
          {[3200, 6900, 10600].map((ax) => (
            <g key={`south-${ax}`} className="text-slate-900 dark:text-slate-100">
              <line x1={rx(ax)} y1={ry(7200)} x2={rx(ax)} y2={ry(9800)} stroke="currentColor" strokeWidth={1.4} />
              <polygon
                points={`${rx(ax)},${ry(9950)} ${rx(ax) - 5},${ry(9650)} ${rx(ax) + 5},${ry(9650)}`}
                fill="currentColor"
              />
              <text
                x={rx(ax) + 8}
                y={ry(8600)}
                fontSize={9.5}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="currentColor"
              >
                12° FALL (SOUTH WING)
              </text>
            </g>
          ))}

          {/* REAR (NORTH) EAVE BOX GUTTER AT +3.20m & DOWNPIPES DP1, DP2 (MATCHING UPLOADED PHOTO) */}
          <rect
            x={rx(0)}
            y={ry(0)}
            width={rLen(13800)}
            height={rLen(200)}
            fill="#0284c7"
            fillOpacity={0.28}
            stroke="#0284c7"
            strokeWidth={1.2}
          />
          <circle cx={rx(1080)} cy={ry(150)} r={6} fill="#0f172a" stroke="#0284c7" strokeWidth={1.5} />
          <text x={rx(1180)} y={ry(820)} fontSize={9} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0284c7">
            DP1 (Ø100 NW)
          </text>
          <circle cx={rx(12720)} cy={ry(150)} r={6} fill="#0f172a" stroke="#0284c7" strokeWidth={1.5} />
          <text x={rx(12620)} y={ry(820)} textAnchor="end" fontSize={9} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0284c7">
            DP2 (Ø100 NE)
          </text>

          {/* CONCEALED FRONT (SOUTH) BOX GUTTER AT +2.80m & DOWNPIPES DP3, DP4 */}
          <rect
            x={rx(0)}
            y={ry(12150)}
            width={rLen(isCutBack ? 7350 : 13800)}
            height={rLen(200)}
            fill="#0284c7"
            fillOpacity={0.25}
            stroke="#0284c7"
            strokeWidth={1.1}
          />
          {/* DP3 */}
          <circle cx={rx(250)} cy={ry(12100)} r={6} fill="#0f172a" stroke="#0284c7" strokeWidth={1.5} />
          <text x={rx(250)} y={ry(11850)} fontSize={9} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0284c7">
            DP3 (Ø100 SW)
          </text>
          {/* DP4 */}
          <circle
            cx={rx(13550)}
            cy={ry(isCutBack ? 10750 : 12100)}
            r={6}
            fill="#0f172a"
            stroke="#0284c7"
            strokeWidth={1.5}
          />
          <text
            x={rx(13350)}
            y={ry(isCutBack ? 10500 : 11850)}
            textAnchor="end"
            fontSize={9}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={700}
            fill="#0284c7"
          >
            DP4 (Ø100 SE)
          </text>

          {/* ROOF ANNOTATIONS */}
          <text
            x={rx(6900)}
            y={ry(550)}
            textAnchor="middle"
            fontSize={9.5}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={700}
            fill="#0284c7"
          >
            REAR LOW EAVE (+3.20m) · TAUPE-GREY FASCIA GUTTER &amp; CORNER DOWNPIPES DP1 / DP2
          </text>
          <text
            x={rx(3600)}
            y={ry(12750)}
            textAnchor="middle"
            fontSize={9}
            fontFamily="JetBrains Mono, monospace"
            fontWeight={600}
            fill="#0284c7"
          >
            FRONT VERANDAH LOW EAVE (+2.80m) · BOX GUTTER FALLING 1:100 TO DP3 &amp; DP4
          </text>

          {/* ==================== ROOF SITE DIMENSIONS ==================== */}
          {/* Top Eave Breakdown: 900 + 12,000 + 900 = 13,800 mm */}
          <DimLineH x1={rx(0)} x2={rx(900)} y={92} valueMm={900} unit={unit} extStartY={ry(0)} extEndY={ry(900)} labelSuffix=" W.EAVE" />
          <DimLineH x1={rx(900)} x2={rx(12900)} y={92} valueMm={12000} unit={unit} extStartY={ry(900)} extEndY={ry(900)} labelSuffix=" MAIN BUILDING WALLS" highlight />
          <DimLineH x1={rx(12900)} x2={rx(13800)} y={92} valueMm={900} unit={unit} extStartY={ry(900)} extEndY={ry(0)} labelSuffix=" E.EAVE" />
          <DimLineH x1={rx(0)} x2={rx(13800)} y={64} valueMm={13800} unit={unit} extStartY={ry(0)} extEndY={ry(0)} labelSuffix=" OVERALL ROOF WIDTH" highlight fontSize={10} />

          {/* Left Vertical Slope Breakdown: 900 (Rear Eave) + 5,250 (North Wing) + 3,900 (South Main) + 1,850 (Verandah) + 450 (Front Eave) = 12,350 mm */}
          <DimLineV y1={ry(0)} y2={ry(900)} x={145} valueMm={900} unit={unit} extStartX={rx(0)} extEndX={rx(900)} side="left" labelSuffix=" N.EAVE" />
          <DimLineV y1={ry(900)} y2={ry(6150)} x={145} valueMm={5250} unit={unit} extEndX={rx(900)} side="left" labelSuffix=" N.WING 12°" highlight />
          <DimLineV y1={ry(6150)} y2={ry(10050)} x={145} valueMm={3900} unit={unit} extEndX={rx(900)} side="left" labelSuffix=" S.MAIN 12°" />
          <DimLineV y1={ry(10050)} y2={ry(11900)} x={145} valueMm={1850} unit={unit} extEndX={rx(900)} side="left" labelSuffix=" VERANDAH" />
          <DimLineV y1={ry(11900)} y2={ry(12350)} x={145} valueMm={450} unit={unit} extEndX={rx(0)} side="left" labelSuffix=" S.EAVE" />
          <DimLineV y1={ry(0)} y2={ry(12350)} x={108} valueMm={12350} unit={unit} extStartX={rx(0)} extEndX={rx(0)} side="left" labelSuffix=" OVERALL ROOF RUN" highlight fontSize={10} />
        </svg>
      </div>

      <DrawingTitleBlock
        sheetCode="A-002"
        sheetTitle="12° SPLIT-LEVEL ROOF FRAMING, PURLIN & DRAINAGE PLAN"
        scale="1:100"
        unit={unit}
        notes={[
          'Roof pitch: 12° Split-Level Clerestory — North Wing rises 12° from Rear Eave (+3.20m) to Upper Spine Ridge (+4.54m); South Wing falls 12° from Lower Spine Ridge (+4.12m) to Front Eave (+2.80m).',
          'Timber/Steel framing: 50×150mm rafters @ 1,200mm c/c on 50×75mm purlins @ 900mm c/c with 0.55mm taupe-grey standing-seam aluminium sheets.',
          isCutBack
            ? 'East front overhang cut back to 900mm eave beyond Kitchen/Dining front wall (no SE verandah column required).'
            : 'Full rectangular roof maintained; supported at SE corner by new 225×225mm RC column C4 on 900×900×300mm pad.',
        ]}
      />
    </div>
  );
};

interface ElevationsSheetProps {
  unit: UnitMode;
  config: SiteResolutionConfig;
  onSelectOpening: (tag: string) => void;
}

export const ElevationsSheet: React.FC<ElevationsSheetProps> = ({
  unit,
  config,
  onSelectOpening,
}) => {
  const [activeView, setActiveView] = useState<'ALL' | 'FRONT_REAR' | 'LEFT_RIGHT'>('ALL');
  const isCutBack = config.eastOverhangMode === 'cut-back-eave';

  return (
    <div className="print-sheet border-2 border-slate-900 dark:border-slate-300 bg-[#FAF8F2] dark:bg-slate-950 overflow-hidden">
      {/* Sub-navigation bar for Elevations inspection */}
      <div className="no-print flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-[#EFECE4] dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800">
        <div className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300">
          SHEETS A-003 TO A-006 // ALL 4 WORKING ELEVATIONS (12° SPLIT-LEVEL ROOF · SILL, LINTEL &amp; RIDGE DATUMS)
        </div>
        <div className="flex items-center gap-1 bg-slate-200/80 dark:bg-slate-800 p-1 rounded-md">
          {[
            { id: 'ALL', label: 'All 4 Elevations' },
            { id: 'FRONT_REAR', label: 'Front (A-003) & Rear (A-004)' },
            { id: 'LEFT_RIGHT', label: 'Left (A-005) & Right (A-006)' },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveView(tab.id as typeof activeView)}
              className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 ${
                activeView === tab.id
                  ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-amber-400 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="w-full overflow-x-auto space-y-6 p-4">
        {/* ==================== A-003 FRONT (SOUTH) & A-004 REAR (NORTH) ELEVATIONS ==================== */}
        {(activeView === 'ALL' || activeView === 'FRONT_REAR') && (
          <svg
            viewBox="0 0 1050 660"
            className="w-full h-auto min-w-[780px] select-none border border-slate-300 dark:border-slate-800"
            role="img"
            aria-label="A-003 Front Elevation and A-004 Rear Elevation 1:100 with 12-degree Split-Level Roof"
          >
            {/* ---------- A-003 FRONT (SOUTH) ELEVATION (Top Half: y=0..320) ---------- */}
            {/* Scale: 1m = 48px => 12.0m wall = 576px, 13.8m roof = 662.4px */}
            {/* FFL (±0.000) at y=245, GL (-0.15m) at y=252.2 */}
            {/* Upper North Ridge (+4.54m) at y=27.1, Lower South Step-Ridge (+4.12m) at y=47.2, Front Eave (+2.80m) at y=110.6 */}
            <text x={24} y={16} fontSize={11.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              A-003 // FRONT (SOUTH) ELEVATION · SCALE 1:100 (12° SPLIT-LEVEL STANDING-SEAM ROOF)
            </text>
            <text x={24} y={26} fontSize={8.5} fontFamily="JetBrains Mono, monospace" className="fill-slate-600 dark:fill-slate-400">
              UPPER RIDGE +4.54m · STEP-RIDGE +4.12m · 12° SOUTH SLOPE TO +2.80m FRONT EAVE
            </text>

            {/* Upper North Wing Clerestory Ridge Step visible above South Wing (+4.54m y=27.1 to +4.12m y=47.2) */}
            <rect
              x={146.8}
              y={27.1}
              width={662.4}
              height={20.1}
              fill="#78716c"
              stroke="#0f172a"
              strokeWidth={1.1}
            />
            {/* South Wing 12° Standing-Seam Roof Plane from +4.12m (y=47.2) down to +2.80m Front Eave (y=110.6) */}
            <rect
              x={146.8}
              y={47.2}
              width={662.4}
              height={63.4}
              fill="#8a847e"
              stroke="#0f172a"
              strokeWidth={1.2}
            />
            {/* Standing-Seam Vertical Ribs on South Wing Roof */}
            {Array.from({ length: 34 }).map((_, i) => (
              <line
                key={i}
                x1={146.8 + i * 20}
                y1={47.2}
                x2={146.8 + i * 20}
                y2={110.6}
                stroke="#44403c"
                strokeWidth={0.7}
              />
            ))}
            {/* Front Taupe-Grey Fascia & Gutter at +2.80m eave */}
            <rect x={146.8} y={110.6} width={662.4} height={7.5} fill="#57534e" stroke="#0f172a" strokeWidth={1} />

            {/* Main Front Wall (x=190 to 766, y=118.1 to 245 FFL, plus plinth to 252.2 GL) */}
            <rect x={190} y={118.1} width={576} height={126.9} fill="#f8fafc" stroke="#0f172a" strokeWidth={1.3} />
            <rect x={190} y={245} width={576} height={7.2} fill="#94a3b8" stroke="#0f172a" strokeWidth={1} />

            {/* Living Window W1 (x=1500..3300mm => x=262..348.4, sill +0.90m => y=201.8, head +2.40m => y=129.8) */}
            <g onClick={() => onSelectOpening('W1')} className="cursor-pointer">
              <rect x={262} y={129.8} width={86.4} height={72} fill="#bae6fd" stroke="#0369a1" strokeWidth={1.3} />
              <line x1={305.2} y1={129.8} x2={305.2} y2={201.8} stroke="#0369a1" strokeWidth={1.1} />
              <text x={305.2} y={168} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W1 (1800×1500)
              </text>
            </g>

            {/* Entrance Door D1 (x=4425..5625mm => x=402.4..460, FFL 0.00 => y=245, head +2.10m => y=144.2) */}
            <g onClick={() => onSelectOpening('D1')} className="cursor-pointer">
              <rect x={402.4} y={144.2} width={57.6} height={100.8} fill="#fef3c7" stroke="#b45309" strokeWidth={1.3} />
              <line x1={441.6} y1={144.2} x2={441.6} y2={245} stroke="#b45309" strokeWidth={1} />
              <text x={431.2} y={195} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#b45309">
                D1 (1200×2100)
              </text>
            </g>

            {/* Stone-Clad Verandah Columns C1 (x=0..225), C2 (x=2887.5..3112.5), C3 (x=5775..6000) + Optional C4 */}
            {[
              { tag: 'C1', xMm: 0 },
              { tag: 'C2', xMm: 2887.5 },
              { tag: 'C3', xMm: 5775 },
              ...(!isCutBack ? [{ tag: 'C4', xMm: 11775 }] : []),
            ].map((col) => {
              const cx = 190 + col.xMm * 0.048;
              return (
                <g key={col.tag}>
                  <rect x={cx} y={118.1} width={10.8} height={126.9} fill="#b45309" fillOpacity={0.35} stroke="#78350f" strokeWidth={1.1} />
                  {Array.from({ length: 10 }).map((_, k) => (
                    <line key={k} x1={cx} y1={124 + k * 12} x2={cx + 10.8} y2={124 + k * 12} stroke="#78350f" strokeWidth={0.7} />
                  ))}
                  <text x={cx + 5.4} y={266} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#78350f">
                    {col.tag}
                  </text>
                </g>
              );
            })}

            {/* Ground Line & DPC */}
            <line x1={110} y1={245} x2={830} y2={245} stroke="#0f172a" strokeWidth={0.8} strokeDasharray="5 3" />
            <line x1={110} y1={252.2} x2={830} y2={252.2} stroke="#0f172a" strokeWidth={1.8} />
            <text x={610} y={175} textAnchor="middle" fontSize={9} fontFamily="Plus Jakarta Sans, sans-serif" fill="#334155">
              12° South Wing Standing-Seam Roof · Smooth sand-cement render
            </text>

            {/* Level Datums on Right */}
            <LevelDatum x={850} y={27.1} levelText="+4.54 m" label="UPPER SPINE RIDGE" lineStartX={809.2} />
            <LevelDatum x={850} y={47.2} levelText="+4.12 m" label="SOUTH STEP-RIDGE" lineStartX={809.2} />
            <LevelDatum x={850} y={110.6} levelText="+2.80 m" label="FRONT LOW EAVE" lineStartX={809.2} />
            <LevelDatum x={850} y={144.2} levelText="+2.10 m" label="DOOR / LINTEL HEAD" lineStartX={766} />
            <LevelDatum x={850} y={240} levelText="±0.000" label="FFL / DPC" lineStartX={766} />
            <LevelDatum x={850} y={262} levelText="-0.15 m" label="EXT. GROUND LEVEL" lineStartX={766} />

            {/* Horizontal Dimension Chain for A-003 */}
            <DimLineH x1={190} x2={262} y={282} valueMm={1500} unit={unit} extStartY={252} extEndY={252} />
            <DimLineH x1={262} x2={348.4} y={282} valueMm={1800} unit={unit} extEndY={202} labelSuffix=" W1" highlight />
            <DimLineH x1={348.4} x2={402.4} y={282} valueMm={1125} unit={unit} extEndY={252} />
            <DimLineH x1={402.4} x2={460} y={282} valueMm={1200} unit={unit} extEndY={245} labelSuffix=" D1" highlight />
            <DimLineH x1={460} x2={766} y={282} valueMm={6375} unit={unit} extEndY={252} labelSuffix=" SOLID WALL" />
            <DimLineH x1={190} x2={766} y={306} valueMm={12000} unit={unit} extStartY={252} extEndY={252} labelSuffix=" OVERALL FRONT WALL" highlight />

            {/* Divider */}
            <line x1={20} y1={330} x2={1030} y2={330} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />

            {/* ---------- A-004 REAR (NORTH) ELEVATION (Bottom Half: y=340..650 — MATCHES UPLOADED REFERENCE PHOTO) ---------- */}
            {/* Scale: 1m = 48px. FFL at y=575, GL at y=582.2 */}
            {/* Rear Low Eave (+3.20m) at y = 575 - 3.20*48 = 421.4 */}
            {/* Upper Spine Ridge (+4.54m) at y = 575 - 4.54*48 = 357.1 */}
            <text x={24} y={346} fontSize={11.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              A-004 // REAR (NORTH) ELEVATION · SCALE 1:100 (12° NORTH WING ROOF &amp; CORNER DOWNPIPES DP1 / DP2)
            </text>
            <text x={24} y={356} fontSize={8.5} fontFamily="JetBrains Mono, monospace" className="fill-slate-600 dark:fill-slate-400">
              12° STANDING-SEAM ROOF (+3.20m EAVE TO +4.54m SPINE RIDGE) · Ø100mm DOWNPIPES DP1 &amp; DP2
            </text>

            {/* 12° North Wing Standing-Seam Roof Plane rising from +3.20m Rear Eave (y=421.4) to +4.54m Ridge (y=357.1) */}
            <rect
              x={146.8}
              y={357.1}
              width={662.4}
              height={64.3}
              fill="#8a847e"
              stroke="#0f172a"
              strokeWidth={1.2}
            />
            {/* Standing-Seam Ribs across North Wing Roof */}
            {Array.from({ length: 34 }).map((_, i) => (
              <line
                key={i}
                x1={146.8 + i * 20}
                y1={357.1}
                x2={146.8 + i * 20}
                y2={421.4}
                stroke="#44403c"
                strokeWidth={0.7}
              />
            ))}
            {/* Rear Taupe-Grey Fascia & Box Gutter at +3.20m (y=421.4..429.4) */}
            <rect x={146.8} y={421.4} width={662.4} height={8} fill="#57534e" stroke="#0f172a" strokeWidth={1.2} />

            {/* Rear Wall (x=190..766, y=429.4..575) */}
            <rect x={190} y={429.4} width={576} height={145.6} fill="#f8fafc" stroke="#0f172a" strokeWidth={1.3} />
            <rect x={190} y={575} width={576} height={7.2} fill="#94a3b8" stroke="#0f172a" strokeWidth={1} />

            {/* Corner Rainwater Downpipes DP2 (Left/NE x=198) and DP1 (Right/NW x=758) matching uploaded photo */}
            {[
              { x: 198, label: 'DP2' },
              { x: 758, label: 'DP1' },
            ].map((dp) => (
              <g key={dp.label}>
                <line x1={dp.x} y1={429.4} x2={dp.x} y2={580} stroke="#292524" strokeWidth={3.2} />
                <circle cx={dp.x} cy={465} r={2.2} fill="#0f172a" />
                <circle cx={dp.x} cy={520} r={2.2} fill="#0f172a" />
                <circle cx={dp.x} cy={565} r={2.2} fill="#0f172a" />
              </g>
            ))}

            {/* W2 Left (Bed 2: 1425..2625mm => x=258.4..316, sill +0.90m => y=531.8, head +2.40m => y=459.8) */}
            <g onClick={() => onSelectOpening('W2')} className="cursor-pointer">
              <rect x={258.4} y={459.8} width={57.6} height={72} fill="#bae6fd" stroke="#292524" strokeWidth={1.4} />
              <line x1={287.2} y1={459.8} x2={287.2} y2={531.8} stroke="#292524" strokeWidth={1.2} />
              <text x={287.2} y={454} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W2 (1200×1500)
              </text>
            </g>

            {/* W4 Bath 2 (4700..5300mm => x=415.6..444.4, sill +1.50m => y=503, head +2.10m => y=474.2) */}
            <g onClick={() => onSelectOpening('W4')} className="cursor-pointer">
              <rect x={415.6} y={474.2} width={28.8} height={28.8} fill="#78716c" stroke="#292524" strokeWidth={1.3} />
              <text x={430} y={468} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W4 (600×600)
              </text>
            </g>

            {/* W4 Bath 1 (6700..7300mm => x=511.6..540.4) */}
            <g onClick={() => onSelectOpening('W4')} className="cursor-pointer">
              <rect x={511.6} y={474.2} width={28.8} height={28.8} fill="#78716c" stroke="#292524" strokeWidth={1.3} />
              <text x={526} y={468} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W4 (600×600)
              </text>
            </g>

            {/* W2 Right (Bed 1: 9375..10575mm => x=640..697.6) */}
            <g onClick={() => onSelectOpening('W2')} className="cursor-pointer">
              <rect x={640} y={459.8} width={57.6} height={72} fill="#bae6fd" stroke="#292524" strokeWidth={1.4} />
              <line x1={668.8} y1={459.8} x2={668.8} y2={531.8} stroke="#292524" strokeWidth={1.2} />
              <text x={668.8} y={454} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W2 (1200×1500)
              </text>
            </g>

            <line x1={110} y1={575} x2={830} y2={575} stroke="#0f172a" strokeWidth={0.8} strokeDasharray="5 3" />
            <line x1={110} y1={582.2} x2={830} y2={582.2} stroke="#0f172a" strokeWidth={1.8} />

            {/* Level Datums */}
            <LevelDatum x={850} y={357.1} levelText="+4.54 m" label="UPPER SPINE RIDGE" lineStartX={809.2} />
            <LevelDatum x={850} y={421.4} levelText="+3.20 m" label="REAR LOW EAVE" lineStartX={809.2} />
            <LevelDatum x={850} y={474.2} levelText="+2.10 m" label="LOUVRE HEAD" lineStartX={766} />
            <LevelDatum x={850} y={503} levelText="+1.50 m" label="W4 PRIVACY SILL" lineStartX={766} />
            <LevelDatum x={850} y={531.8} levelText="+0.90 m" label="W2 WINDOW SILL" lineStartX={766} />
            <LevelDatum x={850} y={575} levelText="±0.000" label="FFL / DPC" lineStartX={766} />

            {/* Rear Dimension Chain */}
            <DimLineH x1={190} x2={258.4} y={612} valueMm={1425} unit={unit} extStartY={582} extEndY={582} />
            <DimLineH x1={258.4} x2={316} y={612} valueMm={1200} unit={unit} extEndY={532} labelSuffix=" W2" highlight />
            <DimLineH x1={316} x2={415.6} y={612} valueMm={2075} unit={unit} extEndY={582} />
            <DimLineH x1={415.6} x2={444.4} y={612} valueMm={600} unit={unit} extEndY={503} labelSuffix=" W4" highlight />
            <DimLineH x1={444.4} x2={511.6} y={612} valueMm={1400} unit={unit} extEndY={582} />
            <DimLineH x1={511.6} x2={540.4} y={612} valueMm={600} unit={unit} extEndY={503} labelSuffix=" W4" highlight />
            <DimLineH x1={540.4} x2={640} y={612} valueMm={2075} unit={unit} extEndY={582} />
            <DimLineH x1={640} x2={697.6} y={612} valueMm={1200} unit={unit} extEndY={532} labelSuffix=" W2" highlight />
            <DimLineH x1={697.6} x2={766} y={612} valueMm={1425} unit={unit} extEndY={582} />
            <DimLineH x1={190} x2={766} y={638} valueMm={12000} unit={unit} extStartY={582} extEndY={582} labelSuffix=" OVERALL REAR WALL" highlight />
          </svg>
        )}

        {/* ==================== A-005 LEFT (WEST) & A-006 RIGHT (EAST) ELEVATIONS ==================== */}
        {(activeView === 'ALL' || activeView === 'LEFT_RIGHT') && (
          <svg
            viewBox="0 0 1050 660"
            className="w-full h-auto min-w-[780px] select-none border border-slate-300 dark:border-slate-800"
            role="img"
            aria-label="A-005 Left West Elevation and A-006 Right East Elevation 1:100 with 12-degree Split-Level Roof"
          >
            {/* ---------- A-005 LEFT (WEST) ELEVATION (Top Half: Rear on Left, Front on Right) ---------- */}
            {/* Scale: 1m = 48px => Main block 9.15m = 439.2px (x=210..649.2), Verandah 1.85m = 88.8px (x=649.2..738) */}
            {/* FFL (±0.000) at y=250, GL (-0.15m) at y=257.2 */}
            {/* North Wing rises 12° from Rear Eave (x=166.8, +3.20m -> y=96.4) to Upper Spine Ridge (x=469.2, +4.54m -> y=32.1) */}
            {/* South Wing falls 12° from Lower Spine Ridge (x=462, +4.12m -> y=52.2) to Front Eave (x=759.6, +2.80m -> y=115.6) */}
            <text x={24} y={24} fontSize={11.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              A-005 // LEFT (WEST) ELEVATION · SCALE 1:100 (REAR LEFT → FRONT RIGHT · 12° SPLIT-LEVEL ROOF)
            </text>
            <text x={24} y={38} fontSize={9} fontFamily="JetBrains Mono, monospace" className="fill-slate-600 dark:fill-slate-400">
              NORTH WING RISES 12° (+3.20m → +4.54m) · 420mm CLERESTORY STEP · SOUTH WING FALLS 12° (+4.12m → +2.80m)
            </text>

            {/* Main Block Split-Level West Gable Wall Polygon */}
            <polygon
              points="210,91 462,36 462,56 649.2,92 649.2,250 210,250"
              fill="#f8fafc"
              stroke="#0f172a"
              strokeWidth={1.3}
            />
            {/* Verandah Open Bay + Stone Column C1 at x=727.2..738 */}
            <rect x={727.2} y={114} width={10.8} height={136} fill="#b45309" fillOpacity={0.35} stroke="#78350f" strokeWidth={1.1} />
            <rect x={210} y={250} width={528} height={7.2} fill="#94a3b8" stroke="#0f172a" strokeWidth={1} />

            {/* North-West Corner Downpipe DP1 */}
            <line x1={206} y1={96.4} x2={206} y2={256} stroke="#292524" strokeWidth={2.6} />

            {/* Clerestory Step Flashing at Central Spine (x=462..469.2) */}
            <rect x={461} y={32.1} width={8} height={24} fill="#57534e" stroke="#0f172a" strokeWidth={1} />

            {/* North Wing 12° Sloping Bargeboard / Fascia (Rear Eave x=166.8, y=96.4 up to Spine Ridge x=469.2, y=32.1) */}
            <polygon
              points="166.8,91.4 469.2,27.1 469.2,36.1 166.8,100.4"
              fill="#57534e"
              stroke="#0f172a"
              strokeWidth={1.2}
            />
            {/* South Wing 12° Sloping Bargeboard / Fascia (Spine Step x=462, y=52.2 down to Front Eave x=759.6, y=115.6) */}
            <polygon
              points="462,47.2 759.6,110.6 759.6,119.6 462,56.2"
              fill="#57534e"
              stroke="#0f172a"
              strokeWidth={1.2}
            />

            <text
              x={315}
              y={54}
              textAnchor="middle"
              fontSize={8.5}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
              fill="#0f172a"
              transform="rotate(-12, 315, 54)"
            >
              12° NORTH WING (+3.20m → +4.54m)
            </text>
            <text
              x={615}
              y={74}
              textAnchor="middle"
              fontSize={8.5}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
              fill="#0f172a"
              transform="rotate(12, 615, 74)"
            >
              12° SOUTH WING (+4.12m → +2.80m)
            </text>

            {/* Bedroom 1 Window W2 (1425..2625mm from Rear => x=278.4..336, sill +0.90m => y=206.8, head +2.40m => y=134.8) */}
            <g onClick={() => onSelectOpening('W2')} className="cursor-pointer">
              <rect x={278.4} y={134.8} width={57.6} height={72} fill="#bae6fd" stroke="#292524" strokeWidth={1.3} />
              <line x1={307.2} y1={134.8} x2={307.2} y2={206.8} stroke="#292524" strokeWidth={1} />
              <text x={307.2} y={222} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W2 (1200×1500)
              </text>
            </g>

            <line x1={120} y1={250} x2={820} y2={250} stroke="#0f172a" strokeWidth={0.8} strokeDasharray="5 3" />
            <line x1={120} y1={257.2} x2={820} y2={257.2} stroke="#0f172a" strokeWidth={1.8} />

            <LevelDatum x={850} y={32.1} levelText="+4.54 m" label="UPPER SPINE RIDGE" lineStartX={469.2} />
            <LevelDatum x={850} y={52.2} levelText="+4.12 m" label="LOWER STEP-RIDGE" lineStartX={462} />
            <LevelDatum x={850} y={96.4} levelText="+3.20 m" label="REAR LOW EAVE" lineStartX={166.8} />
            <LevelDatum x={850} y={115.6} levelText="+2.80 m" label="FRONT LOW EAVE" lineStartX={759.6} />
            <LevelDatum x={850} y={250} levelText="±0.000" label="FFL / DPC" lineStartX={738} />

            {/* West Dimension Chain */}
            <DimLineH x1={210} x2={278.4} y={284} valueMm={1425} unit={unit} extStartY={257} extEndY={257} />
            <DimLineH x1={278.4} x2={336} y={284} valueMm={1200} unit={unit} extEndY={207} labelSuffix=" W2" highlight />
            <DimLineH x1={336} x2={649.2} y={284} valueMm={6525} unit={unit} extEndY={257} labelSuffix=" WEST PIER" />
            <DimLineH x1={649.2} x2={738} y={284} valueMm={1850} unit={unit} extEndY={257} labelSuffix=" VERANDAH" highlight />
            <DimLineH x1={210} x2={649.2} y={308} valueMm={9150} unit={unit} extStartY={257} extEndY={257} labelSuffix=" MAIN BLOCK" />
            <DimLineH x1={210} x2={738} y={326} valueMm={11000} unit={unit} extStartY={257} extEndY={257} labelSuffix=" OVERALL FOOTPRINT" highlight />

            {/* Divider */}
            <line x1={20} y1={342} x2={1030} y2={342} stroke="#cbd5e1" strokeWidth={1} strokeDasharray="4 4" />

            {/* ---------- A-006 RIGHT (EAST) ELEVATION (Bottom Half: Front on Left, Rear on Right) ---------- */}
            {/* Front of Verandah/Overhang on Left (x=210), Front of Main Block at x=298.8, Spine at x=486, Rear of Main Block at x=738 */}
            {/* FFL at y=575, GL at y=582.2 */}
            {/* Front Low Eave (+2.80m) at x=188.4, y=440.6; Lower Spine Ridge (+4.12m) at x=486, y=377.2 */}
            {/* Upper Spine Ridge (+4.54m) at x=478.8, y=357.1; Rear Low Eave (+3.20m) at x=781.2, y=421.4 */}
            <text x={24} y={364} fontSize={11.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              A-006 // RIGHT (EAST) ELEVATION · SCALE 1:100 (FRONT LEFT → REAR RIGHT · 12° SPLIT-LEVEL ROOF)
            </text>
            <text x={24} y={378} fontSize={9} fontFamily="JetBrains Mono, monospace" className="fill-slate-600 dark:fill-slate-400">
              KITCHEN CASEMENT W3 (1200×1200) · PANTRY HIGH LOUVRE W5 (600×600) · BEDROOM 2 CASEMENT W2 · 12° STEP-RIDGE
            </text>

            {/* Main Block Split-Level East Gable Wall (x=298.8..738) */}
            <polygon
              points="298.8,417 486,381 486,361 738,416 738,575 298.8,575"
              fill="#f8fafc"
              stroke="#0f172a"
              strokeWidth={1.3}
            />
            {/* Optional Column C4 on Left (x=210..220.8) */}
            {!isCutBack && (
              <rect x={210} y={439} width={10.8} height={136} fill="#b45309" fillOpacity={0.35} stroke="#78350f" strokeWidth={1.1} />
            )}
            <rect x={298.8} y={575} width={439.2} height={7.2} fill="#94a3b8" stroke="#0f172a" strokeWidth={1} />

            {/* North-East Corner Downpipe DP2 */}
            <line x1={742} y1={421.4} x2={742} y2={581} stroke="#292524" strokeWidth={2.6} />

            {/* Clerestory Step Flashing at Central Spine (x=478.8..486) */}
            <rect x={479} y={357.1} width={8} height={24} fill="#57534e" stroke="#0f172a" strokeWidth={1} />

            {/* South Wing 12° Sloping Bargeboard (Front Left x=188.4, y=440.6 up to Lower Spine Ridge x=486, y=377.2) */}
            <polygon
              points="188.4,435.6 486,372.2 486,381.2 188.4,444.6"
              fill="#57534e"
              stroke="#0f172a"
              strokeWidth={1.2}
            />
            {/* North Wing 12° Sloping Bargeboard (Upper Spine Ridge x=478.8, y=357.1 down to Rear Right Eave x=781.2, y=421.4) */}
            <polygon
              points="478.8,352.1 781.2,416.4 781.2,425.4 478.8,361.1"
              fill="#57534e"
              stroke="#0f172a"
              strokeWidth={1.2}
            />

            {/* W3 Kitchen Window (625..1825mm from Front Main Wall => x=328.8..386.4, sill +0.90m => y=531.8, head +2.10m => y=474.2) */}
            <g onClick={() => onSelectOpening('W3')} className="cursor-pointer">
              <rect x={328.8} y={474.2} width={57.6} height={57.6} fill="#bae6fd" stroke="#0369a1" strokeWidth={1.2} />
              <line x1={357.6} y1={474.2} x2={357.6} y2={531.8} stroke="#0369a1" strokeWidth={1} />
              <text x={357.6} y={546} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W3 (1200×1200)
              </text>
            </g>

            {/* W5 Pantry High-Level Louvre (2775..3375mm from Front Main Wall => x=432..460.8, sill +1.50m => y=503, head +2.10m => y=474.2) */}
            <g onClick={() => onSelectOpening('W5')} className="cursor-pointer">
              <rect x={432} y={474.2} width={28.8} height={28.8} fill="#bae6fd" stroke="#0369a1" strokeWidth={1.2} />
              <text x={446.4} y={517} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W5 (600×600)
              </text>
            </g>

            {/* W2 Bedroom 2 Window (6525..7725mm from Front Main Wall => x=612..669.6, sill +0.90m => y=531.8, head +2.40m => y=459.8) */}
            <g onClick={() => onSelectOpening('W2')} className="cursor-pointer">
              <rect x={612} y={459.8} width={57.6} height={72} fill="#bae6fd" stroke="#0369a1" strokeWidth={1.2} />
              <line x1={640.8} y1={459.8} x2={640.8} y2={531.8} stroke="#0369a1" strokeWidth={1} />
              <text x={640.8} y={546} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W2 (1200×1500)
              </text>
            </g>

            <line x1={120} y1={575} x2={820} y2={575} stroke="#0f172a" strokeWidth={0.8} strokeDasharray="5 3" />
            <line x1={120} y1={582.2} x2={820} y2={582.2} stroke="#0f172a" strokeWidth={1.8} />

            <LevelDatum x={850} y={357.1} levelText="+4.54 m" label="UPPER SPINE RIDGE" lineStartX={478.8} />
            <LevelDatum x={850} y={377.2} levelText="+4.12 m" label="LOWER STEP-RIDGE" lineStartX={486} />
            <LevelDatum x={850} y={421.4} levelText="+3.20 m" label="REAR LOW EAVE" lineStartX={781.2} />
            <LevelDatum x={850} y={440.6} levelText="+2.80 m" label="FRONT LOW EAVE" lineStartX={188.4} />
            <LevelDatum x={850} y={531.8} levelText="+0.90 m" label="W2 / W3 SILL" lineStartX={738} />
            <LevelDatum x={850} y={575} levelText="±0.000" label="FFL / DPC" lineStartX={738} />

            {/* East Dimension Chain */}
            <DimLineH x1={210} x2={298.8} y={608} valueMm={1850} unit={unit} extStartY={582} extEndY={582} labelSuffix=" VER." />
            <DimLineH x1={298.8} x2={328.8} y={608} valueMm={625} unit={unit} extEndY={582} />
            <DimLineH x1={328.8} x2={386.4} y={608} valueMm={1200} unit={unit} extEndY={532} labelSuffix=" W3" highlight />
            <DimLineH x1={386.4} x2={432} y={608} valueMm={950} unit={unit} extEndY={582} />
            <DimLineH x1={432} x2={460.8} y={608} valueMm={600} unit={unit} extEndY={503} labelSuffix=" W5" highlight />
            <DimLineH x1={460.8} x2={612} y={608} valueMm={3150} unit={unit} extEndY={582} />
            <DimLineH x1={612} x2={669.6} y={608} valueMm={1200} unit={unit} extEndY={532} labelSuffix=" W2" highlight />
            <DimLineH x1={669.6} x2={738} y={608} valueMm={1425} unit={unit} extEndY={582} />
            <DimLineH x1={298.8} x2={738} y={634} valueMm={9150} unit={unit} extStartY={582} extEndY={582} labelSuffix=" MAIN BLOCK EAST WALL" highlight />
          </svg>
        )}
      </div>

      <DrawingTitleBlock
        sheetCode="A-003/006"
        sheetTitle="FRONT, REAR, LEFT & RIGHT WORKING ELEVATIONS (12° SPLIT-LEVEL ROOF)"
        scale="1:100"
        unit={unit}
        notes={[
          'Roof specification: 12° Split-Level Clerestory Standing-Seam Aluminium Roof (North Wing +3.20m to +4.54m; South Wing +4.12m to +2.80m).',
          'Standard window sill height: +900mm AFFL for W1 (Living), W2 (Bedrooms), and W3 (Kitchen); high-level louvres W4 & W5 sill at +1,500mm.',
          'External finish: 15mm smooth sand-cement render with 3 coats exterior weather-shield paint; natural stone cladding on verandah columns.',
        ]}
      />
    </div>
  );
};
