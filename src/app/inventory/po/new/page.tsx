"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, ChevronDown, Plus, Trash2 } from "lucide-react";

export default function NewPOPage() {
  const router = useRouter();
  const [items, setItems] = useState<{ code: string; name: string; qty: string; unit: string; price: string }[]>([
    { code: "", name: "", qty: "", unit: "Pcs", price: "" },
  ]);

  const handleAddItem = () => {
    setItems([...items, { code: "", name: "", qty: "", unit: "Pcs", price: "" }]);
  };

  const handleRemoveItem = (index: number) => {
    if (items.length > 1) {
      setItems(items.filter((_, i) => i !== index));
    }
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...items];
    (newItems[index] as any)[field] = value;
    setItems(newItems);
  };

  const handleSave = () => {
    alert("Purchase Order berhasil dibuat (Draft)!");
    router.push("/inventory/po");
  };

  const fmt = (n: number) => n.toLocaleString("id-ID");
  const subtotal = items.reduce((s, item) => s + (parseInt(item.qty) || 0) * (parseInt(item.price) || 0), 0);

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/inventory/po")} style={S.backBtn}>
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>New Purchase Order</h1>
      </div>

      {/* Workflow Bar */}
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 4 }}>
            {["DRAFT", "SENT", "PARTIAL RECEIVED", "RECEIVED"].map((step, i) => (
              <span key={step} style={{
                padding: "4px 12px", borderRadius: 6, fontSize: 11, fontWeight: 600,
                background: i === 0 ? "#032d47" : "#f3f4f6",
                color: i === 0 ? "#fff" : "#9ca3af",
                border: `1px solid ${i === 0 ? "#032d47" : "#e5e7eb"}`,
              }}>
                {step}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSave} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
            <Save size={14} /> Save as Draft
          </button>
        </div>
      </div>

      {/* Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32, marginBottom: 24 }}>
        <div>
          <FCreatable label="SUPPLIER" placeholder="Pilih / ketik supplier" presets={["PT Auto Parts", "CV Ban Sehat", "UD Oli Jaya", "PT Suku Cadang Jaya"]} />
          <FInput label="EXPECTED DATE" type="date" />
          <FInput label="NOTES" placeholder="Catatan untuk PO ini" />
        </div>
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <FInput label="PO NUMBER" value="Auto-generated" disabled />
          <FInput label="DATE" value={new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" })} disabled />
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>SUBTOTAL</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: "#001526" }}>Rp {fmt(subtotal)}</div>
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
                <th style={{ ...S.th, width: 80, textAlign: "right" }}>Qty</th>
                <th style={{ ...S.th, width: 80 }}>Unit</th>
                <th style={{ ...S.th, width: 120, textAlign: "right" }}>Price</th>
                <th style={{ ...S.th, width: 120, textAlign: "right" }}>Subtotal</th>
                <th style={{ ...S.th, width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {items.map((item, i) => (
                <tr key={i} style={S.tr}>
                  <td style={S.td}>{i + 1}</td>
                  <td style={S.td}>
                    <input
                      type="text"
                      placeholder="Code"
                      value={item.code}
                      onChange={(e) => handleItemChange(i, "code", e.target.value)}
                      style={S.input}
                    />
                  </td>
                  <td style={S.td}>
                    <input
                      type="text"
                      placeholder="Name"
                      value={item.name}
                      onChange={(e) => handleItemChange(i, "name", e.target.value)}
                      style={S.input}
                    />
                  </td>
                  <td style={S.td}>
                    <input
                      type="number"
                      placeholder="0"
                      value={item.qty}
                      onChange={(e) => handleItemChange(i, "qty", e.target.value)}
                      style={{ ...S.input, textAlign: "right" }}
                    />
                  </td>
                  <td style={S.td}>
                    <input
                      type="text"
                      value={item.unit}
                      onChange={(e) => handleItemChange(i, "unit", e.target.value)}
                      style={S.input}
                    />
                  </td>
                  <td style={S.td}>
                    <input
                      type="number"
                      placeholder="0"
                      value={item.price}
                      onChange={(e) => handleItemChange(i, "price", e.target.value)}
                      style={{ ...S.input, textAlign: "right" }}
                    />
                  </td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>
                    Rp {fmt((parseInt(item.qty) || 0) * (parseInt(item.price) || 0))}
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
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f3f3f3", fontWeight: 600 }}>
                <td colSpan={3} style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 700 }}>
                  {items.reduce((s, item) => s + (parseInt(item.qty) || 0), 0)}
                </td>
                <td style={S.td}></td>
                <td style={S.td}></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 700, fontSize: 13 }}>Rp {fmt(subtotal)}</td>
                <td style={S.td}></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}

/* ─── Creatable Dropdown ─── */
function FCreatable({ label, placeholder, presets }: { label: string; placeholder: string; presets: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
  const [value, setValue] = useState("");
  const [options, setOptions] = useState(presets);
  const [filter, setFilter] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [newValue, setNewValue] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);
  const addInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setFilter("");
        setIsAdding(false);
        setNewValue("");
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (isAdding) setTimeout(() => addInputRef.current?.focus(), 50);
  }, [isAdding]);

  const filtered = options.filter((o) => o.toLowerCase().includes(filter.toLowerCase()));

  const handleSelect = (opt: string) => {
    setValue(opt);
    setIsOpen(false);
    setFilter("");
    setIsAdding(false);
    setNewValue("");
  };

  const handleSaveNew = () => {
    if (newValue.trim()) {
      const val = newValue.trim();
      setOptions([...options, val]);
      setValue(val);
      setIsOpen(false);
      setIsAdding(false);
      setNewValue("");
      setFilter("");
    }
  };

  return (
    <div style={{ marginBottom: 14 }} ref={dropdownRef}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <div style={{ position: "relative" }}>
        <div
          onClick={() => { setIsOpen(true); setTimeout(() => inputRef.current?.focus(), 50); }}
          style={{
            display: "flex", alignItems: "center", justifyContent: "space-between",
            padding: "8px 12px", fontSize: 13, color: value ? "#001526" : "#8e8f8e",
            border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
            background: "#fff", transition: "border-color 150ms",
          }}
        >
          <span>{value || placeholder}</span>
          <ChevronDown size={14} style={{ color: "#8e8f8e", flexShrink: 0 }} />
        </div>

        {isOpen && (
          <div style={{
            position: "absolute", top: "100%", left: 0, right: 0, marginTop: 4,
            background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6,
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)", zIndex: 50, maxHeight: 240, overflow: "auto",
          }}>
            {!isAdding && (
              <div
                onClick={() => setIsAdding(true)}
                style={{
                  padding: "8px 12px", fontSize: 13, cursor: "pointer",
                  color: "#0176d3", borderBottom: "1px solid #ecebea",
                  display: "flex", alignItems: "center", gap: 6, fontWeight: 600,
                  background: "#f9f9f9",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#eef4ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#f9f9f9"}
              >
                <Plus size={14} /> Tambah Baru
              </div>
            )}

            {isAdding && (
              <div style={{ padding: "10px 12px", borderBottom: "1px solid #ecebea", background: "#f9f9f9" }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 6 }}>
                  Tambah {label}
                </div>
                <input
                  ref={addInputRef}
                  type="text"
                  placeholder={`Ketik nama ${label.toLowerCase()}...`}
                  value={newValue}
                  onChange={(e) => setNewValue(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSaveNew(); if (e.key === "Escape") { setIsAdding(false); setNewValue(""); } }}
                  style={{
                    width: "100%", padding: "6px 10px", fontSize: 13, color: "#001526",
                    border: "1px solid #d8d8d8", borderRadius: 4, outline: "none", marginBottom: 8,
                  }}
                />
                <div style={{ display: "flex", gap: 6 }}>
                  <button
                    onClick={handleSaveNew}
                    disabled={!newValue.trim()}
                    style={{
                      padding: "5px 14px", fontSize: 12, fontWeight: 600, color: "#fff",
                      background: newValue.trim() ? "#0176d8" : "#d8d8d8",
                      border: "none", borderRadius: 4, cursor: newValue.trim() ? "pointer" : "not-allowed",
                    }}
                  >Simpan</button>
                  <button
                    onClick={() => { setIsAdding(false); setNewValue(""); }}
                    style={{
                      padding: "5px 14px", fontSize: 12, fontWeight: 500, color: "#444746",
                      background: "#fff", border: "1px solid #d8d8d8", borderRadius: 4, cursor: "pointer",
                    }}
                  >Batal</button>
                </div>
              </div>
            )}

            {!isAdding && (
              <div style={{ padding: "6px 10px", borderBottom: "1px solid #ecebea" }}>
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Cari..."
                  value={filter}
                  onChange={(e) => setFilter(e.target.value)}
                  style={{
                    width: "100%", padding: "6px 8px", fontSize: 13, color: "#001526",
                    border: "1px solid #d8d8d8", borderRadius: 4, outline: "none",
                  }}
                />
              </div>
            )}

            {!isAdding && filtered.map((opt) => (
              <div
                key={opt}
                onClick={() => handleSelect(opt)}
                style={{
                  padding: "8px 12px", fontSize: 13, cursor: "pointer",
                  color: opt === value ? "#0176d3" : "#001526",
                  background: opt === value ? "#eef4ff" : "transparent",
                  fontWeight: opt === value ? 600 : 400,
                }}
                onMouseEnter={(e) => { if (opt !== value) e.currentTarget.style.background = "#f5f5f5"; }}
                onMouseLeave={(e) => { if (opt !== value) e.currentTarget.style.background = "transparent"; }}
              >
                {opt}
              </div>
            ))}

            {!isAdding && filtered.length === 0 && (
              <div style={{ padding: "12px", fontSize: 13, color: "#8e8f8e", textAlign: "center" }}>
                Tidak ada data ditemukan
              </div>
            )}
          </div>
        )}
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
  workflowBar: {
    display: "flex", alignItems: "center", justifyContent: "space-between",
    padding: "8px 14px", background: "#f9f9f9", border: "1px solid #ecebea",
    borderRadius: 8, marginBottom: 16,
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  tabBar: {
    display: "flex", gap: 0, marginBottom: 16, background: "#ecebea",
    borderRadius: 8, padding: 3, width: "fit-content",
  },
  tab: {
    padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6,
    cursor: "pointer", transition: "all 150ms", whiteSpace: "nowrap" as const,
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
