import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/actions/get-app";

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const { searchParams } = new URL(request.url);
    const limit = searchParams.get("limit") || "10";

    const app = await getApp(id);

    if (!app) {
      return NextResponse.json(
        { error: "App not found" },
        { status: 404 }
      );
    }

    // Return deployment history
    return NextResponse.json({
      deployments: [], // TODO: Implement deployment history
      limit: parseInt(limit),
    });

  } catch (error) {
    console.error("Error in deployments API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
