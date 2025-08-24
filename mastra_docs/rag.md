RAG (Retrieval-Augmented Generation) in Mastra
RAG in Mastra helps you enhance LLM outputs by incorporating relevant context from your own data sources, improving accuracy and grounding responses in real information.

Mastra’s RAG system provides:

Standardized APIs to process and embed documents
Support for multiple vector stores
Chunking and embedding strategies for optimal retrieval
Observability for tracking embedding and retrieval performance
Example
To implement RAG, you process your documents into chunks, create embeddings, store them in a vector database, and then retrieve relevant context at query time.


import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { PgVector } from "@mastra/pg";
import { MDocument } from "@mastra/rag";
import { z } from "zod";
 
// 1. Initialize document
const doc = MDocument.fromText(`Your document text here...`);
 
// 2. Create chunks
const chunks = await doc.chunk({
  strategy: "recursive",
  size: 512,
  overlap: 50,
});
 
// 3. Generate embeddings; we need to pass the text of each chunk
const { embeddings } = await embedMany({
  values: chunks.map((chunk) => chunk.text),
  model: openai.embedding("text-embedding-3-small"),
});
 
// 4. Store in vector database
const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
});
await pgVector.upsert({
  indexName: "embeddings",
  vectors: embeddings,
}); // using an index name of 'embeddings'
 
// 5. Query similar chunks
const results = await pgVector.query({
  indexName: "embeddings",
  queryVector: queryVector,
  topK: 3,
}); // queryVector is the embedding of the query
 
console.log("Similar chunks:", results);
This example shows the essentials: initialize a document, create chunks, generate embeddings, store them, and query for similar content.

Document Processing
The basic building block of RAG is document processing. Documents can be chunked using various strategies (recursive, sliding window, etc.) and enriched with metadata. See the chunking and embedding doc.

Vector Storage
Mastra supports multiple vector stores for embedding persistence and similarity search, including pgvector, Pinecone, Qdrant, and MongoDB. See the vector database doc.

Observability and Debugging
Mastra’s RAG system includes observability features to help you optimize your retrieval pipeline:

Track embedding generation performance and costs
Monitor chunk quality and retrieval relevance
Analyze query patterns and cache hit rates
Export metrics to your observability platform
See the OTel Configuration page for more details.

More resources
Chain of Thought RAG Example
All RAG Examples (including different chunking strategies, embedding models, and vector stores)

Chunking and Embedding Documents
Before processing, create a MDocument instance from your content. You can initialize it from various formats:


const docFromText = MDocument.fromText("Your plain text content...");
const docFromHTML = MDocument.fromHTML("<html>Your HTML content...</html>");
const docFromMarkdown = MDocument.fromMarkdown("# Your Markdown content...");
const docFromJSON = MDocument.fromJSON(`{ "key": "value" }`);
Step 1: Document Processing
Use chunk to split documents into manageable pieces. Mastra supports multiple chunking strategies optimized for different document types:

recursive: Smart splitting based on content structure
character: Simple character-based splits
token: Token-aware splitting
markdown: Markdown-aware splitting
semantic-markdown: Markdown splitting based on related header families
html: HTML structure-aware splitting
json: JSON structure-aware splitting
latex: LaTeX structure-aware splitting
sentence: Sentence-aware splitting
Note: Each strategy accepts different parameters optimized for its chunking approach.

Here’s an example of how to use the recursive strategy:


const chunks = await doc.chunk({
  strategy: "recursive",
  maxSize: 512,
  overlap: 50,
  separators: ["\n"],
  extract: {
    metadata: true, // Optionally extract metadata
  },
});
For text where preserving sentence structure is important, here’s an example of how to use the sentence strategy:


const chunks = await doc.chunk({
  strategy: "sentence",
  maxSize: 450,
  minSize: 50,
  overlap: 0,
  sentenceEnders: ["."],
  keepSeparator: true,
});
For markdown documents where preserving the semantic relationships between sections is important, here’s an example of how to use the semantic-markdown strategy:


const chunks = await doc.chunk({
  strategy: "semantic-markdown",
  joinThreshold: 500,
  modelName: "gpt-3.5-turbo",
});
Note: Metadata extraction may use LLM calls, so ensure your API key is set.

We go deeper into chunking strategies in our chunk documentation.

Step 2: Embedding Generation
Transform chunks into embeddings using your preferred provider. Mastra supports many embedding providers, including OpenAI and Cohere:

Using OpenAI

import { openai } from "@ai-sdk/openai";
import { embedMany } from "ai";
 
const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: chunks.map((chunk) => chunk.text),
});
Using Cohere

import { cohere } from "@ai-sdk/cohere";
import { embedMany } from "ai";
 
const { embeddings } = await embedMany({
  model: cohere.embedding("embed-english-v3.0"),
  values: chunks.map((chunk) => chunk.text),
});
The embedding functions return vectors, arrays of numbers representing the semantic meaning of your text, ready for similarity searches in your vector database.

Configuring Embedding Dimensions
Embedding models typically output vectors with a fixed number of dimensions (e.g., 1536 for OpenAI’s text-embedding-3-small). Some models support reducing this dimensionality, which can help:

Decrease storage requirements in vector databases
Reduce computational costs for similarity searches
Here are some supported models:

OpenAI (text-embedding-3 models):

const { embeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small", {
    dimensions: 256, // Only supported in text-embedding-3 and later
  }),
  values: chunks.map((chunk) => chunk.text),
});
Google (text-embedding-004):

const { embeddings } = await embedMany({
  model: google.textEmbeddingModel("text-embedding-004", {
    outputDimensionality: 256, // Truncates excessive values from the end
  }),
  values: chunks.map((chunk) => chunk.text),
});
Vector Database Compatibility
When storing embeddings, the vector database index must be configured to match the output size of your embedding model. If the dimensions do not match, you may get errors or data corruption.

Example: Complete Pipeline
Here’s an example showing document processing and embedding generation with both providers:


import { embedMany } from "ai";
import { openai } from "@ai-sdk/openai";
import { cohere } from "@ai-sdk/cohere";
 
import { MDocument } from "@mastra/rag";
 
// Initialize document
const doc = MDocument.fromText(`
  Climate change poses significant challenges to global agriculture.
  Rising temperatures and changing precipitation patterns affect crop yields.
`);
 
// Create chunks
const chunks = await doc.chunk({
  strategy: "recursive",
  maxSize: 256,
  overlap: 50,
});
 
// Generate embeddings with OpenAI
const { embeddings: openAIEmbeddings } = await embedMany({
  model: openai.embedding("text-embedding-3-small"),
  values: chunks.map((chunk) => chunk.text),
});
 
// OR
 
// Generate embeddings with Cohere
const { embeddings: cohereEmbeddings } = await embedMany({
  model: cohere.embedding("embed-english-v3.0"),
  values: chunks.map((chunk) => chunk.text),
});
 
// Store embeddings in your vector database
await vectorStore.upsert({
  indexName: "embeddings",
  vectors: embeddings,
});
For more examples of different chunking strategies and embedding configurations, see:

Adjust Chunk Size
Adjust Chunk Delimiters
Embed Text with Cohere
For more details on vector databases and embeddings, see:

Vector Databases
Embedding API Reference

Storing Embeddings in A Vector Database
After generating embeddings, you need to store them in a database that supports vector similarity search. Mastra provides a consistent interface for storing and querying embeddings across various vector databases.

Supported Databases
vector-store.ts

import { MongoDBVector } from '@mastra/mongodb'
 
const store = new MongoDBVector({
  uri: process.env.MONGODB_URI,
  dbName: process.env.MONGODB_DATABASE
})
await store.createIndex({
  indexName: "myCollection",
  dimension: 1536,
});
await store.upsert({
  indexName: "myCollection",
  vectors: embeddings,
  metadata: chunks.map(chunk => ({ text: chunk.text })),
});
 
Using MongoDB Atlas Vector search
For detailed setup instructions and best practices, see the official MongoDB Atlas Vector Search documentation .

Using Vector Storage
Once initialized, all vector stores share the same interface for creating indexes, upserting embeddings, and querying.

Creating Indexes
Before storing embeddings, you need to create an index with the appropriate dimension size for your embedding model:

store-embeddings.ts

// Create an index with dimension 1536 (for text-embedding-3-small)
await store.createIndex({
  indexName: "myCollection",
  dimension: 1536,
});
The dimension size must match the output dimension of your chosen embedding model. Common dimension sizes are:

OpenAI text-embedding-3-small: 1536 dimensions (or custom, e.g., 256)
Cohere embed-multilingual-v3: 1024 dimensions
Google text-embedding-004: 768 dimensions (or custom)
Important: Index dimensions cannot be changed after creation. To use a different model, delete and recreate the index with the new dimension size.

Naming Rules for Databases
Each vector database enforces specific naming conventions for indexes and collections to ensure compatibility and prevent conflicts.

Collection (index) names must:

Start with a letter or underscore
Be up to 120 bytes long
Contain only letters, numbers, underscores, or dots
Cannot contain $ or the null character
Example: my_collection.123 is valid
Example: my-index is not valid (contains hyphen)
Example: My$Collection is not valid (contains $)
Upserting Embeddings
After creating an index, you can store embeddings along with their basic metadata:

store-embeddings.ts

// Store embeddings with their corresponding metadata
await store.upsert({
  indexName: "myCollection", // index name
  vectors: embeddings, // array of embedding vectors
  metadata: chunks.map((chunk) => ({
    text: chunk.text, // The original text content
    id: chunk.id, // Optional unique identifier
  })),
});
The upsert operation:

Takes an array of embedding vectors and their corresponding metadata
Updates existing vectors if they share the same ID
Creates new vectors if they don’t exist
Automatically handles batching for large datasets
For complete examples of upserting embeddings in different vector stores, see the Upsert Embeddings guide.

Adding Metadata
Vector stores support rich metadata (any JSON-serializable fields) for filtering and organization. Since metadata is stored with no fixed schema, use consistent field naming to avoid unexpected query results.

Important: Metadata is crucial for vector storage - without it, you’d only have numerical embeddings with no way to return the original text or filter results. Always store at least the source text as metadata.


// Store embeddings with rich metadata for better organization and filtering
await store.upsert({
  indexName: "myCollection",
  vectors: embeddings,
  metadata: chunks.map((chunk) => ({
    // Basic content
    text: chunk.text,
    id: chunk.id,
 
    // Document organization
    source: chunk.source,
    category: chunk.category,
 
    // Temporal metadata
    createdAt: new Date().toISOString(),
    version: "1.0",
 
    // Custom fields
    language: chunk.language,
    author: chunk.author,
    confidenceScore: chunk.score,
  })),
});
Key metadata considerations:

Be strict with field naming - inconsistencies like ‘category’ vs ‘Category’ will affect queries
Only include fields you plan to filter or sort by - extra fields add overhead
Add timestamps (e.g., ‘createdAt’, ‘lastUpdated’) to track content freshness
Best Practices
Create indexes before bulk insertions
Use batch operations for large insertions (the upsert method handles batching automatically)
Only store metadata you’ll query against
Match embedding dimensions to your model (e.g., 1536 for text-embedding-3-small)

Retrieval in RAG Systems
After storing embeddings, you need to retrieve relevant chunks to answer user queries.

Mastra provides flexible retrieval options with support for semantic search, filtering, and re-ranking.

How Retrieval Works
The user’s query is converted to an embedding using the same model used for document embeddings
This embedding is compared to stored embeddings using vector similarity
The most similar chunks are retrieved and can be optionally:
Filtered by metadata
Re-ranked for better relevance
Processed through a knowledge graph
Basic Retrieval
The simplest approach is direct semantic search. This method uses vector similarity to find chunks that are semantically similar to the query:


import { openai } from "@ai-sdk/openai";
import { embed } from "ai";
import { PgVector } from "@mastra/pg";
 
// Convert query to embedding
const { embedding } = await embed({
  value: "What are the main points in the article?",
  model: openai.embedding("text-embedding-3-small"),
});
 
// Query vector store
const pgVector = new PgVector({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
});
const results = await pgVector.query({
  indexName: "embeddings",
  queryVector: embedding,
  topK: 10,
});
 
// Display results
console.log(results);
Results include both the text content and a similarity score:


[
  {
    text: "Climate change poses significant challenges...",
    score: 0.89,
    metadata: { source: "article1.txt" },
  },
  {
    text: "Rising temperatures affect crop yields...",
    score: 0.82,
    metadata: { source: "article1.txt" },
  },
  // ... more results
];
For an example of how to use the basic retrieval method, see the Retrieve Results example.

Advanced Retrieval options
Metadata Filtering
Filter results based on metadata fields to narrow down the search space. This is useful when you have documents from different sources, time periods, or with specific attributes. Mastra provides a unified MongoDB-style query syntax that works across all supported vector stores.

For detailed information about available operators and syntax, see the Metadata Filters Reference.

Basic filtering examples:


// Simple equality filter
const results = await pgVector.query({
  indexName: "embeddings",
  queryVector: embedding,
  topK: 10,
  filter: {
    source: "article1.txt",
  },
});
 
// Numeric comparison
const results = await pgVector.query({
  indexName: "embeddings",
  queryVector: embedding,
  topK: 10,
  filter: {
    price: { $gt: 100 },
  },
});
 
// Multiple conditions
const results = await pgVector.query({
  indexName: "embeddings",
  queryVector: embedding,
  topK: 10,
  filter: {
    category: "electronics",
    price: { $lt: 1000 },
    inStock: true,
  },
});
 
// Array operations
const results = await pgVector.query({
  indexName: "embeddings",
  queryVector: embedding,
  topK: 10,
  filter: {
    tags: { $in: ["sale", "new"] },
  },
});
 
// Logical operators
const results = await pgVector.query({
  indexName: "embeddings",
  queryVector: embedding,
  topK: 10,
  filter: {
    $or: [{ category: "electronics" }, { category: "accessories" }],
    $and: [{ price: { $gt: 50 } }, { price: { $lt: 200 } }],
  },
});
Common use cases for metadata filtering:

Filter by document source or type
Filter by date ranges
Filter by specific categories or tags
Filter by numerical ranges (e.g., price, rating)
Combine multiple conditions for precise querying
Filter by document attributes (e.g., language, author)
For an example of how to use metadata filtering, see the Hybrid Vector Search example.

Vector Query Tool
Sometimes you want to give your agent the ability to query a vector database directly. The Vector Query Tool allows your agent to be in charge of retrieval decisions, combining semantic search with optional filtering and reranking based on the agent’s understanding of the user’s needs.


const vectorQueryTool = createVectorQueryTool({
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
});
When creating the tool, pay special attention to the tool’s name and description - these help the agent understand when and how to use the retrieval capabilities. For example, you might name it “SearchKnowledgeBase” and describe it as “Search through our documentation to find relevant information about X topic.”

This is particularly useful when:

Your agent needs to dynamically decide what information to retrieve
The retrieval process requires complex decision-making
You want the agent to combine multiple retrieval strategies based on context
Database-Specific Configurations
The Vector Query Tool supports database-specific configurations that enable you to leverage unique features and optimizations of different vector stores:


// Pinecone with namespace
const pineconeQueryTool = createVectorQueryTool({
  vectorStoreName: "pinecone",
  indexName: "docs",
  model: openai.embedding("text-embedding-3-small"),
  databaseConfig: {
    pinecone: {
      namespace: "production"  // Isolate data by environment
    }
  }
});
 
// pgVector with performance tuning
const pgVectorQueryTool = createVectorQueryTool({
  vectorStoreName: "postgres",
  indexName: "embeddings", 
  model: openai.embedding("text-embedding-3-small"),
  databaseConfig: {
    pgvector: {
      minScore: 0.7,    // Filter low-quality results
      ef: 200,          // HNSW search parameter
      probes: 10        // IVFFlat probe parameter
    }
  }
});
 
// Chroma with advanced filtering
const chromaQueryTool = createVectorQueryTool({
  vectorStoreName: "chroma",
  indexName: "documents",
  model: openai.embedding("text-embedding-3-small"),
  databaseConfig: {
    chroma: {
      where: { "category": "technical" },
      whereDocument: { "$contains": "API" }
    }
  }
});
 
// LanceDB with table specificity
const lanceQueryTool = createVectorQueryTool({
  vectorStoreName: "lance",
  indexName: "documents",
  model: openai.embedding("text-embedding-3-small"),
  databaseConfig: {
    lance: {
      tableName: "myVectors",     // Specify which table to query
      includeAllColumns: true     // Include all metadata columns in results
    }
  }
});
Key Benefits:

Pinecone namespaces: Organize vectors by tenant, environment, or data type
pgVector optimization: Control search accuracy and speed with ef/probes parameters
Quality filtering: Set minimum similarity thresholds to improve result relevance
LanceDB tables: Separate data into tables for better organization and performance
Runtime flexibility: Override configurations dynamically based on context
Common Use Cases:

Multi-tenant applications using Pinecone namespaces
Performance optimization in high-load scenarios
Environment-specific configurations (dev/staging/prod)
Quality-gated search results
Embedded, file-based vector storage with LanceDB for edge deployment scenarios
You can also override these configurations at runtime using the runtime context:


import { RuntimeContext } from '@mastra/core/runtime-context';
 
const runtimeContext = new RuntimeContext();
runtimeContext.set('databaseConfig', {
  pinecone: {
    namespace: 'runtime-namespace'
  }
});
 
await pineconeQueryTool.execute({
  context: { queryText: 'search query' },
  mastra,
  runtimeContext
});
For detailed configuration options and advanced usage, see the Vector Query Tool Reference.

Vector Store Prompts
Vector store prompts define query patterns and filtering capabilities for each vector database implementation. When implementing filtering, these prompts are required in the agent’s instructions to specify valid operators and syntax for each vector store implementation.


import { openai } from '@ai-sdk/openai';
import { PGVECTOR_PROMPT } from "@mastra/pg";
 
export const ragAgent = new Agent({
  name: 'RAG Agent',
  model: openai('gpt-4o-mini'),
  instructions: `
  Process queries using the provided context. Structure responses to be concise and relevant.
  ${PGVECTOR_PROMPT}
  `,
  tools: { vectorQueryTool },
});
Re-ranking
Initial vector similarity search can sometimes miss nuanced relevance. Re-ranking is a more computationally expensive process, but more accurate algorithm that improves results by:

Considering word order and exact matches
Applying more sophisticated relevance scoring
Using a method called cross-attention between query and documents
Here’s how to use re-ranking:


import { openai } from "@ai-sdk/openai";
import { 
  rerankWithScorer as rerank, 
  MastraAgentRelevanceScorer 
} from "@mastra/rag";
 
// Get initial results from vector search
const initialResults = await pgVector.query({
  indexName: "embeddings",
  queryVector: queryEmbedding,
  topK: 10,
});
 
// Create a relevance scorer
const relevanceProvider = new MastraAgentRelevanceScorer('relevance-scorer', openai("gpt-4o-mini"));
 
// Re-rank the results
const rerankedResults = await rerank({
  results: initialResults,
  query,
  provider: relevanceProvider,
  options: {
    topK: 10,
  },
);
Note: For semantic scoring to work properly during re-ranking, each result must include the text content in its metadata.text field.

You can also use other relevance score providers like Cohere or ZeroEntropy:


const relevanceProvider = new CohereRelevanceScorer('rerank-v3.5');

const relevanceProvider = new ZeroEntropyRelevanceScorer('zerank-1');
The re-ranked results combine vector similarity with semantic understanding to improve retrieval quality.

For more details about re-ranking, see the rerank() method.

For an example of how to use the re-ranking method, see the Re-ranking Results example.

Graph-based Retrieval
For documents with complex relationships, graph-based retrieval can follow connections between chunks. This helps when:

Information is spread across multiple documents
Documents reference each other
You need to traverse relationships to find complete answers
Example setup:


const graphQueryTool = createGraphQueryTool({
  vectorStoreName: "pgVector",
  indexName: "embeddings",
  model: openai.embedding("text-embedding-3-small"),
  graphOptions: {
    threshold: 0.7,
  },
});
For more details about graph-based retrieval, see the GraphRAG class and the createGraphQueryTool() function.

For an example of how to use the graph-based retrieval method, see the Graph-based Retrieval example.

