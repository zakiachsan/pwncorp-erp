"use client";

import { useRouter } from "next/navigation";
import { Upload, Search, CheckCircle, XCircle } from "lucide-react";

const reconData = [
  { date: "26 Jun 2026", bankRef: "TRF-001", description: "Transfer dari Budi Santoso", bankAmount: "Rp 2.500.000", journalRef: "PAY-001", journalAmount: "Rp 2.500.000", status: "Matched" },
  { date: "25 Jun 2026", bankRef: "TRF-002", description: "Transfer dari Siti Rahmawati", bankAmount: "Rp 2.600.000", journalRef: "PAY-002", journalAmount: "Rp 2.600.000", status: "Matched" },
  { date: "24 Jun 2026", bankRef: "TRF-003", description: "Transfer ke PT Suku Cadang", bankAmount: "Rp 4.250.000", journalRef: "PO-001", journalAmount: "Rp 4.250.000", status: "Matched" },
  { date: "23 Jun 2026", bankRef: "CK-001", description: "Cek dari Ahmad Fauzi", bankAmount: "Rp 950.000", journalRef: "-", journalAmount: "-", status: "Unmatched" },
  { date: "22 Jun 2026", bankRef: "TRF-004", description: "Fee bank bulanan", bankAmount: "Rp 50.000", journalRef: "-", journalAmount: "-", status: "Unmatched" },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = { Matched: "#2e844a", Unmatched: "#ea001e", Partial: "#f59e0b" };
  return map[status] || "#6b7280";
};

export default function BankReconPage() {
  const router = useRouter();
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <BankIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Bank Reconciliation
        </div>
        <button className="btn btn--brand btn--sm"><Upload size={14} /> Import Mutasi Bank</button>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>Matched</option>
              <option>Unmatched</option>
              <option>Partial</option>
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
              <th>Bank Ref</th>
              <th>Description</th>
              <th className="text-right">Bank Amount</th>
              <th>Journal Ref</th>
              <th className="text-right">Journal Amount</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {reconData.map((r, i) => (
              <tr key={i} className="hover:bg-[#f8f8f8] cursor-pointer">
                <td className="text-[--color-text-secondary]">{r.date}</td>
                <td className="font-medium">{r.bankRef}</td>
                <td>{r.description}</td>
                <td className="text-right font-medium">{r.bankAmount}</td>
                <td className="text-[--color-text-secondary]">{r.journalRef}</td>
                <td className="text-right">{r.journalAmount}</td>
                <td>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill(r.status), color: "#fff" }}>{r.status}</span>
                </td>
                <td>
                  {r.status === "Unmatched" && (
                    <button className="btn btn--brand btn--xs"><CheckCircle size={12} /> Match</button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function BankIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="3" x2="21" y1="22" y2="22" />
      <line x1="6" x2="6" y1="18" y2="11" />
      <line x1="10" x2="10" y1="18" y2="11" />
      <line x1="14" x2="14" y1="18" y2="11" />
      <line x1="18" x2="18" y1="18" y2="11" />
      <polygon points="12 2 20 7 4 7" />
    </svg>
  );
}
