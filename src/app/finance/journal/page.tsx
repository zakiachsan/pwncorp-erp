"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Search, Download, Plus, X, Upload, Trash2 } from "lucide-react";
import { exportTableToExcel, makeFilename } from "@/lib/excel-utils";
import Pagination from "@/components/ui/Pagination";
const fmt = (n: number) => "Rp " + (n || 0).toLocaleString("id-ID");

export default function JournalPage() {
  const router = useRouter();
  const [items, setItems] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [coaId, setCoaId] = useState("all");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [summary, setSummary] = useState({ totalDebit: 0, totalCredit: 0 });
  const [coaList, setCoaList] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);

  const limit = 50;

  useEffect(() => {
    fetch("/api/coa?flat=true")
      .then((r) => r.json())
      .then((json) => setCoaList(json.data || []))
      .catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (search) params.set("search", search);
    if (coaId && coaId !== "all") params.set("coaId", coaId);
    if (dateFrom) params.set("dateFrom", dateFrom);
    if (dateTo) params.set("dateTo", dateTo);
    params.set("page", String(page));
    params.set("limit", String(limit));
    fetch(`/api/journal?${params.toString()}`)
      .then((r) => r.json())
      .then((json) => {
        setItems(json.data || []);
        setSummary(json.summary || { totalDebit: 0, totalCredit: 0 });
        setTotalPages(json.pagination?.totalPages || 1);
        setTotalItems(json.pagination?.total || 0);
        setLoading(false);
      })
      .catch(() => { setError("Failed to load journal"); setLoading(false); });
  }, [search, coaId, dateFrom, dateTo, page]);

  const handleSearch = () => { setPage(1); };

  if (loading) return <div className="p-8 text-center">Loading...</div>;
  if (error) return <div className="p-8 text-center text-red-500">{error}</div>;

  const groupedRows = items;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <JournalIcon className="w-6 h-6 text-[--color-brand-secondary]" />
          Jurnal Umum
        </div>
        <div className="flex gap-2">
          <button onClick={() => setShowModal(true)} className="btn btn--brand btn--sm"><Plus size={14} /> Tambah Jurnal</button>
          <button onClick={() => exportTableToExcel(document.querySelector(".data-table"), makeFilename("journal"))} className="btn btn--sm"><Download size={14} /> Export</button>
        </div>
      </div>

      {/* Filter */}
      <div className="filter-section">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="form-group">
            <label className="form-label">Akun (COA)</label>
            <select className="form-select" value={coaId} onChange={(e) => { setCoaId(e.target.value); setPage(1); }}>
              <option value="all">Semua Akun</option>
              {coaList.map((c: any) => (
                <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Cari</label>
            <input
              type="text"
              className="form-input"
              placeholder="No. Jurnal / Deskripsi..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Dari Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">Sampai Tanggal</label>
            <input
              type="date"
              className="form-input"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label className="form-label">&nbsp;</label>
            <button className="btn btn--brand btn--sm flex-1 justify-center" onClick={handleSearch}>
              <Search size={14} /> Cari
            </button>
          </div>
        </div>
      </div>

      {/* Summary Cards — under filter */}
      <div className="flex gap-4 mb-4">
        <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-[--color-surface-raised] border border-[--color-border-default]">
          <span className="text-[--color-text-secondary]">Total Debit:</span>
          <span className="font-semibold" style={{ color: "var(--color-success)" }}>{fmt(summary.totalDebit)}</span>
        </div>
        <div className="flex items-center gap-2 text-sm px-3 py-1.5 rounded-lg bg-[--color-surface-raised] border border-[--color-border-default]">
          <span className="text-[--color-text-secondary]">Total Kredit:</span>
          <span className="font-semibold" style={{ color: "var(--color-error)" }}>{fmt(summary.totalCredit)}</span>
        </div>
      </div>

      {/* Table */}
      <div className="table-wrap overflow-x-auto">
        <table className="data-table">
          <thead>
            <tr>
              <th className="whitespace-nowrap">TGL & ID</th>
              <th className="whitespace-nowrap">Keterangan</th>
              <th className="whitespace-nowrap">Akun (COA)</th>
              <th className="text-right whitespace-nowrap">Debit</th>
              <th className="text-right whitespace-nowrap">Kredit</th>
            </tr>
          </thead>
          <tbody>
            {groupedRows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-[--color-text-tertiary]">Tidak ada data</td>
              </tr>
            ) : (groupedRows.map((item: any) => (
              <tr
                key={item.id}
                className={`hover:bg-[#f8f8f8] cursor-pointer`}
                onClick={() => router.push(`/finance/journal/${encodeURIComponent(item.jeNo)}`)}
              >
                <td className="whitespace-nowrap">
                  <div className="text-[--color-text-secondary] text-xs">{item.date ? new Date(item.date).toLocaleDateString("id-ID", { day: "2-digit", month: "short", year: "numeric" }) : "-"}</div>
                  <div className="font-medium text-[--color-brand] text-xs">{item.jeNo}</div>
                </td>
                <td className="max-w-[250px] truncate text-xs">
                  {item.description}
                  {item.detailDescription ? <span className="text-[--color-text-tertiary] ml-1">({item.detailDescription})</span> : null}
                </td>
                <td className="whitespace-nowrap text-xs">
                  <span className="font-medium">{item.coa?.code}</span>
                  <span className="text-[--color-text-tertiary] ml-1">- {item.coa?.name}</span>
                </td>
                <td className="text-right font-medium whitespace-nowrap text-xs">
                  {(item.debit || 0) > 0 ? fmt(item.debit) : "-"}
                </td>
                <td className="text-right font-medium whitespace-nowrap text-xs">
                  {(item.credit || 0) > 0 ? fmt(item.credit) : "-"}
                </td>
              </tr>
            )))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <Pagination page={page} totalPages={totalPages} totalItems={totalItems} limit={limit} onPageChange={setPage} />

      {/* Modal Tambah Jurnal Manual */}
      {showModal && <AddJournalModal
        coaList={coaList}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); window.location.reload(); }}
      />}
    </div>
  );
}

function JournalIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" />
    </svg>
  );
}

/* ── Modal Tambah Jurnal Manual ── */
function AddJournalModal({
  coaList,
  onClose,
  onSaved,
}: {
  coaList: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [tanggal, setTanggal] = useState(new Date().toISOString().split("T")[0]);
  const [deskripsi, setDeskripsi] = useState("");
  const [kontak, setKontak] = useState("");
  const [kontakList, setKontakList] = useState<any[]>([]);
  const [lines, setLines] = useState<any[]>([{ coaId: "", debit: "", credit: "" }]);
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);

  // Load templates
  useEffect(() => {
    fetch("/api/journal/templates")
      .then((r) => r.json())
      .then((json) => setTemplates(json.data || []))
      .catch(() => {});
  }, []);

  // Load kontak (customers + karyawan)
  useEffect(() => {
    Promise.all([
      fetch("/api/customers?limit=500").then((r) => r.json()),
      fetch("/api/users?limit=500").then((r) => r.json()),
    ])
      .then(([c, u]) => {
        const customers = (c.data || []).map((x: any) => ({ id: x.id, label: `[Customer] ${x.name}${x.phone ? " - " + x.phone : ""}`, type: "customer" }));
        const users = (u.data || []).map((x: any) => ({ id: x.id, label: `[Karyawan] ${x.name} - ${x.email}`, type: "employee" }));
        setKontakList([...customers, ...users]);
      })
      .catch(() => {});
  }, []);

  // Apply template
  useEffect(() => {
    if (!selectedTemplate) return;
    const tmpl = templates.find((t) => t.id === selectedTemplate);
    if (!tmpl || !tmpl.items) return;
    setLines(tmpl.items.map((it: any) => ({
      coaId: it.coaId,
      debit: it.side === "debit" ? "0" : "",
      credit: it.side === "credit" ? "0" : "",
    })));
    if (tmpl.description) setDeskripsi(tmpl.description);
  }, [selectedTemplate, templates]);

  const totalDebit = lines.reduce((s, l) => s + (parseFloat(l.debit) || 0), 0);
  const totalCredit = lines.reduce((s, l) => s + (parseFloat(l.credit) || 0), 0);
  const balance = totalDebit - totalCredit;
  const isBalanced = Math.abs(balance) < 0.01;

  const addLine = () => setLines([...lines, { coaId: "", debit: "", credit: "" }]);
  const removeLine = (idx: number) => { if (lines.length > 1) setLines(lines.filter((_, i) => i !== idx)); };
  const updateLine = (idx: number, field: string, value: string) => {
    const newLines = [...lines];
    (newLines[idx] as any)[field] = value;
    setLines(newLines);
  };

  const handleSave = async () => {
    if (!deskripsi.trim()) return alert("Deskripsi harus diisi");
    const details = lines.filter((l) => l.coaId && ((parseFloat(l.debit) || 0) > 0 || (parseFloat(l.credit) || 0) > 0));
    if (details.length === 0) return alert("Minimal 1 line item dengan COA");
    if (!isBalanced) return alert(`Debit (${totalDebit}) dan Kredit (${totalKredit}) harus balance!`);
    setSaving(true);
    try {
      const body: any = {
        description: deskripsi,
        date: tanggal,
        refType: "manual",
        details: details.map((d) => ({
          coaId: d.coaId,
          debit: parseFloat(d.debit) || 0,
          credit: parseFloat(d.credit) || 0,
        })),
      };
      // File upload if any
      if (file) {
        const fd = new FormData();
        fd.append("file", file);
        const up = await fetch("/api/upload", { method: "POST", body: fd });
        const upJson = await up.json();
        if (upJson.url) body.attachment = upJson.url;
      }
      const res = await fetch("/api/journal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || "Gagal simpan");
      onSaved();
    } catch (e: any) {
      alert(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          {/* Header */}
          <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between z-10">
            <h2 className="text-lg font-semibold">Tambah Jurnal Manual</h2>
            <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
          </div>

          <div className="p-6 space-y-5">
            {/* A. Template Cepat */}
            <div>
              <label className="form-label">Template Cepat</label>
              <div className="flex gap-2">
                <select className="form-select flex-1" value={selectedTemplate} onChange={(e) => setSelectedTemplate(e.target.value)}>
                  <option value="">Pilih template...</option>
                  {templates.map((t: any) => (
                    <option key={t.id} value={t.id}>{t.name}</option>
                  ))}
                </select>
                <button onClick={() => setShowTemplateModal(true)} className="btn btn--sm whitespace-nowrap">Kelola Template</button>
              </div>
            </div>

            {/* B. Tanggal */}
            <div>
              <label className="form-label">Tanggal Transaksi</label>
              <input type="date" className="form-input" value={tanggal} onChange={(e) => setTanggal(e.target.value)} />
            </div>

            {/* C. Deskripsi */}
            <div>
              <label className="form-label">Deskripsi Global</label>
              <textarea className="form-input" rows={2} value={deskripsi} onChange={(e) => setDeskripsi(e.target.value)} placeholder="Deskripsi jurnal..." />
            </div>

            {/* D. Kontak */}
            <div>
              <label className="form-label">Kontak / Pihak Terkait</label>
              <div className="relative">
                <input
                  type="text"
                  className="form-input"
                  placeholder="Cari customer atau karyawan..."
                  value={kontak}
                  onChange={(e) => setKontak(e.target.value)}
                  list="kontak-list"
                />
                <datalist id="kontak-list">
                  {kontakList.filter((k) => k.label.toLowerCase().includes(kontak.toLowerCase())).map((k) => (
                    <option key={k.id} value={k.label} />
                  ))}
                </datalist>
              </div>
            </div>

            {/* E. Line Items */}
            <div>
              <label className="form-label font-semibold">Arsip Jurnal Umum</label>
              <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-gray-50 border-b">
                      <th className="text-left px-3 py-2 text-xs font-medium text-[--color-text-secondary]">Akun (COA)</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-[--color-text-secondary]">Debit</th>
                      <th className="text-right px-3 py-2 text-xs font-medium text-[--color-text-secondary]">Kredit</th>
                      <th className="w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {lines.map((line, idx) => (
                      <tr key={idx} className="border-b last:border-b-0">
                        <td className="px-3 py-1.5">
                          <select className="form-select text-xs w-full" value={line.coaId} onChange={(e) => updateLine(idx, "coaId", e.target.value)}>
                            <option value="">Pilih Akun</option>
                            {coaList.map((c: any) => (
                              <option key={c.id} value={c.id}>{c.code} - {c.name}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-3 py-1.5">
                          <input type="number" className="form-input text-xs text-right w-full" placeholder="0" value={line.debit} onChange={(e) => updateLine(idx, "debit", e.target.value)} />
                        </td>
                        <td className="px-3 py-1.5">
                          <input type="number" className="form-input text-xs text-right w-full" placeholder="0" value={line.credit} onChange={(e) => updateLine(idx, "credit", e.target.value)} />
                        </td>
                        <td className="px-2 py-1.5 text-center">
                          <button onClick={() => removeLine(idx)} className="p-1 hover:bg-red-50 rounded text-red-400 hover:text-red-600"><Trash2 size={14} /></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={addLine} className="btn btn--sm mt-2 text-[--color-brand]"><Plus size={14} /> Tambah Baris</button>
            </div>

            {/* F. Total Debit/Kredit */}
            <div className="flex gap-4 items-center justify-end text-sm border-t pt-3">
              <div>Total Debit: <span className="font-semibold" style={{ color: "var(--color-success)" }}>{fmt(totalDebit)}</span></div>
              <div>Total Kredit: <span className="font-semibold" style={{ color: "var(--color-error)" }}>{fmt(totalCredit)}</span></div>
              <div className={`font-semibold ${isBalanced ? "text-green-600" : "text-red-500"}`}>
                {isBalanced ? "✅ Balance" : `⚠️ Selisih ${fmt(Math.abs(balance))}`}
              </div>
            </div>

            {/* G. Upload */}
            <div>
              <label className="form-label">Upload Bukti Jurnal <span className="text-[--color-text-tertiary]">(opsional)</span></label>
              <input type="file" accept="image/*,.pdf" className="form-input text-sm" onChange={(e) => setFile(e.target.files?.[0] || null)} />
            </div>
          </div>

          {/* H. Simpan */}
          <div className="sticky bottom-0 bg-white border-t px-6 py-4 flex justify-end gap-2">
            <button onClick={onClose} className="btn btn--sm">Batal</button>
            <button onClick={handleSave} disabled={saving} className="btn btn--brand btn--sm">
              {saving ? "Menyimpan..." : <><Upload size={14} /> Simpan Jurnal</>}
            </button>
          </div>
        </div>
      </div>

      {/* Template Management Modal */}
      {showTemplateModal && <TemplateModal coaList={coaList} onClose={() => setShowTemplateModal(false)} onSaved={() => { setShowTemplateModal(false); fetch("/api/journal/templates").then(r => r.json()).then(j => setTemplates(j.data || [])); }} />}
    </>
  );
}

/* ── Modal Kelola Template Cepat ── */
function TemplateModal({
  coaList,
  onClose,
  onSaved,
}: {
  coaList: any[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [templates, setTemplates] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [editId, setEditId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [tmplLines, setTmplLines] = useState<any[]>([{ coaId: "", side: "debit" }]);

  const load = () => {
    setLoading(true);
    fetch("/api/journal/templates")
      .then((r) => r.json())
      .then((json) => { setTemplates(json.data || []); setLoading(false); })
      .catch(() => setLoading(false));
  };
  useEffect(load, []);

  const startEdit = (t: any) => {
    setEditId(t.id);
    setName(t.name);
    setTmplLines((t.items || []).map((i: any) => ({ coaId: i.coaId, side: i.side })));
  };
  const startNew = () => {
    setEditId("new");
    setName("");
    setTmplLines([{ coaId: "", side: "debit" }]);
  };
  const cancelEdit = () => { setEditId(null); setName(""); setTmplLines([{ coaId: "", side: "debit" }]); };

  const saveTmpl = async () => {
    if (!name.trim()) return alert("Nama template harus diisi");
    const items = tmplLines.filter((l) => l.coaId);
    if (items.length === 0) return alert("Minimal 1 COA");
    const method = editId === "new" ? "POST" : "PATCH";
    const url = editId === "new" ? "/api/journal/templates" : `/api/journal/templates/${editId}`;
    await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, items }),
    });
    onSaved(); // tutup modal + refresh dropdown template di form jurnal
  };
  const deleteTmpl = async (id: string) => {
    if (!confirm("Hapus template?")) return;
    await fetch(`/api/journal/templates/${id}`, { method: "DELETE" });
    load();
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-[60] flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="sticky top-0 bg-white border-b px-6 py-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Kelola Template Cepat</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded"><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          {loading ? <p className="text-sm text-[--color-text-tertiary]">Loading...</p> : templates.length === 0 ? (
            <p className="text-sm text-[--color-text-tertiary]">Belum ada template.</p>
          ) : (
            <div className="space-y-2">
              {templates.map((t) => (
                <div key={t.id} className="flex items-center justify-between border rounded-lg px-4 py-2">
                  <div>
                    <div className="font-medium text-sm">{t.name}</div>
                    <div className="text-xs text-[--color-text-tertiary]">{t.items?.length || 0} akun</div>
                  </div>
                  <div className="flex gap-1">
                    <button onClick={() => startEdit(t)} className="btn btn--sm text-xs">Edit</button>
                    <button onClick={() => deleteTmpl(t.id)} className="btn btn--sm text-xs text-red-500">Hapus</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="border-t px-6 py-3">
          <button onClick={startNew} className="btn btn--brand btn--sm w-full"><Plus size={14} /> Tambah Template Baru</button>
        </div>

        {/* Edit / New Form */}
        {editId && (
          <div className="border-t px-6 py-4 space-y-3">
            <div>
              <label className="form-label">Nama Template</label>
              <input className="form-input" value={name} onChange={(e) => setName(e.target.value)} placeholder="Misal: Pembayaran Gaji" />
            </div>
            <div>
              <label className="form-label">Akun COA</label>
              {tmplLines.map((l, i) => (
                <div key={i} className="flex gap-2 mb-2">
                  <select className="form-select flex-1 text-xs" value={l.coaId} onChange={(e) => { const x = [...tmplLines]; x[i].coaId = e.target.value; setTmplLines(x); }}>
                    <option value="">Pilih Akun</option>
                    {coaList.map((c: any) => <option key={c.id} value={c.id}>{c.code} - {c.name}</option>)}
                  </select>
                  <select className="form-select w-24 text-xs" value={l.side} onChange={(e) => { const x = [...tmplLines]; x[i].side = e.target.value; setTmplLines(x); }}>
                    <option value="debit">Debit</option>
                    <option value="credit">Kredit</option>
                  </select>
                  {tmplLines.length > 1 && (
                    <button onClick={() => setTmplLines(tmplLines.filter((_, j) => j !== i))} className="p-1 text-red-400"><X size={14} /></button>
                  )}
                </div>
              ))}
              <button onClick={() => setTmplLines([...tmplLines, { coaId: "", side: "debit" }])} className="btn btn--sm text-xs mt-1"><Plus size={12} /> Tambah Akun</button>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={cancelEdit} className="btn btn--sm">Batal</button>
              <button onClick={saveTmpl} className="btn btn--brand btn--sm">Simpan Template</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
