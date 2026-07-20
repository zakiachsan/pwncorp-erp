"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, FileText, ChevronRight } from "lucide-react";
import { useEffect, useState } from "react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    DRAFT: "#6b7280",
    UNPAID: "#ea001e",
    PARTIAL: "#f59e0b",
    PAID: "#2e844a",
  };
  return map[s] || "#6b7280";
};

export default function ServiceInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();

  const noArray = params.no as string[];
  const invoiceNo = Array.isArray(noArray) ? noArray.join("/") : (noArray || "");

  const [inv, setInv] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!invoiceNo) { setLoading(false); setError("No invoice number"); return; }

    fetch(`/api/invoices?search=${encodeURIComponent(invoiceNo)}&limit=1`)
      .then(r => r.json())
      .then(j => {
        const found = j.data?.[0];
        if (!found) { setError("Service invoice not found"); setLoading(false); return; }
        if (found.id) {
          return fetch(`/api/invoices/${found.id}`)
            .then(r2 => r2.json())
            .then(j2 => { setInv(j2.data || found); setLoading(false); });
        }
        setInv(found);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load service invoice"); setLoading(false); });
  }, [invoiceNo]);

  if (loading) return <div style={{ padding: 32, textAlign: "center", color: "#444746" }}>Loading...</div>;
  if (error) return (
    <div style={{ padding: 24 }}>
      <button onClick={() => router.push("/finance/invoices/service")} style={S.backBtn}><ArrowLeft size={16} /> Service Invoices</button>
      <div style={{ marginTop: 16, color: "#ea001e", fontSize: 14 }}>{error}: {invoiceNo}</div>
    </div>
  );
  if (!inv) return null;

  // Map API fields
  const docNo = inv.invNo || invoiceNo;
  const woNo = inv.wo?.woNo || "-";
  const soNo = inv.wo?.so?.soNo || "-";
  const customer = inv.customer?.name || "-";
  const invoiceDate = fmtDate(inv.invoiceDate);
  const dueDate = fmtDate(inv.dueDate);
  const status = inv.status || "DRAFT";
  const subtotal = inv.subtotal || inv.total || 0;
  const tax = inv.tax || 0;
  const total = inv.total || 0;
  const amountPaid = inv.amountPaid || 0;
  const amountDue = inv.amountDue ?? (total - amountPaid);
  const items = inv.items || [];

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Back button */}
      <button onClick={() => router.push("/finance/invoices/service")} style={S.backBtn}>
        <ArrowLeft size={16} /> Service Invoices
      </button>

      {/* Title & Actions */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <FileText size={20} style={{ color: "#0176d3" }} />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>
            Service Invoice ({invoiceNo})
          </h1>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Two-column layout */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
        {/* Left Column */}
        <div>
          <F label="DOCUMENT NUMBER" value={docNo} />

          {/* SWO Reference */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>SWO REFERENCE</div>
            <div style={S.miniTableWrap}>
              <table style={S.miniTable}>
                <thead>
                  <tr>
                    <th style={S.miniTh}>Document Number</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    style={{ ...S.tr, cursor: woNo !== "-" ? "pointer" : "default" }}
                    onClick={() => woNo !== "-" && router.push(`/work-orders/${woNo}`)}
                  >
                    <td style={{ ...S.miniTd, color: woNo !== "-" ? "#0176d3" : "#444746", fontWeight: 500 }}>{woNo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Service Order */}
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>SERVICE ORDER</div>
            <div style={S.miniTableWrap}>
              <table style={S.miniTable}>
                <thead>
                  <tr>
                    <th style={S.miniTh}>Document Number</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    style={{ ...S.tr, cursor: soNo !== "-" ? "pointer" : "default" }}
                    onClick={() => soNo !== "-" && router.push(`/service-orders/${soNo}`)}
                  >
                    <td style={{ ...S.miniTd, color: soNo !== "-" ? "#0176d3" : "#444746", fontWeight: 500 }}>{soNo}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <F label="CUSTOMER" value={customer} link />
          <F label="INVOICE DATE" value={invoiceDate} />
          <F label="DUE DATE" value={dueDate} />
        </div>
        {/* Right Column */}
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Amounts (IDR)</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#444746" }}>SubTotal</span>
              <span style={{ fontWeight: 500 }}>{fmt(subtotal)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#444746" }}>Tax</span>
              <span style={{ fontWeight: 500 }}>{fmt(tax)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700, borderTop: "1px solid #ecebea", paddingTop: 8, marginTop: 4 }}>
              <span>Total</span>
              <span>{fmt(total)}</span>
            </div>
          </div>

          <div style={{ marginTop: 16, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Payments (IDR)</div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, marginBottom: 6 }}>
              <span style={{ color: "#444746" }}>Amount Due</span>
              <span style={{ fontWeight: 500, color: amountDue > 0 ? "#ea001e" : "#2e844a" }}>{fmt(amountDue)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
              <span style={{ color: "#444746" }}>Amount Paid</span>
              <span style={{ fontWeight: 500, color: "#2e844a" }}>{fmt(amountPaid)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      {items.length > 0 && (
        <div>
          <h3 style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Service Items</h3>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 36 }}>No.</th>
                  <th style={S.th}>Item</th>
                  <th style={S.th}>Description</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Quantity</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Price (IDR)</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Amount (IDR)</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, i: number) => (
                  <tr key={i} style={S.tr}>
                    <td style={S.td}>{i + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{item.item || "-"}</td>
                    <td style={S.td}>{item.description || "-"}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{item.qty}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.unitPrice || 0)}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(item.total || (item.qty * (item.unitPrice || 0)))}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f3f3f3", fontWeight: 700 }}>
                  <td colSpan={3} style={S.td}>TOTAL</td>
                  <td style={{ ...S.td, textAlign: "right" }}>{items.reduce((s: number, x: any) => s + (x.qty || 0), 0)}</td>
                  <td style={S.td}></td>
                  <td style={{ ...S.td, textAlign: "right" }}>{fmt(total)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value, link = false, onClick }: { label: string; value: string; link?: boolean; onClick?: () => void }) {
  return (
    <div style={{ marginBottom: 10, cursor: onClick ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526", display: "flex", alignItems: "center", gap: 4 }}>
        {value}
        {link && <ChevronRight size={13} style={{ color: "#0176d3" }} />}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
    fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  miniTableWrap: {
    border: "1px solid #ecebea", borderRadius: 6, overflow: "hidden", background: "#fff",
  },
  miniTable: { width: "100%", borderCollapse: "collapse", fontSize: 12 },
  miniTh: {
    padding: "5px 8px", textAlign: "left", fontWeight: 600,
    fontSize: 10, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em",
    background: "#f9f9f9", borderBottom: "1px solid #ecebea",
  },
  miniTd: {
    padding: "5px 8px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff",
  },
  tableWrap: {
    border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff",
  },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: {
    padding: "8px 10px", textAlign: "left", fontWeight: 600,
    fontSize: 11, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em",
    background: "#f9f9f9", borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff",
  },
  tr: { transition: "background 100ms" },
};
