"use client";
import { useEffect, useState } from "react";
import { getThreats } from "@/lib/api";
import { GlowCard } from "@/components/ui/GlowCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatTimeAgo } from "@/lib/utils";
import { ChevronLeft, ChevronRight, Filter } from "lucide-react";
import type { Threat } from "@/types/threats";

const SEVERITY_FILTERS = ["all", "critical", "high", "medium", "low"];
const TYPE_FILTERS = ["all", "phishing", "malware", "credential_leak", "data_breach", "scam"];

export default function ThreatsPage() {
  const [threats, setThreats] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [severity, setSeverity] = useState("all");
  const [type, setType] = useState("all");

  useEffect(() => {
    (async () => {
      setLoading(true);
      try {
        const params: any = { page, limit: 20 };
        if (severity !== "all") params.severity = severity;
        if (type !== "all") params.type = type;
        const res = await getThreats(params);
        setThreats(res.data ?? []);
        setTotalPages(res.pages ?? 1);
      } catch {
        setThreats(MOCK_THREATS);
        setTotalPages(1);
      } finally {
        setLoading(false);
      }
    })();
  }, [page, severity, type]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-primary font-mono">
          Threat <span className="text-neon-blue">History</span>
        </h2>
        <p className="text-sm text-slate-secondary mt-1">All detected threats with full details</p>
      </div>

      {/* Filters */}
      <GlowCard className="p-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-secondary" />
            <span className="text-xs font-mono text-slate-secondary">SEVERITY:</span>
            {SEVERITY_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setSeverity(f); setPage(1); }}
                className={`text-xs font-mono px-2 py-1 rounded transition-all ${severity === f
                    ? "bg-neon-blue/20 border border-neon-blue/40 text-neon-blue"
                    : "text-slate-muted hover:text-slate-secondary"
                  }`}
              >
                {f.toUpperCase()}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-secondary">TYPE:</span>
            {TYPE_FILTERS.map((f) => (
              <button
                key={f}
                onClick={() => { setType(f); setPage(1); }}
                className={`text-xs font-mono px-2 py-1 rounded transition-all ${type === f
                    ? "bg-neon-purple/20 border border-neon-purple/40 text-neon-purple"
                    : "text-slate-muted hover:text-slate-secondary"
                  }`}
              >
                {f.replace("_", " ").toUpperCase()}
              </button>
            ))}
          </div>
        </div>
      </GlowCard>

      {/* Threat list */}
      {loading ? (
        <div className="text-center text-neon-blue font-mono py-12 animate-pulse">
          LOADING THREAT DATABASE...
        </div>
      ) : (
        <div className="space-y-3">
          {threats.map((threat, i) => (
            <ThreatRow key={threat.threat_id ?? i} threat={threat} />
          ))}
          {threats.length === 0 && (
            <GlowCard>
              <p className="text-center text-slate-secondary text-sm py-8">
                No threats match the selected filters.
              </p>
            </GlowCard>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="flex items-center gap-1 text-xs font-mono text-neon-blue disabled:opacity-40"
          >
            <ChevronLeft className="w-4 h-4" /> PREV
          </button>
          <span className="text-xs font-mono text-slate-secondary">
            {page} / {totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="flex items-center gap-1 text-xs font-mono text-neon-blue disabled:opacity-40"
          >
            NEXT <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function ThreatRow({ threat }: { threat: Threat }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div onClick={() => setExpanded((e) => !e)}>
      <GlowCard className="p-4 cursor-pointer">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <SeverityBadge severity={threat.severity} pulse={threat.severity === "critical"} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-slate-primary truncate">{threat.title}</p>
              <p className="text-xs text-slate-secondary mt-1 line-clamp-1">{threat.summary}</p>
            </div>
          </div>
          <div className="text-right shrink-0">
            <div className="text-xs font-mono text-slate-muted">{formatTimeAgo(threat.detected_at)}</div>
            <div className="text-xs font-mono text-neon-blue mt-1">
              {threat.risk_score}/100
            </div>
          </div>
        </div>

        {expanded && (
          <div className="mt-4 pt-4 border-t border-neon-blue/10 space-y-3 animate-slide-in">
            <div className="grid grid-cols-2 gap-4 text-xs font-mono">
              <div>
                <span className="text-slate-muted">TYPE: </span>
                <span className="text-neon-blue">{threat.type?.replace("_", " ").toUpperCase()}</span>
              </div>
              <div>
                <span className="text-slate-muted">STATUS: </span>
                <span className="text-neon-green">{(threat.status ?? "active").toUpperCase()}</span>
              </div>
            </div>
            {threat.indicators && (
              <div>
                <p className="text-xs font-mono text-slate-muted mb-1">INDICATORS:</p>
                <div className="flex flex-wrap gap-2">
                  {[...(threat.indicators.domains ?? []), ...(threat.indicators.ips ?? [])].map(
                    (ind) => (
                      <span
                        key={ind}
                        className="text-xs font-mono bg-elevated border border-neon-blue/20 text-neon-blue px-2 py-0.5 rounded"
                      >
                        {ind}
                      </span>
                    )
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </GlowCard>
    </div>
  );
}

const MOCK_THREATS: Threat[] = [
  {
    threat_id: "t1",
    type: "phishing",
    severity: "critical",
    risk_score: 91,
    title: "Fake PayPal login page — paypa1-secure.xyz",
    summary: "Typosquatted domain with credential harvesting form impersonating PayPal.",
    detected_at: new Date(Date.now() - 3600000).toISOString(),
    status: "active",
    indicators: { domains: ["paypa1-secure.xyz"], ips: ["185.234.21.44"] },
  },
  {
    threat_id: "t2",
    type: "data_breach",
    severity: "high",
    risk_score: 78,
    title: "MegaCorp customer credential dump on Pastebin",
    summary: "450K email/password pairs found in public paste. Verified breach.",
    detected_at: new Date(Date.now() - 7200000).toISOString(),
    status: "investigating",
  },
  {
    threat_id: "t3",
    type: "malware",
    severity: "high",
    risk_score: 73,
    title: "New ransomware campaign targeting healthcare",
    summary: "RansomX distributed via phishing emails with malicious Word attachments.",
    detected_at: new Date(Date.now() - 14400000).toISOString(),
    status: "active",
  },
  {
    threat_id: "t4",
    type: "phishing",
    severity: "medium",
    risk_score: 54,
    title: "Amazon order confirmation phishing campaign",
    summary: "Fake Amazon emails redirect to credential-harvesting forms.",
    detected_at: new Date(Date.now() - 86400000).toISOString(),
    status: "resolved",
  },
];
