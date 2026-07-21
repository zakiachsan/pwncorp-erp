"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

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
  const [receivables, setReceivables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (statusFilter) params.set("status", statusFilter);
    fetch(`/api/accounts-receivable?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => { setReceivables(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load receivables"); setLoading(false); });
  }, [statusFilter]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const filtered = receivables;
  const totalReceivable = filtered.reduce((s: number, x: any) => s + (x.amount || 0), 0);
  const totalDue = filtered.reduce((s: number, x: any) => s + (x.amount || 0) - (x.paidAmount || 0), 0);
  const totalPaid = filtered.reduce((s: number, x: any) => s + (x.paidAmount || 0), 0);

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
              <th style={S.th}>SRI No</th>
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
            {filtered.map((inv: any) => {
              const amountDue = (inv.amount || 0) - (inv.paidAmount || 0);
              return (
              <tr
                key={inv.id}
                style={{ ...S.tr, cursor: "pointer" }}
                onClick={() => router.push(`/finance/invoices/${inv.invoice?.invNo || inv.id}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              >
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{inv.invoice?.invNo || inv.id}</td>
                <td style={S.td}>
                  <span
                    onClick={(e) => { e.stopPropagation(); router.push(`/finance/invoices/service/${inv.invoice?.invNo}`); }}
                    style={{ color: "#0176d3", fontWeight: 500, cursor: "pointer", textDecoration: "underline", textDecorationColor: "#0176d3" }}
                  >
                    {inv.invoice?.invNo || "-"}
                  </span>
                </td>
                <td style={{ ...S.td, color: "#0176d3" }}>{inv.customer?.name || "-"}</td>
                <td style={S.td}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB") : "-"}</td>
                <td style={S.td}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB") : "-"}</td>
                <td style={S.td}>
                  <span style={{ ...S.pill, background: statusColor(inv.status) }}>{inv.status}</span>
                </td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(inv.amount || 0)}</td>
                <td style={{ ...S.td, textAlign: "right", color: "#2e844a" }}>{fmt(inv.paidAmount || 0)}</td>
                <td style={{ ...S.td, textAlign: "right", color: amountDue > 0 ? "#ea001e" : "#444746", fontWeight: amountDue > 0 ? 600 : 400 }}>
                  {fmt(amountDue)}
                </td>
                <td style={{ ...S.td, color: "#444746" }}>-</td>
              </tr>
              );
            })}
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
