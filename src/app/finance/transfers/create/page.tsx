"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, ArrowRight } from "lucide-react";

export default function TransferCreatePage() {
  const router = useRouter();

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Buat Transfer Baru</div>
        </div>
        <button className="btn btn--brand btn--sm"><Save size={14} /> Simpan</button>
      </div>

      <div className="card-slds max-w-2xl">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Form Transfer</div>
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="form-group">
              <label className="form-label">Dari Akun *</label>
              <select className="form-select">
                <option value="">Pilih Akun Sumber</option>
                <option>Kas</option>
                <option>Bank BCA</option>
                <option>Bank Mandiri</option>
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
              <select className="form-select">
                <option value="">Pilih Akun Tujuan</option>
                <option>Kas</option>
                <option>Bank BCA</option>
                <option>Bank Mandiri</option>
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Tanggal Transfer *</label>
            <input type="date" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">Jumlah *</label>
            <input type="number" className="form-input" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi *</label>
            <textarea className="form-input" rows={3} placeholder="Deskripsi transfer..." />
          </div>
        </div>
      </div>
    </div>
  );
}
