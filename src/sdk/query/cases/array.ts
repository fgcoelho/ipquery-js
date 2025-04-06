import type {
	IPQueryJsonResponse,
	IPQueryResponse,
	IPQueryResponseFormat,
	IPQueryTextResponse,
} from "src/api/types";
import type { IPQueryCache } from "src/sdk/cache";
import type { IPAddr } from "src/sdk/types";
import type { AnyType } from "src/types";
import { consume } from "src/api/consume";
import { IPQueryEndpoints } from "src/api/endpoints";
import { createArrayFromTextFormat } from "../text-array";

export async function arrayQueryCase(
	cache: IPQueryCache,
	input: IPAddr[],
	format: IPQueryResponseFormat,
) {
	const queryResult = [] as AnyType[];

	const uncachedRequestedIps = [] as IPAddr[];
	const cachedIps = [] as IPQueryResponse[];
	if (cache.isEnabled()) {
		for (const ip of input) {
			const cachedIp = cache.get(ip, format);

			if (cachedIp) {
				cachedIps.push(cachedIp);

				queryResult.push(cachedIp);
			} else {
				uncachedRequestedIps.push(ip);
			}
		}
	}

	if (uncachedRequestedIps.length > 0) {
		const response = await consume(IPQueryEndpoints.bulk, {
			params: { ip_list: uncachedRequestedIps.join(",") },
			query: { format },
		});

		let bulkArray = [] as IPQueryJsonResponse[] | IPQueryTextResponse[];

		if (typeof response === "string") {
			bulkArray = createArrayFromTextFormat(response);
		}

		if (Array.isArray(response)) {
			bulkArray = response;
		}

		const isJson =
			uncachedRequestedIps.length === 1 && !Array.isArray(response);
		if (isJson) {
			bulkArray = [response];
		}

		for (let i = 0; i < uncachedRequestedIps.length; i++) {
			const ip = uncachedRequestedIps[i];
			const res = bulkArray[i];

			cache.set(`${ip}-${format}`, res);

			queryResult.push(res);
		}
	}

	return queryResult as AnyType;
}
