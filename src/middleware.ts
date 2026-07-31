import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";

// Map route prefixes to permission keys
const routePermissionMap: Record<string, string> = {
  "/dashboard": "dashboard",
  "/service-orders": "service-orders",
  "/work-orders": "work-orders",
  "/finance/invoices/service": "service-invoices",
  "/stock-workflow": "stock-workflow",
  "/warehouse": "warehouse",
  "/master-data/sparepart": "spareparts",
  "/master-data/customers": "customers",
  "/master-data/vehicles": "vehicles",
  "/master-data/suppliers": "suppliers",
  "/master-data/services": "services",
  "/master-data/users": "users",
  "/service-packages": "package-services",
  "/project": "projects",
  "/reports": "reports",
  "/finance/reports/ap": "account-payables",
  "/finance/reports": "account-payables",
};

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });

  // Not logged in → redirect to login
  if (!token) {
    const signInUrl = new URL("/", request.url);
    signInUrl.searchParams.set("callbackUrl", request.url);
    return NextResponse.redirect(signInUrl);
  }

  const permissions: string[] = (token as any).permissions || [];

  // No permissions array = full access (Owner/Admin)
  if (permissions.length === 0) {
    return NextResponse.next();
  }

  const pathname = request.nextUrl.pathname;

  // Find which permission this route needs
  for (const [prefix, permission] of Object.entries(routePermissionMap)) {
    if (pathname.startsWith(prefix)) {
      if (!permissions.includes(permission)) {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }
  }

  // Unknown route → allow
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/service-orders/:path*",
    "/work-orders/:path*",
    "/stock-workflow/:path*",
    "/warehouse/:path*",
    "/master-data/:path*",
    "/service-packages/:path*",
    "/project/:path*",
    "/reports/:path*",
    "/finance/:path*",
  ],
};
