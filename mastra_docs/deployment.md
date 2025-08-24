Deployment Overview
Mastra offers multiple deployment options to suit your application’s needs, from fully-managed solutions to self-hosted options, and web framework integrations. This guide will help you understand the available deployment paths and choose the right one for your project.

Deployment Options
Mastra Cloud
Mastra Cloud is a deployment platform that connects to your GitHub repository, automatically deploys on code changes, and provides monitoring tools. It includes:

GitHub repository integration
Deployment on git push
Agent testing interface
Comprehensive logs and traces
Custom domains for each project
View Mastra Cloud documentation →

With a Web Framework
Mastra can be integrated with a variety of web frameworks. For example, see one of the following for a detailed guide.

With Next.js
With Astro
When integrated with a framework, Mastra typically requires no additional configuration for deployment.

View Web Framework Integration →

With a Server
You can deploy Mastra as a standard Node.js HTTP server, which gives you full control over your infrastructure and deployment environment.

Custom API routes and middleware
Configurable CORS and authentication
Deploy to VMs, containers, or PaaS platforms
Ideal for integrating with existing Node.js applications
Server deployment guide →

Serverless Platforms
Mastra provides platform-specific deployers for popular serverless platforms, enabling you to deploy your application with minimal configuration.

Deploy to Cloudflare Workers, Vercel, or Netlify
Platform-specific optimizations
Simplified deployment process
Automatic scaling through the platform
Serverless deployment guide →

Client Configuration
Once your Mastra application is deployed, you’ll need to configure your client to communicate with it. The Mastra Client SDK provides a simple and type-safe interface for interacting with your Mastra server.

Type-safe API interactions
Authentication and request handling
Retries and error handling
Support for streaming responses
Client configuration guide →

Choosing a Deployment Option
Option	Best For	Key Benefits
Mastra Cloud	Teams wanting to ship quickly without infrastructure concerns	Fully-managed, automatic scaling, built-in observability
Framework Deployment	Teams already using Next.js, Astro etc	Simplify deployment with a unified codebase for frontend and backend
Server Deployment	Teams needing maximum control and customization	Full control, custom middleware, integrate with existing apps
Serverless Platforms	Teams already using Vercel, Netlify, or Cloudflare	Platform integration, simplified deployment, automatic scaling

Deploy a Mastra Server
Mastra runs as a standard Node.js server and can be deployed across a wide range of environments.

Default project structure
The getting started guide scaffolds a project with sensible defaults to help you begin quickly. By default, the CLI organizes application files under the src/mastra/ directory, resulting in a structure similar to the following:

Building
The mastra build command starts the build process:


mastra build
Customizing the input directory
If your Mastra files are located elsewhere, use the --dir flag to specify the custom location. The --dir flag tells Mastra where to find your entry point file (index.ts or index.js) and related directories.


mastra build --dir ./my-project/mastra
Build process
The build process follows these steps:

Locates entry file: Finds index.ts or index.js in your specified directory (default: src/mastra/).
Creates build directory: Generates a .mastra/ directory containing:
.build: Contains dependency analysis, bundled dependencies, and build configuration files.
output: Contains the production-ready application bundle with index.mjs, instrumentation.mjs, and project-specific files.
Copies static assets: Copies the public/ folder contents to the output directory for serving static files.
Bundles code: Uses Rollup with tree shaking and source maps for optimization.
Generates server: Creates a Hono  HTTP server ready for deployment.
Build output structure
After building, Mastra creates a .mastra/ directory with the following structure:

public folder
If a public folder exists in src/mastra, its contents are copied into the .build/output directory during the build process.

Running the Server
Start the HTTP server:


node .mastra/output/index.mjs
Enable Telemetry
To enable telemetry and observability, load the instrumentation file:


node --import=./.mastra/output/instrumentation.mjs .mastra/output/index.mjs

Web Framework Integration
This guide covers deploying integrated Mastra applications. Mastra can be integrated with a variety of web frameworks, see one of the following for a detailed guide.

With Next.js
With Astro
When integrated with a framework, Mastra typically requires no additional configuration for deployment.

With Next.js on Vercel
If you’ve integrated Mastra with Next.js by following our guide and plan to deploy to Vercel, no additional setup is required.

The only thing to verify is that you’ve added the following to your next.config.ts and removed any usage of LibSQLStore, which is not supported in serverless environments:

next.config.ts

import type { NextConfig } from "next";
 
const nextConfig: NextConfig = {
  serverExternalPackages: ["@mastra/*"],
};
 
export default nextConfig;
With Astro on Vercel
If you’ve integrated Mastra with Astro by following our guide and plan to deploy to Vercel, no additional setup is required.

The only thing to verify is that you’ve added the following to your astro.config.mjs and removed any usage of LibSQLStore, which is not supported in serverless environments:

astro.config.mjs

import { defineConfig } from 'astro/config';
import vercel from '@astrojs/vercel';
 
export default defineConfig({
  // ...
  adapter: vercel(),
  output: "server"
});
With Astro on Netlify
If you’ve integrated Mastra with Astro by following our guide and plan to deploy to Vercel, no additional setup is required.

The only thing to verify is that you’ve added the following to your astro.config.mjs and removed any usage of LibSQLStore, which is not supported in serverless environments:

astro.config.mjs

import { defineConfig } from 'astro/config';
import vercel from '@astrojs/netlify';
 
export default defineConfig({
  // ...
  adapter: netlify(),
  output: "server"
});