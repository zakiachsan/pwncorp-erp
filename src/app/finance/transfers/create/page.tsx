"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, ArrowRight } from "lucide-react";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

export default function TransferCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({
    fromBankId: "",
    toBankId: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetch("/api/bank-accounts?limit=100").then(r => r.json()).then(d => setBankAccounts(d.data || [])).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.fromBankId || !form.toBankId || !form.amount) {
      alert("Akun sumber, tujuan, dan jumlah wajib diisi");
      return;
    }
    if (form.fromBankId === form.toBankId) {
      alert("Akun sumber dan tujuan harus berbeda");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/transfers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/finance/transfers");
      } else {
        const err = await res.json();
        alert(err.error || "Gagal menyimpan");
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
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Buat Transfer Baru</div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn--brand btn--sm">
          <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="card-slds max-w-2xl">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Form Transfer</div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Dari Akun *</label>
              <select className="form-select" value={form.fromBankId} onChange={e => setForm(f => ({ ...f, fromBankId: e.target.value }))}>
                <option value="">Pilih Akun Sumber</option>
                {bankAccounts.map((ba: any) => (
                  <option key={ba.id} value={ba.id}>{ba.bankName} - {ba.accountNo}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">&nbsp;</label>
              <div className="flex items-center justify-center py-2">
                <ArrowRight className="text-[--color-brand]" size={20} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Ke Akun *</label>
              <select className="form-select" value={form.toBankId} onChange={e => setForm(f => ({ ...f, toBankId: e.target.value }))}>
                <option value="">Pilih Akun Tujuan</option>
                {bankAccounts.map((ba: any) => (
                  <option key={ba.id} value={ba.id}>{ba.bankName} - {ba.accountNo}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Transfer *</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah *</label>
            <FormattedNumberInput className="form-input" placeholder="0" value={form.amount || 0} onChange={val => setForm(f => ({ ...f, amount: val }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi *</label>
            <textarea className="form-input" rows={3} placeholder="Deskripsi transfer..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
      </div>
    </div>
  );
}
