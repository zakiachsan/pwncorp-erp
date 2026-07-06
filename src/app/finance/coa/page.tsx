"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Download, ChevronRight, Check, X } from "lucide-react";

type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";

interface COAAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentCode: string;
  parentName: string;
  isActive: boolean;
  level: number;
}

const accountTypeConfig: Record<AccountType, { label: string; color: string }> = {
  Asset: { label: "Asset", color: "#0176d3" },
  Liability: { label: "Liability", color: "#ea001e" },
  Equity: { label: "Equity", color: "#8b5cf6" },
  Revenue: { label: "Revenue", color: "#2e844a" },
  Expense: { label: "Expense", color: "#f59e0b" },
};

const initialCOA: COAAccount[] = [
  { id: "1", code: "1", name: "KAS", type: "Asset", parentCode: "-", parentName: "-", isActive: true, level: 0 },
  { id: "2", code: "11", name: "KAS", type: "Asset", parentCode: "1", parentName: "KAS", isActive: true, level: 1 },
  { id: "3", code: "1101", name: "KAS PENJUALAN", type: "Asset", parentCode: "11", parentName: "KAS", isActive: true, level: 2 },
  { id: "4", code: "1102", name: "KAS KECIL", type: "Asset", parentCode: "11", parentName: "KAS", isActive: true, level: 2 },
  { id: "5", code: "12", name: "BANK", type: "Asset", parentCode: "1", parentName: "KAS", isActive: true, level: 1 },
  { id: "6", code: "1201", name: "BANK BCA", type: "Asset", parentCode: "12", parentName: "BANK", isActive: true, level: 2 },
  { id: "7", code: "1202", name: "BANK MANDIRI", type: "Asset", parentCode: "12", parentName: "BANK", isActive: true, level: 2 },
  { id: "8", code: "13", name: "PIUTANG", type: "Asset", parentCode: "1", parentName: "KAS", isActive: true, level: 1 },
  { id: "9", code: "1301", name: "PIUTANG DAGANG", type: "Asset", parentCode: "13", parentName: "PIUTANG", isActive: true, level: 2 },
  { id: "10", code: "1302", name: "PIUTANG PELANGGAN SERVICE", type: "Asset", parentCode: "13", parentName: "PIUTANG", isActive: true, level: 2 },
  { id: "11", code: "14", name: "PERSEDIAAN", type: "Asset", parentCode: "1", parentName: "KAS", isActive: true, level: 1 },
  { id: "12", code: "1401", name: "PERSEDIAAN SPAREPART", type: "Asset", parentCode: "14", parentName: "PERSEDIAAN", isActive: true, level: 2 },
  { id: "13", code: "1402", name: "PERSEDIAAN OLI", type: "Asset", parentCode: "14", parentName: "PERSEDIAAN", isActive: true, level: 2 },
  { id: "14", code: "15", name: "AKTIVA TETAP", type: "Asset", parentCode: "1", parentName: "KAS", isActive: true, level: 1 },
  { id: "15", code: "1501", name: "PERALATAN BENGKEL", type: "Asset", parentCode: "15", parentName: "AKTIVA TETAP", isActive: true, level: 2 },
  { id: "16", code: "1502", name: "KENDARAAN", type: "Asset", parentCode: "15", parentName: "AKTIVA TETAP", isActive: true, level: 2 },
  { id: "17", code: "1503", name: "INVENTARIS KANTOR", type: "Asset", parentCode: "15", parentName: "AKTIVA TETAP", isActive: true, level: 2 },
  { id: "18", code: "16", name: "AKUMULASI PENYUSUTAN", type: "Asset", parentCode: "1", parentName: "KAS", isActive: true, level: 1 },
  { id: "19", code: "1601", name: "AKUM PENYUSUTAN PERALATAN", type: "Asset", parentCode: "16", parentName: "AKUMULASI PENYUSUTAN", isActive: true, level: 2 },
  { id: "20", code: "1602", name: "AKUM PENYUSUTAN KENDARAAN", type: "Asset", parentCode: "16", parentName: "AKUMULASI PENYUSUTAN", isActive: true, level: 2 },
  { id: "21", code: "2", name: "KEWAJIBAN", type: "Liability", parentCode: "-", parentName: "-", isActive: true, level: 0 },
  { id: "22", code: "21", name: "HUTANG DAGANG", type: "Liability", parentCode: "2", parentName: "KEWAJIBAN", isActive: true, level: 1 },
  { id: "23", code: "2101", name: "HUTANG SUPPLIER", type: "Liability", parentCode: "21", parentName: "HUTANG DAGANG", isActive: true, level: 2 },
  { id: "24", code: "22", name: "HUTANG PAJAK", type: "Liability", parentCode: "2", parentName: "KEWAJIBAN", isActive: true, level: 1 },
  { id: "25", code: "2201", name: "PPN KELUARAN", type: "Liability", parentCode: "22", parentName: "HUTANG PAJAK", isActive: true, level: 2 },
  { id: "26", code: "2202", name: "PPH 21", type: "Liability", parentCode: "22", parentName: "HUTANG PAJAK", isActive: true, level: 2 },
  { id: "27", code: "23", name: "KEWAJIBAN LAIN-LAIN", type: "Liability", parentCode: "2", parentName: "KEWAJIBAN", isActive: true, level: 1 },
  { id: "28", code: "2301", name: "HUTANG GAJI", type: "Liability", parentCode: "23", parentName: "KEWAJIBAN LAIN-LAIN", isActive: true, level: 2 },
  { id: "29", code: "3", name: "MODAL", type: "Equity", parentCode: "-", parentName: "-", isActive: true, level: 0 },
  { id: "30", code: "31", name: "MODAL USAHA", type: "Equity", parentCode: "3", parentName: "MODAL", isActive: true, level: 1 },
  { id: "31", code: "3101", name: "MODAL DISETOR", type: "Equity", parentCode: "31", parentName: "MODAL USAHA", isActive: true, level: 2 },
  { id: "32", code: "32", name: "LABA DITAHAN", type: "Equity", parentCode: "3", parentName: "MODAL", isActive: true, level: 1 },
  { id: "33", code: "3201", name: "LABA TAHUN BERJALAN", type: "Equity", parentCode: "32", parentName: "LABA DITAHAN", isActive: true, level: 2 },
  { id: "34", code: "4", name: "PENDAPATAN", type: "Revenue", parentCode: "-", parentName: "-", isActive: true, level: 0 },
  { id: "35", code: "41", name: "PENDAPATAN SERVICE", type: "Revenue", parentCode: "4", parentName: "PENDAPATAN", isActive: true, level: 1 },
  { id: "36", code: "4101", name: "PENDAPATAN JASA SERVIS", type: "Revenue", parentCode: "41", parentName: "PENDAPATAN SERVICE", isActive: true, level: 2 },
  { id: "37", code: "4102", name: "PENDAPATAN JASA SPOORING", type: "Revenue", parentCode: "41", parentName: "PENDAPATAN SERVICE", isActive: true, level: 2 },
  { id: "38", code: "4103", name: "PENDAPATAN JASA BALANCING", type: "Revenue", parentCode: "41", parentName: "PENDAPATAN SERVICE", isActive: true, level: 2 },
  { id: "39", code: "42", name: "PENDAPATAN SPAREPART", type: "Revenue", parentCode: "4", parentName: "PENDAPATAN", isActive: true, level: 1 },
  { id: "40", code: "4201", name: "PENJUALAN SPAREPART", type: "Revenue", parentCode: "42", parentName: "PENDAPATAN SPAREPART", isActive: true, level: 2 },
  { id: "41", code: "4202", name: "RETUR PENJUALAN", type: "Revenue", parentCode: "42", parentName: "PENDAPATAN SPAREPART", isActive: true, level: 2 },
  { id: "42", code: "43", name: "PENDAPATAN LAIN-LAIN", type: "Revenue", parentCode: "4", parentName: "PENDAPATAN", isActive: true, level: 1 },
  { id: "43", code: "4301", name: "PENDAPATAN BUNGA BANK", type: "Revenue", parentCode: "43", parentName: "PENDAPATAN LAIN-LAIN", isActive: true, level: 2 },
  { id: "44", code: "5", name: "HARGA POKOK PENJUALAN", type: "Expense", parentCode: "-", parentName: "-", isActive: true, level: 0 },
  { id: "45", code: "51", name: "HPP SPAREPART", type: "Expense", parentCode: "5", parentName: "HARGA POKOK PENJUALAN", isActive: true, level: 1 },
  { id: "46", code: "5101", name: "HPP SPAREPART", type: "Expense", parentCode: "51", parentName: "HPP SPAREPART", isActive: true, level: 2 },
  { id: "47", code: "52", name: "HPP SERVICE", type: "Expense", parentCode: "5", parentName: "HARGA POKOK PENJUALAN", isActive: true, level: 1 },
  { id: "48", code: "5201", name: "HPP JASA SERVICE", type: "Expense", parentCode: "52", parentName: "HPP SERVICE", isActive: true, level: 2 },
  { id: "49", code: "6", name: "BEBAN OPERASIONAL", type: "Expense", parentCode: "-", parentName: "-", isActive: true, level: 0 },
  { id: "50", code: "61", name: "BEBAN GAJI", type: "Expense", parentCode: "6", parentName: "BEBAN OPERASIONAL", isActive: true, level: 1 },
  { id: "51", code: "6101", name: "GAJI KARYAWAN", type: "Expense", parentCode: "61", parentName: "BEBAN GAJI", isActive: true, level: 2 },
  { id: "52", code: "6102", name: "TUNJANGAN", type: "Expense", parentCode: "61", parentName: "BEBAN GAJI", isActive: true, level: 2 },
  { id: "53", code: "62", name: "BEBAN UMUM", type: "Expense", parentCode: "6", parentName: "BEBAN OPERASIONAL", isActive: true, level: 1 },
  { id: "54", code: "6201", name: "BEBAN LISTRIK & AIR", type: "Expense", parentCode: "62", parentName: "BEBAN UMUM", isActive: true, level: 2 },
  { id: "55", code: "6202", name: "BEBAN SEWA", type: "Expense", parentCode: "62", parentName: "BEBAN UMUM", isActive: true, level: 2 },
  { id: "56", code: "6203", name: "BEBAN ATK", type: "Expense", parentCode: "62", parentName: "BEBAN UMUM", isActive: true, level: 2 },
  { id: "57", code: "63", name: "BEBAN PENJUALAN", type: "Expense", parentCode: "6", parentName: "BEBAN OPERASIONAL", isActive: true, level: 1 },
  { id: "58", code: "6301", name: "BEBAN IKLAN", type: "Expense", parentCode: "63", parentName: "BEBAN PENJUALAN", isActive: true, level: 2 },
  { id: "59", code: "64", name: "BEBAN PERBAIKAN", type: "Expense", parentCode: "6", parentName: "BEBAN OPERASIONAL", isActive: true, level: 1 },
  { id: "60", code: "6401", name: "BEBAN PEMELIHARAAN PERALATAN", type: "Expense", parentCode: "64", parentName: "BEBAN PERBAIKAN", isActive: true, level: 2 },
  { id: "61", code: "6402", name: "BEBAN PEMELIHARAAN KENDARAAN", type: "Expense", parentCode: "64", parentName: "BEBAN PERBAIKAN", isActive: true, level: 2 },
  { id: "62", code: "65", name: "BEBAN PENYUSUTAN", type: "Expense", parentCode: "6", parentName: "BEBAN OPERASIONAL", isActive: true, level: 1 },
  { id: "63", code: "6501", name: "BEBAN PENYUSUTAN PERALATAN", type: "Expense", parentCode: "65", parentName: "BEBAN PENYUSUTAN", isActive: true, level: 2 },
  { id: "64", code: "6502", name: "BEBAN PENYUSUTAN KENDARAAN", type: "Expense", parentCode: "65", parentName: "BEBAN PENYUSUTAN", isActive: true, level: 2 },
  { id: "65", code: "66", name: "BEBAN PAJAK", type: "Expense", parentCode: "6", parentName: "BEBAN OPERASIONAL", isActive: true, level: 1 },
  { id: "66", code: "6601", name: "BEBAN PPh 21", type: "Expense", parentCode: "66", parentName: "BEBAN PAJAK", isActive: true, level: 2 },
  { id: "67", code: "6602", name: "BEBAN PPh 23", type: "Expense", parentCode: "66", parentName: "BEBAN PAJAK", isActive: true, level: 2 },
];

const ROWS_PER_PAGE = 20;

export default function COAPage() {
  const router = useRouter();
  const [coaData, setCoaData] = useState<COAAccount[]>(initialCOA);
  const [searchCode, setSearchCode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ code: "", name: "", type: "Asset" as AccountType, parentCode: "" });

  const filtered = useMemo(() => {
    return coaData.filter((acc) => {
      const matchCode = acc.code.toLowerCase().includes(searchCode.toLowerCase());
      const matchName = acc.name.toLowerCase().includes(searchName.toLowerCase());
      const matchType = typeFilter === "All" || acc.type === typeFilter;
      return matchCode && matchName && matchType;
    });
  }, [coaData, searchCode, searchName, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginatedData = filtered.slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE);

  const handleSearch = () => setCurrentPage(1);

  const handleDownload = () => {
    const headers = ["Code", "Account Name", "Account Type", "Parent Account", "Active"];
    const rows = filtered.map((acc) => [acc.code, acc.name, acc.type, acc.parentCode === "-" ? "-" : `${acc.parentCode} - ${acc.parentName}`, acc.isActive ? "Yes" : "No"]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "chart-of-accounts.csv"; a.click();
    URL.revokeObjectURL(url);
  };

  const handleAdd = () => {
    if (!form.code || !form.name) return;
    const parent = coaData.find((a) => a.code === form.parentCode);
    const newAcc: COAAccount = {
      id: Date.now().toString(),
      code: form.code.trim(),
      name: form.name.trim().toUpperCase(),
      type: form.type,
      parentCode: form.parentCode || "-",
      parentName: parent?.name || "-",
      isActive: true,
      level: parent ? parent.level + 1 : 0,
    };
    setCoaData((prev) => [...prev, newAcc]);
    setModalOpen(false);
    setForm({ code: "", name: "", type: "Asset", parentCode: "" });
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <BookIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Chart of Accounts
        </div>
        <div className="flex gap-2">
          <button onClick={handleDownload} className="btn btn--sm"><Download size={14} /> Export</button>
          <button onClick={() => setModalOpen(true)} className="btn btn--brand btn--sm"><Plus size={14} /> Tambah Akun</button>
        </div>
      </div>

      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Code</label>
            <input type="text" className="form-input" placeholder="e.g. 1101" value={searchCode} onChange={(e) => setSearchCode(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Account Name</label>
            <input type="text" className="form-input" placeholder="Search..." value={searchName} onChange={(e) => setSearchName(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Account Type</label>
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as AccountType | "All")}>
              <option value="All">All Types</option>
              {Object.keys(accountTypeConfig).map((t) => <option key={t} value={t}>{accountTypeConfig[t as AccountType].label}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button onClick={handleSearch} className="btn btn--brand btn--sm flex-1 justify-center"><Search size={14} /> Cari</button>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Code</th>
              <th>Account Name</th>
              <th>Account Type</th>
              <th>Parent Account</th>
              <th style={{ textAlign: "center" }}>Active</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((acc) => (
              <tr key={acc.id} className="cursor-pointer hover:bg-[#f0f7ff]" onClick={() => router.push(`/finance/coa/${acc.code}`)}>
                <td className="font-medium" style={{ fontFamily: "monospace" }}>{acc.code}</td>
                <td style={{ paddingLeft: `${16 + acc.level * 20}px` }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
                    {acc.level > 0 && <ChevronRight size={12} style={{ color: "#bbb", flexShrink: 0 }} />}
                    <span style={{ fontWeight: acc.level === 0 ? 600 : 400 }}>{acc.name}</span>
                  </span>
                </td>
                <td>
                  <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: accountTypeConfig[acc.type].color + "15", color: accountTypeConfig[acc.type].color }}>
                    {accountTypeConfig[acc.type].label}
                  </span>
                </td>
                <td className="text-[--color-text-secondary] text-sm">{acc.parentCode === "-" ? "-" : `${acc.parentCode} - ${acc.parentName}`}</td>
                <td style={{ textAlign: "center" }}>{acc.isActive && <Check size={16} color="#2e844a" />}</td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr><td colSpan={5} style={{ textAlign: "center", color: "#8e8f8e", padding: 32 }}>No accounts found</td></tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 12, padding: "16px 0" }}>
          <button disabled={currentPage <= 1} onClick={() => setCurrentPage((p) => Math.max(1, p - 1))} className="btn btn--sm" style={{ color: currentPage <= 1 ? "#d8d8d8" : undefined }}>Prev</button>
          <span style={{ fontSize: 13, color: "#444746" }}>Page {currentPage} of {totalPages}</span>
          <button disabled={currentPage >= totalPages} onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))} className="btn btn--sm" style={{ color: currentPage >= totalPages ? "#d8d8d8" : undefined }}>Next</button>
        </div>
      )}

      {/* Modal Tambah Akun */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setModalOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-lg border border-[--color-border-light]">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between">
              <h2 className="text-base font-bold text-[--color-text-primary]">Tambah Akun Baru</h2>
              <button onClick={() => setModalOpen(false)} className="text-[--color-text-placeholder] hover:text-[--color-text-secondary]"><X className="w-5 h-5" /></button>
            </div>
            <div className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Kode Akun *</label>
                <input type="text" className="form-input" placeholder="e.g. 7101" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Nama Akun *</label>
                <input type="text" className="form-input" placeholder="Contoh: BEBAN TRANSPORTASI" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
              </div>
              <div className="form-group">
                <label className="form-label">Tipe Akun</label>
                <select className="form-select" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value as AccountType })}>
                  {Object.keys(accountTypeConfig).map((t) => <option key={t} value={t}>{accountTypeConfig[t as AccountType].label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Parent Code (Opsional)</label>
                <select className="form-select" value={form.parentCode} onChange={(e) => setForm({ ...form, parentCode: e.target.value })}>
                  <option value="">Tidak Ada</option>
                  {coaData.filter((a) => a.level === 1).map((a) => <option key={a.code} value={a.code}>{a.code} — {a.name}</option>)}
                </select>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-end gap-3">
              <button onClick={() => setModalOpen(false)} className="btn btn--sm">Batal</button>
              <button onClick={handleAdd} className="btn btn--brand btn--sm">Simpan</button>
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
