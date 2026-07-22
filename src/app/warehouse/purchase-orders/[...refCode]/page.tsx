"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, CheckCircle, XCircle, Edit, Send, Ban, Plus, Trash2, Save, X } from "lucide-react";

const formatIDR = (n: number) => {
  if (n === 0) return "Rp 0";
  return "Rp " + n.toLocaleString("id-ID");
};

const fmtDate = (d: any): string => {
  if (!d || d === "-") return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const workflowSteps = ["DRAFT", "SENT", "PARTIAL", "RECEIVED"];

const getStepIndex = (status: string) => {
  const map: Record<string, number> = { DRAFT: 0, SENT: 1, PARTIAL: 2, RECEIVED: 3, CANCELLED: -1 };
  return map[status] ?? 0;
};

const statusColor = (s: string) => {
  const map: Record<string, string> = { DRAFT: "#6b7280", SENT: "#0176d3", PARTIAL: "#f59e0b", RECEIVED: "#2e844a", CANCELLED: "#ea001e" };
  return map[s] || "#6b7280";
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const refCodeArray = Array.isArray(params.refCode) ? params.refCode : [params.refCode as string];
  const refCode = refCodeArray.join("/");
  const [activeTab, setActiveTab] = useState<"details" | "deliveries" | "downPayments">("details");
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editSaving, setEditSaving] = useState(false);
  const [editSupplierId, setEditSupplierId] = useState("");
  const [editWarehouse, setEditWarehouse] = useState("");
  const [editDueAt, setEditDueAt] = useState("");
  const [editItems, setEditItems] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [spareparts, setSpareparts] = useState<any[]>([]);

  // Confirm modals
  const [showSentConfirm, setShowSentConfirm] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showPrint, setShowPrint] = useState(false);

  const fetchPO = () => {
    fetch(`/api/purchase-orders?search=${encodeURIComponent(refCode)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Purchase Order tidak ditemukan: " + refCode); setLoading(false); return; }
        // Fetch full detail
        return fetch(`/api/purchase-orders/${found.id}`)
          .then((r2) => r2.json())
          .then((j2) => {
            setPo(j2.data || found);
            setLoading(false);
          });
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  };

  useEffect(() => { fetchPO(); }, [refCode]);

  useEffect(() => {
    fetch("/api/suppliers?limit=200").then(r => r.json()).then(d => setSuppliers(d.data || [])).catch(() => {});
    fetch("/api/warehouses?limit=100").then(r => r.json()).then(d => setWarehouses(d.data || [])).catch(() => {});
    fetch("/api/spareparts?limit=200").then(r => r.json()).then(d => setSpareparts(d.data || [])).catch(() => {});
  }, []);

  const startEdit = () => {
    setEditSupplierId(po.supplierId || "");
    setEditWarehouse(po.warehouse || "");
    setEditDueAt(po.dueAt ? new Date(po.dueAt).toISOString().split("T")[0] : "");
    setEditItems((po.items || []).map((it: any) => ({
      id: it.id,
      sparepartId: it.sparepartId,
      sku: it.sparepart?.sku || "-",
      name: it.sparepart?.name || "-",
      stockQty: it.sparepart?.stockQty || 0,
      qty: it.qty || 0,
      unitPrice: it.unitPrice || 0,
    })));
    setEditMode(true);
  };

  const addEditItem = () => setEditItems([...editItems, { sparepartId: "", sku: "", name: "", stockQty: 0, qty: 1, unitPrice: 0 }]);
  const removeEditItem = (i: number) => setEditItems(editItems.filter((_, idx) => idx !== i));
  const updateEditItem = (i: number, field: string, value: any) => {
    setEditItems(prev => prev.map((item, idx) => {
      if (idx !== i) return item;
      const updated = { ...item, [field]: value };
      if (field === "sparepartId") {
        const sp = spareparts.find(s => s.id === value);
        if (sp) { updated.sku = sp.sku; updated.name = sp.name; updated.stockQty = sp.stockQty || 0; updated.unitPrice = sp.buyPrice || sp.sellPrice || 0; }
      }
      return updated;
    }));
  };

  const handleSaveEdit = async () => {
    setEditSaving(true);
    try {
      const validItems = editItems.filter(it => it.sparepartId && it.qty > 0);
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId: editSupplierId,
          warehouse: editWarehouse || null,
          dueAt: editDueAt || null,
          items: validItems.map(it => ({ sparepartId: it.sparepartId, qty: it.qty, unitPrice: it.unitPrice })),
        }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal menyimpan");
      setEditMode(false);
      fetchPO();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setEditSaving(false);
    }
  };

  const handleSent = async () => {
    setShowSentConfirm(false);
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "SENT" }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      fetchPO();
    } catch (e: any) { alert(e.message); }
  };

  const handleCancel = async () => {
    setShowCancelConfirm(false);
    try {
      const res = await fetch(`/api/purchase-orders/${po.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "CANCELLED" }),
      });
      if (!res.ok) throw new Error((await res.json()).error || "Gagal");
      fetchPO();
    } catch (e: any) { alert(e.message); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!po) return null;

  const isDraft = po.status === "DRAFT";
  const isCancelled = po.status === "CANCELLED";
  const currentStepIndex = getStepIndex(po.status || "DRAFT");
  const items = (po.items || []).map((item: any) => ({
    ...item,
    sku: item.sparepart?.sku || item.sku || "-",
    product: item.sparepart?.name || item.product || "-",
    productCode: item.sparepart?.code || item.productCode || "-",
    stockQty: item.sparepart?.stockQty || 0,
    orderQty: item.qty || item.orderQty || 0,
    price: item.unitPrice || item.price || 0,
    amount: item.total || item.amount || 0,
  }));
  const totalQty = items.reduce((s: number, x: any) => s + (x.orderQty || 0), 0);
  const subTotal = items.reduce((s: number, x: any) => s + (x.amount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/warehouse/purchase-orders")} className="btn btn--sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="view-title">Purchase Order (Standard)</div>
            <div className="text-xs text-[--color-text-secondary]">{po.poNo}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {isDraft && !editMode && (
            <>
              <button onClick={startEdit} className="btn btn--sm" style={{ background: "#f59e0b", color: "#fff", border: "1px solid #f59e0b" }}>
                <Edit size={14} /> Edit
              </button>
              <button onClick={() => setShowSentConfirm(true)} className="btn btn--sm" style={{ background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
                <Send size={14} /> Sent PO
              </button>
              <button onClick={() => setShowCancelConfirm(true)} className="btn btn--sm" style={{ background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>
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
          <button onClick={() => setShowPrint(true)} className="btn btn--sm">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Status Badge */}
      {isCancelled && (
        <div className="mb-4 px-4 py-2 rounded-md text-sm font-semibold" style={{ background: "#fef2f2", color: "#ea001e", border: "1px solid #fecaca" }}>
          Purchase Order ini telah DIBATALKAN
        </div>
      )}

      {/* Workflow Bar */}
      <div className="card-slds mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[--color-text-secondary]">Workflow</span>
            <div className="flex items-center gap-2">
              {isCancelled ? (
                <span className="px-3 py-1 rounded-md text-xs font-semibold" style={{ background: "#ea001e", color: "#fff" }}>CANCELLED</span>
              ) : (
                workflowSteps.map((step, i) => (
                  <span key={step} className="px-3 py-1 rounded-md text-xs font-semibold"
                    style={{
                      background: i === currentStepIndex ? "#032d47" : i < currentStepIndex ? "#e5e7eb" : "#f3f4f6",
                      color: i === currentStepIndex ? "#fff" : i < currentStepIndex ? "#6b7280" : "#9ca3af",
                    }}>
                    {step}
                  </span>
                ))
              )}
            </div>
          </div>
          <div>
            <span className="text-xs text-[--color-text-secondary]">Supplier: </span>
            <span className="text-xs font-semibold">{po.supplier?.companyName || "-"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-4 bg-[--color-border-light] rounded-lg p-1 w-fit">
        {([
          { key: "details" as const, label: "Details" },
          { key: "deliveries" as const, label: "Deliveries / Invoices / Returns" },
          { key: "downPayments" as const, label: "Down Payments" },
        ]).map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className="px-4 py-2 text-sm rounded-md transition-all"
            style={{ background: activeTab === t.key ? "#0176d3" : "transparent", color: activeTab === t.key ? "#fff" : "#444746", fontWeight: activeTab === t.key ? 600 : 400 }}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="space-y-6">
          {!editMode ? (
            <>
              {/* Two-column layout */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="card-slds">
                  <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi PO</div>
                  <div className="space-y-3">
                    {[
                      ["REF CODE", po.poNo || "-"],
                      ["REFERENCE NUMBER", po.refNo || po.poNo || "-"],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                        <span className="text-sm text-[--color-text-secondary] font-medium">{label}</span>
                        <span className="font-semibold text-sm">{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 border-b border-[--color-border]">
                      <span className="text-sm text-[--color-text-secondary] font-medium">SUPPLIER</span>
                      <div className="text-right">
                        <span className="font-semibold text-sm" style={{ color: "var(--color-brand)" }}>{po.supplier?.companyName || "-"}</span>
                        <div className="text-xs text-[--color-text-secondary]">{po.supplier?.address || ""}</div>
                      </div>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[--color-border]">
                      <span className="text-sm text-[--color-text-secondary] font-medium">WAREHOUSE</span>
                      <span className="font-semibold text-sm" style={{ color: "var(--color-brand)" }}>{po.warehouse || "-"}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[--color-border]">
                      <span className="text-sm text-[--color-text-secondary] font-medium">DUE DATE</span>
                      <span className="font-medium text-sm">{fmtDate(po.dueAt)}</span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[--color-border]">
                      <span className="text-sm text-[--color-text-secondary] font-medium">STATUS</span>
                      <span className="px-2 py-0.5 rounded-full text-xs font-semibold text-white" style={{ background: statusColor(po.status) }}>{po.status}</span>
                    </div>
                  </div>
                </div>
                <div className="card-slds">
                  <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Info Tambahan</div>
                  <div className="space-y-3">
                    {[
                      ["CREATED AT", po.createdAt ? new Date(po.createdAt).toLocaleString("id-ID") : "-"],
                      ["TOTAL", formatIDR(po.total || 0)],
                      ["ITEMS", `${items.length} item(s)`],
                    ].map(([label, value]) => (
                      <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                        <span className="text-sm text-[--color-text-secondary] font-medium">{label}</span>
                        <span className="font-medium text-sm">{value}</span>
                      </div>
                    ))}
                    <div className="flex justify-between py-2 border-b border-[--color-border]">
                      <span className="text-sm text-[--color-text-secondary] font-medium">CLOSED</span>
                      {po.isClosed ? <CheckCircle size={18} className="text-[--color-success]" /> : <XCircle size={18} className="text-[--color-error]" />}
                    </div>
                  </div>
                </div>
              </div>

              {/* Order Items Table */}
              <div className="card-slds">
                <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Order Items</div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>No</th>
                        <th>SKU</th>
                        <th>Product</th>
                        <th className="text-right">Stock</th>
                        <th className="text-right">Order Qty</th>
                        <th className="text-right">Price (IDR)</th>
                        <th className="text-right">Amount (IDR)</th>
                      </tr>
                    </thead>
                    <tbody>
                      {items.map((item: any, idx: number) => (
                        <tr key={item.id || idx}>
                          <td>{idx + 1}</td>
                          <td className="font-medium" style={{ color: "var(--color-brand)" }}>{item.sku}</td>
                          <td>{item.product}</td>
                          <td className="text-right">{item.stockQty}</td>
                          <td className="text-right">{item.orderQty}</td>
                          <td className="text-right">{formatIDR(item.price)}</td>
                          <td className="text-right font-semibold">{formatIDR(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold border-t-2 border-[--color-text-primary]">
                        <td colSpan={4} className="text-sm text-[--color-text-secondary]">Total Qty</td>
                        <td className="text-right text-[--color-brand]">{totalQty}</td>
                        <td></td>
                        <td className="text-right text-lg text-[--color-brand]">{formatIDR(po.total || subTotal)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </>
          ) : (
            /* ─── EDIT MODE ─── */
            <div className="space-y-6">
              <div className="card-slds">
                <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Edit Purchase Order</div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="form-label">Supplier *</label>
                    <select className="form-select" value={editSupplierId} onChange={e => setEditSupplierId(e.target.value)}>
                      <option value="">-- Pilih Supplier --</option>
                      {suppliers.map(s => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Warehouse</label>
                    <select className="form-select" value={editWarehouse} onChange={e => setEditWarehouse(e.target.value)}>
                      <option value="">-- Pilih Warehouse --</option>
                      {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">Due Date</label>
                    <input type="date" className="form-input" value={editDueAt} onChange={e => setEditDueAt(e.target.value)} />
                  </div>
                </div>
              </div>

              <div className="card-slds">
                <div className="flex items-center justify-between mb-4">
                  <div className="text-sm font-semibold text-[--color-text-secondary] uppercase">Edit Items</div>
                  <button onClick={addEditItem} className="btn btn--brand btn--sm"><Plus size={14} /> Add Item</button>
                </div>
                <div className="table-wrap">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th style={{ width: 40 }}>#</th>
                        <th>Sparepart</th>
                        <th className="text-right">Stock</th>
                        <th className="text-right" style={{ width: 100 }}>Qty</th>
                        <th className="text-right" style={{ width: 140 }}>Unit Price</th>
                        <th className="text-right" style={{ width: 140 }}>Total</th>
                        <th style={{ width: 50 }}></th>
                      </tr>
                    </thead>
                    <tbody>
                      {editItems.map((item, i) => (
                        <tr key={i}>
                          <td>{i + 1}</td>
                          <td>
                            <select className="form-select w-full" value={item.sparepartId} onChange={e => updateEditItem(i, "sparepartId", e.target.value)}>
                              <option value="">-- Pilih --</option>
                              {spareparts.map(sp => <option key={sp.id} value={sp.id}>{sp.sku} — {sp.name}</option>)}
                            </select>
                          </td>
                          <td className="text-right text-[--color-text-secondary]">{item.stockQty}</td>
                          <td>
                            <input type="number" min={1} className="form-input w-full text-right" value={item.qty} onChange={e => updateEditItem(i, "qty", parseInt(e.target.value) || 1)} />
                          </td>
                          <td>
                            <input type="number" min={0} className="form-input w-full text-right" value={item.unitPrice} onChange={e => updateEditItem(i, "unitPrice", parseFloat(e.target.value) || 0)} />
                          </td>
                          <td className="text-right font-semibold">{formatIDR((item.qty || 0) * (item.unitPrice || 0))}</td>
                          <td className="text-center">
                            <button onClick={() => removeEditItem(i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="font-bold border-t-2">
                        <td colSpan={5} className="text-right text-sm">Grand Total</td>
                        <td className="text-right text-lg text-[--color-brand]">{formatIDR(editItems.reduce((s, it) => s + (it.qty || 0) * (it.unitPrice || 0), 0))}</td>
                        <td></td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Deliveries Tab */}
      {activeTab === "deliveries" && (
        <div className="card-slds">
          <p className="text-sm text-[--color-text-secondary]">Deliveries, Invoices, and Returns data will be displayed here.</p>
        </div>
      )}

      {/* Down Payments Tab */}
      {activeTab === "downPayments" && (
        <div className="card-slds">
          <p className="text-sm text-[--color-text-secondary]">No down payment has been recorded for this Purchase Order.</p>
        </div>
      )}

      {/* Sent Confirm Modal */}
      {showSentConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>Sent Purchase Order?</h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20 }}>Status akan berubah dari DRAFT ke SENT. PO tidak bisa diedit lagi setelah dikirim.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowSentConfirm(false)} className="btn btn--sm">Batal</button>
              <button onClick={handleSent} className="btn btn--sm" style={{ background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>Ya, Sent</button>
            </div>
          </div>
        </div>
      )}

      {/* Cancel Confirm Modal */}
      {showCancelConfirm && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 100 }}>
          <div style={{ background: "#fff", borderRadius: 12, padding: 24, maxWidth: 420, width: "90%", boxShadow: "0 8px 32px rgba(0,0,0,0.16)" }}>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: "#001526", marginBottom: 12 }}>Cancel Purchase Order?</h3>
            <p style={{ fontSize: 14, color: "#444746", marginBottom: 20 }}>Purchase Order akan dibatalkan. Tindakan ini tidak bisa dibatalkan.</p>
            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
              <button onClick={() => setShowCancelConfirm(false)} className="btn btn--sm">Batal</button>
              <button onClick={handleCancel} className="btn btn--sm" style={{ background: "#ea001e", color: "#fff", border: "1px solid #ea001e" }}>Ya, Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Print Modal */}
      {showPrint && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.5)" }} onClick={() => setShowPrint(false)} />
          <div style={{ position: "relative", background: "#fff", borderRadius: 12, boxShadow: "0 25px 50px rgba(0,0,0,0.25)", width: "100%", maxWidth: 800, maxHeight: "90vh", overflow: "auto" }}>
            <div style={{ padding: "24px 32px", borderBottom: "1px solid #ecebea", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div>
                <h2 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>PURCHASE ORDER</h2>
                <p style={{ fontSize: 12, color: "#8e8f8e", margin: "4px 0 0" }}>{po.poNo}</p>
              </div>
              <button onClick={() => window.print()} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 16px", fontSize: 13, fontWeight: 500, color: "#fff", background: "#0176d3", border: "none", borderRadius: 6, cursor: "pointer" }}>
                <Printer size={14} /> Print / Save PDF
              </button>
            </div>
            <div style={{ padding: "24px 32px" }}>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24, marginBottom: 24 }}>
                <div>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", marginBottom: 2 }}>SUPPLIER</div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{po.supplier?.companyName || "-"}</div>
                  <div style={{ fontSize: 12, color: "#444746" }}>{po.supplier?.address || ""}</div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", marginBottom: 2 }}>DETAILS</div>
                  <div style={{ fontSize: 12 }}>PO No: <strong>{po.poNo}</strong></div>
                  <div style={{ fontSize: 12 }}>Date: <strong>{fmtDate(po.date || po.createdAt)}</strong></div>
                  <div style={{ fontSize: 12 }}>Due: <strong>{fmtDate(po.dueAt)}</strong></div>
                  <div style={{ fontSize: 12 }}>Warehouse: <strong>{po.warehouse || "-"}</strong></div>
                  <div style={{ fontSize: 12 }}>Status: <strong>{po.status}</strong></div>
                </div>
              </div>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
                <thead>
                  <tr style={{ background: "#f3f3f3" }}>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>No</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>SKU</th>
                    <th style={{ padding: "6px 8px", textAlign: "left", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>Product</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>Qty</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>Price</th>
                    <th style={{ padding: "6px 8px", textAlign: "right", fontSize: 10, fontWeight: 600, textTransform: "uppercase" }}>Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={idx} style={{ borderBottom: "1px solid #f0f0f0" }}>
                      <td style={{ padding: "6px 8px" }}>{idx + 1}</td>
                      <td style={{ padding: "6px 8px", fontWeight: 500 }}>{item.sku}</td>
                      <td style={{ padding: "6px 8px" }}>{item.product}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{item.orderQty}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right" }}>{formatIDR(item.price)}</td>
                      <td style={{ padding: "6px 8px", textAlign: "right", fontWeight: 600 }}>{formatIDR(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr style={{ background: "#f3f3f3", fontWeight: 700 }}>
                    <td colSpan={3} style={{ padding: "6px 8px" }}></td>
                    <td style={{ padding: "6px 8px", textAlign: "right" }}>{totalQty}</td>
                    <td style={{ padding: "6px 8px" }}></td>
                    <td style={{ padding: "6px 8px", textAlign: "right", fontSize: 14 }}>{formatIDR(po.total || subTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
            <div style={{ padding: "16px 32px", borderTop: "1px solid #ecebea", display: "flex", justifyContent: "flex-end" }}>
              <button onClick={() => setShowPrint(false)} style={{ padding: "8px 24px", fontSize: 13, fontWeight: 600, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>Tutup</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
