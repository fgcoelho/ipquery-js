import type { IPQueryResponseFormat } from "src/api/types";
import type { IPQueryCache } from "src/sdk/cache";
import type { IPAddr } from "src/sdk/types";
import type { AnyType } from "src/types";
import { consume } from "src/api/consume";
import { IPQueryEndpoints } from "src/api/endpoints";

export async function singleQueryCase(
	cache: IPQueryCache,
	input: IPAddr,
	format: IPQueryResponseFormat,
) {
	if (cache.has(input, format)) {
		return cache.get(input, format) as AnyType;
	}

	const response = await consume(IPQueryEndpoints.specific, {
		params: { ip: input },
		query: { format },
	});

	cache.set(`${input}-${format}`, response);

	return response;
}
