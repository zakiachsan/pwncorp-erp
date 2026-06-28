"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Search, Download } from "lucide-react";

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    RECEIVED: "pill pill--completed",
    CONFIRMED: "pill pill--pending",
    CANCELLED: "pill pill--cancelled",
    PENDING: "pill pill--in-progress",
  };
  return map[status] || "pill pill--draft";
};

const warehouseData = [
  { stockOrder: "OPO/WM/26060060", refNo: "B6232TQB", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 18.717", receiveAmt: "Rp 18.717", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26060059", refNo: "B1234ABC", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 100.679", receiveAmt: "Rp 100.679", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26060058", refNo: "C5678DEF", date: "23 Jun 2026", dueAt: "23 Jun 2026", receivedAt: "23 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 522.405", receiveAmt: "Rp 522.405", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/PJ/26060092", refNo: "D9012GHI", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putro Joyo Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 337.838", receiveAmt: "Rp 337.838", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26060057", refNo: "E3456JKL", date: "22 Jun 2026", dueAt: "22 Jun 2026", receivedAt: "22 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 768.468", receiveAmt: "Rp 768.468", user: "YUSRO IQBAL" },
  { stockOrder: "OPO/WM/26020049", refNo: "F7890MNO", date: "13 Feb 2026", dueAt: "13 Feb 2026", receivedAt: "23 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 423.423", receiveAmt: "Rp 423.423", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26020038", refNo: "G1234PQR", date: "11 Feb 2026", dueAt: "11 Feb 2026", receivedAt: "13 Feb 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 446.362", receiveAmt: "Rp 446.362", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26010092", refNo: "H5678STU", date: "22 Jan 2026", dueAt: "-", receivedAt: "22 Jan 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 768.468", receiveAmt: "Rp 768.468", user: "YUSRO IQBAL" },
  { stockOrder: "OPO/WM/25110138", refNo: "I9012VWX", date: "24 Nov 2025", dueAt: "-", receivedAt: "24 Nov 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 7.167.243", receiveAmt: "Rp 7.167.243", user: "YUSRO IQBAL" },
  { stockOrder: "OPO/WM/25100216", refNo: "J3456YZA", date: "25 Oct 2025", dueAt: "-", receivedAt: "25 Oct 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 45.718", receiveAmt: "Rp 45.718", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25100183", refNo: "K7890BCD", date: "22 Oct 2025", dueAt: "-", receivedAt: "25 Nov 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 970.782", receiveAmt: "Rp 970.782", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/PJ/25100034", refNo: "L1234EFG", date: "21 Oct 2025", dueAt: "-", receivedAt: "25 Nov 2025", store: "PT Putro Joyo Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 1.093.152", receiveAmt: "Rp 868.287", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25100171", refNo: "M5678HIJ", date: "21 Oct 2025", dueAt: "-", receivedAt: "25 Nov 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 4.321.772", receiveAmt: "Rp 4.321.772", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25100111", refNo: "N9012KLM", date: "13 Oct 2025", dueAt: "-", receivedAt: "25 Nov 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 12.486.486", receiveAmt: "Rp 12.486.486", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25100110", refNo: "O3456NOP", date: "13 Oct 2025", dueAt: "-", receivedAt: "25 Nov 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "CONFIRMED", orderAmt: "Rp 287.105", receiveAmt: "Rp 0", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25070196", refNo: "T3456CDE", date: "21 Jul 2025", dueAt: "-", receivedAt: "22 Jul 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "CANCELLED", orderAmt: "Rp 4.047.571", receiveAmt: "Rp 0", user: "YUSRO IQBAL" },
];

const serviceOrdersData = [
  { stockOrder: "OPO/WM/26020049", serviceOrder: "SRO/WM/26020094", date: "13 Feb 2026", dueAt: "13 Feb 2026", receivedAt: "23 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 423.423", receiveAmt: "Rp 423.423", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26020038", serviceOrder: "SRO/WM/26020070", date: "11 Feb 2026", dueAt: "11 Feb 2026", receivedAt: "13 Feb 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 446.362", receiveAmt: "Rp 446.362", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26010092", serviceOrder: "SRO/WM/25110079", date: "22 Jan 2026", dueAt: "-", receivedAt: "22 Jan 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 768.468", receiveAmt: "Rp 768.468", user: "YUSRO IQBAL" },
  { stockOrder: "OPO/WM/25110138", serviceOrder: "SRO/WM/25110221", date: "24 Nov 2025", dueAt: "-", receivedAt: "24 Nov 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 7.167.243", receiveAmt: "Rp 7.167.243", user: "YUSRO IQBAL" },
  { stockOrder: "OPO/WM/25100216", serviceOrder: "SRO/WM/25100219", date: "25 Oct 2025", dueAt: "-", receivedAt: "25 Oct 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 45.718", receiveAmt: "Rp 45.718", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25100183", serviceOrder: "SRO/WM/25100185", date: "22 Oct 2025", dueAt: "-", receivedAt: "25 Nov 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 970.782", receiveAmt: "Rp 970.782", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/PJ/25100034", serviceOrder: "SRO/PJ/25100017", date: "21 Oct 2025", dueAt: "-", receivedAt: "25 Nov 2025", store: "PT Putro Joyo Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 1.093.152", receiveAmt: "Rp 868.287", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25100171", serviceOrder: "SRO/WM/25100168", date: "21 Oct 2025", dueAt: "-", receivedAt: "25 Nov 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 4.321.772", receiveAmt: "Rp 4.321.772", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25100111", serviceOrder: "SRO/WM/25100103", date: "13 Oct 2025", dueAt: "-", receivedAt: "25 Nov 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 12.486.486", receiveAmt: "Rp 12.486.486", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25100110", serviceOrder: "SRO/WM/25100102", date: "13 Oct 2025", dueAt: "-", receivedAt: "25 Nov 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 287.105", receiveAmt: "Rp 287.105", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25100011", serviceOrder: "SRO/WM/25100007", date: "01 Oct 2025", dueAt: "-", receivedAt: "01 Oct 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 45.718", receiveAmt: "Rp 45.718", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25080340", serviceOrder: "SRO/WM/25080219", date: "27 Aug 2025", dueAt: "-", receivedAt: "27 Aug 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 1.327.267", receiveAmt: "Rp 1.327.267", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25080007", serviceOrder: "SRO/WM/25080019", date: "02 Aug 2025", dueAt: "-", receivedAt: "02 Aug 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 4.183", receiveAmt: "Rp 4.183", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25070234", serviceOrder: "SRO/WM/25070242", date: "28 Jul 2025", dueAt: "-", receivedAt: "28 Jul 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 45.718", receiveAmt: "Rp 45.718", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/25070196", serviceOrder: "SRO/WM/25070134", date: "21 Jul 2025", dueAt: "-", receivedAt: "22 Jul 2025", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 4.047.571", receiveAmt: "Rp 4.047.571", user: "ANGGA NOVIANTO" },
];

const workOrdersData = [
  { stockOrder: "OPO/PJ/26060092", workOrder: "SWO/PJ/26060021", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putro Joyo Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 18.717", receiveAmt: "Rp 18.717", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26060059", workOrder: "SWO/WM/26060025", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 100.679", receiveAmt: "Rp 100.679", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26060058", workOrder: "SWO/WM/26060023", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 522.405", receiveAmt: "Rp 522.405", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/PJ/26060091", workOrder: "SWO/PJ/26060020", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putro Joyo Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 337.838", receiveAmt: "Rp 337.838", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26060057", workOrder: "SWO/WM/26060022", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 768.468", receiveAmt: "Rp 768.468", user: "YUSRO IQBAL" },
  { stockOrder: "OPO/PJ/26060090", workOrder: "SWO/PJ/26060019", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putro Joyo Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 423.423", receiveAmt: "Rp 423.423", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26060056", workOrder: "SWO/WM/26060021", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 446.362", receiveAmt: "Rp 446.362", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/PJ/26060089", workOrder: "SWO/PJ/26060018", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putro Joyo Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 768.468", receiveAmt: "Rp 768.468", user: "YUSRO IQBAL" },
  { stockOrder: "OPO/WM/26060055", workOrder: "SWO/WM/26060020", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 7.167.243", receiveAmt: "Rp 7.167.243", user: "YUSRO IQBAL" },
  { stockOrder: "OPO/PJ/26060088", workOrder: "SWO/PJ/26060017", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putro Joyo Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 45.718", receiveAmt: "Rp 45.718", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26060054", workOrder: "SWO/WM/26060019", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 970.782", receiveAmt: "Rp 970.782", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/PJ/26060087", workOrder: "SWO/PJ/26060016", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putro Joyo Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 1.093.152", receiveAmt: "Rp 868.287", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26060053", workOrder: "SWO/WM/26060018", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 4.321.772", receiveAmt: "Rp 4.321.772", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/PJ/26060086", workOrder: "SWO/PJ/26060015", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putro Joyo Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 12.486.486", receiveAmt: "Rp 12.486.486", user: "ANGGA NOVIANTO" },
  { stockOrder: "OPO/WM/26060052", workOrder: "SWO/WM/26060017", date: "24 Jun 2026", dueAt: "24 Jun 2026", receivedAt: "24 Jun 2026", store: "PT Putra Wijaya Motor", warehouse: "Gudang Wijaya", status: "RECEIVED", orderAmt: "Rp 287.105", receiveAmt: "Rp 287.105", user: "ANGGA NOVIANTO" },
];

export default function StockOrdersPage() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"warehouse" | "serviceOrders" | "workOrders">("warehouse");

  const currentData = activeTab === "warehouse" ? warehouseData : activeTab === "serviceOrders" ? serviceOrdersData : workOrdersData;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <PackageIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Stock Orders
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm">
            <Download size={14} /> Export
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-4 bg-[#ecebea] rounded-lg p-0.5 w-fit">
        {([
          { key: "warehouse", label: "Warehouse" },
          { key: "serviceOrders", label: "Service Orders" },
          { key: "workOrders", label: "Work Orders" },
        ] as const).map((t) => (
          <button key={t.key} onClick={() => setActiveTab(t.key)}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === t.key
                ? "bg-[#0176d3] text-white"
                : "bg-transparent text-[#444746] hover:bg-white"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="form-group">
            <label className="form-label">Stock Order</label>
            <input type="text" className="form-input" placeholder="No. Stock Order..." />
          </div>
          {activeTab === "serviceOrders" && (
            <div className="form-group">
              <label className="form-label">Service Order</label>
              <input type="text" className="form-input" placeholder="No. Service Order..." />
            </div>
          )}
          {activeTab === "workOrders" && (
            <div className="form-group">
              <label className="form-label">Work Order</label>
              <input type="text" className="form-input" placeholder="No. Work Order..." />
            </div>
          )}
          <div className="form-group">
            <label className="form-label">Store</label>
            <select className="form-select">
              <option>All Stores</option>
              <option>PT Putra Wijaya Motor</option>
              <option>PT Putro Joyo Motor</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Warehouse</label>
            <select className="form-select">
              <option>All Warehouses</option>
              <option>Gudang Wijaya</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Status</label>
            <select className="form-select">
              <option>All Status</option>
              <option>RECEIVED</option>
              <option>CONFIRMED</option>
              <option>CANCELLED</option>
              <option>PENDING</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Dari Tanggal</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Sampai Tanggal</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <div className="flex gap-2">
              <button className="btn btn--brand btn--sm flex-1 justify-center">
                <Search size={14} /> Cari
              </button>
              <button className="btn btn--sm">
                <FilterIcon size={14} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Stock Order</th>
              {activeTab === "serviceOrders" && <th>Service Order</th>}
              {activeTab === "workOrders" && <th>Work Order</th>}
              {activeTab === "warehouse" && <th>Reference No</th>}
              <th>Date</th>
              <th>Due At</th>
              <th>Received At</th>
              <th>Store</th>
              <th>Warehouse</th>
              <th>Status</th>
              <th>Order Amount</th>
              <th>Receive Amount</th>
              <th>User</th>
            </tr>
          </thead>
          <tbody>
            {currentData.map((row, i) => (
              <tr key={i}>
                <td
                  className="font-medium cursor-pointer"
                  style={{ color: "var(--color-brand)" }}
                  onClick={() => router.push(`/stock-workflow/stock-orders/${row.stockOrder}`)}
                >{row.stockOrder}</td>
                {activeTab === "serviceOrders" && (
                  <td
                    className="font-medium cursor-pointer"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(`/service-orders/${encodeURIComponent((row as any).serviceOrder)}`)}
                  >{(row as any).serviceOrder}</td>
                )}
                {activeTab === "workOrders" && (
                  <td
                    className="font-medium cursor-pointer"
                    style={{ color: "var(--color-brand)" }}
                    onClick={() => router.push(`/work-orders/${encodeURIComponent((row as any).workOrder)}`)}
                  >{(row as any).workOrder}</td>
                )}
                {activeTab === "warehouse" && <td>{(row as any).refNo}</td>}
                <td className="text-[--color-text-secondary]">{row.date}</td>
                <td className="text-[--color-text-secondary]">{row.dueAt}</td>
                <td className="text-[--color-text-secondary]">{row.receivedAt}</td>
                <td>{row.store}</td>
                <td>{row.warehouse}</td>
                <td><span className={statusPill(row.status)}>{row.status}</span></td>
                <td className="font-medium">{row.orderAmt}</td>
                <td className="font-medium">{row.receiveAmt}</td>
                <td className="font-medium">{row.user}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function PackageIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M11 21.73a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73z" />
      <path d="M12 22V12" />
      <path d="m3.3 7 7.703 4.734a2 2 0 0 0 1.994 0L20.7 7" />
      <path d="m7.5 4.27 9 5.15" />
    </svg>
  );
}

function FilterIcon({ size }: { size: number }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
    </svg>
  );
}
