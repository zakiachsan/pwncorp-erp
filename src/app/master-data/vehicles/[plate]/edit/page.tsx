"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
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
  "Mercedes-Benz": ["A-Class", "C-Class", "E-Class", "S-Class", "GLA", "GLC", "GLE", "GLS", "CLA", "Actros", "Arocs"],
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

export default function VehicleEditPage() {
  const params = useParams();
  const router = useRouter();
  const plateParam = decodeURIComponent(params.plate as string);

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);
  const [vehicleType, setVehicleType] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/customers?limit=200").then((r) => r.json()),
      fetch(`/api/vehicles?search=${encodeURIComponent(plateParam)}`).then((r) => r.json()),
    ])
      .then(([custJson, vehJson]) => {
        setCustomers(custJson.data || []);
        const list = vehJson.data || [];
        const found = list.find((v: any) => v.plateNo === plateParam);
        if (!found) {
          return fetch(`/api/vehicles`).then((r) => r.json()).then((allJson) => {
            const all = allJson.data || [];
            const match = all.find((v: any) => v.plateNo === plateParam || v.id === plateParam);
            if (!match) { setError("Vehicle not found"); setLoading(false); return; }
            setForm({
              id: match.id,
              customerId: match.customerId || "",
              plateNo: match.plateNo,
              brand: match.brand || "",
              model: match.model || "",
              year: match.year?.toString() || "",
              chassisNo: match.chassisNo || "",
              engineNo: match.engineNo || "",
            });
            setLoading(false);
          });
        }
        // Detect vehicle type from brand
        const brand = found.brand || "";
        let detectedType = "";
        for (const [type, brands] of Object.entries(vehicleBrands)) {
          if (brands.includes(brand)) { detectedType = type; break; }
        }
        setVehicleType(detectedType);
        setForm({
          id: found.id,
          customerId: found.customerId || "",
          plateNo: found.plateNo,
          brand: found.brand || "",
          model: found.model || "",
          year: found.year?.toString() || "",
          chassisNo: found.chassisNo || "",
          engineNo: found.engineNo || "",
        });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load vehicle"); setLoading(false); });
  }, [plateParam]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/vehicles/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId: form.customerId,
          plateNo: form.plateNo,
          brand: form.brand,
          model: form.model,
          year: form.year ? parseInt(form.year) : undefined,
          chassisNo: form.chassisNo,
          engineNo: form.engineNo,
        }),
      });
      if (res.ok) {
        alert("Vehicle updated!");
        router.push(`/master-data/vehicles/${encodeURIComponent(plateParam)}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update");
      }
    } catch {
      alert("Failed to update");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!form) return null;

  const set = (key: string, val: any) => setForm((prev: any) => ({ ...prev, [key]: val }));
  const brands = vehicleType ? vehicleBrands[vehicleType] || [] : Object.keys(brandModels);
  const models = form.brand ? brandModels[form.brand] || [] : [];

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-1.5 border border-[#d8d8d8] rounded-lg cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Edit Vehicle</h1>
      </div>

      <div className="bg-white border border-[#ecebea] rounded-lg p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Tipe Kendaraan</label>
            <select className="form-select" value={vehicleType} onChange={(e) => { setVehicleType(e.target.value); set("brand", ""); set("model", ""); }}>
              <option value="">-- Pilih Tipe --</option>
              {Object.keys(vehicleBrands).map(t => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">Plat Nomor</label>
            <input className="form-input bg-gray-100" value={form.plateNo} disabled />
          </div>
          <div>
            <label className="form-label">Merk</label>
            {brands.length > 0 ? (
              <select className="form-select" value={form.brand} onChange={(e) => set("brand", e.target.value)}>
                <option value="">-- Pilih Merk --</option>
                {brands.map(b => <option key={b}>{b}</option>)}
              </select>
            ) : (
              <input className="form-input" placeholder="Pilih Tipe dulu..." disabled />
            )}
          </div>
          <div>
            <label className="form-label">Model</label>
            {models.length > 0 ? (
              <select className="form-select" value={form.model} onChange={(e) => set("model", e.target.value)}>
                <option value="">-- Pilih Model --</option>
                {models.map(m => <option key={m}>{m}</option>)}
              </select>
            ) : (
              <input className="form-input" value={form.model} placeholder="Pilih Merk dulu..." disabled />
            )}
          </div>
          <div>
            <label className="form-label">Tahun</label>
            <select className="form-select" value={form.year} onChange={(e) => set("year", e.target.value)}>
              <option value="">-- Pilih Tahun --</option>
              {years.map(y => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label">No. Rangka (Chassis)</label>
            <input className="form-input" value={form.chassisNo} onChange={(e) => set("chassisNo", e.target.value)} />
          </div>
          <div>
            <label className="form-label">No. Mesin (Engine)</label>
            <input className="form-input" value={form.engineNo} onChange={(e) => set("engineNo", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Customer</label>
            <select className="form-select" value={form.customerId} onChange={(e) => set("customerId", e.target.value)}>
              <option value="">-- Pilih Customer --</option>
              {customers.map((c: any) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn btn--brand flex items-center gap-2">
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => router.back()} className="btn btn--outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}
