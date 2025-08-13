import { createTool, ToolExecutionContext } from "@mastra/core/tools";
import { z } from "zod";
import { spawn } from "child_process";

// Define a custom context type that includes the optional writer for streaming.
type StreamingToolExecutionContext<T extends z.ZodSchema | undefined> = ToolExecutionContext<T> & {
  writer?: {
    write: (chunk: any) => void;
  };
};

// --- easLoginTool ---
const easLoginInputSchema = z.object({
  username: z.string().describe("The Expo account username."),
  password: z.string().describe("The Expo account password."),
});

export const easLoginTool = createTool({
  id: "eas_login",
  description: "Logs in to an Expo account non-interactively.",
  inputSchema: easLoginInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async (executionContext) => {
    const { context, writer } = executionContext as StreamingToolExecutionContext<typeof easLoginInputSchema>;
    const { username, password } = context;

    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Logging in to EAS as ${username}...` });
    }

    return new Promise((resolve, reject) => {
      const easProcess = spawn("eas", ["login", "-u", username, "-p", password, "--non-interactive"], {
        stdio: "pipe",
      });

      let output = "";
      easProcess.stdout.on("data", (data) => (output += data.toString()));
      easProcess.stderr.on("data", (data) => (output += data.toString()));

      easProcess.on("close", (code) => {
        if (code === 0) {
          if (writer) {
            writer.write({ type: 'notification', status: 'success', message: "EAS login successful." });
          }
          resolve({ success: true, message: `EAS login successful. Output: ${output}` });
        } else {
          if (writer) {
            writer.write({ type: 'notification', status: 'error', message: `EAS login failed. Exit code: ${code}` });
          }
          reject(new Error(`EAS login process exited with code ${code}. Output: ${output}`));
        }
      });
    });
  },
});


// --- easBuildTool (Re-implemented) ---
const easBuildInputSchema = z.object({
  platform: z.enum(["ios", "android", "all"]),
  profile: z.string().optional(),
  appPath: z.string().describe("The local filesystem path to the app to build."),
  appleId: z.string().optional().describe("Apple ID for authentication with App Store Connect."),
  appleTeamId: z.string().optional().describe("Apple Team ID for the build."),
});

export const easBuildTool = createTool({
  id: "eas_build",
  description: "Starts a new build for an Expo application using EAS. Streams logs in real-time.",
  inputSchema: easBuildInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async (executionContext) => {
    const { context, writer } = executionContext as StreamingToolExecutionContext<typeof easBuildInputSchema>;
    const { platform, profile, appPath, appleId, appleTeamId } = context;

    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Starting EAS build for ${platform}...` });
    }

    const args = ["build", "--platform", platform, "--non-interactive"];
    if (profile) args.push("--profile", profile);
    if (appleId) args.push("--apple-id", appleId);
    if (appleTeamId) args.push("--apple-team-id", appleTeamId);

    return new Promise((resolve, reject) => {
      const easProcess = spawn("eas", args, { cwd: appPath, stdio: "pipe" });

      const handleData = (data: Buffer) => {
        const output = data.toString();
        if (writer) writer.write({ type: "log", data: output });
      };

      easProcess.stdout.on("data", handleData);
      easProcess.stderr.on("data", handleData);

      easProcess.on("close", (code) => {
        if (code === 0) {
          if (writer) writer.write({ type: 'notification', status: 'success', message: "EAS build completed successfully." });
          resolve({ success: true, message: "EAS build process completed successfully." });
        } else {
          if (writer) writer.write({ type: 'notification', status: 'error', message: `EAS build failed. Exit code: ${code}` });
          reject(new Error(`EAS build process exited with code ${code}`));
        }
      });
    });
  },
});

// --- easSubmitTool (Re-implemented) ---
const easSubmitInputSchema = z.object({
  platform: z.enum(["ios", "android"]),
  buildId: z.string().optional().describe("The ID of the build to submit. If not provided, 'latest' is used."),
  appPath: z.string().describe("The local filesystem path to the app to submit."),
  appleId: z.string().optional().describe("Apple ID for authentication."),
  appleTeamId: z.string().optional().describe("Apple Team ID for the submission."),
  ascAppId: z.string().optional().describe("App Store Connect App ID for the app."),
});

export const easSubmitTool = createTool({
  id: "eas_submit",
  description: "Submits a completed build to the respective app store. Streams logs in real-time.",
  inputSchema: easSubmitInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async (executionContext) => {
    const { context, writer } = executionContext as StreamingToolExecutionContext<typeof easSubmitInputSchema>;
    const { platform, buildId, appPath, appleId, appleTeamId, ascAppId } = context;

    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Starting EAS submission for ${platform}...` });
    }

    const args = ["submit", "--platform", platform, "--non-interactive"];
    if (buildId) args.push("--id", buildId);
    else args.push("--latest");
    if (appleId) args.push("--apple-id", appleId);
    if (appleTeamId) args.push("--apple-team-id", appleTeamId);
    if (ascAppId) args.push("--asc-app-id", ascAppId);

    return new Promise((resolve, reject) => {
      const easProcess = spawn("eas", args, { cwd: appPath, stdio: "pipe" });

      const handleData = (data: Buffer) => {
        const output = data.toString();
        if (writer) writer.write({ type: "log", data: output });
      };

      easProcess.stdout.on("data", handleData);
      easProcess.stderr.on("data", handleData);

      easProcess.on("close", (code) => {
        if (code === 0) {
          if (writer) writer.write({ type: 'notification', status: 'success', message: "EAS submission completed successfully." });
          resolve({ success: true, message: "EAS submit process completed successfully." });
        } else {
          if (writer) writer.write({ type: 'notification', status: 'error', message: `EAS submission failed. Exit code: ${code}` });
          reject(new Error(`EAS submit process exited with code ${code}`));
        }
      });
    });
  },
});
