import { exec } from 'child_process';
import { promisify } from 'util';
import { tmpdir } from 'os';
import { join } from 'path';
import { writeFile, mkdir } from 'fs/promises';
import { v4 as uuidv4 } from 'uuid';

const execAsync = promisify(exec);

type BuildPlatform = 'android' | 'ios' | 'all';
type BuildProfile = 'development' | 'preview' | 'production';
type Track = 'production' | 'beta' | 'alpha' | 'internal';

interface BuildOptions {
  platform: BuildPlatform;
  profile: BuildProfile;
  message?: string;
  nonInteractive?: boolean;
  noWait?: boolean;
  local?: boolean;
  output?: string;
}

interface SubmitOptions {
  platform: BuildPlatform;
  track?: Track;
  buildId?: string;
  message?: string;
  nonInteractive?: boolean;
  noWait?: boolean;
}

interface EASConfig {
  projectId: string;
  cli?: {
    version?: string;
    requireCommit?: boolean;
    requireConfiguredProject?: boolean;
  };
  build?: {
    [profile: string]: any;
  };
  submit?: {
    [profile: string]: any;
  };
}

export class EASClient {
  private projectDir: string;
  private config: EASConfig;

  constructor(projectDir: string, config: Partial<EASConfig> = {}) {
    this.projectDir = projectDir;
    this.config = {
      projectId: config.projectId || '',
      cli: {
        version: '>= 16.17.4',
        requireCommit: false,
        requireConfiguredProject: false,
        ...config.cli,
      },
      build: {
        development: {
          developmentClient: true,
          distribution: 'internal',
          ...config.build?.development,
        },
        preview: {
          distribution: 'internal',
          ...config.build?.preview,
        },
        production: {
          autoIncrement: true,
          ...config.build?.production,
        },
      },
      submit: {
        production: {},
        ...config.submit,
      },
    };
  }

  /**
   * Initialize a new Expo project with EAS
   */
  async init() {
    await this.ensureEASConfig();
    return this.runEASCommand('init');
  }

  /**
   * Build the app
   */
  async build(options: BuildOptions) {
    await this.ensureEASConfig();
    
    const args = [
      'build',
      `--platform ${options.platform}`,
      `--profile ${options.profile}`,
      options.nonInteractive !== false && '--non-interactive',
      options.noWait !== false && '--no-wait',
      options.local && '--local',
      options.output && `--output ${options.output}`,
      '--json',
    ].filter(Boolean);

    const result = await this.runEASCommand(args.join(' '));
    
    try {
      return JSON.parse(result);
    } catch (e) {
      throw new Error(`Failed to parse build output: ${result}`);
    }
  }

  /**
   * Submit the app to app stores
   */
  async submit(options: SubmitOptions) {
    await this.ensureEASConfig();
    
    const args = [
      'submit',
      `--platform ${options.platform}`,
      options.track && `--track ${options.track}`,
      options.buildId && `--id ${options.buildId}`,
      options.message && `--message "${options.message}"`,
      options.nonInteractive !== false && '--non-interactive',
      options.noWait !== false && '--no-wait',
      '--json',
    ].filter(Boolean);

    const result = await this.runEASCommand(args.join(' '));
    
    try {
      return JSON.parse(result);
    } catch (e) {
      throw new Error(`Failed to parse submit output: ${result}`);
    }
  }

  /**
   * Check build status
   */
  async getBuildStatus(buildId: string) {
    const result = await this.runEASCommand(`build:view ${buildId} --json`);
    
    try {
      return JSON.parse(result);
    } catch (e) {
      throw new Error(`Failed to parse build status: ${result}`);
    }
  }

  /**
   * Check submission status
   */
  async getSubmissionStatus(submissionId: string) {
    const result = await this.runEASCommand(`submit:view ${submissionId} --json`);
    
    try {
      return JSON.parse(result);
    } catch (e) {
      throw new Error(`Failed to parse submission status: ${result}`);
    }
  }

  /**
   * Ensure EAS config exists
   */
  private async ensureEASConfig() {
    try {
      await this.runEASCommand('--version');
    } catch (e) {
      // EAS CLI not installed, install it
      await this.runCommand('npm install -g eas-cli');
    }

    // Create or update eas.json
    const easJsonPath = join(this.projectDir, 'eas.json');
    await writeFile(easJsonPath, JSON.stringify(this.config, null, 2));
  }

  /**
   * Run EAS command
   */
  private async runEASCommand(command: string) {
    const fullCommand = `npx eas-cli@latest ${command}`;
    const env = {
      ...process.env,
      EAS_NO_VCS: '1',
      EAS_PROJECT_ROOT: this.projectDir,
    };

    try {
      const { stdout, stderr } = await execAsync(fullCommand, {
        cwd: this.projectDir,
        env,
      });

      if (stderr) {
        console.warn('EAS stderr:', stderr);
      }

      return stdout;
    } catch (error: any) {
      console.error('EAS command failed:', error);
      throw new Error(error.stderr || error.message);
    }
  }

  /**
   * Run a generic command
   */
  private async runCommand(command: string) {
    try {
      const { stdout, stderr } = await execAsync(command, {
        cwd: this.projectDir,
        env: process.env,
      });

      if (stderr) {
        console.warn('Command stderr:', stderr);
      }

      return stdout;
    } catch (error: any) {
      console.error('Command failed:', error);
      throw new Error(error.stderr || error.message);
    }
  }
}

/**
 * Create a temporary directory for EAS operations
 */
export async function createTempDir(prefix = 'expo-build-') {
  const tempDir = join(tmpdir(), prefix + uuidv4());
  await mkdir(tempDir, { recursive: true });
  return tempDir;
}

/**
 * Get EAS client for an app
 */
export function getEASClient(appId: string, projectDir: string) {
  // In a real implementation, you'd load the app's EAS config from the database
  const config: EASConfig = {
    projectId: appId,
    build: {
      development: {
        developmentClient: true,
        distribution: 'internal',
      },
      preview: {
        distribution: 'internal',
      },
      production: {
        autoIncrement: true,
      },
    },
    submit: {
      production: {},
    },
  };

  return new EASClient(projectDir, config);
}
