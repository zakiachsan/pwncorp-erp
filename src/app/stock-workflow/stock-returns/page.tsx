"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { PackageMinus, Search } from "lucide-react";

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Confirmed: "pill pill--completed",
    Draft: "pill pill--draft",
    Cancelled: "pill pill--cancelled",
  };
  return map[status] || "pill pill--draft";
};

export default function StockReturnsPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("");

  useEffect(() => {
    fetch("/api/stock-returns?limit=200")
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, []);

  const filtered = data.filter((r) => {
    if (search && !r.returnNo.toLowerCase().includes(search.toLowerCase())) return false;
    if (statusFilter && r.status !== statusFilter) return false;
    return true;
  });

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <PackageMinus className="w-6 h-6 text-[--color-brand-secondary]" />
          Stock Returns
        </div>
        <button onClick={() => router.push("/stock-workflow/stock-returns/new")} className="btn btn--brand btn--sm">+ Add</button>
      </div>

      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="form-label">Return No</label>
            <input className="form-input" placeholder="Search..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
              <option value="">All</option>
              <option>Draft</option>
              <option>Confirmed</option>
              <option>Cancelled</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center"><Search size={14} /> Search</button>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>Return No</th>
                <th>Work Order</th>
                <th>Warehouse</th>
                <th>Items</th>
                <th>Reason</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((r) => (
                <tr key={r.id}>
                  <td className="font-medium cursor-pointer" style={{ color: "var(--color-brand)" }} onClick={() => router.push(`/stock-workflow/stock-returns/${r.id}`)}>
                    {r.returnNo}
                  </td>
                  <td>{r.wo?.woNo || "-"}</td>
                  <td>{r.warehouse || "-"}</td>
                  <td>{r._count?.items || 0}</td>
                  <td>{r.reason || "-"}</td>
                  <td><span className={statusPill(r.status)}>{r.status}</span></td>
                  <td>{r.date ? new Date(r.date).toLocaleDateString("id-ID") : "-"}</td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="text-center py-8 text-[--color-text-secondary]">Tidak ada data</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
