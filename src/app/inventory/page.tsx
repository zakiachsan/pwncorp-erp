"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, AlertTriangle } from "lucide-react";

const spareparts = [
  { code: "SP-001", name: "Oli Mesin 10W-40", brand: "Shell", stock: 45, minStock: 10, unit: "Ltr", price: "Rp 85.000", category: "Oli" },
  { code: "SP-002", name: "Filter Oli", brand: "Toyota Genuine", stock: 22, minStock: 5, unit: "Pcs", price: "Rp 65.000", category: "Filter" },
  { code: "SP-003", name: "Kampas Rem Depan", brand: "Bendix", stock: 8, minStock: 10, unit: "Set", price: "Rp 250.000", category: "Rem" },
  { code: "SP-004", name: "Busi Iridium", brand: "NGK", stock: 30, minStock: 8, unit: "Pcs", price: "Rp 45.000", category: "Pengapian" },
  { code: "SP-005", name: "Aki GS 45Ah", brand: "GS Battery", stock: 3, minStock: 5, unit: "Pcs", price: "Rp 850.000", category: "Kelistrikan" },
  { code: "SP-006", name: "V-Belt", brand: "Mitsuboshi", stock: 15, minStock: 5, unit: "Pcs", price: "Rp 120.000", category: "Mesin" },
];

export default function InventoryPage() {
  const router = useRouter();

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <PackageIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Inventory — Sparepart
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => router.push("/inventory/new")}
            className="btn btn--brand btn--sm"
          >
            <Plus size={14} /> Add Sparepart
          </button>
        </div>
      </div>

      {/* Low Stock Alert */}
      <div className="bg-amber-50 border border-amber-200 rounded-slds-md p-3 mb-4 flex items-center gap-2 text-amber-800 text-sm">
        <AlertTriangle size={16} className="text-amber-500 flex-shrink-0" />
        <span><strong>Low Stock Alert:</strong> 2 items below minimum stock — Kampas Rem Depan (8), Aki GS 45Ah (3)</span>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select">
              <option>All Categories</option>
              <option>Oli</option>
              <option>Filter</option>
              <option>Rem</option>
              <option>Kelistrikan</option>
              <option>Mesin</option>
              <option>Body</option>
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
                key={sp.code}
                onClick={() => router.push(`/inventory/${sp.code}`)}
                className="cursor-pointer hover:bg-[#f0f7ff] transition-colors"
              >
                <td className="font-medium text-[--color-brand]">{sp.code}</td>
                <td>{sp.name}</td>
                <td className="text-[--color-text-secondary]">{sp.brand}</td>
                <td>{sp.category}</td>
                <td>
                  <span className={sp.stock <= sp.minStock ? "text-[--color-error] font-semibold" : ""}>
                    {sp.stock}
                    {sp.stock <= sp.minStock && <AlertTriangle size={12} className="inline ml-1 text-[--color-warning]" />}
                  </span>
                </td>
                <td>{sp.unit}</td>
                <td className="font-medium">{sp.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
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
