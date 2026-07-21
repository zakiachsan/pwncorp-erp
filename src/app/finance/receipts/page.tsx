"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Search, Download } from "lucide-react";

const formatIDR = (val: number) => `Rp ${(val || 0).toLocaleString("id-ID")}`;

const statusPill = (status: string) => {
  const map: Record<string, string> = { Lunas: "#2e844a", Pending: "#f59e0b", Dibatalkan: "#ea001e" };
  return map[status] || "#6b7280";
};

export default function ReceiptsPage() {
  const router = useRouter();
  const [receipts, setReceipts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/receipts")
      .then((r) => r.json())
      .then((j) => { setReceipts(j.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load receipts"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ReceiptIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Penerimaan (Receipts)
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export</button>
          <button className="btn btn--brand btn--sm" onClick={() => router.push("/finance/receipts/create")}><Plus size={14} /> New Receipt</button>
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
            {receipts.map((r) => {
              const fmtD = (d: string) => {
                const dt = new Date(d);
                return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
              };
              return (
              <tr key={r.receiptNo || r.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/finance/receipts/${r.receiptNo}`)}>
                <td className="font-medium text-[--color-brand]">{r.receiptNo}</td>
                <td className="text-[--color-text-secondary]">{fmtD(r.date)}</td>
                <td>{r.bankAccount?.bankName || "-"}</td>
                <td>{r.description || r.customerName || "-"}</td>
                <td className="text-right font-medium">{formatIDR(r.amount)}</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: "#2e844a", color: "#fff" }}>Lunas</span></td>
              </tr>
              );
              })}
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
