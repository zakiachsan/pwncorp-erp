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

export default function PrintDeliveryNotePage() {
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
  const spareparts = (wo.items || []).filter((it: any) => it.itemType === "sparepart");

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

      {/* Delivery Note content */}
      <div style={{ maxWidth: 600, margin: "24px auto", padding: "0 24px" }}>
        <div style={{ textAlign: "center", marginBottom: 24 }}>
          <h2 style={{ fontSize: 20, fontWeight: 700, margin: 0 }}>DELIVERY NOTE</h2>
          <p style={{ fontSize: 13, color: "#666", margin: "4px 0 0" }}>{wo.woNo}</p>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24, fontSize: 12 }}>
          <div>
            <div style={{ color: "#666", marginBottom: 4 }}>Customer</div>
            <div style={{ fontWeight: 600 }}>{so.customer?.name || "-"}</div>
            <div style={{ color: "#666" }}>{so.customer?.phone || ""}</div>
          </div>
          <div>
            <div style={{ color: "#666", marginBottom: 4 }}>Kendaraan</div>
            <div style={{ fontWeight: 600 }}>{so.vehicle?.brand} {so.vehicle?.model}</div>
            <div style={{ color: "#666" }}>{so.vehicle?.plateNo} - {so.vehicle?.year}</div>
          </div>
          <div>
            <div style={{ color: "#666", marginBottom: 4 }}>Tanggal Masuk</div>
            <div>{fmtDate(wo.createdAt)}</div>
          </div>
          <div>
            <div style={{ color: "#666", marginBottom: 4 }}>Service Advisor</div>
            <div>{so.sa?.name || "-"}</div>
          </div>
        </div>

        <div style={{ borderTop: "2px solid #000", paddingTop: 16 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 12 }}>Daftar Sparepart Keluar</div>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: "1px solid #ddd" }}>
                <th style={{ padding: "8px 0", textAlign: "left" }}>No</th>
                <th style={{ padding: "8px 0", textAlign: "left" }}>SKU</th>
                <th style={{ padding: "8px 0", textAlign: "left" }}>Nama Barang</th>
                <th style={{ padding: "8px 0", textAlign: "center" }}>Qty</th>
                <th style={{ padding: "8px 0", textAlign: "right" }}>Harga</th>
              </tr>
            </thead>
            <tbody>
              {spareparts.map((it: any, i: number) => (
                <tr key={i} style={{ borderBottom: "1px solid #eee" }}>
                  <td style={{ padding: "8px 0" }}>{i + 1}</td>
                  <td style={{ padding: "8px 0" }}>{it.sku || "-"}</td>
                  <td style={{ padding: "8px 0" }}>{it.itemName || it.sparepartName}</td>
                  <td style={{ padding: "8px 0", textAlign: "center" }}>{it.qty}</td>
                  <td style={{ padding: "8px 0", textAlign: "right" }}>{fmt(it.unitPrice)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ marginTop: 48, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #000", paddingTop: 8, marginTop: 60 }}>
              <div style={{ fontSize: 11, color: "#666" }}>Penerima</div>
            </div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ borderTop: "1px solid #000", paddingTop: 8, marginTop: 60 }}>
              <div style={{ fontSize: 11, color: "#666" }}>Penyerahan</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
