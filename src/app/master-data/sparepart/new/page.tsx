"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save } from "lucide-react";

export default function CreateSparepartPage() {
  const router = useRouter();
  return (
    <div style={{ padding: "0 24px 24px" }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 20 }}>
        <button onClick={() => router.push("/master-data/sparepart")} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" }}>
          <ArrowLeft size={16} />
        </button>
        <h1 style={{ fontSize: 18, fontWeight: 700, color: "#001526", margin: 0 }}>Add Sparepart</h1>
      </div>
      <div style={{ background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16 }}>
        <FInput label="KODE" placeholder="Contoh: SP-007" />
        <FInput label="NAMA" placeholder="Nama sparepart" />
        <FInput label="BRAND" placeholder="Brand" />
        <FSelect label="KATEGORI" options={["Oli", "Filter", "Rem", "Pengapian", "Kelistrikan", "Mesin", "Body"]} />
        <FInput label="HARGA BELI" placeholder="Harga beli" />
        <FInput label="HARGA JUAL" placeholder="Harga jual" />
        <div style={{ marginTop: 20 }}>
          <button onClick={() => { alert("Sparepart berhasil ditambahkan!"); router.push("/master-data/sparepart"); }} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "8px 20px", fontSize: 13, fontWeight: 600, color: "#fff", background: "#0176d3", border: "1px solid #0176d3", borderRadius: 6, cursor: "pointer" }}>
            <Save size={14} /> Simpan
          </button>
        </div>
      </div>
    </div>
  );
}

function FInput({ label, placeholder }: { label: string; placeholder: string }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <input placeholder={placeholder} style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none" }} />
    </div>
  );
}

function FSelect({ label, options }: { label: string; options: string[] }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase", letterSpacing: "0.04em", marginBottom: 4 }}>{label}</div>
      <select style={{ width: "100%", padding: "8px 12px", fontSize: 13, color: "#001526", border: "1px solid #d8d8d8", borderRadius: 6, outline: "none", background: "#fff" }}>
        {options.map(o => <option key={o}>{o}</option>)}
      </select>
    </div>
  );
}
