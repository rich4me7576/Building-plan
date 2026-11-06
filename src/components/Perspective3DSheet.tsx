import React from 'react';
import { UnitMode, SiteResolutionConfig } from '../utils/architecturalMath';
import { DrawingTitleBlock } from './CadPrimitives';

export type Perspective3DViewOption =
  | 'all'
  | 'complete-roof'
  | 'roof-removed'
  | 'exploded'
  | 'walkthrough'
  | 'live-snapshot';

export interface Perspective3DSheetProps {
  unit?: UnitMode;
  config?: SiteResolutionConfig;
  selectedView?: Perspective3DViewOption;
  liveSnapshotDataUrl?: string | null;
  sheetCode?: string;
}

export const PERSPECTIVE_VIEWS_DATA = [
  {
    id: 'complete-roof',
    title: 'COMPLETE 12° DUAL-PITCH SPLIT-LEVEL ROOF PERSPECTIVE',
    tag: 'VIEW 01 // EXTERIOR ISOMETRIC',
    image: '/3d-renders/r3-3d-complete-roof.png',
    fallbackImage: '/3d-renders/r4-3d-complete-roof.png',
    caption:
      'Exterior axonometric projection showcasing 12° low-pitch standing seam aluminium sheet roofing (+4.54m upper ridge / +4.12m lower ridge), 600mm eaves overhang, 200mm timber/fascia board, continuous box gutter, and covered front entrance verandah supported by reinforced concrete columns C1 to C4.',
    specs: [
      { label: 'Roof Pitch', val: '12° (Dual Slope)' },
      { label: 'Upper Ridge', val: '+4.54m AFFL' },
      { label: 'Lower Ridge', val: '+4.12m AFFL' },
      { label: 'Eaves Levels', val: '+3.20m & +2.80m' },
      { label: 'External Walls', val: '225mm Sandcrete' },
    ],
  },
  {
    id: 'roof-removed',
    title: 'ROOF-REMOVED CUTAWAY / INTERIOR AXONOMETRIC',
    tag: 'VIEW 02 // INTERIOR SPATIAL LAYOUT',
    image: '/3d-renders/r3-3d-roof-removed.png',
    fallbackImage: '/3d-renders/r4-3d-roof-removed.png',
    caption:
      'Bird\'s-eye cutaway showing complete spatial coordination: Bedroom 1 & 2 (3.60×3.60m clear), ensuite bathrooms (1.95×2.40m), utility/store (4.05×1.05m), 1.20m central corridor, open living room (5.40×3.60m), dining (3.00×3.60m), and kitchen (3.00×3.60m) with pantry.',
    specs: [
      { label: 'Enclosed Area', val: '94.00 m²' },
      { label: 'Total Footprint', val: '120.90 m²' },
      { label: 'Clear Ceiling', val: '+3.00m AFFL' },
      { label: 'Internal Partitions', val: '150mm Sandcrete' },
      { label: 'Bedrooms', val: '2 No. Ensuite' },
    ],
  },
  {
    id: 'exploded',
    title: 'EXPLODED STRUCTURAL COMPONENT SEPARATION',
    tag: 'VIEW 03 // STRUCTURAL ASSEMBLY',
    image: '/3d-renders/r3-3d-exploded.png',
    fallbackImage: '/3d-renders/r3-3d-exploded.png',
    caption:
      'Exploded vertical separation illustrating the complete construction build-up from 900×900×250mm foundation pad footings, 675×225mm strip footings, 150mm reinforced ground slab with BRC mesh, 225mm/150mm sandcrete blockwork, continuous 225×225mm RC lintel ring beam at +2.10m, ceiling joists at +3.00m, to timber roof trusses and 0.55mm gauge standing-seam roofing.',
    specs: [
      { label: 'Foundation', val: 'Strip & Isolated Pads' },
      { label: 'Ground Slab', val: '150mm C25/30 Concrete' },
      { label: 'Ring Beam', val: '225×225 RC (4Y12)' },
      { label: 'Truss Material', val: 'Treated Hardwood / Steel' },
      { label: 'Roof Cladding', val: '0.55mm Standing Seam' },
    ],
  },
  {
    id: 'walkthrough',
    title: 'FIRST-PERSON INTERIOR WALKTHROUGH PERSPECTIVE',
    tag: 'VIEW 04 // GROUND PERSPECTIVE',
    image: '/3d-renders/r3-3d-walkthrough.png',
    fallbackImage: '/3d-renders/r4-3d-walkthrough.png',
    caption:
      'Human eye-level (1.60m eye height) perspective from the front covered verandah looking through the double-leaf entrance door into the central distribution corridor and light-filled living/dining lounge, demonstrating window day-lighting and ventilation.',
    specs: [
      { label: 'Eye Level', val: '+1.60m AFFL' },
      { label: 'Door Opening', val: 'D1: 1200×2100mm' },
      { label: 'Floor Finish', val: 'Vitrified Ceramic Tiles' },
      { label: 'Wall Finish', val: 'Plastered & Painted' },
      { label: 'Ventilation', val: 'Cross Ventilation' },
    ],
  },
];

export const Perspective3DSheet: React.FC<Perspective3DSheetProps> = ({
  unit = 'm',
  config,
  selectedView = 'all',
  liveSnapshotDataUrl,
  sheetCode = 'A-301',
}) => {
  const isAllViews = selectedView === 'all';
  const singleView = PERSPECTIVE_VIEWS_DATA.find((v) => v.id === selectedView);

  return (
    <div className="print-sheet border-2 border-slate-900 dark:border-slate-300 bg-[#FAF8F2] dark:bg-slate-950 overflow-hidden font-sans">
      {/* SHEET HEADER */}
      <div className="px-6 py-4 bg-[#EFECE4] dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-[11px] font-mono font-bold tracking-wider text-amber-700 dark:text-amber-400 uppercase">
            ARCHITECTURAL DRAWING // 3D BIM PERSPECTIVES &amp; VISUALIZATIONS
          </div>
          <h1 className="text-lg font-display font-bold text-slate-900 dark:text-white">
            {isAllViews
              ? 'Complete 3D Architectural Perspectives Set (Axonometric, Cutaway, Exploded & Walkthrough)'
              : selectedView === 'live-snapshot'
              ? 'Real-Time 3D Viewport Snapshot (Interactive Architectural Modeler)'
              : singleView?.title ?? '3D Perspective Presentation Plate'}
          </h1>
          <p className="text-xs text-slate-600 dark:text-slate-400 font-mono mt-0.5">
            Proposed 2-Bedroom Boys&apos; Quarters · Overall Footprint: 12.00m × 11.00m · Main Block: 12.00m × 9.15m · 12° Low-Pitch Standing-Seam Roof
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3 py-1.5 rounded border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-950 text-right font-mono">
            <span className="block text-[9px] text-slate-500 uppercase">Projection</span>
            <span className="font-bold text-xs text-slate-900 dark:text-white">Isometric &amp; Perspective</span>
          </div>
          <div className="px-3 py-1.5 rounded border-2 border-slate-900 dark:border-amber-400 bg-white dark:bg-slate-950 text-center font-mono shrink-0">
            <span className="block text-[9px] text-slate-500 uppercase">Sheet No.</span>
            <span className="font-bold text-sm text-slate-900 dark:text-amber-400">{sheetCode}</span>
          </div>
        </div>
      </div>

      {/* DRAWING CONTENT AREA */}
      <div className="p-5 space-y-6">
        {/* CASE 1: LIVE SNAPSHOT FROM ACTIVE 3D CANVAS */}
        {selectedView === 'live-snapshot' && (
          <div className="space-y-4">
            <div className="border border-slate-300 dark:border-slate-800 rounded bg-[#0B111E] overflow-hidden shadow-md flex items-center justify-center min-h-[460px]">
              {liveSnapshotDataUrl ? (
                <img
                  src={liveSnapshotDataUrl}
                  alt="Live 3D Viewport Snapshot"
                  className="w-full h-auto max-h-[620px] object-contain mx-auto"
                />
              ) : (
                <div className="p-8 text-center text-slate-400 font-mono text-sm">
                  <p>Interactive 3D canvas viewport captured at current camera perspective.</p>
                  <img
                    src="/3d-renders/r3-3d-complete-roof.png"
                    alt="Default 3D Perspective"
                    className="mt-4 max-h-[500px] mx-auto rounded border border-slate-700"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-2.5 bg-[#EFECE4] dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">View Type</span>
                <span className="font-bold text-slate-900 dark:text-white">Live Camera Angle</span>
              </div>
              <div className="p-2.5 bg-[#EFECE4] dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Wall Material</span>
                <span className="font-bold text-slate-900 dark:text-white">225/150mm Sandcrete</span>
              </div>
              <div className="p-2.5 bg-[#EFECE4] dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">Roof Structure</span>
                <span className="font-bold text-slate-900 dark:text-white">12° Dual-Slope Trusses</span>
              </div>
              <div className="p-2.5 bg-[#EFECE4] dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 block uppercase">East Eave Support</span>
                <span className="font-bold text-slate-900 dark:text-white">
                  {config?.eastOverhangMode === 'cut-back-eave' ? 'Cut-Back Eave (0.60m)' : 'Add Column C4 (2.30m)'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* CASE 2: SINGLE SPECIFIC 3D VIEW (LARGE PLATE) */}
        {!isAllViews && selectedView !== 'live-snapshot' && singleView && (
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-300 dark:border-slate-800">
              <span className="text-xs font-mono font-bold text-amber-800 dark:text-amber-400">
                {singleView.tag}
              </span>
              <span className="text-xs font-mono text-slate-500">
                High-Resolution Architectural Model Projection
              </span>
            </div>

            <div className="border border-slate-300 dark:border-slate-800 rounded bg-[#0B111E] overflow-hidden shadow-md flex items-center justify-center min-h-[460px]">
              <img
                src={singleView.image}
                onError={(e) => {
                  if (singleView.fallbackImage) {
                    (e.target as HTMLImageElement).src = singleView.fallbackImage;
                  }
                }}
                alt={singleView.title}
                className="w-full h-auto max-h-[620px] object-contain mx-auto"
              />
            </div>

            <div className="p-3 bg-[#EFECE4] dark:bg-slate-900/80 rounded border border-slate-300 dark:border-slate-800 text-xs">
              <strong className="text-slate-900 dark:text-white font-mono block mb-1">
                ARCHITECTURAL SPECIFICATION &amp; SPATIAL DESCRIPTION:
              </strong>
              <p className="text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                {singleView.caption}
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 font-mono text-xs">
              {singleView.specs.map((sp, idx) => (
                <div
                  key={idx}
                  className="p-2 bg-[#EFECE4] dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-800"
                >
                  <span className="text-[10px] text-slate-500 block uppercase">{sp.label}</span>
                  <span className="font-bold text-slate-900 dark:text-white truncate block">
                    {sp.val}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* CASE 3: ALL 3D VIEWS (COMPOSITE 4-VIEW PRESENTATION PLATE) */}
        {isAllViews && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {PERSPECTIVE_VIEWS_DATA.map((view) => (
                <div
                  key={view.id}
                  className="border border-slate-300 dark:border-slate-800 rounded bg-white dark:bg-slate-900/90 overflow-hidden flex flex-col shadow-xs"
                >
                  <div className="px-3.5 py-2 bg-[#EFECE4] dark:bg-slate-900 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between">
                    <span className="text-[11px] font-mono font-bold text-amber-800 dark:text-amber-400">
                      {view.tag}
                    </span>
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Isometric N.T.S.</span>
                  </div>

                  <div className="bg-[#0B111E] p-2 flex items-center justify-center min-h-[220px]">
                    <img
                      src={view.image}
                      onError={(e) => {
                        if (view.fallbackImage) {
                          (e.target as HTMLImageElement).src = view.fallbackImage;
                        }
                      }}
                      alt={view.title}
                      className="w-full h-auto max-h-[260px] object-contain rounded"
                    />
                  </div>

                  <div className="p-3 flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <h3 className="font-display font-bold text-xs text-slate-900 dark:text-white mb-1">
                        {view.title}
                      </h3>
                      <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal line-clamp-3">
                        {view.caption}
                      </p>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 mt-2.5 pt-2 border-t border-slate-200 dark:border-slate-800 font-mono text-[10px]">
                      {view.specs.slice(0, 2).map((s, i) => (
                        <div key={i}>
                          <span className="text-slate-500 block">{s.label}:</span>
                          <span className="font-bold text-slate-900 dark:text-white">{s.val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* LIVE SNAPSHOT INSET IF AVAILABLE */}
            {liveSnapshotDataUrl && (
              <div className="border border-slate-300 dark:border-slate-800 rounded p-3 bg-[#EFECE4] dark:bg-slate-900 flex flex-col sm:flex-row items-center gap-4">
                <img
                  src={liveSnapshotDataUrl}
                  alt="Live 3D Viewport Snapshot"
                  className="w-48 h-auto rounded border border-slate-400 dark:border-slate-700 bg-slate-950"
                />
                <div className="text-xs font-mono">
                  <span className="font-bold text-slate-900 dark:text-white block mb-0.5">
                    SUPPLEMENTARY LIVE 3D VIEWPORT SNAPSHOT
                  </span>
                  <p className="text-slate-600 dark:text-slate-300 text-[11px] leading-relaxed">
                    Interactive 3D model camera angle captured directly from the real-time Three.js WebGL workspace.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* STANDARD CAD TITLE BLOCK */}
      <DrawingTitleBlock
        sheetCode={sheetCode}
        sheetTitle={
          isAllViews
            ? '3D Architectural Perspectives Set'
            : selectedView === 'live-snapshot'
            ? 'Interactive 3D Modeler Live Snapshot'
            : singleView?.title ?? '3D Architectural Perspective'
        }
        scale="N.T.S. (Isometric / Perspective Projections)"
        unit={unit}
        notes={[
          'All 3D perspectives generated to exact 1:1 metric scale from approved 2D architectural coordinates (12,000 × 11,000 mm).',
          'Coordinate spatial layout with Sheet A-000 (Setting-Out), Sheet A-001 (Floor Plan), and Sheet A-008 (Cross-Section B-B).',
          'Roof pitch is strictly 12° dual-slope standing-seam aluminium sheet with timber trusses anchored to continuous 225×225 RC ring beam.',
        ]}
      />
    </div>
  );
};
