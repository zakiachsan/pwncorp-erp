"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, CheckCircle, XCircle } from "lucide-react";

const formatIDR = (n: number) => {
  if (n === 0) return "Rp 0";
  return "Rp " + n.toLocaleString("id-ID");
};

const workflowSteps = ["DRAFT", "APPROVED", "SENT", "WAREHOUSE RECEIVED"];

const getStepIndex = (status: string) => {
  const map: Record<string, number> = {
    DRAFT: 0,
    APPROVED: 1,
    SENT: 2,
    "WAREHOUSE RECEIVED": 3,
  };
  return map[status] ?? 0;
};

export default function PurchaseOrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const refCodeArray = Array.isArray(params.refCode) ? params.refCode : [params.refCode as string];
  const refCode = refCodeArray.join("/");
  const [activeTab, setActiveTab] = useState<"details" | "deliveries" | "downPayments">("details");
  const [po, setPo] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/purchase-orders?search=${encodeURIComponent(refCode)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Purchase Order tidak ditemukan: " + refCode); setLoading(false); return; }
        setPo(found);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  }, [refCode]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (!po) {
    return (
      <div className="p-6">
        <button onClick={() => router.push("/warehouse/purchase-orders")} className="btn btn--sm mb-4">
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="card-slds">
          <p className="text-sm text-[--color-text-secondary]">Data tidak ditemukan: {refCode}</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = getStepIndex(po.status || "DRAFT");
  const items = po.items || [];
  const totalQty = items.reduce((s: number, x: any) => s + (x.orderQty || x.quantity || 0), 0);
  const subTotal = items.reduce((s: number, x: any) => s + (x.amount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/warehouse/purchase-orders")} className="btn btn--sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="view-title">Purchase Order (Standard)</div>
          </div>
        </div>
        <div className="flex gap-2">
          <button className="btn btn--sm">
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Workflow Bar */}
      <div className="card-slds mb-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-xs font-semibold text-[--color-text-secondary]">Workflow</span>
            <div className="flex items-center gap-2">
              {workflowSteps.map((step, i) => (
                <span
                  key={step}
                  className="px-3 py-1 rounded-md text-xs font-semibold"
                  style={{
                    background: i === currentStepIndex ? "#032d47" : i < currentStepIndex ? "#e5e7eb" : "#f3f4f6",
                    color: i === currentStepIndex ? "#fff" : i < currentStepIndex ? "#6b7280" : "#9ca3af",
                  }}
                >
                  {step}
                </span>
              ))}
            </div>
          </div>
          <div>
            <span className="text-xs text-[--color-text-secondary]">Supplier: </span>
            <span className="text-xs font-semibold">{po.supplier?.companyName || po.supplier?.name || "-"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-4 bg-[--color-border-light] rounded-lg p-1 w-fit">
        {([
          { key: "details" as const, label: "Details" },
          { key: "deliveries" as const, label: "Deliveries / Invoices / Returns" },
          { key: "downPayments" as const, label: "Down Payments" },
        ]).map((t) => (
          <button
            key={t.key}
            onClick={() => setActiveTab(t.key)}
            className="px-4 py-2 text-sm rounded-md transition-all"
            style={{
              background: activeTab === t.key ? "#0176d3" : "transparent",
              color: activeTab === t.key ? "#fff" : "#444746",
              fontWeight: activeTab === t.key ? 600 : 400,
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div className="space-y-6">
          {/* Two-column layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="card-slds">
              <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
                Informasi PO
              </div>
              <div className="space-y-3">
                {[
                  ["REF CODE", po.poNo || po.refCode || "-"],
                  ["REFERENCE NUMBER", po.poNo || po.referenceNumber || "-"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                    <span className="text-sm text-[--color-text-secondary] font-medium">{label}</span>
                    <span className="font-semibold text-sm">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">SUPPLIER</span>
                  <div className="text-right">
                    <span className="font-semibold text-sm" style={{ color: "var(--color-brand)", cursor: "pointer" }}>
                      {po.supplier?.companyName || po.supplier?.name || "-"}
                    </span>
                    <div className="text-xs text-[--color-text-secondary]">{po.supplier?.address || ""}</div>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">TERM OF PAYMENT</span>
                  <span className="font-medium text-sm">{po.termOfPayment || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">DELIVER TO</span>
                  <div className="text-right">
                    <span className="font-semibold text-sm" style={{ color: "var(--color-brand)", cursor: "pointer" }}>
                      {po.deliverTo?.name || po.supplier?.companyName || "-"}
                    </span>
                    <div className="text-xs text-[--color-text-secondary]">{po.deliverTo?.address || ""}</div>
                  </div>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">WAREHOUSE</span>
                  <span className="font-semibold text-sm" style={{ color: "var(--color-brand)", cursor: "pointer" }}>
                    {po.warehouse?.name || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">NOTES</span>
                  <span className="font-medium text-sm text-right max-w-[250px]">{po.notes || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">DOWN PAYMENT</span>
                  <span className="font-medium text-sm">{formatIDR(po.downPayment || 0)}</span>
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="card-slds">
              <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
                Info Tambahan
              </div>
              <div className="space-y-3">
                {[
                  ["CREATED BY", po.createdBy || "-"],
                  ["UPDATED BY", po.updatedBy || "-"],
                  ["SENT BY", po.sentBy || "-"],
                  ["CREATED AT", po.createdAt ? new Date(po.createdAt).toLocaleString() : "-"],
                  ["UPDATED AT", po.updatedAt ? new Date(po.updatedAt).toLocaleString() : "-"],
                  ["APPROVED DATE", po.approvedDate || "-"],
                  ["SEND DATE", po.sendDate || "-"],
                  ["DUE DATE", po.dueDate || po.date ? new Date(po.dueDate || po.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                    <span className="text-sm text-[--color-text-secondary] font-medium">{label}</span>
                    <span className="font-medium text-sm">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">CLOSED</span>
                  {po.closed || po.status === "RECEIVED" ? (
                    <CheckCircle size={18} className="text-[--color-success]" />
                  ) : (
                    <XCircle size={18} className="text-[--color-error]" />
                  )}
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">BACKDATE</span>
                  {po.backdate ? (
                    <CheckCircle size={18} className="text-[--color-success]" />
                  ) : (
                    <XCircle size={18} className="text-[--color-error]" />
                  )}
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">SOURCE</span>
                  <span className="font-medium text-sm">{po.source || "Manual Entry"}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Order Items Table */}
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
              Order Items
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>No</th>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Product Code</th>
                    <th className="text-right">Order Qty</th>
                    <th className="text-right">Received Qty</th>
                    <th className="text-right">Price (IDR)</th>
                    <th className="text-right">Discount (%)</th>
                    <th className="text-right">Amount (IDR)</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item: any, idx: number) => (
                    <tr key={item.id || idx}>
                      <td>{item.no || idx + 1}</td>
                      <td
                        className="font-medium cursor-pointer"
                        style={{ color: "var(--color-brand)" }}
                      >
                        {item.sku || "-"}
                      </td>
                      <td>{item.product?.name || item.product || "-"}</td>
                      <td>{item.productCode || "-"}</td>
                      <td className="text-right">{item.orderQty || item.quantity || 0}</td>
                      <td className="text-right">{item.receivedQty || 0}</td>
                      <td className="text-right">{formatIDR(item.price || 0)}</td>
                      <td className="text-right">{item.discount || 0}%</td>
                      <td className="text-right font-semibold">{formatIDR(item.amount || 0)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold border-t-2 border-[--color-text-primary]">
                    <td colSpan={4} className="text-sm text-[--color-text-secondary]">All Pages Qty</td>
                    <td className="text-right text-[--color-brand]">{totalQty}</td>
                    <td colSpan={4}></td>
                  </tr>
                  <tr>
                    <td colSpan={8} className="text-sm font-medium text-right text-[--color-text-secondary]">SubTotal</td>
                    <td className="text-right font-semibold">{formatIDR(subTotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={8} className="text-sm font-medium text-right text-[--color-text-secondary]">Net SubTotal</td>
                    <td className="text-right font-semibold">{formatIDR(subTotal)}</td>
                  </tr>
                  <tr>
                    <td colSpan={8} className="text-sm font-medium text-right text-[--color-text-secondary]">Tax</td>
                    <td className="text-right font-semibold">{formatIDR(0)}</td>
                  </tr>
                  <tr className="font-bold border-t-2 border-[--color-text-primary]">
                    <td colSpan={8} className="text-sm text-right">Total</td>
                    <td className="text-right text-lg text-[--color-brand]">{formatIDR(po.total || subTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Deliveries / Invoices / Returns Tab */}
      {activeTab === "deliveries" && (
        <div className="card-slds">
          <p className="text-sm text-[--color-text-secondary]">
            Deliveries, Invoices, and Returns data will be displayed here.
          </p>
        </div>
      )}

      {/* Down Payments Tab */}
      {activeTab === "downPayments" && (
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
            Down Payment Information
          </div>
          <div className="flex justify-between py-2 border-b border-[--color-border]">
            <span className="text-sm text-[--color-text-secondary]">Down Payment Amount</span>
            <span className="font-medium text-sm">{formatIDR(po.downPayment || 0)}</span>
          </div>
          <p className="text-sm text-[--color-text-secondary] mt-4">
            No down payment has been recorded for this Purchase Order.
          </p>
        </div>
      )}
    </div>
  );
}
