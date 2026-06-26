"use client";

import { Download } from "lucide-react";

export default function ProfitLossPage() {
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <TrendIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Laba Rugi / Profit & Loss
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export PDF</button>
        </div>
      </div>

      {/* Period */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="form-group">
            <label className="form-label">Periode</label>
            <input type="month" className="form-input" />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm">Tampilkan</button>
          </div>
        </div>
      </div>

      <div className="card-slds">
        <div className="space-y-3">
          {/* Revenue */}
          <div className="py-3">
            <div className="text-sm font-bold text-[--color-text-secondary] uppercase mb-3">Pendapatan</div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div className="text-sm">Pendapatan Jasa Servis</div>
              <div className="font-medium">Rp 18.500.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div className="text-sm">Pendapatan Sparepart</div>
              <div className="font-medium">Rp 12.250.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div className="text-sm">Pendapatan Lain-lain</div>
              <div className="font-medium">Rp 1.500.000</div>
            </div>
            <div className="flex justify-between items-center py-2 font-bold border-t border-[--color-text-primary] pt-2">
              <span>Total Pendapatan</span>
              <span className="text-[--color-success]">Rp 32.250.000</span>
            </div>
          </div>

          {/* COGS */}
          <div className="py-3 border-t border-[--color-border]">
            <div className="text-sm font-bold text-[--color-text-secondary] uppercase mb-3">Harga Pokok Penjualan</div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div className="text-sm">Beban Sparepart</div>
              <div className="font-medium">Rp 8.750.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div className="text-sm">Beban Jasa Teknisi</div>
              <div className="font-medium">Rp 6.500.000</div>
            </div>
            <div className="flex justify-between items-center py-2 font-bold border-t border-[--color-text-primary] pt-2">
              <span>Total HPP</span>
              <span className="text-[--color-error]">Rp 15.250.000</span>
            </div>
          </div>

          {/* Gross Profit */}
          <div className="py-3 border-t border-[--color-border]">
            <div className="flex justify-between items-center py-2 font-bold text-lg">
              <span>Laba Kotor</span>
              <span className="text-[--color-brand]">Rp 17.000.000</span>
            </div>
          </div>

          {/* OpEx */}
          <div className="py-3 border-t border-[--color-border]">
            <div className="text-sm font-bold text-[--color-text-secondary] uppercase mb-3">Beban Operasional</div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div className="text-sm">Gaji Karyawan</div>
              <div className="font-medium">Rp 5.000.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div className="text-sm">Listrik & Air</div>
              <div className="font-medium">Rp 750.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div className="text-sm">Sewa Tempat</div>
              <div className="font-medium">Rp 2.000.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div className="text-sm">Peralatan Kantor</div>
              <div className="font-medium">Rp 500.000</div>
            </div>
            <div className="flex justify-between items-center py-2 font-bold border-t border-[--color-text-primary] pt-2">
              <span>Total Beban Operasional</span>
              <span className="text-[--color-error]">Rp 8.250.000</span>
            </div>
          </div>

          {/* Net Profit */}
          <div className="py-3 border-t-2 border-[--color-text-primary]">
            <div className="flex justify-between items-center py-2 font-bold text-xl">
              <span>LABA BERSIH</span>
              <span className="text-[--color-success]">Rp 8.750.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TrendIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
      <polyline points="16 7 22 7 22 13" />
    </svg>
  );
}
