export type IPAddr = string & {};

export type IPQueryInput = "self" | IPAddr | IPAddr[];

export type IPQueryConfig = {
	cache?: {
		disable?: boolean;
		ttl?: number;
		limit?: number;
	};
};
