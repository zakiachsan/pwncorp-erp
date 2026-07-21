"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, CheckCircle, Save, Plus, Trash2, AlertTriangle } from "lucide-react";

type Sparepart = { id: string; sku: string; code?: string | null; name: string; stockQty: number; unit?: string };
type OpnameRow = { sparepartId: string; systemQty: string; physicalQty: string; reason: string };

const emptyRow = (): OpnameRow => ({ sparepartId: "", systemQty: "", physicalQty: "", reason: "" });

export default function NewStockOpnamePage() {
  const router = useRouter();
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [loadingParts, setLoadingParts] = useState(true);
  const [warehouse, setWarehouse] = useState("");
  const [items, setItems] = useState<OpnameRow[]>([emptyRow()]);
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

  const addItem = () => setItems([...items, emptyRow()]);
  const removeItem = (i: number) => {
    if (items.length > 1) setItems(items.filter((_, idx) => idx !== i));
  };
  const setItem = (i: number, key: keyof OpnameRow, val: string) => {
    const next = [...items];
    next[i] = { ...next[i], [key]: val };
    setItems(next);
  };
  const handleSparepartSelect = (i: number, sparepartId: string) => {
    const sp = spareparts.find((s) => s.id === sparepartId);
    const next = [...items];
    next[i] = { ...next[i], sparepartId, systemQty: sp ? String(sp.stockQty) : "" };
    setItems(next);
  };

  const diffOf = (row: OpnameRow) => {
    if (row.physicalQty === "" || row.systemQty === "") return null;
    return (parseInt(row.physicalQty) || 0) - (parseInt(row.systemQty) || 0);
  };
  const diffCount = items.filter((it) => {
    const d = diffOf(it);
    return d !== null && d !== 0;
  }).length;
  const hasSelisih = diffCount > 0;

  const handleSave = async () => {
    setErrorMsg("");
    const validItems = items.filter((it) => it.sparepartId && it.physicalQty !== "");
    if (validItems.length === 0) {
      setErrorMsg("Pilih minimal 1 sparepart dan isi stok fisik sebelum disimpan.");
      return;
    }

    setSaving(true);
    try {
      const res = await fetch("/api/stock-opnames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          warehouse: warehouse.trim() || null,
          items: validItems.map((it) => ({
            sparepartId: it.sparepartId,
            systemQty: parseInt(it.systemQty) || 0,
            physicalQty: parseInt(it.physicalQty) || 0,
            reason: it.reason || null,
          })),
        }),
      });
      const j = await res.json();
      if (!res.ok) throw new Error(j.error || `Gagal menyimpan (HTTP ${res.status})`);
      router.push("/warehouse/stock-opname");
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
            onClick={() => router.push("/warehouse/stock-opname")}
            className="btn btn--sm"
            style={{ padding: "6px 10px" }}
            title="Back"
          >
            <ArrowLeft size={16} />
          </button>
          <CheckCircle className="w-6 h-6 text-[#2e844a]" />
          New Stock Opname
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

      {/* Selisih warning */}
      {hasSelisih && (
        <div
          className="flex items-center gap-2 px-3 py-2 rounded-md text-xs font-medium mb-4"
          style={{ background: "#fef3cd", border: "1px solid #ffc107", color: "#856404" }}
        >
          <AlertTriangle size={14} /> Ada {diffCount} item dengan selisih stok! Pastikan data sudah benar sebelum disimpan.
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
            <label className="form-label">Warehouse</label>
            <input
              type="text"
              className="form-input"
              placeholder="e.g. Gudang Wijaya"
              value={warehouse}
              onChange={(e) => setWarehouse(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Summary</label>
            <div className="form-input flex items-center gap-4" style={{ background: "#f9f9f9", fontWeight: 600 }}>
              <span>{items.filter((it) => it.sparepartId).length} item(s)</span>
              <span style={{ color: hasSelisih ? "#ea001e" : "#2e844a" }}>Selisih: {diffCount}</span>
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
              <th style={{ width: 110, textAlign: "right" }}>Stok Sistem</th>
              <th style={{ width: 110, textAlign: "right" }}>Stok Fisik</th>
              <th style={{ width: 90, textAlign: "right" }}>Adjustment</th>
              <th>Reason</th>
              <th style={{ width: 48 }}></th>
            </tr>
          </thead>
          <tbody>
            {loadingParts ? (
              <tr>
                <td colSpan={7} className="text-center py-6 text-[--color-text-secondary]">
                  Memuat daftar sparepart…
                </td>
              </tr>
            ) : (
              items.map((item, i) => {
                const diff = diffOf(item);
                return (
                  <tr key={i}>
                    <td className="text-[--color-text-secondary]">{i + 1}</td>
                    <td>
                      <select
                        className="form-select"
                        value={item.sparepartId}
                        onChange={(e) => handleSparepartSelect(i, e.target.value)}
                      >
                        <option value="">-- Pilih Sparepart --</option>
                        {spareparts.map((s) => (
                          <option key={s.id} value={s.id}>
                            {s.code || s.sku} — {s.name}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input text-right"
                        style={{ background: "#f9f9f9" }}
                        value={item.systemQty}
                        readOnly
                        placeholder="0"
                      />
                    </td>
                    <td>
                      <input
                        type="number"
                        className="form-input text-right"
                        value={item.physicalQty}
                        onChange={(e) => setItem(i, "physicalQty", e.target.value)}
                        placeholder="0"
                      />
                    </td>
                    <td className="text-right" style={{ fontWeight: 600, fontVariantNumeric: "tabular-nums" }}>
                      {diff !== null && (
                        <span style={{ color: diff !== 0 ? "#ea001e" : "#2e844a" }}>
                          {diff > 0 ? `+${diff}` : diff}
                        </span>
                      )}
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        value={item.reason}
                        onChange={(e) => setItem(i, "reason", e.target.value)}
                        placeholder="Alasan selisih"
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
        <button onClick={() => router.push("/warehouse/stock-opname")} className="btn btn--sm" disabled={saving}>
          Batal
        </button>
        <button onClick={handleSave} className="btn btn--brand btn--sm" disabled={saving} style={{ opacity: saving ? 0.6 : 1 }}>
          <Save size={14} /> {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}
