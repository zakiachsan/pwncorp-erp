"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, ChevronRight, CheckCircle, Clock, Wrench, Package } from "lucide-react";

const woData: Record<string, any> = {
  "WO-001": {
    documentNumber: "WO-001",
    soNumber: "SO-001",
    soDocument: "SRO/001/26060149",
    customer: { name: "Budi Santoso", phone: "0812-3456-7890" },
    registrationNo: "B 1234 CD",
    vehicleMake: "TOYOTA",
    vehicleModel: "AVANZA",
    vehicleType: "CAR",
    year: "2022",
    color: "SILVER",
    odometer: "45.230",
    store: "Wijaya Motor - One Stop Service",
    serviceAdvisor: "Rudi",
    mekanik: "Hendra",
    status: "IN PROGRESS",
    planStartDate: "Senin, 26 Juni 2026",
    planEndDate: "Selasa, 27 Juni 2026",
    actualStartDate: "Senin, 26 Juni 2026 08:30",
    services: [
      { item: "A3 - Spooring Mobil Kelas I", description: "Spooring", quantity: 1, priceExTax: 375000, discount: "10%", subtotal: 337500, total: 337500, assignedTo: "Hendra", status: "In Progress", estimatedTime: "60 menit" },
      { item: "B4 - Balancing Ring >19\"", description: "Balancing", quantity: 4, priceExTax: 60000, discount: "10%", subtotal: 216000, total: 216000, assignedTo: "Agus", status: "Waiting", estimatedTime: "30 menit" },
      { item: "JAS.NT.001 - JASA NON TRACKING", description: "NITRO FILL (BARU)", quantity: 4, priceExTax: 20000, discount: "-", subtotal: 80000, total: 80000, assignedTo: "Hendra", status: "Waiting", estimatedTime: "15 menit" },
    ],
    spareparts: [
      { code: "OLM-001", name: "Oli Mesin 5W-30", qty: 3, price: 85000, total: 255000 },
    ],
  },
  "WO-002": {
    documentNumber: "WO-002",
    soNumber: "SO-002",
    soDocument: "SRO/002/26060150",
    customer: { name: "PT Maju Jaya", phone: "021-555-1234" },
    registrationNo: "B 5678 EF",
    vehicleMake: "HONDA",
    vehicleModel: "CIVIC",
    vehicleType: "CAR",
    year: "2021",
    color: "HITAM",
    odometer: "78.450",
    store: "Wijaya Motor - One Stop Service",
    serviceAdvisor: "Ani",
    mekanik: "Agus",
    status: "WAITING STOCK",
    planStartDate: "Senin, 26 Juni 2026",
    planEndDate: "Rabu, 28 Juni 2026",
    actualStartDate: "Senin, 26 Juni 2026 10:45",
    services: [
      { item: "A1 - Ganti Oli Mesin", description: "Ganti Oli", quantity: 1, priceExTax: 250000, discount: "-", subtotal: 250000, total: 250000, assignedTo: "Agus", status: "In Progress", estimatedTime: "30 menit" },
    ],
    spareparts: [
      { code: "OLM-002", name: "Oli Mesin 0W-20", qty: 1, price: 120000, total: 120000 },
    ],
  },
  "WO-003": {
    documentNumber: "WO-003", soNumber: "SO-003", soDocument: "SRO/003/26060152",
    customer: { name: "Siti Rahmawati", phone: "0813-5678-9012" }, registrationNo: "B 9012 GH",
    vehicleMake: "MITSUBISHI", vehicleModel: "PAJERO", vehicleType: "CAR", year: "2020", color: "PUTIH", odometer: "62.100",
    store: "Wijaya Motor - One Stop Service", serviceAdvisor: "Rudi", mekanik: "Hendra",
    status: "QC", planStartDate: "Minggu, 25 Juni 2026", planEndDate: "Senin, 26 Juni 2026",
    actualStartDate: "Minggu, 25 Juni 2026 09:00",
    services: [
      { item: "C1 - Service Berkala 10K", description: "Service Umum", quantity: 1, priceExTax: 450000, discount: "-", subtotal: 450000, total: 450000, assignedTo: "Hendra", status: "Completed", estimatedTime: "90 menit" },
    ],
    spareparts: [],
  },
  "WO-004": {
    documentNumber: "WO-004", soNumber: "SO-004", soDocument: "SRO/004/26060153",
    customer: { name: "CV Berkah Abadi", phone: "021-777-8888" }, registrationNo: "B 3456 IJ",
    vehicleMake: "SUZUKI", vehicleModel: "ERTIGA", vehicleType: "CAR", year: "2023", color: "MERAH", odometer: "15.200",
    store: "Wijaya Motor - One Stop Service", serviceAdvisor: "Ani", mekanik: "Bambang",
    status: "COMPLETED", planStartDate: "Sabtu, 24 Juni 2026", planEndDate: "Minggu, 25 Juni 2026",
    actualStartDate: "Sabtu, 24 Juni 2026 08:00",
    services: [
      { item: "D1 - Tune Up", description: "Tune Up Mesin", quantity: 1, priceExTax: 350000, discount: "-", subtotal: 350000, total: 350000, assignedTo: "Bambang", status: "Completed", estimatedTime: "120 menit" },
    ],
    spareparts: [],
  },
  "WO-005": {
    documentNumber: "WO-005", soNumber: "SO-005", soDocument: "SRO/005/26060154",
    customer: { name: "Ahmad Fauzi", phone: "0812-999-0000" }, registrationNo: "B 7890 KL",
    vehicleMake: "DAIHATSU", vehicleModel: "XENIA", vehicleType: "CAR", year: "2022", color: "ABU-ABU", odometer: "33.500",
    store: "Wijaya Motor - One Stop Service", serviceAdvisor: "Rudi", mekanik: "Agus",
    status: "DRAFT", planStartDate: "Senin, 26 Juni 2026", planEndDate: "Rabu, 28 Juni 2026",
    actualStartDate: "-",
    services: [
      { item: "E1 - Rem Mobil", description: "Ganti Kampas Rem", quantity: 1, priceExTax: 280000, discount: "-", subtotal: 280000, total: 280000, assignedTo: "Agus", status: "Waiting", estimatedTime: "45 menit" },
    ],
    spareparts: [],
  },
  "WO-006": {
    documentNumber: "WO-006", soNumber: "SO-006", soDocument: "SRO/006/26060155",
    customer: { name: "PT Transport Jaya", phone: "021-333-4444" }, registrationNo: "B 1112 MN",
    vehicleMake: "ISUZU", vehicleModel: "ELF", vehicleType: "TRUCK", year: "2019", color: "BIRU", odometer: "120.000",
    store: "Wijaya Motor - One Stop Service", serviceAdvisor: "Ani", mekanik: "Bambang",
    status: "IN PROGRESS", planStartDate: "Minggu, 25 Juni 2026", planEndDate: "Selasa, 27 Juni 2026",
    actualStartDate: "Minggu, 25 Juni 2026 07:30",
    services: [
      { item: "F1 - Overhaul", description: "Overhaul Mesin", quantity: 1, priceExTax: 2500000, discount: "5%", subtotal: 2375000, total: 2375000, assignedTo: "Bambang", status: "In Progress", estimatedTime: "480 menit" },
    ],
    spareparts: [
      { code: "PST-001", name: "Piston Kit", qty: 4, price: 450000, total: 1800000 },
      { code: "GLK-001", name: "Gasket Kit", qty: 1, price: 350000, total: 350000 },
    ],
  },
};

// Handle SO-generated WO document numbers (e.g. SWO/002/26060151)
const soGeneratedWOs: Record<string, any> = {
  "SWO/002/26060151": {
    documentNumber: "SWO/002/26060151",
    soNumber: "SO-002",
    soDocument: "SRO/002/26060150",
    customer: { name: "PT Maju Jaya", phone: "021-555-1234" },
    registrationNo: "B 5678 EF",
    vehicleMake: "HONDA",
    vehicleModel: "CIVIC",
    vehicleType: "CAR",
    year: "2021",
    color: "HITAM",
    odometer: "78.450",
    store: "Wijaya Motor - One Stop Service",
    serviceAdvisor: "Ani",
    mekanik: "-",
    status: "IN PROGRESS",
    planStartDate: "Rabu, 26 Juni 2026",
    planEndDate: "Rabu, 26 Juni 2026",
    actualStartDate: "Rabu, 26 Juni 2026 10:45",
    services: [
      { item: "A1 - Ganti Oli Mesin", description: "Ganti Oli", quantity: 1, priceExTax: 250000, discount: "-", subtotal: 250000, total: 250000, assignedTo: "-", status: "In Progress", estimatedTime: "30 menit" },
    ],
    spareparts: [],
  },
};

const allWOs = { ...woData, ...soGeneratedWOs };
const fmt = (n: number) => n.toLocaleString("id-ID");

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    DRAFT: "#6b7280",
    CREATED: "#fe9339",
    "WAITING STOCK": "#fe9339",
    "IN PROGRESS": "#0176d3",
    QC: "#8b5cf6",
    COMPLETED: "#2e844a",
    CANCELLED: "#ea001e",
  };
  return map[s] || "#6b7280";
};

const workflowSteps = ["DRAFT", "IN PROGRESS", "QC", "COMPLETED"];

export default function WorkOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const woNo = params.no as string;
  const [activeTab, setActiveTab] = useState<"details" | "spareparts" | "changes">("details");

  const wo = allWOs[woNo];

  if (!wo) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/work-orders")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Work Order tidak ditemukan: {woNo}</p></div>
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(wo.status);
  const totalServiceCost = wo.services.reduce((s: number, x: any) => s + x.total, 0);
  const totalSparepartCost = wo.spareparts.reduce((s: number, x: any) => s + x.total, 0);
  const grandTotal = totalServiceCost + totalSparepartCost;

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Tabs */}
      <div style={S.tabBar}>
        {(["details", "spareparts", "changes"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            ...S.tab,
            color: activeTab === t ? "#fff" : "#444746",
            background: activeTab === t ? "#0176d3" : "#ecebea",
            fontWeight: activeTab === t ? 600 : 400,
          }}>
            {t === "details" ? "Details" : t === "spareparts" ? "Spareparts" : "Changes"}
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
              <div style={{ display: "flex", gap: 6 }}>
                {workflowSteps.map((step, i) => (
                  <span key={step} style={{
                    ...S.badge,
                    background: i <= currentStepIdx ? statusColor(step) : "transparent",
                    color: i <= currentStepIdx ? "#fff" : "#8e8f8e",
                    border: `1px solid ${i <= currentStepIdx ? statusColor(step) : "#d8d8d8"}`,
                  }}>{step}</span>
                ))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button style={S.actionBtn}><Printer size={14} /> Print</button>
            </div>
          </div>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
            {/* Left Column */}
            <div>
              <F label="DOCUMENT NUMBER" value={wo.documentNumber} />
              <F label="SERVICE ORDER" value={wo.soDocument} link onClick={() => router.push(`/service-orders/${wo.soNumber}`)} />
              <F label="STORE" value={wo.store} link />
              <F label="CUSTOMER" value={wo.customer.name} link />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, marginTop: -4 }}>
                <span style={{ fontSize: 13, color: "#444746" }}>{wo.customer.phone}</span>
              </div>
              <F label="REGISTRATION NO" value={wo.registrationNo} />
              <F label="SERVICE ADVISOR" value={wo.serviceAdvisor} link />
              <F label="MEKANIK" value={wo.mekanik} />
            </div>
            {/* Right Column */}
            <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
              <F label="VEHICLE" value={`${wo.vehicleMake} ${wo.vehicleModel}`} />
              <F label="VEHICLE TYPE" value={wo.vehicleType} />
              <F label="YEAR" value={wo.year} />
              <F label="COLOR" value={wo.color} />
              <F label="ODOMETER" value={wo.odometer} />
              <F label="PLAN START" value={wo.planStartDate} />
              <F label="PLAN END" value={wo.planEndDate} />
              <F label="ACTUAL START" value={wo.actualStartDate} />
            </div>
          </div>

          {/* Services */}
          <h3 style={S.sectionTitle}>Services</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  <th style={S.th}>Item</th>
                  <th style={S.th}>Description</th>
                  <th style={S.th}>Qty</th>
                  <th style={S.th}>Assigned To</th>
                  <th style={S.th}>Est. Time</th>
                  <th style={S.th}>Status</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {wo.services.map((svc: any, i: number) => (
                  <tr key={i} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{svc.item}</td>
                    <td style={S.td}>{svc.description}</td>
                    <td style={S.td}>{svc.quantity}</td>
                    <td style={S.td}>{svc.assignedTo}</td>
                    <td style={S.td}>{svc.estimatedTime}</td>
                    <td style={S.td}>
                      <span style={{ ...S.pill, background: svc.status === "Completed" ? "#2e844a" : svc.status === "In Progress" ? "#0176d3" : "#fe9339" }}>{svc.status}</span>
                    </td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(svc.total)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
                  <td colSpan={7} style={S.td}></td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(totalServiceCost)}</td>
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
          {wo.spareparts.length > 0 ? (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 36 }}>No.</th>
                    <th style={S.th}>Code</th>
                    <th style={S.th}>Name</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Price</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {wo.spareparts.map((sp: any, i: number) => (
                    <tr key={i} style={S.tr}>
                      <td style={S.td}>{i + 1}</td>
                      <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{sp.code}</td>
                      <td style={S.td}>{sp.name}</td>
                      <td style={{ ...S.td, textAlign: "right" }}>{sp.qty}</td>
                      <td style={{ ...S.td, textAlign: "right" }}>{fmt(sp.price)}</td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(sp.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
                    <td colSpan={5} style={S.td}></td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(totalSparepartCost)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          ) : (
            <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Belum ada sparepart yang digunakan.</p></div>
          )}

          {/* Grand Total */}
          <div style={{ marginTop: 16, padding: "12px 16px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ fontSize: 13, fontWeight: 600, color: "#444746" }}>TOTAL (Services + Spareparts)</span>
            <span style={{ fontSize: 15, fontWeight: 700, color: "#001526" }}>Rp {fmt(grandTotal)}</span>
          </div>
        </div>
      )}

      {/* Changes Tab */}
      {activeTab === "changes" && (
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Riwayat perubahan belum tersedia.</p></div>
      )}
    </div>
  );
}

/* ─── Field Component ─── */
function F({ label, value, link = false, onClick }: { label: string; value: string; link?: boolean; onClick?: () => void }) {
  return (
    <div style={{ marginBottom: 10, cursor: link ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526", display: "flex", alignItems: "center", gap: 4 }}>
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
};
