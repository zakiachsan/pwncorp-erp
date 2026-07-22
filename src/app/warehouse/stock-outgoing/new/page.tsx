"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

const formatIDR = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function NewStockOutgoingPage() {
  const router = useRouter();
  const [spareparts, setSpareparts] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouse, setWarehouse] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<any[]>([{ sparepartId: "", qty: 1, unitPrice: 0 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/spareparts?limit=200").then(r => r.json()),
      fetch("/api/warehouses?limit=100").then(r => r.json()),
    ]).then(([sp, wh]) => {
      setSpareparts(sp.data || []);
      setWarehouses(wh.data || []);
    }).catch(() => {});
  }, []);

  const addItem = () => setItems([...items, { sparepartId: "", qty: 1, unitPrice: 0 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));
  const updateItem = (i: number, field: string, value: any) => {
    setItems(prev => prev.map((it, idx) => {
      if (idx !== i) return it;
      const updated = { ...it, [field]: value };
      if (field === "sparepartId") {
        const sp = spareparts.find(s => s.id === value);
        if (sp) updated.unitPrice = sp.sellPrice || 0;
      }
      return updated;
    }));
  };

  const grandTotal = items.reduce((s, it) => s + (it.qty || 0) * (it.unitPrice || 0), 0);

  const handleSave = async () => {
    setError("");
    const validItems = items.filter(it => it.sparepartId && it.qty > 0);
    if (!validItems.length) { setError("Minimal 1 item"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/stock-outgoings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ warehouse, notes, items: validItems }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); setSaving(false); return; }
      router.push("/warehouse/stock-outgoing");
    } catch { setError("Gagal menyimpan"); setSaving(false); }
  };

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/warehouse/stock-outgoing")} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">New Stock Outgoing</div>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="card-slds p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Warehouse</label>
            <select className="form-select" value={warehouse} onChange={e => setWarehouse(e.target.value)}>
              <option value="">-- Pilih --</option>
              {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Notes</label>
            <input className="form-input" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Catatan..." />
          </div>
        </div>
      </div>

      <div className="card-slds p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Items</h3>
          <button onClick={addItem} className="btn btn--brand btn--sm"><Plus size={14} /> Add Item</button>
        </div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>#</th>
                <th>Sparepart</th>
                <th className="text-right" style={{ width: 80 }}>Stock</th>
                <th className="text-right" style={{ width: 100 }}>Qty</th>
                <th className="text-right" style={{ width: 140 }}>Unit Price</th>
                <th className="text-right" style={{ width: 140 }}>Total</th>
                <th style={{ width: 50 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => {
                const sp = spareparts.find(s => s.id === it.sparepartId);
                return (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td>
                      <select className="form-select w-full" value={it.sparepartId} onChange={e => updateItem(i, "sparepartId", e.target.value)}>
                        <option value="">-- Pilih --</option>
                        {spareparts.map(s => <option key={s.id} value={s.id}>{s.sku} — {s.name}</option>)}
                      </select>
                    </td>
                    <td className="text-right text-[--color-text-secondary]">{sp ? sp.stockQty : "-"}</td>
                    <td>
                      <input type="number" min={1} className="form-input w-full text-right" value={it.qty} onChange={e => updateItem(i, "qty", parseInt(e.target.value) || 1)} />
                    </td>
                    <td>
                      <input type="number" min={0} className="form-input w-full text-right" value={it.unitPrice} onChange={e => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} />
                    </td>
                    <td className="text-right font-semibold">{formatIDR((it.qty || 0) * (it.unitPrice || 0))}</td>
                    <td className="text-center">
                      <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
            <tfoot>
              <tr className="font-bold border-t-2">
                <td colSpan={5} className="text-right text-sm">Grand Total</td>
                <td className="text-right text-lg text-[--color-brand]">{formatIDR(grandTotal)}</td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button className="btn btn--sm" onClick={() => router.push("/warehouse/stock-outgoing")} disabled={saving}>Cancel</button>
        <button className="btn btn--brand btn--sm" onClick={handleSave} disabled={saving}>
          <Save size={14} /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
