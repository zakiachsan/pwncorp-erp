"use client";

import { useState } from "react";
import { Plus, X, Trash2, BarChart3 } from "lucide-react";

interface AnggaranItem {
  id: string;
  kategori: string;
  item: string;
  anggaran: number;
  realisasi: number;
}

interface WorkOrder {
  id: string;
  name: string;
  customer: string;
}

const workOrders: WorkOrder[] = [
  { id: "SWO/001/26060149", name: "Service Berkala Toyota Avanza", customer: "Budi Santoso" },
  { id: "SWO/002/26060151", name: "Ganti Oli Honda Civic", customer: "PT Maju Jaya" },
  { id: "SWO/003/26060152", name: "Service Umum Mitsubishi Pajero", customer: "Siti Rahmawati" },
  { id: "SWO/004/26060153", name: "Tune Up Suzuki Ertiga", customer: "CV Berkah Abadi" },
  { id: "SWO/005/26060154", name: "Ganti Kampas Rem Daihatsu Xenia", customer: "Ahmad Fauzi" },
  { id: "SWO/006/26060155", name: "Overhaul Isuzu Elf", customer: "PT Transport Jaya" },
];

const kategoriOptions = [
  { label: "Material & Jasa", color: "var(--color-brand)" },
  { label: "Biaya Operasional", color: "var(--color-warning)" },
  { label: "Pajak", color: "var(--color-success)" },
];

const initialItems: AnggaranItem[] = [
  { id: "A-001", kategori: "Material & Jasa", item: "Oli Mesin 5W-30", anggaran: 255000, realisasi: 255000 },
  { id: "A-002", kategori: "Material & Jasa", item: "Filter Udara", anggaran: 120000, realisasi: 120000 },
  { id: "A-003", kategori: "Biaya Operasional", item: "Jasa Mekanik", anggaran: 350000, realisasi: 300000 },
  { id: "A-004", kategori: "Pajak", item: "PPN 11%", anggaran: 80000, realisasi: 80000 },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");
const fmtShort = (n: number) => {
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(0)}jt`;
  return "Rp " + n.toLocaleString("id-ID");
};

export default function AnggaranPage() {
  const [items, setItems] = useState<AnggaranItem[]>(initialItems);
  const [selectedWO, setSelectedWO] = useState(workOrders[0].id);
  const [modalOpen, setModalOpen] = useState(false);
  const [formKategori, setFormKategori] = useState("Material & Jasa");
  const [formItem, setFormItem] = useState("");
  const [formAnggaran, setFormAnggaran] = useState("");
  const [formRealisasi, setFormRealisasi] = useState("");

  const selectedWOData = workOrders.find((w) => w.id === selectedWO);

  const addItem = () => {
    if (!formItem || !formAnggaran) return;
    const anggaranNum = parseInt(formAnggaran.replace(/[^0-9]/g, "")) || 0;
    const realisasiNum = parseInt(formRealisasi.replace(/[^0-9]/g, "")) || 0;
    const newItem: AnggaranItem = {
      id: `A-${String(items.length + 1).padStart(3, "0")}`,
      kategori: formKategori,
      item: formItem,
      anggaran: anggaranNum,
      realisasi: realisasiNum,
    };
    setItems((prev) => [...prev, newItem]);
    setModalOpen(false);
    setFormItem("");
    setFormAnggaran("");
    setFormRealisasi("");
  };

  const handleDeleteItem = (index: number) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const totalAnggaran = items.reduce((sum, i) => sum + i.anggaran, 0);
  const totalRealisasi = items.reduce((sum, i) => sum + i.realisasi, 0);
  const sisaBudget = totalAnggaran - totalRealisasi;

  const grouped = kategoriOptions.map((k) => {
    const catItems = items.filter((i) => i.kategori === k.label);
    const anggaran = catItems.reduce((s, i) => s + i.anggaran, 0);
    const realisasi = catItems.reduce((s, i) => s + i.realisasi, 0);
    const pct = anggaran > 0 ? Math.min(100, Math.round((realisasi / anggaran) * 100)) : 0;
    const over = realisasi > anggaran;
    return { label: k.label, color: k.color, pct, anggaran, realisasi, over };
  });

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <BarChart3 className="w-6 h-6 text-[--color-brand-secondary]" />
          Anggaran
        </div>
        <button
          onClick={() => setModalOpen(true)}
          className="btn btn--brand btn--sm"
        >
          <Plus size={14} /> Tambah Item
        </button>
      </div>

      {/* Work Order Selector */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Work Order</label>
            <select
              value={selectedWO}
              onChange={(e) => setSelectedWO(e.target.value)}
              className="form-select"
            >
              {workOrders.map((w) => (
                <option key={w.id} value={w.id}>{w.id} — {w.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Customer</label>
            <input type="text" className="form-input" value={selectedWOData?.customer || ""} readOnly />
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Anggaran</div>
          <div className="text-2xl font-bold text-[--color-text-primary]">{fmtShort(totalAnggaran)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Realisasi</div>
          <div className="text-2xl font-bold text-[--color-brand]">{fmtShort(totalRealisasi)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center" }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Sisa Budget</div>
          <div className="text-2xl font-bold" style={{ color: sisaBudget >= 0 ? "var(--color-success)" : "var(--color-error)" }}>{fmtShort(sisaBudget)}</div>
        </div>
      </div>

      {/* Category Progress */}
      <div className="card-slds mb-4">
        <h3 className="text-sm font-bold text-[--color-text-primary] mb-5">Anggaran vs Realisasi per Kategori</h3>
        <div className="space-y-5">
          {grouped.map((cat) => (
            <div key={cat.label}>
              <div className="flex justify-between text-sm font-semibold text-[--color-text-secondary] mb-2">
                <span>{cat.label}</span>
                <span style={{ color: cat.over ? "var(--color-error)" : cat.color }}>
                  {cat.over ? "Overbudget" : `${cat.pct}% tercapai`}
                </span>
              </div>
              <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{
                    width: `${cat.over ? 100 : cat.pct}%`,
                    background: cat.over ? "var(--color-error)" : cat.color,
                  }}
                />
              </div>
              <div className="flex justify-between text-xs text-[--color-text-placeholder] mt-1.5">
                <span>Anggaran: {fmt(cat.anggaran)}</span>
                <span>Realisasi: {fmt(cat.realisasi)}</span>
              </div>
              {cat.over && (
                <div className="mt-2 text-xs font-medium text-[--color-error] bg-red-50 border border-red-100 rounded-lg px-3 py-1.5">
                  ⚠️ Overbudget {fmt(cat.realisasi - cat.anggaran)}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Detail Breakdown */}
      <div className="card-slds">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[--color-text-primary]">Detail Breakdown Anggaran</h3>
          <button
            onClick={() => setModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[--color-brand] bg-[--color-brand-light] hover:bg-blue-100 rounded-lg transition"
          >
            <Plus className="w-3.5 h-3.5" />
            Tambah Item
          </button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th className="text-left text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Kategori</th>
                <th className="text-left text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Item</th>
                <th className="text-right text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Anggaran</th>
                <th className="text-right text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Realisasi</th>
                <th className="text-right text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Selisih</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => {
                const selisih = row.anggaran - row.realisasi;
                const selisihColor = selisih > 0 ? "var(--color-success)" : selisih === 0 ? "var(--color-text-placeholder)" : "var(--color-error)";
                const selisihText = selisih >= 0 ? `+ ${fmtShort(selisih)}` : `- ${fmtShort(Math.abs(selisih))}`;
                const kategoriColor = kategoriOptions.find((k) => k.label === row.kategori)?.color || "var(--color-text-placeholder)";
                return (
                  <tr key={row.id}>
                    <td className="text-sm font-medium">{row.kategori}</td>
                    <td className="font-medium text-sm">{row.item}</td>
                    <td className="text-right text-sm">{fmt(row.anggaran)}</td>
                    <td className="text-right text-sm">{fmt(row.realisasi)}</td>
                    <td className="text-right text-sm font-semibold" style={{ color: selisihColor }}>{selisihText}</td>
                    <td className="text-right">
                      <button
                        onClick={() => handleDeleteItem(i)}
                        className="inline-flex items-center justify-center p-1 text-[--color-text-placeholder] hover:text-[--color-error] transition"
                        title="Hapus"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={6} className="py-6 text-center text-xs text-[--color-text-placeholder]">Belum ada data anggaran</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah Item */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg border border-[--color-border-light]">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between">
              <h2 className="text-base font-bold text-[--color-text-primary]">Tambah Item Anggaran</h2>
              <button onClick={() => setModalOpen(false)} className="text-[--color-text-placeholder] hover:text-[--color-text-secondary]">
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Kategori</label>
                <select
                  value={formKategori}
                  onChange={(e) => setFormKategori(e.target.value)}
                  className="form-select"
                >
                  {kategoriOptions.map((k) => <option key={k.label}>{k.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Nama Item</label>
                <input
                  type="text"
                  value={formItem}
                  onChange={(e) => setFormItem(e.target.value)}
                  placeholder="Contoh: Oli Mesin 5W-30"
                  className="form-input"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Nilai Anggaran</label>
                  <input
                    type="text"
                    value={formAnggaran}
                    onChange={(e) => setFormAnggaran(e.target.value)}
                    placeholder="Rp 0"
                    className="form-input"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Realisasi (Opsional)</label>
                  <input
                    type="text"
                    value={formRealisasi}
                    onChange={(e) => setFormRealisasi(e.target.value)}
                    placeholder="Rp 0"
                    className="form-input"
                  />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-end gap-3">
              <button
                onClick={() => setModalOpen(false)}
                className="btn btn--sm"
              >
                Batal
              </button>
              <button
                onClick={addItem}
                className="btn btn--brand btn--sm"
              >
                Simpan
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
