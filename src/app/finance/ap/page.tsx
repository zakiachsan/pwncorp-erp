"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const statusPill = (status: string) => {
  const map: Record<string, string> = { Unpaid: "#ea001e", Partial: "#f59e0b", Paid: "#2e844a" };
  return map[status] || "#6b7280";
};

export default function APPage() {
  const router = useRouter();
  const [apData, setApData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/purchase-invoices?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => { setApData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load AP data"); setLoading(false); });
  }, [statusFilter]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const totalHutang = apData.reduce((s: number, ap: any) => s + (ap.total || 0), 0);

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <APIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Accounts Payable
        </div>
        <button className="btn btn--sm"><Download size={14} /> Export</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Total Hutang</div>
          <div className="text-xl font-bold text-[--color-error]">{fmt(totalHutang)}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Current (0-30 days)</div>
          <div className="text-xl font-bold text-[--color-success]">{fmt(totalHutang)}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Overdue (31-60 days)</div>
          <div className="text-xl font-bold text-[--color-warning]">Rp 0</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Overdue (60+ days)</div>
          <div className="text-xl font-bold text-[--color-error]">Rp 0</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. PO / Supplier..." />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center"><Search size={14} /> Cari</button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. PO</th>
              <th>Supplier</th>
              <th className="text-right">Amount</th>
              <th>Jatuh Tempo</th>
              <th className="text-right">Days Overdue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {apData.map((ap: any) => (
              <tr key={ap.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/finance/payments/${ap.id}`)}>
                <td className="font-medium text-[--color-brand]">{ap.po?.poNo || ap.poId || "-"}</td>
                <td>{ap.supplier?.companyName || "-"}</td>
                <td className="text-right font-medium">{fmt(ap.total || 0)}</td>
                <td>{ap.dueDate ? new Date(ap.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                <td className="text-right">0</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill(ap.status), color: "#fff" }}>{ap.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function APIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
