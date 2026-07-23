"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, Plus, Trash2, Search } from "lucide-react";

type Sparepart = { id: string; sku: string; name: string; stockQty: number };
type OpnameRow = { sparepartId: string; systemQty: string; physicalQty: string; reason: string };

const emptyRow = (): OpnameRow => ({ sparepartId: "", systemQty: "", physicalQty: "", reason: "" });

export default function NewStockOpnamePage() {
  const router = useRouter();
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [warehouses, setWarehouses] = useState<any[]>([]);
  const [warehouse, setWarehouse] = useState("");
  const [description, setDescription] = useState("");
  const [items, setItems] = useState<OpnameRow[]>([emptyRow()]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [searchIdx, setSearchIdx] = useState<number | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/spareparts?limit=500").then(r => r.json()),
      fetch("/api/warehouses?limit=100").then(r => r.json()),
    ]).then(([sp, wh]) => {
      setSpareparts(sp.data?.items || sp.data || []);
      setWarehouses(wh.data || []);
    });
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchIdx(null);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const addItem = () => { setItems([...items, emptyRow()]); setSearchIdx(items.length); };
  const removeItem = (i: number) => { if (items.length > 1) setItems(items.filter((_, idx) => idx !== i)); };
  const setItem = (i: number, key: keyof OpnameRow, val: string) => {
    const next = [...items]; next[i] = { ...next[i], [key]: val }; setItems(next);
  };

  const selectSparepart = (i: number, sp: Sparepart) => {
    const next = [...items];
    next[i] = { ...next[i], sparepartId: sp.id, systemQty: String(sp.stockQty), physicalQty: "" };
    setItems(next);
    setSearchIdx(null);
    setSearch("");
  };

  const filtered = search.length >= 1
    ? spareparts.filter(s => (s.sku + " " + s.name).toLowerCase().includes(search.toLowerCase()))
    : [];

  const handleSave = async () => {
    setError("");
    const validItems = items.filter(it => it.sparepartId);
    if (!validItems.length) { setError("Pilih minimal 1 sparepart"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/stock-opnames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouse: warehouse || null,
          description: description.trim() || null,
          items: validItems.map(it => ({
            sparepartId: it.sparepartId,
            systemQty: parseInt(it.systemQty) || 0,
            physicalQty: parseInt(it.physicalQty) || 0,
            reason: null,
          })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || "Gagal");
      router.push(`/warehouse/stock-opname/${j.data.refCode}`);
    } catch (e: any) { setError(e.message); setSaving(false); }
  };

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/warehouse/stock-opname")} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">New Stock Opname</div>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Form */}
      <div className="card-slds p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={new Date().toISOString().split("T")[0]} disabled />
          </div>
          <div>
            <label className="form-label">Warehouse</label>
            <select className="form-select" value={warehouse} onChange={e => setWarehouse(e.target.value)}>
              <option value="">-- Pilih Warehouse --</option>
              {warehouses.map((w: any) => <option key={w.id} value={w.name}>{w.name}</option>)}
            </select>
          </div>
        </div>
      </div>

      {/* Description Field */}
      <div className="card-slds p-4 mb-4">
        <div className="grid grid-cols-1 gap-4">
          <div>
            <label className="form-label">Keterangan</label>
            <textarea className="form-input" rows={2} placeholder="Alasan stock opname..." value={description} onChange={e => setDescription(e.target.value)} />
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-brand)" }}>Items</h3>
        <button onClick={addItem} className="btn btn--brand btn--sm"><Plus size={14} /> Add Item</button>
      </div>

      <div className="table-wrap" style={{ overflow: "visible" }}>
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>No.</th>
              <th>Sparepart</th>
              <th style={{ width: 120, textAlign: "right" }}>Counted Stock</th>
              <th style={{ width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => (
              <tr key={i}>
                <td className="text-[--color-text-secondary]">{i + 1}</td>
                <td style={{ position: "relative" }}>
                  {item.sparepartId ? (
                    <div className="flex items-center gap-2">
                      <span className="font-medium" style={{ color: "var(--color-brand)" }}>
                        {spareparts.find(s => s.id === item.sparepartId)?.sku} — {spareparts.find(s => s.id === item.sparepartId)?.name}
                      </span>
                      <button onClick={() => { const n = [...items]; n[i] = { ...n[i], sparepartId: "", systemQty: "", physicalQty: "" }; setItems(n); }}
                        style={{ color: "#ea001e", background: "none", border: "none", cursor: "pointer" }}><Trash2 size={12} /></button>
                    </div>
                  ) : (
                    <div ref={searchIdx === i ? searchRef : undefined} style={{ position: "relative" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <Search size={14} style={{ color: "#8e8f8e" }} />
                        <input type="text" className="form-input" style={{ width: "100%" }} placeholder="Ketik SKU atau nama sparepart..."
                          value={searchIdx === i ? search : ""} onChange={e => { setSearch(e.target.value); setSearchIdx(i); }}
                          onFocus={() => setSearchIdx(i)} />
                      </div>
                      {searchIdx === i && search.length >= 1 && filtered.length > 0 && (
                        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, boxShadow: "0 4px 16px rgba(0,0,0,0.08)", maxHeight: 220, overflowY: "auto" }}>
                          {filtered.slice(0, 10).map(sp => (
                            <div key={sp.id} onMouseDown={e => { e.preventDefault(); selectSparepart(i, sp); }}
                              style={{ padding: "6px 10px", cursor: "pointer", fontSize: 13, borderBottom: "1px solid #f0f0f0", display: "flex", justifyContent: "space-between" }}
                              onMouseEnter={e => (e.currentTarget.style.background = "#f0f7ff")} onMouseLeave={e => (e.currentTarget.style.background = "#fff")}>
                              <span><strong>{sp.sku}</strong> — {sp.name}</span>
                              <span style={{ color: "#8e8f8e", fontSize: 12 }}>Stok: {sp.stockQty}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </td>
                <td>
                  <input type="number" min={0} className="form-input text-right" value={item.physicalQty}
                    onChange={e => setItem(i, "physicalQty", e.target.value)} placeholder="0" />
                </td>
                <td>
                  <button onClick={() => removeItem(i)} disabled={items.length <= 1}
                    style={{ color: "#ea001e", background: "none", border: "none", cursor: items.length <= 1 ? "default" : "pointer", opacity: items.length <= 1 ? 0.3 : 1 }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => router.push("/warehouse/stock-opname")} className="btn btn--sm" disabled={saving}>Batal</button>
        <button onClick={handleSave} className="btn btn--brand btn--sm" disabled={saving}>
          <Save size={14} /> {saving ? "Menyimpan..." : "Simpan Draft"}
        </button>
      </div>
    </div>
  );
}
