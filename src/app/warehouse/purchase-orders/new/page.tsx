"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Truck, Plus, Trash2, ArrowLeft, Save, Loader2 } from "lucide-react";

interface ItemRow {
  sparepartId: string;
  qty: number;
  unitPrice: number;
}

const formatIDR = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function NewPurchaseOrderPage() {
  const router = useRouter();
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [spareparts, setSpareparts] = useState<any[]>([]);
  const [purchaseRequests, setPurchaseRequests] = useState<any[]>([]);
  const [loadingMaster, setLoadingMaster] = useState(true);

  const [supplierId, setSupplierId] = useState("");
  const [warehouse, setWarehouse] = useState("");
  const [dueAt, setDueAt] = useState("");
  const [prId, setPrId] = useState("");
  const [items, setItems] = useState<ItemRow[]>([{ sparepartId: "", qty: 1, unitPrice: 0 }]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  // warehouse state
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [showAddWarehouse, setShowAddWarehouse] = useState(false);
  const [newWarehouseName, setNewWarehouseName] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/suppliers?limit=200").then((r) => r.json()),
      fetch("/api/spareparts?limit=200").then((r) => r.json()),
      fetch("/api/purchase-requests?limit=50").then((r) => r.json()),
      fetch("/api/warehouses?limit=100").then((r) => r.json()),
    ])
      .then(([sup, sp, pr, wh]) => {
        setSuppliers(sup.data || []);
        setSpareparts(sp.data || []);
        setPurchaseRequests(pr.data || []);
        setWarehouses(wh.data || []);
        setLoadingMaster(false);
      })
      .catch(() => { setError("Failed to load master data"); setLoadingMaster(false); });
  }, []);

  const addItem = () => setItems([...items, { sparepartId: "", qty: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const addWarehouse = async () => {
    if (!newWarehouseName.trim()) return;
    try {
      const res = await fetch("/api/warehouses", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: newWarehouseName.trim() }),
      });
      const json = await res.json();
      if (res.ok && json.data) {
        setWarehouses(prev => [...prev, json.data]);
        setWarehouse(json.data.name);
        setNewWarehouseName("");
        setShowAddWarehouse(false);
      }
    } catch {}
  };
  const setItem = (i: number, key: keyof ItemRow, val: any) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    setItems(next);
  };

  const grandTotal = items.reduce((sum, it) => sum + (it.qty || 0) * (it.unitPrice || 0), 0);

  const handleSubmit = async () => {
    setError("");
    if (!supplierId) { setError("Please select a supplier."); return; }
    const validItems = items.filter((it) => it.sparepartId && it.qty > 0);
    if (!validItems.length) { setError("Add at least one item with a sparepart and quantity."); return; }
    setSubmitting(true);
    try {
      const res = await fetch("/api/purchase-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          supplierId,
          warehouse: warehouse || undefined,
          dueAt: dueAt || undefined,
          prId: prId || undefined,
          items: validItems.map((it) => ({
            sparepartId: it.sparepartId,
            qty: Number(it.qty),
            unitPrice: Number(it.unitPrice) || 0,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create purchase order");
      router.push("/warehouse/purchase-orders");
    } catch (e: any) {
      setError(e.message || "Failed to create purchase order");
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
          New Purchase Order
        </div>
        <button className="btn btn--sm" onClick={() => router.push("/warehouse/purchase-orders")}>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Supplier <span className="text-red-500">*</span></label>
            <select className="form-select" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
              <option value="">-- Select Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.companyName}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            {!showAddWarehouse ? (
              <select className="form-select" value={warehouse} onChange={(e) => { if (e.target.value === "__new__") { setShowAddWarehouse(true); } else { setWarehouse(e.target.value); } }}>
                <option value="">-- Select Warehouse --</option>
                {warehouses.map((w) => (
                  <option key={w.id} value={w.name}>{w.name}{w.code ? ` (${w.code})` : ""}</option>
                ))}
                <option value="__new__" style={{ color: "#0176d3", fontWeight: 600 }}>+ Tambah Warehouse Baru</option>
              </select>
            ) : (
              <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
                <input
                  type="text"
                  className="form-input flex-1"
                  placeholder="Nama warehouse..."
                  value={newWarehouseName}
                  onChange={(e) => setNewWarehouseName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addWarehouse()}
                />
                <button type="button" className="btn btn--brand btn--sm" onClick={addWarehouse}>Tambah</button>
                <button type="button" className="btn btn--sm" onClick={() => setShowAddWarehouse(false)}>Batal</button>
              </div>
            )}
          </div>
          <div className="form-group">
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input" value={dueAt} onChange={(e) => setDueAt(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Link Purchase Request</label>
            <select className="form-select" value={prId} onChange={(e) => setPrId(e.target.value)}>
              <option value="">-- None --</option>
              {purchaseRequests.map((pr) => (
                <option key={pr.id} value={pr.id}>{pr.prNo}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="card-slds p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Items</h3>
          <button className="btn btn--brand btn--sm" onClick={addItem}>
            <Plus size={14} /> Add Item
          </button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Sparepart</th>
                <th style={{ width: 110 }}>Qty</th>
                <th style={{ width: 160 }}>Unit Price</th>
                <th style={{ width: 160 }}>Total</th>
                <th style={{ width: 60 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td className="text-[--color-text-secondary]">{i + 1}</td>
                  <td>
                    <select
                      className="form-select w-full"
                      value={it.sparepartId}
                      onChange={(e) => setItem(i, "sparepartId", e.target.value)}
                    >
                      <option value="">-- Select Sparepart --</option>
                      {spareparts.map((sp) => (
                        <option key={sp.id} value={sp.id}>
                          {sp.sku ? `${sp.sku} — ` : ""}{sp.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>
                    <input
                      type="number"
                      min={1}
                      className="form-input w-full"
                      value={it.qty}
                      onChange={(e) => setItem(i, "qty", Number(e.target.value))}
                    />
                  </td>
                  <td>
                    <input
                      type="number"
                      min={0}
                      className="form-input w-full"
                      value={it.unitPrice}
                      onChange={(e) => setItem(i, "unitPrice", Number(e.target.value))}
                    />
                  </td>
                  <td className="font-medium">{formatIDR((it.qty || 0) * (it.unitPrice || 0))}</td>
                  <td className="text-center">
                    {items.length > 1 && (
                      <button
                        className="text-red-500 hover:text-red-700 transition-colors"
                        onClick={() => removeItem(i)}
                        title="Remove item"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex justify-end mt-3">
          <div className="text-right">
            <div className="text-xs text-[--color-text-secondary] uppercase tracking-wide">Grand Total</div>
            <div className="text-lg font-bold" style={{ color: "var(--color-brand)" }}>{formatIDR(grandTotal)}</div>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <button className="btn btn--sm" onClick={() => router.push("/warehouse/purchase-orders")} disabled={submitting}>
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
