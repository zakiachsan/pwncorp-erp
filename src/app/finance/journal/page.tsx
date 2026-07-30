"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Download, ExternalLink } from "lucide-react";
const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

// Map refType to detail page URL
const SOURCE_MAP: Record<string, { label: string; getHref: (refId: string) => string }> = {
  invoice: { label: "Invoice", getHref: (id) => `/finance/invoices/service/${id}` },
  payment: { label: "Pembayaran", getHref: (id) => `/finance/payments` },
  petty_cash: { label: "Buku Kasir", getHref: (id) => `/finance/petty-cash` },
  stock_order: { label: "Stock Order", getHref: (id) => `/stock-workflow/stock-orders/detail/${id}` },
  stock_return: { label: "Stock Return", getHref: (id) => `/stock-workflow/stock-returns` },
  purchase_delivery: { label: "Penerimaan Pembelian", getHref: (id) => `/warehouse/purchase-deliveries/${id}` },
  purchase_invoice: { label: "Invoice Pembelian", getHref: (id) => `/finance/invoices/purchase` },
  purchase_return: { label: "Retur Pembelian", getHref: (id) => `/warehouse/purchase-returns/${id}` },
  stock_transfer: { label: "Transfer Stok", getHref: (id) => `/warehouse/stock-transfer/${id}` },
  stock_opname: { label: "Stock Opname", getHref: (id) => `/warehouse/stock-opname/${id}` },
};

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

  const getSourceInfo = (refType: string, refId: string) => {
    const source = SOURCE_MAP[refType];
    if (!source) return null;
    return (
      <button
        onClick={(e) => { e.stopPropagation(); router.push(source.getHref(refId)); }}
        className="inline-flex items-center gap-1 text-xs font-medium text-[--color-brand] hover:underline"
      >
        {source.label}
        <ExternalLink size={10} />
      </button>
    );
  };

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
      <div className="table-wrap overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="whitespace-nowrap">Tanggal</th>
              <th className="whitespace-nowrap">No. Jurnal</th>
              <th className="whitespace-nowrap">Sumber</th>
              <th className="whitespace-nowrap">Keterangan</th>
              <th className="text-right whitespace-nowrap">Debit</th>
              <th className="text-right whitespace-nowrap">Kredit</th>
            </tr>
          </thead>
          <tbody>
            {journals.map((j: any) => (
              <tr key={j.id} className="hover:bg-[#f8f8f8] cursor-pointer" onClick={() => router.push(`/finance/journal/${encodeURIComponent(j.jeNo || j.id)}`)}>
                <td className="text-[--color-text-secondary] whitespace-nowrap">{j.date ? new Date(j.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                <td className="font-medium text-[--color-brand] whitespace-nowrap">{j.jeNo}</td>
                <td className="whitespace-nowrap">{getSourceInfo(j.refType, j.refId)}</td>
                <td className="max-w-[300px] truncate">{j.description}</td>
                <td className="text-right font-medium whitespace-nowrap">{(j.totalDebit || 0) > 0 ? fmt(j.totalDebit) : "-"}</td>
                <td className="text-right font-medium whitespace-nowrap">{(j.totalCredit || 0) > 0 ? fmt(j.totalCredit) : "-"}</td>
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
