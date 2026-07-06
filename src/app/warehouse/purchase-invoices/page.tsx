"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Truck, Star, Search, ArrowUpDown } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    APPROVED: "pill pill--completed",
    PAID: "pill pill--draft",
  };
  return map[status] || "pill pill--draft";
};

const invoices = [
  { docNumber: "PI/HO/26050143", refNo: "B2664EQ", po: "PO/HO/26050082", createdAt: "01 May 2026", invoiceDate: "01 May 2026", dueDate: "31 May 2026", supplier: "PT Auto Parts Sejahtera", status: "APPROVED", total: 2850000 },
  { docNumber: "PI/HO/26050142", refNo: "B9015BTA", po: "PO/HO/26050081", createdAt: "01 May 2026", invoiceDate: "01 May 2026", dueDate: "31 May 2026", supplier: "CV Suku Cadang Jaya", status: "PAID", total: 12500000 },
  { docNumber: "PI/HO/26050141", refNo: "B1795PQQ", po: "PO/HO/26050080", createdAt: "30 Apr 2026", invoiceDate: "30 Apr 2026", dueDate: "30 May 2026", supplier: "UD Sparepart Berkah", status: "APPROVED", total: 4375000 },
  { docNumber: "PI/HO/26050140", refNo: "B2295UQ", po: "PO/HO/26050079", createdAt: "30 Apr 2026", invoiceDate: "30 Apr 2026", dueDate: "30 May 2026", supplier: "PT Maju Motor Indonesia", status: "PAID", total: 8920000 },
  { docNumber: "PI/HO/26050139", refNo: "B9155PQV", po: "PO/HO/26050078", createdAt: "29 Apr 2026", invoiceDate: "29 Apr 2026", dueDate: "29 May 2026", supplier: "CV Ban Jaya Abadi", status: "APPROVED", total: 5600000 },
  { docNumber: "PI/HO/26050138", refNo: "B1087PQF", po: "PO/HO/26050077", createdAt: "29 Apr 2026", invoiceDate: "29 Apr 2026", dueDate: "29 May 2026", supplier: "PT Auto Parts Sejahtera", status: "PAID", total: 3150000 },
  { docNumber: "PI/HO/26050137", refNo: "B1935PSD", po: "PO/HO/26050076", createdAt: "28 Apr 2026", invoiceDate: "28 Apr 2026", dueDate: "28 May 2026", supplier: "UD Sparepart Berkah", status: "APPROVED", total: 15780000 },
  { docNumber: "PI/HO/26050136", refNo: "B1212LQ", po: "PO/HO/26050075", createdAt: "28 Apr 2026", invoiceDate: "28 Apr 2026", dueDate: "28 May 2026", supplier: "CV Suku Cadang Jaya", status: "PAID", total: 7400000 },
  { docNumber: "PI/HO/26050135", refNo: "B2295UQ", po: "PO/HO/26050074", createdAt: "27 Apr 2026", invoiceDate: "27 Apr 2026", dueDate: "27 May 2026", supplier: "PT Maju Motor Indonesia", status: "APPROVED", total: 2100000 },
  { docNumber: "PI/HO/26050134", refNo: "B9020BTA", po: "PO/HO/26050073", createdAt: "27 Apr 2026", invoiceDate: "27 Apr 2026", dueDate: "27 May 2026", supplier: "CV Ban Jaya Abadi", status: "PAID", total: 9650000 },
  { docNumber: "PI/HO/26050133", refNo: "STOCK ITEM", po: "PO/HO/26050072", createdAt: "26 Apr 2026", invoiceDate: "26 Apr 2026", dueDate: "26 May 2026", supplier: "PT Auto Parts Sejahtera", status: "APPROVED", total: 4800000 },
  { docNumber: "PI/HO/26050132", refNo: "B2664EQ", po: "PO/HO/26050071", createdAt: "26 Apr 2026", invoiceDate: "26 Apr 2026", dueDate: "26 May 2026", supplier: "UD Sparepart Berkah", status: "PAID", total: 6320000 },
  { docNumber: "PI/HO/26050131", refNo: "B9015BTA", po: "PO/HO/26050070", createdAt: "25 Apr 2026", invoiceDate: "25 Apr 2026", dueDate: "25 May 2026", supplier: "CV Suku Cadang Jaya", status: "APPROVED", total: 11250000 },
  { docNumber: "PI/HO/26050130", refNo: "B1795PQQ", po: "PO/HO/26050069", createdAt: "25 Apr 2026", invoiceDate: "25 Apr 2026", dueDate: "25 May 2026", supplier: "PT Maju Motor Indonesia", status: "PAID", total: 3950000 },
  { docNumber: "PI/HO/26050129", refNo: "B2295UQ", po: "PO/HO/26050068", createdAt: "24 Apr 2026", invoiceDate: "24 Apr 2026", dueDate: "24 May 2026", supplier: "CV Ban Jaya Abadi", status: "APPROVED", total: 8200000 },
];

const formatIDR = (n: number) => {
  if (n === 0) return "Rp 0";
  return "Rp " + n.toLocaleString("id-ID");
};

export default function PurchaseInvoicesPage() {
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
          Purchase Invoices
          <Star className="w-5 h-5 text-yellow-400 fill-yellow-400 ml-1" />
        </div>
      </div>

      {/* Filter Section */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="form-group">
            <label className="form-label">Document Number</label>
            <input type="text" className="form-input" placeholder="PI/HO/..." />
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
            <label className="form-label">Created At</label>
            <select className="form-select">
              <option>All</option>
              <option>Today</option>
              <option>This Week</option>
              <option>This Month</option>
              <option>Custom Range</option>
            </select>
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
            <label className="form-label">Supplier</label>
            <select className="form-select">
              <option>All Supplier</option>
              <option>PT Auto Parts Sejahtera</option>
              <option>CV Suku Cadang Jaya</option>
              <option>UD Sparepart Berkah</option>
              <option>PT Maju Motor Indonesia</option>
              <option>CV Ban Jaya Abadi</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>APPROVED</option>
              <option>PAID</option>
            </select>
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
              <th>Document Number</th>
              <th>Reference No</th>
              <th>Purchase Order</th>
              <th>
                <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                  Created At <ArrowUpDown size={12} style={{ opacity: 0.5 }} />
                </span>
              </th>
              <th>Invoice Date</th>
              <th>Due Date</th>
              <th>Supplier</th>
              <th>Status</th>
              <th>Total</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((inv) => (
              <tr key={inv.docNumber}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/warehouse/purchase-invoices/${inv.docNumber}`)}
                >
                  {inv.docNumber}
                </td>
                <td
                  className=""
                >
                  {inv.refNo}
                </td>
                <td
                  className="cursor-pointer font-medium"
                  style={{ color: "var(--color-brand)" }}
                >
                  {inv.po}
                </td>
                <td className="text-[--color-text-secondary]">{inv.createdAt}</td>
                <td className="text-[--color-text-secondary]">{inv.invoiceDate}</td>
                <td className="text-[--color-text-secondary]">{inv.dueDate}</td>
                <td>{inv.supplier}</td>
                <td>
                  <span
                    style={{
                      display: "inline-block",
                      padding: "2px 8px",
                      borderRadius: 9999,
                      fontSize: 10,
                      fontWeight: 600,
                      color: "#fff",
                      background: inv.status === "APPROVED" ? "#2e844a" : "#6b7280",
                    }}
                  >
                    {inv.status}
                  </span>
                </td>
                <td className="font-medium">{formatIDR(inv.total)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
