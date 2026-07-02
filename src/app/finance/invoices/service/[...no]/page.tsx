"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, FileText, ChevronRight } from "lucide-react";

const sriData: Record<string, any> = {
  "SRI/001/26060155": {
    docNo: "SRI/001/26060155",
    swoNo: "SWO/006/26060155",
    soNo: "SRO/006/26060155",
    customer: "PT Transport Jaya",
    invoiceDate: "27-Jun-2026",
    dueDate: "04-Jul-2026",
    status: "UNPAID",
    subtotal: 4363636,
    tax: 436364,
    total: 4800000,
    amountPaid: 0,
    amountDue: 4800000,
    items: [
      { service: "F1 - Overhaul", description: "Overhaul Mesin", qty: 1, price: 4363636, discount: "-", amount: 4363636 },
    ],
  },
  "SRI/002/26060152": {
    docNo: "SRI/002/26060152",
    swoNo: "SWO/003/26060152",
    soNo: "SRO/003/26060152",
    customer: "Siti Rahmawati",
    invoiceDate: "27-Jun-2026",
    dueDate: "04-Jul-2026",
    status: "PAID",
    subtotal: 4727273,
    tax: 472727,
    total: 5200000,
    amountPaid: 5200000,
    amountDue: 0,
    items: [
      { service: "C1 - Service Berkala 10K", description: "Service Umum", qty: 1, price: 4727273, discount: "-", amount: 4727273 },
    ],
  },
  "SRI/003/26060150": {
    docNo: "SRI/003/26060150",
    swoNo: "SWO/002/26060151",
    soNo: "SRO/002/26060150",
    customer: "PT Maju Jaya",
    invoiceDate: "26-Jun-2026",
    dueDate: "03-Jul-2026",
    status: "PARTIAL",
    subtotal: 1636364,
    tax: 163636,
    total: 1800000,
    amountPaid: 900000,
    amountDue: 900000,
    items: [
      { service: "A1 - Ganti Oli Mesin", description: "Ganti Oli", qty: 1, price: 1636364, discount: "-", amount: 1636364 },
    ],
  },
  "SRI/004/26060149": {
    docNo: "SRI/004/26060149",
    swoNo: "SWO/001/26060149",
    soNo: "SRO/001/26060149",
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
      { service: "A3 - Spooring Mobil Kelas I", description: "Spooring", qty: 1, price: 2272727, discount: "-", amount: 2272727 },
    ],
  },
  "SRI/005/26060154": {
    docNo: "SRI/005/26060154",
    swoNo: "SWO/005/26060154",
    soNo: "SRO/005/26060154",
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
      { service: "E1 - Rem Mobil", description: "Ganti Kampas Rem", qty: 1, price: 863636, discount: "-", amount: 863636 },
    ],
  },
};

const defaultInvoice = (docNo: string) => ({
  docNo,
  swoNo: "-",
  soNo: "-",
  customer: "-",
  invoiceDate: "-",
  dueDate: "-",
  status: "DRAFT",
  subtotal: 0,
  tax: 0,
  total: 0,
  amountPaid: 0,
  amountDue: 0,
  items: [],
});

const fmt = (n: number) => n.toLocaleString("id-ID");

// SWO reference data: created date + status
const swoRefData: Record<string, { createdDate: string; status: string }> = {
  "SWO/006/26060155": { createdDate: "25-Jun-2026 08:00 AM", status: "IN PROGRESS" },
  "SWO/003/26060152": { createdDate: "26-Jun-2026 09:00 AM", status: "COMPLETED" },
  "SWO/002/26060151": { createdDate: "26-Jun-2026 10:45 AM", status: "IN PROGRESS" },
  "SWO/001/26060149": { createdDate: "24-Jun-2026 04:42 PM", status: "IN PROGRESS" },
  "SWO/005/26060154": { createdDate: "26-Jun-2026 11:00 AM", status: "COMPLETED" },
};

// SO reference data: created date + status
const soRefData: Record<string, { createdDate: string; status: string }> = {
  "SRO/006/26060155": { createdDate: "24-Jun-2026 02:30 PM", status: "APPROVED" },
  "SRO/003/26060152": { createdDate: "25-Jun-2026 09:00 AM", status: "APPROVED" },
  "SRO/002/26060150": { createdDate: "25-Jun-2026 10:30 AM", status: "APPROVED" },
  "SRO/001/26060149": { createdDate: "24-Jun-2026 02:00 PM", status: "APPROVED" },
  "SRO/005/26060154": { createdDate: "26-Jun-2026 10:00 AM", status: "APPROVED" },
};

const woStatusColor = (s: string) => {
  const map: Record<string, string> = {
    DRAFT: "#6b7280", "IN PROGRESS": "#0176d3", QC: "#8b5cf6", COMPLETED: "#2e844a", CANCELLED: "#ea001e",
  };
  return map[s] || "#6b7280";
};

const soStatusColor = (s: string) => {
  const map: Record<string, string> = {
    DRAFT: "#fe9339", APPROVED: "#2e844a", CANCELLED: "#ea001e",
  };
  return map[s] || "#6b7280";
};

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    DRAFT: "#6b7280",
    UNPAID: "#ea001e",
    PARTIAL: "#f59e0b",
    PAID: "#2e844a",
  };
  return map[s] || "#6b7280";
};

export default function ServiceInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();

  const noArray = params.no as string[];
  const invoiceNo = Array.isArray(noArray) ? noArray.join("/") : (noArray || "");
  const inv = sriData[invoiceNo] || defaultInvoice(invoiceNo);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Back button */}
      <button onClick={() => router.push("/finance/invoices/service")} style={S.backBtn}>
        <ArrowLeft size={16} /> Service Invoices
      </button>

      {/* Title & Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={20} style={{ color: "#0176d3" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>
            Service Invoice ({invoiceNo})
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
          
          {/* SWO Reference with table */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>SWO REFERENCE</div>
            <div style={S.miniTableWrap}>
              <table style={S.miniTable}>
                <thead>
                  <tr>
                    <th style={S.miniTh}>Document Number</th>
                    <th style={S.miniTh}>Created Date</th>
                    <th style={S.miniTh}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {swoRefData[inv.swoNo] ? (
                    <tr
                      style={{ ...S.tr, cursor: "pointer" }}
                      onClick={() => router.push(`/work-orders/${inv.swoNo}`)}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                    >
                      <td style={{ ...S.miniTd, color: "#0176d3", fontWeight: 500 }}>{inv.swoNo}</td>
                      <td style={S.miniTd}>{swoRefData[inv.swoNo].createdDate}</td>
                      <td style={S.miniTd}>
                        <span style={{ ...S.pill, background: woStatusColor(swoRefData[inv.swoNo].status) }}>{swoRefData[inv.swoNo].status}</span>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td style={S.miniTd} colSpan={3}>
                        <span style={{ color: "#444746", fontSize: 13 }}>{inv.swoNo}</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Service Order with table */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>SERVICE ORDER</div>
            <div style={S.miniTableWrap}>
              <table style={S.miniTable}>
                <thead>
                  <tr>
                    <th style={S.miniTh}>Document Number</th>
                    <th style={S.miniTh}>Created Date</th>
                    <th style={S.miniTh}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {soRefData[inv.soNo] ? (
                    <tr
                      style={{ ...S.tr, cursor: "pointer" }}
                      onClick={() => router.push(`/service-orders/${inv.soNo}`)}
                      onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                      onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
                    >
                      <td style={{ ...S.miniTd, color: "#0176d3", fontWeight: 500 }}>{inv.soNo}</td>
                      <td style={S.miniTd}>{soRefData[inv.soNo].createdDate}</td>
                      <td style={S.miniTd}>
                        <span style={{ ...S.pill, background: soStatusColor(soRefData[inv.soNo].status) }}>{soRefData[inv.soNo].status}</span>
                      </td>
                    </tr>
                  ) : (
                    <tr>
                      <td style={S.miniTd} colSpan={3}>
                        <span style={{ color: "#444746", fontSize: 13 }}>{inv.soNo}</span>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <F label="CUSTOMER" value={inv.customer} link />
          <F label="INVOICE DATE" value={inv.invoiceDate} />
          <F label="DUE DATE" value={inv.dueDate} />
        </div>
        {/* Right Column */}
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Amounts (IDR)</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#444746" }}>SubTotal</span>
              <span style={{ fontWeight: 500 }}>{fmt(inv.subtotal || 0)}</span>
            </div>
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
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Service Items</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  <th style={S.th}>Service</th>
                  <th style={S.th}>Description</th>
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
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{item.service}</td>
                    <td style={S.td}>{item.description}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{item.qty}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.price)}</td>
                    <td style={{ ...S.td, textAlign: "center" }}>{item.discount}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(item.amount)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f3f3f3", fontWeight: 700 }}>
                  <td colSpan={2} style={S.td}>TOTAL</td>
                  <td style={S.td}></td>
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
  miniTableWrap: {
    border: "1px solid #ecebea", borderRadius: 6, overflow: "hidden", background: "#fff",
  },
  miniTable: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  miniTh: {
    padding: "5px 8px", textAlign: "left", fontWeight: 600,
    fontSize: 10, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em",
    background: "#f9f9f9", borderBottom: "1px solid #ecebea",
  },
  miniTd: {
    padding: "5px 8px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff",
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
  pill: {
    display: "inline-block",
    padding: "2px 7px",
    borderRadius: 9999,
    fontSize: 10,
    fontWeight: 600,
    color: "#fff",
  },
};
