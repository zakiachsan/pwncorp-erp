"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Search, Download } from "lucide-react";

const statusPill = (status: string) => {
  const map: Record<string, string> = { Draft: "#6b7280", Paid: "#2e844a", Unpaid: "#ea001e", Partial: "#f59e0b", Overdue: "#ea001e" };
  return map[status] || "#6b7280";
};

export default function InvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/invoices?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => { setInvoices(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load invoices"); setLoading(false); });
  }, [search, statusFilter]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <InvoiceIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Invoices
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export</button>
          <button className="btn btn--brand btn--sm"><Plus size={14} /> New Invoice</button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Total Invoice</div>
          <div className="text-xl font-bold text-[--color-text-primary]">Rp {invoices.reduce((s: number, i: any) => s + (i.total || 0), 0).toLocaleString("id-ID")}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Paid</div>
          <div className="text-xl font-bold text-[--color-success]">Rp {invoices.filter((i: any) => i.status === "Paid").reduce((s: number, i: any) => s + (i.paidAmount || 0), 0).toLocaleString("id-ID")}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Unpaid</div>
          <div className="text-xl font-bold text-[--color-error]">Rp {invoices.filter((i: any) => i.status === "Unpaid").reduce((s: number, i: any) => s + (i.total || 0), 0).toLocaleString("id-ID")}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Partial</div>
          <div className="text-xl font-bold text-[--color-warning]">Rp {invoices.filter((i: any) => i.status === "Partial").reduce((s: number, i: any) => s + (i.paidAmount || 0), 0).toLocaleString("id-ID")}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
              <option value="Partial">Partial</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. Invoice / Customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
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

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Invoice</th>
              <th>SO</th>
              <th>Customer</th>
              <th>Status</th>
              <th className="text-right">Total</th>
              <th>Jatuh Tempo</th>
              <th className="text-right">Terbayar</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/finance/invoices/${inv.invNo || inv.id}`)}>
                <td className="font-medium text-[--color-brand]">{inv.invNo}</td>
                <td className="text-[--color-text-secondary]">{inv.so?.soNo || "-"}</td>
                <td>{inv.customer?.name || "-"}</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill(inv.status), color: "#fff" }}>{inv.status}</span></td>
                <td className="text-right font-medium">Rp {(inv.total || 0).toLocaleString("id-ID")}</td>
                <td className="text-[--color-text-secondary]">{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                <td className="text-right">Rp {(inv.paidAmount || 0).toLocaleString("id-ID")}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function InvoiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      <path d="M10 9H8" /><path d="M16 13H8" /><path d="M16 17H8" />
    </svg>
  );
}
