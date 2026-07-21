"use client";

import { useEffect, useState } from "react";
import { ArrowLeftRight, Star, Download } from "lucide-react";

const fmtDate = (d: string) =>
  new Date(d).toLocaleDateString("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export default function StockMovementPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/stock?report=stock-movement&limit=200")
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
      {/* ── Header ── */}
      <div className="view-header">
        <div className="view-title">
          <ArrowLeftRight className="w-6 h-6 text-[--color-brand-secondary]" />
          Stock Movement
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
        <button className="btn btn--sm">
          <Download size={14} /> Export
        </button>
      </div>

      {/* ── Table ── */}
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
                <th>SKU</th>
                <th>Name</th>
                <th>Type</th>
                <th className="text-right">Qty</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const isIn = row.type === "IN";
                return (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td>{row.sparepart?.sku || "—"}</td>
                    <td>{row.sparepart?.name || "—"}</td>
                    <td>
                      <span className={isIn ? "text-green-600 font-semibold" : "text-red-600 font-semibold"}>
                        {row.type}
                      </span>
                    </td>
                    <td className="text-right">{row.qty}</td>
                    <td>{row.createdAt ? fmtDate(row.createdAt) : "—"}</td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-[--color-text-secondary]">
                    Tidak ada data
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
