"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, FileText, Phone, ChevronRight, CheckCircle } from "lucide-react";

const initialOrdersData: Record<string, any> = {
  "SO-001": {
    documentNumber: "SRO/001/26060149",
    type: "General",
    store: "Wijaya Motor - One Stop Service",
    customer: { name: "Budi Santoso", phone: "0812-3456-7890" },
    registrationNo: "B 1234 CD",
    planServiceDate: "Rabu, 26 Juni 2026",
    planServiceTime: "09:00",
    serviceAdvisor: "Rudi",
    salesperson: "-",
    bookingSource: "-",
    referenceNumber: "-",
    vehicleType: "CAR",
    vehicleMake: "TOYOTA",
    vehicleModel: "AVANZA",
    odometer: "45.230",
    year: "2022",
    color: "SILVER",
    status: "DRAFT",
    services: [
      { item: "A3 - Spooring Mobil Kelas I", description: "Spooring", estimatedTime: "", quantity: 1, priceExTax: 375000, discount: "10%", subtotal: 337500, tax: 0, otherTax: 0, total: 337500 },
      { item: "B4 - Balancing Ring >19\"", description: "Balancing", estimatedTime: "", quantity: 4, priceExTax: 60000, discount: "10%", subtotal: 216000, tax: 0, otherTax: 0, total: 216000 },
      { item: "JAS.NT.001 - JASA NON TRACKING", description: "NITRO FILL (BARU)", estimatedTime: "", quantity: 4, priceExTax: 20000, discount: "-", subtotal: 80000, tax: 0, otherTax: 0, total: 80000 },
    ],
    workOrders: [],
  },
  "SO-002": {
    documentNumber: "SRO/002/26060150",
    type: "General",
    store: "Wijaya Motor - One Stop Service",
    customer: { name: "PT Maju Jaya", phone: "021-555-1234" },
    registrationNo: "B 5678 EF",
    planServiceDate: "Rabu, 26 Juni 2026",
    planServiceTime: "10:30",
    serviceAdvisor: "Ani",
    salesperson: "-",
    bookingSource: "WhatsApp",
    referenceNumber: "-",
    vehicleType: "CAR",
    vehicleMake: "HONDA",
    vehicleModel: "CIVIC",
    odometer: "78.450",
    year: "2021",
    color: "HITAM",
    status: "APPROVED",
    services: [
      { item: "A1 - Ganti Oli Mesin", description: "Ganti Oli", estimatedTime: "30 menit", quantity: 1, priceExTax: 250000, discount: "-", subtotal: 250000, tax: 0, otherTax: 0, total: 250000 },
    ],
    workOrders: [
      { documentNumber: "SWO/002/26060151", createdDate: "26-Jun-2026 10:45 AM", status: "IN PROGRESS" },
    ],
  },
};

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function ServiceOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNo = params.no as string;
  const [activeTab, setActiveTab] = useState<"details" | "docref" | "changes">("details");
  const [orders, setOrders] = useState(initialOrdersData);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);

  const order = orders[orderNo];

  if (!order) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/service-orders")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {orderNo}</p></div>
      </div>
    );
  }

  const handleApprove = () => {
    setOrders((prev) => ({
      ...prev,
      [orderNo]: { ...prev[orderNo], status: "APPROVED" },
    }));
    setShowApproveConfirm(false);
  };

  const totalQty = order.services.reduce((s: number, x: any) => s + x.quantity, 0);
  const grandTotal = order.services.reduce((s: number, x: any) => s + x.total, 0);
  const isDraft = order.status === "DRAFT";

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Tabs */}
      <div style={S.tabBar}>
        {(["details", "docref", "changes"] as const).map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} style={{
            ...S.tab,
            color: activeTab === t ? "#fff" : "#444746",
            background: activeTab === t ? "#0176d3" : "#ecebea",
            fontWeight: activeTab === t ? 600 : 400,
          }}>
            {t === "details" ? "Details" : t === "docref" ? "Document Reference" : "Changes"}
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
                <span style={{ ...S.badge, ...(order.status === "DRAFT" ? S.badgeActive : S.badgeInactive) }}>DRAFT</span>
                <span style={{ ...S.badge, ...(order.status === "APPROVED" ? S.badgeActive : S.badgeInactive) }}>APPROVED</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {isDraft && (
                <button onClick={() => setShowApproveConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                  <CheckCircle size={14} /> Approve
                </button>
              )}
              <button style={S.actionBtn}><Printer size={14} /> Print</button>
              <button style={S.actionBtn}><FileText size={14} /> Proforma Invoice</button>
            </div>
          </div>

          {/* Two-column layout */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
            {/* Left Column */}
            <div>
              <F label="DOCUMENT NUMBER" value={order.documentNumber} />
              <F label="TYPE" value={order.type} />
              <F label="STORE" value={order.store} link />
              <F label="CUSTOMER" value={order.customer.name} link />
              <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 12, marginTop: -4 }}>
                <Phone size={12} style={{ color: "#444746" }} />
                <span style={{ fontSize: 13, color: "#444746" }}>{order.customer.phone}</span>
              </div>
              <F label="REGISTRATION NO" value={order.registrationNo} />
              <F label="PLAN SERVICE DATE" value={order.planServiceDate} />
              <F label="PLAN SERVICE TIME" value={order.planServiceTime} />
              <F label="SERVICE ADVISOR" value={order.serviceAdvisor} link />
              <F label="SALESPERSON" value={order.salesperson} />
              <F label="BOOKING SOURCE" value={order.bookingSource} />
              <F label="REFERENCE NUMBER" value={order.referenceNumber} />
            </div>
            {/* Right Column */}
            <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
              <F label="VEHICLE TYPE" value={order.vehicleType} />
              <F label="VEHICLE MAKE" value={order.vehicleMake} />
              <F label="VEHICLE MODEL" value={order.vehicleModel} />
              <F label="ODOMETER" value={order.odometer} />
              <F label="YEAR" value={order.year} />
              <F label="COLOR" value={order.color} />
            </div>
          </div>
        </div>
      )}

      {/* Document Reference Tab */}
      {activeTab === "docref" && (
        <div>
          <div style={{ marginBottom: 20 }}>
            <h3 style={S.sectionTitle}>Service Work Orders</h3>
            {order.workOrders.length > 0 ? (
              <div style={S.tableWrap}>
                <table style={S.table}>
                  <thead>
                    <tr>
                      <th style={{ ...S.th, width: 40 }}>No.</th>
                      <th style={S.th}>Document Number</th>
                      <th style={S.th}>Created Date</th>
                      <th style={S.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {order.workOrders.map((wo: any, i: number) => (
                      <tr key={wo.documentNumber} style={S.tr}>
                        <td style={S.td}>{i + 1}</td>
                        <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{wo.documentNumber}</td>
                        <td style={S.td}>{wo.createdDate}</td>
                        <td style={S.td}>
                          <span style={{ ...S.pill, background: "#ea001e" }}>{wo.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Belum ada Work Order</p></div>
            )}
          </div>
          <h3 style={S.sectionTitle}>Services</h3>
          <ServicesTable services={order.services} totalQty={totalQty} grandTotal={grandTotal} />
        </div>
      )}

      {/* Changes Tab */}
      {activeTab === "changes" && (
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Riwayat perubahan belum tersedia.</p></div>
      )}

      {/* Approve Confirmation Modal */}
      {showApproveConfirm && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>Approve Service Order?</h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20, lineHeight: 1.5 }}>
              Status akan berubah dari <strong>DRAFT</strong> ke <strong>APPROVED</strong>. Service Order yang sudah di-approve akan masuk ke Work Orders.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowApproveConfirm(false)} style={S.actionBtn}>Batal</button>
              <button onClick={handleApprove} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                <CheckCircle size={14} /> Ya, Approve
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── Field Component ─── */
function F({ label, value, link = false }: { label: string; value: string; link?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526", display: "flex", alignItems: "center", gap: 4 }}>
        {value}
        {link && <ChevronRight size={13} style={{ color: "#0176d3" }} />}
      </div>
    </div>
  );
}

/* ─── Services Table ─── */
function ServicesTable({ services, totalQty, grandTotal }: { services: any[]; totalQty: number; grandTotal: number }) {
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead>
          <tr>
            <th style={{ ...S.th, width: 36 }}>No.</th>
            <th style={S.th}>Item</th>
            <th style={S.th}>Description</th>
            <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
            <th style={{ ...S.th, textAlign: "right" }}>Price Ex Tax</th>
            <th style={{ ...S.th, textAlign: "center" }}>Disc</th>
            <th style={{ ...S.th, textAlign: "right" }}>Subtotal</th>
            <th style={{ ...S.th, textAlign: "right" }}>Tax</th>
            <th style={{ ...S.th, textAlign: "right" }}>Other Tax</th>
            <th style={{ ...S.th, textAlign: "right" }}>Total</th>
          </tr>
        </thead>
        <tbody>
          {services.map((svc: any, i: number) => (
            <tr key={i} style={S.tr}>
              <td style={S.td}>{i + 1}</td>
              <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{svc.item}</td>
              <td style={S.td}>{svc.description}</td>
              <td style={{ ...S.td, textAlign: "right" }}>{svc.quantity}</td>
              <td style={{ ...S.td, textAlign: "right" }}>{fmt(svc.priceExTax)}</td>
              <td style={{ ...S.td, textAlign: "center" }}>{svc.discount}</td>
              <td style={{ ...S.td, textAlign: "right" }}>{fmt(svc.subtotal)}</td>
              <td style={{ ...S.td, textAlign: "right" }}>{svc.tax}</td>
              <td style={{ ...S.td, textAlign: "right" }}>{svc.otherTax}</td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(svc.total)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
            <td colSpan={3} style={S.td}></td>
            <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totalQty}</td>
            <td colSpan={2} style={S.td}></td>
            <td colSpan={2} style={S.td}></td>
            <td style={{ ...S.td, textAlign: "right", fontWeight: 700, fontSize: 13 }}>{fmt(grandTotal)}</td>
          </tr>
        </tfoot>
      </table>
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
  badgeActive: { background: "#032d47", color: "#fff", border: "1px solid #032d47" },
  badgeInactive: { background: "transparent", color: "#8e8f8e", border: "1px solid #d8d8d8" },
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
