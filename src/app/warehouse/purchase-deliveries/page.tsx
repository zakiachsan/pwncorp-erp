"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Star, Truck, ArrowUpDown } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const deliveries = [
  { refCode: "PD/WJY/26060041", refNo: "B1795PQQ", po: "PO/WJY/26060101", pi: "PI/WJY/26060021", date: "25 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "PT Astra Otoparts", status: "RECEIVED" },
  { refCode: "PD/WJY/26060042", refNo: "B1685PQG", po: "PO/WJY/26060102", pi: "PI/WJY/26060022", date: "25 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "PT Toyota Astra Motor", status: "RECEIVED" },
  { refCode: "PD/WJY/26060043", refNo: "B1795PQQ", po: "PO/WJY/26060103", pi: "PI/WJY/26060023", date: "26 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "CV Surya Gemilang", status: "RECEIVED" },
  { refCode: "PD/WJY/26060044", refNo: "B9072PSC", po: "PO/WJY/26060104", pi: "PI/WJY/26060024", date: "26 Jun 2026", warehouse: "Wijaya Motor - WH Parts", supplier: "PT Maju Jaya Sparepart", status: "RECEIVED" },
  { refCode: "PD/WJY/26060045", refNo: "B9135PSD", po: "PO/WJY/26060105", pi: "PI/WJY/26060025", date: "26 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "PT Bengkel Abadi", status: "RECEIVED" },
  { refCode: "PD/WJY/26060046", refNo: "B1212LQ", po: "PO/WJY/26060106", pi: "PI/WJY/26060026", date: "27 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "PT Astra Otoparts", status: "RECEIVED" },
  { refCode: "PD/WJY/26060047", refNo: "B9150KQ", po: "PO/WJY/26060107", pi: "PI/WJY/26060027", date: "27 Jun 2026", warehouse: "Wijaya Motor - WH Parts", supplier: "CV Berkah Sparepart", status: "RECEIVED" },
  { refCode: "PD/WJY/26060048", refNo: "B9329PSE", po: "PO/WJY/26060108", pi: "PI/WJY/26060028", date: "27 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "PT Toyota Astra Motor", status: "RECEIVED" },
  { refCode: "PD/WJY/26060049", refNo: "B1795PQQ", po: "PO/WJY/26060109", pi: "PI/WJY/26060029", date: "28 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "PT Maju Jaya Sparepart", status: "RECEIVED" },
  { refCode: "PD/WJY/26060050", refNo: "B1795PQQ", po: "PO/WJY/26060110", pi: "PI/WJY/26060030", date: "28 Jun 2026", warehouse: "Wijaya Motor - WH Parts", supplier: "PT Bengkel Abadi", status: "RECEIVED" },
  { refCode: "PD/WJY/26060051", refNo: "B1795PQQ", po: "PO/WJY/26060111", pi: "PI/WJY/26060031", date: "28 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "CV Surya Gemilang", status: "RECEIVED" },
  { refCode: "PD/WJY/26060052", refNo: "B9791PTB", po: "PO/WJY/26060112", pi: "PI/WJY/26060032", date: "28 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "PT Astra Otoparts", status: "RECEIVED" },
  { refCode: "PD/WJY/26060053", refNo: "B9155PQV", po: "PO/WJY/26060113", pi: "PI/WJY/26060033", date: "28 Jun 2026", warehouse: "Wijaya Motor - WH Parts", supplier: "PT Toyota Astra Motor", status: "RECEIVED" },
  { refCode: "PD/WJY/26060054", refNo: "B1795PQQ", po: "PO/WJY/26060114", pi: "PI/WJY/26060034", date: "28 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "CV Berkah Sparepart", status: "RECEIVED" },
  { refCode: "PD/WJY/26060055", refNo: "B2295UQ", po: "PO/WJY/26060115", pi: "PI/WJY/26060035", date: "28 Jun 2026", warehouse: "Wijaya Motor - WH Main", supplier: "PT Maju Jaya Sparepart", status: "RECEIVED" },
];

export default function PurchaseDeliveriesPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"standard" | "fixedAssets">("standard");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="view-title">
          <Truck className="w-6 h-6 text-[--color-brand-secondary]" />
          Purchase Delivery
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
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
            {deliveries.map((d) => (
              <tr key={d.refCode}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/warehouse/purchase-deliveries/${d.refCode}`)}
                >
                  {d.refCode}
                </td>
                <td>
                  {d.refNo}
                </td>
                <td
                  className="cursor-pointer font-medium"
                  style={{ color: "var(--color-brand)" }}
                >
                  {d.po}
                </td>
                <td
                  className="cursor-pointer font-medium"
                  style={{ color: "var(--color-brand)" }}
                >
                  {d.pi}
                </td>
                <td className="text-[--color-text-secondary]">{d.date}</td>
                <td>{d.warehouse}</td>
                <td>{d.supplier}</td>
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
