Chunk Text
When working with large text documents, you need to break them down into smaller, manageable pieces for processing. The chunk method splits text content into segments that can be used for search, analysis, or retrieval. This example shows how to split plain text into chunks using default settings.


import { MDocument } from "@mastra/rag";
 
const doc = MDocument.fromText("Your plain text content...");
 
const chunks = await doc.chunk();

Chunk Markdown
Markdown is more information-dense than raw HTML, making it easier to work with for RAG pipelines. When working with markdown, you need to split it into smaller pieces while preserving headers and formatting. The chunk method handles Markdown-specific elements like headers, lists, and code blocks intelligently. This example shows how to chunk markdown documents for search or retrieval purposes.


import { MDocument } from "@mastra/rag";
 
const doc = MDocument.fromMarkdown("# Your markdown content...");
 
const chunks = await doc.chunk();

Semantically Chunking HTML
When working with HTML content, you often need to break it down into smaller, manageable pieces while preserving the document structure. The chunk method splits HTML content intelligently, maintaining the integrity of HTML tags and elements. This example shows how to chunk HTML documents for search or retrieval purposes.


import { MDocument } from "@mastra/rag";
 
const html = `
<div>
    <h1>h1 content...</h1>
    <p>p content...</p>
</div>
`;
 
const doc = MDocument.fromHTML(html);
 
const chunks = await doc.chunk({
  headers: [
    ["h1", "Header 1"],
    ["p", "Paragraph"],
  ],
});
 
console.log(chunks);

Semantically Chunking JSON
When working with JSON data, you need to split it into smaller pieces while preserving the object structure. The chunk method breaks down JSON content intelligently, maintaining the relationships between keys and values. This example shows how to chunk JSON documents for search or retrieval purposes.


import { MDocument } from "@mastra/rag";
 
const testJson = {
  name: "John Doe",
  age: 30,
  email: "john.doe@example.com",
};
 
const doc = MDocument.fromJSON(JSON.stringify(testJson));
 
const chunks = await doc.chunk({
  maxSize: 100,
});
 
console.log(chunks);

Adjust Chunk Size
When processing large documents, you might need to adjust how much text is included in each chunk. By default, chunks are 1024 characters long, but you can customize this size to better match your content and memory requirements. This example shows how to set a custom chunk size when splitting documents.


import { MDocument } from "@mastra/rag";
 
const doc = MDocument.fromText("Your plain text content...");
 
const chunks = await doc.chunk({
  size: 512,
});

Adjust Chunk Delimiters
When processing large documents, you may want to control how the text is split into smaller chunks. By default, documents are split on newlines, but you can customize this behavior to better match your content structure. This example shows how to specify a custom delimiter for chunking documents.


import { MDocument } from "@mastra/rag";
 
const doc = MDocument.fromText("Your plain text content...");
 
const chunks = await doc.chunk({
  separator: "\n",
});

Adjust Chunk Delimiters
When processing large documents, you may want to control how the text is split into smaller chunks. By default, documents are split on newlines, but you can customize this behavior to better match your content structure. This example shows how to specify a custom delimiter for chunking documents.


import { MDocument } from "@mastra/rag";
 
const doc = MDocument.fromText("Your plain text content...");
 
const chunks = await doc.chunk({
  separator: "\n",
});
Embed Chunk Array
After chunking documents, you need to convert the text chunks into numerical vectors that can be used for similarity search. The embed method transforms text chunks into embeddings using your chosen provider and model. This example shows how to generate embeddings for an array of text chunks.


import { openai } from "@ai-sdk/openai";
import { MDocument } from "@mastra/rag";
import { embed } from "ai";
 
const doc = MDocument.fromText("Your text content...");
 
const chunks = await doc.chunk();
 
const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: chunks.map((chunk) => chunk.text),
});

Embed Text with Cohere
When working with alternative embedding providers, you need a way to generate vectors that match your chosen model’s specifications. The embed method supports multiple providers, allowing you to switch between different embedding services. This example shows how to generate embeddings using Cohere’s embedding model.


import { cohere } from "@ai-sdk/cohere";
import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
 
const doc = MDocument.fromText("Your text content...");
 
const chunks = await doc.chunk();
 
const { embeddings } = await embedMany({
  model: cohere.embedding("embed-english-v3.0"),
  values: chunks.map((chunk) => chunk.text),
});

Metadata Extraction
This example demonstrates how to extract and utilize metadata from documents using Mastra’s document processing capabilities. The extracted metadata can be used for document organization, filtering, and enhanced retrieval in RAG systems.

Overview
The system demonstrates metadata extraction in two ways:

Direct metadata extraction from a document
Chunking with metadata extraction
Setup
Dependencies
Import the necessary dependencies:

src/index.ts

import { MDocument } from "@mastra/rag";
Document Creation
Create a document from text content:

src/index.ts

const doc = MDocument.fromText(`Title: The Benefits of Regular Exercise
 
Regular exercise has numerous health benefits. It improves cardiovascular health, 
strengthens muscles, and boosts mental wellbeing.
 
Key Benefits:
• Reduces stress and anxiety
• Improves sleep quality
• Helps maintain healthy weight
• Increases energy levels
 
For optimal results, experts recommend at least 150 minutes of moderate exercise 
per week.`);
1. Direct Metadata Extraction
Extract metadata directly from the document:

src/index.ts

// Configure metadata extraction options
await doc.extractMetadata({
  keywords: true, // Extract important keywords
  summary: true, // Generate a concise summary
});
 
// Retrieve the extracted metadata
const meta = doc.getMetadata();
console.log("Extracted Metadata:", meta);
 
// Example Output:
// Extracted Metadata: {
//   keywords: [
//     'exercise',
//     'health benefits',
//     'cardiovascular health',
//     'mental wellbeing',
//     'stress reduction',
//     'sleep quality'
//   ],
//   summary: 'Regular exercise provides multiple health benefits including improved cardiovascular health, muscle strength, and mental wellbeing. Key benefits include stress reduction, better sleep, weight management, and increased energy. Recommended exercise duration is 150 minutes per week.'
// }
2. Chunking with Metadata
Combine document chunking with metadata extraction:

src/index.ts

// Configure chunking with metadata extraction
await doc.chunk({
  strategy: "recursive", // Use recursive chunking strategy
  size: 200, // Maximum chunk size
  extract: {
    keywords: true, // Extract keywords per chunk
    summary: true, // Generate summary per chunk
  },
});
 
// Get metadata from chunks
const metaTwo = doc.getMetadata();
console.log("Chunk Metadata:", metaTwo);
 
// Example Output:
// Chunk Metadata: {
//   keywords: [
//     'exercise',
//     'health benefits',
//     'cardiovascular health',
//     'mental wellbeing',
//     'stress reduction',
//     'sleep quality'
//   ],
//   summary: 'Regular exercise provides multiple health benefits including improved cardiovascular health, muscle strength, and mental wellbeing. Key benefits include stress reduction, better sleep, weight management, and increased energy. Recommended exercise duration is 150 minutes per week.'
// }

Upsert Embeddings
After generating embeddings, you need to store them in a database that supports vector similarity search. This example shows how to store embeddings in various vector databases for later retrieval.

The PgVector class provides methods to create indexes and insert embeddings into PostgreSQL with the pgvector extension.


import { openai } from "@ai-sdk/openai";
import { PgVector } from "@mastra/pg";
import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
 
const doc = MDocument.fromText("Your text content...");
 
const chunks = await doc.chunk();
 
const { embeddings } = await embedMany({
  values: chunks.map(chunk => chunk.text),
  model: openai.embedding("text-embedding-3-small"),
});
 
const pgVector = new PgVector({ connectionString: process.env.POSTGRES_CONNECTION_STRING! });
 
await pgVector.createIndex({
  indexName: "test_index",
  dimension: 1536,
});
 
await pgVector.upsert({
  indexName: "test_index",
  vectors: embeddings,
  metadata: chunks?.map((chunk: any) => ({ text: chunk.text })),
});

Hybrid Vector Search
When you combine vector similarity search with metadata filters, you can create a hybrid search that is more precise and efficient. This approach combines:

Vector similarity search to find the most relevant documents
Metadata filters to refine the search results based on additional criteria
This example demonstrates how to use hybrid vector search with Mastra and PGVector.

Overview
The system implements filtered vector search using Mastra and PGVector. Here’s what it does:

Queries existing embeddings in PGVector with metadata filters
Shows how to filter by different metadata fields
Demonstrates combining vector similarity with metadata filtering
Note: For examples of how to extract metadata from your documents, see the Metadata Extraction guide.

To learn how to create and store embeddings, see the Upsert Embeddings guide.

Setup
Environment Setup
Make sure to set up your environment variables:

.env
OPENAI_API_KEY=your_openai_api_key_here
POSTGRES_CONNECTION_STRING=your_connection_string_here
Dependencies
Import the necessary dependencies:

src/index.ts

import { embed } from "ai";
import { PgVector } from "@mastra/pg";
import { openai } from "@ai-sdk/openai";
Vector Store Initialization
Initialize PgVector with your connection string:

src/index.ts

const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});
Example Usage
Filter by Metadata Value
src/index.ts

// Create embedding for the query
const { embedding } = await embed({
  model: openai.embedding("text-embedding-3-small"),
  value: "[Insert query based on document here]",
});
 
// Query with metadata filter
const result = await pgVector.query({
  indexName: "embeddings",
  queryVector: embedding,
  topK: 3,
  filter: {
    "path.to.metadata": {
      $eq: "value",
    },
  },
});
 
console.log("Results:", result);

Retrieving Top-K Results
After storing embeddings in a vector database, you need to query them to find similar content.

The query method returns the most semantically similar chunks to your input embedding, ranked by relevance. The topK parameter allows you to specify the number of results to return.

This example shows how to retrieve similar chunks from a Pinecone vector database.


import { openai } from "@ai-sdk/openai";
import { PineconeVector } from "@mastra/pinecone";
import { MDocument } from "@mastra/rag";
import { embedMany } from "ai";
 
const doc = MDocument.fromText("Your text content...");
 
const chunks = await doc.chunk();
 
const { embeddings } = await embedMany({
  values: chunks.map((chunk) => chunk.text),
  model: openai.embedding("text-embedding-3-small"),
});
 
const pinecone = new PineconeVector({
  apiKey: "your-api-key",
});
 
await pinecone.createIndex({
  indexName: "test_index",
  dimension: 1536,
});
 
await pinecone.upsert({
  indexName: "test_index",
  vectors: embeddings,
  metadata: chunks?.map((chunk: any) => ({ text: chunk.text })),
});
 
const topK = 10;
 
const results = await pinecone.query({
  indexName: "test_index",
  queryVector: embeddings[0],
  topK,
});
 
console.log(results);

Re-ranking Results
This example demonstrates how to implement a Retrieval-Augmented Generation (RAG) system with re-ranking using Mastra, OpenAI embeddings, and PGVector for vector storage.

Overview
The system implements RAG with re-ranking using Mastra and OpenAI. Here’s what it does:

Chunks text documents into smaller segments and creates embeddings from them
Stores vectors in a PostgreSQL database
Performs initial vector similarity search
Re-ranks results using Mastra’s rerank function, combining vector similarity, semantic relevance, and position scores
Compares initial and re-ranked results to show improvements
Setup
Environment Setup
Make sure to set up your environment variables:

.env
OPENAI_API_KEY=your_openai_api_key_here
POSTGRES_CONNECTION_STRING=your_connection_string_here
Dependencies
Then, import the necessary dependencies:

src/index.ts

import { openai } from "@ai-sdk/openai";
import { PgVector } from "@mastra/pg";
import { 
  MDocument, 
  rerankWithScorer as rerank, 
  MastraAgentRelevanceScorer 
} from "@mastra/rag";
import { embedMany, embed } from "ai";
Document Processing
Create a document and process it into chunks:

src/index.ts

const doc1 = MDocument.fromText(`
market data shows price resistance levels.
technical charts display moving averages.
support levels guide trading decisions.
breakout patterns signal entry points.
price action determines trade timing.
`);
 
const chunks = await doc1.chunk({
  strategy: "recursive",
  size: 150,
  overlap: 20,
  separator: "\n",
});
Creating and Storing Embeddings
Generate embeddings for the chunks and store them in the vector database:

src/index.ts

const { embeddings } = await embedMany({
  values: chunks.map((chunk) => chunk.text),
  model: openai.embedding("text-embedding-3-small"),
});
 
const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});
 
await pgVector.createIndex({
  indexName: "embeddings",
  dimension: 1536,
});
 
await pgVector.upsert({
  indexName: "embeddings",
  vectors: embeddings,
  metadata: chunks?.map((chunk: any) => ({ text: chunk.text })),
});
Vector Search and Re-ranking
Perform vector search and re-rank the results:

src/index.ts

const query = "explain technical trading analysis";
 
// Get query embedding
const { embedding: queryEmbedding } = await embed({
  value: query,
  model: openai.embedding("text-embedding-3-small"),
});
 
// Get initial results
const initialResults = await pgVector.query({
  indexName: "embeddings",
  queryVector: queryEmbedding,
  topK: 3,
});
 
// Re-rank results
const rerankedResults = await rerank({
  results: initialResults,
  query,
  scorer: new MastraAgentRelevanceScorer('relevance-scorer', openai("gpt-4o-mini")),
  options: {
    weights: {
      semantic: 0.5, // How well the content matches the query semantically
      vector: 0.3, // Original vector similarity score
      position: 0.2, // Preserves original result ordering
    },
    topK: 3,
  },
});
The weights control how different factors influence the final ranking:

semantic: Higher values prioritize semantic understanding and relevance to the query
vector: Higher values favor the original vector similarity scores
position: Higher values help maintain the original ordering of results
Comparing Results
Print both initial and re-ranked results to see the improvement:

src/index.ts

console.log("Initial Results:");
initialResults.forEach((result, index) => {
  console.log(`Result ${index + 1}:`, {
    text: result.metadata.text,
    score: result.score,
  });
});
 
console.log("Re-ranked Results:");
rerankedResults.forEach(({ result, score, details }, index) => {
  console.log(`Result ${index + 1}:`, {
    text: result.metadata.text,
    score: score,
    semantic: details.semantic,
    vector: details.vector,
    position: details.position,
  });
});
The re-ranked results show how combining vector similarity with semantic understanding can improve retrieval quality. Each result includes:

Overall score combining all factors
Semantic relevance score from the language model
Vector similarity score from the embedding comparison
Position-based score for maintaining original order when appropriate

Re-ranking Results with Tools
This example demonstrates how to use Mastra’s vector query tool to implement a Retrieval-Augmented Generation (RAG) system with re-ranking using OpenAI embeddings and PGVector for vector storage.

Overview
The system implements RAG with re-ranking using Mastra and OpenAI. Here’s what it does:

Sets up a Mastra agent with gpt-4o-mini for response generation
Creates a vector query tool with re-ranking capabilities
Chunks text documents into smaller segments and creates embeddings from them
Stores them in a PostgreSQL vector database
Retrieves and re-ranks relevant chunks based on queries
Generates context-aware responses using the Mastra agent
Setup
Environment Setup
Make sure to set up your environment variables:

.env
OPENAI_API_KEY=your_openai_api_key_here
POSTGRES_CONNECTION_STRING=your_connection_string_here
Dependencies
Then, import the necessary dependencies:

index.ts

import { openai } from "@ai-sdk/openai";
import { Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { PgVector } from "@mastra/pg";
import { 
  MDocument, 
  createVectorQueryTool,
  MastraAgentRelevanceScorer,
} from "@mastra/rag";
import { embedMany } from "ai";
Vector Query Tool Creation with Re-ranking
Using createVectorQueryTool imported from @mastra/rag, you can create a tool that can query the vector database and re-rank results:

index.ts

const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
  reranker: {
    model: new MastraAgentRelevanceScorer('relevance-scorer', openai("gpt-4o-mini")),
  },
});
Agent Configuration
Set up the Mastra agent that will handle the responses:

index.ts

export const ragAgent = new Agent({
  name: "RAG Agent",
  instructions: `You are a helpful assistant that answers questions based on the provided context. Keep your answers concise and relevant.
    Important: When asked to answer a question, please base your answer only on the context provided in the tool. 
    If the context doesn't contain enough information to fully answer the question, please state that explicitly.`,
  model: openai("gpt-4o-mini"),
  tools: {
    vectorQueryTool,
  },
});
Instantiate PgVector and Mastra
Instantiate PgVector and Mastra with the components:

index.ts

const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});
 
export const mastra = new Mastra({
  agents: { ragAgent },
  vectors: { pgVector },
});
 
const agent = mastra.getAgent("ragAgent");
Document Processing
Create a document and process it into chunks:

index.ts

const doc1 = MDocument.fromText(`
market data shows price resistance levels.
technical charts display moving averages.
support levels guide trading decisions.
breakout patterns signal entry points.
price action determines trade timing.
 
baseball cards show gradual value increase.
rookie cards command premium prices.
card condition affects resale value.
authentication prevents fake trading.
grading services verify card quality.
 
volume analysis confirms price trends.
sports cards track seasonal demand.
chart patterns predict movements.
mint condition doubles card worth.
resistance breaks trigger orders.
rare cards appreciate yearly.
`);
 
const chunks = await doc1.chunk({
  strategy: "recursive",
  size: 150,
  overlap: 20,
  separator: "\n",
});
Creating and Storing Embeddings
Generate embeddings for the chunks and store them in the vector database:

index.ts

const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: chunks.map((chunk) => chunk.text),
});
 
const vectorStore = mastra.getVector("pgVector");
await vectorStore.createIndex({
  indexName: "embeddings",
  dimension: 1536,
});
 
await vectorStore.upsert({
  indexName: "embeddings",
  vectors: embeddings,
  metadata: chunks?.map((chunk: any) => ({ text: chunk.text })),
});
Querying with Re-ranking
Try different queries to see how the re-ranking affects results:

index.ts

const queryOne = "explain technical trading analysis";
const answerOne = await agent.generate(queryOne);
console.log("\nQuery:", queryOne);
console.log("Response:", answerOne.text);
 
const queryTwo = "explain trading card valuation";
const answerTwo = await agent.generate(queryTwo);
console.log("\nQuery:", queryTwo);
console.log("Response:", answerTwo.text);
 
const queryThree = "how do you analyze market resistance";
const answerThree = await agent.generate(queryThree);
console.log("\nQuery:", queryThree);
console.log("Response:", answerThree.text);

Reranking with Cohere
When retrieving documents for RAG, initial vector similarity search may miss important semantic matches.

Cohere’s reranking service helps improve result relevance by reordering documents using multiple scoring factors.

import { 
  rerankWithScorer as rerank, 
  CohereRelevanceScorer 
} from "@mastra/rag";
 
const results = rerank({
  results: searchResults,
  query: "deployment configuration",
  scorer: new CohereRelevanceScorer('rerank-v3.5'),
  {
    topK: 5,
    weights: {
      semantic: 0.4,
      vector: 0.4,
      position: 0.2,
    },
  },
);

Reranking with ZeroEntropy
import { 
  rerankWithScorer as rerank, 
  ZeroEntropyRelevanceScorer 
} from "@mastra/rag";
 
const results = rerank({
  results: searchResults,
  query: "deployment configuration",
  scorer: new ZeroEntropyRelevanceScorer('zerank-1'),
  {
    topK: 5,
    weights: {
      semantic: 0.4,
      vector: 0.4,
      position: 0.2,
    },
  },
);

Using the Vector Query Tool
This example demonstrates how to implement and use createVectorQueryTool for semantic search in a RAG system. It shows how to configure the tool, manage vector storage, and retrieve relevant context effectively.

Overview
The system implements RAG using Mastra and OpenAI. Here’s what it does:

Sets up a Mastra agent with gpt-4o-mini for response generation
Creates a vector query tool to manage vector store interactions
Uses existing embeddings to retrieve relevant context
Generates context-aware responses using the Mastra agent
Note: To learn how to create and store embeddings, see the Upsert Embeddings guide.

Setup
Environment Setup
Make sure to set up your environment variables:

.env
OPENAI_API_KEY=your_openai_api_key_here
POSTGRES_CONNECTION_STRING=your_connection_string_here
Dependencies
Import the necessary dependencies:

src/index.ts

import { openai } from "@ai-sdk/openai";
import { Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { createVectorQueryTool } from "@mastra/rag";
import { PgVector } from "@mastra/pg";
Vector Query Tool Creation
Create a tool that can query the vector database:

src/index.ts

const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
});
Agent Configuration
Set up the Mastra agent that will handle the responses:

src/index.ts

export const ragAgent = new Agent({
  name: "RAG Agent",
  instructions:
    "You are a helpful assistant that answers questions based on the provided context. Keep your answers concise and relevant.",
  model: openai("gpt-4o-mini"),
  tools: {
    vectorQueryTool,
  },
});
Instantiate PgVector and Mastra
Instantiate PgVector and Mastra with all components:

src/index.ts

const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});
 
export const mastra = new Mastra({
  agents: { ragAgent },
  vectors: { pgVector },
});
 
const agent = mastra.getAgent("ragAgent");
Example Usage
src/index.ts

const prompt = `
[Insert query based on document here]
Please base your answer only on the context provided in the tool. 
If the context doesn't contain enough information to fully answer the question, please state that explicitly.
`;
 
const completion = await agent.generate(prompt);
console.log(completion.text);

Optimizing Information Density
This example demonstrates how to implement a Retrieval-Augmented Generation (RAG) system using Mastra, OpenAI embeddings, and PGVector for vector storage. The system uses an agent to clean the initial chunks to optimize information density and deduplicate data.

Overview
The system implements RAG using Mastra and OpenAI, this time optimizing information density through LLM-based processing. Here’s what it does:

Sets up a Mastra agent with gpt-4o-mini that can handle both querying and cleaning documents
Creates vector query and document chunking tools for the agent to use
Processes the initial document:
Chunks text documents into smaller segments
Creates embeddings for the chunks
Stores them in a PostgreSQL vector database
Performs an initial query to establish baseline response quality
Optimizes the data:
Uses the agent to clean and deduplicate chunks
Creates new embeddings for the cleaned chunks
Updates the vector store with optimized data
Performs the same query again to demonstrate improved response quality
Setup
Environment Setup
Make sure to set up your environment variables:

.env
OPENAI_API_KEY=your_openai_api_key_here
POSTGRES_CONNECTION_STRING=your_connection_string_here
Dependencies
Then, import the necessary dependencies:

index.ts

import { openai } from "@ai-sdk/openai";
import { Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { PgVector } from "@mastra/pg";
import {
  MDocument,
  createVectorQueryTool,
  createDocumentChunkerTool,
} from "@mastra/rag";
import { embedMany } from "ai";
Tool Creation
Vector Query Tool
Using createVectorQueryTool imported from @mastra/rag, you can create a tool that can query the vector database.

index.ts

const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
});
Document Chunker Tool
Using createDocumentChunkerTool imported from @mastra/rag, you can create a tool that chunks the document and sends the chunks to your agent.

index.ts

const doc = MDocument.fromText(yourText);
 
const documentChunkerTool = createDocumentChunkerTool({
  doc,
  params: {
    strategy: "recursive",
    size: 512,
    overlap: 25,
    separator: "\n",
  },
});
Agent Configuration
Set up a single Mastra agent that can handle both querying and cleaning:

index.ts

const ragAgent = new Agent({
  name: "RAG Agent",
  instructions: `You are a helpful assistant that handles both querying and cleaning documents.
    When cleaning: Process, clean, and label data, remove irrelevant information and deduplicate content while preserving key facts.
    When querying: Provide answers based on the available context. Keep your answers concise and relevant.
    
    Important: When asked to answer a question, please base your answer only on the context provided in the tool. If the context doesn't contain enough information to fully answer the question, please state that explicitly.
    `,
  model: openai("gpt-4o-mini"),
  tools: {
    vectorQueryTool,
    documentChunkerTool,
  },
});
Instantiate PgVector and Mastra
Instantiate PgVector and Mastra with the components:

index.ts

const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});
 
export const mastra = new Mastra({
  agents: { ragAgent },
  vectors: { pgVector },
});
const agent = mastra.getAgent("ragAgent");
Document Processing
Chunk the initial document and create embeddings:

index.ts

const chunks = await doc.chunk({
  strategy: "recursive",
  size: 256,
  overlap: 50,
  separator: "\n",
});
 
const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: chunks.map((chunk) => chunk.text),
});
 
const vectorStore = mastra.getVector("pgVector");
await vectorStore.createIndex({
  indexName: "embeddings",
  dimension: 1536,
});
 
await vectorStore.upsert({
  indexName: "embeddings",
  vectors: embeddings,
  metadata: chunks?.map((chunk: any) => ({ text: chunk.text })),
});
Initial Query
Let’s try querying the raw data to establish a baseline:

index.ts

// Generate response using the original embeddings
const query = "What are all the technologies mentioned for space exploration?";
const originalResponse = await agent.generate(query);
console.log("\nQuery:", query);
console.log("Response:", originalResponse.text);
Data Optimization
After seeing the initial results, we can clean the data to improve quality:

index.ts

const chunkPrompt = `Use the tool provided to clean the chunks. Make sure to filter out irrelevant information that is not space related and remove duplicates.`;
 
const newChunks = await agent.generate(chunkPrompt);
const updatedDoc = MDocument.fromText(newChunks.text);
 
const updatedChunks = await updatedDoc.chunk({
  strategy: "recursive",
  size: 256,
  overlap: 50,
  separator: "\n",
});
 
const { embeddings: cleanedEmbeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: updatedChunks.map((chunk) => chunk.text),
});
 
// Update the vector store with cleaned embeddings
await vectorStore.deleteIndex({ indexName: "embeddings" });
await vectorStore.createIndex({
  indexName: "embeddings",
  dimension: 1536,
});
 
await vectorStore.upsert({
  indexName: "embeddings",
  vectors: cleanedEmbeddings,
  metadata: updatedChunks?.map((chunk: any) => ({ text: chunk.text })),
});
Optimized Query
Query the data again after cleaning to observe any differences in the response:

index.ts

// Query again with cleaned embeddings
const cleanedResponse = await agent.generate(query);
console.log("\nQuery:", query);
console.log("Response:", cleanedResponse.text);

Agent-Driven Metadata Filtering
This example demonstrates how to implement a Retrieval-Augmented Generation (RAG) system using Mastra, OpenAI embeddings, and PGVector for vector storage. This system uses an agent to construct metadata filters from a user’s query to search for relevant chunks in the vector store, reducing the amount of results returned.

Overview
The system implements metadata filtering using Mastra and OpenAI. Here’s what it does:

Sets up a Mastra agent with gpt-4o-mini to understand queries and identify filter requirements
Creates a vector query tool to handle metadata filtering and semantic search
Processes documents into chunks with metadata and embeddings
Stores both vectors and metadata in PGVector for efficient retrieval
Processes queries by combining metadata filters with semantic search
When a user asks a question:

The agent analyzes the query to understand the intent
Constructs appropriate metadata filters (e.g., by topic, date, category)
Uses the vector query tool to find the most relevant information
Generates a contextual response based on the filtered results
Setup
Environment Setup
Make sure to set up your environment variables:

.env
OPENAI_API_KEY=your_openai_api_key_here
POSTGRES_CONNECTION_STRING=your_connection_string_here
Dependencies
Then, import the necessary dependencies:

index.ts

import { openai } from "@ai-sdk/openai";
import { Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { PgVector, PGVECTOR_PROMPT } from "@mastra/pg";
import { createVectorQueryTool, MDocument } from "@mastra/rag";
import { embedMany } from "ai";
Vector Query Tool Creation
Using createVectorQueryTool imported from @mastra/rag, you can create a tool that enables metadata filtering. Each vector store has its own prompt that defines the supported filter operators and syntax:

index.ts

const vectorQueryTool = createVectorQueryTool({
  id: "vectorQueryTool",
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
  enableFilter: true,
});
Each prompt includes:

Supported operators (comparison, array, logical, element)
Example usage for each operator
Store-specific restrictions and rules
Complex query examples
Document Processing
Create a document and process it into chunks with metadata:

index.ts

const doc = MDocument.fromText(
  `The Impact of Climate Change on Global Agriculture...`,
);
 
const chunks = await doc.chunk({
  strategy: "recursive",
  size: 512,
  overlap: 50,
  separator: "\n",
  extract: {
    keywords: true, // Extracts keywords from each chunk
  },
});
Transform Chunks into Metadata
Transform chunks into metadata that can be filtered:

index.ts

const chunkMetadata = chunks?.map((chunk: any, index: number) => ({
  text: chunk.text,
  ...chunk.metadata,
  nested: {
    keywords: chunk.metadata.excerptKeywords
      .replace("KEYWORDS:", "")
      .split(",")
      .map((k) => k.trim()),
    id: index,
  },
}));
Agent Configuration
The agent is configured to understand user queries and translate them into appropriate metadata filters.

The agent requires both the vector query tool and a system prompt containing:

Metadata structure for available filter fields
Vector store prompt for filter operations and syntax
index.ts

export const ragAgent = new Agent({
  name: "RAG Agent",
  model: openai("gpt-4o-mini"),
  instructions: `
  You are a helpful assistant that answers questions based on the provided context. Keep your answers concise and relevant.
 
  Filter the context by searching the metadata.
  
  The metadata is structured as follows:
 
  {
    text: string,
    excerptKeywords: string,
    nested: {
      keywords: string[],
      id: number,
    },
  }
 
  ${PGVECTOR_PROMPT}
 
  Important: When asked to answer a question, please base your answer only on the context provided in the tool. 
  If the context doesn't contain enough information to fully answer the question, please state that explicitly.
  `,
  tools: { vectorQueryTool },
});
The agent’s instructions are designed to:

Process user queries to identify filter requirements
Use the metadata structure to find relevant information
Apply appropriate filters through the vectorQueryTool and the provided vector store prompt
Generate responses based on the filtered context
Note: Different vector stores have specific prompts available. See Vector Store Prompts for details.

Instantiate PgVector and Mastra
Instantiate PgVector and Mastra with the components:

index.ts

const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});
 
export const mastra = new Mastra({
  agents: { ragAgent },
  vectors: { pgVector },
});
const agent = mastra.getAgent("ragAgent");
Creating and Storing Embeddings
Generate embeddings and store them with metadata:

index.ts

const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: chunks.map((chunk) => chunk.text),
});
 
const vectorStore = mastra.getVector("pgVector");
await vectorStore.createIndex({
  indexName: "embeddings",
  dimension: 1536,
});
 
// Store both embeddings and metadata together
await vectorStore.upsert({
  indexName: "embeddings",
  vectors: embeddings,
  metadata: chunkMetadata,
});
The upsert operation stores both the vector embeddings and their associated metadata, enabling combined semantic search and metadata filtering capabilities.

Metadata-Based Querying
Try different queries using metadata filters:

index.ts

const queryOne = "What are the adaptation strategies mentioned?";
const answerOne = await agent.generate(queryOne);
console.log("\nQuery:", queryOne);
console.log("Response:", answerOne.text);
 
const queryTwo =
  'Show me recent sections. Check the "nested.id" field and return values that are greater than 2.';
const answerTwo = await agent.generate(queryTwo);
console.log("\nQuery:", queryTwo);
console.log("Response:", answerTwo.text);
 
const queryThree =
  'Search the "text" field using regex operator to find sections containing "temperature".';
const answerThree = await agent.generate(queryThree);
console.log("\nQuery:", queryThree);
console.log("Response:", answerThree.text);

Chain of Thought Prompting
This example demonstrates how to implement a Retrieval-Augmented Generation (RAG) system using Mastra, OpenAI embeddings, and PGVector for vector storage, with an emphasis on chain-of-thought reasoning.

Overview
The system implements RAG using Mastra and OpenAI with chain-of-thought prompting. Here’s what it does:

Sets up a Mastra agent with gpt-4o-mini for response generation
Creates a vector query tool to manage vector store interactions
Chunks text documents into smaller segments
Creates embeddings for these chunks
Stores them in a PostgreSQL vector database
Retrieves relevant chunks based on queries using vector query tool
Generates context-aware responses using chain-of-thought reasoning
Setup
Environment Setup
Make sure to set up your environment variables:

.env
OPENAI_API_KEY=your_openai_api_key_here
POSTGRES_CONNECTION_STRING=your_connection_string_here
Dependencies
Then, import the necessary dependencies:

index.ts

import { openai } from "@ai-sdk/openai";
import { Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { PgVector } from "@mastra/pg";
import { createVectorQueryTool, MDocument } from "@mastra/rag";
import { embedMany } from "ai";
Vector Query Tool Creation
Using createVectorQueryTool imported from @mastra/rag, you can create a tool that can query the vector database.

index.ts

const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
});
Agent Configuration
Set up the Mastra agent with chain-of-thought prompting instructions:

index.ts

export const ragAgent = new Agent({
  name: "RAG Agent",
  instructions: `You are a helpful assistant that answers questions based on the provided context.
Follow these steps for each response:
 
1. First, carefully analyze the retrieved context chunks and identify key information.
2. Break down your thinking process about how the retrieved information relates to the query.
3. Explain how you're connecting different pieces from the retrieved chunks.
4. Draw conclusions based only on the evidence in the retrieved context.
5. If the retrieved chunks don't contain enough information, explicitly state what's missing.
 
Format your response as:
THOUGHT PROCESS:
- Step 1: [Initial analysis of retrieved chunks]
- Step 2: [Connections between chunks]
- Step 3: [Reasoning based on chunks]
 
FINAL ANSWER:
[Your concise answer based on the retrieved context]
 
Important: When asked to answer a question, please base your answer only on the context provided in the tool. 
If the context doesn't contain enough information to fully answer the question, please state that explicitly.
Remember: Explain how you're using the retrieved information to reach your conclusions.
`,
  model: openai("gpt-4o-mini"),
  tools: { vectorQueryTool },
});
Instantiate PgVector and Mastra
Instantiate PgVector and Mastra with all components:

index.ts

const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});
 
export const mastra = new Mastra({
  agents: { ragAgent },
  vectors: { pgVector },
});
const agent = mastra.getAgent("ragAgent");
Document Processing
Create a document and process it into chunks:

index.ts

const doc = MDocument.fromText(
  `The Impact of Climate Change on Global Agriculture...`,
);
 
const chunks = await doc.chunk({
  strategy: "recursive",
  size: 512,
  overlap: 50,
  separator: "\n",
});
Creating and Storing Embeddings
Generate embeddings for the chunks and store them in the vector database:

index.ts

const { embeddings } = await embedMany({
  values: chunks.map((chunk) => chunk.text),
  model: openai.embedding("text-embedding-3-small"),
});
 
const vectorStore = mastra.getVector("pgVector");
await vectorStore.createIndex({
  indexName: "embeddings",
  dimension: 1536,
});
await vectorStore.upsert({
  indexName: "embeddings",
  vectors: embeddings,
  metadata: chunks?.map((chunk: any) => ({ text: chunk.text })),
});
Chain-of-Thought Querying
Try different queries to see how the agent breaks down its reasoning:

index.ts

const answerOne = await agent.generate(
  "What are the main adaptation strategies for farmers?",
);
console.log("\nQuery:", "What are the main adaptation strategies for farmers?");
console.log("Response:", answerOne.text);
 
const answerTwo = await agent.generate(
  "Analyze how temperature affects crop yields.",
);
console.log("\nQuery:", "Analyze how temperature affects crop yields.");
console.log("Response:", answerTwo.text);
 
const answerThree = await agent.generate(
  "What connections can you draw between climate change and food security?",
);
console.log(
  "\nQuery:",
  "What connections can you draw between climate change and food security?",
);
console.log("Response:", answerThree.text);

Structured Reasoning with Workflows
This example demonstrates how to implement a Retrieval-Augmented Generation (RAG) system using Mastra, OpenAI embeddings, and PGVector for vector storage, with an emphasis on structured reasoning through a defined workflow.

Overview
The system implements RAG using Mastra and OpenAI with chain-of-thought prompting through a defined workflow. Here’s what it does:

Sets up a Mastra agent with gpt-4o-mini for response generation
Creates a vector query tool to manage vector store interactions
Defines a workflow with multiple steps for chain-of-thought reasoning
Processes and chunks text documents
Creates and stores embeddings in PostgreSQL
Generates responses through the workflow steps
Setup
Environment Setup
Make sure to set up your environment variables:

.env
OPENAI_API_KEY=your_openai_api_key_here
POSTGRES_CONNECTION_STRING=your_connection_string_here
Dependencies
Import the necessary dependencies:

index.ts

import { openai } from "@ai-sdk/openai";
import { Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { Step, Workflow } from "@mastra/core/workflows";
import { PgVector } from "@mastra/pg";
import { createVectorQueryTool, MDocument } from "@mastra/rag";
import { embedMany } from "ai";
import { z } from "zod";
Workflow Definition
First, define the workflow with its trigger schema:

index.ts

export const ragWorkflow = new Workflow({
  name: "rag-workflow",
  triggerSchema: z.object({
    query: z.string(),
  }),
});
Vector Query Tool Creation
Create a tool for querying the vector database:

index.ts

const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
});
Agent Configuration
Set up the Mastra agent:

index.ts

export const ragAgent = new Agent({
  name: "RAG Agent",
  instructions: `You are a helpful assistant that answers questions based on the provided context.`,
  model: openai("gpt-4o-mini"),
  tools: {
    vectorQueryTool,
  },
});
Workflow Steps
The workflow is divided into multiple steps for chain-of-thought reasoning:

1. Context Analysis Step
index.ts

const analyzeContext = new Step({
  id: "analyzeContext",
  outputSchema: z.object({
    initialAnalysis: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    console.log("---------------------------");
    const ragAgent = mastra?.getAgent("ragAgent");
    const query = context?.getStepResult<{ query: string }>("trigger")?.query;
 
    const analysisPrompt = `${query} 1. First, carefully analyze the retrieved context chunks and identify key information.`;
 
    const analysis = await ragAgent?.generate(analysisPrompt);
    console.log(analysis?.text);
    return {
      initialAnalysis: analysis?.text ?? "",
    };
  },
});
2. Thought Breakdown Step
index.ts

const breakdownThoughts = new Step({
  id: "breakdownThoughts",
  outputSchema: z.object({
    breakdown: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    console.log("---------------------------");
    const ragAgent = mastra?.getAgent("ragAgent");
    const analysis = context?.getStepResult<{
      initialAnalysis: string;
    }>("analyzeContext")?.initialAnalysis;
 
    const connectionPrompt = `
      Based on the initial analysis: ${analysis}
 
      2. Break down your thinking process about how the retrieved information relates to the query.
    `;
 
    const connectionAnalysis = await ragAgent?.generate(connectionPrompt);
    console.log(connectionAnalysis?.text);
    return {
      breakdown: connectionAnalysis?.text ?? "",
    };
  },
});
3. Connection Step
index.ts

const connectPieces = new Step({
  id: "connectPieces",
  outputSchema: z.object({
    connections: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    console.log("---------------------------");
    const ragAgent = mastra?.getAgent("ragAgent");
    const process = context?.getStepResult<{
      breakdown: string;
    }>("breakdownThoughts")?.breakdown;
    const connectionPrompt = `
        Based on the breakdown: ${process}
 
        3. Explain how you're connecting different pieces from the retrieved chunks.
    `;
 
    const connections = await ragAgent?.generate(connectionPrompt);
    console.log(connections?.text);
    return {
      connections: connections?.text ?? "",
    };
  },
});
4. Conclusion Step
index.ts

const drawConclusions = new Step({
  id: "drawConclusions",
  outputSchema: z.object({
    conclusions: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    console.log("---------------------------");
    const ragAgent = mastra?.getAgent("ragAgent");
    const evidence = context?.getStepResult<{
      connections: string;
    }>("connectPieces")?.connections;
    const conclusionPrompt = `
        Based on the connections: ${evidence}
 
        4. Draw conclusions based only on the evidence in the retrieved context.
    `;
 
    const conclusions = await ragAgent?.generate(conclusionPrompt);
    console.log(conclusions?.text);
    return {
      conclusions: conclusions?.text ?? "",
    };
  },
});
5. Final Answer Step
index.ts

const finalAnswer = new Step({
  id: "finalAnswer",
  outputSchema: z.object({
    finalAnswer: z.string(),
  }),
  execute: async ({ context, mastra }) => {
    console.log("---------------------------");
    const ragAgent = mastra?.getAgent("ragAgent");
    const conclusions = context?.getStepResult<{
      conclusions: string;
    }>("drawConclusions")?.conclusions;
    const answerPrompt = `
        Based on the conclusions: ${conclusions}
        Format your response as:
        THOUGHT PROCESS:
        - Step 1: [Initial analysis of retrieved chunks]
        - Step 2: [Connections between chunks]
        - Step 3: [Reasoning based on chunks]
 
        FINAL ANSWER:
        [Your concise answer based on the retrieved context]`;
 
    const finalAnswer = await ragAgent?.generate(answerPrompt);
    console.log(finalAnswer?.text);
    return {
      finalAnswer: finalAnswer?.text ?? "",
    };
  },
});
Workflow Configuration
Connect all the steps in the workflow:

index.ts

ragWorkflow
  .step(analyzeContext)
  .then(breakdownThoughts)
  .then(connectPieces)
  .then(drawConclusions)
  .then(finalAnswer);
 
ragWorkflow.commit();
Instantiate PgVector and Mastra
Instantiate PgVector and Mastra with all components:

index.ts

const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});
 
export const mastra = new Mastra({
  agents: { ragAgent },
  vectors: { pgVector },
  workflows: { ragWorkflow },
});
Document Processing
Process and chunks the document:

index.ts

const doc = MDocument.fromText(
  `The Impact of Climate Change on Global Agriculture...`,
);
 
const chunks = await doc.chunk({
  strategy: "recursive",
  size: 512,
  overlap: 50,
  separator: "\n",
});
Embedding Creation and Storage
Generate and store embeddings:

index.ts

const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: chunks.map((chunk) => chunk.text),
});
 
const vectorStore = mastra.getVector("pgVector");
await vectorStore.createIndex({
  indexName: "embeddings",
  dimension: 1536,
});
await vectorStore.upsert({
  indexName: "embeddings",
  vectors: embeddings,
  metadata: chunks?.map((chunk: any) => ({ text: chunk.text })),
});
Workflow Execution
Here’s how to execute the workflow with a query:

index.ts

const query = "What are the main adaptation strategies for farmers?";
 
console.log("\nQuery:", query);
const prompt = `
    Please answer the following question:
    ${query}
 
    Please base your answer only on the context provided in the tool. If the context doesn't contain enough information to fully answer the question, please state that explicitly.
    `;
 
const { runId, start } = await ragWorkflow.createRunAsync();
 
console.log("Run:", runId);
 
const workflowResult = await start({
  triggerData: {
    query: prompt,
  },
});
console.log("\nThought Process:");
console.log(workflowResult.results);

Graph RAG
This example demonstrates how to implement a Retrieval-Augmented Generation (RAG) system using Mastra, OpenAI embeddings, and PGVector for vector storage.

Overview
The system implements Graph RAG using Mastra and OpenAI. Here’s what it does:

Sets up a Mastra agent with gpt-4o-mini for response generation
Creates a GraphRAG tool to manage vector store interactions and knowledge graph creation/traversal
Chunks text documents into smaller segments
Creates embeddings for these chunks
Stores them in a PostgreSQL vector database
Creates a knowledge graph of relevant chunks based on queries using GraphRAG tool
Tool returns results from vector store and creates knowledge graph
Traverses knowledge graph using query
Generates context-aware responses using the Mastra agent
Setup
Environment Setup
Make sure to set up your environment variables:

.env
OPENAI_API_KEY=your_openai_api_key_here
POSTGRES_CONNECTION_STRING=your_connection_string_here
Dependencies
Then, import the necessary dependencies:

index.ts

import { openai } from "@ai-sdk/openai";
import { Mastra } from "@mastra/core";
import { Agent } from "@mastra/core/agent";
import { PgVector } from "@mastra/pg";
import { MDocument, createGraphRAGTool } from "@mastra/rag";
import { embedMany } from "ai";
GraphRAG Tool Creation
Using createGraphRAGTool imported from @mastra/rag, you can create a tool that queries the vector database and converts the results into a knowledge graph:

index.ts

const graphRagTool = createGraphRAGTool({
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
  graphOptions: {
    dimension: 1536,
    threshold: 0.7,
  },
});
Agent Configuration
Set up the Mastra agent that will handle the responses:

index.ts

const ragAgent = new Agent({
  name: "GraphRAG Agent",
  instructions: `You are a helpful assistant that answers questions based on the provided context. Format your answers as follows:
 
1. DIRECT FACTS: List only the directly stated facts from the text relevant to the question (2-3 bullet points)
2. CONNECTIONS MADE: List the relationships you found between different parts of the text (2-3 bullet points)
3. CONCLUSION: One sentence summary that ties everything together
 
Keep each section brief and focus on the most important points.
 
Important: When asked to answer a question, please base your answer only on the context provided in the tool. 
If the context doesn't contain enough information to fully answer the question, please state that explicitly.`,
  model: openai("gpt-4o-mini"),
  tools: {
    graphRagTool,
  },
});
Instantiate PgVector and Mastra
Instantiate PgVector and Mastra with the components:

index.ts

const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING!,
});
 
export const mastra = new Mastra({
  agents: { ragAgent },
  vectors: { pgVector },
});
const agent = mastra.getAgent("ragAgent");
Document Processing
Create a document and process it into chunks:

index.ts

const doc = MDocument.fromText(`
# Riverdale Heights: Community Development Study
// ... text content ...
`);
 
const chunks = await doc.chunk({
  strategy: "recursive",
  size: 512,
  overlap: 50,
  separator: "\n",
});
Creating and Storing Embeddings
Generate embeddings for the chunks and store them in the vector database:

index.ts

const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: chunks.map((chunk) => chunk.text),
});
 
const vectorStore = mastra.getVector("pgVector");
await vectorStore.createIndex({
  indexName: "embeddings",
  dimension: 1536,
});
await vectorStore.upsert({
  indexName: "embeddings",
  vectors: embeddings,
  metadata: chunks?.map((chunk: any) => ({ text: chunk.text })),
});
Graph-Based Querying
Try different queries to explore relationships in the data:

index.ts

const queryOne =
  "What are the direct and indirect effects of early railway decisions on Riverdale Heights' current state?";
const answerOne = await ragAgent.generate(queryOne);
console.log("\nQuery:", queryOne);
console.log("Response:", answerOne.text);
 
const queryTwo =
  "How have changes in transportation infrastructure affected different generations of local businesses and community spaces?";
const answerTwo = await ragAgent.generate(queryTwo);
console.log("\nQuery:", queryTwo);
console.log("Response:", answerTwo.text);
 
const queryThree =
  "Compare how the Rossi family business and Thompson Steel Works responded to major infrastructure changes, and how their responses affected the community.";
const answerThree = await ragAgent.generate(queryThree);
console.log("\nQuery:", queryThree);
console.log("Response:", answerThree.text);
 
const queryFour =
  "Trace how the transformation of the Thompson Steel Works site has influenced surrounding businesses and cultural spaces from 1932 to present.";
const answerFour = await ragAgent.generate(queryFour);
console.log("\nQuery:", queryFour);
console.log("Response:", answerFour.text);

Database-Specific Configurations
This example demonstrates how to use database-specific configurations with vector query tools to optimize performance and leverage unique features of different vector stores.

Multi-Environment Setup
Use different configurations for different environments:

import { openai } from "@ai-sdk/openai";
import { createVectorQueryTool } from "@mastra/rag";
import { RuntimeContext } from "@mastra/core/runtime-context";
 
// Base configuration
const createSearchTool = (environment: 'dev' | 'staging' | 'prod') => {
  return createVectorQueryTool({
    vectorStoreName: "pinecone",
    indexName: "documents",
    model: openai.embedding("text-embedding-3-small"),
    databaseConfig: {
      pinecone: {
        namespace: environment
      }
    }
  });
};
 
// Create environment-specific tools
const devSearchTool = createSearchTool('dev');
const prodSearchTool = createSearchTool('prod');
 
// Or use runtime override
const dynamicSearchTool = createVectorQueryTool({
  vectorStoreName: "pinecone", 
  indexName: "documents",
  model: openai.embedding("text-embedding-3-small")
});
 
// Switch environment at runtime
const switchEnvironment = async (environment: string, query: string) => {
  const runtimeContext = new RuntimeContext();
  runtimeContext.set('databaseConfig', {
    pinecone: {
      namespace: environment
    }
  });
 
  return await dynamicSearchTool.execute({
    context: { queryText: query },
    mastra,
    runtimeContext
  });
};
Performance Optimization with pgVector
Optimize search performance for different use cases:

// High accuracy configuration - slower but more precise
const highAccuracyTool = createVectorQueryTool({
  vectorStoreName: "postgres",
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
  databaseConfig: {
    pgvector: {
      ef: 400,          // High accuracy for HNSW
      probes: 20,       // High recall for IVFFlat
      minScore: 0.85    // High quality threshold
    }
  }
});
 
// Use for critical searches where accuracy is paramount
const criticalSearch = async (query: string) => {
  return await highAccuracyTool.execute({
    context: { 
      queryText: query,
      topK: 5  // Fewer, higher quality results
    },
    mastra
  });
};
Multi-Tenant Application with Pinecone
Implement tenant isolation using Pinecone namespaces:

interface Tenant {
  id: string;
  name: string;
  namespace: string;
}
 
class MultiTenantSearchService {
  private searchTool: RagTool
 
  constructor() {
    this.searchTool = createVectorQueryTool({
      vectorStoreName: "pinecone",
      indexName: "shared-documents",
      model: openai.embedding("text-embedding-3-small")
    });
  }
 
  async searchForTenant(tenant: Tenant, query: string) {
    const runtimeContext = new RuntimeContext();
    
    // Isolate search to tenant's namespace
    runtimeContext.set('databaseConfig', {
      pinecone: {
        namespace: tenant.namespace
      }
    });
 
    const results = await this.searchTool.execute({
      context: { 
        queryText: query,
        topK: 10
      },
      mastra,
      runtimeContext
    });
 
    // Add tenant context to results
    return {
      tenant: tenant.name,
      query,
      results: results.relevantContext,
      sources: results.sources
    };
  }
 
  async bulkSearchForTenants(tenants: Tenant[], query: string) {
    const promises = tenants.map(tenant => 
      this.searchForTenant(tenant, query)
    );
    
    return await Promise.all(promises);
  }
}
 
// Usage
const searchService = new MultiTenantSearchService();
 
const tenants = [
  { id: '1', name: 'Company A', namespace: 'company-a' },
  { id: '2', name: 'Company B', namespace: 'company-b' }
];
 
const results = await searchService.searchForTenant(
  tenants[0], 
  "product documentation"
);
Hybrid Search with Pinecone
Combine semantic and keyword search:

const hybridSearchTool = createVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: "documents",
  model: openai.embedding("text-embedding-3-small"),
  databaseConfig: {
    pinecone: {
      namespace: "production",
      sparseVector: {
        // Example sparse vector for keyword "API"
        indices: [1, 5, 10, 15],
        values: [0.8, 0.6, 0.4, 0.2]
      }
    }
  }
});
 
// Helper function to generate sparse vectors for keywords
const generateSparseVector = (keywords: string[]) => {
  // This is a simplified example - in practice, you'd use
  // a proper sparse encoding method like BM25
  const indices: number[] = [];
  const values: number[] = [];
  
  keywords.forEach((keyword, i) => {
    const hash = keyword.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    indices.push(Math.abs(hash) % 1000);
    values.push(1.0 / (i + 1)); // Decrease weight for later keywords
  });
  
  return { indices, values };
};
 
const hybridSearch = async (query: string, keywords: string[]) => {
  const runtimeContext = new RuntimeContext();
  
  if (keywords.length > 0) {
    const sparseVector = generateSparseVector(keywords);
    runtimeContext.set('databaseConfig', {
      pinecone: {
        namespace: "production",
        sparseVector
      }
    });
  }
 
  return await hybridSearchTool.execute({
    context: { queryText: query },
    mastra,
    runtimeContext
  });
};
 
// Usage
const results = await hybridSearch(
  "How to use the REST API",
  ["API", "REST", "documentation"]
);
Quality-Gated Search
Implement progressive search quality:

const createQualityGatedSearch = () => {
  const baseConfig = {
    vectorStoreName: "postgres",
    indexName: "embeddings",
    model: openai.embedding("text-embedding-3-small")
  };
 
  return {
    // High quality search first
    highQuality: createVectorQueryTool({
      ...baseConfig,
      databaseConfig: {
        pgvector: {
          minScore: 0.85,
          ef: 200,
          probes: 15
        }
      }
    }),
    
    // Medium quality fallback
    mediumQuality: createVectorQueryTool({
      ...baseConfig,
      databaseConfig: {
        pgvector: {
          minScore: 0.7,
          ef: 150,
          probes: 10
        }
      }
    }),
    
    // Low quality last resort
    lowQuality: createVectorQueryTool({
      ...baseConfig,
      databaseConfig: {
        pgvector: {
          minScore: 0.5,
          ef: 100,
          probes: 5
        }
      }
    })
  };
};
 
const progressiveSearch = async (query: string, minResults: number = 3) => {
  const tools = createQualityGatedSearch();
  
  // Try high quality first
  let results = await tools.highQuality.execute({
    context: { queryText: query },
    mastra
  });
  
  if (results.sources.length >= minResults) {
    return { quality: 'high', ...results };
  }
  
  // Fallback to medium quality
  results = await tools.mediumQuality.execute({
    context: { queryText: query },
    mastra
  });
  
  if (results.sources.length >= minResults) {
    return { quality: 'medium', ...results };
  }
  
  // Last resort: low quality
  results = await tools.lowQuality.execute({
    context: { queryText: query },
    mastra
  });
  
  return { quality: 'low', ...results };
};
 
// Usage
const results = await progressiveSearch("complex technical query", 5);
console.log(`Found ${results.sources.length} results with ${results.quality} qu