"use client";

import { useState } from "react";
import { Plus, Search, X } from "lucide-react";

interface PaymentRequest {
  id: string;
  tanggal: string;
  diajukanOleh: string;
  keperluan: string;
  jumlah: number;
  status: string;
  keterangan: string;
  penerima: string;
}

const dataAwal: PaymentRequest[] = [
  { id: "RFP/001/260701", tanggal: "01 Jul 2026", diajukanOleh: "Budi", keperluan: "Gaji Karyawan Juli 2026", jumlah: 45000000, status: "Menunggu Approval", keterangan: "Pembayaran gaji bulanan", penerima: "Seluruh Karyawan" },
  { id: "RFP/002/260702", tanggal: "02 Jul 2026", diajukanOleh: "Ani", keperluan: "Pembelian Sparepart AC", jumlah: 8500000, status: "Proses Finance", keterangan: "Sparepart AC kantor", penerima: "PT CoolTech" },
  { id: "RFP/003/260703", tanggal: "03 Jul 2026", diajukanOleh: "Rudi", keperluan: "Biaya Operasional Bengkel", jumlah: 3200000, status: "Selesai Dibayar", keterangan: "Listrik & air bengkel", penerima: "PLN / PDAM" },
  { id: "RFP/004/260704", tanggal: "04 Jul 2026", diajukanOleh: "Budi", keperluan: "Pembelian Oli & Filter", jumlah: 12000000, status: "Menunggu Approval", keterangan: "Restock inventory", penerima: "PT Parts Indo" },
  { id: "RFP/005/260705", tanggal: "05 Jul 2026", diajukanOleh: "Ani", keperluan: "Service Kendaraan Operasional", jumlah: 2500000, status: "Proses Finance", keterangan: "Service rutin", penerima: "Bengkel Resmi" },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

const statusStyle = (s: string) => {
  const m: Record<string, { bg: string; color: string }> = {
    "Menunggu Approval": { bg: "#fff3e0", color: "#e65100" },
    "Proses Finance": { bg: "#e3f2fd", color: "#01579b" },
    "Selesai Dibayar": { bg: "#e8f5e9", color: "#1b5e20" },
  };
  const st = m[s] || { bg: "#f5f5f5", color: "#666" };
  return { display: "inline-block", padding: "2px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color };
};

export default function RequestPaymentPage() {
  const [data, setData] = useState<PaymentRequest[]>(dataAwal);
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ keperluan: "", jumlah: "", keterangan: "", penerima: "" });

  const filtered = data.filter((d) => {
    if (filter !== "All" && d.status !== filter) return false;
    if (search && !d.keperluan.toLowerCase().includes(search.toLowerCase()) && !d.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const addRequest = () => {
    if (!form.keperluan || !form.jumlah) return;
    const newId = `RFP/${String(data.length + 1).padStart(3, "0")}/26070${data.length + 1}`;
    const now = new Date();
    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const dateStr = `${now.getDate().toString().padStart(2,"0")} ${months[now.getMonth()]} ${now.getFullYear()}`;
    setData((prev) => [{ id: newId, tanggal: dateStr, diajukanOleh: "User", keperluan: form.keperluan, jumlah: parseInt(form.jumlah.replace(/[^0-9]/g,""))||0, status: "Menunggu Approval", keterangan: form.keterangan, penerima: form.penerima }, ...prev]);
    setModalOpen(false);
    setForm({ keperluan: "", jumlah: "", keterangan: "", penerima: "" });
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <FileTextIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Request Payment
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn--brand btn--sm">
          <Plus size={14} /> Request Payment
        </button>
      </div>

      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={filter} onChange={(e) => setFilter(e.target.value)}>
              <option value="All">All Status</option>
              <option value="Menunggu Approval">Menunggu Approval</option>
              <option value="Proses Finance">Proses Finance</option>
              <option value="Selesai Dibayar">Selesai Dibayar</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. Request / Keperluan..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center"><Search size={14} /> Cari</button>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Request</th>
              <th>Tanggal</th>
              <th>Diajukan Oleh</th>
              <th>Keperluan</th>
              <th>Penerima</th>
              <th>Jumlah</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((r) => (
              <tr key={r.id}>
                <td className="font-medium" style={{ whiteSpace: "nowrap" }}>{r.id}</td>
                <td className="text-[--color-text-secondary] text-sm">{r.tanggal}</td>
                <td>{r.diajukanOleh}</td>
                <td className="font-medium">{r.keperluan}</td>
                <td>{r.penerima}</td>
                <td className="font-medium">{fmt(r.jumlah)}</td>
                <td><span style={statusStyle(r.status)}>{r.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#8e8f8e", padding: 24 }}>Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg border border-[--color-border-light]">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between">
              <h2 className="text-base font-bold text-[--color-text-primary]">Request Payment Baru</h2>
              <button onClick={() => setModalOpen(false)} className="text-[--color-text-placeholder] hover:text-[--color-text-secondary]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Keperluan *</label>
                <input type="text" className="form-input" placeholder="Contoh: Gaji Karyawan" value={form.keperluan} onChange={(e) => setForm((p) => ({ ...p, keperluan: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Jumlah (Rp) *</label>
                <input type="text" className="form-input" placeholder="Rp 0" value={form.jumlah} onChange={(e) => setForm((p) => ({ ...p, jumlah: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Penerima</label>
                <input type="text" className="form-input" placeholder="Nama penerima" value={form.penerima} onChange={(e) => setForm((p) => ({ ...p, penerima: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Keterangan</label>
                <textarea className="form-input" rows={3} placeholder="Detail keperluan..." value={form.keterangan} onChange={(e) => setForm((p) => ({ ...p, keterangan: e.target.value }))} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn btn--sm">Batal</button>
              <button onClick={addRequest} className="btn btn--brand btn--sm">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" />
    </svg>
  );
}
