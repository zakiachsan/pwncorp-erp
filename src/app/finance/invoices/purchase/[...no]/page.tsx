"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Printer, Download } from "lucide-react";

const fmtRp = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

export default function PurchaseInvoiceDetailPage() {
  const router = useRouter();
  const params = useParams();
  const raw = params.no;
  const docNo = Array.isArray(raw) ? raw.join("/") : (raw || "");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!docNo) { setError("Nomor dokumen tidak valid"); setLoading(false); return; }
    fetch(`/api/purchase-invoices?search=${encodeURIComponent(docNo)}&limit=1`)
      .then((r) => r.json())
      .then((j) => {
        const found = (j.data || [])[0];
        if (!found) { setError("Purchase invoice tidak ditemukan: " + docNo); setLoading(false); return; }
        setData(found);
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, [docNo]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return <div className="p-8 text-center">Data tidak ditemukan: {docNo}</div>;

  const status = data.status || "UNPAID";
  const ap = (data.ap || [])[0];

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/finance/invoices/payables")} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Purchase Invoice {data.docNo}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Printer size={14} /> Print</button>
          <button className="btn btn--sm"><Download size={14} /> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi Invoice</div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">No. Dokumen</span>
              <span className="font-medium">{data.docNo}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Tanggal</span>
              <span className="font-medium">{fmtDate(data.date)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Supplier</span>
              <span className="font-medium">{data.supplier?.companyName || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">No. Purchase Order</span>
              <span className="font-medium">{data.po?.poNo || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Status</span>
              <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold text-white ${status === "PAID" ? "bg-[--color-success]" : "bg-[--color-warning]"}`}>
                {status === "PAID" ? "Lunas" : "Belum Lunas"}
              </span>
            </div>
          </div>
        </div>

        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Ringkasan Hutang</div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Total Invoice</span>
              <span className="font-medium">{fmtRp(data.total)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Sisa Tagihan</span>
              <span className="font-medium">{ap ? fmtRp(ap.balance) : "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Jatuh Tempo</span>
              <span className="font-medium">{ap?.dueDate ? fmtDate(ap.dueDate) : "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Status AP</span>
              <span className="font-medium">{ap?.status || "-"}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3">
              <span>Total Invoice</span>
              <span className="text-[--color-brand]">{fmtRp(data.total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
