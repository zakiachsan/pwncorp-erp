"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Save, Plus, Trash2 } from "lucide-react";
import { useState, useEffect } from "react";

interface JournalLine {
  id: number;
  coaId: string;
  account: string;
  accountName: string;
  debit: number;
  credit: number;
}

interface CoaItem {
  id: string;
  code: string;
  name: string;
}

export default function JournalCreatePage() {
  const router = useRouter();
  const [coaList, setCoaList] = useState<CoaItem[]>([]);
  const [coaLoading, setCoaLoading] = useState(true);
  const [date, setDate] = useState("");
  const [description, setDescription] = useState("");
  const [lines, setLines] = useState<JournalLine[]>([
    { id: 1, coaId: "", account: "", accountName: "", debit: 0, credit: 0 },
    { id: 2, coaId: "", account: "", accountName: "", debit: 0, credit: 0 },
  ]);
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState("");

  useEffect(() => {
    fetch("/api/coa?flat=true")
      .then(r => r.json())
      .then(j => { setCoaList(j.data || []); setCoaLoading(false); })
      .catch(() => setCoaLoading(false));
  }, []);

  const addLine = () => {
    setLines([...lines, { id: Date.now(), coaId: "", account: "", accountName: "", debit: 0, credit: 0 }]);
  };

  const removeLine = (id: number) => {
    setLines(lines.filter((l) => l.id !== id));
  };

  const updateLine = (id: number, field: keyof JournalLine, value: any) => {
    setLines(lines.map((l) => (l.id === id ? { ...l, [field]: value } : l)));
  };

  const selectCoa = (lineId: number, coaId: string) => {
    const coa = coaList.find(c => c.id === coaId);
    setLines(lines.map((l) => l.id === lineId ? {
      ...l,
      coaId,
      account: coa?.code || "",
      accountName: coa?.name || "",
    } : l));
  };

  const totalDebit = lines.reduce((sum, l) => sum + l.debit, 0);
  const totalCredit = lines.reduce((sum, l) => sum + l.credit, 0);
  const isBalanced = totalDebit === totalCredit && totalDebit > 0;

  const handleSubmit = async () => {
    if (!isBalanced || !description.trim()) return;
    setSaving(true);
    setSubmitError("");

    try {
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          description: description.trim(),
          details: lines.map(l => ({
            coaId: l.coaId,
            description: l.accountName,
            debit: l.debit,
            credit: l.credit,
          })),
        }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Failed to create journal");
      router.push("/finance/journal");
    } catch (err: any) {
      setSubmitError(err.message || "Failed to create journal");
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="view-header">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="btn btn--sm"><ArrowLeft size={16} /></button>
          <div className="view-title">Buat Jurnal Baru</div>
        </div>
        <button className="btn btn--brand btn--sm" disabled={!isBalanced || saving || !description.trim()} onClick={handleSubmit}>
          <Save size={14} /> {saving ? "Menyimpan..." : "Simpan"}
        </button>
      </div>

      {submitError && (
        <div className="mb-4 p-3 rounded bg-red-50 text-red-600 text-sm border border-red-200">{submitError}</div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <div className="card-slds">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Informasi Jurnal</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="form-group">
                <label className="form-label">Tanggal *</label>
                <input type="date" className="form-input" value={date} onChange={(e) => setDate(e.target.value)} />
              </div>
              <div className="form-group sm:col-span-2">
                <label className="form-label">Deskripsi *</label>
                <textarea className="form-input" rows={2} placeholder="Deskripsi jurnal..." value={description} onChange={(e) => setDescription(e.target.value)} />
              </div>
            </div>
          </div>

          <div className="card-slds">
            <div className="flex items-center justify-between mb-4">
              <div className="text-sm font-semibold text-[--color-text-secondary] uppercase">Detail Jurnal</div>
              <button onClick={addLine} className="btn btn--brand btn--xs"><Plus size={12} /> Tambah Baris</button>
            </div>
            <div className="table-wrap">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Akun</th>
                    <th className="text-right">Debit</th>
                    <th className="text-right">Credit</th>
                    <th style={{ width: 40 }}></th>
                  </tr>
                </thead>
                <tbody>
                  {lines.map((line) => (
                    <tr key={line.id}>
                      <td>
                        <select
                          className="form-select"
                          value={line.coaId}
                          onChange={(e) => selectCoa(line.id, e.target.value)}
                          disabled={coaLoading}
                        >
                          <option value="">{coaLoading ? "Loading..." : "Pilih Akun"}</option>
                          {coaList.map(c => (
                            <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                          ))}
                        </select>
                      </td>
                      <td className="text-right"><input type="number" className="form-input text-right" value={line.debit} onChange={(e) => updateLine(line.id, "debit", Number(e.target.value))} style={{ width: 120 }} /></td>
                      <td className="text-right"><input type="number" className="form-input text-right" value={line.credit} onChange={(e) => updateLine(line.id, "credit", Number(e.target.value))} style={{ width: 120 }} /></td>
                      <td><button onClick={() => removeLine(line.id)} className="text-[--color-error] hover:text-red-700 p-1"><Trash2 size={14} /></button></td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="font-bold border-t-2 border-[--color-text-primary]">
                    <td>Total</td>
                    <td className="text-right">Rp {totalDebit.toLocaleString("id-ID")}</td>
                    <td className="text-right">Rp {totalCredit.toLocaleString("id-ID")}</td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
            {!isBalanced && totalDebit > 0 && (
              <div className="mt-3 p-2 rounded bg-[--color-error] bg-opacity-10 text-[--color-error] text-sm">
                Jurnal tidak seimbang! Selisih: Rp {Math.abs(totalDebit - totalCredit).toLocaleString("id-ID")}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="card-slds sticky top-4">
            <div className="text-sm font-semibold text-[--color-text-secondary] uppercase mb-4">Ringkasan</div>
            <div className="space-y-3">
              <div className="flex justify-between py-2 border-b border-[--color-border]">
                <span className="text-sm text-[--color-text-secondary]">Total Debit</span>
                <span className="font-medium">Rp {totalDebit.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[--color-border]">
                <span className="text-sm text-[--color-text-secondary]">Total Credit</span>
                <span className="font-medium">Rp {totalCredit.toLocaleString("id-ID")}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-[--color-border]">
                <span className="text-sm text-[--color-text-secondary]">Status</span>
                <span className={`font-medium ${isBalanced ? "text-[--color-success]" : "text-[--color-error]"}`}>
                  {isBalanced ? "Seimbang" : "Tidak Seimbang"}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
