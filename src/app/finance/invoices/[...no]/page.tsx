"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, FileText, ChevronRight } from "lucide-react";

const invoiceData: Record<string, any> = {
  "PI/HO/26050143": {
    docNo: "PI/HO/26050143",
    refNo: "B2664EQ",
    taxNo: "-",
    "po": "PO-001",
    supplier: "BUANA AC MOBIL",
    invoiceDate: "12-May-2026",
    dueDate: "11-Jun-2026",
    plannedPaymentDate: "-",
    creditTerm: 30,
    source: "Web",
    status: "APPROVED",
    subtotal: 1153153,
    creditNote: 0,
    tax: 126847,
    total: 1280000,
    amountPaid: 0,
    amountDue: 1280000,
    items: [
      { sku: "DRYER-AC", product: "DRYER", productCode: "DRIER AC BENTUK TABUNG", qty: 1, price: 580000, discount: "0%", amount: 580000 },
      { sku: "EM-F05", product: "OIL COMPRESSOR", productCode: "OLI COMPRESSOR AC", qty: 1, price: 700000, discount: "0%", amount: 700000 },
    ],
  },
  "PI/HO/26050142": {
    docNo: "PI/HO/26050142",
    refNo: "B9015BTA",
    taxNo: "-",
    "po": "PO-001",
    supplier: "BUANA AC MOBIL",
    invoiceDate: "12-May-2026",
    dueDate: "11-Jun-2026",
    plannedPaymentDate: "-",
    creditTerm: 30,
    source: "Web",
    status: "APPROVED",
    subtotal: 1295455,
    creditNote: 0,
    tax: 134545,
    total: 1430000,
    amountPaid: 0,
    amountDue: 1430000,
    items: [
      { sku: "CMP-01", product: "COMPRESSOR KIT", productCode: "KIT KOMPRESOR AC MOBIL", qty: 1, price: 1430000, discount: "0%", amount: 1430000 },
    ],
  },
  "PI/HO/26060037": {
    docNo: "PI/HO/26060037",
    refNo: "B1795PQQ",
    taxNo: "-",
    "po": "PO-003",
    supplier: "ERA JAYA DAIHATSU",
    invoiceDate: "13-Jun-2026",
    dueDate: "13-Jun-2026",
    plannedPaymentDate: "-",
    creditTerm: 0,
    source: "Web",
    status: "PAID",
    subtotal: 52552,
    creditNote: 0,
    tax: 5781,
    total: 58333,
    amountPaid: 58333,
    amountDue: 0,
    items: [
      { sku: "72592-BZ020-E0", product: "HANDLE PUTARAN JOK DEPAN", productCode: "HANDLE PUTAR JOK DEPAN INNOVA OLD", qty: 1, price: 58333, discount: "0%", amount: 58333 },
    ],
  },
  "INV-001": {
    docNo: "INV-001",
    refNo: "SO-001",
    customer: "Budi Santoso",
    invoiceDate: "24-Jun-2026",
    dueDate: "30-Jun-2026",
    status: "PAID",
    subtotal: 2272727,
    tax: 227273,
    total: 2500000,
    amountPaid: 2500000,
    amountDue: 0,
    items: [
      { product: "Service Spooring + Balancing", qty: 1, price: 2272727, discount: "-", amount: 2272727 },
    ],
  },
  "INV-002": {
    docNo: "INV-002",
    refNo: "SO-002",
    customer: "PT Maju Jaya",
    invoiceDate: "25-Jun-2026",
    dueDate: "28-Jun-2026",
    status: "UNPAID",
    subtotal: 1636364,
    tax: 163636,
    total: 1800000,
    amountPaid: 0,
    amountDue: 1800000,
    items: [
      { product: "Ganti Oli Mesin", qty: 1, price: 1636364, discount: "-", amount: 1636364 },
    ],
  },
  "INV-003": {
    docNo: "INV-003",
    refNo: "SO-003",
    customer: "Siti Rahmawati",
    invoiceDate: "26-Jun-2026",
    dueDate: "02-Jul-2026",
    status: "PARTIAL",
    subtotal: 4727273,
    tax: 472727,
    total: 5200000,
    amountPaid: 2600000,
    amountDue: 2600000,
    items: [
      { product: "Service Berkala 10K", qty: 1, price: 4727273, discount: "-", amount: 4727273 },
    ],
  },
  "INV-004": {
    docNo: "INV-004",
    refNo: "SO-005",
    customer: "Ahmad Fauzi",
    invoiceDate: "26-Jun-2026",
    dueDate: "28-Jun-2026",
    status: "PAID",
    subtotal: 863636,
    tax: 86364,
    total: 950000,
    amountPaid: 950000,
    amountDue: 0,
    items: [
      { product: "Ganti Kampas Rem", qty: 1, price: 863636, discount: "-", amount: 863636 },
    ],
  },
  "INV-005": {
    docNo: "INV-005",
    refNo: "SO-006",
    customer: "PT Transport Jaya",
    invoiceDate: "26-Jun-2026",
    dueDate: "30-Jun-2026",
    status: "DRAFT",
    subtotal: 4363636,
    tax: 436364,
    total: 4800000,
    amountPaid: 0,
    amountDue: 4800000,
    items: [
      { product: "Overhaul Mesin", qty: 1, price: 4363636, discount: "-", amount: 4363636 },
    ],
  },
  "IR/SO/26060001": {
    docNo: "IR/SO/26060001",
    refNo: "INV-001",
    customer: "Budi Santoso",
    invoiceDate: "24-Jun-2026",
    dueDate: "30-Jun-2026",
    status: "PAID",
    total: 2500000,
    amountPaid: 2500000,
    amountDue: 0,
    journalNo: "13801161",
    items: [],
  },
  "IR/SO/26060002": {
    docNo: "IR/SO/26060002",
    refNo: "INV-002",
    customer: "PT Maju Jaya",
    invoiceDate: "25-Jun-2026",
    dueDate: "28-Jun-2026",
    status: "UNPAID",
    total: 1800000,
    amountPaid: 0,
    amountDue: 1800000,
    journalNo: "-",
    items: [],
  },
  "IR/SO/26060003": {
    docNo: "IR/SO/26060003",
    refNo: "INV-003",
    customer: "Siti Rahmawati",
    invoiceDate: "26-Jun-2026",
    dueDate: "02-Jul-2026",
    status: "PARTIAL",
    total: 5200000,
    amountPaid: 2600000,
    amountDue: 2600000,
    journalNo: "13801162",
    items: [],
  },
  "IR/SO/26060004": {
    docNo: "IR/SO/26060004",
    refNo: "INV-004",
    customer: "Ahmad Fauzi",
    invoiceDate: "26-Jun-2026",
    dueDate: "28-Jun-2026",
    status: "PAID",
    total: 950000,
    amountPaid: 950000,
    amountDue: 0,
    journalNo: "13801163",
    items: [],
  },
  "IR/SO/26060005": {
    docNo: "IR/SO/26060005",
    refNo: "INV-005",
    customer: "PT Transport Jaya",
    invoiceDate: "26-Jun-2026",
    dueDate: "30-Jun-2026",
    status: "DRAFT",
    total: 4800000,
    amountPaid: 0,
    amountDue: 4800000,
    journalNo: "-",
    items: [],
  },
};

// Default fallback for any docNo
const defaultInvoice = (docNo: string) => ({
  docNo,
  refNo: "-",
  supplier: "-",
  customer: "-",
  invoiceDate: "-",
  dueDate: "-",
  status: "DRAFT",
  subtotal: 0,
  creditNote: 0,
  tax: 0,
  total: 0,
  amountPaid: 0,
  amountDue: 0,
  items: [],
});

const fmt = (n: number) => n.toLocaleString("id-ID");

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    DRAFT: "#6b7280",
    SUBMITTED: "#f59e0b",
    APPROVED: "#2e844a",
    PAID: "#6b7280",
    UNPAID: "#ea001e",
    PARTIAL: "#f59e0b",
    CANCELLED: "#ea001e",
  };
  return map[s] || "#6b7280";
};

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();

  // Catch-all: join array segments back together
  const noArray = params.no as string[];
  const invoiceNo = Array.isArray(noArray) ? noArray.join("/") : (noArray || "");

  const inv = invoiceData[invoiceNo] || defaultInvoice(invoiceNo);

  const isPurchase = invoiceNo.startsWith("PI/");
  const isReceivable = invoiceNo.startsWith("IR/");

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Back button */}
      <button onClick={() => router.back()} style={S.backBtn}>
        <ArrowLeft size={16} /> {isPurchase ? "Purchase Invoices" : isReceivable ? "Invoice Receivables" : "Invoices"}
      </button>

      {/* Title & Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={20} style={{ color: "#0176d3" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>
            {isPurchase ? "Purchase Invoice" : isReceivable ? "Invoice Receivable" : "Invoice"} ({invoiceNo})
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
        {/* Left Column */}
        <div>
          <F label="DOCUMENT NUMBER" value={inv.docNo} />
          <F label={isPurchase ? "REFERENCE NUMBER" : "REFERENCE NO"} value={inv.refNo} />
          {isPurchase && inv.taxNo && <F label="TAX NUMBER" value={inv.taxNo} />}
          {isPurchase && <F label="PURCHASE ORDER" value={inv.po || "-"} link onClick={() => router.push(`/inventory/po/${inv.po}`)} />}
          <F label={isPurchase ? "SUPPLIER" : "CUSTOMER"} value={isPurchase ? inv.supplier : inv.customer || "-"} link />
          <F label="INVOICE DATE" value={inv.invoiceDate} />
          <F label="DUE DATE" value={inv.dueDate} />
          {isPurchase && <F label="CREDIT TERM (DAYS)" value={String(inv.creditTerm || 0)} />}
          {isPurchase && <F label="SOURCE" value={inv.source || "Web"} />}
        </div>
        {/* Right Column */}
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Amounts (IDR)</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#444746" }}>SubTotal</span>
              <span style={{ fontWeight: 500 }}>{fmt(inv.subtotal || 0)}</span>
            </div>
            {isPurchase && (
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
                <span style={{ color: "#444746" }}>Credit Note</span>
                <span style={{ fontWeight: 500 }}>({fmt(inv.creditNote || 0)})</span>
              </div>
            )}
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#444746" }}>Tax</span>
              <span style={{ fontWeight: 500 }}>{fmt(inv.tax || 0)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, borderTop: "1px solid #ecebea", paddingTop: 8, marginTop: 4 }}>
              <span>Total</span>
              <span>{fmt(inv.total)}</span>
            </div>
          </div>

          <div style={{ marginTop: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Payments (IDR)</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#444746" }}>Amount Due</span>
              <span style={{ fontWeight: 500, color: inv.amountDue > 0 ? "#ea001e" : "#2e844a" }}>{fmt(inv.amountDue)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#444746" }}>Amount Paid</span>
              <span style={{ fontWeight: 500, color: "#2e844a" }}>{fmt(inv.amountPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      {inv.items && inv.items.length > 0 && (
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Invoice Items</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  {isPurchase && <th style={S.th}>SKU</th>}
                  <th style={S.th}>Product</th>
                  {isPurchase && <th style={S.th}>Product Code</th>}
                  <th style={{ ...S.th, textAlign: "right" }}>Quantity</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Price (IDR)</th>
                  <th style={{ ...S.th, textAlign: "center" }}>Discount</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Amount (IDR)</th>
                </tr>
              </thead>
              <tbody>
                {inv.items.map((item: any, i: number) => (
                  <tr key={i} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    {isPurchase && <td style={{ ...S.td, color: "#0176d3" }}>{item.sku}</td>}
                    <td style={S.td}>{item.product}</td>
                    {isPurchase && <td style={S.td}>{item.productCode}</td>}
                    <td style={{ ...S.td, textAlign: "right" }}>{item.qty}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.price)}</td>
                    <td style={{ ...S.td, textAlign: "center" }}>{item.discount}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f3f3f3", fontWeight: 700 }}>
                  <td colSpan={isPurchase ? 3 : 1} style={S.td}>TOTAL</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{inv.items.reduce((s: number, x: any) => s + x.qty, 0)}</td>
                  <td colSpan={2} style={S.td}></td>
                  <td style={{ ...S.td, textAlign: "right" }}>{fmt(inv.total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, link = false, onClick }: { label: string; value: string; link?: boolean; onClick?: () => void }) {
  return (
    <div style={{ marginBottom: 10, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526", display: "flex", alignItems: "center", gap: 4 }}>
        {value}
        {link && <ChevronRight size={13} style={{ color: "#0176d3" }} />}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
    fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  tableWrap: {
    border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "8px 10px", textAlign: "left", fontWeight: 600,
    fontSize: 11, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em",
    background: "#f9f9f9", borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff",
  },
  tr: { transition: "background 100ms" },
};
