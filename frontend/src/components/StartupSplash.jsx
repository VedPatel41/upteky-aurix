import React, { useEffect, useState } from "react";
import { Sparkles, Shield, Cpu } from "lucide-react";

/**
 * StartupSplash Component (Section 1)
 *
 * Fast, premium initialization sequence (< 1 second):
 * 1. AURIX monogram & title scale in 0.96 -> 1
 * 2. Subtitle: AI Unified Response & Intelligence eXchange
 * 3. Telemetry progress line completes
 * 4. Workspace seamlessly fades in
 */
export default function StartupSplash({ onComplete }) {
  const [progress, setProgress] = useState(15);
  const [statusText, setStatusText] = useState("Initializing rule engine...");
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => {
      setProgress(65);
      setStatusText("Mapping CRM heuristics...");
    }, 280);

    const t2 = setTimeout(() => {
      setProgress(100);
      setStatusText("Ready");
    }, 620);

    const t3 = setTimeout(() => {
      setIsClosing(true);
    }, 850);

    const t4 = setTimeout(() => {
      onComplete();
    }, 1050);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
      clearTimeout(t3);
      clearTimeout(t4);
    };
  }, [onComplete]);

  return (
    <div
      onClick={onComplete}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-[#F7F8FA] transition-opacity duration-300 ${
        isClosing ? "opacity-0 pointer-events-none" : "opacity-100"
      }`}
      style={{
        backgroundImage:
          "radial-gradient(circle at 50% 30%, rgba(31, 157, 107, 0.08) 0%, transparent 60%), radial-gradient(#D5DCE5 0.75px, transparent 0.75px)",
        backgroundSize: "100% 100%, 24px 24px",
      }}
    >
      <div className="w-full max-w-[420px] px-6 text-center animate-intro-reveal">
        {/* Monogram Mark */}
        <div className="mx-auto w-14 h-14 rounded-[10px] bg-[#0E1B2B] flex items-center justify-center text-white shadow-md border border-[#233549] mb-4 relative group">
          <span className="font-bold text-[26px] tracking-wider text-[#1F9D6B]">A</span>
          <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-[#1F9D6B] border-2 border-white flex items-center justify-center">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
          </div>
        </div>

        {/* Brand Title */}
        <h1 className="text-[28px] font-bold tracking-tight text-[#0E1B2B]">
          AURIX
        </h1>

        {/* Subtitle */}
        <p className="text-[13px] text-[#5A6B7B] font-medium tracking-wide mt-1">
          AI Unified Response & Intelligence eXchange
        </p>

        {/* Status element */}
        <div className="mt-6 flex flex-col items-center gap-2">
          {/* Progress bar */}
          <div className="w-48 h-1 bg-[#E4E8EE] rounded-full overflow-hidden relative">
            <div
              className="h-full bg-[#0E1B2B] rounded-full transition-all duration-300 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#8A9BA8] uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-[#1F9D6B] animate-ping"></span>
            <span>{statusText}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
