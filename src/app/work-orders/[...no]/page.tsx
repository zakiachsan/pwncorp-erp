"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, ChevronRight } from "lucide-react";

const woData: Record<string, any> = {
  "SWO/001/26060149": {
    documentNumber: "SWO/001/26060149",
    soNumber: "SRO/001/26060149",
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
  "SWO/002/26060151": {
    documentNumber: "SWO/002/26060151",
    soNumber: "SRO/002/26060150",
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
  "SWO/003/26060152": {
    documentNumber: "SWO/003/26060152", soNumber: "SRO/003/26060152", soDocument: "SRO/003/26060152",
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
  "SWO/004/26060153": {
    documentNumber: "SWO/004/26060153", soNumber: "SRO/004/26060153", soDocument: "SRO/004/26060153",
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
  "SWO/005/26060154": {
    documentNumber: "SWO/005/26060154", soNumber: "SRO/005/26060154", soDocument: "SRO/005/26060154",
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
  "SWO/006/26060155": {
    documentNumber: "SWO/006/26060155", soNumber: "SRO/006/26060155", soDocument: "SRO/006/26060155",
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
  "SWO/002/26060151-alt": {
    documentNumber: "SWO/002/26060151",
    soNumber: "SRO/002/26060150",
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
  const woNo = Array.isArray(params.no) ? params.no.join("/") : (params.no as string);
  const [activeTab, setActiveTab] = useState<"details" | "docRef" | "stockOrders" | "changes" | "photos">("details");
  const [showPrint, setShowPrint] = useState(false);
  
  const [activeLineTab, setActiveLineTab] = useState<"services" | "spareparts" | "stockOutgoings">("services");

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
          <button style={S.actionBtn} onClick={() => setShowPrint(true)}><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Top Tabs */}
      <div style={S.tabBar}>
        {([
          { key: "details", label: "Details" },
          { key: "docRef", label: "Document Reference" },
          { key: "stockOrders", label: "Stock Orders" },
          { key: "changes", label: "Changes" },
          { key: "photos", label: "Photos" },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)} style={{
            ...S.tab,
            color: activeTab === t.key ? "#fff" : "#444746",
            background: activeTab === t.key ? "#0176d3" : "#ecebea",
            fontWeight: activeTab === t.key ? 600 : 400,
          }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div>
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

          {/* Notes */}
          <h3 style={S.sectionTitle}>Notes</h3>
          <div style={{ ...S.card, minHeight: 60, marginBottom: 20 }}>
            <p style={{ color: "#8e8f8e", fontSize: 13, fontStyle: "italic" }}>Tidak ada catatan</p>
          </div>

          {/* Line Item Tabs + Table */}
          <div style={{ display: "flex", alignItems: "center", gap: 0, marginBottom: 0 }}>
            {([
              { key: "services", label: "Services" },
              { key: "spareparts", label: "Spareparts" },
              { key: "stockOutgoings", label: "Stock Outgoings" },
            ] as const).map((t) => (
              <button key={t.key} onClick={() => setActiveLineTab(t.key)} style={{
                ...S.lineTab,
                color: activeLineTab === t.key ? "#fff" : "#444746",
                background: activeLineTab === t.key ? "#0176d3" : "#ecebea",
                fontWeight: activeLineTab === t.key ? 600 : 400,
                borderRadius: t.key === "services" ? "6px 0 0 0" : t.key === "stockOutgoings" ? "0 6px 0 0" : 0,
              }}>
                {t.label}
              </button>
            ))}
          </div>

          {/* Services Table */}
          {activeLineTab === "services" && (
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
          )}

          {/* Spareparts Table */}
          {activeLineTab === "spareparts" && (
            <div>
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

          {/* Stock Outgoings Table */}
          {activeLineTab === "stockOutgoings" && (
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 36 }}>No.</th>
                    <th style={S.th}>SKU</th>
                    <th style={S.th}>Product Code</th>
                    <th style={S.th}>Service</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Quantity</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada stock outgoings.</td>
                  </tr>
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Document Reference Tab */}
      {activeTab === "docRef" && (
        <div>
          <h3 style={S.sectionTitle}>Service Order</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  <th style={S.th}>Document Number</th>
                  <th style={S.th}>Created Date</th>
                  <th style={S.th}>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr style={S.tr}>
                  <td style={S.td}>1</td>
                  <td
                    style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}
                    onClick={() => router.push(`/service-orders/${wo.soNumber}`)}
                  >{wo.soDocument}</td>
                  <td style={S.td}>24-Jun-2026 04:42 PM</td>
                  <td style={S.td}>
                    <span style={{ ...S.pill, background: "#fe9339" }}>APPROVED</span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Stock Orders Tab */}
      {activeTab === "stockOrders" && (
        <div>
          <h3 style={S.sectionTitle}>Stock Orders</h3>
          <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Belum ada stock orders.</p></div>
        </div>
      )}

      {/* Changes Tab */}
      {activeTab === "changes" && (
        <div>
          <h3 style={S.sectionTitle}>Perubahan</h3>
          <div style={{ ...S.card, marginBottom: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#001526" }}>CREATED BY</div>
                <div style={{ fontSize: 12, color: "#444746" }}>NANDA SALSA (nandasalsakamelia832@gmail.com)</div>
              </div>
              <div style={{ fontSize: 12, color: "#8e8f8e" }}>24-Jun-2026 04:42 PM</div>
            </div>
          </div>
          <div style={S.card}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: "#001526" }}>UPDATED BY</div>
                <div style={{ fontSize: 12, color: "#444746" }}>NANDA SALSA (nandasalsakamelia832@gmail.com)</div>
              </div>
              <div style={{ fontSize: 12, color: "#8e8f8e" }}>24-Jun-2026 04:42 PM</div>
            </div>
          </div>
        </div>
      )}

      {/* Photos Tab */}
      {activeTab === "photos" && (
        <div>
          <h3 style={S.sectionTitle}>Foto Service</h3>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
            {[
              { id: 1, photo: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=400&h=300&fit=crop", caption: "Pengecekan mesin sebelum service", uploadedBy: "Hendra", date: "24 Jun 2026 09:15 AM" },
              { id: 2, photo: "https://images.unsplash.com/photo-1558618666-fcd25c85f82e?w=400&h=300&fit=crop", caption: "Proses penggantian oli mesin", uploadedBy: "Hendra", date: "24 Jun 2026 10:30 AM" },
              { id: 3, photo: "https://images.unsplash.com/photo-1625047509248-ec889cbff17f?w=400&h=300&fit=crop", caption: "Spooring mobil kelas I", uploadedBy: "WOYO", date: "24 Jun 2026 11:45 AM" },
              { id: 4, photo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop", caption: "Balancing ring >19 inch", uploadedBy: "Toha", date: "24 Jun 2026 02:15 PM" },
              { id: 5, photo: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?w=400&h=300&fit=crop", caption: "Pengecekan akhir sebelum serah terima", uploadedBy: "Bambang", date: "25 Jun 2026 08:00 AM" },
            ].map((p) => (
              <div key={p.id} style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden" }}>
                <img
                  src={p.photo}
                  alt={p.caption}
                  style={{ width: "100%", height: 200, objectFit: "cover" }}
                />
                <div style={{ padding: 12 }}>
                  <div style={{ fontSize: 13, fontWeight: 500, color: "#001526", marginBottom: 4 }}>{p.caption}</div>
                  <div style={{ fontSize: 11, color: "#8e8f8e" }}>Oleh: {p.uploadedBy} • {p.date}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Print Preview Modal */}
      {showPrint && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)" }} onClick={() => setShowPrint(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 12, boxShadow: "0 25px 50px rgba(0,0,0,0.25)", width: "100%", maxWidth: 800, maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #ecebea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Service Work Order</h2>
                <p style={{ fontSize: 12, color: "#8e8f8e", margin: "4px 0 0" }}>{woNo}</p>
              </div>
              <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#fff", background: "#0176d3", border: "none", borderRadius: 6, cursor: "pointer" }}>
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
            <div style={{ padding: "24px 32px" }}>
              <div style={{ display: "flex", gap: 6, marginBottom: 20 }}>
                {workflowSteps.map((step, i) => (
                  <span key={step} style={{ padding: "4px 12px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: i === currentStepIdx ? "#0176d3" : "transparent", color: i === currentStepIdx ? "#fff" : "#8e8f8e", border: `1px solid ${i === currentStepIdx ? "#0176d3" : "#d8d8d8"}` }}>{step}</span>
                ))}
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <F label="DOCUMENT NUMBER" value={wo.documentNumber} />
                  <F label="SERVICE ORDER" value={wo.soDocument} />
                  <F label="STORE" value={wo.store} />
                  <F label="CUSTOMER" value={wo.customer.name} />
                  <F label="REGISTRATION NO" value={wo.registrationNo} />
                  <F label="SERVICE ADVISOR" value={wo.serviceAdvisor} />
                  <F label="MEKANIK" value={wo.mekanik} />
                </div>
                <div>
                  <F label="VEHICLE" value={`${wo.vehicleMake} ${wo.vehicleModel}`} />
                  <F label="VEHICLE TYPE" value={wo.vehicleType} />
                  <F label="YEAR" value={wo.year} />
                  <F label="COLOR" value={wo.color} />
                  <F label="ODOMETER" value={wo.odometer} />
                  <F label="PLAN START" value={wo.planStartDate} />
                  <F label="PLAN END" value={wo.planEndDate} />
                </div>
              </div>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Services</h3>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead><tr style={{ background: "#f3f3f3" }}>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>No</th>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Item</th>
                  <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Description</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Qty</th>
                  <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Total</th>
                </tr></thead>
                <tbody>
                  {wo.services.map((svc: any, i: number) => (
                    <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "6px 8px" }}>{i + 1}</td>
                      <td style={{ padding: "6px 8px", fontWeight: 500 }}>{svc.item}</td>
                      <td style={{ padding: "6px 8px" }}>{svc.description}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{svc.quantity}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{fmt(svc.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot><tr style={{ background: "#f3f3f3" }}>
                  <td colSpan={4} style={{ padding: "6px 8px" }}></td>
                  <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{fmt(totalServiceCost)}</td>
                </tr></tfoot>
              </table>
              {wo.spareparts.length > 0 && (
                <>
                  <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8, marginTop: 20 }}>Spareparts</h3>
                  <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                    <thead><tr style={{ background: "#f3f3f3" }}>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>No</th>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Code</th>
                      <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Name</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Qty</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Price</th>
                      <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const }}>Total</th>
                    </tr></thead>
                    <tbody>
                      {wo.spareparts.map((sp: any, i: number) => (
                        <tr key={i} style={{ borderBottom: "1px solid #f0f0f0" }}>
                          <td style={{ padding: "6px 8px" }}>{i + 1}</td>
                          <td style={{ padding: "6px 8px", fontWeight: 500 }}>{sp.code}</td>
                          <td style={{ padding: "6px 8px" }}>{sp.name}</td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>{sp.qty}</td>
                          <td style={{ padding: "6px 8px", textAlign: "right" }}>{fmt(sp.price)}</td>
                          <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{fmt(sp.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot><tr style={{ background: "#f3f3f3" }}>
                      <td colSpan={5} style={{ padding: "6px 8px" }}></td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 700 }}>{fmt(totalSparepartCost)}</td>
                    </tr></tfoot>
                  </table>
                </>
              )}
              <div style={{ marginTop: 16, padding: "10px 16px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 6, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>TOTAL</span>
                <span style={{ fontSize: 14, fontWeight: 700, color: "#001526" }}>Rp {fmt(grandTotal)}</span>
              </div>
            </div>
            <div style={{ padding: "16px 32px", borderTop: "1px solid #ecebea", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowPrint(false)} style={{ padding: "8px 24px", fontSize: 13, fontWeight: 600, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>Tutup</button>
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
    borderRadius: 8, marginBottom: 12,
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
  lineTab: {
    padding: "8px 20px", fontSize: 13, border: "none", borderBottom: "2px solid transparent",
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
