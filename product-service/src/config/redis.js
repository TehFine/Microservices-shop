const Redis = require("ioredis");

const redis = new Redis(process.env.REDIS_URL || "redis://localhost:6379", {
  retryStrategy: (times) => {
    if (times > 3) {
      console.error("Redis: Khong the ket noi sau 3 lan thu");
      return null;
    }
    return Math.min(times * 200, 1000);
  },
  lazyConnect: true,
});

redis.on("connect", () => console.log("✅ Ket noi Redis thanh cong"));
redis.on("error", (err) => console.error("❌ Redis Error:", err.message));

// Helper functions
const CACHE_TTL = 5 * 60; // 5 phut

const cacheGet = async (key) => {
  try {
    const data = await redis.get(key);
    return data ? JSON.parse(data) : null;
  } catch (err) {
    console.error("Cache GET error:", err.message);
    return null;
  }
};

const cacheSet = async (key, data, ttl = CACHE_TTL) => {
  try {
    await redis.setex(key, ttl, JSON.stringify(data));
  } catch (err) {
    console.error("Cache SET error:", err.message);
  }
};

const cacheDel = async (...keys) => {
  try {
    await redis.del(...keys);
  } catch (err) {
    console.error("Cache DEL error:", err.message);
  }
};

// Xoa tat ca cache co prefix
const cacheDelPattern = async (pattern) => {
  try {
    const keys = await redis.keys(pattern);
    if (keys.length > 0) {
      await redis.del(...keys);
      console.log(`Cache: Xoa ${keys.length} keys khop voi "${pattern}"`);
    }
  } catch (err) {
    console.error("Cache DEL pattern error:", err.message);
  }
};

module.exports = { redis, cacheGet, cacheSet, cacheDel, cacheDelPattern };