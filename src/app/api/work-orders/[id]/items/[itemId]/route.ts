import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { logActivity } from "@/lib/activity-log";

// PATCH /api/work-orders/[id]/items/[itemId]
// Body: { progress: "pending" | "in_progress" | "completed" }
export const PATCH = withAuth(
  async (
    req: NextRequest,
    { params }: { params: { id: string; itemId: string } }
  ) => {
    const user = (await getCurrentUser()) as any;
    const body = await req.json();
    const { progress } = body;

    const VALID = ["pending", "in_progress", "completed"];
    if (!VALID.includes(progress)) {
      return NextResponse.json(
        { error: `progress must be one of ${VALID.join(", ")}` },
        { status: 400 }
      );
    }

    // Verify WO belongs to user's store
    const wo = await prisma.workOrder.findUnique({
      where: { id: params.id },
      select: { id: true, storeId: true, woNo: true },
    });
    if (!wo) {
      return NextResponse.json({ error: "Work order not found" }, { status: 404 });
    }
    if (wo.storeId !== user.storeId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Verify item belongs to this WO
    const item = await prisma.wOItem.findUnique({
      where: { id: params.itemId },
      select: { id: true, woId: true, itemName: true, progress: true },
    });
    if (!item || item.woId !== params.id) {
      return NextResponse.json({ error: "Item not found in this WO" }, { status: 404 });
    }

    // Compute update payload based on transition
    const now = new Date();
    const updateData: any = { progress };
    if (progress === "in_progress") {
      updateData.startedAt = now;
    } else if (progress === "completed") {
      updateData.completedAt = now;
      // Keep startedAt as audit if already set; otherwise stamp it now
      if (!item.progress || item.progress === "pending") {
        updateData.startedAt = now;
      }
    } else {
      // pending — full reset
      updateData.startedAt = null;
      updateData.completedAt = null;
    }

    const updated = await prisma.wOItem.update({
      where: { id: params.itemId },
      data: updateData,
    });

    await logActivity({
      userId: user.id,
      action: "WO_ITEM_PROGRESS",
      entity: "WOItem",
      entityId: item.id,
      details: `WO ${wo.woNo} item "${item.itemName}": ${item.progress} → ${progress}`,
    });

    return NextResponse.json({ data: updated });
  }
);
