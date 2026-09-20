import React, { useEffect } from "react";
import { X, ShieldCheck, ArrowRight, Check } from "lucide-react";

/**
 * ConfirmDialog Component
 *
 * Professional, compact modal for approving automation execution.
 * Features smooth backdrop fade and scale-in entrance.
 */
export default function ConfirmDialog({
  isOpen,
  recommendation,
  onCancel,
  onConfirm,
  isExecuting = false,
}) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape" && !isExecuting) {
        onCancel();
      }
    };
    if (isOpen) {
      window.addEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "hidden";
    }
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, isExecuting, onCancel]);

  if (!isOpen || !recommendation) return null;

  return (
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget && !isExecuting) onCancel();
      }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#0E1B2B]/45 backdrop-blur-[2px] animate-backdrop-fade"
    >
      {/* Dialog Card with scale-in entrance */}
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="dialog-title"
        className="w-full max-w-[460px] bg-white rounded-[6px] border border-[#E4E8EE] shadow-lg p-6 relative animate-modal-enter"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onCancel}
          disabled={isExecuting}
          className="absolute top-4 right-4 p-1.5 text-[#8A9BA8] hover:text-[#0E1B2B] hover:bg-[#F0F3F7] rounded transition cursor-pointer disabled:opacity-40"
          aria-label="Close dialog"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Dialog Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-9 h-9 rounded-[4px] bg-[#E6F6EE] text-[#1F9D6B] flex items-center justify-center shrink-0 mt-0.5 animate-checkmark-pop">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <h3 id="dialog-title" className="text-[17px] font-semibold text-[#0E1B2B]">
              Approve automation?
            </h3>
            <p className="text-[13px] text-[#5A6B7B] mt-0.5 leading-normal">
              You are approving a simulated workflow based on this recommendation.
            </p>
          </div>
        </div>

        {/* Concise Summary Box */}
        <div className="p-3.5 bg-[#F7F8FA] border border-[#E4E8EE] rounded-[4px] my-4 space-y-2.5">
          <div className="flex items-center justify-between text-[13px]">
            <span className="text-[#5A6B7B]">Affected Leads</span>
            <span className="font-semibold text-[#0E1B2B] tabular-nums">
              {recommendation.affected_count} leads
            </span>
          </div>

          <div className="flex items-start justify-between text-[13px] gap-2">
            <span className="text-[#5A6B7B] shrink-0">Proposed Action</span>
            <span className="font-medium text-[#0E1B2B] text-right">
              {recommendation.proposed_action}
            </span>
          </div>

          <div className="flex items-center justify-between text-[13px] pt-1.5 border-t border-[#E8ECF2]">
            <span className="text-[#5A6B7B]">Target Metric</span>
            <div className="inline-flex items-center gap-1.5 font-semibold tabular-nums">
              <span className="text-[#E8A33D]">
                {recommendation.metric_before} {recommendation.metric_unit}
              </span>
              <ArrowRight className="w-3 h-3 text-[#8A9BA8]" />
              <span className="text-[#1F9D6B]">
                {recommendation.metric_after_target} {recommendation.metric_unit}
              </span>
            </div>
          </div>
        </div>

        {/* Notice */}
        <div className="text-[11px] text-[#5A6B7B] mb-6 flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F9D6B]"></span>
          <span>Simulated execution queue will verify payload before running.</span>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onCancel}
            disabled={isExecuting}
            className="aurix-btn px-3.5 py-2 text-[13px] font-medium text-[#5A6B7B] hover:text-[#0E1B2B] hover:bg-[#F0F3F7] rounded-[4px] transition cursor-pointer disabled:opacity-40"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => onConfirm(recommendation)}
            disabled={isExecuting}
            className="group aurix-btn px-4 py-2 bg-[#0E1B2B] hover:bg-[#1C2C40] active:bg-[#000000] text-white text-[13px] font-medium rounded-[4px] transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 shadow-xs"
          >
            <Check className="w-3.5 h-3.5 transition-transform group-hover:scale-110" />
            <span>Approve & Execute</span>
          </button>
        </div>
      </div>
    </div>
  );
}
