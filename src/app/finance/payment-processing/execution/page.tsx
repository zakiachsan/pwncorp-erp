"use client";

import { useState } from "react";
import { Check, CreditCard } from "lucide-react";

interface PaymentExec {
  id: string;
  tanggal: string;
  keperluan: string;
  penerima: string;
  jumlah: number;
  metode: string;
  status: string;
}

const dataAwal: PaymentExec[] = [
  { id: "RFP/002/260702", tanggal: "02 Jul 2026", keperluan: "Pembelian Sparepart AC", penerima: "PT CoolTech", jumlah: 8500000, metode: "Transfer Bank BCA", status: "pending" },
  { id: "RFP/005/260705", tanggal: "05 Jul 2026", keperluan: "Service Kendaraan Operasional", penerima: "Bengkel Resmi", jumlah: 2500000, metode: "Transfer Bank Mandiri", status: "pending" },
  { id: "RFP/007/260707", tanggal: "07 Jul 2026", keperluan: "Sewa Alat Berat", penerima: "PT Rental Indo", jumlah: 15000000, metode: "Transfer Bank BCA", status: "pending" },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function PaymentExecutionPage() {
  const [data, setData] = useState<PaymentExec[]>(dataAwal);

  const executePayment = (id: string) => {
    setData((prev) => prev.map((r) => r.id === id ? { ...r, status: "completed" } : r));
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <CreditCard className="w-6 h-6 text-[--color-brand-secondary]" />
          Payment Execution
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
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td className="font-medium">{r.id}</td>
                <td className="text-[--color-text-secondary] text-sm">{r.tanggal}</td>
                <td className="font-medium">{r.keperluan}</td>
                <td>{r.penerima}</td>
                <td className="font-medium">{fmt(r.jumlah)}</td>
                <td>{r.metode}</td>
                <td>
                  {r.status === "pending" ? (
                    <button
                      onClick={() => executePayment(r.id)}
                      style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#0176d3", border: "none", borderRadius: 6, cursor: "pointer" }}
                    >
                      Execute
                    </button>
                  ) : (
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 12, fontWeight: 600, color: "#2e844a", background: "#e8f5e9", borderRadius: 6 }}>
                      <Check size={13} /> Paid
                    </span>
                  )}
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={7} style={{ textAlign: "center", color: "#8e8f8e", padding: 32 }}>Tidak ada payment untuk dieksekusi</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
