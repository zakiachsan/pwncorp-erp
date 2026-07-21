"use client";

import { useEffect, useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Scale, ArrowUpRight, ArrowDownRight, BookOpen } from "lucide-react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function FinanceDashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    fetch("/api/finance/dashboard")
      .then((r) => r.ok ? r.json() : null)
      .then((j) => { setData(j); setLoading(false); })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading dashboard...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return null;

  const { neraca, labaRugi, arOutstanding, apOutstanding, recentJournals } = data;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <Wallet className="w-6 h-6 text-[--color-brand-secondary]" />
          Finance Dashboard
        </div>
      </div>

      {/* Row 1: Neraca Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Scale size={20} color="#0176d3" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Aset</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0176d3" }}>{fmt(neraca.totalAsset)}</div>
          </div>
        </div>
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#fce4ec", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingDown size={20} color="#ea001e" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Kewajiban</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#ea001e" }}>{fmt(neraca.totalLiability)}</div>
          </div>
        </div>
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#f3e8ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <BookOpen size={20} color="#7c3aed" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Ekuitas</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#7c3aed" }}>{fmt(neraca.totalEquity)}</div>
          </div>
        </div>
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: neraca.balance >= 0 ? "#ecfdf5" : "#fce4ec", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Scale size={20} color={neraca.balance >= 0 ? "#2e844a" : "#ea001e"} />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Balance (A-K-E)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: neraca.balance >= 0 ? "#2e844a" : "#ea001e" }}>{fmt(neraca.balance)}</div>
          </div>
        </div>
      </div>

      {/* Row 2: Laba Rugi + AR/AP */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ArrowUpRight size={20} color="#2e844a" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Pendapatan</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2e844a" }}>{fmt(labaRugi.revenue)}</div>
          </div>
        </div>
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <ArrowDownRight size={20} color="#f28500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Beban</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#f28500" }}>{fmt(labaRugi.expense)}</div>
          </div>
        </div>
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingUp size={20} color="#0176d3" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Piutang (AR)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0176d3" }}>{fmt(arOutstanding)}</div>
          </div>
        </div>
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#fce4ec", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingDown size={20} color="#ea001e" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Hutang (AP)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#ea001e" }}>{fmt(apOutstanding)}</div>
          </div>
        </div>
      </div>

      {/* Row 3: Laba Bersih highlight */}
      <div className="card-slds mb-4" style={{ padding: 20, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Laba / Rugi Bersih</div>
          <div style={{ fontSize: 24, fontWeight: 800, color: labaRugi.net >= 0 ? "#2e844a" : "#ea001e" }}>{fmt(labaRugi.net)}</div>
        </div>
        <div style={{ width: 56, height: 56, borderRadius: 12, background: labaRugi.net >= 0 ? "#ecfdf5" : "#fce4ec", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {labaRugi.net >= 0 ? <TrendingUp size={28} color="#2e844a" /> : <TrendingDown size={28} color="#ea001e" />}
        </div>
      </div>

      {/* Row 4: Recent Journals */}
      <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-2">Jurnal Terakhir (Posted)</div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Jurnal</th>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th>Tipe</th>
            </tr>
          </thead>
          <tbody>
            {(recentJournals || []).map((j: any) => (
              <tr key={j.id}>
                <td className="font-medium" style={{ color: "var(--color-brand)" }}>{j.jeNo}</td>
                <td>{j.date ? new Date(j.date).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-"}</td>
                <td>{j.description || "-"}</td>
                <td><span className="pill pill--draft">{j.refType || "manual"}</span></td>
              </tr>
            ))}
            {(!recentJournals || recentJournals.length === 0) && (
              <tr><td colSpan={4} className="text-center py-8 text-[--color-text-secondary]">Belum ada jurnal posted</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
