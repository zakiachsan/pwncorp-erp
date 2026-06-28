"use client";

import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

const vehicles = [
  { plate: "B 1234 CD", brand: "Toyota", model: "Avanza", year: "2022", color: "Silver", customer: "Budi Santoso" },
  { plate: "B 5678 EF", brand: "Honda", model: "Civic", year: "2021", color: "Hitam", customer: "PT Maju Jaya" },
  { plate: "B 9012 GH", brand: "Mitsubishi", model: "Pajero", year: "2020", color: "Putih", customer: "Siti Rahmawati" },
  { plate: "B 3456 IJ", brand: "Suzuki", model: "Ertiga", year: "2022", color: "Silver", customer: "CV Berkah Abadi" },
  { plate: "B 7890 KL", brand: "Daihatsu", model: "Xenia", year: "2021", color: "Merah", customer: "Ahmad Fauzi" },
  { plate: "B 1112 MN", brand: "Isuzu", model: "Elf", year: "2019", color: "Biru", customer: "PT Transport Jaya" },
  { plate: "B 1314 OP", brand: "Mitsubishi", model: "L300", year: "2020", color: "Putih", customer: "CV Berkah Abadi" },
];

export default function VehiclesPage() {
  const router = useRouter();
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
            <select className="form-select">
              <option>All Brands</option>
              <option>Toyota</option>
              <option>Honda</option>
              <option>Mitsubishi</option>
              <option>Suzuki</option>
              <option>Daihatsu</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Plat Nomor / Nama Customer..." />
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
              <th>Plat Nomor</th>
              <th>Merk</th>
              <th>Model</th>
              <th>Tahun</th>
              <th>Warna</th>
              <th>Customer</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((v) => (
              <tr key={v.plate} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/master-data/vehicles/${v.plate}`)}>
                <td className="font-medium text-[--color-brand]">{v.plate}</td>
                <td className="font-medium">{v.brand}</td>
                <td>{v.model}</td>
                <td>{v.year}</td>
                <td>{v.color}</td>
                <td className="text-[--color-text-secondary]">{v.customer}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
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
