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
  timeout: z.number().optional(),
  parsePDF: z.boolean().optional(),
  proxy: z.enum(["basic", "stealth", "auto"]).optional(),
  formats: z.array(z.enum(["markdown", "html", "rawHtml", "screenshot", "links", "json"])).optional(),
  changeTrackingOptions: z.any().optional(),
  agent: z.object({
    model: z.string(),
    prompt: z.string(),
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


const crawlInputSchema = z.object({
    url: z.string(),
    limit: z.number().optional(),
    scrapeOptions: z.any().optional(),
    allowSubdomains: z.boolean().optional(),
    crawlEntireDomain: z.boolean().optional(),
    webhook: z.object({
      url: z.string(),
      metadata: z.record(z.any()).optional(),
      events: z.array(z.string()).optional(),
    }).optional(),
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
        const body = Object.fromEntries(Object.entries(context).filter(([_, v]) => v !== undefined));
        const response = await fetch("https://api.firecrawl.dev/v1/crawl", {
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
    scrapeOptions: z.object({
      formats: z.array(z.string()).optional(),
    }).optional(),
    location: z.string().optional(),
    tbs: z.string().optional(),
    timeout: z.number().optional(),
    pageOptions: z.object({
        onlyMainContent: z.boolean().optional(),
        includeTags: z.array(z.string()).optional(),
        excludeTags: z.array(z.string()).optional(),
        removeBase64Images: z.boolean().optional(),
        blockAds: z.boolean().optional(),
    }).optional(),
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

const mapInputSchema = z.object({
  url: z.string(),
  search: z.string().optional(),
});

export const mapTool = createTool({
  id: "firecrawl_map",
  description: "Map a URL and get all the URLs on the website.",
  inputSchema: mapInputSchema,
  outputSchema: z.any(),
  execute: async (executionContext) => {
    const { context, writer } = executionContext as StreamingToolExecutionContext<typeof mapInputSchema>;
    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Mapping ${context.url}...` });
    }

    if (!firecrawlApiKey) {
      throw new Error("Firecrawl API key not found.");
    }

    const body = Object.fromEntries(Object.entries(context).filter(([_, v]) => v !== undefined));
    const response = await fetch("https://api.firecrawl.dev/v1/map", {
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
        writer.write({ type: 'notification', status: 'error', message: `Mapping failed: ${error.error}` });
      }
      throw new Error(`Firecrawl API error: ${error.error}`);
    }

    if (writer) {
      writer.write({ type: 'notification', status: 'success', message: `Mapped ${context.url} successfully.` });
    }
    return response.json();
  },
});

const batchScrapeInputSchema = z.object({
  urls: z.array(z.string()),
  scrapeOptions: z.any().optional(),
  webhook: z.object({
    url: z.string(),
    metadata: z.record(z.any()).optional(),
    events: z.array(z.string()).optional(),
  }).optional(),
});

export const batchScrapeTool = createTool({
  id: "firecrawl_batch_scrape",
  description: "Batch scrape multiple URLs.",
  inputSchema: batchScrapeInputSchema,
  outputSchema: z.any(),
  execute: async (executionContext) => {
    const { context, writer } = executionContext as StreamingToolExecutionContext<typeof batchScrapeInputSchema>;
    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Starting batch scrape...` });
    }

    if (!firecrawlApiKey) {
      throw new Error("Firecrawl API key not found.");
    }

    const body = Object.fromEntries(Object.entries(context).filter(([_, v]) => v !== undefined));
    const response = await fetch("https://api.firecrawl.dev/v1/batch/scrape", {
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
        writer.write({ type: 'notification', status: 'error', message: `Batch scrape failed: ${error.error}` });
      }
      throw new Error(`Firecrawl API error: ${error.error}`);
    }

    const data = await response.json();
    if (writer) {
      writer.write({ type: 'notification', status: 'success', message: `Batch scrape job started with ID: ${data.id}` });
    }
    return data;
  },
});

const checkBatchScrapeStatusInputSchema = z.object({
  jobId: z.string(),
});

export const checkBatchScrapeStatusTool = createTool({
  id: "firecrawl_check_batch_scrape_status",
  description: "Check the status of a batch scrape job.",
  inputSchema: checkBatchScrapeStatusInputSchema,
  outputSchema: z.any(),
  execute: async (executionContext) => {
    const { context: { jobId }, writer } = executionContext as StreamingToolExecutionContext<typeof checkBatchScrapeStatusInputSchema>;
    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Checking status for batch scrape job ${jobId}...` });
    }

    if (!firecrawlApiKey) {
      throw new Error("Firecrawl API key not found.");
    }

    const response = await fetch(`https://api.firecrawl.dev/v1/batch/scrape/${jobId}`, {
      headers: {
        Authorization: `Bearer ${firecrawlApiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      if (writer) {
        writer.write({ type: 'notification', status: 'error', message: `Batch scrape status check failed: ${error.error}` });
      }
      throw new Error(`Firecrawl API error: ${error.error}`);
    }

    const data = await response.json();
    if (writer) {
      writer.write({ type: 'notification', status: 'success', message: `Batch scrape job ${jobId} status: ${data.status}` });
    }
    return data;
  },
});

const extractInputSchema = z.object({
  urls: z.array(z.string()),
  prompt: z.string().optional(),
  schema: z.any().optional(),
  enableWebSearch: z.boolean().optional(),
  agent: z.object({
    model: z.string(),
  }).optional(),
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
      writer.write({ type: 'notification', status: 'success', message: `Extraction job started with ID: ${data.jobId}` });
    }
    return data;
  },
});

const getExtractStatusInputSchema = z.object({
  jobId: z.string(),
});

export const getExtractStatusTool = createTool({
  id: "firecrawl_get_extract_status",
  description: "Check the status of an extraction job.",
  inputSchema: getExtractStatusInputSchema,
  outputSchema: z.any(),
  execute: async (executionContext) => {
    const { context: { jobId }, writer } = executionContext as StreamingToolExecutionContext<typeof getExtractStatusInputSchema>;
    if (writer) {
      writer.write({ type: 'notification', status: 'pending', message: `Checking status for extraction job ${jobId}...` });
    }

    if (!firecrawlApiKey) {
      throw new Error("Firecrawl API key not found.");
    }

    const response = await fetch(`https://api.firecrawl.dev/v1/extract/${jobId}`, {
      headers: {
        Authorization: `Bearer ${firecrawlApiKey}`,
      },
    });

    if (!response.ok) {
      const error = await response.json();
      if (writer) {
        writer.write({ type: 'notification', status: 'error', message: `Extraction status check failed: ${error.error}` });
      }
      throw new Error(`Firecrawl API error: ${error.error}`);
    }

    const data = await response.json();
    if (writer) {
      writer.write({ type: 'notification', status: 'success', message: `Extraction job ${jobId} status: ${data.status}` });
    }
    return data;
  },
});
