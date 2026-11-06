import React, { useState } from 'react';
import {
  Printer,
  X,
  Layers,
  Box,
  FileText,
  Check,
  Compass,
  CheckSquare,
  Square,
  Maximize,
  HelpCircle,
  Eye,
} from 'lucide-react';
import { SheetId } from '../App';
import { UnitMode, SiteResolutionConfig } from '../utils/architecturalMath';
import { Perspective3DViewOption, PERSPECTIVE_VIEWS_DATA } from './Perspective3DSheet';

export type PrintScope = 'all-sheets' | 'single-sheet' | '3d-views' | 'current-sheet';

export interface PrintExecutionOptions {
  scope: PrintScope;
  singleSheetId: SheetId;
  selected3DView: Perspective3DViewOption;
  includedSheetIds: string[];
  orientation: 'landscape' | 'portrait';
}

export interface PrintDrawingModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentActiveSheet: SheetId;
  unit: UnitMode;
  config: SiteResolutionConfig;
  liveSnapshotDataUrl?: string | null;
  onExecutePrint: (options: PrintExecutionOptions) => void;
}

interface SheetMeta {
  id: SheetId;
  code: string;
  name: string;
  category: 'Architectural' | 'Structural' | 'MEP' | 'BOQ' | '3D';
  scale: string;
  desc: string;
}

export const ALL_PRINTABLE_SHEETS: SheetMeta[] = [
  {
    id: 'A-000',
    code: 'A-000',
    name: 'Setting-Out Plan & Squaring Diagonals',
    category: 'Architectural',
    scale: '1:100',
    desc: 'Outer pier coordinates, diagonal check strings (15,090mm & 16,279mm), and grid bubbles.',
  },
  {
    id: 'A-001',
    code: 'A-001',
    name: 'Ground Floor Construction Plan',
    category: 'Architectural',
    scale: '1:100',
    desc: 'Full internal room dimensions, wall thicknesses (225/150mm), door swings & window tags.',
  },
  {
    id: 'A-002',
    code: 'A-002',
    name: 'Roof Construction & Rainwater Drainage',
    category: 'Architectural',
    scale: '1:100',
    desc: '12° split-level pitches, gutters, downpipes, +4.54m upper ridge & +4.12m lower ridge.',
  },
  {
    id: 'A-003/006',
    code: 'A-003–006',
    name: 'All Four Elevations (N, S, E, W)',
    category: 'Architectural',
    scale: '1:100',
    desc: 'North, South, East, and West exterior elevations with lintel levels and ground datum.',
  },
  {
    id: 'A-008',
    code: 'A-008',
    name: 'Transverse Cross-Section B–B',
    category: 'Architectural',
    scale: '1:50',
    desc: 'Detailed vertical cut through Bedroom 2, Passage, Dining, Verandah, and roof trusses.',
  },
  {
    id: 'S-001',
    code: 'S-001',
    name: 'Structural Foundation & Ring Beam',
    category: 'Structural',
    scale: '1:100 / 1:20',
    desc: 'Trench strip footings, pad footings, continuous 225×225 RC ring beam rebar details (4Y12).',
  },
  {
    id: 'P-001',
    code: 'P-001',
    name: 'Plumbing & Drainage Layout',
    category: 'MEP',
    scale: '1:100',
    desc: 'PPR cold water supply, soil/waste pipe gradients, inspection chambers & septic connection.',
  },
  {
    id: 'E-001',
    code: 'E-001',
    name: 'Electrical Lighting & Power Plan',
    category: 'MEP',
    scale: '1:100',
    desc: 'Lighting loops, 13A switch sockets, AC & water heater points, distribution board schedule.',
  },
  {
    id: 'Q-001',
    code: 'Q-001',
    name: 'Bill of Quantities & Material Take-Off',
    category: 'BOQ',
    scale: 'Tabular Schedule',
    desc: 'Detailed Bill of Quantities covering sandcrete blocks, cement bags, granite, rebar & roof.',
  },
];

export const PrintDrawingModal: React.FC<PrintDrawingModalProps> = ({
  isOpen,
  onClose,
  currentActiveSheet,
  unit,
  config,
  liveSnapshotDataUrl,
  onExecutePrint,
}) => {
  const [scope, setScope] = useState<PrintScope>(
    currentActiveSheet === '3D-MODEL' ? '3d-views' : 'all-sheets'
  );
  const [selectedSingleSheet, setSelectedSingleSheet] = useState<SheetId>(
    currentActiveSheet === 'ALL-PACK' || currentActiveSheet === '3D-MODEL'
      ? 'A-001'
      : currentActiveSheet
  );
  const [selected3DView, setSelected3DView] = useState<Perspective3DViewOption>(
    liveSnapshotDataUrl ? 'live-snapshot' : 'all'
  );
  const [includedSheets, setIncludedSheets] = useState<Record<string, boolean>>({
    'A-000': true,
    'A-001': true,
    'A-002': true,
    'A-003/006': true,
    'A-008': true,
    'S-001': true,
    'P-001': true,
    'E-001': true,
    'Q-001': true,
    '3D-PERSPECTIVES': true,
  });
  const [orientation, setOrientation] = useState<'landscape' | 'portrait'>('landscape');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const toggleSheetInclusion = (id: string) => {
    setIncludedSheets((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSelectAllSheets = () => {
    const updated: Record<string, boolean> = { '3D-PERSPECTIVES': true };
    ALL_PRINTABLE_SHEETS.forEach((s) => {
      updated[s.id] = true;
    });
    setIncludedSheets(updated);
  };

  const handleSelectArchitecturalOnly = () => {
    const updated: Record<string, boolean> = { '3D-PERSPECTIVES': true };
    ALL_PRINTABLE_SHEETS.forEach((s) => {
      updated[s.id] = s.category === 'Architectural';
    });
    setIncludedSheets(updated);
  };

  const handleSelectEngineeringOnly = () => {
    const updated: Record<string, boolean> = { '3D-PERSPECTIVES': false };
    ALL_PRINTABLE_SHEETS.forEach((s) => {
      updated[s.id] = s.category === 'Structural' || s.category === 'MEP';
    });
    setIncludedSheets(updated);
  };

  const handleConfirmPrint = () => {
    setIsSubmitting(true);
    const activeIncluded = Object.keys(includedSheets).filter((k) => includedSheets[k]);

    onExecutePrint({
      scope,
      singleSheetId: selectedSingleSheet,
      selected3DView,
      includedSheetIds: activeIncluded,
      orientation,
    });

    setTimeout(() => {
      setIsSubmitting(false);
      onClose();
    }, 400);
  };

  // Calculate page count estimate
  let estimatedPages = 1;
  if (scope === 'all-sheets') {
    estimatedPages = Object.values(includedSheets).filter(Boolean).length;
  } else if (scope === '3d-views') {
    estimatedPages = selected3DView === 'all' ? 1 : 1;
  }

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-3 sm:p-5 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby="print-dialog-title"
    >
      <div className="bg-[#FAF8F2] dark:bg-slate-900 border-2 border-slate-900 dark:border-slate-700 w-full max-w-4xl max-h-[92vh] flex flex-col rounded-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* HEADER BAR */}
        <div className="px-6 py-4 bg-[#EFECE4] dark:bg-slate-950 border-b border-slate-300 dark:border-slate-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-md bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 flex items-center justify-center shadow-xs">
              <Printer className="w-5 h-5" />
            </div>
            <div>
              <h2 id="print-dialog-title" className="font-display font-bold text-base text-slate-900 dark:text-white">
                Print &amp; Export Construction Drawing Set
              </h2>
              <p className="text-xs text-slate-600 dark:text-slate-400 font-mono">
                Choose to print all sheets, an individual 2D sheet, or the 3D perspectives to printer or PDF
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Print Dialog"
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* DIALOG BODY */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-slate-900 dark:text-slate-100">
          {/* STEP 1: SCOPE SELECTOR TABS */}
          <div>
            <label className="block text-xs font-mono font-bold tracking-wider uppercase text-amber-800 dark:text-amber-400 mb-2.5">
              1. Select What to Print:
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              <button
                type="button"
                onClick={() => setScope('all-sheets')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  scope === 'all-sheets'
                    ? 'border-slate-900 dark:border-amber-400 bg-white dark:bg-slate-800 shadow-sm ring-2 ring-slate-900 dark:ring-amber-400/40'
                    : 'border-slate-300 dark:border-slate-800 bg-[#EFECE4]/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display font-bold text-xs text-slate-900 dark:text-white">
                    All Sheets
                  </span>
                  <Layers className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  Full 10-Sheet Architectural, Structural, MEP &amp; BOQ Set
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('single-sheet')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  scope === 'single-sheet'
                    ? 'border-slate-900 dark:border-amber-400 bg-white dark:bg-slate-800 shadow-sm ring-2 ring-slate-900 dark:ring-amber-400/40'
                    : 'border-slate-300 dark:border-slate-800 bg-[#EFECE4]/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display font-bold text-xs text-slate-900 dark:text-white">
                    Individual Sheet
                  </span>
                  <FileText className="w-4 h-4 text-sky-600 dark:text-sky-400" />
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  Pick any single sheet (e.g. A-001 Floor Plan, S-001, etc.)
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('3d-views')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  scope === '3d-views'
                    ? 'border-slate-900 dark:border-amber-400 bg-white dark:bg-slate-800 shadow-sm ring-2 ring-slate-900 dark:ring-amber-400/40'
                    : 'border-slate-300 dark:border-slate-800 bg-[#EFECE4]/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display font-bold text-xs text-slate-900 dark:text-white">
                    3D Perspectives
                  </span>
                  <Box className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  Complete Roof, Cutaway, Exploded or Walkthrough Views
                </span>
              </button>

              <button
                type="button"
                onClick={() => setScope('current-sheet')}
                className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                  scope === 'current-sheet'
                    ? 'border-slate-900 dark:border-amber-400 bg-white dark:bg-slate-800 shadow-sm ring-2 ring-slate-900 dark:ring-amber-400/40'
                    : 'border-slate-300 dark:border-slate-800 bg-[#EFECE4]/50 dark:bg-slate-950/50 hover:bg-white dark:hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-display font-bold text-xs text-slate-900 dark:text-white">
                    Current Sheet
                  </span>
                  <Eye className="w-4 h-4 text-violet-600 dark:text-violet-400" />
                </div>
                <span className="text-[11px] text-slate-600 dark:text-slate-400 leading-tight">
                  Instant print of currently active sheet ({currentActiveSheet})
                </span>
              </button>
            </div>
          </div>

          {/* STEP 2: GRANULAR CONFIGURATION ACCORDING TO SELECTED SCOPE */}

          {/* OPTION A: ALL SHEETS CHECKLIST */}
          {scope === 'all-sheets' && (
            <div className="border border-slate-300 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-950/80 space-y-3">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  Sheets Included in Drawing Set ({Object.values(includedSheets).filter(Boolean).length} / 10 Selected)
                </span>
                <div className="flex items-center gap-1.5 text-xs font-mono">
                  <button
                    type="button"
                    onClick={handleSelectAllSheets}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Select All
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectArchitecturalOnly}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Arch Only
                  </button>
                  <button
                    type="button"
                    onClick={handleSelectEngineeringOnly}
                    className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 transition-colors"
                  >
                    Struct &amp; MEP
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
                {ALL_PRINTABLE_SHEETS.map((sheet) => {
                  const isChecked = Boolean(includedSheets[sheet.id]);
                  return (
                    <label
                      key={sheet.id}
                      className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
                        isChecked
                          ? 'border-slate-400 dark:border-slate-700 bg-[#FAF8F2] dark:bg-slate-900'
                          : 'border-slate-200 dark:border-slate-800/60 opacity-60'
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={() => toggleSheetInclusion(sheet.id)}
                        className="mt-0.5 accent-slate-900 dark:accent-amber-500"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-1">
                          <span className="font-mono font-bold text-slate-900 dark:text-white">
                            {sheet.code}
                          </span>
                          <span className="text-[10px] font-mono text-slate-500">
                            {sheet.scale}
                          </span>
                        </div>
                        <span className="block font-medium text-slate-800 dark:text-slate-200 truncate">
                          {sheet.name}
                        </span>
                      </div>
                    </label>
                  );
                })}

                {/* 3D PERSPECTIVES SHEET TOGGLE */}
                <label
                  className={`flex items-start gap-2.5 p-2 rounded border cursor-pointer transition-colors ${
                    includedSheets['3D-PERSPECTIVES']
                      ? 'border-amber-400 dark:border-amber-500/70 bg-amber-50/50 dark:bg-amber-950/20'
                      : 'border-slate-200 dark:border-slate-800/60 opacity-60'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={Boolean(includedSheets['3D-PERSPECTIVES'])}
                    onChange={() => toggleSheetInclusion('3D-PERSPECTIVES')}
                    className="mt-0.5 accent-amber-600 dark:accent-amber-400"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-1">
                      <span className="font-mono font-bold text-amber-800 dark:text-amber-400">
                        A-301
                      </span>
                      <span className="text-[10px] font-mono text-amber-600 dark:text-amber-400 font-semibold">
                        3D Perspectives
                      </span>
                    </div>
                    <span className="block font-medium text-slate-800 dark:text-slate-200 truncate">
                      3D Architectural Visualizations Plate
                    </span>
                  </div>
                </label>
              </div>
            </div>
          )}

          {/* OPTION B: INDIVIDUAL 2D SHEET SELECTION */}
          {scope === 'single-sheet' && (
            <div className="border border-slate-300 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-950/80 space-y-3">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block pb-1 border-b border-slate-200 dark:border-slate-800">
                Choose the Specific Sheet to Print:
              </span>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5 text-xs">
                {ALL_PRINTABLE_SHEETS.map((sheet) => {
                  const isSelected = selectedSingleSheet === sheet.id;
                  return (
                    <button
                      key={sheet.id}
                      type="button"
                      onClick={() => setSelectedSingleSheet(sheet.id)}
                      className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                        isSelected
                          ? 'border-slate-900 dark:border-amber-400 bg-[#FAF8F2] dark:bg-slate-900 ring-2 ring-slate-900 dark:ring-amber-400 font-medium'
                          : 'border-slate-300 dark:border-slate-800 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-bold text-amber-800 dark:text-amber-400">
                          {sheet.code}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          {sheet.scale}
                        </span>
                      </div>
                      <span className="font-display font-semibold text-slate-900 dark:text-white block mb-1">
                        {sheet.name}
                      </span>
                      <span className="text-[11px] text-slate-600 dark:text-slate-400 line-clamp-2">
                        {sheet.desc}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* OPTION C: 3D VIEWS & PERSPECTIVES SELECTOR */}
          {scope === '3d-views' && (
            <div className="border border-slate-300 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-950/80 space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                <span className="text-xs font-mono font-bold text-slate-900 dark:text-white">
                  Select 3D Architectural View for Print Plate:
                </span>
                <span className="text-xs font-mono text-amber-700 dark:text-amber-400 font-semibold">
                  Sheet A-301 · Scale N.T.S.
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                {/* 1. All 3D Views Composite */}
                <button
                  type="button"
                  onClick={() => setSelected3DView('all')}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    selected3DView === 'all'
                      ? 'border-slate-900 dark:border-amber-400 bg-[#FAF8F2] dark:bg-slate-900 ring-2 ring-slate-900 dark:ring-amber-400'
                      : 'border-slate-300 dark:border-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="font-mono font-bold text-xs text-amber-800 dark:text-amber-400 mb-1">
                    ALL 3D VIEWS PLATE (4-IN-1)
                  </div>
                  <div className="h-24 bg-slate-950 rounded flex items-center justify-center overflow-hidden my-1.5 border border-slate-800">
                    <img
                      src="/3d-renders/r3-3d-complete-roof.png"
                      alt="All 3D Views"
                      className="h-full w-full object-cover opacity-90"
                    />
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    Complete 4-view composite presentation sheet with Title Block.
                  </span>
                </button>

                {/* 2. Complete Roof 3D */}
                <button
                  type="button"
                  onClick={() => setSelected3DView('complete-roof')}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    selected3DView === 'complete-roof'
                      ? 'border-slate-900 dark:border-amber-400 bg-[#FAF8F2] dark:bg-slate-900 ring-2 ring-slate-900 dark:ring-amber-400'
                      : 'border-slate-300 dark:border-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white mb-1">
                    COMPLETE ROOF 3D
                  </div>
                  <div className="h-24 bg-slate-950 rounded flex items-center justify-center overflow-hidden my-1.5 border border-slate-800">
                    <img
                      src="/3d-renders/r3-3d-complete-roof.png"
                      alt="Complete Roof 3D"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    12° Split-level roof, eaves overhangs, gutters &amp; front verandah.
                  </span>
                </button>

                {/* 3. Roof Removed Cutaway */}
                <button
                  type="button"
                  onClick={() => setSelected3DView('roof-removed')}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    selected3DView === 'roof-removed'
                      ? 'border-slate-900 dark:border-amber-400 bg-[#FAF8F2] dark:bg-slate-900 ring-2 ring-slate-900 dark:ring-amber-400'
                      : 'border-slate-300 dark:border-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white mb-1">
                    ROOF-REMOVED CUTAWAY
                  </div>
                  <div className="h-24 bg-slate-950 rounded flex items-center justify-center overflow-hidden my-1.5 border border-slate-800">
                    <img
                      src="/3d-renders/r3-3d-roof-removed.png"
                      alt="Roof Removed Cutaway 3D"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    Bird&apos;s-eye interior perspective showing room layout and furniture.
                  </span>
                </button>

                {/* 4. Exploded Structural Assembly */}
                <button
                  type="button"
                  onClick={() => setSelected3DView('exploded')}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    selected3DView === 'exploded'
                      ? 'border-slate-900 dark:border-amber-400 bg-[#FAF8F2] dark:bg-slate-900 ring-2 ring-slate-900 dark:ring-amber-400'
                      : 'border-slate-300 dark:border-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white mb-1">
                    EXPLODED ASSEMBLY 3D
                  </div>
                  <div className="h-24 bg-slate-950 rounded flex items-center justify-center overflow-hidden my-1.5 border border-slate-800">
                    <img
                      src="/3d-renders/r3-3d-exploded.png"
                      alt="Exploded Assembly 3D"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    Separated structural layers: foundation, slab, walls, ring beam, roof.
                  </span>
                </button>

                {/* 5. Interior Walkthrough */}
                <button
                  type="button"
                  onClick={() => setSelected3DView('walkthrough')}
                  className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                    selected3DView === 'walkthrough'
                      ? 'border-slate-900 dark:border-amber-400 bg-[#FAF8F2] dark:bg-slate-900 ring-2 ring-slate-900 dark:ring-amber-400'
                      : 'border-slate-300 dark:border-slate-800 hover:border-slate-500'
                  }`}
                >
                  <div className="font-mono font-bold text-xs text-slate-900 dark:text-white mb-1">
                    INTERIOR WALKTHROUGH 3D
                  </div>
                  <div className="h-24 bg-slate-950 rounded flex items-center justify-center overflow-hidden my-1.5 border border-slate-800">
                    <img
                      src="/3d-renders/r3-3d-walkthrough.png"
                      alt="Interior Walkthrough 3D"
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <span className="text-[11px] text-slate-600 dark:text-slate-400">
                    Human-level 1.6m eye perspective through entrance and hallway.
                  </span>
                </button>

                {/* 6. Live 3D Snapshot */}
                {liveSnapshotDataUrl && (
                  <button
                    type="button"
                    onClick={() => setSelected3DView('live-snapshot')}
                    className={`p-3 rounded-lg border text-left transition-all flex flex-col justify-between ${
                      selected3DView === 'live-snapshot'
                        ? 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/20 ring-2 ring-amber-500'
                        : 'border-slate-300 dark:border-slate-800 hover:border-slate-500'
                    }`}
                  >
                    <div className="font-mono font-bold text-xs text-amber-700 dark:text-amber-400 mb-1">
                      LIVE VIEWPORT SNAPSHOT
                    </div>
                    <div className="h-24 bg-slate-950 rounded flex items-center justify-center overflow-hidden my-1.5 border border-slate-800">
                      <img
                        src={liveSnapshotDataUrl}
                        alt="Live Snapshot"
                        className="h-full w-full object-contain"
                      />
                    </div>
                    <span className="text-[11px] text-slate-600 dark:text-slate-400">
                      Active camera position captured directly from real-time 3D canvas.
                    </span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* OPTION D: CURRENT SHEET SUMMARY */}
          {scope === 'current-sheet' && (
            <div className="border border-slate-300 dark:border-slate-800 rounded-lg p-4 bg-white dark:bg-slate-950/80 space-y-2">
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-white block">
                Target Sheet:
              </span>
              <div className="p-3 bg-[#EFECE4] dark:bg-slate-900 rounded border border-slate-300 dark:border-slate-800 flex items-center justify-between">
                <div>
                  <span className="font-mono font-bold text-amber-800 dark:text-amber-400 block text-sm">
                    {currentActiveSheet}
                  </span>
                  <span className="text-xs text-slate-700 dark:text-slate-300 font-medium">
                    {currentActiveSheet === '3D-MODEL'
                      ? 'Interactive 3D Architectural Model View'
                      : ALL_PRINTABLE_SHEETS.find((s) => s.id === currentActiveSheet)?.name ??
                        'Active Workspace Drawing'}
                  </span>
                </div>
                <span className="px-2.5 py-1 rounded bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 text-xs font-mono font-semibold">
                  1 Page Output
                </span>
              </div>
            </div>
          )}

          {/* STEP 3: PAGE LAYOUT & PRINT SETTINGS */}
          <div className="p-4 bg-[#EFECE4]/70 dark:bg-slate-950/60 rounded-lg border border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
            <div className="flex items-center gap-4">
              <span className="text-slate-700 dark:text-slate-300 font-bold uppercase tracking-wider text-[11px]">
                Page Orientation:
              </span>
              <div className="flex items-center bg-white dark:bg-slate-900 p-0.5 rounded border border-slate-300 dark:border-slate-700">
                <button
                  type="button"
                  onClick={() => setOrientation('landscape')}
                  className={`px-3 py-1 rounded transition-colors ${
                    orientation === 'landscape'
                      ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Landscape (CAD Standard)
                </button>
                <button
                  type="button"
                  onClick={() => setOrientation('portrait')}
                  className={`px-3 py-1 rounded transition-colors ${
                    orientation === 'portrait'
                      ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 font-bold'
                      : 'text-slate-600 dark:text-slate-400'
                  }`}
                >
                  Portrait
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2 text-slate-600 dark:text-slate-400">
              <HelpCircle className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              <span>
                Tip: Select <strong>&ldquo;Save as PDF&rdquo;</strong> in the browser print destination to export a digital drawing file.
              </span>
            </div>
          </div>
        </div>

        {/* FOOTER BAR */}
        <div className="px-6 py-4 bg-[#EFECE4] dark:bg-slate-950 border-t border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-mono text-slate-600 dark:text-slate-400">
            Total Sheets to Print: <strong className="text-slate-900 dark:text-white font-bold">{estimatedPages} Page(s)</strong>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-mono font-medium rounded border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={isSubmitting}
              onClick={handleConfirmPrint}
              className="px-5 py-2 text-xs font-mono font-bold text-white bg-slate-900 dark:bg-amber-500 dark:text-slate-950 rounded hover:opacity-90 transition-opacity flex items-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4" />
              <span>{isSubmitting ? 'Preparing Print...' : 'Print / Save as PDF'}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
