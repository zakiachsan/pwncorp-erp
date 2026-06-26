"use client";

import { useRouter } from "next/navigation";

export default function FinancePage() {
  const router = useRouter();

  const menuItems = [
    { title: "Invoices", desc: "Kelola invoice dan pembayaran", icon: "📄", href: "/finance/invoices", color: "#0176d3" },
    { title: "Payments", desc: "Histori pembayaran masuk & keluar", icon: "💰", href: "/finance/payments", color: "#2e844a" },
    { title: "Accounts Receivable", desc: "Piutang dari customer", icon: "📋", href: "/finance/ar", color: "#f59e0b" },
    { title: "Accounts Payable", desc: "Hutang ke supplier", icon: "📑", href: "/finance/ap", color: "#8b5cf6" },
    { title: "General Ledger", desc: "Jurnal & buku besar", icon: "📒", href: "/finance/journal", color: "#0176d3" },
    { title: "Cash Flow", desc: "Arus kas masuk & keluar", icon: "💵", href: "/finance/reports/cash-flow", color: "#2e844a" },
    { title: "Balance Sheet", desc: "Neraca keuangan", icon: "📊", href: "/finance/reports/balance-sheet", color: "#0176d3" },
    { title: "Profit & Loss", desc: "Laba rugi", icon: "📈", href: "/finance/reports/profit-loss", color: "#2e844a" },
    { title: "Bank Reconciliation", desc: "Rekonsiliasi bank", icon: "🏦", href: "/finance/bank-reconciliation", color: "#8b5cf6" },
    { title: "Aging AR", desc: "Piutang jatuh tempo", icon: "⏰", href: "/finance/reports/aging-ar", color: "#f59e0b" },
    { title: "Aging AP", desc: "Hutang jatuh tempo", icon: "⏰", href: "/finance/reports/aging-ap", color: "#8b5cf6" },
  ];

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <FinanceIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Finance & Accounting
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Total Piutang (AR)</div>
          <div className="text-xl font-bold text-[--color-warning]">Rp 6.150.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Total Hutang (AP)</div>
          <div className="text-xl font-bold text-[--color-error]">Rp 4.250.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Cash Flow Bulan Ini</div>
          <div className="text-xl font-bold text-[--color-success]">+ Rp 12.500.000</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Laba Bersih Bulan Ini</div>
          <div className="text-xl font-bold text-[--color-brand]">Rp 8.250.000</div>
        </div>
      </div>

      {/* Menu Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {menuItems.map((item) => (
          <div
            key={item.title}
            onClick={() => router.push(item.href)}
            className="card-slds cursor-pointer hover:shadow-slds-md transition-shadow"
          >
            <div className="flex items-center gap-3 mb-2">
              <div style={{ width: 40, height: 40, borderRadius: 8, background: item.color + "15", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>
                {item.icon}
              </div>
              <div>
                <div className="font-semibold text-[--color-text-primary]">{item.title}</div>
                <div className="text-xs text-[--color-text-secondary]">{item.desc}</div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function FinanceIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="12" x2="12" y1="2" y2="22" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}
