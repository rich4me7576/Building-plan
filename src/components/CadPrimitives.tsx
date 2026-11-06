import React from 'react';
import { UnitMode, formatDim } from '../utils/architecturalMath';

interface DimLineHProps {
  x1: number;
  x2: number;
  y: number;
  valueMm: number;
  unit: UnitMode;
  extStartY?: number;
  extEndY?: number;
  labelPrefix?: string;
  labelSuffix?: string;
  color?: string;
  fontSize?: number;
  highlight?: boolean;
}

/**
 * Architectural horizontal dimension string with 45-degree tick marks and extension lines
 */
export const DimLineH: React.FC<DimLineHProps> = ({
  x1,
  x2,
  y,
  valueMm,
  unit,
  extStartY,
  extEndY,
  labelPrefix = '',
  labelSuffix = '',
  color = 'currentColor',
  fontSize = 9.5,
  highlight = false,
}) => {
  const left = Math.min(x1, x2);
  const right = Math.max(x1, x2);
  const midX = (left + right) / 2;
  const spanPx = right - left;
  const text = `${labelPrefix}${formatDim(valueMm, unit)}${labelSuffix}`;
  const tickSize = 3.5;

  return (
    <g className={highlight ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
      {extStartY !== undefined && (
        <line
          x1={left}
          y1={extStartY}
          x2={left}
          y2={y + (y < extStartY ? -4 : 4)}
          stroke={color}
          strokeWidth={0.5}
          strokeOpacity={0.55}
        />
      )}
      {extEndY !== undefined && (
        <line
          x1={right}
          y1={extEndY}
          x2={right}
          y2={y + (y < extEndY ? -4 : 4)}
          stroke={color}
          strokeWidth={0.5}
          strokeOpacity={0.55}
        />
      )}
      {/* Main dimension line */}
      <line x1={left} y1={y} x2={right} y2={y} stroke={color} strokeWidth={highlight ? 1.1 : 0.75} />
      {/* 45-degree architectural ticks */}
      <line
        x1={left - tickSize}
        y1={y + tickSize}
        x2={left + tickSize}
        y2={y - tickSize}
        stroke={color}
        strokeWidth={1.1}
      />
      <line
        x1={right - tickSize}
        y1={y + tickSize}
        x2={right + tickSize}
        y2={y - tickSize}
        stroke={color}
        strokeWidth={1.1}
      />
      {/* Dimension text */}
      <text
        x={midX}
        y={spanPx < 22 ? y - 6 : y - 3}
        textAnchor="middle"
        fontSize={spanPx < 20 ? fontSize - 1.5 : fontSize}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={highlight ? 700 : 600}
        fill={color}
      >
        {text}
      </text>
    </g>
  );
};

interface DimLineVProps {
  y1: number;
  y2: number;
  x: number;
  valueMm: number;
  unit: UnitMode;
  extStartX?: number;
  extEndX?: number;
  labelPrefix?: string;
  labelSuffix?: string;
  color?: string;
  fontSize?: number;
  highlight?: boolean;
  side?: 'left' | 'right';
}

/**
 * Architectural vertical dimension string with 45-degree tick marks and rotated text
 */
export const DimLineV: React.FC<DimLineVProps> = ({
  y1,
  y2,
  x,
  valueMm,
  unit,
  extStartX,
  extEndX,
  labelPrefix = '',
  labelSuffix = '',
  color = 'currentColor',
  fontSize = 9.5,
  highlight = false,
  side = 'left',
}) => {
  const top = Math.min(y1, y2);
  const bottom = Math.max(y1, y2);
  const midY = (top + bottom) / 2;
  const spanPx = bottom - top;
  const text = `${labelPrefix}${formatDim(valueMm, unit)}${labelSuffix}`;
  const tickSize = 3.5;
  const textOffset = side === 'left' ? -4 : 10;

  return (
    <g className={highlight ? 'text-amber-700 dark:text-amber-400' : 'text-slate-700 dark:text-slate-300'}>
      {extStartX !== undefined && (
        <line
          x1={extStartX}
          y1={top}
          x2={x + (x < extStartX ? -4 : 4)}
          y2={top}
          stroke={color}
          strokeWidth={0.5}
          strokeOpacity={0.55}
        />
      )}
      {extEndX !== undefined && (
        <line
          x1={extEndX}
          y1={bottom}
          x2={x + (x < extEndX ? -4 : 4)}
          y2={bottom}
          stroke={color}
          strokeWidth={0.5}
          strokeOpacity={0.55}
        />
      )}
      <line x1={x} y1={top} x2={x} y2={bottom} stroke={color} strokeWidth={highlight ? 1.1 : 0.75} />
      <line
        x1={x - tickSize}
        y1={top + tickSize}
        x2={x + tickSize}
        y2={top - tickSize}
        stroke={color}
        strokeWidth={1.1}
      />
      <line
        x1={x - tickSize}
        y1={bottom + tickSize}
        x2={x + tickSize}
        y2={bottom - tickSize}
        stroke={color}
        strokeWidth={1.1}
      />
      <text
        x={x + textOffset}
        y={midY}
        textAnchor="middle"
        fontSize={spanPx < 20 ? fontSize - 1.5 : fontSize}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={highlight ? 700 : 600}
        fill={color}
        transform={`rotate(-90, ${x + textOffset}, ${midY})`}
      >
        {text}
      </text>
    </g>
  );
};

interface GridBubbleProps {
  x: number;
  y: number;
  label: string;
  lineEndX?: number;
  lineEndY?: number;
}

export const GridBubble: React.FC<GridBubbleProps> = ({
  x,
  y,
  label,
  lineEndX,
  lineEndY,
}) => {
  return (
    <g className="text-sky-800 dark:text-sky-400">
      {lineEndX !== undefined && lineEndY !== undefined && (
        <line
          x1={x}
          y1={y}
          x2={lineEndX}
          y2={lineEndY}
          stroke="currentColor"
          strokeWidth={0.6}
          strokeDasharray="8 3 2 3"
          strokeOpacity={0.45}
        />
      )}
      <circle
        cx={x}
        cy={y}
        r={9}
        className="fill-amber-50 dark:fill-slate-900"
        stroke="currentColor"
        strokeWidth={1.1}
      />
      <text
        x={x}
        y={y + 3.5}
        textAnchor="middle"
        fontSize={9.5}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={700}
        fill="currentColor"
      >
        {label}
      </text>
    </g>
  );
};

interface LevelDatumProps {
  x: number;
  y: number;
  levelText: string;
  label: string;
  lineStartX?: number;
  align?: 'left' | 'right';
}

export const LevelDatum: React.FC<LevelDatumProps> = ({
  x,
  y,
  levelText,
  label,
  lineStartX,
  align = 'right',
}) => {
  const dir = align === 'right' ? 1 : -1;
  return (
    <g className="text-slate-800 dark:text-slate-200">
      {lineStartX !== undefined && (
        <line
          x1={lineStartX}
          y1={y}
          x2={x}
          y2={y}
          stroke="currentColor"
          strokeWidth={0.65}
          strokeDasharray="4 2"
          strokeOpacity={0.65}
        />
      )}
      {/* Datum triangle */}
      <polygon
        points={`${x},${y} ${x + dir * 6},${y - 5} ${x + dir * 6},${y + 5}`}
        fill="currentColor"
      />
      <line
        x1={x}
        y1={y}
        x2={x + dir * 95}
        y2={y}
        stroke="currentColor"
        strokeWidth={0.85}
      />
      <text
        x={x + dir * 10}
        y={y - 3}
        textAnchor={align === 'right' ? 'start' : 'end'}
        fontSize={9.5}
        fontFamily="JetBrains Mono, monospace"
        fontWeight={700}
        fill="currentColor"
      >
        {levelText}
      </text>
      <text
        x={x + dir * 10}
        y={y + 9}
        textAnchor={align === 'right' ? 'start' : 'end'}
        fontSize={8.5}
        fontFamily="Plus Jakarta Sans, sans-serif"
        fontWeight={500}
        className="fill-slate-600 dark:fill-slate-400"
      >
        {label}
      </text>
    </g>
  );
};

interface NorthArrowProps {
  x: number;
  y: number;
}

export const NorthArrow: React.FC<NorthArrowProps> = ({ x, y }) => (
  <g transform={`translate(${x}, ${y})`} className="text-slate-900 dark:text-slate-100">
    <circle cx={0} cy={0} r={18} fill="none" stroke="currentColor" strokeWidth={1} strokeOpacity={0.5} />
    <polygon points="0,-16 -6,10 0,5" fill="currentColor" />
    <polygon points="0,-16 6,10 0,5" fill="none" stroke="currentColor" strokeWidth={1} />
    <text
      x={0}
      y={-22}
      textAnchor="middle"
      fontSize={11}
      fontFamily="Outfit, sans-serif"
      fontWeight={700}
      fill="currentColor"
    >
      N
    </text>
  </g>
);

interface GraphicScaleBarProps {
  x: number;
  y: number;
  pxPerMetre: number;
}

export const GraphicScaleBar: React.FC<GraphicScaleBarProps> = ({ x, y, pxPerMetre }) => {
  const metres = [0, 1, 2, 3, 4, 5];
  return (
    <g transform={`translate(${x}, ${y})`} className="text-slate-800 dark:text-slate-200">
      <text x={0} y={-6} fontSize={8.5} fontFamily="JetBrains Mono, monospace" fontWeight={600} fill="currentColor">
        GRAPHIC SCALE 1:100 (METRES)
      </text>
      {metres.slice(0, -1).map((m, idx) => (
        <rect
          key={m}
          x={m * pxPerMetre}
          y={0}
          width={pxPerMetre}
          height={5}
          fill={idx % 2 === 0 ? 'currentColor' : 'none'}
          stroke="currentColor"
          strokeWidth={0.8}
        />
      ))}
      {metres.map((m) => (
        <text
          key={m}
          x={m * pxPerMetre}
          y={15}
          textAnchor="middle"
          fontSize={8.5}
          fontFamily="JetBrains Mono, monospace"
          fill="currentColor"
        >
          {m === 5 ? '5m' : m}
        </text>
      ))}
    </g>
  );
};

interface TitleBlockProps {
  sheetCode: string;
  sheetTitle: string;
  scale: string;
  unit: UnitMode;
  notes: string[];
}

export const DrawingTitleBlock: React.FC<TitleBlockProps> = ({
  sheetCode,
  sheetTitle,
  scale,
  unit,
  notes,
}) => {
  return (
    <div className="border-t-2 border-slate-900 dark:border-slate-300 bg-[#EFECE4] dark:bg-slate-900/90 px-4 py-3 text-xs text-slate-900 dark:text-slate-100">
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 items-center">
        {/* Project & Client Stamp */}
        <div className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-400 dark:border-slate-700 pb-2 lg:pb-0 lg:pr-4">
          <div className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400">
            PROJECT // SITE WORKING DRAWINGS (NIGERIA)
          </div>
          <div className="font-display font-bold text-sm text-slate-900 dark:text-white">
            PROPOSED 2-BEDROOM BOYS&apos; QUARTERS (GROUND FLOOR)
          </div>
          <div className="text-[11px] text-slate-600 dark:text-slate-300 mt-0.5">
            Footprint: 12,000 × 11,000 mm (Main Block: 12,000 × 9,150 mm) · Walls: 225 Ext / 150 Int Sandcrete
          </div>
        </div>

        {/* Construction Site Notes */}
        <div className="lg:col-span-5 border-b lg:border-b-0 lg:border-r border-slate-400 dark:border-slate-700 pb-2 lg:pb-0 lg:pr-4">
          <div className="text-[10px] font-mono tracking-wider text-slate-500 dark:text-slate-400 mb-0.5">
            MANDATORY SITE SETTING-OUT &amp; CONSTRUCTION NOTES
          </div>
          <ul className="space-y-0.5 text-[11px] text-slate-700 dark:text-slate-300 font-mono">
            {notes.slice(0, 3).map((n, i) => (
              <li key={i} className="truncate">
                {i + 1}. {n}
              </li>
            ))}
          </ul>
        </div>

        {/* Sheet Number, Scale & Dimension Unit Box */}
        <div className="lg:col-span-3 flex items-center justify-between gap-3">
          <div>
            <div className="text-[10px] font-mono text-slate-500 dark:text-slate-400">DRAWING TITLE</div>
            <div className="font-display font-semibold text-xs text-slate-900 dark:text-white">{sheetTitle}</div>
            <div className="font-mono text-[11px] text-slate-600 dark:text-slate-400 mt-0.5">
              Scale: {scale} · Units: {unit === 'mm' ? 'Millimetres (mm)' : 'Metres (m)'}
            </div>
          </div>
          <div className="border-2 border-slate-900 dark:border-amber-400 px-3 py-1.5 text-center shrink-0 bg-white dark:bg-slate-950">
            <div className="text-[9px] font-mono text-slate-500 dark:text-slate-400">SHEET NO.</div>
            <div className="font-mono font-bold text-base tracking-tight text-slate-900 dark:text-amber-400">
              {sheetCode}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
