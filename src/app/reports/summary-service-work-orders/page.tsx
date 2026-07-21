"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Wrench, Star, Search, Download } from "lucide-react";

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Waiting: "pill pill--waiting",
    "In Progress": "pill pill--in-progress",
    Completed: "pill pill--completed",
  };
  return map[status] || "pill pill--draft";
};

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
  borderRight: "1px solid #ecebea", background: "#f9f9f9",
};

const TD: React.CSSProperties = {
  padding: "7px 10px", color: "#001526", borderBottom: "1px solid #f0f0f0", borderRight: "1px solid #f0f0f0",
};

export default function SummaryServiceWorkOrdersPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/service?report=summary-wo&limit=100")
      .then((r) => r.json())
      .then((j) => {
        const wos: any[] = j.data || [];
        const mapped = wos.map((wo: any, i: number) => ({
          no: i + 1,
          swo: wo.woNo || "—",
          store: wo.store?.name || wo.so?.store?.name || "—",
          createdDate: wo.createdAt ? new Date(wo.createdAt).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
          serviceDate: wo.serviceDate ? new Date(wo.serviceDate).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "—",
          serviceTime: wo.serviceTime || "—",
          startAt: wo.startAt ? new Date(wo.startAt).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "—",
          completedDate: wo.completedDate ? new Date(wo.completedDate).toLocaleString("en-GB", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", hour12: true }) : "",
          status: wo.status || "Waiting",
          leadTime: wo.leadTime || "",
          leadTimeMin: wo.leadTimeMin || 0,
          customer: wo.so?.customer?.name || "—",
          vehicleType: wo.so?.vehicle?.type || "Car",
          registration: wo.so?.vehicle?.plateNo || "—",
          hullNumber: "",
          vin: "",
          estimatedTime: wo.estimatedTime || "",
          serviceAdvisor: wo.so?.sa?.name || "—",
          assignee: wo.mekanik?.name || "—",
          odometer: wo.odometer || 0,
          serviceOrder: wo.so?.soNo || "—",
          serviceReservation: "",
          insuranceProvider: "",
        }));
        setData(mapped);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load summary work orders"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{ padding: "6px 16px", background: "#f3f3f3", borderBottom: "1px solid #ecebea", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Wrench size={18} color="#0176d3" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#001526" }}>
            Summary Service Work Orders From 07-Jul-2026 - To 07-Jul-2026
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
          <Field label="Customer"><select className="form-select" style={{ minWidth: 180 }}><option>All Customers</option></select></Field>
        </div>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Registration"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="Hull Number"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="VIN"><input type="text" className="form-input" defaultValue="All" style={{ minWidth: 110 }} /></Field>
          <Field label="Service Advisor"><select className="form-select" style={{ minWidth: 150 }}><option>All Service Advisor</option></select></Field>
          <Field label="Assignee"><select className="form-select" style={{ minWidth: 140 }}><option>All Assignee</option></select></Field>
          <Field label="">&nbsp;</Field>
          <button className="btn btn--sm" style={{ minWidth: 90, justifyContent: "center", gap: 6 }}><Search size={14} /> Show</button>
          <button className="btn btn--brand btn--sm" style={{ minWidth: 110, justifyContent: "center", gap: 6, background: "#014486" }}><Download size={14} /> Download</button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{ margin: "0 24px", border: "1px solid #ecebea", borderRadius: 8, overflow: "auto" }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, whiteSpace: "nowrap", minWidth: "100%" }}>
          <thead>
            <tr style={{ background: "#f9f9f9" }}>
              <th style={TH}>No.</th>
              <th style={TH}>Service Work Order</th>
              <th style={TH}>Store</th>
              <th style={TH}>Created Date</th>
              <th style={TH}>Service Date</th>
              <th style={TH}>Service Time</th>
              <th style={TH}>Start At</th>
              <th style={TH}>Completed Date</th>
              <th style={TH}>Status</th>
              <th style={TH}>Lead Time</th>
              <th style={TH}>Customer</th>
              <th style={TH}>Vehicle Type</th>
              <th style={TH}>Registration</th>
              <th style={TH}>Hull Number</th>
              <th style={TH}>VIN</th>
              <th style={TH}>Estimated Time</th>
              <th style={TH}>Service Advisor</th>
              <th style={TH}>Assignee</th>
              <th style={TH}>Odometer</th>
              <th style={TH}>Service Order</th>
              <th style={TH}>Service Reservation</th>
              <th style={TH}>Insurance Provider</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, i) => (
              <tr key={row.no} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={TD}>{row.no}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/work-orders/${row.swo}`)}>{row.swo}</td>
                <td style={{ ...TD, ...L }}>{row.store}</td>
                <td style={TD}>{row.createdDate}</td>
                <td style={TD}>{row.serviceDate}</td>
                <td style={TD}>{row.serviceTime}</td>
                <td style={TD}>{row.startAt || "—"}</td>
                <td style={TD}>{row.completedDate || "—"}</td>
                <td style={TD}><span className={statusPill(row.status)}>{row.status}</span></td>
                <td style={TD}>{row.leadTime || "—"}</td>
                <td style={{ ...TD, ...L }}>{row.customer}</td>
                <td style={TD}>{row.vehicleType}</td>
                <td style={{ ...TD, ...L }}>{row.registration}</td>
                <td style={TD}>{row.hullNumber || "—"}</td>
                <td style={TD}>{row.vin || "—"}</td>
                <td style={TD}>{row.estimatedTime || "—"}</td>
                <td style={TD}>{row.serviceAdvisor}</td>
                <td style={TD}>{row.assignee}</td>
                <td style={{ ...TD, textAlign: "right" }}>{row.odometer > 0 ? (row.odometer || 0).toLocaleString("id-ID") : "—"}</td>
                <td style={{ ...TD, ...L }} onClick={() => router.push(`/service-orders/${row.serviceOrder}`)}>{row.serviceOrder}</td>
                <td style={TD}>{row.serviceReservation || "—"}</td>
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