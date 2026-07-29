"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Printer } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");
const fmtDate = (d: any): string => {
  if (!d || d === "-") return "-";
  const dt = new Date(d);
  if (isNaN(dt.getTime())) return "-";
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "long", year: "numeric" });
};

export default function PrintReceiptPage() {
  const params = useParams();
  const router = useRouter();
  const woNo = Array.isArray(params.no) ? params.no.join("/") : (params.no as string);
  const [wo, setWo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/work-orders?search=${encodeURIComponent(woNo)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found || !found.id) { setLoading(false); return; }
        return fetch(`/api/work-orders/${found.id}`)
          .then((r2) => r2.json())
          .then((j2) => {
            if (j2.data) setWo(j2.data);
            setLoading(false);
          });
      })
      .catch(() => setLoading(false));
  }, [woNo]);

  if (loading) {
    return <div style={{ padding: 40, textAlign: "center" }}>Loading...</div>;
  }

  if (!wo) {
    return <div style={{ padding: 40, textAlign: "center" }}>Work Order tidak ditemukan</div>;
  }

  const so = wo.so || {};
  const services = (wo.items || []).filter((it: any) => it.itemType === "service");
  const spareparts = (wo.items || []).filter((it: any) => it.itemType === "sparepart");
  const totalServices = services.reduce((s: number, it: any) => s + (it.total || 0), 0);
  const totalSpareparts = spareparts.reduce((s: number, it: any) => s + (it.total || 0), 0);
  const grandTotal = totalServices + totalSpareparts;

  return (
    <div style={{ background: "#fff", minHeight: "100vh" }}>
      {/* Top bar */}
      <div style={{ padding: "12px 24px", borderBottom: "1px solid #ecebea", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <button onClick={() => router.back()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, border: "1px solid #dddbda", borderRadius: 6, background: "#fff", cursor: "pointer" }}>
          <ArrowLeft size={14} /> Kembali
        </button>
        <button onClick={() => window.print()} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#fff", background: "#0176d3", border: "none", borderRadius: 6, cursor: "pointer" }}>
          <Printer size={14} /> Print / Save PDF
        </button>
      </div>

      {/* Receipt content */}
      <div style={{ maxWidth: 400, margin: "24px auto", padding: "0 16px" }}>
        <div style={{ textAlign: "center", marginBottom: 20 }}>
          <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>WORK ORDER RECEIPT</h2>
          <p style={{ fontSize: 12, color: "#666", margin: "4px 0 0" }}>{wo.woNo}</p>
        </div>

        <div style={{ fontSize: 12, marginBottom: 16 }}>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#666" }}>Customer</span>
            <span style={{ fontWeight: 600 }}>{so.customer?.name || "-"}</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#666" }}>Kendaraan</span>
            <span>{so.vehicle?.brand} {so.vehicle?.model} ({so.vehicle?.plateNo})</span>
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
            <span style={{ color: "#666" }}>Tanggal</span>
            <span>{fmtDate(wo.createdAt)}</span>
          </div>
        </div>

        <div style={{ borderTop: "1px dashed #ccc", paddingTop: 12, marginBottom: 12 }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 8 }}>SERVICES</div>
          {services.map((it: any, i: number) => (
            <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
              <span>{it.itemName}</span>
              <span>{fmt(it.total)}</span>
            </div>
          ))}
        </div>

        {spareparts.length > 0 && (
          <div style={{ borderTop: "1px dashed #ccc", paddingTop: 12, marginBottom: 12 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "#666", marginBottom: 8 }}>SPAREPARTS</div>
            {spareparts.map((it: any, i: number) => (
              <div key={i} style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 4 }}>
                <span>{it.itemName} x{it.qty}</span>
                <span>{fmt(it.total)}</span>
              </div>
            ))}
          </div>
        )}

        <div style={{ borderTop: "2px solid #000", paddingTop: 12, marginTop: 12 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 14, fontWeight: 700 }}>
            <span>TOTAL</span>
            <span>Rp {fmt(grandTotal)}</span>
          </div>
        </div>

        <div style={{ marginTop: 40, textAlign: "center", fontSize: 11, color: "#666" }}>
          <p>Terima kasih atas kepercayaan Anda</p>
        </div>
      </div>
    </div>
  );
}
