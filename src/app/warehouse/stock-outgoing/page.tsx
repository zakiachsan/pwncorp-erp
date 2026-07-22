"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Package } from "lucide-react";

export default function StockOutgoingListPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stock-outgoings")
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;

  const statusColor = (s: string) => {
    const map: Record<string, string> = { Draft: "#6b7280", Confirmed: "#0176d3", Approved: "#2e844a", Cancelled: "#ea001e" };
    return map[s] || "#6b7280";
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <Package className="w-6 h-6 text-[--color-brand-secondary]" />
          Stock Outgoing
        </div>
        <button onClick={() => router.push("/warehouse/stock-outgoing/new")} className="btn btn--brand btn--sm">+ Add</button>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Doc No</th>
              <th>Date</th>
              <th>Warehouse</th>
              <th className="text-right">Items</th>
              <th className="text-right">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id}>
                <td className="font-medium cursor-pointer" style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/warehouse/stock-outgoing/${d.docNo}`)}>{d.docNo}</td>
                <td className="text-[--color-text-secondary]">{d.date ? new Date(d.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                <td>{d.warehouse || "-"}</td>
                <td className="text-right">{d._count?.items || d.items?.length || 0}</td>
                <td className="text-right font-medium">Rp {(d.total || 0).toLocaleString("id-ID")}</td>
                <td>
                  <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, color: "#fff", background: statusColor(d.status) }}>
                    {d.status}
                  </span>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} className="text-center text-sm text-[--color-text-secondary] py-8">No data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
