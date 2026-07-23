"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Package } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

export default function NewStockOrderPage() {
  const router = useRouter();
  const [wo, setWo] = useState<any>(null);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouse, setWarehouse] = useState("");
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const woId = params.get("woId");
    if (!woId) { setError("woId tidak ditemukan"); setLoading(false); return; }

    Promise.all([
      fetch(`/api/work-orders/${woId}`).then(r => r.json()),
      fetch("/api/warehouses?limit=100").then(r => r.json()),
    ]).then(([woJson, whJson]) => {
      if (woJson.error) { setError(woJson.error); setLoading(false); return; }
      const w = woJson.data;
      setWo(w);
      setWarehouses(whJson.data || []);
      // Pre-fill items from WO spareparts (only with valid sparepartId)
      const woItems = (w.items || [])
        .filter((it: any) => it.itemType === "sparepart" && it.itemId)
        .map((it: any) => ({
          sparepartId: it.itemId,
          sku: it.sku || "-",
          name: it.sparepartName || it.itemName || "-",
          stockQty: it.stockQty || 0,
          orderQty: it.qty || 1,
          avgCost: it.unitPrice || 0,
          storeRemark: "",
        }));
      setItems(woItems);
      setLoading(false);
    }).catch(() => { setError("Gagal load data"); setLoading(false); });
  }, []);

  const updateItem = (i: number, field: string, value: any) => {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  };

  const handleSave = async () => {
    if (!wo) return;
    const validItems = items.filter(it => it.orderQty > 0);
    if (!validItems.length) { setError("Minimal 1 item dengan qty > 0"); return; }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/stock-orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          woId: wo.id,
          warehouse: warehouse || null,
          items: validItems.map(it => ({ sparepartId: it.sparepartId, qty: it.orderQty })),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal membuat stock order"); setSaving(false); return; }
      router.push(`/stock-workflow/stock-orders/${json.data.orderNo}`);
    } catch { setError("Gagal membuat stock order"); setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!wo) return null;

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div>
            <div className="view-title">New Stock Order (Service Work Order)</div>
            <div className="text-xs text-[--color-text-secondary]">{wo.woNo}</div>
          </div>
        </div>
      </div>

      {/* Workflow */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
        <div style={{ display: "flex", gap: 6 }}>
          {["DRAFT", "CONFIRMED", "RECEIVED"].map((step, i) => (
            <span key={step} style={{
              display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 4,
              fontSize: 10, fontWeight: 700, letterSpacing: "0.03em",
              background: i === 0 ? "#032d47" : "#f3f4f6",
              color: i === 0 ? "#fff" : "#9ca3af",
              border: `1px solid ${i === 0 ? "#032d47" : "#d8d8d8"}`,
            }}>{step}</span>
          ))}
        </div>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Form */}
      <div className="card-slds p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Form Supplier</label>
            <input className="form-input" value={wo.so?.customer?.name || "-"} disabled />
          </div>
          <div>
            <label className="form-label">Supplier Code</label>
            <input className="form-input" value={wo.woNo || "-"} disabled />
          </div>
          <div>
            <label className="form-label">Memo</label>
            <input className="form-input" value={`Work Order - ${wo.woNo}`} disabled />
          </div>
          <div>
            <label className="form-label">Warehouse</label>
            <select className="form-select" value={warehouse} onChange={e => setWarehouse(e.target.value)}>
              <option value="">-- Pilih Warehouse --</option>
              {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card-slds p-4 mb-4">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-3">Products</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>No</th>
                <th>Product</th>
                <th className="text-right" style={{ width: 80 }}>Store Qty</th>
                <th className="text-right" style={{ width: 100 }}>Order Qty</th>
                <th className="text-right" style={{ width: 140 }}>Average Cost</th>
                <th style={{ width: 160 }}>Store Remark</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="font-medium" style={{ color: "var(--color-brand)" }}>{it.sku} — {it.name}</td>
                  <td className="text-right text-[--color-text-secondary]">{it.stockQty}</td>
                  <td>
                    <input type="number" min={1} className="form-input w-full text-right" value={it.orderQty}
                      onChange={e => updateItem(i, "orderQty", parseInt(e.target.value) || 1)} />
                  </td>
                  <td className="text-right">{fmt(it.avgCost)}</td>
                  <td>
                    <input type="text" className="form-input w-full" value={it.storeRemark}
                      onChange={e => updateItem(i, "storeRemark", e.target.value)} placeholder="..." />
                  </td>
                </tr>
              ))}
              {items.length === 0 && (
                <tr><td colSpan={6} className="text-center text-sm text-[--color-text-secondary] py-8">Tidak ada sparepart di WO ini</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <button className="btn btn--sm" onClick={() => router.back()} disabled={saving}>Cancel</button>
        <button className="btn btn--brand btn--sm" onClick={handleSave} disabled={saving || items.length === 0}>
          <Save size={14} /> {saving ? "Creating..." : "Create Stock Order"}
        </button>
      </div>
    </div>
  );
}
