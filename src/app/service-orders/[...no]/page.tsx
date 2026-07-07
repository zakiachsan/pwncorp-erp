"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, FileText, Phone, CheckCircle, Wrench, ExternalLink, Briefcase } from "lucide-react";

const initialOrdersData: Record<string, any> = {
  "SRO/001/26060149": {
    documentNumber: "SRO/001/26060149", type: "General", store: "Wijaya Motor - One Stop Service",
    customer: { name: "Budi Santoso", phone: "0812-3456-7890" }, registrationNo: "B 1234 CD",
    planServiceDate: "Rabu, 26 Juni 2026", planServiceTime: "09:00", serviceAdvisor: "Rudi", salesperson: "-", bookingSource: "-", referenceNumber: "-",
    vehicleType: "CAR", vehicleMake: "TOYOTA", vehicleModel: "AVANZA", odometer: "45.230", year: "2022", color: "SILVER", status: "DRAFT",
    project: { id: "PRJ/004/26060620", name: "Ganti Oli & Tune Up Fleet" },
    services: [
      { item: "A3 - Spooring Mobil Kelas I", description: "Spooring", estimatedTime: "", quantity: 1, priceExTax: 375000, discount: "10%", subtotal: 337500, tax: 0, otherTax: 0, total: 337500 },
      { item: "B4 - Balancing Ring >19\"", description: "Balancing", estimatedTime: "", quantity: 4, priceExTax: 60000, discount: "10%", subtotal: 216000, tax: 0, otherTax: 0, total: 216000 },
      { item: "JAS.NT.001 - JASA NON TRACKING", description: "NITRO FILL (BARU)", estimatedTime: "", quantity: 4, priceExTax: 20000, discount: "-", subtotal: 80000, tax: 0, otherTax: 0, total: 80000 },
    ],
    spareparts: [
      { code: "OLM-001", name: "Oli Mesin 5W-30", qty: 3, price: 85000, total: 255000 },
    ],
    workOrders: [],
  },
  "SRO/002/26060150": {
    documentNumber: "SRO/002/26060150", type: "General", store: "Wijaya Motor - One Stop Service",
    customer: { name: "PT Maju Jaya", phone: "021-555-1234" }, registrationNo: "B 5678 EF",
    planServiceDate: "Rabu, 26 Juni 2026", planServiceTime: "10:30", serviceAdvisor: "Ani", salesperson: "-", bookingSource: "WhatsApp", referenceNumber: "-",
    vehicleType: "CAR", vehicleMake: "HONDA", vehicleModel: "CIVIC", odometer: "78.450", year: "2021", color: "HITAM", status: "APPROVED",
    project: { id: "PRJ/001/26040410", name: "Service Berkala Fleet PT Maju Jaya" },
    services: [{ item: "A1 - Ganti Oli Mesin", description: "Ganti Oli", estimatedTime: "30 menit", quantity: 1, priceExTax: 250000, discount: "-", subtotal: 250000, tax: 0, otherTax: 0, total: 250000 }],
    workOrders: [{ documentNumber: "SWO/002/26060151", createdDate: "26-Jun-2026 10:45 AM", status: "IN PROGRESS" }],
  },
  "SRO/003/26060152": {
    documentNumber: "SRO/003/26060152", type: "General", store: "Wijaya Motor - One Stop Service",
    customer: { name: "Siti Rahmawati", phone: "0813-5678-9012" }, registrationNo: "B 9012 GH",
    planServiceDate: "Kamis, 27 Juni 2026", planServiceTime: "08:00", serviceAdvisor: "Rudi", salesperson: "-", bookingSource: "Walk-in", referenceNumber: "-",
    vehicleType: "CAR", vehicleMake: "MITSUBISHI", vehicleModel: "PAJERO", odometer: "62.100", year: "2020", color: "PUTIH", status: "APPROVED",
    project: { id: "PRJ/002/26050501", name: "Overhaul Mesin Isuzu Elf" },
    services: [
      { item: "C1 - Service Berkala 10K", description: "Service Umum", estimatedTime: "90 menit", quantity: 1, priceExTax: 450000, discount: "-", subtotal: 450000, tax: 0, otherTax: 0, total: 450000 },
      { item: "A1 - Ganti Oli Mesin", description: "Ganti Oli", estimatedTime: "30 menit", quantity: 1, priceExTax: 250000, discount: "-", subtotal: 250000, tax: 0, otherTax: 0, total: 250000 },
    ],
    workOrders: [{ documentNumber: "SWO/003/26060152", createdDate: "26-Jun-2026 09:00 AM", status: "COMPLETED" }],
  },
  "SRO/007/26060143": {
    documentNumber: "SRO/007/26060143", type: "General", store: "Wijaya Motor - One Stop Service",
    customer: { name: "CV Berkah Abadi", phone: "021-777-8888" }, registrationNo: "B 1314 OP",
    planServiceDate: "Jumat, 23 Juni 2026", planServiceTime: "14:00", serviceAdvisor: "Rudi", salesperson: "-", bookingSource: "Walk-in", referenceNumber: "-",
    vehicleType: "CAR", vehicleMake: "MITSUBISHI", vehicleModel: "L300", odometer: "89.000", year: "2018", color: "PUTIH", status: "CANCELLED",
    project: null,
    services: [{ item: "G1 - Service AC", description: "Service AC Mobil", estimatedTime: "60 menit", quantity: 1, priceExTax: 350000, discount: "-", subtotal: 350000, tax: 0, otherTax: 0, total: 350000 }],
    workOrders: [],
  },
  "SRO/004/26060153": {
    documentNumber: "SRO/004/26060153", type: "General", store: "Wijaya Motor - One Stop Service",
    customer: { name: "CV Berkah Abadi", phone: "021-777-8888" }, registrationNo: "B 3456 IJ",
    planServiceDate: "Sabtu, 24 Juni 2026", planServiceTime: "08:00", serviceAdvisor: "Budi", salesperson: "-", bookingSource: "Walk-in", referenceNumber: "-",
    vehicleType: "CAR", vehicleMake: "SUZUKI", vehicleModel: "ERTIGA", odometer: "15.200", year: "2023", color: "MERAH", status: "DRAFT",
    project: { id: "PRJ/003/26060601", name: "Perawatan Berkala Q3 2026" },
    services: [{ item: "D1 - Tune Up", description: "Tune Up Mesin", estimatedTime: "120 menit", quantity: 1, priceExTax: 350000, discount: "-", subtotal: 350000, tax: 0, otherTax: 0, total: 350000 }],
    workOrders: [],
  },
  "SRO/005/26060154": {
    documentNumber: "SRO/005/26060154", type: "General", store: "Wijaya Motor - One Stop Service",
    customer: { name: "Ahmad Fauzi", phone: "0812-999-0000" }, registrationNo: "B 7890 KL",
    planServiceDate: "Senin, 26 Juni 2026", planServiceTime: "09:30", serviceAdvisor: "Ani", salesperson: "-", bookingSource: "WhatsApp", referenceNumber: "-",
    vehicleType: "CAR", vehicleMake: "DAIHATSU", vehicleModel: "XENIA", odometer: "33.500", year: "2022", color: "ABU-ABU", status: "CANCELLED",
    project: null,
    services: [{ item: "E1 - Rem Mobil", description: "Ganti Kampas Rem", estimatedTime: "45 menit", quantity: 1, priceExTax: 280000, discount: "-", subtotal: 280000, tax: 0, otherTax: 0, total: 280000 }],
    workOrders: [],
  },
  "SRO/006/26060155": {
    documentNumber: "SRO/006/26060155", type: "General", store: "Wijaya Motor - One Stop Service",
    customer: { name: "PT Transport Jaya", phone: "021-333-4444" }, registrationNo: "B 1112 MN",
    planServiceDate: "Minggu, 25 Juni 2026", planServiceTime: "07:30", serviceAdvisor: "Budi", salesperson: "-", bookingSource: "Phone", referenceNumber: "-",
    vehicleType: "TRUCK", vehicleMake: "ISUZU", vehicleModel: "ELF", odometer: "120.000", year: "2019", color: "BIRU", status: "DELIVERED",
    project: { id: "PRJ/001/26040410", name: "Service Berkala Fleet PT Maju Jaya" },
    services: [{ item: "F1 - Overhaul", description: "Overhaul Mesin", estimatedTime: "480 menit", quantity: 1, priceExTax: 2500000, discount: "5%", subtotal: 2375000, tax: 0, otherTax: 0, total: 2375000 }],
    workOrders: [],
  },
};

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function ServiceOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const orderNo = Array.isArray(params.no) ? params.no.join("/") : (params.no as string);
  const [orders, setOrders] = useState(initialOrdersData);
  const [activeTab, setActiveTab] = useState<"details" | "docref" | "changes">("details");
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showDeliverConfirm, setShowDeliverConfirm] = useState(false);
  const [showCreateWOConfirm, setShowCreateWOConfirm] = useState(false);
  const [svcLineTab, setSvcLineTab] = useState<"services" | "spareparts">("services");

  const order = orders[orderNo];
  if (!order) return <div style={{ padding: 24 }}><button onClick={() => router.push("/service-orders")} style={S.backBtn}><ArrowLeft size={16} /> Kembali</button><div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {orderNo}</p></div></div>;

  const handleApprove = () => { setOrders((prev) => ({ ...prev, [orderNo]: { ...prev[orderNo], status: "APPROVED" } })); setShowApproveConfirm(false); };
  const handleDeliver = () => { setOrders((prev) => ({ ...prev, [orderNo]: { ...prev[orderNo], status: "DELIVERED" } })); setShowDeliverConfirm(false); };
  const handleCreateWO = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }).replace(/\s/g, "-");
    const timeStr = now.toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit", hour12: true });
    setOrders((prev) => ({ ...prev, [orderNo]: { ...prev[orderNo], workOrders: [{ documentNumber: `WO-${orderNo.replace("SO-", "")}`, createdDate: `${dateStr} ${timeStr}`, status: "CREATED" }] } }));
    setShowCreateWOConfirm(false);
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
      </div>

      {/* Tab Bar */}
      <div style={S.tabBar}>
        <button onClick={() => setActiveTab("details")} style={activeTab === "details" ? S.tabActive : S.tab}>Details</button>
        <button onClick={() => setActiveTab("docref")} style={activeTab === "docref" ? S.tabActive : S.tab}>Document Reference</button>
        <button onClick={() => setActiveTab("changes")} style={activeTab === "changes" ? S.tabActive : S.tab}>Changes</button>
      </div>

      {/* ─── Details Tab ─── */}
      {activeTab === "details" && (
        <>
          {/* Workflow Actions */}
          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            {isDraft && <button onClick={() => setShowDeliverConfirm(true)} style={{ ...S.actionBtn, background: "#2563eb", color: "#fff", border: "1px solid #2563eb" }}><CheckCircle size={14} /> Deliver</button>}
            {isDelivered && <><button onClick={() => setShowApproveConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><CheckCircle size={14} /> Approve</button><button onClick={() => setShowCreateWOConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><Wrench size={14} /> Create Work Orders</button></>}
            {isApproved && !hasWO && order.services.length > 0 && <button onClick={() => setShowCreateWOConfirm(true)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><Wrench size={14} /> Create Work Orders</button>}
            {isApproved && hasWO && <button onClick={() => router.push(`/work-orders/WO-${orderNo.replace("SO-", "")}`)} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}><ExternalLink size={14} /> View Work Orders</button>}
            <button style={S.actionBtn}><Printer size={14} /> Print</button>
            <button style={S.actionBtn}><FileText size={14} /> Proforma Invoice</button>
          </div>

          {/* 3-Column Info Grid */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 16 }}>
            <div style={S.infoCol}>
              <div style={S.infoColTitle}>Customer & Store</div>
              <F2 label="Document Number" value={order.documentNumber} />
              <F2 label="Store" value={order.store} />
              <F2 label="Customer" value={order.customer.name} />
              <F2 label="Phone" value={order.customer.phone} />
              <F2 label="Registration No" value={order.registrationNo} />
              <F2 label="Booking Source" value={order.bookingSource} />
            </div>
            <div style={S.infoCol}>
              <div style={S.infoColTitle}>Schedule & Advisor</div>
              <F2 label="Plan Service Date" value={order.planServiceDate} />
              <F2 label="Plan Service Time" value={order.planServiceTime} />
              <F2 label="Service Advisor" value={order.serviceAdvisor} />
              <F2 label="Salesperson" value={order.salesperson} />
              <F2 label="Reference Number" value={order.referenceNumber} />
              <F2 label="Project" value={order.project ? order.project.name : "-"} />
            </div>
            <div style={S.infoCol}>
              <div style={S.infoColTitle}>Vehicle</div>
              <F2 label="Vehicle Type" value={order.vehicleType} />
              <F2 label="Make / Model" value={`${order.vehicleMake} ${order.vehicleModel}`} />
              <F2 label="Odometer" value={order.odometer} />
              <F2 label="Year" value={order.year} />
              <F2 label="Color" value={order.color} />
            </div>
          </div>

          {/* Line Tabs: Services | Spareparts */}
          <div style={{ marginBottom: 0, display: "flex", gap: 0 }}>
            <button onClick={() => setSvcLineTab("services")} style={{
              padding: "7px 16px", fontSize: 12, fontWeight: svcLineTab === "services" ? 600 : 400,
              color: svcLineTab === "services" ? "#0176d3" : "#444746",
              border: "none", borderBottom: svcLineTab === "services" ? "2px solid #0176d3" : "2px solid transparent",
              background: "transparent", cursor: "pointer",
            }}>Services</button>
            <button onClick={() => setSvcLineTab("spareparts")} style={{
              padding: "7px 16px", fontSize: 12, fontWeight: svcLineTab === "spareparts" ? 600 : 400,
              color: svcLineTab === "spareparts" ? "#0176d3" : "#444746",
              border: "none", borderBottom: svcLineTab === "spareparts" ? "2px solid #0176d3" : "2px solid transparent",
              background: "transparent", cursor: "pointer",
            }}>Spareparts</button>
          </div>

          {svcLineTab === "services" && (
            <ServicesTable services={order.services} totalQty={totalQty} grandTotal={grandTotal} router={router} />
          )}
          {svcLineTab === "spareparts" && (
            <SparepartTable spareparts={order.spareparts || []} />
          )}
        </>
      )}

      {/* ─── Document Reference Tab ─── */}
      {activeTab === "docref" && (
        <>
          {/* Work Orders (if any) */}
          {hasWO && (
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, fontWeight: 600, color: "#0176d3", marginBottom: 8, textTransform: "uppercase" }}>Work Orders</div>
              <div style={S.tableWrap}>
                <table style={S.table}><thead><tr><th style={S.th}>Document Number</th><th style={S.th}>Created Date</th><th style={S.th}>Status</th></tr></thead>
                  <tbody><tr style={S.tr}><td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/work-orders/${wo!.documentNumber}`)}>{wo!.documentNumber}</td><td style={S.td}>{wo!.createdDate}</td><td style={S.td}><span style={{ ...S.pill, background: wo!.status === "COMPLETED" ? "#2e844a" : wo!.status === "IN PROGRESS" ? "#0176d3" : "#fe9339" }}>{wo!.status}</span></td></tr></tbody>
                </table>
              </div>
            </div>
          )}

          {/* Services Table */}
          <div style={{ fontSize: 12, fontWeight: 600, color: "#0176d3", marginBottom: 8, textTransform: "uppercase" }}>Services</div>
          <ServicesTable services={order.services} totalQty={totalQty} grandTotal={grandTotal} router={router} />
        </>
      )}

      {/* ─── Changes Tab ─── */}
      {activeTab === "changes" && (
        <div style={S.card}>
          <p style={{ color: "#444746", fontSize: 14 }}>Riwayat perubahan belum tersedia.</p>
        </div>
      )}

      {/* Modals */}
      {showApproveConfirm && <Modal title="Approve Service Order?" message="Status akan berubah dari DELIVERED ke APPROVED." onCancel={() => setShowApproveConfirm(false)} onConfirm={handleApprove} confirmText="Ya, Approve" />}
      {showDeliverConfirm && <Modal title="Deliver Service Order?" message="Status akan berubah dari DRAFT ke DELIVERED." onCancel={() => setShowDeliverConfirm(false)} onConfirm={handleDeliver} confirmText="Ya, Deliver" />}
      {showCreateWOConfirm && <Modal title="Create Work Orders?" message={`Work Order baru dari ${order.services.length} service item.`} onCancel={() => setShowCreateWOConfirm(false)} onConfirm={handleCreateWO} confirmText="Ya, Create Work Orders" />}
    </div>
  );
}

/* ─── Compact Field ─── */
function F2({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 0", borderBottom: "1px solid #f5f5f5" }}>
      <span style={{ fontSize: 11, color: "#8e8f8e", textTransform: "uppercase" }}>{label}</span>
      <span style={{ fontSize: 12, fontWeight: 500, color: "#001526", textAlign: "right", maxWidth: "55%", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{value}</span>
    </div>
  );
}

/* ─── Services Table ─── */
function ServicesTable({ services, totalQty, grandTotal, router }: { services: any[]; totalQty: number; grandTotal: number; router: any }) {
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead><tr><th style={{ ...S.th, width: 36 }}>No.</th><th style={S.th}>Item</th><th style={S.th}>Description</th><th style={{ ...S.th, textAlign: "right" }}>Qty</th><th style={{ ...S.th, textAlign: "right" }}>Price Ex Tax</th><th style={{ ...S.th, textAlign: "center" }}>Disc</th><th style={{ ...S.th, textAlign: "right" }}>Subtotal</th><th style={{ ...S.th, textAlign: "right" }}>Tax</th><th style={{ ...S.th, textAlign: "right" }}>Other Tax</th><th style={{ ...S.th, textAlign: "right" }}>Total</th></tr></thead>
        <tbody>
          {services.map((svc: any, i: number) => {
            const code = svc.item.split(" - ")[0].trim();
            return (
              <tr key={i} style={S.tr}>
                <td style={S.td}>{i + 1}</td>
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/master-data/services/${code}`)}>{svc.item}</td>
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
        <tfoot><tr style={{ background: "#f3f3f3", fontWeight: 600 }}><td colSpan={3} style={S.td}></td><td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totalQty}</td><td colSpan={2} style={S.td}></td><td colSpan={2} style={S.td}></td><td style={{ ...S.td, textAlign: "right", fontWeight: 700, fontSize: 13 }}>{fmt(grandTotal)}</td></tr></tfoot>
      </table>
    </div>
  );
}

/* ─── Sparepart Table ─── */
function SparepartTable({ spareparts }: { spareparts: any[] }) {
  if (spareparts.length === 0) return <div style={{ ...S.tableWrap, padding: 24, textAlign: "center", color: "#8e8f8e", fontSize: 13 }}>Belum ada sparepart</div>;
  const total = spareparts.reduce((s: number, sp: any) => s + sp.total, 0);
  return (
    <div style={S.tableWrap}>
      <table style={S.table}>
        <thead><tr><th style={{ ...S.th, width: 36 }}>No.</th><th style={S.th}>Code</th><th style={S.th}>Name</th><th style={{ ...S.th, textAlign: "right" }}>Qty</th><th style={{ ...S.th, textAlign: "right" }}>Price</th><th style={{ ...S.th, textAlign: "right" }}>Total</th></tr></thead>
        <tbody>
          {spareparts.map((sp, i) => (
            <tr key={i} style={S.tr}><td style={S.td}>{i + 1}</td><td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{sp.code}</td><td style={S.td}>{sp.name}</td><td style={{ ...S.td, textAlign: "right" }}>{sp.qty}</td><td style={{ ...S.td, textAlign: "right" }}>{fmt(sp.price)}</td><td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(sp.total)}</td></tr>
          ))}
        </tbody>
        <tfoot><tr style={{ background: "#f3f3f3", fontWeight: 600 }}><td colSpan={5} style={S.td}></td><td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{fmt(total)}</td></tr></tfoot>
      </table>
    </div>
  );
}

/* ─── Modal ─── */
function Modal({ title, message, onCancel, onConfirm, confirmText }: { title: string; message: string; onCancel: () => void; onConfirm: () => void; confirmText: string }) {
  return (
    <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
      <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
        <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>{title}</h3>
        <p style={{ fontSize: 14, color: "#444746", marginBottom: 20, lineHeight: 1.5 }}>{message}</p>
        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          <button onClick={onCancel} style={S.actionBtn}>Batal</button>
          <button onClick={onConfirm} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}

/* ─── Styles ─── */
const S: Record<string, React.CSSProperties> = {
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  card: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 },
  workflowBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, marginBottom: 16 },
  tabBar: { display: "flex", gap: 0, marginBottom: 16, borderBottom: "2px solid #ecebea" },
  tab: { padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#444746", background: "transparent", border: "none", borderBottom: "2px solid transparent", marginBottom: -2, cursor: "pointer" },
  tabActive: { padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#0176d3", background: "transparent", border: "none", borderBottom: "2px solid #0176d3", marginBottom: -2, cursor: "pointer" },
  badge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" },
  badgeActive: { background: "#032d47", color: "#fff", border: "1px solid #032d47" },
  badgeInactive: { background: "transparent", color: "#8e8f8e", border: "1px solid #d8d8d8" },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  infoCol: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 12 },
  infoColTitle: { fontSize: 11, fontWeight: 700, color: "#0176d3", textTransform: "uppercase" as const, marginBottom: 8, letterSpacing: "0.04em" },
  tableWrap: { border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
  pill: { display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, color: "#fff" },
};
