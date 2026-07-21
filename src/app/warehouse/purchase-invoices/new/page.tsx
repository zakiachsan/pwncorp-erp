"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function NewPurchaseInvoicePage() {
  const router = useRouter();
  const [pos, setPos] = useState<any[]>([]);
  const [form, setForm] = useState({ poId: "", supplierId: "", total: 0, dueDate: "" });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/purchase-orders?limit=50")
      .then((r) => r.json())
      .then((j) => setPos(j.data || []))
      .catch(() => {});
  }, []);

  const onPoSelect = (poId: string) => {
    const po = pos.find((p) => p.id === poId);
    setForm((f) => ({
      ...f,
      poId,
      supplierId: po?.supplierId || "",
      total: po?.total || 0,
    }));
  };

  const handleSave = async () => {
    setError("");
    if (!form.poId || !form.supplierId || !form.total) {
      setError("PO, Supplier, dan Total wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/purchase-invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); setSaving(false); return; }
      router.push("/warehouse/purchase-invoices");
    } catch { setError("Gagal menyimpan"); setSaving(false); }
  };

  const selectedPo = pos.find((p) => p.id === form.poId);

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-1.5 border border-[#d8d8d8] rounded-lg cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>New Purchase Invoice</h1>
      </div>

      <div className="bg-white border border-[#ecebea] rounded-lg p-4 sm:p-6 space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label">Purchase Order *</label>
            <select className="form-select" value={form.poId} onChange={(e) => onPoSelect(e.target.value)}>
              <option value="">-- Pilih PO --</option>
              {pos.map((po) => (
                <option key={po.id} value={po.id}>{po.poNo} — {po.supplier?.companyName || ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Supplier</label>
            <input className="form-input bg-gray-100" value={selectedPo?.supplier?.companyName || ""} disabled />
          </div>
          <div>
            <label className="form-label">Total (Rp) *</label>
            <input type="number" className="form-input" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} />
          </div>
          <div>
            <label className="form-label">Due Date</label>
            <input type="date" className="form-input" value={form.dueDate} onChange={(e) => setForm({ ...form, dueDate: e.target.value })} />
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
