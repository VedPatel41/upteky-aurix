import React from "react";
import { CheckCircle2, Activity, Terminal } from "lucide-react";

/**
 * ExecutionLog Component (Screen 3: Impact)
 * Renders realistic execution audit trail for simulated SME actions.
 */
export default function ExecutionLog({ logs = [] }) {
  return (
    <div className="aurix-card bg-white border border-[#E4E8EE] rounded-[6px] p-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-[#F0F3F7]">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-[#0E1B2B]" />
          <h3 className="text-[15px] font-semibold text-[#0E1B2B]">
            Execution Log
          </h3>
          <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#E6F6EE] text-[#1F9D6B]">
            Live Simulation
          </span>
        </div>
        <div className="text-[12px] text-[#5A6B7B]">
          Audited batch: 5 of 112 simulated actions
        </div>
      </div>

      {/* Log rows */}
      <div className="divide-y divide-[#F0F3F7]">
        {logs.map((log) => (
          <div
            key={log.id}
            className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-[#FAFBFC] px-2 rounded-[4px] transition-colors"
          >
            <div className="flex items-center gap-3">
              <CheckCircle2 className="w-4 h-4 text-[#1F9D6B] shrink-0" />
              <div className="text-[13px] text-[#0E1B2B]">
                <span className="font-medium text-[#5A6B7B]">{log.action} for </span>
                <span className="font-semibold text-[#0E1B2B]">{log.company}</span>
              </div>
            </div>

            <div className="flex items-center gap-4 text-[12px] text-[#5A6B7B] pl-7 sm:pl-0">
              {log.recipient && (
                <span className="text-[#8A9BA8] font-mono text-[11px] hidden md:inline">
                  {log.recipient}
                </span>
              )}
              <span className="tabular-nums font-medium text-[#5A6B7B]">
                {log.timestamp}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-4 pt-3 border-t border-[#F0F3F7] flex items-center justify-between text-[11px] text-[#8A9BA8]">
        <span>Orchestration: Deterministic CRM Trigger Dispatcher</span>
        <span>Status: 100% Dispatched</span>
      </div>
    </div>
  );
}
