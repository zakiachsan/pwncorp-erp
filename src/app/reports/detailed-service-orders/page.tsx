"use client";

import { useRouter } from "next/navigation";
import { BarChart3, Star, Search, Download } from "lucide-react";

/* ── data from Excel (item-level rows) ── */
const data = [
  { no:1, sro:"SRO/WM/26050083", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"25-May-2026", approvedDate:"07-Jul-2026", planServiceDate:"25-May-2026", planServiceTime:"16:00", customer:"UNIT PENGELOLA ANJUNGAN DAN GRAHA WISATA", company:"", vehicleType:"Car", registration:"B1005PQP", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Sparepart", sku:"PRESTONE-PS-MERAH", productName:"PRESTONE P/STEERING FLUID RED", brand:"PRESTONE", itemType2:"MINYAK POWER STEERING", estimatedTime:"", qty:2, priceExTax:115000, discount:0, subtotal:230000, tax:25300, otherTax:0, total:255300, swo:"SWO/WM/26070014" },
  { no:2, sro:"SRO/WM/26050083", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"25-May-2026", approvedDate:"07-Jul-2026", planServiceDate:"25-May-2026", planServiceTime:"16:00", customer:"UNIT PENGELOLA ANJUNGAN DAN GRAHA WISATA", company:"", vehicleType:"Car", registration:"B1005PQP", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"JS.GT.HOSE.PS", productName:"GANTI SELANG POWER STEERING - GANTI SELANG POWER STEERING", brand:"", itemType2:"JASA SERVICE MOBIL", estimatedTime:"", qty:1, priceExTax:265000, discount:0, subtotal:265000, tax:29150, otherTax:0, total:294150, swo:"SWO/WM/26070014" },
  { no:3, sro:"SRO/WM/26050083", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"25-May-2026", approvedDate:"07-Jul-2026", planServiceDate:"25-May-2026", planServiceTime:"16:00", customer:"UNIT PENGELOLA ANJUNGAN DAN GRAHA WISATA", company:"", vehicleType:"Car", registration:"B1005PQP", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"JS.GOL1.106", productName:"SPOORING - SPOORING", brand:"", itemType2:"JASA SERVICE MOBIL", estimatedTime:"01:00:00", qty:1, priceExTax:250000, discount:0, subtotal:250000, tax:27500, otherTax:0, total:277500, swo:"SWO/WM/26070014" },
  { no:4, sro:"SRO/WM/26050083", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"25-May-2026", approvedDate:"07-Jul-2026", planServiceDate:"25-May-2026", planServiceTime:"16:00", customer:"UNIT PENGELOLA ANJUNGAN DAN GRAHA WISATA", company:"", vehicleType:"Car", registration:"B1005PQP", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Sparepart", sku:"44040-BZ050", productName:"POWER STEERING HOSE ASSY", brand:"TOYOTA", itemType2:"SELANG", estimatedTime:"", qty:1, priceExTax:1129310, discount:0, subtotal:1129310, tax:124224, otherTax:0, total:1253534, swo:"SWO/WM/26070014" },
  { no:5, sro:"SRO/003/26070031", store:"Wijaya Motor - One Stop Service", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"08:55", customer:"BPK. IKO", company:"", vehicleType:"Car", registration:"B1992B", hullNumber:"", vin:"", serviceAdvisor:"NANDA SALSA", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"A2", productName:"Spooring Mobil Kelas I-A - Spooring", brand:"", itemType2:"", estimatedTime:"", qty:0, priceExTax:499500, discount:0, subtotal:0, tax:0, otherTax:0, total:0, swo:"SWO/003/26070030" },
  { no:6, sro:"SRO/003/26070031", store:"Wijaya Motor - One Stop Service", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"08:55", customer:"BPK. IKO", company:"", vehicleType:"Car", registration:"B1992B", hullNumber:"", vin:"", serviceAdvisor:"NANDA SALSA", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"A2", productName:"Spooring Mobil Kelas I-A - Spooring", brand:"", itemType2:"", estimatedTime:"", qty:1, priceExTax:450000, discount:22500, subtotal:427500, tax:0, otherTax:0, total:427500, swo:"SWO/003/26070030" },
  { no:7, sro:"SRO/003/26070031", store:"Wijaya Motor - One Stop Service", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"08:55", customer:"BPK. IKO", company:"", vehicleType:"Car", registration:"B1992B", hullNumber:"", vin:"", serviceAdvisor:"NANDA SALSA", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"B6", productName:'Balancing Ring 16"/17\'/18" Profit>50 - Balancing', brand:"", itemType2:"", estimatedTime:"", qty:4, priceExTax:50000, discount:10000, subtotal:190000, tax:0, otherTax:0, total:190000, swo:"SWO/003/26070030" },
  { no:8, sro:"SRO/003/26070032", store:"Wijaya Motor - One Stop Service", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"10:55", customer:"BPK. RICKY", company:"", vehicleType:"Car", registration:"B9525PAM", hullNumber:"", vin:"", serviceAdvisor:"NANDA SALSA", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"B6", productName:'Balancing Ring 16"/17\'/18" Profit>50 - Balancing', brand:"", itemType2:"", estimatedTime:"", qty:4, priceExTax:40000, discount:8000, subtotal:152000, tax:0, otherTax:0, total:152000, swo:"SWO/003/26070031" },
  { no:9, sro:"SRO/003/26070032", store:"Wijaya Motor - One Stop Service", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"10:55", customer:"BPK. RICKY", company:"", vehicleType:"Car", registration:"B9525PAM", hullNumber:"", vin:"", serviceAdvisor:"NANDA SALSA", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"A6", productName:"Spooring Mobil Kelas III-A - Spooring", brand:"", itemType2:"", estimatedTime:"", qty:1, priceExTax:275000, discount:13750, subtotal:261250, tax:0, otherTax:0, total:261250, swo:"SWO/003/26070031" },
  { no:10, sro:"SRO/003/26070033", store:"Wijaya Motor - One Stop Service", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"11:35", customer:"BPK. ALDO", company:"", vehicleType:"Car", registration:"KH1863GI", hullNumber:"", vin:"", serviceAdvisor:"NANDA SALSA", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"JAS.NT.001", productName:"JASA NON TRACKING - B/P HEADLAMP F R+L", brand:"", itemType2:"JASA NON TRACKING", estimatedTime:"", qty:2, priceExTax:200000, discount:0, subtotal:400000, tax:0, otherTax:0, total:400000, swo:"SWO/003/26070032" },
  { no:11, sro:"SRO/003/26070034", store:"Wijaya Motor - One Stop Service", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"13:55", customer:"AUTO PRIMA", company:"", vehicleType:"Car", registration:"B819BEN", hullNumber:"", vin:"", serviceAdvisor:"NANDA SALSA", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"JAS.NT.001", productName:"JASA NON TRACKING - B/P BAN", brand:"", itemType2:"JASA NON TRACKING", estimatedTime:"", qty:1, priceExTax:50000, discount:5000, subtotal:45000, tax:0, otherTax:0, total:45000, swo:"SWO/003/26070033" },
  { no:12, sro:"SRO/WM/26070024", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"15:45", customer:"BAPAK DANI", company:"", vehicleType:"Car", registration:"B1360PYC", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Sparepart", sku:"NON-TRACKING", productName:"UNIVERSAL - WHASER", brand:"OLI", itemType2:"NON TRACKING", estimatedTime:"", qty:4, priceExTax:65000, discount:26000, subtotal:234000, tax:0, otherTax:0, total:234000, swo:"" },
  { no:13, sro:"SRO/WM/26070024", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"15:45", customer:"BAPAK DANI", company:"", vehicleType:"Car", registration:"B1360PYC", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"JAS.NT.001", productName:"JASA NON TRACKING - KURAS TANGKI", brand:"", itemType2:"JASA NON TRACKING", estimatedTime:"", qty:1, priceExTax:300000, discount:30000, subtotal:270000, tax:0, otherTax:0, total:270000, swo:"" },
  { no:14, sro:"SRO/WM/26070024", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"15:45", customer:"BAPAK DANI", company:"", vehicleType:"Car", registration:"B1360PYC", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"JAS.NT.001", productName:"JASA NON TRACKING - JASA SERVICE B/P", brand:"", itemType2:"JASA NON TRACKING", estimatedTime:"", qty:1, priceExTax:750000, discount:75000, subtotal:675000, tax:0, otherTax:0, total:675000, swo:"" },
  { no:15, sro:"SRO/WM/26070024", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"15:45", customer:"BAPAK DANI", company:"", vehicleType:"Car", registration:"B1360PYC", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Sparepart", sku:"NON-TRACKING", productName:"UNIVERSAL - NOZZLE", brand:"OLI", itemType2:"NON TRACKING", estimatedTime:"", qty:4, priceExTax:1250000, discount:500000, subtotal:4500000, tax:0, otherTax:0, total:4500000, swo:"" },
  { no:16, sro:"SRO/WM/26070024", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"15:45", customer:"BAPAK DANI", company:"", vehicleType:"Car", registration:"B1360PYC", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Sparepart", sku:"23390-0L041", productName:"FUEL FILTER", brand:"TOYOTA", itemType2:"FILTER SOLAR", estimatedTime:"", qty:1, priceExTax:360750, discount:36075, subtotal:324675, tax:0, otherTax:0, total:324675, swo:"" },
  { no:17, sro:"SRO/WM/26070024", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"15:45", customer:"BAPAK DANI", company:"", vehicleType:"Car", registration:"B1360PYC", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Sparepart", sku:"NON-TRACKING", productName:"UNIVERSAL - VALVE", brand:"OLI", itemType2:"NON TRACKING", estimatedTime:"", qty:2, priceExTax:950000, discount:190000, subtotal:1710000, tax:0, otherTax:0, total:1710000, swo:"" },
  { no:18, sro:"SRO/WM/26070024", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"15:45", customer:"BAPAK DANI", company:"", vehicleType:"Car", registration:"B1360PYC", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Sparepart", sku:"NON-TRACKING", productName:"UNIVERSAL - KALIBRASI INJECTOR", brand:"OLI", itemType2:"NON TRACKING", estimatedTime:"", qty:4, priceExTax:350000, discount:140000, subtotal:1260000, tax:0, otherTax:0, total:1260000, swo:"" },
  { no:19, sro:"SRO/WM/26070024", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"15:45", customer:"BAPAK DANI", company:"", vehicleType:"Car", registration:"B1360PYC", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Sparepart", sku:"NON-TRACKING", productName:"UNIVERSAL - RING RETURN", brand:"OLI", itemType2:"NON TRACKING", estimatedTime:"", qty:5, priceExTax:325000, discount:162500, subtotal:1462500, tax:0, otherTax:0, total:1462500, swo:"" },
  { no:20, sro:"SRO/WM/26070024", store:"PT Putra Wijaya Motor", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"15:45", customer:"BAPAK DANI", company:"", vehicleType:"Car", registration:"B1360PYC", hullNumber:"", vin:"", serviceAdvisor:"MARDOTO", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Sparepart", sku:"NON-TRACKING", productName:"UNIVERSAL - ORING NOZZLE", brand:"OLI", itemType2:"NON TRACKING", estimatedTime:"", qty:4, priceExTax:35000, discount:14000, subtotal:126000, tax:0, otherTax:0, total:126000, swo:"" },
  { no:21, sro:"SRO/003/26070035", store:"Wijaya Motor - One Stop Service", type:"Service Sale", status:"Approved", createdDate:"07-Jul-2026", approvedDate:"07-Jul-2026", planServiceDate:"07-Jul-2026", planServiceTime:"14:05", customer:"PROMOTOR", company:"", vehicleType:"Car", registration:"B1537BIR", hullNumber:"", vin:"", serviceAdvisor:"NANDA SALSA", salesperson:"", bookingSource:"", insuranceProvider:"", serviceReservation:"", itemType:"Service", sku:"A3", productName:"Spooring Mobil Kelas I - Spooring", brand:"", itemType2:"", estimatedTime:"", qty:1, priceExTax:375000, discount:37500, subtotal:337500, tax:0, otherTax:0, total:337500, swo:"SWO/003/26070034" },
];

function fmt(n: number): string {
  return n.toLocaleString("id-ID").replace(/,/g, ".");
}

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
  const m: Record<string,string> = { Approved:"pill pill--approved", Draft:"pill pill--draft", Cancelled:"pill pill--cancelled" };
  return m[status] || "pill pill--draft";
};

export default function DetailedServiceOrdersPage() {
  const router = useRouter();

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ padding: "6px 16px", background: "#f3f3f3", borderBottom: "1px solid #ecebea", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart3 size={18} color="#0176d3" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#001526" }}>
            Detailed Service Orders From 07-Jul-2026 - To 07-Jul-2026
          </span>
        </div>
        <Star size={16} color="#f28500" />
      </div>

      {/* ── Filter Section ── */}
      <div style={{ margin: "16px 24px", border: "1px solid #ecebea", borderRadius: 8, background: "#fff", padding: 16 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Order Type"><select className="form-select" style={{ minWidth: 130 }}><option>All Types</option><option>Service Sale</option></select></Field>
          <Field label="Date Type"><select className="form-select" style={{ minWidth: 140 }}><option>Approved Date</option><option>Created Date</option></select></Field>
          <Field label="From Date"><input type="date" className="form-input" defaultValue="2026-07-07" style={{ minWidth: 130 }} /></Field>
          <Field label="To Date"><input type="date" className="form-input" defaultValue="2026-07-07" style={{ minWidth: 130 }} /></Field>
          <Field label="Store"><select className="form-select" style={{ minWidth: 170 }}><option>All Stores</option><option>PT Putra Wijaya Motor</option><option>Wijaya Motor - One Stop Service</option></select></Field>
          <Field label="Service Order"><input type="text" className="form-input" placeholder="Service Order" style={{ minWidth: 140 }} /></Field>
          <Field label="Status"><select className="form-select" style={{ minWidth: 120 }}><option>All Status</option><option>Approved</option></select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Customer"><select className="form-select" style={{ minWidth: 180 }}><option>All Customers</option><option>UNIT PENGELOLA ANJUNGAN DAN GRAHA WISATA</option><option>BPK. IKO</option><option>BPK. RICKY</option><option>BPK. ALDO</option><option>AUTO PRIMA</option><option>BAPAK DANI</option><option>PROMOTOR</option></select></Field>
          <Field label="Registration"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="Hull Number"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="VIN"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="Item Type"><select className="form-select" style={{ minWidth: 120 }}><option>All Types</option><option>Service</option><option>Sparepart</option></select></Field>
          <Field label="Product Brand"><select className="form-select" style={{ minWidth: 140 }}><option>All Brands</option><option>PRESTONE</option><option>TOYOTA</option><option>OLI</option></select></Field>
          <Field label="Product Type"><select className="form-select" style={{ minWidth: 140 }}><option>All Types</option><option>MINYAK POWER STEERING</option><option>JASA SERVICE MOBIL</option><option>SELANG</option><option>JASA NON TRACKING</option><option>NON TRACKING</option><option>FILTER SOLAR</option></select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Service Product Type"><select className="form-select" style={{ minWidth: 150 }}><option>All Types</option></select></Field>
          <Field label="Service Advisor"><select className="form-select" style={{ minWidth: 150 }}><option>All Service Advisor</option><option>MARDOTO</option><option>NANDA SALSA</option></select></Field>
          <Field label="Salesperson"><select className="form-select" style={{ minWidth: 140 }}><option>All Salespersons</option></select></Field>
          <Field label="Booking Source"><select className="form-select" style={{ minWidth: 140 }}><option>All Booking Source</option></select></Field>
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
              <th style={TH}>Service Order</th>
              <th style={TH}>Store</th>
              <th style={TH}>Type</th>
              <th style={TH}>Status</th>
              <th style={TH}>Created Date</th>
              <th style={TH}>Approved Date</th>
              <th style={TH}>Plan Service Date</th>
              <th style={TH}>Plan Service Time</th>
              <th style={TH}>Customer</th>
              <th style={TH}>Company</th>
              <th style={TH}>Vehicle Type</th>
              <th style={TH}>Registration</th>
              <th style={TH}>Hull Number</th>
              <th style={TH}>VIN</th>
              <th style={TH}>Service Advisor</th>
              <th style={TH}>Salesperson</th>
              <th style={TH}>Booking Source</th>
              <th style={TH}>Insurance Provider</th>
              <th style={TH}>Service Reservation</th>
              <th style={TH}>Item Type</th>
              <th style={TH}>SKU</th>
              <th style={{ ...TH, minWidth: 250 }}>Product Name</th>
              <th style={TH}>Brand</th>
              <th style={TH}>Type</th>
              <th style={TH}>Estimated Time</th>
              <th style={{ ...TH, textAlign: "right" }}>Qty</th>
              <th style={{ ...TH, textAlign: "right" }}>Price Ex Tax</th>
              <th style={{ ...TH, textAlign: "right" }}>Discount</th>
              <th style={{ ...TH, textAlign: "right" }}>Subtotal</th>
              <th style={{ ...TH, textAlign: "right" }}>Tax</th>
              <th style={{ ...TH, textAlign: "right" }}>Other Tax</th>
              <th style={{ ...TH, textAlign: "right" }}>Total</th>
              <th style={TH}>Service Work Order</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.no} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={TD}>{row.no}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/service-orders/${row.sro}`)}>{row.sro}</td>
                <td style={{ ...TD, ...L }}>{row.store}</td>
                <td style={TD}>{row.type}</td>
                <td style={TD}><span className={statusPill(row.status)}>{row.status}</span></td>
                <td style={TD}>{row.createdDate}</td>
                <td style={TD}>{row.approvedDate}</td>
                <td style={TD}>{row.planServiceDate}</td>
                <td style={TD}>{row.planServiceTime}</td>
                <td style={{ ...TD, ...L }}>{row.customer}</td>
                <td style={TD}>{row.company || "—"}</td>
                <td style={TD}>{row.vehicleType}</td>
                <td style={{ ...TD, ...L }}>{row.registration}</td>
                <td style={TD}>{row.hullNumber || "—"}</td>
                <td style={TD}>{row.vin || "—"}</td>
                <td style={TD}>{row.serviceAdvisor}</td>
                <td style={TD}>{row.salesperson || "—"}</td>
                <td style={TD}>{row.bookingSource || "—"}</td>
                <td style={TD}>{row.insuranceProvider || "—"}</td>
                <td style={TD}>{row.serviceReservation || "—"}</td>
                <td style={TD}><span className="pill pill--draft">{row.itemType}</span></td>
                <td style={{ ...TD, ...L }}>{row.sku}</td>
                <td style={{ ...TD, maxWidth: 300 }}>{row.productName}</td>
                <td style={TD}>{row.brand || "—"}</td>
                <td style={TD}>{row.itemType2 || "—"}</td>
                <td style={TD}>{row.estimatedTime || "—"}</td>
                <td style={{ ...TD, textAlign: "right" }}>{row.qty}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.priceExTax)}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.discount)}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.subtotal)}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.tax)}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.otherTax)}</td>
                <td style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fmt(row.total)}</td>
                <td style={{ ...TD, ...L }} onClick={() => row.swo && router.push(`/work-orders/${row.swo}`)}>{row.swo || "—"}</td>
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
