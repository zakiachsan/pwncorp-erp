"use client";

import { Search } from "lucide-react";

const customers = [
  { id: 1, name: "Budi Santoso", phone: "0812-3456-7890", vehicle: "Toyota Avanza", type: "Retail", lastService: "25 Jun 2026" },
  { id: 2, name: "PT Maju Jaya", phone: "021-555-1234", vehicle: "Isuzu Elf", type: "Wholesale", lastService: "24 Jun 2026" },
  { id: 3, name: "Siti Rahmawati", phone: "0856-7890-1234", vehicle: "Honda Civic", type: "Retail", lastService: "23 Jun 2026" },
  { id: 4, name: "CV Berkah Abadi", phone: "022-888-5678", vehicle: "Mitsubishi L300", type: "Wholesale", lastService: "22 Jun 2026" },
  { id: 5, name: "Ahmad Fauzi", phone: "0878-9012-3456", vehicle: "Suzuki Ertiga", type: "Retail", lastService: "21 Jun 2026" },
];

const tabs = ["Customers", "Vehicles", "Suppliers", "Sparepart Catalog", "Service Catalog", "Users"];

export default function MasterDataPage() {
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <DatabaseIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Master Data
        </div>
        <button className="btn btn--brand btn--sm">+ Add Customer</button>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-[--color-border-light] mb-4 gap-0 overflow-x-auto">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            className={`px-4 py-3 text-sm whitespace-nowrap border-b-2 transition-colors ${
              i === 0
                ? "text-[--color-brand] border-[--color-brand] font-semibold"
                : "text-[--color-text-secondary] border-transparent hover:text-[--color-brand]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="form-label">Tipe Customer</label>
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

      {/* Customers Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nama Customer</th>
              <th>Telepon</th>
              <th>Kendaraan</th>
              <th>Type</th>
              <th>Service Terakhir</th>
              <th className="text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {customers.map((c) => (
              <tr key={c.id}>
                <td className="text-[--color-text-secondary]">{c.id}</td>
                <td className="font-medium">{c.name}</td>
                <td>{c.phone}</td>
                <td>{c.vehicle}</td>
                <td>
                  <span className={`pill ${c.type === "Wholesale" ? "bg-[--color-brand] text-white" : "bg-gray-200 text-gray-700"}`}>
                    {c.type}
                  </span>
                </td>
                <td className="text-[--color-text-secondary]">{c.lastService}</td>
                <td className="text-center">
                  <button className="btn btn--sm btn--link">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function DatabaseIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <ellipse cx="12" cy="5" rx="9" ry="3" />
      <path d="M3 5v14c0 1.66 4.03 3 9 3s9-1.34 9-3V5" />
      <path d="M3 12c0 1.66 4.03 3 9 3s9-1.34 9-3" />
    </svg>
  );
}
