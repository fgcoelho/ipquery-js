import { consume } from "src/api/consume";
import { IPQueryEndpoints } from "src/api/endpoints";
import type { IPQueryIPResponse, IPQueryResponseFormat } from "src/api/types";

type IPQueryActionGlobalOptions = {
	format?: IPQueryResponseFormat;
};

const ipCache = new Map<string, IPQueryIPResponse>();

export const ip = {
	async self(options?: IPQueryActionGlobalOptions) {
		const format = options?.format ?? "json";
		const response = await consume(IPQueryEndpoints.self, {
			query: { format },
		});

		if (response?.ip) {
			ipCache.set(response.ip, response);
		}

		return response;
	},

	async specific(ipAddr: string, options?: IPQueryActionGlobalOptions) {
		if (ipCache.has(ipAddr)) {
			return ipCache.get(ipAddr) as IPQueryIPResponse;
		}

		const format = options?.format ?? "json";

		const response = await consume(IPQueryEndpoints.specific, {
			params: { ip: ipAddr },
			query: { format },
		});

		if (response?.ip) {
			ipCache.set(response.ip, response);
		}

		return response;
	},

	async bulk(ip_list: string[], options?: IPQueryActionGlobalOptions) {
		const uncachedIPs = ip_list.filter((ip) => !ipCache.has(ip));

		const format = options?.format ?? "json";

		let fetchedResponses: IPQueryIPResponse[] = [];

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
					ipCache.set(ipResp.ip, ipResp);
				}
			}

			fetchedResponses = response;
		}

		const allResponses = ip_list.map(
			(ip) => ipCache.get(ip) as IPQueryIPResponse,
		);

		return allResponses;
	},
};
