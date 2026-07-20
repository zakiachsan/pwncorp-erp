"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const statusPill = (status: string) => {
  const map: Record<string, string> = { Unpaid: "#ea001e", Partial: "#f59e0b", Overdue: "#ea001e" };
  return map[status] || "#6b7280";
};

export default function ARPage() {
  const router = useRouter();
  const [arData, setArData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/accounts-receivable?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => { setArData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load AR data"); setLoading(false); });
  }, [statusFilter]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const totalPiutang = arData.reduce((s: number, ar: any) => s + (ar.amount || 0), 0);

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ARIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Accounts Receivable
        </div>
        <button className="btn btn--sm"><Download size={14} /> Export</button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Total Piutang</div>
          <div className="text-xl font-bold text-[--color-warning]">{fmt(totalPiutang)}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Current (0-30 days)</div>
          <div className="text-xl font-bold text-[--color-success]">{fmt(totalPiutang)}</div>
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
              <option value="UNPAID">Unpaid</option>
              <option value="PARTIAL">Partial</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. Invoice / Customer..." />
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
              <th>No. Invoice</th>
              <th>Customer</th>
              <th className="text-right">Amount</th>
              <th>Jatuh Tempo</th>
              <th className="text-right">Days Overdue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {arData.map((ar: any) => (
              <tr key={ar.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/finance/invoices/${ar.invoice?.invNo || ar.id}`)}>
                <td className="font-medium text-[--color-brand]">{ar.invoice?.invNo || ar.invoiceId || "-"}</td>
                <td>{ar.customer?.name || "-"}</td>
                <td className="text-right font-medium">{fmt(ar.amount || 0)}</td>
                <td>{ar.dueDate ? new Date(ar.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                <td className="text-right">0</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill(ar.status), color: "#fff" }}>{ar.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ARIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}
