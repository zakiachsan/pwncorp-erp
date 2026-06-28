"use client";

import { useState } from "react";
import { Search, Download, BarChart3 } from "lucide-react";

/* ── helpers ──────────────────────────────────────────────────────── */
function fmtRp(n: number): string {
  return "Rp " + n.toLocaleString("id-ID").replace(/,/g, ".");
}

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
    data: [
      { invoiceDate: "20 Jun 2026", dueDate: "20 Jul 2026", customer: "PT Transport Jaya", docNo: "IR/SO/2026/0005", refNo: "REF-IR005", status: "Paid", subtotal: "12.000.000", tax: "1.320.000", total: "13.320.000", paid: "13.320.000", due: "0" },
      { invoiceDate: "15 Jun 2026", dueDate: "15 Jul 2026", customer: "Ahmad Fauzi", docNo: "IR/SO/2026/0004", refNo: "REF-IR004", status: "Unpaid", subtotal: "1.450.000", tax: "159.500", total: "1.609.500", paid: "0", due: "1.609.500" },
      { invoiceDate: "10 Jun 2026", dueDate: "10 Jul 2026", customer: "CV Berkah Abadi", docNo: "IR/SO/2026/0003", refNo: "REF-IR003", status: "Partial", subtotal: "5.800.000", tax: "638.000", total: "6.438.000", paid: "3.000.000", due: "3.438.000" },
      { invoiceDate: "05 Jun 2026", dueDate: "05 Jul 2026", customer: "Budi Santoso", docNo: "IR/SO/2026/0002", refNo: "REF-IR002", status: "Unpaid", subtotal: "3.200.000", tax: "352.000", total: "3.552.000", paid: "0", due: "3.552.000" },
      { invoiceDate: "01 Jun 2026", dueDate: "01 Jul 2026", customer: "PT Maju Jaya", docNo: "IR/SO/2026/0001", refNo: "REF-IR001", status: "Paid", subtotal: "7.500.000", tax: "825.000", total: "8.325.000", paid: "8.325.000", due: "0" },
    ],
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
    data: [
      { invoiceDate: "08 Jun 2026", entity: "PT Pencorp Motor", customer: "CV Berkah Abadi", docNo: "INV-004", refNo: "REF-IR004", itemDesc: "Mesin Alternator Rebuilt", qty: 1, unitPrice: "3.500.000", subTotal: "3.500.000", tax: "385.000", total: "3.885.000" },
      { invoiceDate: "05 Jun 2026", entity: "PT Pencorp Spare", customer: "Siti Rahmawati", docNo: "INV-003", refNo: "REF-IR003", itemDesc: "Kampas Rem Depan - Toyota Avanza", qty: 2, unitPrice: "450.000", subTotal: "900.000", tax: "99.000", total: "999.000" },
      { invoiceDate: "03 Jun 2026", entity: "PT Pencorp Motor", customer: "Budi Santoso", docNo: "INV-002", refNo: "REF-IR002", itemDesc: "Ban Michelin Pilot Sport 4", qty: 4, unitPrice: "2.800.000", subTotal: "11.200.000", tax: "1.232.000", total: "12.432.000" },
      { invoiceDate: "01 Jun 2026", entity: "PT Pencorp Motor", customer: "PT Maju Jaya", docNo: "INV-001", refNo: "REF-IR001", itemDesc: "Service Ringan + Ganti Oli", qty: 3, unitPrice: "850.000", subTotal: "2.550.000", tax: "280.500", total: "2.830.500" },
    ],
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
    data: [
      { entity: "PT Pencorp Motor", customer: "Budi Santoso", docNo: "IR/SO/2026/0002", refNo: "REF-IR002", invoiceDate: "05 Jun 2026", dueDate: "05 Jul 2026", current: "3.552.000", d1_30: "0", d31_60: "0", d61_90: "0", over90: "0", balance: "3.552.000" },
      { entity: "PT Pencorp Motor", customer: "PT Maju Jaya", docNo: "IR/SO/2026/0001", refNo: "REF-IR001", invoiceDate: "01 Jun 2026", dueDate: "01 Jul 2026", current: "8.325.000", d1_30: "0", d31_60: "0", d61_90: "0", over90: "0", balance: "8.325.000" },
      { entity: "PT Pencorp Spare", customer: "CV Berkah Abadi", docNo: "IR/SO/2026/0003", refNo: "REF-IR003", invoiceDate: "10 Apr 2026", dueDate: "10 May 2026", current: "0", d1_30: "0", d31_60: "0", d61_90: "3.438.000", over90: "0", balance: "3.438.000" },
      { entity: "PT Pencorp Motor", customer: "PT Transport Jaya", docNo: "IR/SO/2026/0005", refNo: "REF-IR005", invoiceDate: "15 Mar 2026", dueDate: "14 Apr 2026", current: "0", d1_30: "0", d31_60: "0", d61_90: "6.438.000", over90: "0", balance: "6.438.000" },
      { entity: "PT Pencorp Motor", customer: "Ahmad Fauzi", docNo: "IR/SO/2026/0004", refNo: "REF-IR004", invoiceDate: "01 Feb 2026", dueDate: "03 Mar 2026", current: "0", d1_30: "0", d31_60: "0", d61_90: "0", over90: "1.609.500", balance: "1.609.500" },
    ],
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
    data: [
      { paymentDate: "15 Jul 2026", docNo: "RCT-2026/004", payRef: "TRF-BRI-004", invoiceRef: "IR/SO/2026/0004", customer: "Ahmad Fauzi", status: "Cleared", payment: "1.609.500", account: "BRI - 1122334455" },
      { paymentDate: "10 Jul 2026", docNo: "RCT-2026/003", payRef: "TRF-BCA-003", invoiceRef: "IR/SO/2026/0005", customer: "PT Transport Jaya", status: "Pending", payment: "5.000.000", account: "BCA - 1234567890" },
      { paymentDate: "05 Jul 2026", docNo: "RCT-2026/002", payRef: "TRF-MDR-002", invoiceRef: "IR/SO/2026/0003", customer: "CV Berkah Abadi", status: "Cleared", payment: "3.000.000", account: "Mandiri - 0987654321" },
      { paymentDate: "01 Jul 2026", docNo: "RCT-2026/001", payRef: "TRF-BCA-001", invoiceRef: "IR/SO/2026/0001", customer: "PT Maju Jaya", status: "Cleared", payment: "8.325.000", account: "BCA - 1234567890" },
    ],
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
    data: [
      { invoiceDate: "10 Jun 2026", entity: "PT Pencorp Spare", customer: "Budi Santoso", docNo: "CN-AR/2026/002", status: "Draft", subtotal: "800.000", tax: "88.000", wht: "40.000", total: "848.000" },
      { invoiceDate: "01 Jun 2026", entity: "PT Pencorp Motor", customer: "PT Maju Jaya", docNo: "CN-AR/2026/001", status: "Approved", subtotal: "1.500.000", tax: "165.000", wht: "75.000", total: "1.590.000" },
    ],
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
    data: [
      { customer: "Ahmad Fauzi", docNo: "IR/SO/2026/0010", entity: "PT Pencorp Motor", refNo: "REF-IR010", creditTerm: 30, overdueDays: 15, date: "01 Jun 2026", dueDate: "01 Jul 2026", balance: "3.200.000" },
      { customer: "CV Berkah Abadi", docNo: "IR/SO/2026/0009", entity: "PT Pencorp Motor", refNo: "REF-IR009", creditTerm: 30, overdueDays: 45, date: "10 May 2026", dueDate: "09 Jun 2026", balance: "6.100.000" },
      { customer: "Siti Rahmawati", docNo: "IR/SO/2026/0008", entity: "PT Pencorp Spare", refNo: "REF-IR008", creditTerm: 45, overdueDays: 75, date: "01 Apr 2026", dueDate: "16 May 2026", balance: "2.850.000" },
      { customer: "Budi Santoso", docNo: "IR/SO/2026/0007", entity: "PT Pencorp Motor", refNo: "REF-IR007", creditTerm: 30, overdueDays: 95, date: "15 Mar 2026", dueDate: "14 Apr 2026", balance: "4.200.000" },
      { customer: "PT Maju Jaya", docNo: "IR/SO/2026/0006", entity: "PT Pencorp Motor", refNo: "REF-IR006", creditTerm: 30, overdueDays: 120, date: "01 Feb 2026", dueDate: "03 Mar 2026", balance: "7.500.000" },
    ],
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
    data: [
      { customer: "PT Maju Jaya", creditLimit: "10.000.000", salesInvoices: "15.500.000", invoiceReceivables: "8.325.000", balance: "7.175.000" },
      { customer: "CV Berkah Abadi", creditLimit: "5.000.000", salesInvoices: "9.800.000", invoiceReceivables: "6.438.000", balance: "3.362.000" },
      { customer: "PT Transport Jaya", creditLimit: "8.000.000", salesInvoices: "13.320.000", invoiceReceivables: "13.320.000", balance: "0" },
    ],
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
    data: [
      { entity: "PT Pencorp Motor", customer: "Ahmad Fauzi", invoiceNo: "IR/SO/2026/0004", invoiceDate: "15 Jun 2026", netSubtotal: "1.609.500", paid: "1.609.500", dueAmount: "0", paidDate: "15 Jul 2026" },
      { entity: "PT Pencorp Spare", customer: "CV Berkah Abadi", invoiceNo: "IR/SO/2026/0003", invoiceDate: "10 Jun 2026", netSubtotal: "6.438.000", paid: "3.000.000", dueAmount: "3.438.000", paidDate: "-" },
      { entity: "PT Pencorp Motor", customer: "Budi Santoso", invoiceNo: "IR/SO/2026/0002", invoiceDate: "05 Jun 2026", netSubtotal: "3.552.000", paid: "0", dueAmount: "3.552.000", paidDate: "-" },
      { entity: "PT Pencorp Motor", customer: "PT Maju Jaya", invoiceNo: "IR/SO/2026/0001", invoiceDate: "01 Jun 2026", netSubtotal: "8.325.000", paid: "8.325.000", dueAmount: "0", paidDate: "01 Jul 2026" },
    ],
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
    data: [
      { customer: "CV Berkah Abadi", docNo: "RCT-2026/007", entity: "PT Pencorp Spare", paymentDate: "10 Jul 2026", status: "Bounced", issuedDate: "05 Jul 2026", chequeNo: "CK-009012", amount: "1.800.000" },
      { customer: "Budi Santoso", docNo: "RCT-2026/006", entity: "PT Pencorp Motor", paymentDate: "05 Jul 2026", status: "Pending", issuedDate: "01 Jul 2026", chequeNo: "BG-005678", amount: "2.500.000" },
      { customer: "PT Maju Jaya", docNo: "RCT-2026/005", entity: "PT Pencorp Motor", paymentDate: "01 Jul 2026", status: "Cleared", issuedDate: "28 Jun 2026", chequeNo: "CK-001234", amount: "5.000.000" },
    ],
  },
];

/* ── component ───────────────────────────────────────────────────── */
export default function ARReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const cfg = TABS[activeTab];
  const PER_PAGE = 20;
  const totalPages = Math.ceil(cfg.data.length / PER_PAGE);
  const pagedData = cfg.data.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
        {cfg.data.length === 0 ? (
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
