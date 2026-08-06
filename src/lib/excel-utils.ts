// Excel Export/Import Utilities (SheetJS 0.20.x)
// Support: .xlsx (default), .xls, .csv — export & import

import * as XLSX from "xlsx";

// ── Shared Types ──

export interface CsvColumn {
  key: string;
  header: string;
  required?: boolean;
}

export type ExportFormat = "xlsx" | "xls" | "csv";

// ── EXPORT: from rendered DOM table ──
// Export the visible table (already filtered & formatted) to Excel/CSV.
// Skips columns whose header looks like an action column ("Aksi"/"Action").

const ACTION_HEADERS = /aksi|action|^edit$|hapus|delete/i;

export function exportTableToExcel(
  table: HTMLTableElement | null,
  filename: string,
  format: ExportFormat = "xlsx"
): void {
  if (!table) return;
  const headCells = Array.from(table.querySelectorAll("thead th"));
  const bodyRows = Array.from(table.querySelectorAll("tbody tr"));

  // Find index of action columns (by header) and drop them
  const skipIdx = new Set<number>();
  headCells.forEach((th, i) => {
    const txt = (th.textContent || "").trim();
    if (ACTION_HEADERS.test(txt)) skipIdx.add(i);
  });

  const headers = headCells
    .map((th, i) => (th.textContent || "").trim())
    .filter((_, i) => !skipIdx.has(i));

  const rows: string[][] = bodyRows.map((tr) =>
    Array.from(tr.querySelectorAll("td"))
      .map((td, i) => (skipIdx.has(i) ? "" : (td.textContent || "").trim()))
      .filter((v) => v !== "")
  );

  writeWorkbook([{ name: "Data", headers, rows }], filename, format);
}

// ── EXPORT: from array data (fallback for paginated tables) ──

export interface ExportColumn {
  key: string;
  header: string;
  format?: "currency" | "number" | "date";
}

export function exportDataToExcel(
  data: any[],
  columns: ExportColumn[],
  filename: string,
  format: ExportFormat = "xlsx"
): void {
  const headers = columns.map((c) => c.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      let val = item[col.key];
      if (val === null || val === undefined) val = "";
      if (col.format === "currency" && typeof val === "number") return val;
      if (col.format === "number" && typeof val === "number") return val;
      if (col.format === "date" && val) {
        const d = new Date(val);
        return isNaN(d.getTime()) ? val : d;
      }
      return String(val);
    })
  );
  writeWorkbook([{ name: "Data", headers, rows }], filename, format);
}

// ── Internal: write workbook to file ──

interface SheetData {
  name: string;
  headers: string[];
  rows: (string | number | Date)[][];
}

function writeWorkbook(sheets: SheetData[], filename: string, format: ExportFormat): void {
  const wb = XLSX.utils.book_new();
  for (const s of sheets) {
    const ws = XLSX.utils.aoa_to_sheet([s.headers, ...s.rows]);
    // Auto column width
    const cols = s.headers.map((h, i) => {
      const maxLen = Math.max(
        h.length,
        ...s.rows.map((r) => String(r[i] ?? "").length)
      );
      return { wch: Math.min(Math.max(maxLen + 2, 8), 40) };
    });
    ws["!cols"] = cols;
    XLSX.utils.book_append_sheet(wb, ws, s.name.slice(0, 31));
  }

  if (format === "csv") {
    const ws = wb.Sheets[wb.SheetNames[0]];
    const csv = XLSX.utils.sheet_to_csv(ws);
    const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
    downloadBlob(blob, filename.endsWith(".csv") ? filename : filename + ".csv");
    return;
  }

  const ext = format === "xls" ? "xls" : "xlsx";
  const out = XLSX.write(wb, { bookType: format, type: "array" });
  const blob = new Blob([out], {
    type: format === "xls" ? "application/vnd.ms-excel" : "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
  downloadBlob(blob, filename.endsWith("." + ext) ? filename : filename + "." + ext);
}

function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// ── IMPORT: parse .csv / .xls / .xlsx ──

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  error?: string;
}

export function parseExcelFile(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const ext = file.name.split(".").pop()?.toLowerCase() || "";
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        if (!data) {
          resolve({ headers: [], rows: [], error: "File is empty" });
          return;
        }

        let wb: XLSX.WorkBook;
        if (ext === "csv" || ext === "txt") {
          const text = typeof data === "string" ? data : new TextDecoder().decode(data as ArrayBuffer);
          wb = XLSX.read(text, { type: "string" });
        } else {
          wb = XLSX.read(data as ArrayBuffer, { type: "array" });
        }

        const ws = wb.Sheets[wb.SheetNames[0]];
        if (!ws) {
          resolve({ headers: [], rows: [], error: "File tidak memiliki sheet" });
          return;
        }

        const json = XLSX.utils.sheet_to_json<Record<string, any>>(ws, { defval: "" });
        if (json.length === 0) {
          resolve({ headers: [], rows: [], error: "File kosong / tidak ada data" });
          return;
        }

        const headers = Object.keys(json[0]);
        const rows = json.map((r) => {
          const out: Record<string, string> = {};
          headers.forEach((h) => {
            const v = r[h];
            out[h] = v === null || v === undefined ? "" : String(v).trim();
          });
          return out;
        });

        resolve({ headers, rows });
      } catch (err) {
        resolve({ headers: [], rows: [], error: "Gagal membaca file: " + (err as Error).message });
      }
    };

    reader.onerror = () => resolve({ headers: [], rows: [], error: "Gagal membaca file" });

    if (ext === "csv" || ext === "txt") reader.readAsText(file);
    else reader.readAsArrayBuffer(file);
  });
}

// ── IMPORT: validation & mapping (reuse existing patterns) ──

export interface ValidationResult {
  valid: Record<string, string>[];
  skipped: { row: number; reason: string }[];
}

export function validateRows(rows: Record<string, string>[], columns: CsvColumn[]): ValidationResult {
  const valid: Record<string, string>[] = [];
  const skipped: { row: number; reason: string }[] = [];
  const requiredCols = columns.filter((c) => c.required);

  rows.forEach((row, idx) => {
    const missing = requiredCols.filter((c) => !row[c.header] || row[c.header].trim() === "");
    if (missing.length > 0) {
      skipped.push({ row: idx + 2, reason: `Kolom wajib kosong: ${missing.map((m) => m.header).join(", ")}` });
    } else {
      valid.push(row);
    }
  });

  return { valid, skipped };
}

export function mapRowToApi(row: Record<string, string>, columns: CsvColumn[]): Record<string, any> {
  const mapped: Record<string, any> = {};
  columns.forEach((col) => {
    const val = row[col.header];
    if (val !== undefined && val.trim() !== "") {
      if (
        ["stockQty", "minStock", "sellPrice", "buyPrice", "standardPrice", "price", "estDuration", "year", "konversi", "harga"].includes(col.key)
      ) {
        const num = parseFloat(val);
        if (!isNaN(num)) mapped[col.key] = num;
      } else {
        mapped[col.key] = val.trim();
      }
    }
  });
  return mapped;
}

// ── TEMPLATE download (multi-format) ──

export function downloadTemplate(columns: CsvColumn[], entityName: string, format: ExportFormat = "xlsx"): void {
  const headers = columns.map((c) => c.header);
  const exampleRow = columns.map((c) => {
    if (c.key.includes("price") || c.key.includes("Price") || c.key.includes("Qty") || c.key.includes("Stock") || c.key.includes("stock") || c.key === "year" || c.key === "harga" || c.key === "konversi") return 0;
    if (c.key === "phone") return "08123456789";
    if (c.key === "email") return "email@example.com";
    return "";
  });
  writeWorkbook([{ name: "Template", headers, rows: [exampleRow] }], `template_${entityName}`, format);
}

// ── Filename helper ──

export function makeFilename(entity: string, format: ExportFormat = "xlsx"): string {
  const date = new Date().toISOString().split("T")[0];
  return `${entity}_${date}.${format}`;
}
