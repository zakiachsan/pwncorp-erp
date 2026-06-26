"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, Download } from "lucide-react";

const invoices = [
  { no: "INV-001", so: "SO-001", customer: "Budi Santoso", status: "Paid", total: "Rp 2.500.000", due: "30 Jun 2026", paid: "Rp 2.500.000" },
  { no: "INV-002", so: "SO-002", customer: "PT Maju Jaya", status: "Unpaid", total: "Rp 1.800.000", due: "28 Jun 2026", paid: "-" },
  { no: "INV-003", so: "SO-003", customer: "Siti Rahmawati", status: "Partial", total: "Rp 5.200.000", due: "02 Jul 2026", paid: "Rp 2.600.000" },
  { no: "INV-004", so: "SO-005", customer: "Ahmad Fauzi", status: "Paid", total: "Rp 950.000", due: "28 Jun 2026", paid: "Rp 950.000" },
  { no: "INV-005", so: "SO-006", customer: "PT Transport Jaya", status: "Draft", total: "Rp 4.800.000", due: "-", paid: "-" },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = { Draft: "#6b7280", Paid: "#2e844a", Unpaid: "#ea001e", Partial: "#f59e0b", Overdue: "#ea001e" };
  return map[status] || "#6b7280";
};

export default function InvoicesPage() {
  const router = useRouter();
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
          <div className="text-xl font-bold text-[--color-text-primary]">Rp 15.250.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Paid</div>
          <div className="text-xl font-bold text-[--color-success]">Rp 3.450.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Unpaid</div>
          <div className="text-xl font-bold text-[--color-error]">Rp 1.800.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Partial</div>
          <div className="text-xl font-bold text-[--color-warning]">Rp 2.600.000</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>Draft</option>
              <option>Paid</option>
              <option>Unpaid</option>
              <option>Partial</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. Invoice / Customer..." />
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
            {invoices.map((inv) => (
              <tr key={inv.no} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/finance/invoices/${inv.no}`)}>
                <td className="font-medium text-[--color-brand]">{inv.no}</td>
                <td className="text-[--color-text-secondary]">{inv.so}</td>
                <td>{inv.customer}</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill(inv.status), color: "#fff" }}>{inv.status}</span></td>
                <td className="text-right font-medium">{inv.total}</td>
                <td className="text-[--color-text-secondary]">{inv.due}</td>
                <td className="text-right">{inv.paid}</td>
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
