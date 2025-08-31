import { NextRequest, NextResponse } from "next/server";
import { getApp } from "@/actions/get-app";

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    const body = await request.json();

    const app = await getApp(id);

    if (!app) {
      return NextResponse.json(
        { error: "App not found" },
        { status: 404 }
      );
    }

    // TODO: Implement Expo build logic
    return NextResponse.json({
      buildId: "mock-build-id",
      status: "building",
    });

  } catch (error) {
    console.error("Error in expo build API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
