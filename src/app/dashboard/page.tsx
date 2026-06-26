"use client";

import {
  Wrench,
  ClipboardList,
  DollarSign,
  Users,
  TrendingUp,
  AlertTriangle,
  Package,
} from "lucide-react";

const stats = [
  { label: "WO Hari Ini", value: "12", icon: ClipboardList, color: "bg-[--color-brand]" },
  { label: "Dalam Proses", value: "8", icon: Wrench, color: "bg-[--color-warning]" },
  { label: "Selesai", value: "24", icon: TrendingUp, color: "bg-[--color-success]" },
  { label: "Pendapatan Hari Ini", value: "Rp 4.5jt", icon: DollarSign, color: "bg-[--color-brand-secondary]" },
];

const recentOrders = [
  { no: "SO-001", customer: "Toyota Avanza", status: "Approved", amount: "Rp 2.500.000", date: "26 Jun 2026" },
  { no: "SO-002", customer: "Honda Civic", status: "Draft", amount: "Rp 1.800.000", date: "26 Jun 2026" },
  { no: "SO-003", customer: "Mitsubishi Pajero", status: "In Progress", amount: "Rp 5.200.000", date: "25 Jun 2026" },
  { no: "SO-004", customer: "Suzuki Ertiga", status: "Completed", amount: "Rp 3.100.000", date: "25 Jun 2026" },
  { no: "SO-005", customer: "Daihatsu Xenia", status: "Waiting", amount: "Rp 950.000", date: "24 Jun 2026" },
];

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Draft: "pill pill--draft",
    Approved: "pill pill--approved",
    "In Progress": "pill pill--in-progress",
    Completed: "pill pill--completed",
    Waiting: "pill pill--waiting",
    Cancelled: "pill pill--cancelled",
  };
  return map[status] || "pill pill--draft";
};

export default function DashboardPage() {
  return (
    <div>
      {/* Page Header */}
      <div className="view-header">
        <div className="view-title">
          <LayoutDashboardIcon />
          Dashboard
        </div>
        <div className="flex gap-2">
          <button className="btn btn--brand">+ New Service Order</button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat) => (
          <div key={stat.label} className="card-slds flex items-center gap-4">
            <div className={`w-12 h-12 rounded-slds-md ${stat.color} flex items-center justify-center flex-shrink-0`}>
              <stat.icon className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="text-sm text-[--color-text-secondary]">{stat.label}</div>
              <div className="text-xl font-bold text-[--color-text-primary]">{stat.value}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <div className="card-slds">
          <div className="card__header">
            <div className="card__title">Pendapatan Bulanan</div>
          </div>
          <div className="h-48 flex items-center justify-center text-[--color-text-secondary] text-sm">
            {/* TODO: Chart component */}
            <div className="flex items-end gap-2 h-36">
              {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 100].map((h, i) => (
                <div key={i} className="w-6 bg-[--color-brand] rounded-t-sm" style={{ height: `${h}%` }} />
              ))}
            </div>
          </div>
        </div>
        <div className="card-slds">
          <div className="card__header">
            <div className="card__title">WO Status Distribution</div>
          </div>
          <div className="h-48 flex items-center justify-center text-[--color-text-secondary] text-sm">
            {/* TODO: Pie chart */}
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[--color-warning]" />
                <span>In Progress (8)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[--color-success]" />
                <span>Completed (24)</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-gray-400" />
                <span>Draft (5)</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Service Orders */}
      <div className="card-slds">
        <div className="card__header">
          <div className="card__title">Recent Service Orders</div>
          <button className="btn btn--sm">View All</button>
        </div>
        <div className="table-wrap border-0 shadow-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. SO</th>
                <th>Customer</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.no}>
                  <td className="font-medium text-[--color-brand]">{order.no}</td>
                  <td>{order.customer}</td>
                  <td><span className={statusPill(order.status)}>{order.status}</span></td>
                  <td>{order.amount}</td>
                  <td className="text-[--color-text-secondary]">{order.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function LayoutDashboardIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-[--color-brand-secondary]"
    >
      <rect width="7" height="9" x="3" y="3" rx="1" />
      <rect width="7" height="5" x="14" y="3" rx="1" />
      <rect width="7" height="9" x="14" y="12" rx="1" />
      <rect width="7" height="5" x="3" y="16" rx="1" />
    </svg>
  );
}
