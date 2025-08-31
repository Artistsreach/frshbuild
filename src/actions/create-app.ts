"use server";

import { appsTable, appUsers } from "@/db/schema";
import { db } from "@/lib/db";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { freestyleHelpers } from "@/lib/freestyle";
import { getTemplate, templates } from "@/lib/templates";
import { builderAgent } from "@/mastra/agents/builder";

export interface CreateAppResult {
  success: boolean;
  appId?: string;
  gitRepo?: string;
  ephemeralUrl?: string;
  mcpEphemeralUrl?: string;
  error?: string;
}

export async function createApp({
  initialMessage,
  templateId,
  userId,
}: {
  initialMessage?: string;
  templateId: string;
  userId: string;
}): Promise<CreateAppResult> {
  try {
    // Step 1: Validate template and get user profile
    const template = getTemplate(templateId);
    if (!template) {
      return {
        success: false,
        error: `Template ${templateId} not found. Available templates: ${Object.keys(templates).join(", ")}`
      };
    }

    // Use Firebase Admin SDK for server-side operations
    const adminDb = getFirebaseAdminFirestore();
    if (!adminDb) {
      return {
        success: false,
        error: "Firebase Admin not available"
      };
    }
    
    const profileRef = adminDb.collection("profiles").doc(userId);
    const profileSnap = await profileRef.get();
    const profile = profileSnap.data();

    if (!profile) {
      return {
        success: false,
        error: "User profile not found"
      };
    }

    if (!profile.freestyleIdentity) {
      return {
        success: false,
        error: "User identity not found. Please refresh the page and try again."
      };
    }

    console.log("Creating app with template:", template.name);
    console.log("User freestyleIdentity:", profile.freestyleIdentity);

    // Step 2: Create Git repository
    console.log("Creating Git repository...");
    const repo = await freestyleHelpers.createRepository(
      initialMessage || `New ${template.name} App`,
      false, // Private by default
      template.repo
    );
    
    console.log("Repository created:", repo.repoId);
    
    // Step 3: Grant Git permissions
    await freestyleHelpers.grantPermission(
      profile.freestyleIdentity,
      repo.repoId,
      "write"
    );
    console.log("Git permission granted");

    // Step 4: Create Git access token
    const token = await freestyleHelpers.createAccessToken(profile.freestyleIdentity);
    console.log("Git access token created");

    // Step 5: Request dev server with template-specific configuration
    console.log("Requesting dev server...");
    const devServerResult = await freestyleHelpers.requestDevServer(repo.repoId, templateId);
    console.log("Dev server requested:", {
      ephemeralUrl: devServerResult.ephemeralUrl,
      mcpEphemeralUrl: devServerResult.mcpEphemeralUrl
    });

    // Step 6: Create app in database
    const app = await db.transaction(async (tx) => {
      const appInsertion = await tx
        .insert(appsTable)
        .values({
          gitRepo: repo.repoId,
          name: initialMessage || `New ${template.name} App`,
          is_public: false,
          is_recreatable: true, // Enable recreation by default
          baseId: templateId,
        })
        .returning();

      await tx
        .insert(appUsers)
        .values({
          appId: appInsertion[0].id,
          userId: userId,
          permissions: "admin",
          freestyleAccessToken: token.token,
          freestyleAccessTokenId: token.id,
          freestyleIdentity: profile.freestyleIdentity,
        })
        .returning();

      return appInsertion[0];
    });

    // Step 7: Initialize AI agent memory thread (if initial message provided)
    if (initialMessage && initialMessage.trim()) {
      try {
        console.log("Initializing AI agent memory thread...");
        const threadId = `app_${app.id}`;
        const resourceId = `user_${userId}`;
        
        // Create initial conversation with the AI agent
        const response = await builderAgent.generate(
          `I want to build an app with the following description: "${initialMessage}". 
           This is a ${template.name} application. Please help me understand what needs to be built and provide guidance on the next steps.`,
          {
            threadId,
            resourceId,
          }
        );
        
        console.log("AI agent initialized with response:", response.text);
      } catch (error) {
        console.error("Error initializing AI agent:", error);
        // Don't fail the app creation if AI agent fails
      }
    }

    console.log("App created successfully:", {
      appId: app.id,
      gitRepo: repo.repoId,
      template: template.name,
      initialMessage: initialMessage || "No initial message",
      ephemeralUrl: devServerResult.ephemeralUrl,
      mcpEphemeralUrl: devServerResult.mcpEphemeralUrl
    });

    return {
      success: true,
      appId: app.id,
      gitRepo: repo.repoId,
      ephemeralUrl: devServerResult.ephemeralUrl,
      mcpEphemeralUrl: devServerResult.mcpEphemeralUrl,
    };

  } catch (error) {
    console.error("Error creating app:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error occurred"
    };
  }
}
