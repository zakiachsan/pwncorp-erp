"use client";

import { useEffect, useState } from "react";
import { Plus, Copy, Trash2, Edit3, Check, X, ChevronDown } from "lucide-react";

type NormalBalance = "Debit" | "Kredit";
type KategoriAkun = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";

interface COAEntry {
  id: string;
  code: string;
  name: string;
  normal: NormalBalance;
  kategori: KategoriAkun;
  divisi: string;
  note: string;
  noRek: string;
  pemilik: string;
}

interface Divisi {
  id: string;
  code: string;
  name: string;
  fokus: string;
}

interface KatPengeluaran {
  id: string;
  name: string;
  coaCode: string;
  divisiAccess: string[];
  diKasir: boolean;
}

const normalOptions: NormalBalance[] = ["Debit", "Kredit"];
const kategoriOptions: KategoriAkun[] = ["Asset", "Liability", "Equity", "Revenue", "Expense"];
const divisiOptions = ["ALL - Semua Divisi", "Service & Perbaikan", "Sparepart & Gudang", "Keuangan & Akuntansi", "Administrasi & CS", "Marketing & Penjualan", "HR & GA"];

const initialCOA: COAEntry[] = [
  { id: "coa-1", code: "1-100", name: "Kas Tunai / Kas Kecil", normal: "Debit", kategori: "Asset", divisi: "ALL - Semua Divisi", note: "Uang fisik berupa kas tunai dan kas kecil operasional", noRek: "", pemilik: "" },
  { id: "coa-2", code: "1-101", name: "Bank BCA", normal: "Debit", kategori: "Asset", divisi: "ALL - Semua Divisi", note: "Saldo uang rill di rekening Bank BCA", noRek: "", pemilik: "" },
  { id: "coa-3", code: "1-102", name: "Bank Mandiri", normal: "Debit", kategori: "Asset", divisi: "ALL - Semua Divisi", note: "Saldo uang rill di rekening Bank Mandiri", noRek: "", pemilik: "" },
  { id: "coa-4", code: "1-103", name: "Bank BRI", normal: "Debit", kategori: "Asset", divisi: "ALL - Semua Divisi", note: "Saldo uang rill di rekening Bank BRI", noRek: "", pemilik: "" },
  { id: "coa-5", code: "1-110", name: "Piutang Usaha", normal: "Debit", kategori: "Asset", divisi: "ALL - Semua Divisi", note: "Uang perusahaan yang masih harus ditagih dari customer", noRek: "", pemilik: "" },
  { id: "coa-6", code: "1-1101", name: "Saldo / Piutang Shopeepay", normal: "Debit", kategori: "Asset", divisi: "ALL - Semua Divisi", note: "Saldo penjualan melalui Shopeepay", noRek: "", pemilik: "" },
  { id: "coa-7", code: "1-1102", name: "Saldo / Piutang TikTok", normal: "Debit", kategori: "Asset", divisi: "ALL - Semua Divisi", note: "Saldo penjualan melalui TikTok Shop", noRek: "", pemilik: "" },
];

const initialDivisi: Divisi[] = [
  { id: "D-001", code: "SVC", name: "Service & Perbaikan", fokus: "Perbaikan kendaraan, service berkala, diagnosa mesin" },
  { id: "D-002", code: "SPR", name: "Sparepart & Gudang", fokus: "Pengelolaan stok sparepart, pembelian, inventaris" },
  { id: "D-003", code: "FIN", name: "Keuangan & Akuntansi", fokus: "Manajemen kas, pembayaran, pelaporan keuangan" },
  { id: "D-004", code: "ADM", name: "Administrasi & CS", fokus: "Customer service, penjadwalan, administrasi umum" },
  { id: "D-005", code: "MKT", name: "Marketing & Penjualan", fokus: "Promosi, penawaran, relationship management" },
  { id: "D-006", code: "HRD", name: "HR & GA", fokus: "Rekrutmen, payroll, fasilitas kantor" },
];

const initialKatPengeluaran: KatPengeluaran[] = [
  { id: "KP-001", name: "Gaji & Tunjangan", coaCode: "6-1000 - Gaji Pokok", divisiAccess: ["HRD"], diKasir: false },
  { id: "KP-002", name: "Sparepart & Material", coaCode: "6-2000 - Pembelian Sparepart", divisiAccess: ["SPR", "SVC"], diKasir: false },
  { id: "KP-003", name: "Utilitas", coaCode: "6-3000 - Biaya Utilitas", divisiAccess: ["ADM", "HRD"], diKasir: true },
  { id: "KP-004", name: "Transportasi", coaCode: "6-4000 - Biaya Transportasi", divisiAccess: ["SVC", "MKT"], diKasir: true },
  { id: "KP-005", name: "ATK & Perlengkapan", coaCode: "6-5000 - ATK & Perlengkapan", divisiAccess: ["ADM", "HRD"], diKasir: true },
  { id: "KP-006", name: "Maintenance", coaCode: "6-6000 - Biaya Maintenance", divisiAccess: ["SPR", "HRD"], diKasir: false },
  { id: "KP-007", name: "Konsumsi", coaCode: "6-7000 - Biaya Konsumsi", divisiAccess: ["ADM", "HRD"], diKasir: true },
  { id: "KP-008", name: "Sewa & Retribusi", coaCode: "6-8000 - Sewa & Retribusi", divisiAccess: ["HRD", "FIN"], diKasir: false },
  { id: "KP-009", name: "Marketing & Promosi", coaCode: "6-9000 - Marketing & Promosi", divisiAccess: ["MKT"], diKasir: true },
  { id: "KP-010", name: "Lain-lain", coaCode: "6-9900 - Pengeluaran Lain-lain", divisiAccess: ["ADM", "FIN", "HRD", "MKT", "SPR", "SVC"], diKasir: true },
];

const masterDataOptions = [
  { key: "coa", label: "Chart of Accounts (COA)" },
  { key: "divisi", label: "Daftar Divisi" },
  { key: "pengeluaran", label: "Kategori Pengeluaran" },
] as const;

type MasterDataKey = (typeof masterDataOptions)[number]["key"];
const ROWS_PER_PAGE = 15;

/* ─── Inline styles ─── */
const inlineInput: React.CSSProperties = {
  width: "100%", border: "1px solid #ddd", borderRadius: 4, padding: "5px 8px",
  fontSize: 13, fontFamily: "inherit", outline: "none", boxSizing: "border-box",
  background: "#fff", transition: "border-color 150ms",
};

const inlineSelect: React.CSSProperties = {
  ...inlineInput, paddingRight: 24, appearance: "auto" as React.CSSProperties["appearance"],
};

const actionBtn: React.CSSProperties = {
  display: "inline-flex", alignItems: "center", justifyContent: "center",
  padding: 4, background: "#f5f5f5", border: "1px solid #ecebea",
  borderRadius: 6, cursor: "pointer",
};

export default function MasterDataPage() {
  /* ─── Master selector ─── */
  const [activeMaster, setActiveMaster] = useState<MasterDataKey>("coa");

  /* ─── COA state ─── */
  const [coaData, setCoaData] = useState<COAEntry[]>([]);
  const [coaLoading, setCoaLoading] = useState(true);
  const [coaError, setCoaError] = useState("");
  const [searchCode, setSearchCode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [kategoriFilter, setKategoriFilter] = useState<KategoriAkun | "All">("All");
  const [coaPage, setCoaPage] = useState(1);

  /* ─── Divisi state ─── */
  const [divisiData, setDivisiData] = useState<Divisi[]>(initialDivisi);
  const [divisiModalOpen, setDivisiModalOpen] = useState(false);
  const [divisiEditId, setDivisiEditId] = useState<string | null>(null);
  const [divisiForm, setDivisiForm] = useState({ code: "", name: "", fokus: "" });

  /* ─── Kategori Pengeluaran state ─── */
  const [katData, setKatData] = useState<KatPengeluaran[]>(initialKatPengeluaran);
  const [katModalOpen, setKatModalOpen] = useState(false);
  const [katEditId, setKatEditId] = useState<string | null>(null);
  const [katForm, setKatForm] = useState({ name: "", coaCode: "", divisiAccess: [] as string[], diKasir: false });

  /* ═══════════ COA logic ═══════════ */

  useEffect(() => {
    fetch("/api/coa")
      .then((r) => r.json())
      .then((json) => {
        const apiData = (json.data || []).map((a: any) => ({
          id: a.id?.toString() || `coa-${a.code}`,
          code: a.code || "",
          name: a.name || "",
          normal: (a.normalBalance === "Debit" ? "Debit" : "Kredit") as NormalBalance,
          kategori: (a.kategori || "Asset") as KategoriAkun,
          divisi: a.divisi || "ALL - Semua Divisi",
          note: a.note || "",
          noRek: a.noRek || "",
          pemilik: a.pemilik || "",
        }));
        if (apiData.length > 0) {
          setCoaData(apiData);
        }
        setCoaLoading(false);
      })
      .catch(() => { setCoaError("Failed to load Chart of Accounts"); setCoaLoading(false); });
  }, []);

  if (coaLoading) return <div className="p-8 text-center">Loading...</div>;
  if (coaError) return <div className="p-8 text-center text-red-500">{coaError}</div>;

  const updateCOAField = (id: string, field: keyof COAEntry, value: string) => {
    setCoaData((prev) => prev.map((row) => row.id === id ? { ...row, [field]: value } : row));
  };

  const handleCoaAdd = () => {
    const maxNum = coaData.reduce((max, r) => {
      const parts = r.code.split("-");
      const last = parts[parts.length - 1];
      const n = parseInt(last) || 0;
      return n > max ? n : max;
    }, 0);
    const newCode = `1-${maxNum + 1}`;
    const newEntry: COAEntry = {
      id: `coa-${Date.now()}`,
      code: newCode,
      name: "",
      normal: "Debit",
      kategori: "Asset",
      divisi: "ALL - Semua Divisi",
      note: "",
      noRek: "",
      pemilik: "",
    };
    setCoaData((prev) => [...prev, newEntry]);
  };

  const handleCoaCopy = (entry: COAEntry) => {
    const maxNum = coaData.reduce((max, r) => {
      const parts = r.code.split("-");
      const last = parts[parts.length - 1];
      const n = parseInt(last) || 0;
      return n > max ? n : max;
    }, 0);
    setCoaData((prev) => [...prev, { ...entry, id: `coa-${Date.now()}`, code: `1-${maxNum + 1}`, name: entry.name + " (Copy)" }]);
  };

  const handleCoaDelete = (id: string) => {
    setCoaData((prev) => prev.filter((r) => r.id !== id));
  };

  /* Filter & paginate */
  const filteredCOA = coaData.filter((r) => {
    const matchCode = r.code.toLowerCase().includes(searchCode.toLowerCase());
    const matchName = r.name.toLowerCase().includes(searchName.toLowerCase());
    const matchKat = kategoriFilter === "All" || r.kategori === kategoriFilter;
    return matchCode && matchName && matchKat;
  });
  const coaTotalPages = Math.ceil(filteredCOA.length / ROWS_PER_PAGE);
  const paginatedCOA = filteredCOA.slice((coaPage - 1) * ROWS_PER_PAGE, coaPage * ROWS_PER_PAGE);

  const handleCoaDownload = () => {
    const headers = ["Kode", "Nama Akun", "Normal", "Kategori", "Divisi", "Note", "No. Rek", "Pemilik"];
    const rows = filteredCOA.map((r) => [r.code, r.name, r.normal, r.kategori, r.divisi, r.note, r.noRek, r.pemilik]);
    const csv = [headers, ...rows].map((row) => row.map((c) => `"${c}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a"); a.href = url; a.download = "chart-of-accounts.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  /* ═══════════ Divisi logic ═══════════ */
  const openDivisiModal = (divisi?: Divisi) => {
    if (divisi) {
      setDivisiEditId(divisi.id);
      setDivisiForm({ code: divisi.code, name: divisi.name, fokus: divisi.fokus });
    } else {
      setDivisiEditId(null);
      setDivisiForm({ code: "", name: "", fokus: "" });
    }
    setDivisiModalOpen(true);
  };

  const handleDivisiSave = () => {
    if (!divisiForm.code || !divisiForm.name) return;
    if (divisiEditId) {
      setDivisiData((prev) => prev.map((d) => d.id === divisiEditId ? { ...d, code: divisiForm.code, name: divisiForm.name, fokus: divisiForm.fokus } : d));
    } else {
      setDivisiData((prev) => [...prev, { id: `D-${String(prev.length + 1).padStart(3, "0")}`, code: divisiForm.code, name: divisiForm.name, fokus: divisiForm.fokus }]);
    }
    setDivisiModalOpen(false);
  };

  const handleDivisiCopy = (d: Divisi) => {
    setDivisiData((prev) => [...prev, { ...d, id: `D-${String(prev.length + 1).padStart(3, "0")}`, name: d.name + " (Copy)" }]);
  };

  const handleDivisiDelete = (id: string) => {
    setDivisiData((prev) => prev.filter((d) => d.id !== id));
  };

  /* ═══════════ Kategori Pengeluaran logic ═══════════ */
  const openKatModal = (kat?: KatPengeluaran) => {
    if (kat) {
      setKatEditId(kat.id);
      setKatForm({ name: kat.name, coaCode: kat.coaCode, divisiAccess: [...kat.divisiAccess], diKasir: kat.diKasir });
    } else {
      setKatEditId(null);
      setKatForm({ name: "", coaCode: "", divisiAccess: [], diKasir: false });
    }
    setKatModalOpen(true);
  };

  const handleKatSave = () => {
    if (!katForm.name || !katForm.coaCode) return;
    if (katEditId) {
      setKatData((prev) => prev.map((k) => k.id === katEditId ? { ...k, name: katForm.name, coaCode: katForm.coaCode, divisiAccess: katForm.divisiAccess, diKasir: katForm.diKasir } : k));
    } else {
      setKatData((prev) => [...prev, { id: `KP-${String(prev.length + 1).padStart(3, "0")}`, name: katForm.name, coaCode: katForm.coaCode, divisiAccess: katForm.divisiAccess, diKasir: katForm.diKasir }]);
    }
    setKatModalOpen(false);
  };

  const handleKatCopy = (k: KatPengeluaran) => {
    setKatData((prev) => [...prev, { ...k, id: `KP-${String(prev.length + 1).padStart(3, "0")}`, name: k.name + " (Copy)" }]);
  };

  const handleKatDelete = (id: string) => {
    setKatData((prev) => prev.filter((k) => k.id !== id));
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <BookIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Master Data
        </div>
        <div className="flex gap-2">
          {activeMaster === "coa" && (
            <>
              <button onClick={handleCoaDownload} className="btn btn--sm">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg> Export
              </button>
              <button onClick={handleCoaAdd} className="btn btn--brand btn--sm"><Plus size={14} /> Tambah Baris</button>
            </>
          )}
          {activeMaster === "divisi" && (
            <button onClick={() => openDivisiModal()} className="btn btn--brand btn--sm"><Plus size={14} /> Tambah Divisi</button>
          )}
          {activeMaster === "pengeluaran" && (
            <button onClick={() => openKatModal()} className="btn btn--brand btn--sm"><Plus size={14} /> Tambah Kategori</button>
          )}
        </div>
      </div>

      {/* Master Data Selector Dropdown */}
      <div style={{ marginBottom: 16, display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#747678", textTransform: "uppercase", letterSpacing: 0.5 }}>PILIH MASTER DATA</span>
        <div style={{ position: "relative" }}>
          <select
            value={activeMaster}
            onChange={(e) => { setActiveMaster(e.target.value as MasterDataKey); setCoaPage(1); }}
            style={{ padding: "7px 32px 7px 12px", fontSize: 13, border: "1px solid #0176d3", borderRadius: 6, background: "#fff", color: "#0176d3", fontWeight: 600, cursor: "pointer", outline: "none", appearance: "none", WebkitAppearance: "none", MozAppearance: "none" }}
          >
            {masterDataOptions.map((opt) => (
              <option key={opt.key} value={opt.key}>{opt.label}</option>
            ))}
          </select>
          <ChevronDown size={14} style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "#0176d3", pointerEvents: "none" }} />
        </div>
      </div>

      {/* ═══════════ TAB: Chart of Accounts ═══════════ */}
      {activeMaster === "coa" && (
        <>
          {/* Section title */}
          <div style={{ marginBottom: 12, fontSize: 12, fontWeight: 600, color: "#747678", textTransform: "uppercase", letterSpacing: 0.5 }}>
            CHART OF ACCOUNTS (BUKU BESAR)
          </div>

          {/* Filters */}
          <div className="filter-section" style={{ marginBottom: 12 }}>
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
              <div className="form-group" style={{ minWidth: 120 }}>
                <label className="form-label">Kode</label>
                <input type="text" className="form-input" placeholder="Cari kode..." value={searchCode} onChange={(e) => { setSearchCode(e.target.value); setCoaPage(1); }} style={{ fontSize: 13 }} />
              </div>
              <div className="form-group" style={{ minWidth: 160 }}>
                <label className="form-label">Nama Akun</label>
                <input type="text" className="form-input" placeholder="Cari nama..." value={searchName} onChange={(e) => { setSearchName(e.target.value); setCoaPage(1); }} style={{ fontSize: 13 }} />
              </div>
              <div className="form-group" style={{ minWidth: 130 }}>
                <label className="form-label">Kategori</label>
                <select className="form-select" value={kategoriFilter} onChange={(e) => { setKategoriFilter(e.target.value as KategoriAkun | "All"); setCoaPage(1); }} style={{ fontSize: 13 }}>
                  <option value="All">Semua</option>
                  {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </div>
            </div>
          </div>

          {/* Inline editable table */}
          <div className="table-wrap" style={{ overflowX: "auto" }}>
            <table className="data-table" style={{ minWidth: 1100 }}>
              <thead>
                <tr>
                  <th style={{ width: 90 }}>KODE</th>
                  <th style={{ minWidth: 180 }}>NAMA AKUN</th>
                  <th style={{ width: 90 }}>NORMAL</th>
                  <th style={{ width: 100 }}>KATEGORI</th>
                  <th style={{ width: 150 }}>DIVISI</th>
                  <th style={{ minWidth: 160 }}>NOTE</th>
                  <th style={{ width: 110 }}>NO. REK</th>
                  <th style={{ width: 110 }}>PEMILIK</th>
                  <th style={{ width: 72, textAlign: "center" }}></th>
                </tr>
              </thead>
              <tbody>
                {paginatedCOA.map((row) => (
                  <tr key={row.id}>
                    <td>
                      <input
                        type="text"
                        value={row.code}
                        onChange={(e) => updateCOAField(row.id, "code", e.target.value)}
                        style={{ ...inlineInput, fontFamily: "monospace", fontWeight: 600 }}
                        placeholder="Kode"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.name}
                        onChange={(e) => updateCOAField(row.id, "name", e.target.value)}
                        style={{ ...inlineInput, fontWeight: 500 }}
                        placeholder="Nama Akun"
                      />
                    </td>
                    <td>
                      <select
                        value={row.normal}
                        onChange={(e) => updateCOAField(row.id, "normal", e.target.value)}
                        style={inlineSelect}
                      >
                        {normalOptions.map((n) => <option key={n} value={n}>{n}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        value={row.kategori}
                        onChange={(e) => updateCOAField(row.id, "kategori", e.target.value)}
                        style={inlineSelect}
                      >
                        {kategoriOptions.map((k) => <option key={k} value={k}>{k}</option>)}
                      </select>
                    </td>
                    <td>
                      <select
                        value={row.divisi}
                        onChange={(e) => updateCOAField(row.id, "divisi", e.target.value)}
                        style={inlineSelect}
                      >
                        {divisiOptions.map((d) => <option key={d} value={d}>{d}</option>)}
                      </select>
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.note}
                        onChange={(e) => updateCOAField(row.id, "note", e.target.value)}
                        style={inlineInput}
                        placeholder="Catatan..."
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.noRek}
                        onChange={(e) => updateCOAField(row.id, "noRek", e.target.value)}
                        style={{ ...inlineInput, color: row.noRek ? "#000" : "#999" }}
                        placeholder="No Rek"
                      />
                    </td>
                    <td>
                      <input
                        type="text"
                        value={row.pemilik}
                        onChange={(e) => updateCOAField(row.id, "pemilik", e.target.value)}
                        style={{ ...inlineInput, color: row.pemilik ? "#000" : "#999" }}
                        placeholder="A.N"
                      />
                    </td>
                    <td style={{ textAlign: "center" }}>
                      <div style={{ display: "flex", gap: 2, justifyContent: "center" }}>
                        <button onClick={() => handleCoaCopy(row)} title="Copy" style={{ ...actionBtn, color: "#0176d3" }}>
                          <Copy size={14} />
                        </button>
                        <button onClick={() => handleCoaDelete(row.id)} title="Hapus" style={{ ...actionBtn, color: "#ea001e" }}>
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                {paginatedCOA.length === 0 && (
                  <tr><td colSpan={9} style={{ textAlign: "center", color: "#8e8f8e", padding: 32 }}>Tidak ada data</td></tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {coaTotalPages > 1 && (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: "16px 0" }}>
              <button disabled={coaPage <= 1} onClick={() => setCoaPage((p) => Math.max(1, p - 1))} className="btn btn--sm">Prev</button>
              <span style={{ fontSize: 13, color: "#444746" }}>Page {coaPage} of {coaTotalPages}</span>
              <button disabled={coaPage >= coaTotalPages} onClick={() => setCoaPage((p) => Math.min(coaTotalPages, p + 1))} className="btn btn--sm">Next</button>
            </div>
          )}
        </>
      )}

      {/* ═══════════ TAB: Daftar Divisi ═══════════ */}
      {activeMaster === "divisi" && (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Kode Divisi</th><th>Nama Lengkap Divisi</th><th>Fokus / Tanggung Jawab Utama</th><th style={{ width: 100, textAlign: "center" }}>Aksi</th></tr></thead>
            <tbody>
              {divisiData.map((d) => (
                <tr key={d.id}>
                  <td className="font-medium" style={{ fontFamily: "monospace" }}>{d.code}</td>
                  <td className="font-medium">{d.name}</td>
                  <td className="text-[--color-text-secondary]">{d.fokus}</td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button onClick={() => openDivisiModal(d)} title="Edit" style={{ ...actionBtn, color: "#0176d3" }}><Edit3 size={14} /></button>
                      <button onClick={() => handleDivisiCopy(d)} title="Copy" style={{ ...actionBtn, color: "#2e844a" }}><Copy size={14} /></button>
                      <button onClick={() => handleDivisiDelete(d.id)} title="Hapus" style={{ ...actionBtn, color: "#ea001e" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ═══════════ TAB: Kategori Pengeluaran ═══════════ */}
      {activeMaster === "pengeluaran" && (
        <div className="table-wrap">
          <table className="data-table">
            <thead><tr><th>Nama Kategori</th><th>Mapping Kode COA</th><th>Akses Divisi</th><th style={{ textAlign: "center" }}>Di Kasir</th><th style={{ width: 100, textAlign: "center" }}>Aksi</th></tr></thead>
            <tbody>
              {katData.map((k) => {
                const divisiLabels = k.divisiAccess.map((dc) => initialDivisi.find((d) => d.code === dc)?.name ?? dc).join(", ");
                return (
                <tr key={k.id}>
                  <td className="font-medium">{k.name}</td>
                  <td style={{ fontFamily: "monospace", fontSize: 13 }}>{k.coaCode}</td>
                  <td className="text-[--color-text-secondary] text-sm">{divisiLabels}</td>
                  <td style={{ textAlign: "center" }}>{k.diKasir ? <Check size={16} color="#2e844a" /> : <X size={16} color="#bbb" />}</td>
                  <td style={{ textAlign: "center" }}>
                    <div style={{ display: "flex", gap: 4, justifyContent: "center" }}>
                      <button onClick={() => openKatModal(k)} title="Edit" style={{ ...actionBtn, color: "#0176d3" }}><Edit3 size={14} /></button>
                      <button onClick={() => handleKatCopy(k)} title="Copy" style={{ ...actionBtn, color: "#2e844a" }}><Copy size={14} /></button>
                      <button onClick={() => handleKatDelete(k.id)} title="Hapus" style={{ ...actionBtn, color: "#ea001e" }}><Trash2 size={14} /></button>
                    </div>
                  </td>
                </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Divisi Modal */}
      {divisiModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setDivisiModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg border border-[--color-border-light]">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between"><h2 className="text-base font-bold">{divisiEditId ? "Edit Divisi" : "Tambah Divisi"}</h2><button onClick={() => setDivisiModalOpen(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="form-group"><label className="form-label">Kode Divisi *</label><input type="text" className="form-input" placeholder="e.g. SVC" value={divisiForm.code} onChange={(e) => setDivisiForm({ ...divisiForm, code: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Nama Lengkap *</label><input type="text" className="form-input" placeholder="Nama divisi" value={divisiForm.name} onChange={(e) => setDivisiForm({ ...divisiForm, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Fokus / Tanggung Jawab</label><textarea className="form-input" rows={3} placeholder="Tanggung jawab utama divisi" value={divisiForm.fokus} onChange={(e) => setDivisiForm({ ...divisiForm, fokus: e.target.value })} /></div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-end gap-3"><button onClick={() => setDivisiModalOpen(false)} className="btn btn--sm">Batal</button><button onClick={handleDivisiSave} className="btn btn--brand btn--sm">Simpan</button></div>
          </div>
        </div>
      )}

      {/* Kategori Modal */}
      {katModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setKatModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg border border-[--color-border-light]">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between"><h2 className="text-base font-bold">{katEditId ? "Edit Kategori" : "Tambah Kategori"}</h2><button onClick={() => setKatModalOpen(false)}><X className="w-5 h-5" /></button></div>
            <div className="p-6 space-y-4">
              <div className="form-group"><label className="form-label">Nama Kategori *</label><input type="text" className="form-input" placeholder="e.g. Gaji & Tunjangan" value={katForm.name} onChange={(e) => setKatForm({ ...katForm, name: e.target.value })} /></div>
              <div className="form-group"><label className="form-label">Mapping Kode COA *</label><input type="text" className="form-input" placeholder="e.g. 6-1000 - Gaji Pokok" value={katForm.coaCode} onChange={(e) => setKatForm({ ...katForm, coaCode: e.target.value })} /></div>
              <div className="form-group">
                <label className="form-label">Akses Divisi</label>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", padding: "8px 0" }}>
                  {initialDivisi.map((d) => (
                    <label key={d.code} style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, cursor: "pointer" }}>
                      <input type="checkbox" checked={katForm.divisiAccess.includes(d.code)} onChange={(e) => {
                        setKatForm({ ...katForm, divisiAccess: e.target.checked ? [...katForm.divisiAccess, d.code] : katForm.divisiAccess.filter((dc) => dc !== d.code) });
                      }} />
                      {d.name}
                    </label>
                  ))}
                </div>
              </div>
              <div className="form-group">
                <label style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer", fontSize: 13 }}>
                  <input type="checkbox" checked={katForm.diKasir} onChange={(e) => setKatForm({ ...katForm, diKasir: e.target.checked })} />
                  Di Kasir — Muncul di fitur kasir / petty cash
                </label>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-end gap-3"><button onClick={() => setKatModalOpen(false)} className="btn btn--sm">Batal</button><button onClick={handleKatSave} className="btn btn--brand btn--sm">Simpan</button></div>
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
