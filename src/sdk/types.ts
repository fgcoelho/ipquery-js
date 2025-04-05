import type { IPQueryGlobalQuery } from "src/api/endpoints";
import type { IPQueryIPResponse } from "src/api/types";

export type IPAddr = string & {};

export interface IPQueryCache {
	self: string;
	IPs: Map<string, IPQueryIPResponse>;
}

export type IPQueryGlobalOptions = IPQueryGlobalQuery;

export type IPQueryInput = "self" | IPAddr | IPAddr[];
