"use client";

import { useRouter } from "next/navigation";
import { Truck, Star, Search, X } from "lucide-react";

const purchaseRequests = [
  { refCode: "PRQ/HO/26010014", date: "14 Jan 2026", dueAt: "21 Jan 2026", warehouse: "Workshop Utama", supplier: "PT Bearing Jaya", status: "PENDING APPROVAL", closed: false, purchaseOrder: "" },
  { refCode: "PRQ/HO/26010015", date: "15 Jan 2026", dueAt: "22 Jan 2026", warehouse: "Workshop Utama", supplier: "PT Suku Cadang Abadi", status: "ORDERED", closed: false, purchaseOrder: "PO/2601/0001" },
  { refCode: "PRQ/HO/26010016", date: "16 Jan 2026", dueAt: "23 Jan 2026", warehouse: "Gudang Utama", supplier: "PT Bearing Jaya", status: "APPROVED", closed: false, purchaseOrder: "" },
  { refCode: "PRQ/HO/26010017", date: "17 Jan 2026", dueAt: "24 Jan 2026", warehouse: "Workshop Utama", supplier: "CV Teknik Mandiri", status: "PENDING APPROVAL", closed: false, purchaseOrder: "" },
  { refCode: "PRQ/HO/26010018", date: "18 Jan 2026", dueAt: "25 Jan 2026", warehouse: "Gudang Utama", supplier: "PT Suku Cadang Abadi", status: "ORDERED", closed: false, purchaseOrder: "PO/2601/0003" },
  { refCode: "PRQ/HO/26010019", date: "19 Jan 2026", dueAt: "26 Jan 2026", warehouse: "Workshop Utama", supplier: "PT Bearing Jaya", status: "APPROVED", closed: true, purchaseOrder: "" },
  { refCode: "PRQ/HO/26010020", date: "20 Jan 2026", dueAt: "27 Jan 2026", warehouse: "Gudang Utama", supplier: "CV Teknik Mandiri", status: "PENDING APPROVAL", closed: false, purchaseOrder: "" },
  { refCode: "PRQ/HO/26010021", date: "21 Jan 2026", dueAt: "28 Jan 2026", warehouse: "Workshop Utama", supplier: "PT Suku Cadang Abadi", status: "ORDERED", closed: false, purchaseOrder: "PO/2601/0005" },
  { refCode: "PRQ/HO/26010022", date: "22 Jan 2026", dueAt: "29 Jan 2026", warehouse: "Gudang Utama", supplier: "PT Bearing Jaya", status: "APPROVED", closed: false, purchaseOrder: "" },
  { refCode: "PRQ/HO/26010023", date: "23 Jan 2026", dueAt: "30 Jan 2026", warehouse: "Workshop Utama", supplier: "CV Teknik Mandiri", status: "PENDING APPROVAL", closed: true, purchaseOrder: "" },
  { refCode: "PRQ/HO/26010024", date: "24 Jan 2026", dueAt: "31 Jan 2026", warehouse: "Gudang Utama", supplier: "PT Suku Cadang Abadi", status: "ORDERED", closed: false, purchaseOrder: "PO/2601/0007" },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    "PENDING APPROVAL": "#f59e0b",
    ORDERED: "#2e844a",
    APPROVED: "#f59e0b",
  };
  return map[status] || "#6b7280";
};

export default function PurchaseRequestListPage() {
  const router = useRouter();
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <Truck className="w-6 h-6 text-[--color-brand-secondary]" />
          Purchase Request
          <Star className="w-4 h-4 text-yellow-400 ml-2" />
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Ref Code</label>
            <input type="text" className="form-input" placeholder="PRQ/HO/..." />
          </div>
          <div className="form-group">
            <label className="form-label">From Date</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">To Date</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            <select className="form-select">
              <option>All Warehouse</option>
              <option>Workshop Utama</option>
              <option>Gudang Utama</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <select className="form-select">
              <option>All Supplier</option>
              <option>PT Bearing Jaya</option>
              <option>PT Suku Cadang Abadi</option>
              <option>CV Teknik Mandiri</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>PENDING APPROVAL</option>
              <option>ORDERED</option>
              <option>APPROVED</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Closed</label>
            <select className="form-select">
              <option>All</option>
              <option>Yes</option>
              <option>No</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Ref Code</th>
              <th>Date</th>
              <th>Due At</th>
              <th>To Warehouse</th>
              <th>From Supplier</th>
              <th>Status</th>
              <th className="text-center">Closed</th>
              <th>Purchase Order</th>
            </tr>
          </thead>
          <tbody>
            {purchaseRequests.map((pr) => (
              <tr key={pr.refCode} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors">
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/warehouse/purchase-request/${pr.refCode}`)}
                >
                  {pr.refCode}
                </td>
                <td className="text-[--color-text-secondary]">{pr.date}</td>
                <td>{pr.dueAt}</td>
                <td>{pr.warehouse}</td>
                <td>{pr.supplier}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: 600,
                      background: statusPill(pr.status),
                      color: "#fff",
                    }}
                  >
                    {pr.status}
                  </span>
                </td>
                <td className="text-center">
                  {pr.closed && <X size={16} className="text-red-500 inline" />}
                </td>
                <td className="text-[--color-text-secondary]">{pr.purchaseOrder}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
