"use client";
import { useEffect, useState } from "react";
import { getDashboardStats, getLiveFeed } from "@/lib/api";
import { useWebSocket } from "@/hooks/useWebSocket";
import { GlowCard } from "@/components/ui/GlowCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatTimeAgo, getRiskColor } from "@/lib/utils";
import { Shield, AlertTriangle, Zap, Activity, TrendingUp } from "lucide-react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import type { DashboardStats, Threat } from "@/types/threats";

/* ── Stat Card ─────────────────────────────────────────── */
function StatCard({ label, value, delta, color, icon: Icon, pulse = false }: any) {
  const colorMap: Record<string, string> = {
    blue: "text-neon-blue   border-neon-blue/20",
    red: "text-neon-red    border-neon-red/20",
    orange: "text-neon-orange border-neon-orange/20",
    green: "text-neon-green  border-neon-green/20",
  };
  const [textColor, borderColor] = (colorMap[color] ?? "text-neon-blue border-neon-blue/20").split(" ");
  return (
    <GlowCard>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-mono text-slate-secondary uppercase tracking-wider">{label}</p>
          <p className={`text-3xl font-bold mt-1 font-mono ${textColor}`}>
            {value}
            {pulse && (
              <span className="ml-2 inline-block w-2 h-2 rounded-full bg-neon-red animate-pulse-slow" />
            )}
          </p>
          {delta && <p className="text-xs text-slate-secondary mt-1">{delta} from yesterday</p>}
        </div>
        <div className={`p-2 rounded-lg border ${borderColor}`}>
          <Icon className={`w-5 h-5 ${textColor}`} />
        </div>
      </div>
    </GlowCard>
  );
}

/* ── Threat Feed Item ──────────────────────────────────── */
function ThreatFeedItem({ threat }: { threat: Threat }) {
  const sev = threat.severity ?? "low";
  const leftBorder: Record<string, string> = {
    critical: "border-l-neon-red",
    high: "border-l-neon-orange",
    medium: "border-l-yellow-500",
    low: "border-l-neon-blue",
  };
  return (
    <div
      className={`border-l-2 ${leftBorder[sev] ?? leftBorder.low} pl-4 py-3 border-b border-neon-blue/5 animate-slide-in`}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <SeverityBadge severity={sev} pulse={sev === "critical"} />
            <span className="text-xs text-slate-muted font-mono">
              {threat.type?.replace("_", " ").toUpperCase()}
            </span>
          </div>
          <p className="text-sm text-slate-primary font-medium truncate">{threat.title}</p>
          <p className="text-xs text-slate-secondary mt-0.5 line-clamp-1">{threat.summary}</p>
        </div>
        <span className="text-xs text-slate-muted font-mono whitespace-nowrap">
          {formatTimeAgo(threat.detected_at)}
        </span>
      </div>
    </div>
  );
}

/* ── Main Dashboard ────────────────────────────────────── */
export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    threats_today: 0,
    critical_count: 0,
    high_count: 0,
    scans_performed: 0,
    detection_rate: 98.3,
  });
  const [feed, setFeed] = useState<Threat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [statsData, feedData] = await Promise.all([getDashboardStats(), getLiveFeed()]);
        if (statsData) setStats(statsData);
        if (feedData) setFeed(feedData);
      } catch {
        /* API not reachable — use mock data */
        setStats({ threats_today: 47, critical_count: 3, high_count: 12, scans_performed: 156, detection_rate: 98.3 });
        setFeed(MOCK_FEED);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  useWebSocket({
    onMessage: (msg) => {
      if (msg.type === "initial_feed") {
        setFeed(msg.data);
      } else if (msg.type === "new_threat") {
        setFeed((prev) => [msg.data, ...prev.slice(0, 19)]);
        setStats((prev) => ({ ...prev, threats_today: (prev.threats_today ?? 0) + 1 }));
      }
    },
    onError: () => {/* silent — WS reconnects automatically */ },
  });

  const chartData = [
    { time: "00:00", threats: 2 },
    { time: "04:00", threats: 5 },
    { time: "08:00", threats: 12 },
    { time: "12:00", threats: 8 },
    { time: "16:00", threats: 15 },
    { time: "20:00", threats: 7 },
    { time: "Now", threats: stats.threats_today ?? 4 },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-neon-blue font-mono animate-pulse">INITIALIZING SENSORS...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-slate-primary font-mono">
          Security <span className="text-neon-blue">Operations</span> Center
        </h2>
        <p className="text-sm text-slate-secondary mt-1">
          Real-time threat intelligence powered by Bright Data live web intelligence
        </p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Threats Today" value={stats.threats_today} delta="+12" color="blue" icon={Shield} />
        <StatCard label="Critical" value={stats.critical_count} delta="NEW" color="red" icon={AlertTriangle} pulse={stats.critical_count > 0} />
        <StatCard label="High Severity" value={stats.high_count} delta="+3" color="orange" icon={Zap} />
        <StatCard label="Scans Performed" value={stats.scans_performed} delta="+5" color="green" icon={Activity} />
      </div>

      {/* Feed + Risk meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live feed */}
        <GlowCard className="lg:col-span-2 p-0 overflow-hidden">
          <div className="px-6 py-4 border-b border-neon-blue/10 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse-slow" />
              <h3 className="font-mono font-bold text-slate-primary text-sm">LIVE THREAT FEED</h3>
            </div>
            <span className="text-xs font-mono text-slate-muted">{feed.length} active</span>
          </div>
          <div className="max-h-96 overflow-y-auto divide-y divide-neon-blue/5">
            {feed.length === 0 ? (
              <div className="p-8 text-center text-slate-secondary text-sm">
                No threats detected yet. The agent is monitoring...
              </div>
            ) : (
              feed.map((threat, i) => (
                <ThreatFeedItem key={threat.threat_id ?? i} threat={threat} />
              ))
            )}
          </div>
        </GlowCard>

        {/* Threat level */}
        <GlowCard>
          <h3 className="font-mono font-bold text-slate-primary text-sm mb-4">THREAT LEVEL</h3>
          <div className="flex flex-col items-center justify-center h-40">
            <div className="text-6xl font-bold font-mono text-neon-orange">
              {Math.min(99, (stats.critical_count ?? 0) * 30 + (stats.high_count ?? 0) * 10 + 10)}
            </div>
            <div className="text-sm text-slate-secondary mt-2">/ 100 Risk Score</div>
            <div className="mt-4 text-neon-orange font-mono text-sm font-bold">
              {(stats.critical_count ?? 0) > 0
                ? "⚠ ELEVATED"
                : (stats.high_count ?? 0) > 0
                  ? "⚠ GUARDED"
                  : "✓ NORMAL"}
            </div>
          </div>
          <div className="mt-4 space-y-2">
            {[
              { label: "Phishing", value: Math.floor((stats.threats_today ?? 0) * 0.5), color: "neon-red" },
              { label: "Malware", value: Math.floor((stats.threats_today ?? 0) * 0.3), color: "neon-orange" },
              { label: "Leaks", value: Math.floor((stats.threats_today ?? 0) * 0.2), color: "neon-blue" },
            ].map(({ label, value, color }) => (
              <div key={label} className="flex items-center justify-between text-xs">
                <span className="text-slate-secondary font-mono">{label}</span>
                <span className={`font-mono font-bold text-${color}`}>{value}</span>
              </div>
            ))}
          </div>
        </GlowCard>
      </div>

      {/* Chart */}
      <GlowCard>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-mono font-bold text-slate-primary text-sm">THREAT ACTIVITY (24h)</h3>
          <TrendingUp className="w-4 h-4 text-neon-blue" />
        </div>
        <ResponsiveContainer width="100%" height={200}>
          <LineChart data={chartData}>
            <XAxis
              dataKey="time"
              tick={{ fill: "#6b8fa8", fontSize: 11, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fill: "#6b8fa8", fontSize: 11, fontFamily: "monospace" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "#0d1520",
                border: "1px solid rgba(0,212,255,0.2)",
                borderRadius: "8px",
                fontFamily: "monospace",
              }}
              labelStyle={{ color: "#6b8fa8" }}
              itemStyle={{ color: "#00d4ff" }}
            />
            <Line type="monotone" dataKey="threats" stroke="#00d4ff" strokeWidth={2} dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </GlowCard>
    </div>
  );
}

/* ── Mock data (shown when API is unreachable) ─────────── */
const MOCK_FEED: Threat[] = [
  {
    threat_id: "1",
    type: "phishing",
    severity: "critical",
    risk_score: 91,
    title: "Fake PayPal login page detected — paypa1-secure.xyz",
    summary: "Typosquatted domain impersonating PayPal, contains credential harvesting form.",
    detected_at: new Date(Date.now() - 2 * 60000).toISOString(),
  },
  {
    threat_id: "2",
    type: "data_breach",
    severity: "high",
    risk_score: 77,
    title: "Credential dump found on Pastebin — MegaCorp users",
    summary: "450,000 email/password pairs from MegaCorp found in public paste.",
    detected_at: new Date(Date.now() - 18 * 60000).toISOString(),
  },
  {
    threat_id: "3",
    type: "malware",
    severity: "high",
    risk_score: 72,
    title: "New ransomware campaign targeting healthcare sector",
    summary: "BleepingComputer reports active ransomware deployment via phishing emails.",
    detected_at: new Date(Date.now() - 45 * 60000).toISOString(),
  },
  {
    threat_id: "4",
    type: "phishing",
    severity: "medium",
    risk_score: 55,
    title: "Amazon impersonation campaign detected",
    summary: "Multiple fake Amazon order confirmation pages harvesting credentials.",
    detected_at: new Date(Date.now() - 90 * 60000).toISOString(),
  },
];