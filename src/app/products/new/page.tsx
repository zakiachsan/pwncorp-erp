"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

const emptyForm = {
  sku: "", code: "", name: "", brand: "", category: "", type: "",
  unit: "pcs", buyPrice: 0, sellPrice: 0, minStock: 0, stockQty: 0,
  location: "", tax: "", supplierId: "", isBundle: false,
};

export default function NewProductPage() {
  const router = useRouter();
  const [form, setForm] = useState<any>(emptyForm);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/suppliers?limit=200")
      .then((r) => r.json())
      .then((j) => setSuppliers(j.data || []))
      .catch(() => {});
  }, []);

  const set = (key: string, value: any) => setForm((f: any) => ({ ...f, [key]: value }));

  const handleSave = async () => {
    setError("");
    if (!form.sku.trim() || !form.name.trim()) {
      setError("SKU dan Name wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/spareparts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          supplierId: form.supplierId || null,
          tax: form.tax || null,
          category: form.category || null,
          type: form.type || null,
          location: form.location || null,
          code: form.code || null,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error || "Gagal menyimpan product");
        setSaving(false);
        return;
      }
      router.push("/products");
    } catch {
      setError("Gagal menyimpan product");
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-1.5 border border-[#d8d8d8] rounded-lg cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Add Product</h1>
      </div>

      <div className="bg-white border border-[#ecebea] rounded-lg p-4 sm:p-6 space-y-4">
        {error && (
          <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">SKU *</label>
            <input className="form-input" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="SKU-001" />
          </div>
          <div>
            <label className="form-label">Code</label>
            <input className="form-input" value={form.code} onChange={(e) => set("code", e.target.value)} />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Name *</label>
            <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Brand</label>
            <input className="form-input" value={form.brand} onChange={(e) => set("brand", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Category</label>
            <select className="form-select" value={form.category} onChange={(e) => set("category", e.target.value)}>
              <option value="">-- Pilih Kategori --</option>
              <option>Oli</option>
              <option>Filter</option>
              <option>Rem</option>
              <option>Pengapian</option>
              <option>Kelistrikan</option>
              <option>Mesin</option>
              <option>Body</option>
            </select>
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
            <label className="form-label">Stock Qty</label>
            <input type="number" className="form-input" value={form.stockQty} onChange={(e) => set("stockQty", Number(e.target.value))} />
          </div>
          <div>
            <label className="form-label">Location</label>
            <input className="form-input" value={form.location} onChange={(e) => set("location", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Tax</label>
            <select className="form-select" value={form.tax} onChange={(e) => set("tax", e.target.value)}>
              <option value="">Non-PPN</option>
              <option value="PPN 11%">PPN 11%</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Supplier</label>
            <select className="form-select" value={form.supplierId} onChange={(e) => set("supplierId", e.target.value)}>
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map((s: any) => (
                <option key={s.id} value={s.id}>{s.companyName}</option>
              ))}
            </select>
          </div>
          <div className="sm:col-span-2 flex items-center gap-2">
            <input type="checkbox" id="isBundle" checked={form.isBundle} onChange={(e) => set("isBundle", e.target.checked)} />
            <label htmlFor="isBundle" className="form-label" style={{ margin: 0 }}>Bundle Product</label>
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
