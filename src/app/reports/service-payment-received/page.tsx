"use client";

import { useRouter } from "next/navigation";
import { DollarSign, Star, Search, Download } from "lucide-react";

const data = [
  { no: 1, paymentType: "BRI QRIS", store: "Wijaya Motor - One Stop Service", sri: "SRI/003/26070030", sro: "SRO/003/26070029", refundDoc: "", paymentDate: "07/07/26", createdBy: "NANDA SALSA", amount: 1224000 },
  { no: 2, paymentType: "BRI QRIS", store: "Wijaya Motor", sri: "SRI/003/26070032", sro: "SRO/003/26070034", refundDoc: "", paymentDate: "07/07/26", createdBy: "NANDA SALSA", amount: 45000 },
  { no: 3, paymentType: "BRI QRIS", store: "Wijaya Motor", sri: "SRI/003/26070028", sro: "SRO/003/26070031", refundDoc: "", paymentDate: "07/07/26", createdBy: "NANDA SALSA", amount: 617500 },
  { no: 4, paymentType: "BRI QRIS", store: "Wijaya Motor", sri: "SRI/003/26070029", sro: "SRO/003/26070032", refundDoc: "", paymentDate: "07/07/26", createdBy: "NANDA SALSA", amount: 413250 },
  { no: 5, paymentType: "BRI QRIS", store: "Wijaya Motor", sri: "SRI/003/26070031", sro: "SRO/003/26070033", refundDoc: "", paymentDate: "07/07/26", createdBy: "NANDA SALSA", amount: 400000 },
];

const totalAmount = data.reduce((sum, row) => sum + row.amount, 0);

// Group by payment type for totals section
const paymentTypeTotals: Record<string, number> = {};
data.forEach((row) => {
  paymentTypeTotals[row.paymentType] = (paymentTypeTotals[row.paymentType] || 0) + row.amount;
});

function fmt(n: number): string { return n.toLocaleString("id-ID").replace(/,/g, "."); }
const L: React.CSSProperties = { color: "#0176d3", cursor: "pointer", fontWeight: 500 };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="form-group" style={{ flex: "0 0 auto" }}><label className="form-label">{label || "\u00A0"}</label>{children}</div>;
}

const TH: React.CSSProperties = { padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", letterSpacing: "0.03em", borderBottom: "2px solid #ecebea", borderRight: "1px solid #ecebea", background: "#f9f9f9", whiteSpace: "nowrap" };
const TD: React.CSSProperties = { padding: "7px 10px", color: "#001526", borderBottom: "1px solid #f0f0f0", borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap" };

export default function ServicePaymentReceivedPage() {
  const router = useRouter();
  return (
    <div>
      <div style={{ padding: "6px 16px", background: "#f3f3f3", borderBottom: "1px solid #ecebea", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <DollarSign size={18} color="#0176d3" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#001526" }}>Service Payment Received From 07-Jul-2026 - To 07-Jul-2026</span>
        </div>
        <Star size={16} color="#f28500" />
      </div>

      <div style={{ margin: "16px 24px", border: "1px solid #ecebea", borderRadius: 8, background: "#fff", padding: 16 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="View By"><select className="form-select" style={{ minWidth: 130 }}><option>Daily</option><option>Date</option></select></Field>
          <Field label="Date"><input type="date" className="form-input" defaultValue="2026-07-07" style={{ minWidth: 130 }} /></Field>
          <Field label="Store"><select className="form-select" style={{ minWidth: 170 }}><option>All Stores</option><option>Wijaya Motor</option><option>PT Putra</option></select></Field>
          <Field label="Payment Type"><input type="text" className="form-input" placeholder="Payment Type" style={{ minWidth: 140 }} /></Field>
          <Field label="Document Type"><select className="form-select" style={{ minWidth: 130 }}><option>All</option></select></Field>
          <Field label="Created By"><select className="form-select" style={{ minWidth: 150 }}><option>All</option><option>NANDA SALSA</option></select></Field>
          <Field label="Sort By"><select className="form-select" style={{ minWidth: 150 }}><option>Payment Date</option></select></Field>
          <Field label="Include Return"><select className="form-select" style={{ minWidth: 110 }}><option>No</option><option>Yes</option></select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="">&nbsp;</Field>
          <button className="btn btn--sm" style={{ minWidth: 90, justifyContent: "center", gap: 6 }}><Search size={14} /> Show</button>
          <button className="btn btn--brand btn--sm" style={{ minWidth: 110, justifyContent: "center", gap: 6, background: "#014486" }}><Download size={14} /> Download</button>
        </div>
      </div>

      <div style={{ margin: "0 24px", border: "1px solid #ecebea", borderRadius: 8, overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: "100%" }}>
          <thead>
            <tr style={{ background: "#f9f9f9" }}>
              <th style={TH}>No.</th>
              <th style={TH}>Payment Type</th>
              <th style={TH}>Store</th>
              <th style={TH}>Document</th>
              <th style={TH}>Reference</th>
              <th style={TH}>Refund Document</th>
              <th style={TH}>Payment Date</th>
              <th style={TH}>Created By</th>
              <th style={{ ...TH, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.no} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={TD}>{row.no}</td>
                <td style={TD}>{row.paymentType}</td>
                <td style={{ ...TD, ...L }}>{row.store}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/finance/invoices/service/${row.sri}`)}>{row.sri}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/service-orders/${row.sro}`)}>{row.sro}</td>
                <td style={TD}>{row.refundDoc || "—"}</td>
                <td style={TD}>{row.paymentDate}</td>
                <td style={TD}>{row.createdBy}</td>
                <td style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fmt(row.amount)}</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr style={{ background: "#f9f9f9" }}>
              <td style={{ ...TD, fontWeight: 700, background: "#f3f3f3", borderTop: "2px solid #ecebea" }} colSpan={8}>Total</td>
              <td style={{ ...TD, textAlign: "right", fontWeight: 700, background: "#f3f3f3", borderTop: "2px solid #ecebea" }}>{fmt(totalAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Total By Payment Type */}
      <div style={{ margin: "16px 24px", border: "1px solid #ecebea", borderRadius: 8, overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: "100%" }}>
          <thead>
            <tr style={{ background: "#f9f9f9" }}>
              <th style={TH}>Payment Type</th>
              <th style={{ ...TH, textAlign: "right" }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {Object.entries(paymentTypeTotals).map(([pt, t], i) => (
              <tr key={pt} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={TD}>{pt}</td>
                <td style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fmt(t)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ margin: "16px 24px", display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 13, color: "#444746" }}>
        <div>Showing 1 — {data.length} of {data.length}</div>
        <div style={{ display: "flex", gap: 8 }}><button className="btn btn--sm" disabled style={{ opacity: 0.4 }}>« Prev</button><button className="btn btn--sm">Next »</button></div>
      </div>
    </div>
  );
}
