"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Star, Truck, ArrowUpDown } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

export default function PurchaseDeliveriesPage() {
  const router = useRouter();
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<"standard" | "fixedAssets">("standard");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  useEffect(() => {
    fetch("/api/purchase-deliveries")
      .then((r) => r.json())
      .then((json) => { setData(json.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <Truck className="w-6 h-6 text-[--color-brand-secondary]" />
          Purchase Delivery
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
        <button onClick={() => router.push("/warehouse/purchase-deliveries/new")} className="btn btn--brand btn--sm">
          + Add
        </button>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="form-group">
            <label className="form-label">Ref Code</label>
            <input type="text" className="form-input" placeholder="PD/WJY/..." />
          </div>
          <div className="form-group">
            <label className="form-label">Reference No</label>
            <input type="text" className="form-input" placeholder="Plat Nomor / Ref No..." />
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Order</label>
            <input type="text" className="form-input" placeholder="PO Number..." />
          </div>
          <div className="form-group">
            <label className="form-label">Purchase Invoice</label>
            <input type="text" className="form-input" placeholder="PI Number..." />
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
            <label className="form-label">Warehouse</label>
            <select className="form-select">
              <option>All Warehouse</option>
              <option>Wijaya Motor - WH Main</option>
              <option>Wijaya Motor - WH Parts</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Supplier</label>
            <select className="form-select">
              <option>All Supplier</option>
              <option>PT Astra Otoparts</option>
              <option>PT Toyota Astra Motor</option>
              <option>CV Surya Gemilang</option>
              <option>PT Maju Jaya Sparepart</option>
              <option>PT Bengkel Abadi</option>
              <option>CV Berkah Sparepart</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>DRAFT</option>
              <option>RECEIVED</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
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
              <th>Ref Code</th>
              <th>Reference No</th>
              <th>Purchase Order</th>
              <th>Purchase Invoice</th>
              <th>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Date <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                </span>
              </th>
              <th>To Warehouse</th>
              <th>From Supplier</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((d) => (
              <tr key={d.id}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/warehouse/purchase-deliveries/${d.deliveryNo}`)}
                >
                  {d.deliveryNo}
                </td>
                <td>{d.deliveryNo}</td>
                <td
                  className="cursor-pointer font-medium"
                  style={{ color: "var(--color-brand)" }}
                >
                  {d.po?.poNo || "-"}
                </td>
                <td
                  className="cursor-pointer font-medium"
                  style={{ color: "var(--color-brand)" }}
                >
                  -
                </td>
                <td className="text-[--color-text-secondary]">{d.date ? new Date(d.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</td>
                <td>-</td>
                <td>{d.po?.supplier?.companyName || "-"}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#fff",
                      background: d.status === "RECEIVED" ? "#2e844a" : "#6b7280",
                    }}
                  >
                    {d.status}
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
