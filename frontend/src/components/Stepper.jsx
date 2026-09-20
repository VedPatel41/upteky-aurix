import React, { useEffect, useState } from "react";
import { Check, Loader2 } from "lucide-react";

/**
 * Stepper Component (Screen 1 Transition -> Screen 2)
 *
 * Implements exact 4-step analysis pipeline:
 * 1. Reading 312 rows
 * 2. Computing response times
 * 3. Mapping funnel stages
 * 4. Running rule engine
 *
 * Timing: ~550ms per step (~2.2s total), then onComplete() transitions to Findings.
 */
export default function Stepper({ rowCount = 312, onComplete }) {
  const steps = [
    { id: 1, label: `Reading ${rowCount} rows`, subtext: "Parsing CRM export headers & timestamps" },
    { id: 2, label: "Computing response times", subtext: "Calculating first-contact latency metrics" },
    { id: 3, label: "Mapping funnel stages", subtext: "Synthesizing Lead → Won conversion drop-offs" },
    { id: 4, label: "Running rule engine", subtext: "Evaluating high-severity automation opportunities" },
  ];

  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  useEffect(() => {
    // 550ms per step
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
  }, []);

  useEffect(() => {
    // When all steps are done (index reaches steps.length), wait brief 300ms then trigger onComplete
    if (currentStepIndex >= steps.length) {
      const timer = setTimeout(() => {
        if (onComplete) onComplete();
      }, 350);
      return () => clearTimeout(timer);
    }
  }, [currentStepIndex, onComplete]);

  // Overall percentage
  const progressPercent = Math.min(100, Math.round(((currentStepIndex + 0.3) / steps.length) * 100));

  return (
    <div className="w-full max-w-[560px] mx-auto aurix-card border border-[#E4E8EE] bg-white p-6 sm:p-8 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <div>
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#5A6B7B]">
            Process Pipeline
          </span>
          <h2 className="text-[17px] font-semibold text-[#0E1B2B]">
            Executing Diagnostic Engine
          </h2>
        </div>
        <div className="text-right">
          <span className="text-[14px] font-semibold tabular-nums text-[#0E1B2B]">
            {progressPercent}%
          </span>
        </div>
      </div>

      {/* Progress Track */}
      <div className="w-full h-1.5 bg-[#EDF1F5] rounded-full overflow-hidden mb-6">
        <div
          className="h-full bg-[#0E1B2B] transition-all duration-300 ease-out"
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* 4 Steps List */}
      <div className="space-y-4">
        {steps.map((step, idx) => {
          const isDone = currentStepIndex > idx;
          const isCurrent = currentStepIndex === idx;
          const isPending = currentStepIndex < idx;

          return (
            <div
              key={step.id}
              className={`flex items-start gap-3.5 p-3 rounded-[6px] transition-colors duration-200 ${
                isCurrent
                  ? "bg-[#F4F7FB] border border-[#D3E0F0]"
                  : isDone
                  ? "bg-white border border-transparent"
                  : "opacity-40 border border-transparent"
              }`}
            >
              {/* Step Status Icon */}
              <div
                className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[12px] font-semibold transition-all ${
                  isDone
                    ? "bg-[#1F9D6B] text-white"
                    : isCurrent
                    ? "bg-[#0E1B2B] text-white"
                    : "bg-[#E4E8EE] text-[#5A6B7B]"
                }`}
              >
                {isDone ? (
                  <Check className="w-3.5 h-3.5 stroke-[2.5]" />
                ) : isCurrent ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>

              {/* Step Label & Subtext */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span
                    className={`text-[14px] font-medium ${
                      isCurrent
                        ? "text-[#0E1B2B] font-semibold"
                        : isDone
                        ? "text-[#0E1B2B]"
                        : "text-[#5A6B7B]"
                    }`}
                  >
                    {step.label}
                  </span>

                  {isDone && (
                    <span className="text-[11px] font-medium text-[#1F9D6B] flex items-center gap-1">
                      Ready
                    </span>
                  )}
                  {isCurrent && (
                    <span className="text-[11px] font-medium text-[#0043CE] animate-pulse">
                      Processing...
                    </span>
                  )}
                </div>
                <p className="text-[12px] text-[#5A6B7B] mt-0.5">
                  {step.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
