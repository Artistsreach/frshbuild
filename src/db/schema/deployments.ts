import { deploymentsTable as deployments } from "../schema";
export { deployments };
export type { Deployment } from "../schema";
export type NewDeployment = typeof deployments.$inferInsert;
