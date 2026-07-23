"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, CheckCircle, Ban, Send, Package } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const fmtDate = (d: any) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const workflowSteps = ["DRAFT", "CONFIRMED", "WAREHOUSE SENT", "RECEIVED"];

export default function StockOrderDetailPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.no as string[];
  const refCode = refCodeArray ? (Array.isArray(refCodeArray) ? refCodeArray.join("/") : refCodeArray) : "";
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const fetchOrder = () => {
    fetch(`/api/stock-orders?search=${encodeURIComponent(refCode)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Stock Order tidak ditemukan: " + refCode); setLoading(false); return; }
        return fetch(`/api/stock-orders/${found.id}`)
          .then((r2) => r2.json())
          .then((j2) => { setOrder(j2.data || found); setLoading(false); });
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  };

  useEffect(() => { fetchOrder(); }, [refCode]);

  const doAction = async (action: string) => {
    setConfirmAction(null);
    try {
      const res = await fetch(`/api/stock-orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      fetchOrder();
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!order) return null;

  const status = order.status?.toUpperCase() || "DRAFT";
  const isDraft = status === "DRAFT" || status === "PENDING";
  const isConfirmed = status === "CONFIRMED";
  const isWarehouseSent = status === "WAREHOUSE SENT";
  const isCancelled = status === "CANCELLED";
  const currentStepIdx = isCancelled ? -1 : workflowSteps.indexOf(status);
  const items = order.items || [];
  const totalQty = items.reduce((s: number, x: any) => s + (x.qty || 0), 0);
  const totalSentQty = items.reduce((s: number, x: any) => s + (x.sentQty || 0), 0);

  const confirmLabels: Record<string, { title: string; desc: string; color: string }> = {
    confirm: { title: "Confirm Stock Order?", desc: "Stock order akan dikonfirmasi ke gudang.", color: "#0176d3" },
    warehouse_sent: { title: "Warehouse Sent?", desc: "Barang sudah dikirim dari gudang.", color: "#f59e0b" },
    receive: { title: "Receive Stock Order?", desc: "Barang sudah diterima di store.", color: "#2e844a" },
    cancel: { title: "Cancel Stock Order?", desc: "Stock order akan dibatalkan.", color: "#ea001e" },
  };

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/stock-workflow/stock-orders")} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div>
            <div className="view-title">Stock Order</div>
            <div className="text-xs text-[--color-text-secondary]">{order.orderNo}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {isDraft && (
            <>
              <button onClick={() => setConfirmAction("confirm")} className="btn btn--sm" style={{ background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                <CheckCircle size={14} /> Confirm
              </button>
              <button onClick={() => setConfirmAction("cancel")} className="btn btn--sm" style={{ background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>
                <Ban size={14} /> Cancel
              </button>
            </>
          )}
          {isConfirmed && (
            <button onClick={() => router.push(`/stock-workflow/stock-orders/review/${order.orderNo}`)} className="btn btn--sm" style={{ background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}>
              <Send size={14} /> Review Qty to Send
            </button>
          )}
          {isWarehouseSent && (
            <button onClick={() => setConfirmAction("receive")} className="btn btn--sm" style={{ background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}>
              <CheckCircle size={14} /> Receive
            </button>
          )}
          <button onClick={() => window.print()} className="btn btn--sm"><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="mb-4 px-4 py-2 rounded-md text-sm font-semibold" style={{ background: "#fef2f2", color: "#ea001e", border: "1px solid #fecaca" }}>
          Stock Order ini telah DIBATALKAN
        </div>
      )}

      {/* Workflow Bar */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            {isCancelled ? (
              <span style={{ display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, background: "#ea001e", color: "#fff" }}>CANCELLED</span>
            ) : (
              workflowSteps.map((step, i) => (
                <span key={step} style={{
                  display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4,
                  fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
                  background: i <= currentStepIdx ? "#2e844a" : "transparent",
                  color: i <= currentStepIdx ? "#fff" : "#8e8f8e",
                  border: `1px solid ${i <= currentStepIdx ? "#2e844a" : "#d8d8d8"}`,
                }}>{step}</span>
              ))
            )}
          </div>
        </div>
        {order.wo && (
          <div>
            <span style={{ fontSize: 12, color: "#444746" }}>WO: </span>
            <span style={{ fontSize: 12, fontWeight: 600, color: "#0176d3", cursor: "pointer" }}
              onClick={() => router.push(`/work-orders/${order.wo.woNo}`)}>{order.wo.woNo}</span>
          </div>
        )}
      </div>

      {/* Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
        <div>
          <F label="ORDER NUMBER" value={order.orderNo || "-"} />
          <F label="WAREHOUSE" value={order.warehouse || "-"} />
          <F label="WORK ORDER" value={order.wo?.woNo || "-"} />
        </div>
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <F label="STATUS" value={order.status} />
          <F label="DATE" value={fmtDate(order.date)} />
          <F label="CREATED AT" value={order.createdAt ? new Date(order.createdAt).toLocaleString("id-ID") : "-"} />
        </div>
      </div>

      {/* Items Table */}
      <div style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Stock Order Items</div>
      <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
        <table style={{ width: "100%", borderCollapse: "collapse" as const, fontSize: 13 }}>
          <thead>
            <tr>
              <th style={S.th}>No</th>
              <th style={S.th}>SKU</th>
              <th style={S.th}>Product</th>
              <th style={{ ...S.th, textAlign: "right" }}>Current Stock</th>
              <th style={{ ...S.th, textAlign: "right" }}>Order Qty</th>
              <th style={{ ...S.th, textAlign: "right" }}>Sent Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={item.id || idx}>
                <td style={S.td}>{idx + 1}</td>
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{item.sparepart?.sku || "-"}</td>
                <td style={S.td}>{item.sparepart?.name || "-"}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{item.sparepart?.stockQty ?? "-"}</td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{item.qty || 0}</td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600, color: (item.sentQty || 0) > 0 ? "#2e844a" : "#8e8f8e" }}>{item.sentQty || 0}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: "#8e8f8e" }}>No items</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700, borderTop: "2px solid #001526" }}>
              <td colSpan={4} style={{ ...S.td, textAlign: "right" }}>Total</td>
              <td style={{ ...S.td, textAlign: "right", color: "#0176d3" }}>{totalQty}</td>
              <td style={{ ...S.td, textAlign: "right", color: totalSentQty > 0 ? "#2e844a" : "#8e8f8e" }}>{totalSentQty}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Confirm Modal */}
      {confirmAction && confirmLabels[confirmAction] && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>{confirmLabels[confirmAction].title}</h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20 }}>{confirmLabels[confirmAction].desc}</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setConfirmAction(null)} className="btn btn--sm">Batal</button>
              <button onClick={() => doAction(confirmAction)} className="btn btn--sm" style={{ background: confirmLabels[confirmAction].color, color: "#fff", border: `1px solid ${confirmLabels[confirmAction].color}` }}>Ya, Lanjut</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function F({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ marginBottom: 10 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: "#001526" }}>{value}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
};
