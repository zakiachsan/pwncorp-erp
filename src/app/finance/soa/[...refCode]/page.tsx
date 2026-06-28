"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

const soaData: Record<string, any> = {
  "SOA/HO/26060001": {
    refCode: "SOA/HO/26060001",
    customer: "PT Maju Jaya",
    createdAt: "26 Jun 2026 10:00 AM",
    sentAt: "26 Jun 2026 10:15 AM",
    status: "SENT",
    notes: "-",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "26 Jun 2026 10:15 AM",
    totalAmount: 1800000,
    invoices: [
      { no: "IR/SO/26060002", document: "INV-002", date: "25-Jun-2026", dueDate: "28-Jun-2026", amount: 1800000 },
    ],
  },
  "SOA/HO/26060002": {
    refCode: "SOA/HO/26060002",
    customer: "Budi Santoso",
    createdAt: "25 Jun 2026 09:30 AM",
    sentAt: "",
    status: "DRAFT",
    notes: "-",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "25 Jun 2026 09:30 AM",
    totalAmount: 2500000,
    invoices: [
      { no: "IR/SO/26060001", document: "INV-001", date: "24-Jun-2026", dueDate: "30-Jun-2026", amount: 2500000 },
    ],
  },
  "SOA/HO/26060003": {
    refCode: "SOA/HO/26060003",
    customer: "Siti Rahmawati",
    createdAt: "24 Jun 2026 14:00 PM",
    sentAt: "24 Jun 2026 14:20 PM",
    status: "SENT",
    notes: "-",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "24 Jun 2026 14:20 PM",
    totalAmount: 5200000,
    invoices: [
      { no: "IR/SO/26060003", document: "INV-003", date: "26-Jun-2026", dueDate: "02-Jul-2026", amount: 5200000 },
    ],
  },
  "SOA/HO/26060004": {
    refCode: "SOA/HO/26060004",
    customer: "CV Berkah Abadi",
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
    createdAt: "22 Jun 2026 08:00 AM",
    sentAt: "22 Jun 2026 08:15 AM",
    status: "SENT",
    notes: "-",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "22 Jun 2026 08:15 AM",
    totalAmount: 950000,
    invoices: [
      { no: "IR/SO/26060004", document: "INV-004", date: "26-Jun-2026", dueDate: "28-Jun-2026", amount: 950000 },
    ],
  },
  "SOA/HO/26060006": {
    refCode: "SOA/HO/26060006",
    customer: "PT Transport Jaya",
    createdAt: "21 Jun 2026 16:00 PM",
    sentAt: "",
    status: "DRAFT",
    notes: "-",
    createdBy: "Admin",
    updatedBy: "Admin",
    updatedAt: "21 Jun 2026 16:00 PM",
    totalAmount: 4800000,
    invoices: [
      { no: "IR/SO/26060005", document: "INV-005", date: "26-Jun-2026", dueDate: "30-Jun-2026", amount: 4800000 },
    ],
  },
};

const fmt = (n: number) => n.toLocaleString("id-ID");
const statusColor = (s: string) => {
  const map: Record<string, string> = { DRAFT: "#6b7280", SENT: "#2e844a", CANCELLED: "#ea001e" };
  return map[s] || "#6b7280";
};

const workflowSteps = ["DRAFT", "SENT"];

export default function SOADetailPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.refCode as string[];
  const refCode = refCodeArray ? refCodeArray.join("/") : "";
  const soa = soaData[refCode];

  if (!soa) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.back()} style={S.backBtn}><ArrowLeft size={16} /> Kembali</button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {refCode}</p></div>
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(soa.status === "CANCELLED" ? "DRAFT" : soa.status);

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
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 20 }}>
        <div style={S.card}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0176d3", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 12 }}>Details</div>
          <F label="DOCUMENT NO." value={soa.refCode} />
          <F label="CUSTOMER" value={soa.customer} link />
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
              <span style={{ fontSize: 18, fontWeight: 700, color: "#001526" }}>{fmt(soa.totalAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Invoice List */}
      <div style={S.card}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#0176d3", textTransform: "uppercase", letterSpacing: "0.04em" }}>Invoices</div>
          <div style={{ display: "flex", gap: 8 }}>
            <input type="text" style={{ ...S.input, width: 120 }} placeholder="Invoice#" />
            <input type="text" style={{ ...S.input, width: 120 }} placeholder="Document#" />
            <button style={{ ...S.btn, width: "auto", padding: "5px 12px" }}>Search</button>
          </div>
        </div>
        {soa.invoices.length > 0 ? (
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 40 }}>No</th>
                  <th style={S.th}>Invoice</th>
                  <th style={S.th}>Document</th>
                  <th style={S.th}>Date</th>
                  <th style={S.th}>Due Date</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Amount</th>
                </tr>
              </thead>
              <tbody>
                {soa.invoices.map((inv: any, i: number) => (
                  <tr key={i} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{inv.no}</td>
                    <td style={{ ...S.td, color: "#0176d3" }}>{inv.document}</td>
                    <td style={S.td}>{inv.date}</td>
                    <td style={S.td}>{inv.dueDate}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(inv.amount)}</td>
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

function F({ label, value, link }: { label: string; value: string; link?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526" }}>{value}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
    fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer", marginBottom: 16,
  },
  card: {
    background: "#fff", border: "1px solid #ecebea", borderRadius: 8,
    padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  workflowBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea",
    borderRadius: 8, marginBottom: 16,
  },
  badge: {
    display: "inline-flex", alignItems: "center", padding: "3px 10px",
    borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  input: {
    padding: "6px 10px", fontSize: 12, border: "1px solid #d8d8d8",
    borderRadius: 6, background: "#fff", color: "#001526", outline: "none",
  },
  btn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "6px 14px",
    fontSize: 12, fontWeight: 500, background: "#0176d3", color: "#fff",
    border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer",
  },
  tableWrap: {
    border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11,
    color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em",
    background: "#f9f9f9", borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff",
  },
  tr: { transition: "background 100ms" },
};
