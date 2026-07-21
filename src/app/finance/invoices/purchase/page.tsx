"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Download, ChevronDown } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

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
  const [purchaseInvoices, setPurchaseInvoices] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
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

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.supplier) params.set("supplierId", filters.supplier);
    if (filters.docNo) params.set("search", filters.docNo);
    fetch(`/api/purchase-invoices?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => { setPurchaseInvoices(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load purchase invoices"); setLoading(false); });
  }, [filters.status, filters.supplier, filters.docNo]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  // Client-side filtering for fields not supported by the API
  const filtered = purchaseInvoices.filter((inv: any) => {
    if (filters.refNo && !(inv.po?.poNo || "").toLowerCase().includes(filters.refNo.toLowerCase())) return false;
    if (filters.po && !(inv.po?.poNo || "").toLowerCase().includes(filters.po.toLowerCase())) return false;
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
            {filtered.map((inv: any) => (
              <tr
                key={inv.id}
                style={{ ...S.tr, cursor: "pointer" }}
                onClick={() => router.push(`/finance/invoices/${inv.docNo || inv.id}`)}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              >
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{inv.docNo || inv.id}</td>
                <td style={S.td}>{inv.po?.poNo || "-"}</td>
                <td
                  style={{ ...S.td, color: "#0176d3", cursor: "pointer" }}
                  onClick={(e) => { e.stopPropagation(); router.push(`/inventory/po/${inv.po?.poNo || inv.poId}`); }}
                >{inv.po?.poNo || inv.poId || "-"}</td>
                <td style={S.td}>{inv.createdAt ? new Date(inv.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }) : "-"}</td>
                <td style={S.td}>{inv.date ? new Date(inv.date).toLocaleDateString("en-GB") : "-"}</td>
                <td style={S.td}>{inv.dueDate ? new Date(inv.dueDate).toLocaleDateString("en-GB") : "-"}</td>
                <td style={{ ...S.td, color: "#0176d3" }}>{inv.supplier?.companyName || "-"}</td>
                <td style={S.td}>
                  <span style={{ ...S.pill, background: statusColor(inv.status) }}>{inv.status}</span>
                </td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(inv.total || 0)}</td>
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
