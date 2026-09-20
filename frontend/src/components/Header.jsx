import React, { useState } from "react";
import { RotateCcw, ArrowRight, Check, Sparkles, LogOut, User } from "lucide-react";
import { MOCK } from "../api/api";

/**
 * Header Component (Section 3 & 32)
 *
 * Clean top navigation bar with:
 * - Logo hover micro-interactions (subtle scale, letter-spacing, brightness)
 * - Animated stage progression connectors
 * - Responsive workspace status pills
 * - User identity and logout action
 */
export default function Header({ currentScreen, onNavigate, onReset, currentUser, onLogout }) {
  const screens = [
    { id: "analyze", step: "1", label: "Analyze" },
    { id: "findings", step: "2", label: "Findings" },
    { id: "impact", step: "3", label: "Impact" },
  ];

  const getScreenIndex = (screenId) => {
    switch (screenId) {
      case "analyze":
        return 0;
      case "findings":
        return 1;
      case "impact":
        return 2;
      default:
        return 0;
    }
  };

  const currentIdx = getScreenIndex(currentScreen);

  return (
    <header className="w-full bg-white/95 backdrop-blur-md border-b border-[#E4E8EE] sticky top-0 z-40 transition-colors">
      <div className="max-w-[1080px] mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Brand & Platform Identifier with micro-interaction */}
        <div
          onClick={() => onNavigate("analyze")}
          className="group flex items-center gap-3 cursor-pointer select-none"
        >
          {/* Logo mark with hover scale & glow */}
          <div className="w-8 h-8 rounded-[6px] bg-[#0E1B2B] flex items-center justify-center text-white shadow-xs transition-all duration-200 group-hover:scale-105 group-hover:shadow-[0_0_12px_rgba(31,157,107,0.3)] border border-[#1E2E42]">
            <span className="font-bold text-[16px] tracking-wider text-[#1F9D6B] transition-transform duration-200 group-hover:scale-110">
              A
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-[17px] font-bold tracking-tight text-[#0E1B2B] transition-all duration-200 group-hover:tracking-normal">
                AURIX
              </span>
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-[4px] bg-[#F0F3F7] text-[#5A6B7B] hidden sm:inline-block border border-[#E4E8EE] transition-colors group-hover:border-[#CBD5E1]">
                Analysis workspace
              </span>
            </div>
            <p className="text-[11px] text-[#5A6B7B] hidden sm:block">
              AI Business Process Intelligence
            </p>
          </div>
        </div>

        {/* 3-Step Animated Breadcrumb / Screen Tracker (Section 32) */}
        <nav aria-label="Analysis pipeline" className="flex items-center gap-1 sm:gap-2">
          {screens.map((s, idx) => {
            const isActive = currentScreen === s.id;
            const isCompleted = currentIdx > idx;
            const isAvailable = idx <= currentIdx || isCompleted;

            return (
              <React.Fragment key={s.id}>
                <button
                  type="button"
                  onClick={() => isAvailable && onNavigate(s.id)}
                  disabled={!isAvailable}
                  className={`group relative flex items-center gap-1.5 px-2.5 py-1.5 rounded-[4px] text-[12px] font-medium transition-all duration-180 ${
                    isActive
                      ? "bg-[#0E1B2B] text-white shadow-xs cursor-default"
                      : isCompleted
                      ? "text-[#0E1B2B] hover:bg-[#F0F3F7] cursor-pointer"
                      : "text-[#A4B3C6] cursor-not-allowed opacity-60"
                  }`}
                >
                  <span
                    className={`w-4 h-4 rounded-full text-[10px] flex items-center justify-center font-semibold transition-all duration-200 ${
                      isActive
                        ? "bg-white text-[#0E1B2B] scale-105"
                        : isCompleted
                        ? "bg-[#1F9D6B] text-white"
                        : "bg-[#E4E8EE] text-[#8A9BA8]"
                    }`}
                  >
                    {isCompleted ? <Check className="w-2.5 h-2.5 stroke-[3]" /> : s.step}
                  </span>
                  <span className="hidden md:inline transition-colors">{s.label}</span>
                </button>

                {idx < screens.length - 1 && (
                  <div className="w-3 sm:w-5 h-[1.5px] bg-[#E4E8EE] relative overflow-hidden rounded-full">
                    <div
                      className="absolute inset-0 bg-[#1F9D6B] transition-all duration-400 ease-out"
                      style={{
                        transform: currentIdx > idx ? "translateX(0%)" : "translateX(-100%)",
                      }}
                    />
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </nav>

        {/* Right Actions: Demo Reset, MOCK Indicator, User Pill & Logout */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {currentScreen !== "analyze" && (
            <button
              type="button"
              onClick={onReset}
              className="aurix-btn group flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-[#5A6B7B] hover:text-[#0E1B2B] hover:bg-[#F0F3F7] rounded-[4px] border border-[#E4E8EE] transition-all cursor-pointer shadow-2xs"
              title="Reset analysis to start"
            >
              <RotateCcw className="w-3.5 h-3.5 transition-transform duration-300 group-hover:-rotate-90" />
              <span className="hidden sm:inline">New Analysis</span>
            </button>
          )}

          <div
            className={`text-[11px] font-medium px-2 py-0.5 rounded-[4px] border transition-all duration-200 ${
              MOCK
                ? "bg-[#F4F8F6] text-[#1F9D6B] border-[#D5EADF] hover:bg-[#EBF5F0]"
                : "bg-[#EBF3FF] text-[#0043CE] border-[#D0E2FF] hover:bg-[#E0EEFF]"
            }`}
            title={MOCK ? "Offline Demo Mode: High-Reliability Hackathon Fallback" : "Connected to Django REST Backend on port 8000"}
          >
            {MOCK ? "Demo Mock" : "Django API"}
          </div>

          {currentUser && (
            <div className="flex items-center gap-2 pl-1 border-l border-[#E4E8EE]">
              <div 
                className="flex items-center gap-1.5 px-2 py-1 rounded-md bg-[#F4F7FB] border border-[#E2E8F0] text-[12px] font-semibold text-[#0E1B2B]"
                title={`Logged in as ${currentUser.email || currentUser.username}`}
              >
                <div className="w-5 h-5 rounded-full bg-[#0043CE] text-white flex items-center justify-center text-[10px] font-bold">
                  {(currentUser.name || currentUser.username || "U")[0].toUpperCase()}
                </div>
                <span className="max-w-[100px] truncate hidden md:inline">
                  {currentUser.name || currentUser.username}
                </span>
              </div>

              <button
                type="button"
                onClick={onLogout}
                className="flex items-center gap-1.5 px-2.5 py-1.5 text-[12px] font-medium text-[#5A6B7B] hover:text-[#D14343] hover:bg-[#FFF2F2] rounded-[4px] border border-[#E4E8EE] hover:border-[#FCD2D2] transition-all cursor-pointer shadow-2xs group"
                title="Sign out of AURIX"
              >
                <LogOut className="w-3.5 h-3.5 transition-transform group-hover:translate-x-0.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
