// CSV Export/Import Utilities for Master Data
// Shared across all master data pages

export interface CsvColumn {
  key: string;
  header: string;
  required?: boolean;
}

// ── Column Definitions ──

export const sparepartColumns: CsvColumn[] = [
  { key: "sku", header: "SKU", required: true },
  { key: "code", header: "Product Code" },
  { key: "name", header: "Name", required: true },
  { key: "brand", header: "Brand" },
  { key: "category", header: "Category" },
  { key: "stockQty", header: "Stock Qty" },
  { key: "minStock", header: "Min Stock" },
  { key: "sellPrice", header: "Sell Price" },
  { key: "supplierName", header: "Supplier" },
];

export const customerColumns: CsvColumn[] = [
  { key: "name", header: "Name", required: true },
  { key: "phone", header: "Phone" },
  { key: "type", header: "Type" },
  { key: "address", header: "Address" },
];

export const vehicleColumns: CsvColumn[] = [
  { key: "plateNo", header: "Plate No", required: true },
  { key: "brand", header: "Brand", required: true },
  { key: "model", header: "Model" },
  { key: "year", header: "Year" },
  { key: "color", header: "Color" },
  { key: "customerName", header: "Customer Name" },
];

export const supplierColumns: CsvColumn[] = [
  { key: "companyName", header: "Company Name", required: true },
  { key: "contactPerson", header: "Contact Person" },
  { key: "phone", header: "Phone" },
  { key: "email", header: "Email" },
  { key: "address", header: "Address" },
];

export const serviceColumns: CsvColumn[] = [
  { key: "sku", header: "SKU", required: true },
  { key: "name", header: "Name", required: true },
  { key: "description", header: "Description" },
  { key: "estDuration", header: "Duration" },
  { key: "standardPrice", header: "Price" },
  { key: "category", header: "Tax" },
];

export const servicePackageColumns: CsvColumn[] = [
  { key: "sku", header: "SKU", required: true },
  { key: "name", header: "Name", required: true },
  { key: "description", header: "Description" },
  { key: "estDuration", header: "Duration" },
  { key: "price", header: "Price" },
];

// ── Export Function ──

export function exportToCsv(data: any[], columns: CsvColumn[], filename: string): void {
  const headers = columns.map((c) => c.header);
  const rows = data.map((item) =>
    columns.map((col) => {
      let val = item[col.key];
      if (val === null || val === undefined) val = "";
      // Escape quotes and wrap in quotes if contains comma/newline/quote
      val = String(val);
      if (val.includes(",") || val.includes("\n") || val.includes('"')) {
        val = `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    })
  );

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ── Import Functions ──

export interface ParseResult {
  headers: string[];
  rows: Record<string, string>[];
  error?: string;
}

export function parseCsv(file: File): Promise<ParseResult> {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) {
        resolve({ headers: [], rows: [], error: "File is empty" });
        return;
      }

      const lines = text.split(/\r?\n/).filter((l) => l.trim());
      if (lines.length < 2) {
        resolve({ headers: [], rows: [], error: "CSV must have at least a header row and one data row" });
        return;
      }

      const headers = parseCsvLine(lines[0]);
      const rows: Record<string, string>[] = [];

      for (let i = 1; i < lines.length; i++) {
        const values = parseCsvLine(lines[i]);
        if (values.length === 0) continue;
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => {
          row[h.trim()] = (values[idx] || "").trim();
        });
        rows.push(row);
      }

      resolve({ headers: headers.map((h) => h.trim()), rows });
    };
    reader.onerror = () => resolve({ headers: [], rows: [], error: "Failed to read file" });
    reader.readAsText(file);
  });
}

function parseCsvLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (inQuotes) {
      if (ch === '"') {
        if (i + 1 < line.length && line[i + 1] === '"') {
          current += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        current += ch;
      }
    } else {
      if (ch === '"') {
        inQuotes = true;
      } else if (ch === ",") {
        result.push(current);
        current = "";
      } else {
        current += ch;
      }
    }
  }
  result.push(current);
  return result;
}

// ── Validation ──

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
      skipped.push({ row: idx + 2, reason: `Missing required: ${missing.map((m) => m.header).join(", ")}` });
    } else {
      valid.push(row);
    }
  });

  return { valid, skipped };
}

// ── Map CSV headers to API field names ──

export function mapRowToApi(row: Record<string, string>, columns: CsvColumn[]): Record<string, any> {
  const mapped: Record<string, any> = {};
  columns.forEach((col) => {
    const val = row[col.header];
    if (val !== undefined && val.trim() !== "") {
      // Convert numeric fields
      if (["stockQty", "minStock", "sellPrice", "buyPrice", "standardPrice", "price", "estDuration", "year"].includes(col.key)) {
        const num = parseFloat(val);
        if (!isNaN(num)) mapped[col.key] = num;
      } else {
        mapped[col.key] = val.trim();
      }
    }
  });
  return mapped;
}

// ── Filename helper ──

export function makeFilename(entity: string): string {
  const date = new Date().toISOString().split("T")[0];
  return `${entity}_${date}.csv`;
}

// ── Download template CSV with headers only ──

export function downloadTemplate(columns: CsvColumn[], entityName: string) {
  const headers = columns.map(c => c.header).join(",");
  const exampleRow = columns.map(c => {
    if (c.key.includes("price") || c.key.includes("Price") || c.key.includes("Qty") || c.key.includes("Stock") || c.key.includes("stock") || c.key === "year") return "0";
    if (c.key === "phone") return "08123456789";
    if (c.key === "email") return "email@example.com";
    return "";
  }).join(",");
  const csv = "\uFEFF" + headers + "\n" + exampleRow;
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `template_${entityName}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}
