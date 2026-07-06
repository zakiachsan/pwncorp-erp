"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Plus, Search, Settings } from "lucide-react";

const tabOptions = [
  { key: "operasional", label: "Tab Operasional" },
  { key: "finance", label: "Tab Finance" },
];

const allMenus: { section: string; items: { key: string; label: string }[] }[] = [
  {
    section: "Overview",
    items: [{ key: "dashboard", label: "Dashboard" }],
  },
  {
    section: "Operasional",
    items: [
      { key: "project", label: "Project" },
      { key: "service-orders", label: "Service Orders" },
      { key: "work-orders", label: "Work Orders" },
      { key: "stock-workflow", label: "Stock Workflow" },
      { key: "warehouse", label: "Warehouse" },
      { key: "anggaran", label: "Anggaran" },
    ],
  },
  {
    section: "Finance",
    items: [
      { key: "dashboard-finance", label: "Dashboard Finance" },
      { key: "request-payment", label: "Request Payment" },
      { key: "petty-cash", label: "Buku Kasir" },
      { key: "payment-processing", label: "Payment Processing" },
      { key: "invoices", label: "Invoices" },
      { key: "payments", label: "Payments" },
      { key: "soa", label: "Statement of Accounts" },
      { key: "finance-reports", label: "Finance Reports" },
    ],
  },
  {
    section: "Accounting",
    items: [
      { key: "buku-besar", label: "Buku Besar" },
      { key: "kas-bank", label: "Kas & Bank" },
      { key: "accounting-reports", label: "Accounting Reports" },
    ],
  },
  {
    section: "Data Master",
    items: [
      { key: "products", label: "Product" },
      { key: "customers", label: "Customers" },
      { key: "vehicles", label: "Vehicles" },
      { key: "suppliers", label: "Suppliers" },
      { key: "services", label: "Services" },
      { key: "users", label: "Users" },
    ],
  },
];

interface UserEntry {
  id: string;
  name: string;
  username: string;
  role: string;
  status: string;
  allowedTabs: string[];
  allowedMenus: string[];
}

const initialUsers: UserEntry[] = [
  { id: "U-001", name: "Admin", username: "admin", role: "Admin", status: "Active", allowedTabs: ["operasional", "finance"], allowedMenus: allMenus.flatMap(s => s.items.map(i => i.key)) },
  { id: "U-002", name: "Rudi", username: "rudi", role: "Service Advisor", status: "Active", allowedTabs: ["operasional"], allowedMenus: ["dashboard", "service-orders", "work-orders", "project"] },
  { id: "U-003", name: "Ani", username: "ani", role: "Service Advisor", status: "Active", allowedTabs: ["operasional"], allowedMenus: ["dashboard", "service-orders", "work-orders", "project"] },
  { id: "U-004", name: "Hendra", username: "hendra", role: "Mekanik", status: "Active", allowedTabs: ["operasional"], allowedMenus: ["dashboard", "work-orders"] },
  { id: "U-005", name: "Agus", username: "agus", role: "Mekanik", status: "Active", allowedTabs: ["operasional"], allowedMenus: ["dashboard", "work-orders"] },
  { id: "U-006", name: "Bambang", username: "bambang", role: "Mekanik", status: "Active", allowedTabs: ["operasional"], allowedMenus: ["dashboard", "work-orders"] },
  { id: "U-007", name: "Sari", username: "sari", role: "Finance", status: "Active", allowedTabs: ["finance"], allowedMenus: ["dashboard-finance", "request-payment", "petty-cash", "payment-processing", "accounting-reports"] },
  { id: "U-008", name: "Owner", username: "owner", role: "Owner", status: "Active", allowedTabs: ["operasional", "finance"], allowedMenus: allMenus.flatMap(s => s.items.map(i => i.key)) },
];

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserEntry[]>(initialUsers);
  const [editUser, setEditUser] = useState<string | null>(null);

  const toggleTab = (userId: string, tab: string) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const tabs = u.allowedTabs.includes(tab)
        ? u.allowedTabs.filter((t) => t !== tab)
        : [...u.allowedTabs, tab];
      return { ...u, allowedTabs: tabs };
    }));
  };

  const toggleMenu = (userId: string, menu: string) => {
    setUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const menus = u.allowedMenus.includes(menu)
        ? u.allowedMenus.filter((m) => m !== menu)
        : [...u.allowedMenus, menu];
      return { ...u, allowedMenus: menus };
    }));
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <UsersIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          User Management
        </div>
        <button onClick={() => router.push("/master-data/users/new")} className="btn btn--brand btn--sm">
          <Plus size={14} /> Add User
        </button>
      </div>

      {/* User Table */}
      <div className="table-wrap mb-4">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Username</th>
              <th>Role</th>
              <th>Tab Akses</th>
              <th>Menu Akses</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="font-medium" style={{ color: "var(--color-brand)" }}>{u.id}</td>
                <td className="font-medium">{u.name}</td>
                <td className="text-[--color-text-secondary]">{u.username}</td>
                <td><span className="pill bg-[--color-brand] text-white">{u.role}</span></td>
                <td>
                  <div style={{ display: "flex", gap: 4, flexWrap: "wrap" }}>
                    {tabOptions.map((t) => (
                      <span key={t.key} style={{
                        display: "inline-block", padding: "1px 6px", borderRadius: 4, fontSize: 10, fontWeight: 600,
                        background: u.allowedTabs.includes(t.key) ? "#e3f2fd" : "#f5f5f5",
                        color: u.allowedTabs.includes(t.key) ? "#0176d3" : "#bbb",
                      }}>{t.key === "operasional" ? "OP" : "FIN"}</span>
                    ))}
                  </div>
                </td>
                <td>
                  <span style={{ fontSize: 11, color: "#444746" }}>{u.allowedMenus.length} menu</span>
                </td>
                <td><span className="pill pill--completed">{u.status}</span></td>
                <td>
                  <button
                    onClick={() => setEditUser(editUser === u.id ? null : u.id)}
                    style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 12, fontWeight: 500, color: "#0176d3", background: "#e3f2fd", border: "none", borderRadius: 6, cursor: "pointer" }}
                  >
                    <Settings size={13} /> Manage Access
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Access Management Panel */}
      {editUser && (() => {
        const user = users.find((u) => u.id === editUser);
        if (!user) return null;
        return (
          <div className="card-slds" style={{ padding: 20 }}>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: "#001526", marginBottom: 16 }}>
              Manage Access — {user.name} ({user.role})
            </h3>

            {/* Tab Access */}
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", marginBottom: 8 }}>Tab Access</div>
              <div style={{ display: "flex", gap: 8 }}>
                {tabOptions.map((t) => {
                  const has = user.allowedTabs.includes(t.key);
                  return (
                    <label key={t.key} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 14px", background: has ? "#e3f2fd" : "#f5f5f5", borderRadius: 8, cursor: "pointer", border: `1px solid ${has ? "#90caf9" : "#e0e0e0"}`, fontSize: 13, fontWeight: 500, color: has ? "#0176d3" : "#8e8f8e" }}>
                      <input type="checkbox" checked={has} onChange={() => toggleTab(user.id, t.key)} style={{ accentColor: "#0176d3" }} />
                      {t.label}
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Menu Access */}
            <div>
              <div style={{ fontSize: 11, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", marginBottom: 8 }}>Menu Access</div>
              {allMenus.map((section) => (
                <div key={section.section} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: "#444746", marginBottom: 6 }}>{section.section}</div>
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
                    {section.items.map((menu) => {
                      const has = user.allowedMenus.includes(menu.key);
                      return (
                        <label key={menu.key} style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", background: has ? "#e8f0fe" : "#fafafa", borderRadius: 6, cursor: "pointer", border: `1px solid ${has ? "#a8c8fa" : "#ecebea"}`, fontSize: 12, fontWeight: 500, color: has ? "#0176d3" : "#8e8f8e" }}>
                          <input type="checkbox" checked={has} onChange={() => toggleMenu(user.id, menu.key)} style={{ accentColor: "#0176d3" }} />
                          {menu.label}
                        </label>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}
    </div>
  );
}

function UsersIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
