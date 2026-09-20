/**
 * AURIX Mock Data Store
 * Matches frozen backend API contract for Hackathon 2026.
 */

export const mockSummaryMetrics = {
  run_id: "run-312-crm",
  total_leads: 312,
  avg_response_time: "18.4h",
  avg_response_time_num: 18.4,
  qualified_leads: 112,
  weakest_stage: "Qualification → Quotation",
  weakest_stage_id: "qual_to_quote",
  timeframe: "Last 30 Days",
  dataset_name: "sample_crm_export_q1.csv",
  rows_analyzed: 312,
};

export const mockFunnelStages = [
  {
    id: "lead",
    name: "Lead",
    count: 312,
    conversion_rate: "100%",
    is_weakest: false,
  },
  {
    id: "contacted",
    name: "Contacted",
    count: 248,
    conversion_rate: "79.5%",
    is_weakest: false,
  },
  {
    id: "qualified",
    name: "Qualified",
    count: 112,
    conversion_rate: "45.2%",
    is_weakest: true, // Bottleneck trigger
  },
  {
    id: "quoted",
    name: "Quoted",
    count: 54,
    conversion_rate: "48.2%",
    is_weakest: false,
  },
  {
    id: "won",
    name: "Won",
    count: 22,
    conversion_rate: "40.7%",
    is_weakest: false,
  },
];

export const mockRecommendations = [
  {
    id: 1,
    rule_code: "R1",
    severity: "high",
    title: "Qualified leads ka first response 18.4h lag raha hai",
    detail: "112 leads me first contact 4 ghante ke baad hua.",
    metric_before: 18.4,
    metric_after_target: 2.0,
    metric_unit: "hours",
    proposed_action: "Auto follow-up trigger after 2 hours",
    affected_count: 112,
    status: "pending", // 'pending' | 'approved' | 'rejected'
  },
  {
    id: 2,
    rule_code: "R2",
    severity: "medium",
    title: "Quotation follow-up drop-off rate 46%",
    detail: "68 qualified leads par quotation send hone ke baad 5 din tak koi follow-up nahi hua.",
    metric_before: 5.2,
    metric_after_target: 1.0,
    metric_unit: "days",
    proposed_action: "Automated quotation status reminder at 48 hours",
    affected_count: 68,
    status: "pending",
  },
  {
    id: 3,
    rule_code: "R3",
    severity: "low",
    title: "Incomplete lead enrichment causing qualification delay",
    detail: "45 incoming leads missing key company size & industry data before SDR assignment.",
    metric_before: 6.5,
    metric_after_target: 0.5,
    metric_unit: "hours",
    proposed_action: "Instant CRM contact enrichment via webhook",
    affected_count: 45,
    status: "pending",
  },
];

export const mockImpactData = {
  execution_id: 7,
  recommendation_id: 1,
  items_count: 112,
  before: {
    label: "Current",
    value: 18.4,
    unit: "hours",
  },
  after: {
    label: "With AURIX",
    value: 2.0,
    unit: "hours",
  },
  hours_saved_per_month: 42.0,
  revenue_opportunity_inr: 240000,
  recovered_leads: 39,
  disclaimer: "Simulated impact — based on your dataset and industry benchmarks.",
};

export const mockExecutionLogs = [
  {
    id: "log-1",
    status: "success",
    action: "Follow-up simulated",
    company: "Shah Industries",
    timestamp: "14:32",
    recipient: "rajesh.shah@shahindustries.in",
  },
  {
    id: "log-2",
    status: "success",
    action: "Follow-up simulated",
    company: "Patel Manufacturing",
    timestamp: "14:32",
    recipient: "vimal.p@patelmanuf.com",
  },
  {
    id: "log-3",
    status: "success",
    action: "Follow-up simulated",
    company: "Aarav Pharma",
    timestamp: "14:33",
    recipient: "procurement@aaravpharma.co",
  },
  {
    id: "log-4",
    status: "success",
    action: "Follow-up simulated",
    company: "Mehta Logistics & Supply",
    timestamp: "14:33",
    recipient: "kunal@mehtalogistics.in",
  },
  {
    id: "log-5",
    status: "success",
    action: "Follow-up simulated",
    company: "Apex Precision Tools",
    timestamp: "14:34",
    recipient: "contact@apexptools.com",
  },
];
