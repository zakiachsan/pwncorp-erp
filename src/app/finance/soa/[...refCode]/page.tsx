"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, X } from "lucide-react";

const soaData: Record<string, any> = {
  "SOA/HO/26060001": {
    refCode: "SOA/HO/26060001",
    customer: "PT Maju Jaya",
    address: "Jl. Sudirman No. 45, Jakarta Pusat 10210",
    createdAt: "26 Jun 2026 10:00 AM",
    sentAt: "26 Jun 2026 10:15 AM",
    status: "SENT",
    notes: "-",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "26 Jun 2026 10:15 AM",
    totalAmount: 32000000,
    invoices: [
      { no: "SRI/003/26060150", sro: "SRO/002/26060150", swo: "SWO/002/26060151", date: "25-Jun-2026", dueDate: "28-Jun-2026", amount: 1800000, status: "PARTIAL" },
      { no: "SRI/006/26060200", sro: "SRO/002/26060150", swo: "SWO/008/26060200", date: "12-Jun-2026", dueDate: "16-Jun-2026", amount: 2000000, status: "PAID" },
      { no: "SRI/007/26060201", sro: "SRO/002/26060150", swo: "SWO/009/26060201", date: "15-Jun-2026", dueDate: "20-Jun-2026", amount: 4500000, status: "PAID" },
      { no: "SRI/008/26060202", sro: "SRO/006/26060155", swo: "SWO/010/26060202", date: "18-Jun-2026", dueDate: "22-Jun-2026", amount: 3500000, status: "UNPAID" },
      { no: "SRI/009/26060203", sro: "SRO/006/26060155", swo: "SWO/011/26060203", date: "20-Jun-2026", dueDate: "25-Jun-2026", amount: 5200000, status: "UNPAID" },
      { no: "SRI/010/26060204", sro: "SRO/002/26060150", swo: "SWO/002/26060151", date: "22-Jun-2026", dueDate: "27-Jun-2026", amount: 1200000, status: "PARTIAL" },
      { no: "SRI/011/26060205", sro: "SRO/006/26060155", swo: "SWO/006/26060155", date: "24-Jun-2026", dueDate: "29-Jun-2026", amount: 2800000, status: "UNPAID" },
      { no: "SRI/012/26060206", sro: "SRO/002/26060150", swo: "SWO/008/26060200", date: "25-Jun-2026", dueDate: "30-Jun-2026", amount: 1500000, status: "UNPAID" },
      { no: "SRI/013/26060207", sro: "SRO/006/26060155", swo: "SWO/009/26060201", date: "26-Jun-2026", dueDate: "01-Jul-2026", amount: 3100000, status: "UNPAID" },
      { no: "SRI/014/26060208", sro: "SRO/002/26060150", swo: "SWO/010/26060202", date: "27-Jun-2026", dueDate: "02-Jul-2026", amount: 2200000, status: "UNPAID" },
      { no: "SRI/015/26060209", sro: "SRO/006/26060155", swo: "SWO/011/26060203", date: "28-Jun-2026", dueDate: "03-Jul-2026", amount: 4200000, status: "UNPAID" },
    ],
  },
  "SOA/HO/26060002": {
    refCode: "SOA/HO/26060002",
    customer: "Budi Santoso",
    address: "Jl. Merdeka No. 12, Bandung 40111",
    createdAt: "25 Jun 2026 09:30 AM",
    sentAt: "",
    status: "DRAFT",
    notes: "-",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "25 Jun 2026 09:30 AM",
    totalAmount: 2500000,
    invoices: [
      { no: "SRI/004/26060149", sro: "SRO/001/26060149", swo: "SWO/001/26060149", date: "24-Jun-2026", dueDate: "30-Jun-2026", amount: 2500000, status: "PAID" },
    ],
  },
  "SOA/HO/26060003": {
    refCode: "SOA/HO/26060003",
    customer: "Siti Rahmawati",
    address: "Jl. Diponegoro No. 88, Surabaya 60271",
    createdAt: "24 Jun 2026 14:00 PM",
    sentAt: "24 Jun 2026 14:20 PM",
    status: "SENT",
    notes: "-",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "24 Jun 2026 14:20 PM",
    totalAmount: 5200000,
    invoices: [
      { no: "SRI/002/26060152", sro: "SRO/003/26060152", swo: "SWO/003/26060152", date: "26-Jun-2026", dueDate: "02-Jul-2026", amount: 5200000, status: "PAID" },
    ],
  },
  "SOA/HO/26060004": {
    refCode: "SOA/HO/26060004",
    customer: "CV Berkah Abadi",
    address: "Jl. Gatot Subroto No. 55, Jakarta Selatan 12190",
    createdAt: "23 Jun 2026 11:00 AM",
    sentAt: "",
    status: "CANCELLED",
    notes: "Dibatalkan atas permintaan customer",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "23 Jun 2026 11:30 AM",
    totalAmount: 3100000,
    invoices: [],
  },
  "SOA/HO/26060005": {
    refCode: "SOA/HO/26060005",
    customer: "Ahmad Fauzi",
    address: "Jl. Ahmad Yani No. 33, Yogyakarta 55122",
    createdAt: "22 Jun 2026 08:00 AM",
    sentAt: "22 Jun 2026 08:15 AM",
    status: "SENT",
    notes: "-",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "22 Jun 2026 08:15 AM",
    totalAmount: 950000,
    invoices: [
      { no: "SRI/005/26060154", sro: "SRO/005/26060154", swo: "SWO/005/26060154", date: "26-Jun-2026", dueDate: "28-Jun-2026", amount: 950000, status: "PAID" },
    ],
  },
  "SOA/HO/26060006": {
    refCode: "SOA/HO/26060006",
    customer: "PT Transport Jaya",
    address: "Jl. Industri No. 77, Semarang 50141",
    createdAt: "21 Jun 2026 16:00 PM",
    sentAt: "",
    status: "DRAFT",
    notes: "-",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "21 Jun 2026 16:00 PM",
    totalAmount: 4800000,
    invoices: [
      { no: "SRI/001/26060155", sro: "SRO/006/26060155", swo: "SWO/006/26060155", date: "26-Jun-2026", dueDate: "30-Jun-2026", amount: 4800000, status: "UNPAID" },
    ],
  },
};

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const statusColor = (s: string) => {
  const map: Record<string, string> = { DRAFT: "#6b7280", SENT: "#2e844a", CANCELLED: "#ea001e" };
  return map[s] || "#6b7280";
};
const invoiceStatusColor = (s: string) => {
  const map: Record<string, string> = { PAID: "#2e844a", UNPAID: "#ea001e", PARTIAL: "#f59e0b" };
  return map[s] || "#6b7280";
};

const workflowSteps = ["DRAFT", "SENT"];

export default function SOADetailPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.refCode as string[];
  const refCode = refCodeArray ? refCodeArray.join("/") : "";
  const soa = soaData[refCode];
  const [printMode, setPrintMode] = useState(false);

  if (!soa) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.back()} style={S.backBtn}><ArrowLeft size={16} /> Kembali</button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {refCode}</p></div>
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(soa.status === "CANCELLED" ? "DRAFT" : soa.status);

  if (printMode) {
    return <PrintView soa={soa} onClose={() => setPrintMode(false)} router={router} />;
  }

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <button onClick={() => router.push("/finance/soa")} style={S.backBtn}>
        <ArrowLeft size={16} /> Statement of Accounts
      </button>

      {/* Workflow Bar */}
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            {workflowSteps.map((step, i) => (
              <span key={step} style={{
                ...S.badge,
                background: i <= currentStepIdx ? (soa.status === "CANCELLED" ? "#ea001e" : "#2e844a") : "transparent",
                color: i <= currentStepIdx ? "#fff" : "#8e8f8e",
                border: `1px solid ${i <= currentStepIdx ? (soa.status === "CANCELLED" ? "#ea001e" : "#2e844a") : "#d8d8d8"}`,
              }}>{step}</span>
            ))}
            {soa.status === "CANCELLED" && (
              <span style={{ ...S.badge, background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>CANCELLED</span>
            )}
          </div>
        </div>
        <button onClick={() => setPrintMode(true)} style={S.actionBtn}><Printer size={14} /> Print</button>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
        <div style={S.card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0176d3", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Details</div>
          <F label="DOCUMENT NO." value={soa.refCode} />
          <F label="CUSTOMER" value={soa.customer} />
          <F label="ADDRESS" value={soa.address} />
          <F label="REFERENCE NUMBER" value="-" />
          <F label="SENT AT" value={soa.sentAt || "-"} />
          <F label="NOTES" value={soa.notes} />
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0176d3", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Audit Trail</div>
          <F label="CREATED BY" value={soa.createdBy} />
          <F label="UPDATED BY" value={soa.updatedBy} />
          <F label="CREATED AT" value={soa.createdAt} />
          <F label="UPDATED AT" value={soa.updatedAt} />
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#0176d3", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Amounts</div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <span style={{ fontSize: 12, fontWeight: 600, color: "#444746", background: "#e8e8e8", padding: "4px 10px", borderRadius: 4 }}>TOTAL AMOUNT</span>
              <span style={{ fontSize: 18, fontWeight: 700, color: "#001526" }}>{fmtRp(soa.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Unpaid Invoices */}
      <div style={S.card}>
        <div style={{ fontSize: 11, fontWeight: 600, color: "#0176d3", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>
          Unpaid Invoices
        </div>
        {soa.invoices.length > 0 ? (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 40 }}>No</th>
                  <th style={S.th}>Invoice</th>
                  <th style={S.th}>ID SRO</th>
                  <th style={S.th}>SWO</th>
                  <th style={S.th}>Date</th>
                  <th style={S.th}>Due Date</th>
                  <th style={S.th}>Status</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {soa.invoices.map((inv: any, i: number) => (
                  <tr key={i} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}
                      onClick={() => router.push(`/finance/invoices/service/${inv.no}`)}>{inv.no}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}
                      onClick={() => router.push(`/service-orders/${inv.sro}`)}>{inv.sro}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}
                      onClick={() => router.push(`/work-orders/${inv.swo}`)}>{inv.swo}</td>
                    <td style={S.td}>{inv.date}</td>
                    <td style={S.td}>{inv.dueDate}</td>
                    <td style={S.td}>
                      <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, color: "#fff", background: invoiceStatusColor(inv.status) }}>{inv.status}</span>
                    </td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmtRp(inv.amount)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{ padding: 16, textAlign: "center", color: "#8e8f8e", fontSize: 13 }}>Tidak ada invoice</div>
        )}
      </div>
    </div>
  );
}

/* ─── Print View ─── */
function PrintView({ soa, onClose, router }: { soa: any; onClose: () => void; router: any }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#f5f5f5", overflow: "auto" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #ecebea", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#001526" }}>Print Preview — {soa.refCode}</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.print()} style={{ ...PS.btn, background: "#0176d3", color: "#fff", border: "none" }}>Cetak Sekarang</button>
          <button onClick={onClose} style={{ ...PS.btn, background: "#fff", color: "#444746", border: "1px solid #d8d8d8" }}><X size={14} /> Tutup</button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
        <div style={{ background: "#fff", padding: 32, borderRadius: 8, border: "1px solid #ecebea" }}>
          {/* Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "2px solid #0176d3", paddingBottom: 16 }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", letterSpacing: "0.05em" }}>Statement of Accounts</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#001526", marginTop: 4 }}>{soa.refCode}</div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: "#0176d3" }}>pwncorp</div>
              <div style={{ fontSize: 11, color: "#8e8f8e" }}>Wijaya Motor — One Stop Service</div>
            </div>
          </div>

          {/* Info */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px", marginBottom: 24 }}>
            <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Customer</span><div style={{ fontSize: 14, fontWeight: 600, color: "#001526" }}>{soa.customer}</div></div>
            <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Document No</span><div style={{ fontSize: 13, color: "#001526" }}>{soa.refCode}</div></div>
            <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Address</span><div style={{ fontSize: 13, color: "#444746", lineHeight: 1.4 }}>{soa.address}</div></div>
            <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Sent At</span><div style={{ fontSize: 13, color: "#001526" }}>{soa.sentAt || "-"}</div></div>
            <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Status</span><div style={{ fontSize: 13, color: "#001526" }}>{soa.status}</div></div>
          </div>

          {/* Invoice Table */}
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f5f5f5" }}>
                <th style={PT.thL}>#</th>
                <th style={PT.thL}>Invoice</th>
                <th style={PT.thL}>ID SRO</th>
                <th style={PT.thL}>SWO</th>
                <th style={PT.thL}>Date</th>
                <th style={PT.thL}>Due Date</th>
                <th style={PT.thR}>Amount</th>
              </tr>
            </thead>
            <tbody>
              {soa.invoices.map((inv: any, i: number) => (
                <tr key={i}>
                  <td style={PT.td}>{i + 1}</td>
                  <td style={{ ...PT.td, color: "#0176d3", fontWeight: 500 }}>{inv.no}</td>
                  <td style={{ ...PT.td, color: "#0176d3", fontWeight: 500 }}>{inv.sro}</td>
                  <td style={{ ...PT.td, color: "#0176d3", fontWeight: 500 }}>{inv.swo}</td>
                  <td style={PT.td}>{inv.date}</td>
                  <td style={PT.td}>{inv.dueDate}</td>
                  <td style={{ ...PT.td, textAlign: "right", fontWeight: 600 }}>{fmtRp(inv.amount)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan={6} style={{ padding: "10px", textAlign: "right", fontWeight: 700, fontSize: 14, color: "#001526", borderTop: "2px solid #0176d3" }}>TOTAL AMOUNT</td>
                <td style={{ padding: "10px", textAlign: "right", fontWeight: 700, fontSize: 14, color: "#001526", borderTop: "2px solid #0176d3", whiteSpace: "nowrap" }}>{fmtRp(soa.totalAmount)}</td>
              </tr>
            </tfoot>
          </table>

          {/* Notes */}
          {soa.notes && soa.notes !== "-" && (
            <div style={{ marginTop: 20, padding: "12px 16px", background: "#f9f9f9", borderRadius: 6 }}>
              <span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Notes</span>
              <div style={{ fontSize: 13, color: "#444746", marginTop: 4 }}>{soa.notes}</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function F({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526" }}>{value}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer", marginBottom: 16 },
  card: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  workflowBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, marginBottom: 16 },
  badge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  tableWrap: { border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", background: "#f9f9f9", borderBottom: "1px solid #ecebea" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
};

const PS: Record<string, React.CSSProperties> = {
  btn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: "pointer" },
};

const PT: Record<string, React.CSSProperties> = {
  thL: { padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", borderBottom: "1px solid #ecebea" },
  thR: { padding: "8px 10px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0" },
};
