"use client";

import { useEffect, useState } from "react";
import {
  Wrench,
  ClipboardList,
  DollarSign,
  TrendingUp,
  AlertTriangle,
} from "lucide-react";

interface DashboardData {
  stats: {
    woToday: number;
    woInProgress: number;
    woCompleted: number;
    revenueToday: number;
    revenueMonth: number;
  };
  woStatusBreakdown: { status: string; count: number }[];
  recentSO: {
    soNo: string;
    customer: string;
    vehicle: string;
    status: string;
    total: number;
    date: string;
  }[];
  lowStock: { sku: string; name: string; stockQty: number; minStock: number }[];
  masterCounts: { customers: number; vehicles: number; spareparts: number };
  financialSummary: {
    unpaidInvoices: number;
    unpaidAmount: number;
    overdueAR: number;
    overdueAmount: number;
  };
  monthlyRevenue: number[];
}

const statusPill = (status: string) => {
  const map: Record<string, string> = {
    Draft: "pill pill--draft",
    Approved: "pill pill--approved",
    "In Progress": "pill pill--in-progress",
    Completed: "pill pill--completed",
    "Waiting Stock": "pill pill--waiting",
    Cancelled: "pill pill--cancelled",
    Delivered: "pill pill--completed",
  };
  return map[status] || "pill pill--draft";
};

function fmt(n: number): string {
  if (n >= 1_000_000) return `Rp ${(n / 1_000_000).toFixed(1)}jt`;
  if (n >= 1_000) return `Rp ${(n / 1_000).toFixed(0)}rb`;
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function fmtFull(n: number): string {
  return `Rp ${n.toLocaleString("id-ID")}`;
}

function fmtDate(d: string): string {
  return new Date(d).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then(r => r.json())
      .then(d => { setData(d.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="view-header"><div className="view-title">Dashboard</div></div>
    );
  }

  if (!data) {
    return (
      <div className="view-header">
        <div className="view-title">
          <LayoutDashboardIcon /> Dashboard
        </div>
      </div>
    );
  }

  const stats = [
    { label: "WO Hari Ini", value: data.stats.woToday.toString(), icon: ClipboardList, color: "bg-[--color-brand]" },
    { label: "Dalam Proses", value: data.stats.woInProgress.toString(), icon: Wrench, color: "bg-[--color-warning]" },
    { label: "Selesai (Bulan Ini)", value: data.stats.woCompleted.toString(), icon: TrendingUp, color: "bg-[--color-success]" },
    { label: "Pendapatan Hari Ini", value: fmt(data.stats.revenueToday), icon: DollarSign, color: "bg-[--color-brand-secondary]" },
  ];

  const maxRevenue = Math.max(...data.monthlyRevenue, 1);

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <LayoutDashboardIcon />
          Dashboard
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

      {/* Charts + Alerts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        {/* Monthly Revenue Chart */}
        <div className="card-slds">
          <div className="card__header">
            <div className="card__title">Pendapatan 6 Bulan Terakhir</div>
          </div>
          <div className="h-48 flex items-end justify-center gap-2 p-4">
            {data.monthlyRevenue.map((h, i) => (
              <div key={i} className="flex flex-col items-center gap-1 flex-1">
                <div
                  className="w-full bg-[--color-brand] rounded-t-sm min-h-[4px]"
                  style={{ height: `${Math.max((h / maxRevenue) * 100, 4)}%` }}
                />
                <span className="text-[10px] text-[--color-text-secondary]">{fmt(h)}</span>
              </div>
            ))}
          </div>
        </div>

        {/* WO Status Distribution */}
        <div className="card-slds">
          <div className="card__header">
            <div className="card__title">WO Status Distribution</div>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-4">
              {data.woStatusBreakdown.map((s) => (
                <div key={s.status} className="flex items-center gap-2">
                  <span className={`${statusPill(s.status)} text-xs`}>{s.status}</span>
                  <span className="font-bold">{s.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Financial Summary */}
          <div className="card__header mt-2">
            <div className="card__title">Ringkasan Keuangan</div>
          </div>
          <div className="p-4 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>Pendapatan Bulan Ini</span>
              <span className="font-bold text-[--color-success]">{fmtFull(data.stats.revenueMonth)}</span>
            </div>
            <div className="flex justify-between">
              <span>Invoice Belum Dibayar ({data.financialSummary.unpaidInvoices})</span>
              <span className="font-bold text-[--color-warning]">{fmtFull(data.financialSummary.unpaidAmount)}</span>
            </div>
            {data.financialSummary.overdueAR > 0 && (
              <div className="flex justify-between">
                <span className="flex items-center gap-1">
                  <AlertTriangle className="w-3 h-3 text-red-500" />
                  AR Jatuh Tempo ({data.financialSummary.overdueAR})
                </span>
                <span className="font-bold text-red-500">{fmtFull(data.financialSummary.overdueAmount)}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Low Stock Alerts */}
      {data.lowStock.length > 0 && (
        <div className="card-slds mb-6 border-[--color-warning]">
          <div className="card__header">
            <div className="card__title flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-[--color-warning]" />
              Stok Menipis
            </div>
          </div>
          <div className="table-wrap border-0 shadow-none">
            <table className="data-table">
              <thead>
                <tr>
                  <th>SKU</th>
                  <th>Nama</th>
                  <th>Stok</th>
                  <th>Min</th>
                </tr>
              </thead>
              <tbody>
                {data.lowStock.map((s) => (
                  <tr key={s.sku}>
                    <td className="font-mono text-xs">{s.sku}</td>
                    <td>{s.name}</td>
                    <td className="text-red-500 font-bold">{s.stockQty}</td>
                    <td className="text-[--color-text-secondary]">{s.minStock}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Recent Service Orders */}
      <div className="card-slds">
        <div className="card__header">
          <div className="card__title">Recent Service Orders</div>
        </div>
        <div className="table-wrap border-0 shadow-none">
          <table className="data-table">
            <thead>
              <tr>
                <th>No. SO</th>
                <th>Customer</th>
                <th>Vehicle</th>
                <th>Status</th>
                <th>Amount</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {data.recentSO.map((so) => (
                <tr key={so.soNo}>
                  <td className="font-medium text-[--color-brand]">{so.soNo}</td>
                  <td>{so.customer}</td>
                  <td className="text-[--color-text-secondary]">{so.vehicle}</td>
                  <td><span className={statusPill(so.status)}>{so.status}</span></td>
                  <td>{fmt(so.total)}</td>
                  <td className="text-[--color-text-secondary]">{fmtDate(so.date)}</td>
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
