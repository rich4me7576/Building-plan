import React from 'react';
import {
  UnitMode,
  SiteResolutionConfig,
  ROOM_SCHEDULES,
  OPENING_SCHEDULES,
  BOQItem,
  formatDim,
} from '../utils/architecturalMath';
import { DimLineH, DimLineV, DrawingTitleBlock } from './CadPrimitives';
import { QuantitySurveyorReport } from './QuantitySurveyorReport';

interface MepSheetProps {
  unit: UnitMode;
  config: SiteResolutionConfig;
}

export const PlumbingSheet: React.FC<MepSheetProps> = ({ unit }) => {
  // Scale: 0.042 px/mm => 12,000mm = 504px, 9,150mm = 384.3px
  // Let Building NW (0,0) sit at X = 240, Y = 300 so North Septic Tank & Top Dimensions fit cleanly below subtitle
  const S = 0.042;
  const px = (mm: number) => 240 + mm * S;
  const py = (mm: number) => 300 + mm * S;
  const pLen = (mm: number) => mm * S;

  return (
    <div className="print-sheet border-2 border-slate-900 dark:border-slate-300 bg-[#FAF8F2] dark:bg-slate-950 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1060 760"
          className="w-full h-auto min-w-[800px] select-none"
          role="img"
          aria-label="P-001 Plumbing, Cold Water Supply and Sanitary Drainage Layout 1:100"
        >
          <rect
            x={10}
            y={10}
            width={1040}
            height={740}
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
            P-001 // PLUMBING, COLD WATER SUPPLY &amp; SANITARY DRAINAGE WORKING LAYOUT · SCALE 1:100
          </text>
          <text
            x={25}
            y={48}
            fontSize={9.5}
            fontFamily="JetBrains Mono, monospace"
            className="fill-slate-600 dark:fill-slate-400"
          >
            SUPPLY: 32mm MAIN / 25mm CEILING BRANCH / 20mm FIXTURES (uPVC) · DRAINAGE: 100mm SOIL / 50mm WASTE / 75mm FLOOR DRAIN (MIN FALL 1:40)
          </text>

          {/* BASE BUILDING WALLS (Light architectural grey so pipes stand out sharply) */}
          <g fill="#cbd5e1" stroke="#64748b" strokeWidth={0.8}>
            <rect x={px(0)} y={py(0)} width={pLen(12000)} height={pLen(225)} />
            <rect x={px(0)} y={py(8925)} width={pLen(12000)} height={pLen(225)} />
            <rect x={px(0)} y={py(0)} width={pLen(225)} height={pLen(9150)} />
            <rect x={px(11775)} y={py(0)} width={pLen(225)} height={pLen(9150)} />
            <rect x={px(3825)} y={py(225)} width={pLen(150)} height={pLen(3600)} />
            <rect x={px(5925)} y={py(225)} width={pLen(150)} height={pLen(2400)} />
            <rect x={px(8025)} y={py(225)} width={pLen(150)} height={pLen(3600)} />
            <rect x={px(3975)} y={py(2625)} width={pLen(4050)} height={pLen(150)} />
            <rect x={px(225)} y={py(3825)} width={pLen(11550)} height={pLen(150)} />
            <rect x={px(225)} y={py(5175)} width={pLen(11550)} height={pLen(150)} />
            <rect x={px(8625)} y={py(5325)} width={pLen(150)} height={pLen(3600)} />
            <rect x={px(9825)} y={py(5325)} width={pLen(150)} height={pLen(1650)} />
            <rect x={px(9825)} y={py(6825)} width={pLen(1950)} height={pLen(150)} />
          </g>

          {/* ==================== EXTERNAL SANITARY INFRASTRUCTURE ==================== */}
          {/* 1. 1,000L WATER TANK ON 3.0m TOWER (1,500mm West of Building) */}
          <g>
            <circle
              cx={px(-1800)}
              cy={py(100)}
              r={pLen(650)}
              fill="#e0f2fe"
              stroke="#0284c7"
              strokeWidth={1.8}
            />
            <text x={px(-1800)} y={py(180)} textAnchor="middle" fontSize={11} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
              T
            </text>
            <text x={px(-1800)} y={py(1100)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0369a1">
              1,000 L PVC TANK
            </text>
            <text x={px(-1800)} y={py(1380)} textAnchor="middle" fontSize={8} fontFamily="JetBrains Mono, monospace" fill="#0369a1">
              ON 3.0m STEEL TOWER
            </text>
          </g>

          {/* 2. 2-CHAMBER SEPTIC TANK (6,000 L: 3,000 x 1,500 x 1,800mm deep, 3,000mm North of Rear Wall) */}
          <g>
            <rect
              x={px(3800)}
              y={py(-4500)}
              width={pLen(3000)}
              height={pLen(1500)}
              fill="#e7e5e4"
              stroke="#78350f"
              strokeWidth={1.6}
            />
            {/* Internal baffle wall (2/3 primary chamber, 1/3 secondary chamber) */}
            <line
              x1={px(5800)}
              y1={py(-4500)}
              x2={px(5800)}
              y2={py(-3000)}
              stroke="#78350f"
              strokeWidth={1.4}
            />
            <text x={px(5300)} y={py(-3820)} textAnchor="middle" fontSize={9.5} fontFamily="Outfit, sans-serif" fontWeight={700} fill="#78350f">
              SEPTIC TANK (2-CHAMBER, 6,000 L)
            </text>
            <text x={px(5300)} y={py(-3520)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fill="#78350f">
              {formatDim(3000, unit)} × {formatDim(1500, unit)} × {formatDim(1800, unit)} DEEP
            </text>
          </g>

          {/* 3. SOAKAWAY PIT (Ø1,500mm x 3,000mm deep) */}
          <g>
            <circle
              cx={px(9000)}
              cy={py(-3750)}
              r={pLen(750)}
              fill="#f5f5f4"
              stroke="#78350f"
              strokeWidth={1.6}
              strokeDasharray="5 3"
            />
            <text x={px(9000)} y={py(-3820)} textAnchor="middle" fontSize={9.5} fontFamily="Outfit, sans-serif" fontWeight={700} fill="#78350f">
              SOAKAWAY PIT
            </text>
            <text x={px(9000)} y={py(-3520)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fill="#78350f">
              Ø{formatDim(1500, unit)} × {formatDim(3000, unit)} DEEP
            </text>
          </g>

          {/* 4. INSPECTION CHAMBERS IC1, IC2, IC3 (600x600mm) */}
          {[
            { id: 'IC1', x: 5000, y: -1800, label: 'IC1 (600×600)' },
            { id: 'IC2', x: 7500, y: -900, label: 'IC2 (600×600)' },
            { id: 'IC3', x: 12900, y: 8400, label: 'IC3 (600×600)' },
          ].map((ic) => (
            <g key={ic.id}>
              <rect
                x={px(ic.x - 300)}
                y={py(ic.y - 300)}
                width={pLen(600)}
                height={pLen(600)}
                fill="#fef3c7"
                stroke="#92400e"
                strokeWidth={1.3}
              />
              <text
                x={px(ic.x)}
                y={py(ic.y + 80)}
                textAnchor="middle"
                fontSize={8}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill="#92400e"
              >
                {ic.id}
              </text>
            </g>
          ))}

          {/* ==================== SANITARY FIXTURES IN BATH 1, BATH 2 & KITCHEN ==================== */}
          <g stroke="#334155" strokeWidth={1} fill="#ffffff" fontSize={8} fontFamily="JetBrains Mono, monospace" fontWeight={700}>
            {/* Bath 1: SH (4425, 650), WC (5400, 650), WB (5400, 1750) */}
            <rect x={px(4050)} y={py(300)} width={pLen(800)} height={pLen(800)} />
            <text x={px(4450)} y={py(750)} textAnchor="middle" fill="#0f172a" stroke="none">SH1</text>
            <rect x={px(5150)} y={py(350)} width={pLen(550)} height={pLen(600)} />
            <text x={px(5425)} y={py(700)} textAnchor="middle" fill="#0f172a" stroke="none">WC1</text>
            <rect x={px(5200)} y={py(1550)} width={pLen(550)} height={pLen(450)} />
            <text x={px(5475)} y={py(1830)} textAnchor="middle" fill="#0f172a" stroke="none">WB1</text>

            {/* Bath 2: WC (6550, 650), SH (7525, 650), WB (6550, 1750) */}
            <rect x={px(6300)} y={py(350)} width={pLen(550)} height={pLen(600)} />
            <text x={px(6575)} y={py(700)} textAnchor="middle" fill="#0f172a" stroke="none">WC2</text>
            <rect x={px(7150)} y={py(300)} width={pLen(800)} height={pLen(800)} />
            <text x={px(7550)} y={py(750)} textAnchor="middle" fill="#0f172a" stroke="none">SH2</text>
            <rect x={px(6250)} y={py(1550)} width={pLen(550)} height={pLen(450)} />
            <text x={px(6525)} y={py(1830)} textAnchor="middle" fill="#0f172a" stroke="none">WB2</text>

            {/* Kitchen Sink (x=9600..10500, y=8350..8850) */}
            <rect x={px(9600)} y={py(8350)} width={pLen(900)} height={pLen(500)} />
            <text x={px(10050)} y={py(8660)} textAnchor="middle" fill="#0f172a" stroke="none">SINK</text>
          </g>

          {/* ==================== COLD WATER SUPPLY PIPING (BLUE) ==================== */}
          <g stroke="#0284c7" fill="none">
            {/* 32mm uPVC Main from Tank T (-1150, 100) to (6000, 100) */}
            <line x1={px(-1150)} y1={py(100)} x2={px(6000)} y2={py(100)} strokeWidth={2.5} />
            <text x={px(1800)} y={py(-60)} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0284c7" stroke="none">
              32mm uPVC COLD WATER MAIN
            </text>

            {/* 20mm Fixture Branches into Bath 1 & Bath 2 */}
            <polyline points={`${px(4450)},${py(100)} ${px(4450)},${py(300)}`} strokeWidth={1.5} />
            <polyline points={`${px(5425)},${py(100)} ${px(5425)},${py(350)}`} strokeWidth={1.5} />
            <polyline points={`${px(6575)},${py(100)} ${px(6575)},${py(350)}`} strokeWidth={1.5} />
            <polyline points={`${px(7550)},${py(100)} ${px(7550)},${py(300)}`} strokeWidth={1.5} />

            {/* Riser & 25mm Ceiling Void Branch to Wash Basins and Kitchen Sink */}
            <polyline
              points={`${px(6000)},${py(100)} ${px(6000)},${py(1775)}`}
              strokeWidth={2}
            />
            <line x1={px(5750)} y1={py(1775)} x2={px(6250)} y2={py(1775)} strokeWidth={1.5} />
            {/* Dashed 25mm pipe in ceiling void (+3.00m) across Passage & Dining to Kitchen Sink */}
            <polyline
              points={`${px(6000)},${py(1775)} ${px(6000)},${py(4700)} ${px(9200)},${py(4700)} ${px(9200)},${py(8600)} ${px(9600)},${py(8600)}`}
              strokeWidth={2}
              strokeDasharray="6 3"
            />
            <text x={px(7600)} y={py(4550)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#0284c7" stroke="none">
              25mm uPVC IN CEILING VOID (+3.00m)
            </text>
          </g>

          {/* ==================== SOIL & WASTE DRAINAGE PIPING (BROWN) ==================== */}
          <g stroke="#92400e" fill="none">
            {/* 100mm Soil Pipe from WC1 & WC2 to IC1 -> Septic Tank */}
            <polyline
              points={`${px(5425)},${py(350)} ${px(5425)},${py(-900)} ${px(5000)},${py(-900)} ${px(5000)},${py(-1500)}`}
              strokeWidth={2.4}
            />
            <polyline
              points={`${px(6575)},${py(350)} ${px(6575)},${py(-900)} ${px(5425)},${py(-900)}`}
              strokeWidth={2.4}
            />
            {/* IC1 to Septic Tank */}
            <line x1={px(5000)} y1={py(-2100)} x2={px(5000)} y2={py(-3000)} strokeWidth={2.6} />

            {/* Septic Tank Effluent Pipe to Soakaway Pit */}
            <line
              x1={px(6800)}
              y1={py(-3750)}
              x2={px(8250)}
              y2={py(-3750)}
              strokeWidth={2.2}
              strokeDasharray="6 3"
            />

            {/* 50mm Waste & 75mm Floor Drain from SH1, WB1, WB2, SH2 to IC2 -> Soakaway */}
            <polyline
              points={`${px(4450)},${py(300)} ${px(4450)},${py(-550)} ${px(7500)},${py(-550)} ${px(7500)},${py(-600)}`}
              strokeWidth={1.7}
              strokeDasharray="5 2"
            />
            <line x1={px(7550)} y1={py(300)} x2={px(7550)} y2={py(-550)} strokeWidth={1.7} strokeDasharray="5 2" />
            {/* IC2 to Soakaway */}
            <polyline
              points={`${px(7500)},${py(-1200)} ${px(7500)},${py(-2400)} ${px(9000)},${py(-2400)} ${px(9000)},${py(-3000)}`}
              strokeWidth={1.8}
              strokeDasharray="5 2"
            />

            {/* Kitchen 50mm Waste Line through East Wall to IC3 (12900, 8400) -> North along East perimeter to Soakaway */}
            <polyline
              points={`${px(10500)},${py(8600)} ${px(12900)},${py(8600)} ${px(12900)},${py(-3750)} ${px(9750)},${py(-3750)}`}
              strokeWidth={1.8}
              strokeDasharray="6 3"
            />
            <text
              x={px(13150)}
              y={py(3500)}
              textAnchor="middle"
              fontSize={9}
              fontFamily="JetBrains Mono, monospace"
              fontWeight={700}
              fill="#92400e"
              stroke="none"
              transform={`rotate(-90, ${px(13150)}, ${py(3500)})`}
            >
              50mm uPVC KITCHEN WASTE (MIN FALL 1:40 TO SOAKAWAY)
            </text>
          </g>

          {/* SITE SETBACK DIMENSIONS FOR PLUMBING INFRASTRUCTURE */}
          <DimLineV
            y1={py(-3000)}
            y2={py(0)}
            x={px(3400)}
            valueMm={3000}
            unit={unit}
            extStartX={px(3800)}
            extEndX={px(3800)}
            side="left"
            labelSuffix=" MIN CLEAR"
            highlight
          />
          <DimLineH
            x1={px(3800)}
            x2={px(6800)}
            y={py(-4750)}
            valueMm={3000}
            unit={unit}
            extStartY={py(-4500)}
            extEndY={py(-4500)}
            labelSuffix=" SEPTIC TANK"
            highlight
          />
          <DimLineH
            x1={px(6800)}
            x2={px(8250)}
            y={py(-4750)}
            valueMm={1450}
            unit={unit}
            extStartY={py(-3750)}
            extEndY={py(-3750)}
            labelSuffix=" EFFLUENT"
          />

          {/* LEGEND BAR AT BOTTOM */}
          <g transform="translate(240, 705)" fontSize={9.5} fontFamily="JetBrains Mono, monospace" fontWeight={600}>
            <line x1={0} y1={0} x2={45} y2={0} stroke="#0284c7" strokeWidth={2.5} />
            <text x={55} y={3.5} className="fill-slate-800 dark:fill-slate-200">
              Cold Water Supply (uPVC 32 / 25 / 20 mm)
            </text>
            <line x1={340} y1={0} x2={385} y2={0} stroke="#92400e" strokeWidth={2.5} />
            <text x={395} y={3.5} className="fill-slate-800 dark:fill-slate-200">
              Soil 100mm / Waste 50mm / Floor Drain 75mm (Fall 1:40 min)
            </text>
          </g>
        </svg>
      </div>

      <DrawingTitleBlock
        sheetCode="P-001"
        sheetTitle="PLUMBING, WATER SUPPLY & SANITARY DRAINAGE LAYOUT"
        scale="1:100"
        unit={unit}
        notes={[
          'Storage: 1,000L PVC overhead tank on 3.0m steel tower set 1.50m West of building; 32mm main with stopcock at building entry.',
          'Drainage: 100mm uPVC soil from WCs to IC1 & 6,000L 2-chamber septic tank; 50mm waste & 75mm floor drains to IC2/IC3 & soakaway.',
          'Verify soil percolation, water table depth, and minimum 3,000mm septic tank setback from foundation trenches on site.',
        ]}
      />
    </div>
  );
};

export const ElectricalSheet: React.FC<MepSheetProps> = ({ unit }) => {
  const S = 0.048;
  const ex = (mm: number) => 200 + mm * S;
  const ey = (mm: number) => 95 + mm * S;
  const eLen = (mm: number) => mm * S;

  // Ceiling light positions (mm)
  const ceilingLights = [
    { x: 1500, y: 1400, ckt: 'L2' },
    { x: 2600, y: 2600, ckt: 'L2' },
    { x: 4800, y: 1400, ckt: 'L2' },
    { x: 7200, y: 1400, ckt: 'L2' },
    { x: 9400, y: 1400, ckt: 'L2' },
    { x: 10500, y: 2600, ckt: 'L2' },
    { x: 2000, y: 4575, ckt: 'L2' },
    { x: 6000, y: 4575, ckt: 'L2' },
    { x: 9800, y: 4575, ckt: 'L2' },
    { x: 1600, y: 6300, ckt: 'L1' },
    { x: 3800, y: 6300, ckt: 'L1' },
    { x: 1600, y: 8000, ckt: 'L1' },
    { x: 3800, y: 8000, ckt: 'L1' },
    { x: 7100, y: 7100, ckt: 'L1 (Pendant)' },
    { x: 9600, y: 8000, ckt: 'L2' },
    { x: 10900, y: 7600, ckt: 'L2' },
    { x: 1800, y: 9800, ckt: 'L1 (Verandah)' },
    { x: 4200, y: 9800, ckt: 'L1 (Verandah)' },
  ];

  // Double 13A Socket positions (mm)
  const sockets = [
    // Bed 1 (4x S2)
    { x: 350, y: 800 },
    { x: 350, y: 3100 },
    { x: 2900, y: 350 },
    { x: 3700, y: 1500 },
    // Bed 2 (4x S3)
    { x: 9000, y: 350 },
    { x: 8300, y: 1500 },
    { x: 11650, y: 800 },
    { x: 11650, y: 3100 },
    // Living & Dining (6x S1)
    { x: 350, y: 5800 },
    { x: 1200, y: 5450 },
    { x: 3200, y: 5450 },
    { x: 5600, y: 5450 },
    { x: 1000, y: 8800 },
    { x: 6500, y: 8800 },
    // Kitchen (5x K1)
    { x: 8900, y: 5450 },
    { x: 9500, y: 8800 },
    { x: 10300, y: 8800 },
    { x: 11100, y: 8800 },
    { x: 11650, y: 8200 },
  ];

  // Exterior Security Lights (4x L1)
  const securityLights = [
    { x: -350, y: -350 },
    { x: 12350, y: -350 },
    { x: -350, y: 9500 },
    { x: 12350, y: 9500 },
  ];

  return (
    <div className="print-sheet border-2 border-slate-900 dark:border-slate-300 bg-[#FAF8F2] dark:bg-slate-950 overflow-hidden">
      <div className="w-full overflow-x-auto">
        <svg
          viewBox="0 0 1060 720"
          className="w-full h-auto min-w-[800px] select-none"
          role="img"
          aria-label="E-001 Electrical Lighting, Power, HVAC and Earthing Layout 1:100"
        >
          <rect
            x={10}
            y={10}
            width={1040}
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
            E-001 // ELECTRICAL LIGHTING, POWER, AC RADIALS &amp; EARTHING WORKING LAYOUT · SCALE 1:100
          </text>
          <text
            x={25}
            y={48}
            fontSize={9.5}
            fontFamily="JetBrains Mono, monospace"
            className="fill-slate-600 dark:fill-slate-400"
          >
            230V 50Hz SINGLE PHASE · MAIN DB AT ENTRANCE · LIGHTING: 1.5mm² PVC/PVC · SOCKETS: 2.5mm² · AC1–AC3: 4.0mm² · EARTH: 16mm²
          </text>

          {/* BASE BUILDING WALLS */}
          <g fill="#cbd5e1" stroke="#64748b" strokeWidth={0.8}>
            <rect x={ex(0)} y={ey(0)} width={eLen(12000)} height={eLen(225)} />
            <rect x={ex(0)} y={ey(8925)} width={eLen(12000)} height={eLen(225)} />
            <rect x={ex(0)} y={ey(0)} width={eLen(225)} height={eLen(9150)} />
            <rect x={ex(11775)} y={ey(0)} width={eLen(225)} height={eLen(9150)} />
            <rect x={ex(3825)} y={ey(225)} width={eLen(150)} height={eLen(3600)} />
            <rect x={ex(5925)} y={ey(225)} width={eLen(150)} height={eLen(2400)} />
            <rect x={ex(8025)} y={ey(225)} width={eLen(150)} height={eLen(3600)} />
            <rect x={ex(3975)} y={ey(2625)} width={eLen(4050)} height={eLen(150)} />
            <rect x={ex(225)} y={ey(3825)} width={eLen(11550)} height={eLen(150)} />
            <rect x={ex(225)} y={ey(5175)} width={eLen(11550)} height={eLen(150)} />
            <rect x={ex(8625)} y={ey(5325)} width={eLen(150)} height={eLen(3600)} />
            <rect x={ex(9825)} y={ey(5325)} width={eLen(150)} height={eLen(1650)} />
            <rect x={ex(9825)} y={ey(6825)} width={eLen(1950)} height={eLen(150)} />
          </g>

          {/* CEILING LIGHT SYMBOLS (Circle with X) */}
          {ceilingLights.map((lt, idx) => {
            const cx = ex(lt.x);
            const cy = ey(lt.y);
            return (
              <g key={idx} stroke="#0f172a" strokeWidth={1.1} className="dark:stroke-amber-300">
                <circle cx={cx} cy={cy} r={7.5} fill="#fef3c7" />
                <line x1={cx - 5.2} y1={cy - 5.2} x2={cx + 5.2} y2={cy + 5.2} />
                <line x1={cx + 5.2} y1={cy - 5.2} x2={cx - 5.2} y2={cy + 5.2} />
              </g>
            );
          })}

          {/* DOUBLE 13A SWITCHED SOCKETS (Solid Black Square) */}
          {sockets.map((sk, idx) => (
            <rect
              key={idx}
              x={ex(sk.x) - 4}
              y={ey(sk.y) - 4}
              width={8}
              height={8}
              fill="#0f172a"
              stroke="#ffffff"
              strokeWidth={0.6}
            />
          ))}

          {/* 4x EXTERIOR SECURITY LIGHTS */}
          {securityLights.map((sl, idx) => (
            <g key={idx}>
              <circle cx={ex(sl.x)} cy={ey(sl.y)} r={5.5} fill="#0f172a" stroke="#d97706" strokeWidth={1.2} />
              <text x={ex(sl.x)} y={ey(sl.y) - 9} textAnchor="middle" fontSize={7.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#b45309">
                SEC.L1
              </text>
            </g>
          ))}

          {/* DEDICATED APPLIANCE & DISTRIBUTION TAGS (DB, AC1-AC3, FAN, TV, R, MW, WP, EARTH ROD) */}
          {[
            { tag: 'DB (230V 8-WAY)', x: 4750, y: 5550, color: '#dc2626' },
            { tag: 'AC1 (20A)', x: 3450, y: 450, color: '#0284c7' },
            { tag: 'AC2 (20A)', x: 8550, y: 450, color: '#0284c7' },
            { tag: 'AC3 (20A)', x: 2300, y: 5550, color: '#0284c7' },
            { tag: 'FAN', x: 5450, y: 1100, color: '#0f172a' },
            { tag: 'FAN', x: 6550, y: 1100, color: '#0f172a' },
            { tag: 'TV', x: 550, y: 8600, color: '#0f172a' },
            { tag: 'R (FRIDGE)', x: 9250, y: 6950, color: '#7c2d12' },
            { tag: 'MW', x: 9250, y: 7650, color: '#7c2d12' },
            { tag: 'WP (IP66)', x: 3750, y: 9500, color: '#0f172a' },
          ].map((eq, idx) => (
            <g key={idx}>
              <rect
                x={ex(eq.x) - 24}
                y={ey(eq.y) - 8}
                width={48}
                height={15}
                rx={2}
                fill="#ffffff"
                stroke={eq.color}
                strokeWidth={1.1}
              />
              <text
                x={ex(eq.x)}
                y={ey(eq.y) + 2.5}
                textAnchor="middle"
                fontSize={7.5}
                fontFamily="JetBrains Mono, monospace"
                fontWeight={700}
                fill={eq.color}
              >
                {eq.tag}
              </text>
            </g>
          ))}

          {/* COPPER EARTH ROD PIT (16 x 2400mm copper-bonded rod at Front Central Wall) */}
          <g>
            <circle cx={ex(6000)} cy={ey(9750)} r={10} fill="#ecfdf5" stroke="#059669" strokeWidth={1.4} />
            <text x={ex(6000)} y={ey(9750) + 3} textAnchor="middle" fontSize={9} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#059669">
              E
            </text>
            <text x={ex(6000)} y={ey(10200)} textAnchor="middle" fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} fill="#059669">
              EARTH PIT (Ø16×2400mm COPPER ROD · 16mm² CABLE)
            </text>
          </g>

          {/* ZONE CIRCUIT ANNOTATIONS */}
          <g fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={700} className="fill-slate-600 dark:fill-slate-400">
            <text x={ex(2025)} y={ey(2100)} textAnchor="middle">BED 1 · CKT S2 / L2 / AC1</text>
            <text x={ex(9975)} y={ey(2100)} textAnchor="middle">BED 2 · CKT S3 / L2 / AC2</text>
            <text x={ex(6000)} y={ey(3250)} textAnchor="middle">BATHS &amp; FANS · CKT L2</text>
            <text x={ex(2800)} y={ey(7200)} textAnchor="middle">LIVING · CKT S1 / L1 / AC3</text>
            <text x={ex(7100)} y={ey(8200)} textAnchor="middle">DINING · CKT S1 / L1</text>
            <text x={ex(10300)} y={ey(6400)} textAnchor="middle">KITCHEN · CKT K1 / D1</text>
          </g>

          {/* MOUNTING HEIGHT SCHEDULE CALLOUT BAR */}
          <g transform="translate(190, 650)" fontSize={8.5} fontFamily="JetBrains Mono, monospace" className="fill-slate-800 dark:fill-slate-200">
            <text x={0} y={0} fontWeight={700}>
              SITE ROUGH-IN MOUNTING HEIGHTS (AFFL):
            </text>
            <text x={0} y={14}>
              • General 13A Sockets &amp; TV Point: +300mm AFFL · Light Switches &amp; Fan Isolators: +1,350mm AFFL · Kitchen Worktop Sockets (K1): +1,150mm AFFL
            </text>
            <text x={0} y={28}>
              • Split AC Isolator &amp; Outlet (AC1–AC3): +2,200mm AFFL · Main Consumer Unit (DB): +1,650mm AFFL in 20mm/25mm heavy-gauge concealed uPVC conduits
            </text>
          </g>
        </svg>
      </div>

      <DrawingTitleBlock
        sheetCode="E-001"
        sheetTitle="ELECTRICAL LIGHTING, POWER, AC & EARTHING LAYOUT"
        scale="1:100"
        unit={unit}
        notes={[
          'Supply: Single-phase 230V 50Hz to 8-way MCB Distribution Board (DB) with 63A 30mA RCD protection at Living Room entrance.',
          'Cables: 1.5mm² lighting (L1, L2), 2.5mm² ring/radial sockets (S1–S3, K1, D1), 4.0mm² dedicated AC radials (AC1–AC3).',
          'Earthing: 16mm² green/yellow copper cable to Ø16×2,400mm copper-bonded earth rod in concrete inspection chamber.',
        ]}
      />
    </div>
  );
};

interface SchedulesAndBoqProps {
  unit: UnitMode;
  config: SiteResolutionConfig;
  boqItems?: BOQItem[];
  onExportCsv?: () => void;
}

export const SchedulesAndBoqSheet: React.FC<SchedulesAndBoqProps> = ({
  unit,
  config,
}) => {
  return <QuantitySurveyorReport unit={unit} config={config} />;
};

