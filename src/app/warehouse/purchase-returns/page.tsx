"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, Star, Truck, ArrowUpDown } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const fmtDate = (d: string) => {
  const dt = new Date(d);
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

export default function PurchaseReturnsPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"standard" | "fixedAssets">("standard");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/purchase-returns")
      .then((r) => r.json())
      .then((j) => { setData(j.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load purchase returns"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <Truck className="w-6 h-6 text-[--color-brand-secondary]" />
          Purchase Returns
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="form-group">
            <label className="form-label">Document Number</label>
            <input type="text" className="form-input" placeholder="PR/HO/..." />
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
              <option>Head Office - WH Main</option>
              <option>Head Office - WH Parts</option>
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
              <option>APPROVED</option>
              <option>SENT</option>
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
              <th>Document Number</th>
              <th>Purchase Invoice</th>
              <th>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Date <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                </span>
              </th>
              <th>Warehouse</th>
              <th>Supplier</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.docNo || r.id}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/warehouse/purchase-returns/${r.docNo}`)}
                >
                  {r.docNo}
                </td>
                <td
                  className="cursor-pointer font-medium"
                  style={{ color: "var(--color-brand)" }}
                >
                  {r.po?.poNo || "-"}
                </td>
                <td className="text-[--color-text-secondary]">{fmtDate(r.date)}</td>
                <td>{r.po?.warehouse || "-"}</td>
                <td>{r.supplier?.companyName || "-"}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#fff",
                      background: r.status === "APPROVED" ? "#2e844a" : r.status === "SENT" ? "#0176d3" : "#6b7280",
                    }}
                  >
                    {r.status}
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
