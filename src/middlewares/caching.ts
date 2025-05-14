import type { Context } from "hono";
import type { ContextVariables } from "../constants";
import mainLogger from "../loggers";

const logger = mainLogger.child({ name: "CacheMiddleware" });

interface CacheEntry {
    body: any;
    expiration: number;
}

export const cacheMiddleware = () => {
    const cache = new Map<string, CacheEntry>();
    return async (c: Context<ContextVariables>, next: () => Promise<void>) => {
        const userId = c.get("userId");
        const path = c.req.path;
        const cacheKey = `${path}:${userId}`;

        c.set("cache", {
            cache: (body: object, expiration: number = 3600) => {
                const expireAt = Date.now() + expiration * 1000;
                const entry = { body, expiration: expireAt };
                logger.info(`Setting Cache Key: ${cacheKey} to ${JSON.stringify(entry)}`)
                cache.set(cacheKey, entry);
        },
            clear: () => {
                cache.delete(cacheKey);
            },
            clearPath: (path: string) => {
                const fullKey = `${path}:${userId}`;
                logger.info(`Clearing Cache Item with Key: ${fullKey}`)
                cache.delete(fullKey);
            },
        });

        if(c.req.method === "GET") {
            const cacheEntry = cache.get(cacheKey);
            if (cacheEntry) {
                logger.info(`Cache Entry Found for ${cacheKey}: ${JSON.stringify(cacheEntry)}`)
                if(cacheEntry.expiration > Date.now()) {
                    logger.debug(`Return from key ${cacheKey}, body: ${JSON.stringify(cacheEntry.body)}`)
                    return c.json(cacheEntry.body);
                } else {
                    logger.debug(`Cache Entry Expired for ${cacheKey}, expiration: ${cacheEntry.expiration}, clearing...`)
                }
            }
        }
        await next();
    };
};
