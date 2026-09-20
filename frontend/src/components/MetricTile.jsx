import React from "react";

/**
 * MetricTile Component
 * High clarity B2B metric card with tabular-nums and subtle highlight indicators.
 */
export default function MetricTile({
  label,
  value,
  subtext,
  badge,
  badgeType = "neutral", // 'neutral' | 'danger' | 'positive' | 'signal'
  icon: Icon,
}) {
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
    <div className="aurix-card bg-white border border-[#E4E8EE] rounded-[6px] p-5 flex flex-col justify-between transition-all duration-150 hover:border-[#D1D9E4]">
      {/* Header with Label and Optional Icon/Badge */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <span className="text-[12px] font-medium text-[#5A6B7B] uppercase tracking-wide">
          {label}
        </span>
        {badge && (
          <span
            className={`text-[11px] font-semibold px-2 py-0.5 rounded-[4px] border ${getBadgeStyle()}`}
          >
            {badge}
          </span>
        )}
        {Icon && !badge && (
          <Icon className="w-4 h-4 text-[#8A9BA8]" />
        )}
      </div>

      {/* Main Metric Value */}
      <div className="flex items-baseline gap-1 my-1">
        <span className="text-[26px] font-semibold tracking-tight text-[#0E1B2B] tabular-nums leading-tight">
          {value}
        </span>
      </div>

      {/* Subtext */}
      {subtext && (
        <p className="text-[12px] text-[#5A6B7B] mt-1 leading-normal truncate">
          {subtext}
        </p>
      )}
    </div>
  );
}
