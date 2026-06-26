"use client";

import { Download } from "lucide-react";

export default function BalanceSheetPage() {
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ChartIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Neraca / Balance Sheet
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

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ASSETS */}
        <div className="card-slds">
          <h3 className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Aset</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div>
                <div className="text-sm font-medium">Kas & Bank</div>
                <div className="text-xs text-[--color-text-secondary]">1101 - 1102</div>
              </div>
              <div className="font-medium">Rp 15.250.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div>
                <div className="text-sm font-medium">Piutang Usaha</div>
                <div className="text-xs text-[--color-text-secondary]">1200</div>
              </div>
              <div className="font-medium">Rp 4.400.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div>
                <div className="text-sm font-medium">Persediaan</div>
                <div className="text-xs text-[--color-text-secondary]">1300</div>
              </div>
              <div className="font-medium">Rp 18.750.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div>
                <div className="text-sm font-medium">Perlengkapan Kantor</div>
                <div className="text-xs text-[--color-text-secondary]">1400</div>
              </div>
              <div className="font-medium">Rp 2.500.000</div>
            </div>
            <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3">
              <span>Total Aset</span>
              <span className="text-[--color-brand]">Rp 40.900.000</span>
            </div>
          </div>
        </div>

        {/* LIABILITIES + EQUITY */}
        <div className="card-slds">
          <h3 className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Liabilitas & Ekuitas</h3>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div>
                <div className="text-sm font-medium">Hutang Usaha</div>
                <div className="text-xs text-[--color-text-secondary]">2100</div>
              </div>
              <div className="font-medium">Rp 5.750.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div>
                <div className="text-sm font-medium">Hutang Gaji</div>
                <div className="text-xs text-[--color-text-secondary]">2200</div>
              </div>
              <div className="font-medium">Rp 3.000.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div>
                <div className="text-sm font-medium">Hutang Pajak</div>
                <div className="text-xs text-[--color-text-secondary]">2300</div>
              </div>
              <div className="font-medium">Rp 1.500.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div>
                <div className="text-sm font-medium">Modal Disetor</div>
                <div className="text-xs text-[--color-text-secondary]">3100</div>
              </div>
              <div className="font-medium">Rp 25.000.000</div>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-[--color-border]">
              <div>
                <div className="text-sm font-medium">Laba Ditahan</div>
                <div className="text-xs text-[--color-text-secondary]">3200</div>
              </div>
              <div className="font-medium">Rp 5.650.000</div>
            </div>
            <div className="flex justify-between items-center py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3">
              <span>Total Liabilitas & Ekuitas</span>
              <span className="text-[--color-brand]">Rp 40.900.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ChartIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <line x1="18" x2="18" y1="20" y2="10" />
      <line x1="12" x2="12" y1="20" y2="4" />
      <line x1="6" x2="6" y1="20" y2="14" />
    </svg>
  );
}
