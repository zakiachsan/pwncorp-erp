"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const soaList = [
  { refCode: "SOA/HO/26060001", customer: "PT Maju Jaya", createdAt: "26 Jun 2026", sentAt: "26 Jun 2026", status: "SENT", totalAmount: 1800000 },
  { refCode: "SOA/HO/26060002", customer: "Budi Santoso", createdAt: "25 Jun 2026", sentAt: "", status: "DRAFT", totalAmount: 2500000 },
  { refCode: "SOA/HO/26060003", customer: "Siti Rahmawati", createdAt: "24 Jun 2026", sentAt: "24 Jun 2026", status: "SENT", totalAmount: 5200000 },
  { refCode: "SOA/HO/26060004", customer: "CV Berkah Abadi", createdAt: "23 Jun 2026", sentAt: "", status: "CANCELLED", totalAmount: 3100000 },
  { refCode: "SOA/HO/26060005", customer: "Ahmad Fauzi", createdAt: "22 Jun 2026", sentAt: "22 Jun 2026", status: "SENT", totalAmount: 950000 },
  { refCode: "SOA/HO/26060006", customer: "PT Transport Jaya", createdAt: "21 Jun 2026", sentAt: "", status: "DRAFT", totalAmount: 4800000 },
];

const statusColor = (s: string) => {
  const map: Record<string, string> = { DRAFT: "#6b7280", SENT: "#2e844a", CANCELLED: "#ea001e" };
  return map[s] || "#6b7280";
};

export default function SOAPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const filtered = soaList.filter((s) => {
    if (statusFilter && s.status !== statusFilter) return false;
    if (search && !s.customer.toLowerCase().includes(search.toLowerCase()) && !s.refCode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0176d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" />
          <path d="M14 2v6h6" />
          <path d="M16 13H8" /><path d="M16 17H8" /><path d="M10 9H8" />
        </svg>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Statement of Accounts</h1>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
        <input
          type="text"
          style={{ ...S.input, width: 200 }}
          placeholder="Ref Code"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <input
          type="text"
          style={{ ...S.input, width: 200 }}
          placeholder="Customer Name"
        />
        <select style={{ ...S.input, width: 150 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="SENT">Sent</option>
          <option value="CANCELLED">Cancelled</option>
        </select>
        <button style={{ ...S.btn, width: "auto", padding: "7px 16px" }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
          Search
        </button>
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 40 }}>No</th>
              <th style={S.th}>Ref. Code</th>
              <th style={S.th}>Customer Name</th>
              <th style={S.th}>Created At</th>
              <th style={S.th}>Sent At</th>
              <th style={S.th}>Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((item, i) => (
              <tr
                key={item.refCode}
                style={{ ...S.tr, cursor: "pointer" }}
                onClick={() => router.push(`/finance/soa/${item.refCode}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              >
                <td style={S.td}>{i + 1}</td>
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{item.refCode}</td>
                <td style={S.td}>{item.customer}</td>
                <td style={S.td}>{item.createdAt}</td>
                <td style={S.td}>{item.sentAt || "-"}</td>
                <td style={S.td}>
                  <span style={{ ...S.pill, background: statusColor(item.status) }}>{item.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  input: {
    padding: "7px 10px", fontSize: 13, border: "1px solid #d8d8d8",
    borderRadius: 6, background: "#fff", color: "#001526", outline: "none",
  },
  btn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "7px 14px",
    fontSize: 12, fontWeight: 500, background: "#0176d3", color: "#fff",
    border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer", width: "100%", justifyContent: "center",
  },
  tableWrap: {
    border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11,
    color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em",
    background: "#f9f9f9", borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff",
  },
  tr: { transition: "background 100ms" },
  pill: {
    display: "inline-block", padding: "2px 8px", borderRadius: 9999,
    fontSize: 10, fontWeight: 600, color: "#fff",
  },
};
