import React, { useState, useMemo } from 'react';
import {
  Calculator,
  Download,
  FileSpreadsheet,
  Truck,
  CheckCircle2,
  AlertTriangle,
  Layers,
  Calendar,
  Building2,
  Search,
} from 'lucide-react';
import {
  UnitMode,
  SiteResolutionConfig,
  ROOM_SCHEDULES,
  OPENING_SCHEDULES,
  formatDim,
} from '../utils/architecturalMath';
import {
  NigerianRegionBenchmark,
  ConstructionStageCode,
  CONSTRUCTION_STAGES,
  generateCompleteQSReport,
  formatNaira,
} from '../utils/quantitySurveyorMath';
import { DrawingTitleBlock } from './CadPrimitives';

interface QuantitySurveyorReportProps {
  unit: UnitMode;
  config: SiteResolutionConfig;
}

type QsTabId =
  | 'SUMMARY'
  | 'BOQ-TABLE'
  | 'CALCULATIONS'
  | 'REBAR-TILING'
  | 'PROCUREMENT'
  | 'ANALYSIS'
  | 'FULL-REPORT';

export const QuantitySurveyorReport: React.FC<QuantitySurveyorReportProps> = ({
  unit,
  config,
}) => {
  const [region, setRegion] = useState<NigerianRegionBenchmark>('lagos-sw');
  const [activeTab, setActiveTab] = useState<QsTabId>('FULL-REPORT');
  const [stageFilter, setStageFilter] = useState<ConstructionStageCode | 'ALL'>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const qsReport = useMemo(
    () => generateCompleteQSReport(config, region),
    [config, region]
  );

  const { summary, items, rebarSchedule, roomFlooringSchedule, procurementSchedule } =
    qsReport;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      if (stageFilter !== 'ALL' && item.stage !== stageFilter) return false;
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        return (
          item.material.toLowerCase().includes(q) ||
          item.specification.toLowerCase().includes(q) ||
          item.code.toLowerCase().includes(q) ||
          item.stageTitle.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [items, stageFilter, searchQuery]);

  const handleExportFullQsCsv = () => {
    const headers = [
      'S/N',
      'Code',
      'Stage',
      'Material_Description',
      'Specification',
      'Unit',
      'Dimensions_Used',
      'Formula',
      'Net_Quantity',
      'Wastage_Percent',
      'Final_Quantity_To_Purchase',
      'Practical_Purchase_Unit',
      'Unit_Rate_NGN',
      'Total_Material_Cost_NGN',
      'Procurement_Phase',
    ];
    const rows = items.map((it) => [
      it.sn,
      it.code,
      `"${it.stageTitle}"`,
      `"${it.material.replace(/"/g, '""')}"`,
      `"${it.specification.replace(/"/g, '""')}"`,
      `"${it.unit}"`,
      `"${it.dimensionsUsed.replace(/"/g, '""')}"`,
      `"${it.formula.replace(/"/g, '""')}"`,
      it.netQuantity,
      `${it.wastagePercent}%`,
      it.finalQuantity,
      `"${it.practicalUnitNote.replace(/"/g, '""')}"`,
      it.unitPriceNaira,
      it.totalMaterialCostNaira,
      `Phase ${it.procurementPhase}`,
    ]);

    const summaryRows = [
      [],
      ['PROJECT COST SUMMARY (NIGERIAN NAIRA NGN)', '', '', '', '', '', '', '', '', '', '', '', '', ''],
      ['Total Material Cost (Stages A-N)', '', '', '', '', '', '', '', '', '', '', '', '', summary.totalMaterialCostNaira],
      ['Estimated Direct Labour Cost (28%)', '', '', '', '', '', '', '', '', '', '', '', '', summary.estimatedLabourCostNaira],
      ['Equipment & Plant Hire (4.5%)', '', '', '', '', '', '', '', '', '', '', '', '', summary.equipmentAndPlantCostNaira],
      ['Material Haulage & Transport (5.5%)', '', '', '', '', '', '', '', '', '', '', '', '', summary.transportationCostNaira],
      ['Contractor Overheads & Supervision (8%)', '', '', '', '', '', '', '', '', '', '', '', '', summary.contractorOverheadsNaira],
      ['Contingency Allowance (5%)', '', '', '', '', '', '', '', '', '', '', '', '', summary.contingencyAllowanceNaira],
      ['GRAND TOTAL ESTIMATED PROJECT BUDGET (NGN)', '', '', '', '', '', '', '', '', '', '', '', '', summary.grandTotalProjectCostNaira],
    ];

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(',')), ...summaryRows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `2Bedroom_BQ_Complete_BOQ_MTO_${region}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const electricalCircuits = [
    { ckt: 'L1', serves: 'Living (4), Dining Pendant (1), Verandah (2), Exterior Security Lights (4)', cable: '1.5 mm² Cu', mcb: '10A Type B' },
    { ckt: 'L2', serves: 'Bedroom 1 (2), Bedroom 2 (2), Kitchen (2), Bathrooms (2 + 2 Extractor Fans), Passage (3)', cable: '1.5 mm² Cu', mcb: '10A Type B' },
    { ckt: 'S1', serves: 'Living Room & Dining Area (6× Double 13A Sockets + TV Coaxial/Power Point)', cable: '2.5 mm² Cu', mcb: '20A Type B' },
    { ckt: 'S2', serves: 'Bedroom 1 (4× Double 13A Switched Socket Outlets at +300mm AFFL)', cable: '2.5 mm² Cu', mcb: '20A Type B' },
    { ckt: 'S3', serves: 'Bedroom 2 (4× Double 13A Switched Socket Outlets at +300mm AFFL)', cable: '2.5 mm² Cu', mcb: '20A Type B' },
    { ckt: 'K1', serves: 'Kitchen Worktop & General (5× Double 13A Sockets at +1,150mm AFFL)', cable: '2.5 mm² Cu', mcb: '20A Type B' },
    { ckt: 'D1', serves: 'Dedicated Refrigerator (R) & Microwave (MW) Appliance Outlets', cable: '2.5 mm² Cu', mcb: '20A Type B' },
    { ckt: 'AC1–AC3', serves: 'Bedroom 1 (AC1), Bedroom 2 (AC2) & Living Room (AC3) 1.5HP Split Units', cable: '4.0 mm² Cu', mcb: '3× 20A DP' },
    { ckt: 'EARTH', serves: 'Main Earthing Terminal to Ø16×2,400mm Copper-Bonded Rod in Pit', cable: '16.0 mm² Cu', mcb: 'Earth Bar' },
  ];

  const showSummary = activeTab === 'SUMMARY' || activeTab === 'FULL-REPORT';
  const showBoqTable = activeTab === 'BOQ-TABLE' || activeTab === 'FULL-REPORT';
  const showCalculations = activeTab === 'CALCULATIONS' || activeTab === 'FULL-REPORT';
  const showRebarTiling = activeTab === 'REBAR-TILING' || activeTab === 'FULL-REPORT';
  const showProcurement = activeTab === 'PROCUREMENT' || activeTab === 'FULL-REPORT';
  const showAnalysis = activeTab === 'ANALYSIS' || activeTab === 'FULL-REPORT';

  return (
    <div className="print-sheet border-2 border-slate-900 dark:border-slate-300 bg-[#FAF8F2] dark:bg-slate-950 p-5 space-y-8">
      {/* ==================== HEADER & REGIONAL BENCHMARK BAR ==================== */}
      <div className="border-b-2 border-slate-900 dark:border-slate-700 pb-4 space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-2 text-xs font-mono font-bold uppercase tracking-wider text-amber-800 dark:text-amber-400 mb-1">
              <Calculator className="w-4 h-4" />
              <span>CHARTERED QUANTITY SURVEYOR &amp; STRUCTURAL ESTIMATOR REPORT (NIQS / COREN STANDARD)</span>
            </div>
            <h2 className="font-display font-bold text-xl text-slate-900 dark:text-white">
              Q-001 // COMPLETE BILL OF QUANTITIES (BOQ), MATERIAL TAKE-OFF (MTO) &amp; PROCUREMENT SCHEDULE
            </h2>
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400 mt-1">
              Project: Proposed 2-Bedroom Boys&apos; Quarters (12.00m × 11.00m Footprint · 12° Split-Level Standing-Seam Roof · Stages A to N)
            </p>
          </div>

          <div className="no-print flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleExportFullQsCsv}
              className="px-3.5 py-2 text-xs font-mono font-semibold bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 rounded hover:opacity-90 transition-opacity flex items-center gap-1.5 whitespace-nowrap shrink-0"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export Complete 14-Stage BOQ (CSV)</span>
            </button>
          </div>
        </div>

        {/* Regional Market Benchmark Selector & Sub-Tab Bar */}
        <div className="no-print flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-300 dark:border-slate-800">
          <div className="flex flex-wrap items-center gap-1.5" role="tablist" aria-label="Quantity Surveyor Report Sections">
            {[
              { id: 'FULL-REPORT', label: 'Complete Report (All Sections)' },
              { id: 'SUMMARY', label: '1. Master Summary & Budget' },
              { id: 'BOQ-TABLE', label: '2. Stage BOQ Table (A–N)' },
              { id: 'CALCULATIONS', label: '3. Quantity Calculations' },
              { id: 'REBAR-TILING', label: '4. Rebar & Room Tiling' },
              { id: 'PROCUREMENT', label: '5. Procurement Schedule (7 Phases)' },
              { id: 'ANALYSIS', label: '6. Drawing Analysis & Schedules' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.id}
                onClick={() => setActiveTab(tab.id as QsTabId)}
                className={`px-2.5 py-1.5 text-xs font-mono rounded border transition-colors whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 border-slate-900 dark:border-amber-500 font-bold'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-slate-700 hover:border-slate-500'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="qs-region-select" className="text-xs font-mono font-semibold text-slate-700 dark:text-slate-300 whitespace-nowrap">
              Market Price Zone:
            </label>
            <select
              id="qs-region-select"
              value={region}
              onChange={(e) => setRegion(e.target.value as NigerianRegionBenchmark)}
              className="px-2.5 py-1.5 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white font-semibold"
            >
              <option value="lagos-sw">Lagos / Southwest (1.00× Base)</option>
              <option value="abuja-nc">Abuja / North-Central (+6%)</option>
              <option value="ph-ss">Port Harcourt / South-South (+9%)</option>
            </select>
          </div>
        </div>
      </div>

      {/* ==================== SECTION 1: FINAL PROJECT SUMMARY & FINANCIAL BUDGET (STAGE 7 & STAGE 5) ==================== */}
      {showSummary && (
        <section aria-label="Master Project Material and Cost Summary" className="space-y-6">
          <div className="flex flex-wrap items-baseline justify-between gap-2 border-b border-slate-300 dark:border-slate-800 pb-2">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>01. Executive Project Summary — Total Materials Required From Start to Finish (Stage 7)</span>
            </h3>
            <span className="text-xs font-mono text-slate-600 dark:text-slate-400">
              Pricing Basis: {qsReport.regionLabel}
            </span>
          </div>

          {/* Key Material Master Totals Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            {/* 1. Total Cement */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                Total 50kg Cement (All Stages)
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {summary.totalCementBags50kg.toLocaleString('en-US')} Bags
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1.5 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <div>• Substructure &amp; Footing: {summary.cementBreakdown.blindingAndFoundationBags} bags</div>
                <div>• 150mm Oversite Slab: {summary.cementBreakdown.oversiteSlabBags} bags</div>
                <div>• Blockwork &amp; Mortar: {summary.cementBreakdown.blockworkAndMortarBags} bags</div>
                <div>• Columns &amp; Ring Beam: {summary.cementBreakdown.structuralColumnsAndBeamsBags} bags</div>
                <div>• Plaster ({summary.cementBreakdown.plasteringBags}) + Screed ({summary.cementBreakdown.floorScreedBags}) + Ext ({summary.cementBreakdown.externalAndSepticBags})</div>
              </div>
            </div>

            {/* 2. Total Sandcrete Blocks */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                Total Sandcrete Blocks (Incl. 8% Waste)
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {summary.totalBlocksCombined.toLocaleString('en-US')} Blocks
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1.5 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <div>• 9-Inch (225mm) Foundation: 836 pcs</div>
                <div>• 9-Inch (225mm) Ext &amp; Gables: 1,492 pcs</div>
                <div>• 9-Inch (225mm) Septic/Soakaway: 490 pcs</div>
                <div>• <strong>Total 9-Inch Blocks: {summary.totalBlocks9Inch.toLocaleString('en-US')} pcs</strong></div>
                <div>• <strong>Total 6-Inch (150mm) Int: {summary.totalBlocks6Inch.toLocaleString('en-US')} pcs</strong></div>
              </div>
            </div>

            {/* 3. Aggregates (Sand, Granite, Laterite) */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                Total Sand, Granite &amp; Laterite
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {summary.totalSharpSandM3} m³ Sharp Sand
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1.5 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <div>• Sharp Sand: {summary.totalSharpSandM3} m³ (~{summary.totalSharpSandTrucks20T} Tipper Loads)</div>
                <div>• Plaster Soft Sand: {summary.totalPlasterSandM3} m³ (~1 Tipper Load)</div>
                <div>• 19mm Granite: {summary.totalGraniteM3} m³ (~{summary.totalGraniteTrucks30T} Loads of 30T)</div>
                <div>• Hardcore Boulders: 21.0 m³ (1 Load)</div>
                <div>• Laterite Filling: {summary.totalLateriteM3} m³ (2 Loads)</div>
              </div>
            </div>

            {/* 4. Reinforcement Steel & Binding Wire */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                Total Reinforcement Steel (Y12 / Y10 / R8)
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {summary.totalRebarKg.toLocaleString('en-US')} kg ({(summary.totalRebarKg / 1000).toFixed(2)} T)
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1.5 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <div>• Y12mm Main Bars: {summary.rebarY12Lengths12m} lengths ({summary.rebarY12Kg} kg)</div>
                <div>• Y10mm Slab/Septic Mesh: {summary.rebarY10Lengths12m} lengths ({summary.rebarY10Kg} kg)</div>
                <div>• R8mm Stirrup Links: {summary.rebarR8Lengths12m} lengths ({summary.rebarR8Kg} kg)</div>
                <div>• 16G Binding Wire: {summary.totalBindingWireKg} kg (1.75 Rolls)</div>
              </div>
            </div>

            {/* 5. 12° Split-Level Roofing & Timber */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                12° Split-Level Standing-Seam Roof
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {summary.totalRoofingSheetsSqm} m² (0.55mm Alu)
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1.5 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <div>• Panels: 28 Full-Length Sheets (6.5m &amp; 6.4m)</div>
                <div>• Hardwood Timber: 75 (2×6), 49 (2×4), 86 (2×3), 160 (2×2)</div>
                <div>• Ridge &amp; Clerestory Step Flashing: 31.0 m</div>
                <div>• Eave Gutters &amp; Ø100mm Downpipes (DP1–4): 47 m</div>
              </div>
            </div>

            {/* 6. Floor & Wall Tiles */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                Total Floor &amp; Wall Tiles (+10% Waste)
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {summary.totalFloorTilesSqm + summary.totalWallTilesSqm} m² ({summary.totalFloorTilesCartons + summary.totalWallTilesCartons} Ctns)
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1.5 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <div>• 600×600 Porcelain Floor: 94.0 m² (66 cartons)</div>
                <div>• 300×300 Bath Non-Slip Floor: 11.0 m² (8 cartons)</div>
                <div>• 400×400 Verandah Stoneware: 13.0 m² (8 cartons)</div>
                <div>• Bath &amp; Kitchen Wall Tiles: {summary.totalWallTilesSqm} m² ({summary.totalWallTilesCartons} cartons)</div>
                <div>• Tile Gum: 46 bags (20kg) + 15 bags Grout</div>
              </div>
            </div>

            {/* 7. Paint & Ceiling Finishes */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                Total Paint &amp; POP Ceiling Materials
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {summary.totalPaintLitres} Litres ({summary.totalPaintBuckets20L} Drums)
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1.5 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <div>• Wall Primer: 80L (4×20L) | Screed Putty: 28 bags</div>
                <div>• Interior Silk Emulsion: 100L (5×20L Drums)</div>
                <div>• Exterior Weather-Shield: 60L (3×20L Drums)</div>
                <div>• Ceiling White: 50L (2.5 Drums)</div>
                <div>• POP Ceiling: 36 Gypsum Boards + 32 bags POP</div>
              </div>
            </div>

            {/* 8. Doors, Windows, Electrical & Plumbing */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5">
              <div className="text-[11px] font-mono uppercase text-slate-500 dark:text-slate-400">
                Doors, Windows, MEP &amp; Sanitary
              </div>
              <div className="text-2xl font-mono font-bold text-slate-900 dark:text-white mt-1">
                {summary.totalDoorsCount} Doors · {summary.totalWindowsCount} Windows
              </div>
              <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 mt-1.5 space-y-0.5 border-t border-slate-200 dark:border-slate-800 pt-1.5">
                <div>• Doors: 1× D1 Security, 3× 900mm (D2/D3), 3× 750mm</div>
                <div>• Windows: 1× W1, 4× W2, 1× W3, 3× Louvres (W4/W5)</div>
                <div>• Electrical: 9 Coils Copper Cable, 8-Way DB, 61 Fittings</div>
                <div>• Plumbing: 2 WCs, 2 Basins, 2 Showers, 1 Sink, 1000L Tank</div>
              </div>
            </div>
          </div>

          {/* Stage 5: Financial Cost Summary Table in Nigerian Naira (₦) */}
          <div className="border-2 border-slate-900 dark:border-slate-700 bg-white dark:bg-slate-900 overflow-hidden">
            <div className="bg-slate-900 dark:bg-slate-800 text-white px-4 py-2.5 flex flex-wrap items-center justify-between gap-2">
              <span className="font-display font-bold text-sm">
                STAGE 5 // OVERALL PROJECT COST ESTIMATE IN NIGERIAN NAIRA (₦) — FOUNDATION TO HANDOVER
              </span>
              <span className="font-mono text-xs text-amber-300">
                Gross Floor Area: 120.90 m² (Cost/m² ≈ {formatNaira(summary.grandTotalProjectCostNaira / 120.9)})
              </span>
            </div>
            <div className="p-4 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
              <div className="lg:col-span-8 overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs font-mono">
                  <thead>
                    <tr className="border-b border-slate-300 dark:border-slate-800 text-slate-500">
                      <th className="py-1.5 pr-3">Cost Component</th>
                      <th className="py-1.5 px-3">Basis / Industry Allowance</th>
                      <th className="py-1.5 pl-3 text-right">Estimated Cost (₦)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                    <tr>
                      <td className="py-2 pr-3 font-bold text-slate-900 dark:text-white">
                        1. Total Building Materials (Stages A to N)
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        47 itemized material lines incl. cutting &amp; handling wastage
                      </td>
                      <td className="py-2 pl-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatNaira(summary.totalMaterialCostNaira)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                        2. Direct Artisans &amp; Trade Labour Cost
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        Masons, Carpenters, Ironbenders, Roofers, MEP, Tilers, Painters (28%)
                      </td>
                      <td className="py-2 pl-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {formatNaira(summary.estimatedLabourCostNaira)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                        3. Equipment, Plant &amp; Scaffolding Hire
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        Concrete mixer, poker vibrator, compactor, scaffolding, water supply (4.5%)
                      </td>
                      <td className="py-2 pl-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {formatNaira(summary.equipmentAndPlantCostNaira)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                        4. Material Transportation, Tipper Haulage &amp; Offloading
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        Delivery of cement, blocks, reinforcement, timber, tiles &amp; roof sheets (5.5%)
                      </td>
                      <td className="py-2 pl-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {formatNaira(summary.transportationCostNaira)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                        5. Site Supervision, Preliminaries &amp; Contractor Overheads
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        Site engineer supervision, temporary store/shed, security &amp; overheads (8%)
                      </td>
                      <td className="py-2 pl-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {formatNaira(summary.contractorOverheadsNaira)}
                      </td>
                    </tr>
                    <tr>
                      <td className="py-2 pr-3 font-semibold text-slate-800 dark:text-slate-200">
                        6. Contingency &amp; Price Fluctuation Allowance
                      </td>
                      <td className="py-2 px-3 text-slate-600 dark:text-slate-400">
                        Recommended 5% buffer for local market volatility &amp; unforeseen site conditions
                      </td>
                      <td className="py-2 pl-3 text-right font-semibold text-slate-800 dark:text-slate-200">
                        {formatNaira(summary.contingencyAllowanceNaira)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="lg:col-span-4 bg-amber-50/80 dark:bg-slate-950 border border-amber-300 dark:border-amber-500/40 p-4 rounded space-y-2">
                <div className="text-xs font-mono uppercase font-bold text-amber-900 dark:text-amber-400">
                  Total Estimated Project Cost
                </div>
                <div className="text-3xl font-mono font-bold text-slate-900 dark:text-white">
                  {formatNaira(summary.grandTotalProjectCostNaira)}
                </div>
                <div className="text-[11px] font-mono text-slate-600 dark:text-slate-400 leading-relaxed pt-1 border-t border-amber-200 dark:border-slate-800">
                  <strong>Direct Material + Labour Only (Self-Managed Build):</strong>{' '}
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatNaira(summary.totalMaterialCostNaira + summary.estimatedLabourCostNaira)}
                  </span>
                  <br />
                  <span className="text-[10px] text-slate-500">
                    {qsReport.priceBenchmarkNote}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ==================== SECTION 2: STAGE-BY-STAGE BILL OF QUANTITIES (STAGE 4) ==================== */}
      {showBoqTable && (
        <section aria-label="Stage-by-Stage Bill of Quantities Table" className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-300 dark:border-slate-800 pb-2">
            <div>
              <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
                <FileSpreadsheet className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>02. Stage-by-Stage Bill of Quantities (BOQ) &amp; Cost Schedule (Stages A to N)</span>
              </h3>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                Format: S/N | Material | Specification | Unit | Net Quantity | Wastage | Final Quantity to Purchase | Unit Rate (₦) | Total Cost (₦)
              </p>
            </div>

            {/* Stage Filter & Search */}
            <div className="no-print flex flex-wrap items-center gap-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Filter material (e.g. cement, tiles)..."
                  aria-label="Filter BOQ materials"
                  className="pl-8 pr-3 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white w-56"
                />
              </div>
              <select
                aria-label="Filter by Construction Stage"
                value={stageFilter}
                onChange={(e) => setStageFilter(e.target.value as ConstructionStageCode | 'ALL')}
                className="px-2.5 py-1 text-xs font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-900 dark:text-white"
              >
                <option value="ALL">All 14 Stages (A to N — {items.length} Items)</option>
                {CONSTRUCTION_STAGES.map((st) => (
                  <option key={st.code} value={st.code}>
                    {st.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-300 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-900 text-white font-mono text-[11px]">
                  <th className="py-2.5 px-2.5 border-b border-slate-700">S/N</th>
                  <th className="py-2.5 px-2.5 border-b border-slate-700">Material Description</th>
                  <th className="py-2.5 px-2.5 border-b border-slate-700">Specification &amp; Practical Purchase Note</th>
                  <th className="py-2.5 px-2.5 border-b border-slate-700">Unit</th>
                  <th className="py-2.5 px-2.5 border-b border-slate-700 text-right">Quantity</th>
                  <th className="py-2.5 px-2.5 border-b border-slate-700 text-right">Wastage</th>
                  <th className="py-2.5 px-2.5 border-b border-slate-700 text-right">Final Quantity</th>
                  <th className="py-2.5 px-2.5 border-b border-slate-700 text-right">Unit Price (₦)</th>
                  <th className="py-2.5 px-2.5 border-b border-slate-700 text-right">Total Cost (₦)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800">
                {CONSTRUCTION_STAGES.map((stageDef) => {
                  const stageItems = filteredItems.filter((i) => i.stage === stageDef.code);
                  if (stageItems.length === 0) return null;
                  const stageSubtotal = stageItems.reduce(
                    (s, i) => s + i.totalMaterialCostNaira,
                    0
                  );

                  return (
                    <React.Fragment key={stageDef.code}>
                      {/* Stage Group Banner Row */}
                      <tr className="bg-[#EFECE4] dark:bg-slate-900 font-display font-bold text-slate-900 dark:text-amber-400">
                        <td colSpan={7} className="py-2 px-3 border-y border-slate-300 dark:border-slate-700">
                          {stageDef.title} — <span className="font-normal text-xs text-slate-600 dark:text-slate-400">{stageDef.description}</span>
                        </td>
                        <td colSpan={2} className="py-2 px-3 border-y border-slate-300 dark:border-slate-700 text-right font-mono text-xs">
                          Stage Subtotal: {formatNaira(stageSubtotal)}
                        </td>
                      </tr>

                      {stageItems.map((item) => (
                        <tr key={item.code} className="bg-white dark:bg-slate-950 hover:bg-amber-50/50 dark:hover:bg-slate-900/60">
                          <td className="py-2 px-2.5 font-mono font-bold text-slate-500 whitespace-nowrap">
                            {String(item.sn).padStart(2, '0')} <span className="text-[10px] text-amber-800 dark:text-amber-400">({item.code})</span>
                          </td>
                          <td className="py-2 px-2.5 font-semibold text-slate-900 dark:text-white">
                            {item.material}
                          </td>
                          <td className="py-2 px-2.5 text-slate-700 dark:text-slate-300">
                            <div>{item.specification}</div>
                            <div className="text-[11px] font-mono text-amber-800 dark:text-amber-400 mt-0.5">
                              Purchase Order: {item.practicalUnitNote} · [Buy in Phase {item.procurementPhase}]
                            </div>
                          </td>
                          <td className="py-2 px-2.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {item.unit}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-right text-slate-700 dark:text-slate-300">
                            {item.netQuantity.toLocaleString('en-US')}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-right text-slate-500 whitespace-nowrap">
                            {item.wastagePercent}%
                          </td>
                          <td className="py-2 px-2.5 font-mono font-bold text-right text-amber-800 dark:text-amber-400 bg-amber-50/30 dark:bg-amber-950/20">
                            {item.finalQuantity.toLocaleString('en-US')}
                          </td>
                          <td className="py-2 px-2.5 font-mono text-right text-slate-600 dark:text-slate-400 whitespace-nowrap">
                            {formatNaira(item.unitPriceNaira)}
                          </td>
                          <td className="py-2 px-2.5 font-mono font-bold text-right text-slate-900 dark:text-white whitespace-nowrap">
                            {formatNaira(item.totalMaterialCostNaira)}
                          </td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
              <tfoot>
                <tr className="bg-slate-900 text-white font-mono font-bold text-xs">
                  <td colSpan={6} className="py-3 px-3">
                    TOTAL ESTIMATED MATERIAL COST (STAGES A TO N — ALL 47 MATERIAL TAKE-OFF LINES)
                  </td>
                  <td colSpan={3} className="py-3 px-3 text-right text-amber-300 text-sm">
                    {formatNaira(summary.totalMaterialCostNaira)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}

      {/* ==================== SECTION 3: STEP-BY-STEP QUANTITY CALCULATIONS & FORMULAS (STAGE 3) ==================== */}
      {showCalculations && (
        <section aria-label="Detailed Quantity Surveying Calculations and Formulas" className="space-y-4">
          <div className="border-b border-slate-300 dark:border-slate-800 pb-2">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calculator className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>03. Step-by-Step Quantity Calculations, Mix Ratios &amp; Take-Off Formulas (Stage 3)</span>
            </h3>
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
              Shows exact dimensions extracted from sheets A-001 to E-001, calculation method, mathematical formula, net quantity, wastage &amp; final purchase quantity.
            </p>
          </div>

          {/* Engineering Mix Ratio Reference Box */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-[#EFECE4] dark:bg-slate-900 p-3.5 border border-slate-300 dark:border-slate-800 text-xs font-mono">
            <div>
              <strong className="text-slate-900 dark:text-white block">1:3:6 Blinding / Mass Concrete</strong>
              <span className="text-slate-600 dark:text-slate-400">
                1.54 dry shrinkage factor · 4.8 bags cement + 0.50 m³ sand + 0.92 m³ granite per m³ wet
              </span>
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block">1:2:4 Oversite Slab (C20/25)</strong>
              <span className="text-slate-600 dark:text-slate-400">
                6.5 bags (50kg) cement + 0.45 m³ sharp sand + 0.90 m³ 19mm granite per m³ wet
              </span>
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block">1:1.5:3 Structural RC (C25/30)</strong>
              <span className="text-slate-600 dark:text-slate-400">
                7.8 bags (50kg) cement + 0.42 m³ sharp sand + 0.84 m³ 19mm granite per m³ wet
              </span>
            </div>
            <div>
              <strong className="text-slate-900 dark:text-white block">Sandcrete Blockwork &amp; Plaster</strong>
              <span className="text-slate-600 dark:text-slate-400">
                450×225mm block = 10 pcs/m² · 1:6 Mortar = 1 bag/50 blocks · 15mm 1:4 Plaster = 9.6 bags/m³
              </span>
            </div>
          </div>

          <div className="overflow-x-auto border border-slate-300 dark:border-slate-800">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-200/90 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-mono text-[11px]">
                  <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Code</th>
                  <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Material</th>
                  <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Dimensions Extracted from Drawings</th>
                  <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Calculation Method &amp; Formula</th>
                  <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Calculated</th>
                  <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Wastage</th>
                  <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Final Qty</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                {items.map((it) => (
                  <tr key={`calc-${it.code}`} className="hover:bg-amber-50/40 dark:hover:bg-slate-900/50">
                    <td className="py-2 px-2.5 font-mono font-bold text-amber-800 dark:text-amber-400 whitespace-nowrap">
                      {it.code}
                    </td>
                    <td className="py-2 px-2.5 font-semibold text-slate-900 dark:text-white">
                      {it.material}
                    </td>
                    <td className="py-2 px-2.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                      {it.dimensionsUsed}
                    </td>
                    <td className="py-2 px-2.5">
                      <div className="text-slate-600 dark:text-slate-400 text-[11px]">{it.calculationMethod}</div>
                      <div className="font-mono font-semibold text-slate-900 dark:text-amber-300 text-[11px] mt-0.5">
                        Formula: {it.formula}
                      </div>
                    </td>
                    <td className="py-2 px-2.5 font-mono text-right whitespace-nowrap">
                      {it.netQuantity} {it.unit}
                    </td>
                    <td className="py-2 px-2.5 font-mono text-right text-slate-500 whitespace-nowrap">
                      +{it.wastagePercent}% ({it.wastageQuantity})
                    </td>
                    <td className="py-2 px-2.5 font-mono font-bold text-right text-slate-900 dark:text-white whitespace-nowrap">
                      {it.finalQuantity} {it.unit}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* ==================== SECTION 4: REBAR SCHEDULE & ROOM-BY-ROOM FLOORING SCHEDULE ==================== */}
      {showRebarTiling && (
        <section aria-label="Reinforcement Bar Bending Schedule and Room Flooring Schedule" className="space-y-6">
          {/* 4A. Structural Reinforcement Schedule */}
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2 mb-2">
              <Layers className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>04A. Structural Reinforcement &amp; Bar Bending Schedule (Stage 2E — Sheet S-001)</span>
            </h3>
            <div className="overflow-x-auto border border-slate-300 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-200/90 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-mono text-[11px]">
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Bar Mark</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Structural Member &amp; Bar Shape</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Dia (mm)</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Total Bars</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Cut Len (m)</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Total Run (m)</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Net Wt (kg)</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Final Wt (+Waste)</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">12m Lengths</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                  {rebarSchedule.map((rb) => (
                    <tr key={rb.barMark} className="hover:bg-amber-50/40 dark:hover:bg-slate-900/50">
                      <td className="py-2 px-2.5 font-mono font-bold text-amber-800 dark:text-amber-400">
                        {rb.barMark}
                      </td>
                      <td className="py-2 px-2.5">
                        <div className="font-semibold text-slate-900 dark:text-white">{rb.structuralElement}</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">{rb.shapeDescription}</div>
                      </td>
                      <td className="py-2 px-2.5 font-mono font-bold">
                        {rb.diameterMm === 8 ? 'R8' : `Y${rb.diameterMm}`} ({rb.unitWeightKgPerM} kg/m)
                      </td>
                      <td className="py-2 px-2.5 font-mono text-right">{rb.totalBars}</td>
                      <td className="py-2 px-2.5 font-mono text-right">{rb.cutLengthM.toFixed(2)}</td>
                      <td className="py-2 px-2.5 font-mono text-right">{rb.totalLengthM.toFixed(1)}</td>
                      <td className="py-2 px-2.5 font-mono text-right">{rb.netWeightKg.toFixed(1)} kg</td>
                      <td className="py-2 px-2.5 font-mono font-bold text-right text-slate-900 dark:text-white">
                        {rb.finalWeightKg.toFixed(1)} kg
                      </td>
                      <td className="py-2 px-2.5 font-mono font-bold text-right text-amber-800 dark:text-amber-400">
                        {rb.standard12mLengths} lengths
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* 4B. Room-by-Room Flooring & Screeding Take-Off */}
          <div>
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white mb-2">
              04B. Room-by-Room Flooring, Screeding, Tile Cartons &amp; Skirting Schedule (Stage 2H)
            </h3>
            <div className="overflow-x-auto border border-slate-300 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-200/90 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-mono text-[11px]">
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Code</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Room / Space</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Clear Size</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Net Floor (m²)</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Tile Specification</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Gross Tile (+10%)</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Cartons to Buy</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Screed Cement</th>
                    <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Tile Gum (20kg)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                  {roomFlooringSchedule.map((rf) => (
                    <tr key={rf.roomCode} className="hover:bg-amber-50/40 dark:hover:bg-slate-900/50">
                      <td className="py-2 px-2.5 font-mono font-bold text-amber-800 dark:text-amber-400">
                        {rf.roomCode}
                      </td>
                      <td className="py-2 px-2.5 font-semibold text-slate-900 dark:text-white">
                        {rf.roomName}
                      </td>
                      <td className="py-2 px-2.5 font-mono">{rf.clearDimensionsM}</td>
                      <td className="py-2 px-2.5 font-mono font-bold text-right">{rf.netFloorAreaSqm.toFixed(2)}</td>
                      <td className="py-2 px-2.5 text-slate-700 dark:text-slate-300">{rf.tileSpec}</td>
                      <td className="py-2 px-2.5 font-mono text-right">{rf.grossTileAreaSqm.toFixed(2)} m²</td>
                      <td className="py-2 px-2.5 font-mono font-bold text-right text-amber-800 dark:text-amber-400">
                        {rf.cartonsToPurchase} ctns
                      </td>
                      <td className="py-2 px-2.5 font-mono text-right">{rf.cementBagsForScreed} bags</td>
                      <td className="py-2 px-2.5 font-mono text-right">{rf.adhesiveBags20kg} bags</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      )}

      {/* ==================== SECTION 5: 7-PHASE STAGED PROCUREMENT SCHEDULE (STAGE 6) ==================== */}
      {showProcurement && (
        <section aria-label="7-Phase Staged Material Purchasing and Procurement Schedule" className="space-y-4">
          <div className="border-b border-slate-300 dark:border-slate-800 pb-2">
            <h3 className="font-display font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-700 dark:text-amber-400" />
              <span>05. Staged Material Purchasing &amp; Cash-Flow Procurement Schedule (Stage 6 — Do Not Buy All At Once)</span>
            </h3>
            <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
              Prevents cement caking/spoilage in humid weather, site congestion, double-handling breakage, and theft of high-value finishing items.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4">
            {procurementSchedule.map((phase) => (
              <div
                key={phase.phaseNumber}
                className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden"
              >
                <div className="bg-[#EFECE4] dark:bg-slate-800/90 px-4 py-2.5 border-b border-slate-300 dark:border-slate-700 flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <span className="font-display font-bold text-sm text-slate-900 dark:text-white">
                      {phase.phaseTitle}
                    </span>
                    <span className="ml-2 px-2 py-0.5 text-[11px] font-mono bg-slate-900 text-white dark:bg-amber-500 dark:text-slate-950 rounded font-bold">
                      Target: {phase.timelineWeeks}
                    </span>
                  </div>
                  <div className="font-mono text-xs font-bold text-amber-900 dark:text-amber-400">
                    Tranche Budget: {formatNaira(phase.subtotalMaterialNaira)} ({phase.shareOfMaterialBudgetPercent}% of Materials)
                  </div>
                </div>

                <div className="p-3.5 space-y-2.5 text-xs">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 dark:bg-slate-950 p-2.5 border border-slate-200 dark:border-slate-800">
                    <div>
                      <strong className="text-slate-900 dark:text-white">When to Purchase:</strong>{' '}
                      <span className="text-slate-700 dark:text-slate-300">{phase.whenToPurchase}</span>
                    </div>
                    <div>
                      <strong className="text-amber-800 dark:text-amber-400">Site Storage &amp; Anti-Spoilage Rule:</strong>{' '}
                      <span className="text-slate-700 dark:text-slate-300">{phase.storageAndHandlingRule}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {phase.items.map((it) => (
                      <div
                        key={it.code}
                        className="px-2.5 py-1 bg-[#FAF8F2] dark:bg-slate-950 border border-slate-300 dark:border-slate-800 rounded font-mono text-[11px]"
                      >
                        <strong className="text-amber-800 dark:text-amber-400">{it.code}:</strong>{' '}
                        <span className="text-slate-900 dark:text-white font-semibold">{it.finalQuantity} {it.unit}</span>{' '}
                        <span className="text-slate-600 dark:text-slate-400">of {it.material.split('—')[0]}</span>{' '}
                        <span className="text-slate-500">({formatNaira(it.totalMaterialCostNaira)})</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ==================== SECTION 6: DRAWING ANALYSIS, DISCREPANCIES FLAGGED & SCHEDULES (STAGE 1) ==================== */}
      {showAnalysis && (
        <section aria-label="Drawing Analysis, Discrepancies Flagged and Schedules" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Drawing Analysis & Extracted Dimensions */}
            <div className="border border-slate-300 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 space-y-2 text-xs">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 dark:text-emerald-400" />
                <span>06A. Stage 1 Drawing Analysis — Extracted Geometric Parameters</span>
              </h3>
              <ul className="space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <li>• <strong>Building Envelope:</strong> 12.00m Width × 11.00m Overall Depth (Main Block: 12.00m × 9.15m = 109.80 m² gross; Covered Front Verandah: 6.00m × 1.85m = 11.10 m²; Total Footprint = 120.90 m²).</li>
                <li>• <strong>Number of Floors &amp; Spaces:</strong> Single-storey ground floor bungalow with 10 enclosed rooms/spaces (94.05 m² net internal area) + 1 covered verandah.</li>
                <li>• <strong>Wall Lengths &amp; Heights:</strong> 42.30m external 225mm (9&quot;) perimeter wall + 43.65m internal 150mm (6&quot;) partition trench run (85.95m total trench length). Clear room ceiling height = +3.00m AFFL.</li>
                <li>• <strong>12° Split-Level Roof Geometry:</strong> 13.80m width × 12.35m plan run (900mm West/East/North eaves, 450mm South eave). North Wing rises 12° from +3.20m Rear Eave to +4.54m Spine Ridge; 420mm clerestory step down to +4.12m South Ridge; South Wing slopes 12° down to +2.80m Front Eave.</li>
                <li>• <strong>Foundation &amp; Substructure:</strong> 750×225mm strip footing at -1.20m datum + {config.eastOverhangMode === 'add-column-c4' ? '4' : '3'}× 900×900×300mm column pad bases; 150mm oversite RC slab at ±0.000m FFL (Ground Level at -0.15m).</li>
              </ul>
            </div>

            {/* Discrepancies Flagged & Professional Assumptions */}
            <div className="border border-amber-300 dark:border-amber-500/40 bg-amber-50/40 dark:bg-slate-900 p-4 space-y-2 text-xs">
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white flex items-center gap-2 border-b border-amber-200 dark:border-slate-800 pb-2">
                <AlertTriangle className="w-4 h-4 text-amber-700 dark:text-amber-400" />
                <span>06B. Architectural vs. Structural Discrepancies Flagged &amp; Resolved</span>
              </h3>
              <ul className="space-y-1.5 font-mono text-[11px] text-slate-700 dark:text-slate-300">
                <li>• <strong>1. Kitchen vs. Pantry Floor Area Overlap (Resolved):</strong> On the preliminary floor plan, Kitchen is labelled 3.0m × 3.6m (10.80 m²) and Pantry is 1.8m × 1.5m (2.70 m²) nested inside the NE corner of the Kitchen bay. To prevent double-counting floor tiles, net Kitchen open floor is taken as 7.65 m² + Pantry 2.70 m² = 10.35 m² tiled area.</li>
                <li>• <strong>2. South-East Roof Overhang Support (Page 9 Item 8):</strong> Currently set to <strong>{config.eastOverhangMode === 'add-column-c4' ? 'Add 4th Column C4 on 900×900mm Pad (Full 174.2 m² Roof)' : 'Cut Back East Front Eave to 900mm (162.8 m² Roof, 3 Pads)'}</strong>. Toggle in the right sidebar to compare cost impact live.</li>
                <li>• <strong>3. Foundation Concrete Specification (Page 9 Item 7):</strong> Currently calculated as <strong>{config.foundationConcreteGrade === 'C25/30-reinforced' ? 'Grade C25/30 (1:1.5:3) with Y12 Bottom Mat' : '1:3:6 Mass Concrete Strip Footing'}</strong>.</li>
                <li>• <strong>4. Soil Bearing Capacity Verification:</strong> Strip footing width (750mm at -1.20m depth) assumes minimum 100 kN/m² firm lateritic clay bearing pressure. Confirm via trial pit inspection prior to blinding pour.</li>
              </ul>
            </div>
          </div>

          {/* Door, Window & Lintel Schedule */}
          <div>
            <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2">
              06C. Door, Window &amp; Reinforced Concrete Lintel Schedule (225mm Min End Bearing)
            </h3>
            <div className="overflow-x-auto border border-slate-300 dark:border-slate-800">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-200/80 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-mono">
                    <th className="py-2 px-3 border-b border-slate-300 dark:border-slate-800">Tag</th>
                    <th className="py-2 px-3 border-b border-slate-300 dark:border-slate-800">Location &amp; Specification</th>
                    <th className="py-2 px-3 border-b border-slate-300 dark:border-slate-800 text-right">W × H ({unit})</th>
                    <th className="py-2 px-3 border-b border-slate-300 dark:border-slate-800 text-right">Sill / Head ({unit})</th>
                    <th className="py-2 px-3 border-b border-slate-300 dark:border-slate-800 text-right">Lintel Length ({unit})</th>
                    <th className="py-2 px-3 border-b border-slate-300 dark:border-slate-800">RC Lintel Section</th>
                    <th className="py-2 px-3 border-b border-slate-300 dark:border-slate-800 text-right">Qty</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                  {OPENING_SCHEDULES.map((op) => (
                    <tr key={op.tag} className="hover:bg-amber-50/50 dark:hover:bg-slate-900/60">
                      <td className="py-2 px-3 font-mono font-bold text-amber-800 dark:text-amber-400">{op.tag}</td>
                      <td className="py-2 px-3">
                        <div className="font-semibold text-slate-900 dark:text-white">{op.location}</div>
                        <div className="text-[11px] text-slate-600 dark:text-slate-400">{op.type} · {op.swingOrOperation}</div>
                      </td>
                      <td className="py-2 px-3 font-mono text-right whitespace-nowrap">
                        {formatDim(op.widthMm, unit)} × {formatDim(op.heightMm, unit)}
                      </td>
                      <td className="py-2 px-3 font-mono text-right whitespace-nowrap">
                        {formatDim(op.sillHeightMm, unit)} / {formatDim(op.headHeightMm, unit)}
                      </td>
                      <td className="py-2 px-3 font-mono font-semibold text-right">
                        {formatDim(op.lintelLengthMm, unit)}
                      </td>
                      <td className="py-2 px-3 font-mono text-[11px] text-slate-700 dark:text-slate-300">{op.lintelSection}</td>
                      <td className="py-2 px-3 font-mono font-bold text-right">{op.qty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Room Schedule & DB Circuit Table */}
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2">
                06D. Room Dimensions &amp; Finishes Schedule
              </h3>
              <div className="overflow-x-auto border border-slate-300 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-200/80 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-mono">
                      <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Space</th>
                      <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Clear Size ({unit})</th>
                      <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800 text-right">Area (m²)</th>
                      <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Floor / Wall Finish</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                    {ROOM_SCHEDULES.map((rm) => (
                      <tr key={rm.id} className="hover:bg-amber-50/50 dark:hover:bg-slate-900/60">
                        <td className="py-1.5 px-2.5 font-semibold text-slate-900 dark:text-white">{rm.name}</td>
                        <td className="py-1.5 px-2.5 font-mono text-right whitespace-nowrap">
                          {formatDim(rm.widthMm, unit)} × {formatDim(rm.depthMm, unit)}
                        </td>
                        <td className="py-1.5 px-2.5 font-mono font-bold text-right">{rm.areaSqm.toFixed(2)}</td>
                        <td className="py-1.5 px-2.5 text-[11px] text-slate-600 dark:text-slate-400">{rm.floorFinish}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="font-display font-bold text-sm text-slate-900 dark:text-white mb-2">
                06E. Single-Phase 230V Distribution Board (DB) Circuit Schedule
              </h3>
              <div className="overflow-x-auto border border-slate-300 dark:border-slate-800">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-200/80 dark:bg-slate-900 text-slate-900 dark:text-slate-200 font-mono">
                      <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Circuit</th>
                      <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Points Served</th>
                      <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Cable</th>
                      <th className="py-2 px-2.5 border-b border-slate-300 dark:border-slate-800">Breaker</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200 dark:divide-slate-800 bg-white dark:bg-slate-950">
                    {electricalCircuits.map((c) => (
                      <tr key={c.ckt} className="hover:bg-amber-50/50 dark:hover:bg-slate-900/60">
                        <td className="py-1.5 px-2.5 font-mono font-bold text-amber-800 dark:text-amber-400 whitespace-nowrap">{c.ckt}</td>
                        <td className="py-1.5 px-2.5 text-slate-800 dark:text-slate-200">{c.serves}</td>
                        <td className="py-1.5 px-2.5 font-mono whitespace-nowrap">{c.cable}</td>
                        <td className="py-1.5 px-2.5 font-mono whitespace-nowrap text-slate-600 dark:text-slate-400">{c.mcb}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </section>
      )}

      <DrawingTitleBlock
        sheetCode="Q-001"
        sheetTitle="COMPLETE BILL OF QUANTITIES (BOQ), MATERIAL TAKE-OFF & PROCUREMENT SCHEDULE"
        scale="N/A (QUANTITY SURVEYING REPORT)"
        unit={unit}
        notes={[
          'Prepared in accordance with Nigerian Institute of Quantity Surveyors (NIQS) BESMM4 and COREN structural standards.',
          'All openings (D1–D5, W1–W5 = 25.34 m²) and Pantry/Kitchen overlaps have been deducted to prevent double-counting.',
          'Purchase materials strictly in the 7 recommended procurement phases to prevent cement caking, timber warping, and site losses.',
        ]}
      />
    </div>
  );
};
