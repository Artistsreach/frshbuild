import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { appsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const { dataUrl } = await req.json();

    if (!dataUrl || typeof dataUrl !== "string" || !dataUrl.startsWith("data:image/")) {
      return NextResponse.json({ error: "Invalid image" }, { status: 400 });
    }

    await db.update(appsTable).set({ thumbnail: dataUrl }).where(eq(appsTable.id, id));

    return NextResponse.json({ success: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Server error" }, { status: 500 });
  }
}


