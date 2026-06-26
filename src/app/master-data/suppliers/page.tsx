"use client";

import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

const suppliers = [
  { id: "S-001", name: "PT Auto Parts", phone: "021-555-1234", address: "Jl. Raya Bogor No. 123, Jakarta", terms: "Net 30" },
  { id: "S-002", name: "CV Ban Sehat", phone: "022-888-5678", address: "Jl. Soekarno Hatta No. 45, Bandung", terms: "Net 14" },
  { id: "S-003", name: "UD Oli Jaya", phone: "021-777-9012", address: "Jl. Gatot Subroto No. 67, Jakarta", terms: "COD" },
];

export default function SuppliersPage() {
  const router = useRouter();
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <SupplierIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Suppliers
        </div>
        <button
          onClick={() => router.push("/master-data/suppliers/new")}
          className="btn btn--brand btn--sm"
        >
          <Plus size={14} /> Add Supplier
        </button>
      </div>
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
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
              <th>Nama Supplier</th>
              <th>Telepon</th>
              <th>Alamat</th>
              <th>Payment Terms</th>
            </tr>
          </thead>
          <tbody>
            {suppliers.map((s) => (
              <tr key={s.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/master-data/suppliers/${s.id}`)}>
                <td className="font-medium text-[--color-brand]">{s.id}</td>
                <td className="font-medium">{s.name}</td>
                <td>{s.phone}</td>
                <td className="text-[--color-text-secondary]">{s.address}</td>
                <td><span className="pill bg-gray-200 text-gray-700">{s.terms}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function SupplierIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 3h5v5" /><path d="M8 3H3v5" /><path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" /><path d="m15 9 6-6" />
    </svg>
  );
}
