"use client";

import { useEffect, useState } from "react";
import { Plus, Search, X, ChevronLeft, ChevronRight, Check } from "lucide-react";

interface PaymentRequest {
  id: string;
  tanggal: string;
  diajukanOleh: string;
  keperluan: string;
  jumlah: number;
  status: string;
  keterangan: string;
  penerima: string;
  divisi: string;
  kategori: string;
  tglKebutuhan: string;
}

interface FormData {
  tglKebutuhan: string;
  divisi: string;
  kategori: string;
  keperluan: string;
  nominal: string;
  // Step 2 - Penerima
  namaPenerima: string;
  kontak: string;
  namaBank: string;
  noRekening: string;
  ketPenerima: string;
}

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

const statusStyle = (s: string) => {
  const m: Record<string, { bg: string; color: string }> = {
    "Menunggu Approval": { bg: "#fff3e0", color: "#e65100" },
    "Proses Finance": { bg: "#e3f2fd", color: "#01579b" },
    "Selesai Dibayar": { bg: "#e8f5e9", color: "#1b5e20" },
  };
  const st = m[s] || { bg: "#f5f5f5", color: "#666" };
  return { display: "inline-block", padding: "2px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: st.bg, color: st.color };
};

const divisiList = ["Service & Perbaikan", "Sparepart & Gudang", "Keuangan & Akuntansi", "Administrasi & CS", "Marketing & Penjualan", "HR & GA"];
const kategoriList = ["Gaji & Tunjangan", "Sparepart & Material", "Utilitas", "Transportasi", "ATK & Perlengkapan", "Maintenance", "Konsumsi", "Sewa & Retribusi", "Marketing & Promosi", "Lain-lain"];

const steps = ["Detail", "Penerima", "Review"];

const emptyForm: FormData = {
  tglKebutuhan: "", divisi: "", kategori: "", keperluan: "", nominal: "",
  namaPenerima: "", kontak: "", namaBank: "", noRekening: "", ketPenerima: "",
};

export default function RequestPaymentPage() {
  const [data, setData] = useState<PaymentRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<FormData>(emptyForm);

  useEffect(() => {
    fetch("/api/payment-requests")
      .then((r) => r.json())
      .then((json) => {
        const mapped: PaymentRequest[] = (json.data || []).map((pr: any) => ({
          id: pr.prNo || pr.id?.toString() || "",
          tanggal: pr.createdAt ? new Date(pr.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "",
          diajukanOleh: pr.diajukanOleh || "-",
          keperluan: pr.purpose || "",
          jumlah: pr.amount || 0,
          status: pr.status || "Menunggu Approval",
          keterangan: pr.keterangan || "",
          penerima: pr.penerima || "-",
          divisi: pr.divisi || "-",
          kategori: pr.kategori || "-",
          tglKebutuhan: pr.tglKebutuhan || "-",
        }));
        setData(mapped);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load payment requests"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const filtered = data.filter((d) => {
    if (filter !== "All" && d.status !== filter) return false;
    if (search && !d.keperluan.toLowerCase().includes(search.toLowerCase()) && !d.id.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const ringkasan = {
    menunggu: data.filter((d) => d.status === "Menunggu Approval").length,
    proses: data.filter((d) => d.status === "Proses Finance").length,
    selesai: data.filter((d) => d.status === "Selesai Dibayar").length,
  };

  const generateId = () => {
    const now = new Date();
    const yy = String(now.getFullYear()).slice(2);
    const mm = String(now.getMonth() + 1).padStart(2, "0");
    const dd = String(now.getDate()).padStart(2, "0");
    return `RFP/${String(data.length + 1).padStart(3, "0")}/${yy}${mm}${dd}`;
  };

  const openModal = () => {
    setStep(0);
    setForm(emptyForm);
    setModalOpen(true);
  };

  const nextStep = () => {
    if (step === 0 && (!form.keperluan || !form.nominal)) return;
    if (step === 1 && (!form.namaPenerima)) return;
    setStep((s) => Math.min(s + 1, 2));
  };

  const prevStep = () => setStep((s) => Math.max(s - 1, 0));

  const submitRequest = () => {
    if (!form.keperluan || !form.nominal) return;
    const now = new Date();
    const months = ["Jan","Feb","Mar","Apr","Mei","Jun","Jul","Agu","Sep","Okt","Nov","Des"];
    const dateStr = `${now.getDate().toString().padStart(2,"0")} ${months[now.getMonth()]} ${now.getFullYear()}`;
    const newId = generateId();
    const newReq: PaymentRequest = {
      id: newId, tanggal: dateStr, diajukanOleh: "User",
      keperluan: form.keperluan, jumlah: parseInt(form.nominal.replace(/[^0-9]/g,""))||0,
      status: "Menunggu Approval", keterangan: form.keperluan,
      penerima: form.namaPenerima, divisi: form.divisi,
      kategori: form.kategori, tglKebutuhan: form.tglKebutuhan,
    };
    setData((prev) => [newReq, ...prev]);
    setModalOpen(false);
    setForm(emptyForm);
    setStep(0);
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <FileTextIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Add Request
        </div>
        <button onClick={openModal} className="btn btn--brand btn--sm">
          <Plus size={14} /> Add Request
        </button>
      </div>

      {/* Ringkasan Status */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="card-slds" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, borderLeft: "3px solid #e65100" }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "#fff3e0", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <ClockIcon size={18} color="#e65100" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#e65100", textTransform: "uppercase" }}>Menunggu Approval</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#001526" }}>{ringkasan.menunggu}</div>
            <div style={{ fontSize: 11, color: "#8e8f8e" }}>request</div>
          </div>
        </div>
        <div className="card-slds" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, borderLeft: "3px solid #01579b" }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "#e3f2fd", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <RefreshCwIcon size={18} color="#01579b" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#01579b", textTransform: "uppercase" }}>Proses Finance</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#001526" }}>{ringkasan.proses}</div>
            <div style={{ fontSize: 11, color: "#8e8f8e" }}>request</div>
          </div>
        </div>
        <div className="card-slds" style={{ padding: 14, display: "flex", alignItems: "center", gap: 12, borderLeft: "3px solid #1b5e20" }}>
          <div style={{ width: 40, height: 40, borderRadius: 8, background: "#e8f5e9", display: "flex", alignItems: "center", justifyContent: "center" }}>
            <CheckCircleIcon size={18} color="#1b5e20" />
          </div>
          <div>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#1b5e20", textTransform: "uppercase" }}>Selesai Dibayar</div>
            <div style={{ fontSize: 20, fontWeight: 700, color: "#001526" }}>{ringkasan.selesai}</div>
            <div style={{ fontSize: 11, color: "#8e8f8e" }}>request</div>
          </div>
        </div>
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
              <th>Tgl Kebutuhan</th>
              <th>Divisi</th>
              <th>Kategori</th>
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
                <td className="text-[--color-text-secondary] text-sm">{r.tglKebutuhan}</td>
                <td className="text-sm">{r.divisi}</td>
                <td className="text-sm">{r.kategori}</td>
                <td className="font-medium">{r.keperluan}</td>
                <td>{r.penerima}</td>
                <td className="font-medium">{fmt(r.jumlah)}</td>
                <td><span style={statusStyle(r.status)}>{r.status}</span></td>
              </tr>
            ))}
            {filtered.length === 0 && (
              <tr><td colSpan={8} style={{ textAlign: "center", color: "#8e8f8e", padding: 24 }}>Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {/* ═══════════ 3-Step Modal ═══════════ */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl border border-[--color-border-light]">
            {/* Header */}
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between">
              <h2 className="text-base font-bold text-[--color-text-primary]">Add Request — Step {step + 1}/3: {steps[step]}</h2>
              <button onClick={() => setModalOpen(false)} className="text-[--color-text-placeholder] hover:text-[--color-text-secondary]"><X className="w-5 h-5" /></button>
            </div>

            {/* Step indicator */}
            <div style={{ display: "flex", padding: "12px 24px 0", alignItems: "flex-start" }}>
              {steps.map((s, i) => (
                <div key={s} style={{ display: "flex", alignItems: "flex-start", flex: i < 2 ? "1 1 0" : "none" }}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
                    <div style={{
                      width: 28, height: 28, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center",
                      fontSize: 12, fontWeight: 700, border: "2px solid",
                      color: i <= step ? "#fff" : "#bbb", background: i <= step ? "#0176d3" : "#fff",
                      borderColor: i <= step ? "#0176d3" : "#d8d8d8",
                    }}>
                      {i < step ? <Check size={14} /> : i + 1}
                    </div>
                    <div style={{ fontSize: 10, fontWeight: 500, color: i <= step ? "#0176d3" : "#bbb", whiteSpace: "nowrap", marginTop: 4 }}>{s}</div>
                  </div>
                  {i < 2 && <div style={{ flex: 1, height: 2, background: i < step ? "#0176d3" : "#ecebea", marginTop: 13, marginLeft: 4, marginRight: 4 }} />}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="p-6">
              {/* Step 1: Detail */}
              {step === 0 && (
                <div className="space-y-4" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div className="form-group" style={{ background: "#f9fafb", padding: "10px 12px", borderRadius: 6, border: "1px solid #e5e7eb" }}>
                    <label className="form-label" style={{ marginBottom: 2 }}>No. Request</label>
                    <div style={{ fontSize: 14, fontWeight: 700, fontFamily: "monospace", color: "#0176d3" }}>{generateId()}</div>
                    <div style={{ fontSize: 10, color: "#8e8f8e" }}>Kode request akan dicetak otomatis</div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tanggal Kebutuhan *</label>
                    <input type="date" className="form-input" value={form.tglKebutuhan} onChange={(e) => setForm({ ...form, tglKebutuhan: e.target.value })} />
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Divisi *</label>
                      <select className="form-select" value={form.divisi} onChange={(e) => setForm({ ...form, divisi: e.target.value })}>
                        <option value="">Pilih Divisi</option>
                        {divisiList.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">Kategori Pengeluaran *</label>
                      <select className="form-select" value={form.kategori} onChange={(e) => setForm({ ...form, kategori: e.target.value })}>
                        <option value="">Pilih Kategori</option>
                        {kategoriList.map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Deskripsi Keperluan (Apa & Mengapa) *</label>
                    <textarea className="form-input" rows={3} placeholder="Jelaskan apa yang dibutuhkan dan mengapa..." value={form.keperluan} onChange={(e) => setForm({ ...form, keperluan: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Nominal Pengajuan (Rp) *</label>
                    <input type="text" className="form-input" placeholder="Rp 0" value={form.nominal} onChange={(e) => setForm({ ...form, nominal: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Step 2: Penerima */}
              {step === 1 && (
                <div className="space-y-4" style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Nama Penerima *</label>
                      <input type="text" className="form-input" placeholder="Nama lengkap penerima" value={form.namaPenerima} onChange={(e) => setForm({ ...form, namaPenerima: e.target.value })} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">No. WhatsApp / Email</label>
                      <input type="text" className="form-input" placeholder="0812-xxxx / email@domain.com" value={form.kontak} onChange={(e) => setForm({ ...form, kontak: e.target.value })} />
                    </div>
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                    <div className="form-group">
                      <label className="form-label">Nama Bank</label>
                      <select className="form-select" value={form.namaBank} onChange={(e) => setForm({ ...form, namaBank: e.target.value })}>
                        <option value="">Pilih Bank</option>
                        <option value="BCA">BCA</option>
                        <option value="Mandiri">Mandiri</option>
                        <option value="BRI">BRI</option>
                        <option value="BNI">BNI</option>
                        <option value="CIMB Niaga">CIMB Niaga</option>
                        <option value="Permata">Permata</option>
                        <option value="Danamon">Danamon</option>
                        <option value="Lainnya">Lainnya</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label className="form-label">No. Rekening</label>
                      <input type="text" className="form-input" placeholder="Nomor rekening" value={form.noRekening} onChange={(e) => setForm({ ...form, noRekening: e.target.value })} />
                    </div>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Keterangan</label>
                    <textarea className="form-input" rows={2} placeholder="Catatan tambahan untuk penerima..." value={form.ketPenerima} onChange={(e) => setForm({ ...form, ketPenerima: e.target.value })} />
                  </div>
                </div>
              )}

              {/* Step 3: Review */}
              {step === 2 && (
                <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
                  {/* Step 1 summary */}
                  <div style={{ background: "#f9fafb", borderRadius: 8, padding: 14, border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#0176d3", textTransform: "uppercase", marginBottom: 10 }}>Detail Request</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 13 }}>
                      <div><span style={{ color: "#8e8f8e" }}>No. Request</span></div>
                      <div style={{ fontWeight: 600, fontFamily: "monospace", color: "#0176d3" }}>{generateId()}</div>
                      <div><span style={{ color: "#8e8f8e" }}>Tgl Kebutuhan</span></div>
                      <div style={{ fontWeight: 500 }}>{form.tglKebutuhan || "-"}</div>
                      <div><span style={{ color: "#8e8f8e" }}>Divisi</span></div>
                      <div style={{ fontWeight: 500 }}>{form.divisi || "-"}</div>
                      <div><span style={{ color: "#8e8f8e" }}>Kategori</span></div>
                      <div style={{ fontWeight: 500, padding: "1px 8px", borderRadius: 4, fontSize: 12, background: "#e3f2fd", color: "#0176d3", display: "inline-block" }}>{form.kategori || "-"}</div>
                      <div><span style={{ color: "#8e8f8e" }}>Keperluan</span></div>
                      <div style={{ fontWeight: 500 }}>{form.keperluan || "-"}</div>
                      <div><span style={{ color: "#8e8f8e" }}>Nominal</span></div>
                      <div style={{ fontWeight: 700, color: "#0176d3" }}>{form.nominal ? fmt(parseInt(form.nominal.replace(/[^0-9]/g, "")) || 0) : "-"}</div>
                    </div>
                  </div>

                  {/* Step 2 summary */}
                  <div style={{ background: "#f9fafb", borderRadius: 8, padding: 14, border: "1px solid #e5e7eb" }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: "#2e844a", textTransform: "uppercase", marginBottom: 10 }}>Penerima</div>
                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 13 }}>
                      <div><span style={{ color: "#8e8f8e" }}>Nama Penerima</span></div>
                      <div style={{ fontWeight: 500 }}>{form.namaPenerima || "-"}</div>
                      <div><span style={{ color: "#8e8f8e" }}>Kontak</span></div>
                      <div style={{ fontWeight: 500 }}>{form.kontak || "-"}</div>
                      <div><span style={{ color: "#8e8f8e" }}>Nama Bank</span></div>
                      <div style={{ fontWeight: 500 }}>{form.namaBank || "-"}</div>
                      <div><span style={{ color: "#8e8f8e" }}>No. Rekening</span></div>
                      <div style={{ fontWeight: 500, fontFamily: "monospace" }}>{form.noRekening || "-"}</div>
                      <div><span style={{ color: "#8e8f8e" }}>Keterangan</span></div>
                      <div style={{ fontWeight: 500 }}>{form.ketPenerima || "-"}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-between">
              <button onClick={() => setModalOpen(false)} className="btn btn--sm">Batal</button>
              <div style={{ display: "flex", gap: 8 }}>
                {step > 0 && (
                  <button onClick={prevStep} className="btn btn--sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <ChevronLeft size={14} /> Sebelumnya
                  </button>
                )}
                {step < 2 ? (
                  <button onClick={nextStep} className="btn btn--brand btn--sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    Selanjutnya <ChevronRight size={14} />
                  </button>
                ) : (
                  <button onClick={submitRequest} className="btn btn--brand btn--sm" style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    <Check size={14} /> Submit Request
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Icons ─── */
function FileTextIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" />
      <polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" />
    </svg>
  );
}

function ClockIcon({ size, color }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
    </svg>
  );
}

function RefreshCwIcon({ size, color }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="23 4 23 10 17 10" /><polyline points="1 20 1 14 7 14" /><path d="M3.5 9a9 9 0 0 1 14.9-3.4L23 10" /><path d="M20.5 15a9 9 0 0 1-14.9 3.4L1 14" />
    </svg>
  );
}

function CheckCircleIcon({ size, color }: { size?: number; color?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size || 24} height={size || 24} viewBox="0 0 24 24" fill="none" stroke={color || "currentColor"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.1V12a10 10 0 1 1-5.9-9.1" /><polyline points="22 4 12 14 9 11" />
    </svg>
  );
}
