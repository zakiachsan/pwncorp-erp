"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Edit, Download } from "lucide-react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

interface LedgerRow {
  id: string;
  date: string;
  ref: string;
  description: string;
  debit: number;
  credit: number;
  balance: number;
}

export default function COADetailPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params.code as string) || "";

  const [account, setAccount] = useState<any>(null);
  const [rows, setRows] = useState<LedgerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!code) { setError("Kode akun tidak valid"); setLoading(false); return; }
    (async () => {
      try {
        // 1. Cari akun
        const accRes = await fetch(`/api/coa?search=${encodeURIComponent(code)}&flat=true`);
        const accJson = await accRes.json();
        const found = (accJson.data || []).find((a: any) => a.code === code);
        if (!found) { setError("Akun tidak ditemukan: " + code); setLoading(false); return; }
        setAccount(found);

        // 2. Histori jurnal untuk akun ini
        const jRes = await fetch(`/api/journal?coaId=${found.id}&limit=100`);
        const jJson = await jRes.json();
        const normalDebit = (found.normalBalance || "Debit") === "Debit";
        let running = 0;
        const mapped: LedgerRow[] = (jJson.data || []).map((je: any) => {
          const detail = (je.details || []).find((d: any) => d.coaId === found.id) || { debit: 0, credit: 0 };
          const debit = detail.debit || 0;
          const credit = detail.credit || 0;
          running += normalDebit ? debit - credit : credit - debit;
          return {
            id: je.id,
            date: je.date,
            ref: je.jeNo || "-",
            description: detail.description || je.description || "-",
            debit,
            credit,
            balance: running,
          };
        });
        setRows(mapped);
        setLoading(false);
      } catch {
        setError("Gagal memuat data");
        setLoading(false);
      }
    })();
  }, [code]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!account) return <div className="p-8 text-center">Akun tidak ditemukan: {code}</div>;

  const saldo = rows.length > 0 ? rows[rows.length - 1].balance : 0;

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Akun {account.code}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export</button>
          <button className="btn btn--brand btn--sm"><Edit size={14} /> Edit</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Kode Akun</div>
          <div className="text-lg font-bold">{account.code}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Nama Akun</div>
          <div className="text-lg font-bold">{account.name}</div>
        </div>
        <div className="card-slds">
          <div className="text-sm text-[--color-text-secondary]">Saldo Saat Ini</div>
          <div className="text-lg font-bold text-[--color-brand]">{fmt(saldo)}</div>
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
              {rows.map((t) => (
                <tr key={t.id} className="hover:bg-[#f8f8f8]">
                  <td className="text-[--color-text-secondary]">{fmtDate(t.date)}</td>
                  <td className="font-medium text-[--color-brand]">{t.ref}</td>
                  <td>{t.description}</td>
                  <td className="text-right font-medium">{t.debit > 0 ? fmt(t.debit) : "-"}</td>
                  <td className="text-right font-medium">{t.credit > 0 ? fmt(t.credit) : "-"}</td>
                  <td className="text-right font-medium">{fmt(t.balance)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="text-center py-8 text-[--color-text-secondary]">Belum ada transaksi</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
