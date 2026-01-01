import React from "react";
import { X } from "lucide-react";

interface ConfirmDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  type?: "danger" | "info";
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = "Confirm",
  cancelText = "Cancel",
  type = "info",
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-700 rounded-2xl w-full max-w-md shadow-2xl scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-6 border-b border-slate-800">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button
            onClick={onCancel}
            className="text-slate-400 hover:text-white transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <div className="p-6">
          <p className="text-slate-300">{message}</p>
        </div>

        <div className="flex justify-end gap-3 p-6 pt-0">
          <button
            onClick={onCancel}
            className="px-4 py-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors"
          >
            {cancelText}
          </button>
          <button
            onClick={onConfirm}
            className={`px-4 py-2 text-white rounded-lg transition-colors font-medium ${
              type === "danger"
                ? "bg-red-600 hover:bg-red-500"
                : "bg-blue-600 hover:bg-blue-500"
            }`}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
