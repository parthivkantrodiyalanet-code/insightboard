"use client";

import { Download } from "lucide-react";
import jsPDF from "jspdf";
import { useState } from "react";
import toast from "react-hot-toast";

export default function DownloadPDFButton({
  targetId,
  fileName = "dashboard",
  disabled = false,
}: {
  targetId: string;
  fileName?: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  const handleDownload = async () => {
    setLoading(true);

    const element = document.getElementById(targetId) as HTMLElement | null;
    if (!element) {
      setLoading(false);
      return;
    }

    const toastId = toast.loading("Preparing your PDF report...");

    // Save original styles
    const originalStyle = {
      position: element.style.position,
      left: element.style.left,
      top: element.style.top,
      opacity: element.style.opacity,
      pointerEvents: element.style.pointerEvents,
      display: element.style.display,
    };

    try {
      const { toPng } = await import("html-to-image");
      // Make export DOM renderable
      element.style.position = "relative";
      element.style.left = "0";
      element.style.top = "0";
      element.style.opacity = "1"; // IMPORTANT
      element.style.pointerEvents = "none";
      element.style.transform = "none";
      element.style.display = "block";

      // Wait for layout + charts
      await document.fonts.ready;
      await new Promise(requestAnimationFrame);
      await new Promise((resolve) => setTimeout(resolve, 600));

      const dataUrl = await toPng(element, {
        pixelRatio: 2,
        cacheBust: true,
        backgroundColor: "#020617",
        style: {
          backgroundColor: "#020617",
        },
      });

      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "px",
        format: "a4",
      });

      const imgProps = pdf.getImageProperties(dataUrl);
      pdf.addImage(dataUrl, "PNG", 0, 90, imgProps.width, imgProps.height);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();

      const headerHeight = 90;
      const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;

      let heightLeft = imgHeight;
      let position = headerHeight;

      /**
       * Helper: draw header on each page
       */
      const drawHeader = () => {
        pdf.setFontSize(22);
        pdf.setTextColor(59, 130, 246);
        pdf.text("InsightBoard Analytics Report", 40, 50);

        pdf.setFontSize(10);
        pdf.setTextColor(148, 163, 184);
        pdf.text(`Exported on ${new Date().toLocaleString()}`, 40, 70);
      };

      // First page
      drawHeader();
      pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight);
      heightLeft -= pageHeight - position;

      // Additional pages
      while (heightLeft > 0) {
        pdf.addPage();
        drawHeader();
        position = heightLeft - imgHeight + headerHeight;
        pdf.addImage(dataUrl, "PNG", 0, position, pdfWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(`${fileName}-report.pdf`);
      toast.success("Report downloaded successfully!", { id: toastId });
    } catch (err) {
      console.error("PDF Generation failed", err);
      toast.error("Failed to generate PDF. Please try again.", { id: toastId });
    } finally {
      // Restore original styles
      Object.assign(element.style, originalStyle);
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={loading || disabled}
      className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <Download size={16} />
      {loading ? "Exporting..." : "Export PDF"}
    </button>
  );
}
