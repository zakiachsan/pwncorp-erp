"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, AlertTriangle } from "lucide-react";

const spareparts = [
  { code: "SP-001", name: "Oli Mesin 10W-40", brand: "Shell", category: "Oli", stock: 45, price: "Rp 85.000" },
  { code: "SP-002", name: "Filter Oli", brand: "Toyota Genuine", category: "Filter", stock: 22, price: "Rp 65.000" },
  { code: "SP-003", name: "Kampas Rem Depan", brand: "Bendix", category: "Rem", stock: 8, price: "Rp 250.000" },
  { code: "SP-004", name: "Busi Iridium", brand: "NGK", category: "Pengapian", stock: 30, price: "Rp 45.000" },
  { code: "SP-005", name: "Aki GS 45Ah", brand: "GS Battery", category: "Kelistrikan", stock: 3, price: "Rp 850.000" },
];

export default function SparepartMasterPage() {
  const router = useRouter();
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <PackageIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Sparepart Catalog
        </div>
        <button
          onClick={() => router.push("/master-data/sparepart/new")}
          className="btn btn--brand btn--sm"
        >
          <Plus size={14} /> Add Sparepart
        </button>
      </div>
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select">
              <option>All Categories</option>
              <option>Oli</option>
              <option>Filter</option>
              <option>Rem</option>
              <option>Pengapian</option>
              <option>Kelistrikan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Kode / Nama Sparepart..." />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Kode</th>
              <th>Nama Sparepart</th>
              <th>Brand</th>
              <th>Kategori</th>
              <th>Stock</th>
              <th>Harga</th>
            </tr>
          </thead>
          <tbody>
            {spareparts.map((sp) => (
              <tr key={sp.code} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/master-data/sparepart/${sp.code}`)}>
                <td className="font-medium text-[--color-brand]">{sp.code}</td>
                <td className="font-medium">{sp.name}</td>
                <td className="text-[--color-text-secondary]">{sp.brand}</td>
                <td><span className="pill bg-gray-200 text-gray-700">{sp.category}</span></td>
                <td>
                  <span className={sp.stock <= 5 ? "text-[--color-error] font-semibold" : ""}>
                    {sp.stock}
                    {sp.stock <= 5 && <AlertTriangle size={12} className="inline ml-1 text-[--color-warning]" />}
                  </span>
                </td>
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
      <path d="m7.5 4.27 9 5.15" /><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" /><path d="m3.3 7 8.7 5 8.7-5" /><path d="M12 22V12" />
    </svg>
  );
}
