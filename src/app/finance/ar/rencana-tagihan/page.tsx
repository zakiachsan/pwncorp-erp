"use client";

import { useState, useMemo } from "react";
import { Search, Check, Calendar } from "lucide-react";

interface CustomerBilling {
  id: string;
  customer: string;
  projectId: string;
  nilaiKontrak: number;
  terminJumlah: number;
  bulan: Record<string, { ditagihkan: number; dibayar: number | null; status: "paid" | "planned" | null }>;
}

const terminOptions = ["Tidak", "1 Kali", "2 Kali", "3 Kali"];

const bulanLabels = ["Januari", "Februari", "Maret", "April", "Mei", "Juni", "Juli", "Agustus", "September", "Oktober", "November", "Desember"];

const data: CustomerBilling[] = [
  {
    id: "C-001", customer: "PT Maju Jaya", projectId: "PRJ/001/26040410", nilaiKontrak: 45000000, terminJumlah: 3,
    bulan: {
      "Januari": { ditagihkan: 0, dibayar: null, status: null },
      "Februari": { ditagihkan: 0, dibayar: null, status: null },
      "Maret": { ditagihkan: 0, dibayar: null, status: null },
      "April": { ditagihkan: 13500000, dibayar: 13500000, status: "paid" },
      "Mei": { ditagihkan: 0, dibayar: null, status: null },
      "Juni": { ditagihkan: 18000000, dibayar: null, status: "planned" },
      "Juli": { ditagihkan: 0, dibayar: null, status: null },
      "Agustus": { ditagihkan: 13500000, dibayar: null, status: null },
      "September": { ditagihkan: 0, dibayar: null, status: null },
      "Oktober": { ditagihkan: 0, dibayar: null, status: null },
      "November": { ditagihkan: 0, dibayar: null, status: null },
      "Desember": { ditagihkan: 0, dibayar: null, status: null },
    },
  },
  {
    id: "C-002", customer: "PT Transport Jaya", projectId: "PRJ/002/26050501", nilaiKontrak: 25000000, terminJumlah: 2,
    bulan: {
      "Januari": { ditagihkan: 0, dibayar: null, status: null },
      "Februari": { ditagihkan: 0, dibayar: null, status: null },
      "Maret": { ditagihkan: 0, dibayar: null, status: null },
      "April": { ditagihkan: 0, dibayar: null, status: null },
      "Mei": { ditagihkan: 12500000, dibayar: 12500000, status: "paid" },
      "Juni": { ditagihkan: 12500000, dibayar: null, status: "planned" },
      "Juli": { ditagihkan: 0, dibayar: null, status: null },
      "Agustus": { ditagihkan: 0, dibayar: null, status: null },
      "September": { ditagihkan: 0, dibayar: null, status: null },
      "Oktober": { ditagihkan: 0, dibayar: null, status: null },
      "November": { ditagihkan: 0, dibayar: null, status: null },
      "Desember": { ditagihkan: 0, dibayar: null, status: null },
    },
  },
  {
    id: "C-003", customer: "CV Berkah Abadi", projectId: "PRJ/003/26060601", nilaiKontrak: 18000000, terminJumlah: 2,
    bulan: {
      "Januari": { ditagihkan: 0, dibayar: null, status: null },
      "Februari": { ditagihkan: 0, dibayar: null, status: null },
      "Maret": { ditagihkan: 0, dibayar: null, status: null },
      "April": { ditagihkan: 0, dibayar: null, status: null },
      "Mei": { ditagihkan: 0, dibayar: null, status: null },
      "Juni": { ditagihkan: 7200000, dibayar: 7200000, status: "paid" },
      "Juli": { ditagihkan: 0, dibayar: null, status: null },
      "Agustus": { ditagihkan: 10800000, dibayar: null, status: "planned" },
      "September": { ditagihkan: 0, dibayar: null, status: null },
      "Oktober": { ditagihkan: 0, dibayar: null, status: null },
      "November": { ditagihkan: 0, dibayar: null, status: null },
      "Desember": { ditagihkan: 0, dibayar: null, status: null },
    },
  },
  {
    id: "C-004", customer: "Budi Santoso", projectId: "PRJ/004/26060620", nilaiKontrak: 2500000, terminJumlah: 0,
    bulan: {
      "Januari": { ditagihkan: 0, dibayar: null, status: null },
      "Februari": { ditagihkan: 0, dibayar: null, status: null },
      "Maret": { ditagihkan: 0, dibayar: null, status: null },
      "April": { ditagihkan: 0, dibayar: null, status: null },
      "Mei": { ditagihkan: 0, dibayar: null, status: null },
      "Juni": { ditagihkan: 2500000, dibayar: 2500000, status: "paid" },
      "Juli": { ditagihkan: 0, dibayar: null, status: null },
      "Agustus": { ditagihkan: 0, dibayar: null, status: null },
      "September": { ditagihkan: 0, dibayar: null, status: null },
      "Oktober": { ditagihkan: 0, dibayar: null, status: null },
      "November": { ditagihkan: 0, dibayar: null, status: null },
      "Desember": { ditagihkan: 0, dibayar: null, status: null },
    },
  },
];

const fmt = (n: number) => "Rp " + n.toLocaleString("id-ID");

export default function RencanaTagihanPage() {
  const [search, setSearch] = useState("");
  const [year, setYear] = useState(2026);

  const filtered = data.filter(
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

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-4">
        <div className="card-slds" style={{ textAlign: "center", padding: 16 }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Total Nilai Kontrak</div>
          <div className="text-2xl font-bold text-[--color-text-primary]">{fmt(summaryData.totalKontrak)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center", padding: 16 }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Sudah Dibayar</div>
          <div className="text-2xl font-bold text-[--color-success]">{fmt(summaryData.paid)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center", padding: 16 }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Rencana Ditagihkan</div>
          <div className="text-2xl font-bold text-[--color-brand]">{fmt(summaryData.planned)}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center", padding: 16 }}>
          <div className="text-xs font-semibold text-[--color-text-secondary] uppercase tracking-wide mb-1">Sisa Belum Ditagih</div>
          <div className="text-2xl font-bold text-[--color-error]">{fmt(sisaBelum)}</div>
        </div>
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
            <label className="form-label">Cari Customer</label>
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
              <th style={{ textAlign: "right", minWidth: 110 }}>Nilai Kontrak</th>
              <th style={{ textAlign: "center", minWidth: 90 }}>Termin</th>
              <th style={{ textAlign: "right", minWidth: 90 }}>Sisa</th>
              {bulanLabels.map((m) => (
                <th key={m} style={{ textAlign: "center", minWidth: 130 }}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 4 }}>
                    <Calendar size={12} /> {m} {year}
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

function CalendarIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" />
    </svg>
  );
}
