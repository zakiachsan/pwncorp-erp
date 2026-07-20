"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function VehicleEditPage() {
  const params = useParams();
  const router = useRouter();
  const plateParam = decodeURIComponent(params.plate as string);

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [customers, setCustomers] = useState<any[]>([]);

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
          // Try fetching all vehicles to find by plate
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
        setForm({
          id: found.id,
          customerId: found.customerId || "",
          plateNo: found.plateNo,
          brand: found.brand,
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
            <label className="form-label">Plat Nomor</label>
            <input className="form-input bg-gray-100" value={form.plateNo} disabled />
          </div>
          <div>
            <label className="form-label">Merk</label>
            <select className="form-select" value={form.brand} onChange={(e) => set("brand", e.target.value)}>
              <option value="">-- Pilih Merk --</option>
              <option>Toyota</option>
              <option>Honda</option>
              <option>Mitsubishi</option>
              <option>Suzuki</option>
              <option>Daihatsu</option>
              <option>Isuzu</option>
            </select>
          </div>
          <div>
            <label className="form-label">Model</label>
            <input className="form-input" value={form.model} onChange={(e) => set("model", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Tahun</label>
            <input type="number" className="form-input" value={form.year} onChange={(e) => set("year", e.target.value)} />
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
