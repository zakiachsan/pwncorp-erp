"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect, useRef } from "react";
import { ArrowLeft, Save, ChevronDown, Plus } from "lucide-react";

export default function EditSparepartPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [item, setItem] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [suppliers, setSuppliers] = useState<any[]>([]);

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    category: "",
    unit: "",
    buyPrice: "",
    sellPrice: "",
    minStock: "",
    location: "",
    description: "",
    supplierId: "",
  });

  // Fetch sparepart by code
  useEffect(() => {
    if (!code) return;
    setLoading(true);
    fetch(`/api/spareparts?search=${encodeURIComponent(code)}&limit=1`)
      .then((r) => r.json())
      .then((j) => {
        const found = j.data?.[0];
        if (!found) { setError(`Data tidak ditemukan: ${code}`); setLoading(false); return; }
        setItem(found);
        setFormData({
          name: found.name || "",
          brand: found.brand || "",
          category: found.category || "",
          unit: found.unit || "",
          buyPrice: found.buyPrice?.toString() || "",
          sellPrice: found.sellPrice?.toString() || "",
          minStock: found.minStock?.toString() || "",
          location: found.location || "",
          description: found.type || "",
          supplierId: found.supplierId || "",
        });
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, [code]);

  // Fetch suppliers for dropdown
  useEffect(() => {
    fetch("/api/suppliers?limit=100")
      .then((r) => r.json())
      .then((j) => setSuppliers(j.data || []))
      .catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!item) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/spareparts/${item.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formData.name,
          brand: formData.brand,
          category: formData.category,
          unit: formData.unit,
          buyPrice: parseFloat(formData.buyPrice) || 0,
          sellPrice: parseFloat(formData.sellPrice) || 0,
          minStock: parseInt(formData.minStock) || 0,
          location: formData.location,
          type: formData.description,
          supplierId: formData.supplierId || null,
        }),
      });
      if (!res.ok) {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan data");
        setSaving(false);
        return;
      }
      alert("Sparepart berhasil diupdate!");
      router.push(`/inventory/${code}`);
    } catch {
      alert("Gagal menyimpan data");
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/inventory")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={{ ...S.card, marginTop: 16, textAlign: "center", color: "#444746", padding: 40 }}>Memuat data...</div>
      </div>
    );
  }

  if (error || !item) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/inventory")} style={S.backBtn}>
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>{error || `Data tidak ditemukan: ${code}`}</p></div>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push(`/inventory/${code}`)} style={S.backBtn}>
          <ArrowLeft size={16} />
        </button>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Edit Sparepart</h1>
          <div style={{ fontSize: 13, color: "#0176d3", marginTop: 2 }}>
            {item.code || item.sku} - {item.name}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabBar}>
        <button style={{ ...S.tab, color: "#fff", background: "#0176d3", fontWeight: 600 }}>Details</button>
      </div>

      {/* Form */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 32 }}>
        {/* Left Column */}
        <div>
          <FInput label="CODE" value={item.code || item.sku} disabled />
          <FCreatable label="NAME" value={formData.name} onChange={(v) => setFormData({ ...formData, name: v })} presets={["Oli Mesin", "Filter Oli", "Kampas Rem", "Busi", "Aki", "V-Belt", "Bearing", "Seal"]} />
          <FCreatable label="BRAND" value={formData.brand} onChange={(v) => setFormData({ ...formData, brand: v })} presets={["Shell", "Toyota Genuine", "Bendix", "NGK", "GS Battery", "Mitsuboshi", "SKF", "NTN"]} />
          <FCreatable label="CATEGORY" value={formData.category} onChange={(v) => setFormData({ ...formData, category: v })} presets={["Oli", "Filter", "Rem", "Pengapian", "Kelistrikan", "Mesin", "Body", "Suspensi"]} />
          <FInput label="UNIT" value={formData.unit} onChange={(v) => setFormData({ ...formData, unit: v })} placeholder="Contoh: Pcs, Ltr, Set" />
        </div>
        {/* Right Column */}
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <FInput label="BUY PRICE" value={formData.buyPrice} onChange={(v) => setFormData({ ...formData, buyPrice: v })} type="number" />
          <FInput label="SELL PRICE" value={formData.sellPrice} onChange={(v) => setFormData({ ...formData, sellPrice: v })} type="number" />
          <FInput label="MIN STOCK" value={formData.minStock} onChange={(v) => setFormData({ ...formData, minStock: v })} type="number" />
          <FInput label="LOCATION" value={formData.location} onChange={(v) => setFormData({ ...formData, location: v })} placeholder="Contoh: Rak A-01" />
          {/* Supplier dropdown */}
          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>SUPPLIER</div>
            <select
              value={formData.supplierId}
              onChange={(e) => setFormData({ ...formData, supplierId: e.target.value })}
              style={{
                width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526",
                border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff",
              }}
            >
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.companyName}</option>
              ))}
            </select>
          </div>
          <div style={{ marginTop: 20 }}>
            <button onClick={handleSave} disabled={saving} style={{ ...S.saveBtn, background: saving ? "#93c5fd" : "#0176d3", color: "#fff", border: "1px solid #0176d3", opacity: saving ? 0.7 : 1 }}>
              <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Creatable Dropdown ─── */
function FCreatable({ label, value, onChange, presets }: { label: string; value: string; onChange: (v: string) => void; presets: string[] }) {
  const [isOpen, setIsOpen] = useState(false);
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
    onChange(opt);
    setIsOpen(false);
    setFilter("");
    setIsAdding(false);
    setNewValue("");
  };

  const handleSaveNew = () => {
    if (newValue.trim()) {
      const val = newValue.trim();
      setOptions([...options, val]);
      onChange(val);
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
          <span>{value || `Pilih / ketik ${label.toLowerCase()}`}</span>
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

function FInput({ label, value, onChange, placeholder, type = "text", disabled = false }: { label: string; value: string; onChange?: (v: string) => void; placeholder?: string; type?: string; disabled?: boolean }) {
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
  card: {
    background: "#fff", border: "1px solid #ecebea", borderRadius: 8,
    padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  tabBar: {
    display: "flex", gap: 0, marginBottom: 16, background: "#ecebea",
    borderRadius: 8, padding: 3, width: "fit-content",
  },
  tab: {
    padding: "7px 18px", fontSize: 13, border: "none", borderRadius: 6,
    cursor: "pointer", transition: "all 150ms", whiteSpace: "nowrap" as const,
  },
  saveBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 20px",
    fontSize: 13, fontWeight: 600, borderRadius: 6, cursor: "pointer",
  },
};
