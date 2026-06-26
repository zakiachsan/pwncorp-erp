"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, CheckCircle, XCircle } from "lucide-react";

const poData: Record<string, any> = {
  "PO-001": {
    no: "PO-001",
    supplier: "PT Auto Parts",
    supplierPhone: "021-555-1234",
    supplierAddress: "Jl. Raya Bogor No. 123, Jakarta",
    status: "SENT",
    date: "25 Jun 2026",
    expectedDate: "28 Jun 2026",
    notes: "Pengiriman ke gudang utama",
    items: [
      { code: "SP-001", name: "Oli Mesin 10W-40", qty: 20, unit: "Ltr", price: 75000, subtotal: 1500000 },
      { code: "SP-002", name: "Filter Oli", qty: 10, unit: "Pcs", price: 50000, subtotal: 500000 },
      { code: "SP-004", name: "Busi Iridium", qty: 20, unit: "Pcs", price: 35000, subtotal: 700000 },
      { code: "SP-006", name: "V-Belt", qty: 5, unit: "Pcs", price: 90000, subtotal: 450000 },
    ],
    receivedItems: [
      { code: "SP-001", name: "Oli Mesin 10W-40", ordered: 20, received: 20, date: "27 Jun 2026" },
      { code: "SP-002", name: "Filter Oli", ordered: 10, received: 10, date: "27 Jun 2026" },
    ],
  },
  "PO-002": {
    no: "PO-002",
    supplier: "CV Ban Sehat",
    supplierPhone: "022-888-5678",
    supplierAddress: "Jl. Soekarno Hatta No. 45, Bandung",
    status: "PARTIAL RECEIVED",
    date: "24 Jun 2026",
    expectedDate: "27 Jun 2026",
    notes: "",
    items: [
      { code: "SP-005", name: "Aki GS 45Ah", qty: 5, unit: "Pcs", price: 700000, subtotal: 3500000 },
      { code: "SP-003", name: "Kampas Rem Depan", qty: 8, unit: "Set", price: 150000, subtotal: 1200000 },
    ],
    receivedItems: [
      { code: "SP-005", name: "Aki GS 45Ah", ordered: 5, received: 3, date: "26 Jun 2026" },
    ],
  },
  "PO-003": {
    no: "PO-003",
    supplier: "UD Oli Jaya",
    supplierPhone: "021-777-9012",
    supplierAddress: "Jl. Gatot Subroto No. 67, Jakarta",
    status: "RECEIVED",
    date: "22 Jun 2026",
    expectedDate: "25 Jun 2026",
    notes: "Sudah diterima lengkap",
    items: [
      { code: "SP-001", name: "Oli Mesin 10W-40", qty: 30, unit: "Ltr", price: 72000, subtotal: 2160000 },
    ],
    receivedItems: [
      { code: "SP-001", name: "Oli Mesin 10W-40", ordered: 30, received: 30, date: "24 Jun 2026" },
    ],
  },
  "PO-004": {
    no: "PO-004",
    supplier: "PT Auto Parts",
    supplierPhone: "021-555-1234",
    supplierAddress: "Jl. Raya Bogor No. 123, Jakarta",
    status: "DRAFT",
    date: "26 Jun 2026",
    expectedDate: "-",
    notes: "Menunggu approval",
    items: [
      { code: "SP-003", name: "Kampas Rem Depan", qty: 10, unit: "Set", price: 150000, subtotal: 1500000 },
      { code: "SP-005", name: "Aki GS 45Ah", qty: 5, unit: "Pcs", price: 700000, subtotal: 3500000 },
      { code: "SP-006", name: "V-Belt", qty: 10, unit: "Pcs", price: 90000, subtotal: 900000 },
    ],
    receivedItems: [],
  },
};

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function PODetailPage() {
  const params = useParams();
  const router = useRouter();
  const poNo = params.no as string;
  const [activeTab, setActiveTab] = useState<"details" | "items" | "received">("details");

  const po = poData[poNo];

  const workflowSteps = ["DRAFT", "SENT", "PARTIAL RECEIVED", "RECEIVED"];

  const getStepIndex = (status: string) => {
    const map: Record<string, number> = {
      "DRAFT": 0,
      "SENT": 1,
      "PARTIAL RECEIVED": 2,
      "RECEIVED": 3,
    };
    return map[status] ?? 0;
  };

  const currentStepIndex = getStepIndex(po?.status || "DRAFT");

  if (!po) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/inventory/po")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {poNo}</p></div>
      </div>
    );
  }

  const totalQty = po.items.reduce((s: number, x: any) => s + x.qty, 0);
  const grandTotal = po.items.reduce((s: number, x: any) => s + x.subtotal, 0);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
        <button onClick={() => router.push("/inventory/po")} style={S.backBtn}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Purchase Order</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>{po.no}</div>
        </div>
      </div>

      {/* Workflow Bar */}
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 4 }}>
            {workflowSteps.map((step, i) => {
              const isActive = i === currentStepIndex;
              const isCompleted = i < currentStepIndex;
              return (
                <span key={step} style={{
                  padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                  background: isActive ? "#032d47" : isCompleted ? "#e5e7eb" : "#f3f4f6",
                  color: isActive ? "#fff" : isCompleted ? "#6b7280" : "#9ca3af",
                  border: `1px solid ${isActive ? "#032d47" : isCompleted ? "#d1d5db" : "#e5e7eb"}`,
                }}>
                  {step}
                </span>
              );
            })}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          {po.status === "DRAFT" && (
            <button style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
              <CheckCircle size={14} /> Send PO
            </button>
          )}
          <button style={S.actionBtn}><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabBar}>
        {(["details", "items", "received"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            ...S.tab,
            color: activeTab === t ? "#fff" : "#444746",
            background: activeTab === t ? "#0176d3" : "#ecebea",
            fontWeight: activeTab === t ? 600 : 400,
          }}>
            {t === "details" ? "Details" : t === "items" ? "Items" : "Received"}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
          <div>
            <F label="PO NUMBER" value={po.no} />
            <F label="SUPPLIER" value={po.supplier} link />
            <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, marginTop: -4 }}>
              <span style={{ fontSize: 13, color: "#444746" }}>{po.supplierPhone}</span>
            </div>
            <F label="ADDRESS" value={po.supplierAddress} />
            <F label="DATE" value={po.date} />
            <F label="EXPECTED DATE" value={po.expectedDate} />
          </div>
          <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
            <F label="TOTAL ITEMS" value={`${po.items.length} items`} />
            <F label="TOTAL QTY" value={`${totalQty}`} />
            <F label="GRAND TOTAL" value={`Rp ${fmt(grandTotal)}`} />
            <F label="NOTES" value={po.notes || "-"} />
          </div>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === "items" && (
        <div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  <th style={S.th}>Code</th>
                  <th style={S.th}>Name</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
                  <th style={S.th}>Unit</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Price</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item: any, i: number) => (
                  <tr key={i} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{item.code}</td>
                    <td style={S.td}>{item.name}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{item.qty}</td>
                    <td style={S.td}>{item.unit}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.price)}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
                  <td colSpan={3} style={S.td}></td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totalQty}</td>
                  <td style={S.td}></td>
                  <td style={S.td}></td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, fontSize: 13 }}>{fmt(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Received Tab */}
      {activeTab === "received" && (
        <div>
          {po.receivedItems.length > 0 ? (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 36 }}>No.</th>
                    <th style={S.th}>Code</th>
                    <th style={S.th}>Name</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Ordered</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Received</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Remaining</th>
                    <th style={S.th}>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {po.receivedItems.map((item: any, i: number) => (
                    <tr key={i} style={S.tr}>
                      <td style={S.td}>{i + 1}</td>
                      <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{item.code}</td>
                      <td style={S.td}>{item.name}</td>
                      <td style={{ ...S.td, textAlign: "right" }}>{item.ordered}</td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{item.received}</td>
                      <td style={{ ...S.td, textAlign: "right", color: item.ordered - item.received > 0 ? "#f59e0b" : "#2e844a" }}>
                        {item.ordered - item.received}
                      </td>
                      <td style={S.td}>{item.date}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Belum ada item yang diterima</p></div>
          )}
        </div>
      )}
    </div>
  );
}

function F({ label, value, link = false }: { label: string; value: string; link?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526", display: "inline-flex", alignItems: "center", gap: 4 }}>
        {value}
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
  card: {
    background: "#fff", border: "1px solid #ecebea", borderRadius: 8,
    padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  workflowBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea",
    borderRadius: 8, marginBottom: 16,
  },
  badge: {
    display: "inline-flex", alignItems: "center", padding: "3px 10px",
    borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" as const,
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  tabBar: {
    display: "flex", gap: 0, marginBottom: 16, background: "#ecebea",
    borderRadius: 8, padding: 3, width: "fit-content",
  },
  tab: {
    padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6,
    cursor: "pointer", transition: "all 150ms", whiteSpace: "nowrap" as const,
  },
  tableWrap: {
    border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden",
    background: "#fff",
  },
  table: {
    width: "100%", borderCollapse: "collapse" as const, fontSize: 13,
  },
  th: {
    padding: "8px 10px", textAlign: "left" as const, fontWeight: 600,
    fontSize: 11, color: "#444746", textTransform: "uppercase" as const,
    letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526",
    background: "#fff",
  },
  tr: { transition: "background 100ms" },
};
