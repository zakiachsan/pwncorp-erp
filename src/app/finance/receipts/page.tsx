"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, Download } from "lucide-react";

const receipts = [
  { no: "PT.2026.06.00001", date: "26 Jun 2026", cashBank: "Bank BCA", description: "Pembayaran dari Budi Santoso - Invoice INV-001", amount: 2500000, status: "Lunas" },
  { no: "PT.2026.06.00002", date: "26 Jun 2026", cashBank: "Bank Mandiri", description: "Pembayaran dari Siti Rahmawati - Invoice INV-003", amount: 2600000, status: "Lunas" },
  { no: "PT.2026.06.00003", date: "25 Jun 2026", cashBank: "Kas", description: "Penjualan tunai Ahmad Fauzi - Invoice INV-004", amount: 950000, status: "Lunas" },
  { no: "PT.2026.05.00004", date: "31 May 2026", cashBank: "Bank BCA", description: "Pembayaran dari PT Transport Jaya", amount: 4800000, status: "Pending" },
  { no: "PT.2026.05.00005", date: "28 May 2026", cashBank: "Kas", description: "Penjualan tunai sparepart", amount: 550000, status: "Dibatalkan" },
];

const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

const statusPill = (status: string) => {
  const map: Record<string, string> = { Lunas: "#2e844a", Pending: "#f59e0b", Dibatalkan: "#ea001e" };
  return map[status] || "#6b7280";
};

export default function ReceiptsPage() {
  const router = useRouter();
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ReceiptIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Penerimaan (Receipts)
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export</button>
          <button className="btn btn--brand btn--sm"><Plus size={14} /> New Receipt</button>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>Lunas</option>
              <option>Pending</option>
              <option>Dibatalkan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cash/Bank</label>
            <select className="form-select">
              <option>All</option>
              <option>Kas</option>
              <option>Bank BCA</option>
              <option>Bank Mandiri</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. / Deskripsi..." />
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
              <th>No. Penerimaan</th>
              <th>Tanggal</th>
              <th>Cash/Bank</th>
              <th>Deskripsi</th>
              <th className="text-right">Amount</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {receipts.map((r) => (
              <tr key={r.no} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/finance/receipts/${r.no}`)}>
                <td className="font-medium text-[--color-brand]">{r.no}</td>
                <td className="text-[--color-text-secondary]">{r.date}</td>
                <td>{r.cashBank}</td>
                <td>{r.description}</td>
                <td className="text-right font-medium">{formatIDR(r.amount)}</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill(r.status), color: "#fff" }}>{r.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ReceiptIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M5 2l3 12h13l3-8H5" />
      <path d="M5 2v4" /><path d="M19 2v4" />
    </svg>
  );
}
