"use client";

import { useRouter } from "next/navigation";
import { ReceiptText, Star, Search, Download } from "lucide-react";

/* ── data from Excel ── */
const data = [
  { no: 1, invoiceDate: "07-Jul-2026", store: "Wijaya Motor - One Stop Service", serviceInvoice: "SRI/003/26070028", type: "Service Sale", status: "Completed", customer: "BPK. IKO", company: "", customerGroup: "", membership: "", customerPhone: "0811105007", salesperson: "", bookingSource: "", referenceNumber: "", insuranceProvider: "", serviceAdvisor: "NANDA SALSA", vehicleType: "Car", registration: "B1992B", hullNumber: "", vin: "", vehicleMake: "TOYOTA", vehicleModel: "ALL NEW CAMRY 2.5", qty: 5, discount: 32500, subtotal: 617500, tax: 0, otherTax: 0, total: 617500, tradeIn: 0, swo: "SWO/003/26070030", sro: "SRO/003/26070031", serviceReservation: "", notes: "BRI 039801003070566 a/n PUTRA WIJAYA MOTOR", serviceRecommendations: "", paymentTypes: "BRI QRIS" },
  { no: 2, invoiceDate: "07-Jul-2026", store: "Wijaya Motor - One Stop Service", serviceInvoice: "SRI/003/26070029", type: "Service Sale", status: "Completed", customer: "BPK. RICKY", company: "", customerGroup: "", membership: "", customerPhone: "0811857555", salesperson: "", bookingSource: "", referenceNumber: "", insuranceProvider: "", serviceAdvisor: "NANDA SALSA", vehicleType: "Car", registration: "B9525PAM", hullNumber: "", vin: "", vehicleMake: "SUZUKI", vehicleModel: "NEW CARRY PICK UP", qty: 5, discount: 21750, subtotal: 413250, tax: 0, otherTax: 0, total: 413250, tradeIn: 0, swo: "SWO/003/26070031", sro: "SRO/003/26070032", serviceReservation: "", notes: "BRI 039801003070566 a/n PUTRA WIJAYA MOTOR", serviceRecommendations: "", paymentTypes: "BRI QRIS" },
  { no: 3, invoiceDate: "07-Jul-2026", store: "Wijaya Motor - One Stop Service", serviceInvoice: "SRI/003/26070030", type: "Service Sale", status: "Completed", customer: "LUPIN MOTOR", company: "", customerGroup: "", membership: "", customerPhone: "081314778809", salesperson: "", bookingSource: "", referenceNumber: "", insuranceProvider: "", serviceAdvisor: "NANDA SALSA", vehicleType: "Car", registration: "B1800TP", hullNumber: "", vin: "", vehicleMake: "RANGE ROVER", vehicleModel: "EVOQUE", qty: 20, discount: 136000, subtotal: 1224000, tax: 0, otherTax: 0, total: 1224000, tradeIn: 0, swo: "SWO/003/26070029", sro: "SRO/003/26070029", serviceReservation: "", notes: "BRI 039801003070566 a/n PUTRA WIJAYA MOTOR", serviceRecommendations: "", paymentTypes: "BRI QRIS" },
  { no: 4, invoiceDate: "07-Jul-2026", store: "Wijaya Motor - One Stop Service", serviceInvoice: "SRI/003/26070031", type: "Service Sale", status: "Completed", customer: "BPK. ALDO", company: "", customerGroup: "", membership: "", customerPhone: "0895610488742", salesperson: "", bookingSource: "", referenceNumber: "", insuranceProvider: "", serviceAdvisor: "NANDA SALSA", vehicleType: "Car", registration: "KH1863GI", hullNumber: "", vin: "", vehicleMake: "TOYOTA", vehicleModel: "LAND CRUISER", qty: 2, discount: 0, subtotal: 400000, tax: 0, otherTax: 0, total: 400000, tradeIn: 0, swo: "SWO/003/26070032", sro: "SRO/003/26070033", serviceReservation: "", notes: "BRI 039801003070566 a/n PUTRA WIJAYA MOTOR", serviceRecommendations: "", paymentTypes: "BRI QRIS" },
  { no: 5, invoiceDate: "07-Jul-2026", store: "Wijaya Motor - One Stop Service", serviceInvoice: "SRI/003/26070032", type: "Service Sale", status: "Completed", customer: "AUTO PRIMA", company: "", customerGroup: "", membership: "", customerPhone: "081298280218", salesperson: "", bookingSource: "", referenceNumber: "", insuranceProvider: "", serviceAdvisor: "NANDA SALSA", vehicleType: "Car", registration: "B819BEN", hullNumber: "", vin: "", vehicleMake: "BYD", vehicleModel: "SEAL", qty: 1, discount: 5000, subtotal: 45000, tax: 0, otherTax: 0, total: 45000, tradeIn: 0, swo: "SWO/003/26070033", sro: "SRO/003/26070034", serviceReservation: "", notes: "BRI 039801003070566 a/n PUTRA WIJAYA MOTOR", serviceRecommendations: "", paymentTypes: "BRI QRIS" },
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

export default function SummaryServiceInvoicesPage() {
  const router = useRouter();

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ padding: "6px 16px", background: "#f3f3f3", borderBottom: "1px solid #ecebea", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <ReceiptText size={18} color="#0176d3" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#001526" }}>
            Summary Service Invoices From 07-Jul-2026 - To 07-Jul-2026
          </span>
        </div>
        <Star size={16} color="#f28500" />
      </div>

      {/* ── Filter Section ── */}
      <div style={{ margin: "16px 24px", border: "1px solid #ecebea", borderRadius: 8, background: "#fff", padding: 16 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Order Type"><select className="form-select" style={{ minWidth: 130 }}><option>All Types</option><option>Service Sale</option></select></Field>
          <Field label="Date Option"><select className="form-select" style={{ minWidth: 150 }}><option>Completed Date</option><option>Invoice Date</option></select></Field>
          <Field label="From Date"><input type="date" className="form-input" defaultValue="2026-07-07" style={{ minWidth: 130 }} /></Field>
          <Field label="To Date"><input type="date" className="form-input" defaultValue="2026-07-07" style={{ minWidth: 130 }} /></Field>
          <Field label="Store"><select className="form-select" style={{ minWidth: 170 }}><option>All Stores</option><option>Wijaya Motor - One Stop Service</option><option>PT Putra Wijaya Motor</option></select></Field>
          <Field label="Service Invoice"><input type="text" className="form-input" placeholder="Service Invoice" style={{ minWidth: 140 }} /></Field>
          <Field label="Status"><select className="form-select" style={{ minWidth: 120 }}><option>All Status</option><option>Completed</option><option>Draft</option></select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Customer"><select className="form-select" style={{ minWidth: 160 }}><option>All Customers</option><option>BPK. IKO</option><option>BPK. RICKY</option><option>LUPIN MOTOR</option><option>BPK. ALDO</option><option>AUTO PRIMA</option></select></Field>
          <Field label="Customer Group"><select className="form-select" style={{ minWidth: 140 }}><option>All Customer Groups</option></select></Field>
          <Field label="Membership"><select className="form-select" style={{ minWidth: 120 }}><option>Any</option><option>Yes</option><option>No</option></select></Field>
          <Field label="Registration"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="Hull Number"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="VIN"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="Salesperson"><select className="form-select" style={{ minWidth: 140 }}><option>All Salespersons</option></select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Booking Source"><select className="form-select" style={{ minWidth: 140 }}><option>All Booking Source</option></select></Field>
          <Field label="Has Ref Number"><select className="form-select" style={{ minWidth: 120 }}><option>All</option><option>Yes</option><option>No</option></select></Field>
          <Field label="Reference Number"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 130 }} /></Field>
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
              <th style={TH}>Invoice Date</th>
              <th style={TH}>Store</th>
              <th style={TH}>Service Invoice</th>
              <th style={TH}>Type</th>
              <th style={TH}>Status</th>
              <th style={TH}>Customer</th>
              <th style={TH}>Company</th>
              <th style={TH}>Customer Group</th>
              <th style={TH}>Membership</th>
              <th style={TH}>Customer Phone</th>
              <th style={TH}>Salesperson</th>
              <th style={TH}>Booking Source</th>
              <th style={TH}>Reference Number</th>
              <th style={TH}>Insurance Provider</th>
              <th style={TH}>Service Advisor</th>
              <th style={TH}>Vehicle Type</th>
              <th style={TH}>Registration</th>
              <th style={TH}>Hull Number</th>
              <th style={TH}>VIN</th>
              <th style={TH}>Vehicle Make</th>
              <th style={TH}>Vehicle Model</th>
              <th style={{ ...TH, textAlign: "right" }}>Qty</th>
              <th style={{ ...TH, textAlign: "right" }}>Discount</th>
              <th style={{ ...TH, textAlign: "right" }}>Subtotal</th>
              <th style={{ ...TH, textAlign: "right" }}>Tax</th>
              <th style={{ ...TH, textAlign: "right" }}>Other Tax</th>
              <th style={{ ...TH, textAlign: "right" }}>Total</th>
              <th style={{ ...TH, textAlign: "right" }}>Trade In</th>
              <th style={TH}>Service WO</th>
              <th style={TH}>Service Order</th>
              <th style={TH}>Service Reservation</th>
              <th style={TH}>Notes</th>
              <th style={TH}>Service Recommendations</th>
              <th style={TH}>Payment Types</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.no} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={TD}>{row.no}</td>
                <td style={TD}>{row.invoiceDate}</td>
                <td style={{ ...TD, ...L }}>{row.store}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/finance/invoices/service/${row.serviceInvoice}`)}>{row.serviceInvoice}</td>
                <td style={TD}>{row.type}</td>
                <td style={TD}><span className="pill pill--completed">{row.status}</span></td>
                <td style={{ ...TD, ...L }}>{row.customer}</td>
                <td style={TD}>{row.company || "—"}</td>
                <td style={TD}>{row.customerGroup || "—"}</td>
                <td style={TD}>{row.membership || "—"}</td>
                <td style={TD}>{row.customerPhone}</td>
                <td style={TD}>{row.salesperson || "—"}</td>
                <td style={TD}>{row.bookingSource || "—"}</td>
                <td style={TD}>{row.referenceNumber || "—"}</td>
                <td style={TD}>{row.insuranceProvider || "—"}</td>
                <td style={TD}>{row.serviceAdvisor}</td>
                <td style={TD}>{row.vehicleType}</td>
                <td style={{ ...TD, ...L }}>{row.registration}</td>
                <td style={TD}>{row.hullNumber || "—"}</td>
                <td style={TD}>{row.vin || "—"}</td>
                <td style={TD}>{row.vehicleMake}</td>
                <td style={TD}>{row.vehicleModel}</td>
                <td style={{ ...TD, textAlign: "right" }}>{row.qty}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.discount)}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.subtotal)}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.tax)}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.otherTax)}</td>
                <td style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fmt(row.total)}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.tradeIn)}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/work-orders/${row.swo}`)}>{row.swo}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/service-orders/${row.sro}`)}>{row.sro}</td>
                <td style={TD}>{row.serviceReservation || "—"}</td>
                <td style={{ ...TD, maxWidth: 250 }}>{row.notes || "—"}</td>
                <td style={TD}>{row.serviceRecommendations || "—"}</td>
                <td style={TD}>{row.paymentTypes || "—"}</td>
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
