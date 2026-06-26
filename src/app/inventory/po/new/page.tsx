"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save, Plus, Trash2, CheckCircle, XCircle } from "lucide-react";

interface ItemRow {
  name: string;
  qty: number;
  unit: string;
}

interface VendorQuote {
  id: string;
  supplier: string;
  status: "Dipilih" | "Alternatif";
  items: { hargaSatuan: number }[];
  total: number;
}

const formatIDR = (n: number) => {
  if (n === 0) return "Rp 0";
  return "Rp " + n.toLocaleString("id-ID");
};

export default function NewPOPage() {
  const router = useRouter();

  // Shared items (what we need to buy)
  const [items, setItems] = useState<ItemRow[]>([
    { name: "Oli Mesin 10W-40", qty: 20, unit: "Ltr" },
    { name: "Filter Oli", qty: 10, unit: "Pcs" },
  ]);

  // Vendor quotes
  const [vendors, setVendors] = useState<VendorQuote[]>([
    {
      id: "VND-1",
      supplier: "PT Auto Parts",
      status: "Alternatif",
      items: [{ hargaSatuan: 75000 }, { hargaSatuan: 50000 }],
      total: 2000000,
    },
    {
      id: "VND-2",
      supplier: "CV Suku Cadang Jaya",
      status: "Alternatif",
      items: [{ hargaSatuan: 72000 }, { hargaSatuan: 48000 }],
      total: 1920000,
    },
  ]);

  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");

  // Update item
  const updateItem = (idx: number, field: keyof ItemRow, value: any) => {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)));
  };

  // Add item row
  const addItem = () => {
    setItems([...items, { name: "Item Baru", qty: 1, unit: "Pcs" }]);
    setVendors((prev) =>
      prev.map((v) => ({
        ...v,
        items: [...v.items, { hargaSatuan: 0 }],
        total: v.total,
      }))
    );
  };

  // Remove item row
  const removeItem = (idx: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== idx));
    setVendors((prev) =>
      prev.map((v) => ({
        ...v,
        items: v.items.filter((_, i) => i !== idx),
        total: v.items.filter((_, i) => i !== idx).reduce((s, it) => s + it.hargaSatuan * (items.find((_, i2) => i2 === idx)?.qty || 0), 0),
      }))
    );
  };

  // Update vendor price
  const updateVendorPrice = (vendorIdx: number, itemIdx: number, price: number) => {
    setVendors((prev) =>
      prev.map((v, vi) => {
        if (vi !== vendorIdx) return v;
        const newItems = v.items.map((it, i) => (i === itemIdx ? { ...it, hargaSatuan: Math.max(0, price) } : it));
        const total = newItems.reduce((s, it, i) => s + it.hargaSatuan * (items[i]?.qty || 0), 0);
        return { ...v, items: newItems, total };
      })
    );
  };

  // Select vendor
  const selectVendor = (vendorIdx: number) => {
    setVendors((prev) =>
      prev.map((v, i) => ({
        ...v,
        status: i === vendorIdx ? ("Dipilih" as const) : ("Alternatif" as const),
      }))
    );
  };

  // Add vendor
  const addVendor = () => {
    if (!newVendorName.trim()) return;
    const newVendor: VendorQuote = {
      id: `VND-${Date.now()}`,
      supplier: newVendorName.trim(),
      status: "Alternatif",
      items: items.map(() => ({ hargaSatuan: 0 })),
      total: 0,
    };
    setVendors([...vendors, newVendor]);
    setNewVendorName("");
    setShowAddVendor(false);
  };

  // Remove vendor
  const removeVendor = (vendorIdx: number) => {
    if (vendors.length <= 1) return;
    setVendors((prev) => prev.filter((_, i) => i !== vendorIdx));
  };

  // Get lowest price per item
  const getLowest = (itemIdx: number) => {
    const prices = vendors.map((v) => v.items[itemIdx]?.hargaSatuan || Infinity);
    return Math.min(...prices);
  };

  // Get selected vendor
  const selectedVendor = vendors.find((v) => v.status === "Dipilih");

  const handleSave = () => {
    alert("Purchase Order berhasil dibuat (Draft)!");
    router.push("/inventory/po");
  };

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/inventory/po")} className="btn btn--sm">
            <ArrowLeft size={16} />
          </button>
          <div className="view-title">New Purchase Order</div>
        </div>
        <button className="btn btn--brand btn--sm" onClick={handleSave}>
          <Save size={14} /> Simpan
        </button>
      </div>

      {/* Workflow Bar */}
      <div className="card-slds mb-6">
        <div className="flex items-center gap-3">
          <span className="text-xs font-semibold text-[--color-text-secondary]">Workflow</span>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[--color-brand] text-white">DRAFT</span>
            <span className="text-[--color-text-placeholder]">→</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">SENT</span>
            <span className="text-[--color-text-placeholder]">→</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">PARTIAL RECEIVED</span>
            <span className="text-[--color-text-placeholder]">→</span>
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-400">RECEIVED</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: Items + Vendor Comparison */}
        <div className="lg:col-span-2 space-y-4">
          {/* PO Info */}
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi PO</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Supplier (Pemenang)</label>
                <input type="text" className="form-input" value={selectedVendor?.supplier || "- Pilih vendor -"} readOnly />
              </div>
              <div className="form-group">
                <label className="form-label">Tanggal PO</label>
                <input type="date" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Estimasi Tiba</label>
                <input type="date" className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Catatan</label>
                <input type="text" className="form-input" placeholder="Catatan PO..." />
              </div>
            </div>
          </div>

          {/* Items Table */}
          <div className="card-slds">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-[--color-text-secondary] uppercase">Item yang Dibutuhkan</div>
              <button onClick={addItem} className="btn btn--brand btn--xs"><Plus size={12} /> Tambah Item</button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>No</th>
                    <th>Nama Item</th>
                    <th className="text-right">Qty</th>
                    <th>Satuan</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>
                        <input type="text" className="form-input" value={item.name} onChange={(e) => updateItem(idx, "name", e.target.value)} />
                      </td>
                      <td className="text-right">
                        <input type="number" className="form-input text-right" value={item.qty} onChange={(e) => updateItem(idx, "qty", parseInt(e.target.value) || 0)} style={{ width: 80 }} />
                      </td>
                      <td>
                        <select className="form-select" value={item.unit} onChange={(e) => updateItem(idx, "unit", e.target.value)} style={{ width: 80 }}>
                          <option>Pcs</option><option>Ltr</option><option>Set</option><option>Box</option><option>Kg</option>
                        </select>
                      </td>
                      <td>
                        <button onClick={() => removeItem(idx)} className="text-[--color-error] hover:text-red-700 p-1" disabled={items.length <= 1}>
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Vendor Comparison */}
          <div className="card-slds">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-[--color-text-secondary] uppercase">Perbandingan Harga Vendor</div>
              <button onClick={() => setShowAddVendor(true)} className="btn btn--brand btn--xs"><Plus size={12} /> Tambah Vendor</button>
            </div>

            <div className="overflow-x-auto">
              <table className="data-table" style={{ minWidth: 600 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 150 }}>Item</th>
                    <th className="text-right" style={{ width: 70 }}>Qty</th>
                    {vendors.map((v) => (
                      <th key={v.id} className="text-center" style={{ minWidth: 130 }}>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs">{v.supplier}</span>
                          <div className="flex items-center gap-1">
                            {v.status === "Dipilih" ? (
                              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[--color-success] text-white">Dipilih</span>
                            ) : (
                              <button onClick={() => selectVendor(vendors.indexOf(v))} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[--color-brand] text-white hover:bg-[--color-brand-dark]">
                                Pilih
                              </button>
                            )}
                            <button onClick={() => removeVendor(vendors.indexOf(v))} className="p-0.5 text-gray-400 hover:text-[--color-error]" disabled={vendors.length <= 1}>
                              <Trash2 size={10} />
                            </button>
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, itemIdx) => {
                    const lowest = getLowest(itemIdx);
                    return (
                      <tr key={itemIdx}>
                        <td className="text-xs">{item.name}</td>
                        <td className="text-right text-xs">{item.qty}</td>
                        {vendors.map((v, vIdx) => {
                          const price = v.items[itemIdx]?.hargaSatuan || 0;
                          const isLowest = price === lowest && price > 0;
                          const subtotal = price * item.qty;
                          return (
                            <td key={v.id} className="text-center" style={{ background: isLowest ? "#f0fdf4" : undefined }}>
                              <div className="flex flex-col items-center">
                                <input
                                  type="number"
                                  className="form-input text-center text-xs"
                                  value={price || ""}
                                  onChange={(e) => updateVendorPrice(vIdx, itemIdx, parseInt(e.target.value) || 0)}
                                  placeholder="0"
                                  style={{ width: 110, fontSize: 11 }}
                                />
                                <span className="text-[10px] text-[--color-text-secondary] mt-0.5">
                                  {formatIDR(subtotal)}
                                </span>
                                {isLowest && <span className="text-[9px] text-[--color-success] font-bold">TERENDAH</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {/* Total row */}
                  <tr className="font-bold border-t-2 border-[--color-text-primary]">
                    <td className="text-xs">TOTAL</td>
                    <td></td>
                    {vendors.map((v) => {
                      const isSelected = v.status === "Dipilih";
                      const cheapest = vendors.reduce((min, cur) => cur.total < min.total ? cur : min, vendors[0]);
                      const isCheapest = v.id === cheapest?.id;
                      return (
                        <td key={v.id} className="text-center text-xs" style={{ background: isSelected ? "#f0fdf4" : undefined }}>
                          <span className={isCheapest ? "text-[--color-success] font-bold" : ""}>{formatIDR(v.total)}</span>
                          {isCheapest && <div className="text-[9px] text-[--color-success]">TERMURAH</div>}
                        </td>
                      );
                    })}
                  </tr>
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
                <span className="text-sm text-[--color-text-secondary]">Vendor Terpilih</span>
                <span className="font-medium text-sm">{selectedVendor?.supplier || "-"}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[--color-border]">
                <span className="text-sm text-[--color-text-secondary]">Jumlah Vendor</span>
                <span className="font-medium">{vendors.length}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[--color-border]">
                <span className="text-sm text-[--color-text-secondary]">Jumlah Item</span>
                <span className="font-medium">{items.length}</span>
              </div>
              <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3">
                <span>Total</span>
                <span className="text-[--color-brand]">{formatIDR(selectedVendor?.total || 0)}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal Tambah Vendor */}
      {showAddVendor && (
        <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.5)" }}>
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md" style={{ margin: 16 }}>
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h3 className="text-base font-semibold">Tambah Vendor</h3>
              <button onClick={() => setShowAddVendor(false)} className="text-gray-400 hover:text-gray-600"><XCircle size={20} /></button>
            </div>
            <div className="px-6 py-4">
              <div className="form-group">
                <label className="form-label">Nama Vendor / Supplier *</label>
                <input type="text" className="form-input" value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} placeholder="Contoh: PT Sejahtera Abadi" />
              </div>
            </div>
            <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-200">
              <button onClick={() => setShowAddVendor(false)} className="btn btn--sm">Batal</button>
              <button onClick={addVendor} className="btn btn--brand btn--sm">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
