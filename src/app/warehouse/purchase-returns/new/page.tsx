"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function NewPurchaseReturnPage() {
  const router = useRouter();
  const [pos, setPos] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [form, setForm] = useState({
    docNo: `RET/${new Date().toISOString().slice(2, 10).replace(/-/g, "")}/${String(Date.now()).slice(-4)}`,
    poId: "", supplierId: "", total: 0, status: "Draft", reason: "", date: new Date().toISOString().slice(0, 10),
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    Promise.all([
      fetch("/api/purchase-orders?limit=50").then((r) => r.json()),
      fetch("/api/suppliers?limit=200").then((r) => r.json()),
    ]).then(([poJson, suppJson]) => {
      setPos(poJson.data || []);
      setSuppliers(suppJson.data || []);
    }).catch(() => {});
  }, []);

  const handleSave = async () => {
    setError("");
    if (!form.docNo || !form.poId || !form.supplierId) {
      setError("Doc No, PO, dan Supplier wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/purchase-returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan"); setSaving(false); return; }
      router.push("/warehouse/purchase-returns");
    } catch { setError("Gagal menyimpan"); setSaving(false); }
  };

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-1.5 border border-[#d8d8d8] rounded-lg cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>New Purchase Return</h1>
      </div>

      <div className="bg-white border border-[#ecebea] rounded-lg p-4 sm:p-6 space-y-4">
        {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2">{error}</div>}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Doc No *</label>
            <input className="form-input" value={form.docNo} onChange={(e) => setForm({ ...form, docNo: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Date</label>
            <input type="date" className="form-input" value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} />
          </div>
          <div>
            <label className="form-label">Purchase Order *</label>
            <select className="form-select" value={form.poId} onChange={(e) => setForm({ ...form, poId: e.target.value })}>
              <option value="">-- Pilih PO --</option>
              {pos.map((po) => (
                <option key={po.id} value={po.id}>{po.poNo} — {po.supplier?.companyName || ""}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Supplier *</label>
            <select className="form-select" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
              <option value="">-- Pilih Supplier --</option>
              {suppliers.map((s) => (
                <option key={s.id} value={s.id}>{s.companyName}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="form-label">Total (Rp)</label>
            <input type="number" className="form-input" value={form.total} onChange={(e) => setForm({ ...form, total: Number(e.target.value) })} />
          </div>
          <div>
            <label className="form-label">Status</label>
            <select className="form-select" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
              <option>Draft</option>
              <option>Approved</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Reason</label>
            <textarea className="form-input" rows={3} value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} />
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
