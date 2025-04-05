import type { IPQueryIPResponse } from "src/api/types";
import type {
	IPQueryCache,
	IPQueryGlobalOptions,
	IPQueryInput,
} from "../types";
import { IPQueryEndpoints } from "src/api/endpoints";
import { consume } from "src/api/consume";

export const queryAction = (cache: IPQueryCache) => {
	async function query(
		input: "self",
		options?: IPQueryGlobalOptions,
	): Promise<IPQueryIPResponse>;
	async function query(
		input: string,
		options?: IPQueryGlobalOptions,
	): Promise<IPQueryIPResponse>;
	async function query(
		input: string[],
		options?: IPQueryGlobalOptions,
	): Promise<IPQueryIPResponse[]>;

	async function query(
		input: IPQueryInput,
		options?: IPQueryGlobalOptions,
	): Promise<IPQueryIPResponse[] | IPQueryIPResponse> {
		const format = options?.format ?? "json";

		if (input === "self") {
			if (cache.self) {
				return cache.IPs.get(cache.self) as IPQueryIPResponse;
			}

			const response = await consume(IPQueryEndpoints.self, {
				query: { format },
			});

			cache.self = response.ip;

			return response;
		}

		if (Array.isArray(input)) {
			const uncachedIPs = input.filter((ip) => !cache.IPs.has(ip));

			if (uncachedIPs.length > 0) {
				let response = await consume(IPQueryEndpoints.bulk, {
					params: {
						ip_list: uncachedIPs.join(","),
					},
					query: {
						format,
					},
				});

				if (!Array.isArray(response)) {
					response = [response];
				}

				for (const ipResp of response) {
					if (ipResp?.ip) {
						cache.IPs.set(ipResp.ip, ipResp);
					}
				}
			}

			return input.map((ip) => cache.IPs.get(ip)) as IPQueryIPResponse[];
		}

		if (cache.IPs.has(input)) {
			return cache.IPs.get(input) as IPQueryIPResponse;
		}

		const response = await consume(IPQueryEndpoints.specific, {
			params: { ip: input },
			query: { format },
		});

		if (response?.ip) {
			cache.IPs.set(response.ip, response);
		}

		return response;
	}

	return query;
};
