"use client";

import { useEffect, useState } from "react";
import { BarChart3, Download } from "lucide-react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtDate = (iso: string) => (iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-");

export default function APCreditPage() {
  const [rows, setRows] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/finance?report=ap-credit")
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
          AP Credits
        </div>
        <button className="btn btn--sm"><Download size={14} /> Export</button>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Dokumen</th>
              <th>No. PO</th>
              <th>Supplier</th>
              <th>Tipe</th>
              <th>Tanggal</th>
              <th className="text-right">Total</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="hover:bg-[#f8f8f8]">
                <td>{r.docNo}</td>
                <td>{r.po?.poNo || '-'}</td>
                <td>{r.po?.supplier?.companyName || '-'}</td>
                <td>{r.returnType}</td>
                <td>{fmtDate(r.date)}</td>
                <td className="text-right">{fmt(r.total)}</td>
                <td>{r.status}</td>
              </tr>
            ))}
            {rows.length === 0 && (
              <tr><td colSpan={7} className="text-center py-8 text-[--color-text-secondary]">Tidak ada data</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
