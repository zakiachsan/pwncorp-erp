"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function UserEditPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [form, setForm] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/users/${id}`)
      .then((r) => {
        if (!r.ok) throw new Error("Not found");
        return r.json();
      })
      .then((json) => {
        const d = json.data || json;
        if (!d || !d.id) { setError("User not found"); setLoading(false); return; }
        // Use role name as roleId to match the create page pattern
        const roleName = d.role?.name || d.roleId || "";
        setForm({
          id: d.id,
          name: d.name || "",
          email: d.email || "",
          roleId: roleName,
          password: "",
        });
        setLoading(false);
      })
      .catch(() => { setError("Failed to load user"); setLoading(false); });
  }, [id]);

  const handleSave = async () => {
    if (!form) return;
    setSaving(true);
    try {
      const body: any = {
        name: form.name,
        email: form.email,
        roleId: form.roleId,
      };
      // Only send password if user entered a new one
      if (form.password) {
        body.password = form.password;
      }
      const res = await fetch(`/api/users/${form.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (res.ok) {
        alert("User updated!");
        router.push(`/master-data/users/${id}`);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to update");
      }
    } catch {
      alert("Failed to update");
    }
    setSaving(false);
  };

  if (loading) return <div className="p-6 text-center">Loading...</div>;
  if (error) return <div className="p-6 text-red-500">{error}</div>;
  if (!form) return null;

  const set = (key: string, val: any) => setForm((prev: any) => ({ ...prev, [key]: val }));

  return (
    <div style={{ padding: "0 12px 24px" }} className="sm:px-6 max-w-2xl">
      <div className="flex items-center gap-3 mb-4">
        <button onClick={() => router.back()} className="p-1.5 border border-[#d8d8d8] rounded-lg cursor-pointer">
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Edit User</h1>
      </div>

      <div className="bg-white border border-[#ecebea] rounded-lg p-4 sm:p-6 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="sm:col-span-2">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} />
          </div>
          <div>
            <label className="form-label">Email</label>
            <input type="email" className="form-input" value={form.email} onChange={(e) => set("email", e.target.value)} />
          </div>
          <div>
            <label className="form-label">New Password</label>
            <input type="password" className="form-input" value={form.password} onChange={(e) => set("password", e.target.value)} placeholder="Leave blank to keep current" />
          </div>
          <div className="sm:col-span-2">
            <label className="form-label">Role</label>
            <select className="form-select" value={form.roleId} onChange={(e) => set("roleId", e.target.value)}>
              <option value="">-- Pilih Role --</option>
              <option value="Admin">Admin</option>
              <option value="Service Advisor">Service Advisor</option>
              <option value="Mekanik">Mekanik</option>
              <option value="Finance">Finance</option>
              <option value="Owner">Owner</option>
            </select>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button onClick={handleSave} disabled={saving} className="btn btn--brand flex items-center gap-2">
            <Save size={14} /> {saving ? "Saving..." : "Save"}
          </button>
          <button onClick={() => router.back()} className="btn btn--outline">Cancel</button>
        </div>
      </div>
    </div>
  );
}
