import React, { useState } from "react";
import {
  Lock,
  Mail,
  User as UserIcon,
  Eye,
  EyeOff,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Zap,
} from "lucide-react";
import { loginUser, signupUser } from "../api/api";

export default function AuthScreen({ onAuthSuccess, onDemoFill }) {
  const [mode, setMode] = useState("login"); // 'login' | 'signup'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  // Login form state
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");

  // Signup form state
  const [fullName, setFullName] = useState("");
  const [signupEmail, setSignupEmail] = useState("");
  const [signupPassword, setSignupPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Password strength calculation
  const getPasswordStrength = (pass) => {
    if (!pass) return { score: 0, label: "", color: "" };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 8) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 2) return { score: 1, label: "Basic", color: "bg-[#D14343]" };
    if (score <= 3) return { score: 2, label: "Moderate", color: "bg-[#E8A33D]" };
    return { score: 3, label: "Strong", color: "bg-[#1F9D6B]" };
  };

  const strength = getPasswordStrength(signupPassword);

  const handleLoginSubmit = async (e) => {
    e.preventDefault();
    if (!loginEmail.trim() || !loginPassword) {
      setError("Please fill in both email and password.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await loginUser({
        email: loginEmail.trim(),
        password: loginPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(res.user);
      }, 550);
    } catch (err) {
      setError(err.message || "Invalid credentials. Please try again.");
      setLoading(false);
    }
  };

  const handleSignupSubmit = async (e) => {
    e.preventDefault();
    if (!fullName.trim() || !signupEmail.trim() || !signupPassword) {
      setError("Please complete all required fields.");
      return;
    }

    if (signupPassword.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    if (signupPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      const res = await signupUser({
        name: fullName.trim(),
        email: signupEmail.trim(),
        password: signupPassword,
        confirm_password: confirmPassword,
      });

      setSuccess(true);
      setTimeout(() => {
        onAuthSuccess(res.user);
      }, 550);
    } catch (err) {
      setError(err.message || "Failed to create account. Please check inputs.");
      setLoading(false);
    }
  };

  const fillDemoAdmin = () => {
    setMode("login");
    setLoginEmail("ved");
    setLoginPassword("Pved1110@");
    setError("");
  };

  return (
    <div className="min-h-screen bg-[#F7F8FA] flex flex-col justify-center items-center px-4 py-8 relative selection:bg-[#0043CE]/15">
      {/* Subtle Background Pattern */}
      <div 
        className="absolute inset-0 pointer-events-none opacity-40"
        style={{
          backgroundImage: "radial-gradient(#E2E6EC 1px, transparent 1px)",
          backgroundSize: "24px 24px"
        }}
      />

      <div className="w-full max-w-[440px] relative z-10 transition-all duration-300">
        {/* Brand Header */}
        <div className="text-center mb-8 animate-fadeIn">
          <div className="inline-flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-white border border-[#E2E6EC] shadow-sm mb-3.5 hover:border-[#CBD3DC] transition-colors">
            <span className="w-2 h-2 rounded-full bg-[#1F9D6B] animate-pulse" />
            <span className="text-[12px] font-semibold tracking-wider text-[#0E1B2B] uppercase">
              AURIX ROI Engine
            </span>
          </div>
          <h1 className="text-3xl font-extrabold text-[#0E1B2B] tracking-tight">
            Enterprise Intelligence
          </h1>
          <p className="text-[14px] text-[#5A6B7B] mt-1.5 font-normal">
            B2B Process Bottleneck Diagnostic & Automation Sandbox
          </p>
        </div>

        {/* Auth Card */}
        <div className="bg-white border border-[#E2E6EC] rounded-xl shadow-[0_4px_24px_rgba(14,27,43,0.06)] p-7 transition-all duration-300 hover:shadow-[0_8px_32px_rgba(14,27,43,0.08)]">
          {/* Tabs */}
          <div className="flex border-b border-[#E2E6EC] pb-3 mb-6">
            <button
              type="button"
              onClick={() => {
                setMode("login");
                setError("");
              }}
              className={`flex-1 text-center py-1.5 text-[14px] font-semibold transition-all relative ${
                mode === "login"
                  ? "text-[#0043CE]"
                  : "text-[#5A6B7B] hover:text-[#0E1B2B]"
              }`}
            >
              Sign In
              {mode === "login" && (
                <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-[#0043CE] rounded-full transition-all" />
              )}
            </button>
            <button
              type="button"
              onClick={() => {
                setMode("signup");
                setError("");
              }}
              className={`flex-1 text-center py-1.5 text-[14px] font-semibold transition-all relative ${
                mode === "signup"
                  ? "text-[#0043CE]"
                  : "text-[#5A6B7B] hover:text-[#0E1B2B]"
              }`}
            >
              Create Account
              {mode === "signup" && (
                <span className="absolute bottom-[-13px] left-0 right-0 h-[2px] bg-[#0043CE] rounded-full transition-all" />
              )}
            </button>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-5 p-3 rounded-lg bg-[#FFF2F2] border border-[#FCD2D2] flex items-start gap-2.5 text-[#D14343] text-[13px] animate-slideDown">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {mode === "login" && (
            <form onSubmit={handleLoginSubmit} className="space-y-4">
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5A6B7B] mb-1.5">
                  Email or Username
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A98A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    placeholder="ved or consultant@company.com"
                    autoComplete="username"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E2E6EC] bg-[#F7F8FA]/60 text-[14px] text-[#0E1B2B] placeholder-[#8A98A8] focus:bg-white focus:outline-none focus:border-[#0043CE] focus:ring-2 focus:ring-[#0043CE]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5A6B7B]">
                    Password
                  </label>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A98A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    placeholder="Enter password"
                    autoComplete="current-password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#E2E6EC] bg-[#F7F8FA]/60 text-[14px] text-[#0E1B2B] placeholder-[#8A98A8] focus:bg-white focus:outline-none focus:border-[#0043CE] focus:ring-2 focus:ring-[#0043CE]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A98A8] hover:text-[#0E1B2B] p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-[14px] flex items-center justify-center gap-2 transition-all mt-2 shadow-sm ${
                  success
                    ? "bg-[#1F9D6B] text-white"
                    : loading
                    ? "bg-[#0043CE]/80 text-white cursor-wait"
                    : "bg-[#0043CE] text-white hover:bg-[#0037A8] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                }`}
              >
                {success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-scaleUp" />
                    <span>Authenticated · Launching...</span>
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Verifying Session...</span>
                  </>
                ) : (
                  <>
                    <span>Sign In</span>
                    <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* SIGNUP FORM */}
          {mode === "signup" && (
            <form onSubmit={handleSignupSubmit} className="space-y-3.5">
              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5A6B7B] mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <UserIcon className="w-4 h-4 text-[#8A98A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Aditya Sharma"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E2E6EC] bg-[#F7F8FA]/60 text-[14px] text-[#0E1B2B] placeholder-[#8A98A8] focus:bg-white focus:outline-none focus:border-[#0043CE] focus:ring-2 focus:ring-[#0043CE]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5A6B7B] mb-1">
                  Work Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#8A98A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    value={signupEmail}
                    onChange={(e) => setSignupEmail(e.target.value)}
                    placeholder="aditya@company.com"
                    autoComplete="email"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E2E6EC] bg-[#F7F8FA]/60 text-[14px] text-[#0E1B2B] placeholder-[#8A98A8] focus:bg-white focus:outline-none focus:border-[#0043CE] focus:ring-2 focus:ring-[#0043CE]/10 transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5A6B7B] mb-1">
                  Password (min. 6 characters)
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A98A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={signupPassword}
                    onChange={(e) => setSignupPassword(e.target.value)}
                    placeholder="Create secure password"
                    required
                    className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-[#E2E6EC] bg-[#F7F8FA]/60 text-[14px] text-[#0E1B2B] placeholder-[#8A98A8] focus:bg-white focus:outline-none focus:border-[#0043CE] focus:ring-2 focus:ring-[#0043CE]/10 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8A98A8] hover:text-[#0E1B2B] p-1 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {signupPassword && (
                  <div className="mt-1.5 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-[#E2E6EC] rounded-full overflow-hidden flex gap-1">
                      <div className={`h-full ${strength.score >= 1 ? strength.color : "bg-transparent"} flex-1 rounded-full`} />
                      <div className={`h-full ${strength.score >= 2 ? strength.color : "bg-transparent"} flex-1 rounded-full`} />
                      <div className={`h-full ${strength.score >= 3 ? strength.color : "bg-transparent"} flex-1 rounded-full`} />
                    </div>
                    <span className="text-[11px] font-medium text-[#5A6B7B]">{strength.label}</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[12px] font-semibold uppercase tracking-wider text-[#5A6B7B] mb-1">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#8A98A8] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat password"
                    required
                    className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-[#E2E6EC] bg-[#F7F8FA]/60 text-[14px] text-[#0E1B2B] placeholder-[#8A98A8] focus:bg-white focus:outline-none focus:border-[#0043CE] focus:ring-2 focus:ring-[#0043CE]/10 transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading || success}
                className={`w-full py-2.5 px-4 rounded-lg font-semibold text-[14px] flex items-center justify-center gap-2 transition-all mt-3 shadow-sm ${
                  success
                    ? "bg-[#1F9D6B] text-white"
                    : loading
                    ? "bg-[#0043CE]/80 text-white cursor-wait"
                    : "bg-[#0043CE] text-white hover:bg-[#0037A8] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.99]"
                }`}
              >
                {success ? (
                  <>
                    <CheckCircle2 className="w-4 h-4 animate-scaleUp" />
                    <span>Account Created · Launching...</span>
                  </>
                ) : loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* Quick Demo Credentials for Judges */}
          <div className="mt-6 pt-4 border-t border-[#E2E6EC] flex items-center justify-between text-[12px] text-[#5A6B7B]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#1F9D6B]" />
              Demo Superuser Ready
            </span>
            <button
              type="button"
              onClick={fillDemoAdmin}
              className="text-[#0043CE] font-semibold hover:underline flex items-center gap-1 hover:text-[#0037A8] transition-colors"
            >
              <Zap className="w-3 h-3 text-[#E8A33D]" />
              Fill Admin (ved)
            </button>
          </div>
        </div>

        {/* Footer Note */}
        <div className="text-center mt-6 text-[12px] text-[#8A98A8]">
          AURIX Pre-Sales Diagnostic Sandbox · Upteky Consulting Engine
        </div>
      </div>
    </div>
  );
}
