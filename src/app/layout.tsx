import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "pwncorp ERP — Sistem Manajemen Bengkel",
  description: "Sistem manajemen bengkel mobil — Estimasi, Work Order, Invoice, Inventory, Finance",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body className="antialiased">{children}</body>
    </html>
  );
}
