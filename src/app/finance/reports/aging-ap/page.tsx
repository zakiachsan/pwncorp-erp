"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Download } from "lucide-react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

interface AgingRow {
  supplier: string;
  total: number;
  current: number;
  d30: number;
  d60: number;
  d90: number;
  d90plus: number;
}

export default function AgingAPPage() {
  const router = useRouter();
  const [rows, setRows] = useState<AgingRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/finance?report=ap-aging")
      .then((r) => r.json())
      .then((j) => {
        const items = j.data?.items || [];
        const now = new Date();
        const grouped: Record<string, AgingRow> = {};
        for (const ap of items) {
          const name = ap.purchaseInvoice?.supplier?.companyName || "-";
          if (!grouped[name]) grouped[name] = { supplier: name, total: 0, current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 };
          const days = Math.floor((now.getTime() - new Date(ap.dueDate).getTime()) / (1000 * 60 * 60 * 24));
          const bal = ap.balance || 0;
          grouped[name].total += bal;
          if (days <= 0) grouped[name].current += bal;
          else if (days <= 30) grouped[name].d30 += bal;
          else if (days <= 60) grouped[name].d60 += bal;
          else if (days <= 90) grouped[name].d90 += bal;
          else grouped[name].d90plus += bal;
        }
        setRows(Object.values(grouped));
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const totals = rows.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      current: acc.current + r.current,
      d30: acc.d30 + r.d30,
      d60: acc.d60 + r.d60,
      d90: acc.d90 + r.d90,
      d90plus: acc.d90plus + r.d90plus,
    }),
    { total: 0, current: 0, d30: 0, d60: 0, d90: 0, d90plus: 0 }
  );

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ClockIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Aging Report - Accounts Payable
        </div>
        <button className="btn btn--sm"><Download size={14} /> Export</button>
      </div>

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

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Supplier</th>
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
              <tr key={a.supplier} className="hover:bg-[#f8f8f8] cursor-pointer">
                <td className="font-medium">{a.supplier}</td>
                <td className="text-right font-medium">{fmt(a.total)}</td>
                <td className="text-right">{a.current ? fmt(a.current) : "-"}</td>
                <td className="text-right">{a.d30 ? fmt(a.d30) : "-"}</td>
                <td className="text-right">{a.d60 ? fmt(a.d60) : "-"}</td>
                <td className="text-right">{a.d90 ? fmt(a.d90) : "-"}</td>
                <td className="text-right">{a.d90plus ? fmt(a.d90plus) : "-"}</td>
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
                <td className="text-right">{totals.d30 ? fmt(totals.d30) : "-"}</td>
                <td className="text-right">{totals.d60 ? fmt(totals.d60) : "-"}</td>
                <td className="text-right">{totals.d90 ? fmt(totals.d90) : "-"}</td>
                <td className="text-right">{totals.d90plus ? fmt(totals.d90plus) : "-"}</td>
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
