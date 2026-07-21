"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

interface Customer {
  id: string;
  code?: string;
  name: string;
  phone: string;
  type: string;
  vehicles: number;
}

export default function CustomersPage() {
  const router = useRouter();
  const [data, setData] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (typeFilter !== "All") params.set("type", typeFilter);
    if (search) params.set("search", search);
    const qs = params.toString();
    fetch(`/api/customers${qs ? "?" + qs : ""}`)
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load customers"); setLoading(false); });
  }, [typeFilter, search]);

  const handleSearch = () => {
    // trigger re-fetch via state change — already wired via useEffect deps
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <UsersIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Customers
        </div>
        <button className="btn btn--brand btn--sm" onClick={() => router.push("/master-data/customers/new")}>
          <Plus size={14} /> Add Customer
        </button>
      </div>
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Tipe</label>
            <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
              <option value="All">All Types</option>
              <option value="Retail">Retail</option>
              <option value="Wholesale">Wholesale</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Nama / No. Telp / ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center" onClick={handleSearch}>
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
                <th>Nama Customer</th>
                <th>Telepon</th>
                <th>Tipe</th>
                <th>Kendaraan</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-[--color-text-secondary]">No customers found</td>
                </tr>
              )}
              {data.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/master-data/customers/${c.id}`)}>
              <td className="font-medium" style={{ color: "#0176d3", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); router.push(`/master-data/customers/${c.id}`); }}>{c.name}</td>
                  <td>{c.phone}</td>
                  <td>
                    <span className={`pill ${c.type === "Wholesale" ? "bg-[--color-brand] text-white" : "bg-gray-200 text-gray-700"}`}>
                      {c.type}
                    </span>
                  </td>
                  <td>{c.vehicles} unit</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
