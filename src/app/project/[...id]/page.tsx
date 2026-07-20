"use client";

import { useParams, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { ArrowLeft, ChevronRight, FileText, Download } from "lucide-react";

const fmt = (n: number) => n.toLocaleString("id-ID");
const fmtRp = (n: number) => "Rp " + n.toLocaleString("id-ID");

const fmtDate = (d: string | null) => {
  if (!d) return "-";
  const dt = new Date(d);
  return dt.toLocaleDateString("id-ID", { day: "numeric", month: "short", year: "numeric" });
};

const tabList = [
  { key: "sro-swo", label: "Service & Work Orders" },
  { key: "anggaran", label: "Anggaran" },
  { key: "pemasukan", label: "Pemasukan" },
  { key: "pengeluaran", label: "Pengeluaran" },
  { key: "hutang-piutang", label: "Hutang / Piutang" },
  { key: "dokumen", label: "Dokumen" },
] as const;
type TabKey = (typeof tabList)[number]["key"];

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const prjId = Array.isArray(params.id) ? params.id.join("/") : (params.id as string);
  const [activeTab, setActiveTab] = useState<TabKey>("sro-swo");
  const [p, setP] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch(`/api/projects?search=${encodeURIComponent(prjId)}&limit=1`)
      .then((r) => r.json())
      .then((j) => {
        const list = j.data || [];
        if (list.length > 0) {
          const proj = list[0];
          // Map API fields to expected UI shape
          setP({
            id: proj.id,
            name: proj.name,
            customer: proj.customer?.name || "-",
            periode: proj.startDate ? `${fmtDate(proj.startDate)} — ${fmtDate(proj.endDate)}` : "-",
            nilai: proj.contractValue || 0,
            totalPengeluaran: proj.expenses?.reduce((s: number, e: any) => s + (e.amount || 0), 0) || 0,
            status: (proj.status === "active" ? "Aktif" : proj.status === "completed" ? "Selesai" : proj.status === "cancelled" ? "Batal" : proj.status),
            sroList: [],
            swoList: [],
            kendaraan: [],
            pemasukanList: [],
            pengeluaranList: proj.expenses?.map((e: any) => ({ date: fmtDate(e.date), desc: e.description, vendor: "-", jumlah: e.amount })) || [],
            hutangPiutang: [],
            dokumen: [],
          });
        }
        setLoading(false);
      })
      .catch(() => { setError("Failed to load project"); setLoading(false); });
  }, [prjId]);

  if (loading) return (
    <div style={{ padding: 24 }}>
      <button onClick={() => router.push("/project")} style={S.backBtn}><ArrowLeft size={16} /> Kembali</button>
      <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Loading...</p></div>
    </div>
  );
  if (error) return (
    <div style={{ padding: 24 }}>
      <button onClick={() => router.push("/project")} style={S.backBtn}><ArrowLeft size={16} /> Kembali</button>
      <div style={S.card}><p style={{ color: "red", fontSize: 14 }}>{error}</p></div>
    </div>
  );

  if (!p) return (
    <div style={{ padding: 24 }}>
      <button onClick={() => router.push("/project")} style={S.backBtn}><ArrowLeft size={16} /> Kembali</button>
      <div style={S.card}><p style={{ color: "#444746", fontSize: 14 }}>Project tidak ditemukan: {prjId}</p></div>
    </div>
  );

  const kendaraanList: any[] = p.kendaraan || [];
  const totalPagu = kendaraanList.reduce((s: number, k: any) => s + (k.pagu || 0), 0);
  const totalRealisasiKendaraan = kendaraanList.reduce((s: number, k: any) => s + (k.service1?.realisasi || 0) + (k.service2?.realisasi || 0), 0);
  const sisa = totalPagu - totalRealisasiKendaraan;

  return (
    <div style={{ padding: "0 24px 24px" }}>
      {/* Header Card */}
      <div style={S.headerCard}>
        <div style={S.headerTop}>
          <div style={S.headerLeft}>
            <div style={S.headerTitleRow}><h2 style={S.headerTitle}>{p.name}</h2><span style={{ ...S.statusBadge, background: p.status === "Aktif" ? "#e8f5e9" : "#f5f5f5", color: p.status === "Aktif" ? "#2e844a" : "#8e8f8e", border: `1px solid ${p.status === "Aktif" ? "#c8e6c9" : "#e0e0e0"}` }}>{p.status}</span></div>
            <div style={S.headerMeta}><span style={{ fontWeight: 600 }}>{p.id}</span>{p.noPesanan && <><span style={S.metaSep}>|</span><span>No. Pesanan: <strong>{p.noPesanan}</strong></span></>}<span style={S.metaSep}>|</span><span>{p.customer}</span><span style={S.metaSep}>|</span><span>{p.periode}</span></div>
          </div>
          <div style={S.headerStats}>
            <div style={S.statItem}><div style={S.statLabel}>Total Anggaran</div><div style={{ ...S.statValue, color: "#001526" }}>{fmtRp(totalPagu)}</div></div>
            <div style={S.statItem}><div style={S.statLabel}>Total Realisasi</div><div style={{ ...S.statValue, color: "var(--color-brand)" }}>{fmtRp(totalRealisasiKendaraan)}</div></div>
            <div style={S.statItem}><div style={S.statLabel}>Sisa Budget</div><div style={{ ...S.statValue, color: sisa >= 0 ? "var(--color-success)" : "var(--color-error)" }}>{fmtRp(sisa)}</div></div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={S.tabBar}>{tabList.map((t) => (<button key={t.key} onClick={() => setActiveTab(t.key)} style={{ ...S.tab, color: activeTab === t.key ? "#fff" : "#444746", background: activeTab === t.key ? "#0176d3" : "#ecebea", fontWeight: activeTab === t.key ? 600 : 400 }}>{t.label}</button>))}</div>

      {/* Tab: SRO/SWO */}
      {activeTab === "sro-swo" && (
        <div>
          <h3 style={S.sectionTitle}>Service Orders</h3>
          {p.sroList.length > 0 ? (<div style={S.tableWrap}><table style={S.table}><thead><tr><th style={{ ...S.th, width: 36 }}>No.</th><th style={S.th}>No. SRO</th><th style={S.th}>Status</th></tr></thead><tbody>{p.sroList.map((s: string, i: number) => (<tr key={s} style={S.tr}><td style={S.td}>{i + 1}</td><td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/service-orders/${s}`)}>{s}</td><td style={S.td}><span style={{ ...S.pill, background: "#fe9339" }}>Linked</span></td></tr>))}</tbody></table></div>) : (<div style={S.card}><p>Belum ada Service Order</p></div>)}
          <h3 style={{ ...S.sectionTitle, marginTop: 20 }}>Work Orders</h3>
          {p.swoList.length > 0 ? (<div style={S.tableWrap}><table style={S.table}><thead><tr><th style={{ ...S.th, width: 36 }}>No.</th><th style={S.th}>No. SWO</th><th style={S.th}>Status</th></tr></thead><tbody>{p.swoList.map((sw: string, i: number) => (<tr key={sw} style={S.tr}><td style={S.td}>{i + 1}</td><td style={{ ...S.td, color: "#0176d3", fontWeight: 500, cursor: "pointer" }} onClick={() => router.push(`/work-orders/${sw}`)}>{sw}</td><td style={S.td}><span style={{ ...S.pill, background: "#0176d3" }}>Active</span></td></tr>))}</tbody></table></div>) : (<div style={S.card}><p>Belum ada Work Order</p></div>)}
        </div>
      )}

      {/* Tab: Anggaran */}
      {activeTab === "anggaran" && (
        <div>
          <div style={S.statsRow}>
            <div style={S.statCard}><div style={S.statCardLabel}>Total Pagu</div><div style={S.statCardValue}>{fmtRp(totalPagu)}</div></div>
            <div style={S.statCard}><div style={S.statCardLabel}>Total Realisasi</div><div style={{ ...S.statCardValue, color: "var(--color-brand)" }}>{fmtRp(totalRealisasiKendaraan)}</div></div>
            <div style={S.statCard}><div style={S.statCardLabel}>Sisa</div><div style={{ ...S.statCardValue, color: "var(--color-success)" }}>{fmtRp(sisa)}</div></div>
          </div>

          {/* Tabel Anggaran Per Kendaraan */}
          <div style={{ ...S.tableWrap, overflowX: "auto" }}>
            <table style={{ ...S.table, minWidth: 1300 }}>
              <thead>
                {/* Header row 1: group spans */}
                <tr>
                  <th style={{ ...S.th, width: 36, borderBottom: "1px solid #ecebea" }}>No.</th>
                  <th style={{ ...S.th, minWidth: 130, borderRight: "2px solid #ecebea", borderBottom: "1px solid #ecebea" }}>No. Polisi</th>
                  <th style={{ ...S.th, textAlign: "center", background: "#f0f7ff", borderBottom: "1px solid #ecebea" }} colSpan={3}>Service Pertama</th>
                  <th style={{ ...S.th, textAlign: "center", background: "#fef9e7", borderBottom: "1px solid #ecebea", borderLeft: "2px solid #ecebea" }} colSpan={3}>Service Kedua</th>
                  <th style={{ ...S.th, textAlign: "center", background: "#f3f3f3", borderBottom: "1px solid #ecebea", borderLeft: "2px solid #ecebea" }} colSpan={3}>Per Unit</th>
                </tr>
                {/* Header row 2: sub columns */}
                <tr>
                  <th style={{ ...S.th }}></th>
                  <th style={{ ...S.th, borderRight: "2px solid #ecebea" }}></th>
                  <th style={{ ...S.subTh, background: "#f0f7ff" }}>Estimasi Biaya</th>
                  <th style={{ ...S.subTh, background: "#f0f7ff" }}>Realisasi Biaya</th>
                  <th style={{ ...S.subTh, background: "#f0f7ff", minWidth: 100 }}>ID SWO</th>
                  <th style={{ ...S.subTh, background: "#fef9e7", borderLeft: "2px solid #ecebea" }}>Estimasi Biaya</th>
                  <th style={{ ...S.subTh, background: "#fef9e7" }}>Realisasi Biaya</th>
                  <th style={{ ...S.subTh, background: "#fef9e7", minWidth: 100 }}>ID SWO</th>
                  <th style={{ ...S.subTh, background: "#f3f3f3", borderLeft: "2px solid #ecebea" }}>Pagu</th>
                  <th style={{ ...S.subTh, background: "#f3f3f3" }}>Realisasi</th>
                  <th style={{ ...S.subTh, background: "#f3f3f3" }}>Sisa</th>
                </tr>
              </thead>
              <tbody>
                {kendaraanList.map((k: any, i: number) => {
                  const s1 = k.service1, s2 = k.service2;
                  const realisasiTotal = (s1?.realisasi || 0) + (s2?.realisasi || 0);
                  const sisaUnit = k.pagu - realisasiTotal;

                  const svcTd = (svc: any, bg: string, isLast: boolean) => {
                    const style = (extra?: any) => ({ ...S.td, background: bg, borderLeft: bg === "#fef9e7" || bg === "#f3f3f3" ? "2px solid #ecebea" : undefined, ...(extra || {}) });

                    if (!svc) return (
                      <>
                        <td style={style({ textAlign: "right", color: "#d8d8d8" })}>-</td>
                        <td style={style({ textAlign: "right", color: "#d8d8d8" })}>-</td>
                        <td style={style({ color: "#d8d8d8" })}>-</td>
                      </>
                    );
                    return (
                      <>
                        <td style={style({ textAlign: "right", fontWeight: 500, color: "#001526" })}>{fmtRp(svc.estimasi)}</td>
                        <td style={style({ textAlign: "right", fontWeight: 500, color: "#001526" })}>{fmtRp(svc.realisasi)}</td>
                        <td style={style()}>
                          {svc.swoId ? (
                            <span style={{ display: "block", color: "#0176d3", cursor: "pointer", fontWeight: 500, fontSize: 11, maxWidth: 100, wordBreak: "break-all", lineHeight: 1.4 }} onClick={() => router.push(`/work-orders/${svc.swoId}`)}>{svc.swoId}</span>
                          ) : <span style={{ color: "#d8d8d8" }}>-</span>}
                        </td>
                      </>
                    );
                  };

                  return (
                    <tr key={k.id} style={S.tr}>
                      <td style={{ ...S.td }}>{i + 1}</td>
                      <td style={{ ...S.td, borderRight: "2px solid #ecebea" }}>
                        <div style={{ fontWeight: 600, color: "#001526" }}>{k.noPol}</div>
                        <div style={{ fontSize: 11, color: "#8e8f8e" }}>{k.merk}</div>
                      </td>
                      {svcTd(s1, "#f0f7ff", false)}
                      {svcTd(s2, "#fef9e7", false)}
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 700, background: "#f3f3f3", borderLeft: "2px solid #ecebea" }}>{fmtRp(k.pagu)}</td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 500, color: "#001526", background: "#f3f3f3" }}>{fmtRp(realisasiTotal)}</td>
                      <td style={{ ...S.td, textAlign: "right", fontWeight: 700, color: "#001526", background: "#f3f3f3" }}>{fmtRp(sisaUnit)}</td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot>
                <tr style={{ background: "#e8e8e8" }}>
                  <td colSpan={2} style={{ ...S.td, fontWeight: 700, background: "#e8e8e8", borderRight: "2px solid #ecebea" }}>TOTAL</td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, background: "#f0f7ff" }}>{fmtRp(kendaraanList.reduce((s: number, k: any) => s + (k.service1?.estimasi || 0), 0))}</td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, background: "#f0f7ff" }}>{fmtRp(kendaraanList.reduce((s: number, k: any) => s + (k.service1?.realisasi || 0), 0))}</td>
                  <td style={{ ...S.td, background: "#f0f7ff" }}></td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, background: "#fef9e7", borderLeft: "2px solid #ecebea" }}>{fmtRp(kendaraanList.reduce((s: number, k: any) => s + (k.service2?.estimasi || 0), 0))}</td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, background: "#fef9e7" }}>{fmtRp(kendaraanList.reduce((s: number, k: any) => s + (k.service2?.realisasi || 0), 0))}</td>
                  <td style={{ ...S.td, background: "#fef9e7" }}></td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, background: "#f3f3f3", borderLeft: "2px solid #ecebea" }}>{fmtRp(totalPagu)}</td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, color: "#001526", background: "#f3f3f3" }}>{fmtRp(totalRealisasiKendaraan)}</td>
                  <td style={{ ...S.td, textAlign: "right", fontWeight: 700, color: "#001526", background: "#f3f3f3" }}>{fmtRp(sisa)}</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Pemasukan */}
      {activeTab === "pemasukan" && (
        <div>
          {p.pemasukanList.length > 0 ? (<div style={S.tableWrap}><table style={S.table}><thead><tr><th style={{ ...S.th, width: 36 }}>No.</th><th style={S.th}>Tanggal</th><th style={S.th}>Keterangan</th><th style={{ ...S.th, textAlign: "right" }}>Jumlah</th><th style={S.th}>Status</th></tr></thead><tbody>{p.pemasukanList.map((r: any, i: number) => (<tr key={i} style={S.tr}><td style={S.td}>{i + 1}</td><td style={S.td}>{r.date}</td><td style={{ ...S.td, fontWeight: 500 }}>{r.desc}</td><td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmtRp(r.jumlah)}</td><td style={S.td}><span style={{ padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: r.status === "Diterima" ? "#e8f5e9" : "#fff3e0", color: r.status === "Diterima" ? "#2e844a" : "#fe9339" }}>{r.status}</span></td></tr>))}</tbody></table></div>) : (<div style={S.card}><p>Belum ada pemasukan</p></div>)}
        </div>
      )}
      {activeTab === "pengeluaran" && (
        <div>
          {p.pengeluaranList.length > 0 ? (<div style={S.tableWrap}><table style={S.table}><thead><tr><th style={{ ...S.th, width: 36 }}>No.</th><th style={S.th}>Tanggal</th><th style={S.th}>Keperluan</th><th style={S.th}>Vendor</th><th style={{ ...S.th, textAlign: "right" }}>Jumlah</th></tr></thead><tbody>{p.pengeluaranList.map((r: any, i: number) => (<tr key={i} style={S.tr}><td style={S.td}>{i + 1}</td><td style={S.td}>{r.date}</td><td style={{ ...S.td, fontWeight: 500 }}>{r.desc}</td><td style={S.td}>{r.vendor}</td><td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmtRp(r.jumlah)}</td></tr>))}</tbody></table></div>) : (<div style={S.card}><p>Belum ada pengeluaran</p></div>)}
        </div>
      )}
      {activeTab === "hutang-piutang" && (
        <div>
          {p.hutangPiutang.length > 0 ? (<div style={S.tableWrap}><table style={S.table}><thead><tr><th style={{ ...S.th, width: 36 }}>No.</th><th style={S.th}>Jenis</th><th style={S.th}>Pihak</th><th style={{ ...S.th, textAlign: "right" }}>Jumlah</th><th style={S.th}>Jatuh Tempo</th><th style={S.th}>Status</th></tr></thead><tbody>{p.hutangPiutang.map((r: any, i: number) => (<tr key={i} style={S.tr}><td style={S.td}>{i + 1}</td><td style={S.td}><span style={{ padding: "2px 8px", borderRadius: 4, fontSize: 10, fontWeight: 600, background: r.jenis === "Piutang" ? "#e8f5e9" : "#fce4ec", color: r.jenis === "Piutang" ? "#2e844a" : "#ea001e" }}>{r.jenis}</span></td><td style={{ ...S.td, fontWeight: 500 }}>{r.pihak}</td><td style={{ ...S.td, textAlign: "right", fontWeight: 600 }}>{fmtRp(r.jumlah)}</td><td style={S.td}>{r.jatuhTempo}</td><td style={S.td}><span style={{ padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: r.status === "Dibayar" ? "#e8f5e9" : "#fff3e0", color: r.status === "Dibayar" ? "#2e844a" : "#fe9339" }}>{r.status}</span></td></tr>))}</tbody></table></div>) : (<div style={S.card}><p>Tidak ada hutang / piutang</p></div>)}
        </div>
      )}
      {activeTab === "dokumen" && (
        <div>
          {p.dokumen.length > 0 ? (<div style={S.docGrid}>{p.dokumen.map((doc: any, i: number) => { const c: Record<string, string> = { pdf: "#ea001e", doc: "#0176d3", receipt: "#2e844a" }; return (<div key={i} style={S.docCard}><div style={{ ...S.docIcon, background: `${c[doc.icon]}15`, color: c[doc.icon] }}><FileText size={20} /></div><div style={S.docInfo}><div style={S.docName}>{doc.name}</div><div style={S.docMeta}>{doc.type} • {doc.date}</div></div><button style={S.docBtn}><Download size={14} /></button></div>); })}</div>) : (<div style={S.card}><p>Belum ada dokumen</p></div>)}
        </div>
      )}
    </div>
  );
}

const S: Record<string, React.CSSProperties> = {
  backBtn: { display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 12px", fontSize: 13, fontWeight: 500, color: "#444746", background: "#fff", border: "1px solid #d8d8d8", borderRadius: 6, cursor: "pointer" },
  headerCard: { background: "#fff", border: "1px solid #ecebea", borderRadius: 10, padding: "20px 24px", marginBottom: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  headerTop: { display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20, flexWrap: "wrap" as const },
  headerLeft: { flex: "1 1 auto", minWidth: 0 },
  headerTitleRow: { display: "flex", alignItems: "center", gap: 10, marginBottom: 6, flexWrap: "wrap" as const },
  headerTitle: { fontSize: 20, fontWeight: 700, color: "#001526", margin: 0, lineHeight: 1.3 },
  statusBadge: { display: "inline-flex", alignItems: "center", padding: "3px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, whiteSpace: "nowrap" as const, flexShrink: 0 },
  headerMeta: { display: "flex", alignItems: "center", gap: 8, fontSize: 12, color: "#444746", flexWrap: "wrap" as const },
  metaSep: { color: "#d8d8d8" },
  headerStats: { display: "flex", gap: 28, flexShrink: 0, flexWrap: "wrap" as const },
  statItem: { textAlign: "right" as const, minWidth: 100 },
  statLabel: { fontSize: 10, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase" as const, letterSpacing: "0.05em", marginBottom: 2 },
  statValue: { fontSize: 18, fontWeight: 700 },
  card: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statsRow: { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20 },
  statCard: { background: "#fff", border: "1px solid #ecebea", borderRadius: 8, padding: 16, textAlign: "center" as const, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  statCardLabel: { fontSize: 11, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase" as const, marginBottom: 4 },
  statCardValue: { fontSize: 18, fontWeight: 700, color: "#001526" },
  tabBar: { display: "flex", gap: 0, marginBottom: 16, background: "#ecebea", borderRadius: 8, padding: 3, width: "fit-content", flexWrap: "wrap" as const },
  tab: { padding: "7px 16px", fontSize: 13, border: "none", borderRadius: 6, cursor: "pointer", transition: "all 150ms", whiteSpace: "nowrap" as const },
  sectionTitle: { fontSize: 13, fontWeight: 600, color: "#0176d3", marginBottom: 8 },
  tableWrap: { border: "1px solid #ecebea", borderRadius: 8, overflow: "hidden", background: "#fff" },
  table: { width: "100%", borderCollapse: "collapse" as const, fontSize: 13 },
  th: { padding: "8px 10px", textAlign: "left" as const, fontWeight: 600, fontSize: 11, color: "#444746", textTransform: "uppercase" as const, letterSpacing: "0.04em", background: "#fff", borderBottom: "1px solid #ecebea" },
  subTh: { padding: "6px 8px", textAlign: "right" as const, fontWeight: 500, fontSize: 10, color: "#8e8f8e", textTransform: "uppercase" as const, borderBottom: "1px solid #ecebea" },
  td: { padding: "8px 10px", borderBottom: "1px solid #f0f0f0", color: "#001526", background: "#fff" },
  tr: { transition: "background 100ms" },
  pill: { display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, color: "#fff" },
  docGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 12 },
  docCard: { background: "#fff", border: "1px solid #ecebea", borderRadius: 10, padding: 14, display: "flex", alignItems: "center", gap: 12, boxShadow: "0 1px 3px rgba(0,0,0,0.04)" },
  docIcon: { width: 40, height: 40, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 },
  docInfo: { flex: 1, minWidth: 0 },
  docName: { fontSize: 13, fontWeight: 600, color: "#001526", whiteSpace: "nowrap" as const, overflow: "hidden", textOverflow: "ellipsis" },
  docMeta: { fontSize: 11, color: "#8e8f8e" },
  docBtn: { display: "inline-flex", alignItems: "center", justifyContent: "center", padding: 6, color: "#8e8f8e", border: "1px solid #ecebea", borderRadius: 6, background: "#fff", cursor: "pointer" },
};
