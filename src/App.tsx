import React, { useState, useEffect, useMemo } from 'react';
import {
  Ruler,
  Printer,
  Layers,
  CheckCircle2,
  FileText,
  Compass,
  Sun,
  Moon,
  Download,
  ExternalLink,
  X,
  Share2,
} from 'lucide-react';
import {
  UnitMode,
  SiteResolutionConfig,
  ROOM_SCHEDULES,
  OPENING_SCHEDULES,
  formatDim,
  calculateSettingOutDiagonals,
  calculateSiteBOQ,
} from './utils/architecturalMath';
import { FloorPlanSheet } from './components/FloorPlanSheet';
import { RoofPlanSheet, ElevationsSheet } from './components/RoofAndElevationsSheet';
import { SectionBSheet, StructuralSheet } from './components/SectionAndStructuralSheet';
import {
  PlumbingSheet,
  ElectricalSheet,
  SchedulesAndBoqSheet,
} from './components/MepAndSchedulesSheet';
import { WhatsAppShareModal } from './components/WhatsAppShareModal';
import { Building3DViewer } from './components/Building3DViewer';
import { Perspective3DSheet } from './components/Perspective3DSheet';
import {
  PrintDrawingModal,
  PrintExecutionOptions,
} from './components/PrintDrawingModal';

export type SheetId =
  | '3D-MODEL'
  | 'A-301'
  | 'A-001'
  | 'A-000'
  | 'A-002'
  | 'A-003/006'
  | 'A-008'
  | 'S-001'
  | 'P-001'
  | 'E-001'
  | 'Q-001'
  | 'ALL-PACK';

const SHEET_TABS: { id: SheetId; code: string; name: string; group: string }[] = [
  { id: '3D-MODEL', code: '3D BIM', name: 'Interactive 3D Model', group: '3D' },
  { id: 'A-301', code: 'A-301', name: '3D Perspectives', group: '3D' },
  { id: 'A-001', code: 'A-001', name: 'Floor Plan', group: 'Arch' },
  { id: 'A-000', code: 'A-000', name: 'Setting-Out', group: 'Arch' },
  { id: 'A-002', code: 'A-002', name: 'Roof Plan', group: 'Roof' },
  { id: 'A-003/006', code: 'A-003–006', name: 'Elevations (4)', group: 'Roof' },
  { id: 'A-008', code: 'A-008', name: 'Section B–B', group: 'Struct' },
  { id: 'S-001', code: 'S-001', name: 'Structural', group: 'Struct' },
  { id: 'P-001', code: 'P-001', name: 'Plumbing', group: 'MEP' },
  { id: 'E-001', code: 'E-001', name: 'Electrical', group: 'MEP' },
  { id: 'Q-001', code: 'Q-001', name: 'BOQ & Material Take-Off', group: 'BOQ' },
  { id: 'ALL-PACK', code: 'FULL SET', name: 'All Sheets', group: 'BOQ' },
];

export default function App() {
  const [activeSheet, setActiveSheet] = useState<SheetId>('Q-001');
  const [unit, setUnit] = useState<UnitMode>('m');
  const [darkMode, setDarkMode] = useState<boolean>(false);

  // Dimension Layer Visibility Toggles
  const [showMasonryChain, setShowMasonryChain] = useState<boolean>(true);
  const [showInternalChain, setShowInternalChain] = useState<boolean>(true);
  const [showGridChain, setShowGridChain] = useState<boolean>(true);
  const [showFurniture, setShowFurniture] = useState<boolean>(true);

  // Selected room or opening in the interactive CAD / 3D canvas
  const [selectedElementId, setSelectedElementId] = useState<string>('living');
  const [showPdfDrawer, setShowPdfDrawer] = useState<boolean>(false);
  const [showWhatsAppModal, setShowWhatsAppModal] = useState<boolean>(false);

  // Print Drawing Set Modal & Execution State
  const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
  const [printExecutionConfig, setPrintExecutionConfig] =
    useState<PrintExecutionOptions | null>(null);
  const [live3DSnapshotUrl, setLive3DSnapshotUrl] = useState<string | null>(null);
  const snapshotGetterRef = React.useRef<(() => string | null) | null>(null);

  // Site Engineer Resolution Settings (Addresses all Page 9 preliminary conflicts)
  const [siteConfig, setSiteConfig] = useState<SiteResolutionConfig>({
    eastOverhangMode: 'add-column-c4',
    foundationConcreteGrade: 'C25/30-reinforced',
    dpcDatumMode: '0.000-FFL',
    includeRingBeam: true,
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [darkMode]);

  // Clean up print classes and print mount state after printing completes
  useEffect(() => {
    const handleAfterPrint = () => {
      document.body.classList.remove('has-print-target');
      setPrintExecutionConfig(null);
    };
    window.addEventListener('afterprint', handleAfterPrint);
    return () => {
      window.removeEventListener('afterprint', handleAfterPrint);
    };
  }, []);

  const diagonals = useMemo(() => calculateSettingOutDiagonals(), []);
  const boqItems = useMemo(() => calculateSiteBOQ(siteConfig), [siteConfig]);

  const selectedRoom = useMemo(
    () => ROOM_SCHEDULES.find((r) => r.id === selectedElementId),
    [selectedElementId]
  );
  const selectedOpening = useMemo(
    () => OPENING_SCHEDULES.find((o) => o.tag === selectedElementId),
    [selectedElementId]
  );

  const handleExportCsv = () => {
    const headers = ['Item_ID', 'Category', 'Description', 'Quantity', 'Unit', 'Basis_Note'];
    const rows = boqItems.map((b) => [
      b.id,
      `"${b.category}"`,
      `"${b.description}"`,
      b.quantity,
      b.unit,
      `"${b.basisNote}"`,
    ]);
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', '2Bedroom_BQ_Site_BOQ_and_Schedules.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleOpenPrintModal = (defaultScope?: '3d-views') => {
    if (snapshotGetterRef.current) {
      try {
        const snap = snapshotGetterRef.current();
        if (snap) setLive3DSnapshotUrl(snap);
      } catch (err) {
        console.warn('Snapshot capture warning:', err);
      }
    }
    setShowPrintModal(true);
  };

  const handleExecutePrint = (options: PrintExecutionOptions) => {
    setPrintExecutionConfig(options);
    document.body.classList.add('has-print-target');

    // Give React time to render the print mount DOM before launching print dialog
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const renderSheetComponent = (sheetId: string) => {
    switch (sheetId) {
      case 'A-000':
        return (
          <FloorPlanSheet
            key="A-000"
            mode="A-000"
            unit={unit}
            config={siteConfig}
            showMasonryChain={true}
            showInternalChain={true}
            showGridChain={true}
            showFurniture={false}
            selectedId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />
        );
      case 'A-001':
        return (
          <FloorPlanSheet
            key="A-001"
            mode="A-001"
            unit={unit}
            config={siteConfig}
            showMasonryChain={showMasonryChain}
            showInternalChain={showInternalChain}
            showGridChain={showGridChain}
            showFurniture={showFurniture}
            selectedId={selectedElementId}
            onSelectElement={setSelectedElementId}
          />
        );
      case 'A-002':
        return <RoofPlanSheet key="A-002" unit={unit} config={siteConfig} />;
      case 'A-003/006':
        return (
          <ElevationsSheet
            key="A-003/006"
            unit={unit}
            config={siteConfig}
            onSelectOpening={setSelectedElementId}
          />
        );
      case 'A-008':
        return <SectionBSheet key="A-008" unit={unit} config={siteConfig} />;
      case 'S-001':
        return <StructuralSheet key="S-001" unit={unit} config={siteConfig} />;
      case 'P-001':
        return <PlumbingSheet key="P-001" unit={unit} config={siteConfig} />;
      case 'E-001':
        return <ElectricalSheet key="E-001" unit={unit} config={siteConfig} />;
      case 'Q-001':
        return (
          <SchedulesAndBoqSheet
            key="Q-001"
            unit={unit}
            config={siteConfig}
            boqItems={boqItems}
            onExportCsv={handleExportCsv}
          />
        );
      case '3D-PERSPECTIVES':
      case 'A-301':
        return (
          <Perspective3DSheet
            key="A-301"
            unit={unit}
            config={siteConfig}
            selectedView={printExecutionConfig?.selected3DView || 'all'}
            liveSnapshotDataUrl={live3DSnapshotUrl}
            sheetCode="A-301"
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#F6F5F0] dark:bg-slate-950 text-[#14181F] dark:text-slate-100 flex flex-col">
      <div id="screen-workspace" className="flex flex-col flex-1">
        {/* ==================== TOP BAR CONTRACT (3 ZONES, SINGLE LINE) ==================== */}
      <header className="no-print flex items-center justify-between gap-8 px-6 py-3.5 border-b border-slate-300 dark:border-slate-800 bg-[#EFECE4] dark:bg-slate-900">
        {/* Zone 1: Brand Title (Single text element) */}
        <a
          href="#top"
          onClick={(e) => {
            e.preventDefault();
            setActiveSheet('3D-MODEL');
          }}
          className="text-lg font-display font-bold tracking-tight text-slate-900 dark:text-white whitespace-nowrap shrink-0"
        >
          BQ-CAD 3D &amp; Architectural Studio
        </a>

        {/* Zone 2: 5 Concise Single-Line Navigation Links */}
        <nav aria-label="Primary Drawing Categories" className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-700 dark:text-slate-300">
          <button
            type="button"
            onClick={() => setActiveSheet('3D-MODEL')}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              activeSheet === '3D-MODEL' ? 'text-amber-800 dark:text-amber-400 font-semibold underline' : ''
            }`}
          >
            3D Interactive Model
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet('A-001')}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              activeSheet === 'A-001' || activeSheet === 'A-000' ? 'text-amber-800 dark:text-amber-400 font-semibold underline' : ''
            }`}
          >
            2D Floor Plans
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet('A-003/006')}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              activeSheet === 'A-002' || activeSheet === 'A-003/006' ? 'text-amber-800 dark:text-amber-400 font-semibold underline' : ''
            }`}
          >
            Roof &amp; Elevations
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet('A-008')}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              activeSheet === 'A-008' || activeSheet === 'S-001' ? 'text-amber-800 dark:text-amber-400 font-semibold underline' : ''
            }`}
          >
            Section &amp; Structural
          </button>
          <button
            type="button"
            onClick={() => setActiveSheet('Q-001')}
            className={`hover:text-slate-900 dark:hover:text-white hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0 ${
              activeSheet === 'P-001' || activeSheet === 'E-001' || activeSheet === 'Q-001' || activeSheet === 'ALL-PACK' ? 'text-amber-800 dark:text-amber-400 font-semibold underline' : ''
            }`}
          >
            MEP &amp; BOQ
          </button>
        </nav>

        {/* Zone 3: 1 Primary Action Button */}
        <div className="flex items-center gap-3 shrink-0">
          <button
            type="button"
            onClick={() => handleOpenPrintModal()}
            className="px-4 py-2 text-xs font-mono font-semibold text-white bg-slate-900 dark:bg-amber-500 dark:text-slate-950 rounded hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap shrink-0 shadow-xs"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Drawings &amp; 3D Views</span>
          </button>
        </div>
      </header>

      {/* ==================== WORKSPACE CAD TOOLBAR (BELOW HEADER) ==================== */}
      <section
        aria-label="Drawing Sheet and Dimension Controls"
        className="no-print border-b border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900/60 px-6 py-2.5"
      >
        <div className="flex flex-wrap items-center justify-between gap-2.5">
          {/* Sheet Switcher Tabs */}
          <div className="flex flex-wrap items-center gap-1" role="tablist" aria-label="Construction Drawing Sheets">
            {SHEET_TABS.map((tab) => {
              const active = activeSheet === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveSheet(tab.id)}
                  className={`px-2.5 py-1.5 text-xs font-mono rounded transition-colors whitespace-nowrap shrink-0 border ${
                    active
                      ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 font-bold'
                      : 'bg-[#F6F5F0] dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-500'
                  }`}
                >
                  {tab.code} · {tab.name}
                </button>
              );
            })}
          </div>

          {/* Unit, Layer & Reference PDF Controls */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Unit Selector: mm vs m */}
            <div className="flex items-center bg-[#EFECE4] dark:bg-slate-800 p-0.5 rounded border border-slate-300 dark:border-slate-700">
              <button
                type="button"
                onClick={() => setUnit('mm')}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                  unit === 'mm'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-amber-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Units: mm
              </button>
              <button
                type="button"
                onClick={() => setUnit('m')}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded transition-colors whitespace-nowrap shrink-0 ${
                  unit === 'm'
                    ? 'bg-white dark:bg-slate-950 text-slate-900 dark:text-amber-400 shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                Units: m
              </button>
            </div>

            {/* Layer Toggles for Plan Views */}
            {(activeSheet === 'A-001' || activeSheet === 'A-000' || activeSheet === 'ALL-PACK') && (
              <div className="flex items-center gap-1.5 bg-[#EFECE4] dark:bg-slate-800 px-2.5 py-1 rounded border border-slate-300 dark:border-slate-700 text-xs font-mono">
                <Layers className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400 shrink-0" />
                <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showMasonryChain}
                    onChange={(e) => setShowMasonryChain(e.target.checked)}
                    className="accent-slate-900 dark:accent-amber-500"
                  />
                  <span>Piers</span>
                </label>
                <span className="text-slate-400">·</span>
                <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showInternalChain}
                    onChange={(e) => setShowInternalChain(e.target.checked)}
                    className="accent-slate-900 dark:accent-amber-500"
                  />
                  <span>Walls</span>
                </label>
                <span className="text-slate-400">·</span>
                <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showGridChain}
                    onChange={(e) => setShowGridChain(e.target.checked)}
                    className="accent-slate-900 dark:accent-amber-500"
                  />
                  <span>Grids</span>
                </label>
                <span className="text-slate-400">·</span>
                <label className="flex items-center gap-1 cursor-pointer whitespace-nowrap">
                  <input
                    type="checkbox"
                    checked={showFurniture}
                    onChange={(e) => setShowFurniture(e.target.checked)}
                    className="accent-slate-900 dark:accent-amber-500"
                  />
                  <span>Fixtures</span>
                </label>
              </div>
            )}

            {/* Share on WhatsApp Button */}
            <button
              type="button"
              onClick={() => setShowWhatsAppModal(true)}
              className="px-2.5 py-1.5 text-xs font-mono font-semibold bg-emerald-700 hover:bg-emerald-800 text-white rounded flex items-center gap-1.5 whitespace-nowrap shrink-0 transition-colors"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Share on WhatsApp</span>
            </button>

            {/* View Original Preliminary PDF Button */}
            <button
              type="button"
              onClick={() => setShowPdfDrawer(true)}
              className="px-2.5 py-1.5 text-xs font-mono font-medium bg-[#EFECE4] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <FileText className="w-3.5 h-3.5 text-amber-700 dark:text-amber-400" />
              <span>Uploaded PDF Source</span>
            </button>

            {/* Theme Mode Toggle */}
            <button
              type="button"
              onClick={() => setDarkMode(!darkMode)}
              aria-label={darkMode ? 'Switch to Vellum Paper Light Mode' : 'Switch to Site Blueprint Dark Mode'}
              className="px-2.5 py-1.5 text-xs font-mono font-medium bg-[#EFECE4] dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 border border-slate-300 dark:border-slate-700 rounded flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              {darkMode ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-slate-700" />}
              <span>{darkMode ? 'Vellum Light' : 'Blueprint Dark'}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ==================== MAIN WORKSPACE: DRAWING VIEWPORT + SITE INSPECTOR ==================== */}
      <main className="flex-1 px-4 sm:px-6 py-5 max-w-[1600px] w-full mx-auto">
        {/* Top Site Key Metrics Bar (Unboxed Tabular Figures) */}
        <div className="no-print mb-4 pb-3 border-b border-slate-300 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4 text-xs">
          <div className="flex flex-wrap items-center gap-2 text-slate-700 dark:text-slate-300 font-mono">
            <span className="font-bold text-slate-900 dark:text-white">2-BEDROOM BOYS&apos; QUARTERS (NIGERIA)</span>
            <span aria-hidden="true">·</span>
            <span>Overall Footprint: {formatDim(12000, unit)} × {formatDim(11000, unit, true)}</span>
            <span aria-hidden="true">·</span>
            <span>Main Block: {formatDim(12000, unit)} × {formatDim(9150, unit, true)} (94.0 m² Enclosed)</span>
            <span aria-hidden="true">·</span>
            <span>Squaring Diagonal: {formatDim(diagonals.mainBlockDiagonalMm, unit, true)}</span>
            <span aria-hidden="true">·</span>
            <span>Walls: 225mm Ext / 150mm Int Sandcrete</span>
          </div>
          <div className="flex items-center gap-3 font-mono text-xs text-slate-600 dark:text-slate-400">
            <span>Scale: 1:100 / 1:50 / 1:20</span>
            <span aria-hidden="true">·</span>
            <button
              type="button"
              onClick={handleExportCsv}
              className="text-amber-800 dark:text-amber-400 hover:underline font-semibold flex items-center gap-1 whitespace-nowrap"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export BOQ CSV</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {activeSheet === '3D-MODEL' ? (
            <div className="lg:col-span-12">
              <Building3DViewer
                siteConfig={siteConfig}
                selectedRoomId={selectedElementId}
                onSelectRoom={(id) => {
                  if (id) setSelectedElementId(id);
                }}
                onSwitchTo2DSheet={(sheet) => setActiveSheet(sheet as SheetId)}
                onOpenPrintModal={handleOpenPrintModal}
                onRegisterSnapshotGetter={(getter) => {
                  snapshotGetterRef.current = getter;
                }}
              />
            </div>
          ) : (
            <>
              {/* LEFT / CENTER: ARCHITECTURAL DRAWING SHEET CANVAS (9 Cols on Desktop) */}
              <div className="lg:col-span-9 space-y-8">
                {activeSheet === 'ALL-PACK' ? (
                  <div className="space-y-10">
                    <FloorPlanSheet
                      mode="A-001"
                      unit={unit}
                      config={siteConfig}
                      showMasonryChain={showMasonryChain}
                      showInternalChain={showInternalChain}
                      showGridChain={showGridChain}
                      showFurniture={showFurniture}
                      selectedId={selectedElementId}
                      onSelectElement={setSelectedElementId}
                    />
                    <FloorPlanSheet
                      mode="A-000"
                      unit={unit}
                      config={siteConfig}
                      showMasonryChain={true}
                      showInternalChain={true}
                      showGridChain={true}
                      showFurniture={false}
                      selectedId={selectedElementId}
                      onSelectElement={setSelectedElementId}
                    />
                    <RoofPlanSheet unit={unit} config={siteConfig} />
                    <ElevationsSheet
                      unit={unit}
                      config={siteConfig}
                      onSelectOpening={setSelectedElementId}
                    />
                    <SectionBSheet unit={unit} config={siteConfig} />
                    <StructuralSheet unit={unit} config={siteConfig} />
                    <PlumbingSheet unit={unit} config={siteConfig} />
                    <ElectricalSheet unit={unit} config={siteConfig} />
                    <SchedulesAndBoqSheet
                      unit={unit}
                      config={siteConfig}
                      boqItems={boqItems}
                      onExportCsv={handleExportCsv}
                    />
                    <Perspective3DSheet
                      unit={unit}
                      config={siteConfig}
                      selectedView="all"
                      liveSnapshotDataUrl={live3DSnapshotUrl}
                      sheetCode="A-301"
                    />
                  </div>
                ) : (
                  renderSheetComponent(activeSheet)
                )}
              </div>

          {/* RIGHT SIDEBAR: INTERACTIVE SITE INSPECTOR & ENGINEER RFI RESOLVER (3 Cols on Desktop) */}
          <aside className="no-print lg:col-span-3 space-y-5">
            {/* 1. SELECTED ROOM OR OPENING SITE SPECIFICATION INSPECTOR */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="flex items-center justify-between pb-2.5 mb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Compass className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                  <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                    Site Element Inspector
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-500">
                  Click plan to inspect
                </span>
              </div>

              {/* Quick Selector Dropdown for Accessibility & Keyboard Users */}
              <div className="mb-3">
                <label htmlFor="element-selector" className="block text-[11px] font-mono text-slate-500 dark:text-slate-400 mb-1">
                  Inspect Room / Door / Window Tag
                </label>
                <select
                  id="element-selector"
                  value={selectedElementId}
                  onChange={(e) => setSelectedElementId(e.target.value)}
                  className="w-full px-2.5 py-1.5 text-xs font-mono bg-[#F6F5F0] dark:bg-slate-950 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-slate-100"
                >
                  <optgroup label="Rooms & Spaces">
                    {ROOM_SCHEDULES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.code} · {r.name} ({formatDim(r.widthMm, unit)}×{formatDim(r.depthMm, unit)})
                      </option>
                    ))}
                  </optgroup>
                  <optgroup label="Doors & Windows (with Lintels)">
                    {OPENING_SCHEDULES.map((o) => (
                      <option key={o.tag} value={o.tag}>
                        {o.tag} · {o.location} ({formatDim(o.widthMm, unit)}×{formatDim(o.heightMm, unit)})
                      </option>
                    ))}
                  </optgroup>
                </select>
              </div>

              {selectedRoom && (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      {selectedRoom.name}
                    </span>
                    <span className="font-mono font-bold text-amber-800 dark:text-amber-400">
                      {selectedRoom.areaSqm.toFixed(2)} m²
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Clear Width × Depth</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatDim(selectedRoom.widthMm, unit)} × {formatDim(selectedRoom.depthMm, unit, true)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">NW Corner Set-Out</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        X:{formatDim(selectedRoom.xMm, unit)} · Y:{formatDim(selectedRoom.yMm, unit)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    <div>
                      <strong className="text-slate-900 dark:text-white">Floor Build-up:</strong> {selectedRoom.floorFinish}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Wall Finish:</strong> {selectedRoom.wallFinish}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Ceiling (+3.00m):</strong> {selectedRoom.ceilingFinish}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Masonry Notes:</strong> {selectedRoom.masonryCourseNote}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white">MEP Services:</strong> {selectedRoom.electricalNotes} · {selectedRoom.plumbingNotes}
                    </div>
                  </div>
                </div>
              )}

              {selectedOpening && (
                <div className="space-y-2.5 text-xs">
                  <div className="flex items-baseline justify-between">
                    <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      Tag {selectedOpening.tag} ({selectedOpening.category.toUpperCase()})
                    </span>
                    <span className="font-mono font-bold text-amber-800 dark:text-amber-400">
                      Qty: {selectedOpening.qty} No.
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 py-2 border-y border-slate-200 dark:border-slate-800 font-mono text-[11px]">
                    <div>
                      <span className="text-slate-500 block">Structural Opening</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        {formatDim(selectedOpening.widthMm, unit)} × {formatDim(selectedOpening.heightMm, unit, true)}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Sill / Head AFFL</span>
                      <span className="font-bold text-slate-900 dark:text-white">
                        +{formatDim(selectedOpening.sillHeightMm, unit)} / +{formatDim(selectedOpening.headHeightMm, unit, true)}
                      </span>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-[11px] leading-relaxed text-slate-700 dark:text-slate-300">
                    <div>
                      <strong className="text-slate-900 dark:text-white">Location:</strong> {selectedOpening.location}
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Specification:</strong> {selectedOpening.type} ({selectedOpening.swingOrOperation})
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white">RC Lintel Length:</strong>{' '}
                      <span className="font-mono font-bold text-amber-800 dark:text-amber-400">
                        {formatDim(selectedOpening.lintelLengthMm, unit, true)}
                      </span>{' '}
                      (includes 225mm bearing each side)
                    </div>
                    <div>
                      <strong className="text-slate-900 dark:text-white">Lintel Section:</strong> {selectedOpening.lintelSection}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 2. SITE ENGINEER RFI & PRELIMINARY CONFLICT RESOLVER (Page 9 Items) */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="flex items-center gap-2 pb-2.5 mb-3 border-b border-slate-200 dark:border-slate-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Site Engineer Sign-Off Resolutions
                </h2>
              </div>
              <p className="text-[11px] text-slate-600 dark:text-slate-400 mb-3">
                Resolves the preliminary assumptions on Page 9 of the uploaded plan and updates the drawings &amp; BOQ live:
              </p>

              <div className="space-y-3 text-xs">
                {/* Resolution 1: East Front Roof Overhang (2.3m) */}
                <div>
                  <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                    1. East Front Roof Overhang (2.30 m)
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfig((prev) => ({ ...prev, eastOverhangMode: 'add-column-c4' }))
                      }
                      className={`px-2.5 py-1.5 font-mono text-[11px] rounded border transition-colors whitespace-nowrap truncate ${
                        siteConfig.eastOverhangMode === 'add-column-c4'
                          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 font-bold'
                          : 'bg-[#F6F5F0] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Add Column C4
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfig((prev) => ({ ...prev, eastOverhangMode: 'cut-back-eave' }))
                      }
                      className={`px-2.5 py-1.5 font-mono text-[11px] rounded border transition-colors whitespace-nowrap truncate ${
                        siteConfig.eastOverhangMode === 'cut-back-eave'
                          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 font-bold'
                          : 'bg-[#F6F5F0] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      Cut Back Eave
                    </button>
                  </div>
                </div>

                {/* Resolution 2: Foundation Concrete Grade */}
                <div>
                  <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                    2. Foundation Concrete Spec
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfig((prev) => ({
                          ...prev,
                          foundationConcreteGrade: 'C25/30-reinforced',
                        }))
                      }
                      className={`px-2.5 py-1.5 font-mono text-[11px] rounded border transition-colors whitespace-nowrap truncate ${
                        siteConfig.foundationConcreteGrade === 'C25/30-reinforced'
                          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 font-bold'
                          : 'bg-[#F6F5F0] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      C25/30 RC Mat
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfig((prev) => ({
                          ...prev,
                          foundationConcreteGrade: '1:3:6-mass-concrete',
                        }))
                      }
                      className={`px-2.5 py-1.5 font-mono text-[11px] rounded border transition-colors whitespace-nowrap truncate ${
                        siteConfig.foundationConcreteGrade === '1:3:6-mass-concrete'
                          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 font-bold'
                          : 'bg-[#F6F5F0] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      1:3:6 Mass Mix
                    </button>
                  </div>
                </div>

                {/* Resolution 3: DPC Datum Level */}
                <div>
                  <label className="block font-semibold text-slate-900 dark:text-white mb-1">
                    3. Damp-Proof Course (DPC) Level
                  </label>
                  <div className="grid grid-cols-2 gap-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfig((prev) => ({ ...prev, dpcDatumMode: '0.000-FFL' }))
                      }
                      className={`px-2.5 py-1.5 font-mono text-[11px] rounded border transition-colors whitespace-nowrap truncate ${
                        siteConfig.dpcDatumMode === '0.000-FFL'
                          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 font-bold'
                          : 'bg-[#F6F5F0] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      ±0.000 FFL (GL -0.15)
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setSiteConfig((prev) => ({ ...prev, dpcDatumMode: '+0.150-raised' }))
                      }
                      className={`px-2.5 py-1.5 font-mono text-[11px] rounded border transition-colors whitespace-nowrap truncate ${
                        siteConfig.dpcDatumMode === '+0.150-raised'
                          ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 font-bold'
                          : 'bg-[#F6F5F0] dark:bg-slate-950 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                      }`}
                    >
                      +0.150m Plinth
                    </button>
                  </div>
                </div>

                {/* Resolution 4: Continuous Lintel Ring Beam */}
                <div className="pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={siteConfig.includeRingBeam}
                      onChange={(e) =>
                        setSiteConfig((prev) => ({
                          ...prev,
                          includeRingBeam: e.target.checked,
                        }))
                      }
                      className="accent-slate-900 dark:accent-amber-500"
                    />
                    <span className="font-medium text-slate-800 dark:text-slate-200">
                      Include Continuous 225×225 RC Ring Beam at +2.10m
                    </span>
                  </label>
                </div>
              </div>
            </div>

            {/* 3. SITE SETTING-OUT & SQUARING CHECKLIST */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
              <div className="flex items-center gap-2 pb-2 mb-2.5 border-b border-slate-200 dark:border-slate-800">
                <Ruler className="w-4 h-4 text-sky-700 dark:text-sky-400" />
                <h2 className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Site Squaring Diagonals
                </h2>
              </div>
              <dl className="space-y-1.5 text-xs font-mono">
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Main Block (12.0×9.15m):</dt>
                  <dd className="font-bold text-slate-900 dark:text-white">
                    {formatDim(diagonals.mainBlockDiagonalMm, unit, true)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Full Envelope (12.0×11.0m):</dt>
                  <dd className="font-bold text-slate-900 dark:text-white">
                    {formatDim(diagonals.overallEnvelopeDiagonalMm, unit, true)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Bedroom 1 &amp; 2 (3.6×3.6m):</dt>
                  <dd className="font-bold text-slate-900 dark:text-white">
                    {formatDim(diagonals.bedroomInternalDiagonalMm, unit, true)}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-slate-600 dark:text-slate-400">Verandah Bay (6.0×1.85m):</dt>
                  <dd className="font-bold text-slate-900 dark:text-white">
                    {formatDim(diagonals.verandahDiagonalMm, unit, true)}
                  </dd>
                </div>
              </dl>
            </div>
          </aside>
        </>
      )}
        </div>
      </main>

      {/* ==================== WHATSAPP SHARE & EXPORT MODAL ==================== */}
      <WhatsAppShareModal
        isOpen={showWhatsAppModal}
        onClose={() => setShowWhatsAppModal(false)}
        activeSheet={activeSheet}
        unit={unit}
        config={siteConfig}
        onPrintFullPack={() => {
          setShowWhatsAppModal(false);
          handleExecutePrint({
            scope: 'all-sheets',
            singleSheetId: 'A-001',
            selected3DView: 'all',
            includedSheetIds: [
              'A-000',
              'A-001',
              'A-002',
              'A-003/006',
              'A-008',
              'S-001',
              'P-001',
              'E-001',
              'Q-001',
              '3D-PERSPECTIVES',
            ],
            orientation: 'landscape',
          });
        }}
      />

      {/* ==================== MODAL DRAWER: UPLOADED PRELIMINARY PDF SOURCE VIEWER ==================== */}
      {showPdfDrawer && (
        <div
          className="no-print fixed inset-0 z-50 bg-slate-950/70 flex items-center justify-center p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="pdf-modal-title"
        >
          <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 w-full max-w-5xl h-[85vh] flex flex-col">
            <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-slate-800">
              <div>
                <h2 id="pdf-modal-title" className="font-display font-bold text-sm text-slate-900 dark:text-white">
                  Uploaded Source Document: 2-Bedroom Boys&apos; Quarters Preliminary Drawings (PDF)
                </h2>
                <p className="text-xs text-slate-500 font-mono">
                  Compare preliminary schematic drawings against the fully-dimensioned site working drawings
                </p>
              </div>
              <div className="flex items-center gap-2">
                <a
                  href="/assets/aistudio/2-Bedroom_Boys__Quarters___Preliminary_Drawings__1__7c53ef05.pdf"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 text-xs font-mono bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded flex items-center gap-1.5 hover:bg-slate-200"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Open Raw PDF</span>
                </a>
                <button
                  type="button"
                  onClick={() => setShowPdfDrawer(false)}
                  aria-label="Close PDF Source Viewer"
                  className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="flex-1 bg-slate-100 dark:bg-slate-950">
              <iframe
                src="/assets/aistudio/2-Bedroom_Boys__Quarters___Preliminary_Drawings__1__7c53ef05.pdf"
                title="Uploaded 2-Bedroom Boys Quarters Preliminary Plan PDF"
                className="w-full h-full border-0"
              />
            </div>
          </div>
        </div>
      )}

      {/* QUIET ARCHITECTURAL FOOTER */}
      <footer className="no-print border-t border-slate-300 dark:border-slate-800 py-4 px-6 text-xs text-slate-600 dark:text-slate-400 flex flex-wrap items-center justify-between gap-4 mt-8">
        <div>
          BQ-CAD Site Working Drawings · 2-Bedroom Boys&apos; Quarters (12,000 × 11,000 mm) · Standard Nigerian Sandcrete Construction (225mm Ext / 150mm Int)
        </div>
        <div className="font-mono">
          Sheets: A-000 · A-001 · A-002 · A-003–006 · A-008 · S-001 · P-001 · E-001 · Q-001 · A-301
        </div>
      </footer>
      </div>

      {/* ==================== PRINT & EXPORT DRAWING SET MODAL ==================== */}
      <PrintDrawingModal
        isOpen={showPrintModal}
        onClose={() => setShowPrintModal(false)}
        currentActiveSheet={activeSheet}
        unit={unit}
        config={siteConfig}
        liveSnapshotDataUrl={live3DSnapshotUrl}
        onExecutePrint={handleExecutePrint}
      />

      {/* ==================== DEDICATED PRINT MOUNT (ONLY RENDERED DURING PRINT) ==================== */}
      <div id="print-mount" aria-hidden="true">
        {printExecutionConfig?.scope === 'all-sheets' && (
          <div className="space-y-6">
            {[
              'A-000',
              'A-001',
              'A-002',
              'A-003/006',
              'A-008',
              'S-001',
              'P-001',
              'E-001',
              'Q-001',
              '3D-PERSPECTIVES',
            ]
              .filter((id) => printExecutionConfig.includedSheetIds.includes(id))
              .map((id) => renderSheetComponent(id))}
          </div>
        )}

        {printExecutionConfig?.scope === 'single-sheet' && (
          <div>{renderSheetComponent(printExecutionConfig.singleSheetId)}</div>
        )}

        {printExecutionConfig?.scope === '3d-views' && (
          <div>
            <Perspective3DSheet
              unit={unit}
              config={siteConfig}
              selectedView={printExecutionConfig.selected3DView}
              liveSnapshotDataUrl={live3DSnapshotUrl}
              sheetCode="A-301"
            />
          </div>
        )}

        {printExecutionConfig?.scope === 'current-sheet' && (
          <div>
            {activeSheet === '3D-MODEL' ? (
              <Perspective3DSheet
                unit={unit}
                config={siteConfig}
                selectedView="all"
                liveSnapshotDataUrl={live3DSnapshotUrl}
                sheetCode="A-301"
              />
            ) : activeSheet === 'ALL-PACK' ? (
              <div className="space-y-6">
                {[
                  'A-000',
                  'A-001',
                  'A-002',
                  'A-003/006',
                  'A-008',
                  'S-001',
                  'P-001',
                  'E-001',
                  'Q-001',
                  '3D-PERSPECTIVES',
                ].map((id) => renderSheetComponent(id))}
              </div>
            ) : (
              renderSheetComponent(activeSheet)
            )}
          </div>
        )}
      </div>
    </div>
  );
}
