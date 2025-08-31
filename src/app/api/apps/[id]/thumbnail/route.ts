import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/actions/get-app";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const app = await getApp(id);

    if (!app) {
      return NextResponse.json(
        { error: "App not found" },
        { status: 404 }
      );
    }

    // Return thumbnail data or generate one
    return NextResponse.json({
      thumbnail: app.info?.thumbnail || null,
    });

  } catch (error) {
    console.error("Error in thumbnail API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
