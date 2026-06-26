"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, AlertTriangle } from "lucide-react";

const stockOpnameData = [
  { date: "25 Jun 2026", code: "SP-001", name: "Oli Mesin 10W-40", systemStock: 45, actualStock: 43, diff: -2, reason: "Kerusakan", user: "Hendra" },
  { date: "25 Jun 2026", code: "SP-003", name: "Kampas Rem Depan", systemStock: 8, actualStock: 8, diff: 0, reason: "-", user: "Agus" },
  { date: "24 Jun 2026", code: "SP-005", name: "Aki GS 45Ah", systemStock: 3, actualStock: 2, diff: -1, reason: "Rusak", user: "Bambang" },
  { date: "24 Jun 2026", code: "SP-002", name: "Filter Oli", systemStock: 22, actualStock: 22, diff: 0, reason: "-", user: "Hendra" },
];

export default function StockOpnamePage() {
  const router = useRouter();

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <StockIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Stock Opname
        </div>
        <button
          onClick={() => router.push("/inventory/stock-opname/new")}
          className="btn btn--brand btn--sm"
        >
          <Plus size={14} /> New Stock Opname
        </button>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select">
              <option>All Categories</option>
              <option>Oli</option>
              <option>Filter</option>
              <option>Rem</option>
              <option>Kelistrikan</option>
              <option>Mesin</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All</option>
              <option>Selisih Only</option>
              <option>Cocok</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Kode / Nama sparepart..." />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>

      {/* Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-slds-md p-3 mb-4 flex items-center gap-2 text-amber-800 text-sm">
        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
        <span><strong>2 items</strong> memiliki selisih stok dari stock opname terakhir</span>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal</th>
              <th>Kode</th>
              <th>Nama Sparepart</th>
              <th className="text-right">Stok Sistem</th>
              <th className="text-right">Stok Fisik</th>
              <th className="text-right">Selisih</th>
              <th>Alasan</th>
              <th>Diverifikasi</th>
            </tr>
          </thead>
          <tbody>
            {stockOpnameData.map((item, i) => (
              <tr key={i} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors">
                <td className="text-[--color-text-secondary]">{item.date}</td>
                <td className="font-medium text-[--color-brand]">{item.code}</td>
                <td>{item.name}</td>
                <td className="text-right">{item.systemStock}</td>
                <td className="text-right">{item.actualStock}</td>
                <td className="text-right">
                  <span className={item.diff !== 0 ? "font-semibold text-[--color-error]" : ""}>
                    {item.diff === 0 ? "0" : item.diff > 0 ? `+${item.diff}` : item.diff}
                  </span>
                </td>
                <td>{item.reason}</td>
                <td>{item.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
      <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
      <line x1="12" x2="12" y1="22.08" y2="12" />
    </svg>
  );
}
