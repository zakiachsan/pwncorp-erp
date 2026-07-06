"use client";

import { useState } from "react";
import { Search } from "lucide-react";
import DateRangePicker from "@/components/shared/DateRangePicker";

const historyData = [
  { id: "RFP/003/260703", tanggal: "03 Jul 2026", keperluan: "Biaya Operasional Bengkel", penerima: "PLN / PDAM", jumlah: 3200000, metode: "Transfer Bank BCA", status: "Paid", tglBayar: "03 Jul 2026" },
  { id: "RFP/008/260630", tanggal: "30 Jun 2026", keperluan: "Pembayaran Vendor IT", penerima: "PT Digital Solusi", jumlah: 5500000, metode: "Transfer Bank Mandiri", status: "Paid", tglBayar: "30 Jun 2026" },
  { id: "RFP/009/260628", tanggal: "28 Jun 2026", keperluan: "Biaya Kebersihan", penerima: "CV Clean Service", jumlah: 1800000, metode: "Transfer Bank BRI", status: "Paid", tglBayar: "28 Jun 2026" },
  { id: "RFP/010/260625", tanggal: "25 Jun 2026", keperluan: "Pembelian ATK", penerima: "Toko Buku Maju", jumlah: 750000, metode: "Kas Tunai", status: "Paid", tglBayar: "25 Jun 2026" },
  { id: "RFP/006/260706", tanggal: "06 Jul 2026", keperluan: "Biaya Listrik Bengkel", penerima: "PLN", jumlah: 2800000, metode: "Transfer Bank BCA", status: "Rejected", tglBayar: "-" },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function PaymentHistoryPage() {
  const [dateFrom, setDateFrom] = useState<Date>(new Date());
  const [dateTo, setDateTo] = useState<Date>(new Date());
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
