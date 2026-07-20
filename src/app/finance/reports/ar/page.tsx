"use client";

import { useState, useEffect } from "react";
import { Search, Download, BarChart3 } from "lucide-react";

/* ── helpers ──────────────────────────────────────────────────────── */
function fmtRp(n: number): string {
  return "Rp " + n.toLocaleString("id-ID").replace(/,/g, ".");
}

const num = (v: any): number => {
  const n = typeof v === "string" ? parseFloat(v) : v;
  return typeof n === "number" && !isNaN(n) ? n : 0;
};
const fmtNum = (v: any): string => num(v).toLocaleString("id-ID");
const fmtDate = (v: any): string => (v ? new Date(v).toLocaleDateString("id-ID") : "-");
const pick = (o: any, ...keys: string[]): any => {
  if (!o) return undefined;
  for (const k of keys) if (o[k] !== undefined && o[k] !== null) return o[k];
  return undefined;
};
const pickName = (o: any, ...paths: string[]): string => {
  if (!o) return "-";
  for (const p of paths) {
    const v = p.split(".").reduce((a: any, k: string) => (a ? a[k] : undefined), o);
    if (v) return String(v);
  }
  return "-";
};

const statusPillColor = (s: string): string => {
  const map: Record<string, string> = {
    Paid: "#2e844a",
    Approved: "#2e844a",
    Unpaid: "#ea001e",
    Cancelled: "#ea001e",
    Draft: "#6b7280",
    Partial: "#f59e0b",
    Cleared: "#2e844a",
    Pending: "#f59e0b",
    Bounced: "#ea001e",
    Overdue: "#ea001e",
  };
  return map[s] || "#6b7280";
};

/* ── filter / column config per tab ───────────────────────────────── */
type FilterField = {
  label: string;
  type: "text" | "date" | "select";
  options?: string[];
  width?: string;
};

type ColDef = {
  header: string;
  key: string;
  align?: "left" | "right";
  render?: (v: any, row: any) => React.ReactNode;
};

interface TabConfig {
  id: string;
  label: string;
  filters: FilterField[];
  columns: ColDef[];
  data: Record<string, any>[];
}

const CUSTOMERS = [
  "All Customers",
  "PT Maju Jaya",
  "Budi Santoso",
  "Siti Rahmawati",
  "CV Berkah Abadi",
  "Ahmad Fauzi",
  "PT Transport Jaya",
];

const ENTITIES = ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"];

const TABS: TabConfig[] = [
  /* ── A  Account Receivables ──────────────────────────── */
  {
    id: "account-receivables",
    label: "Account Receivables",
    filters: [
      { label: "Date Option", type: "select", options: ["Invoice Date", "Due Date"], width: "130px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Status", type: "select", options: ["All", "Paid", "Unpaid", "Partial"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Due Date", key: "dueDate" },
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Subtotal", key: "subtotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Total", key: "total", align: "right" },
      { header: "Paid", key: "paid", align: "right" },
      { header: "Due", key: "due", align: "right" },
    ],
    data: [],
  },

  /* ── B  Invoice Receivables ──────────────────────────── */
  {
    id: "invoice-receivables",
    label: "Invoice Receivables",
    filters: [
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Status", type: "select", options: ["All", "Paid", "Unpaid", "Partial"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Entity", key: "entity" },
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      { header: "Item Description", key: "itemDesc" },
      { header: "Qty", key: "qty", align: "right" },
      { header: "Unit Price", key: "unitPrice", align: "right" },
      { header: "Sub Total", key: "subTotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Total", key: "total", align: "right" },
    ],
    data: [],
  },

  /* ── C  AR Aging ─────────────────────────────────────── */
  {
    id: "ar-aging",
    label: "AR Aging",
    filters: [
      { label: "Display Mode", type: "select", options: ["Detailed", "Summary"], width: "120px" },
      { label: "Report Date", type: "date", width: "140px" },
      { label: "Group By", type: "select", options: ["Due Date", "Invoice Date"], width: "130px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
    ],
    columns: [
      { header: "Entity", key: "entity" },
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Due Date", key: "dueDate" },
      { header: "Current", key: "current", align: "right" },
      { header: "1-30", key: "d1_30", align: "right" },
      { header: "31-60", key: "d31_60", align: "right" },
      { header: "61-90", key: "d61_90", align: "right" },
      { header: "Over 90", key: "over90", align: "right" },
      { header: "Balance", key: "balance", align: "right" },
    ],
    data: [],
  },

  /* ── D  AR Payments ──────────────────────────────────── */
  {
    id: "ar-payments",
    label: "AR Payments",
    filters: [
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Status", type: "select", options: ["All", "Cleared", "Pending"], width: "120px" },
      { label: "Select Account", type: "select", options: ["All Accounts", "BCA - 1234567890", "Mandiri - 0987654321", "BRI - 1122334455"], width: "170px" },
    ],
    columns: [
      { header: "Payment Date", key: "paymentDate" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Payment Reference", key: "payRef" },
      { header: "Invoice Reference", key: "invoiceRef" },
      { header: "Customer", key: "customer" },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Payment", key: "payment", align: "right" },
      { header: "Account", key: "account" },
    ],
    data: [],
  },

  /* ── E  AR Credit ────────────────────────────────────── */
  {
    id: "ar-credit",
    label: "AR Credit",
    filters: [
      { label: "Display Mode", type: "select", options: ["Detailed", "Summary"], width: "120px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Status", type: "select", options: ["All", "Approved", "Draft"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Entity", key: "entity" },
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Subtotal", key: "subtotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Withholding Tax", key: "wht", align: "right" },
      { header: "Total", key: "total", align: "right" },
    ],
    data: [],
  },

  /* ── F  AR Overdue ───────────────────────────────────── */
  {
    id: "ar-overdue",
    label: "AR Overdue",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Sort By", type: "select", options: ["Customer", "Document No", "Overdue Days"], width: "140px" },
      { label: "Show due date older than 6 months", type: "select", options: ["No", "Yes"], width: "140px" },
    ],
    columns: [
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Entity", key: "entity" },
      { header: "Reference No.", key: "refNo" },
      { header: "Credit Term (days)", key: "creditTerm", align: "right" },
      { header: "Overdue Days", key: "overdueDays", align: "right" },
      { header: "Date", key: "date" },
      { header: "Due Date", key: "dueDate" },
      { header: "Balance (Rp)", key: "balance", align: "right" },
    ],
    data: [],
  },

  /* ── G  AR Overlimit ─────────────────────────────────── */
  {
    id: "ar-overlimit",
    label: "AR Overlimit",
    filters: [
      { label: "Sort By", type: "select", options: ["Customer", "Credit Limit", "Balance"], width: "140px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
    ],
    columns: [
      { header: "Customer", key: "customer" },
      { header: "Credit Limit (Rp)", key: "creditLimit", align: "right" },
      { header: "Sales Invoices (Rp)", key: "salesInvoices", align: "right" },
      { header: "Invoice Receivables (Rp)", key: "invoiceReceivables", align: "right" },
      { header: "Balance (Rp)", key: "balance", align: "right" },
    ],
    data: [],
  },

  /* ── H  AR Subledger ─────────────────────────────────── */
  {
    id: "ar-subledger",
    label: "AR Subledger",
    filters: [
      { label: "Invoice Date From", type: "date", width: "140px" },
      { label: "Invoice Date To", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
    ],
    columns: [
      { header: "Entity", key: "entity" },
      { header: "Customer", key: "customer" },
      { header: "Invoice No", key: "invoiceNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Net Subtotal", key: "netSubtotal", align: "right" },
      { header: "Paid", key: "paid", align: "right" },
      { header: "Due Amount", key: "dueAmount", align: "right" },
      { header: "Paid Date", key: "paidDate" },
    ],
    data: [],
  },

  /* ── I  AR Cheque/BG ─────────────────────────────────── */
  {
    id: "ar-cheque",
    label: "AR Cheque/BG",
    filters: [
      { label: "Date Option", type: "select", options: ["Issued Date", "Payment Date"], width: "130px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Customer", type: "select", options: CUSTOMERS, width: "160px" },
      { label: "Status", type: "select", options: ["All", "Cleared", "Pending", "Bounced"], width: "120px" },
      { label: "Cheque/BG Number", type: "text", width: "140px" },
    ],
    columns: [
      { header: "Customer", key: "customer" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Entity", key: "entity" },
      { header: "Payment Date", key: "paymentDate" },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Issued Date", key: "issuedDate" },
      { header: "Cheque/BG No.", key: "chequeNo" },
      { header: "Amount", key: "amount", align: "right" },
    ],
    data: [],
  },
];

/* ── component ───────────────────────────────────────────────────── */
export default function ARReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [tabData, setTabData] = useState<Record<string, any>[]>([]);
  const [loading, setLoading] = useState(false);
  const cfg = TABS[activeTab];

  useEffect(() => {
    setLoading(true);
    setTabData([]);
    const tabId = TABS[activeTab].id;
    let url = "";
    if (tabId === "account-receivables") url = "/api/accounts-receivable?limit=100";
    else if (tabId === "ar-aging") url = "/api/reports/finance?report=ar-aging";
    else if (tabId === "ar-payments") url = "/api/payments?limit=100";
    else if (tabId === "invoice-receivables") url = "/api/reports/finance?report=invoice-receivables";
    else if (tabId === "ar-credit") url = "/api/reports/finance?report=ar-credit";
    else if (tabId === "ar-overdue") url = "/api/reports/finance?report=ar-overdue";
    else if (tabId === "ar-overlimit") url = "/api/reports/finance?report=ar-overlimit";
    else if (tabId === "ar-subledger") url = "/api/reports/finance?report=ar-subledger";
    else if (tabId === "ar-cheque") url = "/api/reports/finance?report=ar-cheque";

    if (!url) { setLoading(false); return; }

    fetch(url)
      .then((r) => r.json())
      .then((j) => {
        const raw = j.data?.items || j.data || [];
        if (tabId === "account-receivables") {
          setTabData(raw.map((ar: any) => ({
            invoiceDate: "-",
            dueDate: ar.dueDate ? new Date(ar.dueDate).toLocaleDateString("id-ID") : "-",
            customer: ar.customer?.name || "-",
            docNo: ar.invoice?.invNo || "-",
            refNo: "-",
            status: ar.status || "-",
            total: (ar.amount || 0).toLocaleString("id-ID"),
            paid: ((ar.amount || 0) - (ar.balance || 0)).toLocaleString("id-ID"),
            due: (ar.balance || 0).toLocaleString("id-ID"),
          })));
        } else if (tabId === "ar-aging") {
          setTabData(raw.map((ar: any) => ({
            customer: ar.customer?.name || "-",
            docNo: ar.invoice?.invNo || "-",
            dueDate: ar.dueDate ? new Date(ar.dueDate).toLocaleDateString("id-ID") : "-",
            status: ar.status || "-",
            total: (ar.balance || 0).toLocaleString("id-ID"),
          })));
        } else if (tabId === "invoice-receivables") {
          setTabData(raw.map((r: any) => ({
            invoiceDate: fmtDate(pick(r, "invoiceDate", "date")),
            entity: pickName(r, "entity", "store.name", "businessEntity"),
            customer: pickName(r, "customer", "customer.name", "customerName", "invoice.customer.name"),
            docNo: pick(r, "docNo", "documentNo", "invNo", "invoiceNo") || "-",
            refNo: pick(r, "refNo", "referenceNo") || "-",
            itemDesc: pick(r, "itemDesc", "item", "description") || "-",
            qty: fmtNum(pick(r, "qty", "quantity")),
            unitPrice: fmtNum(pick(r, "unitPrice", "unit_price")),
            subTotal: fmtNum(pick(r, "subTotal", "subtotal", "total")),
            tax: fmtNum(pick(r, "tax", "taxAmount")),
            total: fmtNum(pick(r, "total", "grandTotal")),
          })));
        } else if (tabId === "ar-credit") {
          setTabData(raw.map((r: any) => ({
            invoiceDate: fmtDate(pick(r, "invoiceDate", "date")),
            entity: pickName(r, "entity", "store.name", "businessEntity"),
            customer: pickName(r, "customer", "customer.name", "customerName", "invoice.customer.name"),
            docNo: pick(r, "docNo", "documentNo", "invNo", "invoiceNo") || "-",
            status: pick(r, "status") || "-",
            subtotal: fmtNum(pick(r, "subtotal", "subTotal")),
            tax: fmtNum(pick(r, "tax", "taxAmount")),
            wht: fmtNum(pick(r, "wht", "withholdingTax", "withholding")),
            total: fmtNum(pick(r, "total", "grandTotal")),
          })));
        } else if (tabId === "ar-overdue") {
          setTabData(raw.map((r: any) => ({
            customer: pickName(r, "customer", "customer.name", "customerName", "invoice.customer.name"),
            docNo: pick(r, "docNo", "documentNo", "invNo", "invoiceNo", "invoice.invNo") || "-",
            entity: pickName(r, "entity", "store.name", "businessEntity"),
            refNo: pick(r, "refNo", "referenceNo") || "-",
            creditTerm: fmtNum(pick(r, "creditTerm", "creditTermDays", "termDays")),
            overdueDays: fmtNum(pick(r, "overdueDays", "daysOverdue")),
            date: fmtDate(pick(r, "date", "invoiceDate")),
            dueDate: fmtDate(pick(r, "dueDate")),
            balance: fmtNum(pick(r, "balance", "amountDue", "outstanding")),
          })));
        } else if (tabId === "ar-overlimit") {
          setTabData(raw.map((r: any) => ({
            customer: pickName(r, "customer", "customer.name", "customerName"),
            creditLimit: fmtNum(pick(r, "creditLimit")),
            salesInvoices: fmtNum(pick(r, "salesInvoices", "salesInvoiceTotal")),
            invoiceReceivables: fmtNum(pick(r, "invoiceReceivables", "invoiceReceivableTotal")),
            balance: fmtNum(pick(r, "balance", "outstanding")),
          })));
        } else if (tabId === "ar-subledger") {
          setTabData(raw.map((r: any) => ({
            entity: pickName(r, "entity", "store.name", "businessEntity"),
            customer: pickName(r, "customer", "customer.name", "customerName", "invoice.customer.name"),
            invoiceNo: pick(r, "invoiceNo", "invNo", "docNo", "documentNo", "invoice.invNo") || "-",
            invoiceDate: fmtDate(pick(r, "invoiceDate", "date")),
            netSubtotal: fmtNum(pick(r, "netSubtotal", "netSubTotal", "subtotal")),
            paid: fmtNum(pick(r, "paid", "amountPaid", "paidAmount")),
            dueAmount: fmtNum(pick(r, "dueAmount", "balance", "amountDue")),
            paidDate: fmtDate(pick(r, "paidDate", "lastPaidDate")),
          })));
        } else if (tabId === "ar-cheque") {
          setTabData(raw.map((r: any) => ({
            customer: pickName(r, "customer", "customer.name", "customerName"),
            docNo: pick(r, "docNo", "documentNo", "paymentNo", "invNo") || "-",
            entity: pickName(r, "entity", "store.name", "businessEntity"),
            paymentDate: fmtDate(pick(r, "paymentDate")),
            status: pick(r, "status") || "-",
            issuedDate: fmtDate(pick(r, "issuedDate")),
            chequeNo: pick(r, "chequeNo", "chequeNumber", "bgNo") || "-",
            amount: fmtNum(pick(r, "amount", "amountPaid")),
          })));
        } else {
          setTabData(raw);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [activeTab]);

  const displayData = tabData;
  const PER_PAGE = 20;
  const totalPages = Math.ceil(displayData.length / PER_PAGE);
  const pagedData = displayData.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* ── header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 0" }}>
        <BarChart3 size={24} color="#0176d3" />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#001526", margin: 0 }}>Account Receivables</h1>
      </div>

      {/* ── tab bar ── */}
      <div style={{ display: "flex", gap: 0, padding: "16px 24px 0", flexWrap: "wrap" }}>
        {TABS.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(i); setPage(1); }}
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#fff" : "#444746",
                background: isActive ? "#0176d3" : "#ecebea",
                border: "none",
                borderRadius: i === 0 ? "6px 0 0 6px" : i === TABS.length - 1 ? "0 6px 6px 0" : "0",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background .15s, color .15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── filter section ── */}
      <div style={{ margin: "16px 24px", padding: "16px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          {cfg.filters.map((f) => (
            <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: 0.3 }}>
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                >
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === "date" ? (
                <input
                  type={f.type}
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Enter ${f.label}`}
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── action buttons ── */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 18px",
              fontSize: 13,
              fontWeight: 500,
              color: "#444746",
              background: "#fff",
              border: "1px solid #d8d8d8",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* ── data table ── */}
      <div style={{ margin: "0 24px 24px", overflowX: "auto" }}>
        {displayData.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", fontSize: 14, color: "#444746", background: "#f9f9f9", borderRadius: 8, border: "1px solid #ecebea" }}>
            No data available
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#001526" }}>
            <thead>
              <tr>
                {cfg.columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: "10px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#444746",
                      textTransform: "uppercase" as const,
                      letterSpacing: 0.3,
                      background: "#f9f9f9",
                      border: "1px solid #ecebea",
                      textAlign: col.align === "right" ? "right" : "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedData.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: ri % 2 === 1 ? "#fafafa" : "#fff",
                  }}
                >
                  {cfg.columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #ecebea",
                        textAlign: col.align === "right" ? "right" : "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ── pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "16px 0" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 500,
                color: page <= 1 ? "#d8d8d8" : "#444746", background: "#fff",
                border: "1px solid #d8d8d8", borderRadius: 6, cursor: page <= 1 ? "default" : "pointer",
              }}
            >Prev</button>
            <span style={{ fontSize: 12, color: "#444746" }}>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 500,
                color: page >= totalPages ? "#d8d8d8" : "#444746", background: "#fff",
                border: "1px solid #d8d8d8", borderRadius: 6, cursor: page >= totalPages ? "default" : "pointer",
              }}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
