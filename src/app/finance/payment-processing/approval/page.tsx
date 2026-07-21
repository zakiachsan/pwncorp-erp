"use client";

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";

interface PaymentReq {
  id: string;
  tanggal: string;
  diajukanOleh: string;
  keperluan: string;
  jumlah: number;
  status: string;
}

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function ApprovalDeskPage() {
  const [data, setData] = useState<PaymentReq[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/payment-requests?status=pending")
      .then((r) => r.json())
      .then((json) => {
        const mapped = (json.data || []).map((pr: any) => ({
          id: pr.prNo || pr.id?.toString() || "",
          tanggal: pr.createdAt ? new Date(pr.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-",
          diajukanOleh: pr.requestedBy || "User",
          keperluan: pr.purpose || "",
          jumlah: pr.amount || 0,
          status: pr.status || "pending",
        }));
        setData(mapped);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load payment requests"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

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
