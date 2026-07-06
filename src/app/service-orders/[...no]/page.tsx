"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, FileText, Phone, ChevronRight, CheckCircle, Wrench, ExternalLink, Briefcase } from "lucide-react";

const initialOrdersData: Record<string, any> = {
  "SRO/001/26060149": {
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
    project: { id: "PRJ/004/26060620", name: "Ganti Oli & Tune Up Fleet" },
    services: [
      { item: "A3 - Spooring Mobil Kelas I", description: "Spooring", estimatedTime: "", quantity: 1, priceExTax: 375000, discount: "10%", subtotal: 337500, tax: 0, otherTax: 0, total: 337500 },
      { item: "B4 - Balancing Ring >19\"", description: "Balancing", estimatedTime: "", quantity: 4, priceExTax: 60000, discount: "10%", subtotal: 216000, tax: 0, otherTax: 0, total: 216000 },
      { item: "JAS.NT.001 - JASA NON TRACKING", description: "NITRO FILL (BARU)", estimatedTime: "", quantity: 4, priceExTax: 20000, discount: "-", subtotal: 80000, tax: 0, otherTax: 0, total: 80000 },
    ],
    workOrders: [],
  },
  "SRO/002/26060150": {
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
    project: { id: "PRJ/001/26040410", name: "Service Berkala Fleet PT Maju Jaya" },
    services: [
      { item: "A1 - Ganti Oli Mesin", description: "Ganti Oli", estimatedTime: "30 menit", quantity: 1, priceExTax: 250000, discount: "-", subtotal: 250000, tax: 0, otherTax: 0, total: 250000 },
    ],
    workOrders: [
      { documentNumber: "SWO/002/26060151", createdDate: "26-Jun-2026 10:45 AM", status: "IN PROGRESS" },
    ],
  },
  "SRO/003/26060152": {
    documentNumber: "SRO/003/26060152",
    type: "General",
    store: "Wijaya Motor - One Stop Service",
    customer: { name: "Siti Rahmawati", phone: "0813-5678-9012" },
    registrationNo: "B 9012 GH",
    planServiceDate: "Kamis, 27 Juni 2026",
    planServiceTime: "08:00",
    serviceAdvisor: "Rudi",
    salesperson: "-",
    bookingSource: "Walk-in",
    referenceNumber: "-",
    vehicleType: "CAR",
    vehicleMake: "MITSUBISHI",
    vehicleModel: "PAJERO",
    odometer: "62.100",
    year: "2020",
    color: "PUTIH",
    status: "APPROVED",
    project: { id: "PRJ/002/26050501", name: "Overhaul Mesin Isuzu Elf" },
    services: [
      { item: "C1 - Service Berkala 10K", description: "Service Umum", estimatedTime: "90 menit", quantity: 1, priceExTax: 450000, discount: "-", subtotal: 450000, tax: 0, otherTax: 0, total: 450000 },
      { item: "A1 - Ganti Oli Mesin", description: "Ganti Oli", estimatedTime: "30 menit", quantity: 1, priceExTax: 250000, discount: "-", subtotal: 250000, tax: 0, otherTax: 0, total: 250000 },
    ],
    workOrders: [
      { documentNumber: "SWO/003/26060152", createdDate: "26-Jun-2026 09:00 AM", status: "COMPLETED" },
    ],
  },
  "SRO/004/26060153": {
    documentNumber: "SRO/004/26060153",
    type: "General",
    store: "Wijaya Motor - One Stop Service",
    customer: { name: "CV Berkah Abadi", phone: "021-777-8888" },
    registrationNo: "B 3456 IJ",
    planServiceDate: "Sabtu, 24 Juni 2026",
    planServiceTime: "08:00",
    serviceAdvisor: "Budi",
    salesperson: "-",
    bookingSource: "Walk-in",
    referenceNumber: "-",
    vehicleType: "CAR",
    vehicleMake: "SUZUKI",
    vehicleModel: "ERTIGA",
    odometer: "15.200",
    year: "2023",
    color: "MERAH",
    status: "DRAFT",
    project: { id: "PRJ/003/26060601", name: "Perawatan Berkala Q3 2026" },
    services: [
      { item: "D1 - Tune Up", description: "Tune Up Mesin", estimatedTime: "120 menit", quantity: 1, priceExTax: 350000, discount: "-", subtotal: 350000, tax: 0, otherTax: 0, total: 350000 },
    ],
    workOrders: [],
  },
  "SRO/005/26060154": {
    documentNumber: "SRO/005/26060154",
    type: "General",
    store: "Wijaya Motor - One Stop Service",
    customer: { name: "Ahmad Fauzi", phone: "0812-999-0000" },
    registrationNo: "B 7890 KL",
    planServiceDate: "Senin, 26 Juni 2026",
    planServiceTime: "09:30",
    serviceAdvisor: "Ani",
    salesperson: "-",
    bookingSource: "WhatsApp",
    referenceNumber: "-",
    vehicleType: "CAR",
    vehicleMake: "DAIHATSU",
    vehicleModel: "XENIA",
    odometer: "33.500",
    year: "2022",
    color: "ABU-ABU",
    status: "CANCELLED",
    project: null,
    services: [
      { item: "E1 - Rem Mobil", description: "Ganti Kampas Rem", estimatedTime: "45 menit", quantity: 1, priceExTax: 280000, discount: "-", subtotal: 280000, tax: 0, otherTax: 0, total: 280000 },
    ],
    workOrders: [],
  },
  "SRO/006/26060155": {
    documentNumber: "SRO/006/26060155",
    type: "General",
    store: "Wijaya Motor - One Stop Service",
    customer: { name: "PT Transport Jaya", phone: "021-333-4444" },
    registrationNo: "B 1112 MN",
    planServiceDate: "Minggu, 25 Juni 2026",
    planServiceTime: "07:30",
    serviceAdvisor: "Budi",
    salesperson: "-",
    bookingSource: "Phone",
    referenceNumber: "-",
    vehicleType: "TRUCK",
    vehicleMake: "ISUZU",
    vehicleModel: "ELF",
    odometer: "120.000",
    year: "2019",
    color: "BIRU",
    status: "DELIVERED",
    project: { id: "PRJ/001/26040410", name: "Service Berkala Fleet PT Maju Jaya" },
    services: [
      { item: "F1 - Overhaul", description: "Overhaul Mesin", estimatedTime: "480 menit", quantity: 1, priceExTax: 2500000, discount: "5%", subtotal: 2375000, tax: 0, otherTax: 0, total: 2375000 },
    ],
    workOrders: [],
  },
  "SRO/007/26060143": {
    documentNumber: "SRO/007/26060143",
    type: "General",
    store: "Wijaya Motor - One Stop Service",
    customer: { name: "CV Berkah Abadi", phone: "021-777-8888" },
    registrationNo: "B 1314 OP",
    planServiceDate: "Jumat, 23 Juni 2026",
    planServiceTime: "14:00",
    serviceAdvisor: "Rudi",
    salesperson: "-",
    bookingSource: "Walk-in",
    referenceNumber: "-",
    vehicleType: "CAR",
    vehicleMake: "MITSUBISHI",
    vehicleModel: "L300",
    odometer: "89.000",
    year: "2018",
    color: "PUTIH",
    status: "CANCELLED",
    project: null,
    services: [
      { item: "G1 - Service AC", description: "Service AC Mobil", estimatedTime: "60 menit", quantity: 1, priceExTax: 350000, discount: "-", subtotal: 350000, tax: 0, otherTax: 0, total: 350000 },
    ],
    workOrders: [],
  },
};

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function ServiceOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNo = Array.isArray(params.no) ? params.no.join("/") : (params.no as string);
  const [activeTab, setActiveTab] = useState<"details" | "docref" | "changes">("details");
  const [orders, setOrders] = useState(initialOrdersData);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDeliverConfirm, setShowDeliverConfirm] = useState(false);
  const [showCreateWOConfirm, setShowCreateWOConfirm] = useState(false);

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

  const handleDeliver = () => {
    setOrders((prev) => ({
      ...prev,
      [orderNo]: { ...prev[orderNo], status: "DELIVERED" },
    }));
    setShowDeliverConfirm(false);
  };

  const handleCreateWO = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }).replace(/\s/g, "-");
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: true });
    const newWONo = `WO-${orderNo.replace("SO-", "")}`;
    const newWO = {
      documentNumber: newWONo,
      createdDate: `${dateStr} ${timeStr}`,
      status: "CREATED",
    };
    setOrders((prev) => ({
      ...prev,
      [orderNo]: {
        ...prev[orderNo],
        workOrders: [newWO],
      },
    }));
    setShowCreateWOConfirm(false);
    setActiveTab("docref");
  };

  const totalQty = order.services.reduce((s: number, x: any) => s + x.quantity, 0);
  const grandTotal = order.services.reduce((s: number, x: any) => s + x.total, 0);
  const isDraft = order.status === "DRAFT";
  const isDelivered = order.status === "DELIVERED";
  const isApproved = order.status === "APPROVED";
  const hasWO = order.workOrders.length > 0;
  const wo = hasWO ? order.workOrders[0] : null;

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
                <span style={{ ...S.badge, ...(order.status === "DELIVERED" ? S.badgeActive : S.badgeInactive) }}>DELIVERED</span>
                <span style={{ ...S.badge, ...(order.status === "APPROVED" ? S.badgeActive : S.badgeInactive) }}>APPROVED</span>
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {isDraft && (
                <button onClick={() => setShowDeliverConfirm(true)} style={{ ...S.actionBtn, background: "#2563eb", color: "#fff", border: "1px solid #2563eb" }}>
                  <CheckCircle size={14} /> Deliver
                </button>
              )}
              {isDelivered && (
                <>
                  <button onClick={() => setShowApproveConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                    <CheckCircle size={14} /> Approve
                  </button>
                  <button onClick={() => setShowCreateWOConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                    <Wrench size={14} /> Create Work Orders
                  </button>
                </>
              )}
              {isApproved && !hasWO && order.services.length > 0 && (
                <button onClick={() => setShowCreateWOConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                  <Wrench size={14} /> Create Work Orders
                </button>
              )}
              {isApproved && hasWO && (
                <button onClick={() => router.push(`/work-orders/WO-${orderNo.replace("SO-", "")}`)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                  <ExternalLink size={14} /> View Work Orders
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
              <div style={{ marginBottom: 10 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>PROJECT</div>
                <div style={{ fontSize: 13, fontWeight: 500, color: "#001526", display: "flex", alignItems: "center", gap: 4 }}>
                  {order.project ? (
                    <span
                      style={{ color: "#0176d3", cursor: "pointer" }}
                      onClick={() => router.push(`/project/${order.project.id}`)}
                    >
                      <Briefcase size={13} style={{ display: "inline", marginRight: 4, verticalAlign: "-2px", color: "#0176d3" }} />
                      {order.project.name}
                      <ChevronRight size={13} style={{ display: "inline", marginLeft: 2, verticalAlign: "-2px", color: "#0176d3" }} />
                    </span>
                  ) : (
                    <span style={{ color: "#8e8f8e" }}>-</span>
                  )}
                </div>
              </div>
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
                      <th style={S.th}>Document Number</th>
                      <th style={S.th}>Created Date</th>
                      <th style={S.th}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr style={S.tr}>
                      <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>
                        <span
                          onClick={() => router.push(`/work-orders/${wo!.documentNumber}`)}
                          style={{ cursor: "pointer", textDecoration: "underline", textDecorationColor: "#0176d3" }}
                        >
                          {wo!.documentNumber}
                        </span>
                      </td>
                      <td style={S.td}>{wo!.createdDate}</td>
                      <td style={S.td}>
                        <span style={{ ...S.pill, background: wo!.status === "COMPLETED" ? "#2e844a" : wo!.status === "IN PROGRESS" ? "#0176d3" : "#fe9339" }}>{wo!.status}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            ) : (
              <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Belum ada Work Order</p></div>
            )}
          </div>
          <h3 style={S.sectionTitle}>Services</h3>
          <ServicesTable services={order.services} totalQty={totalQty} grandTotal={grandTotal} router={router} />
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
              Status akan berubah dari <strong>DELIVERED</strong> ke <strong>APPROVED</strong>. Service Order yang sudah di-approve akan masuk ke Work Orders.
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

      {/* Deliver Confirmation Modal */}
      {showDeliverConfirm && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>Deliver Service Order?</h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20, lineHeight: 1.5 }}>
              Status akan berubah dari <strong>DRAFT</strong> ke <strong>DELIVERED</strong>. SO akan dikirim ke customer untuk menunggu approval.
            </p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowDeliverConfirm(false)} style={S.actionBtn}>Batal</button>
              <button onClick={handleDeliver} style={{ ...S.actionBtn, background: "#2563eb", color: "#fff", border: "1px solid #2563eb" }}>
                <CheckCircle size={14} /> Ya, Deliver
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Work Orders Confirmation Modal */}
      {showCreateWOConfirm && (
        <div style={S.modalOverlay}>
          <div style={S.modal}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>Create Work Orders?</h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20, lineHeight: 1.5 }}>
              Work Order baru akan dibuat dari Service Order ini berdasarkan <strong>{order.services.length} service item</strong> yang terdaftar.
            </p>
            <div style={{ background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, padding: 12, marginBottom: 20 }}>
              {order.services.map((svc: any, i: number) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 13, padding: "4px 0", borderBottom: i < order.services.length - 1 ? "1px solid #ecebea" : "none" }}>
                  <span style={{ color: "#001526" }}>{svc.item}</span>
                  <span style={{ color: "#444746" }}>Qty: {svc.quantity}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCreateWOConfirm(false)} style={S.actionBtn}>Batal</button>
              <button onClick={handleCreateWO} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                <Wrench size={14} /> Ya, Create Work Orders
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
function ServicesTable({ services, totalQty, grandTotal, router }: { services: any[]; totalQty: number; grandTotal: number; router: any }) {
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
          {services.map((svc: any, i: number) => {
            const code = svc.item.split(" - ")[0].trim();
            return (
              <tr key={i} style={S.tr}>
                <td style={S.td}>{i + 1}</td>
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>
                  <span
                    onClick={() => router.push(`/master-data/services/${code}`)}
                    style={{ cursor: "pointer", textDecoration: "underline", textDecorationColor: "#0176d3" }}
                  >
                    {svc.item}
                  </span>
                </td>
                <td style={S.td}>{svc.description}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{svc.quantity}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{fmt(svc.priceExTax)}</td>
                <td style={{ ...S.td, textAlign: "center" }}>{svc.discount}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{fmt(svc.subtotal)}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{svc.tax}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{svc.otherTax}</td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(svc.total)}</td>
              </tr>
            );
          })}
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
