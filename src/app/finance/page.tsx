"use client";

import { useRouter } from "next/navigation";

export default function FinancePage() {
  const router = useRouter();

  return (
    <div>
      {/* Page Title */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 24 }}>
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0176d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" x2="12" y1="2" y2="22" />
          <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
        </svg>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Finance & Accounting</h1>
      </div>

      {/* Section 1: Inventory Invoices */}
      <div style={{ marginBottom: 32 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0176d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          </svg>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0176d3", margin: 0 }}>Inventory Invoices (Purchases/Sales)</h2>
        </div>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Document</th>
                <th style={S.th}>Workflow</th>
              </tr>
            </thead>
            <tbody>
              <tr
                style={{ ...S.tr, cursor: "pointer" }}
                onClick={() => router.push("/finance/invoices/purchase")}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              >
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>Purchase Invoices</td>
                <td style={S.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ color: "#444746" }}>Company</span>
                    <ArrowLeft />
                    <DocIcon />
                    <ArrowLeft />
                    <span style={{ color: "#444746" }}>Supplier</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 2: General Invoice */}
      <div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#0176d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
            <path d="M14 2v4a2 2 0 0 0 2 2h4" />
          </svg>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: "#0176d3", margin: 0 }}>General Invoice</h2>
        </div>

        <div style={S.tableWrap}>
          <table style={S.table}>
            <thead>
              <tr>
                <th style={S.th}>Document</th>
                <th style={S.th}>Workflow</th>
              </tr>
            </thead>
            <tbody>
              <tr
                style={{ ...S.tr, cursor: "pointer" }}
                onClick={() => router.push("/finance/invoices/payables")}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              >
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>Invoice Payables</td>
                <td style={S.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ color: "#444746" }}>Company/Store</span>
                    <ArrowLeft />
                    <DocIcon />
                    <ArrowLeft />
                    <span style={{ color: "#444746" }}>Supplier</span>
                  </div>
                </td>
              </tr>
              <tr
                style={{ ...S.tr, cursor: "pointer" }}
                onClick={() => router.push("/finance/invoices/receivables")}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              >
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>Invoice Receivables</td>
                <td style={S.td}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13 }}>
                    <span style={{ color: "#444746" }}>Company/Store</span>
                    <ArrowRight />
                    <DocIcon />
                    <ArrowRight />
                    <span style={{ color: "#444746" }}>Customer</span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function DocIcon() {
  return (
    <div style={{
      width: 28,
      height: 28,
      borderRadius: 6,
      background: "#f0f7ff",
      border: "1px solid #d0e5f5",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
    }}>
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#0176d3" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
        <path d="M14 2v4a2 2 0 0 0 2 2h4" />
      </svg>
    </div>
  );
}

function ArrowLeft() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m12 19-7-7 7-7" />
      <path d="M19 12H5" />
    </svg>
  );
}

function ArrowRight() {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M5 12h14" />
      <path d="m12 5 7 7-7 7" />
    </svg>
  );
}

const S: Record<string, React.CSSProperties> = {
  tableWrap: {
    border: "1px solid #ecebea",
    borderRadius: 8,
    overflow: "hidden",
    background: "#fff",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 13,
  },
  th: {
    padding: "10px 16px",
    textAlign: "left",
    fontWeight: 600,
    fontSize: 11,
    color: "#444746",
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    background: "#f9f9f9",
    borderBottom: "1px solid #ecebea",
  },
  td: {
    padding: "14px 16px",
    borderBottom: "1px solid #f0f0f0",
    color: "#001526",
    background: "#fff",
  },
  tr: { transition: "background 100ms" },
};
