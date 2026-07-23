"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Star, ArrowUpDown, X } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const warehouseOptions = ["Gudang Wijaya", "Wijaya Motor - WH Main", "Wijaya Motor - WH Parts"];
const typeOptions = ["Purchase Delivery", "Stock Transfer", "Stock Opname", "Stock Order"];

const fmtDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

function handleTypeClick(type: string, refCode: string) {
  if (type === "Purchase Delivery") return `/warehouse/purchase-deliveries/${refCode}`;
  if (type === "Stock Transfer") return `/warehouse/stock-transfer/${refCode}`;
  if (type === "Stock Opname") return `/warehouse/stock-opname/${refCode}`;
  if (type === "Stock Order") return `/stock-workflow/stock-orders/${refCode}`;
  return "#";
}

export default function StockHistoriesPage() {
  const router = useRouter();
  const [typeFilter, setTypeFilter] = useState("");
  const [warehouseFilter, setWarehouseFilter] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/stock-histories")
      .then((r) => r.json())
      .then((j) => { setData(j.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load stock histories"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          Warehouse Stock Histories
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
      </div>

      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label">Type</label>
            <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <select className="form-select" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ paddingRight: typeFilter ? 28 : undefined }}>
                <option value="">All Type</option>
                {typeOptions.map((t) => (<option key={t} value={t}>{t}</option>))}
              </select>
              {typeFilter && (
                <button onClick={() => setTypeFilter("")} style={{ position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)", background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", alignItems: "center", color: "#8e8f8e" }}><X size={14} /></button>
              )}
            </div>
          </div>
          <div className="form-group"><label className="form-label">Product SKU</label><input type="text" className="form-input" placeholder="SKU..." /></div>
          <div className="form-group"><label className="form-label">Product Name</label><input type="text" className="form-input" placeholder="Product name..." /></div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            <select className="form-select" value={warehouseFilter} onChange={(e) => setWarehouseFilter(e.target.value)}>
              <option value="">All Warehouse</option>
              {warehouseOptions.map((w) => (<option key={w} value={w}>{w}</option>))}
            </select>
          </div>
          <div className="form-group"><label className="form-label">Created By</label><input type="text" className="form-input" placeholder="Created by..." /></div>
          <div className="form-group"><label className="form-label">Tanggal</label><DateRangePicker from={dateFrom} to={dateTo} onChange={(from, to) => { setDateFrom(from); setDateTo(to); }} /></div>
          <div className="form-group"><label className="form-label">&nbsp;</label><button className="btn btn--brand btn--sm flex-1 justify-center"><Search size={14} /> Search</button></div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No</th>
              <th><span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>Date <ArrowUpDown size={12} style={{ opacity: 0.5 }} /></span></th>
              <th>Type</th>
              <th>Product SKU</th>
              <th>Product Name</th>
              <th>Quantity</th>
              <th>Warehouse</th>
              <th>Created By</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((item: any, i: number) => (
              <tr key={item.id}>
                <td>{i + 1}</td>
                <td className="text-[--color-text-secondary]">{fmtDate(item.date)}</td>
                <td>
                  <span className="cursor-pointer font-medium" style={{ color: "var(--color-brand)" }} onClick={() => router.push(handleTypeClick(item.refDoc || item.changeType, item.refNo || ""))}>
                    {item.refNo || item.refDoc || "-"}
                  </span>
                </td>
                <td>
                  <span className="cursor-pointer font-medium" style={{ color: "var(--color-brand)" }} onClick={() => router.push(`/products/${item.sparepart?.sku}`)}>{item.sparepart?.sku || "-"}</span>
                </td>
                <td>{item.sparepart?.name || "-"}</td>
                <td>{item.qtyChange}</td>
                <td>-</td>
                <td>-</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, color: "#fff", background: item.changeType === "in" ? "#2e844a" : item.changeType === "out" ? "#ea001e" : "#6b7280" }}>{item.changeType}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
