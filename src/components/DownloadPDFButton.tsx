'use client';

import { Download } from 'lucide-react';
import jsPDF from 'jspdf';
import { useState } from 'react';

export default function DownloadPDFButton({ targetId, fileName = 'dashboard' }: { targetId: string, fileName?: string }) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);
    const element = document.getElementById(targetId);
    if (!element) {
        setLoading(false);
        return;
    }

    try {
      const { toPng } = await import('html-to-image');
      const dataUrl = await toPng(element, {
          backgroundColor: '#0f172a', // Force dark background
          pixelRatio: 2 // High quality
      });
      
      const pdf = new jsPDF({
        orientation: 'landscape',
        unit: 'px',
        format: [element.offsetWidth * 2, element.offsetHeight * 2] // approx matching pixelRatio
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(dataUrl, 'PNG', 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${fileName}.pdf`);
    } catch (err) {
      console.error('PDF Generation failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button 
        onClick={handleDownload}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700"
    >
      <Download size={16} />
      {loading ? 'Exporting...' : 'Export PDF'}
    </button>
  );
}
