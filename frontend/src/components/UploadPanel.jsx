import React, { useState, useRef } from "react";
import { UploadCloud, FileText, CheckCircle2, ArrowRight, Database, X, Loader2, Sparkles, Check } from "lucide-react";

/**
 * UploadPanel Component (Screen 1: Analyze)
 *
 * Implements comprehensive hover, drag, and micro-interaction states:
 * - Idle breathing animation
 * - Upload icon floating on hover
 * - Drag pulse feedback
 * - File selection scale-in entrance
 * - Tactile sample CRM data button with loading & success state
 */
export default function UploadPanel({ onStartAnalysis, isAnalyzing }) {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [buttonState, setButtonState] = useState("idle"); // 'idle' | 'loading' | 'success'
  const fileInputRef = useRef(null);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    setErrorMsg("");

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e) => {
    e.preventDefault();
    setErrorMsg("");
    if (e.target.files && e.target.files[0]) {
      validateAndSetFile(e.target.files[0]);
    }
  };

  const validateAndSetFile = (file) => {
    if (!file.name.endsWith(".csv")) {
      setErrorMsg("Please select a valid .csv file.");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setErrorMsg("File size exceeds the 10 MB limit.");
      return;
    }
    setSelectedFile({
      name: file.name,
      size: `${(file.size / 1024).toFixed(1)} KB`,
      rawFile: file,
      rows: 312,
    });
  };

  const handleRemoveFile = (e) => {
    e.stopPropagation();
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleSampleClick = () => {
    if (isAnalyzing || buttonState !== "idle") return;
    setButtonState("loading");

    // Tactile micro-delay before launching stepper
    setTimeout(() => {
      setButtonState("success");
      setTimeout(() => {
        onStartAnalysis({ source: "sample", rows: 312 });
      }, 180);
    }, 250);
  };

  return (
    <div className="w-full max-w-[720px] mx-auto animate-screen-enter">
      {/* Primary Hero Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-[#EBF3FF] border border-[#D0E2FF] text-[#0043CE] text-[12px] font-medium mb-3 transition-transform hover:scale-[1.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#0043CE] animate-pulse"></span>
          Fast Pre-Sales ROI Engine
        </div>
        <h1 className="text-[28px] font-semibold text-[#0E1B2B] tracking-tight mb-2">
          Analyze your business data
        </h1>
        <p className="text-[14px] text-[#5A6B7B] max-w-[540px] mx-auto leading-relaxed">
          Upload a CRM export to identify process bottlenecks and quantify automation opportunities in under 60 seconds.
        </p>
      </div>

      {/* Main Container Card */}
      <div className="aurix-card shadow-sm border border-[#E4E8EE] p-6 sm:p-8 bg-white transition-all">
        {/* Recommended Hackathon Action: Sample Data Banner */}
        <div className="mb-6 p-4 rounded-[6px] bg-[#F4F8F6] border border-[#D5EADF] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-all duration-200 hover:border-[#B5DEC8] hover:shadow-2xs">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-[4px] bg-[#1F9D6B]/15 text-[#1F9D6B] flex items-center justify-center shrink-0 mt-0.5 transition-transform duration-200 hover:scale-105">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[14px] font-semibold text-[#0E1B2B]">
                  Preloaded Demo Dataset
                </span>
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[#1F9D6B]/15 text-[#1F9D6B]">
                  312 Leads
                </span>
              </div>
              <p className="text-[12px] text-[#5A6B7B] mt-0.5">
                Indian B2B SME CRM export with real funnel stages & drop-off metrics.
              </p>
            </div>
          </div>

          {/* Polished Sample Data Button */}
          <button
            type="button"
            onClick={handleSampleClick}
            disabled={isAnalyzing || buttonState !== "idle"}
            className="group aurix-btn w-full sm:w-auto px-4 py-2.5 bg-[#1F9D6B] hover:bg-[#198459] active:bg-[#146b48] text-white text-[13px] font-medium rounded-[4px] shadow-xs transition-all flex items-center justify-center gap-2 shrink-0 cursor-pointer disabled:opacity-70"
          >
            {buttonState === "loading" ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Reading Dataset...</span>
              </>
            ) : buttonState === "success" ? (
              <>
                <div className="animate-checkmark-pop">
                  <Check className="w-3.5 h-3.5" />
                </div>
                <span>Loaded!</span>
              </>
            ) : (
              <>
                <span>Use sample CRM data</span>
                <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-1.5" />
              </>
            )}
          </button>
        </div>

        {/* Divider */}
        <div className="relative my-6 text-center">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-[#E4E8EE]"></div>
          </div>
          <span className="relative px-3 bg-white text-[12px] uppercase font-medium tracking-wider text-[#8A9BA8]">
            Or upload your own export
          </span>
        </div>

        {/* Drag & Drop Zone with Distinct Interactive States */}
        <div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`group relative border-2 border-dashed rounded-[6px] p-6 text-center cursor-pointer transition-all duration-200 ${
            dragActive
              ? "border-[#0043CE] bg-[#F0F4FA] scale-[1.008] animate-drag-pulse"
              : !selectedFile
              ? "border-[#D7DFE9] hover:border-[#0E1B2B] bg-[#FAFBFC] hover:bg-[#F7F8FA] animate-dropzone-breathe"
              : "border-[#1F9D6B]/50 bg-[#F4F8F6]/40"
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            onChange={handleChange}
            className="hidden"
            id="csv-file-input"
          />

          {!selectedFile ? (
            <div className="flex flex-col items-center justify-center py-2">
              <div className="w-10 h-10 rounded-[6px] bg-[#F0F3F7] text-[#5A6B7B] flex items-center justify-center mb-3 transition-all duration-200 group-hover:-translate-y-1.5 group-hover:scale-105 group-hover:text-[#0E1B2B] group-hover:bg-[#EBF3FF]">
                <UploadCloud className="w-5 h-5" />
              </div>
              <p className="text-[14px] font-medium text-[#0E1B2B]">
                Drop your CSV here, <span className="text-[#0043CE] underline underline-offset-2 group-hover:text-[#002D9C]">or choose a file</span>
              </p>
              <p className="text-[12px] text-[#5A6B7B] mt-1">
                CSV files up to 10 MB (HubSpot, Salesforce, Zoho, Excel format)
              </p>
            </div>
          ) : (
            <div className="flex items-center justify-between p-3.5 bg-white rounded-[4px] border border-[#D3E0F0] text-left shadow-xs animate-card-reveal">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-[4px] bg-[#EBF3FF] text-[#0043CE] flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[13px] font-semibold text-[#0E1B2B] truncate max-w-[280px]">
                      {selectedFile.name}
                    </span>
                    <div className="animate-checkmark-pop">
                      <CheckCircle2 className="w-4 h-4 text-[#1F9D6B]" />
                    </div>
                  </div>
                  <div className="text-[11px] text-[#5A6B7B]">
                    {selectedFile.size} · Estimated {selectedFile.rows} rows detected
                  </div>
                </div>
              </div>

              <button
                type="button"
                onClick={handleRemoveFile}
                className="p-1.5 text-[#8A9BA8] hover:text-[#0E1B2B] hover:bg-[#F0F3F7] rounded transition cursor-pointer"
                title="Remove file"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>

        {errorMsg && (
          <div className="mt-3 text-[12px] text-[#D14343] font-medium flex items-center gap-1.5 animate-card-reveal">
            <span>•</span> {errorMsg}
          </div>
        )}

        {/* Upload Action Button if file is selected */}
        {selectedFile && (
          <div className="mt-4 flex justify-end animate-card-reveal">
            <button
              type="button"
              onClick={() => onStartAnalysis({ source: "custom", file: selectedFile.rawFile })}
              disabled={isAnalyzing}
              className="group aurix-btn px-5 py-2.5 bg-[#0E1B2B] hover:bg-[#1E2E42] text-white text-[13px] font-medium rounded-[4px] transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
            >
              <span>Analyze {selectedFile.name}</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 group-hover:translate-x-1.5" />
            </button>
          </div>
        )}
      </div>

      {/* Trust & Spec Footer */}
      <div className="mt-6 flex flex-wrap items-center justify-center gap-6 text-[12px] text-[#5A6B7B]">
        <div className="flex items-center gap-1.5 transition-transform hover:scale-[1.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F9D6B]"></span>
          <span>Zero cloud data leakage</span>
        </div>
        <div className="flex items-center gap-1.5 transition-transform hover:scale-[1.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F9D6B]"></span>
          <span>Standard CRM Schema Auto-Mapper</span>
        </div>
        <div className="flex items-center gap-1.5 transition-transform hover:scale-[1.02]">
          <span className="w-1.5 h-1.5 rounded-full bg-[#1F9D6B]"></span>
          <span>Deterministic Rule Engine</span>
        </div>
      </div>
    </div>
  );
}
