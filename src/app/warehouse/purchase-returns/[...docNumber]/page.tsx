"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, Send, CheckCircle, Ban, PackageCheck } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const formatIDR = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtDate = (d: any) => {
  if (!d) return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const workflowSteps = ["DRAFT", "SENT", "APPROVED", "COMPLETED"];
const statusColor = (s: string) => {
  const map: Record<string, string> = { Draft: "#6b7280", Sent: "#0176d3", Approved: "#f59e0b", Completed: "#2e844a", Cancelled: "#ea001e" };
  return map[s] || "#6b7280";
};

export default function PurchaseReturnDetailPage() {
  const router = useRouter();
  const params = useParams();
  const docNumberArray = params.docNumber as string[];
  const docNumber = docNumberArray ? docNumberArray.join("/") : "";
  const [ret, setRet] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmAction, setConfirmAction] = useState<string | null>(null);

  const fetchReturn = () => {
    fetch(`/api/purchase-returns?search=${encodeURIComponent(docNumber)}&limit=1`)
      .then(r => r.json())
      .then(json => {
        const found = (json.data || [])[0];
        if (!found) { setError("Purchase Return tidak ditemukan: " + docNumber); setLoading(false); return; }
        return fetch(`/api/purchase-returns/${found.id}`)
          .then(r2 => r2.json())
          .then(j2 => { setRet(j2.data || found); setLoading(false); });
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  };

  useEffect(() => { fetchReturn(); }, [docNumber]);

  const doAction = async (action: string) => {
    setConfirmAction(null);
    try {
      const res = await fetch(`/api/purchase-returns/${ret.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      fetchReturn();
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!ret) return null;

  const isDraft = ret.status === "Draft";
  const isSent = ret.status === "Sent";
  const isApproved = ret.status === "Approved";
  const isCancelled = ret.status === "Cancelled";
  const currentStepIdx = workflowSteps.indexOf(ret.status?.toUpperCase());
  const items = ret.items || [];
  const totalQty = items.reduce((s: number, x: any) => s + (x.qty || 0), 0);

  const confirmLabels: Record<string, { title: string; desc: string; color: string }> = {
    send: { title: "Send to Supplier?", desc: "Barang akan ditandai siap dikirim ke supplier.", color: "#0176d3" },
    approve: { title: "Approve Return?", desc: "Pengiriman barang di-approve sesuai SOP.", color: "#f59e0b" },
    complete: { title: "Complete Return?", desc: "Return selesai dan stock akan dikurangi. Tindakan ini tidak bisa dibatalkan.", color: "#2e844a" },
    cancel: { title: "Cancel Return?", desc: "Purchase Return akan dibatalkan.", color: "#ea001e" },
  };

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/warehouse/purchase-returns")} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div>
            <div className="view-title">Purchase Return (Standard)</div>
            <div className="text-xs text-[--color-text-secondary]">{ret.docNo}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {isDraft && (
            <>
              <button onClick={() => setConfirmAction("send")} className="btn btn--sm" style={{ background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                <Send size={14} /> Send to Supplier
              </button>
              <button onClick={() => setConfirmAction("cancel")} className="btn btn--sm" style={{ background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>
                <Ban size={14} /> Cancel
              </button>
            </>
          )}
          {isSent && (
            <>
              <button onClick={() => setConfirmAction("approve")} className="btn btn--sm" style={{ background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}>
                <CheckCircle size={14} /> Approve
              </button>
              <button onClick={() => setConfirmAction("cancel")} className="btn btn--sm" style={{ background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>
                <Ban size={14} /> Cancel
              </button>
            </>
          )}
          {isApproved && (
            <button onClick={() => setConfirmAction("complete")} className="btn btn--sm" style={{ background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}>
              <PackageCheck size={14} /> Complete
            </button>
          )}
          <button onClick={() => window.print()} className="btn btn--sm"><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="mb-4 px-4 py-2 rounded-md text-sm font-semibold" style={{ background: "#fef2f2", color: "#ea001e", border: "1px solid #fecaca" }}>
          Purchase Return ini telah DIBATALKAN
        </div>
      )}

      {/* Workflow Bar */}
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            {isCancelled ? (
              <span style={{ ...S.badge, background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>CANCELLED</span>
            ) : (
              workflowSteps.map((step, i) => (
                <span key={step} style={{
                  ...S.badge,
                  background: i <= currentStepIdx ? "#2e844a" : "transparent",
                  color: i <= currentStepIdx ? "#fff" : "#8e8f8e",
                  border: `1px solid ${i <= currentStepIdx ? "#2e844a" : "#d8d8d8"}`,
                }}>{step}</span>
              ))
            )}
          </div>
        </div>
        <div>
          <span style={{ fontSize: 12, color: "#444746" }}>Type: </span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{ret.returnType || "Return"}</span>
        </div>
      </div>

      {/* Details */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
        <div>
          <F label="DOCUMENT NUMBER" value={ret.docNo || "-"} />
          <F label="PURCHASE ORDER" value={ret.po?.poNo || "-"} link onClick={() => router.push(`/warehouse/purchase-orders/${ret.po?.poNo}`)} />
          <F label="SUPPLIER" value={ret.supplier?.companyName || "-"} />
          <F label="RETURN TYPE" value={ret.returnType || "Return"} />
          <F label="WAREHOUSE" value={ret.warehouse || "-"} />
          <F label="REASON" value={ret.reason || "-"} />
        </div>
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <F label="STATUS" value={ret.status} />
          <F label="DATE" value={fmtDate(ret.date)} />
          <F label="CREATED AT" value={ret.createdAt ? new Date(ret.createdAt).toLocaleString("id-ID") : "-"} />
          <F label="TOTAL" value={formatIDR(ret.total || 0)} />
        </div>
      </div>

      {/* Items Table */}
      <div style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Return Items</div>
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              <th style={{ ...S.th, width: 40 }}>No</th>
              <th style={S.th}>SKU</th>
              <th style={S.th}>Product</th>
              <th style={{ ...S.th, textAlign: "right" }}>Qty</th>
              <th style={{ ...S.th, textAlign: "right" }}>Unit Price</th>
              <th style={{ ...S.th, textAlign: "right" }}>Amount</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={item.id || idx} style={S.tr}>
                <td style={S.td}>{idx + 1}</td>
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{item.sparepart?.sku || "-"}</td>
                <td style={S.td}>{item.sparepart?.name || "-"}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{item.qty || 0}</td>
                <td style={{ ...S.td, textAlign: "right" }}>{formatIDR(item.unitPrice || 0)}</td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{formatIDR(item.total || 0)}</td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr><td colSpan={6} style={{ ...S.td, textAlign: "center", color: "#8e8f8e" }}>No items</td></tr>
            )}
          </tbody>
          <tfoot>
            <tr style={{ fontWeight: 700, borderTop: "2px solid #001526" }}>
              <td colSpan={3} style={{ ...S.td, textAlign: "right" }}>Total</td>
              <td style={{ ...S.td, textAlign: "right", color: "#0176d3" }}>{totalQty}</td>
              <td style={S.td}></td>
              <td style={{ ...S.td, textAlign: "right", fontSize: 14, color: "#0176d3" }}>{formatIDR(ret.total || 0)}</td>
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

function F({ label, value, link = false, onClick }: { label: string; value: string; link?: boolean; onClick?: () => void }) {
  return (
    <div style={{ marginBottom: 10, cursor: link ? "pointer" : "default" }} onClick={onClick}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      <div style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526" }}>{value}</div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  workflowBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, marginBottom: 16 },
  badge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" as const },
  tableWrap: { border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
};
