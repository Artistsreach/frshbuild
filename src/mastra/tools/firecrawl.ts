import { createTool, ToolExecutionContext } from "@mastra/core/tools";
import { z } from "zod";

const firecrawlApiKey = process.env.FIRECRAWL_API_KEY;

// Define a custom context type that includes the optional writer for streaming.
type StreamingToolExecutionContext<T extends z.ZodSchema | undefined> = ToolExecutionContext<T> & {
  writer?: {
    write: (chunk: any) => void;
  };
};

const scrapeInputSchema = z.object({
  url: z.string(),
  zeroDataRetention: z.boolean().optional(),
  onlyMainContent: z.boolean().optional(),
  includeTags: z.array(z.string()).optional(),
  excludeTags: z.array(z.string()).optional(),
  maxAge: z.number().optional(),
  headers: z.record(z.string()).optional(),
  waitFor: z.number().optional(),
  mobile: z.boolean().optional(),
  skipTlsVerification: z.boolean().optional(),
  timeout: z.number().optional(),
  parsePDF: z.boolean().optional(),
  jsonOptions: z.object({
    schema: z.any().optional(),
    prompt: z.string().optional(),
    systemPrompt: z.string().optional(),
  }).optional(),
  actions: z.any().optional(),
  location: z.any().optional(),
  removeBase64Images: z.boolean().optional(),
  blockAds: z.boolean().optional(),
  proxy: z.enum(["basic", "stealth", "auto"]).optional(),
  storeInCache: z.boolean().optional(),
  formats: z.array(z.enum(["markdown", "html", "rawHtml", "screenshot", "links", "json"])).optional(),
  changeTrackingOptions: z.any().optional(),
});

export const scrapeTool = createTool({
  id: "firecrawl_scrape",
  description: "Scrape a URL and return the content in various formats like markdown, HTML, and a screenshot. Can also be used to extract structured data.",
  inputSchema: scrapeInputSchema,
  outputSchema: z.any(),
  execute: async (executionContext) => {
    const { context, writer } = executionContext as StreamingToolExecutionContext<typeof scrapeInputSchema>;
    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Scraping ${context.url}...` });
    }

    if (!firecrawlApiKey) {
      throw new Error("Firecrawl API key not found.");
    }

    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firecrawlApiKey}`,
      },
      body: JSON.stringify(context),
    });

    if (!response.ok) {
      const error = await response.json();
      if (writer) {
        writer.write({ type: 'notification', status: 'error', message: `Scraping failed: ${error.error}` });
      }
      throw new Error(`Firecrawl API error: ${error.error}`);
    }

    if (writer) {
      writer.write({ type: 'notification', status: 'success', message: `Scraped ${context.url} successfully.` });
    }
    return response.json();
  },
});


const crawlInputSchema = z.object({
    url: z.string(),
    limit: z.number().optional(),
    scrapeOptions: z.any().optional(),
    allowSubdomains: z.boolean().optional(),
    crawlEntireDomain: z.boolean().optional(),
});

export const crawlTool = createTool({
    id: "firecrawl_crawl",
    description: "Crawl a URL and all accessible subpages.",
    inputSchema: crawlInputSchema,
    outputSchema: z.any(),
    execute: async (executionContext) => {
        const { context, writer } = executionContext as StreamingToolExecutionContext<typeof crawlInputSchema>;
        if (writer) {
          writer.write({ type: 'notification', status: 'pending', message: `Starting crawl for ${context.url}...` });
        }

        if (!firecrawlApiKey) {
            throw new Error("Firecrawl API key not found.");
        }
        const response = await fetch("https://api.firecrawl.dev/v1/crawl", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${firecrawlApiKey}`,
            },
            body: JSON.stringify(context),
        });
        if (!response.ok) {
            const error = await response.json();
            if (writer) {
              writer.write({ type: 'notification', status: 'error', message: `Crawl failed: ${error.error}` });
            }
            throw new Error(`Firecrawl API error: ${error.error}`);
        }
        const data = await response.json();
        if (writer) {
          writer.write({ type: 'notification', status: 'success', message: `Crawl job started with ID: ${data.id}` });
        }
        return data;
    },
});

const checkCrawlStatusInputSchema = z.object({
    jobId: z.string(),
});

export const checkCrawlStatusTool = createTool({
    id: "firecrawl_check_crawl_status",
    description: "Check the status of a crawl job.",
    inputSchema: checkCrawlStatusInputSchema,
    outputSchema: z.any(),
    execute: async (executionContext) => {
        const { context: { jobId }, writer } = executionContext as StreamingToolExecutionContext<typeof checkCrawlStatusInputSchema>;
        if (writer) {
          writer.write({ type: 'notification', status: 'pending', message: `Checking status for crawl job ${jobId}...` });
        }

        if (!firecrawlApiKey) {
            throw new Error("Firecrawl API key not found.");
        }
        const response = await fetch(`https://api.firecrawl.dev/v1/crawl/${jobId}`, {
            headers: {
                Authorization: `Bearer ${firecrawlApiKey}`,
            },
        });
        if (!response.ok) {
            const error = await response.json();
            if (writer) {
              writer.write({ type: 'notification', status: 'error', message: `Crawl status check failed: ${error.error}` });
            }
            throw new Error(`Firecrawl API error: ${error.error}`);
        }
        const data = await response.json();
        if (writer) {
          writer.write({ type: 'notification', status: 'success', message: `Crawl job ${jobId} status: ${data.status}` });
        }
        return data;
    },
});

const searchInputSchema = z.object({
    query: z.string(),
    limit: z.number().optional(),
    scrapeOptions: z.any().optional(),
    location: z.string().optional(),
    tbs: z.string().optional(),
    timeout: z.number().optional(),
});

export const searchTool = createTool({
    id: "firecrawl_search",
    description: "Search the web and optionally scrape results.",
    inputSchema: searchInputSchema,
    outputSchema: z.any(),
    execute: async (executionContext) => {
        const { context, writer } = executionContext as StreamingToolExecutionContext<typeof searchInputSchema>;
        if (writer) {
          writer.write({ type: 'notification', status: 'pending', message: `Searching for "${context.query}"...` });
        }

        if (!firecrawlApiKey) {
            throw new Error("Firecrawl API key not found.");
        }
        const response = await fetch("https://api.firecrawl.dev/v1/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${firecrawlApiKey}`,
            },
            body: JSON.stringify(context),
        });
        if (!response.ok) {
            const error = await response.json();
            if (writer) {
              writer.write({ type: 'notification', status: 'error', message: `Search failed: ${error.error}` });
            }
            throw new Error(`Firecrawl API error: ${error.error}`);
        }
        if (writer) {
          writer.write({ type: 'notification', status: 'success', message: "Search completed successfully." });
        }
        return response.json();
    },
});
