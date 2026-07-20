"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface InvoiceItem {
  id: number;
  description: string;
  qty: number;
  unitPrice: number;
}

interface Customer {
  id: string;
  name: string;
  code?: string;
}

export default function InvoiceCreatePage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [customersLoading, setCustomersLoading] = useState(true);
  const [customerId, setCustomerId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, description: "", qty: 1, unitPrice: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetch("/api/customers?limit=100")
      .then(r => r.json())
      .then(j => { setCustomers(j.data || []); setCustomersLoading(false); })
      .catch(() => setCustomersLoading(false));
  }, []);

  const addItem = () => {
    setItems([...items, { id: Date.now(), description: "", qty: 1, unitPrice: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.unitPrice, 0);
  const ppn = Math.round(subtotal * 0.11);
  const total = subtotal + ppn;

  const canSubmit = customerId && dueDate && items.length > 0 && items.every(i => i.description.trim()) && !saving;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSaving(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/invoices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerId,
          dueDate,
          items: items.map(i => ({
            description: i.description.trim(),
            qty: i.qty,
            unitPrice: i.unitPrice,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create invoice");
      router.push("/finance/invoices");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create invoice");
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Buat Invoice Baru</div>
        </div>
        <button className="btn btn--brand btn--sm" disabled={!canSubmit} onClick={handleSubmit}>
          <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {submitError && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">{submitError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi Invoice</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <select className="form-select" value={customerId} onChange={(e) => setCustomerId(e.target.value)} disabled={customersLoading}>
                  <option value="">{customersLoading ? "Loading..." : "Pilih Customer"}</option>
                  {customers.map(c => (
                    <option key={c.id} value={c.id}>{c.code ? `${c.code} - ` : ""}{c.name}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Jatuh Tempo *</label>
                <input type="date" className="form-input" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="card-slds">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-[--color-text-secondary] uppercase">Item Invoice</div>
              <button onClick={addItem} className="btn btn--brand btn--xs"><Plus size={12} /> Tambah Item</button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Deskripsi</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Harga</th>
                    <th className="text-right">Subtotal</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td><input type="text" className="form-input" value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Nama item / jasa" /></td>
                      <td className="text-right"><input type="number" className="form-input text-right" value={item.qty} onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))} style={{ width: 60 }} /></td>
                      <td className="text-right"><input type="number" className="form-input text-right" value={item.unitPrice} onChange={(e) => updateItem(item.id, "unitPrice", Number(e.target.value))} style={{ width: 120 }} /></td>
                      <td className="text-right font-medium">Rp {(item.qty * item.unitPrice).toLocaleString("id-ID")}</td>
                      <td><button onClick={() => removeItem(item.id)} className="text-[--color-error] hover:text-red-700 p-1"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div>
          <div className="card-slds sticky top-4">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Ringkasan</div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-[--color-border]">
                <span className="text-sm text-[--color-text-secondary]">Subtotal</span>
                <span className="font-medium">Rp {subtotal.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[--color-border]">
                <span className="text-sm text-[--color-text-secondary]">PPN (11%)</span>
                <span className="font-medium">Rp {ppn.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3">
                <span>Total</span>
                <span className="text-[--color-brand]">Rp {total.toLocaleString("id-ID")}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
