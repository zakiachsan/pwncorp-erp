"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Truck, ArrowLeft, Save, Loader2 } from "lucide-react";

interface DeliveryItemRow {
  sparepartId: string;
  name: string;
  sku: string;
  qtyOrdered: number;
  qtyReceived: number;
}

export default function NewPurchaseDeliveryPage() {
  const router = useRouter();
  const [purchaseOrders, setPurchaseOrders] = useState<any[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);
  const [loadingItems, setLoadingItems] = useState(false);

  const [poId, setPoId] = useState("");
  const [receivedAt, setReceivedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [items, setItems] = useState<DeliveryItemRow[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/purchase-orders?limit=50")
      .then((r) => r.json())
      .then((json) => { setPurchaseOrders(json.data || []); setLoadingMaster(false); })
      .catch(() => { setError("Failed to load purchase orders"); setLoadingMaster(false); });
  }, []);

  const handlePoSelect = async (id: string) => {
    setPoId(id);
    setError("");
    if (!id) { setItems([]); return; }
    setLoadingItems(true);
    try {
      const res = await fetch(`/api/purchase-orders/${id}`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to load PO items");
      const po = json.data;
      setItems(
        (po.items || []).map((it: any) => ({
          sparepartId: it.sparepartId,
          name: it.sparepart?.name || "",
          sku: it.sparepart?.sku || "",
          qtyOrdered: it.qty || 0,
          qtyReceived: it.qty || 0,
        }))
      );
    } catch (e: any) {
      setError(e.message || "Failed to load PO items");
      setItems([]);
    } finally {
      setLoadingItems(false);
    }
  };

  const setQtyReceived = (i: number, val: number) => {
    const next = [...items];
    next[i] = { ...next[i], qtyReceived: val };
    setItems(next);
  };

  const handleSubmit = async () => {
    setError("");
    if (!poId) { setError("Please select a purchase order."); return; }
    if (!items.length) { setError("The selected purchase order has no items."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase-deliveries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poId,
          receivedAt: receivedAt || undefined,
          items: items.map((it) => ({
            sparepartId: it.sparepartId,
            qtyOrdered: Number(it.qtyOrdered) || 0,
            qtyReceived: Number(it.qtyReceived) || 0,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create delivery");
      router.push("/warehouse/purchase-deliveries");
    } catch (e: any) {
      setError(e.message || "Failed to create delivery");
      setSubmitting(false);
    }
  };

  if (loadingMaster) return <div className="p-8 text-center">Loading...</div>;

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <Truck className="w-6 h-6 text-[--color-brand-secondary]" />
          New Purchase Delivery
        </div>
        <button className="btn btn--sm" onClick={() => router.push("/warehouse/purchase-deliveries")}>
          <ArrowLeft size={14} /> Back
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Header fields */}
      <div className="card-slds p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Purchase Order <span className="text-red-500">*</span></label>
            <select className="form-select" value={poId} onChange={(e) => handlePoSelect(e.target.value)}>
              <option value="">-- Select Purchase Order --</option>
              {purchaseOrders.map((po) => (
                <option key={po.id} value={po.id}>
                  {po.poNo}{po.supplier?.companyName ? ` — ${po.supplier.companyName}` : ""}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Received Date</label>
            <input type="date" className="form-input" value={receivedAt} onChange={(e) => setReceivedAt(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card-slds p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Items</h3>
          {loadingItems && <Loader2 size={16} className="animate-spin text-[--color-brand]" />}
        </div>
        {!poId ? (
          <p className="text-sm text-[--color-text-secondary] py-4 text-center">
            Select a purchase order to load its items.
          </p>
        ) : items.length === 0 && !loadingItems ? (
          <p className="text-sm text-[--color-text-secondary] py-4 text-center">
            No items found for the selected purchase order.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>Sparepart</th>
                  <th style={{ width: 140 }}>Qty Ordered</th>
                  <th style={{ width: 140 }}>Qty Received</th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td className="text-[--color-text-secondary]">{i + 1}</td>
                    <td>
                      <span className="font-medium">{it.name}</span>
                      {it.sku && <span className="ml-2 text-xs text-[--color-text-secondary]">{it.sku}</span>}
                    </td>
                    <td>{it.qtyOrdered}</td>
                    <td>
                      <input
                        type="number"
                        min={0}
                        className="form-input w-full"
                        value={it.qtyReceived}
                        onChange={(e) => setQtyReceived(i, Number(e.target.value))}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <button className="btn btn--sm" onClick={() => router.push("/warehouse/purchase-deliveries")} disabled={submitting}>
          Cancel
        </button>
        <button className="btn btn--brand btn--sm" onClick={handleSubmit} disabled={submitting}>
          {submitting ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {submitting ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
