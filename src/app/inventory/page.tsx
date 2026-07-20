"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, AlertTriangle } from "lucide-react";

interface Sparepart {
  id: string;
  sku: string;
  name: string;
  code?: string;
  brand: string;
  category: string;
  stockQty: number;
  minStock: number;
  sellPrice: number;
}

function formatRupiah(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

export default function InventoryPage() {
  const router = useRouter();
  const [spareparts, setSpareparts] = useState<Sparepart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/spareparts?limit=100")
      .then((r) => r.json())
      .then((json) => {
        setSpareparts(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data");
        setLoading(false);
      });
  }, []);

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const lowStockItems = spareparts.filter((sp) => sp.stockQty <= sp.minStock);

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <PackageIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Inventory — Sparepart
        </div>
        <div className="flex gap-2">
          <button onClick={() => router.push("/inventory/new")} className="btn btn--brand btn--sm">
            <Plus size={14} /> Add Sparepart
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      {lowStockItems.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 rounded-slds-md p-3 mb-4 flex items-center gap-2 text-amber-800 text-sm">
          <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
          <span>
            <strong>Low Stock Alert:</strong> {lowStockItems.length} items below minimum stock —{" "}
            {lowStockItems.map((s) => `${s.name} (${s.stockQty})`).join(", ")}
          </span>
        </div>
      )}

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select">
              <option>All Categories</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Stock Status</label>
            <select className="form-select">
              <option>All</option>
              <option>Low Stock Only</option>
              <option>In Stock</option>
              <option>Out of Stock</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Nama / Kode sparepart..." />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>

      {/* Sparepart Table */}
      <div className="table-wrap">
        {loading ? (
          <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Nama Sparepart</th>
                <th>Brand</th>
                <th>Kategori</th>
                <th>Stock</th>
                <th>Unit</th>
                <th>Harga Jual</th>
              </tr>
            </thead>
            <tbody>
              {spareparts.map((sp) => (
                <tr
                  key={sp.id}
                  onClick={() => router.push(`/inventory/${sp.sku}`)}
                  className="cursor-pointer hover:bg-[#f0f7ff] transition-colors"
                >
                  <td className="font-medium text-[--color-brand]">{sp.code || sp.sku}</td>
                  <td>{sp.name}</td>
                  <td className="text-[--color-text-secondary]">{sp.brand}</td>
                  <td>{sp.category || "-"}</td>
                  <td>
                    <span className={sp.stockQty <= sp.minStock ? "text-[--color-error] font-semibold" : ""}>
                      {sp.stockQty}
                      {sp.stockQty <= sp.minStock && (
                        <AlertTriangle size={12} className="inline ml-1 text-[--color-warning]" />
                      )}
                    </span>
                  </td>
                  <td>Pcs</td>
                  <td className="font-medium">{formatRupiah(sp.sellPrice)}</td>
                </tr>
              ))}
              {spareparts.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-[--color-text-secondary]">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="m7.5 4.27 9 5.15" />
      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
      <path d="m3.3 7 8.7 5 8.7-5" />
      <path d="M12 22V12" />
    </svg>
  );
}
