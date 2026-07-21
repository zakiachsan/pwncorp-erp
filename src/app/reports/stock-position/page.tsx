"use client";

import { useEffect, useState } from "react";
import { Package, Star, Download } from "lucide-react";

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function StockPositionPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/stock?report=stock-position&limit=200")
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
          <Package className="w-6 h-6 text-[--color-brand-secondary]" />
          Stock Position
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
                <th>Brand</th>
                <th>Category</th>
                <th className="text-right">Stock Qty</th>
                <th className="text-right">Min Stock</th>
                <th className="text-right">Sell Price (Rp)</th>
                <th>Supplier</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, i) => {
                const low = row.stockQty <= row.minStock;
                return (
                  <tr key={row.id} className={low ? "text-red-600" : ""}>
                    <td>{i + 1}</td>
                    <td>{row.sku}</td>
                    <td>{row.name}</td>
                    <td>{row.brand || "—"}</td>
                    <td>{row.category || "—"}</td>
                    <td className="text-right">{row.stockQty}</td>
                    <td className="text-right">{row.minStock}</td>
                    <td className="text-right">{fmt(row.sellPrice ?? 0)}</td>
                    <td>{row.supplier?.companyName || "—"}</td>
                  </tr>
                );
              })}
              {data.length === 0 && (
                <tr>
                  <td colSpan={9} className="text-center py-8 text-[--color-text-secondary]">
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
