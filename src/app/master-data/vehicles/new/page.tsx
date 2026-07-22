"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";

const vehicleBrands: Record<string, string[]> = {
  CAR: ["Toyota", "Honda", "Mitsubishi", "Suzuki", "Daihatsu", "Isuzu", "Nissan", "Mazda", "Hyundai", "Kia", "BMW", "Mercedes-Benz", "Wuling", "Chery", "MG"],
  MOTORCYCLE: ["Honda", "Yamaha", "Suzuki", "Kawasaki", "Vespa", "TVS", "Royal Enfield"],
  TRUCK: ["Isuzu", "Mitsubishi", "Hino", "Toyota", "UD Trucks", "Scania", "Mercedes-Benz"],
};

const brandModels: Record<string, string[]> = {
  Toyota: ["Avanza", "Kijang Innova", "Fortuner", "Rush", "Yaris", "Vios", "Camry", "Corolla", "Hilux", "Agya", "Calya", "Alphard", "Vellfire", "Land Cruiser", "Raize", "Veloz", "Supra", "86", "Dyna", "Hiace"],
  Honda: ["Civic", "Accord", "CR-V", "HR-V", "BR-V", "Jazz", "Brio", "Mobilio", "City", "WR-V", "Odyssey", "Freed", "Civic Type R", "Beat", "Vario", "Scoopy", "PCX", "CBR", "Supra X", "Revo", "CRF", "CB"],
  Mitsubishi: ["Pajero", "Xpander", "L300", "Triton", "Outlander", "Mirage", "Pajero Sport", "Eclipse Cross", "Delica", "Colt", "Fuso", "Colt Diesel", "Canter", "Fighter"],
  Suzuki: ["Ertiga", "Carry", "APV", "Ignis", "SX4", "Baleno", "Jimny", "XL7", "Swift", "Vitara", "Grand Vitara", "Karimun", "Satria", "GSX", "Nex", "Address", "Burgman"],
  Daihatsu: ["Xenia", "Terios", "Sigra", "Ayla", "Gran Max", "Luxio", "Sirion", "Rocky", "Taft", "Copen", "Hijet"],
  Isuzu: ["Elf", "D-Max", "MU-X", "Giga", "Traga", "Panther", "F Series"],
  Nissan: ["X-Trail", "Livina", "March", "Serena", "Terra", "Navara", "Juke", "Kicks", "GT-R"],
  Mazda: ["CX-5", "CX-3", "CX-9", "Mazda 2", "Mazda 3", "Mazda 6", "MX-5", "BT-50"],
  Hyundai: ["Creta", "Santa Fe", "Palisade", "Stargazer", "Ioniq", "Tucson", "Kona"],
  Kia: ["Seltos", "Sonet", "Sportage", "Carnival", "Sorento", "Rio", "Picanto"],
  BMW: ["3 Series", "5 Series", "7 Series", "X1", "X3", "X5", "X7", "M3", "M4", "M5"],
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "GLS", "CLA"],
  Wuling: ["Confero", "Cortez", "Almaz", "Air EV", "Formo"],
  Chery: ["Tiggo", "Omoda", "EQ1"],
  MG: ["ZS", "HS", "5", "4", "Cyberster"],
  Yamaha: ["NMAX", "Aerox", "XMAX", "R15", "R25", "MT-15", "MT-25", "WR 155", "Fazzio", "Mio", "Gear", "Jupiter", "Vega", "Lexi", "FreeGo"],
  Kawasaki: ["Ninja", "Z900", "Versys", "KLX", "D-Tracker", "W175", "Eliminator", "Vulcan"],
  Vespa: ["Primavera", "Sprint", "GTS", "LX", "946"],
  TVS: ["Apache", "Dazz", "Neo", "Rockz", "Sport"],
  "Royal Enfield": ["Classic 350", "Meteor 350", "Hunter 350", "Himalayan", "Interceptor 650", "Continental GT 650"],
  Hino: ["Dutro", "Ranger", "500 Series", "700 Series", "Profia"],
  "UD Trucks": ["Quester", "Croner", "Kuzer"],
  Scania: ["P Series", "G Series", "R Series", "S Series"],
};

const currentYear = new Date().getFullYear();
const years: number[] = [];
for (let y = currentYear; y >= 1990; y--) years.push(y);

export default function CreateVehiclePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const formRef = useRef<HTMLFormElement>(null);
  const [selectedType, setSelectedType] = useState("");
  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedModel, setSelectedModel] = useState("");
  const [selectedYear, setSelectedYear] = useState("");

  // Search states
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  useEffect(() => {
    fetch("/api/customers?limit=100")
      .then((r) => r.json())
      .then((d) => setCustomers(d.data || []))
      .catch(() => {});
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = formRef.current;
    if (!form) return;

    const customerId = (form.elements.namedItem("customerId") as HTMLSelectElement).value;
    const plateNo = (form.elements.namedItem("plateNo") as HTMLInputElement).value;

    if (!customerId || !plateNo || !selectedBrand) {
      setError("Customer, plat nomor, dan merk wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/vehicles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customerId, plateNo, brand: selectedBrand, model: selectedModel, year: selectedYear ? parseInt(selectedYear) : undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan vehicle");
      router.push("/master-data/vehicles");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const brands = selectedType ? vehicleBrands[selectedType] || [] : [];
  const models = selectedBrand ? brandModels[selectedBrand] || [] : [];

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/master-data/vehicles")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Add Vehicle</h1>
      </div>
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>{error}</div>
      )}
      <form ref={formRef} onSubmit={handleSubmit}>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
          <FSelect name="vehicleType" label="TIPE KENDARAAN" options={Object.keys(vehicleBrands)} value={selectedType} onChange={(val) => { setSelectedType(val); setSelectedBrand(""); setSelectedModel(""); setBrandSearch(""); }} />

          <FInput name="plateNo" label="PLAT NOMOR" placeholder="Contoh: B 1234 CD" />

          {brands.length > 0 ? (
            <SearchableSelect label="MERK" options={brands} value={selectedBrand} search={brandSearch} open={brandOpen}
              onSearchChange={setBrandSearch} onOpenChange={setBrandOpen}
              onSelect={(v) => { setSelectedBrand(v); setBrandSearch(v); setBrandOpen(false); setSelectedModel(""); }} />
          ) : (
            <DisabledField label="MERK" placeholder="Pilih Tipe Kendaraan terlebih dahulu..." />
          )}

          {models.length > 0 ? (
            <SearchableSelect label="MODEL" options={models} value={selectedModel} search={modelSearch} open={modelOpen}
              onSearchChange={setModelSearch} onOpenChange={setModelOpen}
              onSelect={(v) => { setSelectedModel(v); setModelSearch(v); setModelOpen(false); }} />
          ) : (
            <DisabledField label="MODEL" placeholder={selectedBrand ? "..." : "Pilih Merk terlebih dahulu..."} />
          )}

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>TAHUN</div>
            <select name="year" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff" }}>
              <option value="">-- Pilih Tahun --</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>

          <div style={{ marginBottom: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>CUSTOMER</div>
            <select name="customerId" style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff" }}>
              <option value="">-- Pilih Customer --</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div style={{ marginTop: 20 }}>
            <button type="submit" disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#fff", background: loading ? "#a0c4e8" : "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer" }}>
              <Save size={14} /> {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FInput({ name, label, placeholder }: { name: string; label: string; placeholder: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <input name={name} placeholder={placeholder} style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none" }} />
    </div>
  );
}

function FSelect({ name, label, options, value, onChange }: { name: string; label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <select name={name} value={value} onChange={e => onChange(e.target.value)} style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff" }}>
        <option value="">-- Pilih {label} --</option>
        {options.map(o => <option key={o} value={o}>{o}</option>)}
      </select>
    </div>
  );
}

function DisabledField({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <input placeholder={placeholder} disabled style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#8e8f8e", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#f5f5f5" }} />
    </div>
  );
}

function SearchableSelect({ label, options, value, search, open, onSearchChange, onOpenChange, onSelect }: {
  label: string; options: string[]; value: string; search: string; open: boolean;
  onSearchChange: (v: string) => void; onOpenChange: (v: boolean) => void;
  onSelect: (v: string) => void;
}) {
  const filtered = options.filter(o => !search || o.toLowerCase().includes(search.toLowerCase()));
  return (
    <div style={{ marginBottom: 14, position: "relative" }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <input
        type="text"
        placeholder={`Cari ${label.toLowerCase()}...`}
        value={search}
        onChange={e => { onSearchChange(e.target.value); onOpenChange(true); }}
        onFocus={() => onOpenChange(true)}
        onBlur={() => setTimeout(() => onOpenChange(false), 200)}
        style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", boxSizing: "border-box" }}
      />
      {open && filtered.length > 0 && (
        <div style={{ position: "absolute", top: "100%", left: 0, right: 0, zIndex: 50, background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, maxHeight: 200, overflowY: "auto", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}>
          {filtered.map(o => (
            <div
              key={o}
              onMouseDown={() => onSelect(o)}
              style={{ padding: "6px 10px", fontSize: 12, cursor: "pointer", background: value === o ? "#f0f7ff" : "transparent" }}
              onMouseEnter={e => e.currentTarget.style.background = "#f0f7ff"}
              onMouseLeave={e => e.currentTarget.style.background = value === o ? "#f0f7ff" : "transparent"}
            >{o}</div>
          ))}
        </div>
      )}
    </div>
  );
}
