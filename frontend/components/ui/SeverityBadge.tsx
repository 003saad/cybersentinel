import { cn } from "@/lib/utils";

interface SeverityBadgeProps {
  severity: "critical" | "high" | "medium" | "low" | "info";
  pulse?: boolean;
}

const configs: Record<string, { color: string; label: string }> = {
  critical: { color: "bg-neon-red/20 text-neon-red border-neon-red/40",         label: "CRITICAL" },
  high:     { color: "bg-neon-orange/20 text-neon-orange border-neon-orange/40", label: "HIGH"     },
  medium:   { color: "bg-yellow-500/20 text-yellow-400 border-yellow-500/40",    label: "MEDIUM"   },
  low:      { color: "bg-neon-blue/20 text-neon-blue border-neon-blue/40",       label: "LOW"      },
  info:     { color: "bg-slate-700/50 text-slate-400 border-slate-600/40",       label: "INFO"     },
};

export function SeverityBadge({ severity, pulse = false }: SeverityBadgeProps) {
  const { color, label } = configs[severity] ?? configs.info;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-xs font-mono font-bold border",
        color
      )}
    >
      {pulse && severity === "critical" && (
        <span className="w-1.5 h-1.5 rounded-full bg-neon-red animate-pulse-slow" />
      )}
      {label}
    </span>
  );
}
