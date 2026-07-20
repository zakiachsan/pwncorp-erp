"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function PaymentHistoryPage() {
  const [historyData, setHistoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());

  useEffect(() => {
    fetch("/api/payment-requests")
      .then((r) => r.json())
      .then((json) => {
        const mapped = (json.data || []).map((pr: any) => ({
          id: pr.prNo || pr.id?.toString() || "",
          tanggal: pr.createdAt ? new Date(pr.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-",
          keperluan: pr.purpose || "",
          penerima: pr.recipient || "-",
          jumlah: pr.amount || 0,
          metode: pr.method || "-",
          status: pr.status || "Pending",
          tglBayar: pr.paidAt ? new Date(pr.paidAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-",
        }));
        setHistoryData(mapped);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load payment history"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <ClockIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Payment History
        </div>
      </div>

      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="form-label">Tanggal</label>
            <DateRangePicker
              from={dateFrom}
              to={dateTo}
              onChange={(from, to) => { setDateFrom(from); setDateTo(to); }}
            />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center"><Search size={14} /> Cari</button>
          </div>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Request</th>
              <th>Tanggal</th>
              <th>Keperluan</th>
              <th>Penerima</th>
              <th>Jumlah</th>
              <th>Metode</th>
              <th>Status</th>
              <th>Tgl Bayar</th>
            </tr>
          </thead>
          <tbody>
            {historyData.map((r) => (
              <tr key={r.id}>
                <td className="font-medium">{r.id}</td>
                <td className="text-[--color-text-secondary] text-sm">{r.tanggal}</td>
                <td className="font-medium">{r.keperluan}</td>
                <td>{r.penerima}</td>
                <td className="font-medium">{fmt(r.jumlah)}</td>
                <td>{r.metode}</td>
                <td>
                  <span style={{
                    display: "inline-block", padding: "2px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600,
                    background: r.status === "Paid" ? "#e8f5e9" : "#fce4ec",
                    color: r.status === "Paid" ? "#2e844a" : "#ea001e",
                  }}>{r.status}</span>
                </td>
                <td className="text-[--color-text-secondary] text-sm">{r.tglBayar}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function ClockIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
