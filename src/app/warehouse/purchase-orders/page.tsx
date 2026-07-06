"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Truck, Star, Search, CheckCircle, XCircle } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    RECEIVED: "pill pill--completed",
    DRAFT: "pill pill--draft",
  };
  return map[status] || "pill pill--draft";
};

const poData = [
  { refCode: "PO/HO/26060042", refNo: "PO-2026-042", date: "25 Jun 2026", dueAt: "30 Jun 2026", warehouse: "Gudang Utama", supplier: "PT Auto Parts Sejahtera", status: "DRAFT", amount: 2850000, closed: false, backdate: false, deliveries: 0, invoices: 0, returns: 0 },
  { refCode: "PO/HO/26060041", refNo: "PO-2026-041", date: "24 Jun 2026", dueAt: "29 Jun 2026", warehouse: "Gudang Utama", supplier: "CV Suku Cadang Jaya", status: "RECEIVED", amount: 12500000, closed: true, backdate: false, deliveries: 2, invoices: 1, returns: 0 },
  { refCode: "PO/HO/26060040", refNo: "PO-2026-040", date: "23 Jun 2026", dueAt: "28 Jun 2026", warehouse: "Gudang Pusat", supplier: "UD Sparepart Berkah", status: "RECEIVED", amount: 4375000, closed: true, backdate: false, deliveries: 1, invoices: 1, returns: 0 },
  { refCode: "PO/HO/26060039", refNo: "PO-2026-039", date: "22 Jun 2026", dueAt: "27 Jun 2026", warehouse: "Gudang Utama", supplier: "PT Maju Motor Indonesia", status: "RECEIVED", amount: 8920000, closed: true, backdate: true, deliveries: 3, invoices: 2, returns: 1 },
  { refCode: "PO/HO/26060038", refNo: "PO-2026-038", date: "21 Jun 2026", dueAt: "26 Jun 2026", warehouse: "Gudang Timur", supplier: "CV Ban Jaya Abadi", status: "DRAFT", amount: 5600000, closed: false, backdate: false, deliveries: 0, invoices: 0, returns: 0 },
  { refCode: "PO/HO/26060037", refNo: "PO-2026-037", date: "20 Jun 2026", dueAt: "25 Jun 2026", warehouse: "Gudang Utama", supplier: "PT Auto Parts Sejahtera", status: "RECEIVED", amount: 3150000, closed: true, backdate: false, deliveries: 1, invoices: 1, returns: 0 },
  { refCode: "PO/HO/26060036", refNo: "PO-2026-036", date: "19 Jun 2026", dueAt: "24 Jun 2026", warehouse: "Gudang Pusat", supplier: "UD Sparepart Berkah", status: "RECEIVED", amount: 15780000, closed: true, backdate: true, deliveries: 4, invoices: 3, returns: 0 },
  { refCode: "PO/HO/26060035", refNo: "PO-2026-035", date: "18 Jun 2026", dueAt: "23 Jun 2026", warehouse: "Gudang Utama", supplier: "CV Suku Cadang Jaya", status: "DRAFT", amount: 7400000, closed: false, backdate: false, deliveries: 0, invoices: 0, returns: 0 },
  { refCode: "PO/HO/26060034", refNo: "PO-2026-034", date: "17 Jun 2026", dueAt: "22 Jun 2026", warehouse: "Gudang Timur", supplier: "PT Maju Motor Indonesia", status: "RECEIVED", amount: 2100000, closed: true, backdate: false, deliveries: 1, invoices: 1, returns: 0 },
  { refCode: "PO/HO/26060033", refNo: "PO-2026-033", date: "16 Jun 2026", dueAt: "21 Jun 2026", warehouse: "Gudang Utama", supplier: "CV Ban Jaya Abadi", status: "RECEIVED", amount: 9650000, closed: true, backdate: false, deliveries: 2, invoices: 2, returns: 1 },
  { refCode: "PO/HO/26060032", refNo: "PO-2026-032", date: "15 Jun 2026", dueAt: "20 Jun 2026", warehouse: "Gudang Pusat", supplier: "PT Auto Parts Sejahtera", status: "DRAFT", amount: 4800000, closed: false, backdate: false, deliveries: 0, invoices: 0, returns: 0 },
  { refCode: "PO/HO/26060031", refNo: "PO-2026-031", date: "14 Jun 2026", dueAt: "19 Jun 2026", warehouse: "Gudang Utama", supplier: "UD Sparepart Berkah", status: "RECEIVED", amount: 6320000, closed: true, backdate: false, deliveries: 1, invoices: 1, returns: 0 },
  { refCode: "PO/HO/26060030", refNo: "PO-2026-030", date: "13 Jun 2026", dueAt: "18 Jun 2026", warehouse: "Gudang Timur", supplier: "CV Suku Cadang Jaya", status: "RECEIVED", amount: 11250000, closed: true, backdate: true, deliveries: 3, invoices: 2, returns: 0 },
];

const formatIDR = (n: number) => {
  if (n === 0) return "Rp 0";
  return "Rp " + n.toLocaleString("id-ID");
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"standard">("standard");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <Truck className="w-6 h-6 text-[--color-brand-secondary]" />
          Purchase Order
          <Star className="w-5 h-5 text-yellow-400 ml-2" />
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Ref Code</label>
            <input type="text" className="form-input" placeholder="Ref Code..." />
          </div>
          <div className="form-group">
            <label className="form-label">Reference No</label>
            <input type="text" className="form-input" placeholder="Reference No..." />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            <select className="form-select">
              <option>All Warehouses</option>
              <option>Gudang Utama</option>
              <option>Gudang Pusat</option>
              <option>Gudang Timur</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <select className="form-select">
              <option>All Suppliers</option>
              <option>PT Auto Parts Sejahtera</option>
              <option>CV Suku Cadang Jaya</option>
              <option>UD Sparepart Berkah</option>
              <option>PT Maju Motor Indonesia</option>
              <option>CV Ban Jaya Abadi</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>DRAFT</option>
              <option>RECEIVED</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm w-full justify-center">
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
              <th>Reference No</th>
              <th>Date</th>
              <th>Due At</th>
              <th>Warehouse</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Amount</th>
              <th>Closed</th>
              <th>Backdate</th>
              <th>Deliveries</th>
              <th>Invoices</th>
              <th>Returns</th>
            </tr>
          </thead>
          <tbody>
            {poData.map((row) => (
              <tr key={row.refCode}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/warehouse/purchase-orders/${row.refCode}`)}
                >
                  {row.refCode}
                </td>
                <td>{row.refNo}</td>
                <td className="text-[--color-text-secondary]">{row.date}</td>
                <td className="text-[--color-text-secondary]">{row.dueAt}</td>
                <td>{row.warehouse}</td>
                <td>{row.supplier}</td>
                <td>
                  <span className={statusPill(row.status)}>{row.status}</span>
                </td>
                <td className="font-medium">{formatIDR(row.amount)}</td>
                <td className="text-center">
                  {row.closed ? (
                    <CheckCircle size={16} className="text-[--color-success] mx-auto" />
                  ) : (
                    <XCircle size={16} className="text-[--color-error] mx-auto" />
                  )}
                </td>
                <td className="text-center">
                  {row.backdate ? (
                    <CheckCircle size={16} className="text-[--color-success] mx-auto" />
                  ) : (
                    <XCircle size={16} className="text-[--color-error] mx-auto" />
                  )}
                </td>
                <td className="text-center">
                  {row.deliveries > 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[--color-brand] text-white text-xs font-semibold">
                      {row.deliveries}
                    </span>
                  ) : (
                    <span className="text-[--color-text-secondary]">0</span>
                  )}
                </td>
                <td className="text-center text-[--color-text-secondary]">{row.invoices}</td>
                <td className="text-center text-[--color-text-secondary]">{row.returns}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
