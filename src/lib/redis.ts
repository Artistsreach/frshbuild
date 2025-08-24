import { createClient } from "redis";

type Subscriber = (message: string) => void;

function createInMemoryRedis() {
  const subs = new Map<string, Set<Subscriber>>();
  const kv = new Map<string, string>();

  return {
    async publish(channel: string, message: string) {
      const set = subs.get(channel);
      if (set) for (const fn of set) fn(message);
      return 1;
    },
    async subscribe(channel: string, handler: Subscriber) {
      let set = subs.get(channel);
      if (!set) {
        set = new Set();
        subs.set(channel, set);
      }
      set.add(handler);
    },
    async set(key: string, value: string, opts?: { EX?: number; NX?: boolean }) {
      if (opts?.NX) {
        if (kv.has(key)) return null as unknown as "OK"; // mirror redis: returns null when NX prevents set
        kv.set(key, value);
      } else {
        kv.set(key, value);
      }
      if (opts?.EX) setTimeout(() => kv.delete(key), opts.EX * 1000);
      return "OK" as const;
    },
  };
}

async function createRedisOrFallback() {
  const enabled = Boolean(process.env.REDIS_URL) && process.env.MASTRA_ENABLE_REDIS !== "false";
  if (!enabled) return createInMemoryRedis();
  try {
    const client = await createClient({ url: process.env.REDIS_URL })
      .on("error", (err) => console.log("Redis Client Error", err))
      .connect();
    return client as unknown as ReturnType<typeof createInMemoryRedis>;
  } catch (err) {
    console.warn("Redis unavailable, using in-memory fallback:", err);
    return createInMemoryRedis();
  }
}

export const redis = await createRedisOrFallback();
export const redisPublisher = await createRedisOrFallback();
