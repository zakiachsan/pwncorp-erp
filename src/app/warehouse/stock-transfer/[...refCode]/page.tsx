"use client";

import { useRouter, useParams } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Printer, ChevronRight } from "lucide-react";

const transferData: Record<string, any> = {
  "WTF/WJY/25050004": {
    refCode: "WTF/WJY/25050004",
    transferDate: "04 May 2025",
    from: "Gudang Wijaya",
    to: "Gudang PJ Motor",
    notes: "Transfer sparepart untuk kebutuhan workshop bulan Mei 2025.",
    approvalAt: "05 May 2025 10:30 AM",
    sentAt: "05 May 2025 11:00 AM",
    receivedDate: "05 May 2025 14:00 PM",
    updatedAt: "05 May 2025 14:15 PM",
    createdBy: "Nanda Salsa",
    updatedBy: "Nanda Salsa",
    status: "RECEIVED",
    items: [
      {
        no: 1,
        sku: "LKR6C",
        product: "NGK-BUSI-LKR6C",
        transferredQty: 100,
        receivedQty: 100,
        avgCost: 35000,
        transferAmount: 3500000,
      },
      {
        no: 2,
        sku: "18-97033-99-B",
        product: "BRAKE PAD",
        transferredQty: 50,
        receivedQty: 50,
        avgCost: 85000,
        transferAmount: 4250000,
      },
      {
        no: 3,
        sku: "VERWERDEN",
        product: "PENETRAND WD",
        transferredQty: 200,
        receivedQty: 200,
        avgCost: 12000,
        transferAmount: 2400000,
      },
    ],
    journals: [
      {
        no: 1,
        journalId: "JRN/WJY/25050004",
        refCode: "WTF/WJY/25050004",
        amount: 10150000,
        createdBy: "Nanda Salsa",
      },
    ],
  },
};

const workflowSteps = [
  "DRAFT",
  "CONFIRMED",
  "APPROVED",
  "SENT FROM WAREHOUSE",
  "RECEIVED IN DESTINATION",
];

const fmt = (n: number) => n.toLocaleString("id-ID");

export default function StockTransferDetailPage() {
  const router = useRouter();
  const params = useParams();
  const refCodeArray = params.refCode as string[];
  const refCode = refCodeArray ? refCodeArray.join("/") : "";
  const transfer = transferData[refCode];
  const [activeTab, setActiveTab] = useState<"details" | "journals">("details");

  if (!transfer) {
    return (
      <div style={{ padding: 24 }}>
        <button
          onClick={() => router.push("/warehouse/stock-transfer")}
          style={S.backBtn}
        >
          <ArrowLeft size={16} /> Kembali
        </button>
        <div style={S.card}>
          <p style={{ color: "#444746", fontSize: 14 }}>
            Stock Transfer tidak ditemukan: {refCode}
          </p>
        </div>
      </div>
    );
  }

  const currentStepIdx = workflowSteps.indexOf(transfer.status);
  const totalTransferred = transfer.items.reduce(
    (s: number, x: any) => s + x.transferredQty,
    0
  );
  const totalReceived = transfer.items.reduce(
    (s: number, x: any) => s + x.receivedQty,
    0
  );
  const totalAmount = transfer.items.reduce(
    (s: number, x: any) => s + x.transferAmount,
    0
  );

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Back Button */}
      <button
        onClick={() => router.push("/warehouse/stock-transfer")}
        style={S.backBtn}
      >
        <ArrowLeft size={16} /> Warehouse Stock Transfer
      </button>

      {/* Title */}
      <div
        style={{
          fontSize: 18,
          fontWeight: 700,
          color: "#001526",
          marginBottom: 12,
        }}
      >
        Warehouse Stock Transfer
      </div>

      {/* Workflow Bar */}
      <div style={S.workflowBar}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <span
            style={{ fontSize: 12, fontWeight: 600, color: "#444746" }}
          >
            Workflow
          </span>
          <div style={{ display: "flex", gap: 6 }}>
            {workflowSteps.map((step, i) => (
              <span
                key={step}
                style={{
                  ...S.badge,
                  background: i === currentStepIdx ? "#001526" : "transparent",
                  color: i === currentStepIdx ? "#fff" : "#8e8f8e",
                  border: `1px solid ${
                    i === currentStepIdx ? "#001526" : "#d8d8d8"
                  }`,
                }}
              >
                {step}
              </span>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8 }}>
          <button style={S.actionBtn}>
            <Printer size={14} /> Print
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div
        style={{
          display: "flex",
          gap: 0,
          marginBottom: 16,
          background: "#ecebea",
          borderRadius: 8,
          padding: 3,
          width: "fit-content",
        }}
      >
        <button
          onClick={() => setActiveTab("details")}
          style={{
            padding: "7px 18px",
            fontSize: 13,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            whiteSpace: "nowrap",
            color: activeTab === "details" ? "#fff" : "#444746",
            background: activeTab === "details" ? "#0176d3" : "transparent",
            fontWeight: activeTab === "details" ? 600 : 400,
          }}
        >
          Details
        </button>
        <button
          onClick={() => setActiveTab("journals")}
          style={{
            padding: "7px 18px",
            fontSize: 13,
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
            whiteSpace: "nowrap",
            color: activeTab === "journals" ? "#fff" : "#444746",
            background: activeTab === "journals" ? "#0176d3" : "transparent",
            fontWeight: activeTab === "journals" ? 600 : 400,
          }}
        >
          Journals
        </button>
      </div>

      {/* Details Tab */}
      {activeTab === "details" && (
        <div>
          {/* Two-column layout */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 32,
              marginBottom: 20,
            }}
          >
            {/* Left Column */}
            <div>
              <F label="REF CODE" value={transfer.refCode} />
              <F label="TRANSFER DATE" value={transfer.transferDate} />
              <F
                label="FROM"
                value={transfer.from}
                link
                onClick={() => {}}
              />
              <F
                label="TO"
                value={transfer.to}
                link
                onClick={() => {}}
              />
              <F label="NOTES" value={transfer.notes} />
            </div>
            {/* Right Column */}
            <div style={{ borderLeft: "1px solid #ecebea", paddingLeft: 32 }}>
              <F label="APPROVAL AT" value={transfer.approvalAt} />
              <F label="SENT AT" value={transfer.sentAt} />
              <F label="RECEIVED DATE" value={transfer.receivedDate} />
              <F label="UPDATED AT" value={transfer.updatedAt} />
              <F label="CREATED BY" value={transfer.createdBy} />
              <F label="UPDATED BY" value={transfer.updatedBy} />
            </div>
          </div>

          {/* Transfer Items */}
          <div
            style={{
              fontSize: 13,
              fontWeight: 600,
              color: "#0176d3",
              marginBottom: 8,
            }}
          >
            Transfer Items
          </div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 40 }}>No</th>
                  <th style={S.th}>SKU</th>
                  <th style={S.th}>Product</th>
                  <th style={{ ...S.th, textAlign: "right" }}>
                    Transferred Qty
                  </th>
                  <th style={{ ...S.th, textAlign: "right" }}>
                    Received Qty
                  </th>
                  <th style={{ ...S.th, textAlign: "right" }}>
                    Average Cost (Rp)
                  </th>
                  <th style={{ ...S.th, textAlign: "right" }}>
                    Transfer Amount (Rp)
                  </th>
                </tr>
              </thead>
              <tbody>
                {transfer.items.map((item: any) => (
                  <tr key={item.no} style={S.tr}>
                    <td style={S.td}>{item.no}</td>
                    <td
                      style={{
                        ...S.td,
                        color: "#0176d3",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                      onClick={() => router.push(`/products/${item.sku}`)}
                    >
                      {item.sku}
                    </td>
                    <td
                      style={{
                        ...S.td,
                        color: "#0176d3",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                      onClick={() => router.push(`/products/${item.sku}`)}
                    >
                      {item.product}
                    </td>
                    <td style={{ ...S.td, textAlign: "right" }}>
                      {item.transferredQty}
                    </td>
                    <td style={{ ...S.td, textAlign: "right" }}>
                      {item.receivedQty}
                    </td>
                    <td style={{ ...S.td, textAlign: "right" }}>
                      Rp {fmt(item.avgCost)}
                    </td>
                    <td
                      style={{
                        ...S.td,
                        textAlign: "right",
                        fontWeight: 600,
                      }}
                    >
                      Rp {fmt(item.transferAmount)}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr style={{ background: "#f9f9f9" }}>
                  <td
                    style={{
                      ...S.td,
                      fontWeight: 700,
                      borderTop: "2px solid #ecebea",
                    }}
                  >
                    TOTAL
                  </td>
                  <td
                    style={{
                      ...S.td,
                      borderTop: "2px solid #ecebea",
                    }}
                  ></td>
                  <td
                    style={{
                      ...S.td,
                      borderTop: "2px solid #ecebea",
                    }}
                  ></td>
                  <td
                    style={{
                      ...S.td,
                      textAlign: "right",
                      fontWeight: 700,
                      borderTop: "2px solid #ecebea",
                    }}
                  >
                    {totalTransferred}
                  </td>
                  <td
                    style={{
                      ...S.td,
                      textAlign: "right",
                      fontWeight: 700,
                      borderTop: "2px solid #ecebea",
                    }}
                  >
                    {totalReceived}
                  </td>
                  <td
                    style={{
                      ...S.td,
                      borderTop: "2px solid #ecebea",
                    }}
                  ></td>
                  <td
                    style={{
                      ...S.td,
                      textAlign: "right",
                      fontWeight: 700,
                      borderTop: "2px solid #ecebea",
                    }}
                  >
                    Rp {fmt(totalAmount)}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Journals Tab */}
      {activeTab === "journals" && (
        <div>
          <div style={S.tableWrap}>
            <table style={S.table}>
              <thead>
                <tr>
                  <th style={{ ...S.th, width: 40 }}>No</th>
                  <th style={S.th}>Journal ID</th>
                  <th style={S.th}>Ref. Code</th>
                  <th style={{ ...S.th, textAlign: "right" }}>Amount</th>
                  <th style={S.th}>Created By</th>
                </tr>
              </thead>
              <tbody>
                {transfer.journals.map((j: any) => (
                  <tr key={j.no} style={S.tr}>
                    <td style={S.td}>{j.no}</td>
                    <td
                      style={{
                        ...S.td,
                        color: "#0176d3",
                        fontWeight: 500,
                        cursor: "pointer",
                      }}
                    >
                      {j.journalId}
                    </td>
                    <td style={S.td}>{j.refCode}</td>
                    <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>
                      Rp {fmt(j.amount)}
                    </td>
                    <td style={S.td}>{j.createdBy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

function F({
  label,
  value,
  link = false,
  onClick,
}: {
  label: string;
  value: string;
  link?: boolean;
  onClick?: () => void;
}) {
  return (
    <div
      style={{ marginBottom: 10, cursor: link ? "pointer" : "default" }}
      onClick={onClick}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 600,
          color: "#444746",
          textTransform: "uppercase" as const,
          letterSpacing: "0.04em",
          marginBottom: 2,
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: 13,
          fontWeight: 500,
          color: link ? "#0176d3" : "#001526",
          display: "flex",
          alignItems: "center",
          gap: 4,
        }}
      >
        {value}
        {link && <ChevronRight size={13} style={{ color: "#0176d3" }} />}
      </div>
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    padding: "6px 12px",
    fontSize: 13,
    fontWeight: 500,
    color: "#444746",
    background: "#fff",
    border: "1px solid #d8d8d8",
    borderRadius: 6,
    cursor: "pointer",
    marginBottom: 16,
  },
  card: {
    background: "#fff",
    border: "1px solid #ecebea",
    borderRadius: 8,
    padding: 20,
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  },
  workflowBar: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "8px 14px",
    background: "#f9f9f9",
    border: "1px solid #ecebea",
    borderRadius: 8,
    marginBottom: 16,
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    padding: "3px 10px",
    borderRadius: 4,
    fontSize: 10,
    fontWeight: 700,
    letterSpacing: "0.03em" as const,
  },
  actionBtn: {
    display: "inline-flex",
    alignItems: "center",
    gap: 5,
    padding: "5px 12px",
    fontSize: 12,
    fontWeight: 500,
    color: "#001526",
    background: "#fff",
    border: "1px solid #d8d8d8",
    borderRadius: 6,
    cursor: "pointer",
  },
  tableWrap: {
    border: "1px solid #ecebea",
    borderRadius: 8,
    overflow: "hidden",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse" as const,
    fontSize: 13,
  },
  th: {
    padding: "8px 10px",
    textAlign: "left" as const,
    fontWeight: 600,
    fontSize: 11,
    color: "#444746",
    textTransform: "uppercase" as const,
    letterSpacing: "0.04em",
    background: "#fff",
    borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "8px 10px",
    borderBottom: "1px solid #f0f0f0",
    color: "#001526",
    background: "#fff",
  },
  tr: { transition: "background 100ms" },
};
