"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, ChevronDown } from "lucide-react";

const piDetail: Record<string, any> = {
  "PI/HO/26050143": {
    docNumber: "PI/HO/26050143",
    referenceNumber: "PI-2026-143",
    taxNumber: "001234567890",
    purchaseOrder: "PO/HO/26050082",
    supplier: { name: "PT Auto Parts Sejahtera", address: "Jl. Raya Bogor No. 123, Jakarta Selatan 12345" },
    invoiceDate: "01 May 2026",
    dueDate: "31 May 2026",
    plannedPaymentDate: "31 May 2026",
    creditTerm: 30,
    supplierBankDetails: "BCA - 1234567890 a.n PT Auto Parts Sejahtera",
    notes: "Pembayaran harus tepat waktu sesuai jatuh tempo.",
    source: "Manual Entry",
    status: "APPROVED",
    amounts: {
      subTotal: 2850000,
      creditNote: 0,
      netSubTotal: 2850000,
      tax: 0,
      total: 2850000,
    },
    payments: {
      amountDue: 2850000,
      amountPaid: 0,
    },
    items: [
      {
        no: 1,
        sku: "SKU-DR-001",
        product: "DRYER-AC",
        productCode: "DRYER-AC-001",
        quantity: 5,
        price: 350000,
        discount: 0,
        amount: 1750000,
      },
      {
        no: 2,
        sku: "SKU-EM-002",
        product: "EM-F05",
        productCode: "EM-F05-001",
        quantity: 10,
        price: 110000,
        discount: 0,
        amount: 1100000,
      },
    ],
    journals: [
      { no: 1, journalId: "JRN-2026-00521", refCode: "PI/HO/26050143", amount: 2850000, createdBy: "ANGGA NOVIANTO" },
      { no: 2, journalId: "JRN-2026-00522", refCode: "PI/HO/26050143", amount: 2850000, createdBy: "YUSRO IQBAL" },
    ],
    deliveries: [
      { refCode: "PD/HO/26050082", date: "28 Apr 2026", warehouse: "Gudang Utama", status: "RECEIVED", total: 2850000 },
    ],
    paymentsList: [
      { refCode: "PAY/HO/26050041", date: "15 May 2026", amount: 0, status: "PENDING", method: "Bank Transfer" },
    ],
    returns: [],
    changes: {
      createdBy: "ANGGA NOVIANTO",
      updatedBy: "YUSRO IQBAL",
      createdAt: "01 May 2026 09:30",
      updatedAt: "02 May 2026 14:15",
      approvedDate: "01 May 2026 10:00",
    },
  },
};

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
  // params.docNumber is an array for catch-all routes
  const docNumber = Array.isArray(params.docNumber) ? params.docNumber.join("/") : (params.docNumber as string);
  const [activeTab, setActiveTab] = useState<"details" | "journals" | "deliveriesPayments" | "returns" | "changes">("details");
  const [printOpen, setPrintOpen] = useState(false);

  const pi = piDetail[docNumber];
  const currentStepIndex = getStepIndex(pi?.status || "DRAFT");

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
            <span className="text-xs font-semibold">{pi.supplier.name}</span>
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
                  ["DOCUMENT NUMBER", pi.docNumber],
                  ["REFERENCE NUMBER", pi.referenceNumber],
                  ["TAX NUMBER", pi.taxNumber],
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
                    {pi.purchaseOrder}
                  </span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">SUPPLIER</span>
                  <div className="text-right">
                    <span
                      className="font-semibold text-sm cursor-pointer"
                      style={{ color: "var(--color-brand)" }}
                    >
                      {pi.supplier.name}
                    </span>
                    <div className="text-xs text-[--color-text-secondary]">{pi.supplier.address}</div>
                  </div>
                </div>
                {[
                  ["INVOICE DATE", pi.invoiceDate],
                  ["DUE DATE", pi.dueDate],
                  ["PLANNED PAYMENT DATE", pi.plannedPaymentDate],
                ].map(([label, value]) => (
                  <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                    <span className="text-sm text-[--color-text-secondary] font-medium">{label}</span>
                    <span className="font-medium text-sm">{value}</span>
                  </div>
                ))}
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">CREDIT TERM (DAYS)</span>
                  <span className="font-medium text-sm">{pi.creditTerm}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">SUPPLIER BANK DETAILS</span>
                  <span className="font-medium text-sm text-right max-w-[250px]">{pi.supplierBankDetails}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">NOTES</span>
                  <span className="font-medium text-sm text-right max-w-[250px]">{pi.notes || "-"}</span>
                </div>
                <div className="flex justify-between py-2 border-b border-[--color-border]">
                  <span className="text-sm text-[--color-text-secondary] font-medium">SOURCE</span>
                  <span className="font-medium text-sm">{pi.source}</span>
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
                    ["SubTotal", pi.amounts.subTotal],
                    ["Credit Note", pi.amounts.creditNote],
                    ["Net SubTotal", pi.amounts.netSubTotal],
                    ["Tax", pi.amounts.tax],
                  ].map(([label, value]) => (
                    <div key={label} className="flex justify-between py-2 border-b border-[--color-border]">
                      <span className="text-sm text-[--color-text-secondary] font-medium">{label}</span>
                      <span className="font-semibold text-sm">{formatIDR(value)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between py-2 border-b-2 border-[--color-text-primary]">
                    <span className="text-sm font-bold text-[--color-text-secondary]">Total</span>
                    <span className="font-bold text-lg text-[--color-brand]">{formatIDR(pi.amounts.total)}</span>
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
                    <span className="font-semibold text-sm">{formatIDR(pi.payments.amountDue)}</span>
                  </div>
                  <div className="flex justify-between py-2 border-b border-[--color-border]">
                    <span className="text-sm text-[--color-text-secondary] font-medium">Amount Paid</span>
                    <span className="font-semibold text-sm">{formatIDR(pi.payments.amountPaid)}</span>
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
                  {pi.items.map((item: any) => (
                    <tr key={item.no}>
                      <td>{item.no}</td>
                      <td
                        className="font-medium cursor-pointer"
                        style={{ color: "var(--color-brand)" }}
                      >
                        {item.sku}
                      </td>
                      <td>{item.product}</td>
                      <td>{item.productCode}</td>
                      <td className="text-right">{item.quantity}</td>
                      <td className="text-right">{formatIDR(item.price)}</td>
                      <td className="text-right">{item.discount}%</td>
                      <td className="text-right font-semibold">{formatIDR(item.amount)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold border-t-2 border-[--color-text-primary]">
                    <td colSpan={7} className="text-sm text-right">TOTAL</td>
                    <td className="text-right text-lg text-[--color-brand]">{formatIDR(pi.amounts.total)}</td>
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
                {pi.journals.map((j: any) => (
                  <tr key={j.no}>
                    <td>{j.no}</td>
                    <td
                      className="font-medium cursor-pointer"
                      style={{ color: "var(--color-brand)" }}
                    >
                      {j.journalId}
                    </td>
                    <td>{j.refCode}</td>
                    <td className="text-right font-semibold">{formatIDR(j.amount)}</td>
                    <td>{j.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Deliveries / Payments Tab */}
      {activeTab === "deliveriesPayments" && (
        <div className="space-y-6">
          {/* Purchase Deliveries */}
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
              Purchase Deliveries
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref Code</th>
                    <th>Date</th>
                    <th>Warehouse</th>
                    <th>Status</th>
                    <th className="text-right">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {pi.deliveries.map((d: any, idx: number) => (
                    <tr key={idx}>
                      <td
                        className="font-medium cursor-pointer"
                        style={{ color: "var(--color-brand)" }}
                      >
                        {d.refCode}
                      </td>
                      <td className="text-[--color-text-secondary]">{d.date}</td>
                      <td>{d.warehouse}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 9999,
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#fff",
                            background: "#2e844a",
                          }}
                        >
                          {d.status}
                        </span>
                      </td>
                      <td className="text-right font-semibold">{formatIDR(d.total)}</td>
                    </tr>
                  ))}
                  {pi.deliveries.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-sm text-[--color-text-secondary] py-8">
                        No deliveries recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {/* Payments */}
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
              Payments
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Ref Code</th>
                    <th>Date</th>
                    <th>Method</th>
                    <th>Status</th>
                    <th className="text-right">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {pi.paymentsList.map((p: any, idx: number) => (
                    <tr key={idx}>
                      <td
                        className="font-medium cursor-pointer"
                        style={{ color: "var(--color-brand)" }}
                      >
                        {p.refCode}
                      </td>
                      <td className="text-[--color-text-secondary]">{p.date}</td>
                      <td>{p.method}</td>
                      <td>
                        <span
                          style={{
                            display: "inline-block",
                            padding: "2px 8px",
                            borderRadius: 9999,
                            fontSize: 10,
                            fontWeight: 600,
                            color: "#fff",
                            background: p.status === "PAID" ? "#2e844a" : "#6b7280",
                          }}
                        >
                          {p.status}
                        </span>
                      </td>
                      <td className="text-right font-semibold">{formatIDR(p.amount)}</td>
                    </tr>
                  ))}
                  {pi.payments.length === 0 && (
                    <tr>
                      <td colSpan={5} className="text-center text-sm text-[--color-text-secondary] py-8">
                        No payments recorded.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Returns Tab */}
      {activeTab === "returns" && (
        <div className="card-slds">
          <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">
            Purchase Returns
          </div>
          <div className="table-wrap">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Ref Code</th>
                  <th>Date</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th className="text-right">Total</th>
                </tr>
              </thead>
              <tbody>
                {pi.returns.length === 0 && (
                  <tr>
                    <td colSpan={5} className="text-center text-sm text-[--color-text-secondary] py-8">
                      No returns recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
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
              ["CREATED BY", pi.changes.createdBy],
              ["UPDATED BY", pi.changes.updatedBy],
              ["CREATED AT", pi.changes.createdAt],
              ["UPDATED AT", pi.changes.updatedAt],
              ["APPROVED DATE", pi.changes.approvedDate],
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
