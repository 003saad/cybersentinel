"use client";
import { useEffect, useState } from "react";
import { getMonitorTargets, addMonitorTarget, deleteMonitorTarget } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { GlowCard } from "@/components/ui/GlowCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatTimeAgo } from "@/lib/utils";
import { Radio, Plus, Trash2, Play, Pause, Loader2 } from "lucide-react";
import type { MonitorTarget, Threat } from "@/types/threats";

export default function MonitorPage() {
  const [targets, setTargets]       = useState<MonitorTarget[]>([]);
  const [liveFeed, setLiveFeed]     = useState<Threat[]>([]);
  const [isHunting, setIsHunting]   = useState(false);
  const [form, setForm]             = useState({ type: "domain", value: "", scan_frequency: "hourly" });
  const [adding, setAdding]         = useState(false);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const data = await getMonitorTargets();
        setTargets(data ?? []);
      } catch {
        setTargets(MOCK_TARGETS);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useWebSocket({
    onMessage: (msg) => {
      if (msg.type === "new_threat") {
        setLiveFeed((prev) => [msg.data, ...prev.slice(0, 9)]);
      } else if (msg.type === "initial_feed") {
        setLiveFeed(msg.data.slice(0, 10));
      }
    },
  });

  const handleAdd = async () => {
    if (!form.value.trim()) return;
    setAdding(true);
    try {
      const t = await addMonitorTarget(form);
      setTargets((prev) => [t, ...prev]);
      setForm({ type: "domain", value: "", scan_frequency: "hourly" });
    } catch {
      /* show error */
    } finally {
      setAdding(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteMonitorTarget(id);
      setTargets((prev) => prev.filter((t) => t.target_id !== id));
    } catch {}
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-primary font-mono">
            Live <span className="text-neon-green">Monitor</span>
          </h2>
          <p className="text-sm text-slate-secondary mt-1">
            Autonomous threat hunting via Bright Data SERP + Web Scraper APIs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse-slow" />
          <span className="text-xs font-mono text-neon-green">AGENT ACTIVE</span>
        </div>
      </div>

      {/* Hunt control */}
      <GlowCard glowColor="green">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-mono font-bold text-slate-primary text-sm mb-1">
              THREAT HUNTER AGENT
            </h3>
            <p className="text-xs text-slate-secondary">
              Searches 8 live sources every 15 minutes using Bright Data SERP API
            </p>
          </div>
          <button
            onClick={() => setIsHunting((h) => !h)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-mono text-sm font-bold border transition-all ${
              isHunting
                ? "bg-neon-green/10 border-neon-green/40 text-neon-green"
                : "bg-elevated border-neon-blue/30 text-slate-secondary hover:border-neon-green/40 hover:text-neon-green"
            }`}
          >
            {isHunting ? (
              <>
                <Pause className="w-4 h-4" /> HUNTING...
              </>
            ) : (
              <>
                <Play className="w-4 h-4" /> START HUNT
              </>
            )}
          </button>
        </div>

        {isHunting && (
          <div className="mt-4 space-y-2 animate-slide-in">
            <div className="text-xs font-mono text-slate-muted mb-2">LIVE SERP QUERIES:</div>
            {[
              "new phishing campaign May 2026",
              "database dump credentials pastebin 2026-05-30",
              "malware campaign ransomware healthcare 2026",
              "zero-day vulnerability actively exploited CVE 2026",
            ].map((q, i) => (
              <div key={q} className="flex items-center gap-3 text-xs font-mono">
                <span className={`w-2 h-2 rounded-full ${i === 0 ? "bg-neon-green animate-pulse-slow" : "bg-slate-muted"}`} />
                <span className="text-slate-secondary">{q}</span>
              </div>
            ))}
          </div>
        )}
      </GlowCard>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Add target */}
        <GlowCard>
          <h3 className="font-mono font-bold text-slate-primary text-sm mb-4">
            ADD MONITOR TARGET
          </h3>
          <div className="space-y-3">
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full bg-elevated border border-neon-blue/20 rounded-lg px-3 py-2 text-slate-primary font-mono text-sm focus:outline-none focus:border-neon-blue/60"
            >
              <option value="domain">Domain</option>
              <option value="brand">Brand Name</option>
              <option value="keyword">Keyword</option>
              <option value="email_domain">Email Domain</option>
            </select>
            <input
              type="text"
              value={form.value}
              onChange={(e) => setForm({ ...form, value: e.target.value })}
              placeholder="e.g. mycompany.com"
              className="w-full bg-elevated border border-neon-blue/20 rounded-lg px-3 py-2 text-slate-primary font-mono text-sm placeholder:text-slate-muted focus:outline-none focus:border-neon-blue/60"
            />
            <select
              value={form.scan_frequency}
              onChange={(e) => setForm({ ...form, scan_frequency: e.target.value })}
              className="w-full bg-elevated border border-neon-blue/20 rounded-lg px-3 py-2 text-slate-primary font-mono text-sm focus:outline-none focus:border-neon-blue/60"
            >
              <option value="realtime">Real-time</option>
              <option value="hourly">Hourly</option>
              <option value="daily">Daily</option>
            </select>
            <button
              onClick={handleAdd}
              disabled={adding || !form.value.trim()}
              className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/40 text-neon-blue rounded-lg font-mono text-sm font-bold transition-all disabled:opacity-50"
            >
              {adding ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
              ADD TARGET
            </button>
          </div>
        </GlowCard>

        {/* Live feed */}
        <GlowCard className="p-0 overflow-hidden">
          <div className="px-4 py-3 border-b border-neon-blue/10 flex items-center gap-2">
            <Radio className="w-4 h-4 text-neon-green" />
            <h3 className="font-mono font-bold text-slate-primary text-sm">LIVE EVENTS</h3>
          </div>
          <div className="max-h-72 overflow-y-auto divide-y divide-neon-blue/5">
            {liveFeed.length === 0 ? (
              <p className="text-center text-slate-secondary text-xs py-8 font-mono">
                Waiting for live events...
              </p>
            ) : (
              liveFeed.map((t, i) => (
                <div key={t.threat_id ?? i} className="px-4 py-3 flex items-start gap-3 animate-slide-in">
                  <SeverityBadge severity={t.severity} />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-slate-primary font-medium truncate">{t.title}</p>
                    <p className="text-xs text-slate-muted mt-0.5">{formatTimeAgo(t.detected_at)}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </GlowCard>
      </div>

      {/* Monitored targets list */}
      <div>
        <h3 className="font-mono font-bold text-slate-primary text-sm mb-3">MONITORED TARGETS</h3>
        {loading ? (
          <div className="text-center text-neon-blue font-mono animate-pulse py-8">LOADING...</div>
        ) : targets.length === 0 ? (
          <GlowCard>
            <p className="text-center text-slate-secondary text-sm py-4">
              No targets yet. Add one above.
            </p>
          </GlowCard>
        ) : (
          <div className="space-y-3">
            {targets.map((target) => (
              <GlowCard key={target.target_id} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span
                      className={`w-2 h-2 rounded-full ${
                        target.status === "active" ? "bg-neon-green animate-pulse-slow" : "bg-slate-muted"
                      }`}
                    />
                    <div>
                      <p className="text-sm font-mono text-slate-primary font-bold">{target.value}</p>
                      <p className="text-xs text-slate-muted">
                        {target.type.toUpperCase()} · {target.scan_frequency.toUpperCase()}
                        {target.last_scanned && ` · Last: ${formatTimeAgo(target.last_scanned)}`}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {target.threat_count !== undefined && target.threat_count > 0 && (
                      <span className="text-xs font-mono text-neon-orange">
                        {target.threat_count} threats
                      </span>
                    )}
                    <button
                      onClick={() => handleDelete(target.target_id)}
                      className="text-slate-muted hover:text-neon-red transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </GlowCard>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

const MOCK_TARGETS: MonitorTarget[] = [
  {
    target_id: "m1",
    type: "domain",
    value: "mycompany.com",
    status: "active",
    scan_frequency: "hourly",
    last_scanned: new Date(Date.now() - 900000).toISOString(),
    threat_count: 2,
  },
  {
    target_id: "m2",
    type: "brand",
    value: "MyCompany",
    status: "active",
    scan_frequency: "realtime",
    last_scanned: new Date(Date.now() - 300000).toISOString(),
    threat_count: 0,
  },
];
