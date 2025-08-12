import { createTool, ToolExecutionContext } from "@mastra/core/tools";
import { z } from "zod";
import { spawn } from "child_process";

// Define a custom context type that includes the optional writer for streaming.
type StreamingToolExecutionContext<T extends z.ZodSchema | undefined> = ToolExecutionContext<T> & {
  writer?: {
    write: (chunk: any) => void;
  };
};

// --- easConfigureTool ---
const easConfigureInputSchema = z.object({
  appPath: z.string().describe("The path to the app to configure, relative to the project root."),
});

export const easConfigureTool = createTool({
  id: "eas_configure",
  description: "Configures the project for EAS Build by creating or updating eas.json.",
  inputSchema: easConfigureInputSchema,
  outputSchema: z.object({
    success: z.boolean(),
    message: z.string(),
  }),
  execute: async (executionContext) => {
    const { context: { appPath }, writer } = executionContext as StreamingToolExecutionContext<typeof easConfigureInputSchema>;
    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Configuring EAS for ${appPath}...` });
    }
    return new Promise((resolve, reject) => {
      const easProcess = spawn("eas", ["build:configure", "--non-interactive"], {
        cwd: appPath,
        stdio: "pipe",
      });

      let output = "";
      easProcess.stdout.on("data", (data) => (output += data.toString()));
      easProcess.stderr.on("data", (data) => (output += data.toString()));

      easProcess.on("close", (code) => {
        if (code === 0) {
          if (writer) {
            writer.write({ type: 'notification', status: 'success', message: "EAS configured successfully." });
          }
          resolve({ success: true, message: `eas.json configured successfully. Output: ${output}` });
        } else {
          if (writer) {
            writer.write({ type: 'notification', status: 'error', message: `EAS configuration failed. Exit code: ${code}` });
          }
          reject(new Error(`EAS configure process exited with code ${code}. Output: ${output}`));
        }
      });

      easProcess.on("error", (err) => {
        if (writer) {
          writer.write({ type: 'notification', status: 'error', message: `EAS configuration failed: ${err.message}` });
        }
        reject(new Error(`Failed to start EAS configure process: ${err.message}`));
      });
    });
  },
});

// --- easBuildTool ---
const easBuildInputSchema = z.object({
  platform: z.enum(["ios", "android", "all"]),
  profile: z.string().optional(),
  appPath: z.string().describe("The path to the app to build, relative to the project root."),
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
    const { platform, profile, appPath } = context;

    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Starting EAS build for ${platform}...` });
    }

    const args = ["build", "--platform", platform, "--non-interactive"];
    if (profile) {
      args.push("--profile", profile);
    }

    return new Promise((resolve, reject) => {
      const easProcess = spawn("eas", args, { cwd: appPath, stdio: "pipe" });

      const handleData = (data: Buffer) => {
        const output = data.toString();
        if (writer) {
          writer.write({ type: "log", data: output });
        }
      };

      easProcess.stdout.on("data", handleData);
      easProcess.stderr.on("data", handleData);

      easProcess.on("close", (code) => {
        if (code === 0) {
          if (writer) {
            writer.write({ type: 'notification', status: 'success', message: "EAS build completed successfully." });
          }
          resolve({ success: true, message: "EAS build process completed successfully." });
        } else {
          if (writer) {
            writer.write({ type: 'notification', status: 'error', message: `EAS build failed. Exit code: ${code}` });
          }
          reject(new Error(`EAS build process exited with code ${code}`));
        }
      });

      easProcess.on("error", (err) => {
        if (writer) {
          writer.write({ type: 'notification', status: 'error', message: `EAS build failed: ${err.message}` });
        }
        reject(new Error(`Failed to start EAS build process: ${err.message}`));
      });
    });
  },
});

// --- easBuildListTool ---
const easBuildListInputSchema = z.object({
  platform: z.enum(["ios", "android", "all"]).optional(),
  appPath: z.string().describe("The path to the app, relative to the project root."),
});

export const easBuildListTool = createTool({
  id: "eas_build_list",
  description: "Lists recent builds for the project, returning structured JSON data.",
  inputSchema: easBuildListInputSchema,
  outputSchema: z.any(),
  execute: async (executionContext) => {
    const { context: { platform, appPath }, writer } = executionContext as StreamingToolExecutionContext<typeof easBuildListInputSchema>;
    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: "Fetching build list..." });
    }
    const args = ["build:list", "--json"];
    if (platform) {
      args.push("--platform", platform);
    }

    return new Promise((resolve, reject) => {
      const easProcess = spawn("eas", args, { cwd: appPath, stdio: "pipe" });

      let jsonOutput = "";
      let errorOutput = "";
      easProcess.stdout.on("data", (data) => (jsonOutput += data.toString()));
      easProcess.stderr.on("data", (data) => (errorOutput += data.toString()));

      easProcess.on("close", (code) => {
        if (code === 0) {
          try {
            const jsonStartIndex = jsonOutput.indexOf('[');
            const jsonEndIndex = jsonOutput.lastIndexOf(']');
            if (jsonStartIndex === -1 || jsonEndIndex === -1) {
                throw new Error('No JSON array found in the output.');
            }
            const jsonString = jsonOutput.substring(jsonStartIndex, jsonEndIndex + 1);
            if (writer) {
              writer.write({ type: 'notification', status: 'success', message: "Build list fetched successfully." });
            }
            resolve(JSON.parse(jsonString));
          } catch (e: any) {
            if (writer) {
              writer.write({ type: 'notification', status: 'error', message: `Failed to parse build list: ${e.message}` });
            }
            reject(new Error(`Failed to parse JSON from EAS build:list: ${e.message}. Raw output: ${jsonOutput}`));
          }
        } else {
          if (writer) {
            writer.write({ type: 'notification', status: 'error', message: `Failed to fetch build list. Exit code: ${code}` });
          }
          reject(new Error(`EAS build:list process exited with code ${code}. Error: ${errorOutput}`));
        }
      });
    });
  },
});

// --- easSubmitTool ---
const easSubmitInputSchema = z.object({
  platform: z.enum(["ios", "android"]),
  buildId: z.string().optional().describe("The ID of the build to submit. If not provided, 'latest' is used."),
  appPath: z.string().describe("The path to the app to submit, relative to the project root."),
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
    const { platform, buildId, appPath } = context;

    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Starting EAS submission for ${platform}...` });
    }

    const args = ["submit", "--platform", platform, "--non-interactive"];
    if (buildId) {
      args.push("--id", buildId);
    } else {
      args.push("--latest");
    }

    return new Promise((resolve, reject) => {
      const easProcess = spawn("eas", args, { cwd: appPath, stdio: "pipe" });

      const handleData = (data: Buffer) => {
        const output = data.toString();
        if (writer) {
          writer.write({ type: "log", data: output });
        }
      };

      easProcess.stdout.on("data", handleData);
      easProcess.stderr.on("data", handleData);

      easProcess.on("close", (code) => {
        if (code === 0) {
          if (writer) {
            writer.write({ type: 'notification', status: 'success', message: "EAS submission completed successfully." });
          }
          resolve({ success: true, message: "EAS submit process completed successfully." });
        } else {
          if (writer) {
            writer.write({ type: 'notification', status: 'error', message: `EAS submission failed. Exit code: ${code}` });
          }
          reject(new Error(`EAS submit process exited with code ${code}`));
        }
      });

      easProcess.on("error", (err) => {
        if (writer) {
          writer.write({ type: 'notification', status: 'error', message: `EAS submission failed: ${err.message}` });
        }
        reject(new Error(`Failed to start EAS submit process: ${err.message}`));
      });
    });
  },
});
