"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function JournalPage() {
  const router = useRouter();
  const [journals, setJournals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    fetch(`/api/journal?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => { setJournals(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load journal"); setLoading(false); });
  }, [search, dateFrom, dateTo]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const totalDebit = journals.reduce((s: number, j: any) => s + (j.totalDebit || 0), 0);
  const totalCredit = journals.reduce((s: number, j: any) => s + (j.totalCredit || 0), 0);
  const saldoAwal = 150000000;
  const saldoAkhir = saldoAwal + totalDebit - totalCredit;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <JournalIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Jurnal Umum
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Saldo Awal</div>
          <div className="text-xl font-bold text-[--color-text-primary]">{fmt(saldoAwal)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Debit Masuk</div>
          <div className="text-xl font-bold" style={{ color: "var(--color-success)" }}>{fmt(totalDebit)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Kredit Keluar</div>
          <div className="text-xl font-bold" style={{ color: "var(--color-error)" }}>{fmt(totalCredit)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Saldo Akhir</div>
          <div className="text-xl font-bold" style={{ color: saldoAkhir >= 0 ? "var(--color-brand)" : "var(--color-error)" }}>{fmt(saldoAkhir)}</div>
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
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Ref / Deskripsi..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
              <th>No. Jurnal</th>
              <th>Date</th>
              <th>Description</th>
              <th>Status</th>
              <th className="text-right">Debit</th>
              <th className="text-right">Credit</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((j: any) => (
              <tr key={j.id} className="hover:bg-[#f8f8f8] cursor-pointer" onClick={() => router.push(`/finance/journal/${j.jeNo || j.id}`)}>
                <td className="font-medium text-[--color-brand]">{j.jeNo}</td>
                <td className="text-[--color-text-secondary]">{j.date ? new Date(j.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                <td>{j.description}</td>
                <td>{j.status}</td>
                <td className="text-right font-medium">{(j.totalDebit || 0) > 0 ? fmt(j.totalDebit) : "-"}</td>
                <td className="text-right font-medium">{(j.totalCredit || 0) > 0 ? fmt(j.totalCredit) : "-"}</td>
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
