# Firecrawl API Documentation

## Scrape Endpoint

**POST** `/scrape`

### Description

Scrapes a single URL and returns the content in various formats like markdown, HTML, and a screenshot.

### Authorizations

-   `Authorization`: `Bearer <token>` (Header)

### Body (application/json)

-   `url` (string, required): The URL to scrape.
-   `zeroDataRetention` (boolean, default: false): If true, this will enable zero data retention for this scrape.
-   `onlyMainContent` (boolean, default: true): Only return the main content of the page excluding headers, navs, footers, etc.
-   `includeTags` (string[]): Tags to include in the output.
-   `excludeTags` (string[]): Tags to exclude from the output.
-   `maxAge` (integer, default: 0): Returns a cached version of the page if it is younger than this age in milliseconds.
-   `headers` (object): Headers to send with the request.
-   `waitFor` (integer, default: 0): Specify a delay in milliseconds before fetching the content.
-   `mobile` (boolean, default: false): Set to true if you want to emulate scraping from a mobile device.
-   `skipTlsVerification` (boolean, default: false): Skip TLS certificate verification.
-   `timeout` (integer, default: 30000): Timeout in milliseconds for the request.
-   `parsePDF` (boolean, default: true): Controls how PDF files are processed.
-   `jsonOptions` (object): JSON options object.
-   `actions` (array): Actions to perform on the page before grabbing the content.
-   `location` (object): Location settings for the request.
-   `removeBase64Images` (boolean): Removes all base 64 images from the output.
-   `blockAds` (boolean, default: true): Enables ad-blocking and cookie popup blocking.
-   `proxy` (enum: "basic", "stealth", "auto"): Specifies the type of proxy to use.
-   `storeInCache` (boolean, default: true): If true, the page will be stored in the Firecrawl index and cache.
-   `formats` (enum[]): Formats to include in the output.
-   `changeTrackingOptions` (object): Options for change tracking (Beta).

### Example Request

```json
{
  "url": "<string>",
  "onlyMainContent": true,
  "includeTags": ["<string>"],
  "excludeTags": ["<string>"],
  "maxAge": 0,
  "headers": {},
  "waitFor": 0,
  "mobile": false,
  "skipTlsVerification": false,
  "timeout": 30000,
  "parsePDF": true,
  "jsonOptions": {
    "schema": {},
    "systemPrompt": "<string>",
    "prompt": "<string>"
  },
  "actions": [
    {
      "type": "wait",
      "milliseconds": 2,
      "selector": "#my-element"
    }
  ],
  "location": {
    "country": "US",
    "languages": ["en-US"]
  },
  "removeBase64Images": true,
  "blockAds": true,
  "proxy": "basic",
  "storeInCache": true,
  "formats": ["markdown"],
  "changeTrackingOptions": {
    "modes": ["git-diff"],
    "schema": {},
    "prompt": "<string>",
    "tag": null
  },
  "zeroDataRetention": false
}
```

### Example Response (200 OK)

```json
{
  "success": true,
  "data": {
    "markdown": "<string>",
    "html": "<string>",
    "rawHtml": "<string>",
    "screenshot": "<string>",
    "links": ["<string>"],
    "actions": {
      "screenshots": ["<string>"],
      "scrapes": [
        {
          "url": "<string>",
          "html": "<string>"
        }
      ],
      "javascriptReturns": [
        {
          "type": "<string>",
          "value": "<any>"
        }
      ],
      "pdfs": ["<string>"]
    },
    "metadata": {
      "title": "<string>",
      "description": "<string>",
      "language": "<string>",
      "sourceURL": "<string>",
      "<any other metadata> ": "<string>",
      "statusCode": 123,
      "error": "<string>"
    },
    "llm_extraction": {},
    "warning": "<string>",
    "changeTracking": {
      "previousScrapeAt": "2023-11-07T05:31:56Z",
      "changeStatus": "new",
      "visibility": "visible",
      "diff": "<string>",
      "json": {}
    }
  }
}
```

## Extract Endpoint

**POST** `/extract`

### Description

Extracts structured data from multiple URLs based on a provided schema and prompt.

### Authorizations

-   `Authorization`: `Bearer <token>` (Header)

### Body (application/json)

-   `urls` (string[], required): The URLs to extract data from.
-   `prompt` (string): Prompt to guide the extraction process.
-   `schema` (object): Schema to define the structure of the extracted data.
-   `enableWebSearch` (boolean, default: false): When true, the extraction will use web search to find additional data.
-   `ignoreSitemap` (boolean, default: false): When true, sitemap.xml files will be ignored.
-   `includeSubdomains` (boolean, default: true): When true, subdomains of the provided URLs will also be scanned.
-   `showSources` (boolean, default: false): When true, the sources used to extract the data will be included in the response.
-   `scrapeOptions` (object): Options for scraping.
-   `ignoreInvalidURLs` (boolean, default: false): If invalid URLs are specified, they will be ignored.

### Example Request

```json
{
  "urls": ["<string>"],
  "prompt": "<string>",
  "schema": {},
  "enableWebSearch": false,
  "ignoreSitemap": false,
  "includeSubdomains": true,
  "showSources": false,
  "scrapeOptions": {
    "onlyMainContent": true,
    "includeTags": ["<string>"],
    "excludeTags": ["<string>"],
    "maxAge": 0,
    "headers": {},
    "waitFor": 0,
    "mobile": false,
    "skipTlsVerification": false,
    "timeout": 30000,
    "parsePDF": true,
    "jsonOptions": {
      "schema": {},
      "systemPrompt": "<string>",
      "prompt": "<string>"
    },
    "actions": [
      {
        "type": "wait",
        "milliseconds": 2,
        "selector": "#my-element"
      }
    ],
    "location": {
      "country": "US",
      "languages": ["en-US"]
    },
    "removeBase64Images": true,
    "blockAds": true,
    "proxy": "basic",
    "storeInCache": true,
    "formats": ["markdown"],
    "changeTrackingOptions": {
      "modes": ["git-diff"],
      "schema": {},
      "prompt": "<string>",
      "tag": null
    }
  },
  "ignoreInvalidURLs": false
}
```

### Example Response (200 OK)

```json
{
  "success": true,
  "id": "<string>",
  "invalidURLs": ["<string>"]
}
