import type { IPQueryResponseFormat } from "src/api/types";
import type { IPQueryCache } from "src/sdk/cache";
import type { AnyType } from "src/types";
import { consume } from "src/api/consume";
import { IPQueryEndpoints } from "src/api/endpoints";

export async function selfQueryCase(
	cache: IPQueryCache,
	format: IPQueryResponseFormat,
) {
	if (cache.has("self", format)) {
		return cache.get("self", format) as AnyType;
	}

	const response = await consume(IPQueryEndpoints.self, {
		query: { format },
	});

	cache.set(`self-${format}`, response);

	return response as AnyType;
}
