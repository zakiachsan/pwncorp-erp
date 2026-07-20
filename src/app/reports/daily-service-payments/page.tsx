"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, Star, Search, Download } from "lucide-react";

/* ── payment columns (exact list from spec) ── */
const paymentColumns = [
  "Net Sales (Inc Tax)",
  "Down Payment Applied",
  "Down Payment Received",
  "Own Risk Applied",
  "Points",
  "Voucher",
  "Cash",
  "DINAS SUMBER DAYA AIR PROVINSI DKI JAKARTA",
  "DINAS CIPTA KARYA TATA RUANG DAN PERTANAHAN PROVINSI DKI JAKARTA",
  "Customer Account",
  "KELURAHAN PASAR MANGGIS",
  "UNIT PENGELOLAAN KUNJUNGAN DAN GRAHA WISATA",
  "SMART TELECOM",
  "SUKU DINAS PERHUBUNGAN JAKARTA BARAT",
  "KEMENTRIAN NASIONAL PENDIDIKAN",
  "BADAN PUSAT STATISTIK",
  "KELURAHAN TEGAL PARANG",
  "SUKU DINAS PERPUSTAKAAN JAKARTA PUSAT",
  "KELURAHAN KAMAL",
  "KELURAHAN SUKABUMI",
  "KELURAHAN GAMBIR",
  "SUKU DINAS PERHUBUNGAN JAKARTA UTARA",
  "BADAN PENANGGULANGAN BENCANA DAERAH",
  "SUKU DINAS LINGKUNGAN HIDUP JAKARTA SELATAN",
  "ALAT DAN PERBEKALAN BINA MARGA",
  "WALIKOTA JAKARTA PUSAT",
  "DINAS PENCATATAN SIPIL PROVINSI DKI JAKARTA",
  "SUKU DINAS CIPTA KARYA JAKARTA PUSAT",
  "SATPOL PP PROVINSI DKI JAKARTA",
  "KEMENTRIAN DALAM NEGERI",
  "SUKU DINAS PEMADAM KEBAKARAN JAKARTA TIMUR",
  "SUKU DINAS PEMADAM KEBAKARAN JAKARTA BARAT",
  "SUKU DINAS PEMADAM KEBAKARAN JAKARTA UTARA",
  "UPT PERPARKIRAN DINAS PERHUBUNGAN PROVINSI DKI JAKARTA",
  "SATPOL PP JAKARTA UTARA",
  "DINAS KEBUDAYAAN PROVINSI DKI JAKARTA",
  "DINAS KESEHATAN PROVINSI DKI JAKARTA",
  "DEWAN KEHORMATAN PENYELENGGARAAN PEMILU",
  "BASARNAS DKI JAKARTA",
  "SUKU DINAS SUMBER DAYA AIR JAKARTA SELATAN",
  "DINAS PEMADAM KEBAKARAN PROVINSI DKI JAKARTA",
  "SUKU DINAS PERPUSTAKAAN JAKARTA SELATAN",
  "KEMENTERIAN KESEHATAN",
  "PUSKESMAS KEMBANGAN",
  "PANTI SOSIAL BINA DAKSA BUDI BHAKTI 1",
  "-",
  "WALIKOTA JAKARTA BARAT",
  "SUKU DINAS SUMBER DAYA AIR JAKARTA TIMUR",
  "SUKU DINAS PERHUBUNGAN JAKARTA SELATAN",
  "DINAS PENDIDIKAN PROVINSI DKI JAKARTA",
  "UNIT SARANA PRASARANA PENDIDIKAN DKI JAKARTA",
  "SATPOL PP JAKARTA PUSAT",
  "DINAS SUMBER DAYA AIR JAKARTA TIMUR",
  "DINAS SUMBER DAYA AIR JAKARTA BARAT",
  "SATPOL PP JAKARTA SELATAN",
  "SATPOL PP JAKARTA BARAT",
  "PUSAT DATA DAN INFORMASI",
  "KEMENTRIAN ENERGI SUMBER DAN MINERAL",
  "KEMENTRIAN BADAN NASIONAL PENGELOLA PERBATASAN",
  "KELURAHAN KUNINGAN TIMUR",
  "KELURAHAN KEMANGGISAN",
  "INSTITUT PEMERINTAHAN DALAM NEGERI",
  "DINAS SOSIAL PROVINSI",
  "BADAN PENGELOLA ASET DAERAH",
  "SUKU DINAS SOSIAL JAKARTA BARAT",
  "PT.SINERGI MULTI LESTARI INDO",
  "UNIVERSITAS PROF. DR.MOESTOPO",
  "SUKU DINAS PERTAMANAN DAN HUTAN KOTA JAKARTA UTARA",
  "BRI QRIS",
  "MANDIRI DEBIT",
  "BCA DEBIT",
  "BCA QRIS",
  "SUKU DINAS CIPTA KARYA TATA RUANG DAN PERTANAHAN JAKARTA SELATAN",
  "DINAS PARIWISATA DAN EKONOMI KREATIF PROVINSI DKI JAKARTA",
  "SUKU DINAS CIPTA KARYA TATA RUANG DAN PERTANAHAN JAKARTA BARAT",
  "PUSKESMAS KALIDERES",
  "PUSKESMAS GROGOL PETAMBURAN",
  "PUSAT DIREKTORAT JENDERAL PAJAK",
  "KANTOR PUSAT DJP",
  "PANTI SOSIAL PERLINDUNGAN BINA KARYA HARAPAN MULIA",
  "SUKU DINAS PEMADAM KEBAKARAN JAKARTA PUSAT",
  "SUKU DINAS KEPENDUDUKAN DAN CATATAN SIPIL JAKARTA SELATAN",
  "SUKU DINAS LINGKUNGAN HIDUP JAKARTA BARAT",
  "SUKU DINAS CIPTA KARYA TATA RUANG DAN PERTANAHAN JAKARTA TIMUR",
];

function fmt(n: number): string {
  return n.toLocaleString("id-ID").replace(/,/g, ".");
}

const L: React.CSSProperties = { color: "#0176d3", cursor: "pointer", fontWeight: 500 };

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="form-group" style={{ flex: "0 0 auto" }}>
      <label className="form-label">{label || "\u00A0"}</label>
      {children}
    </div>
  );
}

const TH: React.CSSProperties = {
  padding: "8px 10px", textAlign: "left", fontWeight: 600, fontSize: 11, color: "#444746",
  textTransform: "uppercase", letterSpacing: "0.03em", borderBottom: "2px solid #ecebea",
  borderRight: "1px solid #ecebea", background: "#f9f9f9", whiteSpace: "nowrap",
};

const TH_RIGHT: React.CSSProperties = { ...TH, textAlign: "right" };

const TD: React.CSSProperties = {
  padding: "7px 10px", color: "#001526", borderBottom: "1px solid #f0f0f0",
  borderRight: "1px solid #f0f0f0", whiteSpace: "nowrap",
};

const TD_RIGHT: React.CSSProperties = { ...TD, textAlign: "right" };

export default function DailyServicePaymentsPage() {
  const router = useRouter();
  const [rows, setRows] = useState<{ date: string; values: number[] }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/reports/service?report=daily-payments&limit=100")
      .then((r) => r.json())
      .then((j) => {
        // Group payments by date, map amount into the payment-type column
        const payments: any[] = j.data || [];
        const byDate: Record<string, Record<string, number>> = {};
        for (const p of payments) {
          const d = (p.paymentDate || "").slice(0, 10);
          if (!byDate[d]) byDate[d] = {};
          const pt = p.paymentType || p.method || "Cash";
          byDate[d][pt] = (byDate[d][pt] || 0) + (p.amount || 0);
        }
        const mapped = Object.entries(byDate)
          .sort(([a], [b]) => b.localeCompare(a))
          .map(([date, vals]) => ({
            date,
            values: paymentColumns.map((col) => vals[col] || 0),
          }));
        setRows(mapped.length > 0 ? mapped : Array.from({ length: 31 }, (_, i) => ({
          date: `2026-07-${String(i + 1).padStart(2, "0")}`,
          values: paymentColumns.map(() => 0),
        })));
        setLoading(false);
      })
      .catch(() => { setError("Failed to load daily payments"); setLoading(false); });
  }, []);

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  return (
    <div>
      {/* ── Header ── */}
      <div style={{
        padding: "6px 16px", background: "#f3f3f3", borderBottom: "1px solid #ecebea",
        display: "flex", alignItems: "center", justifyContent: "space-between",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <BarChart3 size={18} color="#0176d3" />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#001526" }}>
            Daily Service Payments July-2026
          </span>
        </div>
        <Star size={16} color="#f28500" />
      </div>

      {/* ── Filter Section ── */}
      <div style={{
        margin: "16px 24px", border: "1px solid #ecebea", borderRadius: 8,
        background: "#fff", padding: 16,
      }}>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap", alignItems: "flex-end" }}>
          <Field label="Period">
            <select className="form-select" style={{ minWidth: 140 }}>
              <option>Jul 2026</option>
            </select>
          </Field>
          <Field label="Store">
            <select className="form-select" style={{ minWidth: 200 }}>
              <option>PT Nia Jaya Motor</option>
              <option>All Stores</option>
              <option>PT Putra Wijaya Motor</option>
              <option>Wijaya Motor - One Stop Service</option>
            </select>
          </Field>
          <Field label="">&nbsp;</Field>
          <button className="btn btn--sm" style={{ minWidth: 90, justifyContent: "center", gap: 6 }}>
            <Search size={14} /> Show
          </button>
          <button className="btn btn--brand btn--sm" style={{
            minWidth: 110, justifyContent: "center", gap: 6, background: "#014486",
          }}>
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* ── Table ── */}
      <div style={{
        margin: "0 24px", border: "1px solid #ecebea", borderRadius: 8, overflow: "auto",
      }}>
        <table style={{ borderCollapse: "collapse", fontSize: 12, minWidth: "100%" }}>
          <thead>
            <tr style={{ background: "#f9f9f9" }}>
              <th style={TH}>Date</th>
              {paymentColumns.map((col, idx) => (
                <th key={idx} style={TH_RIGHT}>{col}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.date} style={{ background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                <td style={TD}>{row.date}</td>
                {row.values.map((val, j) => (
                  <td key={j} style={TD_RIGHT}>{fmt(val)}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* ── Horizontal scroll hint ── */}
      <div style={{ margin: "4px 24px 0", fontSize: 11, color: "#939393", fontStyle: "italic" }}>
        Scroll horizontally to view all {paymentColumns.length} payment columns.
      </div>

      {/* ── Pagination ── */}
      <div style={{
        margin: "16px 24px", display: "flex", justifyContent: "space-between",
        alignItems: "center", fontSize: 13, color: "#444746",
      }}>
        <div>Showing 1 — {rows.length} of {rows.length}</div>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn--sm" disabled style={{ opacity: 0.4 }}>&laquo; Prev</button>
          <button className="btn btn--sm">Next &raquo;</button>
        </div>
      </div>
    </div>
  );
}
