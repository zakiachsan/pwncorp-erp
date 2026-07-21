"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard } from "lucide-react";

export default function PaymentExecutionPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/payment-requests?status=pending")
      .then((r) => r.json())
      .then((json) => {
        const mapped = (json.data || []).map((pr: any) => ({
          id: pr.prNo || pr.id?.toString() || "",
          tanggal: pr.createdAt ? new Date(pr.createdAt).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "",
          keperluan: pr.purpose || "",
          penerima: pr.penerima || "-",
          jumlah: pr.amount || 0,
          metode: pr.metode || "-",
          status: pr.status || "pending",
        }));
        setData(mapped);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load payment requests"); setLoading(false); });
  }, []);

  const executePayment = (id: string) => {
    setData((prev) => prev.map((r) => r.id === id ? { ...r, status: "completed" } : r));
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

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
