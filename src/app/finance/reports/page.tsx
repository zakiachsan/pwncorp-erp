"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  DollarSign, BookOpen, CreditCard, Receipt, TrendingUp,
  ClipboardList, Package, Landmark, FileBarChart, Calculator,
  PieChart, FileSpreadsheet, ArrowLeft,
} from "lucide-react";

type CategoryId = "keuangan" | "buku_besar" | "kas_bank" | "piutang" | "penjualan" | "pembelian" | "persediaan";

interface ReportItem {
  id: string;
  name: string;
  description: string;
  icon: any;
  color: string;
  href?: string;
}

const categories: { id: CategoryId; label: string; icon: any; count: number }[] = [
  { id: "keuangan", label: "Keuangan", icon: DollarSign, count: 10 },
  { id: "buku_besar", label: "Buku Besar", icon: BookOpen, count: 4 },
  { id: "kas_bank", label: "Kas & Bank", icon: CreditCard, count: 3 },
  { id: "piutang", label: "Piutang", icon: Receipt, count: 4 },
  { id: "penjualan", label: "Penjualan", icon: TrendingUp, count: 3 },
  { id: "pembelian", label: "Pembelian", icon: ClipboardList, count: 3 },
  { id: "persediaan", label: "Persediaan", icon: Package, count: 3 },
];

const reportsByCategory: Record<CategoryId, ReportItem[]> = {
  keuangan: [
    { id: "neraca-standar", name: "Neraca (Standar)", description: "Laporan posisi keuangan per periode", icon: Landmark, color: "text-blue-600 bg-blue-50", href: "/finance/reports/balance-sheet" },
    { id: "laba-rugi-standar", name: "Laba/Rugi (Standar)", description: "Laporan laba rugi per periode", icon: FileBarChart, color: "text-green-600 bg-green-50", href: "/finance/reports/profit-loss" },
    { id: "arus-kas", name: "Arus Kas", description: "Laporan arus kas masuk dan keluar", icon: CreditCard, color: "text-indigo-600 bg-indigo-50", href: "/finance/reports/cash-flow" },
    { id: "rasio-keuangan", name: "Rasio Keuangan", description: "Analisis rasio keuangan perusahaan", icon: Calculator, color: "text-amber-600 bg-amber-50" },
    { id: "grafik", name: "Grafik Keuangan", description: "Visualisasi grafik laporan keuangan", icon: PieChart, color: "text-rose-600 bg-rose-50" },
  ],
  buku_besar: [
    { id: "jurnal-umum", name: "Jurnal Umum", description: "Daftar seluruh transaksi jurnal", icon: BookOpen, color: "text-slate-600 bg-slate-50", href: "/finance/journal" },
    { id: "buku-besar", name: "Buku Besar", description: "Rincian transaksi per akun", icon: BookOpen, color: "text-slate-600 bg-slate-50" },
    { id: "trial-balance", name: "Trial Balance", description: "Daftar saldo seluruh akun", icon: FileSpreadsheet, color: "text-slate-600 bg-slate-50" },
  ],
  kas_bank: [
    { id: "laporan-kas", name: "Laporan Kas", description: "Rincian transaksi kas tunai", icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
    { id: "laporan-bank", name: "Laporan Bank", description: "Rincian transaksi rekening bank", icon: CreditCard, color: "text-emerald-600 bg-emerald-50" },
    { id: "rekonsiliasi-bank", name: "Rekonsiliasi Bank", description: "Pencocokan saldo bank dengan buku", icon: CreditCard, color: "text-emerald-600 bg-emerald-50", href: "/finance/bank-reconciliation" },
  ],
  piutang: [
    { id: "piutang-usaha", name: "Piutang Usaha", description: "Daftar piutang dari pelanggan", icon: Receipt, color: "text-cyan-600 bg-cyan-50", href: "/finance/ar" },
    { id: "aging-piutang", name: "Aging Piutang", description: "Analisis usia piutang berdasarkan jatuh tempo", icon: Receipt, color: "text-cyan-600 bg-cyan-50", href: "/finance/reports/aging-ar" },
    { id: "tagihan-piutang", name: "Tagihan Piutang", description: "Daftar tagihan yang belum dibayar", icon: Receipt, color: "text-cyan-600 bg-cyan-50" },
    { id: "piutang-tak-tertagih", name: "Piutang Tak Tertagih", description: "Laporan piutang macet", icon: Receipt, color: "text-cyan-600 bg-cyan-50" },
  ],
  penjualan: [
    { id: "faktur-penjualan", name: "Faktur Penjualan", description: "Daftar faktur penjualan", icon: TrendingUp, color: "text-violet-600 bg-violet-50", href: "/finance/invoices" },
    { id: "penjualan-per-item", name: "Penjualan per Item", description: "Breakdown penjualan per produk", icon: TrendingUp, color: "text-violet-600 bg-violet-50" },
    { id: "penjualan-per-customer", name: "Penjualan per Customer", description: "Rekapitulasi penjualan per pelanggan", icon: TrendingUp, color: "text-violet-600 bg-violet-50" },
  ],
  pembelian: [
    { id: "laporan-pembelian", name: "Laporan Pembelian", description: "Rekapitulasi pembelian per periode", icon: ClipboardList, color: "text-orange-600 bg-orange-50" },
    { id: "pembelian-per-item", name: "Pembelian per Item", description: "Breakdown pembelian per item", icon: ClipboardList, color: "text-orange-600 bg-orange-50" },
    { id: "pembelian-per-vendor", name: "Pembelian per Vendor", description: "Rekapitulasi pembelian per supplier", icon: ClipboardList, color: "text-orange-600 bg-orange-50" },
  ],
  persediaan: [
    { id: "kartu-stok", name: "Kartu Stok", description: "Rincian pergerakan stok per item", icon: Package, color: "text-teal-600 bg-teal-50" },
    { id: "laporan-persediaan", name: "Laporan Persediaan", description: "Daftar seluruh persediaan", icon: Package, color: "text-teal-600 bg-teal-50" },
    { id: "stok-akhir", name: "Stok Akhir", description: "Saldo stok akhir per item", icon: Package, color: "text-teal-600 bg-teal-50" },
  ],
};

const categoryCardColors: Record<CategoryId, { iconBg: string; iconText: string }> = {
  keuangan: { iconBg: "bg-indigo-100", iconText: "text-indigo-600" },
  buku_besar: { iconBg: "bg-slate-100", iconText: "text-slate-600" },
  kas_bank: { iconBg: "bg-emerald-100", iconText: "text-emerald-600" },
  piutang: { iconBg: "bg-cyan-100", iconText: "text-cyan-600" },
  penjualan: { iconBg: "bg-violet-100", iconText: "text-violet-600" },
  pembelian: { iconBg: "bg-orange-100", iconText: "text-orange-600" },
  persediaan: { iconBg: "bg-teal-100", iconText: "text-teal-600" },
};

export default function ReportsPage() {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState<CategoryId | null>(null);
  const currentReports = activeCategory ? reportsByCategory[activeCategory] : [];
  const currentLabel = activeCategory ? categories.find((c) => c.id === activeCategory)?.label : null;

  return (
    <div>
      <div className="view-header">
        <div className="view-title">
          <PieChart className="w-6 h-6 text-[--color-brand-secondary]" />
          Laporan Keuangan
        </div>
      </div>

      {activeCategory && (
        <div>
          <button
            onClick={() => setActiveCategory(null)}
            className="text-sm text-[--color-brand] hover:underline mb-4 inline-flex items-center gap-1"
          >
            <ArrowLeft size={14} /> Kembali ke Kategori
          </button>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-semibold">{currentLabel}</h2>
              <p className="text-sm text-[--color-text-secondary]">{currentReports.length} laporan tersedia</p>
            </div>
          </div>
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
            {currentReports.map((report) => {
              const Icon = report.icon;
              return (
                <div
                  key={report.id}
                  onClick={() => report.href && router.push(report.href)}
                  className={`card-slds cursor-pointer hover:shadow-slds-md transition-shadow ${!report.href ? "opacity-60" : ""}`}
                >
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${report.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="text-sm font-medium">{report.name}</h3>
                      <p className="text-xs text-[--color-text-secondary] mt-0.5">{report.description}</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {!activeCategory && (
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const colors = categoryCardColors[cat.id];
            return (
              <div
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className="card-slds cursor-pointer hover:shadow-slds-md transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${colors.iconBg}`}>
                    <Icon className={`w-5 h-5 ${colors.iconText}`} />
                  </div>
                  <div>
                    <p className="text-sm text-[--color-text-secondary]">{cat.label}</p>
                    <p className={`text-2xl font-bold ${colors.iconText}`}>{cat.count}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
