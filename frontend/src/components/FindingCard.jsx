import React, { useState } from "react";
import { ArrowRight, CheckCircle2, XCircle, Zap, ShieldAlert, Sparkles, Check, ArrowUpRight } from "lucide-react";

/**
 * FindingCard Component (Screen 2: Findings)
 * Reusable recommendation card highlighting severity, before->target metric, and execution state.
 */
export default function FindingCard({
  finding,
  index = 0,
  onApproveClick,
  onRejectClick,
  onViewImpact,
  executionState, // { isRunning: boolean, isApproved: boolean, isRejected: boolean }
}) {
  const [rejectReasonOpen, setRejectReasonOpen] = useState(false);

  // Severity styles
  const getSeverityBadge = () => {
    switch (finding.severity?.toLowerCase()) {
      case "high":
        return {
          label: "HIGH SEVERITY",
          bg: "bg-[#FDE8E8]",
          text: "text-[#D14343]",
          border: "border-[#FACDCD]",
          dot: "bg-[#D14343]",
        };
      case "medium":
        return {
          label: "MEDIUM SEVERITY",
          bg: "bg-[#FEF6E9]",
          text: "text-[#B8781B]",
          border: "border-[#FCE1B6]",
          dot: "bg-[#E8A33D]",
        };
      default:
        return {
          label: "LOW SEVERITY",
          bg: "bg-[#F0F3F7]",
          text: "text-[#5A6B7B]",
          border: "border-[#E4E8EE]",
          dot: "bg-[#8A9BA8]",
        };
    }
  };

  const badge = getSeverityBadge();
  const isApproved = executionState?.isApproved;
  const isRunning = executionState?.isRunning;
  const isRejected = executionState?.isRejected;

  // Stagger animation style
  const animationDelay = `${index * 80}ms`;

  return (
    <div
      style={{ animationDelay }}
      className={`aurix-card bg-white border rounded-[6px] p-5 transition-all duration-200 animate-card-reveal ${
        isApproved
          ? "border-[#1F9D6B] bg-[#FAFCFB] ring-1 ring-[#1F9D6B]/30"
          : isRejected
          ? "border-[#E4E8EE] bg-[#F7F8FA] opacity-60"
          : "border-[#E4E8EE] hover:border-[#CBD5E1]"
      }`}
    >
      {/* 1. Header: Severity + Rule Code */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-[4px] border text-[11px] font-semibold tracking-wider ${badge.bg} ${badge.text} ${badge.border}`}
          >
            <span className={`w-1.5 h-1.5 rounded-full ${badge.dot}`}></span>
            {badge.label}
          </span>
          <span className="text-[11px] font-medium text-[#8A9BA8]">
            Rule {finding.rule_code}
          </span>
        </div>

        <div className="text-[12px] font-medium text-[#5A6B7B]">
          <span className="font-semibold text-[#0E1B2B] tabular-nums">{finding.affected_count}</span> leads affected
        </div>
      </div>

      {/* 2. Problem Title & Detail */}
      <div className="mb-4">
        <h4 className="text-[17px] font-semibold text-[#0E1B2B] leading-snug mb-1">
          {finding.title}
        </h4>
        <p className="text-[14px] text-[#5A6B7B] leading-relaxed">
          {finding.detail}
        </p>
      </div>

      {/* 3. Metric Comparison Box (Before -> Target) */}
      <div className="p-3 bg-[#F7F8FA] rounded-[4px] border border-[#E8ECF2] mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[11px] font-medium text-[#5A6B7B] uppercase tracking-wide">
            Response Time Metric
          </span>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[15px] font-semibold text-[#E8A33D] tabular-nums">
              {finding.metric_before} {finding.metric_unit}
            </span>
            <ArrowRight className="w-3.5 h-3.5 text-[#8A9BA8]" />
            <span className="text-[15px] font-semibold text-[#1F9D6B] tabular-nums">
              {finding.metric_after_target} {finding.metric_unit}
            </span>
            <span className="text-[11px] font-medium text-[#1F9D6B] ml-1 bg-[#E6F6EE] px-1.5 py-0.5 rounded-[3px]">
              -89% latency
            </span>
          </div>
        </div>

        <div className="sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-[#E8ECF2]">
          <span className="text-[11px] font-medium text-[#5A6B7B] uppercase tracking-wide">
            Proposed Automation
          </span>
          <div className="text-[13px] font-medium text-[#0E1B2B] mt-0.5">
            {finding.proposed_action}
          </div>
        </div>
      </div>

      {/* 4. Action / Execution State Transition */}
      {isRunning && (
        <div className="p-3.5 bg-[#F4F7FB] border border-[#D0E2FF] rounded-[4px]">
          <div className="flex items-center justify-between text-[13px] font-medium text-[#0043CE] mb-2">
            <span className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-[#0043CE] animate-pulse" />
              Running automation...
            </span>
            <span className="text-[11px] text-[#5A6B7B]">Simulating 112 hooks</span>
          </div>
          {/* Small Indeterminate Progress Bar */}
          <div className="w-full h-1.5 bg-[#DCE6F2] rounded-full overflow-hidden relative">
            <div className="absolute inset-0 bg-[#0043CE] rounded-full animate-indeterminate" />
          </div>
        </div>
      )}

      {isApproved && !isRunning && (
        <div className="p-3.5 bg-[#E6F6EE] border border-[#C3EBD6] rounded-[4px] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-2.5">
            <CheckCircle2 className="w-5 h-5 text-[#1F9D6B] shrink-0 mt-0.5" />
            <div>
              <div className="text-[13px] font-semibold text-[#0E1B2B]">
                Approved · {finding.affected_count} actions queued
              </div>
              <p className="text-[12px] text-[#5A6B7B]">
                Workflow execution started in simulation sandbox.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onViewImpact}
            className="px-3.5 py-2 bg-[#1F9D6B] hover:bg-[#198459] text-white text-[13px] font-medium rounded-[4px] transition flex items-center justify-center gap-1.5 shrink-0 cursor-pointer shadow-xs"
          >
            <span>View Impact</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {isRejected && (
        <div className="p-3 bg-[#F0F3F7] border border-[#E4E8EE] rounded-[4px] flex items-center justify-between text-[13px] text-[#5A6B7B]">
          <div className="flex items-center gap-2">
            <XCircle className="w-4 h-4 text-[#8A9BA8]" />
            <span>Recommendation rejected</span>
          </div>
          <button
            type="button"
            onClick={() => onApproveClick(finding)}
            className="text-[12px] text-[#0043CE] hover:underline cursor-pointer"
          >
            Reconsider
          </button>
        </div>
      )}

      {!isRunning && !isApproved && !isRejected && (
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={() => onRejectClick(finding)}
            className="px-3 py-1.5 text-[13px] font-medium text-[#5A6B7B] hover:text-[#0E1B2B] hover:bg-[#F0F3F7] rounded-[4px] border border-transparent hover:border-[#E4E8EE] transition cursor-pointer"
          >
            Reject
          </button>
          <button
            type="button"
            onClick={() => onApproveClick(finding)}
            className="px-4 py-1.5 bg-[#0E1B2B] hover:bg-[#1E2E42] text-white text-[13px] font-medium rounded-[4px] shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Approve</span>
          </button>
        </div>
      )}
    </div>
  );
}
