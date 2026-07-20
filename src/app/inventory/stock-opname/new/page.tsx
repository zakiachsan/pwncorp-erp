"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Plus, Trash2, AlertTriangle } from "lucide-react";

type Sparepart = { id: string; sku: string; code?: string | null; name: string; stockQty: number; unit?: string };
type OpnameRow = { sparepartId: string; name: string; systemStock: string; actualStock: string; reason: string };

const emptyRow = (): OpnameRow => ({ sparepartId: "", name: "", systemStock: "", actualStock: "", reason: "" });

export default function NewStockOpnamePage() {
  const router = useRouter();
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [loadingParts, setLoadingParts] = useState(true);
  const [items, setItems] = useState<OpnameRow[]>([emptyRow()]);
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    fetch("/api/spareparts?limit=200")
      .then((r) => r.json())
      .then((j) => {
        const list = j.data?.items || j.data || [];
        setSpareparts(list);
        setLoadingParts(false);
      })
      .catch(() => setLoadingParts(false));
  }, []);

  const handleAddItem = () => {
    setItems([...items, emptyRow()]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleSparepartSelect = (index: number, sparepartId: string) => {
    const newItems = [...items];
    const sp = spareparts.find((s) => s.id === sparepartId);
    newItems[index] = {
      ...newItems[index],
      sparepartId,
      name: sp ? sp.name : "",
      systemStock: sp ? String(sp.stockQty) : "",
    };
    setItems(newItems);
  };

  const handleItemChange = (index: number, field: keyof OpnameRow, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], [field]: value };
    setItems(newItems);
  };

  const handleSave = async () => {
    setErrorMsg("");
    const validItems = items.filter((i) => i.sparepartId && i.actualStock !== "");
    if (validItems.length === 0) {
      setErrorMsg("Pilih minimal 1 sparepart dan isi stok fisik sebelum disimpan.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        warehouse: null,
        notes,
        items: validItems.map((i) => {
          const systemQty = parseInt(i.systemStock) || 0;
          const physicalQty = parseInt(i.actualStock) || 0;
          return {
            sparepartId: i.sparepartId,
            systemQty,
            physicalQty,
            actualQty: physicalQty,
            diff: physicalQty - systemQty,
            reason: i.reason || null,
          };
        }),
      };

      const res = await fetch("/api/stock-opnames", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const j = await res.json();
      if (!res.ok) {
        throw new Error(j.error || `Gagal menyimpan (HTTP ${res.status})`);
      }
      router.push("/inventory/stock-opname");
    } catch (e: any) {
      setErrorMsg(e.message || "Terjadi kesalahan saat menyimpan.");
      setSaving(false);
    }
  };

  const hasSelisih = items.some((item) => {
    const sys = parseInt(item.systemStock) || 0;
    const act = parseInt(item.actualStock) || 0;
    return item.systemStock && item.actualStock && sys !== act;
  });

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/inventory/stock-opname")} style={S.backBtn}>
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>New Stock Opname</h1>
      </div>

      {/* Error */}
      {errorMsg && (
        <div style={{ ...S.alertBox, background: "#fde8e8", border: "1px solid #ea001e", color: "#9f1239", marginBottom: 16 }}>
          <AlertTriangle size={14} /> {errorMsg}
        </div>
      )}

      {/* Alert */}
      {hasSelisih && (
        <div style={{ ...S.alertBox, background: "#fef3cd", border: "1px solid #ffc107", color: "#856404", marginBottom: 16 }}>
          <AlertTriangle size={14} /> Ada selisih stok! Pastikan data sudah benar sebelum disimpan.
        </div>
      )}

      {/* Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 24 }}>
        <div>
          <FInput label="DATE" type="date" value={new Date().toISOString().split("T")[0]} disabled />
          <FInput label="NOTES" placeholder="Catatan stock opname" value={notes} onChange={setNotes} />
        </div>
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>SUMMARY</div>
          <div style={{ display: "flex", gap: 24, marginTop: 8 }}>
            <div>
              <div style={{ fontSize: 12, color: "#444746" }}>Total Items</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: "#001526" }}>{items.filter(i => i.sparepartId).length}</div>
            </div>
            <div>
              <div style={{ fontSize: 12, color: "#444746" }}>Selisih</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: hasSelisih ? "#ea001e" : "#2e844a" }}>
                {items.filter(i => {
                  const sys = parseInt(i.systemStock) || 0;
                  const act = parseInt(i.actualStock) || 0;
                  return i.systemStock && i.actualStock && sys !== act;
                }).length}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items Section */}
      <div style={{ marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: "#0176d3", margin: 0 }}>Items</h3>
          <button onClick={handleAddItem} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
            <Plus size={14} /> Add Item
          </button>
        </div>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={{ ...S.th, width: 36 }}>No.</th>
                <th style={S.th}>Code</th>
                <th style={S.th}>Name</th>
                <th style={{ ...S.th, width: 100, textAlign: "right" }}>Stok Sistem</th>
                <th style={{ ...S.th, width: 100, textAlign: "right" }}>Stok Fisik</th>
                <th style={{ ...S.th, width: 80, textAlign: "right" }}>Selisih</th>
                <th style={S.th}>Alasan</th>
                <th style={{ ...S.th, width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {loadingParts ? (
                <tr>
                  <td colSpan={8} style={{ ...S.td, textAlign: "center", padding: 24, color: "#444746" }}>
                    Memuat daftar sparepart…
                  </td>
                </tr>
              ) : (
                items.map((item, i) => {
                  const sys = parseInt(item.systemStock) || 0;
                  const act = parseInt(item.actualStock) || 0;
                  const selisih = item.systemStock && item.actualStock ? act - sys : null;
                  return (
                    <tr key={i} style={S.tr}>
                      <td style={S.td}>{i + 1}</td>
                      <td style={S.td}>
                        <select
                          value={item.sparepartId}
                          onChange={(e) => handleSparepartSelect(i, e.target.value)}
                          style={{ ...S.input, color: item.sparepartId ? "#001526" : "#8e8f8e" }}
                        >
                          <option value="">-- Pilih Sparepart --</option>
                          {spareparts.map((sp) => (
                            <option key={sp.id} value={sp.id}>
                              {sp.code || sp.sku} — {sp.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={S.td}>
                        <input
                          type="text"
                          placeholder="Name"
                          value={item.name}
                          readOnly
                          style={{ ...S.input, background: "#f9f9f9", color: item.name ? "#001526" : "#8e8f8e" }}
                        />
                      </td>
                      <td style={S.td}>
                        <input
                          type="number"
                          placeholder="0"
                          value={item.systemStock}
                          readOnly
                          style={{ ...S.input, textAlign: "right", background: "#f9f9f9" }}
                        />
                      </td>
                      <td style={S.td}>
                        <input
                          type="number"
                          placeholder="0"
                          value={item.actualStock}
                          onChange={(e) => handleItemChange(i, "actualStock", e.target.value)}
                          style={{ ...S.input, textAlign: "right" }}
                        />
                      </td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>
                        {selisih !== null && (
                          <span style={{ color: selisih !== 0 ? "#ea001e" : "#2e844a" }}>
                            {selisih === 0 ? "0" : selisih > 0 ? `+${selisih}` : selisih}
                          </span>
                        )}
                      </td>
                      <td style={S.td}>
                        <input
                          type="text"
                          placeholder="-"
                          value={item.reason}
                          onChange={(e) => handleItemChange(i, "reason", e.target.value)}
                          style={S.input}
                        />
                      </td>
                      <td style={S.td}>
                        <button
                          onClick={() => handleRemoveItem(i)}
                          style={{ background: "none", border: "none", cursor: "pointer", color: "#ea001e", padding: 4 }}
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
      </div>

      {/* Save Button */}
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 8 }}>
        <button onClick={() => router.push("/inventory/stock-opname")} style={S.actionBtn} disabled={saving}>
          Batal
        </button>
        <button
          onClick={handleSave}
          disabled={saving}
          style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3", opacity: saving ? 0.6 : 1 }}
        >
          <Save size={14} /> {saving ? "Menyimpan…" : "Simpan"}
        </button>
      </div>
    </div>
  );
}

function FInput({ label, value, onChange, placeholder, type = "text", disabled = false }: { label: string; value?: string; onChange?: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange?.(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        style={{
          width: "100%", padding: "8px 12px", fontSize: 13, color: disabled ? "#8e8f8e" : "#001526",
          border: "1px solid #d8d8d8", borderRadius: 6, outline: "none",
          background: disabled ? "#f3f4f6" : "#fff",
        }}
      />
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
    fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  alertBox: {
    display: "flex", alignItems: "center", gap: 8, padding: "8px 12px",
    borderRadius: 6, fontSize: 12, fontWeight: 500,
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  tableWrap: {
    border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden",
    background: "#fff",
  },
  table: {
    width: "100%", borderCollapse: "collapse" as const, fontSize: 13,
  },
  th: {
    padding: "8px 10px", textAlign: "left" as const, fontWeight: 600,
    fontSize: 11, color: "#444746", textTransform: "uppercase" as const,
    letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "6px 8px", borderBottom: "1px solid #f0f0f0", color: "#001526",
    background: "#fff",
  },
  tr: { transition: "background 100ms" },
  input: {
    width: "100%", padding: "6px 8px", fontSize: 13, color: "#001526",
    border: "1px solid #d8d8d8", borderRadius: 4, outline: "none",
  },
};
