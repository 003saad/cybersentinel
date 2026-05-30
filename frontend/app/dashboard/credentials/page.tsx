"use client";
import { useState, useEffect } from "react";
import { scanCredentials, getBreaches } from "@/lib/api";
import { GlowCard } from "@/components/ui/GlowCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatTimeAgo } from "@/lib/utils";
import { Key, Search, Loader2, AlertTriangle } from "lucide-react";
import type { CredentialLeak } from "@/types/threats";

export default function CredentialsPage() {
  const [query, setQuery]       = useState("");
  const [scanType, setScanType] = useState("email_domain");
  const [loading, setLoading]   = useState(false);
  const [result, setResult]     = useState<any>(null);
  const [breaches, setBreaches] = useState<CredentialLeak[]>([]);
  const [error, setError]       = useState("");

  useEffect(() => {
    (async () => {
      try {
        const data = await getBreaches();
        setBreaches(data ?? []);
      } catch {
        setBreaches(MOCK_BREACHES);
      }
    })();
  }, []);

  const handleScan = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setResult(null);
    setError("");
    try {
      const data = await scanCredentials({ query, type: scanType });
      setResult(data);
    } catch (err: any) {
      setError(err.response?.data?.detail ?? "Scan failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-primary font-mono">
          Credential <span className="text-neon-orange">Scanner</span>
        </h2>
        <p className="text-sm text-slate-secondary mt-1">
          Detect leaked credentials and data breaches via live web intelligence
        </p>
      </div>

      {/* Scanner input */}
      <GlowCard glowColor="orange">
        <div className="space-y-3">
          <div className="flex gap-3">
            <select
              value={scanType}
              onChange={(e) => setScanType(e.target.value)}
              className="bg-elevated border border-neon-blue/20 rounded-lg px-3 py-3 text-slate-primary font-mono text-sm focus:outline-none focus:border-neon-blue/60 shrink-0"
            >
              <option value="email_domain">Email Domain</option>
              <option value="company">Company Name</option>
              <option value="email">Specific Email</option>
            </select>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleScan()}
              placeholder={
                scanType === "email_domain"
                  ? "yourcompany.com"
                  : scanType === "company"
                  ? "Your Company Inc"
                  : "user@company.com"
              }
              className="flex-1 bg-elevated border border-neon-blue/20 rounded-lg px-4 py-3 text-slate-primary font-mono text-sm placeholder:text-slate-muted focus:outline-none focus:border-neon-blue/60 transition-colors"
            />
            <button
              onClick={handleScan}
              disabled={loading || !query.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-neon-orange/20 hover:bg-neon-orange/30 border border-neon-orange/40 text-neon-orange rounded-lg font-mono text-sm font-bold transition-all disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
              {loading ? "SCANNING" : "SCAN"}
            </button>
          </div>
          <p className="text-xs text-slate-muted font-mono">
            Uses Bright Data SERP API + Web Unlocker to search Pastebin, public breach databases, and security forums
          </p>
          {error && <p className="text-xs text-neon-red font-mono">⚠ {error}</p>}
        </div>
      </GlowCard>

      {/* Scan result */}
      {result && (
        <GlowCard
          glowColor={result.is_valid_leak ? "red" : "green"}
          className="animate-slide-in"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-mono font-bold text-slate-primary text-sm">SCAN RESULT</h3>
            <SeverityBadge severity={result.severity ?? "info"} />
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="text-xs text-slate-muted font-mono">LEAK FOUND</p>
              <p className={`font-mono font-bold mt-1 ${result.is_valid_leak ? "text-neon-red" : "text-neon-green"}`}>
                {result.is_valid_leak ? "YES — BREACH DETECTED" : "NO LEAK FOUND"}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-muted font-mono">CONFIDENCE</p>
              <p className="font-mono font-bold mt-1 text-neon-blue">
                {Math.round((result.confidence ?? 0) * 100)}%
              </p>
            </div>
            {result.organization && (
              <div>
                <p className="text-xs text-slate-muted font-mono">ORGANIZATION</p>
                <p className="font-mono text-slate-primary mt-1">{result.organization}</p>
              </div>
            )}
            {result.estimated_records && (
              <div>
                <p className="text-xs text-slate-muted font-mono">RECORDS EXPOSED</p>
                <p className="font-mono font-bold text-neon-red mt-1">
                  {result.estimated_records.toLocaleString()}
                </p>
              </div>
            )}
          </div>
          {result.summary && (
            <div className="mt-4 pt-4 border-t border-neon-blue/10">
              <p className="text-xs text-slate-secondary leading-relaxed">{result.summary}</p>
            </div>
          )}
          {result.immediate_actions?.length > 0 && (
            <div className="mt-4 space-y-1">
              <p className="text-xs font-mono text-slate-muted">IMMEDIATE ACTIONS:</p>
              {result.immediate_actions.map((action: string, i: number) => (
                <div key={i} className="flex items-start gap-2 text-xs">
                  <AlertTriangle className="w-3 h-3 text-neon-orange mt-0.5 shrink-0" />
                  <span className="text-slate-secondary">{action}</span>
                </div>
              ))}
            </div>
          )}
        </GlowCard>
      )}

      {/* Breach history */}
      <div>
        <h3 className="font-mono font-bold text-slate-primary text-sm mb-3">RECENT BREACHES DETECTED</h3>
        <div className="space-y-3">
          {breaches.map((breach) => (
            <GlowCard key={breach.leak_id} className="p-4" glowColor="red">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <SeverityBadge severity={breach.severity} />
                  <div>
                    <p className="text-sm text-slate-primary font-medium">{breach.breach_name}</p>
                    <p className="text-xs text-slate-muted mt-0.5">
                      {breach.affected_domain}
                      {breach.affected_count && ` · ${breach.affected_count.toLocaleString()} records`}
                    </p>
                  </div>
                </div>
                <div className="text-right text-xs font-mono">
                  <div className="text-slate-muted">{formatTimeAgo(breach.detected_at)}</div>
                  <div className="flex gap-1 mt-1 flex-wrap justify-end">
                    {breach.data_types.map((dt) => (
                      <span
                        key={dt}
                        className="bg-neon-red/10 border border-neon-red/20 text-neon-red px-1.5 py-0.5 rounded text-xs"
                      >
                        {dt}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </GlowCard>
          ))}
        </div>
      </div>
    </div>
  );
}

const MOCK_BREACHES: CredentialLeak[] = [
  {
    leak_id: "l1",
    breach_name: "MegaCorp Data Breach 2024",
    affected_domain: "megacorp.com",
    affected_count: 450000,
    severity: "critical",
    detected_at: new Date(Date.now() - 86400000).toISOString(),
    data_types: ["email", "password_hash", "phone"],
    verified: true,
  },
  {
    leak_id: "l2",
    breach_name: "RetailChain Credential Dump",
    affected_domain: "retailchain.com",
    affected_count: 120000,
    severity: "high",
    detected_at: new Date(Date.now() - 172800000).toISOString(),
    data_types: ["email", "password"],
    verified: false,
  },
];
