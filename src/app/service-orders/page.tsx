"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Download } from "lucide-react";

const orders = [
  { no: "SO-001", customerNo: "C-001", customerName: "Budi Santoso", merkMobil: "Toyota Avanza", platNo: "B 1234 CD", sa: "Rudi", status: "Draft", total: "Rp 2.500.000", date: "26 Jun 2026" },
  { no: "SO-002", customerNo: "C-002", customerName: "PT Maju Jaya", merkMobil: "Honda Civic", platNo: "B 5678 EF", sa: "Ani", status: "Approved", total: "Rp 1.800.000", date: "26 Jun 2026" },
  { no: "SO-003", customerNo: "C-003", customerName: "Siti Rahmawati", merkMobil: "Mitsubishi Pajero", platNo: "B 9012 GH", sa: "Rudi", status: "Approved", total: "Rp 5.200.000", date: "25 Jun 2026" },
  { no: "SO-004", customerNo: "C-004", customerName: "CV Berkah Abadi", merkMobil: "Suzuki Ertiga", platNo: "B 3456 IJ", sa: "Budi", status: "Draft", total: "Rp 3.100.000", date: "25 Jun 2026" },
  { no: "SO-005", customerNo: "C-005", customerName: "Ahmad Fauzi", merkMobil: "Daihatsu Xenia", platNo: "B 7890 KL", sa: "Ani", status: "Cancelled", total: "Rp 950.000", date: "24 Jun 2026" },
  { no: "SO-006", customerNo: "C-006", customerName: "PT Transport Jaya", merkMobil: "Isuzu Elf", platNo: "B 1112 MN", sa: "Budi", status: "Draft", total: "Rp 4.800.000", date: "24 Jun 2026" },
  { no: "SO-007", customerNo: "C-007", customerName: "CV Berkah Abadi", merkMobil: "Mitsubishi L300", platNo: "B 1314 OP", sa: "Rudi", status: "Cancelled", total: "Rp 2.100.000", date: "23 Jun 2026" },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Draft: "pill pill--draft",
    Approved: "pill pill--approved",
    Cancelled: "pill pill--cancelled",
  };
  return map[status] || "pill pill--draft";
};

export default function ServiceOrdersPage() {
  const router = useRouter();

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ClipboardList className="w-6 h-6 text-[--color-brand-secondary]" />
          Service Orders
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm">
            <Download size={14} /> Export
          </button>
          <button
            onClick={() => router.push("/service-orders/new")}
            className="btn btn--brand btn--sm"
          >
            <Plus size={14} /> New Order
          </button>
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>Draft</option>
              <option>Approved</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Service Advisor</label>
            <select className="form-select">
              <option>All SA</option>
              <option>Rudi</option>
              <option>Ani</option>
              <option>Budi</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Dari Tanggal</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Sampai Tanggal</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <div className="flex gap-2">
              <button className="btn btn--brand btn--sm flex-1 justify-center">
                <Search size={14} /> Cari
              </button>
              <button className="btn btn--sm">
                <Filter size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. SO</th>
              <th>Customers</th>
              <th>Merk Mobil</th>
              <th>Service Advisor</th>
              <th>Status</th>
              <th>Total</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr
                key={order.no}
                onClick={() => router.push(`/service-orders/${order.no}`)}
                className="cursor-pointer hover:bg-[#f0f7ff] transition-colors"
              >
                <td className="font-medium text-[--color-brand]">{order.no}</td>
                <td>
                  <div className="font-medium">{order.customerName}</div>
                </td>
                <td>
                  <div className="font-medium">{order.merkMobil}</div>
                  <div className="text-xs text-[--color-text-secondary]">{order.platNo}</div>
                </td>
                <td>{order.sa}</td>
                <td><span className={statusPill(order.status)}>{order.status}</span></td>
                <td className="font-medium">{order.total}</td>
                <td className="text-[--color-text-secondary]">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClipboardList({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24" height="24" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}
    >
      <rect width="8" height="4" x="8" y="2" rx="1" ry="1" />
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <path d="M12 11h4" />
      <path d="M12 16h4" />
      <path d="M8 11h.01" />
      <path d="M8 16h.01" />
    </svg>
  );
}
