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

const navGroups: { title: string; items: NavItem[] }[] = [
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
        label: "Inventory",
        icon: <Package size={18} />,
        children: [
          { label: "Sparepart", href: "/inventory" },
          { label: "Purchase Orders", href: "/inventory/po" },
          { label: "Stock Opname", href: "/inventory/stock-opname" },
        ],
      },
    ],
  },
  {
    title: "Data Master",
    items: [
      {
        label: "Master Data",
        icon: <Database size={18} />,
        children: [
          { label: "Customers", href: "/master-data/customers" },
          { label: "Vehicles", href: "/master-data/vehicles" },
          { label: "Suppliers", href: "/master-data/suppliers" },
          { label: "Sparepart", href: "/master-data/sparepart" },
          { label: "Services", href: "/master-data/services" },
        ],
      },
      {
        label: "Users",
        icon: <Users size={18} />,
        href: "/master-data/users",
      },
    ],
  },
  {
    title: "Accounting",
    items: [
      {
        label: "Accounting",
        icon: <BarChart3 size={18} />,
        href: "/finance",
      },
      {
        label: "Buku Besar",
        icon: <Database size={18} />,
        children: [
          { label: "Akun Perkiraan (COA)", href: "/finance/coa" },
          { label: "Jurnal Umum", href: "/finance/journal" },
        ],
      },
      {
        label: "Kas & Bank",
        icon: <BarChart3 size={18} />,
        children: [
          { label: "Pembayaran", href: "/finance/payments" },
          { label: "Penerimaan", href: "/finance/receipts" },
          { label: "Transfer Bank", href: "/finance/transfers" },
          { label: "Rekonsiliasi Bank", href: "/finance/bank-reconciliation" },
        ],
      },
      {
        label: "Penjualan",
        icon: <ClipboardList size={18} />,
        children: [
          { label: "Faktur Penjualan", href: "/finance/invoices" },
        ],
      },
      {
        label: "Laporan",
        icon: <Wrench size={18} />,
        children: [
          { label: "Laporan Keuangan", href: "/finance/reports" },
        ],
      },
    ],
  },
];

// ─── Inline style objects (guaranteed to work) ───
const S = {
  sidebar: {
    width: 260,
    minWidth: 260,
    height: "100vh",
    background: "#032d47",
    color: "#fff",
    display: "flex",
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

export default function Sidebar() {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({});

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

  const sidebarContent = (
    <>
      {/* Logo */}
      <div style={S.logoArea}>
        <div style={S.logoIcon}>P</div>
        {!collapsed && <span style={S.logoText}>pwncorp</span>}
      </div>

      {/* Nav */}
      <nav style={S.nav}>
        {navGroups.map((group) => (
          <div key={group.title} style={{ marginBottom: 8 }}>
            {!collapsed && (
              <div style={S.sectionTitle}>{group.title}</div>
            )}

            {group.items.map((item) => {
              const hasChildren = item.children && item.children.length > 0;
              const isExpanded = expandedGroups[item.label] ?? true;
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

                    {/* Sub-menu — guaranteed flex column via inline style */}
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
        className="hidden lg:flex"
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
        className="lg:hidden"
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

        {/* Mobile nav */}
        <nav style={S.nav}>
          {navGroups.map((group) => (
            <div key={group.title} style={{ marginBottom: 8 }}>
              <div style={S.sectionTitle}>{group.title}</div>

              {group.items.map((item) => {
                const hasChildren = item.children && item.children.length > 0;
                const isExpanded = expandedGroups[item.label] ?? true;
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
                      </button>

                      {isExpanded && item.children && (
                        <div style={{ display: "flex", flexDirection: "column" }}>
                          {item.children.map((child) => {
                            const active = pathname === child.href;
                            return (
                              <Link
                                key={child.href}
                                href={child.href}
                                onClick={() => setMobileOpen(false)}
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
                    onClick={() => setMobileOpen(false)}
                    style={{
                      ...S.navItem,
                      ...(active ? S.navItemActive : {}),
                    }}
                    onMouseEnter={navItemHover}
                    onMouseLeave={(e) => navItemLeave(e, active)}
                  >
                    <span style={S.iconWrap}>{item.icon}</span>
                    <span style={{ whiteSpace: "nowrap" }}>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </nav>
      </aside>

      {/* ═══ Mobile hamburger ═══ */}
      <button
        className="lg:hidden"
        onClick={() => setMobileOpen(true)}
        style={{
          position: "fixed",
          top: 12,
          left: 12,
          zIndex: 30,
          padding: 8,
          background: "#fff",
          border: "1px solid #ecebea",
          borderRadius: 4,
          boxShadow: "0 2px 4px rgba(0,0,0,0.06)",
          cursor: "pointer",
        }}
      >
        <Menu size={20} style={{ color: "#001526" }} />
      </button>
    </>
  );
}
