"use client";

interface PaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  label?: string;
}

export default function Pagination({ page, totalPages, total, pageSize, onPageChange, label = "item" }: PaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * pageSize + 1;
  const end = Math.min(page * pageSize, total);

  return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 4px", fontSize: 13, color: "#444746" }}>
      <span>
        Menampilkan <strong>{start}</strong>–<strong>{end}</strong> dari <strong>{total}</strong> {label}
      </span>
      <div style={{ display: "flex", gap: 6, alignItems: "center" }}>
        <button
          className="btn btn--sm"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          style={{ opacity: page <= 1 ? 0.5 : 1, cursor: page <= 1 ? "not-allowed" : "pointer" }}
        >
          ‹ Prev
        </button>
        <span>
          Hal {page} / {totalPages || 1}
        </span>
        <button
          className="btn btn--sm"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          style={{ opacity: page >= totalPages ? 0.5 : 1, cursor: page >= totalPages ? "not-allowed" : "pointer" }}
        >
          Next ›
        </button>
      </div>
    </div>
  );
}
