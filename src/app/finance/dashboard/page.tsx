"use client";

import { useState } from "react";
import { Plus, X, Wallet, Banknote, Landmark, TrendingUp, Clock, FileText, AlertTriangle } from "lucide-react";

interface Rekening {
  id: string;
  nama: string;
  noRekening: string;
  saldo: number;
}

const initialRekening: Rekening[] = [
  { id: "1", nama: "Kas Tunai", noRekening: "-", saldo: 25000000 },
  { id: "2", nama: "Bank BCA", noRekening: "123-456-7890", saldo: 150000000 },
  { id: "3", nama: "Bank Mandiri", noRekening: "098-765-4321", saldo: 85000000 },
  { id: "4", nama: "Bank BRI", noRekening: "567-890-1234", saldo: 45000000 },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

const bankColor = (nama: string): string => {
  const m: Record<string, string> = {
    "Kas Tunai": "#f28500",
    "Bank BCA": "#0066ae",
    "Bank Mandiri": "#003d79",
    "Bank BRI": "#005098",
  };
  return m[nama] || "#0176d3";
};

const recentTransactions = [
  { date: "04 Jul 2026", desc: "Pembayaran Invoice SRI/004", type: "masuk", amount: 2500000, customer: "Budi Santoso" },
  { date: "03 Jul 2026", desc: "Pembayaran Gaji Karyawan", type: "keluar", amount: 45000000, customer: "-" },
  { date: "02 Jul 2026", desc: "Penerimaan DP Project Fleet", type: "masuk", amount: 13500000, customer: "PT Maju Jaya" },
  { date: "01 Jul 2026", desc: "Pembelian Sparepart", type: "keluar", amount: 8500000, customer: "PT Parts Indo" },
  { date: "30 Jun 2026", desc: "Pembayaran Invoice SRI/003", type: "masuk", amount: 1800000, customer: "PT Maju Jaya" },
];

const piutangJatuhTempo = [
  { customer: "PT Maju Jaya", jumlah: 18000000, jatuhTempo: "10 Jul 2026", hari: 5 },
  { customer: "PT Transport Jaya", jumlah: 12500000, jatuhTempo: "15 Jul 2026", hari: 10 },
  { customer: "Siti Rahmawati", jumlah: 4500000, jatuhTempo: "03 Jul 2026", hari: -2 },
];

const hutangMendesak = [
  { vendor: "PT Parts Indo", jumlah: 2000000, jatuhTempo: "08 Jul 2026", hari: 2, desc: "Pembayaran Sparepart" },
  { vendor: "PT Diesel Parts", jumlah: 3500000, jatuhTempo: "07 Jul 2026", hari: 1, desc: "Pembelian Piston Kit" },
  { vendor: "PLN", jumlah: 3200000, jatuhTempo: "05 Jul 2026", hari: -1, desc: "Listrik Bengkel" },
];

export default function FinanceDashboardPage() {
  const [rekeningList, setRekeningList] = useState<Rekening[]>(initialRekening);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ nama: "", noRekening: "", saldoAwal: "" });
  const [dateFrom, setDateFrom] = useState("2026-01-01");
  const [dateTo, setDateTo] = useState("2026-07-06");

  const totalKasBank = rekeningList.reduce((sum, r) => sum + r.saldo, 0);
  const totalPiutang = piutangJatuhTempo.reduce((s, p) => s + p.jumlah, 0);
  const totalHutangMendesak = hutangMendesak.reduce((s, h) => s + h.jumlah, 0);

  const totalPemasukan = recentTransactions.filter((t) => t.type === "masuk").reduce((s, t) => s + t.amount, 0);
  const totalPengeluaran = recentTransactions.filter((t) => t.type === "keluar").reduce((s, t) => s + t.amount, 0);

  const omzet2026 = 875000000;
  const labaBersih2026 = 218750000;

  const handleSave = () => {
    if (!form.nama.trim() || !form.saldoAwal) return;
    const newRek: Rekening = {
      id: Date.now().toString(),
      nama: form.nama.trim(),
      noRekening: form.noRekening.trim() || "-",
      saldo: parseInt(form.saldoAwal.replace(/[^0-9]/g, "")) || 0,
    };
    setRekeningList((prev) => [...prev, newRek]);
    setModalOpen(false);
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <WalletIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Finance Dashboard
        </div>
      </div>

      {/* Filter Periode Analisis */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="form-label">Dari Tanggal</label>
            <input type="date" className="form-input" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Sampai Tanggal</label>
            <input type="date" className="form-input" value={dateTo} onChange={(e) => setDateTo(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <span style={{ fontSize: 12, color: "#8e8f8e", paddingTop: 8 }}>Periode Analisis</span>
          </div>
        </div>
      </div>

      {/* Row 1: 4 Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Omzet */}
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#eef4ff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <TrendingUp size={20} color="#0176d3" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Omzet (Revenue)</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#0176d3" }}>{fmt(omzet2026)}</div>
          </div>
        </div>

        {/* Laba Bersih */}
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#ecfdf5", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Banknote size={20} color="#2e844a" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Laba Bersih</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#2e844a" }}>{fmt(labaBersih2026)}</div>
          </div>
        </div>

        {/* Kas & Bank Aktif */}
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#fef3c7", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <Landmark size={20} color="#f28500" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Kas & Bank Aktif</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#001526" }}>{fmt(totalKasBank)}</div>
            <div style={{ fontSize: 11, color: "#8e8f8e" }}>{rekeningList.length} rekening</div>
          </div>
        </div>

        {/* Hutang Mendesak */}
        <div className="card-slds" style={{ padding: 18, display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 44, height: 44, borderRadius: 8, background: "#fce4ec", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
            <AlertTriangle size={20} color="#ea001e" />
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Hutang Mendesak</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#ea001e" }}>{fmt(totalHutangMendesak)}</div>
            <div style={{ fontSize: 11, color: "#8e8f8e" }}>{hutangMendesak.length} tagihan</div>
          </div>
        </div>
      </div>

      {/* Daftar Rekening */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, marginTop: 4 }}>
        <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Daftar Rekening</div>
        <button onClick={() => setModalOpen(true)} className="btn btn--brand btn--sm">
          <Plus size={14} /> Tambah Rekening
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {rekeningList.map((rek) => (
          <div key={rek.id} className="card-slds" style={{ padding: 18 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 14 }}>
              <div style={{ width: 38, height: 38, borderRadius: 8, background: bankColor(rek.nama), display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: 16, fontWeight: 700, flexShrink: 0 }}>
                {rek.nama.charAt(0)}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: "#001526" }}>{rek.nama}</div>
                <div style={{ fontSize: 11, color: "#8e8f8e" }}>{rek.noRekening !== "-" ? rek.noRekening : ""}</div>
              </div>
            </div>
            <div style={{ borderTop: "1px solid #ecebea", paddingTop: 12 }}>
              <div style={{ fontSize: 10, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", marginBottom: 3 }}>Saldo Saat Ini</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#001526" }}>{fmt(rek.saldo)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Row 2: Trend Pendapatan & Biaya + Radar Alokasi Biaya */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Trend Pendapatan & Biaya */}
        <TrendLineChart />
        
        {/* Radar Alokasi Biaya */}
        <RadarBiayaChart />
      </div>

      {/* Modal Tambah Rekening */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg border border-[--color-border-light]">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between">
              <h2 className="text-base font-bold text-[--color-text-primary]">Tambah Rekening Baru</h2>
              <button onClick={() => setModalOpen(false)} className="text-[--color-text-placeholder] hover:text-[--color-text-secondary]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Nama Rekening *</label>
                <input type="text" className="form-input" placeholder="Contoh: Bank BNI" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">No. Rekening</label>
                <input type="text" className="form-input" placeholder="Contoh: 111-222-3333" value={form.noRekening} onChange={(e) => setForm({ ...form, noRekening: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Saldo Awal *</label>
                <input type="text" className="form-input" placeholder="Rp 0" value={form.saldoAwal} onChange={(e) => setForm({ ...form, saldoAwal: e.target.value })} />
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

function WalletIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 12V8H6a2 2 0 0 1-2-2c0-1.1.9-2 2-2h12v4" />
      <path d="M4 6v12c0 1.1.9 2 2 2h14v-4" />
      <path d="M18 12a2 2 0 0 0-2 2c0 1.1.9 2 2 2h4v-4h-4z" />
    </svg>
  );
}

/* ─── Trend Line Chart ─── */
function TrendLineChart() {
  const months = ["Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul"];
  const pendapatan = [45, 52, 48, 65, 58, 72, 68];
  const biaya = [32, 38, 35, 42, 40, 48, 45];
  
  const maxVal = Math.max(...pendapatan, ...biaya);
  const chartH = 180, chartW = 400, padL = 50, padR = 20, padT = 20, padB = 30;
  
  const scaleY = (v: number) => chartH - ((v / maxVal) * (chartH - padT - padB)) - padB;
  const scaleX = (i: number) => padL + (i * (chartW - padL - padR) / (months.length - 1));
  
  const linePath = (data: number[]) => 
    data.map((v, i) => `${i === 0 ? "M" : "L"}${scaleX(i)},${scaleY(v)}`).join(" ");
  
  const totalBiaya = biaya.reduce((s, v) => s + v, 0) * 1000000;
  
  return (
    <div className="card-slds" style={{ padding: 18 }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#001526", marginBottom: 12 }}>Tren Pendapatan & Biaya</div>
      <svg viewBox={`0 0 ${chartW} ${chartH}`} style={{ width: "100%", height: "auto" }}>
        {/* Y axis labels */}
        {[0, maxVal / 2, maxVal].map((v, i) => (
          <g key={i}>
            <text x={padL - 8} y={scaleY(v) + 4} textAnchor="end" fill="#8e8f8e" fontSize={10}>
              {v > 0 ? `Rp ${v}jt` : "0"}
            </text>
            <line x1={padL} y1={scaleY(v)} x2={chartW - padR} y2={scaleY(v)} stroke="#ecebea" strokeWidth={0.5} />
          </g>
        ))}
        {/* Biaya line */}
        <path d={linePath(biaya)} fill="none" stroke="#ea001e" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {biaya.map((v, i) => (
          <circle key={i} cx={scaleX(i)} cy={scaleY(v)} r={3} fill="#fff" stroke="#ea001e" strokeWidth={2} />
        ))}
        {/* Pendapatan line */}
        <path d={linePath(pendapatan)} fill="none" stroke="#0176d3" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
        {pendapatan.map((v, i) => (
          <circle key={i} cx={scaleX(i)} cy={scaleY(v)} r={3} fill="#fff" stroke="#0176d3" strokeWidth={2} />
        ))}
        {/* X axis labels */}
        {months.map((m, i) => (
          <text key={i} x={scaleX(i)} y={chartH - 8} textAnchor="middle" fill="#8e8f8e" fontSize={10}>{m}</text>
        ))}
      </svg>
      <div style={{ display: "flex", gap: 16, marginTop: 8, fontSize: 11, color: "#8e8f8e" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 2, background: "#0176d3" }} /> Pendapatan
        </span>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 10, height: 2, background: "#ea001e" }} /> Biaya
        </span>
      </div>
    </div>
  );
}

/* ─── Radar Alokasi Biaya ─── */
function RadarBiayaChart() {
  const categories = [
    { label: "Gaji & Tunjangan", amount: 45000000, pct: 42 },
    { label: "Sparepart & Material", amount: 28000000, pct: 26 },
    { label: "Operasional", amount: 15000000, pct: 14 },
    { label: "Transportasi", amount: 5000000, pct: 5 },
    { label: "ATK & Perlengkapan", amount: 3500000, pct: 3 },
    { label: "Maintenance", amount: 4000000, pct: 4 },
    { label: "Konsumsi", amount: 2000000, pct: 2 },
    { label: "Lain-lain", amount: 4500000, pct: 4 },
  ];
  
  const totalBiaya = categories.reduce((s, c) => s + c.amount, 0);
  const colors = ["#0176d3", "#2e844a", "#ea001e", "#fe9339", "#8b5cf6", "#f59e0b", "#06a59a", "#6b7280"];
  
  return (
    <div className="card-slds" style={{ padding: 18 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: "#001526" }}>Alokasi Biaya</div>
        <div style={{ textAlign: "right" }}>
          <div style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Total Biaya</div>
          <div style={{ fontSize: 16, fontWeight: 700, color: "#ea001e" }}>{fmt(totalBiaya)}</div>
        </div>
      </div>
      
      {/* Horizontal bar chart */}
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {categories.map((c, i) => (
          <div key={c.label} style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span style={{ fontSize: 11, width: 120, textAlign: "right", color: "#444746", whiteSpace: "nowrap" }}>{c.label}</span>
            <div style={{ flex: 1, height: 18, background: "#f3f3f3", borderRadius: 4, overflow: "hidden" }}>
              <div style={{ height: "100%", width: `${c.pct}%`, background: colors[i], borderRadius: 4, transition: "width 500ms", display: "flex", alignItems: "center", justifyContent: "flex-end", paddingRight: 6 }}>
                <span style={{ fontSize: 9, fontWeight: 600, color: "#fff" }}>{c.pct}%</span>
              </div>
            </div>
            <span style={{ fontSize: 11, fontWeight: 600, color: "#001526", width: 100, whiteSpace: "nowrap" }}>{fmt(c.amount)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

const ST: Record<string, React.CSSProperties> = {
  thL: { textAlign: "left", fontWeight: 600, fontSize: 10, color: "#8e8f8e", textTransform: "uppercase", padding: "4px 0", borderBottom: "1px solid #ecebea" },
  thR: { textAlign: "right", fontWeight: 600, fontSize: 10, color: "#8e8f8e", textTransform: "uppercase", padding: "4px 0", borderBottom: "1px solid #ecebea" },
  td: { padding: "7px 0", borderBottom: "1px solid #f5f5f5" },
};
