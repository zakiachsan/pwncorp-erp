"use client";

import { useEffect, useState } from "react";
import { BarChart3 } from "lucide-react";

const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function ProfitLossPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/finance?report=profit-loss")
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
          Profit & Loss
        </div>
      </div>
      <div className="card-slds">
        <div className="flex justify-between py-2 border-b border-[--color-border]"><span className="text-sm text-[--color-text-secondary]">Pendapatan</span><span className="font-medium text-[--color-success]">{fmt(data.revenue)}</span></div>
<div className="flex justify-between py-2 border-b border-[--color-border]"><span className="text-sm text-[--color-text-secondary]">Beban</span><span className="font-medium text-[--color-error]">{fmt(data.expense)}</span></div>
<div className="flex justify-between py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3"><span className="text-sm text-[--color-text-secondary]">Laba Bersih</span><span className="font-medium text-[--color-brand]">{fmt(data.netProfit)}</span></div>
      </div>
    </div>
  );
}
