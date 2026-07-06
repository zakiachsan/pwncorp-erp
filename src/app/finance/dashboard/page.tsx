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

      {/* Row 2: Piutang & Hutang Mendesak Detail */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        {/* Piutang */}
        <div className="card-slds" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <Clock size={16} color="#fe9339" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#001526" }}>Piutang Jatuh Tempo</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#fe9339" }}>{fmt(totalPiutang)}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={ST.thL}>Customer</th>
                <th style={ST.thR}>Jumlah</th>
                <th style={ST.thR}>Jatuh Tempo</th>
              </tr>
            </thead>
            <tbody>
              {piutangJatuhTempo.map((p, i) => (
                <tr key={i}>
                  <td style={ST.td}>{p.customer}</td>
                  <td style={{ ...ST.td, textAlign: "right", fontWeight: 600 }}>{fmt(p.jumlah)}</td>
                  <td style={{ ...ST.td, textAlign: "right", color: p.hari < 0 ? "#ea001e" : p.hari <= 3 ? "#fe9339" : "#444746" }}>
                    {p.jatuhTempo}
                    {p.hari < 0 ? <span style={{ fontSize: 10, color: "#ea001e", marginLeft: 4 }}>(overdue)</span> : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Hutang Mendesak */}
        <div className="card-slds" style={{ padding: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <AlertTriangle size={16} color="#ea001e" />
              <span style={{ fontSize: 13, fontWeight: 600, color: "#001526" }}>Hutang Mendesak</span>
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: "#ea001e" }}>{fmt(totalHutangMendesak)}</span>
          </div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr>
                <th style={ST.thL}>Vendor</th>
                <th style={ST.thL}>Keperluan</th>
                <th style={ST.thR}>Jumlah</th>
                <th style={ST.thR}>Jatuh Tempo</th>
              </tr>
            </thead>
            <tbody>
              {hutangMendesak.map((h, i) => (
                <tr key={i}>
                  <td style={ST.td}>{h.vendor}</td>
                  <td style={{ ...ST.td, fontSize: 12, color: "#8e8f8e" }}>{h.desc}</td>
                  <td style={{ ...ST.td, textAlign: "right", fontWeight: 600, color: "#ea001e" }}>{fmt(h.jumlah)}</td>
                  <td style={{ ...ST.td, textAlign: "right", color: h.hari < 0 ? "#ea001e" : "#444746" }}>
                    {h.jatuhTempo}
                    {h.hari < 0 ? <span style={{ fontSize: 10, color: "#ea001e", marginLeft: 4 }}>(overdue)</span> : <span style={{ fontSize: 10, color: "#8e8f8e", marginLeft: 4 }}>({h.hari}h)</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Row 3: Recent Transactions */}
      <div className="card-slds" style={{ padding: 18 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <Wallet size={16} color="#0176d3" />
            <span style={{ fontSize: 13, fontWeight: 600, color: "#001526" }}>Transaksi Terbaru</span>
          </div>
        </div>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
          <thead>
            <tr>
              <th style={ST.thL}>Tanggal</th>
              <th style={ST.thL}>Keterangan</th>
              <th style={ST.thL}>Pihak</th>
              <th style={ST.thR}>Jumlah</th>
            </tr>
          </thead>
          <tbody>
            {recentTransactions.map((t, i) => (
              <tr key={i}>
                <td style={{ ...ST.td, color: "#8e8f8e", fontSize: 12 }}>{t.date}</td>
                <td style={{ ...ST.td, fontWeight: 500 }}>{t.desc}</td>
                <td style={ST.td}>{t.customer}</td>
                <td style={{ ...ST.td, textAlign: "right", fontWeight: 600, color: t.type === "masuk" ? "#2e844a" : "#ea001e" }}>
                  {t.type === "masuk" ? "+" : "-"}{fmt(t.amount)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
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

const ST: Record<string, React.CSSProperties> = {
  thL: { textAlign: "left", fontWeight: 600, fontSize: 10, color: "#8e8f8e", textTransform: "uppercase", padding: "4px 0", borderBottom: "1px solid #ecebea" },
  thR: { textAlign: "right", fontWeight: 600, fontSize: 10, color: "#8e8f8e", textTransform: "uppercase", padding: "4px 0", borderBottom: "1px solid #ecebea" },
  td: { padding: "7px 0", borderBottom: "1px solid #f5f5f5" },
};
