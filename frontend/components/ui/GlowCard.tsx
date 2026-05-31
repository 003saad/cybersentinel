import React from "react";
import { cn } from "@/lib/utils";

interface GlowCardProps {
  children: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
  glowColor?: "blue" | "red" | "green" | "orange" | "purple";
}

const glowMap = {
  blue: "hover:border-neon-blue/40 hover:shadow-[0_0_30px_rgba(0,212,255,0.12)]",
  red: "hover:border-neon-red/40 hover:shadow-[0_0_30px_rgba(255,32,82,0.12)]",
  green: "hover:border-neon-green/40 hover:shadow-[0_0_30px_rgba(0,255,136,0.12)]",
  orange: "hover:border-neon-orange/40 hover:shadow-[0_0_30px_rgba(255,107,53,0.12)]",
  purple: "hover:border-neon-purple/40 hover:shadow-[0_0_30px_rgba(180,79,255,0.12)]",
};

export function GlowCard({
  children,
  className,
  onClick,
  glowColor = "blue",
}: GlowCardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-xl border border-neon-blue/10 bg-elevated transition-all duration-300",
        glowMap[glowColor],
        className
      )}
    >
      {children}
    </div>
  );
}