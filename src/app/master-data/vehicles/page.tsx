"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

interface Vehicle {
  id: string;
  plateNo: string;
  brand: string;
  model: string;
  year: string;
  customerId: string;
  customer: { id: string; name: string } | null;
}

export default function VehiclesPage() {
  const router = useRouter();
  const [data, setData] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [brandFilter, setBrandFilter] = useState("All");
  const [search, setSearch] = useState("");

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (brandFilter !== "All") params.set("search", brandFilter);
    if (search) params.set("search", search);
    const qs = params.toString();
    fetch(`/api/vehicles${qs ? "?" + qs : ""}`)
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load vehicles"); setLoading(false); });
  }, [brandFilter, search]);

  const handleClickPlate = (e: React.MouseEvent, plateNo: string) => {
    e.stopPropagation();
    router.push(`/master-data/vehicles/${encodeURIComponent(plateNo)}`);
  };

  const handleClickCustomer = (e: React.MouseEvent, customerId: string) => {
    e.stopPropagation();
    router.push(`/master-data/customers/${customerId}`);
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <CarIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Vehicles
        </div>
        <button
          onClick={() => router.push("/master-data/vehicles/new")}
          className="btn btn--brand btn--sm"
        >
          <Plus size={14} /> Add Vehicle
        </button>
      </div>
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Merk</label>
            <select className="form-select" value={brandFilter} onChange={(e) => setBrandFilter(e.target.value)}>
              <option value="All">All Brands</option>
              <option>Toyota</option>
              <option>Honda</option>
              <option>Mitsubishi</option>
              <option>Suzuki</option>
              <option>Daihatsu</option>
              <option>Isuzu</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Plat Nomor / Nama Customer..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center" onClick={() => {}}>
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
                <th>Plat Nomor</th>
                <th>Merk</th>
                <th>Model</th>
                <th>Tahun</th>
                <th>Customer</th>
              </tr>
            </thead>
            <tbody>
              {data.length === 0 && (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-[--color-text-secondary]">No vehicles found</td>
                </tr>
              )}
              {data.map((v) => (
                <tr key={v.id} className="hover:bg-[#f0f7ff] transition-colors">
                  <td
                    className="font-medium"
                    style={{ color: "#0176d3", cursor: "pointer" }}
                    onClick={(e) => handleClickPlate(e, v.plateNo)}
                  >
                    {v.plateNo}
                  </td>
                  <td className="font-medium">{v.brand}</td>
                  <td>{v.model}</td>
                  <td>{v.year}</td>
                  <td
                    className="font-medium"
                    style={{ color: "#0176d3", cursor: "pointer" }}
                    onClick={(e) => handleClickCustomer(e, v.customerId)}
                  >
                    {v.customer?.name || "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function CarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M19 17h2c.6 0 1-.4 1-1v-3c0-.9-.7-1.7-1.5-1.9C18.7 10.6 16 10 16 10s-1.3-1.4-2.2-2.3c-.5-.4-1.1-.7-1.8-.7H5c-.6 0-1.1.4-1.4.9l-1.4 2.9A3.7 3.7 0 0 0 2 12v4c0 .6.4 1 1 1h2" /><circle cx="7" cy="17" r="2" /><path d="M9 17h6" /><circle cx="17" cy="17" r="2" />
    </svg>
  );
}
