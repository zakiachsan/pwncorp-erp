"use client";

import { useEffect, useState } from "react";
import { Download, BarChart3 } from "lucide-react";

/* ── helpers ──────────────────────────────────────────────────────── */
const statusPillColor = (s: string): string => {
  const map: Record<string, string> = {
    Posted: "#2e844a",
    Draft: "#6b7280",
    Registered: "#2e844a",
    Disposed: "#ea001e",
    Active: "#2e844a",
    Inactive: "#6b7280",
  };
  return map[s] || "#6b7280";
};

/* ── filter / column config per tab ───────────────────────────────── */
type FilterField = {
  label: string;
  type: "text" | "date" | "select";
  options?: string[];
  width?: string;
};

type ColDef = {
  header: string;
  key: string;
  align?: "left" | "right";
  render?: (v: any, row: any) => React.ReactNode;
};

interface TabConfig {
  id: string;
  label: string;
  filters: FilterField[];
  columns: ColDef[];
  data: Record<string, any>[];
}

const ENTITIES = ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"];

const TABS: TabConfig[] = [
  /* ═══════════════════════════════════════════════════════════════════
     A  Account Transactions
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "account-transactions",
    label: "Account Transactions",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Select Account", type: "select", options: ["All Accounts", "1101 Kas", "1102 Bank BCA", "1103 Bank Mandiri", "2101 Utang Usaha", "4101 Penjualan Jasa", "5101 Biaya Sparepart", "5102 Biaya Gaji Karyawan", "5103 Biaya Sewa", "6101 Beban Listrik"], width: "160px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Journal Status", type: "select", options: ["All", "Posted", "Draft"], width: "130px" },
    ],
    columns: [
      { header: "Date", key: "date" },
      { header: "Entity", key: "entity" },
      { header: "Journal", key: "journal", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Status", key: "status", render: (v: string) => <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span> },
      { header: "Ref Code", key: "refCode" },
      { header: "Notes", key: "notes" },
      { header: "Debit", key: "debit", align: "right" },
      { header: "Credit", key: "credit", align: "right" },
      { header: "Balance", key: "balance", align: "right" },
    ],
    data: [],
  },

  /* ═══════════════════════════════════════════════════════════════════
     B  Balance Sheet
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "balance-sheet",
    label: "Balance Sheet",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "As Of Date", type: "date", width: "140px" },
      { label: "Account Type", type: "select", options: ["All", "Asset", "Liability", "Equity"], width: "140px" },
    ],
    columns: [
      { header: "Code", key: "code" },
      { header: "Account Name", key: "accountName" },
      { header: "Parent", key: "parent" },
      { header: "Current Period", key: "currentPeriod", align: "right" },
      { header: "Previous Period", key: "previousPeriod", align: "right" },
      { header: "Change", key: "change", align: "right" },
      { header: "Change %", key: "changePercent", align: "right" },
    ],
    data: [],
  },

  /* ═══════════════════════════════════════════════════════════════════
     C  Journal Transactions
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "journal-transactions",
    label: "Journal Transactions",
    filters: [
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Source", type: "select", options: ["All", "Service Work Order", "Purchase Invoice", "Sales Invoice", "Payment", "Manual Journal", "Petty Cash"], width: "170px" },
      { label: "Status", type: "select", options: ["All", "Posted", "Draft"], width: "120px" },
    ],
    columns: [
      { header: "Journal Date", key: "journalDate" },
      { header: "Ref Code", key: "refCode" },
      { header: "Journal", key: "journal", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Source", key: "source" },
      { header: "Notes", key: "notes" },
      { header: "Debit", key: "debit", align: "right" },
      { header: "Credit", key: "credit", align: "right" },
      { header: "Status", key: "status", render: (v: string) => <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span> },
    ],
    data: [],
  },

  /* ═══════════════════════════════════════════════════════════════════
     D  Profit & Loss
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "profit-loss",
    label: "Profit & Loss",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Compare With", type: "select", options: ["None", "Previous Period", "Previous Year"], width: "150px" },
    ],
    columns: [
      { header: "Code", key: "code" },
      { header: "Account Name", key: "accountName" },
      { header: "Current Period", key: "currentPeriod", align: "right" },
      { header: "Previous Period", key: "previousPeriod", align: "right" },
      { header: "Change", key: "change", align: "right" },
      { header: "Change %", key: "changePercent", align: "right" },
    ],
    data: [],
  },

  /* ═══════════════════════════════════════════════════════════════════
     E  Trial Balance
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "trial-balance",
    label: "Trial Balance",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "As Of Date", type: "date", width: "140px" },
    ],
    columns: [
      { header: "Code", key: "code" },
      { header: "Account Name", key: "accountName" },
      { header: "Debit", key: "debit", align: "right" },
      { header: "Credit", key: "credit", align: "right" },
    ],
    data: [],
  },

  /* ═══════════════════════════════════════════════════════════════════
     F  Fixed Asset List
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "fixed-asset-list",
    label: "Fixed Asset List",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Asset Category", type: "select", options: ["All", "Tangible", "Intangible"], width: "140px" },
      { label: "Status", type: "select", options: ["All", "Registered", "Disposed"], width: "130px" },
    ],
    columns: [
      { header: "Document No", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Asset Name", key: "assetName" },
      { header: "Asset Code", key: "assetCode" },
      { header: "Category", key: "category" },
      { header: "Purchase Date", key: "purchaseDate" },
      { header: "Purchase Price", key: "purchasePrice", align: "right" },
      { header: "Accum. Depreciation", key: "accumDepreciation", align: "right" },
      { header: "Book Value", key: "bookValue", align: "right" },
      { header: "Status", key: "status", render: (v: string) => <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span> },
    ],
    data: [],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */
export default function AccountingReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const [apiData, setApiData] = useState<any>(null);
  const [apiLoading, setApiLoading] = useState(false);

  // Fetch finance summary from API
  useEffect(() => {
    setApiLoading(true);
    fetch("/api/reports/finance?report=summary")
      .then((r) => r.json())
      .then((j) => { setApiData(j.data); setApiLoading(false); })
      .catch(() => { setApiLoading(false); });
  }, []);

  const cfg = TABS[activeTab];
  const PER_PAGE = 20;
  const totalPages = Math.ceil(cfg.data.length / PER_PAGE);
  const pagedData = cfg.data.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* ── header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 0" }}>
        <BarChart3 size={24} color="#0176d3" />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#001526", margin: 0 }}>Accounting Reports</h1>
      </div>

      {/* ── filter section ── */}
      <div style={{ margin: "16px 24px", padding: "16px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          {cfg.filters.map((f) => (
            <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: 0.3 }}>
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                >
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === "date" ? (
                <input
                  type={f.type}
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Enter ${f.label}`}
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── action buttons ── */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 18px",
              fontSize: 13,
              fontWeight: 500,
              color: "#444746",
              background: "#fff",
              border: "1px solid #d8d8d8",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* ── tab bar ── (below filter) */}
      <div style={{ display: "flex", gap: 0, padding: "0 24px", flexWrap: "wrap" }}>
        {TABS.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <button key={tab.id} onClick={() => { setActiveTab(i); setPage(1); }}
              style={{
                padding: "8px 16px", fontSize: 12, fontWeight: isActive ? 600 : 400,
                color: isActive ? "#fff" : "#444746", background: isActive ? "#0176d3" : "#ecebea",
                border: "none", borderRadius: i === 0 ? "6px 0 0 6px" : i === TABS.length - 1 ? "0 6px 6px 0" : "0",
                cursor: "pointer", whiteSpace: "nowrap", transition: "background .15s, color .15s",
              }}>{tab.label}</button>
          );
        })}
      </div>

      {/* ── Per-tab summary cards ── */}
      <PerTabSummary tabId={cfg.id} data={cfg.data} apiData={apiData} />

      {/* ── data table ── */}
      <div style={{ margin: "0 24px 24px", overflowX: "auto" }}>
        {cfg.data.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", fontSize: 14, color: "#444746", background: "#f9f9f9", borderRadius: 8, border: "1px solid #ecebea" }}>
            No data available
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#001526" }}>
            <thead>
              <tr>
                {cfg.columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: "10px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#444746",
                      textTransform: "uppercase" as const,
                      letterSpacing: 0.3,
                      background: "#f9f9f9",
                      border: "1px solid #ecebea",
                      textAlign: col.align === "right" ? "right" : "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedData.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: ri % 2 === 1 ? "#fafafa" : "#fff",
                  }}
                >
                  {cfg.columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #ecebea",
                        textAlign: col.align === "right" ? "right" : "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ── pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "16px 0" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 500,
                color: page <= 1 ? "#d8d8d8" : "#444746", background: "#fff",
                border: "1px solid #d8d8d8", borderRadius: 6, cursor: page <= 1 ? "default" : "pointer",
              }}
            >Prev</button>
            <span style={{ fontSize: 12, color: "#444746" }}>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 500,
                color: page >= totalPages ? "#d8d8d8" : "#444746", background: "#fff",
                border: "1px solid #d8d8d8", borderRadius: 6, cursor: page >= totalPages ? "default" : "pointer",
              }}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── Per-tab summary cards ─── */
function PerTabSummary({ tabId, data, apiData }: { tabId: string; data: Record<string, any>[]; apiData?: any }) {
  const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");
  const parseNum = (v: any) => parseInt((v || "0").toString().replace(/[^0-9-]/g, "")) || 0;

  if (tabId === "profit-loss") {
    // Use API data if available for summary cards
    const pendapatan = apiData ? (apiData.totalIncome || 0) : data.filter((d: any) => d.category === "Revenue").reduce((s: number, d: any) => s + parseNum(d.currentPeriod), 0);
    const hpp = data.filter((d: any) => d.category === "HPP").reduce((s: number, d: any) => s + parseNum(d.currentPeriod), 0);
    const beban = apiData ? (apiData.totalExpense || 0) : data.filter((d: any) => d.category === "Expense").reduce((s: number, d: any) => s + parseNum(d.currentPeriod), 0);
    const labaBersih = pendapatan - hpp - beban;
    const cards = [
      { label: "Total Pendapatan", value: fmt(pendapatan), color: "#2e844a" },
      { label: "HPP (Modal Barang)", value: fmt(hpp), color: "#ea001e" },
      { label: "Beban Operasional", value: fmt(beban), color: "#fe9339" },
      { label: "Laba Bersih", value: fmt(labaBersih), color: labaBersih >= 0 ? "#0176d3" : "#ea001e" },
    ];
    return <CardRow cards={cards} />;
  }

  if (tabId === "balance-sheet") {
    const totalAset = data.filter((d: any) => ["Kas & Bank","Piutang","Persediaan","Fixed Asset"].includes(d.parent)).reduce((s: number, d: any) => s + parseNum(d.currentPeriod), 0);
    const totalUtang = data.filter((d: any) => ["Utang","Utang Jangka Panjang"].includes(d.parent)).reduce((s: number, d: any) => s + parseNum(d.currentPeriod), 0);
    const totalModal = data.filter((d: any) => d.parent === "Modal").reduce((s: number, d: any) => s + parseNum(d.currentPeriod), 0);
    const cards = [
      { label: "Total Aset", value: fmt(totalAset), color: "#0176d3" },
      { label: "Total Liabilitas", value: fmt(Math.abs(totalUtang)), color: "#ea001e" },
      { label: "Total Ekuitas", value: fmt(totalModal), color: "#2e844a" },
      { label: "Data Entries", value: String(data.length), color: "#444746" },
    ];
    return <CardRow cards={cards} />;
  }

  if (tabId === "trial-balance") {
    const totalDebit = data.reduce((s: number, d: any) => s + parseNum(d.debit), 0);
    const totalKredit = data.reduce((s: number, d: any) => s + parseNum(d.credit), 0);
    const cards = [
      { label: "Total Debit", value: fmt(totalDebit), color: "#0176d3" },
      { label: "Total Kredit", value: fmt(totalKredit), color: "#ea001e" },
      { label: "Selisih", value: fmt(totalDebit - totalKredit), color: "#fe9339" },
      { label: "Status", value: totalDebit === totalKredit ? "Balance" : "Unbalanced", color: totalDebit === totalKredit ? "#2e844a" : "#ea001e" },
    ];
    return <CardRow cards={cards} />;
  }

  if (tabId === "account-transactions" || tabId === "journal-transactions") {
    const totalDebit = data.filter((d: any) => d.debit !== "0").reduce((s: number, d: any) => s + parseNum(d.debit), 0);
    const totalKredit = data.filter((d: any) => d.credit !== "0").reduce((s: number, d: any) => s + parseNum(d.credit), 0);
    const cards = [
      { label: "Total Debit", value: fmt(totalDebit), color: "#0176d3" },
      { label: "Total Kredit", value: fmt(totalKredit), color: "#ea001e" },
      { label: "Total Entries", value: String(data.length), color: "#444746" },
      { label: "Net Flow", value: fmt(totalDebit - totalKredit), color: totalDebit >= totalKredit ? "#2e844a" : "#ea001e" },
    ];
    return <CardRow cards={cards} />;
  }

  if (tabId === "fixed-asset-list") {
    const totalBookValue = data.reduce((s: number, d: any) => s + parseNum(d.bookValue), 0);
    const activeAssets = data.filter((d: any) => d.status === "Registered").length;
    const cards = [
      { label: "Total Aset", value: String(data.length), color: "#0176d3" },
      { label: "Aktif", value: String(activeAssets), color: "#2e844a" },
      { label: "Total Book Value", value: fmt(totalBookValue), color: "#444746" },
      { label: "Disposed", value: String(data.length - activeAssets), color: "#ea001e" },
    ];
    return <CardRow cards={cards} />;
  }

  return null;
}

function CardRow({ cards }: { cards: { label: string; value: string; color: string }[] }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: `repeat(${cards.length}, 1fr)`, gap: 12, padding: "16px 24px 0" }}>
      {cards.map((c, i) => (
        <div key={i} className="card-slds" style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", marginBottom: 4 }}>{c.label}</div>
          <div style={{ fontSize: c.value.length > 10 ? 14 : 20, fontWeight: 700, color: c.color }}>{c.value}</div>
        </div>
      ))}
    </div>
  );
}
