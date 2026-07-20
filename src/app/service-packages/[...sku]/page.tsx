"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, Pencil } from "lucide-react";

/* ── format Rupiah ── */
function fmt(n: number): string {
  return n.toLocaleString("id-ID").replace(/,/g, ".");
}

const fmtDate = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" });
};

/* ── Section styles ── */
const SS = {
  sectionTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: "#0176d3",
    marginBottom: 10,
    borderBottom: "1px solid #ecebea",
    paddingBottom: 6,
  } as React.CSSProperties,
  card: {
    background: "#fff",
    border: "1px solid #ecebea",
    borderRadius: 8,
    padding: "12px 16px",
    boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
  } as React.CSSProperties,
  fieldLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: "#444746",
    marginBottom: 2,
  } as React.CSSProperties,
  fieldValue: {
    fontSize: 13,
    fontWeight: 500,
    color: "#001526",
    wordBreak: "break-word" as const,
  } as React.CSSProperties,
};

function Field({ label, value }: { label: string; value: string | React.ReactNode }) {
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={SS.fieldLabel}>{label}</div>
      <div style={SS.fieldValue}>{value || <span style={{ color: "#d8d8d8" }}>—</span>}</div>
    </div>
  );
}

export default function PackageServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const skuArr = Array.isArray(params.sku) ? params.sku : [params.sku];
  const sku = skuArr.join("/");

  const [pkg, setPkg] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!sku) return;
    setLoading(true);
    fetch(`/api/service-packages?search=${encodeURIComponent(sku)}&limit=1`)
      .then((r) => r.json())
      .then((j) => {
        const found = j.data?.[0];
        if (!found) { setError(`Package not found: ${sku}`); setLoading(false); return; }
        setPkg(found);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load data"); setLoading(false); });
  }, [sku]);

  if (loading) {
    return (
      <div style={{ padding: 24 }}>
        <div style={{ ...SS.card, textAlign: "center", color: "#444746", padding: 40 }}>Loading...</div>
      </div>
    );
  }

  if (error || !pkg) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "#ea001e", fontWeight: 600 }}>{error || `Package not found: ${sku}`}</p>
        <button onClick={() => router.push("/service-packages")} style={{ marginTop: 12, color: "#0176d3", cursor: "pointer", border: "none", background: "transparent", fontSize: 13 }}>
          ← Back to Package Services
        </button>
      </div>
    );
  }

  // Services items — not available from current API schema
  const services: any[] = [];
  const totalQty = 0;
  const totalFinalAmount = 0;
  const totalOriginalAmount = 0;
  const totalOtherTax = 0;

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* ── Page Title ── */}
      <h1 style={{ fontSize: 20, fontWeight: 700, color: "#001526", marginBottom: 12 }}>
        Package Service Details
      </h1>

      {/* ── Identifier Banner ── */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          padding: "10px 16px",
          background: "#e6f0fa",
          border: "1px solid #b8d4f0",
          borderRadius: 8,
          marginBottom: 20,
          gap: 8,
        }}
      >
        <span style={{ fontSize: 14, color: "#0176d3" }}>🔗</span>
        <span
          style={{ fontSize: 14, fontWeight: 700, color: "#0176d3", cursor: "pointer" }}
        >
          {pkg.sku} - {pkg.name}
        </span>
      </div>

      {/* ── Two-column Layout ── */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 380px",
          gap: 24,
          alignItems: "start",
          marginBottom: 24,
        }}
      >
        {/* LEFT COLUMN */}
        <div>
          {/* Details */}
          <h3 style={SS.sectionTitle}>Details</h3>
          <div style={SS.card}>
            <Field label="SKU" value={pkg.sku} />
            <Field label="Name" value={pkg.name} />
            <Field label="Description" value={pkg.description} />
          </div>

          {/* Tax */}
          <h3 style={{ ...SS.sectionTitle, marginTop: 20 }}>Tax</h3>
          <div style={SS.card}>
            <Field label="Tax" value={pkg.tax || "—"} />
          </div>

          {/* Store Pricing */}
          <h3 style={{ ...SS.sectionTitle, marginTop: 20 }}>Store Pricing</h3>
          <div style={SS.card}>
            <Field
              label="Price"
              value={
                <span>
                  <span style={{ fontWeight: 700 }}>{fmt(pkg.price || 0)}</span>
                </span>
              }
            />
          </div>
        </div>

        {/* RIGHT COLUMN */}
        <div>
          {/* Settings */}
          <h3 style={SS.sectionTitle}>Settings</h3>
          <div style={SS.card}>
            <div style={{ marginBottom: 12 }}>
              <div style={SS.fieldLabel}>Active</div>
              <div style={SS.fieldValue}>
                <span style={{ color: pkg.isActive ? "#2e844a" : "#ea001e", fontSize: 18, fontWeight: 700 }}>{pkg.isActive ? "✓" : "✗"}</span>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={SS.fieldLabel}>Is Open Package</div>
              <div style={SS.fieldValue}>
                <span style={{ color: "#d8d8d8" }}>—</span>
              </div>
            </div>
            <div>
              <div style={SS.fieldLabel}>Estimated Time</div>
              <div style={SS.fieldValue}>
                <span>{pkg.estDuration || <span style={{ color: "#d8d8d8" }}>—</span>}</span>
              </div>
            </div>
          </div>

          {/* Changes */}
          <h3 style={{ ...SS.sectionTitle, marginTop: 20 }}>Changes</h3>
          <div style={SS.card}>
            <Field label="Created At" value={fmtDate(pkg.createdAt)} />
          </div>
        </div>
      </div>

      {/* ── Services Table ── */}
      <h3 style={{ ...SS.sectionTitle, marginTop: 8 }}>Services</h3>
      <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
        {services.length > 0 ? (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
            <thead>
              <tr style={{ background: "#f9f9f9" }}>
                <th style={thStyle}>No.</th>
                <th style={thStyle}>Service</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Original Price</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Unit Markup Amount</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Price After Markup</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Quantity</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Original Amount</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Final Amount</th>
                <th style={{ ...thStyle, textAlign: "right" }}>Other Tax Amount</th>
              </tr>
            </thead>
            <tbody>
              {services.map((s: any) => (
                <tr key={s.no} style={{ borderBottom: "1px solid #f0f0f0" }}>
                  <td style={tdStyle}>{s.no}</td>
                  <td style={{ ...tdStyle, color: "#0176d3", cursor: "pointer" }}>{s.name}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.originalPrice)}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.unitMarkup)}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{fmt(s.priceAfterMarkup)}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{s.qty}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.originalAmount)}</td>
                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>{fmt(s.finalAmount)}</td>
                  <td style={{ ...tdStyle, textAlign: "right" }}>{fmt(s.otherTax)}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr style={{ background: "#f9f9f9", fontWeight: 700 }}>
                <td style={{ ...tdStyle, fontWeight: 700 }} colSpan={5}></td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>
                  <span style={{ color: "#444746", fontWeight: 400 }}>Total </span>
                  {totalQty}
                </td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{fmt(totalOriginalAmount)}</td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{fmt(totalFinalAmount)}</td>
                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700 }}>{fmt(totalOtherTax)}</td>
              </tr>
            </tfoot>
          </table>
        ) : (
          <div style={{ padding: 24, textAlign: "center", color: "#8e8f8e", fontSize: 13 }}>Belum ada service items</div>
        )}
      </div>

      {/* ── Bottom Buttons ── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginTop: 24,
        }}
      >
        <button
          onClick={() => router.push("/service-packages")}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 20px",
            fontSize: 13,
            fontWeight: 500,
            color: "#444746",
            background: "#fff",
            border: "1px solid #d8d8d8",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          <ArrowLeft size={15} /> Service Products
        </button>

        <button
          onClick={() => router.push(`/service-packages/${pkg.sku}/edit`)}
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "8px 20px",
            fontSize: 13,
            fontWeight: 600,
            color: "#fff",
            background: "#0176d3",
            border: "none",
            borderRadius: 6,
            cursor: "pointer",
          }}
        >
          <Pencil size={14} /> Edit
        </button>
      </div>
    </div>
  );
}

const thStyle: React.CSSProperties = {
  padding: "10px 12px",
  textAlign: "left",
  fontWeight: 600,
  fontSize: 11,
  color: "#444746",
  borderBottom: "1px solid #ecebea",
  whiteSpace: "nowrap",
};

const tdStyle: React.CSSProperties = {
  padding: "10px 12px",
  color: "#001526",
  fontSize: 13,
};
