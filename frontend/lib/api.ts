import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
export const WS_URL = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000")
  .replace(/^http/, "ws") + "/ws/threats";

const api = axios.create({ baseURL: API_URL });

/* ── URL Analysis ──────────────────────────────────────── */
export async function analyzeURL(url: string) {
  const { data } = await api.post("/api/v1/analyze/url", { url });
  return data.data;
}

export async function getReport(reportId: string) {
  const { data } = await api.get(`/api/v1/analyze/report/${reportId}`);
  return data.data;
}

/* ── Dashboard ─────────────────────────────────────────── */
export async function getDashboardStats() {
  const { data } = await api.get("/api/v1/dashboard/stats");
  return data.data;
}

export async function getRecentActivity() {
  const { data } = await api.get("/api/v1/dashboard/activity");
  return data.data;
}

/* ── Threats ───────────────────────────────────────────── */
export async function getThreats(params?: {
  page?: number;
  limit?: number;
  severity?: string;
  type?: string;
}) {
  const { data } = await api.get("/api/v1/threats", { params });
  return data;
}

export async function getLiveFeed() {
  const { data } = await api.get("/api/v1/threats/feed");
  return data.data;
}

export async function getThreatStats() {
  const { data } = await api.get("/api/v1/threats/stats");
  return data.data;
}

/* ── Monitor ───────────────────────────────────────────── */
export async function addMonitorTarget(payload: { type: string; value: string; scan_frequency: string }) {
  const { data } = await api.post("/api/v1/monitor/target", payload);
  return data.data;
}

export async function getMonitorTargets() {
  const { data } = await api.get("/api/v1/monitor/targets");
  return data.data;
}

export async function deleteMonitorTarget(id: string) {
  const { data } = await api.delete(`/api/v1/monitor/target/${id}`);
  return data;
}

/* ── Credentials ───────────────────────────────────────── */
export async function scanCredentials(payload: { query: string; type: string }) {
  const { data } = await api.post("/api/v1/credentials/scan", payload);
  return data.data;
}

export async function getBreaches() {
  const { data } = await api.get("/api/v1/credentials/breaches");
  return data.data;
}

/* ── Alerts ────────────────────────────────────────────── */
export async function getAlertConfig() {
  const { data } = await api.get("/api/v1/alerts/config");
  return data.data;
}

export async function saveAlertConfig(payload: object) {
  const { data } = await api.post("/api/v1/alerts/config", payload);
  return data.data;
}

export async function getAlertHistory() {
  const { data } = await api.get("/api/v1/alerts/history");
  return data.data;
}

export async function sendTestAlert() {
  const { data } = await api.post("/api/v1/alerts/test");
  return data;
}
