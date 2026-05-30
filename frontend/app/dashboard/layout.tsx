import { Sidebar } from "@/components/layout/Sidebar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen overflow-hidden bg-dark grid-bg">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        {/* Topbar */}
        <div className="sticky top-0 z-10 bg-dark/80 backdrop-blur border-b border-neon-blue/10 px-8 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-neon-green animate-pulse-slow" />
            <span className="text-xs font-mono text-neon-green">LIVE MONITORING</span>
          </div>
          <div className="text-xs font-mono text-slate-muted" suppressHydrationWarning>
            {new Date().toUTCString()}
          </div>
        </div>
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}
