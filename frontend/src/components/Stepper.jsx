import React, { useEffect, useState } from "react";
import { Check, Loader2, Cpu, BarChart2, GitFork, ShieldCheck, Database } from "lucide-react";

/**
 * Stepper Component (Screen 1 Transition -> Screen 2)
 *
 * Implements exact 4-step analysis pipeline with enhanced processing telemetry:
 * 1. Reading 312 rows
 * 2. Computing response times
 * 3. Mapping funnel stages
 * 4. Running rule engine
 *
 * Visual features:
 * - Scanning light beam across active step
 * - Real-time calculation telemetry
 * - Pop checkmark entrance with green highlight
 * - Smooth progress bar track
 */
export default function Stepper({ rowCount = 312, onComplete }) {
  const steps = [
    {
      id: 1,
      label: `Reading ${rowCount} rows`,
      subtext: "Parsing CRM export headers & timestamps",
      icon: Database,
      telemetry: "312/312 records ingested",
    },
    {
      id: 2,
      label: "Computing response times",
      subtext: "Calculating first-contact latency metrics",
      icon: Cpu,
      telemetry: "Median response time: 18.4 hours",
    },
    {
      id: 3,
      label: "Mapping funnel stages",
      subtext: "Synthesizing Lead → Won conversion drop-offs",
      icon: GitFork,
      telemetry: "Stage 3 drop-off threshold breached (54.8%)",
    },
    {
      id: 4,
      label: "Running rule engine",
      subtext: "Evaluating high-severity automation opportunities",
      icon: ShieldCheck,
      telemetry: "Rule R1, R2, R3 matched",
    },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length) {
          return prev + 1;
        } else {
          clearInterval(interval);
          return prev;
        }
      });
    }, 550);

    return () => clearInterval(interval);
  }, [steps.length]);

  useEffect(() => {
    if (currentStepIndex >= steps.length) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 400);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, steps.length, onComplete]);

  // Overall percentage
  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 0.3) / steps.length) * 100));

  return (
    <div className="w-full max-w-[580px] mx-auto aurix-card border border-[#E4E8EE] bg-white p-6 sm:p-8 shadow-sm animate-screen-enter">
      {/* Stepper Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-[#5A6B7B]">
            <span className="w-2 h-2 rounded-full bg-[#0043CE] animate-ping"></span>
            <span>Process Diagnostic Engine</span>
          </div>
          <h2 className="text-[18px] font-semibold text-[#0E1B2B] mt-0.5">
            Analyzing Pipeline Telemetry
          </h2>
        </div>
        <div className="text-right">
          <span className="text-[16px] font-bold tabular-nums text-[#0E1B2B]">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Animated Smooth Progress Track */}
      <div className="w-full h-2 bg-[#EDF1F5] rounded-full overflow-hidden mb-6 relative">
        <div
          className="h-full bg-[#0E1B2B] transition-all duration-500 ease-out rounded-full relative"
          style={{ width: `${progressPercent}%` }}
        >
          {/* Subtle scanning highlight */}
          <div className="absolute top-0 bottom-0 w-20 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-scan-beam" />
        </div>
      </div>

      {/* 4 Steps List */}
      <div className="space-y-3.5">
        {steps.map((step, idx) => {
          const isDone = currentStepIndex > idx;
          const isCurrent = currentStepIndex === idx;
          const isPending = currentStepIndex < idx;
          const StepIcon = step.icon;

          return (
            <div
              key={step.id}
              className={`relative overflow-hidden flex items-start gap-3.5 p-3.5 rounded-[6px] border transition-all duration-300 ${
                isCurrent
                  ? "bg-[#F4F7FB] border-[#0043CE]/30 shadow-2xs"
                  : isDone
                  ? "bg-[#FCFDFD] border-[#EBF0F5]"
                  : "opacity-45 border-transparent bg-transparent"
              }`}
            >
              {/* Subtle beam across active step */}
              {isCurrent && (
                <div className="absolute inset-0 pointer-events-none overflow-hidden">
                  <div className="w-24 h-full bg-gradient-to-r from-transparent via-blue-500/5 to-transparent animate-scan-beam" />
                </div>
              )}

              {/* Step Status Icon */}
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold transition-all duration-250 mt-0.5 ${
                  isDone
                    ? "bg-[#1F9D6B] text-white shadow-xs"
                    : isCurrent
                    ? "bg-[#0E1B2B] text-white shadow-xs"
                    : "bg-[#E4E8EE] text-[#5A6B7B]"
                }`}
              >
                {isDone ? (
                  <div className="animate-checkmark-pop">
                    <Check className="w-4 h-4 stroke-[3]" />
                  </div>
                ) : isCurrent ? (
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step Label & Subtext */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[14px] transition-colors duration-150 ${
                      isCurrent
                        ? "text-[#0E1B2B] font-semibold"
                        : isDone
                        ? "text-[#0E1B2B] font-medium"
                        : "text-[#5A6B7B]"
                    }`}
                  >
                    {step.label}
                  </span>

                  {isDone && (
                    <span className="text-[11px] font-semibold text-[#1F9D6B] flex items-center gap-1 animate-card-reveal">
                      Completed
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[11px] font-semibold text-[#0043CE] animate-pulse">
                      Processing...
                    </span>
                  )}
                </div>

                <p className="text-[12px] text-[#5A6B7B] mt-0.5">
                  {step.subtext}
                </p>

                {/* Real-time telemetry log row for active/done */}
                {(isCurrent || isDone) && (
                  <div className="mt-1.5 text-[11px] font-mono text-[#0043CE] flex items-center gap-1.5 animate-card-reveal">
                    <span className="w-1 h-1 rounded-full bg-[#0043CE]"></span>
                    <span>{step.telemetry}</span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
