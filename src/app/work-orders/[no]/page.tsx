"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, FileText, Phone, ChevronRight, CheckCircle, XCircle } from "lucide-react";

const woData: Record<string, any> = {
  "WO-001": {
    documentNumber: "SWO/001/26060147",
    soNumber: "SO-001",
    customer: { name: "Budi Santoso", phone: "0812-3456-7890" },
    registrationNo: "B 1234 CD",
    vehicleMake: "TOYOTA",
    vehicleModel: "AVANZA",
    vehicleType: "CAR",
    odometer: "45.230",
    year: "2022",
    color: "SILVER",
    mekanik: "Hendra",
    serviceAdvisor: "Rudi",
    startDate: "26 Jun 2026",
    targetDate: "27 Jun 2026",
    status: "IN PROGRESS",
    services: [
      { item: "A3 - Spooring Mobil Kelas I", description: "Spooring", qty: 1, price: 375000, total: 337500 },
      { item: "B4 - Balancing Ring >19\"", description: "Balancing", qty: 4, price: 60000, total: 216000 },
      { item: "JAS.NT.001 - JASA NON TRACKING", description: "NITRO FILL (BARU)", qty: 4, price: 20000, total: 80000 },
    ],
    spareparts: [
      { code: "SP-001", name: "Oli Mesin 10W-40", qty: 4, unit: "Ltr", status: "Used" },
      { code: "SP-002", name: "Filter Oli", qty: 1, unit: "Pcs", status: "Used" },
    ],
  },
  "WO-002": {
    documentNumber: "SWO/002/26060151",
    soNumber: "SO-002",
    customer: { name: "PT Maju Jaya", phone: "021-555-1234" },
    registrationNo: "B 5678 EF",
    vehicleMake: "HONDA",
    vehicleModel: "CIVIC",
    vehicleType: "CAR",
    odometer: "78.450",
    year: "2021",
    color: "HITAM",
    mekanik: "Agus",
    serviceAdvisor: "Ani",
    startDate: "26 Jun 2026",
    targetDate: "28 Jun 2026",
    status: "WAITING STOCK",
    services: [
      { item: "A1 - Ganti Oli Mesin", description: "Ganti Oli", qty: 1, price: 250000, total: 250000 },
    ],
    spareparts: [
      { code: "SP-001", name: "Oli Mesin 10W-40", qty: 4, unit: "Ltr", status: "Waiting" },
    ],
  },
};

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const woNo = params.no as string;
  const [activeTab, setActiveTab] = useState<"details" | "services" | "spareparts" | "changes">("details");
  const [woOrders, setWoOrders] = useState(woData);
  const [showConfirm, setShowConfirm] = useState<"approve" | "qc" | null>(null);

  const wo = woOrders[woNo];

  if (!wo) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/work-orders")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {woNo}</p></div>
      </div>
    );
  }

  const handleStatusChange = (newStatus: string) => {
    setWoOrders((prev) => ({
      ...prev,
      [woNo]: { ...prev[woNo], status: newStatus },
    }));
    setShowConfirm(null);
  };

  const workflowSteps = ["WAITING", "IN PROGRESS", "WAITING FOR QC", "COMPLETED"];

  const getStepIndex = (status: string) => {
    const map: Record<string, number> = {
      "DRAFT": 0,
      "WAITING STOCK": 0,
      "WAITING": 0,
      "IN PROGRESS": 1,
      "QC": 2,
      "WAITING FOR QC": 2,
      "COMPLETED": 3,
    };
    return map[status] ?? 0;
  };

  const currentStepIndex = getStepIndex(wo.status);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Tabs */}
      <div style={S.tabBar}>
        {(["details", "services", "spareparts", "changes"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            ...S.tab,
            color: activeTab === t ? "#fff" : "#444746",
            background: activeTab === t ? "#0176d3" : "#ecebea",
            fontWeight: activeTab === t ? 600 : 400,
          }}>
            {t === "details" ? "Details" : t === "services" ? "Services" : t === "spareparts" ? "Spareparts" : "Changes"}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div>
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
              {wo.status === "IN PROGRESS" && (
                <button onClick={() => setShowConfirm("qc")} style={{ ...S.actionBtn, background: "#8b5cf6", color: "#fff", border: "1px solid #8b5cf6" }}>
                  <CheckCircle size={14} /> Kirim ke QC
                </button>
              )}
              {wo.status === "QC" && (
                <>
                  <button onClick={() => setShowConfirm("approve")} style={{ ...S.actionBtn, background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}>
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button style={{ ...S.actionBtn, background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>
                    <XCircle size={14} /> Reject
                  </button>
                </>
              )}
              <button style={S.actionBtn}><Printer size={14} /> Print</button>
            </div>
          </div>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
            {/* Left Column */}
            <div>
              <F label="DOCUMENT NUMBER" value={wo.documentNumber} />
              <F label="NO. SO" value={wo.soNumber} link onClick={() => router.push(`/service-orders/${wo.soNumber}`)} />
              <F label="CUSTOMER" value={wo.customer.name} link />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, marginTop: -4 }}>
                <Phone size={12} style={{ color: "#444746" }} />
                <span style={{ fontSize: 13, color: "#444746" }}>{wo.customer.phone}</span>
              </div>
              <F label="REGISTRATION NO" value={wo.registrationNo} />
              <F label="MEKANIK" value={wo.mekanik} />
              <F label="SERVICE ADVISOR" value={wo.serviceAdvisor} />
              <F label="START DATE" value={wo.startDate} />
              <F label="TARGET DATE" value={wo.targetDate} />
            </div>
            {/* Right Column */}
            <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
              <F label="VEHICLE TYPE" value={wo.vehicleType} />
              <F label="VEHICLE MAKE" value={wo.vehicleMake} />
              <F label="VEHICLE MODEL" value={wo.vehicleModel} />
              <F label="ODOMETER" value={wo.odometer} />
              <F label="YEAR" value={wo.year} />
              <F label="COLOR" value={wo.color} />
            </div>
          </div>
        </div>
      )}

      {/* Services Tab */}
      {activeTab === "services" && (
        <div>
          <h3 style={S.sectionTitle}>Services</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  <th style={S.th}>Item</th>
                  <th style={S.th}>Description</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Price</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {wo.services.map((svc: any, i: number) => (
                  <tr key={i} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{svc.item}</td>
                    <td style={S.td}>{svc.description}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{svc.qty}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{fmt(svc.price)}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(svc.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
                  <td colSpan={3} style={S.td}></td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>
                    {wo.services.reduce((s: number, x: any) => s + x.qty, 0)}
                  </td>
                  <td style={S.td}></td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, fontSize: 13 }}>
                    {fmt(wo.services.reduce((s: number, x: any) => s + x.total, 0))}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Spareparts Tab */}
      {activeTab === "spareparts" && (
        <div>
          <h3 style={S.sectionTitle}>Spareparts Used</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  <th style={S.th}>Code</th>
                  <th style={S.th}>Name</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
                  <th style={S.th}>Unit</th>
                  <th style={S.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                {wo.spareparts.map((sp: any, i: number) => (
                  <tr key={i} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{sp.code}</td>
                    <td style={S.td}>{sp.name}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{sp.qty}</td>
                    <td style={S.td}>{sp.unit}</td>
                    <td style={S.td}>
                      <span style={{
                        ...S.pill,
                        background: sp.status === "Used" ? "#2e844a" : "#f59e0b",
                      }}>{sp.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Changes Tab */}
      {activeTab === "changes" && (
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Riwayat perubahan belum tersedia.</p></div>
      )}

      {/* Confirmation Modal */}
      {showConfirm && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>
              {showConfirm === "qc" ? "Kirim ke QC?" : "Approve Work Order?"}
            </h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20, lineHeight: 1.5 }}>
              {showConfirm === "qc"
                ? "Work Order akan dikirim ke Quality Check. Mekanik tidak bisa mengubah lagi."
                : "Work Order akan di-approve dan status berubah ke COMPLETED."}
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowConfirm(null)} style={S.actionBtn}>Batal</button>
              <button
                onClick={() => handleStatusChange(showConfirm === "qc" ? "QC" : "COMPLETED")}
                style={{
                  ...S.actionBtn,
                  background: showConfirm === "qc" ? "#8b5cf6" : "#2e844a",
                  color: "#fff",
                  border: `1px solid ${showConfirm === "qc" ? "#8b5cf6" : "#2e844a"}`,
                }}
              >
                <CheckCircle size={14} /> Ya, {showConfirm === "qc" ? "Kirim" : "Approve"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Field Component ─── */
function F({ label, value, link = false, onClick }: { label: string; value: string; link?: boolean; onClick?: () => void }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div
        onClick={onClick}
        style={{
          fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526",
          display: "inline-flex", alignItems: "center", gap: 4,
          cursor: onClick ? "pointer" : "default",
        }}
      >
        {value}
        {link && <ChevronRight size={13} style={{ color: "#0176d3" }} />}
      </div>
    </div>
  );
}

/* ─── Styles ─── */
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
  sectionTitle: {
    fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8,
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
  pill: {
    display: "inline-block", padding: "2px 8px", borderRadius: 9999,
    fontSize: 10, fontWeight: 600, color: "#fff",
  },
  modalOverlay: {
    position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)",
    display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100,
  },
  modal: {
    background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%",
    boxShadow: "0 8px 32px rgba(0,0,0,0.16)",
  },
};
