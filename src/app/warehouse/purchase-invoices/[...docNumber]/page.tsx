"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Printer, ChevronDown } from "lucide-react";

const workflowSteps = ["DRAFT", "SUBMITTED", "APPROVED", "PAID"];

const getStepIndex = (status: string) => {
  const map: Record<string, number> = {
    DRAFT: 0,
    SUBMITTED: 1,
    APPROVED: 2,
    PAID: 3,
  };
  return map[status] ?? 0;
};

const formatIDR = (n: number | undefined | null) => {
  if (n === undefined || n === null) return "Rp 0";
  return "Rp " + n.toLocaleString("id-ID");
};

export default function PurchaseInvoiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const docNumber = Array.isArray(params.docNumber) ? params.docNumber.join("/") : (params.docNumber as string);
  const [activeTab, setActiveTab] = useState<"details" | "journals" | "deliveriesPayments" | "returns" | "changes">("details");
  const [printOpen, setPrintOpen] = useState(false);
  const [pi, setPi] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/purchase-invoices?search=${encodeURIComponent(docNumber)}&limit=1`)
      .then((r) => r.json())
      .then((json) => {
        const found = (json.data || [])[0];
        if (!found) { setError("Purchase Invoice tidak ditemukan: " + docNumber); setLoading(false); return; }
        setPi(found);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  }, [docNumber]);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (!pi) {
    return (
      <div className="p-6">
        <button onClick={() => router.push("/warehouse/purchase-invoices")} className="btn btn--sm mb-4">
          <ArrowLeft size={16} /> Kembali
        </button>
        <div className="card-slds">
          <p className="text-sm text-[--color-text-secondary]">Data tidak ditemukan: {docNumber}</p>
        </div>
      </div>
    );
  }

  const currentStepIndex = getStepIndex(pi.status || "DRAFT");
  const items = pi.items || [];
  const subTotal = items.reduce((s: number, x: any) => s + (x.amount || 0), 0);

  return (
    <div>
      {/* Header */}
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.push("/warehouse/purchase-invoices")} className="btn btn--sm">
            <ArrowLeft size={16} />
          </button>
          <div>
            <div className="view-title">Purchase Invoice (Standard)</div>
          </div>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <button
              className="btn btn--sm"
              onClick={() => setPrintOpen(!printOpen)}
              style={{ display: "flex", alignItems: "center", gap: 4 }}
            >
              <Printer size={14} /> Print <ChevronDown size={12} />
            </button>
            {printOpen && (
              <div
                className="absolute right-0 top-full mt-1 bg-white border border-[--color-border] rounded-md shadow-lg z-10"
                style={{ minWidth: 160 }}
              >
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setPrintOpen(false)}
                >
                  Print Invoice
                </button>
                <button
                  className="block w-full text-left px-4 py-2 text-sm hover:bg-gray-50"
                  onClick={() => setPrintOpen(false)}
                >
                  Print Summary
                </button>
              </div>
            )}
          </div>
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
            <span className="text-xs font-semibold">{pi.supplier?.companyName || pi.supplier?.name || "-"}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-0 mb-4 bg-[--color-border-light] rounded-lg p-1 w-fit">
        {([
          { key: "details" as const, label: "Details" },
          { key: "journals" as const, label: "Journals" },
          { key: "deliveriesPayments" as const, label: "Deliveries / Payments" },
          { key: "returns" as const, label: "Returns" },
          { key: "changes" as const, label: "Changes" },
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
                Informasi Invoice
              </div>
              <div className="space-y-3">
                {[
                  ["DOCUMENT NUMBER", pi.docNo || docNumber || "-"],
                  ["REFERENCE NUMBER", pi.referenceNumber || pi.docNo || "-"],
                  ["TAX NUMBER", pi.taxNumber || "-"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                    <span className="text-sm text-[--color-text-secondary] font-medium">{label}</span>
                    <span className="font-semibold text-sm">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">PURCHASE ORDER</span>
                  <span
                    className="font-semibold text-sm cursor-pointer"
                    style={{ color: "var(--color-brand)" }}
                  >
                    {pi.po?.poNo || pi.purchaseOrder || "-"}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">SUPPLIER</span>
                  <div className="text-right">
                    <span
                      className="font-semibold text-sm cursor-pointer"
                      style={{ color: "var(--color-brand)" }}
                    >
                      {pi.supplier?.companyName || pi.supplier?.name || "-"}
                    </span>
                    <div className="text-xs text-[--color-text-secondary]">{pi.supplier?.address || ""}</div>
                  </div>
                </div>
                {[
                  ["INVOICE DATE", pi.date ? new Date(pi.date).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : "-"],
                  ["DUE DATE", pi.dueDate || "-"],
                  ["PLANNED PAYMENT DATE", pi.plannedPaymentDate || "-"],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                    <span className="text-sm text-[--color-text-secondary] font-medium">{label}</span>
                    <span className="font-medium text-sm">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">CREDIT TERM (DAYS)</span>
                  <span className="font-medium text-sm">{pi.creditTerm || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">SUPPLIER BANK DETAILS</span>
                  <span className="font-medium text-sm text-right max-w-[250px]">{pi.supplierBankDetails || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">NOTES</span>
                  <span className="font-medium text-sm text-right max-w-[250px]">{pi.notes || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">SOURCE</span>
                  <span className="font-medium text-sm">{pi.source || "-"}</span>
                </div>
              </div>
            </div>

            {/* Right Column - Amounts & Payments */}
            <div className="space-y-6">
              {/* Amounts */}
              <div className="card-slds">
                <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
                  Amounts (IDR)
                </div>
                <div className="space-y-3">
                  {[
                    ["SubTotal", subTotal],
                    ["Credit Note", 0],
                    ["Net SubTotal", subTotal],
                    ["Tax", 0],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                      <span className="text-sm text-[--color-text-secondary] font-medium">{label}</span>
                      <span className="font-semibold text-sm">{formatIDR(value as number)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-b-2 border-[--color-text-primary]">
                    <span className="text-sm font-bold text-[--color-text-secondary]">Total</span>
                    <span className="font-bold text-lg text-[--color-brand]">{formatIDR(pi.total || subTotal)}</span>
                  </div>
                </div>
              </div>

              {/* Payments */}
              <div className="card-slds">
                <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
                  Payments (IDR)
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between py-2 border-b border-[--color-border]">
                    <span className="text-sm text-[--color-text-secondary] font-medium">Amount Due</span>
                    <span className="font-semibold text-sm">{formatIDR(pi.total || subTotal)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[--color-border]">
                    <span className="text-sm text-[--color-text-secondary] font-medium">Amount Paid</span>
                    <span className="font-semibold text-sm">{formatIDR(pi.amountPaid || 0)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Invoice Items Table */}
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
              Invoice Items
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th style={{ width: 40 }}>No</th>
                    <th>SKU</th>
                    <th>Product</th>
                    <th>Product Code</th>
                    <th className="text-right">Quantity</th>
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
                      <td className="text-right">{item.quantity || item.qty || 0}</td>
                      <td className="text-right">{formatIDR(item.price || 0)}</td>
                      <td className="text-right">{item.discount || 0}%</td>
                      <td className="text-right font-semibold">{formatIDR(item.amount || 0)}</td>
                    </tr>
                  ))}
                  {items.length === 0 && (
                    <tr><td colSpan={8} className="text-center text-sm text-[--color-text-secondary] py-4">No items</td></tr>
                  )}
                </tbody>
                <tfoot>
                  <tr className="font-bold border-t-2 border-[--color-text-primary]">
                    <td colSpan={7} className="text-sm text-right">TOTAL</td>
                    <td className="text-right text-lg text-[--color-brand]">{formatIDR(pi.total || subTotal)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Journals Tab */}
      {activeTab === "journals" && (
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
            Journals
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th style={{ width: 40 }}>No</th>
                  <th>Journal ID</th>
                  <th>Ref. Code</th>
                  <th className="text-right">Amount</th>
                  <th>Created By</th>
                </tr>
              </thead>
              <tbody>
                {pi.journals && pi.journals.length > 0 ? (
                  pi.journals.map((j: any) => (
                    <tr key={j.no}>
                      <td>{j.no}</td>
                      <td className="font-medium cursor-pointer" style={{ color: "var(--color-brand)" }}>{j.journalId}</td>
                      <td>{j.refCode}</td>
                      <td className="text-right font-semibold">{formatIDR(j.amount)}</td>
                      <td>{j.createdBy}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} className="text-center text-sm text-[--color-text-secondary] py-8">No journals recorded.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deliveries / Payments Tab */}
      {activeTab === "deliveriesPayments" && (
        <div className="space-y-6">
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
              Purchase Deliveries
            </div>
            <p className="text-sm text-[--color-text-secondary]">Deliveries data will be displayed here.</p>
          </div>
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
              Payments
            </div>
            <p className="text-sm text-[--color-text-secondary]">Payments data will be displayed here.</p>
          </div>
        </div>
      )}

      {/* Returns Tab */}
      {activeTab === "returns" && (
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
            Purchase Returns
          </div>
          <p className="text-sm text-[--color-text-secondary]">No returns recorded.</p>
        </div>
      )}

      {/* Changes Tab */}
      {activeTab === "changes" && (
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
            Change History
          </div>
          <div className="space-y-3">
            {[
              ["CREATED BY", pi.createdBy || "-"],
              ["UPDATED BY", pi.updatedBy || "-"],
              ["CREATED AT", pi.createdAt ? new Date(pi.createdAt).toLocaleString() : "-"],
              ["UPDATED AT", pi.updatedAt ? new Date(pi.updatedAt).toLocaleString() : "-"],
              ["APPROVED DATE", pi.approvedDate || "-"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                <span className="text-sm text-[--color-text-secondary] font-medium">{label}</span>
                <span className="font-medium text-sm">{value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
