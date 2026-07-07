"use client";

import { useRouter } from "next/navigation";
import { Wrench, Star, Search, Download } from "lucide-react";

/* ── data from Excel ── */
const data = [
  { no:1, serviceDate:"07-Jul-2026", store:"PT Putra Wijaya Motor", swo:"SWO/WM/26070010", status:"Waiting", customer:"SUKU DINAS SUMBER DAYA AIR JAKARTA SELATAN", vehicleType:"Car", registration:"B9118SSC", hullNumber:"", vin:"", estimatedTime:"", serviceAdvisor:"MARDOTO", startDate:"", startTime:"", completedDate:"", completedTime:"", assignee:"AGUNG PRATAMA", itemType:"Service", sku:"GENERAL", productName:"CEK KERUSAKAN SESUAI INPECTION LIST - CEK KERUSAKAN SESUAI INPECTION LIST", description:"CEK KERUSAKAN SESUAI INPECTION LIST", productBrand:"", productType:"JASA SERVICE MOBIL", qty:1, feedback:"", sro:"SRO/WM/26070010", serviceReservation:"", sri:"", insuranceProvider:"" },
  { no:2, serviceDate:"07-Jul-2026", store:"PT Putra Wijaya Motor", swo:"SWO/WM/26070010", status:"Waiting", customer:"SUKU DINAS SUMBER DAYA AIR JAKARTA SELATAN", vehicleType:"Car", registration:"B9118SSC", hullNumber:"", vin:"", estimatedTime:"", serviceAdvisor:"MARDOTO", startDate:"", startTime:"", completedDate:"", completedTime:"", assignee:"Pak Hasan", itemType:"Service", sku:"JS.CAT.BMPR.FR", productName:"SOL,DEMPUL,CAT BUMPER DEPAN - SOL,DEMPUL,CAT BUMPER DEPAN", description:"SOL,DEMPUL,CAT BUMPER DEPAN", productBrand:"", productType:"JASA POLES BODY MOBIL", qty:1, feedback:"", sro:"SRO/WM/26070010", serviceReservation:"", sri:"", insuranceProvider:"" },
  { no:3, serviceDate:"07-Jul-2026", store:"PT Putra Wijaya Motor", swo:"SWO/WM/26070010", status:"Waiting", customer:"SUKU DINAS SUMBER DAYA AIR JAKARTA SELATAN", vehicleType:"Car", registration:"B9118SSC", hullNumber:"", vin:"", estimatedTime:"", serviceAdvisor:"MARDOTO", startDate:"", startTime:"", completedDate:"", completedTime:"", assignee:"Pak Hasan", itemType:"Service", sku:"JS.BOD.BAK", productName:"LAS,KETHOK,DEMPUL CAT BAK BELAKANG LUAR - LAS,KETHOK,DEMPUL CAT BAK BELAKANG LUAR", description:"LAS,KETHOK,DEMPUL CAT BAK BELAKANG LUAR", productBrand:"", productType:"JASA SERVICE MOBIL", qty:1, feedback:"", sro:"SRO/WM/26070010", serviceReservation:"", sri:"", insuranceProvider:"" },
  { no:4, serviceDate:"07-Jul-2026", store:"Wijaya Motor - One Stop Service", swo:"SWO/003/26070030", status:"Completed", customer:"BPK. IKO", vehicleType:"Car", registration:"B1992B", hullNumber:"", vin:"", estimatedTime:"", serviceAdvisor:"NANDA SALSA", startDate:"07/07/26", startTime:"08:31", completedDate:"07/07/26", completedTime:"09:33", assignee:"NENDY, WOYO", itemType:"Service", sku:"A2", productName:"Spooring Mobil Kelas I-A - Spooring", description:"Spooring", productBrand:"", productType:"", qty:1, feedback:"", sro:"SRO/003/26070031", serviceReservation:"", sri:"SRI/003/26070028", insuranceProvider:"" },
  { no:5, serviceDate:"07-Jul-2026", store:"Wijaya Motor - One Stop Service", swo:"SWO/003/26070030", status:"Completed", customer:"BPK. IKO", vehicleType:"Car", registration:"B1992B", hullNumber:"", vin:"", estimatedTime:"", serviceAdvisor:"NANDA SALSA", startDate:"07/07/26", startTime:"08:31", completedDate:"07/07/26", completedTime:"09:33", assignee:"NENDY", itemType:"Service", sku:"B6", productName:'Balancing Ring 16"/17\'/18" Profit>50 - Balancing', description:"Balancing", productBrand:"", productType:"", qty:4, feedback:"", sro:"SRO/003/26070031", serviceReservation:"", sri:"SRI/003/26070028", insuranceProvider:"" },
  { no:6, serviceDate:"07-Jul-2026", store:"Wijaya Motor - One Stop Service", swo:"SWO/003/26070031", status:"Completed", customer:"BPK. RICKY", vehicleType:"Car", registration:"B9525PAM", hullNumber:"", vin:"", estimatedTime:"", serviceAdvisor:"NANDA SALSA", startDate:"07/07/26", startTime:"10:02", completedDate:"07/07/26", completedTime:"10:57", assignee:"NENDY, WOYO", itemType:"Service", sku:"A6", productName:"Spooring Mobil Kelas III-A - Spooring", description:"Spooring", productBrand:"", productType:"", qty:1, feedback:"", sro:"SRO/003/26070032", serviceReservation:"", sri:"SRI/003/26070029", insuranceProvider:"" },
  { no:7, serviceDate:"07-Jul-2026", store:"Wijaya Motor - One Stop Service", swo:"SWO/003/26070031", status:"Completed", customer:"BPK. RICKY", vehicleType:"Car", registration:"B9525PAM", hullNumber:"", vin:"", estimatedTime:"", serviceAdvisor:"NANDA SALSA", startDate:"07/07/26", startTime:"10:02", completedDate:"07/07/26", completedTime:"10:57", assignee:"NENDY, WOYO", itemType:"Service", sku:"B6", productName:'Balancing Ring 16"/17\'/18" Profit>50 - Balancing', description:"Balancing", productBrand:"", productType:"", qty:4, feedback:"", sro:"SRO/003/26070032", serviceReservation:"", sri:"SRI/003/26070029", insuranceProvider:"" },
  { no:8, serviceDate:"07-Jul-2026", store:"Wijaya Motor - One Stop Service", swo:"SWO/003/26070032", status:"Completed", customer:"BPK. ALDO", vehicleType:"Car", registration:"KH1863GI", hullNumber:"", vin:"", estimatedTime:"", serviceAdvisor:"NANDA SALSA", startDate:"07/07/26", startTime:"11:26", completedDate:"07/07/26", completedTime:"12:06", assignee:"MIFTA ARIFIN", itemType:"Service", sku:"JAS.NT.001", productName:"JASA NON TRACKING - B/P HEADLAMP F R+L", description:"B/P HEADLAMP F R+L", productBrand:"", productType:"JASA NON TRACKING", qty:2, feedback:"", sro:"SRO/003/26070033", serviceReservation:"", sri:"SRI/003/26070031", insuranceProvider:"" },
  { no:9, serviceDate:"07-Jul-2026", store:"Wijaya Motor - One Stop Service", swo:"SWO/003/26070033", status:"Completed", customer:"AUTO PRIMA", vehicleType:"Car", registration:"B819BEN", hullNumber:"", vin:"", estimatedTime:"", serviceAdvisor:"NANDA SALSA", startDate:"07/07/26", startTime:"13:43", completedDate:"07/07/26", completedTime:"14:00", assignee:"NENDY", itemType:"Service", sku:"JAS.NT.001", productName:"JASA NON TRACKING - B/P BAN", description:"B/P BAN", productBrand:"", productType:"JASA NON TRACKING", qty:1, feedback:"", sro:"SRO/003/26070034", serviceReservation:"", sri:"SRI/003/26070032", insuranceProvider:"" },
  { no:10, serviceDate:"07-Jul-2026", store:"Wijaya Motor - One Stop Service", swo:"SWO/003/26070034", status:"In Progress", customer:"PROMOTOR", vehicleType:"Car", registration:"B1537BIR", hullNumber:"", vin:"", estimatedTime:"", serviceAdvisor:"NANDA SALSA", startDate:"07/07/26", startTime:"13:57", completedDate:"", completedTime:"", assignee:"NENDY, WOYO", itemType:"Service", sku:"A3", productName:"Spooring Mobil Kelas I - Spooring", description:"Spooring", productBrand:"", productType:"", qty:1, feedback:"", sro:"SRO/003/26070035", serviceReservation:"", sri:"", insuranceProvider:"" },
];

const L: React.CSSProperties = { color: "#0176d3", cursor: "pointer", fontWeight: 500 };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group" style={{ flex: "0 0 auto" }}>
      <label className="form-label">{label || "\u00A0"}</label>
      {children}
    </div>
  );
}

const TH: React.CSSProperties = {
  padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746",
  textTransform: "uppercase", letterSpacing: "0.03em", borderBottom: "2px solid #ecebea",
  borderRight: "1px solid #ecebea", background: "#f9f9f9", whiteSpace: "nowrap",
};

const TD: React.CSSProperties = {
  padding: "7px 10px", color: "#001526", borderBottom: "1px solid #f0f0f0",
  borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap",
};

const statusPill = (status: string) => {
  const m: Record<string,string> = { Waiting:"pill pill--waiting", "In Progress":"pill pill--in-progress", Completed:"pill pill--completed" };
  return m[status] || "pill pill--draft";
};

export default function DetailedServiceWorkOrdersPage() {
  const router = useRouter();

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ padding: "6px 16px", background: "#f3f3f3", borderBottom: "1px solid #ecebea", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Wrench size={18} color="#0176d3" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#001526" }}>
            Detailed Service Work Orders From 07-Jul-2026 - To 07-Jul-2026
          </span>
        </div>
        <Star size={16} color="#f28500" />
      </div>

      {/* ── Filter Section ── */}
      <div style={{ margin: "16px 24px", border: "1px solid #ecebea", borderRadius: 8, background: "#fff", padding: 16 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Date Type"><select className="form-select" style={{ minWidth: 140 }}><option>Service Date</option><option>Created Date</option></select></Field>
          <Field label="From Date"><input type="date" className="form-input" defaultValue="2026-07-07" style={{ minWidth: 130 }} /></Field>
          <Field label="To Date"><input type="date" className="form-input" defaultValue="2026-07-07" style={{ minWidth: 130 }} /></Field>
          <Field label="Store"><select className="form-select" style={{ minWidth: 170 }}><option>All Stores</option><option>PT Putra Wijaya Motor</option><option>Wijaya Motor - One Stop Service</option></select></Field>
          <Field label="Service Work Order"><input type="text" className="form-input" placeholder="Service Work Order" style={{ minWidth: 160 }} /></Field>
          <Field label="Status"><select className="form-select" style={{ minWidth: 120 }}><option>All Status</option><option>Waiting</option><option>In Progress</option><option>Completed</option></select></Field>
          <Field label="Customer"><select className="form-select" style={{ minWidth: 180 }}><option>All Customers</option><option>SUKU DINAS SUMBER DAYA AIR JAKARTA SELATAN</option><option>BPK. IKO</option><option>BPK. RICKY</option><option>BPK. ALDO</option><option>AUTO PRIMA</option><option>PROMOTOR</option></select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Registration"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="Hull Number"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="VIN"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="Item Type"><select className="form-select" style={{ minWidth: 120 }}><option>All Types</option><option>Service</option><option>Sparepart</option></select></Field>
          <Field label="Product Brand"><select className="form-select" style={{ minWidth: 140 }}><option>All Brands</option></select></Field>
          <Field label="Product Type"><select className="form-select" style={{ minWidth: 140 }}><option>All Types</option><option>JASA SERVICE MOBIL</option><option>JASA POLES BODY MOBIL</option><option>JASA NON TRACKING</option></select></Field>
          <Field label="Service Advisor"><select className="form-select" style={{ minWidth: 150 }}><option>All Service Advisor</option><option>MARDOTO</option><option>NANDA SALSA</option></select></Field>
          <Field label="Assignee"><select className="form-select" style={{ minWidth: 140 }}><option>All Assignee</option><option>AGUNG PRATAMA</option><option>Pak Hasan</option><option>NENDY</option><option>WOYO</option><option>MIFTA ARIFIN</option></select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Group Assignee"><select className="form-select" style={{ minWidth: 120 }}><option>Yes</option><option>No</option></select></Field>
          <Field label="Feedback Only"><select className="form-select" style={{ minWidth: 120 }}><option>No</option><option>Yes</option></select></Field>
          <Field label="">&nbsp;</Field>
          <button className="btn btn--sm" style={{ minWidth: 90, justifyContent: "center", gap: 6 }}><Search size={14} /> Show</button>
          <button className="btn btn--brand btn--sm" style={{ minWidth: 110, justifyContent: "center", gap: 6, background: "#014486" }}><Download size={14} /> Download</button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ margin: "0 24px", border: "1px solid #ecebea", borderRadius: 8, overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: "100%" }}>
          <thead>
            <tr style={{ background: "#f9f9f9" }}>
              <th style={TH}>No.</th>
              <th style={TH}>Service Date</th>
              <th style={TH}>Store</th>
              <th style={TH}>Service WO</th>
              <th style={TH}>Status</th>
              <th style={TH}>Customer</th>
              <th style={TH}>Vehicle Type</th>
              <th style={TH}>Registration</th>
              <th style={TH}>Hull Number</th>
              <th style={TH}>VIN</th>
              <th style={TH}>Estimated Time</th>
              <th style={TH}>Service Advisor</th>
              <th style={TH}>Start Date</th>
              <th style={TH}>Start Time</th>
              <th style={TH}>Completed Date</th>
              <th style={TH}>Completed Time</th>
              <th style={TH}>Assignee</th>
              <th style={TH}>Item Type</th>
              <th style={TH}>SKU</th>
              <th style={{ ...TH, minWidth: 250 }}>Product Name</th>
              <th style={TH}>Description</th>
              <th style={TH}>Product Brand</th>
              <th style={TH}>Product Type</th>
              <th style={{ ...TH, textAlign: "right" }}>Qty</th>
              <th style={TH}>Feedback</th>
              <th style={TH}>Service Order</th>
              <th style={TH}>Service Reservation</th>
              <th style={TH}>Service Invoice</th>
              <th style={TH}>Insurance Provider</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.no} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={TD}>{row.no}</td>
                <td style={TD}>{row.serviceDate}</td>
                <td style={{ ...TD, ...L }}>{row.store}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/work-orders/${row.swo}`)}>{row.swo}</td>
                <td style={TD}><span className={statusPill(row.status)}>{row.status}</span></td>
                <td style={{ ...TD, ...L }}>{row.customer}</td>
                <td style={TD}>{row.vehicleType}</td>
                <td style={{ ...TD, ...L }}>{row.registration}</td>
                <td style={TD}>{row.hullNumber || "—"}</td>
                <td style={TD}>{row.vin || "—"}</td>
                <td style={TD}>{row.estimatedTime || "—"}</td>
                <td style={TD}>{row.serviceAdvisor}</td>
                <td style={TD}>{row.startDate || "—"}</td>
                <td style={TD}>{row.startTime || "—"}</td>
                <td style={TD}>{row.completedDate || "—"}</td>
                <td style={TD}>{row.completedTime || "—"}</td>
                <td style={TD}>{row.assignee}</td>
                <td style={TD}><span className="pill pill--draft">{row.itemType}</span></td>
                <td style={{ ...TD, ...L }}>{row.sku}</td>
                <td style={{ ...TD, maxWidth: 300 }}>{row.productName}</td>
                <td style={TD}>{row.description || "—"}</td>
                <td style={TD}>{row.productBrand || "—"}</td>
                <td style={TD}>{row.productType || "—"}</td>
                <td style={{ ...TD, textAlign: "right" }}>{row.qty}</td>
                <td style={TD}>{row.feedback || "—"}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/service-orders/${row.sro}`)}>{row.sro}</td>
                <td style={TD}>{row.serviceReservation || "—"}</td>
                <td style={{ ...TD, ...L }} onClick={() => row.sri && router.push(`/finance/invoices/service/${row.sri}`)}>{row.sri || "—"}</td>
                <td style={TD}>{row.insuranceProvider || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Pagination ── */}
      <div style={{ margin: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#444746" }}>
        <div>Showing 1 — {data.length} of {data.length}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn--sm" disabled style={{ opacity: 0.4 }}>« Prev</button>
          <button className="btn btn--sm">Next »</button>
        </div>
      </div>
    </div>
  );
}
