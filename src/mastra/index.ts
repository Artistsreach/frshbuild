import { Mastra } from "@mastra/core";
import { builderAgent } from './agents/builder';

// Initialize Mastra with the builder agent
export const mastra = new Mastra({
  agents: { builderAgent },
});

// Export the builder agent directly for convenience
export { builderAgent } from './agents/builder';
