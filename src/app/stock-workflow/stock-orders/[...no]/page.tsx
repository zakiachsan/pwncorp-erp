"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer, Search } from "lucide-react";

const statusWorkflow = ["DRAFT", "STORE CONFIRMED", "WAREHOUSE SENT", "STORE RECEIVED"];

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function StockOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const rawNo = params.no as string[];
  const orderNo = rawNo ? rawNo.join("/") : "";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/stock-orders?search=${encodeURIComponent(orderNo)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Stock Order tidak ditemukan: " + orderNo); setLoading(false); return; }
        setOrder({
          refCode: found.orderNo || orderNo,
          referenceNumber: found.refNo || "-",
          fromWarehouse: found.warehouse || "-",
          deliverTo: found.deliverTo || found.store || "-",
          createdBy: found.createdBy || "-",
          updatedBy: found.updatedBy || "-",
          notes: found.notes || "",
          createdAt: found.createdAt || found.date || "-",
          updatedAt: found.updatedAt || "-",
          confirmedDate: found.confirmedDate || "-",
          sentDate: found.sentDate || "-",
          receivedDate: found.receivedAt || "-",
          source: found.source || "Web",
          journals: found.journals || [],
          status: found.status || "DRAFT",
          items: (found.items || []).map((it: any, i: number) => ({
            no: i + 1,
            sku: it.sku || it.sparepart?.sku || "-",
            product: it.name || it.sparepart?.name || "-",
            productCode: it.productCode || it.sparepart?.code || "",
            order: it.orderQty || it.qty || 0,
            sent: it.sentQty || 0,
            receive: it.receiveQty || 0,
            avgCost: it.avgCost || it.price || 0,
          })),
        });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load stock order"); setLoading(false); });
  }, [orderNo]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/stock-workflow/stock-orders")} style={S.backBtn}>
          <ArrowLeft size={16} /> Stock Orders
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Loading...</p></div>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/stock-workflow/stock-orders")} style={S.backBtn}>
          <ArrowLeft size={16} /> Stock Orders
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>{error || "Stock Order tidak ditemukan: " + orderNo}</p></div>
      </div>
    );
  }

  const currentStepIdx = statusWorkflow.indexOf(order.status);
  const totalOrder = order.items.reduce((s: number, x: any) => s + x.order, 0);
  const totalSent = order.items.reduce((s: number, x: any) => s + x.sent, 0);
  const totalReceive = order.items.reduce((s: number, x: any) => s + x.receive, 0);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Stock Order (Warehouse)</h1>
      </div>

      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            {statusWorkflow.map((step, i) => (
              <span key={step} style={{ ...S.badge, background: i === currentStepIdx ? "#0176d3" : "transparent", color: i === currentStepIdx ? "#fff" : "#8e8f8e", border: `1px solid ${i === currentStepIdx ? "#0176d3" : "#d8d8d8"}` }}>{step}</span>
            ))}
          </div>
        </div>
        <button style={S.actionBtn}><Printer size={14} /> Print</button>
      </div>

      <div style={S.tabBar}>
        <button style={{ ...S.tab, color: "#fff", background: "#0176d3", fontWeight: 600 }}>Details</button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
        <div>
          <F label="REF CODE" value={order.refCode} />
          <F label="REFERENCE NUMBER" value={order.referenceNumber} />
          <F label="FROM WAREHOUSE" value={order.fromWarehouse} link />
          <F label="DELIVER TO" value={order.deliverTo} link />
          <F label="CREATED BY" value={order.createdBy} link />
          <F label="UPDATED BY" value={order.updatedBy} link />
          <F label="NOTES" value={order.notes || "-"} />
        </div>
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <F label="CREATED AT" value={order.createdAt} />
          <F label="UPDATED AT" value={order.updatedAt} />
          <F label="CONFIRMED DATE" value={order.confirmedDate} />
          <F label="SENT DATE" value={order.sentDate} />
          <F label="RECEIVED DATE" value={order.receivedDate} />
          <F label="SOURCE" value={order.source} />
          <div style={{ marginBottom: 10 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>JOURNAL</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              {order.journals.map((j: string) => (
                <span key={j} style={{ fontSize: 13, fontWeight: 500, color: "#0176d3", cursor: "pointer" }}>{j}</span>
              ))}
              {order.journals.length === 0 && <span style={{ fontSize: 13, color: "#8e8f8e" }}>-</span>}
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8, marginBottom: 12 }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input type="text" placeholder="SKU" style={S.inputSmall} />
          <input type="text" placeholder="Product Name" style={S.inputSmall} />
          <button style={S.searchBtn}><Search size={14} /> Search</button>
        </div>
        <button style={S.actionBtn}>Export</button>
      </div>

      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 36 }}>No</th>
              <th style={S.th}>SKU</th>
              <th style={S.th}>Product</th>
              <th style={S.th}>Product Code</th>
              <th style={{ ...S.th, textAlign: "right" }}>Order</th>
              <th style={{ ...S.th, textAlign: "right" }}>Sent</th>
              <th style={{ ...S.th, textAlign: "right" }}>Receive</th>
              <th style={{ ...S.th, textAlign: "right" }}>Average Cost (Rp)</th>
            </tr>
          </thead>
          <tbody>
            {order.items.length === 0 && (
              <tr>
                <td colSpan={8} style={{ ...S.td, textAlign: "center", color: "#8e8f8e", padding: 24 }}>Belum ada item</td>
              </tr>
            )}
            {order.items.map((item: any) => (
              <tr key={item.no} style={S.tr}>
                <td style={S.td}>{item.no}</td>
                <td
                  style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }}
                  onClick={() => router.push(`/products/${item.sku}`)}
                >{item.sku}</td>
                <td style={S.td}>{item.product}</td>
                <td style={S.td}>{item.productCode || "-"}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{item.order}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{item.sent}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{item.receive}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{fmt(item.avgCost)}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f3f3f3", fontWeight: 700 }}>
              <td style={{ ...S.td, fontWeight: 700 }} colSpan={4}>TOTAL ALL PAGE</td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totalOrder}</td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totalSent}</td>
              <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>{totalReceive}</td>
              <td style={S.td}></td>
            </tr>
          </tfoot>
        </table>
      </div>

      <div style={{ marginTop: 16 }}>
        <button onClick={() => router.push("/stock-workflow/stock-orders")} style={S.backBtn}>
          <ArrowLeft size={16} /> Stock Orders
        </button>
      </div>
    </div>
  );
}

function F({ label, value, link = false }: { label: string; value: string; link?: boolean }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526" }}>{value}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  card: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  workflowBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, marginBottom: 12 },
  badge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" as const },
  actionBtn: { display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px", fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  tabBar: { display: "flex", gap: 0, marginBottom: 16, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content" },
  tab: { padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", transition: "all 150ms", whiteSpace: "nowrap" as const },
  inputSmall: { padding: "6px 10px", fontSize: 12, border: "1px solid #d8d8d8", borderRadius: 6, background: "#fff", color: "#001526", width: 120 },
  searchBtn: { display: "inline-flex", alignItems: "center", gap: 4, padding: "6px 12px", fontSize: 12, fontWeight: 500, color: "#0176d3", background: "#fff", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" },
  tableWrap: { border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
};
