import React, { useEffect } from "react";
import { CheckCircle2, AlertCircle, Info, X } from "lucide-react";

/**
 * Toast Component
 * Lightweight, non-intrusive enterprise notification for workflow actions.
 */
export default function Toast({ message, type = "success", onClose, duration = 3200 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const getIcon = () => {
    switch (type) {
      case "error":
        return <AlertCircle className="w-4 h-4 text-[#D14343] shrink-0" />;
      case "info":
        return <Info className="w-4 h-4 text-[#0043CE] shrink-0" />;
      default:
        return <CheckCircle2 className="w-4 h-4 text-[#1F9D6B] shrink-0" />;
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-toast-enter max-w-[380px]">
      <div className="bg-[#0E1B2B] text-white px-4 py-3 rounded-[6px] shadow-lg border border-[#233549] flex items-center justify-between gap-3 text-[13px]">
        <div className="flex items-center gap-2.5">
          {getIcon()}
          <span className="font-medium text-[#F7F8FA]">{message}</span>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="text-[#8A9BA8] hover:text-white p-1 rounded transition cursor-pointer"
          aria-label="Dismiss notification"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );
}
