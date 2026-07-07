"use client";

import { useRouter } from "next/navigation";
import { CreditCard, Star, Search, Download } from "lucide-react";

const data = [
  { no: 1, date: "07/07/26", serviceInvoice: "SRI/003/26070028", invoiceReceivable: "IR/003/26070028", store: "Wijaya Motor", customer: "BPK. IKO", paymentProvider: "BRI QRIS", amount: 617500, chargeFee: 0, nettAmount: 617500 },
  { no: 2, date: "07/07/26", serviceInvoice: "SRI/003/26070029", invoiceReceivable: "IR/003/26070029", store: "Wijaya Motor", customer: "BPK. RICKY", paymentProvider: "BRI QRIS", amount: 413250, chargeFee: 0, nettAmount: 413250 },
  { no: 3, date: "07/07/26", serviceInvoice: "SRI/003/26070030", invoiceReceivable: "IR/003/26070030", store: "Wijaya Motor", customer: "LUPIN MOTOR", paymentProvider: "BRI QRIS", amount: 1224000, chargeFee: 0, nettAmount: 1224000 },
  { no: 4, date: "07/07/26", serviceInvoice: "SRI/003/26070031", invoiceReceivable: "IR/003/26070031", store: "Wijaya Motor", customer: "BPK. ALDO", paymentProvider: "BRI QRIS", amount: 400000, chargeFee: 0, nettAmount: 400000 },
  { no: 5, date: "07/07/26", serviceInvoice: "SRI/003/26070032", invoiceReceivable: "IR/003/26070032", store: "Wijaya Motor", customer: "AUTO PRIMA", paymentProvider: "BRI QRIS", amount: 45000, chargeFee: 0, nettAmount: 45000 },
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

export default function ServicePaymentTypeInfoPage() {
  const router = useRouter();

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ padding: "6px 16px", background: "#f3f3f3", borderBottom: "1px solid #ecebea", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <CreditCard size={18} color="#0176d3" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#001526" }}>
            Service Payment Type Info From 07-Jul-2026 - To 07-Jul-2026
          </span>
        </div>
        <Star size={16} color="#f28500" />
      </div>

      {/* ── Filter Section ── */}
      <div style={{ margin: "16px 24px", border: "1px solid #ecebea", borderRadius: 8, background: "#fff", padding: 16 }}>
        <div style={{ display: "flex", gap: 10, marginBottom: 12, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="From Date"><input type="date" className="form-input" defaultValue="2026-07-07" style={{ minWidth: 130 }} /></Field>
          <Field label="To Date"><input type="date" className="form-input" defaultValue="2026-07-07" style={{ minWidth: 130 }} /></Field>
          <Field label="Store"><select className="form-select" style={{ minWidth: 170 }}><option>All Stores</option><option>Wijaya Motor</option></select></Field>
          <Field label="Service Invoice"><input type="text" className="form-input" placeholder="Service Invoice" style={{ minWidth: 140 }} /></Field>
          <Field label="Customer"><select className="form-select" style={{ minWidth: 160 }}><option>All Customers</option><option>BPK. IKO</option><option>BPK. RICKY</option><option>LUPIN MOTOR</option><option>BPK. ALDO</option><option>AUTO PRIMA</option></select></Field>
          <Field label="Bank"><select className="form-select" style={{ minWidth: 120 }}><option>All</option></select></Field>
          <Field label="Payment Provider"><select className="form-select" style={{ minWidth: 150 }}><option>All</option></select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
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
              <th style={TH}>Date</th>
              <th style={TH}>Service Invoice</th>
              <th style={TH}>Invoice Receivable</th>
              <th style={TH}>Store</th>
              <th style={TH}>Customer</th>
              <th style={TH}>Payment Provider</th>
              <th style={{ ...TH, textAlign: "right" }}>Amount</th>
              <th style={{ ...TH, textAlign: "right" }}>Charge Fee</th>
              <th style={{ ...TH, textAlign: "right" }}>Nett Amount</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.no} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={TD}>{row.no}</td>
                <td style={TD}>{row.date}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/finance/invoices/service/${row.serviceInvoice}`)}>{row.serviceInvoice}</td>
                <td style={TD}>{row.invoiceReceivable}</td>
                <td style={TD}>{row.store}</td>
                <td style={{ ...TD, ...L }}>{row.customer}</td>
                <td style={TD}>{row.paymentProvider}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.amount)}</td>
                <td style={{ ...TD, textAlign: "right" }}>{fmt(row.chargeFee)}</td>
                <td style={{ ...TD, textAlign: "right", fontWeight: 600 }}>{fmt(row.nettAmount)}</td>
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
