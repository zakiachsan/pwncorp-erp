"use client";

import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Pencil } from "lucide-react";

/* ── dummy data ── */
const packageData: Record<string, any> = {
  "PACK-BODYREPAIR03": {
    sku: "PACK-BODYREPAIR03",
    name: "CAT ALL BODY, LAS / KETOK / DEMPUL + EPOXY + CAT FINISHING",
    description: "ISUZU PANTHER TBR54 PICK UP",
    tax: "PPN",
    price: 12729358,
    priceIncTax: 14129587,
    active: true,
    isOpenPackage: false,
    estimatedTime: "",
    createdBy: "YUSRO IQBAL (yusroiqbal99@gmail.com)",
    createdAt: "18-Jul-2025 09:52 AM",
    updatedBy: "YUSRO IQBAL (yusroiqbal99@gmail.com)",
    updatedAt: "18-Jul-2025 09:52 AM",
    services: [
      { no: 1, name: "JSB-DEMPUL - DEMPUL BODY TOTAL", originalPrice: 0, unitMarkup: 2545872, priceAfterMarkup: 2545872, qty: 1, originalAmount: 0, finalAmount: 2545872, otherTax: 0 },
      { no: 2, name: "JSB-EPOXY01 - EPOXY DEMPUL", originalPrice: 0, unitMarkup: 2545872, priceAfterMarkup: 2545872, qty: 1, originalAmount: 0, finalAmount: 2545872, otherTax: 0 },
      { no: 3, name: "JSB-EPOXY02 - FINISHING EPOXY DEMPUL", originalPrice: 0, unitMarkup: 2545872, priceAfterMarkup: 2545872, qty: 1, originalAmount: 0, finalAmount: 2545872, otherTax: 0 },
      { no: 4, name: "JSB-CAT01 - CAT DAN VERNIS TOTAL", originalPrice: 0, unitMarkup: 2545872, priceAfterMarkup: 2545872, qty: 1, originalAmount: 0, finalAmount: 2545872, otherTax: 0 },
      { no: 5, name: "JSB-CAT02 - FINISHING CAT DAN VERNIS", originalPrice: 0, unitMarkup: 2545872, priceAfterMarkup: 2545872, qty: 1, originalAmount: 0, finalAmount: 2545872, otherTax: 0 },
    ],
  },
};

/* ── format Rupiah ── */
function fmt(n: number): string {
  return n.toLocaleString("id-ID").replace(/,/g, ".");
}

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
  const pkg = packageData["PACK-BODYREPAIR03"];

  if (!pkg) {
    return (
      <div style={{ padding: 24 }}>
        <p style={{ color: "#ea001e", fontWeight: 600 }}>Package not found: {sku}</p>
        <button onClick={() => router.push("/service-packages")} style={{ marginTop: 12, color: "#0176d3", cursor: "pointer", border: "none", background: "transparent", fontSize: 13 }}>
          ← Back to Package Services
        </button>
      </div>
    );
  }

  // compute totals
  const totalQty = pkg.services.reduce((acc: number, s: any) => acc + s.qty, 0);
  const totalFinalAmount = pkg.services.reduce((acc: number, s: any) => acc + s.finalAmount, 0);
  const totalOriginalAmount = pkg.services.reduce((acc: number, s: any) => acc + s.originalAmount, 0);
  const totalOtherTax = pkg.services.reduce((acc: number, s: any) => acc + s.otherTax, 0);

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
            <Field label="Tax" value={pkg.tax} />
          </div>

          {/* Store Pricing */}
          <h3 style={{ ...SS.sectionTitle, marginTop: 20 }}>Store Pricing</h3>
          <div style={SS.card}>
            <Field
              label="Price"
              value={
                <span>
                  <span style={{ fontWeight: 700 }}>{fmt(pkg.price)}</span>
                  <span style={{ color: "#444746", fontWeight: 400, marginLeft: 8 }}>
                    ({fmt(pkg.priceIncTax)} Inc.Tax)
                  </span>
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
                <span style={{ color: "#2e844a", fontSize: 18, fontWeight: 700 }}>✓</span>
              </div>
            </div>
            <div style={{ marginBottom: 12 }}>
              <div style={SS.fieldLabel}>Is Open Package</div>
              <div style={SS.fieldValue}>
                <span style={{ color: "#ea001e", fontSize: 18, fontWeight: 700 }}>✗</span>
              </div>
            </div>
            <div>
              <div style={SS.fieldLabel}>Estimated Time</div>
              <div style={SS.fieldValue}>
                <span style={{ color: "#d8d8d8" }}>—</span>
              </div>
            </div>
          </div>

          {/* Changes */}
          <h3 style={{ ...SS.sectionTitle, marginTop: 20 }}>Changes</h3>
          <div style={SS.card}>
            <Field label="Created By" value={pkg.createdBy} />
            <Field label="Created At" value={pkg.createdAt} />
            <Field label="Updated By" value={pkg.updatedBy} />
            <Field label="Updated At" value={pkg.updatedAt} />
          </div>
        </div>
      </div>

      {/* ── Services Table ── */}
      <h3 style={{ ...SS.sectionTitle, marginTop: 8 }}>Services</h3>
      <div style={{ border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" }}>
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
            {pkg.services.map((s: any) => (
              <tr
                key={s.no}
                style={{ borderBottom: "1px solid #f0f0f0" }}
              >
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
          {/* Total Row */}
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
