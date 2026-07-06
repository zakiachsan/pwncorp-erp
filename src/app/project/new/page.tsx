"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Save } from "lucide-react";

export default function NewProjectPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    noPesanan: "",
    name: "",
    customer: "",
    periodeStart: "",
    periodeEnd: "",
    nilai: "",
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    if (!form.name || !form.customer) return;
    // In production: POST to API, then redirect
    router.push("/project");
  };

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div className="view-header">
        <div className="view-title">
          <button
            onClick={() => router.push("/project")}
            style={S.backBtn}
          >
            <ArrowLeft size={14} />
          </button>
          Create Project
        </div>
        <button onClick={handleSave} className="btn btn--brand btn--sm">
          <Save size={14} /> Simpan
        </button>
      </div>

      <div style={S.formCard}>
        <div style={S.formGrid}>
          <div className="form-group">
            <label className="form-label">No. Pesanan</label>
            <input
              type="text"
              className="form-input"
              placeholder="PO-2026-XXXX"
              value={form.noPesanan}
              onChange={(e) => handleChange("noPesanan", e.target.value)}
            />
          </div>
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
              value={form.customer}
              onChange={(e) => handleChange("customer", e.target.value)}
            >
              <option value="">Pilih Customer</option>
              <option>PT Maju Jaya</option>
              <option>PT Transport Jaya</option>
              <option>CV Berkah Abadi</option>
              <option>Budi Santoso</option>
              <option>Ahmad Fauzi</option>
              <option>Siti Rahmawati</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Periode Mulai</label>
            <input
              type="date"
              className="form-input"
              value={form.periodeStart}
              onChange={(e) => handleChange("periodeStart", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Periode Selesai</label>
            <input
              type="date"
              className="form-input"
              value={form.periodeEnd}
              onChange={(e) => handleChange("periodeEnd", e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Nilai Anggaran</label>
            <input
              type="text"
              className="form-input"
              placeholder="Rp 0"
              value={form.nilai}
              onChange={(e) => handleChange("nilai", e.target.value)}
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
