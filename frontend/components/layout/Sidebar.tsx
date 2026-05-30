"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Shield, Search, Radio, Key, List, Bell, Activity } from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/dashboard",             icon: Activity, label: "Dashboard",          badge: null      },
  { href: "/dashboard/analyze",     icon: Search,   label: "Analyze URL",        badge: null      },
  { href: "/dashboard/threats",     icon: List,     label: "Threat History",     badge: null      },
  { href: "/dashboard/monitor",     icon: Radio,    label: "Live Monitor",       badge: "LIVE"    },
  { href: "/dashboard/credentials", icon: Key,      label: "Credential Scanner", badge: null      },
  { href: "/dashboard/alerts",      icon: Bell,     label: "Alert Config",       badge: null      },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 min-h-screen bg-void border-r border-neon-blue/10 flex flex-col shrink-0">
      {/* Logo */}
      <div className="p-6 border-b border-neon-blue/10">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-neon-blue/20 border border-neon-blue/40 flex items-center justify-center glow-blue">
            <Shield className="w-4 h-4 text-neon-blue" />
          </div>
          <div>
            <h1 className="font-bold text-slate-primary font-mono text-sm tracking-wider">
              CYBER<span className="text-neon-blue">SENTINEL</span>
            </h1>
            <p className="text-xs text-slate-muted">Threat Intelligence</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ href, icon: Icon, label, badge }) => {
          const isActive = pathname === href;
          return (
            <Link key={href} href={href}>
              <div
                className={cn(
                  "flex items-center justify-between px-3 py-2.5 rounded-lg transition-all duration-200",
                  isActive
                    ? "bg-neon-blue/10 border border-neon-blue/30 text-neon-blue"
                    : "text-slate-secondary hover:text-slate-primary hover:bg-elevated border border-transparent"
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{label}</span>
                </div>
                {badge && (
                  <span
                    className={cn(
                      "text-xs px-1.5 py-0.5 rounded font-mono",
                      badge === "LIVE"
                        ? "bg-neon-green/20 text-neon-green animate-pulse-slow"
                        : "bg-neon-blue/20 text-neon-blue"
                    )}
                  >
                    {badge}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </nav>

      {/* Status footer */}
      <div className="p-4 border-t border-neon-blue/10 space-y-2">
        <div className="flex items-center gap-2 text-xs text-slate-secondary">
          <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse-slow" />
          <span>All systems operational</span>
        </div>
        <div className="text-xs font-mono text-slate-muted">
          v1.0 · Security Track
        </div>
      </div>
    </aside>
  );
}
