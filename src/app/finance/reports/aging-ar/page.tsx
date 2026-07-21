"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function AgingARPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [aging, setAging] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/finance?report=ar-aging")
      .then((r) => r.json())
      .then((j) => {
        setItems(j.data?.items || []);
        setAging(j.data?.aging || null);
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const now = new Date();
  const getAgingBucket = (dueDate: string) => {
    const days = Math.floor((now.getTime() - new Date(dueDate).getTime()) / (1000 * 60 * 60 * 24));
    if (days <= 0) return "current";
    if (days <= 30) return "1-30";
    if (days <= 60) return "31-60";
    if (days <= 90) return "61-90";
    return "90+";
  };

  // Group by customer
  const grouped: Record<string, any> = {};
  for (const ar of items) {
    const name = ar.customer?.name || "-";
    if (!grouped[name]) grouped[name] = { customer: name, total: 0, current: 0, "1-30": 0, "31-60": 0, "61-90": 0, "90+": 0 };
    const bucket = getAgingBucket(ar.dueDate);
    grouped[name][bucket] += ar.balance || 0;
    grouped[name].total += ar.balance || 0;
  }
  const rows = Object.values(grouped);

  const totals = rows.reduce((acc, r) => {
    acc.total += r.total; acc.current += r.current; acc["1-30"] += r["1-30"];
    acc["31-60"] += r["31-60"]; acc["61-90"] += r["61-90"]; acc["90+"] += r["90+"];
    return acc;
  }, { total: 0, current: 0, "1-30": 0, "31-60": 0, "61-90": 0, "90+": 0 } as Record<string, number>);

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ClockIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Aging Report - Accounts Receivable
        </div>
        <button className="btn btn--sm"><Download size={14} /> Export</button>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Periode</label>
            <input type="month" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm">Tampilkan</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th className="text-right">Total</th>
              <th className="text-right">Current</th>
              <th className="text-right">1-30 days</th>
              <th className="text-right">31-60 days</th>
              <th className="text-right">61-90 days</th>
              <th className="text-right">90+ days</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((a) => (
              <tr key={a.customer} className="hover:bg-[#f8f8f8] cursor-pointer">
                <td className="font-medium">{a.customer}</td>
                <td className="text-right font-medium">{fmt(a.total)}</td>
                <td className="text-right">{a.current ? fmt(a.current) : "-"}</td>
                <td className="text-right">{a["1-30"] ? fmt(a["1-30"]) : "-"}</td>
                <td className="text-right">{a["31-60"] ? fmt(a["31-60"]) : "-"}</td>
                <td className="text-right">{a["61-90"] ? fmt(a["61-90"]) : "-"}</td>
                <td className="text-right">{a["90+"] ? fmt(a["90+"]) : "-"}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-[--color-text-secondary]">Tidak ada data</td></tr>
            )}
          </tbody>
          {rows.length > 0 && (
            <tfoot>
              <tr className="font-bold border-t-2 border-[--color-text-primary]">
                <td>Total</td>
                <td className="text-right">{fmt(totals.total)}</td>
                <td className="text-right">{totals.current ? fmt(totals.current) : "-"}</td>
                <td className="text-right">{totals["1-30"] ? fmt(totals["1-30"]) : "-"}</td>
                <td className="text-right">{totals["31-60"] ? fmt(totals["31-60"]) : "-"}</td>
                <td className="text-right">{totals["61-90"] ? fmt(totals["61-90"]) : "-"}</td>
                <td className="text-right">{totals["90+"] ? fmt(totals["90+"]) : "-"}</td>
              </tr>
            </tfoot>
          )}
        </table>
      </div>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
