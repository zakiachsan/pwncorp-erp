"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, Download } from "lucide-react";

export default function InvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm">
            <ArrowLeft size={16} />
          </button>
          <div className="view-title">
            Invoice {params.no}
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Printer size={14} /> Print</button>
          <button className="btn btn--sm"><Download size={14} /> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Invoice Info */}
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Invoice Information</div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">No. Invoice</span>
              <span className="font-medium">{params.no}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">No. SO</span>
              <span className="font-medium text-[--color-brand]">SO-002</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Customer</span>
              <span className="font-medium">PT Maju Jaya</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Status</span>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[--color-error] text-white">Unpaid</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Jatuh Tempo</span>
              <span className="font-medium">28 Jun 2026</span>
            </div>
          </div>
        </div>

        {/* Right: Summary */}
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Payment Summary</div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Subtotal Jasa</span>
              <span className="font-medium">Rp 800.000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Subtotal Sparepart</span>
              <span className="font-medium">Rp 1.000.000</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Discount</span>
              <span className="font-medium text-[--color-error]">- Rp 0</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">PPN (11%)</span>
              <span className="font-medium">Rp 0</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3">
              <span>Total</span>
              <span className="text-[--color-brand]">Rp 1.800.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
