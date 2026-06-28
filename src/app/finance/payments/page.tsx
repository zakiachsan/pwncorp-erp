"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, Download } from "lucide-react";

const payments = [
  { no: "PAY-001", invoice: "INV-001", customer: "Budi Santoso", amount: "Rp 2.500.000", method: "Cash", date: "26 Jun 2026", status: "Verified" },
  { no: "PAY-002", invoice: "INV-003", customer: "Siti Rahmawati", amount: "Rp 2.600.000", method: "Transfer", date: "26 Jun 2026", status: "Verified" },
  { no: "PAY-003", invoice: "INV-004", customer: "Ahmad Fauzi", amount: "Rp 950.000", method: "Cash", date: "25 Jun 2026", status: "Verified" },
  { no: "PAY-004", invoice: "INV-003", customer: "Siti Rahmawati", amount: "Rp 1.000.000", method: "Transfer", date: "24 Jun 2026", status: "Pending" },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = { Verified: "#2e844a", Pending: "#f59e0b", Rejected: "#ea001e" };
  return map[status] || "#6b7280";
};

export default function PaymentsPage() {
  const router = useRouter();
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <PaymentIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Payments
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export</button>
          <button className="btn btn--brand btn--sm" onClick={() => router.push("/finance/payments/create")}><Plus size={14} /> Record Payment</button>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>Verified</option>
              <option>Pending</option>
              <option>Rejected</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. Payment / Customer..." />
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
              <th>No. Payment</th>
              <th>Invoice</th>
              <th>Customer</th>
              <th className="text-right">Amount</th>
              <th>Method</th>
              <th>Date</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {payments.map((p) => (
              <tr key={p.no} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/finance/payments/${p.no}`)}>
                <td className="font-medium text-[--color-brand]">{p.no}</td>
                <td className="text-[--color-text-secondary]">{p.invoice}</td>
                <td>{p.customer}</td>
                <td className="text-right font-medium">{p.amount}</td>
                <td>{p.method}</td>
                <td className="text-[--color-text-secondary]">{p.date}</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill(p.status), color: "#fff" }}>{p.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PaymentIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
