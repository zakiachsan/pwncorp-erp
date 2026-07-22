"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, X } from "lucide-react";

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

export default function CreateCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // vehicles
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [showVehicleForm, setShowVehicleForm] = useState(false);

  // new vehicle form
  const [vehicleType, setVehicleType] = useState("");
  const [vehicleBrand, setVehicleBrand] = useState("");
  const [vehicleModel, setVehicleModel] = useState("");
  const [vehicleYear, setVehicleYear] = useState("");

  // search states
  const [brandSearch, setBrandSearch] = useState("");
  const [modelSearch, setModelSearch] = useState("");
  const [brandOpen, setBrandOpen] = useState(false);
  const [modelOpen, setModelOpen] = useState(false);

  useEffect(() => {
    fetch("/api/vehicles?limit=200")
      .then((r) => r.json())
      .then((d) => setVehicles(d.data || []))
      .catch(() => {});
  }, []);

  const handleVehicleSelect = (value: string) => {
    if (value === "__new__") {
      setShowVehicleForm(true);
      setSelectedVehicleId("");
      setVehicleType("");
      setVehicleBrand("");
      setVehicleModel("");
      setVehicleYear("");
      setBrandSearch("");
      setModelSearch("");
    } else {
      setShowVehicleForm(false);
      setSelectedVehicleId(value);
    }
  };

  const brands = vehicleType ? vehicleBrands[vehicleType] || [] : [];
  const models = vehicleBrand ? brandModels[vehicleBrand] || [] : [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = formRef.current;
    if (!form) return;

    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const phone = (form.elements.namedItem("phone") as HTMLInputElement).value;
    const type = (form.elements.namedItem("type") as HTMLSelectElement).value;
    const address = (form.elements.namedItem("address") as HTMLInputElement).value;
    const email = (form.elements.namedItem("email") as HTMLInputElement).value;

    if (!name) {
      setError("Nama customer wajib diisi");
      setLoading(false);
      return;
    }

    // vehicle payload
    let vehiclePayload: any = null;
    if (showVehicleForm) {
      const plateNo = (form.elements.namedItem("vehiclePlateNo") as HTMLInputElement).value;
      if (!plateNo || !vehicleBrand) {
        setError("Plat nomor dan merk kendaraan wajib diisi");
        setLoading(false);
        return;
      }
      vehiclePayload = { plateNo, brand: vehicleBrand, model: vehicleModel, year: vehicleYear ? parseInt(vehicleYear) : undefined };
    }

    try {
      const res = await fetch("/api/customers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          phone,
          type: type.toLowerCase(),
          address,
          email,
          vehicleId: selectedVehicleId || undefined,
          vehicle: vehiclePayload,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan customer");
      router.push("/master-data/customers");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/master-data/customers")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Add Customer</h1>
      </div>
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>{error}</div>
      )}
      <form ref={formRef} onSubmit={handleSubmit}>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
          <FInput name="name" label="NAMA" placeholder="Nama customer" />
          <FInput name="phone" label="TELEPON" placeholder="No. telepon" />
          <FSelect name="type" label="TIPE" options={["Retail", "Wholesale"]} />
          <FInput name="address" label="ALAMAT" placeholder="Alamat lengkap" />
          <FInput name="email" label="EMAIL" placeholder="Email" />

          {/* --- VEHICLE SECTION --- */}
          <div style={{ marginTop: 20, paddingTop: 16, borderTop: "1px solid #ecebea" }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: "#001526", marginBottom: 12 }}>KENDARAAN</div>

            <div style={{ marginBottom: 14 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>PILIH KENDARAAN</div>
              <select
                value={showVehicleForm ? "__new__" : selectedVehicleId}
                onChange={(e) => handleVehicleSelect(e.target.value)}
                style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff" }}
              >
                <option value="">-- Tidak pakai kendaraan --</option>
                {vehicles.map((v: any) => (
                  <option key={v.id} value={v.id}>
                    {v.plateNo} — {v.brand} {v.model || ""} {v.customer ? `(${v.customer.name})` : ""}
                  </option>
                ))}
                <option value="__new__" style={{ color: "#0176d3", fontWeight: 600 }}>
                  + Tambah Kendaraan Baru
                </option>
              </select>
            </div>

            {showVehicleForm && (
              <div style={{ background: "#f8fafc", border: "1px solid #d8d8d8", borderRadius: 6, padding: 12, marginBottom: 10 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#0176d3" }}>Form Kendaraan Baru</span>
                  <button type="button" onClick={() => setShowVehicleForm(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "#747678", padding: 2 }}>
                    <X size={16} />
                  </button>
                </div>

                <FSelectInline name="vehicleType" label="TIPE KENDARAAN" options={Object.keys(vehicleBrands)} value={vehicleType} onChange={(v) => { setVehicleType(v); setVehicleBrand(""); setVehicleModel(""); }} />

                <FInput name="vehiclePlateNo" label="PLAT NOMOR" placeholder="Contoh: B 1234 CD" />

                {brands.length > 0 ? (
                  <SearchableSelect label="MERK" options={brands} value={vehicleBrand} search={brandSearch} open={brandOpen}
                    onSearchChange={setBrandSearch} onOpenChange={setBrandOpen}
                    onSelect={(v) => { setVehicleBrand(v); setBrandSearch(v); setBrandOpen(false); setVehicleModel(""); }} />
                ) : (
                  <DisabledField label="MERK" placeholder="Pilih Tipe Kendaraan dulu..." />
                )}

                {models.length > 0 ? (
                  <SearchableSelect label="MODEL" options={models} value={vehicleModel} search={modelSearch} open={modelOpen}
                    onSearchChange={setModelSearch} onOpenChange={setModelOpen}
                    onSelect={(v) => { setVehicleModel(v); setModelSearch(v); setModelOpen(false); }} />
                ) : (
                  <DisabledField label="MODEL" placeholder={vehicleBrand ? "..." : "Pilih Merk dulu..."} />
                )}

                <div style={{ marginBottom: 14 }}>
                  <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>TAHUN</div>
                  <select name="vehicleYear" value={vehicleYear} onChange={(e) => setVehicleYear(e.target.value)} style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff" }}>
                    <option value="">-- Pilih Tahun --</option>
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                  </select>
                </div>
              </div>
            )}
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

function FSelect({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <select name={name} style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff" }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}

function FSelectInline({ name, label, options, value, onChange }: { name: string; label: string; options: string[]; value: string; onChange: (v: string) => void }) {
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
