export type Severity = "critical" | "high" | "medium" | "low" | "info";
export type RiskLevel = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "SAFE";
export type ThreatType = "phishing" | "malware" | "credential_leak" | "suspicious_domain" | "scam" | "data_breach";

export interface Threat {
  threat_id: string;
  type: ThreatType;
  severity: Severity;
  risk_score: number;
  title: string;
  summary: string;
  detected_at: string;
  status?: string;
  indicators?: {
    ips?: string[];
    domains?: string[];
    emails?: string[];
    cves?: string[];
  };
}

export interface ScanReport {
  report_id: string;
  target_url: string;
  url: string;
  status: string;
  risk_score: number;
  risk_level: RiskLevel;
  is_phishing?: boolean;
  confidence?: number;
  attack_type?: string;
  brand_impersonated?: string;
  ai_summary?: string;
  mitre_techniques?: string[];
  features?: {
    has_ssl?: boolean;
    has_login_form?: boolean;
    has_password_field?: boolean;
    has_suspicious_tld?: boolean;
    typosquatting_detected?: boolean;
    redirect_count?: number;
    domain_age_days?: number | null;
    ssl_issuer?: string;
  };
  recommended_actions?: Array<{
    priority: "immediate" | "short-term" | "long-term";
    action: string;
    owner: string;
  }>;
  bright_data_used?: Record<string, boolean>;
  duration_ms?: number;
  created_at?: string;
}

export interface MonitorTarget {
  target_id: string;
  type: "domain" | "brand" | "keyword" | "email_domain";
  value: string;
  status: "active" | "paused";
  scan_frequency: "hourly" | "daily" | "realtime";
  last_scanned?: string;
  threat_count?: number;
}

export interface CredentialLeak {
  leak_id: string;
  breach_name: string;
  affected_domain: string;
  affected_count?: number;
  severity: Severity;
  leak_date?: string;
  detected_at: string;
  data_types: string[];
  verified?: boolean;
  ai_analysis?: string;
}

export interface DashboardStats {
  threats_today: number;
  threats_week?: number;
  critical_count: number;
  high_count: number;
  scans_performed: number;
  detection_rate?: number;
  monitoring_status?: string;
}
