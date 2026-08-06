"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";

const KATEGORI_MAP: Record<string, string> = {
  Aset: "Asset",
  Liabilitas: "Liability",
  Modal: "Equity",
  Pendapatan: "Revenue",
  Beban: "Expense",
};

// Aset & Beban → Debit; sisanya → Kredit (standar akuntansi)
const DEFAULT_BALANCE: Record<string, string> = {
  Aset: "Debit",
  Liabilitas: "Kredit",
  Modal: "Kredit",
  Pendapatan: "Kredit",
  Beban: "Debit",
};

export default function COACreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [parents, setParents] = useState<any[]>([]);
  const [form, setForm] = useState({
    code: "",
    name: "",
    kategori: "",
    normalBalance: "Debit",
    parentId: "",
  });

  useEffect(() => {
    fetch("/api/coa?flat=true")
      .then((r) => r.json())
      .then((d) => setParents(d.data || []))
      .catch(() => {});
  }, []);

  const selectKategori = (k: string) => {
    setForm((f) => ({ ...f, kategori: k, normalBalance: DEFAULT_BALANCE[k] || f.normalBalance }));
  };

  const handleSave = async () => {
    if (!form.code.trim() || !form.name.trim() || !form.kategori) {
      alert("Kode, nama, dan tipe akun wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const parent = parents.find((p: any) => p.id === form.parentId);
      const res = await fetch("/api/coa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: form.code.trim(),
          name: form.name.trim(),
          kategori: KATEGORI_MAP[form.kategori],
          normalBalance: form.normalBalance,
          parentId: form.parentId || null,
          level: parent ? (parent.level || 1) + 1 : 1,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/finance/coa");
      } else {
        alert(data.error || "Gagal menyimpan");
      }
    } catch {
      alert("Gagal menyimpan");
    }
    setSaving(false);
  };

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm">
            <ArrowLeft size={16} />
          </button>
          <div className="view-title">Tambah Akun Perkiraan</div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn--brand btn--sm">
          <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="card-slds">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Form Akun</div>
        <div className="space-y-4 max-w-xl">
          <div className="form-group">
            <label className="form-label">Kode Akun *</label>
            <input type="text" className="form-input" placeholder="Contoh: 1101" value={form.code} onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Nama Akun *</label>
            <input type="text" className="form-input" placeholder="Contoh: Kas & Bank" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Tipe Akun *</label>
            <select className="form-select" value={form.kategori} onChange={(e) => selectKategori(e.target.value)}>
              <option value="">Pilih Tipe</option>
              {Object.keys(KATEGORI_MAP).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Saldo Normal *</label>
            <select className="form-select" value={form.normalBalance} onChange={(e) => setForm((f) => ({ ...f, normalBalance: e.target.value }))}>
              <option value="Debit">Debit</option>
              <option value="Kredit">Kredit</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Akun Induk</label>
            <select className="form-select" value={form.parentId} onChange={(e) => setForm((f) => ({ ...f, parentId: e.target.value }))}>
              <option value="">Tidak ada (Akun Utama)</option>
              {parents.map((p: any) => (
                <option key={p.id} value={p.id}>{p.code} - {p.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
}
