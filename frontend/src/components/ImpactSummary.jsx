import React, { useState, useEffect } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";
import { Clock, TrendingUp, Users, Info, Sparkles } from "lucide-react";

/**
 * Helper hook for smooth count-up animation (~900ms easeOutCubic)
 */
function useCountUp(endValue, duration = 900, isCurrency = false, decimals = 0) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    let startTimestamp = null;
    let animationFrameId;

    const easeOutCubic = (t) => 1 - Math.pow(1 - t, 3);

    const step = (timestamp) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easedProgress = easeOutCubic(progress);
      const current = easedProgress * endValue;

      setDisplayValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setDisplayValue(endValue);
      }
    };

    animationFrameId = requestAnimationFrame(step);

    return () => cancelAnimationFrame(animationFrameId);
  }, [endValue, duration]);

  if (isCurrency) {
    const rounded = Math.round(displayValue);
    return `₹${rounded.toLocaleString("en-IN")}`;
  }

  return decimals > 0 ? displayValue.toFixed(decimals) : Math.round(displayValue).toString();
}

/**
 * Custom Tooltip for Recharts
 */
const CustomChartTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-[#0E1B2B] text-white px-3 py-2 rounded-[4px] shadow-md text-[12px] border border-[#243547] animate-card-reveal">
        <div className="font-semibold">{data.name}</div>
        <div className="text-[14px] font-bold tabular-nums mt-0.5 text-[#E4E8EE]">
          {data.value} {data.unit}
        </div>
        <div className="text-[11px] text-[#A4B3C6] mt-0.5">{data.description}</div>
      </div>
    );
  }
  return null;
};

/**
 * ImpactSummary Component (Screen 3: Impact)
 *
 * Renders the Before/After Recharts comparison, followed by the 3 animated impact metrics
 * and the visible disclaimer. Follows consulting-grade staggered reveal order.
 */
export default function ImpactSummary({ impactData }) {
  const hoursSaved = useCountUp(impactData?.hours_saved_per_month || 42.0, 900, false, 1);
  const recoveredLeads = useCountUp(impactData?.recovered_leads || 39, 900, false, 0);
  const revenueOpportunity = useCountUp(impactData?.revenue_opportunity_inr || 240000, 900, true, 0);

  // Before vs After Bar Chart Data
  const chartData = [
    {
      name: impactData?.before?.label || "Current",
      value: impactData?.before?.value || 18.4,
      unit: impactData?.before?.unit || "hours",
      fill: "#E8A33D", // Signal / Before
      description: "Manual SDR follow-up cycle",
    },
    {
      name: impactData?.after?.label || "With AURIX",
      value: impactData?.after?.value || 2.0,
      unit: impactData?.after?.unit || "hours",
      fill: "#1F9D6B", // Positive / After
      description: "Automated trigger execution",
    },
  ];

  return (
    <div className="w-full space-y-8">
      {/* 1. Main Visual: Before vs After Bar Chart Card (Reveals first) */}
      <div
        style={{ animationDelay: "80ms" }}
        className="aurix-card bg-white border border-[#E4E8EE] rounded-[6px] p-6 shadow-xs animate-card-reveal"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] bg-[#F0F4FA] text-[#0043CE] text-[11px] font-semibold uppercase tracking-wider mb-1.5">
              Efficiency Comparison
            </div>
            <h3 className="text-[17px] font-semibold text-[#0E1B2B]">
              Lead Response Time Latency
            </h3>
            <p className="text-[13px] text-[#5A6B7B] mt-0.5">
              Comparing average time to first touch before and after AURIX orchestration.
            </p>
          </div>

          <div className="flex items-center gap-4 text-[12px] font-medium">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-[2px] bg-[#E8A33D]"></span>
              <span className="text-[#5A6B7B]">Current (18.4h)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-[2px] bg-[#1F9D6B]"></span>
              <span className="text-[#0E1B2B] font-semibold">With AURIX (2.0h)</span>
            </div>
          </div>
        </div>

        {/* Clean Recharts Bar Chart with smooth 800ms one-shot entry animation */}
        <div className="w-full h-[240px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={chartData}
              layout="vertical"
              margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
            >
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#EDF1F5" />
              <XAxis
                type="number"
                domain={[0, 20]}
                unit="h"
                stroke="#8A9BA8"
                tick={{ fontSize: 12, fill: "#5A6B7B" }}
              />
              <YAxis
                type="category"
                dataKey="name"
                stroke="#8A9BA8"
                tick={{ fontSize: 13, fontWeight: 500, fill: "#0E1B2B" }}
                width={100}
              />
              <Tooltip content={<CustomChartTooltip />} cursor={{ fill: "#F7F8FA" }} />
              <Bar
                dataKey="value"
                barSize={36}
                radius={[0, 4, 4, 0]}
                isAnimationActive={true}
                animationDuration={800}
                animationEasing="ease-out"
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="mt-4 p-3 bg-[#F4F8F6] border border-[#D5EADF] rounded-[4px] flex items-center justify-between text-[13px] transition-colors">
          <span className="text-[#146b48] font-medium">
            Projected Latency Reduction
          </span>
          <span className="font-bold text-[#1F9D6B] tabular-nums text-[14px]">
            89.1% Faster First Touch
          </span>
        </div>
      </div>

      {/* 2. 3 Large Impact Metric Tiles (Reveals second) */}
      <div
        style={{ animationDelay: "160ms" }}
        className="grid grid-cols-1 md:grid-cols-3 gap-5 animate-card-reveal"
      >
        {/* Metric 1: Hours Saved */}
        <div className="aurix-card aurix-card-hover bg-white border border-[#E4E8EE] rounded-[6px] p-6 shadow-xs flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#5A6B7B] uppercase tracking-wide">
              Capacity Recaptured
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-[#EBF3FF] text-[#0043CE] flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-[40px] font-semibold text-[#0E1B2B] tabular-nums tracking-tight leading-none my-1 min-h-[44px]">
              {hoursSaved}
            </div>
            <p className="text-[14px] font-medium text-[#5A6B7B] mt-1.5">
              Hours saved / month
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0F3F7] text-[12px] text-[#1F9D6B] font-medium flex items-center gap-1.5">
            <span>+35% SDR capacity unlocked</span>
          </div>
        </div>

        {/* Metric 2: Recovered Leads */}
        <div className="aurix-card aurix-card-hover bg-white border border-[#E4E8EE] rounded-[6px] p-6 shadow-xs flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#5A6B7B] uppercase tracking-wide">
              Pipeline Recovery
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-[#E6F6EE] text-[#1F9D6B] flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-[40px] font-semibold text-[#0E1B2B] tabular-nums tracking-tight leading-none my-1 min-h-[44px]">
              {recoveredLeads}
            </div>
            <p className="text-[14px] font-medium text-[#5A6B7B] mt-1.5">
              Recovered leads
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0F3F7] text-[12px] text-[#1F9D6B] font-medium flex items-center gap-1.5">
            <span>Saved from qualification drop-off</span>
          </div>
        </div>

        {/* Metric 3: Revenue Opportunity */}
        <div className="aurix-card aurix-card-hover bg-white border border-[#E4E8EE] rounded-[6px] p-6 shadow-xs flex flex-col justify-between transition-all">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[12px] font-semibold text-[#5A6B7B] uppercase tracking-wide">
              Economic Impact
            </span>
            <div className="w-8 h-8 rounded-[4px] bg-[#FEF6E9] text-[#B8781B] flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-[36px] lg:text-[40px] font-semibold text-[#0E1B2B] tabular-nums tracking-tight leading-none my-1 min-h-[44px]">
              {revenueOpportunity}
            </div>
            <p className="text-[14px] font-medium text-[#5A6B7B] mt-1.5">
              Revenue opportunity
            </p>
          </div>
          <div className="mt-4 pt-3 border-t border-[#F0F3F7] text-[12px] text-[#1F9D6B] font-medium flex items-center gap-1.5">
            <span>Based on ₹6,150 avg deal conversion</span>
          </div>
        </div>
      </div>

      {/* 3. Mandatory Impact Disclaimer (Section 24 - Reveals third) */}
      <div
        style={{ animationDelay: "240ms" }}
        className="p-3.5 bg-[#F7F8FA] border border-[#E4E8EE] rounded-[6px] flex items-start sm:items-center gap-2.5 animate-card-reveal"
      >
        <Info className="w-4 h-4 text-[#5A6B7B] shrink-0 mt-0.5 sm:mt-0" />
        <p className="text-[13px] text-[#5A6B7B] font-medium">
          {impactData?.disclaimer || "Simulated impact — based on your dataset and industry benchmarks."}
        </p>
      </div>
    </div>
  );
}
