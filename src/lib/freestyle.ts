import { FreestyleSandboxes } from "freestyle-sandboxes";

// Initialize Freestyle client with proper configuration
export const freestyle = new FreestyleSandboxes({
  apiKey: process.env.FREESTYLE_API_KEY!,
});

// Helper functions for common Freestyle operations
export const freestyleHelpers = {
  // Create a Git repository with proper configuration
  async createRepository(name: string, isPublic: boolean = false, sourceUrl?: string) {
    const repoData: any = {
      name: name || "Unnamed App",
      public: isPublic,
      defaultBranch: "main",
    };

    if (sourceUrl) {
      repoData.source = {
        type: "git",
        url: sourceUrl,
        branch: "main",
        depth: 1, // Shallow clone for faster setup
      };
    }

    return await freestyle.createGitRepository(repoData);
  },

  // Grant Git permissions to an identity
  async grantPermission(identityId: string, repoId: string, permission: "read" | "write" | "admin" = "write") {
    return await freestyle.grantGitPermission({
      identityId,
      repoId,
      permission,
    });
  },

  // Create Git access token
  async createAccessToken(identityId: string) {
    return await freestyle.createGitAccessToken({
      identityId,
    });
  },

  // Request dev server with proper configuration
  async requestDevServer(repoId: string, templateId: string) {
    const devServerConfig: any = {
      repoId,
      computeClass: "low", // Start with low compute for cost efficiency
      timeout: "30", // 30 minutes timeout
      ports: [
        {
          port: 443, // External HTTPS port
          targetPort: 3000, // Internal port where the app runs
        },
      ],
    };

    // Add template-specific configuration
    switch (templateId) {
      case "nextjs":
        devServerConfig.devCommand = "npm run dev";
        devServerConfig.installCommand = "npm install";
        devServerConfig.preDevCommandOnce = "npm run build";
        break;
      case "vite-react":
        devServerConfig.devCommand = "npm run dev";
        devServerConfig.installCommand = "npm install";
        break;
      case "expo":
        devServerConfig.devCommand = "npx expo start --web";
        devServerConfig.installCommand = "npm install";
        break;
      default:
        devServerConfig.devCommand = "npm run dev";
        devServerConfig.installCommand = "npm install";
    }

    return await freestyle.requestDevServer(devServerConfig);
  },

  // Get dev server status
  async getDevServerStatus(repoId: string) {
    return await freestyle.getDevServerStatus({
      repoId,
      kind: "repo",
    });
  },

  // Execute command on dev server
  async executeCommand(repoId: string, command: string, background: boolean = false) {
    return await freestyle.executeCommand({
      devServer: {
        repoId,
        kind: "repo",
      },
      command,
      background,
    });
  },
};
