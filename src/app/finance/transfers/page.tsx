"use client";

import { useRouter } from "next/navigation";
import { Plus, Search, Download, ArrowLeftRight } from "lucide-react";

const transfers = [
  { no: "TF.2026.06.00001", date: "26 Jun 2026", from: "Bank BCA", to: "Kas", amount: 5000000, description: "Setor kas operasional", status: "Selesai" },
  { no: "TF.2026.06.00002", date: "25 Jun 2026", from: "Bank Mandiri", to: "Bank BCA", amount: 10000000, description: "Transfer antar rekening", status: "Selesai" },
  { no: "TF.2026.05.00003", date: "31 May 2026", from: "Kas", to: "Bank BCA", amount: 2500000, description: "Setor tunai", status: "Pending" },
];

const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

const statusPill = (status: string) => {
  const map: Record<string, string> = { Selesai: "#2e844a", Pending: "#f59e0b", Gagal: "#ea001e" };
  return map[status] || "#6b7280";
};

export default function TransfersPage() {
  const router = useRouter();
  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ArrowLeftRight className="w-6 h-6 text-[--color-brand-secondary]" />
          Transfer Bank
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export</button>
          <button className="btn btn--brand btn--sm"><Plus size={14} /> New Transfer</button>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Transfer</th>
              <th>Tanggal</th>
              <th>Dari</th>
              <th>Ke</th>
              <th className="text-right">Amount</th>
              <th>Deskripsi</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {transfers.map((t) => (
              <tr key={t.no} className="cursor-pointer hover:bg-[#f0f7ff] transition-colors" onClick={() => router.push(`/finance/transfers/${t.no}`)}>
                <td className="font-medium text-[--color-brand]">{t.no}</td>
                <td className="text-[--color-text-secondary]">{t.date}</td>
                <td>{t.from}</td>
                <td>{t.to}</td>
                <td className="text-right font-medium">{formatIDR(t.amount)}</td>
                <td>{t.description}</td>
                <td><span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPill(t.status), color: "#fff" }}>{t.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
