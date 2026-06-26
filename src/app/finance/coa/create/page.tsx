"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function COACreatePage() {
  const router = useRouter();

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm">
            <ArrowLeft size={16} />
          </button>
          <div className="view-title">Tambah Akun Perkiraan</div>
        </div>
        <button className="btn btn--brand btn--sm"><Save size={14} /> Simpan</button>
      </div>

      <div className="card-slds">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Form Akun</div>
        <div className="space-y-4 max-w-xl">
          <div className="form-group">
            <label className="form-label">Kode Akun *</label>
            <input type="text" className="form-input" placeholder="Contoh: 1101" />
          </div>
          <div className="form-group">
            <label className="form-label">Nama Akun *</label>
            <input type="text" className="form-input" placeholder="Contoh: Kas & Bank" />
          </div>
          <div className="form-group">
            <label className="form-label">Tipe Akun *</label>
            <select className="form-select">
              <option value="">Pilih Tipe</option>
              <option>Aset</option>
              <option>Liabilitas</option>
              <option>Modal</option>
              <option>Pendapatan</option>
              <option>Beban</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Saldo Awal</label>
            <input type="number" className="form-input" placeholder="0" />
          </div>
          <div className="form-group">
            <label className="form-label">Deskripsi</label>
            <textarea className="form-input" rows={3} placeholder="Deskripsi akun..." />
          </div>
        </div>
      </div>
    </div>
  );
}
