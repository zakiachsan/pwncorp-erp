"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Truck, Star, Search, X } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

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
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  useEffect(() => {
    fetch("/api/purchase-requests")
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <Truck className="w-6 h-6 text-[--color-brand-secondary]" />
          Purchase Request
          <Star className="w-4 h-4 text-yellow-400 ml-2" />
        </div>
        <button onClick={() => router.push("/warehouse/purchase-request/new")} className="btn btn--brand btn--sm">
          + Add
        </button>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Ref Code</label>
            <input type="text" className="form-input" placeholder="PRQ/HO/..." />
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
            {data.map((pr) => (
              <tr key={pr.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors">
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/warehouse/purchase-request/${pr.prNo}`)}
                >
                  {pr.prNo}
                </td>
                <td className="text-[--color-text-secondary]">{pr.date ? new Date(pr.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                <td>-</td>
                <td>-</td>
                <td>-</td>
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
                <td className="text-[--color-text-secondary]">{pr.purchaseOrder || ""}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
