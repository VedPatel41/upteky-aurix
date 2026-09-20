import React from "react";
import { RotateCcw, ArrowRight, Layers, Database } from "lucide-react";
import { MOCK } from "../api/api";

/**
 * Header Component
 * Clean top navigation bar representing a professional B2B consulting workspace.
 */
export default function Header({ currentScreen, onNavigate, onReset }) {
  const screens = [
    { id: "analyze", step: "1", label: "Analyze" },
    { id: "findings", step: "2", label: "Findings" },
    { id: "impact", step: "3", label: "Impact" },
  ];

  return (
    <header className="w-full bg-white border-b border-[#E4E8EE] sticky top-0 z-40">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Platform Identifier */}
        <div className="flex items-center gap-3">
          {/* Logo mark */}
          <div className="w-8 h-8 rounded-[6px] bg-[#0E1B2B] flex items-center justify-center text-white shadow-xs">
            <span className="font-bold text-[16px] tracking-wider text-[#1F9D6B]">A</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold tracking-tight text-[#0E1B2B]">
                AURIX
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#F0F3F7] text-[#5A6B7B] hidden sm:inline-block border border-[#E4E8EE]">
                Analysis workspace
              </span>
            </div>
            <p className="text-[11px] text-[#5A6B7B] hidden sm:block">
              AI Business Process Intelligence
            </p>
          </div>
        </div>

        {/* 3-Step Breadcrumb / Screen Tracker */}
        <div className="flex items-center gap-1 sm:gap-2">
          {screens.map((s, idx) => {
            const isActive = currentScreen === s.id;
            const isPassed =
              (currentScreen === "findings" && s.id === "analyze") ||
              (currentScreen === "impact" && (s.id === "analyze" || s.id === "findings"));

            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(s.id)}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] text-[12px] font-medium transition cursor-pointer ${
                    isActive
                      ? "bg-[#0E1B2B] text-white"
                      : isPassed
                      ? "text-[#0E1B2B] hover:bg-[#F0F3F7]"
                      : "text-[#8A9BA8] hover:text-[#5A6B7B]"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-semibold ${
                      isActive
                        ? "bg-white text-[#0E1B2B]"
                        : isPassed
                        ? "bg-[#1F9D6B] text-white"
                        : "bg-[#E4E8EE] text-[#5A6B7B]"
                    }`}
                  >
                    {s.step}
                  </span>
                  <span className="hidden md:inline">{s.label}</span>
                </button>

                {idx < screens.length - 1 && (
                  <span className="text-[#CBD5E1] text-[12px]">/</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Right Actions: Demo Reset & MOCK Indicator */}
        <div className="flex items-center gap-2">
          {currentScreen !== "analyze" && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-[#5A6B7B] hover:text-[#0E1B2B] hover:bg-[#F0F3F7] rounded-[4px] border border-[#E4E8EE] transition cursor-pointer"
              title="Reset analysis flow"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">New Analysis</span>
            </button>
          )}

          <div
            className={`text-[11px] font-medium px-2 py-0.5 rounded-[4px] border ${
              MOCK
                ? "bg-[#F4F8F6] text-[#1F9D6B] border-[#D5EADF]"
                : "bg-[#EBF3FF] text-[#0043CE] border-[#D0E2FF]"
            }`}
            title={MOCK ? "Running in Hackathon Offline Demo Safety Mode" : "Connected to FastAPI"}
          >
            {MOCK ? "Demo Mock" : "FastAPI"}
          </div>
        </div>
      </div>
    </header>
  );
}
