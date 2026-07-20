"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

interface WorkOrder {
  id: string;
  woNo: string;
  soId: string;
  mekanikId: string | null;
  status: string;
  startDate: string | null;
  targetDate: string | null;
  createdAt: string;
  so: {
    soNo: string;
    customer: { name: string };
    vehicle: { plateNo: string; brand: string; model: string };
  } | null;
  mekanik: { id: string; name: string } | null;
  _count: { items: number; invoices: number };
}

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Draft: "pill pill--draft",
    "Waiting Stock": "pill pill--waiting",
    "In Progress": "pill pill--in-progress",
    QC: "pill pill--waiting",
    Completed: "pill pill--completed",
    Cancelled: "pill pill--cancelled",
    Confirmed: "pill pill--approved",
  };
  return map[status] || "pill pill--draft";
};

function fmtDate(d: string | null): string {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function WorkOrdersPage() {
  const router = useRouter();
  const [wos, setWos] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchWOs = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: "50" });
    if (statusFilter) params.set("status", statusFilter);
    if (search) params.set("search", search);

    fetch(`/api/work-orders?${params}`)
      .then((r) => r.json())
      .then((json) => {
        setWos(json.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data work orders");
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchWOs();
  }, []);

  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
              <option value="Waiting Stock">Waiting Stock</option>
              <option value="In Progress">In Progress</option>
              <option value="QC">QC</option>
              <option value="Completed">Completed</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Store</label>
            <select className="form-select">
              <option>All Stores</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Mekanik</label>
            <select className="form-select">
              <option>All Mekanik</option>
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
            <input
              type="text"
              className="form-input"
              placeholder="No. WO / Customer..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center" onClick={fetchWOs}>
              <Search size={14} /> Cari
            </button>
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
                <th>No. SWO</th>
                <th>Customers</th>
                <th>Vehicle No</th>
                <th>Store</th>
                <th>Mekanik</th>
                <th>Status</th>
                <th>Mulai</th>
                <th>Target</th>
                <th>No. SRO</th>
                <th>No. SRI</th>
              </tr>
            </thead>
            <tbody>
              {wos.map((wo) => (
                <tr key={wo.id}>
                  <td
                    className="font-medium cursor-pointer"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(`/work-orders/${wo.woNo}`)}
                  >
                    {wo.woNo}
                  </td>
                  <td>
                    <div className="font-medium">{wo.so?.customer?.name || "-"}</div>
                  </td>
                  <td
                    className="cursor-pointer"
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/master-data/vehicles/${encodeURIComponent(wo.so?.vehicle?.plateNo || "")}`);
                    }}
                  >
                    <div className="font-medium" style={{ color: "var(--color-brand)" }}>
                      {wo.so?.vehicle?.plateNo || "-"}
                    </div>
                    <div className="text-xs text-[--color-text-secondary]">
                      {wo.so?.vehicle?.brand} {wo.so?.vehicle?.model}
                    </div>
                  </td>
                  <td className="text-[--color-text-secondary]">-</td>
                  <td>{wo.mekanik?.name || "-"}</td>
                  <td>
                    <span className={statusPill(wo.status)}>{wo.status}</span>
                  </td>
                  <td className="text-[--color-text-secondary]">{fmtDate(wo.startDate || wo.createdAt)}</td>
                  <td className="text-[--color-text-secondary]">{fmtDate(wo.targetDate)}</td>
                  <td
                    className="cursor-pointer"
                    style={{ color: "var(--color-brand)", fontWeight: 500 }}
                    onClick={() => router.push(`/service-orders/${wo.so?.soNo}`)}
                  >
                    {wo.so?.soNo || "-"}
                  </td>
                  <td>
                    <span style={{ color: "#8e8f8e" }}>-</span>
                  </td>
                </tr>
              ))}
              {wos.length === 0 && (
                <tr>
                  <td colSpan={10} className="text-center text-[--color-text-secondary] py-8">
                    Tidak ada work order
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

function WrenchIcon({ className }: { className?: string }) {
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
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}
