"use client";

import { useEffect, useState, useMemo } from "react";
import { Search, Check, Calendar } from "lucide-react";

interface CustomerBilling {
  id: string;
  customer: string;
  store: string;
  projectId: string;
  nilaiKontrak: number;
  terminJumlah: number;
  bulan: Record<string, { ditagihkan: number; dibayar: number | null; status: "paid" | "planned" | null }>;
}

const terminOptions = ["Tidak", "1 Kali", "2 Kali", "3 Kali"];
const bulanLabels = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const data: CustomerBilling[] = [];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function RencanaTagihanPage() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(2026);
  const [apiData, setApiData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch accounts receivable from API
  useEffect(() => {
    fetch("/api/accounts-receivable?limit=100")
      .then((r) => r.json())
      .then((j) => { setApiData(j.data || []); setLoading(false); })
      .catch(() => { setError("Failed to load AR data"); setLoading(false); });
  }, []);

  // Build billing-plan-like data from API response (best-effort mapping)
  const apiBillingData: CustomerBilling[] = useMemo(() => {
    if (!apiData || apiData.length === 0) return [];
    // Group by customer
    const byCustomer: Record<string, any[]> = {};
    for (const ar of apiData) {
      const custName = ar.customer?.name || "Unknown";
      if (!byCustomer[custName]) byCustomer[custName] = [];
      byCustomer[custName].push(ar);
    }
    return Object.entries(byCustomer).map(([customer, items], idx) => {
      const totalAmount = items.reduce((s: number, i: any) => s + (i.amount || 0), 0);
      const paid = items.filter((i: any) => i.status === "PAID").reduce((s: number, i: any) => s + (i.amount || 0), 0);
      const bulan: Record<string, { ditagihkan: number; dibayar: number | null; status: "paid" | "planned" | null }> = {};
      bulanLabels.forEach((m) => { bulan[m] = { ditagihkan: 0, dibayar: null, status: null }; });
      // Map paid items to their months
      for (const item of items) {
        if (item.status === "PAID" && item.dueDate) {
          const monthIdx = new Date(item.dueDate).getMonth();
          const m = bulanLabels[monthIdx];
          if (m) {
            bulan[m] = { ditagihkan: item.amount || 0, dibayar: item.amount || 0, status: "paid" };
          }
        } else if (item.status !== "PAID" && item.dueDate) {
          const monthIdx = new Date(item.dueDate).getMonth();
          const m = bulanLabels[monthIdx];
          if (m && !bulan[m].status) {
            bulan[m] = { ditagihkan: item.amount || 0, dibayar: null, status: "planned" };
          }
        }
      }
      return {
        id: `API-${String(idx + 1).padStart(3, "0")}`,
        customer,
        store: items[0]?.invoice?.store?.name || "—",
        projectId: items[0]?.invoice?.invNo || "—",
        nilaiKontrak: totalAmount,
        terminJumlah: items.length > 1 ? Math.min(items.length, 3) : 0,
        bulan,
      };
    });
  }, [apiData]);

  // Use API data if available, otherwise fallback to hardcoded
  const displayData = apiBillingData.length > 0 ? apiBillingData : data;

  const filtered = displayData.filter(
    (d) => !search || d.customer.toLowerCase().includes(search.toLowerCase()) || d.projectId.toLowerCase().includes(search.toLowerCase())
  );

  const summaryData = useMemo(() => {
    return filtered.reduce((acc, d) => {
      acc.totalKontrak += d.nilaiKontrak;
      Object.values(d.bulan).forEach((b) => {
        if (b.status === "paid") acc.paid += b.dibayar || 0;
        if (b.status === "planned") acc.planned += b.ditagihkan;
      });
      return acc;
    }, { totalKontrak: 0, paid: 0, planned: 0 });
  }, [filtered]);

  const sisaBelum = summaryData.totalKontrak - summaryData.paid;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <CalendarIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Rencana Tagihan
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <SummaryCard label="Total Nilai Kontrak" value={fmt(summaryData.totalKontrak)} color="#001526" />
        <SummaryCard label="Sudah Dibayar" value={fmt(summaryData.paid)} color="#2e844a" />
        <SummaryCard label="Rencana Ditagihkan" value={fmt(summaryData.planned)} color="#0176d3" />
        <SummaryCard label="Sisa Belum Ditagih" value={fmt(sisaBelum)} color="#ea001e" />
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="form-group">
            <label className="form-label">Tahun</label>
            <select className="form-select" value={year} onChange={(e) => setYear(parseInt(e.target.value))}>
              <option value={2025}>2025</option>
              <option value={2026}>2026</option>
              <option value={2027}>2027</option>
              <option value={2028}>2028</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input type="text" className="form-input" placeholder="Nama / Project ID..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center"><Search size={14} /> Cari</button>
          </div>
        </div>
      </div>

      {/* Billing Plan Table */}
      <div className="table-wrap" style={{ overflowX: "auto" }}>
        <table className="data-table" style={{ minWidth: 2000 }}>
          <thead>
            <tr>
              <th style={{ minWidth: 180 }}>Customer</th>
              <th style={{ minWidth: 180 }}>Store</th>
              <th style={{ textAlign: "right", minWidth: 130, whiteSpace: "nowrap" }}>Nilai Kontrak</th>
              <th style={{ textAlign: "center", minWidth: 90 }}>Termin</th>
              <th style={{ textAlign: "right", minWidth: 110, whiteSpace: "nowrap" }}>Sisa</th>
              {bulanLabels.map((m) => (
                <th key={m} style={{ textAlign: "center", minWidth: 130 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <Calendar size={12} /> {m.substring(0, 3)} {year}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((d) => {
              const paid = Object.values(d.bulan).filter((b) => b.status === "paid").reduce((s, b) => s + (b.dibayar || 0), 0);
              const sisa = d.nilaiKontrak - paid;

              return (
                <tr key={d.id}>
                  <td>
                    <div style={{ fontWeight: 600, color: "#001526" }}>{d.customer}</div>
                    <div style={{ fontSize: 11, color: "#8e8f8e", fontFamily: "monospace" }}>{d.projectId}</div>
                  </td>
                  <td style={{ fontSize: 12, color: "#444746" }}>{d.store}</td>
                  <td style={{ textAlign: "right", fontWeight: 600 }}>{fmt(d.nilaiKontrak)}</td>
                  <td style={{ textAlign: "center" }}>
                    <span style={{
                      display: "inline-block", padding: "3px 10px", borderRadius: 6, fontSize: 12, fontWeight: 600,
                      background: d.terminJumlah === 0 ? "#f5f5f5" : "#e3f2fd",
                      color: d.terminJumlah === 0 ? "#8e8f8e" : "#0176d3",
                    }}>
                      {terminOptions[d.terminJumlah] || `${d.terminJumlah} Kali`}
                    </span>
                  </td>
                  <td style={{ textAlign: "right", fontWeight: 700, color: sisa > 0 ? "#ea001e" : "#2e844a" }}>{fmt(sisa)}</td>
                  {bulanLabels.map((m) => {
                    const b = d.bulan[m];
                    if (!b || (b.ditagihkan === 0 && b.status !== "paid")) {
                      return <td key={m} style={{ textAlign: "center", color: "#d8d8d8" }}>-</td>;
                    }
                    if (b.status === "paid") {
                      return (
                        <td key={m} style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-flex", alignItems: "center", gap: 4, padding: "5px 10px", borderRadius: 6, background: "#e8f5e9", fontWeight: 600, color: "#2e844a", fontSize: 12 }}>
                            <Check size={13} /> {fmt(b.dibayar!)}
                          </div>
                        </td>
                      );
                    }
                    if (b.status === "planned") {
                      return (
                        <td key={m} style={{ textAlign: "center" }}>
                          <div style={{ display: "inline-block", padding: "5px 10px", borderRadius: 6, background: "#fff3e0", fontWeight: 600, color: "#fe9339", fontSize: 12 }}>
                            {fmt(b.ditagihkan)}
                          </div>
                        </td>
                      );
                    }
                    return <td key={m} style={{ textAlign: "center", color: "#d8d8d8" }}>-</td>;
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: 16, marginTop: 12, fontSize: 12, color: "#8e8f8e", flexWrap: "wrap" }}>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "#e8f5e9" }} /> Sudah Dibayar
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
          <span style={{ width: 12, height: 12, borderRadius: 3, background: "#fff3e0" }} /> Rencana Tagihan
        </span>
        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, marginLeft: 8 }}>
          Tampil: <strong>{year}</strong>
        </span>
      </div>
    </div>
  );
}

function SummaryCard({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="card-slds" style={{ padding: "14px 16px" }}>
      <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">{label}</div>
      <div style={{ fontSize: 20, fontWeight: 700, color }}>{value}</div>
    </div>
  );
}

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
