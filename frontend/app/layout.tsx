import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "CyberSentinel — AI Threat Intelligence",
  description: "Real-time cybersecurity threat detection powered by live web intelligence",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <body className="bg-dark min-h-screen">
        {children}
      </body>
    </html>
  );
}
