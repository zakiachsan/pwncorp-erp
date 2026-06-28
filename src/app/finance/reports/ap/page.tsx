"use client";

import { useState } from "react";
import { Search, Download, BarChart3, Star } from "lucide-react";

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

type ColDef = { header: string; key: string; align?: "left" | "right"; render?: (v: any, row: any) => React.ReactNode };

interface TabConfig {
  id: string;
  label: string;
  filters: FilterField[];
  columns: ColDef[];
  data: Record<string, any>[];
}

const TABS: TabConfig[] = [
  /* ── A  Account Payables ──────────────────────────── */
  {
    id: "account-payables",
    label: "Account Payables",
    filters: [
      { label: "Date Option", type: "select", options: ["Invoice Date", "Due Date"], width: "130px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya", "PT Suku Cadang Jaya"], width: "160px" },
      { label: "Status", type: "select", options: ["All", "Approved", "Paid"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Due Date", key: "dueDate" },
      { header: "Supplier", key: "supplier" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      { header: "Tax Ref No.", key: "taxRefNo" },
      {
        header: "Status",
        key: "status",
        render: (v: string) => (
          <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span>
        ),
      },
      { header: "Subtotal", key: "subtotal", align: "right" },
      { header: "Credited", key: "credited", align: "right" },
      { header: "Net Subtotal", key: "netSubtotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Total", key: "total", align: "right" },
      { header: "Paid", key: "paid", align: "right" },
      { header: "Due", key: "due", align: "right" },
    ],
    data: [
      { invoiceDate: "30 Jun 2026", dueDate: "30 Jul 2026", supplier: "PT Auto Parts", docNo: "AP-INV-2026/0030", refNo: "REF-AP030", taxRefNo: "TAX-030", status: "Approved", subtotal: "5.000.000", credited: "0", netSubtotal: "5.000.000", tax: "550.000", total: "5.550.000", paid: "0", due: "5.550.000" },
      { invoiceDate: "29 Jun 2026", dueDate: "29 Jul 2026", supplier: "CV Ban Sehat", docNo: "AP-INV-2026/0029", refNo: "REF-AP029", taxRefNo: "TAX-029", status: "Paid", subtotal: "2.200.000", credited: "0", netSubtotal: "2.200.000", tax: "242.000", total: "2.442.000", paid: "2.442.000", due: "0" },
      { invoiceDate: "28 Jun 2026", dueDate: "28 Jul 2026", supplier: "UD Oli Jaya", docNo: "AP-INV-2026/0028", refNo: "REF-AP028", taxRefNo: "TAX-028", status: "Approved", subtotal: "1.600.000", credited: "500.000", netSubtotal: "1.100.000", tax: "121.000", total: "1.221.000", paid: "0", due: "1.221.000" },
      { invoiceDate: "27 Jun 2026", dueDate: "27 Jul 2026", supplier: "PT Suku Cadang Jaya", docNo: "AP-INV-2026/0027", refNo: "REF-AP027", taxRefNo: "TAX-027", status: "Approved", subtotal: "8.500.000", credited: "0", netSubtotal: "8.500.000", tax: "935.000", total: "9.435.000", paid: "0", due: "9.435.000" },
      { invoiceDate: "25 Jun 2026", dueDate: "25 Jul 2026", supplier: "PT Maju Jaya", docNo: "AP-INV-2026/0026", refNo: "REF-AP026", taxRefNo: "TAX-026", status: "Paid", subtotal: "3.900.000", credited: "0", netSubtotal: "3.900.000", tax: "429.000", total: "4.329.000", paid: "4.329.000", due: "0" },
      { invoiceDate: "24 Jun 2026", dueDate: "24 Jul 2026", supplier: "CV Berkah Abadi", docNo: "AP-INV-2026/0025", refNo: "REF-AP025", taxRefNo: "TAX-025", status: "Approved", subtotal: "1.200.000", credited: "0", netSubtotal: "1.200.000", tax: "132.000", total: "1.332.000", paid: "0", due: "1.332.000" },
      { invoiceDate: "23 Jun 2026", dueDate: "23 Jul 2026", supplier: "PT Auto Parts", docNo: "AP-INV-2026/0024", refNo: "REF-AP024", taxRefNo: "TAX-024", status: "Approved", subtotal: "6.700.000", credited: "1.000.000", netSubtotal: "5.700.000", tax: "627.000", total: "6.327.000", paid: "0", due: "6.327.000" },
      { invoiceDate: "22 Jun 2026", dueDate: "22 Jul 2026", supplier: "CV Ban Sehat", docNo: "AP-INV-2026/0023", refNo: "REF-AP023", taxRefNo: "TAX-023", status: "Paid", subtotal: "900.000", credited: "0", netSubtotal: "900.000", tax: "99.000", total: "999.000", paid: "999.000", due: "0" },
      { invoiceDate: "20 Jun 2026", dueDate: "20 Jul 2026", supplier: "UD Oli Jaya", docNo: "AP-INV-2026/0022", refNo: "REF-AP022", taxRefNo: "TAX-022", status: "Approved", subtotal: "4.100.000", credited: "0", netSubtotal: "4.100.000", tax: "451.000", total: "4.551.000", paid: "1.500.000", due: "3.051.000" },
      { invoiceDate: "19 Jun 2026", dueDate: "19 Jul 2026", supplier: "PT Suku Cadang Jaya", docNo: "AP-INV-2026/0021", refNo: "REF-AP021", taxRefNo: "TAX-021", status: "Paid", subtotal: "7.200.000", credited: "0", netSubtotal: "7.200.000", tax: "792.000", total: "7.992.000", paid: "7.992.000", due: "0" },
      { invoiceDate: "18 Jun 2026", dueDate: "18 Jul 2026", supplier: "PT Maju Jaya", docNo: "AP-INV-2026/0020", refNo: "REF-AP020", taxRefNo: "TAX-020", status: "Approved", subtotal: "2.800.000", credited: "500.000", netSubtotal: "2.300.000", tax: "253.000", total: "2.553.000", paid: "0", due: "2.553.000" },
      { invoiceDate: "17 Jun 2026", dueDate: "17 Jul 2026", supplier: "CV Berkah Abadi", docNo: "AP-INV-2026/0019", refNo: "REF-AP019", taxRefNo: "TAX-019", status: "Approved", subtotal: "5.400.000", credited: "0", netSubtotal: "5.400.000", tax: "594.000", total: "5.994.000", paid: "0", due: "5.994.000" },
      { invoiceDate: "15 Jun 2026", dueDate: "15 Jul 2026", supplier: "PT Auto Parts", docNo: "AP-INV-2026/0018", refNo: "REF-AP018", taxRefNo: "TAX-018", status: "Paid", subtotal: "1.500.000", credited: "0", netSubtotal: "1.500.000", tax: "165.000", total: "1.665.000", paid: "1.665.000", due: "0" },
      { invoiceDate: "14 Jun 2026", dueDate: "14 Jul 2026", supplier: "CV Ban Sehat", docNo: "AP-INV-2026/0017", refNo: "REF-AP017", taxRefNo: "TAX-017", status: "Approved", subtotal: "3.600.000", credited: "0", netSubtotal: "3.600.000", tax: "396.000", total: "3.996.000", paid: "0", due: "3.996.000" },
      { invoiceDate: "13 Jun 2026", dueDate: "13 Jul 2026", supplier: "UD Oli Jaya", docNo: "AP-INV-2026/0016", refNo: "REF-AP016", taxRefNo: "TAX-016", status: "Approved", subtotal: "800.000", credited: "0", netSubtotal: "800.000", tax: "88.000", total: "888.000", paid: "0", due: "888.000" },
      { invoiceDate: "12 Jun 2026", dueDate: "12 Jul 2026", supplier: "PT Suku Cadang Jaya", docNo: "AP-INV-2026/0015", refNo: "REF-AP015", taxRefNo: "TAX-015", status: "Paid", subtotal: "4.800.000", credited: "0", netSubtotal: "4.800.000", tax: "528.000", total: "5.328.000", paid: "5.328.000", due: "0" },
      { invoiceDate: "11 Jun 2026", dueDate: "11 Jul 2026", supplier: "PT Maju Jaya", docNo: "AP-INV-2026/0014", refNo: "REF-AP014", taxRefNo: "TAX-014", status: "Approved", subtotal: "2.500.000", credited: "500.000", netSubtotal: "2.000.000", tax: "220.000", total: "2.220.000", paid: "0", due: "2.220.000" },
      { invoiceDate: "10 Jun 2026", dueDate: "10 Jul 2026", supplier: "CV Berkah Abadi", docNo: "AP-INV-2026/0013", refNo: "REF-AP013", taxRefNo: "TAX-013", status: "Approved", subtotal: "7.800.000", credited: "0", netSubtotal: "7.800.000", tax: "858.000", total: "8.658.000", paid: "2.000.000", due: "6.658.000" },
      { invoiceDate: "09 Jun 2026", dueDate: "09 Jul 2026", supplier: "PT Auto Parts", docNo: "AP-INV-2026/0012", refNo: "REF-AP012", taxRefNo: "TAX-012", status: "Paid", subtotal: "1.100.000", credited: "0", netSubtotal: "1.100.000", tax: "121.000", total: "1.221.000", paid: "1.221.000", due: "0" },
      { invoiceDate: "08 Jun 2026", dueDate: "08 Jul 2026", supplier: "CV Ban Sehat", docNo: "AP-INV-2026/0011", refNo: "REF-AP011", taxRefNo: "TAX-011", status: "Approved", subtotal: "3.450.000", credited: "0", netSubtotal: "3.450.000", tax: "379.500", total: "3.829.500", paid: "1.500.000", due: "2.329.500" },
      { invoiceDate: "07 Jun 2026", dueDate: "07 Jul 2026", supplier: "UD Oli Jaya", docNo: "AP-INV-2026/0010", refNo: "REF-AP010", taxRefNo: "TAX-010", status: "Approved", subtotal: "6.100.000", credited: "0", netSubtotal: "6.100.000", tax: "671.000", total: "6.771.000", paid: "0", due: "6.771.000" },
      { invoiceDate: "06 Jun 2026", dueDate: "06 Jul 2026", supplier: "PT Suku Cadang Jaya", docNo: "AP-INV-2026/0009", refNo: "REF-AP009", taxRefNo: "TAX-009", status: "Paid", subtotal: "2.600.000", credited: "500.000", netSubtotal: "2.100.000", tax: "231.000", total: "2.331.000", paid: "2.331.000", due: "0" },
      { invoiceDate: "05 Jun 2026", dueDate: "05 Jul 2026", supplier: "PT Maju Jaya", docNo: "AP-INV-2026/0008", refNo: "REF-AP008", taxRefNo: "TAX-008", status: "Approved", subtotal: "1.800.000", credited: "0", netSubtotal: "1.800.000", tax: "198.000", total: "1.998.000", paid: "0", due: "1.998.000" },
      { invoiceDate: "04 Jun 2026", dueDate: "04 Jul 2026", supplier: "CV Berkah Abadi", docNo: "AP-INV-2026/0007", refNo: "REF-AP007", taxRefNo: "TAX-007", status: "Paid", subtotal: "4.250.000", credited: "0", netSubtotal: "4.250.000", tax: "467.500", total: "4.717.500", paid: "4.717.500", due: "0" },
      { invoiceDate: "03 Jun 2026", dueDate: "03 Jul 2026", supplier: "PT Auto Parts", docNo: "AP-INV-2026/0006", refNo: "REF-AP006", taxRefNo: "TAX-006", status: "Approved", subtotal: "3.200.000", credited: "0", netSubtotal: "3.200.000", tax: "352.000", total: "3.552.000", paid: "0", due: "3.552.000" },
      { invoiceDate: "02 Jun 2026", dueDate: "02 Jul 2026", supplier: "CV Ban Sehat", docNo: "AP-INV-2026/0005", refNo: "REF-AP005", taxRefNo: "TAX-005", status: "Approved", subtotal: "5.800.000", credited: "1.000.000", netSubtotal: "4.800.000", tax: "528.000", total: "5.328.000", paid: "0", due: "5.328.000" },
      { invoiceDate: "01 Jun 2026", dueDate: "01 Jul 2026", supplier: "UD Oli Jaya", docNo: "AP-INV-2026/0004", refNo: "REF-AP004", taxRefNo: "TAX-004", status: "Paid", subtotal: "1.450.000", credited: "0", netSubtotal: "1.450.000", tax: "159.500", total: "1.609.500", paid: "1.609.500", due: "0" },
      { invoiceDate: "30 May 2026", dueDate: "30 Jun 2026", supplier: "PT Suku Cadang Jaya", docNo: "AP-INV-2026/0003", refNo: "REF-AP003", taxRefNo: "TAX-003", status: "Approved", subtotal: "7.500.000", credited: "0", netSubtotal: "7.500.000", tax: "825.000", total: "8.325.000", paid: "3.000.000", due: "5.325.000" },
      { invoiceDate: "28 May 2026", dueDate: "28 Jun 2026", supplier: "PT Maju Jaya", docNo: "AP-INV-2026/0002", refNo: "REF-AP002", taxRefNo: "TAX-002", status: "Paid", subtotal: "2.100.000", credited: "0", netSubtotal: "2.100.000", tax: "231.000", total: "2.331.000", paid: "2.331.000", due: "0" },
      { invoiceDate: "25 May 2026", dueDate: "25 Jun 2026", supplier: "CV Berkah Abadi", docNo: "AP-INV-2026/0001", refNo: "REF-AP001", taxRefNo: "TAX-001", status: "Approved", subtotal: "4.500.000", credited: "0", netSubtotal: "4.500.000", tax: "495.000", total: "4.995.000", paid: "0", due: "4.995.000" },
    ],
  },

  /* ── B  Invoice Payables ──────────────────────────── */
  {
    id: "invoice-payables",
    label: "Invoice Payables",
    filters: [
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
      { label: "Status", type: "select", options: ["All", "Approved", "Paid"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Entity", key: "entity" },
      { header: "Supplier", key: "supplier" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      { header: "Source Ref Code", key: "sourceRefCode" },
      { header: "Item Description", key: "itemDesc" },
      { header: "Qty", key: "qty", align: "right" },
      { header: "Unit Price", key: "unitPrice", align: "right" },
      { header: "Sub Total", key: "subTotal", align: "right" },
      { header: "Tax", key: "tax", align: "right" },
      { header: "Total", key: "total", align: "right" },
    ],
    data: [
      { invoiceDate: "30 Jun 2026", entity: "PT Pencorp Motor", supplier: "PT Auto Parts", docNo: "INV-AP/2026/030", refNo: "REF-030", sourceRefCode: "SRC-030", itemDesc: "Kampas Rem Depan - Honda Brio", qty: 8, unitPrice: "220.000", subTotal: "1.760.000", tax: "193.600", total: "1.953.600" },
      { invoiceDate: "29 Jun 2026", entity: "PT Pencorp Spare", supplier: "CV Ban Sehat", docNo: "INV-AP/2026/029", refNo: "REF-029", sourceRefCode: "SRC-029", itemDesc: "Filter Oli Mobil - Toyota Avanza", qty: 10, unitPrice: "75.000", subTotal: "750.000", tax: "82.500", total: "832.500" },
      { invoiceDate: "28 Jun 2026", entity: "PT Pencorp Motor", supplier: "UD Oli Jaya", docNo: "INV-AP/2026/028", refNo: "REF-028", sourceRefCode: "SRC-028", itemDesc: "Ban Michelin Pilot Sport 4", qty: 4, unitPrice: "2.800.000", subTotal: "11.200.000", tax: "1.232.000", total: "12.432.000" },
      { invoiceDate: "27 Jun 2026", entity: "PT Pencorp Spare", supplier: "PT Suku Cadang Jaya", docNo: "INV-AP/2026/027", refNo: "REF-027", sourceRefCode: "SRC-027", itemDesc: "Oli Mesin 5W-40 SN Plus", qty: 20, unitPrice: "185.000", subTotal: "3.700.000", tax: "407.000", total: "4.107.000" },
      { invoiceDate: "25 Jun 2026", entity: "PT Pencorp Motor", supplier: "PT Maju Jaya", docNo: "INV-AP/2026/026", refNo: "REF-026", sourceRefCode: "SRC-026", itemDesc: "Busi NGK Iridium", qty: 15, unitPrice: "45.000", subTotal: "675.000", tax: "74.250", total: "749.250" },
      { invoiceDate: "24 Jun 2026", entity: "PT Pencorp Spare", supplier: "CV Berkah Abadi", docNo: "INV-AP/2026/025", refNo: "REF-025", sourceRefCode: "SRC-025", itemDesc: "V-Belt Honda Vario", qty: 12, unitPrice: "85.000", subTotal: "1.020.000", tax: "112.200", total: "1.132.200" },
      { invoiceDate: "23 Jun 2026", entity: "PT Pencorp Motor", supplier: "PT Auto Parts", docNo: "INV-AP/2026/024", refNo: "REF-024", sourceRefCode: "SRC-024", itemDesc: "Master Rem Depan - Yamaha Mio", qty: 6, unitPrice: "320.000", subTotal: "1.920.000", tax: "211.200", total: "2.131.200" },
      { invoiceDate: "22 Jun 2026", entity: "PT Pencorp Spare", supplier: "CV Ban Sehat", docNo: "INV-AP/2026/023", refNo: "REF-023", sourceRefCode: "SRC-023", itemDesc: "Filter Udara - Suzuki Ertiga", qty: 9, unitPrice: "95.000", subTotal: "855.000", tax: "94.050", total: "949.050" },
      { invoiceDate: "20 Jun 2026", entity: "PT Pencorp Motor", supplier: "UD Oli Jaya", docNo: "INV-AP/2026/022", refNo: "REF-022", sourceRefCode: "SRC-022", itemDesc: "Lampu LED H4 Philips", qty: 10, unitPrice: "150.000", subTotal: "1.500.000", tax: "165.000", total: "1.665.000" },
      { invoiceDate: "19 Jun 2026", entity: "PT Pencorp Motor", supplier: "PT Suku Cadang Jaya", docNo: "INV-AP/2026/021", refNo: "REF-021", sourceRefCode: "SRC-021", itemDesc: "Kampas Rem Belakang - Toyota Avanza", qty: 8, unitPrice: "180.000", subTotal: "1.440.000", tax: "158.400", total: "1.598.400" },
      { invoiceDate: "18 Jun 2026", entity: "PT Pencorp Spare", supplier: "PT Maju Jaya", docNo: "INV-AP/2026/020", refNo: "REF-020", sourceRefCode: "SRC-020", itemDesc: "Bearing Roda Depan - Honda Jazz", qty: 7, unitPrice: "275.000", subTotal: "1.925.000", tax: "211.750", total: "2.136.750" },
      { invoiceDate: "17 Jun 2026", entity: "PT Pencorp Motor", supplier: "CV Berkah Abadi", docNo: "INV-AP/2026/019", refNo: "REF-019", sourceRefCode: "SRC-019", itemDesc: "Alternator Rebuilt - Toyota Kijang", qty: 2, unitPrice: "1.250.000", subTotal: "2.500.000", tax: "275.000", total: "2.775.000" },
      { invoiceDate: "15 Jun 2026", entity: "PT Pencorp Spare", supplier: "PT Auto Parts", docNo: "INV-AP/2026/018", refNo: "REF-018", sourceRefCode: "SRC-018", itemDesc: "Shock Breaker Depan - Honda Beat", qty: 5, unitPrice: "410.000", subTotal: "2.050.000", tax: "225.500", total: "2.275.500" },
      { invoiceDate: "14 Jun 2026", entity: "PT Pencorp Motor", supplier: "CV Ban Sehat", docNo: "INV-AP/2026/017", refNo: "REF-017", sourceRefCode: "SRC-017", itemDesc: "Spion Universal Honda Civic", qty: 4, unitPrice: "175.000", subTotal: "700.000", tax: "77.000", total: "777.000" },
      { invoiceDate: "13 Jun 2026", entity: "PT Pencorp Spare", supplier: "UD Oli Jaya", docNo: "INV-AP/2026/016", refNo: "REF-016", sourceRefCode: "SRC-016", itemDesc: "Radiator Coolant - Toyota Innova", qty: 14, unitPrice: "65.000", subTotal: "910.000", tax: "100.100", total: "1.010.100" },
      { invoiceDate: "12 Jun 2026", entity: "PT Pencorp Motor", supplier: "PT Suku Cadang Jaya", docNo: "INV-AP/2026/015", refNo: "REF-015", sourceRefCode: "SRC-015", itemDesc: "Kampas Rem Depan - Honda Brio", qty: 8, unitPrice: "220.000", subTotal: "1.760.000", tax: "193.600", total: "1.953.600" },
      { invoiceDate: "11 Jun 2026", entity: "PT Pencorp Spare", supplier: "PT Maju Jaya", docNo: "INV-AP/2026/014", refNo: "REF-014", sourceRefCode: "SRC-014", itemDesc: "Filter Oli Mobil - Toyota Avanza", qty: 10, unitPrice: "75.000", subTotal: "750.000", tax: "82.500", total: "832.500" },
      { invoiceDate: "10 Jun 2026", entity: "PT Pencorp Motor", supplier: "CV Berkah Abadi", docNo: "INV-AP/2026/013", refNo: "REF-013", sourceRefCode: "SRC-013", itemDesc: "Ban Michelin Pilot Sport 4", qty: 4, unitPrice: "2.800.000", subTotal: "11.200.000", tax: "1.232.000", total: "12.432.000" },
      { invoiceDate: "09 Jun 2026", entity: "PT Pencorp Spare", supplier: "PT Auto Parts", docNo: "INV-AP/2026/012", refNo: "REF-012", sourceRefCode: "SRC-012", itemDesc: "Oli Mesin 5W-40 SN Plus", qty: 20, unitPrice: "185.000", subTotal: "3.700.000", tax: "407.000", total: "4.107.000" },
      { invoiceDate: "08 Jun 2026", entity: "PT Pencorp Motor", supplier: "CV Ban Sehat", docNo: "INV-AP/2026/011", refNo: "REF-011", sourceRefCode: "SRC-011", itemDesc: "Busi NGK Iridium", qty: 15, unitPrice: "45.000", subTotal: "675.000", tax: "74.250", total: "749.250" },
      { invoiceDate: "07 Jun 2026", entity: "PT Pencorp Spare", supplier: "UD Oli Jaya", docNo: "INV-AP/2026/010", refNo: "REF-010", sourceRefCode: "SRC-010", itemDesc: "V-Belt Honda Vario", qty: 12, unitPrice: "85.000", subTotal: "1.020.000", tax: "112.200", total: "1.132.200" },
      { invoiceDate: "06 Jun 2026", entity: "PT Pencorp Motor", supplier: "PT Suku Cadang Jaya", docNo: "INV-AP/2026/009", refNo: "REF-009", sourceRefCode: "SRC-009", itemDesc: "Master Rem Depan - Yamaha Mio", qty: 6, unitPrice: "320.000", subTotal: "1.920.000", tax: "211.200", total: "2.131.200" },
      { invoiceDate: "05 Jun 2026", entity: "PT Pencorp Spare", supplier: "PT Maju Jaya", docNo: "INV-AP/2026/008", refNo: "REF-008", sourceRefCode: "SRC-008", itemDesc: "Filter Udara - Suzuki Ertiga", qty: 9, unitPrice: "95.000", subTotal: "855.000", tax: "94.050", total: "949.050" },
      { invoiceDate: "04 Jun 2026", entity: "PT Pencorp Motor", supplier: "CV Berkah Abadi", docNo: "INV-AP/2026/007", refNo: "REF-007", sourceRefCode: "SRC-007", itemDesc: "Lampu LED H4 Philips", qty: 10, unitPrice: "150.000", subTotal: "1.500.000", tax: "165.000", total: "1.665.000" },
      { invoiceDate: "03 Jun 2026", entity: "PT Pencorp Spare", supplier: "PT Auto Parts", docNo: "INV-AP/2026/006", refNo: "REF-006", sourceRefCode: "SRC-006", itemDesc: "Kampas Rem Belakang - Toyota Avanza", qty: 8, unitPrice: "180.000", subTotal: "1.440.000", tax: "158.400", total: "1.598.400" },
      { invoiceDate: "02 Jun 2026", entity: "PT Pencorp Motor", supplier: "CV Ban Sehat", docNo: "INV-AP/2026/005", refNo: "REF-005", sourceRefCode: "SRC-005", itemDesc: "Bearing Roda Depan - Honda Jazz", qty: 7, unitPrice: "275.000", subTotal: "1.925.000", tax: "211.750", total: "2.136.750" },
      { invoiceDate: "01 Jun 2026", entity: "PT Pencorp Motor", supplier: "UD Oli Jaya", docNo: "INV-AP/2026/004", refNo: "REF-004", sourceRefCode: "SRC-004", itemDesc: "Alternator Rebuilt - Toyota Kijang", qty: 2, unitPrice: "1.250.000", subTotal: "2.500.000", tax: "275.000", total: "2.775.000" },
      { invoiceDate: "30 May 2026", entity: "PT Pencorp Spare", supplier: "PT Suku Cadang Jaya", docNo: "INV-AP/2026/003", refNo: "REF-003", sourceRefCode: "SRC-003", itemDesc: "Shock Breaker Depan - Honda Beat", qty: 5, unitPrice: "410.000", subTotal: "2.050.000", tax: "225.500", total: "2.275.500" },
      { invoiceDate: "28 May 2026", entity: "PT Pencorp Motor", supplier: "PT Maju Jaya", docNo: "INV-AP/2026/002", refNo: "REF-002", sourceRefCode: "SRC-002", itemDesc: "Spion Universal Honda Civic", qty: 4, unitPrice: "175.000", subTotal: "700.000", tax: "77.000", total: "777.000" },
      { invoiceDate: "25 May 2026", entity: "PT Pencorp Spare", supplier: "CV Berkah Abadi", docNo: "INV-AP/2026/001", refNo: "REF-001", sourceRefCode: "SRC-001", itemDesc: "Radiator Coolant - Toyota Innova", qty: 14, unitPrice: "65.000", subTotal: "910.000", tax: "100.100", total: "1.010.100" },
    ],
  },

  /* ── C  AP Aging ──────────────────────────────────── */
  {
    id: "ap-aging",
    label: "AP Aging",
    filters: [
      { label: "Display Mode", type: "select", options: ["Detailed", "Summary"], width: "120px" },
      { label: "Report Date", type: "date", width: "140px" },
      { label: "Group By", type: "select", options: ["Due Date", "Invoice Date"], width: "130px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
    ],
    columns: [
      { header: "Entity", key: "entity" },
      { header: "Supplier Code", key: "supplierCode" },
      { header: "Supplier Name", key: "supplierName" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Reference No.", key: "refNo" },
      { header: "Source Ref Code", key: "sourceRefCode" },
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
      { entity: "PT Pencorp Motor", supplierCode: "SUP-002", supplierName: "CV Ban Sehat", docNo: "AP-INV-2026/0002", refNo: "REF-AP002", sourceRefCode: "SRC-002", invoiceDate: "05 Jun 2026", dueDate: "05 Jul 2026", current: "1.998.000", d1_30: "0", d31_60: "0", d61_90: "0", over90: "0", balance: "1.998.000" },
      { entity: "PT Pencorp Motor", supplierCode: "SUP-001", supplierName: "PT Auto Parts", docNo: "AP-INV-2026/0001", refNo: "REF-AP001", sourceRefCode: "SRC-001", invoiceDate: "01 Jun 2026", dueDate: "01 Jul 2026", current: "4.717.500", d1_30: "0", d31_60: "0", d61_90: "0", over90: "0", balance: "4.717.500" },
      { entity: "PT Pencorp Spare", supplierCode: "SUP-003", supplierName: "UD Oli Jaya", docNo: "AP-INV-2026/0003", refNo: "REF-AP003", sourceRefCode: "SRC-003", invoiceDate: "10 Apr 2026", dueDate: "10 May 2026", current: "0", d1_30: "0", d31_60: "0", d61_90: "2.331.000", over90: "0", balance: "2.331.000" },
      { entity: "PT Pencorp Motor", supplierCode: "SUP-004", supplierName: "PT Suku Cadang Jaya", docNo: "AP-INV-2026/0004", refNo: "REF-AP004", sourceRefCode: "SRC-004", invoiceDate: "01 Feb 2026", dueDate: "03 Mar 2026", current: "0", d1_30: "0", d31_60: "0", d61_90: "0", over90: "6.771.000", balance: "6.771.000" },
    ],
  },

  /* ── D  AP Payments ───────────────────────────────── */
  {
    id: "ap-payments",
    label: "AP Payments",
    filters: [
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
      { label: "Status", type: "select", options: ["All", "Cleared", "Pending"], width: "120px" },
      { label: "Select Account", type: "select", options: ["All Accounts", "BCA - 1234567890", "Mandiri - 0987654321", "BRI - 1122334455"], width: "170px" },
    ],
    columns: [
      { header: "Payment Date", key: "paymentDate" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Payment Reference", key: "payRef" },
      { header: "Invoice/Return", key: "invoiceReturn" },
      { header: "Invoice Reference", key: "invoiceRef" },
      { header: "Invoice Source Ref Code", key: "invoiceSrcRefCode" },
      { header: "Supplier", key: "supplier" },
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
      { paymentDate: "15 Jul 2026", docNo: "PAY-2026/004", payRef: "TRF-BRI-004", invoiceReturn: "AP-INV-2026/0004", invoiceRef: "REF-AP004", invoiceSrcRefCode: "SRC-004", supplier: "PT Suku Cadang Jaya", status: "Cleared", payment: "6.771.000", account: "BRI - 1122334455" },
      { paymentDate: "10 Jul 2026", docNo: "PAY-2026/003", payRef: "TRF-BCA-003", invoiceReturn: "AP-INV-2026/0003", invoiceRef: "REF-AP003", invoiceSrcRefCode: "SRC-003", supplier: "UD Oli Jaya", status: "Pending", payment: "1.200.000", account: "BCA - 1234567890" },
      { paymentDate: "05 Jul 2026", docNo: "PAY-2026/002", payRef: "TRF-MDR-002", invoiceReturn: "AP-INV-2026/0002", invoiceRef: "REF-AP002", invoiceSrcRefCode: "SRC-002", supplier: "CV Ban Sehat", status: "Cleared", payment: "1.998.000", account: "Mandiri - 0987654321" },
      { paymentDate: "01 Jul 2026", docNo: "PAY-2026/001", payRef: "TRF-BCA-001", invoiceReturn: "AP-INV-2026/0001", invoiceRef: "REF-AP001", invoiceSrcRefCode: "SRC-001", supplier: "PT Auto Parts", status: "Cleared", payment: "4.717.500", account: "BCA - 1234567890" },
    ],
  },

  /* ── E  AP Credit ─────────────────────────────────── */
  {
    id: "ap-credit",
    label: "AP Credit",
    filters: [
      { label: "Display Mode", type: "select", options: ["Detailed", "Summary"], width: "120px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
      { label: "Status", type: "select", options: ["All", "Approved", "Draft"], width: "120px" },
    ],
    columns: [
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Entity", key: "entity" },
      { header: "Supplier", key: "supplier" },
      { header: "Supplier Tax", key: "supplierTax" },
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

  /* ── F  AP Overdue ────────────────────────────────── */
  {
    id: "ap-overdue",
    label: "AP Overdue",
    filters: [
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
      { label: "Sort By", type: "select", options: ["Supplier", "Document No"], width: "140px" },
      { label: "Show due date older than 6 months", type: "select", options: ["No", "Yes"], width: "140px" },
    ],
    columns: [
      { header: "Supplier", key: "supplier" },
      { header: "Document No.", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Entity", key: "entity" },
      { header: "Reference No.", key: "refNo" },
      { header: "Source Ref Code", key: "sourceRefCode" },
      { header: "Credit Term (days)", key: "creditTerm", align: "right" },
      { header: "Overdue Days", key: "overdueDays", align: "right" },
      { header: "Date", key: "date" },
      { header: "Due Date", key: "dueDate" },
      { header: "Credit Balance (Rp)", key: "creditBalance", align: "right" },
    ],
    data: [
      { supplier: "PT Auto Parts", docNo: "AP-INV-2026/0010", entity: "PT Pencorp Motor", refNo: "REF-AP010", sourceRefCode: "SRC-010", creditTerm: 30, overdueDays: 15, date: "01 Jun 2026", dueDate: "01 Jul 2026", creditBalance: "3.200.000" },
      { supplier: "PT Suku Cadang Jaya", docNo: "AP-INV-2026/0009", entity: "PT Pencorp Motor", refNo: "REF-AP009", sourceRefCode: "SRC-009", creditTerm: 30, overdueDays: 45, date: "10 May 2026", dueDate: "09 Jun 2026", creditBalance: "6.100.000" },
      { supplier: "UD Oli Jaya", docNo: "AP-INV-2026/0008", entity: "PT Pencorp Spare", refNo: "REF-AP008", sourceRefCode: "SRC-008", creditTerm: 45, overdueDays: 75, date: "01 Apr 2026", dueDate: "16 May 2026", creditBalance: "2.850.000" },
      { supplier: "CV Ban Sehat", docNo: "AP-INV-2026/0007", entity: "PT Pencorp Motor", refNo: "REF-AP007", sourceRefCode: "SRC-007", creditTerm: 30, overdueDays: 95, date: "15 Mar 2026", dueDate: "14 Apr 2026", creditBalance: "4.200.000" },
      { supplier: "PT Auto Parts", docNo: "AP-INV-2026/0006", entity: "PT Pencorp Motor", refNo: "REF-AP006", sourceRefCode: "SRC-006", creditTerm: 30, overdueDays: 120, date: "01 Feb 2026", dueDate: "03 Mar 2026", creditBalance: "7.500.000" },
    ],
  },

  /* ── G  AP Overlimit ──────────────────────────────── */
  {
    id: "ap-overlimit",
    label: "AP Overlimit",
    filters: [
      { label: "Sort By", type: "select", options: ["Supplier", "Credit Limit", "Balance"], width: "140px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
    ],
    columns: [
      { header: "Supplier", key: "supplier" },
      { header: "Credit Limit (Rp)", key: "creditLimit", align: "right" },
      { header: "Purchase Invoices (Rp)", key: "purchaseInvoices", align: "right" },
      { header: "Invoice Payables (Rp)", key: "invoicePayables", align: "right" },
      { header: "Balance (Rp)", key: "balance", align: "right" },
    ],
    data: [],
  },

  /* ── H  AP Subledger ──────────────────────────────── */
  {
    id: "ap-subledger",
    label: "AP Subledger",
    filters: [
      { label: "Invoice Date From", type: "date", width: "140px" },
      { label: "Invoice Date To", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
    ],
    columns: [
      { header: "Entity", key: "entity" },
      { header: "Supplier", key: "supplier" },
      { header: "Invoice No", key: "invoiceNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Invoice Date", key: "invoiceDate" },
      { header: "Net Subtotal (Inc Tax)", key: "netSubtotal", align: "right" },
      { header: "Credited (Inc Tax)", key: "credited", align: "right" },
      { header: "Paid", key: "paid", align: "right" },
      { header: "Due Amount", key: "dueAmount", align: "right" },
      { header: "Paid Date", key: "paidDate" },
    ],
    data: [
      { entity: "PT Pencorp Motor", supplier: "PT Suku Cadang Jaya", invoiceNo: "AP-INV-2026/0004", invoiceDate: "15 Jun 2026", netSubtotal: "6.771.000", credited: "0", paid: "6.771.000", dueAmount: "0", paidDate: "15 Jul 2026" },
      { entity: "PT Pencorp Spare", supplier: "UD Oli Jaya", invoiceNo: "AP-INV-2026/0003", invoiceDate: "10 Jun 2026", netSubtotal: "2.331.000", credited: "500.000", paid: "1.200.000", dueAmount: "631.000", paidDate: "-" },
      { entity: "PT Pencorp Motor", supplier: "CV Ban Sehat", invoiceNo: "AP-INV-2026/0002", invoiceDate: "05 Jun 2026", netSubtotal: "1.998.000", credited: "0", paid: "0", dueAmount: "1.998.000", paidDate: "-" },
      { entity: "PT Pencorp Motor", supplier: "PT Auto Parts", invoiceNo: "AP-INV-2026/0001", invoiceDate: "01 Jun 2026", netSubtotal: "4.717.500", credited: "0", paid: "4.717.500", dueAmount: "0", paidDate: "01 Jul 2026" },
    ],
  },

  /* ── I  AP Cheque/BG ──────────────────────────────── */
  {
    id: "ap-cheque",
    label: "AP Cheque/BG",
    filters: [
      { label: "Date Option", type: "select", options: ["Issued Date", "Payment Date"], width: "130px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"], width: "160px" },
      { label: "Supplier", type: "select", options: ["All Suppliers", "PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya"], width: "160px" },
      { label: "Status", type: "select", options: ["All", "Cleared", "Pending", "Bounced"], width: "120px" },
      { label: "Cheque/BG Number", type: "text", width: "140px" },
      { label: "AP Payment", type: "text", width: "120px" },
    ],
    columns: [
      { header: "Supplier", key: "supplier" },
      { header: "AP Payment", key: "apPayment", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
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
      { header: "Disbursement Date", key: "disbursementDate" },
      { header: "Cheque/BG No.", key: "chequeNo" },
      { header: "Amount Paid", key: "amountPaid", align: "right" },
    ],
    data: [],
  },
];

/* ── component ───────────────────────────────────────────────────── */
export default function APReportsPage() {
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
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#001526", margin: 0 }}>Account Payables</h1>
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
