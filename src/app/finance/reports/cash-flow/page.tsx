"use client";

import { useRouter } from "next/navigation";
import { Search, Download, ArrowDownLeft, ArrowUpRight } from "lucide-react";

const cashFlowData = [
  { date: "26 Jun 2026", description: "Pembayaran Invoice INV-001 - Budi Santoso", category: "Piutang", inflow: "Rp 2.500.000", outflow: "-", balance: "Rp 2.500.000" },
  { date: "26 Jun 2026", description: "Pembayaran Invoice INV-003 - Siti Rahmawati", category: "Piutang", inflow: "Rp 2.600.000", outflow: "-", balance: "Rp 5.100.000" },
  { date: "25 Jun 2026", description: "Pembayaran PO-001 - PT Suku Cadang Jaya", category: "Hutang", inflow: "-", outflow: "Rp 4.250.000", balance: "Rp 850.000" },
  { date: "24 Jun 2026", description: "Pembayaran Invoice INV-004 - Ahmad Fauzi", category: "Piutang", inflow: "Rp 950.000", outflow: "-", balance: "Rp 1.800.000" },
  { date: "24 Jun 2026", description: "Bayar Listrik Bulanan", category: "Operasional", inflow: "-", outflow: "Rp 250.000", balance: "Rp 1.550.000" },
  { date: "23 Jun 2026", description: "Bayar Gaji Mekanik", category: "Gaji", inflow: "-", outflow: "Rp 3.000.000", balance: "Rp 1.550.000" },
];

export default function CashFlowPage() {
  const router = useRouter();
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
          <div className="text-xl font-bold text-[--color-success]">Rp 6.050.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Total Outflow</div>
          <div className="text-xl font-bold text-[--color-error]">Rp 7.500.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Net Cash Flow</div>
          <div className="text-xl font-bold text-[--color-error]">- Rp 1.450.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Saldo Kas</div>
          <div className="text-xl font-bold text-[--color-brand]">Rp 1.550.000</div>
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
              <option>Gaji</option>
            </select>
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
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th className="text-right">Inflow</th>
              <th className="text-right">Outflow</th>
              <th className="text-right">Balance</th>
            </tr>
          </thead>
          <tbody>
            {cashFlowData.map((cf, i) => (
              <tr key={i} className="hover:bg-[#f8f8f8] cursor-pointer">
                <td className="text-[--color-text-secondary]">{cf.date}</td>
                <td>{cf.description}</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: cf.category === "Piutang" ? "#2e844a" : cf.category === "Hutang" ? "#ea001e" : "#6b7280", color: "#fff" }}>{cf.category}</span></td>
                <td className="text-right font-medium text-[--color-success]">{cf.inflow}</td>
                <td className="text-right font-medium text-[--color-error]">{cf.outflow}</td>
                <td className="text-right font-medium">{cf.balance}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CashIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
