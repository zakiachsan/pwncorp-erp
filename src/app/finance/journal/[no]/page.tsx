"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, Download } from "lucide-react";

const journalLines = [
  { account: "1101", accountName: "Kas", debit: 2500000, credit: 0 },
  { account: "1200", accountName: "Piutang Usaha", debit: 0, credit: 2500000 },
];

export default function JournalDetailPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Jurnal {params.no}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Printer size={14} /> Print</button>
          <button className="btn btn--sm"><Download size={14} /> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">No. Jurnal</div>
          <div className="text-lg font-bold">{params.no}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Tanggal</div>
          <div className="text-lg font-bold">26 Jun 2026</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Status</div>
          <div className="text-lg font-bold text-[--color-success]">Diterbitkan</div>
        </div>
      </div>

      <div className="card-slds mb-6">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi Jurnal</div>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Deskripsi</span>
            <span className="font-medium">Pembayaran Invoice PT Maju Jaya - SCW Nano Coating 9H</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Tipe</span>
            <span className="font-medium">Pembayaran</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Total Debit</span>
            <span className="font-medium">Rp 2.500.000</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Total Credit</span>
            <span className="font-medium">Rp 2.500.000</span>
          </div>
        </div>
      </div>

      <div className="card-slds">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Detail Jurnal</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Kode Akun</th>
                <th>Nama Akun</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
              </tr>
            </thead>
            <tbody>
              {journalLines.map((line, i) => (
                <tr key={i} className="hover:bg-[#f8f8f8]">
                  <td className="font-medium">{line.account}</td>
                  <td>{line.accountName}</td>
                  <td className="text-right font-medium">{line.debit > 0 ? `Rp ${line.debit.toLocaleString("id-ID")}` : "-"}</td>
                  <td className="text-right font-medium">{line.credit > 0 ? `Rp ${line.credit.toLocaleString("id-ID")}` : "-"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold border-t-2 border-[--color-text-primary]">
                <td colSpan={2}>Total</td>
                <td className="text-right">Rp 2.500.000</td>
                <td className="text-right">Rp 2.500.000</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
