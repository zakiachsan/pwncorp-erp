"use client";

import { useRouter } from "next/navigation";
import { Search, Download } from "lucide-react";

const arData = [
  { no: "INV-002", customer: "PT Maju Jaya", amount: "Rp 1.800.000", due: "28 Jun 2026", daysOverdue: 0, status: "Unpaid" },
  { no: "INV-003", customer: "Siti Rahmawati", amount: "Rp 2.600.000", due: "02 Jul 2026", daysOverdue: 0, status: "Partial" },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = { Unpaid: "#ea001e", Partial: "#f59e0b", Overdue: "#ea001e" };
  return map[status] || "#6b7280";
};

export default function ARPage() {
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
          <div className="text-xl font-bold text-[--color-warning]">Rp 4.400.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Current (0-30 days)</div>
          <div className="text-xl font-bold text-[--color-success]">Rp 4.400.000</div>
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
              <th>No. Invoice</th>
              <th>Customer</th>
              <th className="text-right">Amount</th>
              <th>Jatuh Tempo</th>
              <th className="text-right">Days Overdue</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {arData.map((ar) => (
              <tr key={ar.no} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors">
                <td className="font-medium text-[--color-brand]">{ar.no}</td>
                <td>{ar.customer}</td>
                <td className="text-right font-medium">{ar.amount}</td>
                <td>{ar.due}</td>
                <td className="text-right">{ar.daysOverdue}</td>
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
