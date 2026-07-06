"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { CheckCircle, Star, ArrowUpDown, Search } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const stockOpname = [
  { refCode: "WST/WJY/26060001", date: "01 Jun 2026", completedAt: "02 Jun 2026 10:30 AM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060002", date: "03 Jun 2026", completedAt: "04 Jun 2026 11:15 AM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060003", date: "05 Jun 2026", completedAt: "06 Jun 2026 09:45 AM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060004", date: "07 Jun 2026", completedAt: "08 Jun 2026 13:00 PM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060005", date: "09 Jun 2026", completedAt: "10 Jun 2026 14:30 PM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060006", date: "11 Jun 2026", completedAt: "12 Jun 2026 08:15 AM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060007", date: "13 Jun 2026", completedAt: "14 Jun 2026 10:00 AM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060008", date: "15 Jun 2026", completedAt: "16 Jun 2026 11:45 AM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060009", date: "17 Jun 2026", completedAt: "18 Jun 2026 09:30 AM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060010", date: "19 Jun 2026", completedAt: "20 Jun 2026 15:00 PM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060011", date: "21 Jun 2026", completedAt: "22 Jun 2026 10:15 AM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060012", date: "23 Jun 2026", completedAt: "24 Jun 2026 08:45 AM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060013", date: "24 Jun 2026", completedAt: "25 Jun 2026 12:30 PM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060014", date: "25 Jun 2026", completedAt: "26 Jun 2026 14:15 PM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
  { refCode: "WST/WJY/26060086", date: "27 Jun 2026", completedAt: "28 Jun 2026 09:00 AM", warehouse: "Gudang Wijaya", notes: "adjusment stock", status: "APPROVED", user: "ANGGA NOVIANTO" },
];

export default function StockOpnamePage() {
  const router = useRouter();
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <CheckCircle className="w-6 h-6 text-[#2e844a]" />
          Warehouse Stock Opname
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="form-group">
            <label className="form-label">Ref Code</label>
            <input
              type="text"
              className="form-input"
              placeholder="WST/WJY/..."
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
            <label className="form-label">Warehouse</label>
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
              <option>COMPLETED</option>
              <option>APPROVED</option>
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
              <th>Ref. Code</th>
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
              <th>Completed At</th>
              <th>Warehouse</th>
              <th>Notes</th>
              <th>Status</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {stockOpname.map((s) => (
              <tr key={s.refCode}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() =>
                    router.push(`/warehouse/stock-opname/${s.refCode}`)
                  }
                >
                  {s.refCode}
                </td>
                <td className="text-[--color-text-secondary]">{s.date}</td>
                <td className="text-[--color-text-secondary]">{s.completedAt}</td>
                <td>{s.warehouse}</td>
                <td>{s.notes}</td>
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
                        s.status === "APPROVED" ? "#2e844a" : "#6b7280",
                    }}
                  >
                    {s.status}
                  </span>
                </td>
                <td>{s.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
