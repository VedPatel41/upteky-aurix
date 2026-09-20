/**
 * AURIX Centralized API Client
 *
 * Connected to Django REST Framework backend on http://localhost:8000.
 * Includes JWT Authentication, auto-refresh, and robust error normalization.
 * Set MOCK = true to activate offline demo safety mode.
 */

import {
  mockSummaryMetrics,
  mockFunnelStages,
  mockRecommendations,
  mockImpactData,
  mockExecutionLogs,
} from "../data/mockData";

// Toggle mock mode. Set to false to run live against Django REST Framework API.
export const MOCK = false;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Helper to simulate network latency in mock mode
 */
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Token Storage Helpers
 */
export function getStoredToken() {
  return localStorage.getItem("aurix_access_token") || null;
}

export function getStoredRefreshToken() {
  return localStorage.getItem("aurix_refresh_token") || null;
}

export function setTokens(access, refresh, user = null) {
  if (access) localStorage.setItem("aurix_access_token", access);
  if (refresh) localStorage.setItem("aurix_refresh_token", refresh);
  if (user) localStorage.setItem("aurix_user", JSON.stringify(user));
}

export function getStoredUser() {
  try {
    const raw = localStorage.getItem("aurix_user");
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("aurix_access_token");
  localStorage.removeItem("aurix_refresh_token");
  localStorage.removeItem("aurix_user");
}

/**
 * Safe fetch wrapper with JWT attachment, error normalization, and 401 auto-refresh
 */
async function request(endpoint, options = {}, isRetry = false) {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = getStoredToken();

  const headers = {
    Accept: "application/json",
    ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
    ...(token && !options.headers?.Authorization ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  try {
    const res = await fetch(url, {
      ...options,
      headers,
    });

    // Handle token expiration & automatic refresh
    if (res.status === 401 && !endpoint.startsWith("/api/auth/") && !isRetry) {
      const refreshToken = getStoredRefreshToken();
      if (refreshToken) {
        try {
          const refreshRes = await fetch(`${API_BASE_URL}/api/auth/refresh`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refresh: refreshToken }),
          });

          if (refreshRes.ok) {
            const tokenData = await refreshRes.json();
            if (tokenData.access) {
              setTokens(tokenData.access, tokenData.refresh || refreshToken);
              // Retry request with new token
              return request(endpoint, options, true);
            }
          }
        } catch {
          clearAuth();
        }
      }
      clearAuth();
    }

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      const errorMessage =
        errorBody?.detail ||
        errorBody?.message ||
        (errorBody?.errors ? JSON.stringify(errorBody.errors) : null) ||
        `Server returned ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        `Unable to connect to AURIX Django Backend at ${API_BASE_URL}. Ensure 'python manage.py runserver 8000' is active.`
      );
    }
    throw err;
  }
}

// =============================================================================
// AUTHENTICATION CLIENT APIs
// =============================================================================

/**
 * 1. Sign Up
 * POST /api/auth/signup
 */
export async function signupUser({ name, email, password, confirm_password }) {
  if (MOCK) {
    await delay(350);
    const mockUser = { id: 99, username: email.split("@")[0], email, name };
    setTokens("mock_access_token", "mock_refresh_token", mockUser);
    return { success: true, user: mockUser };
  }

  const res = await request("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, confirm_password }),
  });

  if (res.tokens?.access) {
    setTokens(res.tokens.access, res.tokens.refresh, res.user);
  }
  return res;
}

/**
 * 2. Sign In / Login
 * POST /api/auth/login
 */
export async function loginUser({ email, password }) {
  if (MOCK) {
    await delay(300);
    const mockUser = {
      id: 1,
      username: email.split("@")[0] || "ved",
      email: email || "ved@aurix.local",
      name: "Ved Prakash",
    };
    setTokens("mock_access_token", "mock_refresh_token", mockUser);
    return { success: true, user: mockUser };
  }

  const res = await request("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });

  if (res.tokens?.access) {
    setTokens(res.tokens.access, res.tokens.refresh, res.user);
  }
  return res;
}

/**
 * 3. Get Current Authenticated User
 * GET /api/auth/me
 */
export async function getCurrentUser() {
  if (MOCK) {
    const u = getStoredUser();
    return { user: u || { id: 1, username: "ved", email: "ved@aurix.local", name: "Ved Prakash" } };
  }

  const token = getStoredToken();
  if (!token) throw new Error("No active session found");
  return request("/api/auth/me");
}

/**
 * 4. Logout
 * POST /api/auth/logout
 */
export async function logoutUser() {
  const refresh = getStoredRefreshToken();
  if (!MOCK && refresh) {
    try {
      await request("/api/auth/logout", {
        method: "POST",
        body: JSON.stringify({ refresh }),
      });
    } catch {
      // Non-fatal if offline
    }
  }
  clearAuth();
  return { success: true };
}

// =============================================================================
// TELEMETRY & BUSINESS APIs
// =============================================================================

/**
 * 5. Health Check
 * GET /api/health
 */
export async function checkHealth() {
  if (MOCK) {
    return { status: "ok", service: "AURIX Mock Engine" };
  }
  return request("/api/health");
}

/**
 * 6. Seed Sample CRM Data
 * POST /api/seed
 */
export async function seedSampleData() {
  if (MOCK) {
    await delay(200);
    return {
      success: true,
      run_id: "run-312-crm",
      message: "Sample CRM dataset loaded successfully",
      rows_count: 312,
      rows: 312,
    };
  }
  return request("/api/seed", { method: "POST" });
}

/**
 * 7. Upload CSV File
 * POST /api/upload
 */
export async function uploadCrmCsv(file) {
  if (MOCK) {
    await delay(400);
    return {
      success: true,
      run_id: `run-${Date.now()}`,
      filename: file.name,
      rows_count: 312,
      rows: 312,
      message: "CSV processed successfully",
    };
  }

  const formData = new FormData();
  formData.append("file", file);

  return request("/api/upload", {
    method: "POST",
    body: formData,
  });
}

/**
 * 8. Fetch Run Metrics & Funnel
 * GET /api/runs/{id}/metrics
 */
export async function getRunMetrics(runId = "run-312-crm") {
  if (MOCK) {
    await delay(250);
    return {
      metrics: mockSummaryMetrics,
      funnel: mockFunnelStages,
    };
  }
  const res = await request(`/api/runs/${runId}/metrics`);
  return {
    metrics: res.metrics || res,
    funnel: res.funnel || [],
    ...res,
  };
}

/**
 * 9. Fetch Recommendations
 * GET /api/runs/{id}/recommendations
 */
export async function getRecommendations(runId = "run-312-crm") {
  if (MOCK) {
    await delay(250);
    return {
      recommendations: mockRecommendations,
    };
  }
  const res = await request(`/api/runs/${runId}/recommendations`);
  return Array.isArray(res) ? { recommendations: res } : res;
}

/**
 * 10. Approve Recommendation
 * POST /api/recommendations/{id}/approve
 */
export async function approveRecommendation(recId, payload = {}) {
  if (MOCK) {
    await delay(300);
    return {
      success: true,
      recommendation_id: recId,
      execution_id: 7,
      status: "approved",
      queued_actions: 112,
      message: "Workflow execution started",
    };
  }
  return request(`/api/recommendations/${recId}/approve`, {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

/**
 * 11. Reject Recommendation
 * POST /api/recommendations/{id}/reject
 */
export async function rejectRecommendation(recId, reason = "") {
  if (MOCK) {
    await delay(200);
    return {
      success: true,
      recommendation_id: recId,
      status: "rejected",
      reason: reason || "User declined proposed automation",
    };
  }
  return request(`/api/recommendations/${recId}/reject`, {
    method: "POST",
    body: JSON.stringify({ reason }),
  });
}

/**
 * 12. Fetch Execution Impact & Simulated Results
 * GET /api/executions/{id}/impact
 */
export async function getExecutionImpact(executionId = 7) {
  if (MOCK) {
    await delay(300);
    return {
      impact: mockImpactData,
      logs: mockExecutionLogs,
    };
  }
  const res = await request(`/api/executions/${executionId}/impact`);
  return {
    impact: res.impact || res,
    logs: res.logs || [],
    ...res,
  };
}
