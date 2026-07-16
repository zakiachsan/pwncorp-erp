export function formatCurrency(n: number): string {
  return "Rp " + n.toLocaleString("id-ID");
}

export function apiPaginate<T>(items: T[], page: number, perPage: number = 20) {
  const total = items.length;
  const totalPages = Math.ceil(total / perPage);
  const data = items.slice((page - 1) * perPage, page * perPage);
  return { data, pagination: { page, perPage, total, totalPages } };
}

export function apiError(message: string, status: number = 400) {
  return Response.json({ error: message }, { status });
}

export function apiSuccess<T>(data: T, meta?: object) {
  return Response.json({ data, ...meta }, { status: 200 });
}
