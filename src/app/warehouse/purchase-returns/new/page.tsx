"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";

const formatIDR = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function NewPurchaseReturnPage() {
  const router = useRouter();
  const [pos, setPos] = useState<any[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [poItems, setPoItems] = useState<any[]>([]);
  const [form, setForm] = useState({
    poId: "", supplierId: "", returnType: "Return", warehouse: "", reason: "",
    date: new Date().toISOString().slice(0, 10),
  });
  const [items, setItems] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/purchase-orders?limit=50&status=RECEIVED").then(r => r.json()),
      fetch("/api/purchase-orders?limit=50&status=PARTIAL").then(r => r.json()),
      fetch("/api/warehouses?limit=100").then(r => r.json()),
    ]).then(([rec, part, wh]) => {
      setPos([...(rec.data || []), ...(part.data || [])]);
      setWarehouses(wh.data || []);
    }).catch(() => {});
  }, []);

  const onPoSelect = async (poId: string) => {
    setForm(f => ({ ...f, poId }));
    setError("");
    if (!poId) { setItems([]); setPoItems([]); return; }
    try {
      const res = await fetch(`/api/purchase-orders/${poId}`);
      const json = await res.json();
      const po = json.data;
      setForm(f => ({ ...f, supplierId: po.supplierId || "" }));
      const its = (po.items || []).map((it: any) => ({
        sparepartId: it.sparepartId,
        sku: it.sparepart?.sku || "-",
        name: it.sparepart?.name || "-",
        maxQty: it.qty || 0,
        qty: it.qty || 0,
        unitPrice: it.unitPrice || 0,
      }));
      setPoItems(its);
      setItems(its);
    } catch { setError("Gagal load PO items"); }
  };

  const updateItem = (i: number, field: string, value: any) => {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, [field]: value } : it));
  };
  const removeItem = (i: number) => setItems(prev => prev.filter((_, idx) => idx !== i));

  const grandTotal = items.reduce((s, it) => s + (it.qty || 0) * (it.unitPrice || 0), 0);

  const handleSave = async () => {
    setError("");
    if (!form.poId || !form.supplierId) { setError("PO dan Supplier wajib diisi"); return; }
    if (!items.length) { setError("Minimal 1 item"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/purchase-returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          poId: form.poId,
          supplierId: form.supplierId,
          returnType: form.returnType,
          warehouse: form.warehouse || null,
          reason: form.reason,
          date: form.date,
          items: items.map(it => ({ sparepartId: it.sparepartId, qty: it.qty, unitPrice: it.unitPrice })),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); setSaving(false); return; }
      router.push("/warehouse/purchase-returns");
    } catch { setError("Gagal menyimpan"); setSaving(false); }
  };

  const selectedPo = pos.find(p => p.id === form.poId);

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/warehouse/purchase-returns")} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">New Purchase Return</div>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      <div className="card-slds p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <label className="form-label">Purchase Order *</label>
            <select className="form-select" value={form.poId} onChange={e => onPoSelect(e.target.value)}>
              <option value="">-- Pilih PO --</option>
              {pos.map(po => <option key={po.id} value={po.id}>{po.poNo} — {po.supplier?.companyName || ""}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Supplier</label>
            <input className="form-input bg-gray-100" value={selectedPo?.supplier?.companyName || ""} disabled />
          </div>
          <div>
            <label className="form-label">Return Type</label>
            <select className="form-select" value={form.returnType} onChange={e => setForm({ ...form, returnType: e.target.value })}>
              <option value="Return">Return (Tukar Barang)</option>
              <option value="Deposit">Deposit (Potongan)</option>
            </select>
          </div>
          <div>
            <label className="form-label">Warehouse</label>
            <select className="form-select" value={form.warehouse} onChange={e => setForm({ ...form, warehouse: e.target.value })}>
              <option value="">-- Pilih --</option>
              {warehouses.map(w => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Reason</label>
            <input className="form-input" value={form.reason} onChange={e => setForm({ ...form, reason: e.target.value })} placeholder="Alasan retur..." />
          </div>
        </div>
      </div>

      <div className="card-slds p-4 mb-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-semibold">Return Items</h3>
        </div>
        {!form.poId ? (
          <p className="text-sm text-[--color-text-secondary] py-4 text-center">Pilih PO untuk load items.</p>
        ) : (
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>#</th>
                  <th>SKU</th>
                  <th>Product</th>
                  <th className="text-right">Max Qty</th>
                  <th className="text-right" style={{ width: 100 }}>Return Qty</th>
                  <th className="text-right" style={{ width: 140 }}>Unit Price</th>
                  <th className="text-right" style={{ width: 140 }}>Total</th>
                  <th style={{ width: 50 }}></th>
                </tr>
              </thead>
              <tbody>
                {items.map((it, i) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="font-medium" style={{ color: "var(--color-brand)" }}>{it.sku}</td>
                    <td>{it.name}</td>
                    <td className="text-right text-[--color-text-secondary]">{it.maxQty}</td>
                    <td>
                      <input type="number" min={1} max={it.maxQty} className="form-input w-full text-right"
                        value={it.qty} onChange={e => updateItem(i, "qty", Math.min(parseInt(e.target.value) || 1, it.maxQty))} />
                    </td>
                    <td>
                      <input type="number" min={0} className="form-input w-full text-right"
                        value={it.unitPrice} onChange={e => updateItem(i, "unitPrice", parseFloat(e.target.value) || 0)} />
                    </td>
                    <td className="text-right font-semibold">{formatIDR((it.qty || 0) * (it.unitPrice || 0))}</td>
                    <td className="text-center">
                      <button onClick={() => removeItem(i)} className="text-red-500 hover:text-red-700"><Trash2 size={16} /></button>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2">
                  <td colSpan={6} className="text-right text-sm">Grand Total</td>
                  <td className="text-right text-lg text-[--color-brand]">{formatIDR(grandTotal)}</td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 justify-end">
        <button className="btn btn--sm" onClick={() => router.push("/warehouse/purchase-returns")} disabled={saving}>Cancel</button>
        <button className="btn btn--brand btn--sm" onClick={handleSave} disabled={saving}>
          <Save size={14} /> {saving ? "Saving..." : "Save"}
        </button>
      </div>
    </div>
  );
}
