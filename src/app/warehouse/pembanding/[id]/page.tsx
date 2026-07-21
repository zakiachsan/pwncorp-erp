"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Plus, Trash2, Check, Star } from "lucide-react";

export default function PembandingDetailPage() {
  const router = useRouter();
  const params = useParams();
  const prId = params.id as string;

  const [pr, setPr] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);
  const [suppliers, setSuppliers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Add quote form
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ supplierId: "", leadTime: 0, notes: "" });
  const [formItems, setFormItems] = useState<{ sparepartId: string; unitPrice: number }[]>([]);
  const [saving, setSaving] = useState(false);

  const load = () => {
    Promise.all([
      fetch(`/api/purchase-requests?limit=100`).then((r) => r.json()),
      fetch(`/api/vendor-quotes?prId=${prId}`).then((r) => r.json()),
      fetch(`/api/suppliers?limit=200`).then((r) => r.json()),
    ])
      .then(([prJson, quoteJson, suppJson]) => {
        const found = (prJson.data || []).find((p: any) => p.id === prId);
        setPr(found || null);
        setQuotes(quoteJson.data || []);
        setSuppliers(suppJson.data || []);
        if (found) {
          setFormItems((found.items || []).map((i: any) => ({ sparepartId: i.sparepartId, unitPrice: 0 })));
        }
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  };

  useEffect(() => { load(); }, [prId]);

  const setItem = (i: number, key: string, val: any) => {
    const next = [...formItems]; next[i] = { ...next[i], [key]: val }; setFormItems(next);
  };

  const handleSave = async () => {
    setError("");
    if (!form.supplierId) { setError("Pilih supplier"); return; }
    setSaving(true);
    try {
      const res = await fetch("/api/vendor-quotes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prId, ...form, items: formItems }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal menyimpan quote"); setSaving(false); return; }
      setShowForm(false);
      setForm({ supplierId: "", leadTime: 0, notes: "" });
      load();
    } catch { setError("Gagal menyimpan quote"); setSaving(false); }
  };

  const handleSelect = async (quoteId: string) => {
    if (!confirm("Pilih vendor ini? Quote lain akan di-unselect.")) return;
    try {
      const res = await fetch(`/api/vendor-quotes/${quoteId}`, { method: "PUT" });
      if (res.ok) load();
    } catch {}
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (!pr) return <div className="p-8 text-center text-red-500">PR tidak ditemukan</div>;

  const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-1.5 border border-[#d8d8d8] rounded-lg cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Pembanding — {pr.prNo}</h1>
      </div>

      {error && <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded px-3 py-2 mb-4">{error}</div>}

      {/* PR Items */}
      <div className="bg-white border border-[#ecebea] rounded-lg p-4 mb-4">
        <h3 className="text-sm font-bold mb-3">Items yang Diminta</h3>
        <table className="data-table">
          <thead><tr><th>Sparepart</th><th className="text-right">Qty</th></tr></thead>
          <tbody>
            {(pr.items || []).map((i: any) => (
              <tr key={i.id}>
                <td>{i.sparepart?.sku} — {i.sparepart?.name}</td>
                <td className="text-right">{i.qty}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Quotes comparison */}
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold">Vendor Quotes ({quotes.length})</h3>
        <button onClick={() => setShowForm(true)} className="btn btn--brand btn--sm"><Plus size={12} /> Tambah Quote</button>
      </div>

      {quotes.length === 0 ? (
        <div className="bg-white border border-[#ecebea] rounded-lg p-8 text-center text-[--color-text-secondary]">
          Belum ada quote. Klik "Tambah Quote" untuk meminta harga dari vendor.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {quotes.map((q) => (
            <div key={q.id} className={`bg-white border rounded-lg p-4 ${q.isSelected ? "border-green-500 ring-2 ring-green-200" : "border-[#ecebea]"}`}>
              <div className="flex items-center justify-between mb-3">
                <div>
                  <div className="font-bold text-sm">{q.supplier?.companyName}</div>
                  <div className="text-xs text-[--color-text-secondary]">Lead time: {q.leadTime} hari {q.notes ? `• ${q.notes}` : ""}</div>
                </div>
                {q.isSelected && <span className="pill pill--completed"><Check size={10} /> Dipilih</span>}
              </div>
              <table className="data-table" style={{ fontSize: 12 }}>
                <thead><tr><th>Sparepart</th><th className="text-right">Harga</th></tr></thead>
                <tbody>
                  {(q.items || []).map((i: any) => (
                    <tr key={i.id}>
                      <td>{i.sparepart?.name}</td>
                      <td className="text-right">{fmt(i.unitPrice)}</td>
                    </tr>
                  ))}
                  <tr style={{ fontWeight: 700 }}>
                    <td>Total</td>
                    <td className="text-right">{fmt(q.totalPrice)}</td>
                  </tr>
                </tbody>
              </table>
              {!q.isSelected && (
                <button onClick={() => handleSelect(q.id)} className="btn btn--brand btn--sm w-full justify-center mt-3">
                  <Star size={12} /> Pilih Vendor Ini
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Add Quote Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowForm(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-2xl border border-[--color-border-light] max-h-[90vh] overflow-y-auto">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between">
              <h2 className="text-base font-bold">Tambah Vendor Quote</h2>
              <button onClick={() => setShowForm(false)} className="text-[--color-text-placeholder] hover:text-[--color-text-secondary]">✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="form-label">Supplier *</label>
                  <select className="form-select" value={form.supplierId} onChange={(e) => setForm({ ...form, supplierId: e.target.value })}>
                    <option value="">-- Pilih --</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.companyName}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Lead Time (hari)</label>
                  <input type="number" className="form-input" value={form.leadTime} onChange={(e) => setForm({ ...form, leadTime: Number(e.target.value) })} />
                </div>
              </div>
              <div>
                <label className="form-label">Notes</label>
                <input className="form-input" value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} />
              </div>
              <div>
                <label className="form-label">Harga per Item *</label>
                <div className="space-y-2">
                  {formItems.map((item, i) => {
                    const sp = (pr.items || []).find((pi: any) => pi.sparepartId === item.sparepartId);
                    return (
                      <div key={i} className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-8 text-sm">{sp?.sparepart?.sku} — {sp?.sparepart?.name}</div>
                        <input type="number" className="form-input col-span-4" placeholder="Harga" value={item.unitPrice || ""} onChange={(e) => setItem(i, "unitPrice", Number(e.target.value))} />
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-end gap-3">
              <button onClick={() => setShowForm(false)} className="btn btn--sm">Batal</button>
              <button onClick={handleSave} disabled={saving} className="btn btn--brand btn--sm">{saving ? "Saving..." : "Simpan Quote"}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
