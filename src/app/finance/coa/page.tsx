"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, BookOpen, Wallet, AlertTriangle, Shield } from "lucide-react";

type AccountType = "Aset" | "Liabilitas" | "Modal" | "Pendapatan" | "Beban";

interface COAAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  balance: number;
  isActive: boolean;
}

const formatIDR = (val: number) => {
  if (val < 0) return `(${Math.abs(val).toLocaleString("id-ID")})`;
  return `Rp ${val.toLocaleString("id-ID")}`;
};

const accountTypeConfig: Record<AccountType, { label: string; color: string }> = {
  Aset: { label: "Aset", color: "#0176d3" },
  Liabilitas: { label: "Liabilitas", color: "#ea001e" },
  Modal: { label: "Modal", color: "#2e844a" },
  Pendapatan: { label: "Pendapatan", color: "#8b5cf6" },
  Beban: { label: "Beban", color: "#f59e0b" },
};

const mockCOA: COAAccount[] = [
  // ASET LANCAR
  { id: "1", code: "1101", name: "Kas & Bank", type: "Aset", balance: 15250000, isActive: true },
  { id: "2", code: "110101", name: "Kas Kecil", type: "Aset", balance: 2500000, isActive: true },
  { id: "3", code: "110102", name: "Kas", type: "Aset", balance: 5250000, isActive: true },
  { id: "4", code: "110103", name: "Bank BCA", type: "Aset", balance: 7500000, isActive: true },
  { id: "5", code: "1200", name: "Piutang Usaha", type: "Aset", balance: 4400000, isActive: true },
  { id: "6", code: "1300", name: "Persediaan", type: "Aset", balance: 18750000, isActive: true },
  { id: "7", code: "1400", name: "Perlengkapan Kantor", type: "Aset", balance: 2500000, isActive: true },
  // ASET TETAP
  { id: "8", code: "1501", name: "Peralatan Bengkel", type: "Aset", balance: 45000000, isActive: true },
  { id: "9", code: "1502", name: "Kendaraan", type: "Aset", balance: 85000000, isActive: true },
  { id: "10", code: "1503", name: "Akumulasi Penyusutan", type: "Aset", balance: -25000000, isActive: true },
  // LIABILITAS
  { id: "11", code: "2100", name: "Hutang Usaha", type: "Liabilitas", balance: 5750000, isActive: true },
  { id: "12", code: "2200", name: "Hutang Gaji", type: "Liabilitas", balance: 3000000, isActive: true },
  { id: "13", code: "2300", name: "Hutang Pajak", type: "Liabilitas", balance: 1500000, isActive: true },
  // MODAL
  { id: "14", code: "3100", name: "Modal Disetor", type: "Modal", balance: 25000000, isActive: true },
  { id: "15", code: "3200", name: "Laba Ditahan", type: "Modal", balance: 5650000, isActive: true },
  // PENDAPATAN
  { id: "16", code: "4101", name: "Pendapatan Jasa Servis", type: "Pendapatan", balance: 18500000, isActive: true },
  { id: "17", code: "4102", name: "Pendapatan Sparepart", type: "Pendapatan", balance: 12250000, isActive: true },
  { id: "18", code: "4103", name: "Pendapatan Lain-lain", type: "Pendapatan", balance: 1500000, isActive: true },
  // BEBAN
  { id: "19", code: "5101", name: "Harga Pokok Penjualan", type: "Beban", balance: 15250000, isActive: true },
  { id: "20", code: "6101", name: "Gaji Karyawan", type: "Beban", balance: 5000000, isActive: true },
  { id: "21", code: "6102", name: "Listrik & Air", type: "Beban", balance: 750000, isActive: true },
  { id: "22", code: "6103", name: "Sewa Tempat", type: "Beban", balance: 2000000, isActive: true },
  { id: "23", code: "6104", name: "Peralatan Kantor", type: "Beban", balance: 500000, isActive: true },
];

export default function COAPage() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "All">("All");

  const filtered = useMemo(() => {
    return mockCOA.filter((acc) => {
      const matchSearch = acc.code.toLowerCase().includes(search.toLowerCase()) ||
        acc.name.toLowerCase().includes(search.toLowerCase());
      const matchType = typeFilter === "All" || acc.type === typeFilter;
      return matchSearch && matchType;
    });
  }, [search, typeFilter]);

  const summary = useMemo(() => {
    const totals: Record<AccountType, number> = { Aset: 0, Liabilitas: 0, Modal: 0, Pendapatan: 0, Beban: 0 };
    mockCOA.forEach((acc) => { totals[acc.type] += acc.balance; });
    return totals;
  }, []);

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <BookOpen className="w-6 h-6 text-[--color-brand-secondary]" />
          Akun Perkiraan (COA)
        </div>
        <button className="btn btn--brand btn--sm" onClick={() => router.push("/finance/coa/create")}>
          <Plus size={14} /> Tambah Akun
        </button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        {Object.entries(summary).map(([type, balance]) => (
          <div key={type} className="card-slds">
            <div className="text-sm text-[--color-text-secondary]">{type}</div>
            <div className="text-lg font-bold" style={{ color: accountTypeConfig[type as AccountType].color }}>
              {formatIDR(balance)}
            </div>
          </div>
        ))}
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="form-label">Tipe Akun</label>
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value as any)}>
              <option value="All">All Tipe</option>
              {Object.keys(accountTypeConfig).map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <div className="relative">
              <input
                type="text"
                className="form-input"
                placeholder="Kode / Nama Akun..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-[--color-text-tertiary]" />
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Akun</th>
              <th>Tipe</th>
              <th className="text-right">Saldo</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((acc) => (
              <tr key={acc.id} className="hover:bg-[#f8f8f8] cursor-pointer">
                <td className="font-medium">{acc.code}</td>
                <td>{acc.name}</td>
                <td>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: accountTypeConfig[acc.type].color + "20", color: accountTypeConfig[acc.type].color }}>
                    {acc.type}
                  </span>
                </td>
                <td className="text-right font-medium">{formatIDR(acc.balance)}</td>
                <td>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: acc.isActive ? "#2e844a" : "#6b7280", color: "#fff" }}>
                    {acc.isActive ? "Active" : "Inactive"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
