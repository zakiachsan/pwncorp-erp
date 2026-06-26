"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, Download } from "lucide-react";

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Pembayaran {params.no}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Printer size={14} /> Print</button>
          <button className="btn btn--sm"><Download size={14} /> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi Pembayaran</div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">No. Pembayaran</span>
              <span className="font-medium">{params.no}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">No. Invoice</span>
              <span className="font-medium text-[--color-brand]">INV-002</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Supplier</span>
              <span className="font-medium">PT Maju Jaya</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Cash/Bank</span>
              <span className="font-medium">Bank BCA</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Tanggal</span>
              <span className="font-medium">26 Jun 2026</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Status</span>
              <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[--color-success] text-white">Lunas</span>
            </div>
          </div>
        </div>

        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Ringkasan Pembayaran</div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">No. PO</span>
              <span className="font-medium">PO-001</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Deskripsi</span>
              <span className="font-medium">Pembayaran invoice PT Autogloss Indonesia</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3">
              <span>Total Bayar</span>
              <span className="text-[--color-brand]">Rp 45.000.000</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
