import React, { useState, useEffect } from "react";

/**
 * Hook to animate number count-up over duration (700-900ms) with easeOutCubic
 * and trigger finish pulse celebration.
 */
function useMetricCountUp(rawValue, duration = 800) {
  const [displayValue, setDisplayValue] = useState(rawValue);
  const [isFinished, setIsFinished] = useState(false);

  useEffect(() => {
    // If rawValue is non-numeric (e.g. "Qualification → Quotation"), render as is
    if (typeof rawValue === "string" && !/^\d+(\.\d+)?/.test(rawValue)) {
      setDisplayValue(rawValue);
      setIsFinished(true);
      return;
    }

    let targetNum = 0;
    let suffix = "";
    let decimals = 0;

    if (typeof rawValue === "number") {
      targetNum = rawValue;
      decimals = Number.isInteger(rawValue) ? 0 : 1;
    } else if (typeof rawValue === "string") {
      const match = rawValue.match(/^([\d.]+)(.*)$/);
      if (match) {
        targetNum = parseFloat(match[1]) || 0;
        suffix = match[2] || "";
        decimals = match[1].includes(".") ? match[1].split(".")[1].length : 0;
      } else {
        setDisplayValue(rawValue);
        setIsFinished(true);
        return;
      }
    }

    let startTimestamp = null;
    let animationFrameId;
    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const current = easeOutCubic(progress) * targetNum;

      if (progress < 1) {
        setDisplayValue(
          `${decimals > 0 ? current.toFixed(decimals) : Math.round(current)}${suffix}`
        );
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(
          `${decimals > 0 ? targetNum.toFixed(decimals) : Math.round(targetNum)}${suffix}`
        );
        setIsFinished(true);
      }
    };

    animationFrameId = requestAnimationFrame(step);
    return () => cancelAnimationFrame(animationFrameId);
  }, [rawValue, duration]);

  return { displayValue, isFinished };
}

/**
 * MetricTile Component (Section 10 & 11)
 *
 * Implements:
 * - Staggered entrance
 * - Count-up animation
 * - Number finish pop pulse
 * - Hover card lift (2-4px)
 * - Number scaling on hover
 * - Icon movement on hover
 */
export default function MetricTile({
  label,
  value,
  subtext,
  badge,
  badgeType = "neutral",
  icon: Icon,
  delay = 0,
}) {
  const { displayValue, isFinished } = useMetricCountUp(value, 800);

  const getBadgeStyle = () => {
    switch (badgeType) {
      case "danger":
        return "bg-[#FDE8E8] text-[#D14343] border-[#FACDCD]";
      case "positive":
        return "bg-[#E6F6EE] text-[#1F9D6B] border-[#C3EBD6]";
      case "signal":
        return "bg-[#FEF6E9] text-[#B8781B] border-[#FCE1B6]";
      default:
        return "bg-[#F0F3F7] text-[#5A6B7B] border-[#E4E8EE]";
    }
  };

  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="group aurix-card aurix-card-hover bg-white border border-[#E4E8EE] rounded-[6px] p-5 flex flex-col justify-between transition-all duration-200 animate-card-reveal hover:-translate-y-1 hover:border-[#CBD5E1] hover:shadow-md cursor-default"
    >
      {/* Header with Label and Optional Icon/Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12px] font-medium text-[#5A6B7B] uppercase tracking-wide transition-colors group-hover:text-[#0E1B2B]">
          {label}
        </span>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-[4px] border transition-transform duration-200 group-hover:scale-105 ${getBadgeStyle()}`}
          >
            {badge}
          </span>
        )}
        {Icon && !badge && (
          <Icon className="w-4 h-4 text-[#8A9BA8] transition-transform duration-200 group-hover:scale-115 group-hover:text-[#0E1B2B]" />
        )}
      </div>

      {/* Main Metric Value with Tabular Nums & Count-up */}
      <div className="flex items-baseline gap-1 my-1 min-h-[34px] overflow-hidden">
        <span
          className={`text-[26px] font-semibold tracking-tight text-[#0E1B2B] tabular-nums leading-tight select-all transition-transform duration-200 group-hover:scale-[1.02] origin-left ${
            isFinished ? "animate-number-pop" : ""
          }`}
        >
          {displayValue}
        </span>
      </div>

      {/* Subtext */}
      {subtext && (
        <p className="text-[12px] text-[#5A6B7B] mt-1 leading-normal truncate transition-colors group-hover:text-[#3E4F61]">
          {subtext}
        </p>
      )}
    </div>
  );
}
