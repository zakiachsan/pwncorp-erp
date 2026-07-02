"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

const serviceInvoices = [
  { docNo: "SRI/001/26060155", swoNo: "SWO/006/26060155", customer: "PT Transport Jaya", invoiceDate: "27-Jun-2026", dueDate: "04-Jul-2026", status: "UNPAID", total: 4800000, amountPaid: 0, amountDue: 4800000 },
  { docNo: "SRI/002/26060152", swoNo: "SWO/003/26060152", customer: "Siti Rahmawati", invoiceDate: "27-Jun-2026", dueDate: "04-Jul-2026", status: "PAID", total: 5200000, amountPaid: 5200000, amountDue: 0 },
  { docNo: "SRI/003/26060150", swoNo: "SWO/002/26060151", customer: "PT Maju Jaya", invoiceDate: "26-Jun-2026", dueDate: "03-Jul-2026", status: "PARTIAL", total: 1800000, amountPaid: 900000, amountDue: 900000 },
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

export default function ServiceInvoicesPage() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState("");

  const filtered = serviceInvoices.filter((inv) => {
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
          <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
          <polyline points="14 2 14 8 20 8" />
          <line x1="16" x2="8" y1="13" y2="13" />
          <line x1="16" x2="8" y1="17" y2="17" />
          <polyline points="10 9 9 9 8 9" />
        </svg>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Service Invoices</h1>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={S.card}>
          <div style={{ fontSize: 12, color: "#444746", marginBottom: 4 }}>Total Invoices</div>
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
              <th style={S.th}>SWO Reference</th>
              <th style={S.th}>Customer</th>
              <th style={S.th}>Invoice Date</th>
              <th style={S.th}>Due Date</th>
              <th style={S.th}>Status</th>
              <th style={{ ...S.th, textAlign: "right" }}>Total</th>
              <th style={{ ...S.th, textAlign: "right" }}>Received</th>
              <th style={{ ...S.th, textAlign: "right" }}>Due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr
                key={inv.docNo}
                style={{ ...S.tr, cursor: "pointer" }}
                onClick={() => router.push(`/finance/invoices/service/${inv.docNo}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              >
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{inv.docNo}</td>
                <td style={S.td}>
                  <span
                    onClick={(e) => { e.stopPropagation(); router.push(`/work-orders/${inv.swoNo}`); }}
                    style={{ color: "#0176d3", fontWeight: 500, cursor: "pointer", textDecoration: "underline", textDecorationColor: "#0176d3" }}
                  >
                    {inv.swoNo}
                  </span>
                </td>
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
