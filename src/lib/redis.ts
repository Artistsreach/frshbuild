import { createClient } from "redis";

// Create a mock Redis client when REDIS_URL is not available
const createMockRedisClient = () => ({
  get: async () => null,
  set: async () => "OK",
  del: async () => 0,
  publish: async () => 0,
  subscribe: async () => {},
  connect: async () => {},
  disconnect: async () => {},
});

// Initialize Redis clients with fallback
let redisClient: any;
let redisPublisherClient: any;

try {
  if (process.env.REDIS_URL) {
    redisClient = createClient({
      url: process.env.REDIS_URL,
    }).on("error", (err) => console.log("Redis Client Error", err));
    
    redisPublisherClient = createClient({
      url: process.env.REDIS_URL,
    }).on("error", (err) => console.log("Publisher Redis Client Error", err));
    
    // Connect to Redis
    redisClient.connect();
    redisPublisherClient.connect();
  } else {
    console.warn("REDIS_URL not set, using mock Redis client");
    redisClient = createMockRedisClient();
    redisPublisherClient = createMockRedisClient();
  }
} catch (error) {
  console.warn("Failed to initialize Redis, using mock client:", error);
  redisClient = createMockRedisClient();
  redisPublisherClient = createMockRedisClient();
}

export const redis = redisClient;
export const redisPublisher = redisPublisherClient;
