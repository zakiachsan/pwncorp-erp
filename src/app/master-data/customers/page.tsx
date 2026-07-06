"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

interface Customer {
  id: string;
  name: string;
  phone: string;
  type: "Retail" | "Wholesale";
  vehicles: number;
  storeTerbanyak: string;
  totalTransaksi: number;
  lastService: string;
}

const customers: Customer[] = [
  { id: "C-001", name: "Budi Santoso", phone: "0812-3456-7890", type: "Retail", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat", totalTransaksi: 12, lastService: "5 Jul 2026" },
  { id: "C-002", name: "PT Maju Jaya", phone: "021-555-1234", type: "Wholesale", vehicles: 3, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Selatan", totalTransaksi: 47, lastService: "4 Jul 2026" },
  { id: "C-003", name: "Siti Rahmawati", phone: "0856-7890-1234", type: "Retail", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Bandung", totalTransaksi: 8, lastService: "3 Jul 2026" },
  { id: "C-004", name: "CV Berkah Abadi", phone: "022-888-5678", type: "Wholesale", vehicles: 2, storeTerbanyak: "Wijaya Motor One Stop Service - Bandung", totalTransaksi: 31, lastService: "3 Jul 2026" },
  { id: "C-005", name: "Ahmad Fauzi", phone: "0878-9012-3456", type: "Retail", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat", totalTransaksi: 5, lastService: "2 Jul 2026" },
  { id: "C-006", name: "PT Transport Jaya", phone: "021-777-9012", type: "Wholesale", vehicles: 5, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat", totalTransaksi: 89, lastService: "1 Jul 2026" },
  { id: "C-007", name: "Dewi Lestari", phone: "0813-4567-8901", type: "Retail", vehicles: 2, storeTerbanyak: "Wijaya Motor One Stop Service - Surabaya", totalTransaksi: 15, lastService: "30 Jun 2026" },
  { id: "C-008", name: "PT Sinar Auto", phone: "031-444-7890", type: "Wholesale", vehicles: 8, storeTerbanyak: "Wijaya Motor One Stop Service - Surabaya", totalTransaksi: 62, lastService: "29 Jun 2026" },
  { id: "C-009", name: "Rudi Hermawan", phone: "0857-1234-5678", type: "Retail", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Selatan", totalTransaksi: 3, lastService: "28 Jun 2026" },
  { id: "C-010", name: "PT Karya Mandiri", phone: "021-333-4567", type: "Wholesale", vehicles: 4, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat", totalTransaksi: 55, lastService: "27 Jun 2026" },
  { id: "C-011", name: "Nina Anggraini", phone: "0822-9876-5432", type: "Retail", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Bandung", totalTransaksi: 6, lastService: "26 Jun 2026" },
  { id: "C-012", name: "Hendra Gunawan", phone: "0819-5555-1111", type: "Retail", vehicles: 1, storeTerbanyak: "Wijaya Motor One Stop Service - Jakarta Pusat", totalTransaksi: 9, lastService: "25 Jun 2026" },
];

export default function CustomersPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState("All");
  const [search, setSearch] = useState("");

  const filtered = customers.filter((c) => {
    const matchType = typeFilter === "All" || c.type === typeFilter;
    const matchSearch = !search || c.name.toLowerCase().includes(search.toLowerCase()) || c.phone.includes(search) || c.id.toLowerCase().includes(search.toLowerCase());
    return matchType && matchSearch;
  });

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
            <button className="btn btn--brand btn--sm flex-1 justify-center" onClick={() => {}}>
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th style={{ width: 80 }}>ID</th>
              <th>Nama Customer</th>
              <th>Telepon</th>
              <th>Tipe</th>
              <th>Kendaraan</th>
              <th>Store Terbanyak</th>
              <th style={{ textAlign: "center" }}>Total Transaksi</th>
              <th>Service Terakhir</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/master-data/customers/${c.id}`)}>
                <td className="font-medium" style={{ color: "#0176d3", whiteSpace: "nowrap" }}>{c.id}</td>
                <td className="font-medium" style={{ color: "#0176d3", cursor: "pointer" }} onClick={(e) => { e.stopPropagation(); router.push(`/master-data/customers/${c.id}`); }}>{c.name}</td>
                <td>{c.phone}</td>
                <td>
                  <span className={`pill ${c.type === "Wholesale" ? "bg-[--color-brand] text-white" : "bg-gray-200 text-gray-700"}`}>
                    {c.type}
                  </span>
                </td>
                <td>{c.vehicles} unit</td>
                <td>{c.storeTerbanyak}</td>
                <td style={{ textAlign: "center", fontWeight: 600 }}>{c.totalTransaksi}</td>
                <td className="text-[--color-text-secondary]">{c.lastService}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
