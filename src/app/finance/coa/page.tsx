"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import { Search, Download, ChevronRight, Check } from "lucide-react";

type AccountType = "Asset" | "Liability" | "Equity" | "Revenue" | "Expense";

interface COAAccount {
  id: string;
  code: string;
  name: string;
  type: AccountType;
  parentCode: string;
  parentName: string;
  isActive: boolean;
  level: number; // hierarchy level for indentation
}

const accountTypeConfig: Record<AccountType, { label: string; color: string }> = {
  Asset: { label: "Asset", color: "#0176d3" },
  Liability: { label: "Liability", color: "#ea001e" },
  Equity: { label: "Equity", color: "#8b5cf6" },
  Revenue: { label: "Revenue", color: "#2e844a" },
  Expense: { label: "Expense", color: "#f59e0b" },
};

// Workshop-focused automotive COA data
const coaData: COAAccount[] = [
  // ASSETS (1xxx)
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

  // LIABILITIES (2xxx)
  { id: "21", code: "2", name: "KEWAJIBAN", type: "Liability", parentCode: "-", parentName: "-", isActive: true, level: 0 },
  { id: "22", code: "21", name: "HUTANG DAGANG", type: "Liability", parentCode: "2", parentName: "KEWAJIBAN", isActive: true, level: 1 },
  { id: "23", code: "2101", name: "HUTANG SUPPLIER", type: "Liability", parentCode: "21", parentName: "HUTANG DAGANG", isActive: true, level: 2 },
  { id: "24", code: "22", name: "HUTANG PAJAK", type: "Liability", parentCode: "2", parentName: "KEWAJIBAN", isActive: true, level: 1 },
  { id: "25", code: "2201", name: "PPN KELUARAN", type: "Liability", parentCode: "22", parentName: "HUTANG PAJAK", isActive: true, level: 2 },
  { id: "26", code: "2202", name: "PPH 21", type: "Liability", parentCode: "22", parentName: "HUTANG PAJAK", isActive: true, level: 2 },
  { id: "27", code: "23", name: "KEWAJIBAN LAIN-LAIN", type: "Liability", parentCode: "2", parentName: "KEWAJIBAN", isActive: true, level: 1 },
  { id: "28", code: "2301", name: "HUTANG GAJI", type: "Liability", parentCode: "23", parentName: "KEWAJIBAN LAIN-LAIN", isActive: true, level: 2 },

  // EQUITY (3xxx)
  { id: "29", code: "3", name: "MODAL", type: "Equity", parentCode: "-", parentName: "-", isActive: true, level: 0 },
  { id: "30", code: "31", name: "MODAL USAHA", type: "Equity", parentCode: "3", parentName: "MODAL", isActive: true, level: 1 },
  { id: "31", code: "3101", name: "MODAL DISETOR", type: "Equity", parentCode: "31", parentName: "MODAL USAHA", isActive: true, level: 2 },
  { id: "32", code: "32", name: "LABA DITAHAN", type: "Equity", parentCode: "3", parentName: "MODAL", isActive: true, level: 1 },
  { id: "33", code: "3201", name: "LABA TAHUN BERJALAN", type: "Equity", parentCode: "32", parentName: "LABA DITAHAN", isActive: true, level: 2 },

  // REVENUE (4xxx)
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

  // EXPENSES (5xxx-6xxx)
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
  const [searchCode, setSearchCode] = useState("");
  const [searchName, setSearchName] = useState("");
  const [typeFilter, setTypeFilter] = useState<AccountType | "All">("All");
  const [currentPage, setCurrentPage] = useState(1);

  const filtered = useMemo(() => {
    return coaData.filter((acc) => {
      const matchCode = acc.code.toLowerCase().includes(searchCode.toLowerCase());
      const matchName = acc.name.toLowerCase().includes(searchName.toLowerCase());
      const matchType = typeFilter === "All" || acc.type === typeFilter;
      return matchCode && matchName && matchType;
    });
  }, [searchCode, searchName, typeFilter]);

  const totalPages = Math.ceil(filtered.length / ROWS_PER_PAGE);
  const paginatedData = filtered.slice(
    (currentPage - 1) * ROWS_PER_PAGE,
    currentPage * ROWS_PER_PAGE
  );

  const handleSearch = () => {
    setCurrentPage(1);
  };

  const handleDownload = () => {
    // Build CSV content
    const headers = ["Code", "Account Name", "Account Type", "Parent Account", "Active"];
    const rows = filtered.map((acc) => [
      acc.code,
      acc.name,
      acc.type,
      acc.parentCode === "-" ? "-" : `${acc.parentCode} - ${acc.parentName}`,
      acc.isActive ? "Yes" : "No",
    ]);
    const csv = [headers, ...rows].map((row) => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "chart-of-accounts.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div style={{ padding: "24px", fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif" }}>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px" }}>
        <div>
          <h1 style={{ margin: 0, fontSize: "20px", fontWeight: "600", color: "#001526" }}>
            Chart of Accounts
          </h1>
          <p style={{ margin: "4px 0 0", fontSize: "13px", color: "#444746" }}>
            Total: {filtered.length} accounts
          </p>
        </div>
      </div>

      {/* Search/Filter Bar */}
      <div style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-end",
        padding: "16px",
        background: "#fff",
        border: "1px solid #ecebea",
        borderRadius: "8px",
        marginBottom: "20px",
        flexWrap: "wrap",
      }}>
        <div style={{ flex: "1", minWidth: "120px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#444746", marginBottom: "6px", textTransform: "uppercase" }}>
            Code
          </label>
          <input
            type="text"
            placeholder="e.g. 1101"
            value={searchCode}
            onChange={(e) => setSearchCode(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: "13px",
              border: "1px solid #ecebea",
              borderRadius: "6px",
              outline: "none",
              fontFamily: "monospace",
            }}
          />
        </div>
        <div style={{ flex: "2", minWidth: "180px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#444746", marginBottom: "6px", textTransform: "uppercase" }}>
            Account Name
          </label>
          <input
            type="text"
            placeholder="Search account name..."
            value={searchName}
            onChange={(e) => setSearchName(e.target.value)}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: "13px",
              border: "1px solid #ecebea",
              borderRadius: "6px",
              outline: "none",
            }}
          />
        </div>
        <div style={{ flex: "1", minWidth: "140px" }}>
          <label style={{ display: "block", fontSize: "11px", fontWeight: "600", color: "#444746", marginBottom: "6px", textTransform: "uppercase" }}>
            Account Type
          </label>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value as AccountType | "All")}
            style={{
              width: "100%",
              padding: "8px 12px",
              fontSize: "13px",
              border: "1px solid #ecebea",
              borderRadius: "6px",
              outline: "none",
              background: "#fff",
            }}
          >
            <option value="All">All Types</option>
            {Object.keys(accountTypeConfig).map((t) => (
              <option key={t} value={t}>{accountTypeConfig[t as AccountType].label}</option>
            ))}
          </select>
        </div>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={handleSearch}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#fff",
              background: "#0176d3",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <Search size={14} />
            Search
          </button>
          <button
            onClick={handleDownload}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              padding: "8px 16px",
              fontSize: "13px",
              fontWeight: "500",
              color: "#444746",
              background: "#fff",
              border: "1px solid #ecebea",
              borderRadius: "6px",
              cursor: "pointer",
            }}
          >
            <Download size={14} />
            Download
          </button>
        </div>
      </div>

      {/* Data Table */}
      <div style={{
        background: "#fff",
        border: "1px solid #ecebea",
        borderRadius: "8px",
        overflow: "hidden",
      }}>
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#f5f5f5" }}>
              <th style={thStyle}>Code</th>
              <th style={thStyle}>Account Name</th>
              <th style={thStyle}>Account Type</th>
              <th style={thStyle}>Parent Account</th>
              <th style={{ ...thStyle, textAlign: "center" }}>Active</th>
            </tr>
          </thead>
          <tbody>
            {paginatedData.map((acc, index) => (
              <tr
                key={acc.id}
                onClick={() => router.push(`/finance/coa/${acc.code}`)}
                style={{
                  cursor: "pointer",
                  background: index % 2 === 0 ? "#fff" : "#fafafa",
                  transition: "background 0.15s ease",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "#f0f7ff")}
                onMouseLeave={(e) => (e.currentTarget.style.background = index % 2 === 0 ? "#fff" : "#fafafa")}
              >
                <td style={{ ...tdStyle, fontFamily: "'SF Mono', 'Consolas', monospace", fontWeight: "600", fontSize: "13px" }}>
                  {acc.code}
                </td>
                <td style={{ ...tdStyle, paddingLeft: `${16 + acc.level * 24}px` }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    {acc.level > 0 && (
                      <ChevronRight size={12} style={{ color: "#9ca3af", flexShrink: 0 }} />
                    )}
                    <span style={{ fontSize: acc.level === 0 ? "13px" : "13px", fontWeight: acc.level === 0 ? "600" : "400" }}>
                      {acc.name}
                    </span>
                  </span>
                </td>
                <td style={tdStyle}>
                  <span style={{
                    display: "inline-block",
                    padding: "2px 10px",
                    borderRadius: "9999px",
                    fontSize: "11px",
                    fontWeight: "600",
                    background: accountTypeConfig[acc.type].color + "15",
                    color: accountTypeConfig[acc.type].color,
                  }}>
                    {accountTypeConfig[acc.type].label}
                  </span>
                </td>
                <td style={{ ...tdStyle, color: "#6b7280", fontSize: "12px" }}>
                  {acc.parentCode === "-" ? "-" : `${acc.parentCode} - ${acc.parentName}`}
                </td>
                <td style={{ ...tdStyle, textAlign: "center" }}>
                  {acc.isActive && (
                    <Check size={16} style={{ color: "#2e844a" }} />
                  )}
                </td>
              </tr>
            ))}
            {paginatedData.length === 0 && (
              <tr>
                <td colSpan={5} style={{ padding: "40px", textAlign: "center", color: "#6b7280", fontSize: "13px" }}>
                  No accounts found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginTop: "16px",
        padding: "12px 0",
      }}>
        <span style={{ fontSize: "13px", color: "#6b7280" }}>
          Showing {filtered.length > 0 ? (currentPage - 1) * ROWS_PER_PAGE + 1 : 0} - {Math.min(currentPage * ROWS_PER_PAGE, filtered.length)} of {filtered.length} accounts
        </span>
        <div style={{ display: "flex", gap: "8px" }}>
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            style={{
              padding: "6px 12px",
              fontSize: "13px",
              fontWeight: "500",
              color: currentPage === 1 ? "#d1d5db" : "#444746",
              background: "#fff",
              border: "1px solid #ecebea",
              borderRadius: "6px",
              cursor: currentPage === 1 ? "not-allowed" : "pointer",
            }}
          >
            Prev
          </button>
          <span style={{
            padding: "6px 12px",
            fontSize: "13px",
            fontWeight: "500",
            color: "#444746",
          }}>
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: "6px 12px",
              fontSize: "13px",
              fontWeight: "500",
              color: currentPage === totalPages ? "#d1d5db" : "#444746",
              background: "#fff",
              border: "1px solid #ecebea",
              borderRadius: "6px",
              cursor: currentPage === totalPages ? "not-allowed" : "pointer",
            }}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "11px",
  fontWeight: "600",
  color: "#444746",
  textAlign: "left",
  textTransform: "uppercase",
  letterSpacing: "0.05em",
  borderBottom: "1px solid #ecebea",
};

const tdStyle: React.CSSProperties = {
  padding: "12px 16px",
  fontSize: "13px",
  color: "#001526",
  borderBottom: "1px solid #f3f4f6",
};
