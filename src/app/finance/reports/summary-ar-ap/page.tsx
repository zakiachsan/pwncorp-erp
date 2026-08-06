"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function SummaryARAPPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/finance?report=summary-ar-ap")
      .then((r) => r.json())
      .then((j) => { setData(j.data); setLoading(false); })
      .catch(() => { setError("Gagal memuat data"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <BarChart3 className="w-6 h-6 text-[--color-brand-secondary]" />
          Summary AR / AP
        </div>
      </div>
      <div className="card-slds">
        <div className="flex justify-between py-2 border-b border-[--color-border]"><span className="text-sm text-[--color-text-secondary]">AR Outstanding (Piutang)</span><span className="font-medium text-[--color-brand]">{fmt(data.arOutstanding)}</span></div>
<div className="flex justify-between py-2 border-b border-[--color-border]"><span className="text-sm text-[--color-text-secondary]">Jumlah Dokumen AR</span><span className="font-medium">{data.arCount}</span></div>
<div className="flex justify-between py-2 border-b border-[--color-border]"><span className="text-sm text-[--color-text-secondary]">AP Outstanding (Hutang)</span><span className="font-medium text-[--color-warning]">{fmt(data.apOutstanding)}</span></div>
<div className="flex justify-between py-2 border-b border-[--color-border]"><span className="text-sm text-[--color-text-secondary]">Jumlah Dokumen AP</span><span className="font-medium">{data.apCount}</span></div>
      </div>
    </div>
  );
}
