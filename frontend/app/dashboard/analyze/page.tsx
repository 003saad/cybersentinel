"use client";
import { useState } from "react";
import { analyzeURL } from "@/lib/api";
import { GlowCard } from "@/components/ui/GlowCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { getRiskColor } from "@/lib/utils";
import { Search, Shield, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";
import type { ScanReport } from "@/types/threats";

const SCAN_PHASES = [
  "Connecting via Bright Data Web Unlocker...",
  "Fetching page content...",
  "Launching Scraping Browser for JS analysis...",
  "Taking screenshot...",
  "Checking domain reputation via SERP API...",
  "Extracting security features...",
  "Running AI threat analysis (GPT-4o)...",
  "Generating report...",
];

const riskLevelColors: Record<string, string> = {
  CRITICAL: "text-neon-red",
  HIGH:     "text-neon-orange",
  MEDIUM:   "text-yellow-400",
  LOW:      "text-neon-blue",
  SAFE:     "text-neon-green",
};

export default function AnalyzePage() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<ScanReport | null>(null);
  const [error, setError] = useState("");
  const [scanPhase, setScanPhase] = useState("");

  const handleAnalyze = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setReport(null);
    setError("");

    let phaseIndex = 0;
    const phaseInterval = setInterval(() => {
      setScanPhase(SCAN_PHASES[phaseIndex % SCAN_PHASES.length]);
      phaseIndex++;
    }, 1800);

    try {
      const result = await analyzeURL(url);
      setReport(result);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Analysis failed. Please try again.");
    } finally {
      clearInterval(phaseInterval);
      setLoading(false);
      setScanPhase("");
    }
  };

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-primary font-mono">
          URL <span className="text-neon-blue">Analyzer</span>
        </h2>
        <p className="text-sm text-slate-secondary mt-1">
          Submit any suspicious URL for AI-powered phishing and malware analysis
        </p>
      </div>

      {/* Input */}
      <GlowCard>
        <div className="flex gap-3">
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAnalyze()}
            placeholder="https://suspicious-site.xyz"
            className="flex-1 bg-elevated border border-neon-blue/20 rounded-lg px-4 py-3 text-slate-primary font-mono text-sm placeholder:text-slate-muted focus:outline-none focus:border-neon-blue/60 transition-colors"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading || !url.trim()}
            className="flex items-center gap-2 px-6 py-3 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/40 text-neon-blue rounded-lg font-mono text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            {loading ? "SCANNING" : "ANALYZE"}
          </button>
        </div>

        {loading && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1 bg-elevated rounded-full overflow-hidden">
              <div className="h-full bg-neon-blue rounded-full animate-scan-bar" style={{ width: "60%" }} />
            </div>
            <span className="text-xs font-mono text-neon-blue whitespace-nowrap">{scanPhase}</span>
          </div>
        )}

        {error && <div className="mt-3 text-xs text-neon-red font-mono">⚠ {error}</div>}
      </GlowCard>

      {/* Demo URLs */}
      <div className="flex gap-2 flex-wrap">
        <span className="text-xs text-slate-muted font-mono">Try:</span>
        {["https://google.com", "https://paypa1-secure.xyz/login"].map((demo) => (
          <button
            key={demo}
            onClick={() => setUrl(demo)}
            className="text-xs font-mono text-neon-blue hover:underline"
          >
            {demo}
          </button>
        ))}
      </div>

      {/* Report */}
      {report && (
        <div className="space-y-4 animate-slide-in">
          {/* Risk header */}
          <GlowCard
            glowColor={
              report.risk_level === "CRITICAL" || report.risk_level === "HIGH" ? "red" : "green"
            }
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-mono text-slate-secondary uppercase mb-1">
                  Risk Assessment
                </p>
                <div className="flex items-center gap-3">
                  <span
                    className={`text-5xl font-bold font-mono ${riskLevelColors[report.risk_level] ?? "text-neon-blue"}`}
                  >
                    {report.risk_score}
                  </span>
                  <div>
                    <div
                      className={`text-xl font-bold font-mono ${riskLevelColors[report.risk_level] ?? "text-neon-blue"}`}
                    >
                      {report.risk_level}
                    </div>
                    <div className="text-sm text-slate-secondary">
                      {report.is_phishing ? "⚠ Phishing Detected" : "✓ No phishing detected"}
                    </div>
                  </div>
                </div>
                {/* Bar */}
                <div className="mt-3 w-64 h-2 bg-elevated rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-1000"
                    style={{
                      width: `${report.risk_score}%`,
                      backgroundColor: getRiskColor(report.risk_score),
                    }}
                  />
                </div>
              </div>
              {report.risk_level === "SAFE" ? (
                <CheckCircle className="w-16 h-16 text-neon-green opacity-50" />
              ) : (
                <AlertTriangle
                  className={`w-16 h-16 opacity-50 ${riskLevelColors[report.risk_level] ?? "text-neon-orange"}`}
                />
              )}
            </div>
          </GlowCard>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* AI summary */}
            <GlowCard glowColor="purple">
              <h3 className="font-mono font-bold text-sm text-slate-primary mb-3 flex items-center gap-2">
                <span className="text-neon-purple">◈</span> AI ANALYSIS
              </h3>
              <p className="text-sm text-slate-secondary leading-relaxed">
                {report.ai_summary ?? "Analysis complete."}
              </p>
              {report.attack_type && (
                <div className="mt-3 flex flex-wrap gap-2">
                  <span className="text-xs bg-neon-purple/20 text-neon-purple border border-neon-purple/30 px-2 py-1 rounded font-mono">
                    {report.attack_type.replace("_", " ").toUpperCase()}
                  </span>
                  {report.brand_impersonated && (
                    <span className="text-xs bg-neon-red/20 text-neon-red border border-neon-red/30 px-2 py-1 rounded font-mono">
                      IMPERSONATES: {report.brand_impersonated.toUpperCase()}
                    </span>
                  )}
                </div>
              )}
            </GlowCard>

            {/* Feature breakdown */}
            <GlowCard>
              <h3 className="font-mono font-bold text-sm text-slate-primary mb-3">
                DETECTED FEATURES
              </h3>
              <div className="space-y-2">
                {[
                  { label: "SSL Certificate",   ok: report.features?.has_ssl ?? false },
                  { label: "Login Form",         ok: !(report.features?.has_login_form ?? false) },
                  { label: "Password Field",     ok: !(report.features?.has_password_field ?? false) },
                  { label: "Suspicious TLD",     ok: !(report.features?.has_suspicious_tld ?? false) },
                  { label: "Typosquatting",      ok: !(report.features?.typosquatting_detected ?? false) },
                  {
                    label: "Clean Redirects",
                    ok: (report.features?.redirect_count ?? 0) < 3,
                  },
                ].map(({ label, ok }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-slate-secondary font-mono">{label}</span>
                    <span className={ok ? "text-neon-green" : "text-neon-red"}>{ok ? "✓" : "✗"}</span>
                  </div>
                ))}
              </div>
            </GlowCard>
          </div>

          {/* Recommended actions */}
          {(report.recommended_actions?.length ?? 0) > 0 && (
            <GlowCard>
              <h3 className="font-mono font-bold text-sm text-slate-primary mb-3">
                RECOMMENDED ACTIONS
              </h3>
              <div className="space-y-2">
                {report.recommended_actions!.map((action, i) => {
                  const priorityColor: Record<string, string> = {
                    immediate:   "neon-red",
                    "short-term":"neon-orange",
                    "long-term": "neon-blue",
                  };
                  const c = priorityColor[action.priority] ?? "neon-blue";
                  return (
                    <div
                      key={i}
                      className={`flex items-start gap-3 p-3 rounded-lg bg-elevated border border-${c}/20`}
                    >
                      <span className={`text-xs font-mono text-${c} mt-0.5 uppercase`}>
                        {action.priority}
                      </span>
                      <p className="text-xs text-slate-secondary flex-1">{action.action}</p>
                      <span className="text-xs font-mono text-slate-muted ml-auto">
                        {action.owner}
                      </span>
                    </div>
                  );
                })}
              </div>
            </GlowCard>
          )}

          {/* MITRE ATT&CK */}
          {(report.mitre_techniques?.length ?? 0) > 0 && (
            <GlowCard>
              <h3 className="font-mono font-bold text-sm text-slate-primary mb-3">
                MITRE ATT&CK MAPPING
              </h3>
              <div className="flex flex-wrap gap-2">
                {report.mitre_techniques!.map((t) => (
                  <span
                    key={t}
                    className="text-xs font-mono bg-neon-purple/20 text-neon-purple border border-neon-purple/30 px-2 py-1 rounded"
                  >
                    {t}
                  </span>
                ))}
              </div>
            </GlowCard>
          )}

          {/* Bright Data transparency */}
          <GlowCard className="border-neon-blue/5">
            <h3 className="font-mono text-xs text-slate-muted mb-2">
              BRIGHT DATA INTELLIGENCE USED
            </h3>
            <div className="flex gap-4 flex-wrap">
              {Object.entries(report.bright_data_used ?? {}).map(([key, used]) => (
                <span
                  key={key}
                  className={`text-xs font-mono ${used ? "text-neon-green" : "text-slate-muted line-through"}`}
                >
                  {used ? "✓" : "✗"} {key.replace("_", " ").toUpperCase()}
                </span>
              ))}
            </div>
            {report.duration_ms && (
              <p className="text-xs text-slate-muted mt-1">
                Analysis completed in {report.duration_ms}ms
              </p>
            )}
          </GlowCard>
        </div>
      )}
    </div>
  );
}
