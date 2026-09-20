import React from "react";
import { ChevronRight, AlertTriangle } from "lucide-react";

/**
 * ProcessFunnel Component (Screen 2: Findings)
 * Clean horizontal process pipeline highlighting the conversion bottleneck.
 */
export default function ProcessFunnel({ stages = [] }) {
  return (
    <div className="aurix-card bg-white border border-[#E4E8EE] rounded-[6px] p-5 mb-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F0F3F7]">
        <div>
          <h3 className="text-[14px] font-semibold text-[#0E1B2B]">
            CRM Funnel Stage Health
          </h3>
          <p className="text-[12px] text-[#5A6B7B]">
            Drop-off mapping across lead lifecycle stages.
          </p>
        </div>
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#FEF6E9] border border-[#FCE1B6] text-[#B8781B] text-[12px] font-medium self-start sm:self-auto">
          <AlertTriangle className="w-3.5 h-3.5" />
          <span>Bottleneck identified at Stage 3</span>
        </div>
      </div>

      {/* Horizontal Stages Workflow */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 sm:gap-1.5 items-center">
        {stages.map((stage, idx) => {
          const isWeakest = stage.is_weakest;
          const isLast = idx === stages.length - 1;

          return (
            <div key={stage.id} className="relative flex items-center">
              {/* Stage Card */}
              <div
                className={`w-full p-3 rounded-[4px] border transition-all ${
                  isWeakest
                    ? "bg-[#FFFBF5] border-[#E8A33D] shadow-xs ring-1 ring-[#E8A33D]/20"
                    : "bg-[#FAFBFC] border-[#E4E8EE] hover:bg-[#F4F7FB]"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[11px] font-medium text-[#5A6B7B] uppercase tracking-wider">
                    {stage.name}
                  </span>
                  {isWeakest && (
                    <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-[#E8A33D] text-white">
                      Drop-off
                    </span>
                  )}
                </div>

                <div className="flex items-baseline justify-between">
                  <span className="text-[18px] font-semibold text-[#0E1B2B] tabular-nums">
                    {stage.count}
                  </span>
                  <span className="text-[11px] font-medium text-[#5A6B7B] tabular-nums">
                    {stage.conversion_rate}
                  </span>
                </div>
              </div>

              {/* Arrow Connector for desktop */}
              {!isLast && (
                <div className="hidden sm:flex items-center justify-center -mr-2 z-10 text-[#A4B3C6]">
                  <ChevronRight className="w-4 h-4" />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
