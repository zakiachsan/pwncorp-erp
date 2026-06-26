"use client";

import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

const customers = [
  { id: "C-001", name: "Budi Santoso", phone: "0812-3456-7890", type: "Retail", vehicles: 1, lastService: "26 Jun 2026" },
  { id: "C-002", name: "PT Maju Jaya", phone: "021-555-1234", type: "Wholesale", vehicles: 3, lastService: "26 Jun 2026" },
  { id: "C-003", name: "Siti Rahmawati", phone: "0856-7890-1234", type: "Retail", vehicles: 1, lastService: "25 Jun 2026" },
  { id: "C-004", name: "CV Berkah Abadi", phone: "022-888-5678", type: "Wholesale", vehicles: 2, lastService: "24 Jun 2026" },
  { id: "C-005", name: "Ahmad Fauzi", phone: "0878-9012-3456", type: "Retail", vehicles: 1, lastService: "24 Jun 2026" },
  { id: "C-006", name: "PT Transport Jaya", phone: "021-777-9012", type: "Wholesale", vehicles: 5, lastService: "23 Jun 2026" },
];

export default function CustomersPage() {
  const router = useRouter();
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <UsersIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Customers
        </div>
        <button className="btn btn--brand btn--sm">
          <Plus size={14} /> Add Customer
        </button>
      </div>
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Tipe</label>
            <select className="form-select">
              <option>All Types</option>
              <option>Retail</option>
              <option>Wholesale</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Nama / No. Telp..." />
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
              <th>ID</th>
              <th>Nama Customer</th>
              <th>Telepon</th>
              <th>Tipe</th>
              <th>Kendaraan</th>
              <th>Service Terakhir</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/master-data/customers/${c.id}`)}>
                <td className="font-medium text-[--color-brand]">{c.id}</td>
                <td className="font-medium">{c.name}</td>
                <td>{c.phone}</td>
                <td>
                  <span className={`pill ${c.type === "Wholesale" ? "bg-[--color-brand] text-white" : "bg-gray-200 text-gray-700"}`}>
                    {c.type}
                  </span>
                </td>
                <td>{c.vehicles} unit</td>
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
