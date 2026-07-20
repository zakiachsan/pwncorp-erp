"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Download } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    RECEIVED: "pill pill--completed",
    CONFIRMED: "pill pill--pending",
    CANCELLED: "pill pill--cancelled",
    PENDING: "pill pill--in-progress",
  };
  return map[status] || "pill pill--draft";
};

export default function StockOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"warehouse" | "serviceOrders" | "workOrders">("warehouse");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/stock-orders?page=1&limit=200")
      .then((r) => r.json())
      .then((json) => {
        const rows = (json.data || []).map((so: any) => ({
          stockOrder: so.orderNo,
          refNo: so.refNo || "-",
          date: so.date || "-",
          dueAt: so.dueAt || "-",
          receivedAt: so.receivedAt || "-",
          store: so.deliverTo || so.store || "-",
          warehouse: so.warehouse || "-",
          status: so.status || "PENDING",
          orderAmt: so.orderAmt ? `Rp ${Number(so.orderAmt).toLocaleString("id-ID")}` : "Rp 0",
          receiveAmt: so.receiveAmt ? `Rp ${Number(so.receiveAmt).toLocaleString("id-ID")}` : "Rp 0",
          user: so.createdBy || so.user || "-",
          woNo: so.wo?.woNo || null,
          serviceOrder: so.so?.serviceOrderNo || null,
          itemCount: so._count?.items || 0,
        }));
        setData(rows);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load stock orders"); setLoading(false); });
  }, []);

  const currentData = activeTab === "warehouse"
    ? data
    : activeTab === "serviceOrders"
      ? data.filter((r) => r.serviceOrder)
      : data.filter((r) => r.woNo);

  if (loading) {
    return (
      <div>
        <div className="view-header">
          <div className="view-title">
            <PackageIcon className="w-6 h-6 text-[--color-brand-secondary]" />
            Stock Orders
          </div>
        </div>
        <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <div className="view-header">
          <div className="view-title">
            <PackageIcon className="w-6 h-6 text-[--color-brand-secondary]" />
            Stock Orders
          </div>
        </div>
        <div className="p-8 text-center text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <PackageIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Stock Orders
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-4 bg-[#ecebea] rounded-lg p-0.5 w-fit">
        {([
          { key: "warehouse", label: "Warehouse" },
          { key: "serviceOrders", label: "Service Orders" },
          { key: "workOrders", label: "Work Orders" },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === t.key
                ? "bg-[#0176d3] text-white"
                : "bg-transparent text-[#444746] hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="form-group">
            <label className="form-label">Stock Order</label>
            <input type="text" className="form-input" placeholder="No. Stock Order..." />
          </div>
          {activeTab === "serviceOrders" && (
            <div className="form-group">
              <label className="form-label">Service Order</label>
              <input type="text" className="form-input" placeholder="No. Service Order..." />
            </div>
          )}
          {activeTab === "workOrders" && (
            <div className="form-group">
              <label className="form-label">Work Order</label>
              <input type="text" className="form-input" placeholder="No. Work Order..." />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Store</label>
            <select className="form-select">
              <option>All Stores</option>
              <option>PT Putra Wijaya Motor</option>
              <option>PT Putro Joyo Motor</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            <select className="form-select">
              <option>All Warehouses</option>
              <option>Gudang Wijaya</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>RECEIVED</option>
              <option>CONFIRMED</option>
              <option>CANCELLED</option>
              <option>PENDING</option>
            </select>
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
            <label className="form-label">&nbsp;</label>
            <div className="flex gap-2">
              <button className="btn btn--brand btn--sm flex-1 justify-center">
                <Search size={14} /> Cari
              </button>
              <button className="btn btn--sm">
                <FilterIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Stock Order</th>
              {activeTab === "serviceOrders" && <th>Service Order</th>}
              {activeTab === "workOrders" && <th>Work Order</th>}
              {activeTab === "warehouse" && <th>Reference No</th>}
              <th>Date</th>
              <th>Due At</th>
              <th>Received At</th>
              <th>Store</th>
              <th>Warehouse</th>
              <th>Status</th>
              <th>Order Amount</th>
              <th>Receive Amount</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {currentData.length === 0 && (
              <tr>
                <td colSpan={activeTab === "warehouse" ? 13 : 14} className="text-center py-8 text-[--color-text-secondary]">
                  No stock orders found
                </td>
              </tr>
            )}
            {currentData.map((row, i) => (
              <tr key={i}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/stock-workflow/stock-orders/${row.stockOrder}`)}
                >{row.stockOrder}</td>
                {activeTab === "serviceOrders" && (
                  <td
                    className="font-medium cursor-pointer"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(`/service-orders/${encodeURIComponent(row.serviceOrder)}`)}
                  >{row.serviceOrder}</td>
                )}
                {activeTab === "workOrders" && (
                  <td
                    className="font-medium cursor-pointer"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(`/work-orders/${encodeURIComponent(row.woNo)}`)}
                  >{row.woNo}</td>
                )}
                {activeTab === "warehouse" && <td>{row.refNo}</td>}
                <td className="text-[--color-text-secondary]">{row.date}</td>
                <td className="text-[--color-text-secondary]">{row.dueAt}</td>
                <td className="text-[--color-text-secondary]">{row.receivedAt}</td>
                <td>{row.store}</td>
                <td>{row.warehouse}</td>
                <td><span className={statusPill(row.status)}>{row.status}</span></td>
                <td className="font-medium">{row.orderAmt}</td>
                <td className="font-medium">{row.receiveAmt}</td>
                <td className="font-medium">{row.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
      <path d="m7.5 4.27 9 5.15" />
    </svg>
  );
}

function FilterIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
