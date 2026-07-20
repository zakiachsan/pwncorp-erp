"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Plus, Download, ArrowLeftRight } from "lucide-react";

interface Transfer {
  no: string;
  date: string;
  from: string;
  to: string;
  amount: number;
  description: string;
  status: string;
}

const formatIDR = (val: number) => `Rp ${val.toLocaleString("id-ID")}`;

const statusPill = (status: string) => {
  const map: Record<string, string> = { Selesai: "#2e844a", Pending: "#f59e0b", Gagal: "#ea001e" };
  return map[status] || "#6b7280";
};

export default function TransfersPage() {
  const router = useRouter();
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/stock-transfers?limit=1000")
      .then((r) => r.json())
      .then((j) => {
        if (j.data && j.data.length > 0) {
          const mapped: Transfer[] = j.data.map((t: any) => ({
            no: t.no || t.refCode || "-",
            date: t.date || "-",
            from: t.from || t.sourceWarehouse || "-",
            to: t.to || t.destWarehouse || "-",
            amount: t.amount || 0,
            description: t.description || t.notes || "-",
            status: t.status || "Selesai",
          }));
          setTransfers(mapped);
        } else {
          setTransfers([]);
        }
        setLoading(false);
      })
      .catch(() => {
        setError("Gagal memuat data transfer");
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ArrowLeftRight className="w-6 h-6 text-[--color-brand-secondary]" />
          Transfer Bank
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Download size={14} /> Export</button>
          <button className="btn btn--brand btn--sm" onClick={() => router.push("/finance/transfers/create")}><Plus size={14} /> New Transfer</button>
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
