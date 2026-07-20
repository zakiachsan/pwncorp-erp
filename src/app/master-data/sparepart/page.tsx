"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, AlertTriangle } from "lucide-react";

interface Sparepart {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: string;
  stockQty: number;
  minStock: number;
  sellPrice: number;
  supplier?: { id: string; companyName: string } | null;
}

export default function SparepartMasterPage() {
  const router = useRouter();
  const [data, setData] = useState<Sparepart[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (categoryFilter !== "All") params.set("category", categoryFilter);
    if (search) params.set("search", search);
    const qs = params.toString();
    fetch(`/api/spareparts${qs ? "?" + qs : ""}`)
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load spareparts"); setLoading(false); });
  }, [categoryFilter, search]);

  const formatPrice = (price: number) => {
    return "Rp " + price.toLocaleString("id-ID");
  };

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
            <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option>Oli</option>
              <option>Filter</option>
              <option>Rem</option>
              <option>Pengapian</option>
              <option>Kelistrikan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Kode / Nama Sparepart..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>

      {loading && <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>}
      {error && <div className="p-8 text-center text-red-500">{error}</div>}

      {!loading && !error && (
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
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[--color-text-secondary]">No spareparts found</td>
                </tr>
              )}
              {data.map((sp) => (
                <tr key={sp.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/master-data/sparepart/${sp.sku || sp.id}`)}>
                  <td className="font-medium text-[--color-brand]">{sp.sku}</td>
                  <td className="font-medium">{sp.name}</td>
                  <td className="text-[--color-text-secondary]">{sp.brand}</td>
                  <td><span className="pill bg-gray-200 text-gray-700">{sp.category}</span></td>
                  <td>
                    <span className={sp.stockQty <= (sp.minStock || 5) ? "text-[--color-error] font-semibold" : ""}>
                      {sp.stockQty}
                      {sp.stockQty <= (sp.minStock || 5) && <AlertTriangle size={12} className="inline ml-1 text-[--color-warning]" />}
                    </span>
                  </td>
                  <td className="font-medium">{formatPrice(sp.sellPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
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
