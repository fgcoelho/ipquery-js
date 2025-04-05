import type {
	IPQueryJsonResponse,
	IPQueryResponseFormat,
	IPQueryTextResponse,
} from "src/api/types";
import type { IPAddr, IPQueryInput } from "../types";
import type { IPQueryCache } from "../cache";
import { validateIPQueryInput } from "./validation";
import { selfQueryCase } from "./cases/self";
import { arrayQueryCase } from "./cases/array";
import { singleQueryCase } from "./cases/single";

export const queryAction = (cache: IPQueryCache) => {
	async function query<
		TInput extends IPQueryInput,
		TFormat extends IPQueryResponseFormat = "json",
	>(
		input: TInput,
		options?: { format?: TFormat | IPQueryResponseFormat },
	): Promise<
		TInput extends string[]
			? TFormat extends "json"
				? IPQueryJsonResponse[]
				: IPQueryTextResponse[]
			: TFormat extends "json"
				? IPQueryJsonResponse
				: IPQueryTextResponse
	> {
		const format = options?.format ?? "json";

		validateIPQueryInput(input);

		const isSelf = input === "self";
		if (isSelf) {
			return await selfQueryCase(cache, format);
		}

		const isArrayInput = Array.isArray(input) && input.length > 1;
		if (isArrayInput) {
			return await arrayQueryCase(cache, input, format);
		}

		const singleIp = Array.isArray(input) ? input[0] : (input as IPAddr);
		if (singleIp) {
			return await singleQueryCase(cache, singleIp, format);
		}

		throw new Error(
			"Invalid input. Expected a single IP address or an array of IP addresses.",
		);
	}

	return query;
};
