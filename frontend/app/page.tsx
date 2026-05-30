import Link from "next/link";
import { Shield, Radio, Key, Zap, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-void grid-bg flex flex-col">
      {/* Nav */}
      <nav className="border-b border-neon-blue/10 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center glow-blue">
            <Shield className="w-4 h-4 text-neon-blue" />
          </div>
          <span className="font-bold text-slate-primary font-mono tracking-widest text-sm">
            CYBER<span className="text-neon-blue">SENTINEL</span>
          </span>
        </div>
        <Link
          href="/dashboard"
          className="flex items-center gap-2 px-4 py-2 bg-neon-blue/10 hover:bg-neon-blue/20 border border-neon-blue/30 text-neon-blue rounded-lg font-mono text-sm font-bold transition-all"
        >
          Launch Dashboard <ChevronRight className="w-4 h-4" />
        </Link>
      </nav>

      {/* Hero */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-6 py-24">
        {/* Status pill */}
        <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neon-green/10 border border-neon-green/30 mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-neon-green animate-pulse-slow" />
          <span className="text-xs font-mono text-neon-green">LIVE MONITORING ACTIVE</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold font-mono text-slate-primary leading-tight mb-6">
          AI-Powered<br />
          <span className="text-neon-blue text-glow-blue">Cyber Threat</span><br />
          Intelligence
        </h1>

        <p className="max-w-xl text-slate-secondary text-lg mb-10 leading-relaxed">
          CyberSentinel scans the live web for threats before they reach you — powered by Bright Data web intelligence and GPT-4o analysis.
        </p>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 px-8 py-4 bg-neon-blue/20 hover:bg-neon-blue/30 border border-neon-blue/50 text-neon-blue rounded-xl font-mono font-bold text-sm transition-all glow-blue hover:scale-[1.02]"
          >
            <Shield className="w-4 h-4" /> Launch Dashboard
          </Link>
          <Link
            href="/dashboard/analyze"
            className="flex items-center gap-2 px-8 py-4 bg-elevated border border-neon-blue/20 text-slate-primary rounded-xl font-mono text-sm transition-all hover:border-neon-blue/40"
          >
            <Zap className="w-4 h-4 text-neon-orange" /> Analyze a URL
          </Link>
        </div>

        {/* Feature badges */}
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4 max-w-3xl w-full">
          {[
            { icon: Shield, label: "Phishing Detection",   desc: "Real-time URL analysis", color: "neon-blue"   },
            { icon: Radio,  label: "Live Monitoring",      desc: "Autonomous threat hunting", color: "neon-green"  },
            { icon: Key,    label: "Credential Leaks",     desc: "Dark web monitoring",   color: "neon-orange" },
            { icon: Zap,    label: "AI Analysis",          desc: "GPT-4o powered reports", color: "neon-purple" },
          ].map(({ icon: Icon, label, desc, color }) => (
            <div key={label} className="bg-card border border-neon-blue/10 rounded-xl p-4 text-left hover:border-neon-blue/30 transition-all">
              <Icon className={`w-5 h-5 text-${color} mb-2`} />
              <p className="text-xs font-mono font-bold text-slate-primary">{label}</p>
              <p className="text-xs text-slate-muted mt-1">{desc}</p>
            </div>
          ))}
        </div>
      </section>
    </main>
  );
}
