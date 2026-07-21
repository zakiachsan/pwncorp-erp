"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Truck, Star, Search, CheckCircle, XCircle } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    RECEIVED: "pill pill--completed",
    DRAFT: "pill pill--draft",
  };
  return map[status] || "pill pill--draft";
};

const formatIDR = (n: number) => {
  if (n === 0) return "Rp 0";
  return "Rp " + n.toLocaleString("id-ID");
};

export default function PurchaseOrdersPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"standard">("standard");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  useEffect(() => {
    fetch("/api/purchase-orders")
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <Truck className="w-6 h-6 text-[--color-brand-secondary]" />
          Purchase Order
          <Star className="w-5 h-5 text-yellow-400 ml-2" />
        </div>
        <button onClick={() => router.push("/warehouse/purchase-orders/new")} className="btn btn--brand btn--sm">
          + Add
        </button>
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
            {data.map((row) => (
              <tr key={row.id}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/warehouse/purchase-orders/${row.poNo}`)}
                >
                  {row.poNo}
                </td>
                <td>{row.poNo}</td>
                <td className="text-[--color-text-secondary]">{row.date ? new Date(row.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                <td className="text-[--color-text-secondary]">-</td>
                <td>-</td>
                <td>{row.supplier?.companyName || "-"}</td>
                <td>
                  <span className={statusPill(row.status)}>{row.status}</span>
                </td>
                <td className="font-medium">{formatIDR(row.total || 0)}</td>
                <td className="text-center">
                  {row.status === "RECEIVED" ? (
                    <CheckCircle size={16} className="text-[--color-success] mx-auto" />
                  ) : (
                    <XCircle size={16} className="text-[--color-error] mx-auto" />
                  )}
                </td>
                <td className="text-center">
                  <XCircle size={16} className="text-[--color-error] mx-auto" />
                </td>
                <td className="text-center">
                  {row._count?.deliveries > 0 ? (
                    <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-[--color-brand] text-white text-xs font-semibold">
                      {row._count.deliveries}
                    </span>
                  ) : (
                    <span className="text-[--color-text-secondary]">0</span>
                  )}
                </td>
                <td className="text-center text-[--color-text-secondary]">{row._count?.invoices || 0}</td>
                <td className="text-center text-[--color-text-secondary]">0</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
