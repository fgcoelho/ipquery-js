import type { IPQueryIPResponse } from "src/api/types";
import type { IPQueryCache } from "./types";
import { queryAction } from "./query/query";

const cache: IPQueryCache = {
	self: "",
	IPs: new Map<string, IPQueryIPResponse>(),
};

export const ip = {
	query: queryAction(cache),
};
