"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();
  const [customers, setCustomers] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    name: "",
    customerId: "",
    contractValue: "",
    startDate: "",
    endDate: "",
  });

  useEffect(() => {
    fetch("/api/customers?limit=200")
      .then(r => r.json())
      .then(d => setCustomers(d.data || []))
      .catch(() => {});
  }, []);

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    if (!form.name || !form.customerId) {
      setError("Nama project dan customer wajib diisi");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/projects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: form.name,
          customerId: form.customerId,
          contractValue: form.contractValue ? parseInt(form.contractValue.replace(/[^0-9]/g, "")) : 0,
          startDate: form.startDate || undefined,
          endDate: form.endDate || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal menyimpan");
      router.push("/project");
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div className="view-header">
        <div className="view-title">
          <button onClick={() => router.push("/project")} style={S.backBtn}>
            <ArrowLeft size={14} />
          </button>
          Create Project
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn--brand btn--sm">
          <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {error && (
        <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>
      )}

      <div style={S.formCard}>
        <div style={S.formGrid}>
          <div className="form-group">
            <label className="form-label">Nama Project *</label>
            <input
              type="text"
              className="form-input"
              placeholder="Nama project"
              value={form.name}
              onChange={(e) => handleChange("name", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Customer *</label>
            <select
              className="form-select"
              value={form.customerId}
              onChange={(e) => handleChange("customerId", e.target.value)}
            >
              <option value="">Pilih Customer</option>
              {customers.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Periode Mulai</label>
            <input
              type="date"
              className="form-input"
              value={form.startDate}
              onChange={(e) => handleChange("startDate", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Periode Selesai</label>
            <input
              type="date"
              className="form-input"
              value={form.endDate}
              onChange={(e) => handleChange("endDate", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nilai Anggaran</label>
            <input
              type="text"
              className="form-input"
              placeholder="Rp 0"
              value={form.contractValue}
              onChange={(e) => handleChange("contractValue", e.target.value)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 32, height: 32, marginRight: 8,
    fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  formCard: {
    background: "#fff", border: "1px solid #ecebea", borderRadius: 10,
    padding: "24px 28px", boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
    maxWidth: 640,
  },
  formGrid: {
    display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px 24px",
  },
};
