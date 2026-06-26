"use client";

import { Download } from "lucide-react";

const agingData = [
  { supplier: "PT Suku Cadang Jaya", total: "Rp 4.250.000", current: "Rp 4.250.000", "1-30": "-", "31-60": "-", "61-90": "-", "90+": "-" },
  { supplier: "CV Autoparts", total: "Rp 1.500.000", current: "Rp 1.500.000", "1-30": "-", "31-60": "-", "61-90": "-", "90+": "-" },
];

export default function AgingAPPage() {
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ClockIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Aging Report - Accounts Payable
        </div>
        <button className="btn btn--sm"><Download size={14} /> Export</button>
      </div>

      {/* Filter */}
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

      {/* Table */}
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
            {agingData.map((a) => (
              <tr key={a.supplier} className="hover:bg-[#f8f8f8]">
                <td className="font-medium">{a.supplier}</td>
                <td className="text-right font-medium">{a.total}</td>
                <td className="text-right">{a.current}</td>
                <td className="text-right">{a["1-30"]}</td>
                <td className="text-right">{a["31-60"]}</td>
                <td className="text-right">{a["61-90"]}</td>
                <td className="text-right">{a["90+"]}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr className="font-bold border-t-2 border-[--color-text-primary]">
              <td>Total</td>
              <td className="text-right">Rp 5.750.000</td>
              <td className="text-right">Rp 5.750.000</td>
              <td className="text-right">-</td>
              <td className="text-right">-</td>
              <td className="text-right">-</td>
              <td className="text-right">-</td>
            </tr>
          </tfoot>
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
