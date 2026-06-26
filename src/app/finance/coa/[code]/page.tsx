"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Edit, Download } from "lucide-react";

const mockTransactions = [
  { date: "26 Jun 2026", ref: "INV-001", description: "Pembayaran Invoice INV-001", debit: 2500000, credit: 0 },
  { date: "25 Jun 2026", ref: "INV-003", description: "Pembayaran Invoice INV-003", debit: 2600000, credit: 0 },
  { date: "24 Jun 2026", ref: "WO-004", description: "Pembayaran sparepart WO-004", debit: 0, credit: 1500000 },
  { date: "23 Jun 2026", ref: "INV-004", description: "Pembayaran Invoice INV-004", debit: 950000, credit: 0 },
];

export default function COADetailPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Akun {params.code}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export</button>
          <button className="btn btn--brand btn--sm"><Edit size={14} /> Edit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Kode Akun</div>
          <div className="text-lg font-bold">{params.code}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Nama Akun</div>
          <div className="text-lg font-bold">Kas & Bank</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Saldo Saat Ini</div>
          <div className="text-lg font-bold text-[--color-brand]">Rp 15.250.000</div>
        </div>
      </div>

      <div className="card-slds">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Histori Transaksi</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Tanggal</th>
                <th>Ref</th>
                <th>Deskripsi</th>
                <th className="text-right">Debit</th>
                <th className="text-right">Credit</th>
                <th className="text-right">Saldo</th>
              </tr>
            </thead>
            <tbody>
              {mockTransactions.map((t, i) => {
                let runningBalance = 0;
                for (let j = 0; j <= i; j++) {
                  runningBalance += mockTransactions[j].debit - mockTransactions[j].credit;
                }
                return (
                  <tr key={i} className="hover:bg-[#f8f8f8]">
                    <td className="text-[--color-text-secondary]">{t.date}</td>
                    <td className="font-medium text-[--color-brand]">{t.ref}</td>
                    <td>{t.description}</td>
                    <td className="text-right font-medium">{t.debit > 0 ? `Rp ${t.debit.toLocaleString("id-ID")}` : "-"}</td>
                    <td className="text-right font-medium">{t.credit > 0 ? `Rp ${t.credit.toLocaleString("id-ID")}` : "-"}</td>
                    <td className="text-right font-medium">Rp {runningBalance.toLocaleString("id-ID")}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
