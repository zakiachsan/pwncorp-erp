"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Search } from "lucide-react";

interface ApiPO {
  id: string;
  poNo: string;
  date: string;
  supplier: { companyName: string } | null;
  total: number;
  status: string;
  _count: { items: number; deliveries: number };
}

interface PurchaseOrder {
  no: string;
  supplier: string;
  status: string;
  total: string;
  date: string;
  items: number;
}

const formatIDR = (val: number) => "Rp " + val.toLocaleString("id-ID");

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
  const [orders, setOrders] = useState<PurchaseOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [search, setSearch] = useState("");

  const fetchPOs = (params?: Record<string, string>) => {
    setLoading(true);
    const qs = new URLSearchParams({ limit: "1000", ...params }).toString();
    fetch(`/api/purchase-orders?${qs}`)
      .then((r) => r.json())
      .then((j) => {
        const data: ApiPO[] = j.data || [];
        setOrders(data.map((po) => ({
          no: po.poNo,
          supplier: po.supplier?.companyName || "-",
          status: po.status,
          total: formatIDR(po.total || 0),
          date: po.date || "-",
          items: po._count?.items || 0,
        })));
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load purchase orders");
        setLoading(false);
      });
  };

  useEffect(() => { fetchPOs(); }, []);

  const handleSearch = () => {
    const params: Record<string, string> = {};
    if (statusFilter) params.status = statusFilter;
    if (supplierFilter) params.supplierId = supplierFilter;
    if (search) params.search = search;
    fetchPOs(params);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All Status</option>
              <option value="DRAFT">Draft</option>
              <option value="SENT">Sent</option>
              <option value="PARTIAL_RECEIVED">Partial Received</option>
              <option value="RECEIVED">Received</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <select className="form-select" value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
              <option value="">All Suppliers</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="No. PO / Supplier..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center" onClick={handleSearch}>
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
            {orders.map((po) => (
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
