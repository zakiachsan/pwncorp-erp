"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";

export default function ReceiptCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({
    invoiceId: "",
    bankAccountId: "",
    amount: 0,
    description: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    fetch("/api/invoices?limit=100&status=UNPAID").then(r => r.json()).then(d => setInvoices(d.data || [])).catch(() => {});
    fetch("/api/bank-accounts?limit=100").then(r => r.json()).then(d => setBankAccounts(d.data || [])).catch(() => {});
  }, []);

  const handleSave = async () => {
    if (!form.invoiceId || !form.bankAccountId || !form.amount) {
      alert("Invoice, akun bank, dan jumlah wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/receipts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/finance/receipts");
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
          <div className="view-title">Buat Penerimaan Baru</div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn--brand btn--sm">
          <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="card-slds max-w-2xl">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Form Penerimaan</div>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">No. Invoice *</label>
            <select className="form-select" value={form.invoiceId} onChange={e => setForm(f => ({ ...f, invoiceId: e.target.value }))}>
              <option value="">Pilih Invoice</option>
              {invoices.map((inv: any) => (
                <option key={inv.id} value={inv.id}>{inv.invNo} - {inv.customer?.name} - Rp {(inv.amountDue || 0).toLocaleString("id-ID")}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cash/Bank *</label>
            <select className="form-select" value={form.bankAccountId} onChange={e => setForm(f => ({ ...f, bankAccountId: e.target.value }))}>
              <option value="">Pilih Akun</option>
              {bankAccounts.map((ba: any) => (
                <option key={ba.id} value={ba.id}>{ba.bankName} - {ba.accountNo}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Terima *</label>
            <input type="date" className="form-input" value={form.date} onChange={e => setForm(f => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah Terima *</label>
            <input type="number" className="form-input" placeholder="0" value={form.amount || ""} onChange={e => setForm(f => ({ ...f, amount: Number(e.target.value) }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-input" rows={3} placeholder="Deskripsi penerimaan..." value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
          </div>
        </div>
      </div>
    </div>
  );
}
