"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, Download } from "lucide-react";

export default function TransferDetailPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Transfer {params.no}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Printer size={14} /> Print</button>
          <button className="btn btn--sm"><Download size={14} /> PDF</button>
        </div>
      </div>

      <div className="card-slds max-w-2xl">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi Transfer</div>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">No. Transfer</span>
            <span className="font-medium">{params.no}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Tanggal</span>
            <span className="font-medium">26 Jun 2026</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Dari Akun</span>
            <span className="font-medium">Bank BCA</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Ke Akun</span>
            <span className="font-medium">Kas</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Deskripsi</span>
            <span className="font-medium">Setor kas operasional</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Status</span>
            <span className="inline-block px-2 py-0.5 rounded-full text-xs font-semibold bg-[--color-success] text-white">Selesai</span>
          </div>
          <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3">
            <span>Jumlah Transfer</span>
            <span className="text-[--color-brand]">Rp 5.000.000</span>
          </div>
        </div>
      </div>
    </div>
  );
}
