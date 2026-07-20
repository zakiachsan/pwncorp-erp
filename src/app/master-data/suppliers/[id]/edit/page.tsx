"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function SupplierEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/suppliers/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((json) => {
        const d = json.data || json;
        if (!d || !d.id) { setError("Supplier not found"); setLoading(false); return; }
        setForm({
          id: d.id,
          companyName: d.companyName || "",
          contactPerson: d.contactPerson || "",
          phone: d.phone || "",
          email: d.email || "",
          address: d.address || "",
          paymentTerms: d.paymentTerms || "Net 30",
        });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load supplier"); setLoading(false); });
  }, [id]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/suppliers/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Supplier updated!");
        router.push(`/master-data/suppliers/${id}`);
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
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Edit Supplier</h1>
      </div>

      <div className="bg-white border border-[#ecebea] rounded-lg p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label">Company Name</label>
            <input className="form-input" value={form.companyName} onChange={(e) => set("companyName", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Contact Person</label>
            <input className="form-input" value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Phone</label>
            <input className="form-input" value={form.phone} onChange={(e) => set("phone", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Payment Terms</label>
            <select className="form-select" value={form.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)}>
              <option value="COD">COD</option>
              <option value="Net 7">Net 7</option>
              <option value="Net 14">Net 14</option>
              <option value="Net 30">Net 30</option>
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Address</label>
            <textarea className="form-input min-h-[80px]" value={form.address} onChange={(e) => set("address", e.target.value)} />
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
