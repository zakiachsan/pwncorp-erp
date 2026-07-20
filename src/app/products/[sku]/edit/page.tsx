"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function ProductEditPage() {
  const params = useParams();
  const router = useRouter();
  const sku = params.sku as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/spareparts?search=${encodeURIComponent(sku)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Product not found"); setLoading(false); return; }
        setForm({
          id: found.id,
          sku: found.sku,
          name: found.name || "",
          code: found.code || "",
          brand: found.brand || "",
          category: found.category || "",
          type: found.type || "",
          buyPrice: found.buyPrice || 0,
          sellPrice: found.sellPrice || 0,
          unit: found.unit || "pcs",
          minStock: found.minStock || 0,
          location: found.location || "",
          tax: found.tax || "",
        });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load product"); setLoading(false); });
  }, [sku]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/spareparts/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Product updated!");
        router.push(`/products/${sku}`);
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
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Edit Product</h1>
      </div>

      <div className="bg-white border border-[#ecebea] rounded-lg p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">SKU</label>
            <input className="form-input bg-gray-100" value={form.sku} disabled />
          </div>
          <div>
            <label className="form-label">Code</label>
            <input className="form-input" value={form.code} onChange={(e) => set("code", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Brand</label>
            <input className="form-input" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Category</label>
            <input className="form-input" value={form.category} onChange={(e) => set("category", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Type</label>
            <input className="form-input" value={form.type} onChange={(e) => set("type", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Unit</label>
            <input className="form-input" value={form.unit} onChange={(e) => set("unit", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Buy Price (Rp)</label>
            <input type="number" className="form-input" value={form.buyPrice} onChange={(e) => set("buyPrice", Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Sell Price (Rp)</label>
            <input type="number" className="form-input" value={form.sellPrice} onChange={(e) => set("sellPrice", Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Min Stock</label>
            <input type="number" className="form-input" value={form.minStock} onChange={(e) => set("minStock", Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Location</label>
            <input className="form-input" value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Tax</label>
            <input className="form-input" value={form.tax} onChange={(e) => set("tax", e.target.value)} />
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
