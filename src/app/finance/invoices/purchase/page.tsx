"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Download, ChevronDown } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const purchaseInvoices = [
  { docNo: "PI/HO/26050143", refNo: "B2664EQ", po: "PO-001", createdAt: "24-Jun-2026 10:17 AM", invoiceDate: "12-May-2026", dueDate: "11-Jun-2026", supplier: "PT Auto Parts", status: "APPROVED", total: 1280000 },
  { docNo: "PI/HO/26050142", refNo: "B9015BTA", po: "PO-002", createdAt: "24-Jun-2026 10:16 AM", invoiceDate: "12-May-2026", dueDate: "11-Jun-2026", supplier: "CV Ban Sehat", status: "APPROVED", total: 1430000 },
  { docNo: "PI/HO/26060037", refNo: "B1795PQQ", po: "PO-003", createdAt: "15-Jun-2026 04:26 PM", invoiceDate: "13-Jun-2026", dueDate: "13-Jun-2026", supplier: "UD Oli Jaya", status: "PAID", total: 58333 },
  { docNo: "PI/HO/26060036", refNo: "B2295UQ", po: "PO-004", createdAt: "15-Jun-2026 04:25 PM", invoiceDate: "13-Jun-2026", dueDate: "13-Jun-2026", supplier: "PT Auto Parts", status: "PAID", total: 295774 },
  { docNo: "PI/HO/26060035", refNo: "B2295UQ", po: "PO-001", createdAt: "15-Jun-2026 04:24 PM", invoiceDate: "13-Jun-2026", dueDate: "13-Jun-2026", supplier: "CV Ban Sehat", status: "PAID", total: 81647 },
  { docNo: "PI/HO/26060034", refNo: "B9155PQV", po: "PO-002", createdAt: "15-Jun-2026 04:23 PM", invoiceDate: "13-Jun-2026", dueDate: "13-Jun-2026", supplier: "UD Oli Jaya", status: "PAID", total: 8969588 },
  { docNo: "PI/HO/26060033", refNo: "B1087PQF", po: "PO-003", createdAt: "15-Jun-2026 02:10 PM", invoiceDate: "10-Jun-2026", dueDate: "10-Jun-2026", supplier: "PT Auto Parts", status: "PAID", total: 7000000 },
  { docNo: "PI/HO/26060032", refNo: "B1935PSD", po: "PO-004", createdAt: "13-Jun-2026 10:45 AM", invoiceDate: "11-Jun-2026", dueDate: "11-Jun-2026", supplier: "CV Ban Sehat", status: "PAID", total: 604200 },
  { docNo: "PI/HO/26060031", refNo: "B2295UQ", po: "PO-001", createdAt: "13-Jun-2026 10:45 AM", invoiceDate: "11-Jun-2026", dueDate: "11-Jun-2026", supplier: "UD Oli Jaya", status: "PAID", total: 3233020 },
  { docNo: "PI/HO/26060030", refNo: "STOCK ITEM", po: "PO-002", createdAt: "13-Jun-2026 10:44 AM", invoiceDate: "11-Jun-2026", dueDate: "11-Jun-2026", supplier: "PT Auto Parts", status: "PAID", total: 329500 },
  { docNo: "PI/HO/26060029", refNo: "B1212LQ", po: "PO-003", createdAt: "13-Jun-2026 10:41 AM", invoiceDate: "11-Jun-2026", dueDate: "11-Jun-2026", supplier: "CV Ban Sehat", status: "PAID", total: 632794 },
  { docNo: "PI/HO/26060028", refNo: "B2295UQ", po: "PO-004", createdAt: "13-Jun-2026 10:40 AM", invoiceDate: "13-Jun-2026", dueDate: "13-Jun-2026", supplier: "UD Oli Jaya", status: "PAID", total: 30000 },
];

const fmt = (n: number) => n.toLocaleString("id-ID");

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    DRAFT: "#6b7280",
    SUBMITTED: "#f59e0b",
    APPROVED: "#2e844a",
    PAID: "#6b7280",
    CANCELLED: "#ea001e",
  };
  return map[s] || "#6b7280";
};

export default function PurchaseInvoicesPage() {
  const router = useRouter();
  const [filters, setFilters] = useState({
    docNo: "",
    refNo: "",
    po: "",
    fromDate: "",
    toDate: "",
    supplier: "",
    status: "",
  });
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  const filtered = purchaseInvoices.filter((inv) => {
    if (filters.docNo && !inv.docNo.toLowerCase().includes(filters.docNo.toLowerCase())) return false;
    if (filters.refNo && !inv.refNo.toLowerCase().includes(filters.refNo.toLowerCase())) return false;
    if (filters.po && !inv.po.toLowerCase().includes(filters.po.toLowerCase())) return false;
    if (filters.supplier && !inv.supplier.toLowerCase().includes(filters.supplier.toLowerCase())) return false;
    if (filters.status && inv.status !== filters.status) return false;
    return true;
  });

  return (
    <div>
      {/* Page Title */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileIcon />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Purchase Invoices</h1>
        </div>
      </div>

      {/* Filters */}
      <div style={S.filterSection}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 12 }}>
          <div>
            <label style={S.label}>Document Number</label>
            <input
              type="text"
              style={S.input}
              placeholder="PI/HO/..."
              value={filters.docNo}
              onChange={(e) => setFilters({ ...filters, docNo: e.target.value })}
            />
          </div>
          <div>
            <label style={S.label}>Reference No</label>
            <input
              type="text"
              style={S.input}
              placeholder="Ref No..."
              value={filters.refNo}
              onChange={(e) => setFilters({ ...filters, refNo: e.target.value })}
            />
          </div>
          <div>
            <label style={S.label}>Purchase Order</label>
            <input
              type="text"
              style={S.input}
              placeholder="PO/HO/..."
              value={filters.po}
              onChange={(e) => setFilters({ ...filters, po: e.target.value })}
            />
          </div>
          <div>
            <label style={S.label}>Supplier</label>
            <input
              type="text"
              style={S.input}
              placeholder="Supplier..."
              value={filters.supplier}
              onChange={(e) => setFilters({ ...filters, supplier: e.target.value })}
            />
          </div>
          <div>
            <label style={S.label}>Tanggal</label>
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
            />
          </div>
          <div>
            <label style={S.label}>Status</label>
            <select
              style={S.input}
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            >
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SUBMITTED">Submitted</option>
              <option value="APPROVED">Approved</option>
              <option value="PAID">Paid</option>
            </select>
          </div>
          <div>
            <label style={S.label}>&nbsp;</label>
            <button
              onClick={() => setFilters({ docNo: "", refNo: "", po: "", fromDate: "", toDate: "", supplier: "", status: "" })}
              style={{ ...S.btn, background: "#fff", color: "#444746" }}
            >
              Reset
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={S.th}>Document Number</th>
              <th style={S.th}>Reference No</th>
              <th style={S.th}>Purchase Order</th>
              <th style={S.th}>Created At</th>
              <th style={S.th}>Invoice Date</th>
              <th style={S.th}>Due Date</th>
              <th style={S.th}>Supplier</th>
              <th style={S.th}>Status</th>
              <th style={{ ...S.th, textAlign: "right" }}>Total</th>
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
                <td
                  style={{ ...S.td, color: "#0176d3", cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); router.push(`/inventory/po/${inv.po}`); }}
                >{inv.po}</td>
                <td style={S.td}>{inv.createdAt}</td>
                <td style={S.td}>{inv.invoiceDate}</td>
                <td style={S.td}>{inv.dueDate}</td>
                <td style={{ ...S.td, color: "#0176d3" }}>{inv.supplier}</td>
                <td style={S.td}>
                  <span style={{ ...S.pill, background: statusColor(inv.status) }}>{inv.status}</span>
                </td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(inv.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function FileIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0176d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    </svg>
  );
}

const S: Record<string, React.CSSProperties> = {
  filterSection: {
    background: "#fff",
    border: "1px solid #ecebea",
    borderRadius: 8,
    padding: 16,
    marginBottom: 16,
  },
  label: {
    display: "block",
    fontSize: 11,
    fontWeight: 600,
    color: "#444746",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    marginBottom: 4,
  },
  input: {
    width: "100%",
    padding: "7px 10px",
    fontSize: 13,
    border: "1px solid #d8d8d8",
    borderRadius: 6,
    background: "#fff",
    color: "#001526",
    outline: "none",
  },
  btn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "7px 14px",
    fontSize: 12,
    fontWeight: 500,
    background: "#0176d3",
    color: "#fff",
    border: "1px solid #0176d3",
    borderRadius: 6,
    cursor: "pointer",
    width: "100%",
    justifyContent: "center",
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
