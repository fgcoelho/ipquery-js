import type { IPQueryResponse, IPQueryResponseFormat } from "src/api/types";
import type { IPAddr, IPQueryConfig } from "./types";

export const cacheKey = (key: string, format: IPQueryResponseFormat) =>
	`${key}-${format}` as const;

export const createIPQueryCache = (cacheConfig: IPQueryConfig["cache"]) => {
	const cache = new Map<
		string,
		{ value: IPQueryResponse; timestamp: number }
	>();

	const disableCache = cacheConfig?.disable;

	if (disableCache) {
		return {
			has: () => false,
			get: () => undefined,
			set: () => {},
			clear: () => {},
			isEnabled: () => false,
		};
	}

	const ttl = cacheConfig?.ttl ?? Number.POSITIVE_INFINITY;
	const limit = cacheConfig?.limit ?? Number.POSITIVE_INFINITY;

	const enforceLimit = () => {
		while (cache.size > limit) {
			const oldest = cache.keys().next();

			if (oldest.done) break;

			cache.delete(oldest.value);
		}
	};

	const isExpired = (timestamp: number) => {
		return Date.now() - timestamp > ttl;
	};

	return {
		has: (ip: IPAddr, format: IPQueryResponseFormat) => {
			const key = cacheKey(ip, format);

			const entry = cache.get(key);
			if (!entry) return false;

			if (isExpired(entry.timestamp)) {
				cache.delete(key);
				return false;
			}

			return true;
		},

		get: (ip: IPAddr, format: IPQueryResponseFormat) => {
			const key = cacheKey(ip, format);

			const entry = cache.get(key);
			if (!entry || isExpired(entry.timestamp)) {
				cache.delete(key);
				return undefined;
			}

			cache.delete(key);
			cache.set(key, entry);

			return entry.value;
		},

		set: (key: IPQueryCacheKey, value: IPQueryResponse) => {
			cache.set(key, { value, timestamp: Date.now() });
			enforceLimit();
		},

		clear: () => cache.clear(),

		isEnabled: () => true,
	};
};

export type IPQueryCacheKey = ReturnType<typeof cacheKey>;

export type IPQueryCache = ReturnType<typeof createIPQueryCache>;
