// Temporarily disabled to prevent build errors from PostgreSQL dependencies
// TODO: Re-enable when memory system dependencies are resolved

// import { Mastra } from "@mastra/core";
// import { builderAgent } from './agents/builder';

// export const mastra = new Mastra({
//   agents: { builderAgent },
// });

// Temporary mock export to prevent import errors
export const mastra = {
  agents: { builderAgent: null },
};
