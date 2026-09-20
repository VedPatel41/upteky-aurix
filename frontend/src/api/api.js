/**
 * AURIX Centralized API Client
 *
 * Switch MOCK to false when integrating with FastAPI backend.
 * All API operations strictly flow through this interface.
 */

import {
  mockSummaryMetrics,
  mockFunnelStages,
  mockRecommendations,
  mockImpactData,
  mockExecutionLogs,
} from "../data/mockData";

// Toggle mock mode. When false, calls live FastAPI backend.
export const MOCK = true;

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8000";

/**
 * Helper to simulate network latency in mock mode
 */
const delay = (ms = 350) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Safe fetch wrapper with error normalization
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        ...(options.body instanceof FormData ? {} : { "Content-Type": "application/json" }),
        ...options.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const errorBody = await res.json().catch(() => null);
      const errorMessage =
        errorBody?.detail || errorBody?.message || `Server returned ${res.status}: ${res.statusText}`;
      throw new Error(errorMessage);
    }

    return await res.json();
  } catch (err) {
    if (err.name === "TypeError" && err.message.includes("fetch")) {
      throw new Error(
        `Unable to connect to AURIX Backend at ${API_BASE_URL}. Ensure the FastAPI server is running or switch to Demo Mock Mode.`
      );
    }
    throw err;
  }
}

/**
 * 1. Seed or Trigger Sample CRM Data Analysis
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
    };
  }
  return request("/api/seed", { method: "POST" });
}

/**
 * 2. Upload CSV File
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
 * 3. Fetch Run Metrics & Funnel
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
  return request(`/api/runs/${runId}/metrics`);
}

/**
 * 4. Fetch Recommendations
 * GET /api/runs/{id}/recommendations
 */
export async function getRecommendations(runId = "run-312-crm") {
  if (MOCK) {
    await delay(250);
    return {
      recommendations: mockRecommendations,
    };
  }
  return request(`/api/runs/${runId}/recommendations`);
}

/**
 * 5. Approve Recommendation
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
 * 6. Reject Recommendation
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
 * 7. Fetch Execution Impact & Simulated Results
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
  return request(`/api/executions/${executionId}/impact`);
}
