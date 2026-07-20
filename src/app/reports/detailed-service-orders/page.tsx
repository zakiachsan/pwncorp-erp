"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Star, Search, Download } from "lucide-react";

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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/service?report=summary-so&limit=100")
      .then((r) => r.json())
      .then((j) => {
        const orders: any[] = j.data || [];
        // Map SO data to detailed line-item format
        const mapped = orders.flatMap((so: any, idx: number) => {
          const items = so.items || so.serviceOrderItems || [so];
          return items.map((item: any, i: number) => ({
            no: idx * 10 + i + 1,
            sro: so.soNo || "—",
            store: so.store?.name || "—",
            type: so.type || "Service Sale",
            status: so.status || "Approved",
            createdDate: (so.createdAt || so.date || "").slice(0, 10),
            approvedDate: (so.approvedAt || so.date || "").slice(0, 10),
            planServiceDate: (so.planServiceDate || so.date || "").slice(0, 10),
            planServiceTime: so.planServiceTime || "",
            customer: so.customer?.name || "—",
            company: "",
            vehicleType: so.vehicle?.type || "Car",
            registration: so.vehicle?.plateNo || "—",
            hullNumber: "",
            vin: "",
            serviceAdvisor: so.sa?.name || "—",
            salesperson: "",
            bookingSource: "",
            insuranceProvider: "",
            serviceReservation: "",
            itemType: item.itemType || "Service",
            sku: item.sku || item.product?.sku || "—",
            productName: item.productName || item.product?.name || "—",
            brand: item.product?.brand || "",
            itemType2: item.product?.type || "",
            estimatedTime: item.estimatedTime || "",
            qty: item.qty || 0,
            priceExTax: item.price || item.priceExTax || 0,
            discount: item.discount || 0,
            subtotal: item.subtotal || 0,
            tax: item.tax || 0,
            otherTax: item.otherTax || 0,
            total: item.total || so.total || 0,
            swo: so.workOrders?.[0]?.woNo || "",
          }));
        });
        setData(mapped);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load detailed service orders"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
          <Field label="Customer"><select className="form-select" style={{ minWidth: 180 }}><option>All Customers</option></select></Field>
          <Field label="Registration"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="Hull Number"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="VIN"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="Item Type"><select className="form-select" style={{ minWidth: 120 }}><option>All Types</option><option>Service</option><option>Sparepart</option></select></Field>
          <Field label="Product Brand"><select className="form-select" style={{ minWidth: 140 }}><option>All Brands</option></select></Field>
          <Field label="Product Type"><select className="form-select" style={{ minWidth: 140 }}><option>All Types</option></select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Service Product Type"><select className="form-select" style={{ minWidth: 150 }}><option>All Types</option></select></Field>
          <Field label="Service Advisor"><select className="form-select" style={{ minWidth: 150 }}><option>All Service Advisor</option></select></Field>
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
