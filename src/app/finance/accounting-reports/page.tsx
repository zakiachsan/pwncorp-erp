"use client";

import { useState } from "react";
import { Download, BarChart3 } from "lucide-react";

/* ── helpers ──────────────────────────────────────────────────────── */
const statusPillColor = (s: string): string => {
  const map: Record<string, string> = {
    Posted: "#2e844a",
    Draft: "#6b7280",
    Registered: "#2e844a",
    Disposed: "#ea001e",
    Active: "#2e844a",
    Inactive: "#6b7280",
  };
  return map[s] || "#6b7280";
};

/* ── filter / column config per tab ───────────────────────────────── */
type FilterField = {
  label: string;
  type: "text" | "date" | "select";
  options?: string[];
  width?: string;
};

type ColDef = {
  header: string;
  key: string;
  align?: "left" | "right";
  render?: (v: any, row: any) => React.ReactNode;
};

interface TabConfig {
  id: string;
  label: string;
  filters: FilterField[];
  columns: ColDef[];
  data: Record<string, any>[];
}

const ENTITIES = ["All Entities", "PT Pencorp Motor", "PT Pencorp Spare"];

const TABS: TabConfig[] = [
  /* ═══════════════════════════════════════════════════════════════════
     A  Account Transactions
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "account-transactions",
    label: "Account Transactions",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Select Account", type: "select", options: ["All Accounts", "1101 Kas", "1102 Bank BCA", "1103 Bank Mandiri", "2101 Utang Usaha", "4101 Penjualan Jasa", "5101 Biaya Sparepart", "5102 Biaya Gaji Karyawan", "5103 Biaya Sewa", "6101 Beban Listrik"], width: "160px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Journal Status", type: "select", options: ["All", "Posted", "Draft"], width: "130px" },
    ],
    columns: [
      { header: "Date", key: "date" },
      { header: "Entity", key: "entity" },
      { header: "Journal", key: "journal", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Status", key: "status", render: (v: string) => <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span> },
      { header: "Ref Code", key: "refCode" },
      { header: "Notes", key: "notes" },
      { header: "Debit", key: "debit", align: "right" },
      { header: "Credit", key: "credit", align: "right" },
      { header: "Balance", key: "balance", align: "right" },
    ],
    data: [
      { date: "30 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0330", status: "Posted", refCode: "REF-AT030", notes: "Service Ringan Honda Brio", debit: "2.500.000", credit: "0", balance: "125.500.000" },
      { date: "29 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0329", status: "Posted", refCode: "REF-AT029", notes: "Ganti Oli Toyota Avanza", debit: "850.000", credit: "0", balance: "123.000.000" },
      { date: "28 Jun 2026", entity: "PT Pencorp Spare", journal: "JV-2026/0328", status: "Draft", refCode: "REF-AT028", notes: "Pembelian Kampas Rem Depan", debit: "3.200.000", credit: "0", balance: "122.150.000" },
      { date: "27 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0327", status: "Posted", refCode: "REF-AT027", notes: "Gaji Mekanik Bulanan Juni", debit: "15.000.000", credit: "0", balance: "118.950.000" },
      { date: "26 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0326", status: "Posted", refCode: "REF-AT026", notes: "Pembayaran Sewa Bengkel", debit: "0", credit: "8.500.000", balance: "103.950.000" },
      { date: "25 Jun 2026", entity: "PT Pencorp Spare", journal: "JV-2026/0325", status: "Posted", refCode: "REF-AT025", notes: "Penjualan Sparepart Cash", debit: "0", credit: "4.200.000", balance: "112.450.000" },
      { date: "24 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0324", status: "Draft", refCode: "REF-AT024", notes: "Servis AC Mobil Toyota Innova", debit: "1.200.000", credit: "0", balance: "108.250.000" },
      { date: "23 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0323", status: "Posted", refCode: "REF-AT023", notes: "Beli Filter Udara Honda Jazz", debit: "950.000", credit: "0", balance: "107.050.000" },
      { date: "22 Jun 2026", entity: "PT Pencorp Spare", journal: "JV-2026/0322", status: "Posted", refCode: "REF-AT022", notes: "Transfer Bank BCA ke Mandiri", debit: "0", credit: "25.000.000", balance: "106.100.000" },
      { date: "21 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0321", status: "Posted", refCode: "REF-AT021", notes: "Service Berat Toyota Kijang", debit: "4.500.000", credit: "0", balance: "131.100.000" },
      { date: "20 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0320", status: "Posted", refCode: "REF-AT020", notes: "Pembelian Ban Michelin 4 pcs", debit: "11.200.000", credit: "0", balance: "126.600.000" },
      { date: "19 Jun 2026", entity: "PT Pencorp Spare", journal: "JV-2026/0319", status: "Draft", refCode: "REF-AT019", notes: "Biaya Listrik Bulan Juni", debit: "2.800.000", credit: "0", balance: "115.400.000" },
      { date: "18 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0318", status: "Posted", refCode: "REF-AT018", notes: "Ganti Oli Yamaha Mio", debit: "350.000", credit: "0", balance: "112.600.000" },
      { date: "17 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0317", status: "Posted", refCode: "REF-AT017", notes: "Penjualan Jasa Service", debit: "0", credit: "6.750.000", balance: "112.250.000" },
      { date: "16 Jun 2026", entity: "PT Pencorp Spare", journal: "JV-2026/0316", status: "Posted", refCode: "REF-AT016", notes: "Beli Busi NGK Iridium 20 pcs", debit: "900.000", credit: "0", balance: "119.000.000" },
      { date: "15 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0315", status: "Posted", refCode: "REF-AT015", notes: "Ganti Shock Breaker Depan", debit: "2.050.000", credit: "0", balance: "118.100.000" },
      { date: "14 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0314", status: "Draft", refCode: "REF-AT014", notes: "Tambal Ban Tubeless", debit: "150.000", credit: "0", balance: "116.050.000" },
      { date: "13 Jun 2026", entity: "PT Pencorp Spare", journal: "JV-2026/0313", status: "Posted", refCode: "REF-AT013", notes: "Pembelian Oli Mesin 5W-40", debit: "3.700.000", credit: "0", balance: "115.900.000" },
      { date: "12 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0312", status: "Posted", refCode: "REF-AT012", notes: "Service Mesin Honda Beat", debit: "750.000", credit: "0", balance: "112.200.000" },
      { date: "11 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0311", status: "Posted", refCode: "REF-AT011", notes: "Pendapatan Service AC", debit: "0", credit: "3.200.000", balance: "111.450.000" },
      { date: "10 Jun 2026", entity: "PT Pencorp Spare", journal: "JV-2026/0310", status: "Posted", refCode: "REF-AT010", notes: "Beli V-Belt Honda Vario", debit: "1.020.000", credit: "0", balance: "108.250.000" },
      { date: "09 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0309", status: "Draft", refCode: "REF-AT009", notes: "Gaji Mekanik Tambahan", debit: "5.000.000", credit: "0", balance: "107.230.000" },
      { date: "08 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0308", status: "Posted", refCode: "REF-AT008", notes: "Beli Bearing Roda Depan", debit: "1.925.000", credit: "0", balance: "102.230.000" },
      { date: "07 Jun 2026", entity: "PT Pencorp Spare", journal: "JV-2026/0307", status: "Posted", refCode: "REF-AT007", notes: "Penjualan Alternator Rebuilt", debit: "0", credit: "3.500.000", balance: "100.305.000" },
      { date: "06 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0306", status: "Posted", refCode: "REF-AT006", notes: "Ganti Master Rem Depan", debit: "1.920.000", credit: "0", balance: "96.805.000" },
      { date: "05 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0305", status: "Posted", refCode: "REF-AT005", notes: "Beli Spion Universal", debit: "700.000", credit: "0", balance: "94.885.000" },
      { date: "04 Jun 2026", entity: "PT Pencorp Spare", journal: "JV-2026/0304", status: "Draft", refCode: "REF-AT004", notes: "Biaya Perawatan Gedung", debit: "1.500.000", credit: "0", balance: "94.185.000" },
      { date: "03 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0303", status: "Posted", refCode: "REF-AT003", notes: "Servis Transmisi Toyota Avanza", debit: "3.800.000", credit: "0", balance: "92.685.000" },
      { date: "02 Jun 2026", entity: "PT Pencorp Motor", journal: "JV-2026/0302", status: "Posted", refCode: "REF-AT002", notes: "Pembelian Radiator Coolant", debit: "910.000", credit: "0", balance: "88.885.000" },
      { date: "01 Jun 2026", entity: "PT Pencorp Spare", journal: "JV-2026/0301", status: "Posted", refCode: "REF-AT001", notes: "Penjualan Lampu LED", debit: "0", credit: "1.500.000", balance: "87.975.000" },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════════
     B  Balance Sheet
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "balance-sheet",
    label: "Balance Sheet",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "As Of Date", type: "date", width: "140px" },
      { label: "Account Type", type: "select", options: ["All", "Asset", "Liability", "Equity"], width: "140px" },
    ],
    columns: [
      { header: "Code", key: "code" },
      { header: "Account Name", key: "accountName" },
      { header: "Parent", key: "parent" },
      { header: "Current Period", key: "currentPeriod", align: "right" },
      { header: "Previous Period", key: "previousPeriod", align: "right" },
      { header: "Change", key: "change", align: "right" },
      { header: "Change %", key: "changePercent", align: "right" },
    ],
    data: [
      { code: "1101", accountName: "Kas", parent: "Kas & Bank", currentPeriod: "25.750.000", previousPeriod: "22.300.000", change: "3.450.000", changePercent: "15.47%" },
      { code: "1102", accountName: "Bank BCA", parent: "Kas & Bank", currentPeriod: "85.200.000", previousPeriod: "92.100.000", change: "-6.900.000", changePercent: "-7.49%" },
      { code: "1103", accountName: "Bank Mandiri", parent: "Kas & Bank", currentPeriod: "42.500.000", previousPeriod: "38.000.000", change: "4.500.000", changePercent: "11.84%" },
      { code: "1201", accountName: "Piutang Usaha", parent: "Piutang", currentPeriod: "18.350.000", previousPeriod: "15.200.000", change: "3.150.000", changePercent: "20.72%" },
      { code: "1202", accountName: "Piutang Pajak", parent: "Piutang", currentPeriod: "4.200.000", previousPeriod: "3.800.000", change: "400.000", changePercent: "10.53%" },
      { code: "1301", accountName: "Persediaan Sparepart", parent: "Persediaan", currentPeriod: "32.500.000", previousPeriod: "28.700.000", change: "3.800.000", changePercent: "13.24%" },
      { code: "1302", accountName: "Persediaan Oli & Pelumas", parent: "Persediaan", currentPeriod: "8.900.000", previousPeriod: "7.500.000", change: "1.400.000", changePercent: "18.67%" },
      { code: "1501", accountName: "Peralatan Bengkel", parent: "Fixed Asset", currentPeriod: "45.000.000", previousPeriod: "45.000.000", change: "0", changePercent: "0.00%" },
      { code: "1502", accountName: "Akumulasi Peryalatan", parent: "Fixed Asset", currentPeriod: "-12.500.000", previousPeriod: "-10.000.000", change: "-2.500.000", changePercent: "25.00%" },
      { code: "1503", accountName: "Kendaraan Operasional", parent: "Fixed Asset", currentPeriod: "28.000.000", previousPeriod: "28.000.000", change: "0", changePercent: "0.00%" },
      { code: "1504", accountName: "Akumulasi Kendaraan", parent: "Fixed Asset", currentPeriod: "-8.400.000", previousPeriod: "-7.000.000", change: "-1.400.000", changePercent: "20.00%" },
      { code: "2101", accountName: "Utang Usaha", parent: "Utang", currentPeriod: "14.800.000", previousPeriod: "12.500.000", change: "2.300.000", changePercent: "18.40%" },
      { code: "2102", accountName: "Utang Pajak (PPN)", parent: "Utang", currentPeriod: "6.750.000", previousPeriod: "5.200.000", change: "1.550.000", changePercent: "29.81%" },
      { code: "2103", accountName: "Utang Gaji", parent: "Utang", currentPeriod: "7.500.000", previousPeriod: "7.500.000", change: "0", changePercent: "0.00%" },
      { code: "2201", accountName: "Utang Bank (Kredit)", parent: "Utang Jangka Panjang", currentPeriod: "35.000.000", previousPeriod: "38.000.000", change: "-3.000.000", changePercent: "-7.89%" },
      { code: "3101", accountName: "Modal Disetor", parent: "Modal", currentPeriod: "100.000.000", previousPeriod: "100.000.000", change: "0", changePercent: "0.00%" },
      { code: "3201", accountName: "Laba Ditahan", parent: "Modal", currentPeriod: "15.200.000", previousPeriod: "12.800.000", change: "2.400.000", changePercent: "18.75%" },
      { code: "3301", accountName: "Laba Tahun Berjalan", parent: "Modal", currentPeriod: "49.250.000", previousPeriod: "43.400.000", change: "5.850.000", changePercent: "13.48%" },
      { code: "1104", accountName: "Piutang Karyawan", parent: "Piutang", currentPeriod: "2.100.000", previousPeriod: "2.500.000", change: "-400.000", changePercent: "-16.00%" },
      { code: "1203", accountName: "Uang Muka Pembelian", parent: "Piutang", currentPeriod: "5.000.000", previousPeriod: "3.500.000", change: "1.500.000", changePercent: "42.86%" },
      { code: "1303", accountName: "Persediaan ATK", parent: "Persediaan", currentPeriod: "1.200.000", previousPeriod: "1.000.000", change: "200.000", changePercent: "20.00%" },
      { code: "1401", accountName: "Inventaris Kantor", parent: "Fixed Asset", currentPeriod: "6.500.000", previousPeriod: "6.500.000", change: "0", changePercent: "0.00%" },
      { code: "1402", accountName: "Akumulasi Inventaris", parent: "Fixed Asset", currentPeriod: "-2.100.000", previousPeriod: "-1.800.000", change: "-300.000", changePercent: "16.67%" },
      { code: "2104", accountName: "Utang Sewa", parent: "Utang", currentPeriod: "4.250.000", previousPeriod: "4.250.000", change: "0", changePercent: "0.00%" },
      { code: "2105", accountName: "Utang Listrik & Air", parent: "Utang", currentPeriod: "1.850.000", previousPeriod: "1.600.000", change: "250.000", changePercent: "15.63%" },
      { code: "3102", accountName: "Modal Saham", parent: "Modal", currentPeriod: "50.000.000", previousPeriod: "50.000.000", change: "0", changePercent: "0.00%" },
      { code: "3202", accountName: "Cadangan", parent: "Modal", currentPeriod: "8.500.000", previousPeriod: "7.000.000", change: "1.500.000", changePercent: "21.43%" },
      { code: "1105", accountName: "Investasi Jangka Pendek", parent: "Kas & Bank", currentPeriod: "10.000.000", previousPeriod: "10.000.000", change: "0", changePercent: "0.00%" },
      { code: "2202", accountName: "Utang Pajak Penghasilan", parent: "Utang Jangka Panjang", currentPeriod: "3.200.000", previousPeriod: "2.800.000", change: "400.000", changePercent: "14.29%" },
      { code: "3302", accountName: "Selisih Penilaian Aset", parent: "Modal", currentPeriod: "1.500.000", previousPeriod: "1.200.000", change: "300.000", changePercent: "25.00%" },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════════
     C  Journal Transactions
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "journal-transactions",
    label: "Journal Transactions",
    filters: [
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Source", type: "select", options: ["All", "Service Work Order", "Purchase Invoice", "Sales Invoice", "Payment", "Manual Journal", "Petty Cash"], width: "170px" },
      { label: "Status", type: "select", options: ["All", "Posted", "Draft"], width: "120px" },
    ],
    columns: [
      { header: "Journal Date", key: "journalDate" },
      { header: "Ref Code", key: "refCode" },
      { header: "Journal", key: "journal", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Source", key: "source" },
      { header: "Notes", key: "notes" },
      { header: "Debit", key: "debit", align: "right" },
      { header: "Credit", key: "credit", align: "right" },
      { header: "Status", key: "status", render: (v: string) => <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span> },
    ],
    data: [
      { journalDate: "30 Jun 2026", refCode: "JR-030", journal: "JV-2026/0330", source: "Service Work Order", notes: "Service Ringan Honda Brio - SWO-2026/0120", debit: "2.500.000", credit: "2.500.000", status: "Posted" },
      { journalDate: "29 Jun 2026", refCode: "JR-029", journal: "JV-2026/0329", source: "Service Work Order", notes: "Ganti Oli Toyota Avanza - SWO-2026/0119", debit: "850.000", credit: "850.000", status: "Posted" },
      { journalDate: "28 Jun 2026", refCode: "JR-028", journal: "JV-2026/0328", source: "Purchase Invoice", notes: "Pembelian Kampas Rem - PI-2026/0088", debit: "3.200.000", credit: "3.200.000", status: "Draft" },
      { journalDate: "27 Jun 2026", refCode: "JR-027", journal: "JV-2026/0327", source: "Manual Journal", notes: "Gaji Mekanik Bulanan Juni", debit: "15.000.000", credit: "15.000.000", status: "Posted" },
      { journalDate: "26 Jun 2026", refCode: "JR-026", journal: "JV-2026/0326", source: "Payment", notes: "Pembayaran Sewa Bengkel - PAY-2026/0045", debit: "8.500.000", credit: "8.500.000", status: "Posted" },
      { journalDate: "25 Jun 2026", refCode: "JR-025", journal: "JV-2026/0325", source: "Sales Invoice", notes: "Penjualan Sparepart Cash - SI-2026/0065", debit: "4.200.000", credit: "4.200.000", status: "Posted" },
      { journalDate: "24 Jun 2026", refCode: "JR-024", journal: "JV-2026/0324", source: "Service Work Order", notes: "Servis AC Toyota Innova - SWO-2026/0118", debit: "1.200.000", credit: "1.200.000", status: "Draft" },
      { journalDate: "23 Jun 2026", refCode: "JR-023", journal: "JV-2026/0323", source: "Purchase Invoice", notes: "Beli Filter Udara Honda Jazz - PI-2026/0087", debit: "950.000", credit: "950.000", status: "Posted" },
      { journalDate: "22 Jun 2026", refCode: "JR-022", journal: "JV-2026/0322", source: "Payment", notes: "Transfer BCA ke Mandiri - PAY-2026/0044", debit: "25.000.000", credit: "25.000.000", status: "Posted" },
      { journalDate: "21 Jun 2026", refCode: "JR-021", journal: "JV-2026/0321", source: "Service Work Order", notes: "Service Berat Toyota Kijang - SWO-2026/0117", debit: "4.500.000", credit: "4.500.000", status: "Posted" },
      { journalDate: "20 Jun 2026", refCode: "JR-020", journal: "JV-2026/0320", source: "Purchase Invoice", notes: "Pembelian Ban Michelin 4 pcs - PI-2026/0086", debit: "11.200.000", credit: "11.200.000", status: "Posted" },
      { journalDate: "19 Jun 2026", refCode: "JR-019", journal: "JV-2026/0319", source: "Petty Cash", notes: "Biaya Listrik Bulan Juni", debit: "2.800.000", credit: "2.800.000", status: "Draft" },
      { journalDate: "18 Jun 2026", refCode: "JR-018", journal: "JV-2026/0318", source: "Service Work Order", notes: "Ganti Oli Yamaha Mio - SWO-2026/0116", debit: "350.000", credit: "350.000", status: "Posted" },
      { journalDate: "17 Jun 2026", refCode: "JR-017", journal: "JV-2026/0317", source: "Sales Invoice", notes: "Penjualan Jasa Service - SI-2026/0064", debit: "6.750.000", credit: "6.750.000", status: "Posted" },
      { journalDate: "16 Jun 2026", refCode: "JR-016", journal: "JV-2026/0316", source: "Purchase Invoice", notes: "Beli Busi NGK Iridium 20 pcs - PI-2026/0085", debit: "900.000", credit: "900.000", status: "Posted" },
      { journalDate: "15 Jun 2026", refCode: "JR-015", journal: "JV-2026/0315", source: "Service Work Order", notes: "Ganti Shock Breaker Depan - SWO-2026/0115", debit: "2.050.000", credit: "2.050.000", status: "Posted" },
      { journalDate: "14 Jun 2026", refCode: "JR-014", journal: "JV-2026/0314", source: "Service Work Order", notes: "Tambal Ban Tubeless - SWO-2026/0114", debit: "150.000", credit: "150.000", status: "Draft" },
      { journalDate: "13 Jun 2026", refCode: "JR-013", journal: "JV-2026/0313", source: "Purchase Invoice", notes: "Pembelian Oli Mesin 5W-40 - PI-2026/0084", debit: "3.700.000", credit: "3.700.000", status: "Posted" },
      { journalDate: "12 Jun 2026", refCode: "JR-012", journal: "JV-2026/0312", source: "Service Work Order", notes: "Service Mesin Honda Beat - SWO-2026/0113", debit: "750.000", credit: "750.000", status: "Posted" },
      { journalDate: "11 Jun 2026", refCode: "JR-011", journal: "JV-2026/0311", source: "Sales Invoice", notes: "Pendapatan Service AC - SI-2026/0063", debit: "3.200.000", credit: "3.200.000", status: "Posted" },
      { journalDate: "10 Jun 2026", refCode: "JR-010", journal: "JV-2026/0310", source: "Purchase Invoice", notes: "Beli V-Belt Honda Vario - PI-2026/0083", debit: "1.020.000", credit: "1.020.000", status: "Posted" },
      { journalDate: "09 Jun 2026", refCode: "JR-009", journal: "JV-2026/0309", source: "Manual Journal", notes: "Gaji Mekanik Tambahan", debit: "5.000.000", credit: "5.000.000", status: "Draft" },
      { journalDate: "08 Jun 2026", refCode: "JR-008", journal: "JV-2026/0308", source: "Purchase Invoice", notes: "Beli Bearing Roda Depan - PI-2026/0082", debit: "1.925.000", credit: "1.925.000", status: "Posted" },
      { journalDate: "07 Jun 2026", refCode: "JR-007", journal: "JV-2026/0307", source: "Sales Invoice", notes: "Penjualan Alternator Rebuilt - SI-2026/0062", debit: "3.500.000", credit: "3.500.000", status: "Posted" },
      { journalDate: "06 Jun 2026", refCode: "JR-006", journal: "JV-2026/0306", source: "Service Work Order", notes: "Ganti Master Rem Depan - SWO-2026/0112", debit: "1.920.000", credit: "1.920.000", status: "Posted" },
      { journalDate: "05 Jun 2026", refCode: "JR-005", journal: "JV-2026/0305", source: "Purchase Invoice", notes: "Beli Spion Universal - PI-2026/0081", debit: "700.000", credit: "700.000", status: "Posted" },
      { journalDate: "04 Jun 2026", refCode: "JR-004", journal: "JV-2026/0304", source: "Petty Cash", notes: "Biaya Perawatan Gedung", debit: "1.500.000", credit: "1.500.000", status: "Draft" },
      { journalDate: "03 Jun 2026", refCode: "JR-003", journal: "JV-2026/0303", source: "Service Work Order", notes: "Servis Transmisi Toyota Avanza - SWO-2026/0111", debit: "3.800.000", credit: "3.800.000", status: "Posted" },
      { journalDate: "02 Jun 2026", refCode: "JR-002", journal: "JV-2026/0302", source: "Purchase Invoice", notes: "Pembelian Radiator Coolant - PI-2026/0080", debit: "910.000", credit: "910.000", status: "Posted" },
      { journalDate: "01 Jun 2026", refCode: "JR-001", journal: "JV-2026/0301", source: "Sales Invoice", notes: "Penjualan Lampu LED - SI-2026/0061", debit: "1.500.000", credit: "1.500.000", status: "Posted" },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════════
     D  Profit & Loss
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "profit-loss",
    label: "Profit & Loss",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "From Date", type: "date", width: "140px" },
      { label: "To Date", type: "date", width: "140px" },
      { label: "Compare With", type: "select", options: ["None", "Previous Period", "Previous Year"], width: "150px" },
    ],
    columns: [
      { header: "Code", key: "code" },
      { header: "Account Name", key: "accountName" },
      { header: "Current Period", key: "currentPeriod", align: "right" },
      { header: "Previous Period", key: "previousPeriod", align: "right" },
      { header: "Change", key: "change", align: "right" },
      { header: "Change %", key: "changePercent", align: "right" },
    ],
    data: [
      { code: "4101", accountName: "Pendapatan Jasa Service", currentPeriod: "85.500.000", previousPeriod: "78.200.000", change: "7.300.000", changePercent: "9.33%" },
      { code: "4102", accountName: "Pendapatan Jual Sparepart", currentPeriod: "125.800.000", previousPeriod: "112.500.000", change: "13.300.000", changePercent: "11.82%" },
      { code: "4103", accountName: "Pendapatan Servis AC", currentPeriod: "18.200.000", previousPeriod: "15.800.000", change: "2.400.000", changePercent: "15.19%" },
      { code: "4104", accountName: "Pendapatan Tambal Ban", currentPeriod: "8.500.000", previousPeriod: "7.200.000", change: "1.300.000", changePercent: "18.06%" },
      { code: "4201", accountName: "Pendapatan Bunga Bank", currentPeriod: "2.100.000", previousPeriod: "1.800.000", change: "300.000", changePercent: "16.67%" },
      { code: "5101", accountName: "HPP Sparepart", currentPeriod: "78.500.000", previousPeriod: "71.200.000", change: "7.300.000", changePercent: "10.25%" },
      { code: "5102", accountName: "Biaya Gaji Karyawan", currentPeriod: "45.000.000", previousPeriod: "42.500.000", change: "2.500.000", changePercent: "5.88%" },
      { code: "5103", accountName: "Biaya Sewa Bengkel", currentPeriod: "10.200.000", previousPeriod: "10.200.000", change: "0", changePercent: "0.00%" },
      { code: "5104", accountName: "Biaya Listrik & Air", currentPeriod: "6.800.000", previousPeriod: "6.200.000", change: "600.000", changePercent: "9.68%" },
      { code: "5105", accountName: "Biaya Perawatan Gedung", currentPeriod: "3.500.000", previousPeriod: "3.000.000", change: "500.000", changePercent: "16.67%" },
      { code: "5106", accountName: "Biaya Depresiasi Peralatan", currentPeriod: "5.000.000", previousPeriod: "5.000.000", change: "0", changePercent: "0.00%" },
      { code: "5107", accountName: "Biaya Depresiasi Kendaraan", currentPeriod: "2.800.000", previousPeriod: "2.800.000", change: "0", changePercent: "0.00%" },
      { code: "5108", accountName: "Biaya ATK & Perlengkapan", currentPeriod: "1.800.000", previousPeriod: "1.500.000", change: "300.000", changePercent: "20.00%" },
      { code: "5109", accountName: "Biaya Asuransi", currentPeriod: "2.400.000", previousPeriod: "2.400.000", change: "0", changePercent: "0.00%" },
      { code: "5110", accountName: "Biaya Telekomunikasi", currentPeriod: "1.200.000", previousPeriod: "1.100.000", change: "100.000", changePercent: "9.09%" },
      { code: "5111", accountName: "Biaya Transport & Perjalanan", currentPeriod: "2.500.000", previousPeriod: "2.000.000", change: "500.000", changePercent: "25.00%" },
      { code: "5112", accountName: "Biaya Marketing & Promosi", currentPeriod: "4.500.000", previousPeriod: "3.800.000", change: "700.000", changePercent: "18.42%" },
      { code: "6101", accountName: "Pendapatan Selisih Kurs", currentPeriod: "350.000", previousPeriod: "200.000", change: "150.000", changePercent: "75.00%" },
      { code: "6102", accountName: "Beban Bunga Bank", currentPeriod: "3.200.000", previousPeriod: "3.500.000", change: "-300.000", changePercent: "-8.57%" },
      { code: "6103", accountName: "Beban Pajak Penghasilan", currentPeriod: "8.500.000", previousPeriod: "7.200.000", change: "1.300.000", changePercent: "18.06%" },
      { code: "4105", accountName: "Pendapatan Konsinyasi", currentPeriod: "5.200.000", previousPeriod: "4.500.000", change: "700.000", changePercent: "15.56%" },
      { code: "5113", accountName: "Biaya Pengiriman", currentPeriod: "3.800.000", previousPeriod: "3.200.000", change: "600.000", changePercent: "18.75%" },
      { code: "5114", accountName: "Biaya Kerusakan barang", currentPeriod: "1.200.000", previousPeriod: "800.000", change: "400.000", changePercent: "50.00%" },
      { code: "6104", accountName: "Pendapatan Lain-lain", currentPeriod: "1.500.000", previousPeriod: "1.000.000", change: "500.000", changePercent: "50.00%" },
      { code: "6105", accountName: "Beban Lain-lain", currentPeriod: "900.000", previousPeriod: "750.000", change: "150.000", changePercent: "20.00%" },
      { code: "5115", accountName: "Biaya Pemeliharaan Kendaraan", currentPeriod: "2.000.000", previousPeriod: "1.800.000", change: "200.000", changePercent: "11.11%" },
      { code: "4106", accountName: "Pendapatan Jasa Konsultasi", currentPeriod: "3.800.000", previousPeriod: "3.200.000", change: "600.000", changePercent: "18.75%" },
      { code: "5116", accountName: "Biaya Rekrutmen", currentPeriod: "1.500.000", previousPeriod: "1.000.000", change: "500.000", changePercent: "50.00%" },
      { code: "5117", accountName: "Biaya Pelatihan Karyawan", currentPeriod: "2.200.000", previousPeriod: "1.800.000", change: "400.000", changePercent: "22.22%" },
      { code: "6106", accountName: "Beban Pajak Daerah", currentPeriod: "1.100.000", previousPeriod: "1.000.000", change: "100.000", changePercent: "10.00%" },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════════
     E  Trial Balance
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "trial-balance",
    label: "Trial Balance",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "As Of Date", type: "date", width: "140px" },
    ],
    columns: [
      { header: "Code", key: "code" },
      { header: "Account Name", key: "accountName" },
      { header: "Debit", key: "debit", align: "right" },
      { header: "Credit", key: "credit", align: "right" },
    ],
    data: [
      { code: "1101", accountName: "Kas", debit: "25.750.000", credit: "0" },
      { code: "1102", accountName: "Bank BCA", debit: "85.200.000", credit: "0" },
      { code: "1103", accountName: "Bank Mandiri", debit: "42.500.000", credit: "0" },
      { code: "1104", accountName: "Piutang Karyawan", debit: "2.100.000", credit: "0" },
      { code: "1105", accountName: "Investasi Jangka Pendek", debit: "10.000.000", credit: "0" },
      { code: "1201", accountName: "Piutang Usaha", debit: "18.350.000", credit: "0" },
      { code: "1202", accountName: "Piutang Pajak", debit: "4.200.000", credit: "0" },
      { code: "1203", accountName: "Uang Muka Pembelian", debit: "5.000.000", credit: "0" },
      { code: "1301", accountName: "Persediaan Sparepart", debit: "32.500.000", credit: "0" },
      { code: "1302", accountName: "Persediaan Oli & Pelumas", debit: "8.900.000", credit: "0" },
      { code: "1303", accountName: "Persediaan ATK", debit: "1.200.000", credit: "0" },
      { code: "1401", accountName: "Inventaris Kantor", debit: "6.500.000", credit: "0" },
      { code: "1402", accountName: "Akumulasi Inventaris", debit: "0", credit: "2.100.000" },
      { code: "1501", accountName: "Peralatan Bengkel", debit: "45.000.000", credit: "0" },
      { code: "1502", accountName: "Akumulasi Peralatan", debit: "0", credit: "12.500.000" },
      { code: "1503", accountName: "Kendaraan Operasional", debit: "28.000.000", credit: "0" },
      { code: "1504", accountName: "Akumulasi Kendaraan", debit: "0", credit: "8.400.000" },
      { code: "2101", accountName: "Utang Usaha", debit: "0", credit: "14.800.000" },
      { code: "2102", accountName: "Utang Pajak (PPN)", debit: "0", credit: "6.750.000" },
      { code: "2103", accountName: "Utang Gaji", debit: "0", credit: "7.500.000" },
      { code: "2104", accountName: "Utang Sewa", debit: "0", credit: "4.250.000" },
      { code: "2105", accountName: "Utang Listrik & Air", debit: "0", credit: "1.850.000" },
      { code: "2201", accountName: "Utang Bank (Kredit)", debit: "0", credit: "35.000.000" },
      { code: "2202", accountName: "Utang Pajak Penghasilan", debit: "0", credit: "3.200.000" },
      { code: "3101", accountName: "Modal Disetor", debit: "0", credit: "100.000.000" },
      { code: "3102", accountName: "Modal Saham", debit: "0", credit: "50.000.000" },
      { code: "3201", accountName: "Laba Ditahan", debit: "0", credit: "15.200.000" },
      { code: "3202", accountName: "Cadangan", debit: "0", credit: "8.500.000" },
      { code: "3301", accountName: "Laba Tahun Berjalan", debit: "0", credit: "49.250.000" },
      { code: "3302", accountName: "Selisih Penilaian Aset", debit: "0", credit: "1.500.000" },
    ],
  },

  /* ═══════════════════════════════════════════════════════════════════
     F  Fixed Asset List
     ═══════════════════════════════════════════════════════════════════ */
  {
    id: "fixed-asset-list",
    label: "Fixed Asset List",
    filters: [
      { label: "Business Entity", type: "select", options: ENTITIES, width: "160px" },
      { label: "Asset Category", type: "select", options: ["All", "Tangible", "Intangible"], width: "140px" },
      { label: "Status", type: "select", options: ["All", "Registered", "Disposed"], width: "130px" },
    ],
    columns: [
      { header: "Document No", key: "docNo", render: (v: string) => <span style={{ color: "#0176d3", cursor: "pointer" }}>{v}</span> },
      { header: "Asset Name", key: "assetName" },
      { header: "Asset Code", key: "assetCode" },
      { header: "Category", key: "category" },
      { header: "Purchase Date", key: "purchaseDate" },
      { header: "Purchase Price", key: "purchasePrice", align: "right" },
      { header: "Accum. Depreciation", key: "accumDepreciation", align: "right" },
      { header: "Book Value", key: "bookValue", align: "right" },
      { header: "Status", key: "status", render: (v: string) => <span style={{ display: "inline-block", padding: "2px 8px", borderRadius: 9999, fontSize: 10, fontWeight: 600, background: statusPillColor(v), color: "#fff" }}>{v}</span> },
    ],
    data: [
      { docNo: "FA-2026/0030", assetName: "Mesin Kompresor Atlas Copco", assetCode: "TLB-001", category: "Tangible", purchaseDate: "15 Jun 2026", purchasePrice: "18.500.000", accumDepreciation: "0", bookValue: "18.500.000", status: "Registered" },
      { docNo: "FA-2026/0029", assetName: "Lift Hidrolik 4 Ton", assetCode: "TLB-002", category: "Tangible", purchaseDate: "10 Jun 2026", purchasePrice: "35.000.000", accumDepreciation: "0", bookValue: "35.000.000", status: "Registered" },
      { docNo: "FA-2026/0028", assetName: "Software Akuntansi ERP", assetCode: "INT-001", category: "Intangible", purchaseDate: "05 Jun 2026", purchasePrice: "12.000.000", accumDepreciation: "2.000.000", bookValue: "10.000.000", status: "Registered" },
      { docNo: "FA-2026/0027", assetName: "Tiang Hidrolik 2 Post", assetCode: "TLB-003", category: "Tangible", purchaseDate: "01 Jun 2026", purchasePrice: "22.000.000", accumDepreciation: "0", bookValue: "22.000.000", status: "Registered" },
      { docNo: "FA-2026/0026", assetName: "Welding Machine Miller", assetCode: "TLB-004", category: "Tangible", purchaseDate: "28 May 2026", purchasePrice: "8.500.000", accumDepreciation: "141.667", bookValue: "8.358.333", status: "Registered" },
      { docNo: "FA-2026/0025", assetName: "Toko Online Platform", assetCode: "INT-002", category: "Intangible", purchaseDate: "25 May 2026", purchasePrice: "5.000.000", accumDepreciation: "416.667", bookValue: "4.583.333", status: "Registered" },
      { docNo: "FA-2026/0024", assetName: "Ban Bekas Toyota Avanza", assetCode: "TLB-005", category: "Tangible", purchaseDate: "20 May 2026", purchasePrice: "2.800.000", accumDepreciation: "233.333", bookValue: "2.566.667", status: "Disposed" },
      { docNo: "FA-2026/0023", assetName: "Mesin Potong Besi", assetCode: "TLB-006", category: "Tangible", purchaseDate: "15 May 2026", purchasePrice: "6.200.000", accumDepreciation: "516.667", bookValue: "5.683.333", status: "Registered" },
      { docNo: "FA-2026/0022", assetName: "Laptop Dell Inspiron", assetCode: "INT-003", category: "Intangible", purchaseDate: "10 May 2026", purchasePrice: "9.800.000", accumDepreciation: "816.667", bookValue: "8.983.333", status: "Registered" },
      { docNo: "FA-2026/0021", assetName: "Set Kunci Ring 1/4 - 1", assetCode: "TLB-007", category: "Tangible", purchaseDate: "05 May 2026", purchasePrice: "3.500.000", accumDepreciation: "291.667", bookValue: "3.208.333", status: "Registered" },
      { docNo: "FA-2026/0020", assetName: "Tiang Montir Besi", assetCode: "TLB-008", category: "Tangible", purchaseDate: "01 May 2026", purchasePrice: "4.200.000", accumDepreciation: "350.000", bookValue: "3.850.000", status: "Registered" },
      { docNo: "FA-2026/0019", assetName: "Printer Epson L3210", assetCode: "INT-004", category: "Intangible", purchaseDate: "28 Apr 2026", purchasePrice: "3.800.000", accumDepreciation: "380.000", bookValue: "3.420.000", status: "Registered" },
      { docNo: "FA-2026/0018", assetName: "Mesin Servis AC Mobil", assetCode: "TLB-009", category: "Tangible", purchaseDate: "25 Apr 2026", purchasePrice: "15.000.000", accumDepreciation: "1.500.000", bookValue: "13.500.000", status: "Registered" },
      { docNo: "FA-2026/0017", assetName: "Tiang Dongkrak 3 Ton", assetCode: "TLB-010", category: "Tangible", purchaseDate: "20 Apr 2026", purchasePrice: "1.800.000", accumDepreciation: "180.000", bookValue: "1.620.000", status: "Registered" },
      { docNo: "FA-2026/0016", assetName: "Genset Honda 5000W", assetCode: "TLB-011", category: "Tangible", purchaseDate: "15 Apr 2026", purchasePrice: "12.500.000", accumDepreciation: "1.250.000", bookValue: "11.250.000", status: "Registered" },
      { docNo: "FA-2026/0015", assetName: "Software POS Workshop", assetCode: "INT-005", category: "Intangible", purchaseDate: "10 Apr 2026", purchasePrice: "8.000.000", accumDepreciation: "800.000", bookValue: "7.200.000", status: "Registered" },
      { docNo: "FA-2026/0014", assetName: "Mesin bubut mini", assetCode: "TLB-012", category: "Tangible", purchaseDate: "05 Apr 2026", purchasePrice: "7.500.000", accumDepreciation: "750.000", bookValue: "6.750.000", status: "Disposed" },
      { docNo: "FA-2026/0013", assetName: "Kompresor Angin Portable", assetCode: "TLB-013", category: "Tangible", purchaseDate: "01 Apr 2026", purchasePrice: "4.500.000", accumDepreciation: "450.000", bookValue: "4.050.000", status: "Registered" },
      { docNo: "FA-2026/0012", assetName: "Tiang Las Listrik", assetCode: "TLB-014", category: "Tangible", purchaseDate: "28 Mar 2026", purchasePrice: "5.200.000", accumDepreciation: "577.778", bookValue: "4.622.222", status: "Registered" },
      { docNo: "FA-2026/0011", assetName: "Laptop Asus VivoBook", assetCode: "INT-006", category: "Intangible", purchaseDate: "25 Mar 2026", purchasePrice: "7.500.000", accumDepreciation: "833.333", bookValue: "6.666.667", status: "Registered" },
      { docNo: "FA-2026/0010", assetName: "Hand Truk 300kg", assetCode: "TLB-015", category: "Tangible", purchaseDate: "20 Mar 2026", purchasePrice: "2.200.000", accumDepreciation: "244.444", bookValue: "1.955.556", status: "Registered" },
      { docNo: "FA-2026/0009", assetName: "Mesin Press Hidrolik", assetCode: "TLB-016", category: "Tangible", purchaseDate: "15 Mar 2026", purchasePrice: "28.000.000", accumDepreciation: "3.111.111", bookValue: "24.888.889", status: "Registered" },
      { docNo: "FA-2026/0008", assetName: "Scanner Barcode", assetCode: "INT-007", category: "Intangible", purchaseDate: "10 Mar 2026", purchasePrice: "2.500.000", accumDepreciation: "277.778", bookValue: "2.222.222", status: "Registered" },
      { docNo: "FA-2026/0007", assetName: "Cat Semprot Compressor", assetCode: "TLB-017", category: "Tangible", purchaseDate: "05 Mar 2026", purchasePrice: "3.200.000", accumDepreciation: "355.556", bookValue: "2.844.444", status: "Registered" },
      { docNo: "FA-2026/0006", assetName: "Tiang Ramp Service", assetCode: "TLB-018", category: "Tangible", purchaseDate: "01 Mar 2026", purchasePrice: "45.000.000", accumDepreciation: "5.000.000", bookValue: "40.000.000", status: "Registered" },
      { docNo: "FA-2026/0005", assetName: "Software HR Management", assetCode: "INT-008", category: "Intangible", purchaseDate: "25 Feb 2026", purchasePrice: "6.500.000", accumDepreciation: "812.500", bookValue: "5.687.500", status: "Registered" },
      { docNo: "FA-2026/0004", assetName: "Mesin Balancing Roda", assetCode: "TLB-019", category: "Tangible", purchaseDate: "20 Feb 2026", purchasePrice: "14.000.000", accumDepreciation: "1.750.000", bookValue: "12.250.000", status: "Registered" },
      { docNo: "FA-2026/0003", assetName: "AC Split Daikin 2PK", assetCode: "TLB-020", category: "Tangible", purchaseDate: "15 Feb 2026", purchasePrice: "6.800.000", accumDepreciation: "850.000", bookValue: "5.950.000", status: "Registered" },
      { docNo: "FA-2026/0002", assetName: "Server NAS Synology", assetCode: "INT-009", category: "Intangible", purchaseDate: "10 Feb 2026", purchasePrice: "8.500.000", accumDepreciation: "1.062.500", bookValue: "7.437.500", status: "Registered" },
      { docNo: "FA-2026/0001", assetName: "Meja Kerja Bengkel", assetCode: "TLB-021", category: "Tangible", purchaseDate: "01 Feb 2026", purchasePrice: "2.500.000", accumDepreciation: "312.500", bookValue: "2.187.500", status: "Registered" },
    ],
  },
];

/* ═══════════════════════════════════════════════════════════════════
   Component
   ═══════════════════════════════════════════════════════════════════ */
export default function AccountingReportsPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const cfg = TABS[activeTab];
  const PER_PAGE = 20;
  const totalPages = Math.ceil(cfg.data.length / PER_PAGE);
  const pagedData = cfg.data.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  return (
    <div style={{ background: "#fff", minHeight: "100vh", fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* ── header ── */}
      <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "20px 24px 0" }}>
        <BarChart3 size={24} color="#0176d3" />
        <h1 style={{ fontSize: 20, fontWeight: 700, color: "#001526", margin: 0 }}>Accounting Reports</h1>
      </div>

      {/* ── Summary Cards ── */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 12, padding: "16px 24px 0" }}>
        <div className="card-slds" style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", marginBottom: 4 }}>Total Entries</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#001526" }}>{cfg.data.length}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", marginBottom: 4 }}>Active Tab</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#0176d3" }}>{cfg.label}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", marginBottom: 4 }}>Page</div>
          <div style={{ fontSize: 22, fontWeight: 700, color: "#001526" }}>{page} / {totalPages || 1}</div>
        </div>
        <div className="card-slds" style={{ textAlign: "center", padding: 14 }}>
          <div style={{ fontSize: 10, fontWeight: 600, color: "#8e8f8e", textTransform: "uppercase", marginBottom: 4 }}>Last Updated</div>
          <div style={{ fontSize: 13, fontWeight: 600, color: "#444746" }}>Today</div>
        </div>
      </div>

      {/* ── tab bar ── */}
      <div style={{ display: "flex", gap: 0, padding: "16px 24px 0", flexWrap: "wrap" }}>
        {TABS.map((tab, i) => {
          const isActive = i === activeTab;
          return (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(i); setPage(1); }}
              style={{
                padding: "8px 16px",
                fontSize: 12,
                fontWeight: isActive ? 600 : 400,
                color: isActive ? "#fff" : "#444746",
                background: isActive ? "#0176d3" : "#ecebea",
                border: "none",
                borderRadius: i === 0 ? "6px 0 0 6px" : i === TABS.length - 1 ? "0 6px 6px 0" : "0",
                cursor: "pointer",
                whiteSpace: "nowrap",
                transition: "background .15s, color .15s",
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* ── filter section ── */}
      <div style={{ margin: "16px 24px", padding: "16px", background: "#f9f9f9", border: "1px solid #ecebea", borderRadius: 8 }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 12, alignItems: "flex-end" }}>
          {cfg.filters.map((f) => (
            <div key={f.label} style={{ display: "flex", flexDirection: "column", gap: 4 }}>
              <label style={{ fontSize: 11, fontWeight: 600, color: "#444746", textTransform: "uppercase" as const, letterSpacing: 0.3 }}>
                {f.label}
              </label>
              {f.type === "select" ? (
                <select
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                >
                  {f.options?.map((o) => (
                    <option key={o}>{o}</option>
                  ))}
                </select>
              ) : f.type === "date" ? (
                <input
                  type={f.type}
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
              ) : (
                <input
                  type="text"
                  placeholder={`Enter ${f.label}`}
                  style={{
                    width: f.width || "140px",
                    height: 34,
                    padding: "0 8px",
                    fontSize: 13,
                    color: "#001526",
                    background: "#fff",
                    border: "1px solid #d8d8d8",
                    borderRadius: 6,
                    outline: "none",
                  }}
                />
              )}
            </div>
          ))}
        </div>

        {/* ── action buttons ── */}
        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          <button
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              padding: "7px 18px",
              fontSize: 13,
              fontWeight: 500,
              color: "#444746",
              background: "#fff",
              border: "1px solid #d8d8d8",
              borderRadius: 6,
              cursor: "pointer",
            }}
          >
            <Download size={14} /> Download
          </button>
        </div>
      </div>

      {/* ── data table ── */}
      <div style={{ margin: "0 24px 24px", overflowX: "auto" }}>
        {cfg.data.length === 0 ? (
          <div style={{ padding: "40px 0", textAlign: "center", fontSize: 14, color: "#444746", background: "#f9f9f9", borderRadius: 8, border: "1px solid #ecebea" }}>
            No data available
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13, color: "#001526" }}>
            <thead>
              <tr>
                {cfg.columns.map((col) => (
                  <th
                    key={col.key}
                    style={{
                      padding: "10px 12px",
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#444746",
                      textTransform: "uppercase" as const,
                      letterSpacing: 0.3,
                      background: "#f9f9f9",
                      border: "1px solid #ecebea",
                      textAlign: col.align === "right" ? "right" : "left",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {pagedData.map((row, ri) => (
                <tr
                  key={ri}
                  style={{
                    background: ri % 2 === 1 ? "#fafafa" : "#fff",
                  }}
                >
                  {cfg.columns.map((col) => (
                    <td
                      key={col.key}
                      style={{
                        padding: "8px 12px",
                        border: "1px solid #ecebea",
                        textAlign: col.align === "right" ? "right" : "left",
                        whiteSpace: "nowrap",
                      }}
                    >
                      {col.render ? col.render(row[col.key], row) : row[col.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* ── pagination ── */}
        {totalPages > 1 && (
          <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 12, padding: "16px 0" }}>
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 500,
                color: page <= 1 ? "#d8d8d8" : "#444746", background: "#fff",
                border: "1px solid #d8d8d8", borderRadius: 6, cursor: page <= 1 ? "default" : "pointer",
              }}
            >Prev</button>
            <span style={{ fontSize: 12, color: "#444746" }}>Page {page} of {totalPages}</span>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              style={{
                padding: "6px 14px", fontSize: 12, fontWeight: 500,
                color: page >= totalPages ? "#d8d8d8" : "#444746", background: "#fff",
                border: "1px solid #d8d8d8", borderRadius: 6, cursor: page >= totalPages ? "default" : "pointer",
              }}
            >Next</button>
          </div>
        )}
      </div>
    </div>
  );
}
