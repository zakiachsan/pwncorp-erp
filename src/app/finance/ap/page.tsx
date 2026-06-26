"use client";

import { useRouter } from "next/navigation";
import { Search, Download } from "lucide-react";

const apData = [
  { no: "PO-001", supplier: "PT Suku Cadang Jaya", amount: "Rp 4.250.000", due: "15 Jul 2026", daysOverdue: 0, status: "Unpaid" },
  { no: "PO-002", supplier: "CV Autoparts", amount: "Rp 1.500.000", due: "10 Jul 2026", daysOverdue: 0, status: "Unpaid" },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = { Unpaid: "#ea001e", Partial: "#f59e0b", Paid: "#2e844a" };
  return map[status] || "#6b7280";
};

export default function APPage() {
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
          <div className="text-xl font-bold text-[--color-error]">Rp 5.750.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Current (0-30 days)</div>
          <div className="text-xl font-bold text-[--color-success]">Rp 5.750.000</div>
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
            {apData.map((ap) => (
              <tr key={ap.no} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors">
                <td className="font-medium text-[--color-brand]">{ap.no}</td>
                <td>{ap.supplier}</td>
                <td className="text-right font-medium">{ap.amount}</td>
                <td>{ap.due}</td>
                <td className="text-right">{ap.daysOverdue}</td>
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
