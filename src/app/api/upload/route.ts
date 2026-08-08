import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { withAuth, getCurrentUser } from "@/lib/auth-helpers";
import { writeFile, mkdir } from "fs/promises";
import path from "path";

export const POST = withAuth(async (req: NextRequest) => {
  const user = (await getCurrentUser()) as any;
  const { searchParams } = new URL(req.url);
  const entity = searchParams.get("entity") || "wo"; // wo | journal

  const formData = await req.formData();
  const file = formData.get("file") as File | null;
  const description = (formData.get("description") as string) || "";

  if (!file) {
    return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
  }

  const allowedTypes = ["image/", "application/pdf"];
  const isAllowed = allowedTypes.some((t) => file.type.startsWith(t));
  if (!isAllowed) {
    return NextResponse.json({ error: "Only images and PDFs are allowed" }, { status: 400 });
  }

  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json({ error: "File too large (max 10MB)" }, { status: 400 });
  }

  const uploadDir = path.join(process.cwd(), "public", "uploads", entity);
  await mkdir(uploadDir, { recursive: true });

  const ext = file.name.split(".").pop() || (file.type.startsWith("image/") ? "jpg" : "pdf");
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
  const filepath = path.join(uploadDir, filename);

  const bytes = await file.arrayBuffer();
  await writeFile(filepath, Buffer.from(bytes));

  const url = `/uploads/${entity}/${filename}`;

  // Optional: save to DB for journal attachments too
  if (entity === "wo") {
    const woId = searchParams.get("woId");
    if (woId) {
      await prisma.photo.create({
        data: {
          woId,
          url,
          description: description || "Foto",
          uploadedBy: user.name,
        },
      });
    }
  }

  return NextResponse.json({ url });
});
