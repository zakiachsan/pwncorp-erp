"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, CheckCircle, Ban, Edit, Save, X, Truck } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

const workflowSteps = ["DRAFT", "RECEIVED"];

export default function PurchaseDeliveryDetailPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.refCode as string[];
  const refCode = refCodeArray ? refCodeArray.join("/") : "";
  const [delivery, setDelivery] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editNotes, setEditNotes] = useState("");
  const [editItems, setEditItems] = useState<any[]>([]);

  // Confirm modals
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);

  const fetchDelivery = () => {
    fetch(`/api/purchase-deliveries?search=${encodeURIComponent(refCode)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Purchase Delivery tidak ditemukan: " + refCode); setLoading(false); return; }
        return fetch(`/api/purchase-deliveries/${found.id}`)
          .then((r2) => r2.json())
          .then((j2) => {
            setDelivery(j2.data || found);
            setLoading(false);
          });
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  };

  useEffect(() => { fetchDelivery(); }, [refCode]);

  const startEdit = () => {
    setEditNotes(delivery.notes || "");
    setEditItems((delivery.items || []).map((it: any) => ({
      sparepartId: it.sparepartId,
      sku: it.sparepart?.sku || "-",
      name: it.sparepart?.name || "-",
      qtyOrdered: it.qtyOrdered || 0,
      qtyReceived: it.qtyReceived || 0,
    })));
    setEditMode(true);
  };

  const updateEditItem = (i: number, field: string, value: any) => {
    setEditItems(prev => prev.map((item, idx) => idx === i ? { ...item, [field]: value } : item));
  };

  const handleSaveEdit = async () => {
    setEditSaving(true);
    try {
      const res = await fetch(`/api/purchase-deliveries/${delivery.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notes: editNotes, items: editItems }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal menyimpan");
      setEditMode(false);
      fetchDelivery();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleConfirm = async () => {
    setShowConfirmModal(false);
    try {
      const res = await fetch(`/api/purchase-deliveries/${delivery.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "confirm" }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      fetchDelivery();
    } catch (e: any) { alert(e.message); }
  };

  const handleCancel = async () => {
    setShowCancelModal(false);
    try {
      const res = await fetch(`/api/purchase-deliveries/${delivery.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "cancel" }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      fetchDelivery();
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!delivery) return null;

  const isDraft = delivery.status === "Draft";
  const isCancelled = delivery.status === "Cancelled";
  const currentStepIdx = workflowSteps.indexOf(delivery.status);
  const items = delivery.items || [];
  const totalQty = items.reduce((s: number, x: any) => s + (x.qtyReceived || 0), 0);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/warehouse/purchase-deliveries")} className="btn btn--sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="view-title">Purchase Delivery (Standard)</div>
            <div className="text-xs text-[--color-text-secondary]">{delivery.deliveryNo}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {isDraft && !editMode && (
            <>
              <button onClick={startEdit} className="btn btn--sm" style={{ background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}>
                <Edit size={14} /> Edit
              </button>
              <button onClick={() => setShowConfirmModal(true)} className="btn btn--sm" style={{ background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}>
                <CheckCircle size={14} /> Confirm Receive
              </button>
              <button onClick={() => setShowCancelModal(true)} className="btn btn--sm" style={{ background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>
                <Ban size={14} /> Cancel
              </button>
            </>
          )}
          {editMode && (
            <>
              <button onClick={() => setEditMode(false)} className="btn btn--sm">Batal</button>
              <button onClick={handleSaveEdit} disabled={editSaving} className="btn btn--sm" style={{ background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}>
                <Save size={14} /> {editSaving ? "Menyimpan..." : "Simpan"}
              </button>
            </>
          )}
          <button onClick={() => window.print()} className="btn btn--sm">
            <Printer size={14} /> Print
          </button>
          {delivery.status === "Received" && (
            <button onClick={() => router.push(`/warehouse/purchase-invoices/new?poId=${delivery.poId}`)} className="btn btn--sm" style={{ background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
              Create Invoice
            </button>
          )}
        </div>
      </div>

      {/* Cancelled Banner */}
      {isCancelled && (
        <div className="mb-4 px-4 py-2 rounded-md text-sm font-semibold" style={{ background: "#fef2f2", color: "#ea001e", border: "1px solid #fecaca" }}>
          Purchase Delivery ini telah DIBATALKAN
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
          <span style={{ fontSize: 12, color: "#444746" }}>PO: </span>
          <span style={{ fontSize: 12, fontWeight: 600 }}>{delivery.po?.poNo || "-"}</span>
        </div>
      </div>

      {/* Details */}
      {!editMode ? (
        <div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 20 }}>
            <div>
              <F label="REF CODE" value={delivery.deliveryNo || "-"} />
              <F label="PURCHASE ORDER" value={delivery.po?.poNo || "-"} link onClick={() => router.push(`/warehouse/purchase-orders/${delivery.po?.poNo}`)} />
              <F label="SUPPLIER" value={delivery.po?.supplier?.companyName || "-"} />
              <F label="NOTES" value={delivery.notes || "-"} />
            </div>
            <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
              <F label="STATUS" value={delivery.status} />
              <F label="CREATED AT" value={delivery.createdAt ? new Date(delivery.createdAt).toLocaleString("id-ID") : "-"} />
              <F label="RECEIVED AT" value={delivery.receivedAt ? new Date(delivery.receivedAt).toLocaleString("id-ID") : "-"} />
            </div>
          </div>

          {/* Items Table */}
          <div style={{ fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 }}>Delivery Items</div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 40 }}>No</th>
                  <th style={S.th}>SKU</th>
                  <th style={S.th}>Product</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Qty Ordered</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Qty Received</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item: any, idx: number) => (
                  <tr key={item.id || idx} style={S.tr}>
                    <td style={S.td}>{idx + 1}</td>
                    <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{item.sparepart?.sku || "-"}</td>
                    <td style={S.td}>{item.sparepart?.name || "-"}</td>
                    <td style={{ ...S.td, textAlign: "right" }}>{item.qtyOrdered || 0}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{item.qtyReceived || 0}</td>
                  </tr>
                ))}
                {items.length === 0 && (
                  <tr><td colSpan={5} style={{ ...S.td, textAlign: "center", color: "#8e8f8e" }}>No items</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr style={{ fontWeight: 700, borderTop: "2px solid #001526" }}>
                  <td colSpan={4} style={{ ...S.td, textAlign: "right" }}>Total Received</td>
                  <td style={{ ...S.td, textAlign: "right", color: "#0176d3" }}>{totalQty}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      ) : (
        /* ─── EDIT MODE ─── */
        <div>
          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#444746", textTransform: "uppercase", marginBottom: 12 }}>Edit Purchase Delivery</div>
            <div className="form-group mb-4">
              <label className="form-label">Notes</label>
              <textarea className="form-input" rows={2} value={editNotes} onChange={e => setEditNotes(e.target.value)} />
            </div>
          </div>

          <div style={S.card}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#444746", textTransform: "uppercase", marginBottom: 12 }}>Edit Items</div>
            <div style={S.tableWrap}>
              <table style={S.table}>
                <thead>
                  <tr>
                    <th style={{ ...S.th, width: 40 }}>#</th>
                    <th style={S.th}>SKU</th>
                    <th style={S.th}>Product</th>
                    <th style={{ ...S.th, textAlign: "right" }}>Qty Ordered</th>
                    <th style={{ ...S.th, textAlign: "right", width: 120 }}>Qty Received</th>
                  </tr>
                </thead>
                <tbody>
                  {editItems.map((item, i) => (
                    <tr key={i}>
                      <td style={S.td}>{i + 1}</td>
                      <td style={S.td}>{item.sku}</td>
                      <td style={S.td}>{item.name}</td>
                      <td style={{ ...S.td, textAlign: "right" }}>{item.qtyOrdered}</td>
                      <td>
                        <input type="number" min={0} max={item.qtyOrdered} className="form-input w-full text-right"
                          value={item.qtyReceived} onChange={e => updateEditItem(i, "qtyReceived", parseInt(e.target.value) || 0)} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Confirm Modal */}
      {showConfirmModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>Confirm Receive?</h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20 }}>Barang akan diterima dan stock akan di-update. Tindakan ini tidak bisa dibatalkan.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowConfirmModal(false)} className="btn btn--sm">Batal</button>
              <button onClick={handleConfirm} className="btn btn--sm" style={{ background: "#2e844a", color: "#fff", border: "1px solid #2e844a" }}>Ya, Confirm</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Modal */}
      {showCancelModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>Cancel Delivery?</h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20 }}>Purchase Delivery akan dibatalkan.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCancelModal(false)} className="btn btn--sm">Batal</button>
              <button onClick={handleCancel} className="btn btn--sm" style={{ background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>Ya, Cancel</button>
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
  card: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)", marginBottom: 16 },
  workflowBar: { display: "flex", alignItems: "center", justifyContent: "space-between", padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, marginBottom: 16 },
  badge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" as const },
  tableWrap: { border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
};
