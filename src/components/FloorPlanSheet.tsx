import React from 'react';
import {
  UnitMode,
  SiteResolutionConfig,
  DIMENSION_CHAINS,
  formatDim,
  calculateSettingOutDiagonals,
} from '../utils/architecturalMath';
import {
  DimLineH,
  DimLineV,
  GridBubble,
  NorthArrow,
  GraphicScaleBar,
  DrawingTitleBlock,
} from './CadPrimitives';

export interface FloorPlanSheetProps {
  mode: 'A-001' | 'A-000';
  unit: UnitMode;
  config: SiteResolutionConfig;
  showMasonryChain: boolean;
  showInternalChain: boolean;
  showGridChain: boolean;
  showFurniture: boolean;
  selectedId: string | null;
  onSelectElement: (id: string) => void;
}

const SCALE = 0.052; // 1mm = 0.052px => 12,000mm = 624px, 11,000mm = 572px
const OX = 215; // Origin X for NW External Corner (0,0)
const OY = 195; // Origin Y for NW External Corner (0,0)

const pxX = (mm: number) => OX + mm * SCALE;
const pxY = (mm: number) => OY + mm * SCALE;
const pxLen = (mm: number) => mm * SCALE;

export const FloorPlanSheet: React.FC<FloorPlanSheetProps> = ({
  mode,
  unit,
  config,
  showMasonryChain,
  showInternalChain,
  showGridChain,
  showFurniture,
  selectedId,
  onSelectElement,
}) => {
  const diags = calculateSettingOutDiagonals();

  // Helper to render a sequential horizontal chain of DimensionSegments
  const renderHorizontalChain = (
    segments: typeof DIMENSION_CHAINS.northMasonryOpenings,
    yPos: number,
    extRefY: number,
    highlightOpenings = false
  ) => {
    let cursorMm = 0;
    return segments.map((seg, idx) => {
      const startMm = cursorMm;
      const endMm = cursorMm + seg.lengthMm;
      cursorMm = endMm;
      const isOpening = seg.kind === 'opening';
      return (
        <DimLineH
          key={`${seg.label}-${idx}`}
          x1={pxX(startMm)}
          x2={pxX(endMm)}
          y={yPos}
          valueMm={seg.lengthMm}
          unit={unit}
          extStartY={idx === 0 ? extRefY : undefined}
          extEndY={extRefY}
          labelSuffix={seg.code ? ` (${seg.code})` : ''}
          highlight={highlightOpenings && isOpening}
          fontSize={8.5}
        />
      );
    });
  };

  // Helper to render a sequential vertical chain of DimensionSegments
  const renderVerticalChain = (
    segments: typeof DIMENSION_CHAINS.westMasonryOpenings,
    xPos: number,
    extRefX: number,
    side: 'left' | 'right',
    highlightOpenings = false
  ) => {
    let cursorMm = 0;
    return segments.map((seg, idx) => {
      const startMm = cursorMm;
      const endMm = cursorMm + seg.lengthMm;
      cursorMm = endMm;
      const isOpening = seg.kind === 'opening';
      return (
        <DimLineV
          key={`${seg.label}-${idx}`}
          y1={pxY(startMm)}
          y2={pxY(endMm)}
          x={xPos}
          valueMm={seg.lengthMm}
          unit={unit}
          extStartX={idx === 0 ? extRefX : undefined}
          extEndX={extRefX}
          labelSuffix={seg.code ? ` ${seg.code}` : ''}
          highlight={highlightOpenings && isOpening}
          side={side}
          fontSize={8.5}
        />
      );
    });
  };

  // Vertical Grid X positions in mm
  const vGrids = [
    { label: '1', mm: 112.5 },
    { label: '2', mm: 3900 },
    { label: '3', mm: 6000 },
    { label: '4', mm: 8100 },
    { label: '4A', mm: 8700 },
    { label: '5', mm: 11887.5 },
  ];

  // Horizontal Grid Y positions in mm
  const hGrids = [
    { label: 'A', mm: 112.5 },
    { label: 'B', mm: 2700 },
    { label: 'C', mm: 3900 },
    { label: 'D', mm: 5250 },
    { label: 'E', mm: 6900 },
    { label: 'F', mm: 9037.5 },
    { label: 'G', mm: 10887.5 },
  ];

  // Interactive Room Hotspots
  const roomZones = [
    { id: 'bed-1', label: 'BEDROOM 1', x: 225, y: 225, w: 3600, h: 3600, area: '12.96 m²' },
    { id: 'bath-1', label: 'BATH 1', x: 3975, y: 225, w: 1950, h: 2400, area: '4.68 m²' },
    { id: 'bath-2', label: 'BATH 2', x: 6075, y: 225, w: 1950, h: 2400, area: '4.68 m²' },
    { id: 'bed-2', label: 'BEDROOM 2', x: 8175, y: 225, w: 3600, h: 3600, area: '12.96 m²' },
    { id: 'utility-store', label: 'UTILITY / STORE', x: 3975, y: 2775, w: 4050, h: 1050, area: '4.25 m²' },
    { id: 'passage', label: 'CENTRAL PASSAGE', x: 225, y: 3975, w: 11550, h: 1200, area: '13.86 m²' },
    { id: 'living', label: 'LIVING ROOM', x: 225, y: 5325, w: 5400, h: 3600, area: '19.44 m²' },
    { id: 'dining', label: 'DINING', x: 5625, y: 5325, w: 3000, h: 3600, area: '10.80 m²' },
    { id: 'kitchen', label: 'KITCHEN', x: 8775, y: 5325, w: 3000, h: 3600, area: '10.80 m²' },
    { id: 'pantry', label: 'PANTRY', x: 9975, y: 5325, w: 1800, h: 1500, area: '2.70 m²' },
    { id: 'verandah', label: 'VERANDAH', x: 0, y: 9150, w: 6000, h: 1850, area: '11.10 m²' },
  ];

  return (
    <div className="print-sheet border-2 border-slate-900 dark:border-slate-300 bg-[#FAF8F2] dark:bg-slate-950 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1070 910"
          className="w-full h-auto min-w-[820px] select-none"
          role="img"
          aria-label={
            mode === 'A-001'
              ? 'A-001 Ground Floor Construction Plan 1:100 with multi-tier site dimensions'
              : 'A-000 Site Setting-Out, Profile Board and Squaring Diagonal Plan 1:100'
          }
        >
          <defs>
            {/* Architectural diagonal masonry hatch */}
            <pattern id="masonryHatch" width="6" height="6" patternTransform="rotate(45 0 0)" patternUnits="userSpaceOnUse">
              <line x1="0" y1="0" x2="0" y2="6" stroke="#334155" strokeWidth="0.9" />
            </pattern>
            {/* Wet area ceramic tile grid */}
            <pattern id="wetTileGrid" width="10" height="10" patternUnits="userSpaceOnUse">
              <path d="M 10 0 L 0 0 0 10" fill="none" stroke="#94a3b8" strokeWidth="0.35" strokeOpacity="0.45" />
            </pattern>
            {/* Verandah stoneware floor pattern */}
            <pattern id="verandahGrid" width="14" height="14" patternUnits="userSpaceOnUse">
              <path d="M 14 0 L 0 0 0 14" fill="none" stroke="#b45309" strokeWidth="0.35" strokeOpacity="0.35" />
            </pattern>
          </defs>

          {/* Subtle millimeter drafting sheet border */}
          <rect
            x={10}
            y={10}
            width={1050}
            height={890}
            fill="none"
            stroke="currentColor"
            strokeWidth={1}
            className="text-slate-400 dark:text-slate-700"
          />

          {/* Sheet Header Callout */}
          <text
            x={25}
            y={32}
            fontSize={12}
            fontFamily="Outfit, sans-serif"
            fontWeight={700}
            className="fill-slate-900 dark:fill-slate-100"
          >
            {mode === 'A-001'
              ? 'A-001 // GROUND FLOOR WORKING PLAN · SCALE 1:100 (SITE DIMENSIONED)'
              : 'A-000 // SITE SETTING-OUT, PROFILE BOARD & SQUARING DIAGONALS · SCALE 1:100'}
          </text>
          <text
            x={25}
            y={46}
            fontSize={9.5}
            fontFamily="JetBrains Mono, monospace"
            className="fill-slate-600 dark:fill-slate-400"
          >
            {mode === 'A-001'
              ? `ALL DIMENSIONS IN ${unit === 'mm' ? 'MILLIMETRES (mm)' : 'METRES (m)'} · EXT WALLS: 225mm SANDCRETE · INT WALLS: 150mm SANDCRETE`
              : `1,500mm PROFILE BOARD OFFSET · MAIN BLOCK DIAGONAL = ${formatDim(diags.mainBlockDiagonalMm, unit, true)} · OVERALL DIAGONAL = ${formatDim(diags.overallEnvelopeDiagonalMm, unit, true)}`}
          </text>

          {/* NORTH ARROW & SCALE BAR */}
          <NorthArrow x={1010} y={70} />
          <GraphicScaleBar x={25} y={865} pxPerMetre={1000 * SCALE} />

          {/* STRUCTURAL GRID BUBBLES & AXES */}
          {showGridChain && (
            <g>
              {vGrids.map((g) => (
                <GridBubble
                  key={g.label}
                  x={pxX(g.mm)}
                  y={62}
                  label={g.label}
                  lineEndX={pxX(g.mm)}
                  lineEndY={pxY(11200)}
                />
              ))}
              {hGrids.map((g) => (
                <GridBubble
                  key={g.label}
                  x={42}
                  y={pxY(g.mm)}
                  label={g.label}
                  lineEndX={pxX(12200)}
                  lineEndY={pxY(g.mm)}
                />
              ))}
            </g>
          )}

          {/* MODE A-000: SITE PROFILE BOARD PERIMETER (1500mm outside building walls) */}
          {mode === 'A-000' && (
            <g className="text-amber-700 dark:text-amber-400">
              <rect
                x={pxX(-1200)}
                y={pxY(-1200)}
                width={pxLen(14400)}
                height={pxLen(13400)}
                fill="none"
                stroke="currentColor"
                strokeWidth={1.1}
                strokeDasharray="6 4"
              />
              <text
                x={pxX(6000)}
                y={pxY(-1260)}
                textAnchor="middle"
                fontSize={8.5}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="currentColor"
              >
                CONTINUOUS TIMBER PROFILE BOARD LINE (SET 1,500mm CLEAR OF EXTERNAL WALL FACE)
              </text>
            </g>
          )}

          {/* ROOM FLOOR SURFACES & INTERACTIVE SELECTION ZONES */}
          {roomZones.map((rm) => {
            const isSelected = selectedId === rm.id;
            const isWet = rm.id === 'bath-1' || rm.id === 'bath-2' || rm.id === 'kitchen';
            const isVerandah = rm.id === 'verandah';
            return (
              <g
                key={rm.id}
                onClick={() => onSelectElement(rm.id)}
                className="cursor-pointer group"
              >
                <rect
                  x={pxX(rm.x)}
                  y={pxY(rm.y)}
                  width={pxLen(rm.w)}
                  height={pxLen(rm.h)}
                  fill={
                    isSelected
                      ? 'rgba(217, 119, 6, 0.16)'
                      : isVerandah
                        ? 'url(#verandahGrid)'
                        : isWet
                          ? 'url(#wetTileGrid)'
                          : 'transparent'
                  }
                  stroke={isSelected ? '#d97706' : 'transparent'}
                  strokeWidth={isSelected ? 1.8 : 0}
                />
              </g>
            );
          })}

          {/* EAST FRONT ROOF EAVE OVERHANG ZONE (6000 x 1850mm) */}
          <g>
            <rect
              x={pxX(6000)}
              y={pxY(9150)}
              width={pxLen(6000)}
              height={pxLen(1850)}
              fill="none"
              stroke="#64748b"
              strokeWidth={0.9}
              strokeDasharray="5 3"
            />
            <text
              x={pxX(9000)}
              y={pxY(10020)}
              textAnchor="middle"
              fontSize={8.5}
              fontFamily="JetBrains Mono, monospace"
              className="fill-slate-500 dark:fill-slate-400"
            >
              {config.eastOverhangMode === 'add-column-c4'
                ? 'ROOF OVERHANG SUPPORTED BY COL C4 (225×225)'
                : 'ROOF EAVE CUT BACK TO 900mm FRONT OVERHANG'}
            </text>
          </g>

          {/* FURNITURE, SANITARY FIXTURES & JOINERY (Schematically Scaled) */}
          {showFurniture && mode === 'A-001' && (
            <g stroke="#64748b" strokeWidth={0.75} fill="none" opacity={0.75}>
              {/* Bedroom 1 Double Bed (1800 x 2000mm) + Side Tables + Wardrobe */}
              <rect x={pxX(1125)} y={pxY(225)} width={pxLen(1800)} height={pxLen(2000)} />
              <rect x={pxX(1250)} y={pxY(300)} width={pxLen(700)} height={pxLen(400)} />
              <rect x={pxX(2100)} y={pxY(300)} width={pxLen(700)} height={pxLen(400)} />
              <line x1={pxX(1125)} y1={pxY(850)} x2={pxX(2925)} y2={pxY(850)} />
              {/* Bed 1 Wardrobe (600 x 1800) */}
              <rect x={pxX(3225)} y={pxY(600)} width={pxLen(600)} height={pxLen(1800)} />

              {/* Bedroom 2 Double Bed (1800 x 2000mm) + Wardrobe */}
              <rect x={pxX(9075)} y={pxY(225)} width={pxLen(1800)} height={pxLen(2000)} />
              <rect x={pxX(9200)} y={pxY(300)} width={pxLen(700)} height={pxLen(400)} />
              <rect x={pxX(10050)} y={pxY(300)} width={pxLen(700)} height={pxLen(400)} />
              <line x1={pxX(9075)} y1={pxY(850)} x2={pxX(10875)} y2={pxY(850)} />
              <rect x={pxX(8175)} y={pxY(600)} width={pxLen(600)} height={pxLen(1800)} />

              {/* Bath 1 Sanitary Fixtures: Shower (900x900), WC, Wash Basin */}
              <rect x={pxX(3975)} y={pxY(225)} width={pxLen(900)} height={pxLen(900)} />
              <line x1={pxX(3975)} y1={pxY(225)} x2={pxX(4875)} y2={pxY(1125)} strokeDasharray="2 2" />
              <line x1={pxX(4875)} y1={pxY(225)} x2={pxX(3975)} y2={pxY(1125)} strokeDasharray="2 2" />
              {/* Bath 1 WC */}
              <rect x={pxX(5150)} y={pxY(225)} width={pxLen(450)} height={pxLen(220)} />
              <ellipse cx={pxX(5375)} cy={pxY(650)} rx={pxLen(200)} ry={pxLen(240)} />
              {/* Bath 1 Wash Basin */}
              <rect x={pxX(5425)} y={pxY(1450)} width={pxLen(500)} height={pxLen(420)} rx={3} />

              {/* Bath 2 Sanitary Fixtures: WC, Shower (900x900), Wash Basin */}
              <rect x={pxX(6400)} y={pxY(225)} width={pxLen(450)} height={pxLen(220)} />
              <ellipse cx={pxX(6625)} cy={pxY(650)} rx={pxLen(200)} ry={pxLen(240)} />
              <rect x={pxX(7125)} y={pxY(225)} width={pxLen(900)} height={pxLen(900)} />
              <line x1={pxX(7125)} y1={pxY(225)} x2={pxX(8025)} y2={pxY(1125)} strokeDasharray="2 2" />
              <line x1={pxX(8025)} y1={pxY(225)} x2={pxX(7125)} y2={pxY(1125)} strokeDasharray="2 2" />
              <rect x={pxX(6075)} y={pxY(1450)} width={pxLen(500)} height={pxLen(420)} rx={3} />

              {/* Living Room Sofa Set & Coffee Table */}
              <rect x={pxX(450)} y={pxY(5500)} width={pxLen(2100)} height={pxLen(850)} rx={2} />
              <rect x={pxX(450)} y={pxY(6600)} width={pxLen(850)} height={pxLen(1800)} rx={2} />
              <rect x={pxX(1550)} y={pxY(6800)} width={pxLen(1200)} height={pxLen(700)} />

              {/* Dining 6-Seater Table (1800 x 1000mm) */}
              <rect x={pxX(6200)} y={pxY(6150)} width={pxLen(1800)} height={pxLen(1050)} rx={2} />

              {/* Kitchen L-Shaped 600mm Countertop + Double Sink + 4-Burner Hob */}
              <path
                d={`M ${pxX(8775)} ${pxY(8325)} L ${pxX(11175)} ${pxY(8325)} L ${pxX(11175)} ${pxY(6975)} L ${pxX(11775)} ${pxY(6975)} L ${pxX(11775)} ${pxY(8925)} L ${pxX(8775)} ${pxY(8925)} Z`}
                fill="rgba(148, 163, 184, 0.12)"
              />
              {/* Kitchen Sink */}
              <rect x={pxX(9600)} y={pxY(8400)} width={pxLen(1000)} height={pxLen(450)} />
              <rect x={pxX(9660)} y={pxY(8450)} width={pxLen(420)} height={pxLen(350)} />
              {/* Pantry 400mm shelving */}
              <rect x={pxX(9975)} y={pxY(5325)} width={pxLen(1800)} height={pxLen(400)} strokeDasharray="3 2" />
            </g>
          )}

          {/* MODE A-000: PYTHAGOREAN SETTING-OUT DIAGONAL CHECK LINES */}
          {mode === 'A-000' && (
            <g className="text-rose-700 dark:text-rose-400">
              {/* Main block NW (0,0) to SE (12000, 9150) diagonal = 15,090 mm */}
              <line
                x1={pxX(0)}
                y1={pxY(0)}
                x2={pxX(12000)}
                y2={pxY(9150)}
                stroke="currentColor"
                strokeWidth={1.2}
                strokeDasharray="8 4"
              />
              <text
                x={pxX(6200)}
                y={pxY(4500)}
                textAnchor="middle"
                fontSize={9.5}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="currentColor"
                transform={`rotate(37.3, ${pxX(6200)}, ${pxY(4500)})`}
              >
                MAIN BLOCK DIAGONAL = {formatDim(diags.mainBlockDiagonalMm, unit, true)}
              </text>

              {/* Bedroom 1 internal squaring diagonal = 5,091 mm */}
              <line
                x1={pxX(225)}
                y1={pxY(225)}
                x2={pxX(3825)}
                y2={pxY(3825)}
                stroke="#0369a1"
                strokeWidth={1}
                strokeDasharray="4 3"
              />
              <text
                x={pxX(2025)}
                y={pxY(1900)}
                textAnchor="middle"
                fontSize={8.5}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="#0369a1"
                transform={`rotate(45, ${pxX(2025)}, ${pxY(1900)})`}
              >
                DIAG {formatDim(diags.bedroomInternalDiagonalMm, unit)}
              </text>
            </g>
          )}

          {/* ==================== SANDCRETE BLOCK WALLS (225mm EXT / 150mm INT) ==================== */}
          <g fill="#1e293b" stroke="#0f172a" strokeWidth={0.8} className="dark:fill-slate-300 dark:stroke-white">
            {/* NORTH (REAR) EXTERNAL WALL (y=0 to 225) segmented by W2, W4, W4, W2 */}
            <rect x={pxX(0)} y={pxY(0)} width={pxLen(1425)} height={pxLen(225)} />
            <rect x={pxX(2625)} y={pxY(0)} width={pxLen(2075)} height={pxLen(225)} />
            <rect x={pxX(5300)} y={pxY(0)} width={pxLen(1400)} height={pxLen(225)} />
            <rect x={pxX(7300)} y={pxY(0)} width={pxLen(2075)} height={pxLen(225)} />
            <rect x={pxX(10575)} y={pxY(0)} width={pxLen(1425)} height={pxLen(225)} />

            {/* WEST (LEFT) EXTERNAL WALL (x=0 to 225, y=0 to 9150) segmented by W2 (y=1425..2625) */}
            <rect x={pxX(0)} y={pxY(0)} width={pxLen(225)} height={pxLen(1425)} />
            <rect x={pxX(0)} y={pxY(2625)} width={pxLen(225)} height={pxLen(6525)} />

            {/* EAST (RIGHT) EXTERNAL WALL (x=11775 to 12000, y=0 to 9150) segmented by W2, W5, W3 */}
            <rect x={pxX(11775)} y={pxY(0)} width={pxLen(225)} height={pxLen(1425)} />
            <rect x={pxX(11775)} y={pxY(2625)} width={pxLen(225)} height={pxLen(3150)} />
            <rect x={pxX(11775)} y={pxY(6375)} width={pxLen(225)} height={pxLen(950)} />
            <rect x={pxX(11775)} y={pxY(8525)} width={pxLen(225)} height={pxLen(625)} />

            {/* SOUTH (FRONT) EXTERNAL WALL (y=8925 to 9150) segmented by W1 (1500..3300) and D1 (4425..5625) */}
            <rect x={pxX(0)} y={pxY(8925)} width={pxLen(1500)} height={pxLen(225)} />
            <rect x={pxX(3300)} y={pxY(8925)} width={pxLen(1125)} height={pxLen(225)} />
            <rect x={pxX(5625)} y={pxY(8925)} width={pxLen(6375)} height={pxLen(225)} />

            {/* INTERNAL 150mm SANDCRETE WALLS */}
            {/* Bed 1 / Bath 1 Wall (x=3825..3975, y=225..3975) */}
            <rect x={pxX(3825)} y={pxY(225)} width={pxLen(150)} height={pxLen(3750)} />
            {/* Bath 1 / Bath 2 Wall (x=5925..6075, y=225..2775) */}
            <rect x={pxX(5925)} y={pxY(225)} width={pxLen(150)} height={pxLen(2550)} />
            {/* Bath 2 / Bed 2 Wall (x=8025..8175, y=225..3975) */}
            <rect x={pxX(8025)} y={pxY(225)} width={pxLen(150)} height={pxLen(3750)} />

            {/* Bath 1 & 2 South Wall (y=2625..2775) with D4 doors (4075..4825 and 7175..7925) */}
            <rect x={pxX(3975)} y={pxY(2625)} width={pxLen(100)} height={pxLen(150)} />
            <rect x={pxX(4825)} y={pxY(2625)} width={pxLen(2350)} height={pxLen(150)} />
            <rect x={pxX(7925)} y={pxY(2625)} width={pxLen(100)} height={pxLen(150)} />

            {/* Bedroom 1 South Wall (y=3825..3975) with D2 door (1225..2125) */}
            <rect x={pxX(225)} y={pxY(3825)} width={pxLen(1000)} height={pxLen(150)} />
            <rect x={pxX(2125)} y={pxY(3825)} width={pxLen(1850)} height={pxLen(150)} />

            {/* Bedroom 2 South Wall (y=3825..3975) with D2 door (9875..10775) */}
            <rect x={pxX(8025)} y={pxY(3825)} width={pxLen(1850)} height={pxLen(150)} />
            <rect x={pxX(10775)} y={pxY(3825)} width={pxLen(1000)} height={pxLen(150)} />

            {/* Passage South Spine Wall (y=5175..5325): West segment (x=225..5000) & East segment (x=6200..11775) */}
            <rect x={pxX(225)} y={pxY(5175)} width={pxLen(4775)} height={pxLen(150)} />
            <rect x={pxX(6200)} y={pxY(5175)} width={pxLen(5575)} height={pxLen(150)} />

            {/* Kitchen West Wall (x=8625..8775, y=5325..8925) with D3 door (7225..8125) */}
            <rect x={pxX(8625)} y={pxY(5325)} width={pxLen(150)} height={pxLen(1900)} />
            <rect x={pxX(8625)} y={pxY(8125)} width={pxLen(150)} height={pxLen(800)} />

            {/* Pantry Enclosure Walls: West wall (x=9825..9975, y=5325..6975 with D5 5850..6600) & South wall (y=6825..6975) */}
            <rect x={pxX(9825)} y={pxY(5325)} width={pxLen(150)} height={pxLen(525)} />
            <rect x={pxX(9825)} y={pxY(6600)} width={pxLen(150)} height={pxLen(375)} />
            <rect x={pxX(9825)} y={pxY(6825)} width={pxLen(1950)} height={pxLen(150)} />
          </g>

          {/* VERANDAH RC COLUMNS C1, C2, C3 (225x225mm with stone cladding border) + Optional C4 */}
          <g>
            {[
              { tag: 'C1', x: 0, y: 10775 },
              { tag: 'C2', x: 2887.5, y: 10775 },
              { tag: 'C3', x: 5775, y: 10775 },
              ...(config.eastOverhangMode === 'add-column-c4'
                ? [{ tag: 'C4 (NEW)', x: 11775, y: 10775 }]
                : []),
            ].map((col) => (
              <g key={col.tag}>
                {/* 900x900 dashed pad foundation footprint below */}
                <rect
                  x={pxX(col.x + 112.5 - 450)}
                  y={pxY(col.y + 112.5 - 450)}
                  width={pxLen(900)}
                  height={pxLen(900)}
                  fill="none"
                  stroke="#b45309"
                  strokeWidth={0.75}
                  strokeDasharray="3 2"
                />
                {/* 225x225 RC Column */}
                <rect
                  x={pxX(col.x)}
                  y={pxY(col.y)}
                  width={pxLen(225)}
                  height={pxLen(225)}
                  fill="#0f172a"
                  stroke="#d97706"
                  strokeWidth={1.2}
                />
                <text
                  x={pxX(col.x + 112.5)}
                  y={pxY(col.y + 520)}
                  textAnchor="middle"
                  fontSize={8.5}
                  fontFamily="JetBrains Mono, monospace"
                  fontWeight={700}
                  className="fill-amber-800 dark:fill-amber-400"
                >
                  {col.tag}
                </text>
              </g>
            ))}

            {/* Verandah Slab Perimeter Line */}
            <polyline
              points={`${pxX(0)},${pxY(9150)} ${pxX(0)},${pxY(11000)} ${pxX(6000)},${pxY(11000)} ${pxX(6000)},${pxY(9150)}`}
              fill="none"
              stroke="#0f172a"
              strokeWidth={1.1}
              className="dark:stroke-slate-300"
            />
          </g>

          {/* ==================== WINDOWS (W1 to W5) WITH TAGS ==================== */}
          <g className="cursor-pointer">
            {/* W2 North Bed 1 (1425..2625) */}
            <g onClick={() => onSelectElement('W2')}>
              <rect x={pxX(1425)} y={pxY(0)} width={pxLen(1200)} height={pxLen(225)} fill="#e0f2fe" stroke="#0369a1" strokeWidth={0.9} />
              <line x1={pxX(1425)} y1={pxY(112.5)} x2={pxX(2625)} y2={pxY(112.5)} stroke="#0369a1" strokeWidth={1.1} />
              <text x={pxX(2025)} y={pxY(460)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W2 (1200×1500)
              </text>
            </g>

            {/* W4 North Bath 1 (4700..5300) */}
            <g onClick={() => onSelectElement('W4')}>
              <rect x={pxX(4700)} y={pxY(0)} width={pxLen(600)} height={pxLen(225)} fill="#e0f2fe" stroke="#0369a1" strokeWidth={0.9} />
              <line x1={pxX(4700)} y1={pxY(112.5)} x2={pxX(5300)} y2={pxY(112.5)} stroke="#0369a1" strokeWidth={1.1} />
              <text x={pxX(5000)} y={pxY(460)} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W4 (600)
              </text>
            </g>

            {/* W4 North Bath 2 (6700..7300) */}
            <g onClick={() => onSelectElement('W4')}>
              <rect x={pxX(6700)} y={pxY(0)} width={pxLen(600)} height={pxLen(225)} fill="#e0f2fe" stroke="#0369a1" strokeWidth={0.9} />
              <line x1={pxX(6700)} y1={pxY(112.5)} x2={pxX(7300)} y2={pxY(112.5)} stroke="#0369a1" strokeWidth={1.1} />
              <text x={pxX(7000)} y={pxY(460)} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W4 (600)
              </text>
            </g>

            {/* W2 North Bed 2 (9375..10575) */}
            <g onClick={() => onSelectElement('W2')}>
              <rect x={pxX(9375)} y={pxY(0)} width={pxLen(1200)} height={pxLen(225)} fill="#e0f2fe" stroke="#0369a1" strokeWidth={0.9} />
              <line x1={pxX(9375)} y1={pxY(112.5)} x2={pxX(10575)} y2={pxY(112.5)} stroke="#0369a1" strokeWidth={1.1} />
              <text x={pxX(9975)} y={pxY(460)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W2 (1200×1500)
              </text>
            </g>

            {/* W2 West Bed 1 (y=1425..2625) */}
            <g onClick={() => onSelectElement('W2')}>
              <rect x={pxX(0)} y={pxY(1425)} width={pxLen(225)} height={pxLen(1200)} fill="#e0f2fe" stroke="#0369a1" strokeWidth={0.9} />
              <line x1={pxX(112.5)} y1={pxY(1425)} x2={pxX(112.5)} y2={pxY(2625)} stroke="#0369a1" strokeWidth={1.1} />
              <text x={pxX(350)} y={pxY(2050)} fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W2
              </text>
            </g>

            {/* W2 East Bed 2 (y=1425..2625) */}
            <g onClick={() => onSelectElement('W2')}>
              <rect x={pxX(11775)} y={pxY(1425)} width={pxLen(225)} height={pxLen(1200)} fill="#e0f2fe" stroke="#0369a1" strokeWidth={0.9} />
              <line x1={pxX(11887.5)} y1={pxY(1425)} x2={pxX(11887.5)} y2={pxY(2625)} stroke="#0369a1" strokeWidth={1.1} />
              <text x={pxX(11650)} y={pxY(2050)} textAnchor="end" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W2
              </text>
            </g>

            {/* W5 East Pantry Louvre (y=5775..6375) */}
            <g onClick={() => onSelectElement('W5')}>
              <rect x={pxX(11775)} y={pxY(5775)} width={pxLen(225)} height={pxLen(600)} fill="#e0f2fe" stroke="#0369a1" strokeWidth={0.9} />
              <line x1={pxX(11887.5)} y1={pxY(5775)} x2={pxX(11887.5)} y2={pxY(6375)} stroke="#0369a1" strokeWidth={1.1} />
              <text x={pxX(11680)} y={pxY(5680)} textAnchor="end" fontSize={7.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W5 (600)
              </text>
            </g>

            {/* W3 East Kitchen Casement (y=7325..8525) */}
            <g onClick={() => onSelectElement('W3')}>
              <rect x={pxX(11775)} y={pxY(7325)} width={pxLen(225)} height={pxLen(1200)} fill="#e0f2fe" stroke="#0369a1" strokeWidth={0.9} />
              <line x1={pxX(11887.5)} y1={pxY(7325)} x2={pxX(11887.5)} y2={pxY(8525)} stroke="#0369a1" strokeWidth={1.1} />
              <text x={pxX(11680)} y={pxY(7250)} textAnchor="end" fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W3 (1200)
              </text>
            </g>

            {/* W1 Front Living Sliding Window (x=1500..3300, y=8925..9150) */}
            <g onClick={() => onSelectElement('W1')}>
              <rect x={pxX(1500)} y={pxY(8925)} width={pxLen(1800)} height={pxLen(225)} fill="#e0f2fe" stroke="#0369a1" strokeWidth={0.9} />
              <line x1={pxX(1500)} y1={pxY(9037.5)} x2={pxX(3300)} y2={pxY(9037.5)} stroke="#0369a1" strokeWidth={1.2} />
              <text x={pxX(2400)} y={pxY(8800)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
                W1 (1800×1500 SLIDING)
              </text>
            </g>
          </g>

          {/* ==================== DOORS (D1 to D5) WITH SWING ARCS ==================== */}
          <g className="cursor-pointer" stroke="#b45309" fill="none" strokeWidth={1}>
            {/* D1 Main Entrance (x=4425..5625, y=9150, swings out South) */}
            <g onClick={() => onSelectElement('D1')}>
              <line x1={pxX(4425)} y1={pxY(9150)} x2={pxX(4425)} y2={pxY(10350)} strokeWidth={1.6} />
              <path
                d={`M ${pxX(5625)} ${pxY(9150)} A ${pxLen(1200)} ${pxLen(1200)} 0 0 1 ${pxX(4425)} ${pxY(10350)}`}
                strokeDasharray="3 2"
              />
              <text x={pxX(4850)} y={pxY(9550)} fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#b45309" stroke="none">
                D1 (1200)
              </text>
            </g>

            {/* D2 Bedroom 1 Door (x=1225..2125, y=3825, swings in North) */}
            <g onClick={() => onSelectElement('D2')}>
              <line x1={pxX(1225)} y1={pxY(3825)} x2={pxX(1225)} y2={pxY(2925)} strokeWidth={1.5} />
              <path
                d={`M ${pxX(2125)} ${pxY(3825)} A ${pxLen(900)} ${pxLen(900)} 0 0 0 ${pxX(1225)} ${pxY(2925)}`}
                strokeDasharray="3 2"
              />
              <text x={pxX(1580)} y={pxY(3680)} fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#b45309" stroke="none">
                D2 (900)
              </text>
            </g>

            {/* D2 Bedroom 2 Door (x=9875..10775, y=3825, swings in North) */}
            <g onClick={() => onSelectElement('D2')}>
              <line x1={pxX(10775)} y1={pxY(3825)} x2={pxX(10775)} y2={pxY(2925)} strokeWidth={1.5} />
              <path
                d={`M ${pxX(9875)} ${pxY(3825)} A ${pxLen(900)} ${pxLen(900)} 0 0 1 ${pxX(10775)} ${pxY(2925)}`}
                strokeDasharray="3 2"
              />
              <text x={pxX(10220)} y={pxY(3680)} fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#b45309" stroke="none">
                D2 (900)
              </text>
            </g>

            {/* D4 Bath 1 Door (x=4075..4825, y=2625, swings in North) */}
            <g onClick={() => onSelectElement('D4')}>
              <line x1={pxX(4075)} y1={pxY(2625)} x2={pxX(4075)} y2={pxY(1875)} strokeWidth={1.4} />
              <path
                d={`M ${pxX(4825)} ${pxY(2625)} A ${pxLen(750)} ${pxLen(750)} 0 0 0 ${pxX(4075)} ${pxY(1875)}`}
                strokeDasharray="3 2"
              />
              <text x={pxX(4420)} y={pxY(2540)} fontSize={7.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#b45309" stroke="none">
                D4
              </text>
            </g>

            {/* D4 Bath 2 Door (x=7175..7925, y=2625, swings in North) */}
            <g onClick={() => onSelectElement('D4')}>
              <line x1={pxX(7925)} y1={pxY(2625)} x2={pxX(7925)} y2={pxY(1875)} strokeWidth={1.4} />
              <path
                d={`M ${pxX(7175)} ${pxY(2625)} A ${pxLen(750)} ${pxLen(750)} 0 0 1 ${pxX(7925)} ${pxY(1875)}`}
                strokeDasharray="3 2"
              />
              <text x={pxX(7520)} y={pxY(2540)} fontSize={7.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#b45309" stroke="none">
                D4
              </text>
            </g>

            {/* D3 Kitchen Door (x=8775, y=7225..8125, swings East into Kitchen) */}
            <g onClick={() => onSelectElement('D3')}>
              <line x1={pxX(8775)} y1={pxY(7225)} x2={pxX(9675)} y2={pxY(7225)} strokeWidth={1.5} />
              <path
                d={`M ${pxX(8775)} ${pxY(8125)} A ${pxLen(900)} ${pxLen(900)} 0 0 0 ${pxX(9675)} ${pxY(7225)}`}
                strokeDasharray="3 2"
              />
              <text x={pxX(9120)} y={pxY(7520)} fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#b45309" stroke="none">
                D3 (900)
              </text>
            </g>

            {/* D5 Pantry Door (x=9975, y=5850..6600, swings East into Pantry) */}
            <g onClick={() => onSelectElement('D5')}>
              <line x1={pxX(9975)} y1={pxY(5850)} x2={pxX(10725)} y2={pxY(5850)} strokeWidth={1.4} />
              <path
                d={`M ${pxX(9975)} ${pxY(6600)} A ${pxLen(750)} ${pxLen(750)} 0 0 0 ${pxX(10725)} ${pxY(5850)}`}
                strokeDasharray="3 2"
              />
              <text x={pxX(9350)} y={pxY(6250)} fontSize={7.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#b45309" stroke="none">
                D5 (750)
              </text>
            </g>
          </g>

          {/* ==================== INTERNAL ROOM LABELS & CLEAR DIMENSIONS ==================== */}
          <g className="pointer-events-none">
            {/* Bedroom 1 */}
            <text x={pxX(2025)} y={pxY(1950)} textAnchor="middle" fontSize={10.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              BEDROOM 1
            </text>
            <text x={pxX(2025)} y={pxY(2220)} textAnchor="middle" fontSize={9.5} fontFamily="JetBrains Mono, monospace" fontWeight={600} className="fill-slate-700 dark:fill-slate-300">
              {formatDim(3600, unit)} × {formatDim(3600, unit)} (12.96 m²)
            </text>

            {/* Bath 1 */}
            <text x={pxX(4950)} y={pxY(1350)} textAnchor="middle" fontSize={9.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              BATH 1
            </text>
            <text x={pxX(4950)} y={pxY(1600)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" className="fill-slate-600 dark:fill-slate-400">
              {formatDim(1950, unit)} × {formatDim(2400, unit)}
            </text>

            {/* Bath 2 */}
            <text x={pxX(7050)} y={pxY(1350)} textAnchor="middle" fontSize={9.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              BATH 2
            </text>
            <text x={pxX(7050)} y={pxY(1600)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" className="fill-slate-600 dark:fill-slate-400">
              {formatDim(1950, unit)} × {formatDim(2400, unit)}
            </text>

            {/* Bedroom 2 */}
            <text x={pxX(9975)} y={pxY(1950)} textAnchor="middle" fontSize={10.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              BEDROOM 2
            </text>
            <text x={pxX(9975)} y={pxY(2220)} textAnchor="middle" fontSize={9.5} fontFamily="JetBrains Mono, monospace" fontWeight={600} className="fill-slate-700 dark:fill-slate-300">
              {formatDim(3600, unit)} × {formatDim(3600, unit)} (12.96 m²)
            </text>

            {/* Utility / Store */}
            <text x={pxX(6000)} y={pxY(3250)} textAnchor="middle" fontSize={9} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              UTILITY / STORE BAY
            </text>
            <text x={pxX(6000)} y={pxY(3500)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" className="fill-slate-600 dark:fill-slate-400">
              {formatDim(4050, unit)} × {formatDim(1050, unit)} (4.25 m²)
            </text>

            {/* Central Passage */}
            <text x={pxX(3000)} y={pxY(4650)} textAnchor="middle" fontSize={9.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              PASSAGE ({formatDim(1200, unit)} WIDE × {formatDim(11550, unit)} CLEAR)
            </text>
            <text x={pxX(9000)} y={pxY(4650)} textAnchor="middle" fontSize={9.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              PASSAGE ({formatDim(1200, unit)} CLEAR)
            </text>

            {/* Living Room */}
            <text x={pxX(3200)} y={pxY(7100)} textAnchor="middle" fontSize={11} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              LIVING ROOM
            </text>
            <text x={pxX(3200)} y={pxY(7380)} textAnchor="middle" fontSize={9.5} fontFamily="JetBrains Mono, monospace" fontWeight={600} className="fill-slate-700 dark:fill-slate-300">
              {formatDim(5400, unit)} × {formatDim(3600, unit)} (19.44 m²) · FFL ±0.000
            </text>

            {/* Dining */}
            <text x={pxX(7100)} y={pxY(7650)} textAnchor="middle" fontSize={10.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              DINING
            </text>
            <text x={pxX(7100)} y={pxY(7920)} textAnchor="middle" fontSize={9.5} fontFamily="JetBrains Mono, monospace" fontWeight={600} className="fill-slate-700 dark:fill-slate-300">
              {formatDim(3000, unit)} × {formatDim(3600, unit)} (10.80 m²)
            </text>

            {/* Pantry */}
            <text x={pxX(10950)} y={pxY(6320)} textAnchor="middle" fontSize={8.5} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              PANTRY
            </text>
            <text x={pxX(10950)} y={pxY(6560)} textAnchor="middle" fontSize={7.5} fontFamily="JetBrains Mono, monospace" className="fill-slate-600 dark:fill-slate-400">
              {formatDim(1800, unit)}×{formatDim(1500, unit)}
            </text>

            {/* Kitchen */}
            <text x={pxX(10150)} y={pxY(7650)} textAnchor="middle" fontSize={10} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              KITCHEN
            </text>
            <text x={pxX(10150)} y={pxY(7920)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={600} className="fill-slate-700 dark:fill-slate-300">
              {formatDim(3000, unit)} × {formatDim(3600, unit)}
            </text>

            {/* Verandah */}
            <text x={pxX(3000)} y={pxY(10020)} textAnchor="middle" fontSize={10} fontFamily="Outfit, sans-serif" fontWeight={700} className="fill-slate-900 dark:fill-white">
              COVERED VERANDAH
            </text>
            <text x={pxX(3000)} y={pxY(10280)} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono, monospace" className="fill-slate-700 dark:fill-slate-300">
              {formatDim(6000, unit)} × {formatDim(1850, unit)} (11.10 m²) · -0.015 STEP
            </text>
          </g>

          {/* SECTION B-B CUT MARKER AT X = 1,000 mm */}
          <g className="text-rose-700 dark:text-rose-400">
            <line
              x1={pxX(1000)}
              y1={pxY(-350)}
              x2={pxX(1000)}
              y2={pxY(11350)}
              stroke="currentColor"
              strokeWidth={1.1}
              strokeDasharray="10 4 2 4"
            />
            <polygon points={`${pxX(1000)},${pxY(-350)} ${pxX(760)},${pxY(-350)} ${pxX(850)},${pxY(-500)}`} fill="currentColor" />
            <text x={pxX(1120)} y={pxY(-380)} fontSize={9.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="currentColor">
              B (X=1.00m)
            </text>
            <polygon points={`${pxX(1000)},${pxY(11350)} ${pxX(760)},${pxY(11350)} ${pxX(850)},${pxY(11500)}`} fill="currentColor" />
            <text x={pxX(1120)} y={pxY(11420)} fontSize={9.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="currentColor">
              B (SECT A-008)
            </text>
          </g>

          {/* ==================== MULTI-TIER SITE DIMENSION CHAINS ==================== */}
          {/* TOP (NORTH) 3 TIERS OF DIMENSIONS */}
          {showMasonryChain &&
            renderHorizontalChain(DIMENSION_CHAINS.northMasonryOpenings, 168, OY, true)}
          {showInternalChain &&
            renderHorizontalChain(DIMENSION_CHAINS.northInternalAndWalls, 136, OY, false)}
          <DimLineH
            x1={pxX(0)}
            x2={pxX(12000)}
            y={104}
            valueMm={12000}
            unit={unit}
            extStartY={OY}
            extEndY={OY}
            labelSuffix=" OVERALL BUILDING WIDTH"
            highlight
            fontSize={10}
          />

          {/* BOTTOM (SOUTH) 3 TIERS OF DIMENSIONS */}
          {showMasonryChain &&
            renderHorizontalChain(
              DIMENSION_CHAINS.southMasonryOpenings,
              pxY(11000) + 28,
              pxY(9150),
              true
            )}
          {showInternalChain &&
            renderHorizontalChain(
              DIMENSION_CHAINS.southInternalAndWalls,
              pxY(11000) + 56,
              pxY(9150),
              false
            )}
          {/* Verandah vs East Zone */}
          <DimLineH
            x1={pxX(0)}
            x2={pxX(6000)}
            y={pxY(11000) + 84}
            valueMm={6000}
            unit={unit}
            extStartY={pxY(11000)}
            extEndY={pxY(11000)}
            labelSuffix=" VERANDAH"
            highlight
          />
          <DimLineH
            x1={pxX(6000)}
            x2={pxX(12000)}
            y={pxY(11000) + 84}
            valueMm={6000}
            unit={unit}
            extEndY={pxY(9150)}
            labelSuffix=" EAST FRONT BAY"
          />

          {/* LEFT (WEST) 3 TIERS OF VERTICAL DIMENSIONS */}
          {showMasonryChain &&
            renderVerticalChain(
              DIMENSION_CHAINS.westMasonryOpenings,
              182,
              OX,
              'left',
              true
            )}
          {showInternalChain &&
            renderVerticalChain(
              DIMENSION_CHAINS.westInternalAndWalls,
              148,
              OX,
              'left',
              false
            )}
          <DimLineV
            y1={pxY(0)}
            y2={pxY(9150)}
            x={114}
            valueMm={9150}
            unit={unit}
            extStartX={OX}
            extEndX={OX}
            labelSuffix=" MAIN BLOCK"
            side="left"
            fontSize={9.5}
          />
          <DimLineV
            y1={pxY(9150)}
            y2={pxY(11000)}
            x={114}
            valueMm={1850}
            unit={unit}
            extEndX={OX}
            labelSuffix=" VER."
            side="left"
            fontSize={9}
          />
          <DimLineV
            y1={pxY(0)}
            y2={pxY(11000)}
            x={82}
            valueMm={11000}
            unit={unit}
            extStartX={OX}
            extEndX={OX}
            labelSuffix=" OVERALL DEPTH"
            highlight
            side="left"
            fontSize={10}
          />

          {/* RIGHT (EAST) 2 TIERS OF VERTICAL DIMENSIONS */}
          {showMasonryChain &&
            renderVerticalChain(
              DIMENSION_CHAINS.eastMasonryOpenings,
              pxX(12000) + 32,
              pxX(12000),
              'right',
              true
            )}
          {showInternalChain &&
            renderVerticalChain(
              DIMENSION_CHAINS.eastInternalAndWalls,
              pxX(12000) + 68,
              pxX(12000),
              'right',
              false
            )}
          <DimLineV
            y1={pxY(0)}
            y2={pxY(9150)}
            x={pxX(12000) + 104}
            valueMm={9150}
            unit={unit}
            extStartX={pxX(12000)}
            extEndX={pxX(12000)}
            labelSuffix=" EAST WALL"
            highlight
            side="right"
            fontSize={9.5}
          />
        </svg>
      </div>

      <DrawingTitleBlock
        sheetCode={mode}
        sheetTitle={
          mode === 'A-001'
            ? 'GROUND FLOOR CONSTRUCTION PLAN (FULLY DIMENSIONED)'
            : 'SITE SETTING-OUT, PROFILE BOARD & SQUARING PLAN'
        }
        scale="1:100"
        unit={unit}
        notes={[
          `Verify main block diagonal (${formatDim(diags.mainBlockDiagonalMm, unit, true)}) and overall diagonal (${formatDim(diags.overallEnvelopeDiagonalMm, unit, true)}) before trench excavation.`,
          'External walls: 225mm hollow sandcrete blocks; Internal partitions: 150mm hollow sandcrete blocks in 1:6 cement-sand mortar.',
          `All door & window lintels: 225mm deep RC with min 225mm bearing each side (${config.includeRingBeam ? 'Continuous 225×225mm RC ring beam active' : 'Individual lintels active'}).`,
        ]}
      />
    </div>
  );
};
