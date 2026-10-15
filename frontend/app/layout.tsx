import type { Metadata } from "next";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";

export const metadata: Metadata = {
  title: "RECONOPS | Institutional Financial Operations Control",
  description: "Institutional Bank Operations: Multi-Source 3-Way Settlement Reconciliation, Real-Time Exception Diagnostics, and Cash Intelligence."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;500;600;700;800&family=Hanken+Grotesk:ital,wght@0,400;0,500;0,600;0,700;1,400&family=JetBrains+Mono:wght@400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="bg-[#F5F6F3] text-slate-900 antialiased min-h-screen selection:bg-indigo-100 selection:text-indigo-900 flex flex-col font-sans">
        <div className="flex-1 flex flex-col">
          {children}
        </div>
        {/* Persistent Static Mobile Navigation for Phone (< 1024px) */}
        <BottomNav />
      </body>
    </html>
  );
}
