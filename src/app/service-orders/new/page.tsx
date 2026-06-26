"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, ChevronDown, X, Plus } from "lucide-react";

export default function NewServiceOrderPage() {
  const router = useRouter();

  const handleSave = () => {
    alert("Service Order berhasil dibuat (Draft)!");
    router.push("/service-orders");
  };

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/service-orders")} style={S.backBtn}>
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>New Service Order</h1>
      </div>

      {/* Workflow Bar */}
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}>Workflow</span>
          <div style={{ display: "flex", gap: 6 }}>
            <span style={{ ...S.badge, ...S.badgeActive }}>DRAFT</span>
            <span style={{ ...S.badge, ...S.badgeInactive }}>APPROVED</span>
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={handleSave} style={{ ...S.actionBtn, background: "#0176d3", color: "#fff", border: "1px solid #0176d3" }}>
            <Save size={14} /> Save as Draft
          </button>
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
          <FCreatable label="STORE" placeholder="Pilih store" presets={["Wijaya Motor - One Stop Service", "Wijaya Motor - Branch A", "Wijaya Motor - Branch B"]} />
          <FCreatable label="CUSTOMER" placeholder="Pilih / ketik customer" presets={["Budi Santoso", "PT Maju Jaya", "Siti Rahmawati", "CV Berkah Abadi", "Ahmad Fauzi", "PT Transport Jaya"]} />
          <FInput label="REGISTRATION NO" placeholder="Contoh: B 1234 CD" />
          <FInput label="PLAN SERVICE DATE" type="date" placeholder="Pilih tanggal" />
          <FInput label="PLAN SERVICE TIME" type="time" placeholder="Pilih waktu" />
          <FCreatable label="SERVICE ADVISOR" placeholder="Pilih SA" presets={["Rudi", "Ani", "Budi", "Nanda Salsa"]} />
          <FCreatable label="SALESPERSON" placeholder="Pilih / ketik nama" presets={["-", "Andi", "Budi", "Citra"]} />
          <FCreatable label="BOOKING SOURCE" placeholder="Pilih / ketik sumber" presets={["WhatsApp", "Telepon", "Walk-in", "Website", "Instagram"]} />
          <FInput label="REFERENCE NUMBER" placeholder="-" />
        </div>
        {/* Right Column */}
        <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
          <FSelect label="VEHICLE TYPE" options={["CAR", "MOTORCYCLE", "TRUCK"]} />
          <FCreatable label="VEHICLE MAKE" placeholder="Pilih / ketik merk" presets={["TOYOTA", "HONDA", "MITSUBISHI", "SUZUKI", "DAIHATSU", "ISUZU", "HYUNDAI", "NISSAN", "MAZDA", "KIA", "BMW", "MERCEDES BENZ", "AUDI"]} />
          <FCreatable label="VEHICLE MODEL" placeholder="Pilih / ketik model" presets={["AVANZA", "INNOVA", "FORTUNER", "CIVIC", "JAZZ", "BRIO", "PAJERO", "ERTIGA", "XENIA", "ELF", "L300", "CARENS", "SANTA FE", "X-TRAIL", "CX-5"]} />
          <FCreatable label="ODOMETER" placeholder="Contoh: 45.230" presets={[]} />
          <FCreatable label="YEAR" placeholder="Pilih / ketik tahun" presets={["2024", "2023", "2022", "2021", "2020", "2019", "2018", "2017", "2016", "2015"]} />
          <FCreatable label="COLOR" placeholder="Pilih / ketik warna" presets={["HITAM", "PUTIH", "SILVER", "ABU-ABU", "MERAH", "BIRU", "HIJAU", "KUNING", "ORANYE", "COKLAT", "EMAS"]} />
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
      const val = newValue.trim().toUpperCase();
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
            {/* Add New Button */}
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

            {/* Inline Add Form */}
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

            {/* Search */}
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

            {/* Options */}
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

/* ─── Simple Input ─── */
function FInput({ label, placeholder, type = "text" }: { label: string; placeholder: string; type?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <input type={type} placeholder={placeholder} style={{
        width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526",
        border: "1px solid #d8d8d8", borderRadius: 6, outline: "none",
      }} />
    </div>
  );
}

/* ─── Simple Select ─── */
function FSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <select style={{
        width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526",
        border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff",
      }}>
        {options.map((opt) => <option key={opt}>{opt}</option>)}
      </select>
    </div>
  );
}

/* ─── Styles ─── */
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
  badge: {
    display: "inline-flex", alignItems: "center", padding: "3px 10px",
    borderRadius: 4, fontSize: 10, fontWeight: 700, letterSpacing: "0.03em" as const,
  },
  badgeActive: { background: "#032d47", color: "#fff", border: "1px solid #032d47" },
  badgeInactive: { background: "transparent", color: "#8e8f8e", border: "1px solid #d8d8d8" },
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
};
