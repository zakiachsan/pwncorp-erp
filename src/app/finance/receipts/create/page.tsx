"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function ReceiptCreatePage() {
  const router = useRouter();

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Buat Penerimaan Baru</div>
        </div>
        <button className="btn btn--brand btn--sm"><Save size={14} /> Simpan</button>
      </div>

      <div className="card-slds max-w-2xl">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Form Penerimaan</div>
        <div className="space-y-4">
          <div className="form-group">
            <label className="form-label">No. Invoice *</label>
            <select className="form-select">
              <option value="">Pilih Invoice</option>
              <option>INV-001 - Budi Santoso - Rp 2.500.000</option>
              <option>INV-003 - Siti Rahmawati - Rp 5.200.000</option>
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
            <label className="form-label">Tanggal Terima *</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah Terima *</label>
            <input type="number" className="form-input" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-input" rows={3} placeholder="Deskripsi penerimaan..." />
          </div>
          <div className="form-group">
            <label className="form-label">Bukti Terima</label>
            <input type="file" className="form-input" accept="image/*,.pdf" />
          </div>
        </div>
      </div>
    </div>
  );
}
