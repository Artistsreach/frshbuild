import { NextResponse } from "next/server";
import { testConnection } from "@/lib/db";

export async function GET() {
  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    services: {
      database: "unknown",
      firebase: "unknown"
    }
  };

  try {
    // Test database connection
    const dbConnected = await testConnection();
    health.services.database = dbConnected ? "ok" : "error";
  } catch (error) {
    console.error("Database health check failed:", error);
    health.services.database = "error";
  }

  try {
    // Test Firebase Admin
    const { auth: getFirebaseAuth } = await import("@/lib/firebase-admin");
    const auth = getFirebaseAuth();
    health.services.firebase = auth ? "ok" : "error";
  } catch (error) {
    console.error("Firebase health check failed:", error);
    health.services.firebase = "error";
  }

  // Overall status
  const allServicesOk = Object.values(health.services).every(status => status === "ok");
  health.status = allServicesOk ? "ok" : "error";

  return NextResponse.json(health, {
    status: allServicesOk ? 200 : 503
  });
}
