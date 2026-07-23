"use client";

import { useRouter, useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Save, Send } from "lucide-react";

const fmt = (n: number) => (n || 0).toLocaleString("id-ID");

export default function ReviewStockOrderPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.no as string[];
  const refCode = refCodeArray ? (Array.isArray(refCodeArray) ? refCodeArray.join("/") : refCodeArray) : "";
  const [order, setOrder] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/stock-orders?search=${encodeURIComponent(refCode)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Stock Order tidak ditemukan"); setLoading(false); return; }
        return fetch(`/api/stock-orders/${found.id}`)
          .then((r2) => r2.json())
          .then((j2) => {
            const o = j2.data || found;
            setOrder(o);
            setItems((o.items || []).map((it: any) => ({
              id: it.id,
              sparepartId: it.sparepartId,
              sku: it.sparepart?.sku || "-",
              name: it.sparepart?.name || "-",
              stockQty: it.sparepart?.stockQty || 0,
              orderQty: it.qty || 0,
              sentQty: it.sentQty || 0,
            })));
            setLoading(false);
          });
      })
      .catch(() => { setError("Gagal load data"); setLoading(false); });
  }, [refCode]);

  const updateSentQty = (i: number, val: number) => {
    setItems(prev => prev.map((it, idx) => idx === i ? { ...it, sentQty: val } : it));
  };

  const handleSend = async () => {
    if (!order) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/stock-orders/${order.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "warehouse_sent",
          items: items.map(it => ({ id: it.id, sentQty: it.sentQty })),
        }),
      });
      const json = await res.json();
      if (!res.ok) { setError(json.error || "Gagal"); setSaving(false); return; }
      router.push(`/stock-workflow/stock-orders/${order.orderNo}`);
    } catch { setError("Gagal"); setSaving(false); }
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;
  if (!order) return null;

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div>
            <div className="view-title">Review Qty to Send</div>
            <div className="text-xs text-[--color-text-secondary]">{order.orderNo}</div>
          </div>
        </div>
      </div>

      {error && <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</div>}

      {/* Info */}
      <div className="card-slds p-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div>
            <div className="text-xs text-[--color-text-secondary]">Order Number</div>
            <div className="font-semibold text-sm">{order.orderNo}</div>
          </div>
          <div>
            <div className="text-xs text-[--color-text-secondary]">Warehouse</div>
            <div className="font-semibold text-sm">{order.warehouse || "-"}</div>
          </div>
          <div>
            <div className="text-xs text-[--color-text-secondary]">Work Order</div>
            <div className="font-semibold text-sm">{order.wo?.woNo || "-"}</div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="card-slds p-4 mb-4">
        <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-3">Products — Isi Qty yang Akan Dikirim</div>
        <div className="table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ width: 40 }}>No</th>
                <th>Product</th>
                <th className="text-right" style={{ width: 80 }}>Store Qty</th>
                <th className="text-right" style={{ width: 100 }}>Order Qty</th>
                <th className="text-right" style={{ width: 120 }}>Sent Qty</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>{i + 1}</td>
                  <td className="font-medium" style={{ color: "var(--color-brand)" }}>{it.sku} — {it.name}</td>
                  <td className="text-right text-[--color-text-secondary]">{it.stockQty}</td>
                  <td className="text-right font-semibold">{it.orderQty}</td>
                  <td>
                    <input type="number" min={0} max={it.orderQty} className="form-input w-full text-right"
                      value={it.sentQty} onChange={e => updateSentQty(i, parseInt(e.target.value) || 0)} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 justify-end">
        <button className="btn btn--sm" onClick={() => router.back()} disabled={saving}>Batal</button>
        <button className="btn btn--brand btn--sm" onClick={handleSend} disabled={saving}>
          <Send size={14} /> {saving ? "Sending..." : "Send from Warehouse"}
        </button>
      </div>
    </div>
  );
}
