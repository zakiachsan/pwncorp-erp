"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Upload, Search, CheckCircle } from "lucide-react";

export default function BankReconPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [summary, setSummary] = useState({ totalBalance: 0, count: 0 });

  useEffect(() => {
    fetch("/api/bank-accounts")
      .then((r) => r.json())
      .then((json) => {
        setData(json.data || []);
        setSummary(json.summary || { totalBalance: 0, count: 0 });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load bank accounts"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

  const statusPill = (status: string) => {
    const map: Record<string, string> = { Matched: "#2e844a", Unmatched: "#ea001e", Partial: "#f59e0b", Active: "#0176d3" };
    return map[status] || "#6b7280";
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <BankIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Bank Reconciliation
        </div>
        <button className="btn btn--brand btn--sm"><Upload size={14} /> Import Mutasi Bank</button>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>Matched</option>
              <option>Unmatched</option>
              <option>Partial</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Periode</label>
            <input type="month" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center"><Search size={14} /> Cari</button>
          </div>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <div className="card-slds" style={{ textAlign: "center", padding: 16 }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Balance</div>
          <div className="text-2xl font-bold text-[--color-brand]">{fmt(summary.totalBalance)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center", padding: 16 }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Accounts</div>
          <div className="text-2xl font-bold">{summary.count}</div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Bank Ref</th>
              <th>Description</th>
              <th className="text-right">Bank Amount</th>
              <th>Journal Ref</th>
              <th className="text-right">Journal Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r, i) => (
              <tr key={r.id || i} className="hover:bg-[#f8f8f8] cursor-pointer">
                <td className="text-[--color-text-secondary]">—</td>
                <td className="font-medium">{r.accountNo || "—"}</td>
                <td>{r.bankName || "—"}</td>
                <td className="text-right font-medium">{fmt(r.balance || 0)}</td>
                <td className="text-[--color-text-secondary]">—</td>
                <td className="text-right">—</td>
                <td>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill("Active"), color: "#fff" }}>Active</span>
                </td>
                <td>
                  <button className="btn btn--brand btn--xs"><CheckCircle size={12} /> Match</button>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "#8e8f8e", padding: 32 }}>Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BankIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="11" />
      <line x1="10" x2="10" y1="18" y2="11" />
      <line x1="14" x2="14" y1="18" y2="11" />
      <line x1="18" x2="18" y1="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}
