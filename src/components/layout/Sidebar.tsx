"use client";

import {
  LayoutDashboard,
  ClipboardList,
  Wrench,
  Package,
  Users,
  Database,
  BarChart3,
  ChevronDown,
  Menu,
  X,
  FileText,
  DollarSign,
  Receipt,
  CreditCard,
  BookOpen,
  PieChart,
  Briefcase,
  ReceiptText,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

interface NavItem {
  label: string;
  icon: React.ReactNode;
  href?: string;
  children?: { label: string; href: string }[];
}

/* ─── Operasional Nav ─── */
const operasionalGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Overview",
    items: [
      { label: "Dashboard", icon: <LayoutDashboard size={18} />, href: "/dashboard" },
    ],
  },
  {
    title: "Operasional",
    items: [
      {
        label: "Project",
        icon: <Briefcase size={18} />,
        children: [
          { label: "Projects", href: "/project" },
          { label: "Anggaran", href: "/warehouse/anggaran" },
        ],
      },
      {
        label: "Service Orders",
        icon: <ClipboardList size={18} />,
        href: "/service-orders",
      },
      {
        label: "Work Orders",
        icon: <Wrench size={18} />,
        href: "/work-orders",
      },
      {
        label: "Stock Workflow",
        icon: <Package size={18} />,
        children: [
          { label: "Stock Orders", href: "/stock-workflow/stock-orders" },
          { label: "Stock Returns", href: "/stock-workflow/stock-returns" },

        ],
      },
      {
        label: "Warehouse",
        icon: <Package size={18} />,
        children: [
          { label: "Purchase Request", href: "/warehouse/purchase-request" },
          { label: "Pembanding", href: "/warehouse/pembanding" },
          { label: "Purchase Orders", href: "/warehouse/purchase-orders" },
          { label: "Purchase Deliveries", href: "/warehouse/purchase-deliveries" },
          { label: "Purchase Invoices", href: "/warehouse/purchase-invoices" },
          { label: "Purchase Returns", href: "/warehouse/purchase-returns" },
          { label: "Warehouse Stock Transfer", href: "/warehouse/stock-transfer" },
          { label: "Warehouse Stock Opname", href: "/warehouse/stock-opname" },
          { label: "Warehouse Stock Histories", href: "/warehouse/stock-histories" },

        ],
      },
    ],
  },
  {
    title: "Data Master",
    items: [
      {
        label: "Spareparts",
        icon: <Package size={18} />,
        href: "/products",
      },
      {
        label: "Customers",
        icon: <Users size={18} />,
        href: "/master-data/customers",
      },
      {
        label: "Vehicles",
        icon: <Package size={18} />,
        href: "/master-data/vehicles",
      },
      {
        label: "Suppliers",
        icon: <Database size={18} />,
        href: "/master-data/suppliers",
      },
      {
        label: "Services",
        icon: <Wrench size={18} />,
        href: "/master-data/services",
      },
      {
        label: "Package Services",
        icon: <Package size={18} />,
        href: "/service-packages",
      },
      {
        label: "Users",
        icon: <Users size={18} />,
        href: "/master-data/users",
      },
    ],
  },
  {
    title: "Reports",
    items: [
      {
        label: "Service Orders",
        icon: <ClipboardList size={18} />,
        children: [
          { label: "Summary Service Orders", href: "/reports/summary-service-orders" },
          { label: "Detailed Service Orders", href: "/reports/detailed-service-orders" },
        ],
      },
      {
        label: "Work Orders",
        icon: <Wrench size={18} />,
        children: [
          { label: "Summary Service Work Orders", href: "/reports/summary-service-work-orders" },
          { label: "Detailed Service Work Orders", href: "/reports/detailed-service-work-orders" },
        ],
      },
      {
        label: "Service Invoices",
        icon: <FileText size={18} />,
        children: [
          { label: "Summary Service Invoices", href: "/reports/summary-service-invoices" },
          { label: "Detailed Service Invoices", href: "/reports/detailed-service-invoices" },
        ],
      },
      {
        label: "Payments",
        icon: <DollarSign size={18} />,
        children: [
          { label: "Service Payment Received", href: "/reports/service-payment-received" },
          { label: "Service Payment Type Info", href: "/reports/service-payment-type-info" },
          { label: "Daily Service Payments", href: "/reports/daily-service-payments" },
        ],
      },
      {
        label: "Purchase",
        icon: <Package size={18} />,
        children: [
          { label: "Summary Purchase Orders", href: "/reports/summary-purchase-orders" },
          { label: "Summary Purchase Deliveries", href: "/reports/summary-purchase-deliveries" },
          { label: "Summary Purchase Returns", href: "/reports/summary-purchase-returns" },
        ],
      },
      {
        label: "Stock",
        icon: <Database size={18} />,
        children: [
          { label: "Stock Position", href: "/reports/stock-position" },
          { label: "Stock Movement", href: "/reports/stock-movement" },
          { label: "Low Stock Alert", href: "/reports/low-stock" },
        ],
      },
    ],
  },
];

/* ─── Finance Nav ─── */
const financeGroups: { title: string; items: NavItem[] }[] = [
  {
    title: "Dashboard",
    items: [
      {
        label: "Dashboard Finance",
        icon: <LayoutDashboard size={18} />,
        href: "/finance/dashboard",
      },
    ],
  },
  {
    title: "Finance",
    items: [
      {
        label: "Request Payment",
        icon: <FileText size={18} />,
        href: "/finance/request-payment",
      },
      {
        label: "Buku Kasir",
        icon: <BookOpen size={18} />,
        href: "/finance/petty-cash",
      },
      {
        label: "Payment Processing",
        icon: <CreditCard size={18} />,
        children: [
          { label: "Approval Desk", href: "/finance/payment-processing/approval" },
          { label: "Payment Execution", href: "/finance/payment-processing/execution" },
          { label: "Payment History", href: "/finance/payment-processing/history" },
        ],
      },
      {
        label: "Invoices",
        icon: <FileText size={18} />,
        children: [
          { label: "Purchase Invoices", href: "/finance/invoices/purchase" },
          { label: "Invoice Payables", href: "/finance/invoices/payables" },
          { label: "Service Invoices", href: "/finance/invoices/service" },
          { label: "Invoice Receivables", href: "/finance/invoices/receivables" },
        ],
      },
      {
        label: "Finance AR",
        icon: <ReceiptText size={18} />,
        children: [
          { label: "Rencana Tagihan", href: "/finance/ar/rencana-tagihan" },
        ],
      },
      {
        label: "Payments",
        icon: <CreditCard size={18} />,
        href: "/finance/payments",
      },
      {
        label: "Statement of Accounts",
        icon: <BookOpen size={18} />,
        href: "/finance/soa",
      },
      {
        label: "Finance Reports",
        icon: <PieChart size={18} />,
        children: [
          { label: "Account Payables", href: "/finance/reports/ap" },
          { label: "Account Receivables", href: "/finance/reports/ar" },
          { label: "Cash Flow", href: "/finance/reports/cash-flow" },
        ],
      },
    ],
  },
  {
    title: "Accounting",
    items: [
      {
        label: "Buku Besar",
        icon: <Database size={18} />,
        children: [
          { label: "Akun Perkiraan (COA)", href: "/finance/coa" },
          { label: "Account Tree", href: "/finance/coa/tree" },
          { label: "Jurnal Umum", href: "/finance/journal" },
        ],
      },
      {
        label: "Kas & Bank",
        icon: <DollarSign size={18} />,
        children: [
          { label: "Penerimaan", href: "/finance/receipts" },
          { label: "Transfer Bank", href: "/finance/transfers" },
          { label: "Rekonsiliasi Bank", href: "/finance/bank-reconciliation" },
        ],
      },
      {
        label: "Accounting Reports",
        icon: <PieChart size={18} />,
        href: "/finance/accounting-reports",
      },
    ],
  },
  {
    title: "Pengaturan",
    items: [
      {
        label: "Master Data (COA)",
        icon: <Database size={18} />,
        href: "/finance/coa",
      },
    ],
  },
];

// ─── Inline style objects ───
const S = {
  sidebar: {
    width: 260,
    minWidth: 260,
    background: "#032d47",
    color: "#fff",
    flexDirection: "column" as const,
    overflow: "hidden",
    flexShrink: 0,
  },
  logoArea: {
    display: "flex",
    alignItems: "center",
    height: 56,
    padding: "0 16px",
    flexShrink: 0,
    borderBottom: "1px solid rgba(255,255,255,0.1)",
  },
  logoIcon: {
    width: 32,
    height: 32,
    borderRadius: 4,
    background: "#0176d3",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 700,
    fontSize: 16,
    color: "#fff",
    flexShrink: 0,
  },
  logoText: {
    marginLeft: 10,
    fontSize: 15,
    fontWeight: 700,
    color: "#fff",
    whiteSpace: "nowrap" as const,
  },
  tabRow: {
    display: "flex",
    borderBottom: "1px solid rgba(255,255,255,0.1)",
    flexShrink: 0,
  },
  tab: {
    flex: 1,
    padding: "10px 0",
    fontSize: 12,
    fontWeight: 600,
    textAlign: "center" as const,
    cursor: "pointer",
    border: "none",
    background: "transparent",
    color: "rgba(255,255,255,0.4)",
    transition: "all 150ms",
    borderBottom: "2px solid transparent",
  },
  tabActive: {
    color: "#fff",
    borderBottom: "2px solid #0176d3",
    background: "rgba(1,118,211,0.1)",
  },
  nav: {
    flex: 1,
    overflowY: "auto" as const,
    overflowX: "hidden" as const,
    padding: "12px 0",
  },
  sectionTitle: {
    padding: "6px 16px 2px",
    marginBottom: 2,
    fontSize: 10,
    fontWeight: 700,
    textTransform: "uppercase" as const,
    letterSpacing: "0.08em",
    color: "rgba(255,255,255,0.4)",
  },
  navItem: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    width: "100%",
    padding: "8px 16px",
    fontSize: 13,
    fontWeight: 400,
    color: "rgba(255,255,255,0.7)",
    border: "none",
    background: "transparent",
    cursor: "pointer",
    textDecoration: "none",
    transition: "background 150ms, color 150ms",
  },
  navItemActive: {
    background: "rgba(1,118,211,0.25)",
    color: "#fff",
    fontWeight: 600,
  },
  subItem: {
    display: "flex",
    alignItems: "center",
    width: "100%",
    paddingLeft: 52,
    paddingRight: 16,
    paddingTop: 6,
    paddingBottom: 6,
    fontSize: 13,
    fontWeight: 400,
    color: "rgba(255,255,255,0.6)",
    textDecoration: "none",
    transition: "background 150ms, color 150ms",
    cursor: "pointer",
  },
  subItemActive: {
    background: "rgba(1,118,211,0.25)",
    color: "#fff",
    fontWeight: 500,
  },
  iconWrap: {
    width: 20,
    height: 20,
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  chevron: {
    marginLeft: "auto",
    fontSize: 14,
    transition: "transform 150ms",
    color: "rgba(255,255,255,0.5)",
  },
  hamburger: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderTop: "1px solid rgba(255,255,255,0.1)",
    flexShrink: 0,
    cursor: "pointer",
    color: "rgba(255,255,255,0.4)",
    background: "transparent",
    borderLeft: "none",
    borderRight: "none",
    borderBottom: "none",
    width: "100%",
  },
};

interface SidebarProps {
  mobileOpen?: boolean;
  setMobileOpen?: (v: boolean) => void;
}

export default function Sidebar({ mobileOpen = false, setMobileOpen = () => {} }: SidebarProps) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});
  const activeTab: "operasional" | "finance" = pathname.startsWith("/finance") ? "finance" : "operasional";

  const navGroups = activeTab === "operasional" ? operasionalGroups : financeGroups;

  const toggleGroup = (label: string) => {
    setExpandedGroups((prev) => ({ ...prev, [label]: !prev[label] }));
  };

  const isActive = (href?: string) => {
    if (!href) return false;
    return pathname === href || pathname.startsWith(href + "/");
  };

  const isGroupActive = (item: NavItem) => {
    return item.children?.some((child) => isActive(child.href)) || isActive(item.href);
  };

  const navItemHover = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
    e.currentTarget.style.color = "#fff";
  };
  const navItemLeave = (e: React.MouseEvent<HTMLElement>, active?: boolean) => {
    if (active) {
      e.currentTarget.style.background = "rgba(1,118,211,0.25)";
      e.currentTarget.style.color = "#fff";
    } else {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = "rgba(255,255,255,0.7)";
    }
  };
  const subItemHover = (e: React.MouseEvent<HTMLElement>) => {
    e.currentTarget.style.background = "rgba(255,255,255,0.08)";
    e.currentTarget.style.color = "rgba(255,255,255,0.9)";
  };
  const subItemLeave = (e: React.MouseEvent<HTMLElement>, active?: boolean) => {
    if (active) {
      e.currentTarget.style.background = "rgba(1,118,211,0.25)";
      e.currentTarget.style.color = "#fff";
    } else {
      e.currentTarget.style.background = "transparent";
      e.currentTarget.style.color = "rgba(255,255,255,0.6)";
    }
  };

  const renderNav = (groups: { title: string; items: NavItem[] }[]) => (
    <nav style={S.nav}>
      {groups.map((group) => (
        <div key={group.title} style={{ marginBottom: 8 }}>
          {!collapsed && (
            <div style={S.sectionTitle}>{group.title}</div>
          )}

          {group.items.map((item) => {
            const hasChildren = item.children && item.children.length > 0;
            const isExpanded = expandedGroups[item.label] || false;
            const groupActive = isGroupActive(item);

            if (hasChildren) {
              return (
                <div key={item.label}>
                  <button
                    onClick={() => toggleGroup(item.label)}
                    style={{
                      ...S.navItem,
                      ...(groupActive ? S.navItemActive : {}),
                    }}
                    onMouseEnter={navItemHover}
                    onMouseLeave={(e) => navItemLeave(e, groupActive)}
                  >
                    <span style={S.iconWrap}>{item.icon}</span>
                    {!collapsed && (
                      <>
                        <span style={{ flex: 1, textAlign: "left", whiteSpace: "nowrap" }}>
                          {item.label}
                        </span>
                        <span
                          style={{
                            ...S.chevron,
                            transform: isExpanded ? "rotate(180deg)" : "rotate(0)",
                          }}
                        >
                          <ChevronDown size={14} />
                        </span>
                      </>
                    )}
                  </button>

                  {!collapsed && (
                    <div
                      style={{
                        display: "flex",
                        flexDirection: "column",
                        maxHeight: isExpanded ? 500 : 0,
                        opacity: isExpanded ? 1 : 0,
                        overflow: "hidden",
                        transition: "max-height 200ms ease, opacity 200ms ease",
                      }}
                    >
                      {item.children?.map((child) => {
                        const active = pathname === child.href;
                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            style={{
                              ...S.subItem,
                              ...(active ? S.subItemActive : {}),
                            }}
                            onMouseEnter={subItemHover}
                            onMouseLeave={(e) => subItemLeave(e, active)}
                          >
                            <span style={{ whiteSpace: "nowrap" }}>{child.label}</span>
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            const active = isActive(item.href);
            return (
              <Link
                key={item.label}
                href={item.href!}
                style={{
                  ...S.navItem,
                  ...(active ? S.navItemActive : {}),
                }}
                onMouseEnter={navItemHover}
                onMouseLeave={(e) => navItemLeave(e, active)}
              >
                <span style={S.iconWrap}>{item.icon}</span>
                {!collapsed && (
                  <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                )}
              </Link>
            );
          })}
        </div>
      ))}
    </nav>
  );

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={S.logoArea}>
        <div style={S.logoIcon}>P</div>
        {!collapsed && <span style={S.logoText}>pwncorp</span>}
      </div>

      {/* Tab Switcher */}
      {!collapsed && (
        <div style={S.tabRow}>
          <button
            style={{ ...S.tab, ...(activeTab === "operasional" ? S.tabActive : {}) }}
            onClick={() => { if (activeTab !== "operasional") window.location.href = "/dashboard"; }}
          >
            Operasional
          </button>
          <button
            style={{ ...S.tab, ...(activeTab === "finance" ? S.tabActive : {}) }}
            onClick={() => { if (activeTab !== "finance") window.location.href = "/finance"; }}
          >
            Finance
          </button>
        </div>
      )}

      {/* Nav */}
      {renderNav(navGroups)}

      {/* Collapse toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        style={S.hamburger}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = "rgba(255,255,255,0.08)";
          e.currentTarget.style.color = "#fff";
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = "transparent";
          e.currentTarget.style.color = "rgba(255,255,255,0.4)";
        }}
      >
        <Menu size={18} />
      </button>
    </>
  );

  return (
    <>
      {/* ═══ Desktop Sidebar ═══ */}
      <aside
        style={{
          ...S.sidebar,
          ...(collapsed ? { width: 64, minWidth: 64 } : {}),
        }}
        className="hidden lg:flex h-full flex-col"
      >
        {sidebarContent}
      </aside>

      {/* ═══ Mobile Overlay ═══ */}
      {mobileOpen && (
        <div
          className="lg:hidden"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.5)",
            zIndex: 40,
          }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ═══ Mobile Sidebar ═══ */}
      <aside
        className="lg:hidden flex flex-col"
        style={{
          ...S.sidebar,
          position: "fixed",
          inset: 0,
          zIndex: 50,
          transform: mobileOpen ? "translateX(0)" : "translateX(-100%)",
          transition: "transform 200ms",
        }}
      >
        {/* Mobile logo */}
        <div style={{ ...S.logoArea, justifyContent: "space-between" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={S.logoIcon}>P</div>
            <span style={S.logoText}>pwncorp</span>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            style={{ color: "rgba(255,255,255,0.6)", background: "none", border: "none", cursor: "pointer", padding: 4 }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Mobile tab switcher */}
        <div style={S.tabRow}>
          <button
            style={{ ...S.tab, ...(activeTab === "operasional" ? S.tabActive : {}) }}
            onClick={() => { if (activeTab !== "operasional") window.location.href = "/dashboard"; }}
          >
            Operasional
          </button>
          <button
            style={{ ...S.tab, ...(activeTab === "finance" ? S.tabActive : {}) }}
            onClick={() => { if (activeTab !== "finance") window.location.href = "/finance"; }}
          >
            Finance
          </button>
        </div>

        {/* Mobile nav */}
        {renderNav(navGroups)}
      </aside>
    </>
  );
}
