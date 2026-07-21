"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, ArrowUpDown, Save, Plus, Trash2, AlertTriangle } from "lucide-react";

type Sparepart = { id: string; sku: string; code?: string | null; name: string; stockQty: number; unit?: string };
type TransferRow = { sparepartId: string; qty: number };

export default function NewStockTransferPage() {
  const router = useRouter();
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [loadingParts, setLoadingParts] = useState(true);
  const [fromWarehouse, setFromWarehouse] = useState("");
  const [toStore, setToStore] = useState("");
  const [items, setItems] = useState<TransferRow[]>([{ sparepartId: "", qty: 1 }]);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/spareparts?limit=200")
      .then((r) => r.json())
      .then((j) => {
        setSpareparts(j.data?.items || j.data || []);
        setLoadingParts(false);
      })
      .catch(() => setLoadingParts(false));
  }, []);

  const addItem = () => setItems([...items, { sparepartId: "", qty: 1 }]);
  const removeItem = (i: number) => {
    if (items.length > 1) setItems(items.filter((_, idx) => idx !== i));
  };
  const setItem = (i: number, key: keyof TransferRow, val: string | number) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    setItems(next);
  };

  const totalQty = items.reduce((sum, it) => sum + (Number(it.qty) || 0), 0);
  const filledItems = items.filter((it) => it.sparepartId);

  const handleSave = async () => {
    setErrorMsg("");
    if (!fromWarehouse.trim() || !toStore.trim()) {
      setErrorMsg("Isi gudang asal dan toko tujuan sebelum menyimpan.");
      return;
    }
    const validItems = items.filter((it) => it.sparepartId && Number(it.qty) > 0);
    if (validItems.length === 0) {
      setErrorMsg("Pilih minimal 1 sparepart dengan qty > 0.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/stock-transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fromWarehouse: fromWarehouse.trim(),
          toStore: toStore.trim(),
          items: validItems.map((it) => ({ sparepartId: it.sparepartId, qty: Number(it.qty) || 0 })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `Gagal menyimpan (HTTP ${res.status})`);
      router.push("/warehouse/stock-transfer");
    } catch (e: any) {
      setErrorMsg(e.message || "Terjadi kesalahan saat menyimpan.");
      setSaving(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <button
            onClick={() => router.push("/warehouse/stock-transfer")}
            className="btn btn--sm"
            style={{ padding: "6px 10px" }}
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <ArrowUpDown className="w-6 h-6 text-[--color-brand-secondary]" />
          New Stock Transfer
        </div>
      </div>

      {/* Error */}
      {errorMsg && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium mb-4"
          style={{ background: "#fde8e8", border: "1px solid #ea001e", color: "#9f1239" }}
        >
          <AlertTriangle size={14} /> {errorMsg}
        </div>
      )}

      {/* Form */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={new Date().toISOString().split("T")[0]} disabled />
          </div>
          <div className="form-group">
            <label className="form-label">From (Warehouse)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Gudang Wijaya"
              value={fromWarehouse}
              onChange={(e) => setFromWarehouse(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">To (Store)</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Toko Wijaya"
              value={toStore}
              onChange={(e) => setToStore(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Summary</label>
            <div className="form-input flex items-center gap-4" style={{ background: "#f9f9f9", fontWeight: 600 }}>
              <span>{filledItems.length} item(s)</span>
              <span style={{ color: "var(--color-brand-secondary)" }}>Total Qty: {totalQty}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Items */}
      <div className="flex items-center justify-between mb-2 mt-4">
        <h3 className="text-sm font-semibold" style={{ color: "var(--color-brand)" }}>Items</h3>
        <button onClick={addItem} className="btn btn--brand btn--sm">
          <Plus size={14} /> Add Item
        </button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 40 }}>No.</th>
              <th>Sparepart</th>
              <th style={{ width: 120 }}>Stok Tersedia</th>
              <th style={{ width: 120 }}>Qty</th>
              <th style={{ width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {loadingParts ? (
              <tr>
                <td colSpan={5} className="text-center py-6 text-[--color-text-secondary]">
                  Memuat daftar sparepart…
                </td>
              </tr>
            ) : (
              items.map((item, i) => {
                const sp = spareparts.find((s) => s.id === item.sparepartId);
                return (
                  <tr key={i}>
                    <td className="text-[--color-text-secondary]">{i + 1}</td>
                    <td>
                      <select
                        className="form-select"
                        value={item.sparepartId}
                        onChange={(e) => setItem(i, "sparepartId", e.target.value)}
                      >
                        <option value="">-- Pilih Sparepart --</option>
                        {spareparts.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code || s.sku} — {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="text-right" style={{ fontVariantNumeric: "tabular-nums" }}>
                      {sp ? `${sp.stockQty}${sp.unit ? " " + sp.unit : ""}` : "-"}
                    </td>
                    <td>
                      <input
                        type="number"
                        min={1}
                        className="form-input text-right"
                        value={item.qty}
                        onChange={(e) => setItem(i, "qty", parseInt(e.target.value) || 0)}
                      />
                    </td>
                    <td>
                      <button
                        onClick={() => removeItem(i)}
                        disabled={items.length <= 1}
                        className="p-1 rounded transition-colors"
                        style={{ color: "#ea001e", opacity: items.length <= 1 ? 0.3 : 1, cursor: items.length <= 1 ? "default" : "pointer", background: "none", border: "none" }}
                        title="Remove row"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-2 mt-4">
        <button onClick={() => router.push("/warehouse/stock-transfer")} className="btn btn--sm" disabled={saving}>
          Batal
        </button>
        <button onClick={handleSave} className="btn btn--brand btn--sm" disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
          <Save size={14} /> {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}
