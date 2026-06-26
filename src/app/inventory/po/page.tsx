"use client";

import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

const purchaseOrders = [
  { no: "PO-004", supplier: "PT Auto Parts", status: "Draft", total: "Rp 3.500.000", date: "26 Jun 2026", items: 15 },
  { no: "PO-001", supplier: "PT Auto Parts", status: "Sent", total: "Rp 4.250.000", date: "25 Jun 2026", items: 12 },
  { no: "PO-002", supplier: "CV Ban Sehat", status: "Partial Received", total: "Rp 2.800.000", date: "24 Jun 2026", items: 8 },
  { no: "PO-003", supplier: "UD Oli Jaya", status: "Received", total: "Rp 1.200.000", date: "22 Jun 2026", items: 5 },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Draft: "pill pill--draft",
    Sent: "pill pill--pending",
    "Partial Received": "pill pill--in-progress",
    Received: "pill pill--completed",
    Cancelled: "pill pill--cancelled",
  };
  return map[status] || "pill pill--draft";
};

export default function PurchaseOrdersPage() {
  const router = useRouter();

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <POIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Purchase Orders
        </div>
        <button
          onClick={() => router.push("/inventory/po/new")}
          className="btn btn--brand btn--sm"
        >
          <Plus size={14} /> New PO
        </button>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>Draft</option>
              <option>Sent</option>
              <option>Partial Received</option>
              <option>Received</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <select className="form-select">
              <option>All Suppliers</option>
              <option>PT Auto Parts</option>
              <option>CV Ban Sehat</option>
              <option>UD Oli Jaya</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. PO / Supplier..." />
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
              <th>No. PO</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Status</th>
              <th>Total</th>
              <th>Tanggal</th>
            </tr>
          </thead>
          <tbody>
            {purchaseOrders.map((po) => (
              <tr
                key={po.no}
                onClick={() => router.push(`/inventory/po/${po.no}`)}
                className="cursor-pointer hover:bg-[#f0f7ff] transition-colors"
              >
                <td className="font-medium text-[--color-brand]">{po.no}</td>
                <td>{po.supplier}</td>
                <td>{po.items} items</td>
                <td><span className={statusPill(po.status)}>{po.status}</span></td>
                <td className="font-medium">{po.total}</td>
                <td className="text-[--color-text-secondary]">{po.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function POIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 3h5v5" />
      <path d="M8 3H3v5" />
      <path d="M12 22v-8.3a4 4 0 0 0-1.172-2.872L3 3" />
      <path d="m15 9 6-6" />
    </svg>
  );
}
