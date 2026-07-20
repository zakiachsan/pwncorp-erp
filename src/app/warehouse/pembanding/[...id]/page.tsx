"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Plus, Trash2, Check } from "lucide-react";

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function PembandingDetailPage() {
  const params = useParams();
  const router = useRouter();
  const idArray = params.id as string[];
  const id = idArray ? idArray.join("/") : "";

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [vendors, setVendors] = useState<any[]>([]);
  const [items, setItems] = useState<any[]>([]);
  const [addVendorOpen, setAddVendorOpen] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [addItemOpen, setAddItemOpen] = useState(false);
  const [newItem, setNewItem] = useState({ nama: "", qty: 1, satuan: "Pcs" });

  // Fetch sparepart data by search id
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    fetch(`/api/spareparts?search=${encodeURIComponent(id)}&limit=1`)
      .then((r) => r.json())
      .then((j) => {
        const found = j.data?.[0];
        if (!found) {
          setError(`Data tidak ditemukan: ${id}`);
          setLoading(false);
          return;
        }
        // Build comparison data from sparepart
        const comparisonData = {
          id: id,
          date: new Date().toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }),
          refNo: found.sku || found.code || "-",
          status: "Draft",
          items: [
            { nama: found.name, qty: 1, satuan: found.unit || "Pcs" },
          ],
          vendors: found.supplier ? [
            {
              id: "V1",
              supplier: found.supplier.companyName,
              pilihan: "Dipilih",
              items: [{ hargaSatuan: found.buyPrice || 0 }],
            },
          ] : [],
        };
        setData(comparisonData);
        setVendors(comparisonData.vendors);
        setItems(comparisonData.items);
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/pembanding")} className="btn btn--sm mb-4">
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="card-slds" style={{ padding: 40, textAlign: "center", color: "#444746" }}>Memuat data...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/warehouse/pembanding")} className="btn btn--sm mb-4">
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="card-slds">
          <p className="text-sm text-[--color-text-secondary]">{error || `Data tidak ditemukan: ${id}`}</p>
        </div>
      </div>
    );
  }

  const handlePilih = (vendorIdx: number) => {
    setVendors((prev: any[]) =>
      prev.map((v: any, i: number) => ({
        ...v,
        pilihan: i === vendorIdx ? "Dipilih" : "Alternatif",
      }))
    );
  };

  const handleDeleteVendor = (vendorIdx: number) => {
    setVendors((prev: any[]) => prev.filter((_: any, i: number) => i !== vendorIdx));
  };

  const handleAddVendor = () => {
    if (!newVendorName) return;
    const newVendor = {
      id: `V${vendors.length + 1}`,
      supplier: newVendorName,
      pilihan: "Alternatif",
      items: items.map(() => ({ hargaSatuan: 0 })),
    };
    setVendors((prev: any[]) => [...prev, newVendor]);
    setNewVendorName("");
    setAddVendorOpen(false);
  };

  const handleUpdateHarga = (vendorIdx: number, itemIdx: number, value: string) => {
    const num = parseInt(value.replace(/[^0-9]/g, "")) || 0;
    setVendors((prev: any[]) =>
      prev.map((v: any, vi: number) => {
        if (vi !== vendorIdx) return v;
        return {
          ...v,
          items: v.items.map((it: any, ii: number) =>
            ii === itemIdx ? { ...it, hargaSatuan: num } : it
          ),
        };
      })
    );
  };

  const handleAddItem = () => {
    if (!newItem.nama) return;
    setItems((prev: any[]) => [...prev, { ...newItem }]);
    setVendors((prev: any[]) =>
      prev.map((v: any) => ({
        ...v,
        items: [...v.items, { hargaSatuan: 0 }],
      }))
    );
    setNewItem({ nama: "", qty: 1, satuan: "Pcs" });
    setAddItemOpen(false);
  };

  const handleDeleteItem = (itemIdx: number) => {
    setItems((prev: any[]) => prev.filter((_: any, i: number) => i !== itemIdx));
    setVendors((prev: any[]) =>
      prev.map((v: any) => ({
        ...v,
        items: v.items.filter((_: any, i: number) => i !== itemIdx),
      }))
    );
  };

  const getLowestPrice = (itemIdx: number) => {
    const prices = vendors.map((v: any) => v.items[itemIdx]?.hargaSatuan || Infinity);
    return Math.min(...prices);
  };

  const getTotal = (vendorIdx: number) => {
    return vendors[vendorIdx].items.reduce((sum: number, it: any, i: number) => {
      return sum + it.hargaSatuan * (items[i]?.qty || 0);
    }, 0);
  };

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <button onClick={() => router.push("/warehouse/pembanding")} className="btn btn--sm mr-3">
            <ArrowLeft size={16} />
          </button>
          Detail Pembanding Harga
        </div>
        <div className="flex gap-2">
          <span className="pill" style={{ background: data.status === "Sudah Dipilih" ? "var(--color-success)" : "var(--color-warning)", color: "#fff" }}>
            {data.status}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="card-slds mb-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Ref Code</div>
            <div className="text-sm font-medium text-[--color-text-primary]">{data.id}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Date</div>
            <div className="text-sm text-[--color-text-primary]">{data.date}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Reference No</div>
            <div className="text-sm font-medium text-[--color-text-primary]">{data.refNo}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Vendor Dipilih</div>
            <div className="text-sm font-medium" style={{ color: "var(--color-success)" }}>
              {vendors.find((v: any) => v.pilihan === "Dipilih")?.supplier || "-"}
            </div>
          </div>
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-bold text-[--color-text-primary]">Perbandingan Harga Vendor</h3>
        <div className="flex gap-2">
          <button onClick={() => setAddItemOpen(true)} className="btn btn--sm">
            <Plus size={14} /> Tambah Item
          </button>
          <button onClick={() => setAddVendorOpen(true)} className="btn btn--brand btn--sm">
            <Plus size={14} /> Tambah Vendor
          </button>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="table-wrap mb-6">
        <table className="data-table">
          <thead>
            <tr>
              <th className="text-left text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide" style={{ minWidth: 160 }}>Item</th>
              <th className="text-center text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Qty</th>
              <th className="text-center text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide">Satuan</th>
              {vendors.map((v: any) => (
                <th key={v.id} className="text-center text-xs font-semibold uppercase tracking-wide" style={{ minWidth: 160, background: v.pilihan === "Dipilih" ? "#e6f7ed" : undefined, color: v.pilihan === "Dipilih" ? "var(--color-success)" : "var(--color-text-secondary)" }}>
                  <div>{v.supplier}</div>
                  <div className="flex items-center justify-center gap-1 mt-1">
                    {v.pilihan === "Dipilih" ? (
                      <span className="pill pill--completed" style={{ fontSize: 10, padding: "1px 8px" }}>✓ Dipilih</span>
                    ) : (
                      <button onClick={() => handlePilih(vendors.indexOf(v))} className="btn btn--sm" style={{ fontSize: 10, padding: "2px 8px", background: "var(--color-success)", color: "#fff", border: "none" }}>
                        Pilih
                      </button>
                    )}
                    <button onClick={() => handleDeleteVendor(vendors.indexOf(v))} style={{ padding: 2, color: "var(--color-text-placeholder)", background: "none", border: "none", cursor: "pointer" }}>
                      <Trash2 size={12} />
                    </button>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx: number) => (
              <tr key={idx}>
                <td className="text-sm font-medium">{item.nama}</td>
                <td className="text-center text-sm">{item.qty}</td>
                <td className="text-center text-sm">{item.satuan}</td>
                {vendors.map((v: any, vi: number) => {
                  const harga = v.items[idx]?.hargaSatuan || 0;
                  const isLowest = harga > 0 && harga === getLowestPrice(idx);
                  const subtotal = harga * item.qty;
                  return (
                    <td key={v.id} style={{ background: v.pilihan === "Dipilih" ? "#f0faf4" : undefined }}>
                      <div className="text-center">
                        <input
                          type="text"
                          value={harga > 0 ? fmt(harga) : ""}
                          onChange={(e) => handleUpdateHarga(vi, idx, e.target.value)}
                          placeholder="Rp 0"
                          className="w-full text-center text-sm bg-transparent border border-transparent hover:border-[--color-border] focus:border-[--color-brand] rounded px-2 py-1 transition"
                          style={{ color: isLowest ? "var(--color-success)" : "var(--color-text-primary)", fontWeight: isLowest ? 600 : 400 }}
                        />
                        {harga > 0 && (
                          <div className="text-xs text-[--color-text-placeholder]">= {fmt(subtotal)}</div>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td>
                  <button onClick={() => handleDeleteItem(idx)} style={{ padding: 4, color: "var(--color-text-placeholder)", background: "none", border: "none", cursor: "pointer" }}>
                    <Trash2 size={14} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr style={{ background: "#f9f9f9" }}>
              <td colSpan={3} className="text-sm font-bold text-[--color-text-primary]">TOTAL</td>
              {vendors.map((v: any) => {
                const total = getTotal(vendors.indexOf(v));
                const isCheapest = vendors.every((vv: any) => getTotal(vendors.indexOf(vv)) >= total);
                return (
                  <td key={v.id} className="text-center" style={{ background: v.pilihan === "Dipilih" ? "#e6f7ed" : undefined }}>
                    <div className="text-sm font-bold" style={{ color: isCheapest && total > 0 ? "var(--color-success)" : "var(--color-text-primary)" }}>
                      {fmt(total)}
                    </div>
                  </td>
                );
              })}
              <td></td>
            </tr>
          </tfoot>
        </table>
      </div>

      {/* Add Vendor Modal */}
      {addVendorOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setAddVendorOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md border border-[--color-border-light]">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between">
              <h2 className="text-base font-bold text-[--color-text-primary]">Tambah Vendor</h2>
              <button onClick={() => setAddVendorOpen(false)} style={{ color: "var(--color-text-placeholder)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>
            <div className="p-6">
              <div className="form-group">
                <label className="form-label">Nama Vendor</label>
                <input type="text" className="form-input" placeholder="PT / CV ..." value={newVendorName} onChange={(e) => setNewVendorName(e.target.value)} />
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-end gap-3">
              <button onClick={() => setAddVendorOpen(false)} className="btn btn--sm">Batal</button>
              <button onClick={handleAddVendor} className="btn btn--brand btn--sm">Simpan</button>
            </div>
          </div>
        </div>
      )}

      {/* Add Item Modal */}
      {addItemOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setAddItemOpen(false)} />
          <div className="relative bg-white rounded-lg shadow-lg w-full max-w-md border border-[--color-border-light]">
            <div className="px-6 py-4 border-b border-[--color-border-light] flex items-center justify-between">
              <h2 className="text-base font-bold text-[--color-text-primary]">Tambah Item</h2>
              <button onClick={() => setAddItemOpen(false)} style={{ color: "var(--color-text-placeholder)", background: "none", border: "none", cursor: "pointer" }}>✕</button>
            </div>
            <div className="p-6 space-y-4">
              <div className="form-group">
                <label className="form-label">Nama Item</label>
                <input type="text" className="form-input" placeholder="Contoh: Oli Mesin 5W-30" value={newItem.nama} onChange={(e) => setNewItem({ ...newItem, nama: e.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label className="form-label">Qty</label>
                  <input type="number" className="form-input" value={newItem.qty} onChange={(e) => setNewItem({ ...newItem, qty: parseInt(e.target.value) || 0 })} />
                </div>
                <div className="form-group">
                  <label className="form-label">Satuan</label>
                  <select className="form-select" value={newItem.satuan} onChange={(e) => setNewItem({ ...newItem, satuan: e.target.value })}>
                    <option>Pcs</option>
                    <option>Liter</option>
                    <option>Set</option>
                    <option>Unit</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="px-6 py-4 border-t border-[--color-border-light] flex justify-end gap-3">
              <button onClick={() => setAddItemOpen(false)} className="btn btn--sm">Batal</button>
              <button onClick={handleAddItem} className="btn btn--brand btn--sm">Simpan</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
