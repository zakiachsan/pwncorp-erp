"use client";

import { useRouter, useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { ArrowLeft, Printer, Download } from "lucide-react";

const fmtRp = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
const fmtDate = (iso: string) =>
  iso ? new Date(iso).toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" }) : "-";

export default function ReceiptDetailPage() {
  const router = useRouter();
  const params = useParams();
  const raw = params.no;
  const no = Array.isArray(raw) ? raw.join("/") : (raw || "");

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!no) { setError("No. penerimaan tidak valid"); setLoading(false); return; }
    fetch(`/api/receipts?search=${encodeURIComponent(no)}&limit=1`)
      .then((r) => r.json())
      .then((j) => {
        const found = (j.data || [])[0];
        if (!found) { setError("Penerimaan tidak ditemukan: " + no); setLoading(false); return; }
        setData(found);
        setLoading(false);
      })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, [no]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!data) return <div className="p-8 text-center">Data tidak ditemukan: {no}</div>;

  const bank = data.bankAccount;

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Penerimaan {data.receiptNo}</div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm"><Printer size={14} /> Print</button>
          <button className="btn btn--sm"><Download size={14} /> PDF</button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi Penerimaan</div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">No. Penerimaan</span>
              <span className="font-medium">{data.receiptNo}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Tanggal</span>
              <span className="font-medium">{fmtDate(data.date)}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Cash/Bank</span>
              <span className="font-medium">{bank ? `${bank.bankName} - ${bank.accountNo}` : "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Customer</span>
              <span className="font-medium">{data.customerName || "-"}</span>
            </div>
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Dibuat oleh</span>
              <span className="font-medium">{data.createdBy?.name || "-"}</span>
            </div>
          </div>
        </div>

        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Ringkasan Penerimaan</div>
          <div className="space-y-3">
            <div className="flex justify-between py-2 border-b border-[--color-border]">
              <span className="text-sm text-[--color-text-secondary]">Deskripsi</span>
              <span className="font-medium">{data.description || "-"}</span>
            </div>
            <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3">
              <span>Total Diterima</span>
              <span className="text-[--color-success]">{fmtRp(data.amount)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
