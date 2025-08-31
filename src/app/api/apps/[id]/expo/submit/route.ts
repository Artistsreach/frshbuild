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

    // TODO: Implement Expo submit logic
    return NextResponse.json({
      submissionId: "mock-submission-id",
      status: "submitted",
    });

  } catch (error) {
    console.error("Error in expo submit API route:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
