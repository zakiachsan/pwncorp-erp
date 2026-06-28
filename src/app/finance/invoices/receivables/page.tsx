"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const receivables = [
  { docNo: "IR/SO/26060001", refNo: "INV-001", customer: "Budi Santoso", invoiceDate: "24-Jun-2026", dueDate: "30-Jun-2026", status: "PAID", total: 2500000, amountPaid: 2500000, amountDue: 0, journalNo: "13801161" },
  { docNo: "IR/SO/26060002", refNo: "INV-002", customer: "PT Maju Jaya", invoiceDate: "25-Jun-2026", dueDate: "28-Jun-2026", status: "UNPAID", total: 1800000, amountPaid: 0, amountDue: 1800000, journalNo: "-" },
  { docNo: "IR/SO/26060003", refNo: "INV-003", customer: "Siti Rahmawati", invoiceDate: "26-Jun-2026", dueDate: "02-Jul-2026", status: "PARTIAL", total: 5200000, amountPaid: 2600000, amountDue: 2600000, journalNo: "13801162" },
  { docNo: "IR/SO/26060004", refNo: "INV-004", customer: "Ahmad Fauzi", invoiceDate: "26-Jun-2026", dueDate: "28-Jun-2026", status: "PAID", total: 950000, amountPaid: 950000, amountDue: 0, journalNo: "13801163" },
  { docNo: "IR/SO/26060005", refNo: "INV-005", customer: "PT Transport Jaya", invoiceDate: "26-Jun-2026", dueDate: "30-Jun-2026", status: "DRAFT", total: 4800000, amountPaid: 0, amountDue: 4800000, journalNo: "-" },
];

const fmt = (n: number) => n.toLocaleString("id-ID");

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    DRAFT: "#6b7280",
    UNPAID: "#ea001e",
    PARTIAL: "#f59e0b",
    PAID: "#2e844a",
  };
  return map[s] || "#6b7280";
};

export default function InvoiceReceivablesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = receivables.filter((inv) => {
    if (statusFilter && inv.status !== statusFilter) return false;
    return true;
  });

  const totalReceivable = filtered.reduce((s, x) => s + x.total, 0);
  const totalDue = filtered.reduce((s, x) => s + x.amountDue, 0);
  const totalPaid = filtered.reduce((s, x) => s + x.amountPaid, 0);

  return (
    <div>
      {/* Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 16 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0176d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12V7H5a2 2 0 0 1 0-4h14v4" />
          <path d="M3 5v14a2 2 0 0 0 2 2h16v-5" />
          <path d="M18 12a2 2 0 0 0 0 4h4v-4Z" />
        </svg>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Invoice Receivables</h1>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={S.card}>
          <div style={{ fontSize: 12, color: "#444746", marginBottom: 4 }}>Total Receivables</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#001526" }}>Rp {fmt(totalReceivable)}</div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 12, color: "#444746", marginBottom: 4 }}>Amount Due</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#ea001e" }}>Rp {fmt(totalDue)}</div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 12, color: "#444746", marginBottom: 4 }}>Amount Received</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2e844a" }}>Rp {fmt(totalPaid)}</div>
        </div>
      </div>

      {/* Sub Tabs */}
      <div style={{ display: "flex", gap: 0, marginBottom: 16 }}>
        {(["payables", "receivables"] as const).map((t) => (
          <button
            key={t}
            onClick={() => {
              if (t === "payables") router.push("/finance/invoices/payables");
              else router.push("/finance/invoices/receivables");
            }}
            style={{
              padding: "8px 16px",
              fontSize: 12,
              fontWeight: t === "receivables" ? 600 : 400,
              color: t === "receivables" ? "#fff" : "#444746",
              background: t === "receivables" ? "#0176d3" : "#ecebea",
              border: "none",
              borderRadius: t === "payables" ? "6px 0 0 6px" : "0 6px 6px 0",
              cursor: "pointer",
            }}
          >
            {t === "payables" ? "Payables" : "Receivables"}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
        <select
          style={{ ...S.input, width: 200 }}
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="">All Status</option>
          <option value="DRAFT">Draft</option>
          <option value="UNPAID">Unpaid</option>
          <option value="PARTIAL">Partial</option>
          <option value="PAID">Paid</option>
        </select>
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Document Number</th>
              <th style={S.th}>Reference No</th>
              <th style={S.th}>Customer</th>
              <th style={S.th}>Invoice Date</th>
              <th style={S.th}>Due Date</th>
              <th style={S.th}>Status</th>
              <th style={{ ...S.th, textAlign: "right" }}>Total</th>
              <th style={{ ...S.th, textAlign: "right" }}>Received</th>
              <th style={{ ...S.th, textAlign: "right" }}>Due</th>
              <th style={S.th}>Journal</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr
                key={inv.docNo}
                style={{ ...S.tr, cursor: "pointer" }}
                onClick={() => router.push(`/finance/invoices/${inv.docNo}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              >
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{inv.docNo}</td>
                <td style={S.td}>{inv.refNo}</td>
                <td style={{ ...S.td, color: "#0176d3" }}>{inv.customer}</td>
                <td style={S.td}>{inv.invoiceDate}</td>
                <td style={S.td}>{inv.dueDate}</td>
                <td style={S.td}>
                  <span style={{ ...S.pill, background: statusColor(inv.status) }}>{inv.status}</span>
                </td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(inv.total)}</td>
                <td style={{ ...S.td, textAlign: "right", color: "#2e844a" }}>{fmt(inv.amountPaid)}</td>
                <td style={{ ...S.td, textAlign: "right", color: inv.amountDue > 0 ? "#ea001e" : "#444746", fontWeight: inv.amountDue > 0 ? 600 : 400 }}>
                  {fmt(inv.amountDue)}
                </td>
                <td style={{ ...S.td, color: inv.journalNo !== "-" ? "#0176d3" : "#444746" }}>{inv.journalNo}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: {
    background: "#fff",
    border: "1px solid #ecebea",
    borderRadius: 8,
    padding: 16,
  },
  input: {
    padding: "7px 10px",
    fontSize: 13,
    border: "1px solid #d8d8d8",
    borderRadius: 6,
    background: "#fff",
    color: "#001526",
    outline: "none",
  },
  tableWrap: {
    border: "1px solid #ecebea",
    borderRadius: 8,
    overflow: "hidden",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "10px 12px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 11,
    color: "#444746",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    background: "#f9f9f9",
    borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "10px 12px",
    borderBottom: "1px solid #f0f0f0",
    color: "#001526",
    background: "#fff",
  },
  tr: { transition: "background 100ms" },
  pill: {
    display: "inline-block",
    padding: "2px 8px",
    borderRadius: 9999,
    fontSize: 10,
    fontWeight: 600,
    color: "#fff",
  },
};
