"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Star, ArrowUpDown, X } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const warehouseOptions = ["Gudang Wijaya", "Wijaya Motor - WH Main", "Wijaya Motor - WH Parts"];
const typeOptions = ["Purchase Delivery", "Stock Transfer", "Stock Opname", "Stock Order"];

const stockHistories = [
  { id: 1, date: "25 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060041", productSku: "0K72A-34-150FR", productName: "LINK STABILIZER FR", quantity: 2, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 2, date: "25 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060042", productSku: "0K72A-33-047FR", productName: "BEARING RODA FRONT", quantity: 4, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 3, date: "25 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060043", productSku: "0K72A-34-150FR", productName: "LINK STABILIZER FR", quantity: 1, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 4, date: "26 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060044", productSku: "0K72A-33-047FR", productName: "BEARING RODA FRONT", quantity: 3, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 5, date: "26 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060045", productSku: "0K72A-34-150FR", productName: "LINK STABILIZER FR", quantity: 5, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 6, date: "26 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060046", productSku: "0K72A-33-047FR", productName: "BEARING RODA FRONT", quantity: 2, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 7, date: "27 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060047", productSku: "0K72A-34-150FR", productName: "LINK STABILIZER FR", quantity: 1, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 8, date: "27 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060048", productSku: "0K72A-33-047FR", productName: "BEARING RODA FRONT", quantity: 6, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 9, date: "27 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060049", productSku: "0K72A-34-150FR", productName: "LINK STABILIZER FR", quantity: 3, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 10, date: "28 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060050", productSku: "0K72A-33-047FR", productName: "BEARING RODA FRONT", quantity: 2, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 11, date: "28 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060051", productSku: "0K72A-34-150FR", productName: "LINK STABILIZER FR", quantity: 4, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 12, date: "28 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060052", productSku: "0K72A-33-047FR", productName: "BEARING RODA FRONT", quantity: 1, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
  { id: 13, date: "28 Jun 2026", type: "Purchase Delivery", refCode: "PD/WJY/26060053", productSku: "0K72A-34-150FR", productName: "LINK STABILIZER FR", quantity: 2, warehouse: "Gudang Wijaya", createdBy: "ANGGA NOVIANTO", status: "COMPLETED" },
];

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

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          Warehouse Stock Histories
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group" style={{ position: "relative" }}>
            <label className="form-label">Type</label>
            <div style={{ display: "flex", alignItems: "center", position: "relative" }}>
              <select
                className="form-select"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                style={{ paddingRight: typeFilter ? 28 : undefined }}
              >
                <option value="">All Type</option>
                {typeOptions.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
              {typeFilter && (
                <button
                  onClick={() => setTypeFilter("")}
                  style={{
                    position: "absolute", right: 6, top: "50%", transform: "translateY(-50%)",
                    background: "none", border: "none", cursor: "pointer", padding: 2,
                    display: "flex", alignItems: "center", color: "#8e8f8e",
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Product SKU</label>
            <input type="text" className="form-input" placeholder="SKU..." />
          </div>
          <div className="form-group">
            <label className="form-label">Product Name</label>
            <input type="text" className="form-input" placeholder="Product name..." />
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            <select
              className="form-select"
              value={warehouseFilter}
              onChange={(e) => setWarehouseFilter(e.target.value)}
            >
              <option value="">All Warehouse</option>
              {warehouseOptions.map((w) => (
                <option key={w} value={w}>{w}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Created By</label>
            <input type="text" className="form-input" placeholder="Created by..." />
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Search
            </button>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Date <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                </span>
              </th>
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
            {stockHistories.map((item) => (
              <tr key={item.id}>
                <td>{item.id}</td>
                <td className="text-[--color-text-secondary]">{item.date}</td>
                <td>
                  <span
                    className="cursor-pointer font-medium"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(handleTypeClick(item.type, item.refCode))}
                  >
                    {item.refCode}
                  </span>
                </td>
                <td>
                  <span
                    className="cursor-pointer font-medium"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(`/products/${item.productSku}`)}
                  >
                    {item.productSku}
                  </span>
                </td>
                <td>{item.productName}</td>
                <td>{item.quantity}</td>
                <td>{item.warehouse}</td>
                <td>{item.createdBy}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#fff",
                      background: item.status === "COMPLETED" ? "#2e844a" : "#6b7280",
                    }}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
