"use client";

import { useEffect, useState, useMemo } from "react";
import { Plus, Search, X, ArrowUpCircle, ArrowDownCircle } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

type EntryType = "masuk" | "keluar";

interface CashEntry {
  id: string;
  date: string;
  description: string;
  category: string;
  nominal: number;
  type: EntryType;
}

const COA_CATEGORIES = ["ATK & Perlengkapan", "Transportasi", "Konsumsi", "Maintenance", "Lain-lain"];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function PettyCashPage() {
  const [data, setData] = useState<CashEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [balance, setBalance] = useState(0);
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [filterCategory, setFilterCategory] = useState("Semua");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().slice(0, 10), desc: "", category: "ATK & Perlengkapan", nominal: "" });

  useEffect(() => {
    setLoading(true);
    fetch("/api/petty-cash")
      .then((r) => r.json())
      .then((json) => {
        const entries = (json.data || []).map((pc: any) => ({
          id: pc.id?.toString() || `PC-${Date.now()}`,
          date: pc.date ? new Date(pc.date).toISOString().slice(0, 10) : "",
          description: pc.description || "",
          category: pc.category || "Lain-lain",
          nominal: pc.amount || pc.nominal || 0,
          type: (pc.type === "masuk" || pc.type === "in") ? "masuk" : "keluar",
        }));
        setData(entries);
        setBalance(json.balance || 0);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load petty cash"); setLoading(false); });
  }, []);

  const filtered = useMemo(() => {
    return data.filter((d) => {
      const entryDate = new Date(d.date);
      if (dateFrom && entryDate < dateFrom) return false;
      if (dateTo && entryDate > dateTo) return false;
      if (filterCategory !== "Semua" && d.category !== filterCategory) return false;
      if (search && !d.description.toLowerCase().includes(search.toLowerCase()) && !d.id.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, dateFrom, dateTo, filterCategory, search]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const totalMasuk = data.filter((d) => d.type === "masuk").reduce((s, d) => s + d.nominal, 0);
  const totalKeluar = data.filter((d) => d.type === "keluar").reduce((s, d) => s + d.nominal, 0);
  const sisa = totalMasuk - totalKeluar;

  const handleSave = () => {
    if (!form.desc || !form.nominal) return;
    const id = `PC-${new Date().getFullYear()}/${String(data.length + 1).padStart(4, "0")}`;
    const newEntry: CashEntry = { id, date: form.date, description: form.desc, category: form.category, nominal: parseInt(form.nominal.replace(/[^0-9]/g, "")) || 0, type: "keluar" };
    setData((prev) => [newEntry, ...prev]);
    setModalOpen(false);
    setForm({ date: new Date().toISOString().slice(0, 10), desc: "", category: "ATK & Perlengkapan", nominal: "" });
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <BookIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Buku Kasir
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn--brand btn--sm">
          <Plus size={14} /> Catat Pengeluaran
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="card-slds" style={{ textAlign: "center", padding: 16 }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Sisa Uang Fisik</div>
          <div className="text-2xl font-bold" style={{ color: sisa >= 0 ? "var(--color-brand)" : "var(--color-error)" }}>{fmt(sisa)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center", padding: 16 }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Kas Masuk</div>
          <div className="text-2xl font-bold text-[--color-success]">{fmt(totalMasuk)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center", padding: 16 }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Kas Keluar</div>
          <div className="text-2xl font-bold text-[--color-error]">{fmt(totalKeluar)}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Rentang Tanggal</label>
            <DateRangePicker from={dateFrom} to={dateTo} onChange={(f, t) => { setDateFrom(f); setDateTo(t); }} />
          </div>
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select" value={filterCategory} onChange={(e) => setFilterCategory(e.target.value)}>
              <option>Semua</option>
              {COA_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="ID / Keterangan..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Tanggal & ID</th>
              <th>Keterangan Transaksi</th>
              <th>Kategori Biaya</th>
              <th className="text-right">Nominal Mutasi</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const isMasuk = d.type === "masuk";
              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 500 }}>{new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })}</div>
                    <div style={{ fontSize: 11, color: "#8e8f8e" }}>{d.id}</div>
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      {isMasuk ? <ArrowUpCircle size={14} color="#2e844a" /> : <ArrowDownCircle size={14} color="#ea001e" />}
                      {d.description}
                    </div>
                  </td>
                  <td>{d.category}</td>
                  <td className="text-right font-semibold" style={{ color: isMasuk ? "#2e844a" : "#ea001e" }}>
                    {isMasuk ? "+" : "-"}{fmt(d.nominal)}
                  </td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><td colSpan={4} style={{ textAlign: "center", color: "#8e8f8e", padding: 32 }}>Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg border border-[--color-border-light]">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between">
              <h2 className="text-base font-bold text-[--color-text-primary]">Catat Pengeluaran Kas</h2>
              <button onClick={() => setModalOpen(false)} className="text-[--color-text-placeholder] hover:text-[--color-text-secondary]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Tanggal</label>
                <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Keterangan Transaksi *</label>
                <textarea className="form-input" rows={3} placeholder="Masukkan keterangan..." value={form.desc} onChange={(e) => setForm({ ...form, desc: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Kategori Biaya (COA)</label>
                <select className="form-select" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                  {COA_CATEGORIES.map((c) => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nominal *</label>
                <input type="text" className="form-input" placeholder="Rp 0" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn btn--sm">Batal</button>
              <button onClick={handleSave} className="btn btn--brand btn--sm">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function BookIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}
