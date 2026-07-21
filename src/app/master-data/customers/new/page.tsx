"use client";

import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { ArrowLeft, Save, X } from "lucide-react";

export default function CreateCustomerPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  // vehicles
  const [vehicles, setVehicles] = useState<any[]>([]);
  const [selectedVehicleId, setSelectedVehicleId] = useState("");
  const [showVehicleForm, setShowVehicleForm] = useState(false);

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
    } else {
      setShowVehicleForm(false);
      setSelectedVehicleId(value);
    }
  };

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
      const brand = (form.elements.namedItem("vehicleBrand") as HTMLSelectElement).value;
      const model = (form.elements.namedItem("vehicleModel") as HTMLInputElement).value;
      const year = (form.elements.namedItem("vehicleYear") as HTMLInputElement).value;
      if (!plateNo || !brand) {
        setError("Plat nomor dan merk kendaraan wajib diisi");
        setLoading(false);
        return;
      }
      vehiclePayload = { plateNo, brand, model, year: year ? parseInt(year) : undefined };
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
                <FInput name="vehiclePlateNo" label="PLAT NOMOR" placeholder="Contoh: B 1234 CD" />
                <FSelect name="vehicleBrand" label="MERK" options={["Toyota", "Honda", "Mitsubishi", "Suzuki", "Daihatsu", "Isuzu"]} />
                <FInput name="vehicleModel" label="MODEL" placeholder="Contoh: Avanza" />
                <FInput name="vehicleYear" label="TAHUN" placeholder="Contoh: 2022" />
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
