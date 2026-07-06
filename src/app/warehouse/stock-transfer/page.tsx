"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Star, ArrowUpDown } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const transfers = [
  {
    refCode: "WTF/WJY/25050004",
    date: "04 May 2025",
    approvedAt: "05 May 2025 10:30 AM",
    from: "Gudang Wijaya",
    to: "Gudang PJ Motor",
    status: "RECEIVED",
    user: "Nanda Salsa",
  },
  {
    refCode: "WTF/WJY/25050005",
    date: "08 May 2025",
    approvedAt: "09 May 2025 11:15 AM",
    from: "Gudang Wijaya",
    to: "Gudang PJ Motor",
    status: "RECEIVED",
    user: "Rizky Pratama",
  },
  {
    refCode: "WJY/WJY/25050006",
    date: "15 May 2025",
    approvedAt: "16 May 2025 09:45 AM",
    from: "Gudang Wijaya",
    to: "Gudang PJ Motor",
    status: "RECEIVED",
    user: "Nanda Salsa",
  },
  {
    refCode: "WJY/WJY/25050007",
    date: "22 May 2025",
    approvedAt: "23 May 2025 02:00 PM",
    from: "Gudang Wijaya",
    to: "Gudang PJ Motor",
    status: "RECEIVED",
    user: "Andi Kurniawan",
  },
];

export default function StockTransferPage() {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <ArrowUpDown className="w-6 h-6 text-[--color-brand-secondary]" />
          Warehouse Stock Transfers
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="form-group">
            <label className="form-label">Ref Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="WTF/WJY/..."
            />
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
            <label className="form-label">From (Warehouse)</label>
            <select className="form-select">
              <option>All Warehouse</option>
              <option>Gudang Wijaya</option>
              <option>Gudang PJ Motor</option>
              <option>Gudang Sparepart</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">To (Warehouse)</label>
            <select className="form-select">
              <option>All Warehouse</option>
              <option>Gudang Wijaya</option>
              <option>Gudang PJ Motor</option>
              <option>Gudang Sparepart</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>DRAFT</option>
              <option>CONFIRMED</option>
              <option>APPROVED</option>
              <option>SENT FROM WAREHOUSE</option>
              <option>RECEIVED IN DESTINATION</option>
            </select>
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
              <th>Ref.Code</th>
              <th>
                <span
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                  }}
                >
                  Date <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                </span>
              </th>
              <th>Approved At</th>
              <th>From</th>
              <th>To</th>
              <th>Status</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.refCode}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() =>
                    router.push(`/warehouse/stock-transfer/${t.refCode}`)
                  }
                >
                  {t.refCode}
                </td>
                <td className="text-[--color-text-secondary]">{t.date}</td>
                <td className="text-[--color-text-secondary]">
                  {t.approvedAt}
                </td>
                <td>{t.from}</td>
                <td>{t.to}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#fff",
                      background:
                        t.status === "RECEIVED" ? "#2e844a" : "#6b7280",
                    }}
                  >
                    {t.status}
                  </span>
                </td>
                <td>{t.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
