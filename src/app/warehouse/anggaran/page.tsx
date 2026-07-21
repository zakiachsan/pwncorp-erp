"use client";

// TODO: Replace hardcoded data with API call when /api/anggaran endpoint is available
import { useEffect, useState } from "react";
import { Plus, X, BarChart3, ExternalLink } from "lucide-react";
import { useRouter } from "next/navigation";

interface AnggaranSWO {
  id: string;
  swoId: string;
  sroId: string;
  customer: string;
  kendaraan: string;
  noPol: string;
  anggaran: number;
  realisasi: number;
}

const projects: { id: string; name: string }[] = [];

const initialData: AnggaranSWO[] = [];

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtShort = (n: number) => {
  if (n >= 1000000) return `Rp ${(n / 1000000).toFixed(0)}jt`;
  return "Rp " + n.toLocaleString("id-ID");
};

export default function AnggaranPage() {
  const router = useRouter();
  const [items, setItems] = useState<AnggaranSWO[]>(initialData);
  const [selectedProject, setSelectedProject] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [form, setForm] = useState({ swoId: "", sroId: "", customer: "", kendaraan: "", noPol: "", anggaran: "", realisasi: "" });

  useEffect(() => {
    fetch("/api/work-orders?limit=100")
      .then((r) => r.json())
      .then((j) => {
        const wos = j.data || [];
        const mapped: AnggaranSWO[] = wos.map((wo: any, i: number) => ({
          id: `A-${String(i + 1).padStart(3, "0")}`,
          swoId: wo.woNo || "-",
          sroId: wo.so?.soNo || "-",
          customer: wo.so?.customer?.name || "-",
          kendaraan: wo.so?.vehicle ? `${wo.so.vehicle.brand} ${wo.so.vehicle.model || ""}` : "-",
          noPol: wo.so?.vehicle?.plateNo || "-",
          anggaran: wo.items?.reduce((s: number, it: any) => s + (it.total || 0), 0) || 0,
          realisasi: wo.status === "Completed" ? (wo.items?.reduce((s: number, it: any) => s + (it.total || 0), 0) || 0) : 0,
        }));
        setItems(mapped);
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, []);

  const pp = projects.find((p) => p.id === selectedProject);

  const addItem = () => {
    if (!form.swoId || !form.anggaran) return;
    const newItem: AnggaranSWO = {
      id: `A-${String(items.length + 1).padStart(3, "0")}`,
      swoId: form.swoId,
      sroId: form.sroId,
      customer: form.customer,
      kendaraan: form.kendaraan,
      noPol: form.noPol,
      anggaran: parseInt(form.anggaran.replace(/[^0-9]/g, "")) || 0,
      realisasi: parseInt(form.realisasi.replace(/[^0-9]/g, "")) || 0,
    };
    setItems((prev) => [...prev, newItem]);
    setModalOpen(false);
    setForm({ swoId: "", sroId: "", customer: "", kendaraan: "", noPol: "", anggaran: "", realisasi: "" });
  };

  const handleDelete = (id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  };

  const totalAnggaran = items.reduce((s, i) => s + i.anggaran, 0);
  const totalRealisasi = items.reduce((s, i) => s + i.realisasi, 0);
  const sisaBudget = totalAnggaran - totalRealisasi;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <BarChart3 className="w-6 h-6 text-[--color-brand-secondary]" />
          Anggaran
        </div>
        <button onClick={() => setModalOpen(true)} className="btn btn--brand btn--sm">
          <Plus size={14} /> Tambah SWO
        </button>
      </div>

      {/* Filter: Project */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Project</label>
            <select value={selectedProject} onChange={(e) => setSelectedProject(e.target.value)} className="form-select">
              {projects.map((p) => (
                <option key={p.id} value={p.id}>{p.id} — {p.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Customer</label>
            <input type="text" className="form-input" value={pp?.name || ""} readOnly />
          </div>
        </div>
      </div>

      {/* Summary */}
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

      {/* Detail Breakdown Per SWO */}
      <div className="card-slds">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold text-[--color-text-primary]">Detail Breakdown Anggaran per SWO</h3>
          <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-[--color-brand] bg-[--color-brand-light] hover:bg-blue-100 rounded-lg transition">
            <Plus className="w-3.5 h-3.5" /> Tambah SWO
          </button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>No.</th>
                <th>No. SWO</th>
                <th>No. SRO</th>
                <th>Customer</th>
                <th>Kendaraan</th>
                <th>No. Pol</th>
                <th className="text-right">Anggaran</th>
                <th className="text-right">Realisasi</th>
                <th className="text-right">Selisih</th>
                <th className="w-10"></th>
              </tr>
            </thead>
            <tbody>
              {items.map((row, i) => {
                const selisih = row.anggaran - row.realisasi;
                const selisihColor = selisih > 0 ? "var(--color-success)" : selisih === 0 ? "var(--color-text-placeholder)" : "var(--color-error)";
                return (
                  <tr key={row.id}>
                    <td className="text-sm">{i + 1}</td>
                    <td>
                      <span className="font-medium cursor-pointer" style={{ color: "var(--color-brand)" }}
                        onClick={() => router.push(`/work-orders/${row.swoId}`)}>
                        {row.swoId}
                      </span>
                    </td>
                    <td>
                      <span className="font-medium cursor-pointer" style={{ color: "var(--color-brand)" }}
                        onClick={() => router.push(`/service-orders/${row.sroId}`)}>
                        {row.sroId}
                      </span>
                    </td>
                    <td>{row.customer}</td>
                    <td>{row.kendaraan}</td>
                    <td>{row.noPol}</td>
                    <td className="text-right font-medium">{fmt(row.anggaran)}</td>
                    <td className="text-right font-medium">{fmt(row.realisasi)}</td>
                    <td className="text-right font-semibold" style={{ color: selisihColor }}>
                      {selisih >= 0 ? "+" : ""}{fmt(selisih)}
                    </td>
                    <td className="text-right">
                      <button onClick={() => handleDelete(row.id)}
                        className="inline-flex items-center justify-center p-1 text-[--color-text-placeholder] hover:text-[--color-error] transition"
                        title="Hapus">
                        <X className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                );
              })}
              {items.length === 0 && (
                <tr><td colSpan={10} className="py-6 text-center text-xs text-[--color-text-placeholder]">Belum ada data anggaran</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Tambah SWO */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg border border-[--color-border-light]">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between">
              <h2 className="text-base font-bold text-[--color-text-primary]">Tambah Anggaran SWO</h2>
              <button onClick={() => setModalOpen(false)} className="text-[--color-text-placeholder] hover:text-[--color-text-secondary]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">No. SWO *</label>
                  <input type="text" className="form-input" placeholder="SWO/XXX/..." value={form.swoId} onChange={(e) => setForm({ ...form, swoId: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">No. SRO</label>
                  <input type="text" className="form-input" placeholder="SRO/XXX/..." value={form.sroId} onChange={(e) => setForm({ ...form, sroId: e.target.value })} />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Customer</label>
                <input type="text" className="form-input" placeholder="Nama customer" value={form.customer} onChange={(e) => setForm({ ...form, customer: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Kendaraan</label>
                  <input type="text" className="form-input" placeholder="Merk kendaraan" value={form.kendaraan} onChange={(e) => setForm({ ...form, kendaraan: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">No. Polisi</label>
                  <input type="text" className="form-input" placeholder="B XXXX XX" value={form.noPol} onChange={(e) => setForm({ ...form, noPol: e.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Nilai Anggaran *</label>
                  <input type="text" className="form-input" placeholder="Rp 0" value={form.anggaran} onChange={(e) => setForm({ ...form, anggaran: e.target.value })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Realisasi</label>
                  <input type="text" className="form-input" placeholder="Rp 0" value={form.realisasi} onChange={(e) => setForm({ ...form, realisasi: e.target.value })} />
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn btn--sm">Batal</button>
              <button onClick={addItem} className="btn btn--brand btn--sm">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
