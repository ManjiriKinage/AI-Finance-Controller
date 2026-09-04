import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "AI Finance Controller | Automated Multi-Source Reconciliation & Cash Intelligence",
  description: "Senior Fintech Operations Engine: Deterministic 3-Way Reconciliation, Evidence-Backed AI Exception Reasoning, and Cash Intelligence Forecasting."
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className="bg-slate-950 text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
