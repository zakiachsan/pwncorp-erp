"use client";

import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save } from "lucide-react";
import FormattedNumberInput from "@/components/ui/FormattedNumberInput";

export default function PaymentCreatePage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [bankAccounts, setBankAccounts] = useState<any[]>([]);
  const [form, setForm] = useState({
    invoiceId: "",
    bank: "", // "cash" | bankAccountId
    amount: 0,
    date: new Date().toISOString().split("T")[0],
    notes: "",
  });

  useEffect(() => {
    // Semua invoice yang masih punya sisa tagihan (UNPAID + PARTIAL)
    fetch("/api/invoices?limit=100")
      .then((r) => r.json())
      .then((d) => setInvoices((d.data || []).filter((inv: any) => (inv.amountDue || 0) > 0 && inv.status !== "VOID")))
      .catch(() => {});
    fetch("/api/bank-accounts?limit=100")
      .then((r) => r.json())
      .then((d) => setBankAccounts(d.data || []))
      .catch(() => {});
  }, []);

  const selectInvoice = (id: string) => {
    const inv = invoices.find((i: any) => i.id === id);
    setForm((f) => ({ ...f, invoiceId: id, amount: inv ? inv.amountDue : f.amount }));
  };

  const handleSave = async () => {
    if (!form.invoiceId || !form.bank || !form.amount || form.amount <= 0) {
      alert("Invoice, Cash/Bank, dan jumlah wajib diisi");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          invoiceId: form.invoiceId,
          amount: form.amount,
          paymentMethod: form.bank === "cash" ? "cash" : "transfer",
          notes: form.notes || undefined,
        }),
      });
      const data = await res.json();
      if (res.ok) {
        router.push("/finance/payments");
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
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Buat Pembayaran Baru</div>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn--brand btn--sm">
          <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      <div className="card-slds max-w-2xl">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Form Pembayaran</div>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">No. Invoice *</label>
            <select className="form-select" value={form.invoiceId} onChange={(e) => selectInvoice(e.target.value)}>
              <option value="">Pilih Invoice</option>
              {invoices.map((inv: any) => (
                <option key={inv.id} value={inv.id}>{inv.invNo} - {inv.customer?.name} - Rp {(inv.amountDue || 0).toLocaleString("id-ID")}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cash/Bank *</label>
            <select className="form-select" value={form.bank} onChange={(e) => setForm((f) => ({ ...f, bank: e.target.value }))}>
              <option value="">Pilih Akun</option>
              <option value="cash">Kas (Tunai)</option>
              {bankAccounts.map((ba: any) => (
                <option key={ba.id} value={ba.id}>{ba.bankName} - {ba.accountNo}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Bayar *</label>
            <input type="date" className="form-input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah Bayar *</label>
            <FormattedNumberInput className="form-input" placeholder="0" value={form.amount || 0} onChange={(val) => setForm((f) => ({ ...f, amount: val }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-input" rows={3} placeholder="Deskripsi pembayaran..." value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Bukti Bayar</label>
            <input type="file" className="form-input" accept="image/*,.pdf" />
          </div>
        </div>
      </div>
    </div>
  );
}
