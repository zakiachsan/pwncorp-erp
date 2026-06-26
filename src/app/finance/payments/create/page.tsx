"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function PaymentCreatePage() {
  const router = useRouter();

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Buat Pembayaran Baru</div>
        </div>
        <button className="btn btn--brand btn--sm"><Save size={14} /> Simpan</button>
      </div>

      <div className="card-slds max-w-2xl">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Form Pembayaran</div>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">No. Invoice *</label>
            <select className="form-select">
              <option value="">Pilih Invoice</option>
              <option>INV-002 - PT Maju Jaya - Rp 1.800.000</option>
              <option>INV-003 - Siti Rahmawati - Rp 2.600.000</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cash/Bank *</label>
            <select className="form-select">
              <option value="">Pilih Akun</option>
              <option>Kas</option>
              <option>Bank BCA</option>
              <option>Bank Mandiri</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Bayar *</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah Bayar *</label>
            <input type="number" className="form-input" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-input" rows={3} placeholder="Deskripsi pembayaran..." />
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
