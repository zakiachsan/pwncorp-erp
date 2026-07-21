"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function ServicePackageEditPage() {
  const params = useParams();
  const router = useRouter();
  const sku = params.sku as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/service-packages/${encodeURIComponent(sku)}`)
      .then((r) => {
        if (!r.ok) { setError("Package not found"); setLoading(false); return null; }
        return r.json();
      })
      .then((json) => {
        if (!json) return;
        const found = json.data;
        setForm({
          id: found.id,
          sku: found.sku,
          name: found.name || "",
          description: found.description || "",
          estDuration: found.estDuration || "",
          price: found.price || 0,
          tax: found.tax || "",
        });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load package"); setLoading(false); });
  }, [sku]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/service-packages/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); setSaving(false); return; }
      router.push(`/service-packages/${form.sku}`);
    } catch {
      setError("Gagal menyimpan");
      setSaving(false);
    }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error || !form) {
    return (
      <div className="p-8 text-center">
        <p className="text-red-500 mb-3">{error || "Package not found"}</p>
        <button onClick={() => router.push("/service-packages")} className="btn btn--sm">← Back</button>
      </div>
    );
  }

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-1.5 border border-[#d8d8d8] rounded-lg cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Edit Package Service</h1>
      </div>

      <div className="bg-white border border-[#ecebea] rounded-lg p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">SKU</label>
            <input className="form-input bg-gray-100" value={form.sku} disabled />
          </div>
          <div>
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Est. Duration</label>
            <input className="form-input" value={form.estDuration} onChange={(e) => setForm({ ...form, estDuration: e.target.value })} placeholder="e.g. 2 jam" />
          </div>
          <div>
            <label className="form-label">Price (Rp)</label>
            <input type="number" className="form-input" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
          </div>
          <div>
            <label className="form-label">Tax</label>
            <select className="form-select" value={form.tax} onChange={(e) => setForm({ ...form, tax: e.target.value })}>
              <option value="">Non-PPN</option>
              <option value="PPN">PPN 11%</option>
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
