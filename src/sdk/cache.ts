import type { IPQueryResponse, IPQueryResponseFormat } from "src/api/types";
import type { IPAddr } from "./types";

export const cacheKey = (key: string, format: IPQueryResponseFormat) =>
	`${key}-${format}` as const;

export const createIPQueryCache = () => {
	const cache = new Map<string, IPQueryResponse>();

	const has = (ip: IPAddr, format: IPQueryResponseFormat) => {
		return cache.has(cacheKey(ip, format));
	};

	const get = (ip: IPAddr, format: IPQueryResponseFormat) => {
		return cache.get(cacheKey(ip, format));
	};

	const set = (key: IPQueryCacheKey, value: IPQueryResponse) => {
		cache.set(key, value);
	};

	const clear = () => {
		cache.clear();
	};

	return {
		has,
		get,
		set,
		clear,
	};
};

export type IPQueryCacheKey = ReturnType<typeof cacheKey>;

export type IPQueryCache = ReturnType<typeof createIPQueryCache>;
