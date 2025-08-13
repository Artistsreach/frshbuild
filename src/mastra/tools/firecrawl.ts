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
  headers: z.record(z.any()).optional(),
  waitFor: z.number().optional(),
  mobile: z.boolean().optional(),
  skipTlsVerification: z.boolean().optional(),
  timeout: z.number().optional(),
  parsePDF: z.boolean().optional(),
  jsonOptions: z.object({
    schema: z.record(z.any()).optional(),
    systemPrompt: z.string().optional(),
    prompt: z.string().optional(),
  }).optional(),
  actions: z.array(z.any()).optional(),
  location: z.object({
    country: z.string().optional(),
    languages: z.array(z.string()).optional(),
  }).optional(),
  removeBase64Images: z.boolean().optional(),
  blockAds: z.boolean().optional(),
  proxy: z.enum(["basic", "stealth", "auto"]).optional(),
  storeInCache: z.boolean().optional(),
  formats: z.array(z.string()).optional(),
  changeTrackingOptions: z.object({
    modes: z.array(z.string()).optional(),
    schema: z.record(z.any()).optional(),
    prompt: z.string().optional(),
    tag: z.string().nullable().optional(),
  }).optional(),
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

    const body = Object.fromEntries(Object.entries(context).filter(([_, v]) => v !== undefined));
    const response = await fetch("https://api.firecrawl.dev/v1/scrape", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firecrawlApiKey}`,
      },
      body: JSON.stringify(body),
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

const extractInputSchema = z.object({
  urls: z.array(z.string()),
  prompt: z.string().optional(),
  schema: z.record(z.any()).optional(),
  enableWebSearch: z.boolean().optional(),
  ignoreSitemap: z.boolean().optional(),
  includeSubdomains: z.boolean().optional(),
  showSources: z.boolean().optional(),
  scrapeOptions: z.any().optional(),
  ignoreInvalidURLs: z.boolean().optional(),
});

export const extractTool = createTool({
  id: "firecrawl_extract",
  description: "Extract structured data from one or multiple URLs.",
  inputSchema: extractInputSchema,
  outputSchema: z.any(),
  execute: async (executionContext) => {
    const { context, writer } = executionContext as StreamingToolExecutionContext<typeof extractInputSchema>;
    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Starting extraction...` });
    }

    if (!firecrawlApiKey) {
      throw new Error("Firecrawl API key not found.");
    }

    const body = Object.fromEntries(Object.entries(context).filter(([_, v]) => v !== undefined));
    const response = await fetch("https://api.firecrawl.dev/v1/extract", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${firecrawlApiKey}`,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      const error = await response.json();
      if (writer) {
        writer.write({ type: 'notification', status: 'error', message: `Extraction failed: ${error.error}` });
      }
      throw new Error(`Firecrawl API error: ${error.error}`);
    }

    const data = await response.json();
    if (writer) {
      writer.write({ type: 'notification', status: 'success', message: `Extraction job started with ID: ${data.id}` });
    }
    
    // Polling for the result
    const jobId = data.id;
    let status = 'pending';
    let result;
    const startTime = Date.now();
    const timeout = 300000; // 5 minutes

    while (status !== 'completed' && Date.now() - startTime < timeout) {
      await new Promise(resolve => setTimeout(resolve, 5000)); // wait 5 seconds
      if (writer) {
        writer.write({ type: 'notification', status: 'pending', message: `Checking status for extraction job ${jobId}...` });
      }
      const statusResponse = await fetch(`https://api.firecrawl.dev/v1/extract/${jobId}`, {
        headers: {
          Authorization: `Bearer ${firecrawlApiKey}`,
        },
      });

      if (!statusResponse.ok) {
        const error = await statusResponse.json();
        if (writer) {
          writer.write({ type: 'notification', status: 'error', message: `Extraction status check failed: ${error.error}` });
        }
        throw new Error(`Firecrawl API error: ${error.error}`);
      }

      const statusData = await statusResponse.json();
      status = statusData.status;
      result = statusData;

      if (writer) {
        writer.write({ type: 'notification', status: 'success', message: `Extraction job ${jobId} status: ${status}` });
      }
    }

    if (status !== 'completed') {
        if (writer) {
            writer.write({ type: 'notification', status: 'error', message: `Extraction job ${jobId} timed out.` });
        }
        throw new Error(`Extraction job ${jobId} timed out.`);
    }

    return result;
  },
});

const searchInputSchema = z.object({
    query: z.string(),
    limit: z.number().optional(),
    scrapeOptions: z.object({
        formats: z.array(z.enum(["markdown", "html", "rawHtml", "links", "screenshot", "screenshot@fullPage", "extract", "json"])).optional(),
        pageOptions: z.object({
            onlyMainContent: z.boolean().optional(),
            includeTags: z.array(z.string()).optional(),
            excludeTags: z.array(z.string()).optional(),
            removeBase64Images: z.boolean().optional(),
            blockAds: z.boolean().optional(),
        }).optional(),
        extractorOptions: z.object({
            mode: z.enum(["llm-extraction"]).optional(),
            extractionPrompt: z.string().optional(),
            extractionSchema: z.any().optional(),
        }).optional(),
        screenshotOptions: z.any().optional(),
        waitFor: z.number().optional(),
        mobile: z.boolean().optional(),
        parsePDF: z.boolean().optional(),
        proxy: z.enum(["basic", "stealth", "auto"]).optional(),
    }).optional(),
    location: z.string().optional(),
    tbs: z.string().optional(),
    timeout: z.number().optional(),
});

export const searchTool = createTool({
    id: "firecrawl_search",
    description: "Search the web and optionally scrape the results.",
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
        const body = Object.fromEntries(Object.entries(context).filter(([_, v]) => v !== undefined));
        const response = await fetch("https://api.firecrawl.dev/v1/search", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${firecrawlApiKey}`,
            },
            body: JSON.stringify(body),
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
