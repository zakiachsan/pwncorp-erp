"use client";

import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

const wos = [
  { no: "SWO/006/26060155", so: "SRO/006/26060155", customerName: "PT Transport Jaya", merkMobil: "Isuzu Elf", platNo: "B 1112 MN", mekanik: "Bambang", status: "In Progress", start: "25 Jun 2026", target: "27 Jun 2026", hasInvoice: false },
  { no: "SWO/005/26060154", so: "SRO/005/26060154", customerName: "Ahmad Fauzi", merkMobil: "Daihatsu Xenia", platNo: "B 7890 KL", mekanik: "Agus", status: "Draft", start: "26 Jun 2026", target: "28 Jun 2026", hasInvoice: false },
  { no: "SWO/004/26060153", so: "SRO/004/26060153", customerName: "CV Berkah Abadi", merkMobil: "Suzuki Ertiga", platNo: "B 3456 IJ", mekanik: "Bambang", status: "Completed", start: "24 Jun 2026", target: "25 Jun 2026", hasInvoice: true },
  { no: "SWO/003/26060152", so: "SRO/003/26060152", customerName: "Siti Rahmawati", merkMobil: "Mitsubishi Pajero", platNo: "B 9012 GH", mekanik: "Hendra", status: "QC", start: "25 Jun 2026", target: "26 Jun 2026", hasInvoice: false },
  { no: "SWO/002/26060151", so: "SRO/002/26060150", customerName: "PT Maju Jaya", merkMobil: "Honda Civic", platNo: "B 5678 EF", mekanik: "Agus", status: "Waiting Stock", start: "26 Jun 2026", target: "28 Jun 2026", hasInvoice: true },
  { no: "SWO/001/26060149", so: "SRO/001/26060149", customerName: "Budi Santoso", merkMobil: "Toyota Avanza", platNo: "B 1234 CD", mekanik: "Hendra", status: "In Progress", start: "26 Jun 2026", target: "27 Jun 2026", hasInvoice: false },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Draft: "pill pill--draft",
    "Waiting Stock": "pill pill--waiting",
    "In Progress": "pill pill--in-progress",
    QC: "pill pill--waiting",
    Completed: "pill pill--completed",
    Cancelled: "pill pill--cancelled",
  };
  return map[status] || "pill pill--draft";
};

export default function WorkOrdersPage() {
  const router = useRouter();

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <WrenchIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Work Orders
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>Draft</option>
              <option>Waiting Stock</option>
              <option>In Progress</option>
              <option>QC</option>
              <option>Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Mekanik</label>
            <select className="form-select">
              <option>All Mekanik</option>
              <option>Hendra</option>
              <option>Agus</option>
              <option>Bambang</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Invoice</label>
            <select className="form-select">
              <option>All</option>
              <option>Sudah dibuat</option>
              <option>Belum dibuat</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. WO / Customer..." />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. SWO</th>
              <th>Customers</th>
              <th>Vehicle No</th>
              <th>Mekanik</th>
              <th>Status</th>
              <th>Mulai</th>
              <th>Target</th>
              <th>No. SRO</th>
              <th>Linked Docs</th>
            </tr>
          </thead>
          <tbody>
            {wos.map((wo) => (
              <tr key={wo.no}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/work-orders/${wo.no}`)}
                >{wo.no}</td>
                <td>
                  <div className="font-medium">{wo.customerName}</div>
                </td>
                <td
                  className="cursor-pointer"
                  onClick={(e) => { e.stopPropagation(); router.push(`/master-data/vehicles/${encodeURIComponent(wo.platNo)}`); }}
                >
                  <div className="font-medium" style={{ color: "var(--color-brand)" }}>{wo.platNo}</div>
                  <div className="text-xs text-[--color-text-secondary]">{wo.merkMobil}</div>
                </td>
                <td>{wo.mekanik}</td>
                <td><span className={statusPill(wo.status)}>{wo.status}</span></td>
                <td className="text-[--color-text-secondary]">{wo.start}</td>
                <td className="text-[--color-text-secondary]">{wo.target}</td>
                <td
                  className="cursor-pointer"
                  style={{ color: "var(--color-brand)", fontWeight: 500 }}
                  onClick={() => router.push(`/service-orders/${wo.so}`)}
                >{wo.so}</td>
                <td>
                  <span
                    title={wo.hasInvoice ? "Invoice sudah dibuat" : "Belum ada Invoice"}
                    style={{
                      display: "inline-flex", alignItems: "center", justifyContent: "center",
                      width: 22, height: 22, borderRadius: 4, fontSize: 11, fontWeight: 700,
                      background: wo.hasInvoice ? "#0176d3" : "#d8d8d8",
                      color: wo.hasInvoice ? "#fff" : "#8e8f8e",
                    }}
                  >INV</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WrenchIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
