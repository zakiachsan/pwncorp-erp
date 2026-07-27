import prisma from "@/lib/prisma";

interface LogActivityOpts {
  userId?: string | null;
  action: string;
  entity: string;
  entityId: string;
  details?: Record<string, any> | string;
}

export async function logActivity(opts: LogActivityOpts) {
  const { userId, action, entity, entityId, details } = opts;
  try {
    await prisma.activityLog.create({
      data: {
        userId: userId || null,
        action,
        entity,
        entityId,
        details: typeof details === "string" ? details : details ? JSON.stringify(details) : null,
      },
    });
  } catch (err) {
    // Don't let logging failures break the main operation
    console.error("[ActivityLog]", err);
  }
}
