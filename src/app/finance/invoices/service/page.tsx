"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Printer, X } from "lucide-react";

interface ApiInvoice {
  id: string;
  invNo: string;
  customer: { name: string } | null;
  so: { soNo: string } | null;
  total: number;
  status: string;
  dueDate: string;
  paidAmount: number;
}

interface Invoice {
  docNo: string;
  swoNo: string;
  soNo: string;
  customer: string;
  invoiceDate: string;
  dueDate: string;
  status: string;
  total: number;
  amountPaid: number;
  amountDue: number;
  services: { item: string; description: string; qty: number; total: number }[];
}

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const statusColor = (s: string) => {
  const map: Record<string, string> = {
    DRAFT: "#6b7280", UNPAID: "#ea001e", PARTIAL: "#f59e0b", PAID: "#2e844a",
  };
  return map[s] || "#6b7280";
};

export default function ServiceInvoicesPage() {
  const router = useRouter();
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [printMode, setPrintMode] = useState(false);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/invoices?limit=1000")
      .then((r) => r.json())
      .then((j) => {
        const data: ApiInvoice[] = j.data || [];
        const mapped: Invoice[] = data.map((inv) => ({
          docNo: inv.invNo,
          swoNo: "-",
          soNo: inv.so?.soNo || "-",
          customer: inv.customer?.name || "-",
          invoiceDate: "-",
          dueDate: inv.dueDate || "-",
          status: inv.status,
          total: inv.total || 0,
          amountPaid: inv.paidAmount || 0,
          amountDue: (inv.total || 0) - (inv.paidAmount || 0),
          services: [],
        }));
        setInvoices(mapped);
        setLoading(false);
      })
      .catch(() => {
        setError("Failed to load service invoices");
        setLoading(false);
      });
  }, []);

  const filtered = invoices.filter((inv) => {
    if (statusFilter && inv.status !== statusFilter) return false;
    if (search && !inv.docNo.toLowerCase().includes(search.toLowerCase()) && !inv.customer.toLowerCase().includes(search.toLowerCase()) && !inv.swoNo.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const toggleSelect = (docNo: string) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(docNo)) next.delete(docNo); else next.add(docNo);
      return next;
    });
  };

  const toggleAll = () => {
    if (selected.size === filtered.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(filtered.map((inv) => inv.docNo)));
    }
  };

  const enterSelectMode = () => {
    setSelected(new Set());
    setSelectMode(true);
  };

  const cancelSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const selectedInvoices = invoices.filter((inv) => selected.has(inv.docNo));
  const printTotal = selectedInvoices.reduce((s, inv) => s + inv.total, 0);

  const handlePrint = () => {
    if (selected.size === 0) return;
    setPrintMode(true);
  };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  if (printMode) {
    return <PrintView invoices={selectedInvoices} total={printTotal} onClose={() => setPrintMode(false)} />;
  }

  return (
    <div>
      {/* Page Title */}
      <div className="view-header">
        <div className="view-title">
          <FileIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Service Invoices
        </div>
        <div className="flex gap-2">
          {!selectMode && (
            <button onClick={enterSelectMode} className="btn btn--sm">
              <Printer size={14} /> Print
            </button>
          )}
        </div>
      </div>

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16, marginBottom: 20 }}>
        <div style={S.card}>
          <div style={{ fontSize: 12, color: "#444746", marginBottom: 4 }}>Total Invoices</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#001526" }}>Rp {fmt(filtered.reduce((s, x) => s + x.total, 0))}</div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 12, color: "#444746", marginBottom: 4 }}>Amount Due</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#ea001e" }}>Rp {fmt(filtered.reduce((s, x) => s + x.amountDue, 0))}</div>
        </div>
        <div style={S.card}>
          <div style={{ fontSize: 12, color: "#444746", marginBottom: 4 }}>Amount Received</div>
          <div style={{ fontSize: 20, fontWeight: 700, color: "#2e844a" }}>Rp {fmt(filtered.reduce((s, x) => s + x.amountPaid, 0))}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <select style={{ ...S.input, width: 200 }} value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All Status</option>
                <option value="DRAFT">Draft</option>
                <option value="UNPAID">Unpaid</option>
                <option value="PARTIAL">Partial</option>
                <option value="PAID">Paid</option>
              </select>
            </div>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <input type="text" style={{ ...S.input, width: 220 }} placeholder="Cari Document No / Customer / SWO..."
                value={search} onChange={(e) => setSearch(e.target.value)} />
            </div>
            {selectMode && (
              <label style={{ fontSize: 12, color: "#0176d3", cursor: "pointer", display: "flex", alignItems: "center", gap: 4, marginLeft: 4, whiteSpace: "nowrap" }}>
                <input type="checkbox" checked={selected.size === filtered.length && filtered.length > 0}
                  onChange={toggleAll} style={{ cursor: "pointer", accentColor: "#0176d3" }} />
                Select All
              </label>
            )}
          </div>
          {selectMode && (
            <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
              <button onClick={cancelSelectMode} className="btn btn--sm">
                <X size={14} /> Batal
              </button>
              <span style={{ fontSize: 13, color: "#444746" }}>
                {selected.size} dari {filtered.length} dipilih
              </span>
              <button onClick={handlePrint} disabled={selected.size === 0}
                className="btn btn--brand btn--sm"
                style={selected.size === 0 ? { opacity: 0.5 } : {}}
              >
                <Printer size={14} /> Print Selected
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Table */}
      <div style={S.tableWrap}>
        <table style={S.table}>
          <thead>
            <tr>
              {selectMode && (
                <th style={{ ...S.th, width: 40, textAlign: "center" }}></th>
              )}
              <th style={S.th}>Document Number</th>
              <th style={S.th}>SWO Reference</th>
              <th style={S.th}>Customer</th>
              <th style={S.th}>Invoice Date</th>
              <th style={S.th}>Due Date</th>
              <th style={S.th}>Status</th>
              <th style={{ ...S.th, textAlign: "right" }}>Total</th>
              <th style={{ ...S.th, textAlign: "right" }}>Received</th>
              <th style={{ ...S.th, textAlign: "right" }}>Due</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((inv) => (
              <tr key={inv.docNo} style={{ ...S.tr, cursor: selectMode ? "default" : "pointer" }}
                onClick={() => { if (!selectMode) router.push(`/finance/invoices/service/${inv.docNo}`); }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#f0f7ff"}
                onMouseLeave={(e) => e.currentTarget.style.background = "#fff"}
              >
                {selectMode && (
                  <td style={{ ...S.td, textAlign: "center" }} onClick={(e) => e.stopPropagation()}>
                    <input type="checkbox" checked={selected.has(inv.docNo)}
                      onChange={() => toggleSelect(inv.docNo)} style={{ cursor: "pointer", accentColor: "#0176d3" }} />
                  </td>
                )}
                <td style={{ ...S.td, color: "#0176d3", fontWeight: 500 }}>{inv.docNo}</td>
                <td style={S.td}>
                  <span onClick={(e) => { e.stopPropagation(); router.push(`/work-orders/${inv.swoNo}`); }}
                    style={{ color: "#0176d3", fontWeight: 500, cursor: "pointer", textDecoration: "underline", textDecorationColor: "#0176d3" }}>
                    {inv.swoNo}
                  </span>
                </td>
                <td style={{ ...S.td, color: "#0176d3" }}>{inv.customer}</td>
                <td style={S.td}>{inv.invoiceDate}</td>
                <td style={S.td}>{inv.dueDate}</td>
                <td style={S.td}><span style={{ ...S.pill, background: statusColor(inv.status) }}>{inv.status}</span></td>
                <td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmt(inv.total)}</td>
                <td style={{ ...S.td, textAlign: "right", color: "#2e844a" }}>{fmt(inv.amountPaid)}</td>
                <td style={{ ...S.td, textAlign: "right", color: inv.amountDue > 0 ? "#ea001e" : "#444746", fontWeight: inv.amountDue > 0 ? 600 : 400 }}>
                  {fmt(inv.amountDue)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ─── Print View ─── */
function PrintView({ invoices, total, onClose }: { invoices: Invoice[]; total: number; onClose: () => void }) {
  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 9999, background: "#f5f5f5", overflow: "auto" }}>
      <div style={{ position: "sticky", top: 0, zIndex: 10, background: "#fff", borderBottom: "1px solid #ecebea", padding: "12px 24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <span style={{ fontSize: 15, fontWeight: 700, color: "#001526" }}>Print Preview — {invoices.length} Invoice(s)</span>
        <div style={{ display: "flex", gap: 8 }}>
          <button onClick={() => window.print()} style={PS.printBtn}>Cetak Sekarang</button>
          <button onClick={onClose} style={{ ...PS.printBtn, background: "#fff", color: "#444746", border: "1px solid #d8d8d8" }}><X size={14} /> Tutup</button>
        </div>
      </div>

      <div style={{ maxWidth: 800, margin: "24px auto", padding: "0 16px" }}>
        {invoices.map((inv, idx) => (
          <div key={inv.docNo} style={{ background: "#fff", padding: 32, marginBottom: 24, borderRadius: 8, border: "1px solid #ecebea", pageBreakAfter: idx < invoices.length - 1 ? "always" : "auto" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24, borderBottom: "2px solid #0176d3", paddingBottom: 16 }}>
              <div><div style={{ fontSize: 11, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", letterSpacing: "0.05em" }}>Service Invoice</div><div style={{ fontSize: 18, fontWeight: 700, color: "#001526", marginTop: 4 }}>{inv.docNo}</div></div>
              <div style={{ textAlign: "right" }}><div style={{ fontSize: 14, fontWeight: 700, color: "#0176d3" }}>pwncorp</div><div style={{ fontSize: 11, color: "#8e8f8e" }}>Wijaya Motor — One Stop Service</div></div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px 32px", marginBottom: 24 }}>
              <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Customer</span><div style={{ fontSize: 14, fontWeight: 600, color: "#001526" }}>{inv.customer}</div></div>
              <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Invoice Date</span><div style={{ fontSize: 13, color: "#001526" }}>{inv.invoiceDate}</div></div>
              <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>SWO Reference</span><div style={{ fontSize: 13, color: "#0176d3", fontWeight: 500 }}>{inv.swoNo}</div></div>
              <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Due Date</span><div style={{ fontSize: 13, color: "#001526" }}>{inv.dueDate}</div></div>
              <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>SRO Reference</span><div style={{ fontSize: 13, color: "#0176d3", fontWeight: 500 }}>{inv.soNo}</div></div>
              <div><span style={{ fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" }}>Status</span><div style={{ fontSize: 13, color: "#001526" }}>{inv.status}</div></div>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
              <thead>
                <tr style={{ background: "#f5f5f5" }}>
                  <th style={PT.thL}>#</th><th style={PT.thL}>Item</th><th style={PT.thL}>Description</th><th style={PT.thR}>Qty</th><th style={PT.thR}>Total</th>
                </tr>
              </thead>
              <tbody>
                {inv.services.length > 0 ? (
                  inv.services.map((s, i) => (
                    <tr key={i}>
                      <td style={PT.td}>{i + 1}</td><td style={{ ...PT.td, fontWeight: 500 }}>{s.item}</td><td style={PT.td}>{s.description}</td><td style={{ ...PT.td, textAlign: "right" }}>{s.qty}</td><td style={{ ...PT.td, textAlign: "right", fontWeight: 600 }}>{fmtRp(s.total)}</td>
                    </tr>
                  ))
                ) : (
                  <tr><td colSpan={5} style={{ ...PT.td, textAlign: "center", color: "#8e8f8e" }}>No service items available</td></tr>
                )}
              </tbody>
              <tfoot>
                <tr><td colSpan={4} style={PT.totalL}>TOTAL</td><td style={PT.totalR}>{fmtRp(inv.total)}</td></tr>
              </tfoot>
            </table>
            <div style={{ display: "flex", gap: 24, marginTop: 16, padding: "12px 16px", background: "#f9f9f9", borderRadius: 6 }}>
              <div><span style={{ fontSize: 10, color: "#8e8f8e" }}>Amount Received</span><div style={{ fontSize: 14, fontWeight: 600, color: "#2e844a" }}>{fmtRp(inv.amountPaid)}</div></div>
              <div><span style={{ fontSize: 10, color: "#8e8f8e" }}>Amount Due</span><div style={{ fontSize: 14, fontWeight: 600, color: inv.amountDue > 0 ? "#ea001e" : "#444746" }}>{fmtRp(inv.amountDue)}</div></div>
            </div>
          </div>
        ))}
        <div style={{ background: "#032d47", color: "#fff", padding: "16px 24px", borderRadius: 8, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ fontSize: 14, fontWeight: 600 }}>Grand Total — {invoices.length} Invoice(s)</span>
          <span style={{ fontSize: 20, fontWeight: 700 }}>{fmtRp(total)}</span>
        </div>
      </div>
    </div>
  );
}

function FileIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" /><line x1="16" x2="8" y1="13" y2="13" /><line x1="16" x2="8" y1="17" y2="17" />
    </svg>
  );
}

const S: Record<string, React.CSSProperties> = {
  card: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 },
  input: { padding: "7px 10px", fontSize: 13, border: "1px solid #d8d8d8", borderRadius: 6, background: "#fff", color: "#001526", outline: "none" },
  tableWrap: { border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse", fontSize: 13 },
  th: { padding: "10px 12px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", background: "#f9f9f9", borderBottom: "1px solid #ecebea" },
  td: { padding: "10px 12px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
  pill: { display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, color: "#fff" },
};

const PS: Record<string, React.CSSProperties> = {
  printBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 16px", fontSize: 13, fontWeight: 600, color: "#fff", background: "#0176d3", border: "none", borderRadius: 6, cursor: "pointer" },
};

const PT: Record<string, React.CSSProperties> = {
  thL: { padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746", borderBottom: "1px solid #ecebea" },
  thR: { padding: "8px 10px", textAlign: "right", fontWeight: 600, fontSize: 11, color: "#444746", borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0" },
  totalL: { padding: "10px", textAlign: "right", fontWeight: 700, fontSize: 14, color: "#001526", borderTop: "2px solid #0176d3" },
  totalR: { padding: "10px", textAlign: "right", fontWeight: 700, fontSize: 14, color: "#001526", borderTop: "2px solid #0176d3" },
};
