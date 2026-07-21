"use client";

import { useEffect, useState } from "react";
import { Truck, Star, Download } from "lucide-react";

const fmtDate = (x: string | Date | null) =>
  x ? new Date(x).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "—";

function pillClass(status: string): string {
  const s = (status || "").toLowerCase();
  if (s === "draft") return "pill pill--draft";
  if (s === "received" || s === "completed") return "pill pill--approved";
  if (s === "sent" || s === "in-progress" || s === "partial") return "pill pill--in-progress";
  if (s === "cancelled") return "pill pill--cancelled";
  if (s === "pending" || s === "waiting") return "pill pill--pending";
  return "pill pill--delivered";
}

export default function SummaryPurchaseDeliveriesPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/purchase?report=summary-delivery&limit=100")
      .then((r) => r.json())
      .then((j) => {
        setData(j.data || []);
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data");
        setLoading(false);
      });
  }, []);

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <Truck className="w-6 h-6 text-[--color-brand-secondary]" />
          Summary Purchase Deliveries
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
        <button className="btn btn--sm">
          <Download size={14} /> Export
        </button>
      </div>

      <div className="table-wrap">
        {loading ? (
          <div className="p-8 text-center">Loading...</div>
        ) : error ? (
          <div className="p-8 text-center text-red-500">{error}</div>
        ) : (
          <table className="data-table">
            <thead>
              <tr>
                <th>No</th>
                <th>Delivery No</th>
                <th>PO No</th>
                <th>Supplier</th>
                <th className="text-right">Items Count</th>
                <th>Received At</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => (
                <tr key={row.id}>
                  <td>{i + 1}</td>
                  <td className="font-medium text-[--color-brand-secondary]">{row.deliveryNo || "—"}</td>
                  <td>{row.po?.poNo || "—"}</td>
                  <td>{row.po?.supplier?.companyName || "—"}</td>
                  <td className="text-right">{row._count?.items ?? 0}</td>
                  <td>{fmtDate(row.receivedAt)}</td>
                  <td>
                    <span className={pillClass(row.status)}>{row.status || "—"}</span>
                  </td>
                </tr>
              ))}
              {data.length === 0 && (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-[--color-text-secondary]">
                    Tidak ada data
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {!loading && !error && (
        <div className="mt-3 text-sm text-[--color-text-secondary]">
          Showing {data.length} of {data.length} deliveries
        </div>
      )}
    </div>
  );
}
