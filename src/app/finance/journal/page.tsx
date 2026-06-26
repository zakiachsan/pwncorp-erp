"use client";

import { useRouter } from "next/navigation";
import { Search, BookOpen, Download } from "lucide-react";

const journals = [
  { date: "26 Jun 2026", ref: "INV-001", account: "Kas", description: "Pembayaran Invoice INV-001", debit: "Rp 2.500.000", credit: "-" },
  { date: "26 Jun 2026", ref: "INV-001", account: "Piutang", description: "Pembayaran Invoice INV-001", debit: "-", credit: "Rp 2.500.000" },
  { date: "25 Jun 2026", ref: "PO-001", account: "Persediaan", description: "Pembelian sparepart PO-001", debit: "Rp 4.250.000", credit: "-" },
  { date: "25 Jun 2026", ref: "PO-001", account: "Hutang Usaha", description: "Pembelian sparepart PO-001", debit: "-", credit: "Rp 4.250.000" },
  { date: "24 Jun 2026", ref: "WO-004", account: "Beban Sparepart", description: "Pemakaian sparepart WO-004", debit: "Rp 1.500.000", credit: "-" },
  { date: "24 Jun 2026", ref: "WO-004", account: "Persediaan", description: "Pemakaian sparepart WO-004", debit: "-", credit: "Rp 1.500.000" },
];

export default function JournalPage() {
  const router = useRouter();
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <JournalIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          General Ledger / Jurnal
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Account</label>
            <select className="form-select">
              <option>All Accounts</option>
              <option>Kas</option>
              <option>Piutang</option>
              <option>Hutang Usaha</option>
              <option>Persediaan</option>
              <option>Pendapatan</option>
              <option>Beban Sparepart</option>
              <option>Beban Jasa</option>
            </select>
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
              <th>Date</th>
              <th>Ref</th>
              <th>Account</th>
              <th>Description</th>
              <th className="text-right">Debit</th>
              <th className="text-right">Credit</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((j, i) => (
              <tr key={j.ref} className="hover:bg-[#f8f8f8] cursor-pointer" onClick={() => router.push(`/finance/journal/${j.ref}`)}>
                <td className="text-[--color-text-secondary]">{j.date}</td>
                <td className="font-medium text-[--color-brand]">{j.ref}</td>
                <td>{j.account}</td>
                <td>{j.description}</td>
                <td className="text-right font-medium">{j.debit}</td>
                <td className="text-right font-medium">{j.credit}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function JournalIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
