"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function ServiceEditPage() {
  const params = useParams();
  const router = useRouter();
  const code = params.code as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    // Search by SKU via the list API, then get the internal ID for the PUT endpoint
    fetch(`/api/services?search=${encodeURIComponent(code)}&limit=10`)
      .then((r) => r.json())
      .then((json) => {
        const list = json.data || [];
        const found = list.find((s: any) => s.sku === code);
        // If not found by search, try direct lookup (which uses [id] route)
        if (!found) {
          return fetch(`/api/services/${encodeURIComponent(code)}`)
            .then((r) => {
              if (!r.ok) throw new Error("Not found");
              return r.json();
            })
            .then((directJson) => {
              const d = directJson.data || directJson;
              if (!d || !d.id) { setError("Service not found"); setLoading(false); return; }
              setForm({
                id: d.id,
                sku: d.sku || "",
                name: d.name || "",
                category: d.category || "Perawatan",
                standardPrice: d.standardPrice || 0,
                estDuration: d.estDuration || "",
              });
              setLoading(false);
            });
        }
        setForm({
          id: found.id,
          sku: found.sku,
          name: found.name || "",
          category: found.category || "Perawatan",
          standardPrice: found.standardPrice || 0,
          estDuration: found.estDuration || "",
        });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load service"); setLoading(false); });
  }, [code]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/services/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Service updated!");
        router.push(`/master-data/services/${code}`);
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
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Edit Service</h1>
      </div>

      <div className="bg-white border border-[#ecebea] rounded-lg p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Kode</label>
            <input className="form-input bg-gray-100" value={form.sku} disabled />
          </div>
          <div>
            <label className="form-label">Kategori</label>
            <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="Perawatan">Perawatan</option>
              <option value="Perbaikan">Perbaikan</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Standard Price (Rp)</label>
            <input type="number" className="form-input" value={form.standardPrice} onChange={(e) => set("standardPrice", Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Estimasi Waktu</label>
            <input className="form-input" value={form.estDuration} onChange={(e) => set("estDuration", e.target.value)} placeholder="Contoh: 30 menit" />
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
