"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Filter, Download } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

interface ServiceOrder {
  id: string;
  soNo: string;
  customer: { name: string; id: string };
  vehicle: { plateNo: string; brand: string; model: string };
  sa: { name: string } | null;
  store: { name: string };
  status: string;
  total: number;
  createdAt: string;
  _count?: { workOrders: number; invoices: number };
}

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Draft: "pill pill--draft",
    Delivered: "pill pill--delivered",
    Approved: "pill pill--approved",
    Cancelled: "pill pill--cancelled",
    "In Progress": "pill pill--in-progress",
    Completed: "pill pill--completed",
  };
  return map[status] || "pill pill--draft";
};

function fmt(n: number): string {
  return `Rp ${(n || 0).toLocaleString("id-ID")}`;
}

function fmtDate(d: string): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function ServiceOrdersPage() {
  const router = useRouter();
  const [orders, setOrders] = useState<ServiceOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  const fetchOrders = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    fetch(`/api/service-orders?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setOrders(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data service orders");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const filtered = orders.filter((o) => {
    const matchStatus = !statusFilter || o.status === statusFilter;
    const matchSearch =
      !search ||
      o.soNo.toLowerCase().includes(search.toLowerCase()) ||
      o.customer?.name?.toLowerCase().includes(search.toLowerCase()) ||
      o.vehicle?.plateNo?.toLowerCase().includes(search.toLowerCase());
    return matchStatus && matchSearch;
  });

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-6 gap-3">
          <div className="form-group">
            <label className="form-label">Status</label>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Draft">Draft</option>
              <option value="Approved">Approved</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
              <option value="Delivered">Delivered</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Store</label>
            <select className="form-select">
              <option>All Stores</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Work Order</label>
            <select className="form-select">
              <option>All</option>
              <option>Sudah dibuat</option>
              <option>Belum dibuat</option>
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
            <label className="form-label">Service Advisor</label>
            <select className="form-select">
              <option>All SA</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              onChange={(f, t) => {
                setDateFrom(f);
                setDateTo(t);
              }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <div className="flex gap-2">
              <button className="btn btn--brand btn--sm flex-1 justify-center" onClick={fetchOrders}>
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
        {loading ? (
          <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No. SRO</th>
                <th>Customers</th>
                <th>Vehicle No</th>
                <th>Store</th>
                <th>Service Advisor</th>
                <th>Status</th>
                <th>Total</th>
                <th>Tanggal</th>
                <th>Linked Docs</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((order) => (
                <tr key={order.id}>
                  <td
                    className="font-medium cursor-pointer"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(`/service-orders/${order.soNo}`)}
                  >
                    {order.soNo}
                  </td>
                  <td>
                    <div className="font-medium">{order.customer?.name || "-"}</div>
                  </td>
                  <td
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/master-data/vehicles/${encodeURIComponent(order.vehicle?.plateNo || "")}`);
                    }}
                  >
                    <div className="font-medium" style={{ color: "var(--color-brand)" }}>
                      {order.vehicle?.plateNo || "-"}
                    </div>
                    <div className="text-xs text-[--color-text-secondary]">
                      {order.vehicle?.brand} {order.vehicle?.model}
                    </div>
                  </td>
                  <td className="text-[--color-text-secondary]">{order.store?.name || "-"}</td>
                  <td>{order.sa?.name || "-"}</td>
                  <td>
                    <span className={statusPill(order.status)}>{order.status}</span>
                  </td>
                  <td className="font-medium">{fmt(order.total)}</td>
                  <td className="text-[--color-text-secondary]">{fmtDate(order.createdAt)}</td>
                  <td>
                    <div style={{ display: "flex", gap: 6 }}>
                      <span
                        title={
                          (order._count?.workOrders ?? 0) > 0
                            ? "Work Order sudah dibuat"
                            : "Belum ada Work Order"
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: (order._count?.workOrders ?? 0) > 0 ? "#2e844a" : "#d8d8d8",
                          color: (order._count?.workOrders ?? 0) > 0 ? "#fff" : "#8e8f8e",
                          cursor: "default",
                        }}
                      >
                        WO
                      </span>
                      <span
                        title={
                          (order._count?.invoices ?? 0) > 0
                            ? "Invoice sudah dibuat"
                            : "Belum ada Invoice"
                        }
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          justifyContent: "center",
                          width: 22,
                          height: 22,
                          borderRadius: 4,
                          fontSize: 11,
                          fontWeight: 700,
                          background: (order._count?.invoices ?? 0) > 0 ? "#0176d3" : "#d8d8d8",
                          color: (order._count?.invoices ?? 0) > 0 ? "#fff" : "#8e8f8e",
                          cursor: "default",
                        }}
                      >
                        INV
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center text-[--color-text-secondary] py-8">
                    Tidak ada service order
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function ClipboardList({ className }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
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
