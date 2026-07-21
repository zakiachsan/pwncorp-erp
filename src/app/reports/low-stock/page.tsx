"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Star, Download } from "lucide-react";

export default function LowStockPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/stock?report=low-stock&limit=200")
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
          <AlertTriangle className="w-6 h-6 text-[--color-brand-secondary]" />
          Low Stock Alert
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
        <button className="btn btn--sm">
          <Download size={14} /> Export
        </button>
      </div>

      {/* ── Summary Card ── */}
      {!loading && !error && (
        <div style={{ margin: "16px 24px 0", padding: "14px 20px", background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, display: "flex", alignItems: "center", gap: 10 }}>
          <AlertTriangle size={20} className="text-red-500" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#991b1b" }}>
            {data.length} item{data.length !== 1 ? "s" : ""} below minimum stock level
          </span>
        </div>
      )}

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
                <th className="text-right">Stock Qty</th>
                <th className="text-right">Min Stock</th>
                <th className="text-right">Deficit</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const deficit = (row.minStock ?? 0) - (row.stockQty ?? 0);
                return (
                  <tr key={row.id}>
                    <td>{i + 1}</td>
                    <td>{row.sku}</td>
                    <td>{row.name}</td>
                    <td className="text-right text-red-600 font-semibold">{row.stockQty}</td>
                    <td className="text-right">{row.minStock}</td>
                    <td className="text-right text-red-600 font-semibold">{deficit}</td>
                    <td>{row.supplier?.companyName || "—"}</td>
                  </tr>
                );
              })}
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
    </div>
  );
}
