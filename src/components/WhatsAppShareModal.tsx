import React, { useState } from 'react';
import {
  Share2,
  Download,
  Copy,
  Check,
  ExternalLink,
  Printer,
  X,
  Image as ImageIcon,
} from 'lucide-react';
import {
  UnitMode,
  SiteResolutionConfig,
  generateWhatsAppSummaryText,
} from '../utils/architecturalMath';

interface WhatsAppShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeSheet: string;
  unit: UnitMode;
  config: SiteResolutionConfig;
  onPrintFullPack: () => void;
}

const DEFAULT_SHARE_URL =
  typeof window !== 'undefined' && window.location.origin
    ? window.location.href
    : 'https://ais-pre-azzcu2mc5n4ant4na52a73-991259717840.europe-west2.run.app';

export const WhatsAppShareModal: React.FC<WhatsAppShareModalProps> = ({
  isOpen,
  onClose,
  activeSheet,
  unit,
  config,
  onPrintFullPack,
}) => {
  const [copiedText, setCopiedText] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [exportStatus, setExportStatus] = useState<string | null>(null);

  if (!isOpen) return null;

  const shareUrl =
    'https://ais-pre-azzcu2mc5n4ant4na52a73-991259717840.europe-west2.run.app';
  const whatsappSummary = generateWhatsAppSummaryText(config, unit, shareUrl || DEFAULT_SHARE_URL);
  const waMeHref = `https://wa.me/?text=${encodeURIComponent(whatsappSummary)}`;

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(whatsappSummary);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    } catch {
      // Fallback textarea copy
      const ta = document.createElement('textarea');
      ta.value = whatsappSummary;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2500);
    }
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    } catch {
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2500);
    }
  };

  /**
   * Renders the currently visible SVG architectural sheet to a crisp 2400px high-DPI PNG image
   * and either invokes Web Share API with files (mobile WhatsApp) or downloads the PNG.
   */
  const handleExportSheetPng = async (useNativeShare = false) => {
    const webglCanvas = document.querySelector('main canvas') as HTMLCanvasElement | null;
    if (webglCanvas && activeSheet === '3D-MODEL') {
      const dlUrl = webglCanvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = dlUrl;
      a.download = '2Bed_BQ_3D_Architectural_Model.png';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setExportStatus('Downloaded 2Bed_BQ_3D_Architectural_Model.png — attach directly in WhatsApp!');
      return;
    }

    const svgEl = document.querySelector('main svg') as SVGSVGElement | null;
    if (!svgEl) {
      setExportStatus('Switch to a drawing sheet (A-001 to E-001) first to export as PNG.');
      return;
    }

    try {
      setExportStatus('Rendering high-resolution 2400px architectural PNG...');
      const clonedSvg = svgEl.cloneNode(true) as SVGSVGElement;
      const viewBoxAttr = clonedSvg.getAttribute('viewBox')?.split(/\s+/).map(Number) || [0, 0, 1070, 910];
      const vbWidth = viewBoxAttr[2] || 1070;
      const vbHeight = viewBoxAttr[3] || 910;

      const scaleFactor = 2.25; // ~2400px wide for crisp WhatsApp zoom on site phones
      const canvasWidth = Math.round(vbWidth * scaleFactor);
      const canvasHeight = Math.round(vbHeight * scaleFactor);

      clonedSvg.setAttribute('width', String(canvasWidth));
      clonedSvg.setAttribute('height', String(canvasHeight));
      clonedSvg.setAttribute('xmlns', 'http://www.w3.org/2000/svg');

      // Replace currentColor with dark architectural ink so standalone SVG renders crisply
      const rawSvg = new XMLSerializer()
        .serializeToString(clonedSvg)
        .replace(/currentColor/g, '#0f172a');

      const svgBlob = new Blob([rawSvg], { type: 'image/svg+xml;charset=utf-8' });
      const url = URL.createObjectURL(svgBlob);

      const img = new Image();
      img.crossOrigin = 'anonymous';
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = (e) => reject(e);
        img.src = url;
      });

      const canvas = document.createElement('canvas');
      canvas.width = canvasWidth;
      canvas.height = canvasHeight + 90;
      const ctx = canvas.getContext('2d');
      if (!ctx) throw new Error('Canvas context unavailable');

      // Archival Vellum background
      ctx.fillStyle = '#FAF8F2';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0, canvasWidth, canvasHeight);

      // Footer Title Block Stamp on PNG
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, canvasHeight, canvasWidth, 90);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 24px sans-serif';
      ctx.fillText(
        `PROPOSED 2-BEDROOM BOYS' QUARTERS (NIGERIA) — SHEET ${activeSheet}`,
        32,
        canvasHeight + 38
      );
      ctx.fillStyle = '#fbbf24';
      ctx.font = '18px monospace';
      ctx.fillText(
        'Footprint: 12,000 × 11,000 mm (Main Block: 12,000 × 9,150 mm) · Ext Walls: 225mm · Int Walls: 150mm · Main Diagonal: 15,090 mm',
        32,
        canvasHeight + 68
      );

      URL.revokeObjectURL(url);

      const pngBlob = await new Promise<Blob | null>((res) =>
        canvas.toBlob((b) => res(b), 'image/png', 1.0)
      );
      if (!pngBlob) throw new Error('PNG generation failed');

      const fileName = `2Bed_BQ_Sheet_${activeSheet.replace(/[^a-zA-Z0-9_-]/g, '_')}.png`;
      const file = new File([pngBlob], fileName, { type: 'image/png' });

      if (
        useNativeShare &&
        typeof navigator !== 'undefined' &&
        navigator.canShare &&
        navigator.canShare({ files: [file] })
      ) {
        await navigator.share({
          title: `2-Bedroom Boys' Quarters — Sheet ${activeSheet}`,
          text: `Site Construction Drawing Sheet ${activeSheet} (12,000 × 11,000 mm)`,
          files: [file],
        });
        setExportStatus(`Shared ${fileName} via system share sheet.`);
      } else {
        const dlUrl = URL.createObjectURL(pngBlob);
        const a = document.createElement('a');
        a.href = dlUrl;
        a.download = fileName;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(dlUrl);
        setExportStatus(`Downloaded ${fileName} — attach this image directly in WhatsApp!`);
      }
    } catch {
      setExportStatus('Use the Print / Save as PDF option below if your browser blocks canvas export.');
    }
  };

  return (
    <div
      className="no-print fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="whatsapp-modal-title"
    >
      <div className="bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-200 dark:border-slate-800 bg-[#EFECE4] dark:bg-slate-950">
          <div className="flex items-center gap-2.5">
            <Share2 className="w-5 h-5 text-emerald-700 dark:text-emerald-400" />
            <div>
              <h2
                id="whatsapp-modal-title"
                className="font-display font-bold text-base text-slate-900 dark:text-white"
              >
                Share Site Drawings &amp; Dimensions on WhatsApp
              </h2>
              <p className="text-xs font-mono text-slate-600 dark:text-slate-400">
                3 ways to send these working drawings to your site engineer, bricklayer, or client
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close WhatsApp Share Modal"
            className="p-1.5 text-slate-500 hover:text-slate-900 dark:hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 text-xs">
          {/* METHOD 1: HIGH-RES SHEET IMAGE (PNG) FOR WHATSAPP */}
          <div className="border border-slate-200 dark:border-slate-800 p-4 bg-[#FAF8F2] dark:bg-slate-950/60">
            <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-1">
              Method 1: Send High-Resolution Drawing Image (PNG) on WhatsApp
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Exports the active sheet (<strong className="font-mono">{activeSheet}</strong>) as a sharp 2400px image so site workers can pinch-to-zoom all dimensions directly inside WhatsApp without needing CAD software.
            </p>
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => handleExportSheetPng(false)}
                className="px-3.5 py-2 font-mono font-semibold bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 rounded hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download Sheet {activeSheet} as PNG Image</span>
              </button>
              <button
                type="button"
                onClick={() => handleExportSheetPng(true)}
                className="px-3.5 py-2 font-mono font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>Share Image Directly (Mobile)</span>
              </button>
            </div>
            {exportStatus && (
              <div className="mt-2.5 font-mono text-[11px] text-emerald-800 dark:text-emerald-400">
                {exportStatus}
              </div>
            )}
          </div>

          {/* METHOD 2: WHATSAPP MESSAGE + LIVE INTERACTIVE LINK */}
          <div className="border border-slate-200 dark:border-slate-800 p-4 bg-[#FAF8F2] dark:bg-slate-950/60">
            <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-1">
              Method 2: Share Formatted Site Summary &amp; Live Interactive Link
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-2.5 leading-relaxed">
              Send the complete setting-out dimensions, squaring diagonals, block/concrete quantities, and the live interactive drawing link directly to a WhatsApp chat:
            </p>

            {/* Live URL Copy Row */}
            <div className="flex items-center gap-2 mb-3">
              <input
                type="text"
                readOnly
                aria-label="Public Shared Drawing App URL"
                value={shareUrl}
                className="flex-1 px-2.5 py-1.5 font-mono text-[11px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200"
              />
              <button
                type="button"
                onClick={handleCopyLink}
                className="px-3 py-1.5 font-mono font-semibold bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded hover:bg-slate-300 transition-colors flex items-center gap-1.5 whitespace-nowrap shrink-0"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedLink ? 'Link Copied' : 'Copy Link'}</span>
              </button>
            </div>

            {/* Pre-formatted WhatsApp message box */}
            <textarea
              readOnly
              rows={7}
              aria-label="Formatted WhatsApp Site Summary"
              value={whatsappSummary}
              className="w-full p-2.5 font-mono text-[11px] bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 rounded text-slate-800 dark:text-slate-200 mb-3"
            />

            <div className="flex flex-wrap items-center gap-2.5">
              <a
                href={waMeHref}
                target="_blank"
                rel="noreferrer"
                className="px-3.5 py-2 font-mono font-semibold bg-emerald-700 text-white rounded hover:bg-emerald-800 transition-colors flex items-center gap-2 whitespace-nowrap"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span>Send via WhatsApp (wa.me)</span>
              </a>
              <button
                type="button"
                onClick={handleCopySummary}
                className="px-3.5 py-2 font-mono font-semibold bg-slate-900 dark:bg-amber-500 text-white dark:text-slate-950 rounded hover:opacity-90 transition-opacity flex items-center gap-2 whitespace-nowrap"
              >
                {copiedText ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedText ? 'Copied to Clipboard!' : 'Copy Full WhatsApp Message'}</span>
              </button>
            </div>
          </div>

          {/* METHOD 3: MULTI-SHEET PDF FOR WHATSAPP DOCUMENT ATTACHMENT */}
          <div className="border border-slate-200 dark:border-slate-800 p-4 bg-[#FAF8F2] dark:bg-slate-950/60">
            <div className="font-display font-bold text-sm text-slate-900 dark:text-white mb-1">
              Method 3: Save Complete 9-Sheet PDF Pack for WhatsApp
            </div>
            <p className="text-slate-600 dark:text-slate-400 mb-3 leading-relaxed">
              Switches to the full 9-sheet construction pack and opens your print dialog—choose <strong>&ldquo;Save as PDF&rdquo;</strong> as the destination, then attach the saved PDF as a Document in WhatsApp.
            </p>
            <button
              type="button"
              onClick={onPrintFullPack}
              className="px-3.5 py-2 font-mono font-semibold bg-slate-200 dark:bg-slate-800 text-slate-900 dark:text-white rounded hover:bg-slate-300 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Save Full 9-Sheet Pack as PDF</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
