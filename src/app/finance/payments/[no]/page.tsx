"use client";

import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Printer, Download } from "lucide-react";
import { useEffect, useState } from "react";

const fmt = (n: number) => `Rp ${(n || 0).toLocaleString("id-ID")}`;

const fmtDate = (d: string | null | undefined) => {
  if (!d) return "-";
  return new Date(d).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
};

const statusColor = (s: string) => {
  const map: Record<string, string> = { Verified: "#2e844a", Pending: "#f59e0b", Rejected: "#ea001e", PAID: "#2e844a", PARTIAL: "#f59e0b", UNPAID: "#ea001e" };
  return map[s] || "#6b7280";
};

export default function PaymentDetailPage() {
  const router = useRouter();
  const params = useParams();
  const no = params.no as string;

  const [payment, setPayment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!no) { setLoading(false); setError("No payment number"); return; }

    fetch(`/api/payments?search=${encodeURIComponent(no)}&limit=1`)
      .then(r => r.json())
      .then(j => {
        const found = j.data?.[0];
        if (!found) { setError("Payment not found"); setLoading(false); return; }
        setPayment(found);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load payment"); setLoading(false); });
  }, [no]);

  if (loading) return <div style={{ padding: 32, textAlign: "center", color: "#444746" }}>Loading...</div>;
  if (error || !payment) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.back()} style={S.backBtn}><ArrowLeft size={16} /> Kembali</button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>{error || "Data tidak ditemukan"}: {no}</p></div>
      </div>
    );
  }

  // Map API fields
  const paymentNo = payment.paymentNo || payment.id?.slice(-8) || no;
  const invoiceNo = payment.invoice?.invNo || "-";
  const customer = payment.invoice?.customer?.name || "-";
  const amount = payment.amount || 0;
  const method = payment.paymentMethod || payment.method || "-";
  const date = fmtDate(payment.paymentDate || payment.date);
  const status = payment.status || "Verified";
  const notes = payment.notes || "-";

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <button onClick={() => router.back()} style={S.backBtn}><ArrowLeft size={16} /> Payments</button>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, marginBottom: 20 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PaymentIcon />
          <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Pembayaran {paymentNo}</h1>
          <span style={{ ...S.pill, background: statusColor(status) }}>{status}</span>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}><Printer size={14} /> Print</button>
          <button style={S.actionBtn}><Download size={14} /> PDF</button>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
        <div style={S.card}>
          <div style={S.sectionTitle}>Informasi Pembayaran</div>
          <F label="No. Pembayaran" value={paymentNo} />
          <F label="No. Invoice" value={invoiceNo} link onClick={() => invoiceNo !== "-" && router.push(`/finance/invoices/${invoiceNo}`)} />
          <F label="Customer" value={customer} />
          <F label="Metode" value={method} />
          <F label="Tanggal" value={date} />
          <F label="Status" value={status} pill statusColor={statusColor(status)} />
        </div>
        <div style={S.card}>
          <div style={S.sectionTitle}>Detail Amount</div>
          <div style={{ padding: "20px 0", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 8 }}>Total Dibayar</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: "#001526" }}>{fmt(amount)}</div>
          </div>
          <div style={{ borderTop: "1px solid #ecebea", paddingTop: 16, marginTop: 8 }}>
            <F label="Catatan" value={notes} />
          </div>
        </div>
      </div>
    </div>
  );
}

function F({ label, value, link, onClick, pill, statusColor }: { label: string; value: string; link?: boolean; onClick?: () => void; pill?: boolean; statusColor?: string }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 2 }}>{label}</div>
      {pill ? (
        <span style={{ display: "inline-block", padding: "2px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, color: "#fff", background: statusColor }}>{value}</span>
      ) : (
        <div
          style={{ fontSize: 13, fontWeight: 500, color: link ? "#0176d3" : "#001526", cursor: onClick ? "pointer" : "default" }}
          onClick={onClick}
        >{value}</div>
      )}
    </div>
  );
}

function PaymentIcon() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0176d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect width="20" height="14" x="2" y="5" rx="2" />
      <line x1="2" x2="22" y1="10" y2="10" />
    </svg>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px",
    fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  card: {
    background: "#fff", border: "1px solid #ecebea", borderRadius: 8,
    padding: 20, boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  sectionTitle: {
    fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 16,
  },
  actionBtn: {
    display: "inline-flex", alignItems: "center", gap: 5, padding: "5px 12px",
    fontSize: 12, fontWeight: 500, color: "#001526", background: "#fff",
    border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer",
  },
  pill: {
    display: "inline-block", padding: "2px 8px", borderRadius: 9999,
    fontSize: 10, fontWeight: 600, color: "#fff",
  },
};
