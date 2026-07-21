"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtDate = (d: string) => new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });

export default function CashFlowPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [summary, setSummary] = useState({ totalInflow: 0, totalOutflow: 0, net: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/finance?report=cash-flow")
      .then((r) => r.json())
      .then((j) => {
        setItems(j.data?.items || []);
        setSummary(j.data?.summary || { totalInflow: 0, totalOutflow: 0, net: 0 });
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <CashIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Arus Kas / Cash Flow
        </div>
        <button className="btn btn--sm"><Download size={14} /> Export</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Total Inflow</div>
          <div className="text-xl font-bold text-[--color-success]">{fmt(summary.totalInflow)}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Total Outflow</div>
          <div className="text-xl font-bold text-[--color-error]">{fmt(summary.totalOutflow)}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Net Cash Flow</div>
          <div className={`text-xl font-bold ${summary.net >= 0 ? "text-[--color-success]" : "text-[--color-error]"}`}>
            {summary.net >= 0 ? "" : "- "}{fmt(Math.abs(summary.net))}
          </div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Saldo Kas</div>
          <div className="text-xl font-bold text-[--color-brand]">{fmt(summary.net)}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="form-label">Periode</label>
            <input type="month" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select">
              <option>All Categories</option>
              <option>Piutang</option>
              <option>Hutang</option>
              <option>Operasional</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Tampilkan
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Deskripsi</th>
              <th>Kategori</th>
              <th className="text-right">Inflow</th>
              <th className="text-right">Outflow</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i} className="hover:bg-[#f8f8f8]">
                <td className="text-[--color-text-secondary]">{fmtDate(item.date)}</td>
                <td className="font-medium">{item.description}</td>
                <td>
                  <span className="pill pill--draft">{item.category}</span>
                </td>
                <td className="text-right">
                  {item.inflow > 0 ? (
                    <span className="text-[--color-success] font-medium">{fmt(item.inflow)}</span>
                  ) : "-"}
                </td>
                <td className="text-right">
                  {item.outflow > 0 ? (
                    <span className="text-[--color-error] font-medium">{fmt(item.outflow)}</span>
                  ) : "-"}
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-[--color-text-secondary]">Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="12" x="2" y="6" rx="2" />
      <circle cx="12" cy="12" r="2" />
      <path d="M6 12h.01M18 12h.01" />
    </svg>
  );
}
