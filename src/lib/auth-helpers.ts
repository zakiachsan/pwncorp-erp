import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { NextResponse } from "next/server";

export async function getSession() {
  return getServerSession(authOptions);
}

export async function getCurrentUser() {
  const session = await getSession();
  return session?.user ?? null;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireRole(...roles: string[]) {
  const user = await requireAuth();
  const userRole = (user as any).role;
  if (!roles.includes(userRole)) {
    throw new Error("Forbidden: insufficient permissions");
  }
  return user;
}

type ApiHandler = (req: Request, context: any) => Promise<Response>;

export function withAuth(handler: ApiHandler): ApiHandler {
  return async (req, context) => {
    try {
      await requireAuth();
      return handler(req, context);
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message || "Unauthorized" },
        { status: err.message === "Unauthorized" ? 401 : 403 }
      );
    }
  };
}
