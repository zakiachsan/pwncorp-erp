"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

export default function NewStockReturnPage() {
  const router = useRouter();
  const [spareparts, setSpareparts] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [form, setForm] = useState({ woId: "", warehouse: "", reason: "" });
  const [items, setItems] = useState([{ sparepartId: "", qty: 1 }]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/spareparts?limit=200").then((r) => r.json()),
      fetch("/api/work-orders?limit=50").then((r) => r.json()),
    ]).then(([spJson, woJson]) => {
      setSpareparts(spJson.data || []);
      setWorkOrders(woJson.data || []);
    }).catch(() => {});
  }, []);

  const setItem = (i: number, key: string, val: any) => {
    const next = [...items]; next[i] = { ...next[i], [key]: val }; setItems(next);
  };
  const addItem = () => setItems([...items, { sparepartId: "", qty: 1 }]);
  const removeItem = (i: number) => setItems(items.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    setError("");
    const validItems = items.filter((i) => i.sparepartId && i.qty > 0);
    if (!validItems.length) { setError("Minimal 1 item dengan sparepart dan qty"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/stock-returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, woId: form.woId || null, items: validItems }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); setSaving(false); return; }
      router.push("/stock-workflow/stock-returns");
    } catch { setError("Gagal menyimpan"); setSaving(false); }
  };

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6 max-w-3xl">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-1.5 border border-[#d8d8d8] rounded-lg cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>New Stock Return</h1>
      </div>

      <div className="bg-white border border-[#ecebea] rounded-lg p-4 sm:p-6 space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Work Order (optional)</label>
            <select className="form-select" value={form.woId} onChange={(e) => setForm({ ...form, woId: e.target.value })}>
              <option value="">-- Tanpa WO --</option>
              {workOrders.map((wo) => (
                <option key={wo.id} value={wo.id}>{wo.woNo}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Warehouse</label>
            <input className="form-input" value={form.warehouse} onChange={(e) => setForm({ ...form, warehouse: e.target.value })} placeholder="Gudang Utama" />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Reason</label>
            <textarea className="form-input" rows={2} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="Alasan return..." />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="form-label" style={{ margin: 0 }}>Items *</label>
            <button onClick={addItem} className="btn btn--sm btn--outline"><Plus size={12} /> Add Item</button>
          </div>
          <div className="space-y-2">
            {items.map((item, i) => (
              <div key={i} className="grid grid-cols-12 gap-2 items-center">
                <select className="form-select col-span-8" value={item.sparepartId} onChange={(e) => setItem(i, "sparepartId", e.target.value)}>
                  <option value="">-- Pilih Sparepart --</option>
                  {spareparts.map((sp) => (
                    <option key={sp.id} value={sp.id}>{sp.sku} — {sp.name}</option>
                  ))}
                </select>
                <input type="number" min={1} className="form-input col-span-3" value={item.qty} onChange={(e) => setItem(i, "qty", Number(e.target.value))} />
                <button onClick={() => removeItem(i)} disabled={items.length === 1} className="col-span-1 p-2 text-red-500 disabled:opacity-30">
                  <Trash2 size={14} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn btn--brand flex items-center gap-2">
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => router.back()} className="btn btn--outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}
