"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download } from "lucide-react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-");

export default function ARSubledgerPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/finance?report=ar-subledger")
      .then((r) => r.json())
      .then((j) => {
        setRows(j.data?.items || []);
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <BarChart3 className="w-6 h-6 text-[--color-brand-secondary]" />
          AR Subledger
        </div>
        <button className="btn btn--sm"><Download size={14} /> Export</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>Customer</th>
              <th>Jml Dokumen</th>
              <th className="text-right">Total Tagihan</th>
              <th className="text-right">Total Bayar</th>
              <th className="text-right">Saldo</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-[#f8f8f8]">
                <td>{r.customer}</td>
                <td>{r.count}</td>
                <td className="text-right">{fmt(r.totalBilled)}</td>
                <td className="text-right">{fmt(r.totalPaid)}</td>
                <td className="text-right">{fmt(r.balance)}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={5} className="text-center py-8 text-[--color-text-secondary]">Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
