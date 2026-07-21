"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

interface Service {
  id: string;
  sku: string;
  name: string;
  standardPrice: number;
  category: string;
}

export default function ServicesPage() {
  const router = useRouter();
  const [data, setData] = useState<Service[]>([]);
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
    fetch(`/api/services${qs ? "?" + qs : ""}`)
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load services"); setLoading(false); });
  }, [categoryFilter, search]);

  const formatPrice = (price: number) => {
    return "Rp " + (price || 0).toLocaleString("id-ID");
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ServiceIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Service Catalog
        </div>
        <button
          onClick={() => router.push("/master-data/services/new")}
          className="btn btn--brand btn--sm"
        >
          <Plus size={14} /> Add Service
        </button>
      </div>
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Kategori</label>
            <select className="form-select" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
              <option value="All">All Categories</option>
              <option>Perawatan</option>
              <option>Perbaikan</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Nama / Kode Jasa..." value={search} onChange={(e) => setSearch(e.target.value)} />
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
                <th>Nama Jasa</th>
                <th>Kategori</th>
                <th>Harga</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[--color-text-secondary]">No services found</td>
                </tr>
              )}
              {data.map((s) => (
                <tr key={s.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/master-data/services/${s.sku || s.id}`)}>
                  <td className="font-medium text-[--color-brand]">{s.sku}</td>
                  <td className="font-medium">{s.name}</td>
                  <td><span className="pill bg-gray-200 text-gray-700">{s.category}</span></td>
                  <td className="font-medium">{formatPrice(s.standardPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function ServiceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
