import React, { useState, useEffect } from "react";
import Header from "./components/Header";
import UploadPanel from "./components/UploadPanel";
import Stepper from "./components/Stepper";
import MetricTile from "./components/MetricTile";
import ProcessFunnel from "./components/ProcessFunnel";
import FindingCard from "./components/FindingCard";
import ConfirmDialog from "./components/ConfirmDialog";
import ImpactSummary from "./components/ImpactSummary";
import ExecutionLog from "./components/ExecutionLog";
import Toast from "./components/Toast";
import StartupSplash from "./components/StartupSplash";
import {
  MOCK,
  seedSampleData,
  uploadCrmCsv,
  getRunMetrics,
  getRecommendations,
  approveRecommendation,
  rejectRecommendation,
  getExecutionImpact,
} from "./api/api";
import {
  Clock,
  Users,
  Target,
  AlertOctagon,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

export default function App() {
  // Splash state
  const [showSplash, setShowSplash] = useState(true);

  // Screen state: 'analyze' | 'findings' | 'impact'
  const [currentScreen, setCurrentScreen] = useState("analyze");

  // Analysis stepper state
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzedRowCount, setAnalyzedRowCount] = useState(312);

  // Data state
  const [runId, setRunId] = useState("run-312-crm");
  const [metrics, setMetrics] = useState(null);
  const [funnel, setFunnel] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [impactData, setImpactData] = useState(null);
  const [executionLogs, setExecutionLogs] = useState([]);

  // Card execution state tracking { [recId]: { isRunning, isApproved, isRejected, executionId } }
  const [cardStates, setCardStates] = useState({});

  // Confirmation modal state
  const [activeConfirmRec, setActiveConfirmRec] = useState(null);

  // Toast feedback state
  const [toast, setToast] = useState(null); // { message, type }

  // Error handling state
  const [errorMsg, setErrorMsg] = useState("");

  const showToast = (message, type = "success") => {
    setToast({ message, type });
  };

  // Initial load or reset
  const resetAnalysis = () => {
    setCurrentScreen("analyze");
    setIsAnalyzing(false);
    setCardStates({});
    setActiveConfirmRec(null);
    setErrorMsg("");
    showToast("Workspace reset to initial state", "info");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Step 1: Start Analysis (Sample CRM data or custom file)
  const handleStartAnalysis = async ({ source, file, rows = 312 }) => {
    setErrorMsg("");
    setAnalyzedRowCount(rows);
    setIsAnalyzing(true);

    try {
      if (source === "custom" && file) {
        const uploadRes = await uploadCrmCsv(file);
        if (uploadRes?.run_id) {
          setRunId(uploadRes.run_id);
          showToast(`File "${file.name}" uploaded successfully`);
        }
      } else {
        const seedRes = await seedSampleData();
        if (seedRes?.run_id) {
          setRunId(seedRes.run_id);
          showToast("Sample CRM dataset loaded (312 leads)");
        }
      }
    } catch (err) {
      console.error("Analysis init error:", err);
      setErrorMsg(err.message || "Failed to initialize analysis.");
      setIsAnalyzing(false);
    }
  };

  // Triggered when 4-step analysis pipeline completes (~2.2s)
  const handleStepperComplete = async () => {
    try {
      const [metricsRes, recsRes] = await Promise.all([
        getRunMetrics(runId),
        getRecommendations(runId),
      ]);

      setMetrics(metricsRes.metrics);
      setFunnel(metricsRes.funnel);
      setRecommendations(recsRes.recommendations);
      setIsAnalyzing(false);
      setCurrentScreen("findings");
      showToast("Diagnostic analysis completed · 3 opportunities found");
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Findings load error:", err);
      setErrorMsg(err.message || "Could not retrieve analysis findings.");
      setIsAnalyzing(false);
    }
  };

  // Step 2: Open Approve Confirmation Dialog
  const handleApproveClick = (rec) => {
    setActiveConfirmRec(rec);
  };

  // Step 2: Execute Approved Recommendation
  const handleConfirmApproval = async (rec) => {
    setActiveConfirmRec(null);

    // Set card to running state (indeterminate progress)
    setCardStates((prev) => ({
      ...prev,
      [rec.id]: { isRunning: true, isApproved: false, isRejected: false },
    }));

    try {
      const approveRes = await approveRecommendation(rec.id);

      // Simulate 1.2s orchestration execution delay
      setTimeout(async () => {
        setCardStates((prev) => ({
          ...prev,
          [rec.id]: {
            isRunning: false,
            isApproved: true,
            isRejected: false,
            executionId: approveRes?.execution_id || 7,
          },
        }));

        showToast(`Rule ${rec.rule_code} approved · 112 simulated actions queued`);

        // Fetch impact results immediately for Screen 3
        try {
          const impactRes = await getExecutionImpact(approveRes?.execution_id || 7);
          setImpactData(impactRes.impact);
          setExecutionLogs(impactRes.logs);
        } catch (impErr) {
          console.error("Impact load error:", impErr);
        }
      }, 1200);
    } catch (err) {
      console.error("Approve error:", err);
      setErrorMsg(err.message || "Failed to approve automation.");
      setCardStates((prev) => ({
        ...prev,
        [rec.id]: { isRunning: false, isApproved: false, isRejected: false },
      }));
    }
  };

  // Step 2: Reject Recommendation
  const handleRejectClick = async (rec) => {
    try {
      await rejectRecommendation(rec.id);
      setCardStates((prev) => ({
        ...prev,
        [rec.id]: { isRunning: false, isApproved: false, isRejected: true },
      }));
      showToast(`Recommendation (Rule ${rec.rule_code}) rejected`, "info");
    } catch (err) {
      console.error("Reject error:", err);
      setErrorMsg(err.message || "Failed to reject recommendation.");
    }
  };

  // Navigate to Impact Screen
  const handleViewImpact = async (executionId = 7) => {
    if (!impactData) {
      try {
        const impactRes = await getExecutionImpact(executionId);
        setImpactData(impactRes.impact);
        setExecutionLogs(impactRes.logs);
      } catch (err) {
        console.error("Impact fetch error:", err);
      }
    }
    setCurrentScreen("impact");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const hasApprovedAny = Object.values(cardStates).some((s) => s.isApproved);

  return (
    <div className="min-h-screen bg-[#F7F8FA] text-[#0E1B2B] flex flex-col font-sans selection:bg-[#0E1B2B] selection:text-white animate-app-entrance">
      {/* Top Application Header */}
      <Header
        currentScreen={currentScreen}
        onNavigate={(screenId) => {
          if (screenId === "analyze") setCurrentScreen("analyze");
          if (screenId === "findings" && (metrics || currentScreen === "impact"))
            setCurrentScreen("findings");
          if (screenId === "impact") {
            handleViewImpact();
          }
        }}
        onReset={resetAnalysis}
      />

      {/* Main Workspace Canvas (max-w-[1080px] centered) */}
      <main className="flex-1 w-full max-w-[1080px] mx-auto px-4 sm:px-6 py-8 sm:py-10">
        {/* Global Error Banner */}
        {errorMsg && (
          <div className="mb-6 p-4 bg-[#FDE8E8] border border-[#FACDCD] rounded-[6px] flex items-start justify-between gap-3 text-[13px] text-[#D14343] animate-card-reveal">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Execution Notice</p>
                <p className="mt-0.5">{errorMsg}</p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setErrorMsg("")}
              className="text-[#D14343] font-bold text-[14px] hover:opacity-75 cursor-pointer p-1"
            >
              ✕
            </button>
          </div>
        )}

        {/* =======================================================
            SCREEN 1: ANALYZE
           ======================================================= */}
        {currentScreen === "analyze" && (
          <div className="py-4 animate-screen-enter">
            {!isAnalyzing ? (
              <UploadPanel
                onStartAnalysis={handleStartAnalysis}
                isAnalyzing={isAnalyzing}
              />
            ) : (
              <div className="py-10">
                <Stepper
                  rowCount={analyzedRowCount}
                  onComplete={handleStepperComplete}
                />
              </div>
            )}
          </div>
        )}

        {/* =======================================================
            SCREEN 2: FINDINGS
           ======================================================= */}
        {currentScreen === "findings" && (
          <div className="space-y-8 animate-screen-enter">
            {/* Header (Reveals first) */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E4E8EE] pb-5 animate-card-reveal">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#EBF3FF] text-[#0043CE] text-[11px] font-semibold uppercase tracking-wider mb-2">
                  <span>Diagnostic Report</span>
                  <span>•</span>
                  <span>{metrics?.dataset_name || "sample_crm_export_q1.csv"}</span>
                </div>
                <h1 className="text-[26px] font-semibold text-[#0E1B2B] tracking-tight">
                  Business Findings
                </h1>
                <p className="text-[14px] text-[#5A6B7B] mt-1">
                  AURIX identified the highest-impact opportunities in your process.
                </p>
              </div>

              {hasApprovedAny && (
                <button
                  type="button"
                  onClick={() => handleViewImpact()}
                  className="group aurix-btn px-4 py-2 bg-[#1F9D6B] hover:bg-[#198459] active:bg-[#146b48] text-white text-[13px] font-medium rounded-[4px] shadow-xs transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer animate-checkmark-pop"
                >
                  <span>Review Quantified Impact</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                </button>
              )}
            </div>

            {/* 4 Metric Tiles (Staggered reveal with natural count-up) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <MetricTile
                label="Total Leads"
                value={metrics?.total_leads || 312}
                subtext="Records in active pipeline"
                icon={Users}
                delay={60}
              />

              <MetricTile
                label="Avg Response Time"
                value={metrics?.avg_response_time || "18.4h"}
                subtext="Target benchmark: < 2.0h"
                badge="High Latency"
                badgeType="signal"
                icon={Clock}
                delay={100}
              />

              <MetricTile
                label="Qualified Leads"
                value={metrics?.qualified_leads || 112}
                subtext="High-intent opportunity pool"
                icon={Target}
                delay={140}
              />

              <MetricTile
                label="Weakest Stage"
                value={metrics?.weakest_stage || "Qualification → Quotation"}
                subtext="58 leads stalled at handoff"
                badge="Bottleneck"
                badgeType="danger"
                icon={AlertOctagon}
                delay={180}
              />
            </div>

            {/* Funnel / Process Summary (Delay 200ms) */}
            <ProcessFunnel stages={funnel} delay={200} />

            {/* Recommendations Section */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-[17px] font-semibold text-[#0E1B2B]">
                    Recommended Automations
                  </h2>
                  <p className="text-[13px] text-[#5A6B7B]">
                    Ranked by immediate revenue and cycle-time recovery impact.
                  </p>
                </div>
                <span className="text-[12px] font-medium text-[#5A6B7B] bg-white border border-[#E4E8EE] px-2.5 py-1 rounded-[4px] shadow-2xs">
                  {recommendations.length} recommendations ready
                </span>
              </div>

              {/* 3 Recommendation Cards */}
              <div className="space-y-4">
                {recommendations.map((finding, idx) => (
                  <FindingCard
                    key={finding.id}
                    finding={finding}
                    index={idx}
                    onApproveClick={handleApproveClick}
                    onRejectClick={handleRejectClick}
                    onViewImpact={() => handleViewImpact()}
                    executionState={cardStates[finding.id]}
                  />
                ))}
              </div>
            </div>

            {/* Bottom Floating Navigation for Quick Demo Progression */}
            {hasApprovedAny && (
              <div className="p-4 rounded-[6px] bg-[#0E1B2B] text-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md animate-card-reveal">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1F9D6B] text-white flex items-center justify-center font-bold text-[14px] animate-checkmark-pop">
                    ✓
                  </div>
                  <div>
                    <h4 className="text-[14px] font-semibold">
                      Automation Orchestration Queued
                    </h4>
                    <p className="text-[12px] text-[#A4B3C6]">
                      Simulation generated measurable before vs after efficiency gains.
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleViewImpact()}
                  className="group aurix-btn w-full sm:w-auto px-5 py-2.5 bg-[#1F9D6B] hover:bg-[#198459] active:bg-[#146b48] text-white text-[13px] font-medium rounded-[4px] transition-all flex items-center justify-center gap-2 cursor-pointer shrink-0 shadow-xs"
                >
                  <span>Proceed to Screen 3: Automation Impact</span>
                  <ArrowRight className="w-4 h-4 transition-transform duration-150 group-hover:translate-x-1" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* =======================================================
            SCREEN 3: IMPACT
           ======================================================= */}
        {currentScreen === "impact" && (
          <div className="space-y-8 animate-screen-enter">
            {/* Header (Reveals first) */}
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#E4E8EE] pb-5 animate-card-reveal">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-[4px] bg-[#E6F6EE] text-[#1F9D6B] text-[11px] font-semibold uppercase tracking-wider mb-2 border border-[#C3EBD6]">
                  <span>Simulated Outcome</span>
                  <span>•</span>
                  <span>Rule R1 Orchestrated</span>
                </div>
                <h1 className="text-[26px] font-semibold text-[#0E1B2B] tracking-tight">
                  Automation Impact
                </h1>
                <p className="text-[14px] text-[#5A6B7B] mt-1">
                  Estimated impact based on the analyzed dataset.
                </p>
              </div>

              <div className="flex items-center gap-2.5">
                <button
                  type="button"
                  onClick={() => setCurrentScreen("findings")}
                  className="aurix-btn px-3.5 py-2 text-[13px] font-medium text-[#5A6B7B] hover:text-[#0E1B2B] bg-white border border-[#E4E8EE] rounded-[4px] transition cursor-pointer"
                >
                  ← Back to Findings
                </button>
                <button
                  type="button"
                  onClick={resetAnalysis}
                  className="aurix-btn px-4 py-2 bg-[#0E1B2B] hover:bg-[#1E2E42] active:bg-black text-white text-[13px] font-medium rounded-[4px] transition cursor-pointer shadow-xs"
                >
                  New Analysis
                </button>
              </div>
            </div>

            {/* Impact Summary: 1. Chart, 2. Metrics, 3. Disclaimer */}
            <ImpactSummary impactData={impactData} />

            {/* 4. Execution Audit Log (Delay 320ms + progressive row stagger) */}
            <ExecutionLog logs={executionLogs} delay={320} />
          </div>
        )}
      </main>

      {/* Confirmation Modal */}
      <ConfirmDialog
        isOpen={Boolean(activeConfirmRec)}
        recommendation={activeConfirmRec}
        onCancel={() => setActiveConfirmRec(null)}
        onConfirm={handleConfirmApproval}
        isExecuting={false}
      />

      {/* Non-intrusive Feedback Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* 1-Second Enterprise Startup Sequence */}
      {showSplash && <StartupSplash onComplete={() => setShowSplash(false)} />}

      {/* Minimal Footer */}
      <footer className="w-full bg-white border-t border-[#E4E8EE] py-4 mt-auto">
        <div className="max-w-[1080px] mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-[12px] text-[#8A9BA8]">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-[#5A6B7B]">AURIX</span>
            <span>·</span>
            <span>B2B Business Process Intelligence & Orchestration</span>
          </div>
          <div>LJ University B.Tech Hackathon 2026</div>
        </div>
      </footer>
    </div>
  );
}
