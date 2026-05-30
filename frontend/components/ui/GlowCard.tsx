import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "blue" | "red" | "green" | "orange" | "purple";
}

const glowMap = {
  blue:   "hover:border-neon-blue/40   hover:shadow-[0_0_30px_rgba(0,212,255,0.12)]",
  red:    "hover:border-neon-red/40    hover:shadow-[0_0_30px_rgba(255,32,82,0.12)]",
  green:  "hover:border-neon-green/40  hover:shadow-[0_0_30px_rgba(0,255,136,0.12)]",
  orange: "hover:border-neon-orange/40 hover:shadow-[0_0_30px_rgba(255,107,53,0.12)]",
  purple: "hover:border-neon-purple/40 hover:shadow-[0_0_30px_rgba(180,79,255,0.12)]",
};

export function GlowCard({ children, className, glowColor = "blue" }: GlowCardProps) {
  return (
    <div
      className={cn(
        "relative bg-card border border-neon-blue/10 rounded-xl p-6 transition-all duration-300",
        glowMap[glowColor],
        className
      )}
    >
      {/* Gradient overlay */}
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-neon-blue/[0.02] to-transparent pointer-events-none" />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
