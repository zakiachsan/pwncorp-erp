"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useState } from "react";

interface InvoiceItem {
  id: number;
  type: "Jasa" | "Sparepart";
  name: string;
  qty: number;
  price: number;
}

export default function InvoiceCreatePage() {
  const router = useRouter();
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: 1, type: "Jasa", name: "Service Oil Change", qty: 1, price: 350000 },
  ]);

  const addItem = () => {
    setItems([...items, { id: Date.now(), type: "Sparepart", name: "", qty: 1, price: 0 }]);
  };

  const removeItem = (id: number) => {
    setItems(items.filter((i) => i.id !== id));
  };

  const updateItem = (id: number, field: keyof InvoiceItem, value: any) => {
    setItems(items.map((i) => (i.id === id ? { ...i, [field]: value } : i)));
  };

  const subtotal = items.reduce((sum, i) => sum + i.qty * i.price, 0);
  const ppn = Math.round(subtotal * 0.11);
  const total = subtotal + ppn;

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Buat Invoice Baru</div>
        </div>
        <button className="btn btn--brand btn--sm"><Save size={14} /> Simpan</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Form */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi Invoice</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">No. Service Order *</label>
                <select className="form-select">
                  <option value="">Pilih SO</option>
                  <option>SO-001 - Budi Santoso</option>
                  <option>SO-002 - PT Maju Jaya</option>
                  <option>SO-003 - Siti Rahmawati</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Customer *</label>
                <input type="text" className="form-input" placeholder="Otomatis dari SO" readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Jatuh Tempo *</label>
                <input type="date" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Diskon (%)</label>
                <input type="number" className="form-input" placeholder="0" defaultValue={0} />
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
                    <th>Tipe</th>
                    <th>Nama Item</th>
                    <th className="text-right">Qty</th>
                    <th className="text-right">Harga</th>
                    <th className="text-right">Subtotal</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>
                        <select className="form-select" value={item.type} onChange={(e) => updateItem(item.id, "type", e.target.value)} style={{ minWidth: 100 }}>
                          <option>Jasa</option>
                          <option>Sparepart</option>
                        </select>
                      </td>
                      <td><input type="text" className="form-input" value={item.name} onChange={(e) => updateItem(item.id, "name", e.target.value)} /></td>
                      <td className="text-right"><input type="number" className="form-input text-right" value={item.qty} onChange={(e) => updateItem(item.id, "qty", Number(e.target.value))} style={{ width: 60 }} /></td>
                      <td className="text-right"><input type="number" className="form-input text-right" value={item.price} onChange={(e) => updateItem(item.id, "price", Number(e.target.value))} style={{ width: 120 }} /></td>
                      <td className="text-right font-medium">Rp {(item.qty * item.price).toLocaleString("id-ID")}</td>
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
