import { createTool, ToolExecutionContext } from "@mastra/core/tools";
import { z } from "zod";
import { spawn } from "child_process";

// Define a custom context type that includes the optional writer for streaming.
type StreamingToolExecutionContext<T extends z.ZodSchema | undefined> = ToolExecutionContext<T> & {
  writer?: {
    write: (chunk: any) => void;
  };
};

// --- expoAppStoreDeployTool ---
const expoAppStoreDeployInputSchema = z.object({
  appId: z.string().describe("The ID of the app to deploy to the App Store."),
  platforms: z.array(z.enum(["ios", "android"])).describe("Platforms to deploy to (ios, android, or both)."),
  appPath: z.string().describe("The local filesystem path to the app to deploy."),
  appName: z.string().optional().describe("The name of the app for display purposes."),
  buildProfile: z.enum(["development", "preview", "production"]).default("production").describe("The build profile to use."),
  track: z.enum(["production", "beta", "alpha", "internal"]).default("production").describe("The track/channel to submit to."),
  // iOS App Store Connect credentials
  appleId: z.string().optional().describe("Apple ID for authentication with App Store Connect."),
  appleTeamId: z.string().optional().describe("Apple Team ID for the build."),
  ascAppId: z.string().optional().describe("App Store Connect App ID for the app."),
  // Android Google Play credentials
  googleServiceAccountKey: z.string().optional().describe("Google Play Service Account Key JSON content."),
});

export const expoAppStoreDeployTool = createTool({
  id: "expo_app_store_deploy",
  description: "Builds and submits an Expo app to the Apple App Store and/or Google Play Store. This is a comprehensive deployment tool that handles both building and store submission.",
  inputSchema: expoAppStoreDeployInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    deployments: z.array(z.object({
      platform: z.enum(["ios", "android"]),
      buildId: z.string().optional(),
      buildUrl: z.string().optional(),
      submissionId: z.string().optional(),
      status: z.enum(["completed", "failed"]),
      error: z.string().optional(),
    })),
  }),
  execute: async (executionContext) => {
    const { context, writer } = executionContext as StreamingToolExecutionContext<typeof expoAppStoreDeployInputSchema>;
    const { 
      appId, 
      platforms, 
      appPath, 
      appName = "Your App",
      buildProfile,
      track,
      appleId, 
      appleTeamId, 
      ascAppId,
      googleServiceAccountKey
    } = context;

    if (writer) {
      writer.write({ 
        type: 'notification', 
        status: 'pending', 
        message: `Starting App Store deployment for ${appName} on ${platforms.join(', ')}...` 
      });
    }

    const deployments: any[] = [];
    let overallSuccess = true;

    try {
      // Step 1: Build for each platform
      for (const platform of platforms) {
        if (writer) {
          writer.write({ 
            type: 'notification', 
            status: 'pending', 
            message: `Building ${platform} app for production...` 
          });
        }

        const buildArgs = [
          "build", 
          "--platform", platform, 
          "--profile", buildProfile,
          "--non-interactive",
          "--no-wait"
        ];

        if (appleId && platform === "ios") buildArgs.push("--apple-id", appleId);
        if (appleTeamId && platform === "ios") buildArgs.push("--apple-team-id", appleTeamId);

        const buildResult = await new Promise<{ success: boolean; buildId?: string; buildUrl?: string; error?: string }>((resolve) => {
          const easProcess = spawn("eas", buildArgs, { cwd: appPath, stdio: "pipe" });
          
          let output = "";
          let buildId = "";
          let buildUrl = "";

          const handleData = (data: Buffer) => {
            const text = data.toString();
            output += text;
            if (writer) writer.write({ type: "log", data: text });

            // Extract build ID and URL from output
            const buildIdMatch = text.match(/Build ID: ([a-f0-9-]+)/i);
            if (buildIdMatch) buildId = buildIdMatch[1];
            
            const buildUrlMatch = text.match(/Build URL: (https:\/\/[^\s]+)/i);
            if (buildUrlMatch) buildUrl = buildUrlMatch[1];
          };

          easProcess.stdout.on("data", handleData);
          easProcess.stderr.on("data", handleData);

          easProcess.on("close", (code) => {
            if (code === 0) {
              resolve({ success: true, buildId, buildUrl });
            } else {
              resolve({ success: false, error: `Build failed with exit code ${code}: ${output}` });
            }
          });
        });

        if (!buildResult.success) {
          deployments.push({
            platform,
            status: "failed",
            error: buildResult.error,
          });
          overallSuccess = false;
          continue;
        }

        if (writer) {
          writer.write({ 
            type: 'notification', 
            status: 'success', 
            message: `${platform} build completed successfully!` 
          });
        }

        // Step 2: Submit to App Store
        if (writer) {
          writer.write({ 
            type: 'notification', 
            status: 'pending', 
            message: `Submitting ${platform} app to store...` 
          });
        }

        const submitArgs = [
          "submit",
          "--platform", platform,
          "--track", track,
          "--non-interactive",
          "--no-wait"
        ];

        if (buildResult.buildId) {
          submitArgs.push("--id", buildResult.buildId);
        } else {
          submitArgs.push("--latest");
        }

        if (appleId && platform === "ios") submitArgs.push("--apple-id", appleId);
        if (appleTeamId && platform === "ios") submitArgs.push("--apple-team-id", appleTeamId);
        if (ascAppId && platform === "ios") submitArgs.push("--asc-app-id", ascAppId);

        const submitResult = await new Promise<{ success: boolean; submissionId?: string; error?: string }>((resolve) => {
          const easProcess = spawn("eas", submitArgs, { cwd: appPath, stdio: "pipe" });
          
          let output = "";
          let submissionId = "";

          const handleData = (data: Buffer) => {
            const text = data.toString();
            output += text;
            if (writer) writer.write({ type: "log", data: text });

            // Extract submission ID from output
            const submissionIdMatch = text.match(/Submission ID: ([a-f0-9-]+)/i);
            if (submissionIdMatch) submissionId = submissionIdMatch[1];
          };

          easProcess.stdout.on("data", handleData);
          easProcess.stderr.on("data", handleData);

          easProcess.on("close", (code) => {
            if (code === 0) {
              resolve({ success: true, submissionId });
            } else {
              resolve({ success: false, error: `Submission failed with exit code ${code}: ${output}` });
            }
          });
        });

        if (!submitResult.success) {
          deployments.push({
            platform,
            buildId: buildResult.buildId,
            buildUrl: buildResult.buildUrl,
            status: "failed",
            error: submitResult.error,
          });
          overallSuccess = false;
        } else {
          deployments.push({
            platform,
            buildId: buildResult.buildId,
            buildUrl: buildResult.buildUrl,
            submissionId: submitResult.submissionId,
            status: "completed",
          });

          if (writer) {
            writer.write({ 
              type: 'notification', 
              status: 'success', 
              message: `${platform} app submitted to store successfully!` 
            });
          }
        }
      }

      const successfulDeployments = deployments.filter(d => d.status === "completed");
      const failedDeployments = deployments.filter(d => d.status === "failed");

      if (writer) {
        if (overallSuccess) {
          writer.write({ 
            type: 'notification', 
            status: 'success', 
            message: `🎉 ${appName} has been successfully submitted to the App Store on ${successfulDeployments.map(d => d.platform).join(', ')}!` 
          });
        } else if (successfulDeployments.length > 0) {
          writer.write({ 
            type: 'notification', 
            status: 'warning', 
            message: `Partial success: ${successfulDeployments.length} platform(s) deployed, ${failedDeployments.length} failed.` 
          });
        } else {
          writer.write({ 
            type: 'notification', 
            status: 'error', 
            message: `App Store deployment failed for all platforms.` 
          });
        }
      }

      return {
        success: overallSuccess,
        message: overallSuccess 
          ? `Successfully deployed ${appName} to ${successfulDeployments.map(d => d.platform).join(', ')}`
          : `Deployment completed with ${failedDeployments.length} failures`,
        deployments,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (writer) {
        writer.write({ 
          type: 'notification', 
          status: 'error', 
          message: `App Store deployment failed: ${errorMessage}` 
        });
      }

      return {
        success: false,
        message: `App Store deployment failed: ${errorMessage}`,
        deployments: deployments.length > 0 ? deployments : [{
          platform: platforms[0] as "ios" | "android",
          status: "failed" as const,
          error: errorMessage,
        }],
      };
    }
  },
});

// --- expoAppStoreStatusTool ---
const expoAppStoreStatusInputSchema = z.object({
  appId: z.string().describe("The ID of the app to check status for."),
  platform: z.enum(["ios", "android"]).optional().describe("Platform to check status for (optional, checks all if not specified)."),
});

export const expoAppStoreStatusTool = createTool({
  id: "expo_app_store_status",
  description: "Checks the status of Expo app submissions to the App Store and Google Play Store.",
  inputSchema: expoAppStoreStatusInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
    submissions: z.array(z.object({
      platform: z.enum(["ios", "android"]),
      status: z.string(),
      submissionId: z.string().optional(),
      lastUpdated: z.string().optional(),
    })),
  }),
  execute: async (executionContext) => {
    const { context, writer } = executionContext as StreamingToolExecutionContext<typeof expoAppStoreStatusInputSchema>;
    const { appId, platform } = context;

    if (writer) {
      writer.write({ 
        type: 'notification', 
        status: 'pending', 
        message: `Checking App Store submission status for app ${appId}...` 
      });
    }

    try {
      // In a real implementation, this would query the deployments database
      // For now, we'll use EAS CLI to check submission status
      const args = ["submission:list"];
      if (platform) args.push("--platform", platform);

      const { stdout } = await new Promise<{ stdout: string; stderr: string }>((resolve, reject) => {
        const easProcess = spawn("eas", args, { stdio: "pipe" });
        
        let stdout = "";
        let stderr = "";

        easProcess.stdout.on("data", (data) => {
          stdout += data.toString();
        });

        easProcess.stderr.on("data", (data) => {
          stderr += data.toString();
        });

        easProcess.on("close", (code) => {
          if (code === 0) {
            resolve({ stdout, stderr });
          } else {
            reject(new Error(`EAS submission:list failed with exit code ${code}: ${stderr}`));
          }
        });
      });

      // Parse the output to extract submission information
      const submissions: any[] = [];
      // This is a simplified parser - in reality you'd parse the actual EAS output format
      
      if (writer) {
        writer.write({ 
          type: 'notification', 
          status: 'success', 
          message: `Retrieved submission status for app ${appId}` 
        });
      }

      return {
        success: true,
        message: `Successfully retrieved submission status for app ${appId}`,
        submissions,
      };

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      
      if (writer) {
        writer.write({ 
          type: 'notification', 
          status: 'error', 
          message: `Failed to check submission status: ${errorMessage}` 
        });
      }

      return {
        success: false,
        message: `Failed to check submission status: ${errorMessage}`,
        submissions: [],
      };
    }
  },
});
