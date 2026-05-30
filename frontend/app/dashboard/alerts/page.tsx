"use client";
import { useState, useEffect } from "react";
import { saveAlertConfig, getAlertHistory, sendTestAlert } from "@/lib/api";
import { GlowCard } from "@/components/ui/GlowCard";
import { SeverityBadge } from "@/components/ui/SeverityBadge";
import { formatTimeAgo } from "@/lib/utils";
import { Bell, Send, CheckCircle, Loader2 } from "lucide-react";

export default function AlertsPage() {
  const [config, setConfig] = useState({
    email: "",
    telegram_chat_id: "",
    min_severity: "high",
    min_risk_score: 70,
  });
  const [history, setHistory] = useState<any[]>([]);
  const [saving, setSaving]   = useState(false);
  const [testing, setTesting] = useState(false);
  const [saved, setSaved]     = useState(false);

  useEffect(() => {
    (async () => {
      try {
        const h = await getAlertHistory();
        setHistory(h ?? []);
      } catch {
        setHistory(MOCK_HISTORY);
      }
    })();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      await saveAlertConfig(config);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch {}
    finally { setSaving(false); }
  };

  const handleTest = async () => {
    setTesting(true);
    try {
      await sendTestAlert();
    } catch {}
    finally { setTesting(false); }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-primary font-mono">
          Alert <span className="text-neon-purple">Configuration</span>
        </h2>
        <p className="text-sm text-slate-secondary mt-1">
          Configure email and Telegram notifications for detected threats
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Config form */}
        <GlowCard glowColor="purple">
          <h3 className="font-mono font-bold text-slate-primary text-sm mb-4 flex items-center gap-2">
            <Bell className="w-4 h-4 text-neon-purple" /> NOTIFICATION CHANNELS
          </h3>
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono text-slate-muted mb-1">
                EMAIL ADDRESS
              </label>
              <input
                type="email"
                value={config.email}
                onChange={(e) => setConfig({ ...config, email: e.target.value })}
                placeholder="security@company.com"
                className="w-full bg-elevated border border-neon-blue/20 rounded-lg px-3 py-2.5 text-slate-primary font-mono text-sm placeholder:text-slate-muted focus:outline-none focus:border-neon-blue/60"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-muted mb-1">
                TELEGRAM CHAT ID
              </label>
              <input
                type="text"
                value={config.telegram_chat_id}
                onChange={(e) => setConfig({ ...config, telegram_chat_id: e.target.value })}
                placeholder="-1001234567890"
                className="w-full bg-elevated border border-neon-blue/20 rounded-lg px-3 py-2.5 text-slate-primary font-mono text-sm placeholder:text-slate-muted focus:outline-none focus:border-neon-blue/60"
              />
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-muted mb-1">
                MINIMUM SEVERITY
              </label>
              <select
                value={config.min_severity}
                onChange={(e) => setConfig({ ...config, min_severity: e.target.value })}
                className="w-full bg-elevated border border-neon-blue/20 rounded-lg px-3 py-2.5 text-slate-primary font-mono text-sm focus:outline-none focus:border-neon-blue/60"
              >
                <option value="critical">Critical only</option>
                <option value="high">High and above</option>
                <option value="medium">Medium and above</option>
                <option value="low">All threats</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-mono text-slate-muted mb-1">
                MINIMUM RISK SCORE: {config.min_risk_score}/100
              </label>
              <input
                type="range"
                min={0}
                max={100}
                value={config.min_risk_score}
                onChange={(e) => setConfig({ ...config, min_risk_score: Number(e.target.value) })}
                className="w-full accent-neon-blue"
              />
              <div className="flex justify-between text-xs font-mono text-slate-muted mt-1">
                <span>0</span>
                <span>50</span>
                <span>100</span>
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-neon-purple/20 hover:bg-neon-purple/30 border border-neon-purple/40 text-neon-purple rounded-lg font-mono text-sm font-bold transition-all disabled:opacity-50"
              >
                {saving ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : saved ? (
                  <CheckCircle className="w-4 h-4" />
                ) : null}
                {saved ? "SAVED!" : "SAVE CONFIG"}
              </button>
              <button
                onClick={handleTest}
                disabled={testing}
                className="flex items-center gap-2 px-4 py-2.5 bg-elevated border border-neon-blue/30 text-slate-secondary hover:text-neon-blue rounded-lg font-mono text-sm transition-all"
              >
                {testing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                TEST
              </button>
            </div>
          </div>
        </GlowCard>

        {/* Alert threshold preview */}
        <div className="space-y-4">
          <GlowCard>
            <h3 className="font-mono font-bold text-slate-primary text-sm mb-3">CURRENT SETTINGS</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="flex justify-between">
                <span className="text-slate-muted">Email alerts</span>
                <span className={config.email ? "text-neon-green" : "text-slate-muted"}>
                  {config.email || "Not configured"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-muted">Telegram alerts</span>
                <span className={config.telegram_chat_id ? "text-neon-green" : "text-slate-muted"}>
                  {config.telegram_chat_id ? "Configured" : "Not configured"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-muted">Min severity</span>
                <span className="text-neon-blue uppercase">{config.min_severity}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-muted">Min risk score</span>
                <span className="text-neon-orange">{config.min_risk_score}/100</span>
              </div>
            </div>
          </GlowCard>

          <GlowCard>
            <h3 className="font-mono font-bold text-slate-primary text-sm mb-3">BRIGHT DATA SOURCES</h3>
            <div className="space-y-2">
              {[
                { name: "SERP API",       status: "active",  detail: "Google threat search" },
                { name: "Web Unlocker",   status: "active",  detail: "Bypass bot detection" },
                { name: "Scraping Browser", status: "active", detail: "JS execution + screenshots" },
                { name: "Web Scraper API", status: "active", detail: "Security blog monitoring" },
              ].map(({ name, status, detail }) => (
                <div key={name} className="flex items-center justify-between text-xs">
                  <div>
                    <span className="font-mono text-slate-primary">{name}</span>
                    <span className="text-slate-muted ml-2">{detail}</span>
                  </div>
                  <span className="text-neon-green font-mono">● {status}</span>
                </div>
              ))}
            </div>
          </GlowCard>
        </div>
      </div>

      {/* Alert history */}
      <div>
        <h3 className="font-mono font-bold text-slate-primary text-sm mb-3">ALERT HISTORY</h3>
        {history.length === 0 ? (
          <GlowCard>
            <p className="text-center text-slate-secondary text-sm py-4">No alerts sent yet.</p>
          </GlowCard>
        ) : (
          <div className="space-y-2">
            {history.map((alert, i) => (
              <GlowCard key={alert.alert_id ?? i} className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <SeverityBadge severity={alert.severity} />
                    <p className="text-sm text-slate-primary">{alert.message}</p>
                  </div>
                  <div className="text-right text-xs font-mono">
                    <div className="text-slate-muted">{formatTimeAgo(alert.sent_at)}</div>
                    <div className={`mt-1 ${alert.status === "sent" ? "text-neon-green" : "text-neon-red"}`}>
                      {alert.status.toUpperCase()}
                    </div>
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

const MOCK_HISTORY = [
  {
    alert_id: "a1",
    severity: "critical",
    message: "Critical phishing site detected targeting PayPal users",
    channels: ["email", "telegram"],
    status: "sent",
    sent_at: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    alert_id: "a2",
    severity: "high",
    message: "Credential leak detected — MegaCorp data breach",
    channels: ["email"],
    status: "sent",
    sent_at: new Date(Date.now() - 86400000).toISOString(),
  },
];
