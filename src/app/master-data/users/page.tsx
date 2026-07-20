"use client";

import { useEffect, useState } from "react";
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
  email: string;
  role: string;
  store: string;
  isActive: boolean;
  allowedTabs: string[];
  allowedMenus: string[];
}

export default function UsersPage() {
  const router = useRouter();
  const [users, setUsers] = useState<UserEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editUser, setEditUser] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/users?page=1&limit=200")
      .then((r) => r.json())
      .then((json) => {
        const apiData = (json.data || []).map((u: any) => ({
          id: u.id,
          name: u.name,
          email: u.email || "-",
          role: u.role?.name || "User",
          store: u.store?.name || u.store?.code || "-",
          isActive: u.isActive ?? true,
          allowedTabs: ["operasional", "finance"],
          allowedMenus: allMenus.flatMap((s) => s.items.map((i) => i.key)),
        }));
        setUsers(apiData);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load users"); setLoading(false); });
  }, []);

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

      {loading && <div className="p-8 text-center text-[--color-text-secondary]">Loading...</div>}
      {error && <div className="p-8 text-center text-red-500">{error}</div>}

      {!loading && !error && (
        <>
          {/* User Table */}
          <div className="table-wrap mb-4">
            <table className="data-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nama</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Store</th>
                  <th>Tab Akses</th>
                  <th>Menu Akses</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {users.length === 0 && (
                  <tr>
                    <td colSpan={9} className="text-center py-8 text-[--color-text-secondary]">No users found</td>
                  </tr>
                )}
                {users.map((u) => (
                  <tr key={u.id}>
                    <td className="font-medium" style={{ color: "var(--color-brand)" }}>{u.id}</td>
                    <td className="font-medium">{u.name}</td>
                    <td className="text-[--color-text-secondary]" style={{ fontSize: 12 }}>{u.email}</td>
                    <td><span className="pill bg-[--color-brand] text-white">{u.role}</span></td>
                    <td><span className="text-[--color-text-secondary]" style={{ fontSize: 12 }}>{u.store}</span></td>
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
                    <td><span className={`pill ${u.isActive ? "pill--completed" : "bg-red-100 text-red-600"}`}>{u.isActive ? "Active" : "Inactive"}</span></td>
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
        </>
      )}
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
