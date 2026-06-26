"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, CheckCircle, Plus, Trash2 } from "lucide-react";

const poData: Record<string, any> = {
  "PO-001": {
    no: "PO-001",
    supplier: "PT Auto Parts",
    supplierPhone: "021-555-1234",
    supplierAddress: "Jl. Raya Bogor No. 123, Jakarta",
    status: "SENT",
    date: "25 Jun 2026",
    expectedDate: "28 Jun 2026",
    notes: "Pengiriman ke gudang utama",
    items: [
      { code: "SP-001", name: "Oli Mesin 10W-40", qty: 20, unit: "Ltr", price: 75000, subtotal: 1500000 },
      { code: "SP-002", name: "Filter Oli", qty: 10, unit: "Pcs", price: 50000, subtotal: 500000 },
      { code: "SP-004", name: "Busi Iridium", qty: 20, unit: "Pcs", price: 35000, subtotal: 700000 },
      { code: "SP-006", name: "V-Belt", qty: 5, unit: "Pcs", price: 90000, subtotal: 450000 },
    ],
    receivedItems: [
      { code: "SP-001", name: "Oli Mesin 10W-40", ordered: 20, received: 20, date: "27 Jun 2026" },
      { code: "SP-002", name: "Filter Oli", ordered: 10, received: 10, date: "27 Jun 2026" },
    ],
    vendors: [
      { id: "V1", name: "PT Auto Parts", status: "Dipilih", prices: [75000, 50000, 35000, 90000] },
      { id: "V2", name: "CV Suku Cadang Jaya", status: "Alternatif", prices: [72000, 48000, 38000, 85000] },
      { id: "V3", name: "UD Oli Jaya", status: "Alternatif", prices: [70000, 52000, 36000, 95000] },
    ],
  },
  "PO-002": {
    no: "PO-002",
    supplier: "CV Ban Sehat",
    supplierPhone: "022-888-5678",
    supplierAddress: "Jl. Soekarno Hatta No. 45, Bandung",
    status: "PARTIAL RECEIVED",
    date: "24 Jun 2026",
    expectedDate: "27 Jun 2026",
    notes: "",
    items: [
      { code: "SP-005", name: "Aki GS 45Ah", qty: 5, unit: "Pcs", price: 700000, subtotal: 3500000 },
      { code: "SP-003", name: "Kampas Rem Depan", qty: 8, unit: "Set", price: 150000, subtotal: 1200000 },
    ],
    receivedItems: [
      { code: "SP-005", name: "Aki GS 45Ah", ordered: 5, received: 3, date: "26 Jun 2026" },
    ],
    vendors: [
      { id: "V1", name: "CV Ban Sehat", status: "Dipilih", prices: [700000, 150000] },
      { id: "V2", name: "PT Aki Jaya", status: "Alternatif", prices: [720000, 160000] },
    ],
  },
  "PO-003": {
    no: "PO-003",
    supplier: "UD Oli Jaya",
    supplierPhone: "021-777-9012",
    supplierAddress: "Jl. Gatot Subroto No. 67, Jakarta",
    status: "RECEIVED",
    date: "22 Jun 2026",
    expectedDate: "25 Jun 2026",
    notes: "Sudah diterima lengkap",
    items: [
      { code: "SP-001", name: "Oli Mesin 10W-40", qty: 30, unit: "Ltr", price: 72000, subtotal: 2160000 },
    ],
    receivedItems: [
      { code: "SP-001", name: "Oli Mesin 10W-40", ordered: 30, received: 30, date: "24 Jun 2026" },
    ],
    vendors: [
      { id: "V1", name: "UD Oli Jaya", status: "Dipilih", prices: [72000] },
    ],
  },
  "PO-004": {
    no: "PO-004",
    supplier: "PT Auto Parts",
    supplierPhone: "021-555-1234",
    supplierAddress: "Jl. Raya Bogor No. 123, Jakarta",
    status: "DRAFT",
    date: "26 Jun 2026",
    expectedDate: "-",
    notes: "Menunggu approval",
    items: [
      { code: "SP-003", name: "Kampas Rem Depan", qty: 10, unit: "Set", price: 150000, subtotal: 1500000 },
      { code: "SP-005", name: "Aki GS 45Ah", qty: 5, unit: "Pcs", price: 700000, subtotal: 3500000 },
      { code: "SP-006", name: "V-Belt", qty: 10, unit: "Pcs", price: 90000, subtotal: 900000 },
    ],
    receivedItems: [],
    vendors: [
      { id: "V1", name: "PT Auto Parts", status: "Alternatif", prices: [150000, 700000, 90000] },
      { id: "V2", name: "CV Sparepart Murah", status: "Alternatif", prices: [140000, 680000, 85000] },
    ],
  },
};

const fmt = (n: number) => n.toLocaleString("id-ID");
const formatIDR = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function PODetailPage() {
  const params = useParams();
  const router = useRouter();
  const poNo = params.no as string;
  const [activeTab, setActiveTab] = useState<"details" | "items" | "vendors" | "received">("details");
  const [vendors, setVendors] = useState<any[]>([]);

  const po = poData[poNo];
  const workflowSteps = ["DRAFT", "SENT", "PARTIAL RECEIVED", "RECEIVED"];
  const getStepIndex = (status: string) => {
    const map: Record<string, number> = { "DRAFT": 0, "SENT": 1, "PARTIAL RECEIVED": 2, "RECEIVED": 3 };
    return map[status] ?? 0;
  };
  const currentStepIndex = getStepIndex(po?.status || "DRAFT");

  // Init vendors from PO data
  useState(() => {
    if (po?.vendors) setVendors([...po.vendors]);
  });

  const totalQty = po?.items?.reduce((s: number, x: any) => s + x.qty, 0) || 0;
  const grandTotal = po?.items?.reduce((s: number, x: any) => s + x.subtotal, 0) || 0;

  if (!po) {
    return (
      <div style={{ padding: 24 }}>
        <button onClick={() => router.push("/inventory/po")} style={S.backBtn}><ArrowLeft size={16} /> Kembali</button>
        <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Data tidak ditemukan: {poNo}</p></div>
      </div>
    );
  }

  const selectVendor = (vendorIdx: number) => {
    setVendors((prev) => prev.map((v: any, i: number) => ({
      ...v,
      status: i === vendorIdx ? "Dipilih" : "Alternatif",
    })));
  };

  const getLowest = (itemIdx: number) => {
    const prices = vendors.map((v: any) => v.prices[itemIdx] || Infinity);
    return Math.min(...prices);
  };

  const selectedVendor = vendors.find((v: any) => v.status === "Dipilih");

  const tabs = ["details", "items", "vendors", "received"] as const;

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/inventory/po")} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div>
            <div className="view-title">Purchase Order</div>
            <div className="text-sm text-[--color-brand]">{po.no}</div>
          </div>
        </div>
        <div className="flex gap-2">
          {po.status === "DRAFT" && <button className="btn btn--brand btn--sm"><CheckCircle size={14} /> Send PO</button>}
          <button className="btn btn--sm"><Printer size={14} /> Print</button>
        </div>
      </div>

      {/* Workflow Bar */}
      <div className="card-slds mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[--color-text-secondary]">Workflow</span>
            <div className="flex items-center gap-2">
              {workflowSteps.map((step, i) => (
                <span key={step} className="px-3 py-1 rounded-md text-xs font-semibold" style={{
                  background: i === currentStepIndex ? "#032d47" : i < currentStepIndex ? "#e5e7eb" : "#f3f4f6",
                  color: i === currentStepIndex ? "#fff" : i < currentStepIndex ? "#6b7280" : "#9ca3af",
                }}>{step}</span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-[--color-text-secondary]">Supplier: </span>
            <span className="text-xs font-semibold">{selectedVendor?.name || po.supplier}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-4 bg-[--color-border-light] rounded-lg p-1 w-fit">
        {tabs.map((t) => (
          <button key={t} onClick={() => setActiveTab(t)} className="px-4 py-2 text-sm rounded-md transition-all" style={{
            background: activeTab === t ? "#0176d3" : "transparent",
            color: activeTab === t ? "#fff" : "#444746",
            fontWeight: activeTab === t ? 600 : 400,
          }}>
            {t === "details" ? "Details" : t === "items" ? "Items" : t === "vendors" ? "Vendor Comparison" : "Received"}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">PO Information</div>
            <div className="space-y-3">
              {[
                ["PO Number", po.no],
                ["Supplier", po.supplier],
                ["Phone", po.supplierPhone],
                ["Address", po.supplierAddress],
                ["Date", po.date],
                ["Expected Date", po.expectedDate],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary]">{label}</span>
                  <span className="font-medium text-sm">{value}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Summary</div>
            <div className="space-y-3">
              {[
                ["Total Items", `${po.items.length} items`],
                ["Total Qty", `${totalQty}`],
                ["Notes", po.notes || "-"],
              ].map(([label, value]) => (
                <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary]">{label}</span>
                  <span className="font-medium text-sm">{value}</span>
                </div>
              ))}
              <div className="flex justify-between py-2 font-bold text-lg border-t-2 border-[--color-text-primary] pt-3">
                <span>Grand Total</span>
                <span className="text-[--color-brand]">{formatIDR(grandTotal)}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Items Tab */}
      {activeTab === "items" && (
        <div className="card-slds">
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 36 }}>No.</th>
                  <th>Code</th>
                  <th>Name</th>
                  <th className="text-right">Qty</th>
                  <th>Unit</th>
                  <th className="text-right">Price</th>
                  <th className="text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {po.items.map((item: any, i: number) => (
                  <tr key={i}>
                    <td>{i + 1}</td>
                    <td className="font-medium text-[--color-brand]">{item.code}</td>
                    <td>{item.name}</td>
                    <td className="text-right">{item.qty}</td>
                    <td>{item.unit}</td>
                    <td className="text-right">{formatIDR(item.price)}</td>
                    <td className="text-right font-semibold">{formatIDR(item.subtotal)}</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="font-bold border-t-2 border-[--color-text-primary]">
                  <td colSpan={3}></td>
                  <td className="text-right">{totalQty}</td>
                  <td></td>
                  <td></td>
                  <td className="text-right text-[--color-brand]">{formatIDR(grandTotal)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Vendor Comparison Tab */}
      {activeTab === "vendors" && (
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Perbandingan Harga Vendor</div>
          {vendors.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="data-table" style={{ minWidth: 500 }}>
                <thead>
                  <tr>
                    <th style={{ minWidth: 130 }}>Item</th>
                    <th className="text-right" style={{ width: 50 }}>Qty</th>
                    {vendors.map((v: any) => (
                      <th key={v.id} className="text-center" style={{ minWidth: 120 }}>
                        <div className="flex flex-col items-center gap-1">
                          <span className="text-xs">{v.name}</span>
                          {v.status === "Dipilih" ? (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[--color-success] text-white">Dipilih</span>
                          ) : (
                            <button onClick={() => selectVendor(vendors.indexOf(v))} className="px-2 py-0.5 rounded text-[10px] font-medium bg-[--color-brand] text-white hover:bg-[--color-brand-dark]">
                              Pilih
                            </button>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {po.items.map((item: any, itemIdx: number) => {
                    const lowest = getLowest(itemIdx);
                    return (
                      <tr key={itemIdx}>
                        <td className="text-xs">{item.name}</td>
                        <td className="text-right text-xs">{item.qty}</td>
                        {vendors.map((v: any, vIdx: number) => {
                          const price = v.prices[itemIdx] || 0;
                          const isLowest = price === lowest && price > 0;
                          return (
                            <td key={v.id} className="text-center" style={{ background: isLowest ? "#f0fdf4" : undefined }}>
                              <div className="flex flex-col items-center">
                                <span className="text-xs font-medium">{formatIDR(price)}</span>
                                <span className="text-[10px] text-[--color-text-secondary]">{formatIDR(price * item.qty)}</span>
                                {isLowest && <span className="text-[9px] text-[--color-success] font-bold">TERENDAH</span>}
                              </div>
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                  {/* Total row */}
                  <tr className="font-bold border-t-2 border-[--color-text-primary]">
                    <td className="text-xs">TOTAL</td>
                    <td></td>
                    {vendors.map((v: any) => {
                      const total = v.prices.reduce((s: number, p: number, i: number) => s + p * (po.items[i]?.qty || 0), 0);
                      const cheapest = vendors.reduce((min: any, cur: any) => {
                        const curTotal = cur.prices.reduce((s: number, p: number, i: number) => s + p * (po.items[i]?.qty || 0), 0);
                        const minTotal = min.prices.reduce((s: number, p: number, i: number) => s + p * (po.items[i]?.qty || 0), 0);
                        return curTotal < minTotal ? cur : min;
                      }, vendors[0]);
                      const isCheapest = v.id === cheapest?.id;
                      return (
                        <td key={v.id} className="text-center text-xs" style={{ background: v.status === "Dipilih" ? "#f0fdf4" : undefined }}>
                          <span className={isCheapest ? "text-[--color-success] font-bold" : ""}>{formatIDR(total)}</span>
                          {isCheapest && <div className="text-[9px] text-[--color-success]">TERMURAH</div>}
                        </td>
                      );
                    })}
                  </tr>
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-[--color-text-secondary]">Belum ada data vendor</p>
          )}
        </div>
      )}

      {/* Received Tab */}
      {activeTab === "received" && (
        <div>
          {po.receivedItems.length > 0 ? (
            <div className="card-slds">
              <div className="table-wrap">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th style={{ width: 36 }}>No.</th>
                      <th>Code</th>
                      <th>Name</th>
                      <th className="text-right">Ordered</th>
                      <th className="text-right">Received</th>
                      <th className="text-right">Remaining</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {po.receivedItems.map((item: any, i: number) => (
                      <tr key={i}>
                        <td>{i + 1}</td>
                        <td className="font-medium text-[--color-brand]">{item.code}</td>
                        <td>{item.name}</td>
                        <td className="text-right">{item.ordered}</td>
                        <td className="text-right font-semibold">{item.received}</td>
                        <td className="text-right" style={{ color: item.ordered - item.received > 0 ? "#f59e0b" : "#2e844a" }}>
                          {item.ordered - item.received}
                        </td>
                        <td>{item.date}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <div className="card-slds"><p className="text-sm text-[--color-text-secondary]">Belum ada item yang diterima</p></div>
          )}
        </div>
      )}
    </div>
  );
}
