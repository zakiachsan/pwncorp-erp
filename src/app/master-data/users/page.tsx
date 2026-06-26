"use client";

import { useRouter } from "next/navigation";
import { Plus, Search } from "lucide-react";

const users = [
  { id: "U-001", name: "Admin", username: "admin", role: "Admin", status: "Active" },
  { id: "U-002", name: "Rudi", username: "rudi", role: "Service Advisor", status: "Active" },
  { id: "U-003", name: "Ani", username: "ani", role: "Service Advisor", status: "Active" },
  { id: "U-004", name: "Hendra", username: "hendra", role: "Mekanik", status: "Active" },
  { id: "U-005", name: "Agus", username: "agus", role: "Mekanik", status: "Active" },
  { id: "U-006", name: "Bambang", username: "bambang", role: "Mekanik", status: "Active" },
];

export default function UsersPage() {
  const router = useRouter();
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <UsersIcon2 className="w-6 h-6 text-[--color-brand-secondary]" />
          Users
        </div>
        <button
          onClick={() => router.push("/master-data/users/new")}
          className="btn btn--brand btn--sm"
        >
          <Plus size={14} /> Add User
        </button>
      </div>
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="form-group">
            <label className="form-label">Role</label>
            <select className="form-select">
              <option>All Roles</option>
              <option>Admin</option>
              <option>Service Advisor</option>
              <option>Mekanik</option>
              <option>Finance</option>
              <option>Owner</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Nama / Username..." />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center">
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Nama</th>
              <th>Username</th>
              <th>Role</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/master-data/users/${u.id}`)}>
                <td className="font-medium text-[--color-brand]">{u.id}</td>
                <td className="font-medium">{u.name}</td>
                <td className="text-[--color-text-secondary]">{u.username}</td>
                <td><span className="pill bg-[--color-brand] text-white">{u.role}</span></td>
                <td><span className="pill pill--completed">{u.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function UsersIcon2({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
