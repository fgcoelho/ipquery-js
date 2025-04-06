import { queryAction } from "./query/query";
import { createIPQueryCache } from "./cache";
import type { IPQueryConfig } from "./types";

let config: IPQueryConfig = {
	cache: {
		disable: false,
		ttl: 1000 * 60 * 5,
		limit: 100,
	},
};

let cache = createIPQueryCache(config.cache);

export const ip = {
	config(overrides: Partial<typeof config>) {
		config = {
			...config,
			...overrides,
		};
		cache = createIPQueryCache(config.cache);
	},
	get query() {
		return queryAction(cache);
	},
};
