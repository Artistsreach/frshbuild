import "server-only";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const serviceAccount = process.env.FIREBASE_SERVICE_ACCOUNT_KEY;
    
    if (!serviceAccount) {
      return NextResponse.json({ 
        error: "FIREBASE_SERVICE_ACCOUNT_KEY environment variable is missing",
        status: "missing"
      }, { status: 500 });
    }

    try {
      const serviceAccountJson = JSON.parse(serviceAccount);
      
      return NextResponse.json({ 
        success: true,
        projectId: serviceAccountJson.project_id,
        clientEmail: serviceAccountJson.client_email,
        status: "configured"
      });
    } catch (parseError) {
      return NextResponse.json({ 
        error: "FIREBASE_SERVICE_ACCOUNT_KEY is not valid JSON",
        status: "invalid_json"
      }, { status: 500 });
    }
  } catch (error) {
    return NextResponse.json({ 
      error: "Unknown error checking Firebase configuration",
      status: "error"
    }, { status: 500 });
  }
}
