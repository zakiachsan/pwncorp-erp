"use client";

import { useState } from "react";
import { Check, X, Search } from "lucide-react";

interface PaymentReq {
  id: string;
  tanggal: string;
  diajukanOleh: string;
  keperluan: string;
  jumlah: number;
  status: string;
}

const dataAwal: PaymentReq[] = [
  { id: "RFP/001/260701", tanggal: "01 Jul 2026", diajukanOleh: "Budi", keperluan: "Gaji Karyawan Juli 2026", jumlah: 45000000, status: "pending" },
  { id: "RFP/004/260704", tanggal: "04 Jul 2026", diajukanOleh: "Budi", keperluan: "Pembelian Oli & Filter", jumlah: 12000000, status: "pending" },
  { id: "RFP/006/260706", tanggal: "06 Jul 2026", diajukanOleh: "Rudi", keperluan: "Biaya Listrik Bengkel", jumlah: 2800000, status: "pending" },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function ApprovalDeskPage() {
  const [data, setData] = useState<PaymentReq[]>(dataAwal);

  const handleAction = (id: string, action: "approve" | "reject") => {
    setData((prev) => prev.filter((r) => r.id !== id));
  };

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <CheckIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Approval Desk
        </div>
      </div>

      <div className="table-wrap">
        <table className="data-table">
          <thead>
            <tr>
              <th>No. Request</th>
              <th>Tanggal</th>
              <th>Diajukan Oleh</th>
              <th>Keperluan</th>
              <th>Jumlah</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {data.map((r) => (
              <tr key={r.id}>
                <td className="font-medium">{r.id}</td>
                <td className="text-[--color-text-secondary] text-sm">{r.tanggal}</td>
                <td>{r.diajukanOleh}</td>
                <td className="font-medium">{r.keperluan}</td>
                <td className="font-medium">{fmt(r.jumlah)}</td>
                <td>
                  <div style={{ display: "flex", gap: 6 }}>
                    <button onClick={() => handleAction(r.id, "approve")} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#2e844a", border: "none", borderRadius: 6, cursor: "pointer" }}>
                      <Check size={13} /> Approve
                    </button>
                    <button onClick={() => handleAction(r.id, "reject")} style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "4px 10px", fontSize: 12, fontWeight: 500, color: "#fff", background: "#ea001e", border: "none", borderRadius: 6, cursor: "pointer" }}>
                      <X size={13} /> Reject
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {data.length === 0 && (
              <tr><td colSpan={6} style={{ textAlign: "center", color: "#8e8f8e", padding: 32 }}>Tidak ada request menunggu approval</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function CheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}
