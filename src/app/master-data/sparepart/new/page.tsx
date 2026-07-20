"use client";

import { useRouter } from "next/navigation";
import { useState, useRef } from "react";
import { ArrowLeft, Save } from "lucide-react";

export default function CreateSparepartPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const form = formRef.current;
    if (!form) return;

    const sku = (form.elements.namedItem("sku") as HTMLInputElement).value;
    const name = (form.elements.namedItem("name") as HTMLInputElement).value;
    const brand = (form.elements.namedItem("brand") as HTMLInputElement).value;
    const category = (form.elements.namedItem("category") as HTMLSelectElement).value;
    const buyPrice = (form.elements.namedItem("buyPrice") as HTMLInputElement).value;
    const sellPrice = (form.elements.namedItem("sellPrice") as HTMLInputElement).value;

    if (!sku || !name) {
      setError("Kode dan nama sparepart wajib diisi");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/spareparts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          sku,
          name,
          brand,
          category,
          buyPrice: buyPrice ? parseFloat(buyPrice) : 0,
          sellPrice: sellPrice ? parseFloat(sellPrice) : 0,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Gagal menyimpan sparepart");
      router.push("/master-data/sparepart");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/master-data/sparepart")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Add Sparepart</h1>
      </div>
      {error && (
        <div style={{ background: "#fef2f2", border: "1px solid #fecaca", borderRadius: 8, padding: "10px 14px", marginBottom: 16, color: "#dc2626", fontSize: 13 }}>{error}</div>
      )}
      <form ref={formRef} onSubmit={handleSubmit}>
        <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
          <FInput name="sku" label="KODE" placeholder="Contoh: SP-007" />
          <FInput name="name" label="NAMA" placeholder="Nama sparepart" />
          <FInput name="brand" label="BRAND" placeholder="Brand" />
          <FSelect name="category" label="KATEGORI" options={["Oli", "Filter", "Rem", "Pengapian", "Kelistrikan", "Mesin", "Body"]} />
          <FInput name="buyPrice" label="HARGA BELI" placeholder="Harga beli" type="number" />
          <FInput name="sellPrice" label="HARGA JUAL" placeholder="Harga jual" type="number" />
          <div style={{ marginTop: 20 }}>
            <button type="submit" disabled={loading} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#fff", background: loading ? "#a0c4e8" : "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: loading ? "not-allowed" : "pointer" }}>
              <Save size={14} /> {loading ? "Menyimpan..." : "Simpan"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function FInput({ name, label, placeholder, type = "text" }: { name: string; label: string; placeholder: string; type?: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <input name={name} type={type} placeholder={placeholder} style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none" }} />
    </div>
  );
}

function FSelect({ name, label, options }: { name: string; label: string; options: string[] }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <select name={name} style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff" }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
