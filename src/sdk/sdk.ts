import { queryAction } from "./query/query";
import { createIPQueryCache } from "./cache";

const cache = createIPQueryCache();

export const ip = {
	query: queryAction(cache),
};
