"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Printer, Download } from "lucide-react";

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function JournalDetailPage() {
  const router = useRouter();
  const params = useParams();
  const no = params.no as string;
  const [journal, setJournal] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/journal/${no}`)
      .then((r) => r.json())
      .then((json) => { setJournal(json.data); setLoading(false); })
      .catch(() => { setError("Failed to load journal"); setLoading(false); });
  }, [no]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!journal) return <div className="p-8 text-center text-red-500">Journal not found</div>;

  const journalLines = journal.lines || journal.entries || [];

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Jurnal {journal.jeNo || no}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Printer size={14} /> Print</button>
          <button className="btn btn--sm"><Download size={14} /> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">No. Jurnal</div>
          <div className="text-lg font-bold">{journal.jeNo || no}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Tanggal</div>
          <div className="text-lg font-bold">{journal.date ? new Date(journal.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Status</div>
          <div className="text-lg font-bold text-[--color-success]">{journal.status || "Diterbitkan"}</div>
        </div>
      </div>

      <div className="card-slds mb-6">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi Jurnal</div>
        <div className="space-y-3">
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Deskripsi</span>
            <span className="font-medium">{journal.description || "Pembayaran Invoice"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Tipe</span>
            <span className="font-medium">{journal.type || "Pembayaran"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Total Debit</span>
            <span className="font-medium">{fmt(journal.totalDebit || 0)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Total Credit</span>
            <span className="font-medium">{fmt(journal.totalCredit || 0)}</span>
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
              {journalLines.map((line: any, i: number) => (
                <tr key={i} className="hover:bg-[#f8f8f8]">
                  <td className="font-medium">{line.coa?.code || line.accountCode || line.account}</td>
                  <td>{line.coa?.name || line.accountName}</td>
                  <td className="text-right font-medium">{line.debit > 0 ? fmt(line.debit) : "-"}</td>
                  <td className="text-right font-medium">{line.credit > 0 ? fmt(line.credit) : "-"}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr className="font-bold border-t-2 border-[--color-text-primary]">
                <td colSpan={2}>Total</td>
                <td className="text-right">{fmt(journal.totalDebit || 0)}</td>
                <td className="text-right">{fmt(journal.totalCredit || 0)}</td>
              </tr>
            </tfoot>
          </table>
        </div>
      </div>
    </div>
  );
}
